// src/__tests__/registry.test.ts
import { describe, it, expect } from 'vitest';
import { MATERIAL_COLORS, getBuildingMeta } from '../core/registry';

describe('registry', () => {
  it('has metadata for all production machines', () => {
    const types = ['smelter', 'foundry', 'constructor', 'assembler', 'manufacturer'];
    for (const t of types) {
      const meta = getBuildingMeta(t as any);
      expect(meta).toBeDefined();
      expect(meta.dimensions.width).toBeGreaterThan(0);
      expect(meta.ports.length).toBeGreaterThan(0);
    }
  });

  it('manufacturer has inputs on front (unique)', () => {
    const meta = getBuildingMeta('manufacturer');
    const inputPorts = meta.ports.filter(p => p.kind === 'belt-in');
    expect(inputPorts.every(p => p.side === 'front')).toBe(true);
  });

  it('all other production machines have inputs on back', () => {
    const types = ['smelter', 'foundry', 'constructor', 'assembler'] as const;
    for (const t of types) {
      const meta = getBuildingMeta(t);
      const inputPorts = meta.ports.filter(p => p.kind === 'belt-in');
      expect(inputPorts.every(p => p.side === 'back')).toBe(true);
    }
  });

  it('has material colors for iron chain products', () => {
    expect(MATERIAL_COLORS['铁矿石']).toBeDefined();
    expect(MATERIAL_COLORS['铁锭']).toBeDefined();
    expect(MATERIAL_COLORS['铁板']).toBeDefined();
    expect(MATERIAL_COLORS['铁棒']).toBeDefined();
    expect(MATERIAL_COLORS['螺丝']).toBeDefined();
  });

  it('has material colors for copper chain products', () => {
    expect(MATERIAL_COLORS['铜矿石']).toBeDefined();
    expect(MATERIAL_COLORS['铜锭']).toBeDefined();
    expect(MATERIAL_COLORS['电线']).toBeDefined();
    expect(MATERIAL_COLORS['线缆']).toBeDefined();
  });

  it('smelter dimensions match wiki data (5x10)', () => {
    const meta = getBuildingMeta('smelter');
    expect(meta.dimensions).toEqual({ width: 5, length: 10, height: 9 });
  });

  it('assembler dimensions match wiki data (9x16)', () => {
    const meta = getBuildingMeta('assembler');
    expect(meta.dimensions).toEqual({ width: 9, length: 16, height: 11 });
  });

  it('new production machine types are registered', () => {
    const newTypes = ['refinery', 'packager', 'blender', 'particle-accelerator', 'quantum-encoder', 'converter'];
    for (const t of newTypes) {
      const meta = getBuildingMeta(t as any);
      expect(meta).toBeDefined();
      expect(meta.dimensions.width).toBeGreaterThan(0);
      expect(meta.ports.length).toBeGreaterThan(0);
    }
  });

  it('assembler has 2 belt inputs and 1 belt output', () => {
    const meta = getBuildingMeta('assembler');
    expect(meta.ports.filter(p => p.kind === 'belt-in').length).toBe(2);
    expect(meta.ports.filter(p => p.kind === 'belt-out').length).toBe(1);
  });
});
