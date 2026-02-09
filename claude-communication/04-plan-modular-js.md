Plan Prompt:
I want to refactor the @index.html file to use modular ES2025 javascript. Use babel https://babeljs.io/docs/usage to transpile the javascript to support most modern browners, and esbuild https://esbuild.github.io/ to bulid the index.html file that includes all production css and js. We still want to support the test mode, which should build the index.html file including all the control panel code. The production mode index.html shoudl NOT include all the control panel code. Create these build scripts: "build", "build_test", and "watch". Dev should run in test mode, and should update the final index.html file any time a corresponding js file is updated. Please help me create a plan for these changes.

Claude's plan:
Plan: Refactor to Modular ES Modules with esbuild + Babel Build System

Context

The entire Three.js app lives in a single index.html (~990 lines) with inline
CSS and JS. This makes it hard to maintain and means test mode code ships to
production. The goal is to split into modular ES files, add a build system
(esbuild + Babel), and produce separate production/test builds where
production excludes all test control panel code.

New Project Structure

time-img-3d/
├── src/
│ ├── main.js # Entry point - init, animation loop, resize
│ ├── noise.js # SimplexNoise class
│ ├── prng.js # mulberry32(), hashString()
│ ├── time.js # getTimeProgress(), getTodayString(),
formatTime()
│ ├── scene.js # Scene, camera, renderer, lighting, resize
handler
│ ├── blob.js # blobState, materialDefaults, init/create/update
functions
│ ├── test-controls.js # Test mode UI (conditionally included via
dynamic import)
│ ├── styles.css # Base styles (reset, body, canvas)
│ └── test-controls.css # Test controls panel styles
├── template.html # HTML shell with placeholders for CSS/JS
injection
├── build.js # Node build script (handles all 3 modes)
├── package.json # NEW - devDependencies + build scripts
├── dist/ # Build output (git-ignored)
│ └── index.html # Final assembled HTML
├── .babelrc # Babel config (preset-env targeting modern
browsers)
├── config.js # REMOVED (replaced by build-time TEST_MODE flag)
├── deploy.sh # Updated to run build before CDK deploy
├── cdk/ # Updated S3 deploy source → dist/
└── .gitignore # Updated to include dist/, node_modules/

Module Breakdown
File: src/prng.js
Contents: mulberry32(), hashString()
Imports from: (none)
────────────────────────────────────────
File: src/noise.js
Contents: SimplexNoise class
Imports from: (none)
────────────────────────────────────────
File: src/time.js
Contents: getTimeProgress(), getTodayString(), formatTime(), testTimeOverride

- setter
  Imports from: (none)
  ────────────────────────────────────────
  File: src/scene.js
  Contents: scene, camera, renderer, pmremGenerator, lighting, setupScene(),
  resize handler
  Imports from: three
  ────────────────────────────────────────
  File: src/blob.js
  Contents: blobState, materialDefaults, initializeBlobState(),
  createEnvironmentMap(), createBlob(), updateGeometry()
  Imports from: three, scene.js, prng.js, noise.js
  ────────────────────────────────────────
  File: src/test-controls.js
  Contents: setupTestControls() - all slider/button listeners,
  resetMaterialSliders()
  Imports from: blob.js, time.js
  ────────────────────────────────────────
  File: src/main.js
  Contents: Entry point: calls setup, init blob, conditionally loads test
  controls, runs animation loop
  Imports from: three, scene.js, time.js, blob.js
  Test Mode Conditional Compilation (3 layers)

1.  JS: esbuild define: { TEST_MODE: 'true'/'false' } replaces the bare
    identifier at build time. In production, if (TEST_MODE) { await
    import('./test-controls.js') } becomes if (false) {...} and is eliminated
    entirely (including the import).
2.  CSS: Build script only reads/includes test-controls.css in test builds.
3.  HTML: Template uses <!-- TEST_CONTROLS_START --> / <!-- TEST_CONTROLS_END
    --> markers. Build script strips the block in production.

Build System

build.js - Single Node script accepting mode argument:

- Bundles src/main.js with esbuild (+ Babel plugin for transpilation)
- Three.js kept external via external: ['three', 'three/addons/*'] (CDN import
  map stays in HTML)
- Reads CSS files (conditionally includes test CSS)
- Reads template.html and replaces /_ **CSS** _/ and /_ **JS** _/ placeholders
- Strips test HTML markers in production
- Writes assembled dist/index.html

Watch mode: Uses chokidar to watch src/ and template.html, re-runs full build
on changes.

package.json scripts:
"build": "node build.js production" # Minified, no test code
"build_test": "node build.js test" # Unminified, sourcemaps, test
controls included
"watch": "node build.js watch" # Test mode + auto-rebuild on file
changes

Dependencies (all devDependencies):

- esbuild, esbuild-plugin-babel, @babel/core, @babel/preset-env, chokidar

template.html Structure

 <!doctype html>
 <html lang="en">
   <head>
     <meta charset="UTF-8" />
     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
     <title>Time Blob</title>
     <style>/* __CSS__ */</style>
   </head>
   <body>
     <!-- TEST_CONTROLS_START -->
     <div id="test-controls">...</div>
     <!-- TEST_CONTROLS_END -->
     <script type="importmap">
       { "imports": { "three":
 "https://unpkg.com/three@0.160.0/build/three.module.js", ... } }
     </script>
     <script type="module">/* __JS__ */</script>
   </body>
 </html>

Deployment Updates

cdk/lib/time-blob-stack.ts (line 61): Change S3 deploy source from ../../ to
../../dist, remove the exclude list (dist/ only contains index.html).

deploy.sh: Add npm run build before the CDK deploy step.

.gitignore: Add dist/, node_modules/ (root).

Implementation Steps

1.  Create package.json and install dependencies (npm install)
2.  Create build.js with production/test/watch modes
3.  Create template.html from current index.html (keep HTML shell + import map

- placeholders)

4.  Extract CSS into src/styles.css and src/test-controls.css
5.  Extract JS modules from index.html into src/ files (prng → noise → time →
    scene → blob → test-controls → main)
6.  Create .babelrc with preset-env config
7.  Test builds: run npm run build and npm run build_test, open in browser
8.  Test watch: run npm run watch, edit a source file, verify rebuild
9.  Update deploy.sh to run build first
10. Update CDK stack to deploy from dist/
11. Update .gitignore and CLAUDE.md
12. Delete old index.html (keep index2.html as-is for reference)

Verification

- npm run build → dist/index.html exists, contains NO #test-controls
  HTML/CSS/JS, blob renders in browser
- npm run build_test → dist/index.html has test controls panel,
  slider/controls work in browser
- npm run watch → changing a src/\*.js file triggers rebuild, refreshing
  browser shows changes
- Production bundle is minified; test bundle has inline sourcemaps
