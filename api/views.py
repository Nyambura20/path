from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Avg
from drf_spectacular.utils import extend_schema
from apps.users.models import User
from apps.students.models import StudentProfile
from apps.courses.models import Course, Enrollment
from apps.performance.models import Grade, PerformancePrediction
from apps.attendance.models import AttendanceRecord


@extend_schema(
    tags=['API Gateway'],
    summary='API Overview',
    description='Get overview of available API endpoints',
    responses={
        200: {
            'description': 'API overview',
            'examples': {
                'application/json': {
                    'overview': '/api/',
                    'dashboard': '/api/dashboard/',
                    'users': {
                        'register': '/api/users/register/',
                        'login': '/api/users/login/',
                        'logout': '/api/users/logout/',
                        'profile': '/api/users/profile/',
                    }
                }
            }
        }
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_overview(request):
    """
    API overview endpoint that provides information about available endpoints
    """
    endpoints = {
        'overview': '/api/',
        'dashboard': '/api/dashboard/',
        'users': {
            'register': '/api/users/register/',
            'login': '/api/users/login/',
            'logout': '/api/users/logout/',
            'profile': '/api/users/profile/',
        },
        'students': {
            'list': '/api/students/',
            'profile': '/api/students/profile/',
            'dashboard': '/api/students/dashboard/',
            'parents': '/api/students/{student_id}/parents/',
            'emergency_contacts': '/api/students/{student_id}/emergency-contacts/',
        },
        'courses': {
            'list': '/api/courses/',
            'detail': '/api/courses/{id}/',
            'enroll': '/api/courses/{course_id}/enroll/',
            'drop': '/api/courses/{course_id}/drop/',
            'enrollments': '/api/courses/enrollments/',
        },
        'performance': {
            'assessments': '/api/performance/assessments/',
            'grades': '/api/performance/grades/',
            'my_grades': '/api/performance/grades/my-grades/',
            'predictions': '/api/performance/predictions/',
            'goals': '/api/performance/goals/',
            'summary': '/api/performance/summary/',
        },
        'attendance': {
            'records': '/api/attendance/records/',
            'sessions': '/api/attendance/sessions/',
            'summaries': '/api/attendance/summaries/',
            'alerts': '/api/attendance/alerts/',
            'reports': '/api/attendance/reports/student/',
        }
    }
    
    return Response({
        'message': 'Welcome to BrightPath API',
        'version': 'v1.0',
        'user': request.user.get_full_name(),
        'role': request.user.role,
        'endpoints': endpoints
    })


@extend_schema(
    tags=['API Gateway'],
    summary='Dashboard Statistics',
    description='Get dashboard statistics based on user role',
    responses={
        200: {
            'description': 'Dashboard statistics',
            'examples': {
                'application/json': {
                    'stats': {
                        'total_students': 150,
                        'total_courses': 25,
                        'total_teachers': 15,
                        'total_enrollments': 320
                    }
                }
            }
        }
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    Get dashboard statistics based on user role
    """
    stats = {}
    
    if request.user.is_admin:
        # Admin dashboard stats
        stats = {
            'total_users': User.objects.count(),
            'total_students': User.objects.filter(role='student').count(),
            'total_teachers': User.objects.filter(role='teacher').count(),
            'total_courses': Course.objects.count(),
            'active_courses': Course.objects.filter(is_active=True).count(),
            'total_enrollments': Enrollment.objects.filter(is_active=True).count(),
        }
    
    elif request.user.is_teacher:
        # Teacher dashboard stats
        taught_courses = Course.objects.filter(instructor=request.user)
        total_students = Enrollment.objects.filter(
            course__in=taught_courses,
            is_active=True
        ).count()
        
        stats = {
            'courses_taught': taught_courses.count(),
            'total_students': total_students,
            'active_courses': taught_courses.filter(is_active=True).count(),
            'recent_grades': Grade.objects.filter(
                assessment__course__instructor=request.user
            ).count(),
        }
    
    elif request.user.is_student:
        # Student dashboard stats
        try:
            student_profile = request.user.student_profile
            active_enrollments = Enrollment.objects.filter(
                student=student_profile,
                is_active=True
            )
            
            # Calculate average grade
            grades = Grade.objects.filter(
                student=student_profile,
                is_published=True
            )
            avg_grade = grades.aggregate(avg=Avg('marks_obtained'))['avg'] or 0
            
            # Check if at risk
            at_risk_courses = PerformancePrediction.objects.filter(
                student=student_profile,
                at_risk=True
            ).count()
            
            stats = {
                'enrolled_courses': active_enrollments.count(),
                'completed_assessments': grades.count(),
                'average_grade': round(avg_grade, 2),
                'current_gpa': float(student_profile.gpa or 0),
                'at_risk_courses': at_risk_courses,
            }
            
        except Exception as e:
            stats = {'error': 'Student profile not found'}
    
    return Response({
        'user': {
            'name': request.user.get_full_name(),
            'role': request.user.role,
            'email': request.user.email,
        },
        'stats': stats
    })
