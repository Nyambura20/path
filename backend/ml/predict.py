"""
Prediction script for generating performance predictions
"""
import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.performance.ml_utils import PerformancePredictor, update_predictions
from apps.students.models import StudentProfile
from apps.courses.models import Course, Enrollment


def predict_single_student(student_id, course_id):
    """Generate prediction for a single student-course pair"""
    try:
        student = StudentProfile.objects.get(id=student_id)
        course = Course.objects.get(id=course_id)
        
        print(f"Generating prediction for {student.user.get_full_name()} in {course.code}")
        
        predictor = PerformancePredictor()
        result = predictor.predict(student_id, course_id)
        
        if result:
            print(f"Predicted Grade: {result['predicted_grade']}")
            print(f"Confidence: {result['confidence_score']:.2%}")
            print(f"At Risk: {result['at_risk']}")
            print(f"Risk Factors: {', '.join(result['risk_factors'])}")
            print(f"Recommendations: {', '.join(result['recommendations'])}")
        else:
            print("Could not generate prediction")
            
    except StudentProfile.DoesNotExist:
        print(f"Student with ID {student_id} not found")
    except Course.DoesNotExist:
        print(f"Course with ID {course_id} not found")
    except Exception as e:
        print(f"Error generating prediction: {e}")


def predict_all_active():
    """Generate predictions for all active enrollments"""
    print("Generating predictions for all active enrollments...")
    
    try:
        update_predictions()
        print("All predictions updated successfully")
    except Exception as e:
        print(f"Error updating predictions: {e}")


def list_students():
    """List all students for reference"""
    print("Available students:")
    students = StudentProfile.objects.all()
    for student in students:
        print(f"ID: {student.id}, Name: {student.user.get_full_name()}, Student ID: {student.student_id}")


def list_courses():
    """List all courses for reference"""
    print("Available courses:")
    courses = Course.objects.filter(is_active=True)
    for course in courses:
        print(f"ID: {course.id}, Code: {course.code}, Name: {course.name}")


def show_at_risk_students():
    """Show students at risk based on predictions"""
    from apps.performance.models import PerformancePrediction
    
    at_risk = PerformancePrediction.objects.filter(at_risk=True)
    
    print("Students at risk:")
    for prediction in at_risk:
        print(f"- {prediction.student.user.get_full_name()} in {prediction.course.code}")
        print(f"  Predicted Grade: {prediction.predicted_grade}")
        print(f"  Risk Factors: {', '.join(prediction.risk_factors)}")
        print()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Generate student performance predictions')
    parser.add_argument('--action', choices=['single', 'all', 'at-risk', 'list-students', 'list-courses'], 
                       default='all', help='Action to perform')
    parser.add_argument('--student-id', type=int, help='Student ID for single prediction')
    parser.add_argument('--course-id', type=int, help='Course ID for single prediction')
    
    args = parser.parse_args()
    
    if args.action == 'single':
        if args.student_id and args.course_id:
            predict_single_student(args.student_id, args.course_id)
        else:
            print("Please provide both --student-id and --course-id for single prediction")
    elif args.action == 'all':
        predict_all_active()
    elif args.action == 'at-risk':
        show_at_risk_students()
    elif args.action == 'list-students':
        list_students()
    elif args.action == 'list-courses':
        list_courses()
