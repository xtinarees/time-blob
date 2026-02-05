#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TimeBlobStack } from '../lib/time-blob-stack';

const app = new cdk.App();

new TimeBlobStack(app, 'TimeBlobStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1', // Required for CloudFront certificates
  },
  crossRegionReferences: true,
});
