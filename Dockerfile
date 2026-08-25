# ==============================================================================
# Stage 1: Build Modern React Frontend
# ==============================================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend

# Install dependencies first for better caching
COPY frontend/package*.json ./
RUN npm ci --silent || npm install --silent

# Copy source code and build production assets
COPY frontend/ ./
RUN npm run build

# ==============================================================================
# Stage 2: Production Python Backend & Runtime
# ==============================================================================
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (if needed for psycopg2 / network)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy backend code
COPY backend /app/backend

# Copy compiled frontend from builder stage
COPY --from=frontend-builder /frontend/dist /app/frontend/dist

# Setup persistent data folder and environment variables
ENV FRONTEND_DIST=/app/frontend/dist
ENV BOTPRESS_CONNECTOR_DB=/app/data/botpress_connector.db
RUN mkdir -p /app/data

EXPOSE 8000

CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
