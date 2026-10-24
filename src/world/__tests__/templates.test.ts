import { describe, it, expect } from 'vitest';
import { 
  parseAsciiTemplate, 
  getTemplatesByCategory 
} from '../templates';
import { BlockType } from '../block_types';

describe('Unit 4: Micro-Templates Catalog and Parser', () => {
  it('should parse an ASCII string into an inverted grid where y=0 is the bottom floor', () => {
    const rawAscii = `
      ...
      .C.
      ###
    `;
    const template = parseAsciiTemplate('TEST_ALCOVE', 'landmark', rawAscii);

    expect(template.width).toBe(3);
    expect(template.height).toBe(3);
    expect(template.category).toBe('landmark');

    // Bottom row (y=0) is solid
    expect(template.grid[0]?.[0]).toBe(BlockType.SOLID);
    expect(template.grid[0]?.[1]).toBe(BlockType.SOLID);

    // Middle row (y=1) has the chest
    expect(template.grid[1]?.[1]).toBe(BlockType.CHEST);

    // Top row (y=2) is air
    expect(template.grid[2]?.[1]).toBe(BlockType.AIR);
  });

  it('should correctly filter templates by category', () => {
    const hazards = getTemplatesByCategory('hazard');
    const boosts = getTemplatesByCategory('boost');
    const ledges = getTemplatesByCategory('ledge');

    expect(hazards.length).toBeGreaterThan(0);
    expect(boosts.length).toBeGreaterThan(0);
    expect(ledges.length).toBeGreaterThan(0);

    for (const h of hazards) {
      expect(h.category).toBe('hazard');
    }
  });
});