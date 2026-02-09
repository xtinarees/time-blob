#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CDK_DIR="$SCRIPT_DIR/cdk"

echo "=== Time Blob Deployment ==="

# Check if CDK is bootstrapped (first-time setup)
if [ "$1" == "--bootstrap" ]; then
    echo "Bootstrapping CDK..."
    cd "$CDK_DIR"
    npm install
    npx cdk bootstrap aws://$(aws sts get-caller-identity --query Account --output text)/us-east-1
fi

# Build the frontend
echo "Building frontend..."
cd "$SCRIPT_DIR"
npm install
npm run build

# Install CDK dependencies if needed
if [ ! -d "$CDK_DIR/node_modules" ]; then
    echo "Installing CDK dependencies..."
    cd "$CDK_DIR"
    npm install
fi

# Deploy CDK stack
echo "Deploying CDK stack..."
cd "$CDK_DIR"
npx cdk deploy --require-approval never --outputs-file outputs.json

echo ""
echo "=== Deployment Complete ==="
echo ""

# Display outputs
if [ -f outputs.json ]; then
    echo "Stack Outputs:"
    cat outputs.json | grep -E '(BucketName|DistributionId|WebsiteUrl)' | sed 's/[",]//g' | sed 's/^[ ]*/  /'
fi

echo ""
echo "Website: https://blob.christinarees.com"
