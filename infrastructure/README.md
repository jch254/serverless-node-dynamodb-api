# Deployment/Infrastructure

This project is built, tested and deployed to AWS by CodeBuild. There are two components to deploy - the Serverless service and all supporting infrastructure which is defined with Terraform (CodeBuild, Route53, CloudFront etc.).

I've created Docker-powered build/deployment environments for [Serverless projects](https://github.com/jch254/docker-node-serverless) and [Node projects](https://github.com/jch254/docker-node-terraform-aws) to use with AWS CodeBuild and Bitbucket Pipelines.

## Serverless Service

To deploy/manage the Serverless service you will need to create an IAM user with the required permissions and set credentials for this user - see [here](https://github.com/serverless/serverless/blob/master/docs/providers/aws/guide/credentials.md) for further info. After you have done this, run the commands below to deploy the service:

**AUTH0_CLIENT_SECRET environment variable must be set before `yarn run deploy` command below.**

E.g. `AUTH0_CLIENT_SECRET=YOUR_SECRET yarn run deploy`

```
yarn install
yarn run create-domain
yarn run deploy
```

## Supporting Infrastructure/Terraform

**All commands below must be run in the /infrastructure directory.**

To deploy to AWS, you must:

1. Install [Terraform](https://www.terraform.io/) and make sure it is in your PATH.
1. Set your AWS credentials using one of the following options:
   1. Set your credentials as the environment variables `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.
   1. Run `aws configure` and fill in the details it asks for.
   1. Run on an EC2 instance with an IAM Role.
   1. Run via CodeBuild or ECS Task with an IAM Role (see [buildspec-test.yml](../buildspec-test.yml) for workaround)

#### Deploying infrastructure

1. Update and export all environment variables specified in the appropriate buildspec declaration (check all phases) and bash scripts
1. Initialise Terraform:
```
terraform init \
  -backend-config 'bucket=YOUR_S3_BUCKET' \
  -backend-config 'key=YOUR_S3_KEY' \
  -backend-config 'region=YOUR_REGION' \
  -get=true \
  -upgrade=true
```
1. `terraform plan -out main.tfplan`
1. `terraform apply main.tfplan`

#### Updating infrastructure

1. Update and export all environment variables specified in the appropriate buildspec declaration (check all phases) and bash scripts
1. Make necessary infrastructure code changes.
1. Initialise Terraform:
```
terraform init \
  -backend-config 'bucket=YOUR_S3_BUCKET' \
  -backend-config 'key=YOUR_S3_KEY' \
  -backend-config 'region=YOUR_REGION' \
  -get=true \
  -upgrade=true
```
1. `terraform plan -out main.tfplan`
1. `terraform apply main.tfplan`

#### Destroying infrastructure (use with care)

1. Update and export all environment variables specified in the appropriate buildspec declaration (check all phases) and bash scripts
1. Initialise Terraform:
```
terraform init \
  -backend-config 'bucket=YOUR_S3_BUCKET' \
  -backend-config 'key=YOUR_S3_KEY' \
  -backend-config 'region=YOUR_REGION' \
  -get=true \
  -upgrade=true
```
1. `terraform destroy`