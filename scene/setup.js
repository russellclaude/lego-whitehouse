import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createRenderer() {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled  = true;
  renderer.shadowMap.type     = THREE.PCFSoftShadowMap;
  renderer.toneMapping        = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  document.body.appendChild(renderer.domElement);
  return renderer;
}

export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x7EC8E3);
  scene.fog = new THREE.Fog(0x7EC8E3, 90, 220);
  return scene;
}

export function createCamera() {
  const cam = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 500);
  cam.position.set(0, 28, 55);
  cam.lookAt(0, 6, 0);
  return cam;
}

export function createLights(scene) {
  // Soft fill
  scene.add(new THREE.AmbientLight(0xfff8f0, 0.55));

  // Hemisphere sky/ground bounce
  scene.add(new THREE.HemisphereLight(0x87CEEB, 0x8aaa70, 0.45));

  // Primary sun — from NW, high angle
  const sun = new THREE.DirectionalLight(0xfff5e0, 1.6);
  sun.position.set(-25, 45, 20);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left   = -55;
  sun.shadow.camera.right  =  55;
  sun.shadow.camera.top    =  55;
  sun.shadow.camera.bottom = -55;
  sun.shadow.camera.near   = 1;
  sun.shadow.camera.far    = 200;
  sun.shadow.bias          = -0.0008;
  scene.add(sun);

  // Subtle fill light from opposite side
  const fill = new THREE.DirectionalLight(0xd0e8ff, 0.35);
  fill.position.set(20, 15, -10);
  scene.add(fill);
}

export function createControls(camera, renderer) {
  const ctrl = new OrbitControls(camera, renderer.domElement);
  ctrl.target.set(0, 6, 0);
  ctrl.enableDamping   = true;
  ctrl.dampingFactor   = 0.06;
  ctrl.maxPolarAngle   = Math.PI / 2.05;
  ctrl.minDistance     = 12;
  ctrl.maxDistance     = 160;
  ctrl.update();
  return ctrl;
}

export function addGround(scene) {
  // Lawn
  const lawn = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 80),
    new THREE.MeshStandardMaterial({ color: 0x90AA6A, roughness: 0.9 })
  );
  lawn.rotation.x = -Math.PI / 2;
  lawn.position.y = -0.01;
  lawn.receiveShadow = true;
  scene.add(lawn);

  // Driveway
  const drive = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 18),
    new THREE.MeshStandardMaterial({ color: 0xD8C89A, roughness: 0.85 })
  );
  drive.rotation.x = -Math.PI / 2;
  drive.position.set(0, 0, -13);
  drive.receiveShadow = true;
  scene.add(drive);

  // South lawn path
  const southPath = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 14),
    new THREE.MeshStandardMaterial({ color: 0xD8C89A, roughness: 0.85 })
  );
  southPath.rotation.x = -Math.PI / 2;
  southPath.position.set(0, 0, 12);
  southPath.receiveShadow = true;
  scene.add(southPath);
}
