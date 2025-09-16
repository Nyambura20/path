from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Teacher/Instructor endpoints
    path('teachers/', views.TeacherListCreateView.as_view(), name='teachers'),
    path('teachers/<int:id>/', views.TeacherDetailView.as_view(), name='teacher-detail'),
    
    # Teacher course management
    path('teachers/my-courses/', views.teacher_courses_with_students, name='teacher-courses'),
    path('teachers/courses/<int:course_id>/students/', views.course_students_detail, name='course-students-detail'),
]
