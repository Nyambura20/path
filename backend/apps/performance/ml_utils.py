"""
Machine Learning utilities for performance prediction
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import joblib
from django.conf import settings
import os
from .models import Grade, Assessment, PerformancePrediction
from apps.students.models import StudentProfile
from apps.courses.models import Course, Enrollment
from apps.attendance.models import AttendanceRecord


class PerformancePredictor:
    """ML model for predicting student performance"""
    
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.model_path = os.path.join(settings.BASE_DIR, 'ml', 'models')
        
    def extract_features(self, student_id, course_id):
        """Extract features for a student-course pair"""
        try:
            student = StudentProfile.objects.get(id=student_id)
            course = Course.objects.get(id=course_id)
            enrollment = Enrollment.objects.get(student=student, course=course)
            
            # Basic student features
            features = {
                'year_of_study': int(student.year_of_study),
                'current_gpa': float(student.gpa or 0),
                'course_difficulty': self._get_difficulty_score(course.difficulty_level),
                'course_credits': course.credits,
            }
            
            # Historical performance features
            historical_grades = Grade.objects.filter(student=student).exclude(
                assessment__course=course
            )
            
            if historical_grades.exists():
                avg_performance = historical_grades.aggregate(
                    avg_percentage=models.Avg('marks_obtained')
                )['avg_percentage'] or 0
                features['avg_historical_performance'] = float(avg_performance)
                features['total_assessments_taken'] = historical_grades.count()
            else:
                features['avg_historical_performance'] = 0
                features['total_assessments_taken'] = 0
            
            # Current course performance
            current_grades = Grade.objects.filter(
                student=student,
                assessment__course=course,
                is_published=True
            )
            
            if current_grades.exists():
                current_avg = sum(g.percentage for g in current_grades) / len(current_grades)
                features['current_course_avg'] = current_avg
                features['assessments_completed'] = current_grades.count()
            else:
                features['current_course_avg'] = 0
                features['assessments_completed'] = 0
            
            # Attendance features (if attendance app is available)
            try:
                attendance_records = AttendanceRecord.objects.filter(
                    student=student,
                    course=course
                )
                if attendance_records.exists():
                    total_classes = attendance_records.count()
                    present_classes = attendance_records.filter(status='present').count()
                    features['attendance_rate'] = (present_classes / total_classes) * 100 if total_classes > 0 else 0
                else:
                    features['attendance_rate'] = 0
            except:
                features['attendance_rate'] = 0
            
            # Engagement features
            features['days_enrolled'] = (timezone.now().date() - enrollment.enrollment_date.date()).days
            
            return features
            
        except Exception as e:
            print(f"Error extracting features: {e}")
            return {}
    
    def _get_difficulty_score(self, difficulty_level):
        """Convert difficulty level to numeric score"""
        mapping = {'beginner': 1, 'intermediate': 2, 'advanced': 3}
        return mapping.get(difficulty_level, 2)
    
    def prepare_training_data(self):
        """Prepare training data from existing grades"""
        data = []
        
        # Get all completed enrollments with final grades
        completed_enrollments = Enrollment.objects.filter(
            status__in=['completed', 'failed'],
            final_grade__isnull=False
        )
        
        for enrollment in completed_enrollments:
            features = self.extract_features(enrollment.student.id, enrollment.course.id)
            if features:
                features['final_grade'] = float(enrollment.final_grade)
                data.append(features)
        
        return pd.DataFrame(data)
    
    def train_model(self):
        """Train the ML model"""
        df = self.prepare_training_data()
        
        if df.empty or len(df) < 10:  # Need minimum data points
            print("Insufficient data for training")
            return False
        
        # Separate features and target
        target_col = 'final_grade'
        feature_cols = [col for col in df.columns if col != target_col]
        
        X = df[feature_cols]
        y = df[target_col]
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test_scaled)
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        print(f"Model Performance - MSE: {mse:.2f}, R²: {r2:.2f}")
        
        # Save model
        self.save_model()
        
        return True
    
    def predict(self, student_id, course_id):
        """Predict performance for a student-course pair"""
        try:
            # Load model if not already loaded
            self.load_model()
            
            # Extract features
            features = self.extract_features(student_id, course_id)
            if not features:
                return None
            
            # Prepare features for prediction
            feature_df = pd.DataFrame([features])
            feature_df = feature_df.fillna(0)  # Handle missing values
            
            # Scale features
            features_scaled = self.scaler.transform(feature_df)
            
            # Make prediction
            predicted_grade = self.model.predict(features_scaled)[0]
            
            # Calculate confidence (simplified approach)
            confidence = min(0.9, max(0.1, 1.0 - (abs(predicted_grade - 75) / 100)))
            
            # Determine risk factors
            risk_factors = self._identify_risk_factors(features)
            at_risk = len(risk_factors) > 2 or predicted_grade < 60
            
            # Generate recommendations
            recommendations = self._generate_recommendations(features, risk_factors)
            
            return {
                'predicted_grade': round(predicted_grade, 2),
                'confidence_score': round(confidence, 4),
                'at_risk': at_risk,
                'risk_factors': risk_factors,
                'recommendations': recommendations,
                'features_used': features
            }
            
        except Exception as e:
            print(f"Prediction error: {e}")
            return None
    
    def _identify_risk_factors(self, features):
        """Identify risk factors based on features"""
        risk_factors = []
        
        if features.get('attendance_rate', 0) < 70:
            risk_factors.append('Low attendance rate')
        
        if features.get('current_course_avg', 0) < 60:
            risk_factors.append('Poor current performance')
        
        if features.get('avg_historical_performance', 0) < 60:
            risk_factors.append('Weak academic history')
        
        if features.get('assessments_completed', 0) < 2:
            risk_factors.append('Limited assessment data')
        
        return risk_factors
    
    def _generate_recommendations(self, features, risk_factors):
        """Generate recommendations based on analysis"""
        recommendations = []
        
        if 'Low attendance rate' in risk_factors:
            recommendations.append('Improve class attendance to at least 80%')
        
        if 'Poor current performance' in risk_factors:
            recommendations.append('Seek additional help from instructors or tutors')
        
        if 'Weak academic history' in risk_factors:
            recommendations.append('Consider enrolling in academic support programs')
        
        if features.get('course_difficulty', 0) == 3:  # Advanced course
            recommendations.append('Allocate extra study time for this advanced course')
        
        if not recommendations:
            recommendations.append('Continue with current study approach')
        
        return recommendations
    
    def save_model(self):
        """Save the trained model and scaler"""
        os.makedirs(self.model_path, exist_ok=True)
        
        model_file = os.path.join(self.model_path, 'performance_model.joblib')
        scaler_file = os.path.join(self.model_path, 'feature_scaler.joblib')
        
        joblib.dump(self.model, model_file)
        joblib.dump(self.scaler, scaler_file)
    
    def load_model(self):
        """Load the saved model and scaler"""
        model_file = os.path.join(self.model_path, 'performance_model.joblib')
        scaler_file = os.path.join(self.model_path, 'feature_scaler.joblib')
        
        if os.path.exists(model_file) and os.path.exists(scaler_file):
            self.model = joblib.load(model_file)
            self.scaler = joblib.load(scaler_file)
        else:
            print("Model files not found. Train the model first.")


def update_predictions():
    """Update predictions for all active enrollments"""
    predictor = PerformancePredictor()
    
    active_enrollments = Enrollment.objects.filter(
        status='enrolled',
        is_active=True
    )
    
    for enrollment in active_enrollments:
        prediction_data = predictor.predict(
            enrollment.student.id,
            enrollment.course.id
        )
        
        if prediction_data:
            # Update or create prediction
            prediction, created = PerformancePrediction.objects.update_or_create(
                student=enrollment.student,
                course=enrollment.course,
                defaults={
                    'predicted_grade': prediction_data['predicted_grade'],
                    'confidence_score': prediction_data['confidence_score'],
                    'at_risk': prediction_data['at_risk'],
                    'risk_factors': prediction_data['risk_factors'],
                    'recommendations': prediction_data['recommendations'],
                    'features_used': prediction_data['features_used'],
                }
            )
            
            if created:
                print(f"Created new prediction for {enrollment}")
            else:
                print(f"Updated prediction for {enrollment}")


# Django imports needed for the models
from django.db import models
from django.utils import timezone
