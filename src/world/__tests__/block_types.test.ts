import { describe, it, expect } from 'vitest';
import { 
  BlockType, 
  WORLD_CONSTANTS, 
  isSolidBlock, 
  isHazardBlock, 
  isClimbableBlock, 
  isInteractiveBlock 
} from '../block_types';

describe('Unit 1: Block Types and World Dimensions', () => {
  it('should have non-colliding block IDs', () => {
    const ids = Object.values(BlockType).filter((v) => typeof v === 'number');
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('should correctly identify solid, hazard, climbable, and interactive flags', () => {
    expect(isSolidBlock(BlockType.SOLID)).toBe(true);
    expect(isSolidBlock(BlockType.VINES)).toBe(false);

    expect(isHazardBlock(BlockType.HAZARD_SPIKE)).toBe(true);
    expect(isHazardBlock(BlockType.VINES)).toBe(false);

    expect(isClimbableBlock(BlockType.VINES)).toBe(true);
    expect(isClimbableBlock(BlockType.SOLID)).toBe(false);

    expect(isInteractiveBlock(BlockType.VINES)).toBe(true);
    expect(isInteractiveBlock(BlockType.BOUNCE_PAD)).toBe(true);
  });

  it('should freeze dimensions according to design constraints', () => {
    expect(WORLD_CONSTANTS.CHUNK_WIDTH).toBe(32);
    expect(WORLD_CONSTANTS.CHUNK_HEIGHT).toBe(16);
    expect(WORLD_CONSTANTS.CHUNK_DEPTH).toBe(4);
  });
});

