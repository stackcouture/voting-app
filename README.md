
# 🚀 Project Overview

<div align="center">

![Python](https://img.shields.io/badge/Python-Flask-3776AB?style=for-the-badge&logo=python)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![.NET](https://img.shields.io/badge/.NET-Worker-512BD4?style=for-the-badge&logo=dotnet)
![Redis](https://img.shields.io/badge/Redis-Message_Broker-DC382D?style=for-the-badge&logo=redis)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Cloud_SQL-336791?style=for-the-badge&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Containers-2496ED?style=for-the-badge&logo=docker)

![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI/CD-2088FF?style=for-the-badge&logo=githubactions)

![Artifact Registry](https://img.shields.io/badge/Artifact_Registry-Container_Registry-1A73E8?style=for-the-badge)
![Trivy](https://img.shields.io/badge/Trivy-Vulnerability_Scanning-1904DA?style=for-the-badge)
![Cosign](https://img.shields.io/badge/Cosign-Image_Signing-3D5AFE?style=for-the-badge)
![Prometheus](https://img.shields.io/badge/Prometheus-Monitoring-E6522C?style=for-the-badge&logo=prometheus)
![Grafana](https://img.shields.io/badge/Grafana-Dashboards-F46800?style=for-the-badge&logo=grafana)

</div>

---
This project demonstrates a **production-inspired cloud-native microservices platform** built on **Google Cloud Platform (GCP)** and deployed to a **private Google Kubernetes Engine (GKE)** cluster. The platform showcases modern **DevOps**, **GitOps**, and **Kubernetes** practices by implementing the complete application lifecycle—from infrastructure provisioning and continuous integration to secure deployment, observability, automation, and day-to-day operations.

The platform is designed with a modular architecture, enabling each layer to evolve independently while following cloud-native design principles such as Infrastructure as Code (IaC), declarative deployments, progressive delivery, automated scaling, security, and operational visibility.

---

## Application Architecture

The solution is based on a distributed voting application composed of three independent microservices:

| Service            | Technology | Responsibility                                                                                                      |
| ------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------- |
| **Vote Service**   | Python     | Accepts user votes through a web interface and publishes them to a Redis queue.                                     |
| **Worker Service** | .NET       | Continuously consumes vote messages from Redis, processes them, and stores the results in Cloud SQL for PostgreSQL. |
| **Result Service** | Node.js    | Retrieves the latest vote counts from Cloud SQL and displays real-time results to users.                            |

The application follows an **asynchronous event-driven architecture**, where **Redis** acts as the message broker between the user-facing services and the background processing service. This design decouples request processing from database operations, improving scalability, responsiveness, and overall platform resilience.

---

## 📑 Table of Contents
- [☸️ Platform Architecture](#platform-architecture)
- [🛠 Platform Components](#platform-components)
- [🔄 Application Data Flow](#application-data-flow)
- [✨ Key Features](#key-features)
- [🎯 Solution Highlights](#solution-highlights)
- [🏛 Architecture](#architecture)
- [📦 Services](#services)
  - [Network Architecture](#network-architecture)
- [📂 Repository Structure](#repository-structure)
- [🚀 End-to-End GitOps Deployment Architecture](#-end-to-end-gitops-deployment-architecture)
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
    - [Architecture Decisions](#architecture-decisions)
    - [GitOps Benefits](#gitops-benefits)
    - [Security Benefits](#security-benefits)
    - [Operational Benefits](#operational-benefits)
    - [Deployment Principles](#deployment-principles)
    - [Platform Components](#platform-components-1)
    - [Architecture Summary](#architecture-summary)
- [🙏 Acknowledgements](#acknowledgements)
- [📄 License](#license)

---
## Platform Architecture

The entire platform runs on a **private Google Kubernetes Engine (GKE)** cluster and is managed through a **GitOps** workflow.

Application source code is continuously integrated using **GitHub Actions**, where container images are built, scanned, signed, and published to **Google Artifact Registry**. The CI pipeline automatically updates the GitOps repository, allowing **ArgoCD** to synchronize the desired state with the Kubernetes cluster.

Application deployments are managed using **Argo Rollouts**, implementing:

* **Canary Deployment** for the **Vote Service**
* **Blue-Green Deployment** for the **Result Service**
* Standard **Deployment** for the **Worker Service**

This deployment strategy enables controlled application releases while minimizing deployment risk and reducing service downtime.

---

## Platform Components

The platform integrates several cloud-native technologies to provide security, automation, scalability, and operational visibility.

| Category                         | Technologies                               |
| -------------------------------- | ------------------------------------------ |
| **Infrastructure as Code**       | Terraform                                  |
| **Container Orchestration**      | Google Kubernetes Engine (GKE)             |
| **Continuous Integration**       | GitHub Actions                             |
| **GitOps**                       | ArgoCD                                     |
| **Progressive Delivery**         | Argo Rollouts                              |
| **Container Registry**           | Google Artifact Registry                   |
| **Ingress & Traffic Management** | Gateway API, NGINX Gateway Fabric          |
| **Edge Services**                | Cloudflare (DNS, CDN, SSL/TLS, WAF)        |
| **Secrets Management**           | HashiCorp Vault, External Secrets Operator |
| **Policy Enforcement**           | Kyverno                                    |
| **Runtime Security**             | Falco                                      |
| **Observability**                | Prometheus, Grafana, Alertmanager          |
| **Event-Driven Autoscaling**     | KEDA                                       |
| **Cost Monitoring**              | Kubecost                                   |
| **Backup & Recovery**            | Velero                                     |
| **Configuration Reloading**      | Reloader                                   |
| **Database**                     | Cloud SQL for PostgreSQL (Single Instance) |
| **Message Queue**                | Redis StatefulSet                          |

---

## Application Data Flow

The application processes requests using an asynchronous message-driven workflow:

1. A user submits a vote through the **Vote Service (Python)**.
2. The Vote Service validates the request and stores the vote in the **Redis** queue.
3. The **Worker Service (.NET)** continuously monitors Redis and retrieves pending vote messages.
4. The Worker processes each vote and writes the results to **Cloud SQL for PostgreSQL**.
5. The **Result Service (Node.js)** queries Cloud SQL to retrieve the latest vote counts.
6. The processed results are presented to users through the web interface.

This architecture keeps user-facing requests lightweight while delegating background processing to dedicated worker services, allowing the platform to efficiently handle increasing workloads.

---

## Key Features

* Private Google Kubernetes Engine (GKE) cluster
* Infrastructure provisioning using Terraform
* GitOps-based continuous deployment with ArgoCD
* Automated CI pipeline with GitHub Actions
* Container vulnerability scanning using Trivy
* Software Bill of Materials (SBOM) generation
* Container image signing using Cosign
* Progressive application delivery with Argo Rollouts
* Event-driven autoscaling using KEDA
* Policy enforcement using Kyverno
* Runtime security monitoring with Falco
* Secure secrets management using HashiCorp Vault and External Secrets Operator
* Automated TLS certificate management using cert-manager
* Gateway API with NGINX Gateway Fabric
* Monitoring and alerting using Prometheus, Grafana, and Alertmanager
* Kubernetes cost visibility with Kubecost
* Backup and disaster recovery using Velero
* Automatic workload reloads using Reloader
* Python-based platform automation with Kubernetes CronJobs and Slack notifications

---

## Solution Highlights

* Modular Infrastructure as Code architecture
* Secure GitOps deployment model
* Production-inspired Kubernetes platform
* Event-driven microservices architecture
* Progressive application delivery strategies
* Built-in observability and alerting
* Integrated security across the software delivery lifecycle
* Automated operational workflows
* Cost visibility and resource optimization
* Backup and disaster recovery capabilities

This project demonstrates how modern cloud-native technologies can be combined to build a **secure, scalable, observable, and automated Kubernetes platform** that follows industry best practices and reflects real-world DevOps workflows.

---
## Architecture

The application follows a distributed microservices architecture deployed on Google Kubernetes Engine (GKE). Stateless frontend services communicate through Redis for asynchronous processing, while Cloud SQL for PostgreSQL provides managed persistent storage. The platform is designed to demonstrate production-grade deployment patterns, security controls, and GitOps workflows.

![Project Diagram](docs/images/architecture.png "Architecture")

![Data Flow](docs/images/data-flow.png "Data Flow")

---
## Services

| Service    | Language            | Port (host) |   Description                                    |
|------------|---------------------|-------------|----------------------------------------------------|
| `vote`     | Python (Flask)      | `8080`      | Web UI for casting votes                         |
| `result`   | Node.js (Express)   | `8081`      | Web UI for viewing real-time results             |
| `worker`   | C# (.NET)           |  —          | Consumes vote events from Redis and persists processed results to Cloud SQL for PostgreSQL.         |
| `redis`    | `redis:alpine`      |  —          | In-memory message queue for incoming votes        |
| `cloudsql` | `Google Cloud SQL for PostgreSQL`       | `5432`           | Managed PostgreSQL database providing highly available persistent storage for application data.    |

### Network Architecture

For local development, Docker Compose uses two isolated bridge networks:

- front-tier – Browser-facing services
- back-tier – Internal service communication

In production, Kubernetes Services provide service discovery and internal networking, while Cloud SQL is accessed through a private connection using Cloud SQL Auth Proxy or Private IP.

---

## Repository Structure

```
voting-app/
├── .github/
│   └── workflows/  # GitHub Actions CI pipelines
        ├──   result-ci.yaml
        ├──   vote-ci.yaml
        └──   worker-ci.yaml           
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

## End-to-End GitOps Deployment Architecture 
The platform implements a production-ready GitOps continuous delivery model using **GitHub Actions**, **Google Artifact Registry**, **Kustomize**, **ArgoCD**, and **Google Kubernetes Engine**. Every deployment is fully automated, security validated, cryptographically signed, and version controlled. Declarative infrastructure and continuous reconciliation eliminate configuration drift while enabling repeatable, auditable, and reliable application releases

### Table of Contents

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
#### High-Level Flow

```text
Developer Commit
       │
       ▼
GitHub Repository
       │
       ▼
GitHub Actions CI
       │
       ├── Source Validation
       ├── Unit Testing
       ├── Container Build
       ├── Vulnerability Scan (Trivy)
       ├── SBOM Generation
       ├── Container Signing (Cosign)
       ▼
Google Artifact Registry
       │
       ▼
GitOps Repository Update
       │
       ▼
ArgoCD Continuous Reconciliation
       │
       ▼
Google Kubernetes Engine (GKE)
       │
       ▼
Application Available to End Users
```

---


#### Acknowledgements

This project is based on Docker's Example Voting App:
https://github.com/dockersamples/example-voting-app

Original project licensed under Apache 2.0.

---

#### Detailed Deployment Workflow

##### 1. Developer Pushes Code

A developer pushes code changes to the application repository:

```bash
git push origin main
```

This triggers the GitHub Actions workflow automatically.

---

##### 2. GitHub Actions Pipeline Starts

The CI pipeline is triggered on:

- Push to `main`
- Pull Requests to `main`

Pipeline stages:

```text
test
   │
   ▼
build-scan-push-sign
   │
   ▼
update-gitops
```

---

##### 3. Unit Testing Stage

The pipeline first validates application quality before any image is built.

**Actions performed:**
- Checkout source code
- Install dependencies
- Run unit tests

```bash
npm ci
npm test
```

**Purpose:**
- Prevent broken code from reaching production
- Ensure application stability
- Catch regressions early

---

##### 4. Authenticate to Google Cloud

GitHub Actions authenticates to GCP using **OIDC + Workload Identity Federation**. No static service account keys are used.

```text
GitHub Actions
        │
        ▼
OIDC Token
        │
        ▼
Workload Identity Pool
        │
        ▼
GCP Service Account
        │
        ▼
Temporary Credentials
```

**Benefits:**
- Eliminates credential leakage
- Improves cloud security
- Enables least-privilege access

---

##### 5. Docker Image Build

The application image is built inside GitHub Actions, tagged with the commit SHA for full traceability:

```bash
docker build -t result:${{ github.sha }} .
```

**Example tag:**

```text
result:a1b2c3d4
```

**Benefits:**
- Immutable deployments
- Full traceability back to the source commit
- Easy rollback by referencing a prior SHA

---

##### 6. Vulnerability Scanning with Trivy

After building the image, **Trivy** scans it for vulnerabilities before it is pushed.

**Scans include:**
- Critical and high severity vulnerabilities
- OS package issues
- Dependency vulnerabilities

**Purpose:**
- Detect insecure packages early
- Shift security left in the pipeline
- Prevent vulnerable images from reaching the registry

---

##### 7. SBOM Generation

The pipeline generates a **Software Bill of Materials (SBOM)** for the image.

**SBOM contains:**
- Installed packages and versions
- Dependencies
- Supply chain metadata

**Format:** `SPDX JSON`

**Purpose:**
- Supply chain transparency
- Compliance and security auditing
- Verifiable record of what's inside the image

---

##### 8. Push Image to Artifact Registry

The scanned and verified image is pushed to **Google Artifact Registry** in `asia-south1`:

```text
asia-south1-docker.pkg.dev/<project>/vote-docker-repo/result:<sha>
```

Artifact Registry acts as the centralised, private image repository for the platform.

---

##### 9. Image Signing with Cosign

The pushed image is cryptographically signed using **Cosign**. The image digest is signed rather than the mutable tag:

```bash
cosign sign result@sha256:<digest>
```

**Purpose:**
- Verify image authenticity at deploy time
- Prevent image tampering
- Improve software supply chain security

---

##### 10. SBOM Attestation

The generated SBOM is attached to the image as a **Cosign attestation**:

```bash
cosign attest result@sha256:<digest>
```

**Benefits:**
- Verifiable, tamper-proof metadata linked to the image
- Trusted software provenance
- Supply chain verification for compliance

---

##### 11. GitOps Repository Update

After the image is pushed and signed, the CI pipeline automatically updates the **GitOps repository** using Kustomize:

```bash
kustomize edit set image result=asia-south1-docker.pkg.dev/...:<github-sha>
```

**Before:**
```yaml
newTag: old-tag
```

**After:**
```yaml
newTag: a1b2c3d4
```

This creates a Git commit in the GitOps repository:

```text
chore(result): update image to a1b2c3d4
```

---

##### 12. ArgoCD Detects Git Changes

ArgoCD continuously watches the GitOps repository. Once the image tag commit lands:

```text
GitOps Repository Updated
            │
            ▼
ArgoCD Detects Drift
            │
            ▼
Sync Operation Starts
```

ArgoCD reconciles the live Kubernetes cluster state with the desired state in Git.

---

##### 13. Kubernetes Deployment

ArgoCD applies the updated manifests to the GKE cluster:

```text
Deployment Updated
       │
       ▼
Rolling Update Initiated
       │
       ▼
New ReplicaSet Created
       │
       ▼
Old Pods Terminated Gracefully
       │
       ▼
Traffic Routed to Healthy Pods
```

Kubernetes pulls the new image directly from Artifact Registry using the node service account credentials.

---

##### 14. Deployment Completed

The new application version is now live inside the cluster. End-to-end summary:

```text
Code Push  ──►  GitHub Actions  ──►  Docker Build
                                          │
                                          ▼
                                    Security Scan
                                          │
                                          ▼
                                   SBOM Generation
                                          │
                                          ▼
                                    Image Signing
                                          │
                                          ▼
                                  Artifact Registry
                                          │
                                          ▼
                                   GitOps Update
                                          │
                                          ▼
                                    ArgoCD Sync
                                          │
                                          ▼
                               Kubernetes Deployment ✓
```
## Why This Architecture Matters

### Architecture Decisions

| Decision                 | Rationale |
|--------------------------|-----------|
| GitHub Actions           | Native GitHub integration with scalable CI automation |
| ArgoCD                   | GitOps continuous reconciliation for Kubernetes |
| Google Artifact Registry | Secure private container registry integrated with IAM |
| Kustomize                | Native Kubernetes manifest customization |
| Terraform                | Declarative Infrastructure as Code provisioning |
| Cloud SQL                | Managed PostgreSQL with automated backups and high availability |
| Redis                    | High-performance in-memory message queue |
| Trivy                    | Container vulnerability scanning |
| Cosign                   | Container signing and provenance verification |

### GitOps Benefits

| Benefit                           | Description                                            |
|-----------------------------------|--------------------------------------------------------|
| Declarative deployments           | Desired state is always defined in Git                 |
| Version-controlled infrastructure | Every change has a commit, author, and timestamp       |
| Easy rollback                     | Revert a Git commit to roll back a deployment          |
| Auditable changes                 | Full history of what changed, when, and why            |
| Reduced configuration drift       | ArgoCD continuously reconciles actual vs desired state |

### Security Benefits

| Benefit                     | Description                                                   |
|-----------------------------|---------------------------------------------------------------|
| No static cloud credentials | OIDC + Workload Identity Federation only                      |
| Signed container images     | Cosign signatures prevent tampered images from running        |
| SBOM attestations           | Verifiable supply chain metadata attached to every image      |
| Vulnerability scanning      | Trivy blocks vulnerable images before they reach the registry |
| Immutable image tags        | SHA-based tags prevent silent image replacement               |

### Operational Benefits

| Benefit                      | Description                                                 |
|------------------------------|-------------------------------------------------------------|
| Fully automated deployments  | Zero manual steps from code push to live deployment         |
| Reproducible infrastructure  | Terraform + GitOps ensures environments are consistent      |
| Safer production releases    | Security gates (scan, sign, attest) run on every change     |
| Faster delivery pipeline     | Automation removes manual review and deployment bottlenecks |
| Reduced manual intervention  | ArgoCD self-heals drift without operator input              |

### Deployment Principles

| Principle                      | Implementation                                            |
|--------------------------------|-----------------------------------------------------------|
| GitOps                         | ArgoCD continuously reconciles Kubernetes state from      |  Git |
| Immutable Artifacts            | Every container image is tagged with the Git commit SHA.  |
| Zero Trust Authentication      | GitHub Actions authenticates to Google Cloud using OIDC Workload Identity Federation.     |
| Supply Chain Security          | Trivy, SBOM generation, Cosign signing, and attestation secure the software supply chain. |
| Infrastructure as Code         | Terraform provisions all cloud infrastructure.            |
| Declarative Configuration      | Kubernetes manifests are managed with Kustomize.          |


### Platform Components

| Component                 | Responsibility                                               |
|---------------------------|--------------------------------------------------------------|
| **GitHub Actions**        | CI/CD automation — build, test, scan, sign, push             |
| **Artifact Registry**     | Centralised private container image storage                  |
| **Trivy**                 | Vulnerability scanning of container images                   |
| **Cosign**                | Cryptographic image signing and SBOM attestation             |
| **Kustomize**             | Kubernetes manifest customisation and image tag updates      |
| **GitOps Repository**     | Single source of truth for desired cluster state             |
| **ArgoCD**                | Continuous Kubernetes reconciliation                         |
| **GKE**                   | Container orchestration platform                             |
| **Terraform**             | Infrastructure provisioning (GKE, IAM, networking, registry) |
| **Cloud SQL**             | Managed PostgreSQL database                                  |
| **Redis**                 | Cache queue                                                  |
| **GitHub**                | Source code management                                       |


### Architecture Summary

This platform demonstrates a production-grade GitOps architecture on Google Cloud Platform. Infrastructure is provisioned using Terraform, applications are continuously integrated through GitHub Actions, secured with Trivy and Cosign, stored in Artifact Registry, and deployed to Google Kubernetes Engine via ArgoCD. Declarative configuration, immutable container images, automated reconciliation, and supply chain security collectively provide a scalable, repeatable, and secure deployment platform.

---
## License

[Apache 2.0](./LICENSE)
