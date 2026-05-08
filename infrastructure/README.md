# Deployment/Infrastructure

This project is built and deployed to AWS by CodeBuild. Two layers:

1. **Terraform** ([`infrastructure/terraform`](./terraform)) — CodeBuild project + IAM role, ACM cert (us-east-1), API Gateway custom domain, Cloudflare DNS, and SSM placeholders for the Cloudflare API token + Serverless Framework license key.
2. **Serverless Framework** ([`serverless.yml`](../serverless.yml)) — Lambda functions, API Gateway REST API, DynamoDB tables, and the base path mapping onto the Terraform-owned custom domain.

Build images live in [docker-node-serverless](https://github.com/jch254/docker-node-serverless) and [docker-node-terraform-aws](https://github.com/jch254/docker-node-terraform-aws).

## Prerequisites (one-time, account-level)

- S3 bucket for Terraform remote state (default `jch254-terraform-remote-state` in `ap-southeast-4`)
- S3 bucket for CodeBuild dependency cache (default `jch254-codebuild-cache`)
- Cloudflare zone for the apex domain (default `603.nz`) with API token created
- Auth0 application configured as **Single Page Application** with **JWT Signature Algorithm = RS256**
  - Allowed Callback URLs, Logout URLs, and Web Origins must include the UI origin (e.g. `https://serverless-api.603.nz`)
- [shared-platform](https://github.com/jch254/shared-platform) deployed (provides the `shared-platform-build-notification-formatter` Lambda referenced for build-status notifications)

## SSM placeholders managed by Terraform

Terraform creates these `SecureString` parameters with placeholder values; populate the real values once with `aws ssm put-parameter ... --overwrite`. The modules' `lifecycle { ignore_changes = [value] }` keeps subsequent applies from clobbering them:

| Parameter | Purpose |
| --- | --- |
| `/serverless-node-dynamodb-api/cloudflare-api-token` | Cloudflare API token for the Terraform `cloudflare` provider |
| `/serverless-node-dynamodb-api/serverless-license-key` | Serverless Framework v4 license key consumed by `sls deploy` |

Auth0 secrets are no longer stored — the authorizer verifies tokens against Auth0's public JWKS (RS256), so only `AUTH0_DOMAIN` + `AUTH0_CLIENT_ID` (both public values) are needed and they are passed as plaintext env vars by the buildspec.

## Local Terraform usage

**All commands below must be run from the repository root. Terraform lives in `infrastructure/terraform`.**

1. Install [Terraform](https://www.terraform.io/) and make sure it is in your `PATH`.
1. Set AWS credentials via env vars (`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`), `aws configure`, or an attached IAM Role.
1. Export `CLOUDFLARE_API_TOKEN` (the Terraform `cloudflare` provider reads this directly).

### Deploying / updating infrastructure

```bash
cd infrastructure/terraform
terraform init \
  -backend-config 'bucket=jch254-terraform-remote-state' \
  -backend-config 'key=serverless-node-dynamodb-api' \
  -backend-config 'region=ap-southeast-4'
terraform plan -out main.tfplan
terraform apply main.tfplan
```

The repo's [`infrastructure/deploy-infrastructure.bash`](./deploy-infrastructure.bash) wraps the same flow for CodeBuild.

### Destroying (use with care)

```bash
cd infrastructure/terraform
terraform destroy
```

This will delete the API Gateway custom domain, ACM cert, Cloudflare DNS records, CodeBuild project, and IAM role. The Serverless Framework stack (Lambda, API Gateway REST API, DynamoDB) is owned separately — run `pnpm run remove` to tear that down first.

## Deploying the Serverless service

After Terraform infra is in place and SSM placeholders are populated:

- **From CodeBuild**: push to `master` (default webhook branch). The buildspec runs `terraform apply` then `serverless deploy`.
- **From local**: see the root [README](../README.md) `Packaging and deployment` section.
