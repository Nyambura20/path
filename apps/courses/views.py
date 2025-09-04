from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Course, Enrollment, CourseSchedule, Prerequisite
from .serializers import (
    CourseSerializer, 
    CourseDetailSerializer, 
    EnrollmentSerializer,
    EnrollmentCreateSerializer,
    CourseScheduleSerializer,
    PrerequisiteSerializer
)


class CourseListCreateView(generics.ListCreateAPIView):
    queryset = Course.objects.filter(is_active=True)
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Course.objects.filter(is_active=True)
        
        # Filter by instructor if user is a teacher
        if self.request.user.is_teacher:
            queryset = queryset.filter(instructor=self.request.user)
        
        # Filter parameters
        difficulty = self.request.query_params.get('difficulty')
        instructor_id = self.request.query_params.get('instructor')
        
        if difficulty:
            queryset = queryset.filter(difficulty_level=difficulty)
        if instructor_id:
            queryset = queryset.filter(instructor_id=instructor_id)
            
        return queryset


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseDetailSerializer
    permission_classes = [permissions.IsAuthenticated]


class EnrollmentListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_student:
            return Enrollment.objects.filter(
                student__user=self.request.user,
                is_active=True
            )
        return Enrollment.objects.filter(is_active=True)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return EnrollmentCreateSerializer
        return EnrollmentSerializer


class StudentEnrollmentsView(generics.ListAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        student_id = self.kwargs.get('student_id')
        return Enrollment.objects.filter(student_id=student_id, is_active=True)


class CourseEnrollmentsView(generics.ListAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        course_id = self.kwargs.get('course_id')
        return Enrollment.objects.filter(course_id=course_id, is_active=True)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def enroll_student(request, course_id):
    """Enroll the current user (student) in a course"""
    if not request.user.is_student:
        return Response({'error': 'Only students can enroll'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        course = Course.objects.get(id=course_id, is_active=True)
        student_profile = request.user.student_profile
        
        # Check if already enrolled
        if Enrollment.objects.filter(student=student_profile, course=course, is_active=True).exists():
            return Response({'error': 'Already enrolled in this course'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check course capacity
        if course.available_slots <= 0:
            return Response({'error': 'Course is full'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create enrollment
        enrollment = Enrollment.objects.create(student=student_profile, course=course)
        serializer = EnrollmentSerializer(enrollment)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Course.DoesNotExist:
        return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def drop_course(request, course_id):
    """Drop a course (for students)"""
    if not request.user.is_student:
        return Response({'error': 'Only students can drop courses'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        enrollment = Enrollment.objects.get(
            student__user=request.user,
            course_id=course_id,
            is_active=True
        )
        enrollment.status = 'dropped'
        enrollment.is_active = False
        enrollment.save()
        
        return Response({'message': 'Successfully dropped the course'})
        
    except Enrollment.DoesNotExist:
        return Response({'error': 'Enrollment not found'}, status=status.HTTP_404_NOT_FOUND)
