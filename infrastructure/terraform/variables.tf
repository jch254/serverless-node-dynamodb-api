variable "aws_region" {
  description = "AWS region for the CodeBuild deployment project."
  type        = string
  default     = "ap-southeast-4"
}

variable "environment" {
  description = "Deployment environment label."
  type        = string
  default     = "prod"
}

variable "domain" {
  description = "Cloudflare zone name."
  type        = string
  default     = "603.nz"
}

variable "api_host" {
  description = "Public API hostname served via API Gateway custom domain."
  type        = string
  default     = "sls-api.603.nz"
}

variable "auth0_client_secret_parameter_name" {
  description = "SSM Parameter Store name containing the Auth0 client secret used by the API authorizer."
  type        = string
  default     = "/serverless-node-dynamodb-api/auth0-client-secret"
}

variable "cloudflare_api_token_parameter_name" {
  description = "SSM Parameter Store name containing the Cloudflare API token."
  type        = string
  default     = "/serverless-node-dynamodb-api/cloudflare-api-token"
}

variable "codebuild_project_name" {
  description = "Name of the CodeBuild project that deploys the Serverless API."
  type        = string
  default     = "serverless-node-dynamodb-api"
}

variable "codebuild_source_location" {
  description = "GitHub repository URL used by the CodeBuild source."
  type        = string
  default     = "https://github.com/jch254/serverless-node-dynamodb-api.git"
}

variable "codebuild_buildspec" {
  description = "Path to the CodeBuild buildspec file."
  type        = string
  default     = "buildspec.yml"
}

variable "codebuild_build_compute_type" {
  description = "CodeBuild compute type."
  type        = string
  default     = "BUILD_GENERAL1_MEDIUM"
}

variable "codebuild_build_docker_image" {
  description = "Docker image to use as the CodeBuild build environment."
  type        = string
  default     = "jch254/docker-node-terraform-aws"
}

variable "codebuild_build_docker_tag" {
  description = "Docker image tag to use as the CodeBuild build environment."
  type        = string
  default     = "22.x-docker"
}

variable "codebuild_cache_bucket" {
  description = "Optional S3 bucket/prefix for CodeBuild dependency cache."
  type        = string
  default     = "jch254-codebuild-cache/serverless-node-dynamodb-api"
}

variable "remote_state_bucket" {
  description = "S3 bucket used for Terraform remote state."
  type        = string
  default     = "jch254-terraform-remote-state"
}

variable "remote_state_key" {
  description = "S3 key used for this repo's Terraform remote state."
  type        = string
  default     = "serverless-node-dynamodb-api"
}

variable "codebuild_webhook_enabled" {
  description = "Whether CodeBuild should deploy automatically on pushes to the source branch."
  type        = bool
  default     = true
}

variable "codebuild_webhook_branch" {
  description = "Git branch that triggers CodeBuild webhook builds."
  type        = string
  default     = "master"
}

variable "build_notifier_region" {
  description = "AWS region where shared-platform deploys the build notification formatter Lambda. Defaults to aws_region."
  type        = string
  default     = null
}

variable "build_notifier_lambda_function_name" {
  description = "Name of the shared-platform build notification formatter Lambda."
  type        = string
  default     = "shared-platform-build-notification-formatter"
}
