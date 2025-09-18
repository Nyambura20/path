from rest_framework import serializers
from .models import Course, Enrollment, CourseSchedule, Prerequisite


class CourseSerializer(serializers.ModelSerializer):
    instructor_name = serializers.SerializerMethodField()
    enrolled_count = serializers.ReadOnlyField()
    available_slots = serializers.ReadOnlyField()
    
    class Meta:
        model = Course
        fields = ['id', 'code', 'name', 'description', 'credits', 'difficulty_level',
                 'instructor', 'instructor_name', 'max_students', 'enrolled_count',
                 'available_slots', 'start_date', 'end_date', 'is_active',
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_instructor_name(self, obj):
        return obj.instructor.get_full_name()


class CourseScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseSchedule
        fields = ['id', 'course', 'weekday', 'start_time', 'end_time', 'room', 'created_at']
        read_only_fields = ['id', 'created_at']


class PrerequisiteSerializer(serializers.ModelSerializer):
    prerequisite_course_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Prerequisite
        fields = ['id', 'course', 'prerequisite_course', 'prerequisite_course_name', 'minimum_grade']
        read_only_fields = ['id']

    def get_prerequisite_course_name(self, obj):
        return f"{obj.prerequisite_course.code} - {obj.prerequisite_course.name}"


class CourseDetailSerializer(serializers.ModelSerializer):
    instructor_name = serializers.SerializerMethodField()
    enrolled_count = serializers.ReadOnlyField()
    available_slots = serializers.ReadOnlyField()
    schedules = CourseScheduleSerializer(many=True, read_only=True)
    prerequisites = PrerequisiteSerializer(many=True, read_only=True)
    enrolled_students = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'code', 'name', 'description', 'credits', 'difficulty_level',
                 'instructor', 'instructor_name', 'max_students', 'enrolled_count',
                 'available_slots', 'start_date', 'end_date', 'is_active',
                 'schedules', 'prerequisites', 'enrolled_students', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_instructor_name(self, obj):
        return obj.instructor.get_full_name()

    def get_enrolled_students(self, obj):
        request = self.context.get('request')
        if not request or not hasattr(request, 'user'):
            return []
        user = request.user
        # Only show enrolled students if user is teacher and instructor for this course
        if hasattr(user, 'is_teacher') and user.is_teacher and obj.instructor == user:
            enrollments = obj.enrollments.filter(is_active=True).select_related('student__user')
            return [
                {
                    'name': e.student.user.get_full_name(),
                    'email': e.student.user.email,
                    'student_id': e.student.student_id
                }
                for e in enrollments
            ]
        return []


class EnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    course_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'student_name', 'course', 'course_name',
                 'enrollment_date', 'status', 'final_grade', 'is_active',
                 'completion_date']
        read_only_fields = ['id', 'enrollment_date']

    def get_student_name(self, obj):
        return obj.student.user.get_full_name()

    def get_course_name(self, obj):
        return f"{obj.course.code} - {obj.course.name}"


class EnrollmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ['student', 'course']

    def validate(self, attrs):
        student = attrs['student']
        course = attrs['course']
        
        # Check if already enrolled
        if Enrollment.objects.filter(student=student, course=course, is_active=True).exists():
            raise serializers.ValidationError("Student is already enrolled in this course")
        
        # Check if course has available slots
        if course.available_slots <= 0:
            raise serializers.ValidationError("Course is full")
        
        return attrs
