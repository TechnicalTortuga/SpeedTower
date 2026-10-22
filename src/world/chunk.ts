import { BlockType, WORLD_CONSTANTS } from './block_types';

export interface EntitySpawn {
  type: BlockType;
  x: number;
  y: number;
  z: number;
}

/**
 * VoxelChunk: Represents a single vertical 3D slice of the tower.
 * Stores voxel IDs in a flat, contiguous Uint8Array.
 */
export class VoxelChunk {
  public readonly chunkY: number;
  public readonly width: number;
  public readonly height: number;
  public readonly depth: number;
  
  /** Raw byte buffer consumed directly by Graphics (Mesher) and Physics */
  public readonly voxels: Uint8Array;
  
  /** Dynamic entity spawn markers (Chests, Portals) */
  public readonly entities: EntitySpawn[] = [];

  constructor(
    chunkY: number,
    width: number = WORLD_CONSTANTS.CHUNK_WIDTH,
    height: number = WORLD_CONSTANTS.CHUNK_HEIGHT,
    depth: number = WORLD_CONSTANTS.CHUNK_DEPTH
  ) {
    this.chunkY = chunkY;
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.voxels = new Uint8Array(width * height * depth);
  }

  /**
   * Helper to wrap horizontal X around the tower circumference (360 degrees).
   */
  public wrapX(x: number): number {
    return ((x % this.width) + this.width) % this.width;
  }

  /**
   * Converts 3D coordinates into a 1D flat buffer index.
   */
  public getIndex(x: number, y: number, z: number): number {
    const wrappedX = this.wrapX(x);
    return wrappedX + this.width * (y + this.height * z);
  }

  /**
   * Safely reads a block ID at (x, y, z). Returns BlockType.AIR if Y or Z are out of bounds.
   */
  public getVoxel(x: number, y: number, z: number): BlockType {
    if (y < 0 || y >= this.height || z < 0 || z >= this.depth) {
      return BlockType.AIR;
    }
    const idx = this.getIndex(x, y, z);
    return (this.voxels[idx] ?? BlockType.AIR) as BlockType;
  }

  /**
   * Sets a block ID at (x, y, z). Automatically wraps X around the tower.
   */
  public setVoxel(x: number, y: number, z: number, type: BlockType): void {
    if (y < 0 || y >= this.height || z < 0 || z >= this.depth) {
      return;
    }
    const idx = this.getIndex(x, y, z);
    this.voxels[idx] = type;
  }

  /**
   * Registers a special object/entity location (e.g. Chest or Portal).
   */
  public addEntity(type: BlockType, x: number, y: number, z: number): void {
    this.entities.push({
      type,
      x: this.wrapX(x),
      y,
      z,
    });
  }
}