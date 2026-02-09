#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STACK_NAME="TimeBlobStack"
REGION="us-east-1"

echo "=== Content Deployment ==="

# Build the frontend
echo "Building frontend..."
cd "$SCRIPT_DIR"
npm run build

# Get bucket name and distribution ID from CloudFormation outputs
echo "Fetching stack outputs..."
BUCKET=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" \
    --output text)

DIST_ID=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" \
    --output text)

if [ -z "$BUCKET" ] || [ "$BUCKET" == "None" ]; then
    echo "Error: Could not find S3 bucket. Run ./deploy-infra.sh first."
    exit 1
fi

# Sync dist/ to S3
echo "Uploading to s3://$BUCKET/..."
aws s3 sync "$SCRIPT_DIR/dist/" "s3://$BUCKET/" --delete --region "$REGION"

# Invalidate CloudFront cache
echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
    --distribution-id "$DIST_ID" \
    --paths "/*" \
    --output text > /dev/null

echo ""
echo "=== Content Deployment Complete ==="
echo "Website: https://blob.christinarees.com"
