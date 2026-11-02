import { describe, it, expect } from 'vitest';
import { generateStage, chunkTo2DGrid } from '../generator';
import { printLevelPreview } from '../visualizer';
import { BlockType } from '../block_types';

describe('Unit 5: Expanded Dynamic Temple Stage Inspection', () => {
  it('should generate a 100% deterministic layout for identical seeds', () => {
    const seed = 3489354;
    const stageA = generateStage(seed, { width: 48, height: 96 });
    const stageB = generateStage(seed, { width: 48, height: 96 });

    expect(stageA.voxels.length).toBe(stageB.voxels.length);
    for (let i = 0; i < stageA.voxels.length; i++) {
      expect(stageA.voxels[i]).toBe(stageB.voxels[i]);
    }
  });

  it('should generate and print a full 48-wide x 96-high temple tower', () => {
    const seed = 20481;
    const stage = generateStage(seed, {
      width: 48,
      height: 96,
    });

    const grid = chunkTo2DGrid(stage, 1);

    expect(stage.entities.some((e) => e.type === BlockType.PORTAL_START)).toBe(true);
    expect(stage.entities.some((e) => e.type === BlockType.PORTAL_EXIT)).toBe(true);

    printLevelPreview(grid, `DYNAMIC TEMPLE ASCENT [Seed: ${seed}] (48x96)`);
  });
});