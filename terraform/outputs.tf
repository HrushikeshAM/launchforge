output "bucket_name" {
  description = "The name of the GCS bucket for artifacts"
  value       = google_storage_bucket.artifacts.name
}

output "bucket_url" {
  description = "The URL of the GCS bucket"
  value       = google_storage_bucket.artifacts.url
}
