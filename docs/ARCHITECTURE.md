## Application Architecture

### Overview

The Cloud-Native Voting Application is a **polyglot microservices application** composed of independent services that communicate through an asynchronous messaging pattern. Each service is responsible for a single business capability, enabling independent development, deployment, and scaling.

The application follows an **event-driven architecture**, where user requests are decoupled from backend processing using a Redis message queue. This approach improves responsiveness, resilience, and scalability while demonstrating common cloud-native design patterns.

---

## Architecture Diagram

> Replace the image below with your latest architecture diagram.

![Application Architecture](images/architecture.png)

---

## Microservices

| Service            | Technology        | Responsibility                                                                                       |
| ------------------ | ----------------- | ---------------------------------------------------------------------------------------------------- |
| **Vote Service**   | Python (Flask)    | Provides the web interface for users to submit votes and publishes vote events to Redis.             |
| **Worker Service** | .NET              | Consumes vote events from Redis, processes them, and stores the results in Cloud SQL for PostgreSQL. |
| **Result Service** | Node.js (Express) | Retrieves processed vote counts from the database and displays real-time results to users.           |
| **Redis**          | Redis             | Acts as the message broker between frontend services and the background worker.                      |
| **Cloud SQL**      | PostgreSQL        | Provides persistent storage for processed voting data.                                               |

---

# Application Workflow

The application processes requests using an asynchronous event-driven workflow.

```text
User
 │
 ▼
Vote Service (Python)
 │
 ▼
Redis Queue
 │
 ▼
Worker Service (.NET)
 │
 ▼
Cloud SQL for PostgreSQL
 │
 ▼
Result Service (Node.js)
 │
 ▼
User
```

### Step-by-Step Flow

1. A user submits a vote through the **Vote Service**.
2. The Vote Service validates the request and publishes the vote to a **Redis** queue.
3. The **Worker Service** continuously consumes pending vote events from Redis.
4. Each vote is processed and persisted to **Cloud SQL for PostgreSQL**.
5. The **Result Service** retrieves the latest results from the database.
6. Updated vote counts are presented to users through the web interface.

---

# Communication Pattern

The application adopts an **asynchronous messaging architecture**.

| Communication              | Protocol       |
| -------------------------- | -------------- |
| Browser → Vote Service     | HTTP           |
| Vote Service → Redis       | Redis Protocol |
| Worker → Redis             | Redis Protocol |
| Worker → Cloud SQL         | PostgreSQL     |
| Result Service → Cloud SQL | PostgreSQL     |
| Browser → Result Service   | HTTP           |

Using Redis as a message broker decouples frontend request handling from backend processing, allowing each service to scale independently.

---

# Design Principles

The application is designed around modern cloud-native principles:

* **Microservices Architecture** – Independent services with clearly defined responsibilities.
* **Event-Driven Processing** – Asynchronous communication using Redis.
* **Stateless Services** – Frontend services remain stateless, enabling horizontal scaling.
* **Containerized Workloads** – All services are packaged as Docker containers.
* **Independent Deployability** – Each service can be built and deployed independently.
* **Loose Coupling** – Services communicate through well-defined interfaces and messaging.

---

# Deployment Model

The application supports multiple deployment environments.

| Environment         | Deployment Method              |
| ------------------- | ------------------------------ |
| Local Development   | Docker Compose                 |
| Kubernetes          | Kubernetes Manifests           |
| GitOps              | Argo CD                        |
| Production Platform | Google Kubernetes Engine (GKE) |

---

# Repository Structure

```text
vote/          Python Flask frontend
result/        Node.js Express frontend
worker/        .NET background worker
healthchecks/  Readiness and liveness probe scripts
seed-data/     Sample vote generator
.github/       GitHub Actions workflows
docker-compose.yml
docker-stack.yml
```

---

# Key Architectural Characteristics

* Polyglot microservices architecture
* Event-driven communication using Redis
* Asynchronous background processing
* Stateless frontend services
* Persistent relational storage with PostgreSQL
* Docker-based containerization
* Kubernetes-ready deployment
* GitOps-compatible application manifests
* Designed for scalability and independent service evolution

---