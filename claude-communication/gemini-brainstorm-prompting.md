I want to create a single page website that displays a 3D abstract shape based on the current time.
Requirements for the shape:

- The shape grows in complexity throughout the day. It uses UTC time.
- The shape is the same no matter the user's timezone.
- Every day at midnight UTC, this image resets from a complex shape to a new simple shape.
- Every day the shape will "grow" differently. There should be randomness baked in.
- The shape should be abstract.
- The shape should look three-dimentional and should utilize the three.js library https://threejs.org/
- The shape morphs slowly vs jumping to a new frame.
- You have creative freedom to decide how the shape shoud look. Here is some inspiration:
  - https://commons.wikimedia.org/wiki/Category:Blue_knots_rendered
  - https://commons.wikimedia.org/wiki/Category:Prismatoids_(red_yellow_silgol)

Site requirements:

- I would like to host this site on AWS using Amazon CDK, S3 and Cloudfront, and store the code in Github. I think auto-deployments would be overkill, but some CLI deployment commands would be helpful. If you think a different solution that still uses AWS would be better, let me know.

Please help me plan out the best approach to accomplish this and ask any questions that I did not cover in this initial high-level summary.

--

When fed into gemini
prompt: I am building a prompt for Claude Code to build a single page website/net art. Please help me refine this plan/prompt for the best results and to reduce unneeded token usage:

answer:
This is a fantastic concept for a piece of net art. Because you are using Claude Code, which is highly agentic and capable of iterative refinement, your prompt should focus on mathematical constraints and architectural clarity rather than just aesthetic descriptions.

To reduce token usage and get a "one-shot" or "two-shot" success, you need to define the seed logic and the interpolation method clearly.
Refined Prompt for Claude Code

Copy and paste this into Claude Code for a more optimized build:

Task: Build a single-page Three.js "Temporal Growth" Art Piece

Core Logic:

    The Seed: Generate a deterministic daily seed using the current UTC date (e.g., YYYY-MM-DD). This ensures the "growth pattern" is unique to each day but identical for every user globally.

    The Progression: Map the current UTC seconds-from-midnight (0 to 86,400) to a "Complexity Factor" (C).

        C=0 at 00:00:00 UTC (Simple primitive).

        C=1 at 23:59:59 UTC (Maximum complexity).

    The Geometry: Use a BufferGeometry or a ParametricGeometry. Use the daily seed to randomize displacement maps, noise functions (Simplex/Perlin), or knot dimensions.

    The Morph: Do not hard-set states. Calculate geometry attributes based on the current time in the requestAnimationFrame loop so the shape evolves fluidly.

Technical Requirements:

    Library: Three.js (latest via CDN).

    Style: Abstract, 3D, high-gloss or "glass-morphism" aesthetic. Use a StandardMaterial with a single PointLight that orbits the shape.

    Inspiration: Mathematical knots and prismatoids. Focus on organic, flowing topology.

    Constraints: No UI or buttons. The shape should be center-stage, responsive to window resizing, and utilize a dark, minimalist background.

Efficiency Goal: Write the entire logic into a single index.html file. Keep code modular but concise.
Why this works better:

    Mathematical Grounding: By mentioning "deterministic daily seeds," you prevent the AI from creating a random shape that changes every time a user refreshes the page.

    Interpolation: Using a "Complexity Factor" variable (C) gives the AI a clear target for its animation logic.

    Performance: Specifying BufferGeometry and requestAnimationFrame ensures the "morphing" isn't janky or resource-heavy.

Structural Overview
Key Suggestions for Claude Code:

    The "Reset" Moment: Ask Claude to implement a smooth transition or a "pulse" at midnight UTC so the transition from high complexity back to a simple seed isn't a jarring visual pop.

    Color Theory: Suggest that the color palette also derives from the daily seed. For example, Monday could be monochromatic blues (per your inspiration), while Tuesday shifts to ochre and gold.

Would you like me to generate the specific JavaScript function for the daily seed logic to include in your prompt?

---

Building net art with an agentic tool like Claude Code is all about setting the mathematical boundaries and state logic upfront. If you just say "make it grow," the AI might write inefficient loops or use random values that cause the shape to look different for every user (breaking your requirement for global consistency).

To reduce token usage, we need to move away from descriptive prose and toward a technical specification.
The Refined Prompt

Copy and paste this version. It is structured to give the AI a clear execution path:

Task: Single-Page Three.js Net Art - "Temporal Entropy"

1. State & Logic (UTC-Centric):

   Daily Seed: Generate a deterministic seed using YYYY-MM-DD (UTC). All "random" parameters for the day must derive from this seed (use a simple LCG or Mulberry32 PRNG).

   Time Mapping: Map the current UTC time (0–86,400 seconds) to a normalized t value (0.0≤t≤1.0).

   Evolution: Use t to drive geometry complexity (e.g., vertex displacement, noise frequency, or knot tubular segments). At t=0, the shape must be at its simplest "primitive" state. At t=0.99, it should be at peak complexity.

2. Visual Specification:

   Library: Three.js (latest via CDN).

   Geometry: Abstract 3D form inspired by "Blue Knots" and "Prismatoids." Use TorusKnotGeometry or a custom BufferGeometry modified by Simplex noise.

   Material: High-end aesthetic (e.g., MeshPhysicalMaterial with transmission, clearcoat, or iridescent properties).

   Motion: No discrete jumps. Update vertex positions or uniform variables in the requestAnimationFrame loop based on the current t for fluid morphing.

3. Delivery Constraints:

   Single index.html file containing all HTML, CSS, and JS.

   Fully responsive; center the canvas.

   No UI/HUD; the art is the interface.

   Optimize for performance (limit vertex count to maintain 60fps on mobile).

Why this is more efficient:

    Seeded Randomness: By specifying a seed based on the date, you solve the "same for every user" requirement instantly. Without this, the AI might try to save state to a database or local storage, which is unnecessary.

    Normalized Time (t): Defining t as a value between 0 and 1 gives the AI a single variable to plug into all its math functions (rotation speed, color shifts, vertex displacement).

    Specific Geometry Hints: Referencing BufferGeometry and Simplex noise prevents the AI from choosing "cheap" looking basic shapes (like a simple spinning cube).

Technical Tips for the Build

    The "Midnight Reset": To avoid a jarring visual "pop" at 00:00 UTC, I recommend telling Claude to use a sine-wave easing function for the growth. This makes the transition back to "Simple" feel like a natural contraction rather than a glitch.

    Noise-based Growth: Instead of just making the shape bigger, suggest that the noise amplitude increases with time. This makes the shape look like it is "unraveling" or "blooming" as the day progresses.

Mathematical Implementation

To ensure the growth is smooth, you can suggest the AI use a basic interpolation formula for any parameter P:
Pcurrent​=Pstart​+(Pend​−Pstart​)⋅f(t)

Where f(t) is an easing function that smooths the growth over the 24-hour period.

Would you like me to write a specific JavaScript function for the "Daily Seed" logic that you can drop into the code if Claude struggles with the PRNG?

--

some inspo:
https://codepen.io/alexandrebucci/pen/rNadyav
https://blobmixer.14islands.com/
https://codepen.io/kjrf/pen/JoPyWPw
https://codesandbox.io/p/sandbox/small-brook-yro193?file=%2Fsrc%2FApp.js
https://github.com/pmndrs/react-three-fiber
https://codepen.io/kjrf/pen/JoPyWPw
