from django.db import models
from django.contrib.auth import get_user_model
from apps.courses.models import Course
from apps.students.models import StudentProfile

User = get_user_model()

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('enrollment', 'New Enrollment'),
        ('assignment', 'Assignment Submitted'),
        ('grade', 'Grade Posted'),
        ('attendance', 'Attendance Marked'),
        ('course', 'Course Update'),
        ('system', 'System Notification'),
    )
    
    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    )
    
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_notifications', null=True, blank=True)
    
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    
    # Related objects (optional)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True)
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, null=True, blank=True)
    
    # Status fields
    is_read = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    
    # Metadata
    data = models.JSONField(default=dict, blank=True)  # Additional data
    
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['notification_type']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.recipient.username}"

class NotificationPreference(models.Model):
    """User preferences for notifications"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences')
    
    # Email preferences
    email_notifications = models.BooleanField(default=True)
    email_enrollment = models.BooleanField(default=True)
    email_grades = models.BooleanField(default=True)
    email_attendance = models.BooleanField(default=True)
    
    # In-app preferences
    app_notifications = models.BooleanField(default=True)
    app_enrollment = models.BooleanField(default=True)
    app_grades = models.BooleanField(default=True)
    app_attendance = models.BooleanField(default=True)
    
    # Digest preferences
    daily_digest = models.BooleanField(default=False)
    weekly_digest = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Notification preferences for {self.user.username}"
