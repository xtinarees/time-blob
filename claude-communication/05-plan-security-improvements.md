Infrastructure Security Assessment & Improvements

Context

Security audit of the Time Blob AWS infrastructure (CDK stack). The site is a static single-page app served via S3

- CloudFront. While the baseline is decent (S3 block public access, OAC, HTTPS redirect), several hardening
  opportunities exist.

Security Findings

What's Already Good

- S3 blockPublicAccess: BLOCK_ALL
- CloudFront Origin Access Control (OAC) — no direct S3 access
- viewerProtocolPolicy: REDIRECT_TO_HTTPS
- .env in .gitignore
- ACM certificate with DNS validation

Risks to Fix
#: 1
Risk: No security response headers
Severity: Medium
Description: No CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, or Permissions-Policy. Leaves
site vulnerable to clickjacking, MIME sniffing, and makes any future XSS worse.
────────────────────────────────────────
#: 2
Risk: No S3 SSL-only policy
Severity: Medium
Description: No bucket policy requiring HTTPS for S3 API calls. Someone with bucket access could read/write over
HTTP.
────────────────────────────────────────
#: 3
Risk: No IPv6 DNS record
Severity: Low
Description: Only an A record exists. CloudFront supports IPv6, but no AAAA record means IPv6-only clients can't
reach the site.

Implementation Plan

1.  Add CloudFront security response headers

File: cdk/lib/time-blob-stack.ts

Create a ResponseHeadersPolicy with:

- Content-Security-Policy: default-src 'none'; script-src 'unsafe-inline' https://unpkg.com; style-src
  'unsafe-inline'; img-src 'self'; connect-src 'none'; font-src 'none'; object-src 'none'; frame-ancestors 'none';
  base-uri 'self'; form-action 'none'
  - 'unsafe-inline' is required because the build system inlines JS/CSS into the HTML
  - https://unpkg.com is needed for the Three.js CDN import map
  - Everything else locked down to 'none' since the app makes no network requests, loads no fonts/images/objects
- Strict-Transport-Security: max-age=63072000; includeSubDomains; preload (2 years, HSTS preload eligible)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY (prevents clickjacking)
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: Deny camera, microphone, geolocation

Attach the policy to the CloudFront distribution's defaultBehavior.

2.  Add SSL enforcement

File: cdk/lib/time-blob-stack.ts

Add to the S3 bucket:

- enforceSSL: true (adds bucket policy denying non-HTTPS requests)

3.  Add IPv6 AAAA record

File: cdk/lib/time-blob-stack.ts

Add an AaaaRecord alongside the existing ARecord, pointing to the same CloudFront distribution.
