#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { CertificateStack } from "../lib/certificate-stack";
import { TimeBlobStack } from "../lib/time-blob-stack";

const app = new cdk.App();

const account = process.env.CDK_DEFAULT_ACCOUNT;

// ACM certificate must be in us-east-1 for CloudFront
const certStack = new CertificateStack(app, "TimeBlobCertStack", {
  env: { account, region: "us-east-1" },
  crossRegionReferences: true,
});

// Main stack in us-east-2
new TimeBlobStack(app, "TimeBlobStack", {
  env: { account, region: "us-east-2" },
  crossRegionReferences: true,
  certificate: certStack.certificate,
  hostedZone: certStack.hostedZone,
});
