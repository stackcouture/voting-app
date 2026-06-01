# voting-app
A polyglot microservices application for collecting and displaying votes in real time — used as the application workload in the [gitops-platform-engineering](https://github.com/stackcouture/gitops-platform-engineering) portfolio project.

Built on top of [Docker's Example Voting App](https://github.com/dockersamples/example-voting-app), this repo adds GitHub Actions CI workflows for building and pushing container images as part of a GitOps delivery pipeline.

---

## Table of Contents

- [Architecture](#architecture)
- [Services](#services)
- [Repository Structure](#repository-structure)
- [Prerequisites](#prerequisites)
- [Running Locally](#running-locally)
- [CI / Image Workflow](#ci--image-workflow)
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
