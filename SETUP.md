# LaunchForge Setup Guide

## 1. Prerequisites
- Node.js (v18+)
- MongoDB running locally on port `27017`
- Jenkins running locally on port `8080`
- A Google Cloud Project with a Service Account `.json` key

## 2. Infrastructure Setup (Optional but recommended)
Navigate to the `terraform/` directory:
```bash
cd terraform
terraform init
terraform plan -var="project_id=YOUR_PROJECT_ID" -var="bucket_name=YOUR_BUCKET_NAME"
terraform apply -var="project_id=YOUR_PROJECT_ID" -var="bucket_name=YOUR_BUCKET_NAME"
```

## 3. Jenkins Preparation
1. Ensure Jenkins is accessible at `http://localhost:8080`.
2. Create a parameterized pipeline job named `launchforge-pipeline`.
3. Give it three string parameters: `REPO_URL`, `BRANCH`, `PROJECT_NAME`.
4. Generate an API token for your Jenkins user.

## 4. Environment Variables
In the root of the project, ensure you have a `.env` file patterned from the provided `.env`:

```env
# App
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb://localhost:27017/launchforge

# Google Cloud
GCP_PROJECT_ID=cicd-mini-project
GCS_BUCKET_NAME=cicd-mini
GOOGLE_APPLICATION_CREDENTIALS=C:\Users\Hrushikesh\Desktop\CICD\cicd-mini-project-...json

# Jenkins
JENKINS_URL=http://localhost:8080
JENKINS_USER=hrushi
JENKINS_API_TOKEN=your_token_here
JENKINS_JOB_NAME=launchforge-pipeline
```

## 5. Running the Backend
```bash
cd backend
npm install
npm run build
npm run dev
```
The API server will listen on port 5000.

## 6. Running the Frontend
```bash
cd frontend
npm install
npm run dev
```
The React development server will start, usually on port 5173. Open that in your browser!
