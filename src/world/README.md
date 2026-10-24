# World generation — Adrian

Welcome to the **Deterministic Procedural Voxel Engine**.

This module is responsible for turning a single integer seed into a fully playable, 3D cylindrical temple. It handles all the mathematical scaffolding, template stamping, and data formatting. It outputs a pure, flat byte-buffer (`Uint8Array`) that the **Graphics Engine** can mesh and the **Physics Engine** can use for collisions.

## 🏗️ Architecture & Data Flow

Because speedrunning requires 100% reproducible levels, this engine uses a strict deterministic pipeline:

```text
[Seed Input (0 to 4.29B)] 
       │
       ▼
[PRNG (Mulberry32)] ──► [Sector-Based Ascent Math] ──► [ASCII Micro-Templates]
        │
        ▼
[Physics] ◄── getVoxel(x,y,z) ─── [VoxelChunk Buffer] ──► [Graphics / Meshing]

```

---

## 🧩 The 5 Core Units (How it Works)

The generation engine is split into 5 decoupled units to ensure clean code and easy testing.

### Unit 1: Block Types & Constants (`block_types.ts`)

The single source of truth for the game's vocabulary.

* **What it is:** Contains the `BlockType` enum (IDs 0–255) and `WORLD_CONSTANTS` (e.g., 48 width x 96 height x 4 depth).
* **Why it matters:** Prevents magic numbers. Other files can import `isSolidBlock(id)` or `isInteractiveBlock(id)` to instantly know how a block should behave in the physics engine.

### Unit 2: Deterministic PRNG (`prng.ts`)

* **What it is:** A custom 32-bit Mulberry32 random number generator.
* **Why it matters:** Standard `Math.random()` cannot be seeded. This guarantees that entering seed `1337` on any computer generates the exact same jumps, hazards, and layout. *(Note: Max seed is 4,294,967,295 due to 32-bit bitwise math).*

### Unit 3: VoxelChunk & 3D Math (`chunk.ts`)

* **What it is:** The container for the level. It maps 3D coordinates `(X, Y, Z)` to a flat 1D array index: `index = X + Width * (Y + Height * Z)`.
* **Why it matters:** It handles the **horizontal cylinder wrapping** automatically. If you request a block at `X = 49` (on a 48-wide tower), it safely wraps the query to `X = 1`. It stores data in a flat `Uint8Array`, which is lightning-fast and ready for WebGL/OpenGL buffers.

### Unit 4: Micro-Templates (`templates.ts`)

* **What it is:** A library of hand-crafted, bite-sized platforming challenges (stairs, bounce-pad setups, chest alcoves) written in simple ASCII art.
* **Why it matters:** Pure randomness looks messy. By parsing ASCII strings (like `#`, `~`, `^`) into block IDs, the generator can "stamp" guaranteed-beatable human designs into the world.

### Unit 5: The Generator (`generator.ts`)

* **What it is:** The master algorithm. It divides the tower into 4 quadrants (sectors) and forces "Walkers" to climb upwards.
* **Why it matters:** It guarantees the level is playable. It stamps architectural floors, vertical vine-pillars, a safe "Critical Path", and a riskier "Speedrun Shortcut", ensuring even 360-degree density with no dead ends or empty voids.

---

## 🚀 How to Use It

This module is designed to be a "black box" for the rest of the team. You do not need to understand the generation math to render the game or collide with it.

### 1. Generating a Stage (Main Game Loop)

```typescript
import { generateStage } from './src/world/generator';

// Generate a full stage from a seed (e.g., from the pause menu)
const currentSeed = 12345;
const stageChunk = generateStage(currentSeed);

```

### 2. For the Graphics / Mesher Lead

You need the raw buffer to calculate visible faces and push vertices to the GPU.

```typescript
const voxelData = stageChunk.voxels; // Raw Uint8Array (length: 48 * 96 * 4)

// You have access to dimensions for your polar coordinate mapping:
const width = stageChunk.width;   // 48 (Circumference)
const height = stageChunk.height; // 96 (Vertical climb)
const depth = stageChunk.depth;   // 4  (Radial depth)

// Dynamic entities (Chests, Portals) are stored separately so you can attach 3D models to them
for (const entity of stageChunk.entities) {
  spawn3DModel(entity.type, entity.x, entity.y, entity.z);
}

```

### 3. For the Physics / Engine Lead

When updating the player's position, you need to check if the tiles around the player are solid, air, or hazards.

```typescript
import { isSolidBlock, isHazardBlock } from './src/world/block_types';

// The chunk handles the 360-degree wrapping for you!
// If player is at X = 48, it safely checks X = 0.
const blockBelow = stageChunk.getVoxel(player.x, player.y - 1, player.z);
const blockAtHead = stageChunk.getVoxel(player.x, player.y + 1, player.z);

if (isSolidBlock(blockBelow)) {
  player.canJump = true;
}

if (isHazardBlock(blockAtHead)) {
  player.triggerDeath();
}

```

---

## 🧪 Testing & Terminal Visualization

If you want to view a stage layout without booting up the full 3D graphics engine, use the built-in ASCII visualizer.

Run the test suite in your terminal:

```bash
npm test
# or
npx vitest run src/world/__tests__/generator_preview.test.ts --silent=false

```

This will print a complete, unwrapped 2D representation of the cylindrical tower to your console, allowing you to easily verify jump distances, stairs (`⌗`), vines (`~~`), and portal (`SS` / `EE`) placements.

Reserved for Adrian: seeds, templates, ring/platform/entity descriptions, environment placement and route validation. Review the proposed boundary profiles before coding. No generator is implemented here. See [ownership](../../docs/collaboration/OWNERSHIP.md).
