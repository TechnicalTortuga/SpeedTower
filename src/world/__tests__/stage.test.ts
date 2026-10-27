import { describe, it, expect } from 'vitest';
import { VoxelStage } from '../stage';
import { BlockType, WORLD_CONSTANTS } from '../block_types';

describe('Unit 3: VoxelStage Data Structure & Indexing', () => {
  it('should initialize a flat Uint8Array of exact size W * H * D', () => {
    const chunk = new VoxelStage(0);
    const expectedSize =
      WORLD_CONSTANTS.STAGE_WIDTH *
      WORLD_CONSTANTS.STAGE_HEIGHT *
      WORLD_CONSTANTS.STAGE_DEPTH;

    expect(chunk.voxels.length).toBe(expectedSize);
    expect(chunk.voxels instanceof Uint8Array).toBe(true);
  });

  it('should correctly store and retrieve a voxel at valid coordinates', () => {
    const chunk = new VoxelStage(0);
    chunk.setVoxel(5, 10, 2, BlockType.SOLID);

    expect(chunk.getVoxel(5, 10, 2)).toBe(BlockType.SOLID);
    // Unset voxels must default to AIR (0)
    expect(chunk.getVoxel(5, 10, 1)).toBe(BlockType.AIR);
  });

  it('should seamlessly wrap X coordinates around the 360-degree circumference', () => {
    const chunk = new VoxelStage(0); // width is WORLD_CONSTANTS.STAGE_WIDTH

    // Setting at x = WORLD_CONSTANTS.STAGE_WIDTH should wrap to x = 0
    chunk.setVoxel(WORLD_CONSTANTS.STAGE_WIDTH, 4, 1, BlockType.VINES);
    expect(chunk.getVoxel(0, 4, 1)).toBe(BlockType.VINES);

    // Setting at x = -1 should wrap to x = WORLD_CONSTANTS.STAGE_WIDTH - 1
    chunk.setVoxel(-1, 2, 1, BlockType.HAZARD_SPIKE);
    expect(chunk.getVoxel(WORLD_CONSTANTS.STAGE_WIDTH - 1, 2, 1)).toBe(BlockType.HAZARD_SPIKE);
  });

  it('should return AIR for out-of-bounds Y or Z without throwing errors', () => {
    const chunk = new VoxelStage(0);
    
    // Out of bounds Y (height is 16)
    expect(chunk.getVoxel(0, 99, 1)).toBe(BlockType.AIR);
    expect(chunk.getVoxel(0, -5, 1)).toBe(BlockType.AIR);

    // Out of bounds Z (depth is 4)
    expect(chunk.getVoxel(0, 5, 10)).toBe(BlockType.AIR);
    expect(chunk.getVoxel(0, 5, -1)).toBe(BlockType.AIR);
  });

  it('should record entity spawn locations with wrapped X coordinates', () => {
    const chunk = new VoxelStage(1);
    chunk.addEntity(BlockType.CHEST, 49, 4, 2);

    expect(chunk.entities.length).toBe(1);
    expect(chunk.entities[0]).toEqual({
      type: BlockType.CHEST,
      x: 1, // 49 wrapped on WORLD_CONSTANTS.STAGE_WIDTH-wide circumference is 1
      y: 4,
      z: 2,
    });
  });
});