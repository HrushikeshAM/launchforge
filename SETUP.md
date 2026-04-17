# LaunchForge Setup Guide

## 1. Prerequisites
- Node.js (v18+)
- MongoDB running locally on port `27017`
- Jenkins running locally on port `8080`
- A Google Cloud Project with a Service Account `.json` key

## 2. Target Repository Structure
Because LaunchForge currently utilizes a standardized deployment pipeline, any GitHub repository connected to LaunchForge must follow a **Single-Project Root Structure**.

Monorepos or highly nested architectures are not natively supported yet. Your connected GitHub repository should look like this:

```text
my-awesome-app/
├── package.json
├── package-lock.json
├── src/
│   ├── index.js
│   └── ...
├── .gitignore
└── README.md
```
The Jenkins pipeline implicitly expects the primary source code executable (like `package.json` or equivalent) to be located at the strict root of the repository.

## 3. Infrastructure Setup (Optional but recommended)
Navigate to the `terraform/` directory:
```bash
cd terraform
terraform init
terraform plan -var="project_id=YOUR_PROJECT_ID" -var="bucket_name=YOUR_BUCKET_NAME"
terraform apply -var="project_id=YOUR_PROJECT_ID" -var="bucket_name=YOUR_BUCKET_NAME"
```

## 4. Jenkins Preparation
1. Ensure Jenkins is accessible at `http://localhost:8080`.
2. Create a parameterized pipeline job named `launchforge-pipeline`.
3. Give it three string parameters: `REPO_URL`, `BRANCH`, `PROJECT_NAME`.
4. Generate an API token for your Jenkins user.

## 5. Environment Variables & First Run
You no longer need to manually copy environment variables!

**For Windows:**
Simply run the included batch script:
```bat
start.bat
```

**For macOS/Linux:**
```bash
npm run install:all
npm run dev
```

LaunchForge will natively boot up its Setup Wizard at `http://localhost:5173/`, dynamically scaffold your `.env` securely to disk, and gracefully connect your local services together!
