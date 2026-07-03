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
- [Acknowledgements](#acknowledgements)
- [License](#license)

---

## Architecture

```
                     ┌──────────────────────────────────────────────┐
                     │              Front Tier (GKE)                │
                     │                                              │
 Browser ───────────►│  Vote (Python)        Result (Node.js)       │◄──────── Browser
                     │                                              │
                     └───────────────┬──────────────────────────────┘
                                     │
                     ┌───────────────▼──────────────────────────────┐
                     │               Back Tier (GKE)                │
                     │                                              │
                     │      Redis (Queue)                           │
                     │           ▲                                  │
                     │           │                                  │
                     │      Worker (.NET)                           │
                     └───────────┬──────────────────────────────────┘
                                 │
                                 │ Private IP / Cloud SQL Auth Proxy
                                 ▼
                   ┌─────────────────────────────────────┐
                   │      Cloud SQL for PostgreSQL       │
                   │      Managed Database (GCP)         │
                   │      Persistent Storage             │
                   └─────────────────────────────────────┘
```

**Data flow:**
1. User submits a vote through the Vote (Python) application.
2. The vote is stored in Redis.
3. The Worker (.NET) continuously reads messages from Redis.
4. The worker writes the processed vote into Cloud SQL for PostgreSQL.
5. The Result (Node.js) application reads the latest vote counts from Cloud SQL and displays them   
   to users.

---
## Services

| Service    | Language            | Port (host) |   Description                                    |
|------------|---------------------|-------------|----------------------------------------------------|
| `vote`     | Python (Flask)      | `8080`      | Web UI for casting votes                         |
| `result`   | Node.js (Express)   | `8081`      | Web UI for viewing real-time results             |
| `worker`   | C# (.NET)           |  —          | Background processor: Redis → PostgreSQL         |
| `redis`    | `redis:alpine`      |  —          | In-memory message queue for incoming votes        |
| `cloudsql` | `Google Cloud SQL for PostgreSQL`       | `5432`           | Persistent storage for processed vote results    |

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
Developer pushes code
          │
          ▼
GitHub Actions CI Pipeline Triggered
          │
          ▼
Application Build + Unit Tests
          │
          ▼
Docker Image Built
          │
          ▼
Trivy Security Scan
          │
          ▼
SBOM Generated
          │
          ▼
Cosign Signs Image
          │
          ▼
Docker Image Pushed to Artifact Registry
          │
          ▼
GitOps Repository Updated
          │
          ▼
ArgoCD Detects Git Change
          │
          ▼
Kubernetes Cluster Synced
          │
          ▼
New Application Version Deployed
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
New Image Tag
        │
        ▼
Kubernetes Deployment Updated
        │
        ▼
Pods Recreated
        │
        ▼
Traffic Shifted to New Pods
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

---

## Platform Components

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

---
## License

[Apache 2.0](./LICENSE)
