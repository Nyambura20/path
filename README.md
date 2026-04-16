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
git clone <your-repository-url>
cd brightpath2/path
```

### 3. Create the root `.env` file

Use the project root `.env` file for both backend and frontend settings.

Example values for local development:

```env
DJANGO_SECRET_KEY=replace-with-a-secure-secret-key
DJANGO_DEBUG=True

POSTGRES_DB=brightpath
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432

REACT_APP_API_BASE_URL=http://127.0.0.1:8000/api
REACT_APP_ENV=development
GENERATE_SOURCEMAP=true

GEMINI_API_KEY=
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
FRONTEND_URL=http://localhost:3000
```

Keep real secrets out of version control.

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

If your database is on another host or port, update `POSTGRES_HOST` and `POSTGRES_PORT` in `.env`.

### 5. Set up the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### 6. Set up the frontend

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

### 7. Open the app

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/

## Project Structure

- `backend/` Django API and business logic
- `frontend-new/` React UI
- `.env` centralized environment file for backend + frontend values
- `Dockerfile` root container file
- `README.md` this single project-level README

## Notes

- AI chat for students uses Gemini when available and a data-aware fallback when unavailable.
- Keep secrets in `.env` and never commit real credentials.

