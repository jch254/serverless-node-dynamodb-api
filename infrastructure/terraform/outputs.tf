output "api_host" {
  description = "Public API hostname served via API Gateway custom domain."
  value       = var.api_host
}

output "api_gateway_domain_name" {
  description = "API Gateway custom domain name."
  value       = aws_api_gateway_domain_name.api.domain_name
}

output "api_gateway_cloudfront_domain_name" {
  description = "CloudFront target domain used as the Cloudflare CNAME target."
  value       = aws_api_gateway_domain_name.api.cloudfront_domain_name
}

output "acm_certificate_arn" {
  description = "Validated ACM certificate ARN used by the API Gateway custom domain."
  value       = aws_acm_certificate_validation.api.certificate_arn
}

output "cloudflare_api_token_parameter_name" {
  description = "SSM parameter name for the Cloudflare API token."
  value       = module.cloudflare_api_token_parameter.name
}

output "serverless_license_key_parameter_name" {
  description = "SSM parameter name for the Serverless Framework v4 license key."
  value       = module.serverless_license_key_parameter.name
}

output "zone_id" {
  description = "Cloudflare zone ID for the configured domain."
  value       = data.cloudflare_zone.zone.id
}

output "codebuild_project_name" {
  description = "Name of the CodeBuild project that deploys the Serverless API."
  value       = module.codebuild_deploy_project.project_name
}

output "codebuild_project_arn" {
  description = "ARN of the CodeBuild project that deploys the Serverless API."
  value       = module.codebuild_deploy_project.project_arn
}

output "codebuild_role_arn" {
  description = "ARN of the IAM role used by the CodeBuild deployment project."
  value       = module.codebuild_role.role_arn
}

output "codebuild_build_notification_event_rule_arn" {
  description = "ARN of the optional CodeBuild notification EventBridge rule."
  value       = module.codebuild_deploy_project.build_notification_event_rule_arn
}
