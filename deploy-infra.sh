#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CDK_DIR="$SCRIPT_DIR/cdk"

echo "=== Infrastructure Deployment ==="

# Install dependencies
cd "$SCRIPT_DIR"
npm install

# Bootstrap CDK if requested
if [ "$1" == "--bootstrap" ]; then
    echo "Bootstrapping CDK..."
    cd "$CDK_DIR"
    npx cdk bootstrap aws://$(aws sts get-caller-identity --query Account --output text)/us-east-1
fi

# Deploy CDK stack (S3, CloudFront, ACM, Route53)
echo "Deploying infrastructure..."
cd "$CDK_DIR"
npx cdk deploy --require-approval never --outputs-file outputs.json

echo ""
echo "=== Infrastructure Deployment Complete ==="
echo ""

# Display outputs
if [ -f outputs.json ]; then
    echo "Stack Outputs:"
    cat outputs.json | grep -E '(BucketName|DistributionId|WebsiteUrl)' | sed 's/[",]//g' | sed 's/^[ ]*/  /'
fi
