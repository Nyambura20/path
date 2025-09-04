"""
Training script for the student performance prediction model
"""
import os
import sys
import django
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler
import joblib

# Add the project directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.performance.ml_utils import PerformancePredictor


def train_model():
    """Train the performance prediction model"""
    print("Starting model training...")
    
    predictor = PerformancePredictor()
    
    # Prepare training data
    print("Preparing training data...")
    df = predictor.prepare_training_data()
    
    if df.empty:
        print("No training data available. Please ensure you have completed enrollments with grades.")
        return False
    
    print(f"Training data shape: {df.shape}")
    print(f"Features: {list(df.columns)}")
    
    # Train the model
    success = predictor.train_model()
    
    if success:
        print("Model trained successfully!")
        print(f"Model saved to: {predictor.model_path}")
    else:
        print("Model training failed.")
    
    return success


def generate_sample_data():
    """Generate sample training data for demonstration"""
    print("Generating sample training data...")
    
    # This would typically be done through the Django admin or API
    # For now, we'll just print instructions
    print("""
    To train the model, you need:
    1. Students with completed courses (enrollments with final grades)
    2. Grade records for assessments
    3. Attendance records (optional but helpful)
    
    You can create sample data through:
    - Django admin interface
    - API endpoints
    - Django management commands
    """)


def evaluate_model():
    """Evaluate the trained model"""
    predictor = PerformancePredictor()
    
    try:
        predictor.load_model()
        print("Model loaded successfully")
        
        # You could add evaluation logic here
        print("Model evaluation would go here...")
        
    except Exception as e:
        print(f"Error loading model: {e}")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Train student performance prediction model')
    parser.add_argument('--action', choices=['train', 'evaluate', 'sample'], 
                       default='train', help='Action to perform')
    
    args = parser.parse_args()
    
    if args.action == 'train':
        train_model()
    elif args.action == 'evaluate':
        evaluate_model()
    elif args.action == 'sample':
        generate_sample_data()
