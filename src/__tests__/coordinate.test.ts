// src/__tests__/coordinate.test.ts
import { describe, it, expect } from 'vitest';
import {
  GRID_PX, METERS_PER_GRID, PAD,
  gridToSvg, svgToGrid, gridToMeters,
  metersToGrid, resolvePortPosition,
} from '../core/coordinate';

describe('coordinate', () => {
  describe('gridToSvg', () => {
    it('converts grid origin to padded SVG position', () => {
      const { x, y } = gridToSvg(0, 0);
      expect(x).toBe(PAD);
      expect(y).toBe(PAD);
    });

    it('converts grid (1,1) to correct SVG position', () => {
      const { x, y } = gridToSvg(1, 1);
      expect(x).toBe(PAD + GRID_PX);
      expect(y).toBe(PAD + GRID_PX);
    });

    it('handles fractional grid positions', () => {
      const { x, y } = gridToSvg(0.5, 0.5);
      expect(x).toBe(PAD + GRID_PX * 0.5);
      expect(y).toBe(PAD + GRID_PX * 0.5);
    });
  });

  describe('svgToGrid', () => {
    it('is the inverse of gridToSvg', () => {
      const { col, row } = svgToGrid(PAD + GRID_PX * 3, PAD + GRID_PX * 5);
      expect(col).toBeCloseTo(3);
      expect(row).toBeCloseTo(5);
    });
  });

  describe('gridToMeters', () => {
    it('converts grid units to game meters', () => {
      const { x, y } = gridToMeters(2, 3);
      expect(x).toBe(16);
      expect(y).toBe(24);
    });
  });

  describe('metersToGrid', () => {
    it('converts game meters to grid units', () => {
      const { col, row } = metersToGrid(16, 24);
      expect(col).toBe(2);
      expect(row).toBe(3);
    });
  });

  describe('resolvePortPosition', () => {
    it('computes port SVG position for south-facing machine', () => {
      const pos = resolvePortPosition(
        { col: 1, row: 1 },
        'south',
        { width: 6, length: 9, height: 9 },
        { id: 'in-0', kind: 'belt-in', side: 'back', offsetAlongEdge: 3, heightM: 1, direction: 'outward' as const },
      );
      expect(pos.x).toBeCloseTo(PAD + 1 * GRID_PX + (3 / METERS_PER_GRID) * GRID_PX);
      expect(pos.y).toBeCloseTo(PAD + 1 * GRID_PX);
    });

    it('rotates ports correctly for east-facing machine', () => {
      const pos = resolvePortPosition(
        { col: 2, row: 2 },
        'east',
        { width: 6, length: 9, height: 9 },
        { id: 'in-0', kind: 'belt-in', side: 'back', offsetAlongEdge: 3, heightM: 1, direction: 'outward' as const },
      );
      expect(pos.x).toBeCloseTo(PAD + 2 * GRID_PX);
      expect(pos.y).toBeCloseTo(PAD + 2 * GRID_PX + (3 / METERS_PER_GRID) * GRID_PX);
    });
  });
});
