from rest_framework import serializers
from .models import Notification, NotificationPreference
from apps.users.serializers import UserSerializer

class NotificationSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'notification_type', 'priority',
            'is_read', 'is_archived', 'created_at', 'read_at',
            'sender', 'course_name', 'student_name', 'data', 'time_ago'
        ]
        read_only_fields = ['created_at', 'sender']
    
    def get_time_ago(self, obj):
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff.days > 0:
            return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
        elif diff.seconds > 3600:
            hours = diff.seconds // 3600
            return f"{hours} hour{'s' if hours > 1 else ''} ago"
        elif diff.seconds > 60:
            minutes = diff.seconds // 60
            return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
        else:
            return "Just now"

class NotificationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'recipient', 'title', 'message', 'notification_type', 
            'priority', 'course', 'student', 'data'
        ]

class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = [
            'email_notifications', 'email_enrollment', 'email_grades', 'email_attendance',
            'app_notifications', 'app_enrollment', 'app_grades', 'app_attendance',
            'daily_digest', 'weekly_digest'
        ]

class NotificationStatsSerializer(serializers.Serializer):
    """Serializer for notification statistics"""
    total_notifications = serializers.IntegerField()
    unread_count = serializers.IntegerField()
    today_count = serializers.IntegerField()
    priority_high_count = serializers.IntegerField()
    by_type = serializers.DictField()
