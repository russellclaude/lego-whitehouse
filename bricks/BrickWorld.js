import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// ── Lego unit constants ────────────────────────────────────
export const BRICK_H = 1.2;   // height of one standard brick in world units
const STUD_R         = 0.22;  // stud cylinder radius
const STUD_H         = 0.16;  // stud cylinder height
const BODY_GAP       = 0.05;  // tiny gap between bricks (visual separation)

// ── Geometry cache ─────────────────────────────────────────
const _geoCache = new Map();

function makeBrickGeo(w, d, h) {
  const key = `${w}x${d}x${h}`;
  if (_geoCache.has(key)) return _geoCache.get(key);

  const bH = h * BRICK_H;
  const geos = [];

  // Body
  const body = new THREE.BoxGeometry(w - BODY_GAP, bH - BODY_GAP * 0.4, d - BODY_GAP);
  geos.push(body);

  // Studs on top face
  const studProto = new THREE.CylinderGeometry(STUD_R, STUD_R, STUD_H, 10);
  for (let sx = 0; sx < w; sx++) {
    for (let sz = 0; sz < d; sz++) {
      const stud = studProto.clone();
      stud.translate(
        sx + 0.5 - w * 0.5,
        bH * 0.5 + STUD_H * 0.5,
        sz + 0.5 - d * 0.5
      );
      geos.push(stud);
    }
  }

  const merged = mergeGeometries(geos);
  _geoCache.set(key, merged);
  return merged;
}

// ── BrickWorld ─────────────────────────────────────────────
// add(x, z, y, w, d, h, color)
//   x, z  — stud grid position (left/front corner)
//   y     — brick layer (0 = ground level)
//   w, d  — width / depth in studs
//   h     — height in brick units (1 = standard brick)
//   color — 0xRRGGBB integer

export class BrickWorld {
  constructor() {
    this._specs = [];
  }

  add(x, z, y, w = 1, d = 1, h = 1, color) {
    this._specs.push({ x, z, y, w, d, h, color });
  }

  build(scene) {
    // Group specs by unique (color, w, d, h) → one InstancedMesh per group
    const groups = new Map();
    for (const s of this._specs) {
      const key = `${s.color}|${s.w}|${s.d}|${s.h}`;
      if (!groups.has(key)) {
        groups.set(key, { color: s.color, w: s.w, d: s.d, h: s.h, positions: [] });
      }
      groups.get(key).positions.push({ x: s.x, z: s.z, y: s.y });
    }

    const dummy = new THREE.Object3D();

    for (const g of groups.values()) {
      const geo  = makeBrickGeo(g.w, g.d, g.h);
      const isGlass = (g.color === 0x88BBDD);

      const mat = new THREE.MeshStandardMaterial({
        color:       g.color,
        roughness:   isGlass ? 0.05 : 0.38,
        metalness:   isGlass ? 0.08 : 0.0,
        transparent: isGlass,
        opacity:     isGlass ? 0.48 : 1.0,
        depthWrite:  !isGlass,
      });

      const mesh = new THREE.InstancedMesh(geo, mat, g.positions.length);
      mesh.castShadow    = true;
      mesh.receiveShadow = true;

      const bH = g.h * BRICK_H;
      g.positions.forEach((pos, i) => {
        dummy.position.set(
          pos.x + g.w * 0.5,
          pos.y * BRICK_H + bH * 0.5,
          pos.z + g.d * 0.5
        );
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      });

      mesh.instanceMatrix.needsUpdate = true;
      scene.add(mesh);
    }

    return this._specs.length;
  }

  get count() { return this._specs.length; }
}
