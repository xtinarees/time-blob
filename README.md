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

Open `dist/index.html` in a browser to view the blob.

### Build Commands

```bash
npm run build        # Production build (minified, no test code)
npm run build_test   # Test build (unminified, with test controls)
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
├── template.html            # HTML shell with CSS/JS placeholders
├── build.js                 # esbuild + Babel build script
├── package.json             # Dependencies and build scripts
├── .babelrc                 # Babel config
├── dist/                    # Build output (git-ignored)
│   └── index.html           # Assembled single-file app
├── deploy.sh                # Deployment script
└── cdk/
    ├── package.json
    ├── tsconfig.json
    ├── cdk.json
    ├── bin/
    │   └── time-blob.ts
    └── lib/
        └── time-blob-stack.ts
```
