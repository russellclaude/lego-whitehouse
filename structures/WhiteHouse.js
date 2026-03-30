import { C } from '../bricks/BrickColors.js';

// ── Primitive helpers ──────────────────────────────────────

function fill(world, x, z, y0, w, d, layers, color) {
  for (let y = y0; y < y0 + layers; y++) {
    world.add(x, z, y, w, d, 1, color);
  }
}

// ── Window frame helpers ───────────────────────────────────
// Glass is placed inside the wall's outer face (no z-fighting because we skip
// the white wall brick at that position). The dark gray frame protrudes 1 stud
// OUTSIDE the building, so it also has no z-fighting.

// North-facing window  (outside = smaller z, frame at wallZ-1)
function winN(world, x, y0, ww, wh, wallZ) {
  for (let y = y0; y < y0 + wh; y++) {
    world.add(x, wallZ, y, ww, 1, 1, C.TRANS_CLEAR);
  }
  fill(world, x - 1,    wallZ - 1, y0, 1, 1, wh, C.DARK_GRAY);  // left post
  fill(world, x + ww,   wallZ - 1, y0, 1, 1, wh, C.DARK_GRAY);  // right post
  if (y0 > 0) world.add(x - 1, wallZ - 1, y0 - 1, ww + 2, 1, 1, C.DARK_GRAY); // sill
  world.add(x - 1, wallZ - 1, y0 + wh, ww + 2, 1, 1, C.DARK_GRAY);             // lintel
}

// South-facing window  (outside = larger z, frame at wallZ+1)
function winS(world, x, y0, ww, wh, wallZ) {
  for (let y = y0; y < y0 + wh; y++) {
    world.add(x, wallZ, y, ww, 1, 1, C.TRANS_CLEAR);
  }
  fill(world, x - 1,    wallZ + 1, y0, 1, 1, wh, C.DARK_GRAY);
  fill(world, x + ww,   wallZ + 1, y0, 1, 1, wh, C.DARK_GRAY);
  if (y0 > 0) world.add(x - 1, wallZ + 1, y0 - 1, ww + 2, 1, 1, C.DARK_GRAY);
  world.add(x - 1, wallZ + 1, y0 + wh, ww + 2, 1, 1, C.DARK_GRAY);
}

// West-facing window  (outside = smaller x, frame at wallX-1)
// z is the front-corner of the window opening, ww = studs in z-direction
function winW(world, z, y0, ww, wh, wallX) {
  for (let y = y0; y < y0 + wh; y++) {
    world.add(wallX, z, y, 1, ww, 1, C.TRANS_CLEAR);
  }
  fill(world, wallX - 1, z - 1,      y0, 1, 1, wh, C.DARK_GRAY);  // front post
  fill(world, wallX - 1, z + ww,     y0, 1, 1, wh, C.DARK_GRAY);  // back post
  if (y0 > 0) world.add(wallX - 1, z - 1, y0 - 1, 1, ww + 2, 1, C.DARK_GRAY);
  world.add(wallX - 1, z - 1, y0 + wh, 1, ww + 2, 1, C.DARK_GRAY);
}

// East-facing window  (outside = larger x, frame at wallX+1)
function winE(world, z, y0, ww, wh, wallX) {
  for (let y = y0; y < y0 + wh; y++) {
    world.add(wallX, z, y, 1, ww, 1, C.TRANS_CLEAR);
  }
  fill(world, wallX + 1, z - 1,  y0, 1, 1, wh, C.DARK_GRAY);
  fill(world, wallX + 1, z + ww, y0, 1, 1, wh, C.DARK_GRAY);
  if (y0 > 0) world.add(wallX + 1, z - 1, y0 - 1, 1, ww + 2, 1, C.DARK_GRAY);
  world.add(wallX + 1, z - 1, y0 + wh, 1, ww + 2, 1, C.DARK_GRAY);
}

// ── North facade (front of main building) ─────────────────
// Uses a segmented approach so glass sits in wall gaps (no z-fighting).
//
// Floor 1 windows: y = 1..3   Floor 2 windows: y = 5..7
// Central entrance: y = 0..3 (x = -2, w = 4)
// 4 regular windows per floor at x: -13, -7, 5, 11 (each 2 wide)
//
// For windowed y-layers the outer face is built piece-by-piece;
// for all other layers a solid 30×2 white brick is used.
function buildNorthFacade(world, z0, H) {
  const WIN_X  = [-13, -7, 5, 11];   // left stud of each window (w=2)
  const WIN_Y1 = [1, 2, 3];          // floor 1 window rows
  const WIN_Y2 = [5, 6, 7];          // floor 2 window rows
  const ENT_Y  = [0, 1, 2, 3];       // entrance/door rows

  // White pier segments used on windowed rows
  // (gaps at x=-13..-12, -7..-6, -2..1, 5..6, 11..12 are left empty for glass)
  const PIERS = [
    { x: -15, w: 2 },
    { x: -11, w: 4 },
    { x:  -5, w: 3 },
    { x:   2, w: 3 },
    { x:   7, w: 4 },
    { x:  13, w: 2 },
  ];

  const WIN_Y_SET = new Set([...WIN_Y1, ...WIN_Y2]);
  const ENT_Y_SET = new Set(ENT_Y);

  for (let y = 0; y < H; y++) {
    if (WIN_Y_SET.has(y)) {
      // Outer face: piers only (glass added separately below)
      for (const p of PIERS) world.add(p.x, z0, y, p.w, 1, 1, C.WHITE);
      // Entrance opening on entrance y-rows
      if (!ENT_Y_SET.has(y)) {
        world.add(-2, z0, y, 4, 1, 1, C.WHITE); // close the entrance gap on floor 2
      }
      world.add(-15, z0 + 1, y, 30, 1, 1, C.WHITE); // inner face
    } else if (ENT_Y_SET.has(y)) {
      // Entrance rows (y=0 only, since y=1..3 caught above)
      // Outer face: piers + entrance gap left open
      for (const p of PIERS) world.add(p.x, z0, y, p.w, 1, 1, C.WHITE);
      world.add(-15, z0 + 1, y, 30, 1, 1, C.WHITE);
    } else {
      world.add(-15, z0, y, 30, 2, 1, C.WHITE); // solid layer
    }
  }

  // ── Glass ──────────────────────────────────────────────
  // Regular windows, floor 1 & 2
  for (const wx of WIN_X) {
    for (const wy of [...WIN_Y1, ...WIN_Y2]) {
      world.add(wx, z0, wy, 2, 1, 1, C.TRANS_CLEAR);
    }
  }
  // Entrance glass (y=1..3) and door base (y=0)
  world.add(-2, z0, 0, 4, 1, 1, C.DARK_GRAY);  // door base
  for (let y = 1; y <= 3; y++) {
    world.add(-2, z0, y, 4, 1, 1, C.TRANS_CLEAR);
  }

  // ── Frames (protrude outward at z0-1) ─────────────────
  for (const wx of WIN_X) {
    winN(world, wx, 1, 2, 3, z0); // floor 1
    winN(world, wx, 5, 2, 3, z0); // floor 2
  }
  winN(world, -2, 0, 4, 4, z0); // entrance
}

// ── Side walls with windows (west x=x0, east x=x0+W-T) ───
function buildSideWalls(world, x0, z0, W, D, T, H) {
  // Side walls span z = z0+T to z0+D-T (avoids corners already in front/back walls)
  const zStart = z0 + T;
  const zLen   = D - 2 * T; // = 10 studs

  // Window z-positions (2 windows per side, 2 studs wide each)
  // Segments in z: 2(pier) + 2(win) + 2(pier) + 2(win) + 2(pier) = 10
  const zPiers = [
    { z: zStart,     d: 2 },
    { z: zStart + 4, d: 2 },
    { z: zStart + 8, d: 2 },
  ];
  const zWins = [
    { z: zStart + 2, d: 2 },
    { z: zStart + 6, d: 2 },
  ];

  const WIN_Y1 = [1, 2, 3];
  const WIN_Y2 = [5, 6, 7];
  const WIN_Y_SET = new Set([...WIN_Y1, ...WIN_Y2]);

  function buildSide(wallX, isWest) {
    for (let y = 0; y < H; y++) {
      if (WIN_Y_SET.has(y)) {
        // Piers: solid 2-thick
        for (const p of zPiers) world.add(wallX, p.z, y, T, p.d, 1, C.WHITE);
        // Window positions: outer face glass + inner backing
        for (const w of zWins) {
          world.add(wallX,       w.z, y, 1, w.d, 1, C.TRANS_CLEAR);
          world.add(wallX + 1,   w.z, y, 1, w.d, 1, C.WHITE);
        }
      } else {
        world.add(wallX, zStart, y, T, zLen, 1, C.WHITE); // solid
      }
    }

    // Frames
    const frameFn = isWest ? winW : winE;
    const frameX  = isWest ? wallX : wallX + T - 1; // outer face
    for (const w of zWins) {
      frameFn(world, w.z, 1, w.d, 3, frameX); // floor 1
      frameFn(world, w.z, 5, w.d, 3, frameX); // floor 2
    }
  }

  buildSide(x0,         true);   // west wall
  buildSide(x0 + W - T, false);  // east wall
}

// ── Central Body ──────────────────────────────────────────
function centralBody(world) {
  const x0 = -15, z0 = -7;
  const W = 30, D = 14, H = 10, T = 2;

  // North (front) facade with two floors of windows
  buildNorthFacade(world, z0, H);

  // South (back) wall — with windows
  fill(world, x0, z0 + D - T, 0, W, T, H, C.WHITE);
  // Back windows: 3 per floor (simpler than front)
  const backWinX = [-10, -1, 8];
  for (const wx of backWinX) {
    winS(world, wx, 1, 2, 3, z0 + D - 1); // floor 1
    winS(world, wx, 5, 2, 3, z0 + D - 1); // floor 2
    // Glass at outer face (southernmost z)
    for (const wy of [1, 2, 3, 5, 6, 7]) {
      world.add(wx, z0 + D - 1, wy, 2, 1, 1, C.TRANS_CLEAR);
    }
  }

  // Side walls with windows
  buildSideWalls(world, x0, z0, W, D, T, H);

  // Roof plate
  world.add(x0, z0, H, W, D, 1, C.LIGHT_GRAY);

  // Parapet
  for (let x = x0; x < x0 + W; x += 2) {
    world.add(x, z0,         H + 1, 1, 1, 1, C.WHITE);
    world.add(x, z0 + D - 1, H + 1, 1, 1, 1, C.WHITE);
  }
  for (let z = z0 + 2; z < z0 + D - 2; z += 2) {
    world.add(x0,         z, H + 1, 1, 1, 1, C.WHITE);
    world.add(x0 + W - 1, z, H + 1, 1, 1, 1, C.WHITE);
  }
}

// ── North Portico ─────────────────────────────────────────
function northPortico(world) {
  const z_near = -7, z_far = -13;
  const D = z_near - z_far;
  const COL_H = 11;

  const colX = [-10, -6, -2, 2, 6, 10];
  for (const cx of colX) {
    fill(world, cx - 1, z_far, 0, 2, D, COL_H, C.WHITE);
  }

  world.add(-12, z_far, COL_H,     24, D, 1, C.WHITE);
  world.add(-12, z_far, COL_H + 1, 24, D, 1, C.CREAM);

  const PED_BASE_W = 22;
  for (let s = 0; s < 5; s++) {
    const pw = PED_BASE_W - s * 4;
    world.add(-pw / 2, z_far, COL_H + 2 + s, pw, D, 1, C.WHITE);
  }

  world.add(-12, z_far, COL_H - 1, 24, D, 1, C.LIGHT_GRAY);

  // Steps
  for (let s = 0; s < 3; s++) {
    const sw = 20 + s * 2;
    world.add(-sw / 2, z_far - s - 1, 0, sw, 1, s + 1, C.LIGHT_GRAY);
  }
}

// ── South Portico ─────────────────────────────────────────
function southPortico(world) {
  const z_near = 7, z_far = 11;
  const D = z_far - z_near;
  const COL_H = 10;

  const colX = [-6, -2, 2, 6];
  for (const cx of colX) {
    fill(world, cx - 1, z_near, 0, 2, D, COL_H, C.WHITE);
  }

  world.add(-8, z_near, COL_H,     16, D, 1, C.WHITE);
  world.add(-8, z_near, COL_H + 1, 16, D, 1, C.CREAM);

  const archSteps = [16, 14, 10];
  for (let i = 0; i < archSteps.length; i++) {
    const aw = archSteps[i];
    world.add(-aw / 2, z_near, COL_H + 2 + i, aw, D, 1, C.WHITE);
  }

  world.add(-8, z_near, COL_H - 1, 16, D, 1, C.LIGHT_GRAY);
}

// ── Wing helper — builds one wing with windows ─────────────
function buildWing(world, x0, z0, W, D, H, T, facingEast) {
  // Front wall (north face)
  fill(world, x0, z0, 0, W, T, H, C.WHITE);
  // Back wall (south face)
  fill(world, x0, z0 + D - T, 0, W, T, H, C.WHITE);
  // Inner walls
  fill(world, x0,         z0 + T, 0, T, D - 2 * T, H, C.WHITE);
  fill(world, x0 + W - T, z0 + T, 0, T, D - 2 * T, H, C.WHITE);

  // North-face window (center of front wall)
  const nx = x0 + Math.floor(W / 2) - 1;
  winN(world, nx, 2, 2, 3, z0);
  for (let y = 2; y <= 4; y++) world.add(nx, z0, y, 2, 1, 1, C.TRANS_CLEAR);

  // Outer side window (east face if facingEast, else west face)
  const outerX = facingEast ? x0 + W - T : x0;
  const sz = z0 + Math.floor(D / 2) - 1;
  if (facingEast) {
    winE(world, sz, 2, 2, 3, outerX + T - 1);
    for (let y = 2; y <= 4; y++) world.add(outerX + T - 1, sz, y, 1, 2, 1, C.TRANS_CLEAR);
  } else {
    winW(world, sz, 2, 2, 3, outerX);
    for (let y = 2; y <= 4; y++) world.add(outerX, sz, y, 1, 2, 1, C.TRANS_CLEAR);
  }

  // Roof
  world.add(x0, z0, H, W, D, 1, C.LIGHT_GRAY);

  // Parapet
  for (let x = x0; x < x0 + W; x += 2) {
    world.add(x, z0,         H + 1, 1, 1, 1, C.WHITE);
    world.add(x, z0 + D - 1, H + 1, 1, 1, 1, C.WHITE);
  }
  for (let z = z0 + 1; z < z0 + D - 1; z += 2) {
    world.add(x0,         z, H + 1, 1, 1, 1, C.WHITE);
    world.add(x0 + W - 1, z, H + 1, 1, 1, 1, C.WHITE);
  }

  // Colonnade connection (inner face of wing toward main building)
  const colFaceX = facingEast ? x0 : x0 + W;
  for (let z = z0 + 1; z < z0 + D - 1; z += 3) {
    fill(world, facingEast ? x0 - 1 : x0 + W, z, 0, 1, 1, 5, C.WHITE);
  }
}

// ── American flag ─────────────────────────────────────────
// 9 studs wide × 6 layers tall, extending east from the pole.
// Stripes alternate red/white (bottom to top).
// Blue canton covers the top 3 rows × left 3 studs (upper-left quarter).
function americanFlag(world) {
  const POLE_X = 0, POLE_Z = -20;
  const FLAG_X  = POLE_X + 1; // flag starts one stud east of pole
  const FLAG_Z  = POLE_Z;
  const FLAG_W  = 9;           // studs wide (x)
  const FLAG_H  = 6;           // layers tall
  const FLAG_Y0 = 7;           // bottom layer of flag (pole top is y=12)
  const CANTON_W = 3;          // blue canton width in studs
  const CANTON_H = 3;          // blue canton height in layers (top rows)

  // Stripe colors bottom → top (6 stripes: W R W R W R)
  const stripes = [
    C.FLAG_WHITE,
    C.FLAG_RED,
    C.FLAG_WHITE,
    C.FLAG_RED,
    C.FLAG_WHITE,
    C.FLAG_RED,
  ];

  for (let i = 0; i < FLAG_H; i++) {
    const y        = FLAG_Y0 + i;
    const inCanton = i >= (FLAG_H - CANTON_H); // top CANTON_H rows

    if (inCanton) {
      // Left portion: blue canton
      world.add(FLAG_X,            FLAG_Z, y, CANTON_W,          1, 1, C.FLAG_BLUE);
      // Right portion: stripe color
      world.add(FLAG_X + CANTON_W, FLAG_Z, y, FLAG_W - CANTON_W, 1, 1, stripes[i]);
    } else {
      // Full-width stripe
      world.add(FLAG_X, FLAG_Z, y, FLAG_W, 1, 1, stripes[i]);
    }
  }

  // Stars: 3×2 grid of white 1×1 studs inside the canton
  // (one stud per star position — very Lego)
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      const sx = FLAG_X + col;
      const sy = FLAG_Y0 + (FLAG_H - CANTON_H) + row;
      // Place a white tile on top of the blue — shift slightly in z so it's visible
      world.add(sx, FLAG_Z - 1, sy, 1, 1, 1, C.FLAG_WHITE);
    }
  }
}

// ── Landscaping ───────────────────────────────────────────
function landscaping(world) {
  const hedgeR = 6;
  for (let angle = 0; angle < 360; angle += 30) {
    const rad = (angle * Math.PI) / 180;
    const hx = Math.round(Math.cos(rad) * hedgeR);
    const hz = Math.round(Math.sin(rad) * hedgeR) - 17;
    fill(world, hx, hz, 0, 1, 1, 2, C.DARK_GREEN);
  }
  for (let x = -20; x <= 20; x += 2) {
    fill(world, x, 18, 0, 1, 1, 2, C.DARK_GREEN);
  }

  // Flagpole
  fill(world, 0, -20, 0, 1, 1, 12, C.LIGHT_GRAY);
  world.add(0, -20, 12, 1, 1, 1, C.GOLD);

  // American flag
  americanFlag(world);
}

// ── Public entry ──────────────────────────────────────────
export function buildWhiteHouse(world) {
  centralBody(world);
  northPortico(world);
  southPortico(world);
  buildWing(world,  15, -5, 8, 10, 7, 2, true);   // East Wing
  buildWing(world, -23, -5, 8, 10, 7, 2, false);  // West Wing
  landscaping(world);
}
