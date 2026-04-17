variable "project_id" {
  description = "The GCP Project ID"
  type        = string
}

variable "region" {
  description = "The GCP Region"
  type        = string
  default     = "asia-south1"
}

variable "bucket_name" {
  description = "The name of the Google Cloud Storage bucket for artifacts"
  type        = string
}
