## Deployment Guide

### Overview

This document describes how the Cloud-Native Voting Application is deployed to Kubernetes using declarative manifests and a GitOps workflow.

The application consists of three microservices and supporting infrastructure components that are continuously deployed to **Google Kubernetes Engine (GKE)** through **Argo CD**.

---
## Deployment Architecture

```text
Developer
     │
     ▼
Application Repository
     │
     ▼
GitHub Actions
     │
     ├── Build Container Images
     ├── Run Unit Tests
     ├── Scan Images (Trivy)
     ├── Generate SBOM
     ├── Sign Images (Cosign)
     ▼
Google Artifact Registry
     │
     ▼
GitOps Repository
     │
     ▼
Argo CD
     │
     ▼
Google Kubernetes Engine
```

---
## Deployment Components

| Component                | Purpose                                       |
| ------------------------ | --------------------------------------------- |
| Kubernetes Manifests     | Define the desired application state          |
| Kustomize                | Environment-specific configuration management |
| GitHub Actions           | Continuous Integration pipeline               |
| Google Artifact Registry | Stores container images                       |
| Argo CD                  | GitOps continuous deployment                  |
| Google Kubernetes Engine | Runs the application workloads                |

---
## Kubernetes Resources

The application is deployed using standard Kubernetes resources.

| Resource   | Purpose                                        |
| ---------- | ---------------------------------------------- |
| Namespace  | Logical isolation                              |
| Deployment | Runs application containers                    |
| Service    | Internal service discovery                     |
| ConfigMap  | Application configuration                      |
| Secret     | Sensitive configuration                        |
| Rollout    | Progressive deployments for supported services |

---
## Application Deployment

The application consists of the following workloads:

| Component      | Kubernetes Resource |
| -------------- | ------------------- |
| Vote Service   | Argo Rollout        |
| Result Service | Argo Rollout        |
| Worker Service | Deployment          |
| Redis          | StatefulSet         |
| Cloud SQL      | Managed Service     |

---
## Deployment Workflow

### 1. Code Commit

A developer pushes changes to the application repository.

```bash
git push origin main
```

---
### 2. Continuous Integration

GitHub Actions automatically executes the CI pipeline.

Pipeline stages include:

* Source checkout
* Dependency installation
* Unit testing
* Docker image build
* Trivy vulnerability scan
* SBOM generation
* Cosign image signing
* Push image to Google Artifact Registry

---
### 3. GitOps Update

After successfully publishing the image, the CI pipeline updates the image tag in the GitOps repository using Kustomize.

Example:

```yaml
images:
- name: vote
  newTag: 7e5f2a1
```

The updated manifest is committed automatically.

---
### 4. Argo CD Synchronization

Argo CD continuously monitors the GitOps repository.

When a new commit is detected:

* Desired state is compared with the cluster
* Configuration drift is detected
* Updated manifests are applied automatically
* Application status is synchronized

---
### 5. Kubernetes Deployment

Kubernetes schedules the updated workloads.

During deployment:

* New Pods are created
* Readiness probes verify application health
* Traffic is routed to healthy Pods
* Old Pods are terminated gracefully

---
## Progressive Delivery

The application uses **Argo Rollouts** for controlled deployments.

| Service        | Strategy              |
| -------------- | --------------------- |
| Vote Service   | Canary Deployment     |
| Result Service | Blue-Green Deployment |
| Worker Service | Rolling Update        |

These deployment strategies reduce risk by validating new releases before full rollout.

---
## Configuration Management

Application manifests are managed using **Kustomize**.

Typical structure:

```text
base/
├── vote/
├── result/
├── worker/
├── redis/

overlays/
├── dev/
├── staging/
└── production/
```

This approach promotes reusable manifests while allowing environment-specific customization.

---
## Deployment Verification

After deployment, verify the application status.

Check workloads:

```bash
kubectl get pods
```

Check services:

```bash
kubectl get svc
```

Check rollouts:

```bash
kubectl get rollouts
```

Verify Argo CD synchronization:

```text
Application Status: Synced
Health Status: Healthy
```

---
## Deployment Principles

* Declarative Kubernetes manifests
* GitOps-based continuous deployment
* Immutable container images
* Environment-specific configuration with Kustomize
* Automated synchronization using Argo CD
* Progressive delivery using Argo Rollouts
* Repeatable and auditable deployments

---
## Summary

The Cloud-Native Voting Application is deployed using a fully declarative GitOps workflow. GitHub Actions builds and secures container images, publishes them to Google Artifact Registry, updates the GitOps repository, and Argo CD continuously synchronizes the desired state with Google Kubernetes Engine. This deployment model provides consistent, repeatable, and automated application releases while minimizing manual intervention.

---