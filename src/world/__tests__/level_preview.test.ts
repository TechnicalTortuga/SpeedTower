import { describe, it, expect } from 'vitest';
import { BlockType, WORLD_CONSTANTS } from '../block_types';
import { printLevelPreview, render2DGrid } from '../visualizer';

describe('Level Visualizer Preview Test', () => {
  it('should render and print a readable 2D level preview', () => {
    const width = WORLD_CONSTANTS.CHUNK_WIDTH;
    const height = WORLD_CONSTANTS.CHUNK_HEIGHT * 2; // 32 blocks tall (2 stacked chunks)

    // Create empty grid filled with AIR
    const grid: BlockType[][] = Array.from({ length: height }, () =>
      Array(width).fill(BlockType.AIR)
    );

    // Type-safe coordinate assignment helper
    const setBlock = (x: number, y: number, type: BlockType): void => {
      const row = grid[y];
      if (row && x >= 0 && x < width) {
        row[x] = type;
      }
    };

    // 1. Base floor & start portal
    for (let x = 0; x < width; x++) {
      setBlock(x, 0, BlockType.SOLID);
    }
    setBlock(2, 1, BlockType.PORTAL_START);

    // 2. Ascending staircase with a spike hazard
    setBlock(6, 3, BlockType.SOLID);
    setBlock(7, 3, BlockType.SOLID);
    setBlock(8, 3, BlockType.SOLID);
    setBlock(7, 4, BlockType.HAZARD_SPIKE);

    // 3. Wall with climbable vines
    for (let y = 5; y <= 12; y++) {
      setBlock(14, y, BlockType.SOLID);
      setBlock(15, y, BlockType.VINES);
    }

    // 4. One-way jump-through platforms overhead
    setBlock(10, 15, BlockType.ONE_WAY_PLATFORM);
    setBlock(11, 15, BlockType.ONE_WAY_PLATFORM);
    setBlock(12, 15, BlockType.ONE_WAY_PLATFORM);

    // 5. Summit exit portal on high ledge
    setBlock(24, 28, BlockType.SOLID);
    setBlock(25, 28, BlockType.SOLID);
    setBlock(26, 28, BlockType.SOLID);
    setBlock(25, 29, BlockType.PORTAL_EXIT);

    // Assert grid sizing invariants
    expect(grid.length).toBe(height);
    expect(grid[0]?.length).toBe(width);

    // Verify string rendering works
    const output = render2DGrid(grid);
    expect(output).toContain('SS');
    expect(output).toContain('EE');
    expect(output).toContain('~~');
    expect(output).toContain('▲▲');

    // Print to test runner output
    printLevelPreview(grid, 'SpeedTower Stage 1 Mockup');
  });
});