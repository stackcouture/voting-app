## Cloud-Native Voting Application

> **A polyglot microservices application designed to demonstrate modern Kubernetes, GitOps, CI/CD, and cloud-native deployment practices on Google Kubernetes Engine (GKE).**

<p align="center">

![Python](https://img.shields.io/badge/Python-Flask-3776AB?style=for-the-badge\&logo=python)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge\&logo=node.js)
![.NET](https://img.shields.io/badge/.NET-Worker-512BD4?style=for-the-badge\&logo=dotnet)
![Redis](https://img.shields.io/badge/Redis-Message_Broker-DC382D?style=for-the-badge\&logo=redis)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Cloud_SQL-336791?style=for-the-badge\&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Containers-2496ED?style=for-the-badge\&logo=docker)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI-2088FF?style=for-the-badge\&logo=githubactions)
![Trivy](https://img.shields.io/badge/Trivy-Security-1904DA?style=for-the-badge)
![Cosign](https://img.shields.io/badge/Cosign-Image_Signing-3D5AFE?style=for-the-badge)

</p>

---
## Project Overview

This repository contains a **polyglot cloud-native voting application** built with **Python**, **Node.js**, **.NET**, **Redis**, and **PostgreSQL**. It demonstrates a microservices-based architecture that uses asynchronous message processing, enabling services to scale and evolve independently.

The application is designed to showcase modern Kubernetes deployment patterns and serves as the workload deployed on the production-inspired platform. It is continuously integrated with **GitHub Actions**, containerized with **Docker**, secured through **Trivy** and **Cosign**, and deployed to **Google Kubernetes Engine (GKE)** using a **GitOps** workflow.

---
## Application Capabilities

| Area                     | Implementation                    |
| ------------------------ | --------------------------------- |
| Application Architecture | Polyglot Microservices            |
| Frontend                 | Python (Flask), Node.js (Express) |
| Background Processing    | .NET Worker Service               |
| Message Broker           | Redis                             |
| Database                 | Cloud SQL for PostgreSQL          |
| Containerization         | Docker                            |
| Continuous Integration   | GitHub Actions                    |
| Container Registry       | Google Artifact Registry          |
| Image Security           | Trivy, Cosign                     |
| Deployment               | Google Kubernetes Engine (GKE)    |
| GitOps                   | Argo CD                           |
| Progressive Delivery     | Argo Rollouts                     |
| Configuration Management | Kustomize                         |

---