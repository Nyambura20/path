from django.db import models
from django.conf import settings
from apps.students.models import StudentProfile
from apps.courses.models import Course, Enrollment


class Assessment(models.Model):
    """Assessment/exam model"""
    
    ASSESSMENT_TYPES = [
        ('quiz', 'Quiz'),
        ('assignment', 'Assignment'),
        ('midterm', 'Midterm Exam'),
        ('final', 'Final Exam'),
        ('project', 'Project'),
        ('presentation', 'Presentation'),
    ]
    
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='assessments'
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    assessment_type = models.CharField(max_length=12, choices=ASSESSMENT_TYPES)
    total_marks = models.DecimalField(max_digits=6, decimal_places=2)
    weight_percentage = models.DecimalField(max_digits=5, decimal_places=2)  # % of final grade
    due_date = models.DateTimeField()
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'assessments'
        ordering = ['due_date']

    def __str__(self):
        return f"{self.course.code} - {self.title}"


class Grade(models.Model):
    """Student grades for assessments"""
    
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='grades'
    )
    assessment = models.ForeignKey(
        Assessment,
        on_delete=models.CASCADE,
        related_name='grades'
    )
    marks_obtained = models.DecimalField(max_digits=6, decimal_places=2)
    feedback = models.TextField(blank=True)
    graded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='graded_assessments'
    )
    graded_at = models.DateTimeField(auto_now_add=True)
    is_published = models.BooleanField(default=False)

    class Meta:
        db_table = 'grades'
        unique_together = ['student', 'assessment']

    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.assessment.title}: {self.marks_obtained}/{self.assessment.total_marks}"

    @property
    def percentage(self):
        return (self.marks_obtained / self.assessment.total_marks) * 100 if self.assessment.total_marks > 0 else 0

    @property
    def letter_grade(self):
        """Convert percentage to letter grade"""
        percentage = self.percentage
        if percentage >= 90:
            return 'A+'
        elif percentage >= 85:
            return 'A'
        elif percentage >= 80:
            return 'A-'
        elif percentage >= 75:
            return 'B+'
        elif percentage >= 70:
            return 'B'
        elif percentage >= 65:
            return 'B-'
        elif percentage >= 60:
            return 'C+'
        elif percentage >= 55:
            return 'C'
        elif percentage >= 50:
            return 'C-'
        else:
            return 'F'


class PerformancePrediction(models.Model):
    """ML-based performance predictions"""
    
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='predictions'
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='predictions'
    )
    predicted_grade = models.DecimalField(max_digits=5, decimal_places=2)
    confidence_score = models.DecimalField(max_digits=5, decimal_places=4)  # 0-1
    prediction_date = models.DateTimeField(auto_now_add=True)
    model_version = models.CharField(max_length=20, default='v1.0')
    features_used = models.JSONField(default=dict)  # Store feature importance
    
    # Risk factors
    at_risk = models.BooleanField(default=False)
    risk_factors = models.JSONField(default=list)
    recommendations = models.JSONField(default=list)

    class Meta:
        db_table = 'performance_predictions'
        unique_together = ['student', 'course']

    def __str__(self):
        return f"Prediction for {self.student.user.get_full_name()} in {self.course.code}: {self.predicted_grade}"


class StudyGoal(models.Model):
    """Student study goals and targets"""
    
    GOAL_TYPES = [
        ('grade', 'Grade Target'),
        ('attendance', 'Attendance Target'),
        ('assignment', 'Assignment Completion'),
        ('skill', 'Skill Development'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('achieved', 'Achieved'),
        ('missed', 'Missed'),
        ('paused', 'Paused'),
    ]
    
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='study_goals'
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='student_goals',
        null=True,
        blank=True
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    goal_type = models.CharField(max_length=10, choices=GOAL_TYPES)
    target_value = models.DecimalField(max_digits=6, decimal_places=2)
    current_value = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    target_date = models.DateField()
    status = models.CharField(max_length=8, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'study_goals'

    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.title}"

    @property
    def progress_percentage(self):
        if self.target_value > 0:
            return min((self.current_value / self.target_value) * 100, 100)
        return 0
