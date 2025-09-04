from rest_framework import serializers
from .models import Assessment, Grade, PerformancePrediction, StudyGoal


class AssessmentSerializer(serializers.ModelSerializer):
    course_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Assessment
        fields = ['id', 'course', 'course_name', 'title', 'description', 
                 'assessment_type', 'total_marks', 'weight_percentage',
                 'due_date', 'is_published', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_course_name(self, obj):
        return f"{obj.course.code} - {obj.course.name}"


class GradeSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    assessment_title = serializers.SerializerMethodField()
    percentage = serializers.ReadOnlyField()
    letter_grade = serializers.ReadOnlyField()
    
    class Meta:
        model = Grade
        fields = ['id', 'student', 'student_name', 'assessment', 'assessment_title',
                 'marks_obtained', 'feedback', 'graded_by', 'graded_at',
                 'is_published', 'percentage', 'letter_grade']
        read_only_fields = ['id', 'graded_at', 'percentage', 'letter_grade']

    def get_student_name(self, obj):
        return obj.student.user.get_full_name()

    def get_assessment_title(self, obj):
        return obj.assessment.title


class StudentGradeSerializer(serializers.ModelSerializer):
    """Serializer for student's view of their grades"""
    assessment_details = serializers.SerializerMethodField()
    percentage = serializers.ReadOnlyField()
    letter_grade = serializers.ReadOnlyField()
    
    class Meta:
        model = Grade
        fields = ['id', 'assessment_details', 'marks_obtained', 'feedback',
                 'graded_at', 'percentage', 'letter_grade']

    def get_assessment_details(self, obj):
        return {
            'id': obj.assessment.id,
            'title': obj.assessment.title,
            'type': obj.assessment.assessment_type,
            'total_marks': obj.assessment.total_marks,
            'weight_percentage': obj.assessment.weight_percentage,
            'course': f"{obj.assessment.course.code} - {obj.assessment.course.name}"
        }


class PerformancePredictionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    course_name = serializers.SerializerMethodField()
    
    class Meta:
        model = PerformancePrediction
        fields = ['id', 'student', 'student_name', 'course', 'course_name',
                 'predicted_grade', 'confidence_score', 'prediction_date',
                 'at_risk', 'risk_factors', 'recommendations',
                 'model_version', 'features_used']
        read_only_fields = ['id', 'prediction_date']

    def get_student_name(self, obj):
        return obj.student.user.get_full_name()

    def get_course_name(self, obj):
        return f"{obj.course.code} - {obj.course.name}"


class StudyGoalSerializer(serializers.ModelSerializer):
    course_name = serializers.SerializerMethodField()
    progress_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = StudyGoal
        fields = ['id', 'student', 'course', 'course_name', 'title', 'description',
                 'goal_type', 'target_value', 'current_value', 'target_date',
                 'status', 'progress_percentage', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'progress_percentage']

    def get_course_name(self, obj):
        if obj.course:
            return f"{obj.course.code} - {obj.course.name}"
        return "General Goal"


class PerformanceSummarySerializer(serializers.Serializer):
    """Serializer for student performance summary"""
    overall_gpa = serializers.DecimalField(max_digits=3, decimal_places=2)
    total_courses = serializers.IntegerField()
    completed_assessments = serializers.IntegerField()
    average_grade = serializers.DecimalField(max_digits=5, decimal_places=2)
    at_risk_courses = serializers.IntegerField()
    recent_grades = StudentGradeSerializer(many=True)
    active_goals = StudyGoalSerializer(many=True)
