import { describe, it, expect } from 'vitest';
import { VoxelChunk } from '../chunk';
import { BlockType, WORLD_CONSTANTS } from '../block_types';

describe('Unit 3: VoxelChunk Data Structure & Indexing', () => {
  it('should initialize a flat Uint8Array of exact size W * H * D', () => {
    const chunk = new VoxelChunk(0);
    const expectedSize =
      WORLD_CONSTANTS.CHUNK_WIDTH *
      WORLD_CONSTANTS.CHUNK_HEIGHT *
      WORLD_CONSTANTS.CHUNK_DEPTH;

    expect(chunk.voxels.length).toBe(expectedSize);
    expect(chunk.voxels instanceof Uint8Array).toBe(true);
  });

  it('should correctly store and retrieve a voxel at valid coordinates', () => {
    const chunk = new VoxelChunk(0);
    chunk.setVoxel(5, 10, 2, BlockType.SOLID);

    expect(chunk.getVoxel(5, 10, 2)).toBe(BlockType.SOLID);
    // Unset voxels must default to AIR (0)
    expect(chunk.getVoxel(5, 10, 1)).toBe(BlockType.AIR);
  });

  it('should seamlessly wrap X coordinates around the 360-degree circumference', () => {
    const chunk = new VoxelChunk(0); // width is 48

    // Setting at x = 32 should wrap to x = 0
    chunk.setVoxel(48, 4, 1, BlockType.VINES);
    expect(chunk.getVoxel(0, 4, 1)).toBe(BlockType.VINES);

    // Setting at x = -1 should wrap to x = 31
    chunk.setVoxel(-1, 2, 1, BlockType.HAZARD_SPIKE);
    expect(chunk.getVoxel(47, 2, 1)).toBe(BlockType.HAZARD_SPIKE);
  });

  it('should return AIR for out-of-bounds Y or Z without throwing errors', () => {
    const chunk = new VoxelChunk(0);
    
    // Out of bounds Y (height is 16)
    expect(chunk.getVoxel(0, 99, 1)).toBe(BlockType.AIR);
    expect(chunk.getVoxel(0, -5, 1)).toBe(BlockType.AIR);

    // Out of bounds Z (depth is 4)
    expect(chunk.getVoxel(0, 5, 10)).toBe(BlockType.AIR);
    expect(chunk.getVoxel(0, 5, -1)).toBe(BlockType.AIR);
  });

  it('should record entity spawn locations with wrapped X coordinates', () => {
    const chunk = new VoxelChunk(1);
    chunk.addEntity(BlockType.CHEST, 49, 4, 2);

    expect(chunk.entities.length).toBe(1);
    expect(chunk.entities[0]).toEqual({
      type: BlockType.CHEST,
      x: 1, // 49 wrapped on 48-wide circumference is 1
      y: 4,
      z: 2,
    });
  });
});