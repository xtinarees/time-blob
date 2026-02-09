# Time Blob Project

Generative 3D art piece using Three.js that evolves throughout the day based on UTC time.

## Quick Reference

- **Local dev**: `npm run watch` (auto-rebuilds on file changes, test mode enabled)
- **Production build**: `npm run build`
- **Test build**: `npm run build_test`
- **Deploy**: `./deploy.sh` (first time: `./deploy.sh --bootstrap`)
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
template.html          # HTML shell with placeholders for CSS/JS injection
build.js               # Node build script (production/test/watch modes)
package.json           # devDependencies + build scripts
.babelrc               # Babel config (preset-env targeting modern browsers)
dist/                  # Build output (git-ignored)
  index.html           # Final assembled HTML
deploy.sh              # Deployment script
cdk/                   # AWS CDK infrastructure (TypeScript)
  lib/time-blob-stack.ts  # S3 + CloudFront + ACM + Route53
```

## Build System

The build system uses esbuild + Babel to bundle `src/main.js` into a single `dist/index.html`. Three.js is kept external (loaded via CDN import map in the HTML).

### Build Modes

- **`npm run build`** - Production: minified, no test controls code
- **`npm run build_test`** - Test: unminified, inline sourcemaps, test controls included
- **`npm run watch`** - Test mode + auto-rebuild on file changes

### Conditional Compilation

`TEST_MODE` is a bare identifier replaced at build time by esbuild's `define`. In production, `if (TEST_MODE) {...}` becomes `if (false) {...}` and is dead-code eliminated, so test-controls.js is never imported.

Test controls HTML and CSS are also stripped from the production build.

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

- Region: us-east-1 (required for CloudFront ACM certs)
- S3 bucket with OAC (no public access)
- CloudFront with HTTPS redirect
- ACM certificate with DNS validation via Route53
- Hosted zone lookup for christinarees.com

## CDK Commands

```bash
cd cdk
npm install
npx cdk deploy          # Deploy stack
npx cdk diff            # Preview changes
npx cdk destroy         # Tear down
```

## Modifying the Blob

Key parameters in `src/blob.js`:

- `baseAmplitude` / `maxAmplitude`: Noise displacement range
- `noiseScale`: Base frequency of noise
- `rotationSpeed`: Mesh rotation speed
- Geometry detail level: `IcosahedronGeometry(1, 8)` - second param is detail
- Material properties in `materialDefaults` object
