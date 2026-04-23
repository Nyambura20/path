# Create your tests here.
from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.students.models import StudentProfile
from apps.courses.models import Course
from .models import AttendanceRecord, AttendanceSession, AttendanceSummary
from .serializers import AttendanceRecordSerializer
from datetime import date, time

User = get_user_model()


class AttendanceModelTest(TestCase):
    def setUp(self):
        self.instructor, _ = User.objects.get_or_create(
            username='teacher1',
            defaults={
                'email': 'teacher@example.com',
                'role': 'teacher',
            }
        )

        self.student_user, _ = User.objects.get_or_create(
            username='student1',
            defaults={
                'email': 'student@example.com',
                'role': 'student',
            }
        )

        self.student_profile, _ = StudentProfile.objects.get_or_create(
            user=self.student_user,
            defaults={
                'student_id': 'STU001',
                'year_of_study': '1',
                'major': 'Computer Science',
                'admission_date': date.today(),
            }
        )

        self.course, _ = Course.objects.get_or_create(
            code='CS101',
            defaults={
                'name': 'Introduction to Computer Science',
                'description': 'Basic concepts',
                'credits': 3,
                'difficulty_level': 'beginner',
                'instructor': self.instructor,
                'start_date': date(2026, 1, 1),
                'end_date': date(2026, 1, 14),
            }
        )

    def test_create_attendance_record(self):
        record = AttendanceRecord.objects.create(
            student=self.student_profile,
            course=self.course,
            date=date(2026, 4, 21),
            status='present',
            marked_by=self.instructor
        )
        self.assertEqual(record.status, 'present')
        self.assertIn('CS101', str(record))

    def test_attendance_record_serializer_includes_session_name(self):
        session_date = date(2026, 4, 21)
        AttendanceSession.objects.create(
            course=self.course,
            date=session_date,
            start_time=time(9, 0),
            end_time=time(10, 0),
            topic='Lecture 1',
            created_by=self.instructor,
        )
        record = AttendanceRecord.objects.create(
            student=self.student_profile,
            course=self.course,
            date=session_date,
            status='present',
            marked_by=self.instructor
        )

        data = AttendanceRecordSerializer(record).data

        self.assertEqual(data['session_name'], 'Lecture 1')

    def test_attendance_session(self):
        session = AttendanceSession.objects.create(
            course=self.course,
            date=date.today(),
            start_time=time(9, 0),
            end_time=time(10, 30),
            topic='Introduction to Programming',
            created_by=self.instructor
        )
        self.assertEqual(session.topic, 'Introduction to Programming')

    def test_attendance_summary_update(self):
        # Create some attendance records
        AttendanceRecord.objects.create(
            student=self.student_profile,
            course=self.course,
            date=date.today(),
            status='present',
            marked_by=self.instructor
        )
        
        # Create summary and update
        summary = AttendanceSummary.objects.create(
            student=self.student_profile,
            course=self.course
        )
        summary.update_summary()
        
        self.assertEqual(summary.total_classes, 1)
        self.assertEqual(summary.classes_attended, 1)
        self.assertEqual(summary.attendance_percentage, 100.0)
