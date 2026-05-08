#!/bin/bash -ex

echo Deploying infrastructure via Terraform...

cd infrastructure/terraform
terraform init \
  -reconfigure \
  -backend-config "bucket=${REMOTE_STATE_BUCKET}" \
  -backend-config "key=${TF_STATE_KEY:-serverless-node-dynamodb-api}" \
  -backend-config "region=${AWS_DEFAULT_REGION}" \
  -get=true

terraform plan -detailed-exitcode \
  -refresh=false \
  -out main.tfplan || TF_EXIT=$?

TF_EXIT=${TF_EXIT:-0}

if [ "$TF_EXIT" -eq 0 ]; then
  echo "No infrastructure changes - skipping apply"
elif [ "$TF_EXIT" -eq 2 ]; then
  echo "Infrastructure changes detected"
  terraform apply -auto-approve main.tfplan
else
  echo "Terraform plan failed"
  exit 1
fi

echo Finished deploying infrastructure
