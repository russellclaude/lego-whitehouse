# Lego Style Guide — White House Reconstruction

## Core Lego Principles

### Unit System
- **1 Lego Unit (LU)** = 8mm real-world
- **Brick dimensions**: 1×1 stud = 1LU × 1LU footprint
- **Brick height**: 1.2LU (standard brick) — use 3 plates = 1 brick
- **Plate height**: 0.4LU (1/3 of a brick)
- **Stud diameter**: 0.6LU, stud height: 0.18LU
- **Three.js mapping**: 1 Lego stud = 1 Three.js unit for simplicity

### Standard Colors (White House Palette)
| Color Name     | Hex       | Usage                        |
|----------------|-----------|------------------------------|
| White          | `#F2F3F2` | Primary walls, columns       |
| Light Gray     | `#A0A5A9` | Roof, steps, details         |
| Dark Gray      | `#6B5A4E` | Window frames, accents       |
| Black          | `#1B2A34` | Window panes, iron details   |
| Sand Green     | `#ACB78E` | Lawn, landscaping            |
| Dark Green     | `#2B5B3C` | Shrubs, trees                |
| Tan            | `#E4CD9E` | Pathways, driveway           |
| Clear/Trans    | `#C8DDE7` | Window glass (transparent)   |

---

## Architecture — White House Structure Breakdown

### Scale Recommendation
- **Modular scale**: 1 stud = 0.5 feet real-world
- White House is ~170ft wide × ~85ft deep → **340 × 170 studs**
- For Three.js render: scale down to ~170 × 85 units (manageable viewport)

### Key Sections (Build Modules)
1. **North Portico** — iconic columned entrance facing North Lawn
2. **South Portico** — curved portico with balcony facing South Lawn
3. **Central Residence** — main 3-story rectangular body
4. **East Wing** — lower, connects to East Colonnade
5. **West Wing** — contains Oval Office, Rose Garden side
6. **Colonnades** — East & West covered walkways
7. **Roof & Balustrade** — flat roof with decorative railing

---

## Three.js Implementation Notes

### Geometry Approach
- Use `BoxGeometry` for standard bricks
- Use `CylinderGeometry` for studs on top of each brick
- Batch bricks with `InstancedMesh` for performance (hundreds of bricks)
- Group bricks into structural modules (walls, columns, roof)

### Brick Class (suggested interface)
```js
// A single Lego brick placed in the scene
{
  x: Number,       // stud column
  y: Number,       // layer (height)
  z: Number,       // stud row
  width: Number,   // studs wide (x-axis)
  depth: Number,   // studs deep (z-axis)
  height: Number,  // plates tall (default 3 = 1 standard brick)
  color: String,   // hex color
  type: String     // 'brick' | 'plate' | 'tile' | 'slope' | 'cylinder'
}
```

### Camera & Controls
- Use `OrbitControls` for interactive rotation/zoom
- Default camera: isometric-ish angle, slightly elevated
- FOV: 45–60° for architectural feel

### Lighting
- `AmbientLight` — soft base fill
- `DirectionalLight` — sun angle from NW, cast shadows
- Optional: `HemisphereLight` for sky/ground bounce

---

## File Structure Plan
```
lego-whitehouse/
├── LEGO_STYLE_GUIDE.md     ← this file
├── index.html              ← entry point
├── main.js                 ← Three.js scene setup
├── bricks/
│   ├── Brick.js            ← base brick class/mesh builder
│   └── BrickColors.js      ← color palette constants
├── structures/
│   ├── NorthPortico.js
│   ├── SouthPortico.js
│   ├── CentralBody.js
│   ├── EastWing.js
│   ├── WestWing.js
│   └── Colonnades.js
├── scene/
│   ├── lights.js
│   ├── camera.js
│   └── controls.js
└── assets/
    └── textures/           ← optional: stud normal map, etc.
```

---

## Build Order (suggested)
1. Foundation / base plate (ground)
2. Central body walls (layer by layer)
3. Columns — North & South Porticos
4. Wings (East + West)
5. Colonnades connecting wings
6. Roof + balustrade
7. Windows + doors (detail pass)
8. Landscaping — lawn, trees, driveway
9. Interactive controls + UI polish
