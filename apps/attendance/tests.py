# Create your tests here.
from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.students.models import StudentProfile
from apps.courses.models import Course
from .models import AttendanceRecord, AttendanceSession, AttendanceSummary
from datetime import date, time

User = get_user_model()


class AttendanceModelTest(TestCase):
    def setUp(self):
        self.instructor = User.objects.create_user(
            username='teacher1',
            email='teacher@example.com',
            role='teacher'
        )
        
        self.student_user = User.objects.create_user(
            username='student1',
            email='student@example.com',
            role='student'
        )
        
        self.student_profile = StudentProfile.objects.create(
            user=self.student_user,
            student_id='STU001',
            year_of_study='1',
            major='Computer Science',
            admission_date=date.today()
        )
        
        self.course = Course.objects.create(
            code='CS101',
            name='Introduction to Computer Science',
            description='Basic concepts',
            credits=3,
            difficulty_level='beginner',
            instructor=self.instructor,
            start_date=date.today(),
            end_date=date.today()
        )

    def test_create_attendance_record(self):
        record = AttendanceRecord.objects.create(
            student=self.student_profile,
            course=self.course,
            date=date.today(),
            status='present',
            marked_by=self.instructor
        )
        self.assertEqual(record.status, 'present')
        self.assertIn('CS101', str(record))

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
