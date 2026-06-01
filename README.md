# voting-app
A polyglot microservices application for collecting and displaying votes in real time — used as the application workload in the [gitops-platform-engineering](https://github.com/stackcouture/gitops-platform-engineering) portfolio project.

Built on top of [Docker's Example Voting App](https://github.com/dockersamples/example-voting-app), this repo adds GitHub Actions CI workflows for building and pushing container images as part of a GitOps delivery pipeline.

---

## Table of Contents

- [Architecture](#architecture)
- [Services](#services)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [CI / Image Workflow](#end-to-end-deployment-flow)
- [Seeding Test Data](#seeding-test-data)
- [Notes](#notes)
- [Acknowledgements](#acknowledgements)
- [License](#license)

---

## Architecture

```
                     ┌───────────────────────────────────────┐
                     │            front-tier network         │
                     │                                       │
     Browser ───────►│  vote (Python)      result (Node.js)  │◄─── Browser
     :8080           │  port 80             port 80          │     :8081
                     └────────┬────────────────┬─────────────┘
                              │                │
                     ┌────────▼────────────────▼─────────────┐
                     │             back-tier network         │
                     │                                       │
                     │  redis (alpine)     db (postgres:15)  │
                     │  in-memory queue    persistent store  │
                     │        ▲                   ▲          │
                     │        │                   │          │
                     │        └──── worker (.NET) ┘          │
                     │                                       │
                     └───────────────────────────────────────┘
```

**Data flow:**
1. A user casts a vote via the **vote** frontend → stored in **Redis**
2. The **worker** reads from Redis and writes the result into **PostgreSQL**
3. The **result** frontend reads from PostgreSQL and displays live totals

---
## Services

| Service  | Language            | Port (host) |   Description                                    |
|----------|---------------------|-------------|--------------------------------------------------|
| `vote`   | Python (Flask)      | `8080`      | Web UI for casting votes                         |
| `result` | Node.js (Express)   | `8081`      | Web UI for viewing real-time results             |
| `worker` | C# (.NET)           |  —          | Background processor: Redis → PostgreSQL         |
| `redis`  | `redis:alpine`      |  —          | In-memory message queue for incoming votes       |
| `db`     | `postgres:15-alpine`| —           | Persistent storage for processed vote results    |
| `seed`   | Shell script        | —           | One-shot service to seed the DB with sample votes|

All services communicate over two isolated Docker networks:
- **`front-tier`** — vote, result (browser-accessible)
- **`back-tier`** — vote, result, worker, redis, db (internal only)

---

## Repository Structure

```
voting-app/
├── .github/
│   └── workflows/           # GitHub Actions CI pipelines
├── .vscode/                 # Editor settings
├── healthchecks/            # Shell scripts for Redis & Postgres health probes
│   ├── redis.sh
│   └── postgres.sh
├── result/                  # Node.js result frontend
├── seed-data/               # One-shot vote seeder (Docker Compose profile)
├── vote/                    # Python/Flask vote frontend
├── worker/                  # C# worker service
├── architecture.excalidraw.png
├── docker-compose.yml       # Build-from-source compose file (local dev)
├── docker-compose.images.yml# Pre-built images compose file (quick start)
├── docker-stack.yml         # Docker Swarm stack definition
├── MAINTAINERS
└── LICENSE                  # Apache 2.0
```
---

## CI / Image Workflow

The `.github/workflows/` directory contains GitHub Actions pipelines that are triggered on push to `main`. The workflows:

1. Build a Docker image for each service (`vote`, `result`)
2. Tag the image with the commit SHA
3. Push the tagged image to a container registry (e.g. GHCR)

These images are then referenced by the [`gitops-microservices-platform`](https://github.com/stackcouture/gitops-microservices-platform) repo, where ArgoCD picks up the updated image tags and deploys them to the Kubernetes cluster.

```
Code push → GitHub Actions builds image
                      │
                      ▼
          Image pushed to registry (:<sha>)
                      │
                      ▼
     gitops-microservices-platform image tag updated
                      │
                      ▼
          ArgoCD syncs new image to cluster ✓
```

---

## Acknowledgements

This project is based on Docker's Example Voting App:
https://github.com/dockersamples/example-voting-app

Original project licensed under Apache 2.0.

---

## License

[Apache 2.0](./LICENSE)
