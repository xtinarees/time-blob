# Time Blob Project

Generative 3D blob using Three.js that evolves throughout the day based on UTC time.

## Quick Reference

- **Local dev**: `npm run watch` (auto-rebuilds on file changes, test mode enabled)
- **Production build**: `npm run build`
- **Test build**: `npm run build:test`
- **Deploy infra only**: `./deploy-infra.sh`
- **Deploy content only**: `./deploy-content.sh`
- **Live URL**: https://blob.christinarees.com
- **Open in browser**: `dist/index.html`

## Project Structure

```
src/
  main.js              # Entry point - init, animation loop, resize
  noise.js             # SimplexNoise class
  prng.js              # mulberry32(), hashString()
  time.js              # getTimeProgress(), getTodayString(), formatTime()
  scene.js             # Scene, camera, renderer, lighting, resize handler
  blob.js              # blobState, materialDefaults, init/create/update functions
  test-controls.js     # Test mode UI (conditionally included via dynamic import)
  styles.css           # Base styles (reset, body, canvas)
  test-controls.css    # Test controls panel styles
template.html          # HTML shell (references external CSS/JS)
build.js               # Node build script (production/test/watch modes)
package.json           # All dependencies (frontend + CDK) and build/deploy scripts
.babelrc               # Babel config (preset-env targeting modern browsers)
dist/                  # Build output (git-ignored)
  index.html           # HTML page (references hashed assets in production)
  script[.hash].js     # Bundled JavaScript (content-hashed in production)
  styles[.hash].css    # Compiled CSS (content-hashed in production)
deploy-infra.sh        # Infrastructure only (CDK)
deploy-content.sh      # Content only (S3 sync + CloudFront invalidation)
cdk/                   # AWS CDK infrastructure (TypeScript)
  cdk.json             # CDK app config
  tsconfig.json        # TypeScript config for CDK code
  bin/time-blob.ts     # CDK app entry point
  lib/certificate-stack.ts # ACM certificate (us-east-1)
  lib/time-blob-stack.ts  # S3 + CloudFront + Route53 (us-east-2)
```

## Build System

The build system uses esbuild + Babel to bundle source files into `dist/` as three separate files: `index.html`, `script.js`, and `styles.css`. Three.js is kept external (loaded via CDN import map in the HTML).

### Build Modes

- **`npm run build`** - Production: minified, no test controls code, content-hashed filenames
- **`npm run build:test`** - Test: unminified, inline sourcemaps, test controls included
- **`npm run watch`** - Test mode + auto-rebuild on file changes

### Conditional Compilation

`TEST_MODE` is a bare identifier replaced at build time by esbuild's `define`. In production, `if (TEST_MODE) {...}` becomes `if (false) {...}` and is dead-code eliminated, so test-controls.js is never imported.

Test controls HTML is stripped from the production `index.html`, and test-controls.css is excluded from the production `styles.css`.

## Deployment

All dependencies (frontend and CDK) are managed in the root `package.json`.

### Infrastructure (`./deploy-infra.sh`)

Creates/updates AWS resources via CDK (S3 bucket, CloudFront, ACM certificate, Route53 record). Only needed when infrastructure changes or on first deploy.

- **`npm run cdk:diff`** - Preview pending infrastructure changes
- **`npm run cdk:destroy`** - Tear down all AWS resources

### Content (`./deploy-content.sh`)

Builds the frontend, syncs `dist/` to S3 via `aws s3 sync`, and invalidates the CloudFront cache. Use this for day-to-day code changes after infrastructure is already deployed.

### Environment Variables

See `.env.example`. Key variable: `CDK_DEFAULT_ACCOUNT` (your 12-digit AWS account ID). AWS credentials via `AWS_PROFILE`

## Technical Details

### Frontend (src/)

- Three.js loaded via import map from unpkg CDN
- Seeded PRNG (Mulberry32) from UTC date string (YYYY-MM-DD)
- Inline Simplex noise implementation (no external dependency)
- IcosahedronGeometry (detail 8) with noise-based vertex displacement
- MeshPhysicalMaterial with iridescence, clearcoat, transmission
- Time progress `t` (0.0 at midnight UTC, 1.0 at end of day) controls:
  - Noise amplitude (simple -> complex)
  - Noise frequency (subtle increase)
- Page auto-reloads at midnight UTC for new daily seed

### Infrastructure

- Two CDK stacks: `TimeBlobCertStack` (us-east-1) for ACM certificate, `TimeBlobStack` (us-east-2) for everything else
- S3 bucket with OAC (no public access) in us-east-2
- CloudFront with HTTPS redirect
- ACM certificate with DNS validation via Route53 (must be us-east-1 for CloudFront)
- Hosted zone lookup for christinarees.com
- Cross-region references enabled between stacks

## Modifying the Blob

Key parameters in `src/blob.js`:

- `baseAmplitude` / `maxAmplitude`: Noise displacement range
- `noiseScale`: Base frequency of noise
- `rotationSpeed`: Mesh rotation speed
- Geometry detail level: `IcosahedronGeometry(1, 8)` - second param is detail
- Material properties in `materialDefaults` object
