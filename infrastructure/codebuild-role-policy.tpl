{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Resource": [
        "*"
      ],
      "Action": [
        "logs:*",
        "s3:*",
        "codebuild:*",
        "codepipeline:*",
        "cloudwatch:*",
        "cloudfront:*",
        "route53:*",
        "iam:*",
        "apigateway:*",
        "cloudformation:*",
        "lambda:*",
        "ssm:DescribeParameters",
        "dynamodb:*",
        "application-autoscaling:*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "kms:Decrypt"
      ],
      "Resource": ${kms_key_arns}
    },
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameters"
      ],
      "Resource": ${ssm_parameter_arns}
    }
  ]
}
