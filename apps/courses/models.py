from django.db import models
from django.conf import settings
from apps.students.models import StudentProfile


class Course(models.Model):
    """Course model"""
    
    DIFFICULTY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    
    code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField()
    credits = models.PositiveIntegerField()
    difficulty_level = models.CharField(max_length=12, choices=DIFFICULTY_CHOICES)
    instructor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='taught_courses',
        limit_choices_to={'role': 'teacher'}
    )
    max_students = models.PositiveIntegerField(default=30)
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'courses'
        ordering = ['code']

    def __str__(self):
        return f"{self.code} - {self.name}"

    @property
    def enrolled_count(self):
        return self.enrollments.filter(is_active=True).count()

    @property
    def available_slots(self):
        return self.max_students - self.enrolled_count


class Enrollment(models.Model):
    """Student course enrollment"""

    
    STATUS_CHOICES = [
        ('enrolled', 'Enrolled'),
        ('completed', 'Completed'),
        ('dropped', 'Dropped'),
        ('failed', 'Failed'),
    ]
    
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='enrollments'
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='enrollments'
    )
    enrollment_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='enrolled')
    final_grade = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    completion_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'enrollments'
        unique_together = ['student', 'course']

    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.course.code}"


class CourseSchedule(models.Model):
    """Course schedule/timetable"""
    
    WEEKDAY_CHOICES = [
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
        ('saturday', 'Saturday'),
        ('sunday', 'Sunday'),
    ]
    
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='schedules'
    )
    weekday = models.CharField(max_length=10, choices=WEEKDAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    room = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'course_schedules'
        unique_together = ['course', 'weekday', 'start_time']

    def __str__(self):
        return f"{self.course.code} - {self.get_weekday_display()} {self.start_time}-{self.end_time}"


class Prerequisite(models.Model):
    """Course prerequisites"""
    
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='prerequisites'
    )
    prerequisite_course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='prerequisite_for'
    )
    minimum_grade = models.DecimalField(max_digits=5, decimal_places=2, default=50.00)

    class Meta:
        db_table = 'prerequisites'
        unique_together = ['course', 'prerequisite_course']

    def __str__(self):
        return f"{self.course.code} requires {self.prerequisite_course.code}"
