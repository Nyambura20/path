from django.contrib import admin
from .models import Course, Enrollment, CourseSchedule, Prerequisite


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'instructor', 'credits', 'difficulty_level', 'enrolled_count', 'is_active']
    list_filter = ['difficulty_level', 'is_active', 'instructor']
    search_fields = ['code', 'name', 'instructor__first_name', 'instructor__last_name']
    readonly_fields = ['enrolled_count', 'available_slots', 'created_at', 'updated_at']


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'status', 'enrollment_date', 'final_grade', 'is_active']
    list_filter = ['status', 'is_active', 'enrollment_date']
    search_fields = ['student__user__first_name', 'student__user__last_name', 'course__code']
    readonly_fields = ['enrollment_date']


@admin.register(CourseSchedule)
class CourseScheduleAdmin(admin.ModelAdmin):
    list_display = ['course', 'weekday', 'start_time', 'end_time', 'room']
    list_filter = ['weekday', 'course']
    search_fields = ['course__code', 'room']


@admin.register(Prerequisite)
class PrerequisiteAdmin(admin.ModelAdmin):
    list_display = ['course', 'prerequisite_course', 'minimum_grade']
    search_fields = ['course__code', 'prerequisite_course__code']
