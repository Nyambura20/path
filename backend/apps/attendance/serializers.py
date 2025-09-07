from rest_framework import serializers
from .models import AttendanceRecord, AttendanceSession, AttendanceSummary, AttendanceAlert


class AttendanceRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    course_name = serializers.SerializerMethodField()
    marked_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = AttendanceRecord
        fields = ['id', 'student', 'student_name', 'course', 'course_name',
                 'date', 'status', 'notes', 'marked_by', 'marked_by_name',
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_student_name(self, obj):
        return obj.student.user.get_full_name()

    def get_course_name(self, obj):
        return f"{obj.course.code} - {obj.course.name}"

    def get_marked_by_name(self, obj):
        return obj.marked_by.get_full_name() if obj.marked_by else None


class AttendanceSessionSerializer(serializers.ModelSerializer):
    course_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    total_students = serializers.ReadOnlyField()
    present_count = serializers.ReadOnlyField()
    absent_count = serializers.ReadOnlyField()
    late_count = serializers.ReadOnlyField()
    attendance_rate = serializers.ReadOnlyField()
    
    class Meta:
        model = AttendanceSession
        fields = ['id', 'course', 'course_name', 'date', 'start_time', 'end_time',
                 'topic', 'session_type', 'is_active', 'created_by', 'created_by_name',
                 'total_students', 'present_count', 'absent_count', 'late_count',
                 'attendance_rate', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_course_name(self, obj):
        return f"{obj.course.code} - {obj.course.name}"

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name()


class AttendanceSummarySerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    course_name = serializers.SerializerMethodField()
    
    class Meta:
        model = AttendanceSummary
        fields = ['id', 'student', 'student_name', 'course', 'course_name',
                 'total_classes', 'classes_attended', 'classes_late',
                 'classes_absent', 'classes_excused', 'attendance_percentage',
                 'last_updated']
        read_only_fields = ['id', 'last_updated']

    def get_student_name(self, obj):
        return obj.student.user.get_full_name()

    def get_course_name(self, obj):
        return f"{obj.course.code} - {obj.course.name}"


class AttendanceAlertSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    course_name = serializers.SerializerMethodField()
    
    class Meta:
        model = AttendanceAlert
        fields = ['id', 'student', 'student_name', 'course', 'course_name',
                 'alert_type', 'priority', 'message', 'threshold_value',
                 'current_value', 'is_resolved', 'created_at', 'resolved_at']
        read_only_fields = ['id', 'created_at']

    def get_student_name(self, obj):
        return obj.student.user.get_full_name()

    def get_course_name(self, obj):
        return f"{obj.course.code} - {obj.course.name}"


class BulkAttendanceSerializer(serializers.Serializer):
    """Serializer for bulk attendance marking"""
    session_id = serializers.IntegerField()
    attendance_records = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField()
        )
    )

    def validate_attendance_records(self, value):
        """Validate attendance records structure"""
        required_fields = ['student_id', 'status']
        
        for record in value:
            for field in required_fields:
                if field not in record:
                    raise serializers.ValidationError(f"Missing field '{field}' in attendance record")
            
            # Validate status
            valid_statuses = ['present', 'absent', 'late', 'excused']
            if record['status'] not in valid_statuses:
                raise serializers.ValidationError(f"Invalid status: {record['status']}")
        
        return value


class StudentAttendanceReportSerializer(serializers.Serializer):
    """Serializer for student attendance report"""
    student_id = serializers.IntegerField()
    student_name = serializers.CharField()
    courses = serializers.ListField(
        child=serializers.DictField()
    )
    overall_attendance_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
