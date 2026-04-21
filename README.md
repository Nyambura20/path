# BrightPath

BrightPath is an education management platform with:
- Django REST backend (`backend`)
- React frontend (`frontend-new`)
- AI-powered performance assistant for students and teachers

This project now uses PostgreSQL as the primary database.

## Local Setup

Follow these steps on a new machine to run the project locally.

### 1. Prerequisites

Install the following tools before you begin:

- Python 3.11+
- Node.js 18+ and npm
- PostgreSQL 16+ if you want to run the database locally

If you prefer Docker for the database, make sure Docker Desktop or Docker Engine is installed instead of a local PostgreSQL service.

### 2. Clone the repository

```bash
git clone https://github.com/Nyambura20/path.git
cd brightpath2/path
```

### 3. Create the root `.env` file

Use the project root `.env` file for both backend and frontend settings.



### 4. Start PostgreSQL

Choose one of these options:

Local PostgreSQL:

```bash
createdb brightpath
```

Docker PostgreSQL:

```bash
docker run -d --name brightpath-postgres \
	-e POSTGRES_DB=brightpath \
	-e POSTGRES_USER=postgres \
	-e POSTGRES_PASSWORD=postgres \
	-p 5432:5432 \
	postgres:16-alpine
```


### 5. Set up the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### 6. Load dummy data (optional, recommended for first run)

Open another terminal and run:

```bash
cd backend
source venv/bin/activate
python populate_dummy_data.py
```

Demo credentials created by the script:

- Teacher: `teacher1@brightpath.edu` / `password123`
- Teacher: `teacher2@brightpath.edu` / `password123`
- Teacher: `teacher3@brightpath.edu` / `password123`
- Student: `student1@brightpath.edu` / `password123`
- Student: `student2@brightpath.edu` / `password123`
- Student: `student3@brightpath.edu` / `password123`
- Student: `student4@brightpath.edu` / `password123`
- Student: `student5@brightpath.edu` / `password123`

These dummy users are already marked as verified, so login works immediately.

### 7. Set up the frontend

Open a second terminal:

```bash
cd frontend-new
./setup.sh
```

If you want to start it manually instead of using the setup script:

```bash
cd frontend-new
npm install
npm start
```

The frontend expects the backend API at `http://127.0.0.1:8000/api` by default.

### 8. Open the app

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/

## Project Structure

- `backend/` Django API and business logic
- `frontend-new/` React UI
- `.env` centralized environment file for backend + frontend values
- `Dockerfile` root container file
- `README.md` this single project-level README

## Railway Monorepo Deploy (Backend + Frontend)

If Railway is not showing the service you expect, it is usually because one service was created at repo root and picked the wrong Dockerfile. This repo now includes service-specific files so Railway can detect both apps clearly.

Current frontend production URL:

- https://path-liart.vercel.app/

### Files used by Railway

- `backend/Dockerfile` and `backend/railway.json` for Django API
- `frontend-new/Dockerfile` and `frontend-new/railway.json` for React frontend

### 1. Create backend service in Railway

1. In Railway, open your project and click New Service.
2. Choose GitHub Repo and select this repository.
3. Open service settings and set Root Directory to `backend`.
4. Build config:
	- Builder: Dockerfile
	- Dockerfile path: `Dockerfile` (because root is already `backend`)
5. Health check path: `/api/`

### 2. Create frontend service in Railway

1. In the same Railway project, click New Service again.
2. Choose the same GitHub repository.
3. Set Root Directory to `frontend-new`.
4. Build config:
	- Builder: Dockerfile
	- Dockerfile path: `Dockerfile` (because root is already `frontend-new`)
5. Health check path: `/`

### 3. Required backend environment variables

Set these before backend deploy:

- `DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require` (replace `#` in password with `%23`)
- `DJANGO_DEBUG=False`
- `DJANGO_SECRET_KEY=<strong-random-secret>`
- `DJANGO_ALLOWED_HOSTS=<your-railway-backend-domain>`
- `DB_CONN_MAX_AGE=120`
- `CORS_ALLOW_ALL_ORIGINS=False`
- `CORS_ALLOWED_ORIGINS=https://path-liart.vercel.app`
- `CSRF_TRUSTED_ORIGINS=https://path-liart.vercel.app`
- `FRONTEND_URL=https://path-liart.vercel.app`
- `EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend`
- `EMAIL_HOST=smtp.gmail.com`
- `EMAIL_PORT=587`
- `EMAIL_USE_TLS=True`
- `EMAIL_HOST_USER=<your-email-user>`
- `EMAIL_HOST_PASSWORD=<your-email-app-password>`
- `DEFAULT_FROM_EMAIL=BrightPath <noreply@brightpath.edu>`
- `GEMINI_API_KEY=<your-gemini-key>`

### 4. Required frontend environment variable

Set this in the Railway frontend service:

- `REACT_APP_API_BASE_URL=https://<your-railway-backend-domain>/api`

### 5. Deploy order

1. Deploy backend first and verify `https://<your-railway-backend-domain>/api/`.
2. Deploy frontend second.
3. Open frontend URL and confirm API calls succeed.
