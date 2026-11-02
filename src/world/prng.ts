/**
 * Deterministic Pseudo-Random Number Generator (Mulberry32).
 * Enforces cross-platform determinism across level generation runs.
 */
export class PRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  /**
   * Returns a deterministic pseudo-random float in [0, 1).
   */
  public nextFloat(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns a deterministic integer in range [min, max] (inclusive).
   */
  public nextInt(min: number, max: number): number {
    const minCeil = Math.ceil(min);
    const maxFloor = Math.floor(max);
    return Math.floor(this.nextFloat() * (maxFloor - minCeil + 1)) + minCeil;
  }

  /**
   * Resets the PRNG to a specific state or new seed.
   */
  public setSeed(seed: number): void {
    this.state = seed >>> 0;
  }
}