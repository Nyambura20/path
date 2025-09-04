# Create your tests here.
from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import StudentProfile, ParentGuardian, EmergencyContact
from datetime import date

User = get_user_model()


class StudentProfileModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='student1',
            email='student@example.com',
            first_name='John',
            last_name='Doe',
            role='student'
        )

    def test_create_student_profile(self):
        profile = StudentProfile.objects.create(
            user=self.user,
            student_id='STU001',
            year_of_study='1',
            major='Computer Science',
            admission_date=date.today()
        )
        self.assertEqual(profile.student_id, 'STU001')
        self.assertEqual(str(profile), 'John Doe - STU001')

    def test_parent_guardian_creation(self):
        profile = StudentProfile.objects.create(
            user=self.user,
            student_id='STU001',
            year_of_study='1',
            major='Computer Science',
            admission_date=date.today()
        )
        parent = ParentGuardian.objects.create(
            student=profile,
            name='Jane Doe',
            relationship='mother',
            phone_number='+1234567890',
            is_primary_contact=True
        )
        self.assertEqual(parent.name, 'Jane Doe')
        self.assertTrue(parent.is_primary_contact)
