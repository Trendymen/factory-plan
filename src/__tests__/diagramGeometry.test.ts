// src/__tests__/diagramGeometry.test.ts
import { describe, it, expect } from 'vitest';
import {
  computeBounds,
  fitViewBox,
  safeGetBuildingMeta,
  machineSvgRect,
} from '../diagram/diagramGeometry';
import type { DiagramMachine } from '../diagram/diagramTypes';

describe('diagramGeometry', () => {
  describe('safeGetBuildingMeta', () => {
    it('returns live registry meta for known type', () => {
      const meta = safeGetBuildingMeta('smelter');
      expect(meta.dimensions).toEqual({ width: 6, length: 9, height: 10 });
      expect(meta.color).toBe('--smelter');
    });
    it('returns gray fallback for unknown type (does not throw)', () => {
      const meta = safeGetBuildingMeta('does-not-exist');
      expect(meta).toBeTruthy();
      expect(meta.dimensions.width).toBeGreaterThan(0);
      expect(meta.dimensions.length).toBeGreaterThan(0);
      expect(meta.color).not.toBe('--smelter');
    });
  });

  describe('machineSvgRect', () => {
    it('maps smelter south at col0,row0 to padded SVG rect by live registry dims', () => {
      const m: DiagramMachine = { id: 'S1', type: 'smelter', col: 0, row: 0, facing: 'south' };
      const r = machineSvgRect(m);
      expect(r.x).toBe(40);
      expect(r.y).toBe(40);
      expect(r.w).toBeCloseTo(0.75 * 80);
      expect(r.h).toBeCloseTo(1.125 * 80);
    });
    it('rotates dims for east facing (cols/rows swapped)', () => {
      const m: DiagramMachine = { id: 'S1', type: 'smelter', col: 0, row: 0, facing: 'east' };
      const r = machineSvgRect(m);
      expect(r.w).toBeCloseTo(1.125 * 80);
      expect(r.h).toBeCloseTo(0.75 * 80);
    });
    it('defaults facing to south when omitted', () => {
      const m: DiagramMachine = { id: 'S1', type: 'smelter', col: 0, row: 0 };
      const r = machineSvgRect(m);
      expect(r.w).toBeCloseTo(60);
      expect(r.h).toBeCloseTo(90);
    });
  });

  describe('computeBounds', () => {
    it('computes grid-cell bounds covering all machines footprints', () => {
      const machines: DiagramMachine[] = [
        { id: 'A', type: 'smelter', col: 0, row: 0, facing: 'south' },
        { id: 'B', type: 'smelter', col: 2, row: 1, facing: 'south' },
      ];
      const b = computeBounds(machines);
      expect(b.minCol).toBe(0);
      expect(b.minRow).toBe(0);
      expect(b.maxCol).toBeCloseTo(2.75);
      expect(b.maxRow).toBeCloseTo(2.125);
    });
    it('returns a 1x1 unit box when no machines', () => {
      const b = computeBounds([]);
      expect(b.maxCol - b.minCol).toBeGreaterThan(0);
      expect(b.maxRow - b.minRow).toBeGreaterThan(0);
    });
  });

  describe('fitViewBox', () => {
    it('returns a calcViewBox string sized from explicit grid', () => {
      const vb = fitViewBox({ cols: 5, rows: 5 }, []);
      expect(vb).toBe('0 0 480 480');
    });
    it('falls back to bounds-derived size when grid omitted', () => {
      const machines: DiagramMachine[] = [
        { id: 'A', type: 'smelter', col: 0, row: 0, facing: 'south' },
      ];
      const vb = fitViewBox(undefined, machines);
      expect(vb.startsWith('0 0 ')).toBe(true);
      const parts = vb.split(' ').map(Number);
      expect(parts.length).toBe(4);
      expect(parts[2]).toBeGreaterThan(0);
      expect(parts[3]).toBeGreaterThan(0);
    });
  });
});
