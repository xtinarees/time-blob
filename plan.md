Time-Based 3D Blob Art - Implementation Plan

Overview

Single-page Three.js art piece displaying a blobby 3D shape that evolves
throughout the day based on UTC time, hosted on AWS via CDK.

---

Project Structure

time-img-3d/
├── index.html # Complete Three.js application (HTML + CSS + JS)
├── cdk/
│ ├── package.json
│ ├── tsconfig.json
│ ├── cdk.json
│ └── lib/
│ └── time-blob-stack.ts # S3 + CloudFront stack
├── deploy.sh # CLI deployment script
└── README.md # Setup and deployment instructions

---

1.  Frontend Implementation (index.html)

Core Architecture

A. Seeded PRNG (Mulberry32)
function mulberry32(seed) {
return function() {
let t = seed += 0x6D2B79F5;
t = Math.imul(t ^ t >>> 15, t | 1);
t ^= t + Math.imul(t ^ t >>> 7, t | 61);
return ((t ^ t >>> 14) >>> 0) / 4294967296;
}
}
// Seed from YYYY-MM-DD UTC date string
const today = new Date().toISOString().slice(0, 10);
const seed = hashString(today);
const random = mulberry32(seed);

B. Time Normalization
function getTimeProgress() {
const now = new Date();
const secondsSinceMidnight =
now.getUTCHours() _ 3600 +
now.getUTCMinutes() _ 60 +
now.getUTCSeconds() +
now.getUTCMilliseconds() / 1000;
return secondsSinceMidnight / 86400; // 0.0 to 1.0
}

C. Geometry: IcosahedronGeometry + Simplex Noise

- Start with high-detail IcosahedronGeometry (detail level 4-5)
- Apply 3D Simplex noise to vertex positions
- Noise amplitude scales with time t: amplitude = baseAmp + (maxAmp - baseAmp)

* t

- Multiple noise octaves for organic look
- Store original positions to calculate displacement each frame

D. Material: MeshPhysicalMaterial
const material = new THREE.MeshPhysicalMaterial({
color: dailyBaseColor, // Derived from seed
metalness: 0.1,
roughness: 0.2,
clearcoat: 1.0,
clearcoatRoughness: 0.1,
iridescence: 1.0,
iridescenceIOR: 1.5,
transmission: 0.3, // Glass-like
thickness: 1.5,
envMapIntensity: 1.0
});

E. Daily Color Palette

- Generate HSL colors from seeded random
- Primary hue: random() \* 360
- Secondary hues offset by golden ratio (137.5°)
- Use vertex colors or gradient based on position

F. Animation Loop
function animate() {
requestAnimationFrame(animate);

const t = getTimeProgress();
updateGeometry(t); // Recalculate vertex positions
mesh.rotation.y += 0.002; // Gentle rotation
mesh.rotation.x += 0.001;

renderer.render(scene, camera);
}

G. Complexity Evolution

- t = 0: Low noise amplitude, smooth sphere-like blob
- t = 0.5: Medium noise, visible organic deformation
- t = 1: High noise amplitude, complex "blooming" form
- Noise frequency also increases slightly with t

H. Midnight Transition

- No special handling needed - at midnight, new seed generates new shape
- Shape naturally returns to simple state (t=0) with new colors/pattern

Scene Setup

- Dark background (#0a0a0a or similar)
- Environment map for reflections (use Three.js PMREMGenerator with simple
  gradient)
- Soft ambient light + directional light
- OrbitControls disabled (art-only, no interaction)
- Responsive canvas with window resize handler

---

2.  AWS CDK Infrastructure (TypeScript)

Stack Components

S3 Bucket

- Static website hosting
- Block public access (CloudFront only)
- Origin Access Control (OAC) for CloudFront

ACM Certificate

- SSL certificate for blob.christinarees.com
- Must be in us-east-1 (required for CloudFront)
- DNS validation via Route53
- Note: CDK stack should deploy to us-east-1, or use cross-region certificate

CloudFront Distribution

- S3 origin with OAC
- HTTPS redirect
- Custom domain: blob.christinarees.com
- ACM certificate attached

Route53 Record

- A record alias pointing to CloudFront distribution

CDK Stack (lib/time-blob-stack.ts)

// Look up existing hosted zone
const hostedZone = route53.HostedZone.fromLookup(this, 'Zone', {
domainName: 'christinarees.com',
});

// ACM certificate (must be us-east-1 for CloudFront)
const certificate = new acm.Certificate(this, 'Certificate', {
domainName: 'blob.christinarees.com',
validation: acm.CertificateValidation.fromDns(hostedZone),
});

// S3 bucket
const bucket = new s3.Bucket(this, 'TimeBlobBucket', {
removalPolicy: RemovalPolicy.DESTROY,
autoDeleteObjects: true,
});

// CloudFront distribution with custom domain
const distribution = new cloudfront.Distribution(this, 'Distribution', {
defaultBehavior: {
origin: new origins.S3Origin(bucket),
viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
},
defaultRootObject: 'index.html',
domainNames: ['blob.christinarees.com'],
certificate,
});

// Route53 A record
new route53.ARecord(this, 'AliasRecord', {
zone: hostedZone,
recordName: 'blob',
target: route53.RecordTarget.fromAlias(
new targets.CloudFrontTarget(distribution)
),
});

---

3.  Deployment Workflow

deploy.sh Script

#!/bin/bash

# 1. Deploy CDK stack (first time or updates)

cd cdk && npm run cdk deploy

# 2. Sync index.html to S3

aws s3 cp ../index.html s3://BUCKET_NAME/

# 3. Invalidate CloudFront cache

aws cloudfront create-invalidation --distribution-id DIST_ID --paths "/\*"

NPM Scripts (in cdk/package.json)

- npm run deploy - Full deploy (CDK + sync + invalidate)
- npm run sync - Just sync files to S3
- npm run invalidate - Just invalidate cache

---

4.  Implementation Order

1.  index.html - Complete Three.js application

- Scene, camera, renderer setup
- Seeded PRNG and time functions
- Geometry with noise displacement
- MeshPhysicalMaterial with daily colors
- Animation loop
- Responsive handling

2.  CDK Stack - Infrastructure as code

- S3 bucket
- CloudFront distribution
- Output bucket name and distribution ID

3.  deploy.sh - Deployment automation

- CDK deploy
- S3 sync
- Cache invalidation

---

5.  Verification

- Open index.html locally in browser
- Verify shape renders and animates smoothly
- Test at different times (mock time if needed)
- Check console for errors
- Test window resize
- Deploy to AWS and verify CloudFront URL works

---

Dependencies

Frontend (CDN)

- Three.js (latest via unpkg or cdnjs)
- SimplexNoise library (or inline implementation)

CDK

- aws-cdk-lib
- constructs
- typescript
