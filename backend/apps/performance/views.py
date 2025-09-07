from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Avg, Count
from .models import Assessment, Grade, PerformancePrediction, StudyGoal
from .serializers import (
    AssessmentSerializer, 
    GradeSerializer,
    StudentGradeSerializer,
    PerformancePredictionSerializer,
    StudyGoalSerializer,
    PerformanceSummarySerializer
)
from .ml_utils import PerformancePredictor
from apps.students.models import StudentProfile
from apps.courses.models import Course


class AssessmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AssessmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        course_id = self.request.query_params.get('course')
        queryset = Assessment.objects.all()
        
        if course_id:
            queryset = queryset.filter(course_id=course_id)
            
        # Filter by user role
        if self.request.user.is_teacher:
            queryset = queryset.filter(course__instructor=self.request.user)
        elif self.request.user.is_student:
            # Only show published assessments for enrolled courses
            student_courses = self.request.user.student_profile.enrollments.filter(
                is_active=True
            ).values_list('course_id', flat=True)
            queryset = queryset.filter(
                course_id__in=student_courses,
                is_published=True
            )
            
        return queryset


class AssessmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Assessment.objects.all()
    serializer_class = AssessmentSerializer
    permission_classes = [permissions.IsAuthenticated]


class GradeListCreateView(generics.ListCreateAPIView):
    serializer_class = GradeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        assessment_id = self.request.query_params.get('assessment')
        student_id = self.request.query_params.get('student')
        
        queryset = Grade.objects.all()
        
        if assessment_id:
            queryset = queryset.filter(assessment_id=assessment_id)
        if student_id:
            queryset = queryset.filter(student_id=student_id)
            
        # Filter by user role
        if self.request.user.is_student:
            queryset = queryset.filter(
                student__user=self.request.user,
                is_published=True
            )
        elif self.request.user.is_teacher:
            # Teachers can see grades for courses they teach
            queryset = queryset.filter(
                assessment__course__instructor=self.request.user
            )
            
        return queryset


class StudentGradesView(generics.ListAPIView):
    serializer_class = StudentGradeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if not self.request.user.is_student:
            return Grade.objects.none()
            
        return Grade.objects.filter(
            student__user=self.request.user,
            is_published=True
        ).order_by('-graded_at')


class PerformancePredictionListView(generics.ListAPIView):
    serializer_class = PerformancePredictionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_student:
            return PerformancePrediction.objects.filter(
                student__user=self.request.user
            )
        elif self.request.user.is_teacher:
            # Teachers can see predictions for their courses
            return PerformancePrediction.objects.filter(
                course__instructor=self.request.user
            )
        return PerformancePrediction.objects.all()


class StudyGoalListCreateView(generics.ListCreateAPIView):
    serializer_class = StudyGoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_student:
            return StudyGoal.objects.filter(student__user=self.request.user)
        return StudyGoal.objects.none()

    def perform_create(self, serializer):
        if self.request.user.is_student:
            student_profile = self.request.user.student_profile
            serializer.save(student=student_profile)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def performance_summary(request):
    """Get performance summary for a student"""
    if not request.user.is_student:
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        student_profile = request.user.student_profile
        
        # Calculate overall statistics
        all_grades = Grade.objects.filter(
            student=student_profile,
            is_published=True
        )
        
        if all_grades.exists():
            average_grade = all_grades.aggregate(
                avg_grade=Avg('marks_obtained')
            )['avg_grade'] or 0
        else:
            average_grade = 0
        
        # Get recent grades (last 10)
        recent_grades = all_grades.order_by('-graded_at')[:10]
        
        # Count at-risk courses
        at_risk_courses = PerformancePrediction.objects.filter(
            student=student_profile,
            at_risk=True
        ).count()
        
        # Get active study goals
        active_goals = StudyGoal.objects.filter(
            student=student_profile,
            status='active'
        )[:5]
        
        # Count total courses and assessments
        total_courses = student_profile.enrollments.filter(is_active=True).count()
        completed_assessments = all_grades.count()
        
        summary_data = {
            'overall_gpa': student_profile.gpa or 0,
            'total_courses': total_courses,
            'completed_assessments': completed_assessments,
            'average_grade': average_grade,
            'at_risk_courses': at_risk_courses,
            'recent_grades': StudentGradeSerializer(recent_grades, many=True).data,
            'active_goals': StudyGoalSerializer(active_goals, many=True).data
        }
        
        serializer = PerformanceSummarySerializer(summary_data)
        return Response(serializer.data)
        
    except StudentProfile.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_prediction(request, student_id, course_id):
    """Generate ML prediction for student performance"""
    try:
        student = get_object_or_404(StudentProfile, id=student_id)
        course = get_object_or_404(Course, id=course_id)
        
        # Check permissions
        if request.user.is_student and request.user != student.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        predictor = PerformancePredictor()
        prediction_data = predictor.predict(student_id, course_id)
        
        if not prediction_data:
            return Response({'error': 'Could not generate prediction'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Save prediction
        prediction, created = PerformancePrediction.objects.update_or_create(
            student=student,
            course=course,
            defaults={
                'predicted_grade': prediction_data['predicted_grade'],
                'confidence_score': prediction_data['confidence_score'],
                'at_risk': prediction_data['at_risk'],
                'risk_factors': prediction_data['risk_factors'],
                'recommendations': prediction_data['recommendations'],
                'features_used': prediction_data['features_used'],
            }
        )
        
        serializer = PerformancePredictionSerializer(prediction)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_goal_progress(request, goal_id):
    """Update progress on a study goal"""
    try:
        goal = get_object_or_404(StudyGoal, id=goal_id)
        
        # Check permissions
        if request.user != goal.student.user:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        current_value = request.data.get('current_value')
        if current_value is None:
            return Response({'error': 'current_value is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        goal.current_value = current_value
        
        # Update status based on progress
        if goal.current_value >= goal.target_value:
            goal.status = 'achieved'
        elif goal.target_date < timezone.now().date() and goal.current_value < goal.target_value:
            goal.status = 'missed'
        
        goal.save()
        
        serializer = StudyGoalSerializer(goal)
        return Response(serializer.data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
