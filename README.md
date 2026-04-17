# LaunchForge 🚀

**LaunchForge** is a premium, modern CI/CD deployment platform built to streamline the integration of GitHub repositories, Jenkins automation, and Google Cloud Storage artifacts.

### 🌟 Features

- **Pristine SaaS UX:** Built with React, Tailwind CSS v4, shadcn-inspired components, and Framer Motion.
- **Project Discovery:** Read-only dashboard cleanly listing GitHub repositories.
- **Jenkins Orchestration:** Remotely trigger authentic Jenkins pipelines. The pipeline natively clones, tests, and builds your React assets directly on the worker node.
- **Log Streaming:** View raw execution logs perfectly streamed into the LaunchForge terminal interface in real-time.
- **Artifact Center:** Securely intercept and download cleanly compiled ZIP archives dynamically uploaded by the Jenkins pipeline.
- **Infrastructure as Code (IaC):** Pipeline organically verifies and provisions your Google Cloud Storage buckets securely with Terraform before deploying.

### 🛠 Tech Stack

- **Frontend:** React + Vite + TypeScript, Recharts, Framer Motion
- **Backend:** Node.js + Express + TypeScript
- **Database:** MongoDB
- **Cloud/Infra:** Terraform, Google Cloud Storage (GCS)
- **CI/CD:** Jenkins REST APIs

### 🚀 Setup Instructions

Please see [SETUP.md](./SETUP.md) for detailed deployment and local hosting instructions.
