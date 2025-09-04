from django.db import models
from django.conf import settings


class StudentProfile(models.Model):
    """Extended profile for student users"""
    
    YEAR_CHOICES = [
        ('1', 'First Year'),
        ('2', 'Second Year'),
        ('3', 'Third Year'),
        ('4', 'Fourth Year'),
        ('5', 'Fifth Year'),
    ]
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='student_profile'
    )
    student_id = models.CharField(max_length=20, unique=True)
    year_of_study = models.CharField(max_length=1, choices=YEAR_CHOICES)
    major = models.CharField(max_length=100)
    gpa = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    admission_date = models.DateField()
    graduation_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'student_profiles'

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.student_id}"


class ParentGuardian(models.Model):
    """Parent/Guardian information for students"""
    
    RELATIONSHIP_CHOICES = [
        ('father', 'Father'),
        ('mother', 'Mother'),
        ('guardian', 'Guardian'),
        ('other', 'Other'),
    ]
    
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='parents_guardians'
    )
    name = models.CharField(max_length=100)
    relationship = models.CharField(max_length=10, choices=RELATIONSHIP_CHOICES)
    email = models.EmailField(blank=True)
    phone_number = models.CharField(max_length=15)
    address = models.TextField(blank=True)
    occupation = models.CharField(max_length=100, blank=True)
    is_primary_contact = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'parent_guardians'
        unique_together = ['student', 'is_primary_contact']

    def __str__(self):
        return f"{self.name} - {self.relationship} of {self.student.user.get_full_name()}"


class EmergencyContact(models.Model):
    """Emergency contact information"""
    
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='emergency_contacts'
    )
    name = models.CharField(max_length=100)
    relationship = models.CharField(max_length=50)
    phone_number = models.CharField(max_length=15)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'emergency_contacts'

    def __str__(self):
        return f"{self.name} - Emergency contact for {self.student.user.get_full_name()}"
