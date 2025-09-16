from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from apps.courses.models import Enrollment
from apps.performance.models import Grade
from apps.attendance.models import AttendanceRecord
from .services import NotificationService

@receiver(post_save, sender=Enrollment)
def enrollment_notification_handler(sender, instance, created, **kwargs):
    """Handle notifications when enrollment is created or updated"""
    if created and instance.is_active:
        # Notify teacher of new enrollment
        NotificationService.notify_teacher_of_enrollment(
            student=instance.student,
            course=instance.course,
            enrollment=instance
        )
        
        # Notify student of enrollment confirmation
        NotificationService.notify_student_of_enrollment_confirmation(
            student=instance.student,
            course=instance.course,
            enrollment=instance
        )

@receiver(post_save, sender=Grade)
def grade_notification_handler(sender, instance, created, **kwargs):
    """Handle notifications when grade is posted"""
    if created and instance.is_published:
        NotificationService.notify_grade_posted(
            student=instance.student,
            grade=instance,
            assessment=instance.assessment
        )

@receiver(post_save, sender=AttendanceRecord)
def attendance_notification_handler(sender, instance, created, **kwargs):
    """Handle notifications when attendance is marked"""
    if created:
        NotificationService.notify_attendance_marked(
            student=instance.student,
            attendance_record=instance
        )
