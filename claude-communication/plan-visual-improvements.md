Time Blob Visual Improvements Plan

Overview

Modify the Time Blob to have a smoother, more colorful appearance with pastel
colors and a complementary pastel background that changes daily.

---

Changes Summary
Change: Surface
Current: Spikey, flat triangular faces
Target: Smooth, organic appearance
────────────────────────────────────────
Change: Colors
Current: Single solid color
Target: 2+ colors blending in gradient
────────────────────────────────────────
Change: Palette
Current: Saturated HSL (70% sat, 50% light)
Target: Pastel (40-50% sat, 70-80% light)
────────────────────────────────────────
Change: Background
Current: Black (#0a0a0a)
Target: Daily pastel complementary color

---

File to Modify

index.html - All changes are in this single file

---

1.  Smooth Surface Appearance

Problem: IcosahedronGeometry has flat triangular faces. Radial vertex
displacement creates sharp discontinuities between faces.

Solution: Recompute smooth vertex normals after displacement.

Location: updateGeometry() function (around line 445)

// After the vertex displacement loop ends, add:
geometry.computeVertexNormals();

This recalculates normals based on adjacent face orientations, creating smooth
Phong shading instead of flat-shaded triangles.

---

2.  Pastel Color Palette for Blob

Problem: Current colors use high saturation (70-80%) and medium lightness
(50-60%).

Solution: Adjust HSL values for pastel appearance.

Location: initializeBlobState() function (around lines 312-313)

Current:
baseColor: new THREE.Color().setHSL(primaryHue / 360, 0.7, 0.5),
accentColor: new THREE.Color().setHSL(secondaryHue / 360, 0.8, 0.6),

New (pastel):
baseColor: new THREE.Color().setHSL(primaryHue / 360, 0.5, 0.75),
accentColor: new THREE.Color().setHSL(secondaryHue / 360, 0.55, 0.70),

Pastel characteristics:

- Saturation: 50-55% (soft, muted)
- Lightness: 70-75% (light, airy)

---

3.  Multi-Color Gradient Effect

Problem: Currently single solid material color with no per-vertex variation.

Solution: Add vertex colors that blend 2 pastel colors based on vertex Y
position.

A. Add vertex colors attribute (in createBlob(), after geometry creation):

const colors = new Float32Array(positionAttribute.count \* 3);
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

B. Enable vertex colors on material (in createBlob(), material definition):

material = new THREE.MeshPhysicalMaterial({
vertexColors: true, // ADD THIS LINE
// ... keep all existing properties
});

C. Update vertex colors in animation (in updateGeometry(), after displacement
loop):

const colorAttribute = geometry.getAttribute('color');
const colorArray = colorAttribute.array;

for (let i = 0; i < positions.length; i += 3) {
const y = positions[i + 1];
// Normalize Y to 0-1 range (blob typically spans -2 to +2)
const t = Math.max(0, Math.min(1, (y + 2) / 4));

// Blend between base and accent colors
const r = blobState.baseColor.r + (blobState.accentColor.r -
blobState.baseColor.r) _ t;
const g = blobState.baseColor.g + (blobState.accentColor.g -
blobState.baseColor.g) _ t;
const b = blobState.baseColor.b + (blobState.accentColor.b -
blobState.baseColor.b) \* t;

colorArray[i] = r;
colorArray[i + 1] = g;
colorArray[i + 2] = b;
}
colorAttribute.needsUpdate = true;

---

4.  Pastel Background Color

Problem: Background is static black (#0a0a0a).

Solution: Generate a daily pastel background that complements the blob colors.

A. Add backgroundColor to blobState (in initializeBlobState()):

// Use a hue that complements the primary (shifted 180° or use tertiary)
const backgroundHue = (primaryHue + 180) % 360;
// Very light pastel: low saturation, high lightness
backgroundColor: new THREE.Color().setHSL(backgroundHue / 360, 0.20, 0.92),

B. Apply to scene (in createBlob(), after environment setup):

scene.background = blobState.backgroundColor;

C. Update CSS fallback (around line 248):

Change from background: #0a0a0a; to a light neutral:
background: #f0f0f0;

D. Lighten environment map gradient (in createEnvironmentMap()):

gradient.addColorStop(0, `hsl(${blobState.primaryHue}, 20%, 88%)`);
gradient.addColorStop(0.5, `hsl(${blobState.secondaryHue}, 15%, 85%)`);
gradient.addColorStop(1, `hsl(${blobState.tertiaryHue}, 20%, 88%)`);

---

5.  Implementation Order

1.  Add geometry.computeVertexNormals() in updateGeometry() → smooth surface
1.  Update HSL values in initializeBlobState() → pastel blob colors
1.  Add backgroundColor to blobState → daily background color
1.  Apply scene.background in createBlob() → use daily background
1.  Update CSS body background → light fallback
1.  Update environment map gradient → lighter reflections
1.  Add vertex colors attribute and enable on material → gradient setup
1.  Add vertex color update loop in updateGeometry() → color blending

---

6.  Verification

1.  Set TEST_MODE: true in config.js
1.  Open index.html in browser
1.  Verify:

- Surface is smooth (no visible flat triangular facets)
- Blob shows gradient blend of 2 colors (bottom to top)
- Colors are pastel (soft, light, not saturated)
- Background is pastel (light, complementary)
- "Generate New Blob" changes both blob colors AND background
- Colors look harmonious together

4.  Use time slider to verify smooth appearance at both t=0 and t=1
5.  Generate 5+ new blobs to verify color variety and harmony

--
Notes: This was a total fail and did not work at all.
