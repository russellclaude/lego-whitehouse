import * as THREE from 'three';
import {
  createRenderer,
  createScene,
  createCamera,
  createLights,
  createControls,
  addGround,
} from './scene/setup.js';
import { BrickWorld } from './bricks/BrickWorld.js';
import { buildWhiteHouse } from './structures/WhiteHouse.js';

// ── Scene bootstrap ────────────────────────────────────────
const renderer = createRenderer();
const scene    = createScene();
const camera   = createCamera();
const controls = createControls(camera, renderer);
createLights(scene);
addGround(scene);

// ── Build Lego White House ─────────────────────────────────
const world = new BrickWorld();
buildWhiteHouse(world);
const brickCount = world.build(scene);

// Update stats
document.getElementById('stats').textContent = `${brickCount.toLocaleString()} bricks`;

// ── Animation loop ─────────────────────────────────────────
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// ── Responsive resize ──────────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
