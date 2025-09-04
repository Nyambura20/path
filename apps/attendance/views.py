from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q, Avg
from django.utils import timezone
from .models import AttendanceRecord, AttendanceSession, AttendanceSummary, AttendanceAlert
from .serializers import (
    AttendanceRecordSerializer,
    AttendanceSessionSerializer,
    AttendanceSummarySerializer,
    AttendanceAlertSerializer,
    BulkAttendanceSerializer,
    StudentAttendanceReportSerializer
)
from apps.students.models import StudentProfile
from apps.courses.models import Course, Enrollment


class AttendanceRecordListCreateView(generics.ListCreateAPIView):
    serializer_class = AttendanceRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = AttendanceRecord.objects.all()
        
        # Filter by parameters
        student_id = self.request.query_params.get('student')
        course_id = self.request.query_params.get('course')
        date = self.request.query_params.get('date')
        status = self.request.query_params.get('status')
        
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        if date:
            queryset = queryset.filter(date=date)
        if status:
            queryset = queryset.filter(status=status)
            
        # Filter by user role
        if self.request.user.is_student:
            queryset = queryset.filter(student__user=self.request.user)
        elif self.request.user.is_teacher:
            queryset = queryset.filter(course__instructor=self.request.user)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(marked_by=self.request.user)


class AttendanceSessionListCreateView(generics.ListCreateAPIView):
    serializer_class = AttendanceSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = AttendanceSession.objects.filter(is_active=True)
        
        course_id = self.request.query_params.get('course')
        date = self.request.query_params.get('date')
        
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        if date:
            queryset = queryset.filter(date=date)
            
        # Filter by user role
        if self.request.user.is_teacher:
            queryset = queryset.filter(course__instructor=self.request.user)
        elif self.request.user.is_student:
            # Students can only see sessions for their enrolled courses
            enrolled_courses = self.request.user.student_profile.enrollments.filter(
                is_active=True
            ).values_list('course_id', flat=True)
            queryset = queryset.filter(course_id__in=enrolled_courses)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class AttendanceSummaryListView(generics.ListAPIView):
    serializer_class = AttendanceSummarySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = AttendanceSummary.objects.all()
        
        student_id = self.request.query_params.get('student')
        course_id = self.request.query_params.get('course')
        
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        if course_id:
            queryset = queryset.filter(course_id=course_id)
            
        # Filter by user role
        if self.request.user.is_student:
            queryset = queryset.filter(student__user=self.request.user)
        elif self.request.user.is_teacher:
            queryset = queryset.filter(course__instructor=self.request.user)
            
        return queryset


class AttendanceAlertListView(generics.ListAPIView):
    serializer_class = AttendanceAlertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = AttendanceAlert.objects.filter(is_resolved=False)
        
        # Filter by user role
        if self.request.user.is_student:
            queryset = queryset.filter(student__user=self.request.user)
        elif self.request.user.is_teacher:
            queryset = queryset.filter(course__instructor=self.request.user)
            
        return queryset


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_bulk_attendance(request):
    """Mark attendance for multiple students in a session"""
    if not request.user.is_teacher:
        return Response({'error': 'Only teachers can mark attendance'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    serializer = BulkAttendanceSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    session_id = serializer.validated_data['session_id']
    attendance_records = serializer.validated_data['attendance_records']
    
    try:
        session = AttendanceSession.objects.get(id=session_id)
        
        # Verify teacher can mark attendance for this session
        if session.course.instructor != request.user:
            return Response({'error': 'Permission denied'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        created_records = []
        updated_records = []
        
        for record_data in attendance_records:
            student_id = record_data['student_id']
            status_value = record_data['status']
            notes = record_data.get('notes', '')
            
            student = get_object_or_404(StudentProfile, id=student_id)
            
            # Create or update attendance record
            record, created = AttendanceRecord.objects.update_or_create(
                student=student,
                course=session.course,
                date=session.date,
                defaults={
                    'status': status_value,
                    'notes': notes,
                    'marked_by': request.user
                }
            )
            
            if created:
                created_records.append(record)
            else:
                updated_records.append(record)
            
            # Update attendance summary
            summary, _ = AttendanceSummary.objects.get_or_create(
                student=student,
                course=session.course
            )
            summary.update_summary()
        
        return Response({
            'message': 'Attendance marked successfully',
            'created': len(created_records),
            'updated': len(updated_records)
        })
        
    except AttendanceSession.DoesNotExist:
        return Response({'error': 'Session not found'}, 
                       status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, 
                       status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def student_attendance_report(request, student_id=None):
    """Get detailed attendance report for a student"""
    if request.user.is_student and student_id is None:
        student_profile = request.user.student_profile
    elif student_id:
        student_profile = get_object_or_404(StudentProfile, id=student_id)
        
        # Check permissions
        if request.user.is_student and request.user != student_profile.user:
            return Response({'error': 'Permission denied'}, 
                          status=status.HTTP_403_FORBIDDEN)
    else:
        return Response({'error': 'Student ID required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    # Get all courses for the student
    enrollments = Enrollment.objects.filter(
        student=student_profile,
        is_active=True
    )
    
    courses_data = []
    total_attendance_sum = 0
    
    for enrollment in enrollments:
        summary, _ = AttendanceSummary.objects.get_or_create(
            student=student_profile,
            course=enrollment.course
        )
        summary.update_summary()  # Ensure it's up to date
        
        course_data = {
            'course_id': enrollment.course.id,
            'course_code': enrollment.course.code,
            'course_name': enrollment.course.name,
            'total_classes': summary.total_classes,
            'classes_attended': summary.classes_attended,
            'classes_late': summary.classes_late,
            'classes_absent': summary.classes_absent,
            'classes_excused': summary.classes_excused,
            'attendance_percentage': float(summary.attendance_percentage),
        }
        courses_data.append(course_data)
        total_attendance_sum += summary.attendance_percentage
    
    # Calculate overall attendance rate
    overall_rate = total_attendance_sum / len(courses_data) if courses_data else 0
    
    report_data = {
        'student_id': student_profile.id,
        'student_name': student_profile.user.get_full_name(),
        'courses': courses_data,
        'overall_attendance_rate': round(overall_rate, 2)
    }
    
    serializer = StudentAttendanceReportSerializer(report_data)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def check_attendance_alerts(request):
    """Check and create attendance alerts for students with low attendance"""
    if not request.user.is_teacher and not request.user.is_admin:
        return Response({'error': 'Permission denied'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    threshold = float(request.data.get('threshold', 75.0))  # Default 75%
    
    # Get all attendance summaries below threshold
    low_attendance_summaries = AttendanceSummary.objects.filter(
        attendance_percentage__lt=threshold,
        total_classes__gt=0  # Only consider students with at least some classes
    )
    
    alerts_created = 0
    
    for summary in low_attendance_summaries:
        # Check if alert already exists for this student-course pair
        existing_alert = AttendanceAlert.objects.filter(
            student=summary.student,
            course=summary.course,
            alert_type='low_attendance',
            is_resolved=False
        ).exists()
        
        if not existing_alert:
            priority = 'critical' if summary.attendance_percentage < 50 else 'high'
            
            AttendanceAlert.objects.create(
                student=summary.student,
                course=summary.course,
                alert_type='low_attendance',
                priority=priority,
                message=f"Student has {summary.attendance_percentage}% attendance, below threshold of {threshold}%",
                threshold_value=threshold,
                current_value=summary.attendance_percentage
            )
            alerts_created += 1
    
    return Response({
        'message': f'{alerts_created} new attendance alerts created',
        'threshold_used': threshold
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def resolve_alert(request, alert_id):
    """Resolve an attendance alert"""
    alert = get_object_or_404(AttendanceAlert, id=alert_id)
    
    # Check permissions
    if not request.user.is_teacher and not request.user.is_admin:
        return Response({'error': 'Permission denied'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    alert.is_resolved = True
    alert.resolved_at = timezone.now()
    alert.save()
    
    return Response({'message': 'Alert resolved successfully'})
