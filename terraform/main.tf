terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_storage_bucket" "artifacts" {
  name          = var.bucket_name
  location      = var.region
  force_destroy = true

  uniform_bucket_level_access = true

  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

# Added public read access for simplicity in the artifacts display (optional but handy)
resource "google_storage_bucket_iam_binding" "public_read" {
  bucket = google_storage_bucket.artifacts.name
  role   = "roles/storage.objectViewer"
  members = [
    "allUsers",
  ]
}
