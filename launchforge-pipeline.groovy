pipeline {
    agent any

    environment {
        // These are passed in by our LaunchForge backend Node.js
        // REPO_URL
        // BRANCH
        // PROJECT_NAME
        
        // Path to where we store builds locally before pushing to cloud
        ARTIFACT_DIR = "build_artifacts"
    }

    stages {
        stage('Initialize & Clean') {
            steps {
                echo "Initializing deployment for ${env.PROJECT_NAME}"
                echo "Target Repository: ${env.REPO_URL}"
                echo "Target Branch: ${env.BRANCH}"
                
                // Clean the workspace
                deleteDir()
            }
        }

        stage('Clone Repository') {
            steps {
                echo "Cloning repository..."
                
                // Uses the parameters passed by LaunchForge!
                git branch: env.BRANCH, url: env.REPO_URL
            }
        }

        stage('Provision Infrastructure (Terraform)') {
            steps {
                echo "Applying Terraform configuration..."
                // Inform Terraform where our GCP credentials exist
                withEnv(['GOOGLE_APPLICATION_CREDENTIALS=C:\\Users\\Hrushikesh\\Desktop\\CICD\\cicd-mini-project-f4aeb7cffc9a.json']) {
                    dir('terraform') {
                        bat 'terraform init'
                        bat 'terraform apply -auto-approve'
                    }
                }
            }
        }

        stage('Build Project') {
            steps {
                echo "Building project ${env.PROJECT_NAME}..."
                
                bat 'echo Simulating production bundle compilation...'
                // Sleep for 3 seconds using Jenkins native sleep
                sleep time: 3, unit: 'SECONDS'
                bat 'if not exist dist mkdir dist'
                bat 'echo Production ready code for %PROJECT_NAME% > dist\\index.html'
                
                echo "Build successful!"
            }
        }

        stage('Package Artifact') {
            steps {
                echo "Packaging artifact..."
                bat "if not exist ${ARTIFACT_DIR} mkdir ${ARTIFACT_DIR}"
                
                // Using PowerShell to zip on Windows natively since 'zip' isn't available
                powershell "Compress-Archive -Path dist\\* -DestinationPath ${env.ARTIFACT_DIR}\\${env.BUILD_NUMBER}.zip -Force"
            }
        }

        stage('Upload to GCP Storage') {
            steps {
                echo "Uploading to Google Cloud Storage..."
                // Force GCP authentication using your local Service Account keys
                bat 'gcloud auth activate-service-account --key-file="C:\\Users\\Hrushikesh\\Desktop\\CICD\\cicd-mini-project-f4aeb7cffc9a.json"'
                
                bat "gsutil cp ${env.ARTIFACT_DIR}\\${env.BUILD_NUMBER}.zip gs://cicd-mini/${env.BUILD_NUMBER}.zip"
                echo "Uploaded ${env.BUILD_NUMBER}.zip to gs://cicd-mini/ successfully."
            }
        }
    }

    post {
        success {
            echo "Deployment finished successfully! The LaunchForge UI will dynamically reflect this."
        }
        failure {
            echo "Deployment failed catastrophically."
        }
    }
}
