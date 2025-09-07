from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import StudentProfile, ParentGuardian, EmergencyContact
from .serializers import (
    StudentProfileSerializer, 
    StudentDetailSerializer,
    ParentGuardianSerializer, 
    EmergencyContactSerializer
)


class StudentProfileListCreateView(generics.ListCreateAPIView):
    queryset = StudentProfile.objects.filter(is_active=True)
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter by user role
        if self.request.user.is_student:
            return StudentProfile.objects.filter(user=self.request.user)
        return StudentProfile.objects.filter(is_active=True)


class StudentProfileDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = StudentProfile.objects.all()
    serializer_class = StudentDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        if self.request.user.is_student:
            return get_object_or_404(StudentProfile, user=self.request.user)
        return super().get_object()


class ParentGuardianListCreateView(generics.ListCreateAPIView):
    serializer_class = ParentGuardianSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        student_id = self.kwargs.get('student_id')
        return ParentGuardian.objects.filter(student_id=student_id)

    def perform_create(self, serializer):
        student_id = self.kwargs.get('student_id')
        student = get_object_or_404(StudentProfile, id=student_id)
        serializer.save(student=student)


class EmergencyContactListCreateView(generics.ListCreateAPIView):
    serializer_class = EmergencyContactSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        student_id = self.kwargs.get('student_id')
        return EmergencyContact.objects.filter(student_id=student_id)

    def perform_create(self, serializer):
        student_id = self.kwargs.get('student_id')
        student = get_object_or_404(StudentProfile, id=student_id)
        serializer.save(student=student)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def student_dashboard(request):
    """Get dashboard data for a student"""
    if not request.user.is_student:
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        student_profile = StudentProfile.objects.get(user=request.user)
        serializer = StudentDetailSerializer(student_profile)
        
        # Add additional dashboard data
        dashboard_data = {
            'profile': serializer.data,
            'stats': {
                'gpa': student_profile.gpa,
                'year_of_study': student_profile.get_year_of_study_display(),
                'major': student_profile.major,
            }
        }
        
        return Response(dashboard_data)
    except StudentProfile.DoesNotExist:
        return Response({'error': 'Student profile not found'}, status=status.HTTP_404_NOT_FOUND)
