provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = var.environment
      Project     = var.codebuild_project_name
    }
  }
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Environment = var.environment
      Project     = var.codebuild_project_name
    }
  }
}

provider "cloudflare" {}

data "aws_caller_identity" "current" {}

data "cloudflare_zone" "zone" {
  filter = {
    name = var.domain
  }
}

locals {
  codebuild_cache_bucket_parts = var.codebuild_cache_bucket == "" ? [] : split("/", var.codebuild_cache_bucket)
  codebuild_cache_bucket_name  = length(local.codebuild_cache_bucket_parts) > 0 ? local.codebuild_cache_bucket_parts[0] : ""
  codebuild_cache_bucket_prefix = length(local.codebuild_cache_bucket_parts) > 1 ? (
    join("/", slice(local.codebuild_cache_bucket_parts, 1, length(local.codebuild_cache_bucket_parts)))
  ) : ""
  codebuild_cache_object_arn = local.codebuild_cache_bucket_prefix != "" ? (
    "arn:aws:s3:::${local.codebuild_cache_bucket_name}/${local.codebuild_cache_bucket_prefix}/*"
    ) : (
    local.codebuild_cache_bucket_name != "" ? "arn:aws:s3:::${local.codebuild_cache_bucket_name}/*" : ""
  )

  remote_state_bucket_arn = "arn:aws:s3:::${var.remote_state_bucket}"
  remote_state_object_arn = "arn:aws:s3:::${var.remote_state_bucket}/${var.remote_state_key}"
  codebuild_project_arn   = "arn:aws:codebuild:${var.aws_region}:${data.aws_caller_identity.current.account_id}:project/${var.codebuild_project_name}"

  build_notifier_region              = coalesce(var.build_notifier_region, var.aws_region)
  build_notifier_lambda_function_arn = "arn:aws:lambda:${local.build_notifier_region}:${data.aws_caller_identity.current.account_id}:function:${var.build_notifier_lambda_function_name}"

  # Single-domain cert -> exactly one validation record. The module returns a
  # map keyed by an ACM-generated record name, which is unknown until apply.
  acm_validation_record = one(values(module.acm_certificate.validation_records))

  api_dns_records = {
    host = {
      content = aws_api_gateway_domain_name.api.cloudfront_domain_name
      name    = var.api_host
      proxied = false
      ttl     = 1
      type    = "CNAME"
    }
  }

  codebuild_cache_statements = local.codebuild_cache_bucket_name == "" ? [] : [
    {
      Effect = "Allow"
      Action = [
        "s3:GetBucketLocation",
        "s3:ListBucket",
      ]
      Resource = "arn:aws:s3:::${local.codebuild_cache_bucket_name}"
    },
    {
      Effect = "Allow"
      Action = [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
      ]
      Resource = local.codebuild_cache_object_arn
    },
  ]

  # Serverless Framework owns the API stack. Keep the deploy role broad enough
  # for CloudFormation/Lambda/API Gateway/DynamoDB operations.
  serverless_deploy_statements = [
    {
      Effect = "Allow"
      Action = [
        "apigateway:*",
        "application-autoscaling:*",
        "cloudformation:*",
        "cloudwatch:*",
        "dynamodb:*",
        "iam:*",
        "lambda:*",
        "s3:*",
      ]
      Resource = "*"
    }
  ]
}

module "auth0_client_secret_parameter" {
  source = "github.com/jch254/terraform-modules//ssm-parameter-placeholder?ref=1.17.0"

  name        = var.auth0_client_secret_parameter_name
  description = "Auth0 client secret used by the serverless-node-dynamodb-api authorizer"
}

module "cloudflare_api_token_parameter" {
  source = "github.com/jch254/terraform-modules//ssm-parameter-placeholder?ref=1.17.0"

  name        = var.cloudflare_api_token_parameter_name
  description = "Cloudflare API token for serverless-node-dynamodb-api Terraform"
}

module "acm_certificate" {
  source = "github.com/jch254/terraform-modules//acm-dns-validated-certificate?ref=1.17.0"

  providers = {
    aws = aws.us_east_1
  }

  domain_name = var.api_host

  tags = {
    Name = var.api_host
  }
}

resource "cloudflare_dns_record" "acm_validation" {
  zone_id = data.cloudflare_zone.zone.id
  name    = trimsuffix(local.acm_validation_record.name, ".")
  type    = local.acm_validation_record.type
  content = trimsuffix(local.acm_validation_record.value, ".")
  proxied = false
  ttl     = 1
}

resource "aws_acm_certificate_validation" "api" {
  provider = aws.us_east_1

  certificate_arn = module.acm_certificate.arn

  validation_record_fqdns = [
    trimsuffix(cloudflare_dns_record.acm_validation.name, ".")
  ]

  depends_on = [cloudflare_dns_record.acm_validation]
}

resource "aws_api_gateway_domain_name" "api" {
  domain_name     = var.api_host
  certificate_arn = aws_acm_certificate_validation.api.certificate_arn
  security_policy = "TLS_1_2"

  endpoint_configuration {
    types = ["EDGE"]
  }
}

module "dns_api_records" {
  source = "github.com/jch254/terraform-modules//cloudflare-dns-records?ref=1.17.0"

  zone_id = data.cloudflare_zone.zone.id
  records = local.api_dns_records
}

module "codebuild_role" {
  source = "github.com/jch254/terraform-modules//codebuild-terraform-role?ref=1.17.0"

  name        = var.codebuild_project_name
  environment = var.environment

  s3_bucket_arns = [local.remote_state_bucket_arn]
  s3_object_arns = [local.remote_state_object_arn]

  ssm_parameter_arns = [
    module.auth0_client_secret_parameter.arn,
    module.cloudflare_api_token_parameter.arn,
  ]

  iam_role_arns           = []
  prefix_managed_services = ["event_rule"]

  codebuild_project_arns = [local.codebuild_project_arn]

  lambda_permission_function_arns = [local.build_notifier_lambda_function_arn]

  enable_acm = true

  additional_policy_statements = concat(
    local.codebuild_cache_statements,
    local.serverless_deploy_statements,
  )
}

module "codebuild_deploy_project" {
  source = "github.com/jch254/terraform-modules//codebuild-project?ref=1.17.0"

  name                               = var.codebuild_project_name
  description                        = "Build and deploy serverless-node-dynamodb-api with Serverless Framework"
  codebuild_role_arn                 = module.codebuild_role.role_arn
  build_compute_type                 = var.codebuild_build_compute_type
  build_docker_image                 = var.codebuild_build_docker_image
  build_docker_tag                   = var.codebuild_build_docker_tag
  privileged_mode                    = false
  image_pull_credentials_type        = "CODEBUILD"
  source_type                        = "GITHUB"
  source_location                    = var.codebuild_source_location
  buildspec                          = var.codebuild_buildspec
  git_clone_depth                    = 1
  cache_bucket                       = var.codebuild_cache_bucket
  badge_enabled                      = false
  create_log_group                   = true
  webhook_enabled                    = var.codebuild_webhook_enabled
  environment                        = var.environment
  build_notifier_lambda_function_arn = local.build_notifier_lambda_function_arn
  build_notifier_app_url             = "https://${var.api_host}"
  build_notifier_github_repo_url     = trimsuffix(var.codebuild_source_location, ".git")

  webhook_filter_groups = [[
    {
      type    = "EVENT"
      pattern = "PUSH"
    },
    {
      type    = "HEAD_REF"
      pattern = "refs/heads/${var.codebuild_webhook_branch}"
    },
  ]]

  environment_variables = [
    { name = "AWS_DEFAULT_REGION", value = var.aws_region },
    { name = "REMOTE_STATE_BUCKET", value = var.remote_state_bucket },
    { name = "TF_STATE_KEY", value = var.remote_state_key },
  ]
}
