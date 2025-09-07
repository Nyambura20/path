# Create your tests here.
from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.students.models import StudentProfile
from apps.courses.models import Course
from .models import Assessment, Grade, StudyGoal
from datetime import date, datetime, timezone

User = get_user_model()


class AssessmentModelTest(TestCase):
    def setUp(self):
        self.instructor = User.objects.create_user(
            username='teacher1',
            email='teacher@example.com',
            role='teacher'
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

    def test_create_assessment(self):
        assessment = Assessment.objects.create(
            course=self.course,
            title='Midterm Exam',
            assessment_type='midterm',
            total_marks=100,
            weight_percentage=30,
            due_date=datetime.now(timezone.utc)
        )
        self.assertEqual(str(assessment), 'CS101 - Midterm Exam')


class GradeModelTest(TestCase):
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
        
        self.assessment = Assessment.objects.create(
            course=self.course,
            title='Quiz 1',
            assessment_type='quiz',
            total_marks=50,
            weight_percentage=10,
            due_date=datetime.now(timezone.utc)
        )

    def test_create_grade(self):
        grade = Grade.objects.create(
            student=self.student_profile,
            assessment=self.assessment,
            marks_obtained=40
        )
        self.assertEqual(grade.percentage, 80.0)
        self.assertEqual(grade.letter_grade, 'A-')

    def test_letter_grade_calculation(self):
        # Test different grade ranges
        test_cases = [
            (45, 'A+'),  # 90%
            (42, 'A-'),  # 84%
            (35, 'B'),   # 70%
            (25, 'C-'),  # 50%
            (20, 'F'),   # 40%
        ]
        
        for marks, expected_letter in test_cases:
            grade = Grade.objects.create(
                student=self.student_profile,
                assessment=self.assessment,
                marks_obtained=marks
            )
            self.assertEqual(grade.letter_grade, expected_letter)
            grade.delete()  # Clean up for next test
