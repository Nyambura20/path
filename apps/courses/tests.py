# Create your tests here.
from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.students.models import StudentProfile
from .models import Course, Enrollment
from datetime import date

User = get_user_model()


class CourseModelTest(TestCase):
    def setUp(self):
        self.instructor = User.objects.create_user(
            username='teacher1',
            email='teacher@example.com',
            role='teacher',
            first_name='Jane',
            last_name='Smith'
        )

    def test_create_course(self):
        course = Course.objects.create(
            code='CS101',
            name='Introduction to Computer Science',
            description='Basic concepts of computer science',
            credits=3,
            difficulty_level='beginner',
            instructor=self.instructor,
            start_date=date.today(),
            end_date=date.today()
        )
        self.assertEqual(course.code, 'CS101')
        self.assertEqual(str(course), 'CS101 - Introduction to Computer Science')


class EnrollmentModelTest(TestCase):
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

    def test_create_enrollment(self):
        enrollment = Enrollment.objects.create(
            student=self.student_profile,
            course=self.course
        )
        self.assertEqual(enrollment.status, 'enrolled')
        self.assertTrue(enrollment.is_active)
