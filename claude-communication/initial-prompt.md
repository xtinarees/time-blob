I want to create a single page website that displays a 3D abstract shape based on the current time.
Shape requirements:

- The shape grows in complexity throughout the day. It uses UTC time.
- The shape is the same no matter the user's timezone.
- Every day at midnight UTC, this image resets from a complex shape to a new simple shape.
- Every day the shape will "grow" differently. There should be randomness baked in.
- The shape should be multi-colored and have a glossy appearance.
- Every day the shape should be different colors.
- The shape should be abstract and "blobby"
- The shape should look three-dimentional and should utilize the three.js library https://threejs.org/
- The shape morphs slowly vs jumping to a new frame.
- You have creative freedom to decide how the shape shoud look. Here is some inspiration:
  - https://codepen.io/alexandrebucci/pen/rNadyav
  - https://blobmixer.14islands.com/

Site requirements:

- I would like to host this site on AWS using Amazon CDK, S3 and Cloudfront, and store the code in Github. I think auto-deployments would be overkill, but some CLI deployment commands would be helpful. If you think a different solution that still uses AWS would be better, let me know.

Technical Specs:

1. State & Logic (UTC-Centric):

   Daily Seed: Generate a deterministic seed using YYYY-MM-DD (UTC). All "random" parameters for the day must derive from this seed (use a simple LCG or Mulberry32 PRNG).

   Time Mapping: Map the current UTC time (0–86,400 seconds) to a normalized t value (0.0≤t≤1.0).

   Evolution: Use t to drive geometry complexity (e.g., vertex displacement, noise frequency, or knot tubular segments). At t=0, the shape must be at its simplest "primitive" state. At t=0.99, it should be at peak complexity.

2. Visual Specification:

   Library: Three.js (latest via CDN).

   Geometry: Abstract blobby 3D form. Use TorusKnotGeometry or a custom BufferGeometry modified by Simplex noise.

   Material: High-end aesthetic (e.g., MeshPhysicalMaterial with transmission, clearcoat, or iridescent properties).

   Motion: No discrete jumps. Update vertex positions or uniform variables in the requestAnimationFrame loop based on the current t for fluid morphing.

   Transformation: Increase noise amplitude with time. This makes the shape look like it is "unraveling" or "blooming" as the day progresses.

3. Delivery Constraints:

   Fully responsive; center the canvas.

   No UI/HUD; the art is the interface.

   Optimize for performance

---

Please help me build the best one-shot prompt for you claude to build this project.
