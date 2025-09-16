from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login, logout
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from drf_spectacular.utils import extend_schema, OpenApiExample
from drf_spectacular.openapi import OpenApiParameter
from .models import User
from .serializers import UserRegistrationSerializer, UserSerializer, LoginSerializer


@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(generics.CreateAPIView):
    """
    Register a new user account
    
    Create a new user account with email, username, and password.
    Returns user information along with JWT tokens for authentication.
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Authentication'],
        summary='Register new user',
        description='Register a new user account and receive JWT tokens',
        examples=[
            OpenApiExample(
                'Student Registration',
                value={
                    'email': 'student@example.com',
                    'username': 'student123',
                    'password': 'securepassword123',
                    'first_name': 'John',
                    'last_name': 'Doe',
                    'role': 'student'
                }
            ),
            OpenApiExample(
                'Teacher Registration',
                value={
                    'email': 'teacher@example.com',
                    'username': 'teacher123',
                    'password': 'securepassword123',
                    'first_name': 'Jane',
                    'last_name': 'Smith',
                    'role': 'teacher'
                }
            )
        ],
        responses={
            201: {
                'description': 'User registered successfully',
                'examples': {
                    'application/json': {
                        'user': {
                            'id': 1,
                            'username': 'student123',
                            'email': 'student@example.com',
                            'first_name': 'John',
                            'last_name': 'Doe',
                            'role': 'student'
                        },
                        'access_token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
                        'refresh_token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
                    }
                }
            },
            400: {
                'description': 'Validation error'
            }
        }
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        return Response({
            'user': UserSerializer(user).data,
            'access_token': access_token,
            'refresh_token': refresh_token
        }, status=status.HTTP_201_CREATED)


@extend_schema(
    tags=['Authentication'],
    summary='User login',
    description='Authenticate user and receive JWT tokens',
    examples=[
        OpenApiExample(
            'Login with email',
            value={
                'email': 'student@example.com',
                'password': 'securepassword123'
            }
        ),
        OpenApiExample(
            'Login with username',
            value={
                'username': 'student123',
                'password': 'securepassword123'
            }
        )
    ],
    responses={
        200: {
            'description': 'Login successful',
            'examples': {
                'application/json': {
                    'user': {
                        'id': 1,
                        'username': 'student123',
                        'email': 'student@example.com',
                        'first_name': 'John',
                        'last_name': 'Doe',
                        'role': 'student'
                    },
                    'access_token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
                    'refresh_token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
                }
            }
        },
        400: {
            'description': 'Invalid credentials'
        }
    }
)
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    print(f"Login request data: {request.data}")
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        print(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    user = serializer.validated_data['user']
    login(request, user)
    
    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)
    
    return Response({
        'user': UserSerializer(user).data,
        'access_token': access_token,
        'refresh_token': refresh_token
    })


@extend_schema(
    tags=['Authentication'],
    summary='User logout',
    description='Logout user and blacklist refresh token',
    examples=[
        OpenApiExample(
            'Logout request',
            value={
                'refresh_token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
            }
        )
    ],
    responses={
        200: {
            'description': 'Logout successful',
            'examples': {
                'application/json': {
                    'message': 'Logged out successfully'
                }
            }
        }
    }
)
@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        # Get the refresh token from the request
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
    except Exception:
        pass
    logout(request)
    return Response({'message': 'Logged out successfully'})


@method_decorator(csrf_exempt, name='dispatch')
class ProfileView(generics.RetrieveUpdateAPIView):
    """
    User profile management
    
    Retrieve and update the authenticated user's profile information.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Users'],
        summary='Get user profile',
        description='Retrieve the authenticated user profile',
        responses={
            200: UserSerializer,
            401: {
                'description': 'Authentication required'
            }
        }
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        tags=['Users'],
        summary='Update user profile',
        description='Update the authenticated user profile',
        examples=[
            OpenApiExample(
                'Update profile',
                value={
                    'first_name': 'John',
                    'last_name': 'Doe',
                    'email': 'newemail@example.com'
                }
            )
        ],
        responses={
            200: UserSerializer,
            400: {
                'description': 'Validation error'
            },
            401: {
                'description': 'Authentication required'
            }
        }
    )
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    def get_object(self):
        return self.request.user


@method_decorator(csrf_exempt, name='dispatch')
class TeacherListCreateView(generics.ListCreateAPIView):
    """
    List all teachers or create a new teacher account
    """
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]  # You might want to restrict this to admin users
    
    def get_queryset(self):
        return User.objects.filter(role='teacher', is_active=True)
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return UserSerializer
        return UserRegistrationSerializer

    @extend_schema(
        tags=['Teachers'],
        summary='List all teachers',
        description='Get a list of all active teachers/instructors'
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        tags=['Teachers'],
        summary='Create new teacher',
        description='Create a new teacher/instructor account',
        examples=[
            OpenApiExample(
                'Teacher Registration',
                value={
                    'email': 'teacher@example.com',
                    'username': 'teacher123',
                    'password': 'securepassword123',
                    'first_name': 'Jane',
                    'last_name': 'Smith',
                    'role': 'teacher'
                }
            )
        ]
    )
    def create(self, request, *args, **kwargs):
        # Force role to be teacher
        request.data['role'] = 'teacher'
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        return Response({
            'user': UserSerializer(user).data,
            'access_token': access_token,
            'refresh_token': refresh_token
        }, status=status.HTTP_201_CREATED)


@method_decorator(csrf_exempt, name='dispatch')
class TeacherDetailView(generics.RetrieveAPIView):
    """
    Get details of a specific teacher
    """
    queryset = User.objects.filter(role='teacher', is_active=True)
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    lookup_field = 'id'

    @extend_schema(
        tags=['Teachers'],
        summary='Get teacher details',
        description='Get detailed information about a specific teacher/instructor'
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


# Teacher Course Management Views

@extend_schema(
    tags=['Teachers'],
    summary='Get teacher courses with enrolled students',
    description='Get all courses taught by the teacher with enrolled student information'
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def teacher_courses_with_students(request):
    """Get teacher's courses with enrolled students"""
    if not request.user.is_teacher:
        return Response({'error': 'Access denied. Teacher role required.'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    from apps.courses.models import Course, Enrollment
    from apps.courses.serializers import CourseSerializer
    
    # Get courses taught by this teacher
    courses = Course.objects.filter(instructor=request.user, is_active=True)
    
    course_data = []
    for course in courses:
        # Get enrolled students for this course
        enrollments = Enrollment.objects.filter(
            course=course, 
            is_active=True
        ).select_related('student__user')
        
        students = []
        for enrollment in enrollments:
            student_info = {
                'id': enrollment.student.id,
                'user_id': enrollment.student.user.id,
                'name': enrollment.student.user.get_full_name(),
                'email': enrollment.student.user.email,
                'enrollment_date': enrollment.enrolled_at,
                'student_id': enrollment.student.student_id
            }
            students.append(student_info)
        
        course_info = {
            'id': course.id,
            'name': course.name,
            'code': course.code,
            'description': course.description,
            'start_date': course.start_date,
            'end_date': course.end_date,
            'enrolled_students_count': len(students),
            'enrolled_students': students
        }
        course_data.append(course_info)
    
    return Response({
        'courses': course_data,
        'total_courses': len(course_data),
        'total_students': sum(len(course['enrolled_students']) for course in course_data)
    })

@extend_schema(
    tags=['Teachers'],
    summary='Get students in a specific course',
    description='Get detailed information about students enrolled in a specific course'
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def course_students_detail(request, course_id):
    """Get detailed information about students in a specific course"""
    if not request.user.is_teacher:
        return Response({'error': 'Access denied. Teacher role required.'}, 
                       status=status.HTTP_403_FORBIDDEN)
    
    from apps.courses.models import Course, Enrollment
    from apps.performance.models import Grade, Assessment
    from apps.attendance.models import AttendanceRecord
    
    try:
        # Verify the teacher owns this course
        course = Course.objects.get(id=course_id, instructor=request.user)
    except Course.DoesNotExist:
        return Response({'error': 'Course not found or access denied'}, 
                       status=status.HTTP_404_NOT_FOUND)
    
    # Get enrolled students with additional data
    enrollments = Enrollment.objects.filter(
        course=course, 
        is_active=True
    ).select_related('student__user')
    
    students_data = []
    for enrollment in enrollments:
        student = enrollment.student
        
        # Get student's grades for this course
        grades = Grade.objects.filter(
            student=student,
            assessment__course=course,
            is_published=True
        )
        
        # Calculate average grade
        if grades.exists():
            avg_grade = sum(g.marks_obtained for g in grades) / len(grades)
            total_assessments = grades.count()
        else:
            avg_grade = 0
            total_assessments = 0
        
        # Get attendance records
        attendance_records = AttendanceRecord.objects.filter(
            student=student,
            course=course
        )
        
        # Calculate attendance rate
        if attendance_records.exists():
            present_count = attendance_records.filter(status='present').count()
            attendance_rate = (present_count / attendance_records.count()) * 100
        else:
            attendance_rate = 0
        
        student_info = {
            'id': student.id,
            'user_id': student.user.id,
            'name': student.user.get_full_name(),
            'email': student.user.email,
            'student_id': student.student_id,
            'enrollment_date': enrollment.enrolled_at,
            'performance': {
                'average_grade': round(avg_grade, 2),
                'total_assessments': total_assessments,
                'attendance_rate': round(attendance_rate, 1),
                'total_attendance_records': attendance_records.count()
            }
        }
        students_data.append(student_info)
    
    return Response({
        'course': {
            'id': course.id,
            'name': course.name,
            'code': course.code,
            'description': course.description
        },
        'students': students_data,
        'total_students': len(students_data)
    })
