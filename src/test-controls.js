import {
  blobState,
  materialDefaults,
  material,
  initializeBlobState,
  createBlob,
} from "./blob.js";
import { setTestTimeOverride, formatTime, getTodayString } from "./time.js";

export function setupTestControls() {
  const controls = document.getElementById("test-controls");
  const timeSlider = document.getElementById("time-slider");
  const timeDisplay = document.getElementById("time-display");
  const newBlobBtn = document.getElementById("new-blob-btn");
  const seedDisplay = document.getElementById("seed-display");

  controls.classList.add("visible");

  const now = new Date();
  const currentSeconds =
    now.getUTCHours() * 3600 +
    now.getUTCMinutes() * 60 +
    now.getUTCSeconds();
  timeSlider.value = currentSeconds;
  timeDisplay.textContent = formatTime(currentSeconds);
  seedDisplay.textContent = blobState.seedString;

  let testSeedCounter = 0;
  const today = getTodayString();

  timeSlider.addEventListener("input", (e) => {
    const seconds = parseInt(e.target.value);
    setTestTimeOverride(seconds);
    timeDisplay.textContent = formatTime(seconds);
  });

  newBlobBtn.addEventListener("click", () => {
    testSeedCounter++;
    const newSeed = `${today}-test-${testSeedCounter}`;
    initializeBlobState(newSeed);
    createBlob();
    seedDisplay.textContent = newSeed;
    resetMaterialSliders();
  });

  const materialProps = [
    { id: "metalness", prop: "metalness", decimals: 2 },
    { id: "roughness", prop: "roughness", decimals: 2 },
    { id: "clearcoat", prop: "clearcoat", decimals: 2 },
    { id: "clearcoatRoughness", prop: "clearcoatRoughness", decimals: 2 },
    { id: "iridescence", prop: "iridescence", decimals: 2 },
    { id: "iridescenceIOR", prop: "iridescenceIOR", decimals: 2 },
    { id: "transmission", prop: "transmission", decimals: 2 },
    { id: "thickness", prop: "thickness", decimals: 2 },
    { id: "envMapIntensity", prop: "envMapIntensity", decimals: 2 },
    { id: "sheen", prop: "sheen", decimals: 2 },
    { id: "sheenRoughness", prop: "sheenRoughness", decimals: 2 },
    { id: "specularIntensity", prop: "specularIntensity", decimals: 2 },
    { id: "ior", prop: "ior", decimals: 2 },
    { id: "reflectivity", prop: "reflectivity", decimals: 2 },
  ];

  materialProps.forEach(({ id, prop, decimals }) => {
    const slider = document.getElementById(`mat-${id}`);
    const valueDisplay = document.getElementById(`val-${id}`);

    slider.addEventListener("input", (e) => {
      const value = parseFloat(e.target.value);
      material[prop] = value;
      valueDisplay.textContent = value.toFixed(decimals);
    });
  });

  const iridThickMinSlider = document.getElementById(
    "mat-iridescenceThicknessMin",
  );
  const iridThickMaxSlider = document.getElementById(
    "mat-iridescenceThicknessMax",
  );
  const iridThickMinVal = document.getElementById(
    "val-iridescenceThicknessMin",
  );
  const iridThickMaxVal = document.getElementById(
    "val-iridescenceThicknessMax",
  );

  iridThickMinSlider.addEventListener("input", (e) => {
    const min = parseFloat(e.target.value);
    const max = parseFloat(iridThickMaxSlider.value);
    material.iridescenceThicknessRange = [min, max];
    iridThickMinVal.textContent = Math.round(min);
  });

  iridThickMaxSlider.addEventListener("input", (e) => {
    const min = parseFloat(iridThickMinSlider.value);
    const max = parseFloat(e.target.value);
    material.iridescenceThicknessRange = [min, max];
    iridThickMaxVal.textContent = Math.round(max);
  });

  function resetMaterialSliders() {
    const defaults = { ...materialDefaults };

    materialProps.forEach(({ id, prop, decimals }) => {
      const slider = document.getElementById(`mat-${id}`);
      const valueDisplay = document.getElementById(`val-${id}`);
      const value = defaults[prop];
      slider.value = value;
      valueDisplay.textContent = value.toFixed(decimals);
    });

    iridThickMinSlider.value = 100;
    iridThickMaxSlider.value = 400;
    iridThickMinVal.textContent = "100";
    iridThickMaxVal.textContent = "400";
  }
}
