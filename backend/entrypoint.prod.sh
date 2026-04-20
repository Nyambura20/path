#!/usr/bin/env sh
set -e

echo "Starting BrightPath backend..."
echo "DATABASE_URL: ${DATABASE_URL:?DATABASE_URL not set}"
echo "PORT: ${PORT:-8000}"

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting Gunicorn on port ${PORT:-8000}..."
exec gunicorn config.wsgi:application \
  --bind 0.0.0.0:${PORT:-8000} \
  --workers 3 \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -
