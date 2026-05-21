# -----------------------------------
# BASE IMAGE
# -----------------------------------
FROM python:3.11-slim AS base

# Python optimizations
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install curl for healthcheck
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -r -u 1001 appuser

# Working directory
WORKDIR /usr/local/app

# Install dependencies first for better caching
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# -----------------------------------
# DEVELOPMENT STAGE
# -----------------------------------
FROM base AS dev

RUN pip install watchdog

ENV FLASK_ENV=development

COPY . .

CMD ["python", "app.py"]

# -----------------------------------
# PRODUCTION STAGE
# -----------------------------------
FROM base AS final

# Copy application source
COPY . .

# Change ownership
RUN chown -R appuser:appuser /usr/local/app

# Switch to non-root user
USER appuser

# Expose application port
EXPOSE 80

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost/livez || exit 1

# Production Gunicorn startup
CMD ["gunicorn", \
     "app:app", \
     "--bind", "0.0.0.0:80", \
     "--workers", "4", \
     "--threads", "2", \
     "--timeout", "30", \
     "--graceful-timeout", "10", \
     "--keep-alive", "5", \
     "--worker-tmp-dir", "/dev/shm", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]