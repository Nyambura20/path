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
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
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
