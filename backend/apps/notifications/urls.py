from django.urls import path
from . import views

app_name = 'notifications'

urlpatterns = [
    # Notification CRUD
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('<int:pk>/', views.NotificationDetailView.as_view(), name='notification-detail'),
    
    # Notification actions
    path('<int:notification_id>/mark-read/', views.mark_as_read, name='mark-as-read'),
    path('mark-all-read/', views.mark_all_as_read, name='mark-all-read'),
    path('stats/', views.notification_stats, name='notification-stats'),
    
    # Preferences
    path('preferences/', views.NotificationPreferenceView.as_view(), name='notification-preferences'),
]
