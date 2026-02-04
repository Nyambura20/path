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
    try:
        print(f"User: {request.user}, Role: {request.user.role}")
        if not request.user.is_student:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        print("Getting student profile...")
        student_profile = request.user.student_profile
        print(f"Student profile: {student_profile}")
        
        # Calculate overall statistics
        print("Getting grades...")
        all_grades = Grade.objects.filter(
            student=student_profile,
            is_published=True
        )
        print(f"Found {all_grades.count()} grades")
        
        if all_grades.exists():
            average_grade = all_grades.aggregate(
                avg_grade=Avg('marks_obtained')
            )['avg_grade'] or 0
        else:
            average_grade = 0
        
        print(f"Average grade: {average_grade}")
        
        # Get recent grades (last 10)
        recent_grades = all_grades.order_by('-graded_at')[:10]
        
        # Count at-risk courses - simplified to avoid potential issues
        print("Getting predictions...")
        try:
            at_risk_courses = PerformancePrediction.objects.filter(
                student=student_profile,
                at_risk=True
            ).count()
        except Exception as e:
            print(f"Error getting predictions: {e}")
            at_risk_courses = 0
        
        # Get active study goals - simplified to avoid potential issues
        print("Getting goals...")
        try:
            active_goals = StudyGoal.objects.filter(
                student=student_profile,
                status='active'
            )[:5]
        except Exception as e:
            print(f"Error getting goals: {e}")
            active_goals = []
        
        # Count total courses and assessments
        print("Getting enrollments...")
        total_courses = student_profile.enrollments.filter(is_active=True).count()
        completed_assessments = all_grades.count()
        
        print("Preparing response data...")
        data = {
            'average_grade': float(average_grade),
            'total_courses': total_courses,
            'completed_assessments': completed_assessments,
            'at_risk_courses': at_risk_courses,
            'recent_grades': [
                {
                    'assessment': grade.assessment.title,
                    'course': grade.assessment.course.name,
                    'marks_obtained': float(grade.marks_obtained),
                    'total_marks': float(grade.assessment.total_marks),
                    'percentage': float((grade.marks_obtained / grade.assessment.total_marks) * 100),
                    'graded_at': grade.graded_at.isoformat()
                }
                for grade in recent_grades
            ],
            'active_goals': [
                {
                    'title': goal.title,
                    'description': goal.description,
                    'target_date': goal.target_date.isoformat(),
                    'progress': goal.progress
                }
                for goal in active_goals
            ]
        }
        
        print("Returning response...")
        return Response(data, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"Error in performance_summary: {e}")
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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


# Teacher Performance Management Views

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def teacher_performance_dashboard(request):
    """Get performance dashboard data for teachers"""
    if not request.user.is_teacher:
        return Response({'error': 'Access denied. Teacher role required.'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    from apps.courses.models import Course, Enrollment
    
    # Get teacher's courses
    courses = Course.objects.filter(instructor=request.user, is_active=True)
    
    dashboard_data = {
        'courses': [],
        'summary': {
            'total_courses': courses.count(),
            'total_students': 0,
            'total_assessments': 0,
            'pending_grades': 0,
            'avg_class_performance': 0
        }
    }
    
    total_avg = 0
    course_count = 0
    
    for course in courses:
        # Get enrolled students
        enrollments = Enrollment.objects.filter(course=course, is_active=True)
        student_count = enrollments.count()
        
        # Get assessments for this course
        assessments = Assessment.objects.filter(course=course)
        
        # Get grades for this course
        grades = Grade.objects.filter(assessment__course=course)
        
        # Calculate course average
        course_avg = grades.aggregate(avg=Avg('marks_obtained'))['avg'] or 0
        
        # Count pending grades (assessments without grades for enrolled students)
        pending_count = 0
        for assessment in assessments:
            graded_students = Grade.objects.filter(assessment=assessment).values_list('student_id', flat=True)
            enrolled_student_ids = enrollments.values_list('student_id', flat=True)
            pending_count += len(set(enrolled_student_ids) - set(graded_students))
        
        course_data = {
            'id': course.id,
            'name': course.name,
            'code': course.code,
            'student_count': student_count,
            'assessment_count': assessments.count(),
            'total_grades': grades.count(),
            'pending_grades': pending_count,
            'average_performance': round(course_avg, 2),
            'recent_assessments': assessments.order_by('-created_at')[:3].values('id', 'title', 'assessment_type', 'due_date')
        }
        
        dashboard_data['courses'].append(course_data)
        dashboard_data['summary']['total_students'] += student_count
        dashboard_data['summary']['total_assessments'] += assessments.count()
        dashboard_data['summary']['pending_grades'] += pending_count
        
        if course_avg > 0:
            total_avg += course_avg
            course_count += 1
    
    if course_count > 0:
        dashboard_data['summary']['avg_class_performance'] = round(total_avg / course_count, 2)
    
    return Response(dashboard_data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def record_student_grades(request):
    """Record grades for multiple students in an assessment"""
    if not request.user.is_teacher:
        return Response({'error': 'Access denied. Teacher role required.'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    assessment_id = request.data.get('assessment_id')
    grades_data = request.data.get('grades', [])
    
    try:
        # Verify teacher owns the assessment
        assessment = Assessment.objects.get(id=assessment_id, course__instructor=request.user)
    except Assessment.DoesNotExist:
        return Response({'error': 'Assessment not found or access denied'}, 
                       status=status.HTTP_404_NOT_FOUND)
    
    created_grades = []
    updated_grades = []
    errors = []
    
    for grade_item in grades_data:
        student_id = grade_item.get('student_id')
        score = grade_item.get('score')
        feedback = grade_item.get('feedback', '')
        
        try:
            student = StudentProfile.objects.get(id=student_id)
            
            # Validate score
            if score is None or score < 0 or score > assessment.total_marks:
                errors.append(f"Invalid score for student {student.user.get_full_name()}")
                continue
            
            # Create or update grade
            grade, created = Grade.objects.get_or_create(
                student=student,
                assessment=assessment,
                defaults={
                    'marks_obtained': score,
                    'feedback': feedback,
                    'graded_by': request.user
                }
            )
            
            if created:
                created_grades.append(grade)
            else:
                # Update existing grade
                grade.marks_obtained = score
                grade.feedback = feedback
                grade.graded_by = request.user
                grade.save()
                updated_grades.append(grade)
                
        except StudentProfile.DoesNotExist:
            errors.append(f"Student with ID {student_id} not found")
            continue
        except Exception as e:
            errors.append(f"Error processing student {student_id}: {str(e)}")
            continue
    
    # Send notifications for new grades
    if created_grades:
        from apps.notifications.services import NotificationService
        notification_service = NotificationService()
        
        for grade in created_grades:
            notification_service.send_grade_notification(grade)
    
    return Response({
        'message': 'Grades recorded successfully',
        'created_grades': len(created_grades),
        'updated_grades': len(updated_grades),
        'errors': errors,
        'total_processed': len(created_grades) + len(updated_grades)
    })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_assessment_with_grading(request):
    """Create a new assessment and optionally add grades"""
    if not request.user.is_teacher:
        return Response({'error': 'Access denied. Teacher role required.'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    course_id = request.data.get('course_id')
    assessment_data = request.data.get('assessment', {})
    grades_data = request.data.get('grades', [])
    
    try:
        # Verify teacher owns the course
        course = Course.objects.get(id=course_id, instructor=request.user)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found or access denied'}, 
                       status=status.HTTP_404_NOT_FOUND)
    
    # Create assessment
    assessment_data['course'] = course.id
    assessment_serializer = AssessmentSerializer(data=assessment_data)
    
    if not assessment_serializer.is_valid():
        return Response({'errors': assessment_serializer.errors}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    assessment = assessment_serializer.save()
    
    # Add grades if provided
    created_grades = []
    if grades_data:
        for grade_item in grades_data:
            student_id = grade_item.get('student_id')
            score = grade_item.get('score')
            feedback = grade_item.get('feedback', '')
            
            try:
                student = StudentProfile.objects.get(id=student_id)
                
                if score is not None and 0 <= score <= assessment.total_marks:
                    grade = Grade.objects.create(
                        student=student,
                        assessment=assessment,
                        marks_obtained=score,
                        feedback=feedback,
                        graded_by=request.user
                    )
                    created_grades.append(grade)
                    
            except StudentProfile.DoesNotExist:
                continue
    
    return Response({
        'assessment': AssessmentSerializer(assessment).data,
        'grades_created': len(created_grades),
        'message': 'Assessment created successfully'
    })

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def teacher_performance_records(request):
    """Get performance records for teacher's courses with filtering and export options"""
    if not request.user.is_teacher:
        return Response({'error': 'Access denied. Teacher role required.'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    # Get query parameters
    course_id = request.query_params.get('course_id')
    assessment_id = request.query_params.get('assessment_id')
    date_from = request.query_params.get('date_from')
    date_to = request.query_params.get('date_to')
    min_score = request.query_params.get('min_score')
    max_score = request.query_params.get('max_score')
    export_format = request.query_params.get('export', '')  # 'csv' or 'excel'
    
    # Base queryset - only teacher's courses
    queryset = Grade.objects.filter(assessment__course__instructor=request.user)
    
    # Apply filters
    if course_id:
        queryset = queryset.filter(assessment__course_id=course_id)
    if assessment_id:
        queryset = queryset.filter(assessment_id=assessment_id)
    if date_from:
        queryset = queryset.filter(created_at__gte=date_from)
    if date_to:
        queryset = queryset.filter(created_at__lte=date_to)
    if min_score:
        queryset = queryset.filter(marks_obtained__gte=min_score)
    if max_score:
        queryset = queryset.filter(marks_obtained__lte=max_score)
    
    queryset = queryset.select_related(
        'student__user', 'assessment__course', 'graded_by'
    ).order_by('-created_at', 'assessment__course__name', 'student__user__last_name')
    
    # If export is requested, return CSV data
    if export_format == 'csv':
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="performance_records.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'Date', 'Course', 'Assessment', 'Student Name', 'Student ID', 
            'Score', 'Max Score', 'Percentage', 'Feedback', 'Graded By'
        ])
        
        for grade in queryset:
            percentage = (grade.marks_obtained / grade.assessment.total_marks * 100) if grade.assessment.total_marks > 0 else 0
            writer.writerow([
                grade.created_at.date(),
                grade.assessment.course.name,
                grade.assessment.title,
                grade.student.user.get_full_name(),
                grade.student.student_id,
                grade.marks_obtained,
                grade.assessment.total_marks,
                f"{percentage:.1f}%",
                grade.feedback,
                grade.graded_by.get_full_name() if grade.graded_by else ''
            ])
        
        return response
    
    # Regular JSON response with pagination
    page_size = int(request.query_params.get('page_size', 50))
    page = int(request.query_params.get('page', 1))
    
    start = (page - 1) * page_size
    end = start + page_size
    
    grades = queryset[start:end]
    total_count = queryset.count()
    
    data = []
    for grade in grades:
        percentage = (grade.marks_obtained / grade.assessment.total_marks * 100) if grade.assessment.total_marks > 0 else 0
        
        data.append({
            'id': grade.id,
            'created_at': grade.created_at,
            'course': {
                'id': grade.assessment.course.id,
                'name': grade.assessment.course.name,
                'code': grade.assessment.course.code
            },
            'assessment': {
                'id': grade.assessment.id,
                'title': grade.assessment.title,
                'type': grade.assessment.assessment_type,
                'max_score': grade.assessment.total_marks,
                'due_date': grade.assessment.due_date
            },
            'student': {
                'id': grade.student.id,
                'name': grade.student.user.get_full_name(),
                'student_id': grade.student.student_id,
                'email': grade.student.user.email
            },
            'score': grade.marks_obtained,
            'percentage': round(percentage, 1),
            'feedback': grade.feedback,
            'graded_by': grade.graded_by.get_full_name() if grade.graded_by else None
        })
    
    # Calculate summary statistics
    summary = queryset.aggregate(
        total_grades=Count('id'),
        avg_score=Avg('marks_obtained'),
        avg_percentage=Avg('marks_obtained') * 100 / queryset.first().assessment.total_marks if queryset.exists() else 0
    )
    
    return Response({
        'records': data,
        'summary': {
            'total_grades': summary['total_grades'] or 0,
            'average_score': round(summary['avg_score'] or 0, 2),
            'average_percentage': round(summary['avg_percentage'] or 0, 1)
        },
        'pagination': {
            'current_page': page,
            'page_size': page_size,
            'total_records': total_count,
            'total_pages': (total_count + page_size - 1) // page_size,
            'has_next': end < total_count,
            'has_previous': page > 1
        }
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def record_performance(request):
    """Record performance/grades for students - alternative endpoint"""
    if not request.user.is_teacher:
        return Response({'error': 'Access denied. Teacher role required.'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    course_id = request.data.get('course_id')
    # Accept both field names from frontend
    assessment_title = request.data.get('assessment_name') or request.data.get('assessment_title', 'Class Assessment')
    assessment_type = request.data.get('assessment_type', 'assignment')
    total_marks = request.data.get('total_marks', 100)
    # Accept both 'performance' and 'grades' arrays
    grades_data = request.data.get('performance') or request.data.get('grades', [])
    
    try:
        course = Course.objects.get(id=course_id, instructor=request.user)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found or access denied'}, 
                       status=status.HTTP_404_NOT_FOUND)
    
    from django.utils import timezone
    
    # Parse due_date if provided
    due_date = request.data.get('due_date')
    if due_date:
        from datetime import datetime
        try:
            if isinstance(due_date, str):
                due_date = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
        except:
            due_date = timezone.now()
    else:
        due_date = timezone.now()
    
    # Create assessment if it doesn't exist
    assessment, created = Assessment.objects.get_or_create(
        course=course,
        title=assessment_title,
        defaults={
            'assessment_type': assessment_type,
            'total_marks': total_marks,
            'weight_percentage': 10.0,  # Default weight
            'due_date': due_date,
            'is_published': True
        }
    )
    
    created_grades = []
    updated_grades = []
    
    for grade_item in grades_data:
        student_id = grade_item.get('student_id')
        # Accept both 'score' and 'marks_obtained' field names
        score = grade_item.get('marks_obtained') or grade_item.get('score', 0)
        # Accept both 'feedback' and 'comments' field names  
        feedback = grade_item.get('comments') or grade_item.get('feedback', '')
        
        try:
            student = StudentProfile.objects.get(id=student_id)
            
            grade, was_created = Grade.objects.get_or_create(
                student=student,
                assessment=assessment,
                defaults={
                    'marks_obtained': score,
                    'feedback': feedback,
                    'graded_by': request.user,
                    'is_published': True
                }
            )
            
            if was_created:
                created_grades.append(grade)
            else:
                grade.marks_obtained = score
                grade.feedback = feedback
                grade.graded_by = request.user
                grade.save()
                updated_grades.append(grade)
                
        except StudentProfile.DoesNotExist:
            continue
    
    return Response({
        'message': 'Performance recorded successfully',
        'assessment_id': assessment.id,
        'created_grades': len(created_grades),
        'updated_grades': len(updated_grades),
        'total_processed': len(created_grades) + len(updated_grades)
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def course_performance(request, course_id):
    """Get performance data for a specific course (for teachers)"""
    if not request.user.is_teacher:
        return Response({'error': 'Access denied. Teacher role required.'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    try:
        course = Course.objects.get(id=course_id, instructor=request.user)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found or access denied'}, 
                       status=status.HTTP_404_NOT_FOUND)
    
    from apps.courses.models import Enrollment
    
    # Get assessment type filter
    assessment_type = request.query_params.get('assessment_type')
    
    # Get assessments for this course
    assessments_qs = Assessment.objects.filter(course=course).order_by('-created_at')
    
    # Filter by assessment type (ignore 'undefined', 'all', or empty values)
    if assessment_type and assessment_type not in ('undefined', 'all', ''):
        assessments_qs = assessments_qs.filter(assessment_type=assessment_type)
    
    # Get enrolled students
    enrollments = Enrollment.objects.filter(course=course, is_active=True).select_related('student__user')
    students = []
    for enrollment in enrollments:
        # Get student's grades for this course
        student_grades = Grade.objects.filter(
            student=enrollment.student,
            assessment__course=course
        )
        avg_score = student_grades.aggregate(avg=Avg('marks_obtained'))['avg'] or 0
        
        students.append({
            'id': enrollment.student.id,
            'name': enrollment.student.user.get_full_name(),
            'student_id': enrollment.student.student_id,
            'email': enrollment.student.user.email,
            'total_assessments': student_grades.count(),
            'average_score': round(avg_score, 2)
        })
    
    # Build assessments with grades
    assessments_data = []
    for assessment in assessments_qs[:50]:  # Limit to 50 assessments
        grades = Grade.objects.filter(assessment=assessment).select_related('student__user')
        
        performance_list = []
        for grade in grades:
            percentage = (grade.marks_obtained / assessment.total_marks * 100) if assessment.total_marks > 0 else 0
            # Calculate letter grade
            if percentage >= 90:
                letter_grade = 'A+'
            elif percentage >= 85:
                letter_grade = 'A'
            elif percentage >= 80:
                letter_grade = 'B+'
            elif percentage >= 75:
                letter_grade = 'B'
            elif percentage >= 70:
                letter_grade = 'C+'
            elif percentage >= 65:
                letter_grade = 'C'
            elif percentage >= 60:
                letter_grade = 'D'
            else:
                letter_grade = 'F'
            
            performance_list.append({
                'student_id': grade.student.student_id,
                'student_name': grade.student.user.get_full_name(),
                'marks_obtained': float(grade.marks_obtained),
                'percentage': round(percentage, 1),
                'grade': letter_grade,
                'comments': grade.feedback or ''
            })
        
        avg_score = grades.aggregate(avg=Avg('marks_obtained'))['avg'] or 0
        
        assessments_data.append({
            'id': assessment.id,
            'assessment_name': assessment.title,
            'assessment_type': assessment.assessment_type,
            'total_marks': float(assessment.total_marks),
            'due_date': assessment.due_date,
            'created_at': assessment.created_at,
            'performance': performance_list,
            'total_students': len(students),
            'graded_count': len(performance_list),
            'average_score': round(avg_score, 2),
            'average_percentage': round((avg_score / assessment.total_marks * 100) if assessment.total_marks > 0 else 0, 1)
        })
    
    return Response({
        'course': {
            'id': course.id,
            'name': course.name,
            'code': course.code
        },
        'students': students,
        'assessments': assessments_data
    })

