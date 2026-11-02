import { BlockType } from './block_types';

/**
 * Symbol map for ASCII terminal rendering of voxel layers.
 */
const SYMBOL_MAP: Record<BlockType, string> = {
  [BlockType.AIR]: '  ',
  [BlockType.SOLID]: '██',
  [BlockType.RAMP_UP_RIGHT]: ' ↗',
  [BlockType.RAMP_UP_LEFT]: '↖ ',
  [BlockType.STAIRS_RIGHT]: ' ⌗',
  [BlockType.STAIRS_LEFT]: '⌗ ',
  [BlockType.ONE_WAY_PLATFORM]: '══',
  [BlockType.HAZARD_SPIKE]: '▲▲',
  [BlockType.BOUNCE_PAD]: '■■',
  [BlockType.CRUMBLE_PLATFORM]: '░░',
  [BlockType.VINES]: '~~',
  [BlockType.CHEST]: '[]',
  [BlockType.PORTAL_START]: 'SS',
  [BlockType.PORTAL_EXIT]: 'EE',
};

/**
 * Renders an arbitrary 2D slice (width x height) as a readable ASCII string.
 * grid[y][x]: y=0 is the bottom floor, y=height-1 is the ceiling.
 */
export function render2DGrid(grid: BlockType[][]): string {
  const height = grid.length;
  if (height === 0) return '';
  
  const firstRow = grid[0];
  if (!firstRow) return '';
  const width = firstRow.length;

  const lines: string[] = [];

  // Top border
  lines.push(`    ┌${'──'.repeat(width)}┐ (wrapping seam)`);

  // Render from top down so ceiling is top and ground is bottom
  for (let y = height - 1; y >= 0; y--) {
    const row = grid[y];
    if (!row) continue; // Guarantees row is defined

    const yLabel = y.toString().padStart(3, ' ');
    const rowStr = row.map((b) => SYMBOL_MAP[b] ?? '??').join('');
    lines.push(`${yLabel} │${rowStr}│`);
  }

  // Bottom border
  lines.push(`    └${'──'.repeat(width)}┘`);
  
  // X-axis index footer
  let footer = '      ';
  for (let x = 0; x < width; x += 4) {
    footer += x.toString().padEnd(8, ' ');
  }
  lines.push(footer);

  return lines.join('\n');
}

/**
 * Logs a full stage or chunk directly to the terminal.
 */
export function printLevelPreview(grid: BlockType[][], title: string = 'Level Preview'): void {
  console.log(`\n=== ${title} ===`);
  console.log(render2DGrid(grid));
  console.log('Legend: [██] Solid  [▲▲] Spike  [══] One-Way  [~~] Vine  [■■] Bounce  [EE] Exit\n');
}