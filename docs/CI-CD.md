## CI/CD Pipeline

### Overview

The Cloud-Native Voting Application uses **GitHub Actions** to automate the build, validation, security, and deployment lifecycle. Every code change is automatically tested, containerized, security scanned, cryptographically signed, published to Google Artifact Registry, and deployed to Kubernetes using a GitOps workflow.

The pipeline follows DevSecOps principles by integrating security checks early in the software delivery process and ensuring that only verified container images are deployed.

---
## Pipeline Workflow

```text
Developer Commit
       │
       ▼
GitHub Repository
       │
       ▼
GitHub Actions
       │
       ├── Checkout Source
       ├── Install Dependencies
       ├── Run Unit Tests
       ├── Build Docker Image
       ├── Trivy Security Scan
       ├── Generate SBOM
       ├── Push Image to Artifact Registry
       ├── Sign Image (Cosign)
       ├── Create SBOM Attestation
       └── Update GitOps Repository
               │
               ▼
            Argo CD
               │
               ▼
      Google Kubernetes Engine
```

---
## Pipeline Stages

### 1. Source Checkout

The workflow starts by checking out the latest application source code.

**Purpose**

* Retrieve the latest application code
* Prepare the build environment

---
### 2. Dependency Installation

Application dependencies are installed before testing and building.

**Examples**

* Python packages
* Node.js packages
* .NET dependencies

---
### 3. Unit Testing

Each service executes its respective unit tests before building container images.

**Purpose**

* Validate application behavior
* Detect regressions early
* Prevent broken code from progressing through the pipeline

---
### 4. Docker Image Build

Each microservice is packaged as a Docker image.

Container images are tagged using the Git commit SHA to ensure immutable and traceable deployments.

Example:

```text
vote:a1b2c3d4
result:a1b2c3d4
worker:a1b2c3d4
```

---
### 5. Vulnerability Scanning

After the image is built, **Trivy** scans it for known vulnerabilities.

#### Scan Coverage

* Operating system packages
* Application dependencies
* Critical vulnerabilities
* High severity vulnerabilities

#### Benefits

* Detects security issues early
* Prevents vulnerable images from being published
* Supports shift-left security practices

---
### 6. Software Bill of Materials (SBOM)

An **SBOM** is generated for every container image.

The SBOM contains:

* Installed packages
* Dependency versions
* Operating system packages
* Supply chain metadata

#### Benefits

* Software transparency
* Compliance support
* Dependency auditing
* Supply chain visibility

---
### 7. Publish to Google Artifact Registry

Successfully validated images are published to **Google Artifact Registry**.

Example image:

```text
asia-south1-docker.pkg.dev/<project>/<repository>/vote:<commit-sha>
```

Artifact Registry serves as the central repository for application container images.

---
### 8. Container Image Signing

Published images are cryptographically signed using **Cosign**.

The image digest is signed instead of the mutable image tag.

#### Benefits

* Verifies image authenticity
* Protects against image tampering
* Strengthens software supply chain security

---
### 9. SBOM Attestation

The generated SBOM is attached to the signed container image as a **Cosign attestation**.

This provides verifiable metadata describing the contents of the container image.

---
### 10. GitOps Repository Update

After a successful image publication, the pipeline automatically updates the GitOps repository.

Kustomize updates the application image tag to the latest immutable version.

Example:

```yaml
images:
- name: vote
  newTag: a1b2c3d4
```

The update is committed automatically, allowing Argo CD to deploy the new application version.

---
## Security Controls

| Control              | Purpose                                 |
| -------------------- | --------------------------------------- |
| Unit Tests           | Validate application functionality      |
| Trivy                | Detect known vulnerabilities            |
| SBOM                 | Generate software inventory             |
| Cosign               | Sign container images                   |
| SBOM Attestation     | Attach verifiable supply chain metadata |
| Immutable Image Tags | Ensure reproducible deployments         |

---
## CI/CD Technologies

| Component              | Technology                     |
| ---------------------- | ------------------------------ |
| CI Platform            | GitHub Actions                 |
| Container Build        | Docker                         |
| Container Registry     | Google Artifact Registry       |
| Vulnerability Scanning | Trivy                          |
| SBOM Generation        | Anchore SBOM                   |
| Image Signing          | Cosign                         |
| GitOps Deployment      | Argo CD                        |
| Manifest Management    | Kustomize                      |
| Target Platform        | Google Kubernetes Engine (GKE) |

---
## Pipeline Benefits

* Fully automated build and deployment process
* Early detection of application and container vulnerabilities
* Immutable, versioned container images
* Verifiable software supply chain
* GitOps-based deployment workflow
* Consistent and repeatable application releases

---
## Summary

The CI/CD pipeline automates the complete application delivery lifecycle. GitHub Actions validates source code, builds container images, performs security scanning, generates an SBOM, signs container images, publishes them to Google Artifact Registry, and updates the GitOps repository. Argo CD continuously synchronizes the desired state with Google Kubernetes Engine, providing a secure, automated, and repeatable deployment workflow.

---