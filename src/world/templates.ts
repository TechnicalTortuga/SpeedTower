import { BlockType } from './block_types';

const CHAR_TO_BLOCK: Record<string, BlockType> = {
  ' ': BlockType.AIR,
  '.': BlockType.AIR,
  '#': BlockType.SOLID,
  '█': BlockType.SOLID,
  '^': BlockType.HAZARD_SPIKE,
  '▲': BlockType.HAZARD_SPIKE,
  '=': BlockType.ONE_WAY_PLATFORM,
  '═': BlockType.ONE_WAY_PLATFORM,
  '~': BlockType.VINES,
  'b': BlockType.BOUNCE_PAD,
  '■': BlockType.BOUNCE_PAD,
  '*': BlockType.CRUMBLE_PLATFORM,
  '░': BlockType.CRUMBLE_PLATFORM,
  '>': BlockType.RAMP_UP_RIGHT,
  '↗': BlockType.RAMP_UP_RIGHT,
  '<': BlockType.RAMP_UP_LEFT,
  '↖': BlockType.RAMP_UP_LEFT,
  'R': BlockType.STAIRS_RIGHT,
  'L': BlockType.STAIRS_LEFT,
  'C': BlockType.CHEST,
  'S': BlockType.PORTAL_START,
  'E': BlockType.PORTAL_EXIT,
};

export interface MicroTemplate {
  name: string;
  category: 'ledge' | 'stairs' | 'hazard' | 'boost' | 'landmark';
  width: number;
  height: number;
  grid: BlockType[][];
}

export function parseAsciiTemplate(
  name: string,
  category: MicroTemplate['category'],
  asciiArt: string
): MicroTemplate {
  const rawLines = asciiArt
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (rawLines.length === 0) {
    throw new Error(`Template "${name}" is empty`);
  }

  const height = rawLines.length;
  const width = rawLines[0]?.length ?? 0;

  for (const line of rawLines) {
    if (line.length !== width) {
      throw new Error(`Template "${name}" has inconsistent line width.`);
    }
  }

  const grid: BlockType[][] = [];
  for (let i = rawLines.length - 1; i >= 0; i--) {
    const line = rawLines[i];
    if (!line) continue;
    const row: BlockType[] = [];
    for (let x = 0; x < line.length; x++) {
      const char = line[x] ?? '.';
      row.push(CHAR_TO_BLOCK[char] ?? BlockType.AIR);
    }
    grid.push(row);
  }

  return { name, category, width, height, grid };
}

export const TEMPLATE_REGISTRY: Record<string, MicroTemplate> = {
  // Ledges
  LEDGE_3: parseAsciiTemplate('LEDGE_3', 'ledge', `###`),
  LEDGE_5: parseAsciiTemplate('LEDGE_5', 'ledge', `#####`),
  ONE_WAY_4: parseAsciiTemplate('ONE_WAY_4', 'ledge', `====`),
  ONE_WAY_6: parseAsciiTemplate('ONE_WAY_6', 'ledge', `======`),

  // Native Stairs & Ramps (No giant solid fill)
  STAIR_RISE_RIGHT: parseAsciiTemplate('STAIR_RISE_RIGHT', 'stairs', `
    .R
    ##
  `),
  STAIR_RISE_LEFT: parseAsciiTemplate('STAIR_RISE_LEFT', 'stairs', `
    L.
    ##
  `),
  RAMP_RISE_RIGHT: parseAsciiTemplate('RAMP_RISE_RIGHT', 'stairs', `
    .>
    ##
  `),
  RAMP_RISE_LEFT: parseAsciiTemplate('RAMP_RISE_LEFT', 'stairs', `
    <.
    ##
  `),

  // Hazards
  SPIKE_STEP: parseAsciiTemplate('SPIKE_STEP', 'hazard', `
    .^^.
    ####
  `),
  SPIKE_PIT: parseAsciiTemplate('SPIKE_PIT', 'hazard', `
    #^^#
    ####
  `),

  // Boosts & Mechanics
  BOUNCE_LEDGE: parseAsciiTemplate('BOUNCE_LEDGE', 'boost', `
    b
    #
  `),
  CRUMBLE_BRIDGE_4: parseAsciiTemplate('CRUMBLE_BRIDGE_4', 'boost', `****`),
  CRUMBLE_BRIDGE_6: parseAsciiTemplate('CRUMBLE_BRIDGE_6', 'boost', `******`),

  // Vine Wall Slices
  VINE_STRIP_RIGHT: parseAsciiTemplate('VINE_STRIP_RIGHT', 'stairs', `
    #~
    #~
    #~
  `),
  VINE_STRIP_LEFT: parseAsciiTemplate('VINE_STRIP_LEFT', 'stairs', `
    ~#
    ~#
    ~#
  `),

  // Landmarks
  CHEST_ALCOVE: parseAsciiTemplate('CHEST_ALCOVE', 'landmark', `
    .C.
    ###
  `),
  START_ALTAR: parseAsciiTemplate('START_ALTAR', 'landmark', `
    ..S..
    #####
  `),
  SUMMIT_ALTAR: parseAsciiTemplate('SUMMIT_ALTAR', 'landmark', `
    ..E..
    #####
  `),
};

export function getTemplatesByCategory(category: MicroTemplate['category']): MicroTemplate[] {
  return Object.values(TEMPLATE_REGISTRY).filter((t) => t.category === category);
}