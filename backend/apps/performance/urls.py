from django.urls import path
from . import views

app_name = 'performance'

urlpatterns = [
    # Assessment endpoints
    path('assessments/', views.AssessmentListCreateView.as_view(), name='assessment-list'),
    path('assessments/<int:pk>/', views.AssessmentDetailView.as_view(), name='assessment-detail'),
    
    # Grade endpoints
    path('grades/', views.GradeListCreateView.as_view(), name='grade-list'),
    path('grades/my-grades/', views.StudentGradesView.as_view(), name='student-grades'),
    
    # Performance prediction endpoints
    path('predictions/', views.PerformancePredictionListView.as_view(), name='prediction-list'),
    path('predictions/generate/<int:student_id>/<int:course_id>/', 
         views.generate_prediction, name='generate-prediction'),
    
    # Study goals
    path('goals/', views.StudyGoalListCreateView.as_view(), name='goal-list'),
    path('goals/<int:goal_id>/update-progress/', views.update_goal_progress, name='update-goal-progress'),
    
    # Summary endpoints
    path('summary/', views.performance_summary, name='performance-summary'),
    
    # Course performance (for teacher reports)
    path('course/<int:course_id>/', views.course_performance, name='course-performance'),
    
    # Teacher performance management
    path('teacher/dashboard/', views.teacher_performance_dashboard, name='teacher-performance-dashboard'),
    path('teacher/record/', views.record_performance, name='record-performance'),
    path('teacher/record-grades/', views.record_student_grades, name='record-student-grades'),
    path('teacher/create-assessment/', views.create_assessment_with_grading, name='create-assessment-with-grading'),
    path('teacher/records/', views.teacher_performance_records, name='teacher-performance-records'),
]
