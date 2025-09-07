from django.db import models
from django.conf import settings
from apps.students.models import StudentProfile
from apps.courses.models import Course


class AttendanceRecord(models.Model):
    """Individual attendance record for a student in a specific class"""
    
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
        ('excused', 'Excused Absence'),
    ]
    
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='attendance_records'
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='attendance_records'
    )
    date = models.DateField()
    status = models.CharField(max_length=7, choices=STATUS_CHOICES)
    notes = models.TextField(blank=True)
    marked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='marked_attendance'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'attendance_records'
        unique_together = ['student', 'course', 'date']
        ordering = ['-date']

    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.course.code} - {self.date} - {self.status}"


class AttendanceSession(models.Model):
    """Attendance session for a specific class/course on a specific date"""
    
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='attendance_sessions'
    )
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    topic = models.CharField(max_length=200, blank=True)
    session_type = models.CharField(
        max_length=20,
        choices=[
            ('lecture', 'Lecture'),
            ('lab', 'Laboratory'),
            ('tutorial', 'Tutorial'),
            ('seminar', 'Seminar'),
            ('exam', 'Examination'),
        ],
        default='lecture'
    )
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_sessions'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'attendance_sessions'
        unique_together = ['course', 'date', 'start_time']
        ordering = ['-date', '-start_time']

    def __str__(self):
        return f"{self.course.code} - {self.date} - {self.topic}"

    @property
    def total_students(self):
        """Total number of enrolled students"""
        return self.course.enrollments.filter(is_active=True).count()

    @property
    def present_count(self):
        """Number of students present"""
        return self.attendance_records.filter(status='present').count()

    @property
    def absent_count(self):
        """Number of students absent"""
        return self.attendance_records.filter(status='absent').count()

    @property
    def late_count(self):
        """Number of students who came late"""
        return self.attendance_records.filter(status='late').count()

    @property
    def attendance_rate(self):
        """Attendance rate as percentage"""
        total = self.attendance_records.count()
        if total == 0:
            return 0
        present_and_late = self.attendance_records.filter(
            status__in=['present', 'late']
        ).count()
        return (present_and_late / total) * 100


class AttendanceSummary(models.Model):
    """Summary of attendance for a student in a course"""
    
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='attendance_summaries'
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='attendance_summaries'
    )
    total_classes = models.PositiveIntegerField(default=0)
    classes_attended = models.PositiveIntegerField(default=0)
    classes_late = models.PositiveIntegerField(default=0)
    classes_absent = models.PositiveIntegerField(default=0)
    classes_excused = models.PositiveIntegerField(default=0)
    attendance_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'attendance_summaries'
        unique_together = ['student', 'course']

    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.course.code} - {self.attendance_percentage}%"

    def update_summary(self):
        """Update the summary based on attendance records"""
        records = AttendanceRecord.objects.filter(
            student=self.student,
            course=self.course
        )
        
        self.total_classes = records.count()
        self.classes_attended = records.filter(status='present').count()
        self.classes_late = records.filter(status='late').count()
        self.classes_absent = records.filter(status='absent').count()
        self.classes_excused = records.filter(status='excused').count()
        
        if self.total_classes > 0:
            effective_attendance = self.classes_attended + self.classes_late
            self.attendance_percentage = (effective_attendance / self.total_classes) * 100
        else:
            self.attendance_percentage = 0
            
        self.save()


class AttendanceAlert(models.Model):
    """Alerts for low attendance or other attendance-related issues"""
    
    ALERT_TYPES = [
        ('low_attendance', 'Low Attendance'),
        ('consecutive_absence', 'Consecutive Absences'),
        ('pattern_detected', 'Pattern Detected'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='attendance_alerts'
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='attendance_alerts'
    )
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    priority = models.CharField(max_length=8, choices=PRIORITY_CHOICES)
    message = models.TextField()
    threshold_value = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    current_value = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    is_resolved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'attendance_alerts'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.alert_type} - {self.student.user.get_full_name()} - {self.course.code}"
