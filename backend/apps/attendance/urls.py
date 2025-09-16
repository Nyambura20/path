from django.urls import path
from . import views

app_name = 'attendance'

urlpatterns = [
    # Attendance records
    path('records/', views.AttendanceRecordListCreateView.as_view(), name='attendance-record-list'),
    path('records/bulk-mark/', views.mark_bulk_attendance, name='bulk-mark-attendance'),
    
    # Attendance sessions
    path('sessions/', views.AttendanceSessionListCreateView.as_view(), name='attendance-session-list'),
    
    # Attendance summaries
    path('summaries/', views.AttendanceSummaryListView.as_view(), name='attendance-summary-list'),
    
    # Attendance alerts
    path('alerts/', views.AttendanceAlertListView.as_view(), name='attendance-alert-list'),
    path('alerts/check/', views.check_attendance_alerts, name='check-attendance-alerts'),
    path('alerts/<int:alert_id>/resolve/', views.resolve_alert, name='resolve-alert'),
    
    # Reports
    path('reports/student/', views.student_attendance_report, name='student-attendance-report'),
    path('reports/student/<int:student_id>/', views.student_attendance_report, name='student-attendance-report-detail'),
    
    # Teacher attendance management
    path('teacher/dashboard/', views.teacher_attendance_dashboard, name='teacher-attendance-dashboard'),
    path('teacher/mark-class/', views.mark_class_attendance, name='mark-class-attendance'),
    path('teacher/mark-assignment/', views.mark_assignment_submission_attendance, name='mark-assignment-attendance'),
    path('teacher/records/', views.teacher_attendance_records, name='teacher-attendance-records'),
]
