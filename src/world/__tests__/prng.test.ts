import { describe, it, expect } from 'vitest';
import { PRNG } from '../prng';

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