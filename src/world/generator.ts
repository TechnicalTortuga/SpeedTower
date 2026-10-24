import { BlockType, WORLD_CONSTANTS } from './block_types';
import { VoxelChunk } from './chunk';
import { PRNG } from './prng';
import { type MicroTemplate } from './templates';

export interface LevelGenerationConfig {
  width?: number;
  height?: number;
  depth?: number;
}

/**
 * Helper to stamp a micro-template into a chunk with automatic X wrapping.
 */
export function stampTemplate(
  chunk: VoxelChunk,
  template: MicroTemplate,
  startX: number,
  startY: number,
  zDepth: number = 1
): void {
  for (let ty = 0; ty < template.height; ty++) {
    const row = template.grid[ty];
    if (!row) continue;
    for (let tx = 0; tx < template.width; tx++) {
      const block = row[tx] ?? BlockType.AIR;
      if (block !== BlockType.AIR) {
        chunk.setVoxel(startX + tx, startY + ty, zDepth, block);

        if (
          block === BlockType.CHEST ||
          block === BlockType.PORTAL_START ||
          block === BlockType.PORTAL_EXIT
        ) {
          chunk.addEntity(block, startX + tx, startY + ty, zDepth);
        }
      }
    }
  }
}

/**
 * Builds a horizontal platform with automatic X wrapping.
 */
function buildPlatform(
  chunk: VoxelChunk,
  startX: number,
  y: number,
  length: number,
  type: BlockType = BlockType.SOLID
): void {
  for (let i = 0; i < length; i++) {
    chunk.setVoxel(startX + i, y, 1, type);
  }
}

/**
 * Builds a vertical pillar, optionally lined with climbable vines.
 */
function buildVerticalPillar(
  chunk: VoxelChunk,
  x: number,
  startY: number,
  pillarHeight: number,
  hasVines: boolean = false,
  vineSide: 'left' | 'right' = 'right'
): void {
  for (let dy = 0; dy < pillarHeight; dy++) {
    const y = startY + dy;
    if (y >= chunk.height - 4) break;
    chunk.setVoxel(x, y, 1, BlockType.SOLID);

    if (hasVines && dy > 0 && dy < pillarHeight - 1) {
      const vineX = vineSide === 'right' ? x + 1 : x - 1;
      chunk.setVoxel(vineX, y, 1, BlockType.VINES);
    }
  }
}

/**
 * Procedural Temple Generator:
 * Generates an evenly distributed, dense 360-degree cylindrical spire.
 */
export function generateStage(
  seed: number,
  config: LevelGenerationConfig = {}
): VoxelChunk {
  const width = config.width ?? WORLD_CONSTANTS.CHUNK_WIDTH; // 48 blocks
  const height = config.height ?? WORLD_CONSTANTS.CHUNK_HEIGHT * WORLD_CONSTANTS.CHUNKS_PER_STAGE; // 96 blocks
  const depth = config.depth ?? WORLD_CONSTANTS.CHUNK_DEPTH;

  const prng = new PRNG(seed);
  const chunk = new VoxelChunk(0, width, height, depth);

  // --------------------------------------------------------------------------
  // 1. BASE FLOOR & STARTING PORTAL
  // --------------------------------------------------------------------------
  for (let x = 0; x < width; x++) {
    chunk.setVoxel(x, 0, 1, BlockType.SOLID);
  }
  const startX = prng.nextInt(4, 10);
  chunk.setVoxel(startX, 1, 1, BlockType.PORTAL_START);
  chunk.addEntity(BlockType.PORTAL_START, startX, 1, 1);

  // --------------------------------------------------------------------------
  // 2. SECTOR-BASED ARCHITECTURAL GENERATION
  // Tower circumference is split into 4 equal quadrants (12 blocks wide each).
  // --------------------------------------------------------------------------
  const numSectors = 4;
  const sectorWidth = Math.floor(width / numSectors); // 12 blocks each

  // Track the primary critical path around the cylinder to guarantee reachability
  let activeSector = 0;
  let runnerX = startX;

  // Ascend through the tower in vertical rhythm bands of 3-4 blocks
  for (let y = 3; y < height - 8; y += 3) {
    // A. PRIMARY RUNNER: Steps around the tower to guarantee continuous climb
    const nextSectorOffset = prng.nextFloat() > 0.4 ? 1 : -1; // 60% chance to spiral clockwise, 40% switchback
    activeSector = (activeSector + nextSectorOffset + numSectors) % numSectors;

    const sectorBaseX = activeSector * sectorWidth;
    runnerX = chunk.wrapX(sectorBaseX + prng.nextInt(2, sectorWidth - 5));

    // Place primary platform in active sector
    const primaryLen = prng.nextInt(4, 6);
    const isOneWay = prng.nextFloat() < 0.4;
    buildPlatform(
      chunk,
      runnerX,
      y,
      primaryLen,
      isOneWay ? BlockType.ONE_WAY_PLATFORM : BlockType.SOLID
    );

    // Add stairs or ramps at edges of platforms for traversal flow
    if (!isOneWay && primaryLen >= 4) {
      if (prng.nextFloat() < 0.35) {
        chunk.setVoxel(runnerX, y + 1, 1, BlockType.RAMP_UP_LEFT);
      } else if (prng.nextFloat() < 0.35) {
        chunk.setVoxel(runnerX + primaryLen - 1, y + 1, 1, BlockType.STAIRS_RIGHT);
      }
    }

    // B. EVEN POPULATION: Populate other sectors at this height band
    for (let s = 0; s < numSectors; s++) {
      if (s === activeSector) continue; // Already placed primary route

      // 65% chance to place a structure in this other sector (prevents empty voids!)
      if (prng.nextFloat() < 0.65) {
        const sX = chunk.wrapX(s * sectorWidth + prng.nextInt(1, sectorWidth - 5));
        const structureRoll = prng.nextFloat();

        if (structureRoll < 0.35) {
          // 1. One-way terrace balcony
          const len = prng.nextInt(3, 5);
          buildPlatform(chunk, sX, y, len, BlockType.ONE_WAY_PLATFORM);
        } else if (structureRoll < 0.60) {
          // 2. Solid stone ledge with potential hazards or bounce pad
          const len = prng.nextInt(3, 5);
          buildPlatform(chunk, sX, y, len, BlockType.SOLID);

          if (prng.nextFloat() < 0.3) {
            // Hazard spike
            chunk.setVoxel(sX + 1, y + 1, 1, BlockType.HAZARD_SPIKE);
          } else if (prng.nextFloat() < 0.25) {
            // Speedrun bounce pad
            chunk.setVoxel(sX + len - 1, y + 1, 1, BlockType.BOUNCE_PAD);
          }
        } else if (structureRoll < 0.80) {
          // 3. Crumbling speedrun bridge
          const len = prng.nextInt(3, 5);
          buildPlatform(chunk, sX, y, len, BlockType.CRUMBLE_PLATFORM);
        } else {
          // 4. Vertical wall-kick divider pillar with climbable vines
          const pillarH = prng.nextInt(4, 7);
          buildVerticalPillar(chunk, sX, y - 1, pillarH, true, prng.nextFloat() > 0.5 ? 'right' : 'left');
        }
      }
    }

    // C. PERIODIC CHAMBER DIVIDERS (Every 12-15 vertical blocks)
    // Creates vertical shafts and rooms without sealing off the whole screen
    if (y % 12 === 0) {
      const wallSector = prng.nextInt(0, numSectors - 1);
      const wallX = chunk.wrapX(wallSector * sectorWidth + 6);
      buildVerticalPillar(chunk, wallX, y, 9, prng.nextFloat() < 0.5, 'right');
    }
  }

  // --------------------------------------------------------------------------
  // 3. HIDDEN TREASURE ALCOVES (Chests in tucked corners)
  // --------------------------------------------------------------------------
  for (let s = 0; s < numSectors; s++) {
    const chestY = prng.nextInt(20, height - 20);
    const chestX = chunk.wrapX(s * sectorWidth + prng.nextInt(3, 8));

    // Ensure solid ground beneath chest
    buildPlatform(chunk, chestX - 1, chestY, 3, BlockType.SOLID);
    chunk.setVoxel(chestX, chestY + 1, 1, BlockType.CHEST);
    chunk.addEntity(BlockType.CHEST, chestX, chestY + 1, 1);
  }

  // --------------------------------------------------------------------------
  // 4. SUMMIT SANCTUARY & EXIT PORTAL
  // --------------------------------------------------------------------------
  const exitY = height - 5;
  const exitX = chunk.wrapX(runnerX);

  // Grand summit altar dais
  for (let dx = -3; dx <= 3; dx++) {
    chunk.setVoxel(exitX + dx, exitY, 1, BlockType.SOLID);
  }
  chunk.setVoxel(exitX - 3, exitY + 1, 1, BlockType.STAIRS_RIGHT);
  chunk.setVoxel(exitX + 3, exitY + 1, 1, BlockType.STAIRS_LEFT);
  chunk.setVoxel(exitX, exitY + 1, 1, BlockType.PORTAL_EXIT);
  chunk.addEntity(BlockType.PORTAL_EXIT, exitX, exitY + 1, 1);

  return chunk;
}

/**
 * Converts a 3D VoxelChunk into a flattened 2D grid slice at a given Z depth.
 */
export function chunkTo2DGrid(chunk: VoxelChunk, zDepth: number = 1): BlockType[][] {
  const grid: BlockType[][] = [];
  for (let y = 0; y < chunk.height; y++) {
    const row: BlockType[] = [];
    for (let x = 0; x < chunk.width; x++) {
      row.push(chunk.getVoxel(x, y, zDepth));
    }
    grid.push(row);
  }
  return grid;
}