# BrightPath - Educational Management System

A comprehensive Django-based educational platform with ML-powered performance predictions and modern API architecture.

## Project Overview

BrightPath is a complete educational management system built with Django and Django REST Framework, featuring:

- **User Management**: Multi-role authentication (Student, Teacher, Admin)
- **Course Management**: Full course creation, enrollment, and scheduling
- **Attendance Tracking**: Real-time attendance with alerts and analytics
- **Performance Analytics**: Grade management with ML-based performance predictions
- **Student Profiles**: Comprehensive student information with parent/guardian details
- **JWT Authentication**: Secure token-based authentication
- **API Gateway**: Centralized API routing and management
- **ML Integration**: Scikit-learn powered academic performance predictions
- **Interactive API Documentation**: Swagger UI with complete API reference and testing interface

## Architecture

```
brightpath/
├── config/                    # Django project settings
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py           # Main configuration
│   ├── urls.py               # Root URL routing
│   └── wsgi.py
├── apps/                     # Django applications
│   ├── users/               # User authentication & management
│   │   ├── models.py        # Custom User model
│   │   ├── views.py         # JWT auth views
│   │   ├── serializers.py   # API serializers
│   │   └── urls.py          # User endpoints
│   ├── students/            # Student profiles & management
│   │   ├── models.py        # Student, Parent, Emergency contacts
│   │   ├── views.py         # Student CRUD operations
│   │   └── dashboard.py     # Student dashboard logic
│   ├── courses/             # Course & enrollment management
│   │   ├── models.py        # Course, Enrollment, Schedule
│   │   ├── views.py         # Course operations
│   │   └── enrollment.py    # Enrollment logic
│   ├── performance/         # Grade & performance tracking
│   │   ├── models.py        # Assessment, Grade, Predictions
│   │   ├── views.py         # Grade management
│   │   └── ml_utils.py      # ML performance predictions
│   ├── attendance/          # Attendance management
│   │   ├── models.py        # Attendance records & sessions
│   │   ├── views.py         # Attendance operations
│   │   └── analytics.py     # Attendance analytics
│   └── api_gateway/         # API routing & management
│       ├── views.py         # Gateway endpoints
│       └── urls.py          # API routing
├── ml_module/               # Machine learning components
│   ├── models/             # ML model storage
│   ├── performance_predictor.py  # Performance prediction logic
│   └── data_preprocessing.py     # Data preparation utilities
└── static/                 # Static files
```

## Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with access and refresh tokens
- **Multi-role system**: Students, Teachers, Admins
- **Secure password handling** with Django's built-in authentication
- **Permission-based access control** for API endpoints

### 👥 User Management
- **Custom User model** with role-based permissions
- **User registration and login** with JWT token generation
- **Profile management** with role-specific fields
- **Password reset functionality**

### 📚 Course Management
- **Course creation and management** with detailed information
- **Prerequisites system** for course dependencies
- **Course scheduling** with time slot management
- **Enrollment system** with capacity controls
- **Course analytics** and reporting

### 👨‍🎓 Student Profiles
- **Comprehensive student information** (academic, personal)
- **Parent/Guardian management** with multiple contacts
- **Emergency contact system**
- **Academic history tracking**
- **Student dashboard** with personalized insights

### 📊 Performance Tracking
- **Assessment management** (quizzes, assignments, exams)
- **Grade recording and calculation** with weighted averages
- **Letter grade conversion** (A+, A, B+, etc.)
- **Performance analytics** with trend analysis
- **ML-powered predictions** for academic outcomes

### 📋 Attendance Management
- **Real-time attendance marking** with multiple status types
- **Attendance sessions** for organized class tracking
- **Automated alerts** for poor attendance
- **Attendance analytics** with summaries and reports
- **Bulk attendance operations**

### 🤖 Machine Learning Integration
- **Performance prediction model** using historical data
- **Academic risk assessment** for early intervention
- **Data preprocessing** for ML model training
- **Prediction confidence scores** and explanations

## Installation & Setup

### Prerequisites
- Python 3.11+
- SQLite (default) or PostgreSQL
- Virtual environment (recommended)

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd brightpath
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment**
```bash
# Create .env file with your settings
cp .env.example .env
# Edit .env with your configuration
```

5. **Run migrations**
```bash
python manage.py migrate
```

6. **Create superuser**
```bash
python manage.py createsuperuser
```

7. **Start development server**
```bash
python manage.py runserver
```

The application will be available at `http://localhost:8000`

### 📚 API Documentation

**Interactive API Documentation with Swagger UI:**
- **Swagger UI**: `http://localhost:8000/api/docs/` - Interactive API documentation
- **ReDoc**: `http://localhost:8000/api/redoc/` - Alternative documentation interface  
- **OpenAPI Schema**: `http://localhost:8000/api/schema/` - Raw OpenAPI 3.0 schema

The Swagger documentation includes:
- **Complete API reference** with all endpoints
- **Interactive testing interface** - test APIs directly from browser
- **Request/Response examples** for all endpoints
- **Authentication handling** - JWT token support built-in
- **Schema validation** - automatic request/response validation
- **Organized by tags**: Authentication, Users, Students, Courses, Performance, Attendance

### 🔐 Authentication in API Docs

To use protected endpoints in Swagger UI:
1. Go to `http://localhost:8000/api/docs/`
2. Click **Authorize** button (🔒 icon)
3. Login to get JWT token via `/api/users/login/` endpoint
4. Use the access token: `Bearer <your_access_token>`
5. All subsequent requests will be authenticated

## API Endpoints

> **💡 Interactive Documentation**: Visit `http://localhost:8000/api/docs/` for complete interactive API documentation with Swagger UI

### Authentication
- `POST /api/users/register/` - User registration
- `POST /api/users/login/` - User login (returns JWT tokens)
- `POST /api/users/logout/` - User logout
- `POST /api/users/token/refresh/` - Refresh JWT token
- `GET /api/users/profile/` - Get user profile

### Students
- `GET /api/students/` - List students
- `POST /api/students/` - Create student profile
- `GET /api/students/{id}/` - Get student details
- `PUT/PATCH /api/students/{id}/` - Update student
- `GET /api/students/{id}/dashboard/` - Student dashboard

### Courses
- `GET /api/courses/` - List courses
- `POST /api/courses/` - Create course
- `GET /api/courses/{id}/` - Get course details
- `POST /api/courses/{id}/enroll/` - Enroll student
- `DELETE /api/courses/{id}/withdraw/` - Withdraw from course

### Performance
- `GET /api/performance/assessments/` - List assessments
- `POST /api/performance/assessments/` - Create assessment
- `GET /api/performance/grades/` - List grades
- `POST /api/performance/grades/` - Record grade
- `GET /api/performance/predictions/{student_id}/` - Get performance predictions

### Attendance
- `GET /api/attendance/sessions/` - List attendance sessions
- `POST /api/attendance/sessions/` - Create attendance session
- `POST /api/attendance/mark/` - Mark attendance
- `GET /api/attendance/student/{id}/summary/` - Attendance summary

### API Documentation
- `GET /api/docs/` - Swagger UI (Interactive API Documentation)
- `GET /api/redoc/` - ReDoc Documentation
- `GET /api/schema/` - OpenAPI 3.0 Schema

## Configuration

### Environment Variables
Create a `.env` file in the project root:

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1

# JWT Configuration
JWT_ACCESS_TOKEN_LIFETIME=60  # minutes
JWT_REFRESH_TOKEN_LIFETIME=7  # days

# ML Configuration
ML_MODEL_PATH=ml_module/models/
PREDICTION_CONFIDENCE_THRESHOLD=0.7
```

### Database Configuration
The project uses SQLite by default. For production, configure PostgreSQL:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'brightpath_db',
        'USER': 'your_username',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

## Development

### Running Tests
```bash
python manage.py test
```

### Code Quality
```bash
# Format code
black .

# Check linting
flake8

# Type checking
mypy .
```

### Database Operations
```bash
# Create new migration
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Reset database (development only)
python manage.py flush
```

## Deployment

### Production Settings
1. Set `DEBUG=False` in production
2. Configure proper database (PostgreSQL recommended)
3. Set up static file serving with WhiteNoise or CDN
4. Configure email backend for notifications
5. Set up proper logging configuration
6. Use environment variables for sensitive settings

### Docker Deployment
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
RUN python manage.py collectstatic --noinput

EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation wiki

---

**BrightPath Educational Management System** - Empowering education through technology and data-driven insights. - Student Performance Prediction Platform

A Django-based educational platform that uses machine learning to predict student performance and provide insights for improving academic outcomes.

## Features

- **User Management**: Authentication for Students, Teachers, and Administrators
- **Course Management**: Course creation and enrollment system
- **Performance Tracking**: Grade recording and assessment management
- **Attendance System**: Track student attendance patterns
- **ML Predictions**: Predict student performance using machine learning
- **API Gateway**: RESTful API for all platform features

## Project Structure

```
brightpath/
├── manage.py
├── requirements.txt
├── README.md
├── config/                      # Main project configuration
├── apps/                        # Feature-based Django apps
│   ├── users/                   # Authentication & user management
│   ├── students/                # Student profiles & details
│   ├── courses/                 # Course management & enrollments
│   ├── performance/             # Grades & performance tracking
│   └── attendance/              # Attendance tracking
├── api/                         # API gateway
└── ml/                          # Machine learning module
```

## Setup Instructions

1. Clone the repository
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Run migrations: `python manage.py migrate`
6. Create superuser: `python manage.py createsuperuser`
7. Run the server: `python manage.py runserver`

## API Endpoints

The API endpoints are organized under `/api/v1/` and include:
- `/api/v1/users/` - User management
- `/api/v1/students/` - Student profiles
- `/api/v1/courses/` - Course management
- `/api/v1/performance/` - Performance tracking
- `/api/v1/attendance/` - Attendance records

## Machine Learning

The ML module provides predictive analytics for student performance based on:
- Historical grades
- Attendance patterns
- Course difficulty metrics
- Student engagement data
