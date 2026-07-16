## Security

### Overview

The Cloud-Native Voting Application follows DevSecOps principles by integrating security throughout the software delivery lifecycle. Every container image is validated, scanned, signed, and published through an automated CI pipeline before deployment.

The security controls implemented in this repository help improve software supply chain integrity and reduce the risk of deploying vulnerable or tampered container images.

---
## Security Pipeline

```text
Source Code
     │
     ▼
GitHub Actions
     │
     ├── Unit Tests
     ├── Docker Image Build
     ├── Trivy Vulnerability Scan
     ├── SBOM Generation
     ├── Push to Artifact Registry
     ├── Cosign Image Signing
     └── SBOM Attestation
               │
               ▼
     Google Artifact Registry
               │
               ▼
         GitOps Deployment
```

---
## Security Controls

| Control                           | Technology               | Purpose                                                   |
| --------------------------------- | ------------------------ | --------------------------------------------------------- |
| Unit Testing                      | GitHub Actions           | Validate application functionality before building images |
| Container Image Scanning          | Trivy                    | Detect known vulnerabilities in container images          |
| Software Bill of Materials (SBOM) | Anchore SBOM             | Generate a complete inventory of image contents           |
| Container Image Signing           | Cosign                   | Verify image authenticity and integrity                   |
| Supply Chain Attestation          | Cosign                   | Attach verifiable SBOM metadata to container images       |
| Private Container Registry        | Google Artifact Registry | Securely store versioned container images                 |

---
## Container Vulnerability Scanning

The CI pipeline scans every container image using **Trivy** before it is published.

### Scan Coverage

* Operating system packages
* Application dependencies
* Known CVEs
* High and Critical severity vulnerabilities

#### Benefits

* Detect vulnerabilities before deployment
* Shift security earlier into the development lifecycle
* Improve overall application security

---
## Software Bill of Materials (SBOM)

An SBOM is generated for every container image during the build process.

The SBOM includes:

* Installed packages
* Dependency versions
* Operating system components
* Image metadata

#### Benefits

* Supply chain transparency
* Compliance support
* Dependency auditing
* Software inventory management

---
## Container Image Signing

After publishing an image, the pipeline signs the image using **Cosign**.

Images are signed using their immutable digest rather than mutable tags.

#### Benefits

* Verify image authenticity
* Detect image tampering
* Ensure trusted deployments
* Strengthen software supply chain security

---
## Supply Chain Security

To improve software supply chain integrity, the pipeline combines multiple security controls.

| Stage        | Security Control             |
| ------------ | ---------------------------- |
| Build        | Immutable image tags         |
| Scan         | Trivy vulnerability scanning |
| Inventory    | SBOM generation              |
| Publish      | Google Artifact Registry     |
| Verification | Cosign image signing         |
| Provenance   | SBOM attestation             |

Together, these controls provide greater confidence that deployed images are authentic, traceable, and have been validated during the build process.

---
## Security Best Practices

The application follows several security best practices during the CI/CD process:

* Build immutable container images using Git commit SHA tags
* Scan every image before publishing
* Generate an SBOM for every build
* Sign container images using Cosign
* Store images in a private container registry
* Automate security checks through GitHub Actions
* Maintain version-controlled deployment manifests through GitOps

---
## Security Workflow

```text
Developer Commit
        │
        ▼
GitHub Actions
        │
        ├── Unit Tests
        ├── Docker Build
        ├── Trivy Scan
        ├── SBOM Generation
        ├── Push Image
        ├── Cosign Sign
        └── SBOM Attestation
                │
                ▼
Google Artifact Registry
                │
                ▼
GitOps Repository
                │
                ▼
Argo CD Deployment
```

---
## Summary

Security is integrated into every stage of the application delivery pipeline. Automated vulnerability scanning, SBOM generation, cryptographic image signing, and supply chain attestation help ensure that only verified and traceable container images are deployed through the GitOps workflow.

---