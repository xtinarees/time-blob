import * as THREE from "three";
import { scene, camera, renderer, setupResize } from "./scene.js";
import { getTimeProgress, getTodayString } from "./time.js";
import { initializeBlobState, createBlob, updateGeometry } from "./blob.js";

setupResize();

const today = getTodayString();
initializeBlobState(today);
createBlob();

if (TEST_MODE) {
  const { setupTestControls } = await import("./test-controls.js");
  setupTestControls();
}

const clock = new THREE.Clock();
let currentDay = today;

function animate() {
  requestAnimationFrame(animate);

  if (!TEST_MODE) {
    const nowDay = getTodayString();
    if (nowDay !== currentDay) {
      window.location.reload();
    }
  }

  const t = getTimeProgress();
  const elapsedTime = clock.getElapsedTime();

  updateGeometry(t, elapsedTime);

  renderer.render(scene, camera);
}

animate();
