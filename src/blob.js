import * as THREE from "three";
import { scene, pmremGenerator } from "./scene.js";
import { mulberry32, hashString } from "./prng.js";
import { SimplexNoise } from "./noise.js";

export let blobState = {
  noise: null,
  primaryHue: 0,
  secondaryHue: 0,
  tertiaryHue: 0,
  baseColor: null,
  accentColor: null,
  backgroundColor: null,
  noiseScale: 0,
  rotationSpeed: 0,
  baseAmplitude: 0,
  maxAmplitude: 0,
  seed: 0,
  seedString: "",
};

export const materialDefaults = {
  vertexColors: true,
  metalness: 0.21,
  roughness: 0.2,
  clearcoat: 0.9,
  clearcoatRoughness: 0.14,
  iridescence: 1.0,
  iridescenceIOR: 1.5,
  iridescenceThicknessRange: [0, 230],
  transmission: 0,
  thickness: 0.3,
  envMapIntensity: 1.2,
  sheen: 0.16,
  sheenRoughness: 0.62,
  specularIntensity: 0.97,
  ior: 1.63,
  reflectivity: 0,
};

export let mesh = null;
export let geometry = null;
export let material = null;
let positionAttribute = null;
let originalPositions = null;

export function initializeBlobState(seedString) {
  const seed = hashString(seedString);
  const random = mulberry32(seed);
  const noise = new SimplexNoise(random);

  const primaryHue = random() * 360;
  const goldenRatio = 137.5;
  const secondaryHue = (primaryHue + goldenRatio) % 360;
  const tertiaryHue = (secondaryHue + goldenRatio) % 360;
  const backgroundHue = (primaryHue + 180) % 360;

  blobState = {
    noise,
    primaryHue,
    secondaryHue,
    tertiaryHue,
    baseColor: new THREE.Color().setHSL(primaryHue / 360, 1, 0.5),
    accentColor: new THREE.Color().setHSL(secondaryHue / 360, 1, 0.5),
    backgroundColor: new THREE.Color().setHSL(backgroundHue / 360, 1, 0.5),
    noiseScale: 1,
    rotationSpeed: 0,
    baseAmplitude: 0,
    maxAmplitude: 1,
    seed,
    seedString,
  };

  return blobState;
}

function createEnvironmentMap() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, `hsl(${blobState.primaryHue}, 30%, 15%)`);
  gradient.addColorStop(0.5, `hsl(${blobState.secondaryHue}, 20%, 8%)`);
  gradient.addColorStop(1, `hsl(${blobState.tertiaryHue}, 25%, 12%)`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  return texture;
}

export function createBlob() {
  if (mesh) {
    scene.remove(mesh);
    geometry.dispose();
    material.dispose();
  }

  const envTexture = createEnvironmentMap();
  scene.environment = pmremGenerator.fromEquirectangular(envTexture).texture;

  scene.background = blobState.backgroundColor;

  geometry = new THREE.IcosahedronGeometry(1, 8);
  positionAttribute = geometry.getAttribute("position");
  originalPositions = new Float32Array(positionAttribute.array);

  const colors = new Float32Array(positionAttribute.count * 3);
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  material = new THREE.MeshPhysicalMaterial({
    ...materialDefaults,
  });

  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
}

export function updateGeometry(t, elapsedTime) {
  const positions = positionAttribute.array;
  const amplitude =
    blobState.baseAmplitude +
    (blobState.maxAmplitude - blobState.baseAmplitude) * t;
  const frequency = blobState.noiseScale * (1 + t * 0.5);

  for (let i = 0; i < positions.length; i += 3) {
    const ox = originalPositions[i];
    const oy = originalPositions[i + 1];
    const oz = originalPositions[i + 2];

    const length = Math.sqrt(ox * ox + oy * oy + oz * oz);
    const nx = ox / length;
    const ny = oy / length;
    const nz = oz / length;

    let noiseValue = 0;
    noiseValue +=
      blobState.noise.noise3D(
        nx * frequency,
        ny * frequency,
        nz * frequency + elapsedTime * 0.1,
      ) * 1.0;
    noiseValue +=
      blobState.noise.noise3D(
        nx * frequency * 2,
        ny * frequency * 2,
        nz * frequency * 2 + elapsedTime * 0.15,
      ) * 0.5;
    noiseValue +=
      blobState.noise.noise3D(
        nx * frequency * 4,
        ny * frequency * 4,
        nz * frequency * 4 + elapsedTime * 0.2,
      ) * 0.25;

    const displacement = 1 + noiseValue * amplitude;

    positions[i] = ox * displacement;
    positions[i + 1] = oy * displacement;
    positions[i + 2] = oz * displacement;
  }

  positionAttribute.needsUpdate = true;
  geometry.computeVertexNormals();

  const colorAttribute = geometry.getAttribute("color");
  const colorArray = colorAttribute.array;

  for (let i = 0; i < positions.length; i += 3) {
    const y = positions[i + 1];
    const ct = Math.max(0, Math.min(1, (y + 2) / 4));

    const r =
      blobState.baseColor.r +
      (blobState.accentColor.r - blobState.baseColor.r) * ct;
    const g =
      blobState.baseColor.g +
      (blobState.accentColor.g - blobState.baseColor.g) * ct;
    const b =
      blobState.baseColor.b +
      (blobState.accentColor.b - blobState.baseColor.b) * ct;

    colorArray[i] = r;
    colorArray[i + 1] = g;
    colorArray[i + 2] = b;
  }
  colorAttribute.needsUpdate = true;
}
