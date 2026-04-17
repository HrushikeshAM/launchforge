# LaunchForge - Project Documentation

## 1. What does the project do as a whole?
**LaunchForge** is a self-hostable, end-to-end CI/CD and Infrastructure-as-Code (IaC) automation platform. It acts as a bridge between your source code and your cloud environments. 

Instead of manually deploying code, configuring cloud buckets, and tracking build errors, LaunchForge provides a modern web interface where a developer can simply connect a GitHub repository and click "Deploy." Upon triggering a deployment, LaunchForge automatically spins up a Jenkins pipeline, provisions cloud infrastructure via Terraform on Google Cloud Platform, packages the build artifacts, uploads them securely to the cloud, and streams the live terminal logs directly back to the user interface.

It essentially simulates a premium SaaS GitOps product (like Vercel or Netlify) but running entirely on your local machine and your private cloud accounts.

---

## 2. The Core Algorithm / Deployment Flow

The core architecture follows an event-driven, polling-based pipeline algorithm:

1. **Project Registration**: The User creates a Project in the Frontend UI by providing a GitHub Repository URL and Branch name. This data is saved into **MongoDB**.
2. **Deployment Trigger**: The User clicks "Deploy" for a project. 
3. **Backend Orchestration**: 
   - The Node.js Backend receives the request and generates a temporary `buildNumber`.
   - It issues an authenticated REST API call to your local **Jenkins** server, passing the GitHub Repo, Branch, and Project Name as build parameters.
4. **Jenkins Pipeline Execution (The Engine)**:
   - Jenkins pulls the `launchforge-pipeline.groovy` script.
   - **Checkout Stage**: Jenkins clones the target GitHub repository.
   - **Build Stage**: Jenkins packages the application (e.g., zipping the source code or running a build command).
   - **Infrastructure Stage**: Jenkins executes **Terraform** commands (`terraform init` -> `terraform apply -auto-approve`). Terraform reads the GCP credentials and provisions a Google Cloud Storage bucket (if it doesn't already exist).
   - **Upload Stage**: Jenkins uses `gsutil` or a GCP plugin to push the zipped artifact directly into the provisioned Google Cloud Storage bucket.
5. **Real-time Streaming**: While Jenkins is executing, the Frontend UI polls the Node.js backend every 3 seconds for the raw Jenkins console output. The backend acts as a reverse-proxy, ensuring credentials aren't exposed to the client, while streaming the logs live into the UI Terminal.
6. **Final Synchronization**: Once Jenkins completes, the Backend updates the MongoDB Deployment record to `success` or `failed`. The Frontend natively detects this shift and stops polling, making the artifact available for immediate download in the "Artifacts" tab.

---

## 3. Toolchain & Integrations

LaunchForge weaves together multiple industry-standard tools to orchestrate this workflow automatically.

### **1. Frontend: React, Vite, & Tailwind CSS**
- **Role**: The user-facing dashboard.
- **Integration**: Communicates with the Node.js backend via Axios REST calls. It utilizes `framer-motion` for smooth layout transitions and `Lucide` for iconography. It polls the backend continuously to fetch live updating Deployment statuses and Jenkins logs.

### **2. Backend: Node.js, Express, & Mongoose**
- **Role**: The central nervous system and proxy.
- **Integration**: 
  - Connects to **MongoDB** (via Mongoose) to persistently store User Profiles, Projects, and Deployment histories.
  - Acts as a secure proxy to **Jenkins**. It holds the `JENKINS_API_TOKEN` and uses it to construct basic-auth headers to trigger pipelines and stream `http://localhost:8080/job/.../consoleText`.
  - Interfaces directly with **Google Cloud SDK** (`@google-cloud/storage`) to list and securely fetch artifacts bypassing Jenkins completely after the build is done.

### **3. Database: MongoDB**
- **Role**: State persistence.
- **Integration**: Runs locally via `mongodb://localhost:27017/launchforge`. Maintains relational links where one `Project` can have many `Deployments`.

### **4. CI/CD Server: Jenkins**
- **Role**: The automated task runner executing the heavy lifting.
- **Integration**: Hosted locally, connected to the backend via an API token. Jenkins requires a pre-configured Job (e.g., `launchforge-pipeline`) mapped to the `.groovy` script in this repository. Jenkins natively executes shell commands on the host machine, including Git clone, zip, and Terraform.

### **5. Infrastructure as Code: Terraform**
- **Role**: Cloud resource provisioning.
- **Integration**: Executed by Jenkins during the pipeline run. It reads variables like `TF_VAR_project_id` and uses the provided `GOOGLE_APPLICATION_CREDENTIALS` JSON keyfile to authenticate with Google Cloud. It ensures the environment state matches the `.tf` blueprints (creating buckets if missing, skipping if present).

### **6. Cloud Provider: Google Cloud Platform (GCS)**
- **Role**: Secure artifact storage and potential deployment surface.
- **Integration**: Used as the final resting place for compiled builds. Integrated via two pathways:
  - **Write**: Jenkins (`terraform` and shell commands) pushes the `.zip` artifact to GCS.
  - **Read**: The Node.js Backend uses the official `@google-cloud/storage` NPM package to securely list bucket contents and generate proxy download streams for the user.

### **7. Configuration Automation (The Setup Wizard)**
- **Role**: The "glue" to make the product user-friendly.
- **Integration**: If a user runs LaunchForge for the first time, it auto-generates a `.env` template using the Node `fs` (File System) module. The frontend detects missing API keys and forces a setup wizard, seamlessly writing user configurations directly to disk and bouncing the environment gracefully.
