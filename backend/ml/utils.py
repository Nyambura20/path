"""
Utility functions for machine learning operations
"""
import numpy as np
import pandas as pd
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
import os


def encode_categorical_features(df, categorical_columns):
    """
    Encode categorical features using LabelEncoder
    
    Args:
        df: DataFrame with categorical features
        categorical_columns: List of column names to encode
    
    Returns:
        Tuple of (encoded_df, encoders_dict)
    """
    encoded_df = df.copy()
    encoders = {}
    
    for column in categorical_columns:
        if column in encoded_df.columns:
            le = LabelEncoder()
            encoded_df[column] = le.fit_transform(encoded_df[column].astype(str))
            encoders[column] = le
    
    return encoded_df, encoders


def calculate_feature_importance(model, feature_names):
    """
    Calculate and return feature importance from trained model
    
    Args:
        model: Trained sklearn model with feature_importances_ attribute
        feature_names: List of feature names
    
    Returns:
        DataFrame with features and their importance scores
    """
    if hasattr(model, 'feature_importances_'):
        importance_df = pd.DataFrame({
            'feature': feature_names,
            'importance': model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        return importance_df
    else:
        print("Model does not have feature importance attribute")
        return pd.DataFrame()


def plot_feature_importance(importance_df, top_n=10, save_path=None):
    """
    Plot feature importance
    
    Args:
        importance_df: DataFrame with feature names and importance scores
        top_n: Number of top features to display
        save_path: Path to save the plot (optional)
    """
    plt.figure(figsize=(10, 6))
    top_features = importance_df.head(top_n)
    
    sns.barplot(data=top_features, x='importance', y='feature')
    plt.title(f'Top {top_n} Feature Importance')
    plt.xlabel('Importance Score')
    plt.tight_layout()
    
    if save_path:
        plt.savefig(save_path)
    else:
        plt.show()


def create_grade_categories(grades):
    """
    Convert numerical grades to letter grade categories
    
    Args:
        grades: Array of numerical grades
    
    Returns:
        Array of letter grades
    """
    conditions = [
        grades >= 90,
        (grades >= 85) & (grades < 90),
        (grades >= 80) & (grades < 85),
        (grades >= 75) & (grades < 80),
        (grades >= 70) & (grades < 75),
        (grades >= 65) & (grades < 70),
        (grades >= 60) & (grades < 65),
        (grades >= 55) & (grades < 60),
        (grades >= 50) & (grades < 55),
        grades < 50
    ]
    
    choices = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'F']
    
    return np.select(conditions, choices, default='F')


def calculate_risk_score(features):
    """
    Calculate risk score based on multiple factors
    
    Args:
        features: Dictionary of student features
    
    Returns:
        Risk score between 0 and 1
    """
    risk_score = 0
    
    # Attendance risk
    attendance_rate = features.get('attendance_rate', 100)
    if attendance_rate < 50:
        risk_score += 0.4
    elif attendance_rate < 70:
        risk_score += 0.2
    elif attendance_rate < 80:
        risk_score += 0.1
    
    # Performance risk
    current_avg = features.get('current_course_avg', 100)
    if current_avg < 40:
        risk_score += 0.3
    elif current_avg < 60:
        risk_score += 0.2
    elif current_avg < 70:
        risk_score += 0.1
    
    # Historical performance risk
    historical_avg = features.get('avg_historical_performance', 100)
    if historical_avg < 50:
        risk_score += 0.2
    elif historical_avg < 65:
        risk_score += 0.1
    
    # Course difficulty risk
    difficulty_score = features.get('course_difficulty', 1)
    if difficulty_score == 3:  # Advanced
        risk_score += 0.1
    
    return min(risk_score, 1.0)


def generate_recommendations(risk_factors, features):
    """
    Generate personalized recommendations based on risk factors
    
    Args:
        risk_factors: List of identified risk factors
        features: Student feature dictionary
    
    Returns:
        List of recommendation strings
    """
    recommendations = []
    
    if 'Low attendance rate' in risk_factors:
        attendance_rate = features.get('attendance_rate', 100)
        if attendance_rate < 50:
            recommendations.append('Attend all remaining classes - your attendance is critically low')
        else:
            recommendations.append('Improve class attendance to at least 80%')
    
    if 'Poor current performance' in risk_factors:
        recommendations.append('Schedule a meeting with your instructor for additional support')
        recommendations.append('Form a study group with classmates')
        recommendations.append('Visit the academic support center for tutoring')
    
    if 'Weak academic history' in risk_factors:
        recommendations.append('Consider taking a lighter course load next semester')
        recommendations.append('Enroll in academic skills workshops')
    
    if features.get('course_difficulty', 1) == 3:
        recommendations.append('Allocate extra study time for this advanced course')
        recommendations.append('Seek help from teaching assistants during office hours')
    
    # General recommendations
    if not recommendations:
        recommendations.append('Continue with your current study approach')
        recommendations.append('Maintain consistent study habits')
    
    return recommendations


def validate_prediction_input(features):
    """
    Validate input features for prediction
    
    Args:
        features: Dictionary of features
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    required_features = [
        'year_of_study',
        'current_gpa',
        'course_difficulty',
        'course_credits'
    ]
    
    for feature in required_features:
        if feature not in features:
            return False, f"Missing required feature: {feature}"
        
        if not isinstance(features[feature], (int, float)):
            return False, f"Feature {feature} must be numeric"
    
    # Validate ranges
    if not (1 <= features['year_of_study'] <= 5):
        return False, "Year of study must be between 1 and 5"
    
    if not (0 <= features['current_gpa'] <= 4.0):
        return False, "GPA must be between 0 and 4.0"
    
    return True, ""


def create_training_report(model, X_test, y_test, feature_names):
    """
    Create a comprehensive training report
    
    Args:
        model: Trained model
        X_test: Test features
        y_test: Test targets
        feature_names: List of feature names
    
    Returns:
        Dictionary with report information
    """
    y_pred = model.predict(X_test)
    
    # Regression metrics
    mse = mean_squared_error(y_test, y_pred)
    r2 = model.score(X_test, y_test)
    
    # Feature importance
    if hasattr(model, 'feature_importances_'):
        importance_df = calculate_feature_importance(model, feature_names)
    else:
        importance_df = pd.DataFrame()
    
    report = {
        'model_type': type(model).__name__,
        'test_samples': len(X_test),
        'mse': mse,
        'rmse': np.sqrt(mse),
        'r2_score': r2,
        'feature_importance': importance_df.to_dict('records') if not importance_df.empty else [],
        'timestamp': datetime.now().isoformat()
    }
    
    return report


def save_model_metadata(model_path, metadata):
    """
    Save model metadata to a JSON file
    
    Args:
        model_path: Path where the model is saved
        metadata: Dictionary with model metadata
    """
    import json
    
    metadata_path = model_path.replace('.joblib', '_metadata.json')
    
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"Model metadata saved to: {metadata_path}")


def load_model_metadata(model_path):
    """
    Load model metadata from JSON file
    
    Args:
        model_path: Path where the model is saved
    
    Returns:
        Dictionary with model metadata or None if not found
    """
    import json
    
    metadata_path = model_path.replace('.joblib', '_metadata.json')
    
    if os.path.exists(metadata_path):
        with open(metadata_path, 'r') as f:
            return json.load(f)
    else:
        return None
