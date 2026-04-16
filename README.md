# BrightPath

BrightPath is an education management platform with:
- Django REST backend (`backend`)
- React frontend (`frontend-new`)
- AI-powered performance assistant for students and teachers

This project now uses PostgreSQL as the primary database.

## Project Structure

- `backend/` Django API and business logic
- `frontend-new/` React UI
- `.env` centralized environment file for backend + frontend values
- `Dockerfile` root container file
- `README.md` this single project-level README

## Environment Setup

Use the root `.env` file.

Required PostgreSQL variables:

```env
POSTGRES_DB=brightpath
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
```

Frontend API variable:

```env
REACT_APP_API_BASE_URL=http://127.0.0.1:8000/api
```

## Backend Setup

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Frontend Setup

```bash
cd frontend-new
./setup.sh
```

`setup.sh` reads variables from the root `.env` file, so no extra frontend `.env` file is needed.

## Notes

- AI chat for students uses Gemini when available and a data-aware fallback when unavailable.
- Keep secrets in `.env` and never commit real credentials.

