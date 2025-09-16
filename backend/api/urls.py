from django.urls import path, include
from . import views

app_name = 'api'

urlpatterns = [
    # Base API endpoint
    path('', views.api_overview, name='api-overview'),
    path('dashboard/', views.dashboard_stats, name='dashboard-stats'),
    
    # Direct API endpoints (clean URLs without versioning)
    path('users/', include('apps.users.urls')),
    path('students/', include('apps.students.urls')),
    path('courses/', include('apps.courses.urls')),
    path('performance/', include('apps.performance.urls')),
    path('attendance/', include('apps.attendance.urls')),
    path('notifications/', include('apps.notifications.urls')),
]
