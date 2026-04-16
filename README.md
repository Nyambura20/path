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
