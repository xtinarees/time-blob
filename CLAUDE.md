# Time Blob Project

Generative 3D art piece using Three.js that evolves throughout the day based on UTC time.

## Quick Reference

- **Local test**: Open `index.html` in browser
- **Deploy**: `./deploy.sh` (first time: `./deploy.sh --bootstrap`)
- **Live URL**: https://blob.christinarees.com
- **Enable test mode**: Set `TEST_MODE: true` in `config.js`

## Project Structure

```
index.html              # Complete Three.js app (single file, no build)
config.js               # Local config (git-ignored, for test mode)
deploy.sh               # Deployment script
cdk/                    # AWS CDK infrastructure (TypeScript)
  lib/time-blob-stack.ts  # S3 + CloudFront + ACM + Route53
```

## Technical Details

### Frontend (index.html)

- Three.js loaded via import map from unpkg CDN
- Seeded PRNG (Mulberry32) from UTC date string (YYYY-MM-DD)
- Inline Simplex noise implementation (no external dependency)
- IcosahedronGeometry (detail 5) with noise-based vertex displacement
- MeshPhysicalMaterial with iridescence, clearcoat, transmission
- Time progress `t` (0.0 at midnight UTC, 1.0 at end of day) controls:
  - Noise amplitude (simple → complex)
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

## Test Mode

Test mode provides UI controls for development and debugging.

### Enabling Test Mode

1. Copy `config.example.js` to `config.js`
2. Set `TEST_MODE: true` in `config.js`
3. Refresh the page

### Test Controls

- **Time Slider**: Scrub through UTC time (0:00 to 24:00) to see blob evolution
- **Generate New Blob**: Creates a new random blob (simulates a new day)
- **Seed Display**: Shows the current seed string

Note: `config.js` is excluded from git and production deployment, so test mode is local-only.

## Modifying the Blob

Key parameters in `index.html`:

- `baseAmplitude` / `maxAmplitude`: Noise displacement range
- `noiseScale`: Base frequency of noise
- `rotationSpeed`: Mesh rotation speed
- Geometry detail level: `IcosahedronGeometry(1.5, 5)` - second param is detail
- Material properties in `MeshPhysicalMaterial` constructor
