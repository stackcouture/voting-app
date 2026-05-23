FROM node:18-slim

ENV NODE_ENV=production
ENV PORT=8080

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    tini && \
    rm -rf /var/lib/apt/lists/*

RUN groupadd -g 10001 appgroup && \
    useradd \
      --uid 10001 \
      --gid 10001 \
      --create-home \
      --shell /usr/sbin/nologin \
      appuser

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev && \
    npm cache clean --force

COPY --chown=10001:10001 . .

RUN mkdir -p /tmp/app && \
    chown -R 10001:10001 /tmp/app /usr/src/app

USER 10001:10001

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:8080/healthz || exit 1

ENTRYPOINT ["/usr/bin/tini", "--"]

CMD ["node", "server.js"]