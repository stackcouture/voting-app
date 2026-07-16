## Development Guide

### Overview

This document describes how to set up the Cloud-Native Voting Application for local development, build the application, and run it using Docker Compose.

The application consists of multiple microservices developed with different programming languages and can be executed either from source or as containerized workloads.

---
## Prerequisites

Install the following software before getting started.

| Tool           | Recommended Version |
| -------------- | ------------------- |
| Git            | Latest              |
| Docker         | 24+                 |
| Docker Compose | v2+                 |
| Python         | 3.12+               |
| Node.js        | 20+                 |
| .NET SDK       | 8.0+                |

Verify the installation:

```bash
git --version
docker --version
docker compose version
python --version
node --version
dotnet --version
```

---
## Clone the Repository

Clone the repository and move into the project directory.

```bash
git clone https://github.com/<your-org>/voting-app.git
cd voting-app
```

---
## Repository Structure

```text
voting-app/
├── vote/
├── result/
├── worker/
├── healthchecks/
├── seed-data/
├── .github/
├── docker-compose.yml
├── docker-compose.images.yml
└── docker-stack.yml
```

---
## Running the Application

The quickest way to start the application is with Docker Compose.

```bash
docker compose up --build
```

Run in detached mode:

```bash
docker compose up -d --build
```

Stop the application:

```bash
docker compose down
```

---
## Accessing the Application

After startup, the application is available at:

| Service            | URL                   |
| ------------------ | --------------------- |
| Vote Application   | http://localhost:8080 |
| Result Application | http://localhost:8081 |

---
## Building Individual Services

### Vote Service

```bash
cd vote
docker build -t vote .
```

---
### Result Service

```bash
cd result
docker build -t result .
```

---
### Worker Service

```bash
cd worker
docker build -t worker .
```

---
## Running Individual Services

Each service can also be started independently for development.

### Python Vote Service

```bash
cd vote
pip install -r requirements.txt
python app.py
```

---
### Node.js Result Service

```bash
cd result
npm install
npm start
```

---
### .NET Worker Service

```bash
cd worker
dotnet restore
dotnet run
```

---
## Docker Images

Build all application images.

```bash
docker compose build
```

List locally built images.

```bash
docker images
```

---
## Useful Docker Commands

View running containers.

```bash
docker ps
```

View application logs.

```bash
docker compose logs
```

Follow logs.

```bash
docker compose logs -f
```

Restart services.

```bash
docker compose restart
```

Remove containers and networks.

```bash
docker compose down
```

Remove containers, networks, and volumes.

```bash
docker compose down -v
```

---
## Development Workflow

Typical development cycle:

```text
Clone Repository
        │
        ▼
Implement Changes
        │
        ▼
Run Application Locally
        │
        ▼
Execute Tests
        │
        ▼
Commit Changes
        │
        ▼
Push to GitHub
        │
        ▼
GitHub Actions Pipeline
```

---
## Troubleshooting

### Containers Fail to Start

Check logs:

```bash
docker compose logs
```

---
### Port Already in Use

Identify the process using the port.

```bash
lsof -i :8080
```

or

```bash
netstat -ano
```

---
### Rebuild Everything

```bash
docker compose down -v
docker compose build --no-cache
docker compose up
```

---
## Development Best Practices

* Keep services independent and loosely coupled.
* Test changes locally before pushing.
* Build container images after modifying application code.
* Commit small, focused changes.
* Use meaningful commit messages.
* Keep Dockerfiles and dependencies up to date.
* Validate the application before opening a pull request.

---
## Summary

The Cloud-Native Voting Application can be developed locally using Docker Compose or by running individual services from source. The repository provides a consistent development workflow that supports local testing before changes are validated through the automated GitHub Actions CI/CD pipeline.

---