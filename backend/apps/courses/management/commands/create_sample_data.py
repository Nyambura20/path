from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.users.models import User
from apps.students.models import StudentProfile
from apps.courses.models import Course, Enrollment
from datetime import date, timedelta
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Create sample teacher, students, and enrollments for testing'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')

        # Create a teacher user
        teacher_user, created = User.objects.get_or_create(
            email='teacher@example.com',
            defaults={
                'username': 'teacher1',
                'first_name': 'John',
                'last_name': 'Smith',
                'role': 'teacher',
                'is_active': True,
            }
        )
        if created:
            teacher_user.set_password('password123')
            teacher_user.save()
            self.stdout.write(f'Created teacher: {teacher_user.email}')

        # Create sample courses
        courses_data = [
            {'name': 'Introduction to Computer Science', 'code': 'CS101', 'description': 'Basic programming concepts'},
            {'name': 'Data Structures and Algorithms', 'code': 'CS201', 'description': 'Advanced programming concepts'},
            {'name': 'Web Development', 'code': 'CS301', 'description': 'Modern web development techniques'},
        ]

        courses = []
        for course_data in courses_data:
            course, created = Course.objects.get_or_create(
                code=course_data['code'],
                defaults={
                    'name': course_data['name'],
                    'description': course_data['description'],
                    'instructor': teacher_user,
                    'start_date': date.today(),
                    'end_date': date.today() + timedelta(days=120),
                    'is_active': True,
                }
            )
            courses.append(course)
            if created:
                self.stdout.write(f'Created course: {course.code} - {course.name}')

        # Create sample students
        students_data = [
            {'first_name': 'Alice', 'last_name': 'Johnson', 'email': 'alice@example.com', 'student_id': 'ST001', 'major': 'Computer Science', 'year': 2, 'gpa': 3.8},
            {'first_name': 'Bob', 'last_name': 'Wilson', 'email': 'bob@example.com', 'student_id': 'ST002', 'major': 'Information Technology', 'year': 1, 'gpa': 3.5},
            {'first_name': 'Carol', 'last_name': 'Davis', 'email': 'carol@example.com', 'student_id': 'ST003', 'major': 'Computer Science', 'year': 3, 'gpa': 3.9},
            {'first_name': 'David', 'last_name': 'Brown', 'email': 'david@example.com', 'student_id': 'ST004', 'major': 'Software Engineering', 'year': 2, 'gpa': 3.6},
            {'first_name': 'Emma', 'last_name': 'Garcia', 'email': 'emma@example.com', 'student_id': 'ST005', 'major': 'Computer Science', 'year': 1, 'gpa': 3.7},
            {'first_name': 'Frank', 'last_name': 'Miller', 'email': 'frank@example.com', 'student_id': 'ST006', 'major': 'Information Technology', 'year': 4, 'gpa': 3.4},
        ]

        students = []
        for student_data in students_data:
            # Create user
            user, created = User.objects.get_or_create(
                email=student_data['email'],
                defaults={
                    'username': student_data['student_id'].lower(),
                    'first_name': student_data['first_name'],
                    'last_name': student_data['last_name'],
                    'role': 'student',
                    'is_active': True,
                    'phone_number': f'+1234567890{random.randint(0, 9)}'
                }
            )
            if created:
                user.set_password('password123')
                user.save()

            # Create student profile
            student_profile, created = StudentProfile.objects.get_or_create(
                user=user,
                defaults={
                    'student_id': student_data['student_id'],
                    'major': student_data['major'],
                    'year_of_study': student_data['year'],
                    'gpa': student_data['gpa'],
                    'admission_date': date.today() - timedelta(days=student_data['year'] * 365),
                }
            )
            students.append(student_profile)
            if created:
                self.stdout.write(f'Created student: {user.get_full_name()} ({student_profile.student_id})')

        # Create enrollments
        for course in courses:
            # Randomly enroll students in courses
            num_enrollments = random.randint(2, len(students))
            enrolled_students = random.sample(students, num_enrollments)
            
            for student in enrolled_students:
                enrollment, created = Enrollment.objects.get_or_create(
                    student=student,
                    course=course,
                    defaults={
                        'enrollment_date': date.today() - timedelta(days=random.randint(1, 30)),
                        'status': 'active',
                        'is_active': True,
                    }
                )
                if created:
                    self.stdout.write(f'Enrolled {student.user.get_full_name()} in {course.code}')

        self.stdout.write(self.style.SUCCESS('Sample data created successfully!'))
        self.stdout.write(f'Teacher login: teacher@example.com / password123')
        self.stdout.write(f'Created {len(courses)} courses')
        self.stdout.write(f'Created {len(students)} students')
