# Time Blob

A generative 3D art piece that evolves throughout the day. Built with Three.js and hosted on AWS.

## How It Works

- Each day generates a unique blob using a seeded random number generator based on the UTC date
- The blob's complexity evolves from simple (midnight) to complex (end of day)
- Colors, noise patterns, and rotation speed are uniquely generated daily
- At midnight UTC, the shape resets with new parameters

## Local Development

Open `index.html` directly in a browser to view the blob locally.

### Test Mode

To enable test controls (time slider + blob regeneration):

1. Set `TEST_MODE: true` in `config.js`
1. Refresh the page

Test controls appear in the bottom-left corner when enabled.

## Deployment

### Prerequisites

- AWS CLI configured with appropriate credentials
- Node.js 18+
- An existing Route53 hosted zone for `christinarees.com`

### First-Time Setup

```bash
# Bootstrap CDK and deploy
./deploy.sh --bootstrap
```

### Subsequent Deployments

```bash
./deploy.sh
```

### Manual CDK Commands

```bash
cd cdk
npm install
npx cdk deploy
```

## Infrastructure

- **S3**: Static website hosting (private, CloudFront-only access)
- **CloudFront**: CDN with HTTPS
- **ACM**: SSL certificate for blob.christinarees.com
- **Route53**: DNS A record alias

## Project Structure

```
time-img-3d/
├── index.html          # Three.js application
├── config.js           # Local config (git-ignored)
├── config.example.js   # Config template
├── deploy.sh           # Deployment script
├── README.md
└── cdk/
    ├── package.json
    ├── tsconfig.json
    ├── cdk.json
    ├── bin/
    │   └── time-blob.ts
    └── lib/
        └── time-blob-stack.ts
```
