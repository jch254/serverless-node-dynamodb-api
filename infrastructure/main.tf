terraform {
  backend "s3" {
    bucket = "603-terraform-remote-state"
    key = "serverless-node-dynamodb-api.tfstate"
    region = "ap-southeast-2"
    encrypt= "true"
  }
}

provider "aws" {
  region = "${var.region}"
  version = "~> 0.1"
}

resource "aws_api_gateway_domain_name" "domain" {
  domain_name = "${var.dns_name}"
  certificate_arn = "${var.acm_arn}"
}

resource "aws_route53_record" "domain" {
  zone_id = "${var.route_53_zone_id}"
  name = "${aws_api_gateway_domain_name.domain.domain_name}"
  type = "A"

  alias {
    name = "${aws_api_gateway_domain_name.example.cloudfront_domain_name}"
    zone_id = "${aws_api_gateway_domain_name.example.cloudfront_zone_id}"
    evaluate_target_health = false
  }
}
