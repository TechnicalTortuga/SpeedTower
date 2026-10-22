import { describe, it, expect } from 'vitest';
import { 
  BlockType, 
  WORLD_CONSTANTS, 
  isSolidBlock, 
  isHazardBlock, 
  isClimbableBlock, 
  isInteractiveBlock 
} from '../block_types';
import { PRNG } from '../prng';

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

describe('Unit 2: Deterministic PRNG', () => {
  it('should produce identical numbers for identical seeds', () => {
    const prng1 = new PRNG(1337);
    const prng2 = new PRNG(1337);

    for (let i = 0; i < 50; i++) {
      expect(prng1.nextFloat()).toBe(prng2.nextFloat());
    }
  });

  it('should bound nextInt within [min, max] inclusive', () => {
    const prng = new PRNG(9999);
    for (let i = 0; i < 100; i++) {
      const val = prng.nextInt(3, 7);
      expect(val).toBeGreaterThanOrEqual(3);
      expect(val).toBeLessThanOrEqual(7);
    }
  });

  it('should produce different sequences for different seeds', () => {
    const prngA = new PRNG(1);
    const prngB = new PRNG(2);
    expect(prngA.nextFloat()).not.toBe(prngB.nextFloat());
  });
});