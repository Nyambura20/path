from django.contrib import admin
from .models import StudentProfile, ParentGuardian, EmergencyContact


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ['student_id', 'user', 'year_of_study', 'major', 'gpa', 'is_active']
    list_filter = ['year_of_study', 'major', 'is_active', 'admission_date']
    search_fields = ['student_id', 'user__first_name', 'user__last_name', 'user__email']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ParentGuardian)
class ParentGuardianAdmin(admin.ModelAdmin):
    list_display = ['name', 'student', 'relationship', 'phone_number', 'is_primary_contact']
    list_filter = ['relationship', 'is_primary_contact']
    search_fields = ['name', 'student__user__first_name', 'student__user__last_name']


@admin.register(EmergencyContact)
class EmergencyContactAdmin(admin.ModelAdmin):
    list_display = ['name', 'student', 'relationship', 'phone_number', 'is_primary']
    list_filter = ['is_primary']
    search_fields = ['name', 'student__user__first_name', 'student__user__last_name']
