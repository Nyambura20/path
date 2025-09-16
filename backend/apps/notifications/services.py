"""
Notification service utilities for creating and sending notifications
"""
from django.db import transaction
from .models import Notification, NotificationPreference
from .views import create_notification

class NotificationService:
    """Service class for handling notifications"""
    
    @staticmethod
    def notify_teacher_of_enrollment(student, course, enrollment):
        """Notify teacher when a student enrolls in their course"""
        try:
            teacher = course.instructor
            if teacher:
                title = f"New Student Enrollment"
                message = f"{student.user.get_full_name()} has enrolled in your course '{course.name}'"
                
                create_notification(
                    recipient=teacher,
                    title=title,
                    message=message,
                    notification_type='enrollment',
                    course=course,
                    student=student,
                    priority='medium',
                    data={
                        'enrollment_id': enrollment.id,
                        'student_id': student.id,
                        'course_id': course.id,
                        'action': 'enrolled'
                    }
                )
        except Exception as e:
            # Log error but don't fail the enrollment process
            print(f"Error creating enrollment notification: {e}")
    
    @staticmethod
    def notify_student_of_enrollment_confirmation(student, course, enrollment):
        """Notify student that their enrollment was successful"""
        try:
            title = f"Enrollment Confirmed"
            message = f"You have successfully enrolled in '{course.name}'. Welcome to the course!"
            
            create_notification(
                recipient=student.user,
                title=title,
                message=message,
                notification_type='enrollment',
                course=course,
                student=student,
                priority='medium',
                data={
                    'enrollment_id': enrollment.id,
                    'course_id': course.id,
                    'action': 'enrollment_confirmed'
                }
            )
        except Exception as e:
            print(f"Error creating enrollment confirmation notification: {e}")
    
    @staticmethod
    def notify_grade_posted(student, grade, assessment):
        """Notify student when a grade is posted"""
        try:
            title = f"New Grade Posted"
            message = f"Your grade for '{assessment.title}' in {assessment.course.name} has been posted: {grade.marks_obtained}/{assessment.total_marks}"
            
            create_notification(
                recipient=student.user,
                title=title,
                message=message,
                notification_type='grade',
                course=assessment.course,
                student=student,
                priority='medium',
                data={
                    'grade_id': grade.id,
                    'assessment_id': assessment.id,
                    'marks_obtained': float(grade.marks_obtained),
                    'total_marks': float(assessment.total_marks),
                    'percentage': float((grade.marks_obtained / assessment.total_marks) * 100)
                }
            )
        except Exception as e:
            print(f"Error creating grade notification: {e}")
    
    @staticmethod
    def notify_attendance_marked(student, attendance_record):
        """Notify student when attendance is marked"""
        try:
            title = f"Attendance Marked"
            status_text = attendance_record.status.title()
            message = f"Your attendance for {attendance_record.course.name} on {attendance_record.date} has been marked as {status_text}"
            
            create_notification(
                recipient=student.user,
                title=title,
                message=message,
                notification_type='attendance',
                course=attendance_record.course,
                student=student,
                priority='low',
                data={
                    'attendance_id': attendance_record.id,
                    'status': attendance_record.status,
                    'date': str(attendance_record.date)
                }
            )
        except Exception as e:
            print(f"Error creating attendance notification: {e}")
    
    @staticmethod
    def bulk_notify_students(recipients, title, message, notification_type='system', course=None, priority='medium', data=None):
        """Send bulk notifications to multiple students"""
        notifications = []
        for recipient in recipients:
            notification = Notification(
                recipient=recipient,
                title=title,
                message=message,
                notification_type=notification_type,
                course=course,
                priority=priority,
                data=data or {}
            )
            notifications.append(notification)
        
        # Bulk create for efficiency
        with transaction.atomic():
            Notification.objects.bulk_create(notifications)
        
        return len(notifications)
