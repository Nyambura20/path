from django.urls import path
from . import views

app_name = 'courses'

urlpatterns = [
    path('', views.CourseListCreateView.as_view(), name='course-list'),
    path('<int:pk>/', views.CourseDetailView.as_view(), name='course-detail'),
    
    # Enrollment endpoints
    path('enrollments/', views.EnrollmentListCreateView.as_view(), name='enrollment-list'),
    path('<int:course_id>/enroll/', views.enroll_student, name='enroll-student'),
    path('<int:course_id>/drop/', views.drop_course, name='drop-course'),
    
    # Course-specific enrollments
    path('<int:course_id>/enrollments/', views.CourseEnrollmentsView.as_view(), name='course-enrollments'),
    
    # Student-specific enrollments
    path('students/<int:student_id>/enrollments/', views.StudentEnrollmentsView.as_view(), name='student-enrollments'),
]
