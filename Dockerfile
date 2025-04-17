# Stage 1: Build React frontend
FROM node:18 AS frontend-build

WORKDIR /app
COPY frontend/ ./frontend/
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Stage 2: Build backend with FastAPI
FROM python:3.11-slim AS backend

# Install required system packages
RUN apt-get update && apt-get install -y build-essential libpq-dev && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy backend files
COPY backend/ ./backend/
COPY --from=frontend-build /app/frontend/dist ./backend/app/static

# Install Python dependencies
RUN pip install --upgrade pip
RUN pip install -r backend/requirements.txt

# Expose FastAPI port
EXPOSE 8000

# Start FastAPI
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
