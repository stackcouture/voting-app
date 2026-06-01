# voting-app
A polyglot microservices application for collecting and displaying votes in real time — used as the application workload in the [gitops-platform-engineering](https://github.com/stackcouture/gitops-platform-engineering) portfolio project.

Built on top of [Docker's Example Voting App](https://github.com/dockersamples/example-voting-app), this repo adds GitHub Actions CI workflows for building and pushing container images as part of a GitOps delivery pipeline.

---

## Table of Contents

- [Architecture](#architecture)
- [Services](#services)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [End-to-End Deployment Flow](#end-to-end-deployment-flow)
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

## End-to-End Deployment Flow
This platform follows a fully automated GitOps-based deployment workflow using **GitHub Actions**, **Google Artifact Registry**, **Kustomize**, and **ArgoCD**.

---

## Table of Contents

- [High-Level Flow](#high-level-flow)
- [Detailed Deployment Workflow](#detailed-deployment-workflow)
  - [1. Developer Pushes Code](#1-developer-pushes-code)
  - [2. GitHub Actions Pipeline Starts](#2-github-actions-pipeline-starts)
  - [3. Unit Testing Stage](#3-unit-testing-stage)
  - [4. Authenticate to Google Cloud](#4-authenticate-to-google-cloud)
  - [5. Docker Image Build](#5-docker-image-build)
  - [6. Vulnerability Scanning with Trivy](#6-vulnerability-scanning-with-trivy)
  - [7. SBOM Generation](#7-sbom-generation)
  - [8. Push Image to Artifact Registry](#8-push-image-to-artifact-registry)
  - [9. Image Signing with Cosign](#9-image-signing-with-cosign)
  - [10. SBOM Attestation](#10-sbom-attestation)
  - [11. GitOps Repository Update](#11-gitops-repository-update)
  - [12. ArgoCD Detects Git Changes](#12-argocd-detects-git-changes)
  - [13. Kubernetes Deployment](#13-kubernetes-deployment)
  - [14. Deployment Completed](#14-deployment-completed)
- [Why This Architecture Matters](#why-this-architecture-matters)
- [Platform Components](#platform-components)
- [Repositories](#repositories)

---

---

## Acknowledgements

This project is based on Docker's Example Voting App:
https://github.com/dockersamples/example-voting-app

Original project licensed under Apache 2.0.

---

## License

[Apache 2.0](./LICENSE)
