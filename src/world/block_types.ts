/**
 * Block & Object IDs for SpeedTower.
 * Fits within a Uint8Array (0-255).
 */
export enum BlockType {
  AIR = 0,
  SOLID = 1,
  RAMP_UP_RIGHT = 2,
  RAMP_UP_LEFT = 3,
  STAIRS_RIGHT = 4,
  STAIRS_LEFT = 5,
  ONE_WAY_PLATFORM = 6,
  HAZARD_SPIKE = 7,
  BOUNCE_PAD = 8,
  CRUMBLE_PLATFORM = 9,
  VINES = 10,
  CHEST = 11,
  PORTAL_START = 12,
  PORTAL_EXIT = 13,
}

/**
 * Standard World & Chunk Constraints.
 */
export const WORLD_CONSTANTS = {
  /** Width around the tower circumference (in blocks) */
  STAGE_WIDTH: 48,
  /** Height of the tower (in blocks) */
  STAGE_HEIGHT: 96,
  /** Radial ledge depth for 3D extrusion (in blocks) */
  STAGE_DEPTH: 4,
} as const;

/**
 * Solid physical obstacles that block player movement.
 */
export function isSolidBlock(type: BlockType): boolean {
  return (
    type === BlockType.SOLID ||
    type === BlockType.RAMP_UP_RIGHT ||
    type === BlockType.RAMP_UP_LEFT ||
    type === BlockType.STAIRS_RIGHT ||
    type === BlockType.STAIRS_LEFT ||
    type === BlockType.CRUMBLE_PLATFORM
  );
}

/**
 * Hazard blocks that cause damage or restart the stage.
 */
export function isHazardBlock(type: BlockType): boolean {
  return type === BlockType.HAZARD_SPIKE;
}

/**
 * Climbable surfaces (vines, ladders) that allow vertical gripping.
 */
export function isClimbableBlock(type: BlockType): boolean {
  return type === BlockType.VINES;
}

/**
 * Interactive non-solid entities (pickups, triggers, ports).
 */
export function isInteractiveBlock(type: BlockType): boolean {
  return (
    type === BlockType.BOUNCE_PAD ||
    type === BlockType.ONE_WAY_PLATFORM ||
    type === BlockType.VINES ||
    type === BlockType.CHEST ||
    type === BlockType.PORTAL_START ||
    type === BlockType.PORTAL_EXIT
  );
}