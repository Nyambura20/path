# Create your tests here.
from django.test import TestCase
from django.contrib.auth import get_user_model

User = get_user_model()


class UserModelTest(TestCase):
    def test_create_user(self):
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.assertEqual(user.email, 'test@example.com')
        self.assertEqual(user.role, 'student')  # default role
        self.assertTrue(user.is_active)

    def test_user_string_representation(self):
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            first_name='Test',
            last_name='User',
            role='teacher'
        )
        self.assertEqual(str(user), 'Test User (teacher)')

    def test_user_role_properties(self):
        user = User.objects.create_user(
            username='teacher',
            email='teacher@example.com',
            role='teacher'
        )
        self.assertTrue(user.is_teacher)
        self.assertFalse(user.is_student)
        self.assertFalse(user.is_admin)
