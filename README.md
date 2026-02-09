# Time Blob

A generative 3D art piece that evolves throughout the day. Built with Three.js and hosted on AWS.

## How It Works

- Each day generates a unique blob using a seeded random number generator based on the UTC date
- The blob's complexity evolves from simple (midnight) to complex (end of day)
- Colors, noise patterns, and rotation speed are uniquely generated daily
- At midnight UTC, the shape resets with new parameters

## Local Development

```bash
npm install
npm run watch        # Build with test controls + auto-rebuild on changes
```

## View Locally

`python3 -m http.server 8000`
View on http://localhost:8000/dist/

### Build Commands

```bash
npm run build        # Production build (minified, no test code)
npm run build:test   # Test build (unminified, with test controls)
npm run watch        # Test build + auto-rebuild on file changes
```

### Test Mode

The test build includes a control panel (bottom-left corner) with:

- Time slider to scrub through UTC time
- Generate New Blob button to simulate different days
- Material property sliders

Test code is completely excluded from production builds via dead code elimination.

## Deployment

### Prerequisites

- AWS CLI configured with appropriate credentials
- Node.js 18+
- An existing Route53 hosted zone for `christinarees.com`

### Environment Variables

The CDK stack requires AWS credentials and an account ID. Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable              | Description                                  |
| --------------------- | -------------------------------------------- |
| `CDK_DEFAULT_ACCOUNT` | Your 12-digit AWS account ID                 |
| `AWS_PROFILE`         | Named AWS CLI profile to use for credentials |

### First-Time Setup

```bash
# Bootstrap CDK, deploy infrastructure, build
./deploy-infra.sh --bootstrap
# Upload content
npm run deploy:content
```

### Infrastructure Only

Creates/updates AWS resources (S3 bucket, CloudFront, ACM certificate, Route53 record). Only needed when infrastructure changes.

```bash
npm run deploy:infra            # Deploy infrastructure
npm run cdk:diff                # Preview infrastructure changes
npm run cdk:destroy             # Tear down all AWS resources
```

### Content Only

Builds the frontend, syncs `dist/` to S3, and invalidates the CloudFront cache. Use this for day-to-day code changes after infrastructure is already deployed.

```bash
npm run deploy:content
```

## Infrastructure

- **S3**: Static website hosting (private, CloudFront-only access)
- **CloudFront**: CDN with HTTPS
- **ACM**: SSL certificate for blob.christinarees.com
- **Route53**: DNS A record alias

## Project Structure

```
time-img-3d/
├── src/
│   ├── main.js              # Entry point - init, animation loop
│   ├── scene.js             # Scene, camera, renderer, lighting
│   ├── blob.js              # Blob state, creation, geometry updates
│   ├── prng.js              # Seeded PRNG (Mulberry32)
│   ├── noise.js             # Simplex noise implementation
│   ├── time.js              # Time progress utilities
│   ├── test-controls.js     # Test mode UI (excluded from production)
│   ├── styles.css           # Base styles
│   └── test-controls.css    # Test panel styles (excluded from production)
├── template.html            # HTML shell (references external CSS/JS)
├── build.js                 # esbuild + Babel build script
├── package.json             # All dependencies (frontend + CDK)
├── .babelrc                 # Babel config
├── dist/                    # Build output (git-ignored)
│   ├── index.html           # HTML page
│   ├── script[.hash].js     # Bundled JavaScript (content-hashed in production)
│   └── styles[.hash].css    # Compiled CSS (content-hashed in production)
├── deploy-infra.sh          # Infrastructure only (CDK)
├── deploy-content.sh        # Content only (S3 sync + CloudFront invalidation)
└── cdk/
    ├── tsconfig.json
    ├── cdk.json
    ├── bin/
    │   └── time-blob.ts
    └── lib/
        └── time-blob-stack.ts
```
