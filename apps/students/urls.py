from django.urls import path
from . import views

app_name = 'students'

urlpatterns = [
    path('', views.StudentProfileListCreateView.as_view(), name='student-list'),
    path('profile/', views.StudentProfileDetailView.as_view(), name='student-profile'),
    path('dashboard/', views.student_dashboard, name='student-dashboard'),
    
    # Parent/Guardian endpoints
    path('<int:student_id>/parents/', 
         views.ParentGuardianListCreateView.as_view(), 
         name='parent-guardian-list'),
    
    # Emergency contact endpoints
    path('<int:student_id>/emergency-contacts/', 
         views.EmergencyContactListCreateView.as_view(), 
         name='emergency-contact-list'),
]
