#!/usr/bin/env python
"""
Script to populate the database with dummy data for testing
"""
import os
import django
from datetime import datetime, timedelta, date, time
from decimal import Decimal
import random

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User
from apps.students.models import StudentProfile, ParentGuardian, EmergencyContact
from apps.courses.models import Course, Enrollment
from apps.performance.models import Assessment, Grade
from apps.attendance.models import AttendanceSession, AttendanceRecord

def create_dummy_data():
    print("Creating dummy data...")
    
        # Clear existing data
    User.objects.all().delete()
    StudentProfile.objects.all().delete()
    ParentGuardian.objects.all().delete()
    EmergencyContact.objects.all().delete()
    Course.objects.all().delete()
    Enrollment.objects.all().delete()
    Assessment.objects.all().delete()
    Grade.objects.all().delete()
    AttendanceSession.objects.all().delete()
    AttendanceRecord.objects.all().delete()
    
    # Create Teachers
    print("Creating teachers...")
    teachers = []
    teacher_data = [
        {
            'username': 'dummy_teacher1',
            'email': 'teacher1@brightpath.edu',
            'first_name': 'John',
            'last_name': 'Smith',
            'role': 'teacher'
        },
        {
            'username': 'dummy_teacher2',
            'email': 'teacher2@brightpath.edu',
            'first_name': 'Sarah',
            'last_name': 'Johnson',
            'role': 'teacher'
        },
        {
            'username': 'dummy_teacher3',
            'email': 'teacher3@brightpath.edu',
            'first_name': 'Michael',
            'last_name': 'Brown',
            'role': 'teacher'
        }
    ]
    
    for data in teacher_data:
        teacher = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password='password123',
            first_name=data['first_name'],
            last_name=data['last_name'],
            role=data['role']
        )
        teachers.append(teacher)
    
    # Create Students
    print("Creating students...")
    students = []
    student_profiles = []
    student_data = [
        {
            'username': 'dummy_student1',
            'email': 'student1@brightpath.edu',
            'first_name': 'Alice',
            'last_name': 'Wilson',
            'role': 'student'
        },
        {
            'username': 'dummy_student2',
            'email': 'student2@brightpath.edu',
            'first_name': 'Bob',
            'last_name': 'Davis',
            'role': 'student'
        },
        {
            'username': 'dummy_student3',
            'email': 'student3@brightpath.edu',
            'first_name': 'Carol',
            'last_name': 'Miller',
            'role': 'student'
        },
        {
            'username': 'dummy_student4',
            'email': 'student4@brightpath.edu',
            'first_name': 'David',
            'last_name': 'Garcia',
            'role': 'student'
        },
        {
            'username': 'dummy_student5',
            'email': 'student5@brightpath.edu',
            'first_name': 'Emma',
            'last_name': 'Martinez',
            'role': 'student'
        }
    ]
    
    for data in student_data:
        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password='password123',
            first_name=data['first_name'],
            last_name=data['last_name'],
            role=data['role']
        )
        students.append(user)
        
        # Create Student profile
        student_profile = StudentProfile.objects.create(
            user=user,
            student_id=f"ST{user.id:04d}",
            year_of_study=str(random.randint(1, 4)),
            major=random.choice(['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology']),
            gpa=Decimal(str(round(random.uniform(2.5, 4.0), 2))),
            admission_date=datetime.now().date() - timedelta(days=random.randint(365, 1460))
        )
        student_profiles.append(student_profile)
        
        # Create Parent/Guardian
        ParentGuardian.objects.create(
            student=student_profile,
            name=f"Parent {user.last_name}",
            relationship=random.choice(['father', 'mother', 'guardian']),
            phone_number=f"+1-555-{random.randint(1000, 9999)}",
            email=f"parent.{user.username}@email.com",
            address=f"{random.randint(100, 999)} Main St, City",
            occupation=random.choice(['Engineer', 'Teacher', 'Doctor', 'Lawyer', 'Business Owner']),
            is_primary_contact=True
        )
        
        # Create Emergency Contact
        EmergencyContact.objects.create(
            student=student_profile,
            name=f"Emergency Contact {user.last_name}",
            relationship="Guardian",
            phone_number=f"+1-555-{random.randint(1000, 9999)}"
        )
    
    # Create Courses
    print("Creating courses...")
    course_data = [
        {
            'code': 'MATH101',
            'name': 'Introduction to Mathematics',
            'description': 'Basic mathematical concepts and problem-solving techniques.',
            'credits': 3,
            'teacher': teachers[0]
        },
        {
            'code': 'SCI201',
            'name': 'General Science',
            'description': 'Fundamental principles of physics, chemistry, and biology.',
            'credits': 4,
            'teacher': teachers[1]
        },
        {
            'code': 'ENG101',
            'name': 'English Literature',
            'description': 'Study of classic and contemporary literature.',
            'credits': 3,
            'teacher': teachers[2]
        },
        {
            'code': 'HIST101',
            'name': 'World History',
            'description': 'Overview of major historical events and civilizations.',
            'credits': 3,
            'teacher': teachers[0]
        },
        {
            'code': 'CS101',
            'name': 'Introduction to Computer Science',
            'description': 'Basic programming concepts and computer literacy.',
            'credits': 4,
            'teacher': teachers[1]
        }
    ]
    
    courses = []
    for data in course_data:
        course = Course.objects.create(
            code=data['code'],
            name=data['name'],
            description=data['description'],
            credits=data['credits'],
            difficulty_level=random.choice(['beginner', 'intermediate', 'advanced']),
            instructor=data['teacher'],
            max_students=25,
            start_date=datetime.now().date(),
            end_date=datetime.now().date() + timedelta(days=120),
            is_active=True
        )
        courses.append(course)
    
    # Create Enrollments
    print("Creating enrollments...")
    for student_profile in student_profiles:
        # Enroll each student in 3-4 random courses
        student_courses = random.sample(courses, random.randint(3, 4))
        for course in student_courses:
            Enrollment.objects.create(
                student=student_profile,
                course=course,
                enrollment_date=datetime.now().date() - timedelta(days=random.randint(1, 30)),
                status='enrolled'
            )
    
    # Create Assessments
    print("Creating assessments...")
    assessment_types = ['quiz', 'assignment', 'midterm', 'final', 'project']
    assessments = []
    
    for course in courses:
        for i in range(random.randint(3, 6)):
            assessment = Assessment.objects.create(
                course=course,
                title=f"{random.choice(assessment_types).title()} {i+1}",
                description=f"Assessment for {course.name}",
                assessment_type=random.choice(assessment_types),
                total_marks=Decimal(str(random.choice([50, 75, 100]))),
                weight_percentage=Decimal(str(random.randint(10, 30))),
                due_date=datetime.now() + timedelta(days=random.randint(1, 60)),
                is_published=True
            )
            assessments.append(assessment)
    
    # Create Grades
    print("Creating grades...")
    for assessment in assessments:
        # Get students enrolled in this course
        enrolled_students = StudentProfile.objects.filter(
            enrollments__course=assessment.course,
            enrollments__is_active=True
        )
        
        for student in enrolled_students:
            # Create grade with some randomness (70-95% performance)
            percentage = random.uniform(0.7, 0.95)
            marks_obtained = assessment.total_marks * Decimal(str(percentage))
            
            Grade.objects.create(
                student=student,
                assessment=assessment,
                marks_obtained=marks_obtained.quantize(Decimal('0.01')),
                feedback=f"Good work on {assessment.title}",
                graded_by=assessment.course.instructor,
                is_published=True
            )
    
    # Create Attendance Sessions and Records
    print("Creating attendance records...")
    for course in courses:
        # Create attendance sessions for the past 30 days
        for i in range(15):  # 15 sessions
            session_date = datetime.now().date() - timedelta(days=i*2)
            session = AttendanceSession.objects.create(
                course=course,
                date=session_date,
                start_time=time(random.randint(8, 15), 0),
                end_time=time(random.randint(9, 16), 0),
                topic=f"Session {i+1}",
                session_type='lecture',
                created_by=course.instructor
            )
            
            # Create attendance records for enrolled students
            enrolled_students = StudentProfile.objects.filter(
                enrollments__course=course,
                enrollments__is_active=True
            )
            
            for student in enrolled_students:
                # 85% chance of being present
                status = 'present' if random.random() < 0.85 else random.choice(['absent', 'late'])
                
                AttendanceRecord.objects.create(
                    student=student,
                    course=course,
                    date=datetime.now().date() - timedelta(days=i*2),
                    status=status,
                    marked_by=course.instructor
                )
    
    print("Dummy data created successfully!")
    print(f"Created {len(teachers)} teachers")
    print(f"Created {len(students)} students")
    print(f"Created {len(courses)} courses")
    print(f"Created {len(assessments)} assessments")
    print(f"Created {Grade.objects.count()} grades")
    print(f"Created {AttendanceSession.objects.count()} attendance sessions")
    print(f"Created {AttendanceRecord.objects.count()} attendance records")

def get_letter_grade(percentage):
    """Convert percentage to letter grade"""
    if percentage >= 90:
        return 'A+'
    elif percentage >= 85:
        return 'A'
    elif percentage >= 80:
        return 'B+'
    elif percentage >= 75:
        return 'B'
    elif percentage >= 70:
        return 'C+'
    elif percentage >= 65:
        return 'C'
    elif percentage >= 60:
        return 'D+'
    elif percentage >= 55:
        return 'D'
    else:
        return 'F'

if __name__ == '__main__':
    create_dummy_data()
