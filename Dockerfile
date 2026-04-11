FROM python:3.11-slim AS backend-prod

ENV PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
	libpq-dev \
	gcc \
	&& rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./
RUN chmod +x entrypoint.prod.sh

EXPOSE 8000
ENTRYPOINT ["./entrypoint.prod.sh"]


FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

COPY frontend-new/package*.json ./
RUN npm ci

COPY frontend-new/ ./

ARG REACT_APP_API_BASE_URL=/api
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}
ENV GENERATE_SOURCEMAP=false

RUN npm run build


FROM nginx:1.27-alpine AS frontend-prod

COPY --from=frontend-builder /frontend/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
