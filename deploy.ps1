# deployment script for project02 to Cloud Run

# 1. Login to Google Cloud
Write-Host "Logging in to Google Cloud..."
gcloud auth login

# 2. Set the project
Write-Host "Setting project to prompt-project2..."
gcloud config set project prompt-project2

# 3. Deploy to Cloud Run
# This command will build the image using Cloud Build and deploy it
Write-Host "Deploying to Cloud Run..."
gcloud run deploy project02-service --source . --region us-central1 --allow-unauthenticated --port 8080
