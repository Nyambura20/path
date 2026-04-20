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

## Free Deploy Topology (Vercel + Railway + Supabase)

- Frontend: Vercel (free)
- Backend API: Railway (free tier availability depends on account limits)
- Database: Supabase PostgreSQL

Current frontend production URL:

- https://path-liart.vercel.app/

## Railway Backend Only (Monorepo Safe)

Use these exact steps so Railway deploys only `backend/` and ignores frontend Docker targets.

### 1. Create backend service only

1. In Railway, create an Empty Project.
2. Inside the project, click New Service and choose GitHub Repo.
3. Pick this repository.
4. Immediately set Root Directory to `backend` in service settings.

### 2. Force backend-specific build config

This repo includes both:

- `backend/railway.json` (Railway deploy config)
- `backend/Dockerfile` (backend-only Dockerfile)

In Railway service settings:

1. Builder: Dockerfile
2. Dockerfile path: `backend/Dockerfile` (or `Dockerfile` if Root Directory is already `backend`)
3. Health check path: `/api/`

### 3. Configure backend environment variables

**CRITICAL:** Set these env vars **before** deploying. If DATABASE_URL is missing, the app will crash during startup.

Set these in Railway service settings:

- `DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require` (from Supabase, with %23 for # in password)
- `DJANGO_DEBUG=False`
- `DJANGO_SECRET_KEY=<your-strong-secret>`
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

### 4. Deploy and verify

1. Deploy the Railway backend service.
2. Confirm health endpoint: `https://<your-railway-backend-domain>/api/`
3. In Vercel, set `REACT_APP_API_BASE_URL=https://<your-railway-backend-domain>/api`
4. Redeploy Vercel frontend.

## Netlify Backend Note

Netlify free tier is ideal for static frontend hosting, but this Django backend is a long-running WSGI service and is not a good fit for Netlify Functions.
