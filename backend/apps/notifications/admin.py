from django.contrib import admin
from .models import Notification, NotificationPreference

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'recipient', 'notification_type', 'priority', 
        'is_read', 'created_at'
    ]
    list_filter = [
        'notification_type', 'priority', 'is_read', 'is_archived', 'created_at'
    ]
    search_fields = ['title', 'message', 'recipient__username', 'recipient__email']
    readonly_fields = ['created_at', 'read_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'message', 'notification_type', 'priority')
        }),
        ('Recipients & Relations', {
            'fields': ('recipient', 'sender', 'course', 'student')
        }),
        ('Status', {
            'fields': ('is_read', 'is_archived', 'data')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'read_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'email_notifications', 'app_notifications', 'daily_digest', 'weekly_digest']
    list_filter = ['email_notifications', 'app_notifications', 'daily_digest', 'weekly_digest']
    search_fields = ['user__username', 'user__email']
