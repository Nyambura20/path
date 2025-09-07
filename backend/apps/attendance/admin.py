from django.contrib import admin
from .models import AttendanceRecord, AttendanceSession, AttendanceSummary, AttendanceAlert


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'date', 'status', 'marked_by', 'created_at']
    list_filter = ['status', 'date', 'course']
    search_fields = ['student__user__first_name', 'student__user__last_name', 'course__code']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(AttendanceSession)
class AttendanceSessionAdmin(admin.ModelAdmin):
    list_display = ['course', 'date', 'start_time', 'end_time', 'topic', 'session_type', 'attendance_rate']
    list_filter = ['session_type', 'date', 'course']
    search_fields = ['course__code', 'topic']
    readonly_fields = ['total_students', 'present_count', 'absent_count', 'late_count', 'attendance_rate', 'created_at']


@admin.register(AttendanceSummary)
class AttendanceSummaryAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'total_classes', 'classes_attended', 'attendance_percentage', 'last_updated']
    list_filter = ['course', 'last_updated']
    search_fields = ['student__user__first_name', 'student__user__last_name', 'course__code']
    readonly_fields = ['last_updated']


@admin.register(AttendanceAlert)
class AttendanceAlertAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'alert_type', 'priority', 'current_value', 'is_resolved', 'created_at']
    list_filter = ['alert_type', 'priority', 'is_resolved', 'created_at']
    search_fields = ['student__user__first_name', 'student__user__last_name', 'course__code']
    readonly_fields = ['created_at']
