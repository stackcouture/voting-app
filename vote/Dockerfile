FROM python:3.11-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /build

RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir --upgrade pip

COPY requirements.txt .
RUN pip install \
    --no-cache-dir \
    --prefix=/install \
    -r requirements.txt

FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN groupadd -g 10001 appgroup && \
    useradd \
    --uid 10001 \
    --gid 10001 \
    --create-home \
    --shell /usr/sbin/nologin \
    appuser

WORKDIR /app
COPY --from=builder /install /usr/local
COPY --chown=10001:10001 . .

RUN mkdir -p /tmp/gunicorn && \
    chown -R 10001:10001 /tmp/gunicorn /app

USER 10001:10001

# Expose the port 8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8080/livez')"

LABEL org.opencontainers.image.title="vote-app"
LABEL org.opencontainers.image.description="Production-grade voting application"
LABEL org.opencontainers.image.version="1.0.0"

CMD ["gunicorn", \
     "app:app", \
     "--bind", "0.0.0.0:8080", \
     "--workers", "4", \
     "--threads", "2", \
     "--timeout", "30", \
     "--graceful-timeout", "10", \
     "--keep-alive", "5", \
     "--worker-tmp-dir", "/dev/shm", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]