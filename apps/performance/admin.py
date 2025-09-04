from django.contrib import admin
from .models import Assessment, Grade, PerformancePrediction, StudyGoal


@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'assessment_type', 'total_marks', 'weight_percentage', 'due_date', 'is_published']
    list_filter = ['assessment_type', 'is_published', 'course']
    search_fields = ['title', 'course__code', 'course__name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ['student', 'assessment', 'marks_obtained', 'percentage', 'letter_grade', 'graded_at', 'is_published']
    list_filter = ['is_published', 'graded_at', 'assessment__assessment_type']
    search_fields = ['student__user__first_name', 'student__user__last_name', 'assessment__title']
    readonly_fields = ['percentage', 'letter_grade', 'graded_at']


@admin.register(PerformancePrediction)
class PerformancePredictionAdmin(admin.ModelAdmin):
    list_display = ['student', 'course', 'predicted_grade', 'confidence_score', 'at_risk', 'prediction_date']
    list_filter = ['at_risk', 'model_version', 'prediction_date']
    search_fields = ['student__user__first_name', 'student__user__last_name', 'course__code']
    readonly_fields = ['prediction_date']


@admin.register(StudyGoal)
class StudyGoalAdmin(admin.ModelAdmin):
    list_display = ['student', 'title', 'goal_type', 'target_value', 'current_value', 'progress_percentage', 'status']
    list_filter = ['goal_type', 'status', 'target_date']
    search_fields = ['student__user__first_name', 'student__user__last_name', 'title']
    readonly_fields = ['progress_percentage', 'created_at', 'updated_at']
