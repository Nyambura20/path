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

## Production Deployment (Docker Compose)

This repository includes a full production stack:
- `docker-compose.prod.yml`
- `Dockerfile` (single root Dockerfile with `backend-prod` and `frontend-prod` targets)
- `deploy/nginx/default.conf` (reverse proxy for frontend + API)

### 1. Prepare production environment file

```bash
cp .env.production.example .env.production
```

Edit `.env.production` and set secure values (especially `DJANGO_SECRET_KEY`, `POSTGRES_PASSWORD`, email credentials, domains, CORS/CSRF values).

### 2. Deploy

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

This starts:
1. PostgreSQL
2. Backend API (runs migrations and collectstatic automatically)
3. Frontend static container
4. Nginx gateway on port `80`

### 3. Verify

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f backend
```

### 4. Update / restart

```bash
git pull
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

### 5. Optional HTTPS

Run a host-level Nginx/Caddy/Traefik with Let's Encrypt in front of port `80`, or extend `deploy/nginx/default.conf` for TLS certificates.

## Production Deployment (Render Blueprint)

This repository now includes a ready-to-deploy Render Blueprint config at `render.yaml`.

Configured resources:
1. `brightpath-db` PostgreSQL database
2. `brightpath-backend` Django web service
3. `brightpath-frontend` React static site

Backend is configured to:
1. install dependencies
2. run migrations
3. collect static files
4. start with Gunicorn

The frontend static site is configured with SPA rewrites and points to the Render backend API URL.