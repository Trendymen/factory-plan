// src/__tests__/schema.test.ts
import { describe, it, expect } from 'vitest';
import { validateScheme, buildSchemeIndex } from '../core/schema';
import type { Scheme } from '../core/types';

const MINIMAL_SCHEME: Scheme = {
  id: 'test-1',
  name: 'Test Scheme',
  version: '1.0.0',
  category: '测试',
  description: 'A test scheme',
  designPrinciples: {
    preferWallOutlets: true, preferWallHoles: true,
    preferCeilingMounts: false, keepFloorClear: true,
  },
  floors: [{ id: 1, label: '1F', heightM: 8, gridSize: { cols: 4, rows: 4 } }],
  machines: [
    { id: 's1', type: 'smelter', pos: { col: 1, row: 1 }, facing: 'south', floor: 1, recipe: '铁锭', label: 'S-1' },
  ],
  belts: [
    { id: 'b1', floor: 1, mark: 1, material: '铁锭', path: [{ col: 1, row: 2 }, { col: 3, row: 2 }], fromPort: 's1:out-0' },
  ],
  lifts: [],
  power: { poles: [], connections: [] },
  structures: [],
  zones: [],
  stats: { totalPowerMW: 4, inputs: [{ material: '铁矿石', rate: 30 }], outputs: [{ material: '铁锭', rate: 30 }] },
};

describe('schema', () => {
  it('validates a correct minimal scheme with no warnings', () => {
    const warnings = validateScheme(MINIMAL_SCHEME);
    expect(warnings).toHaveLength(0);
  });

  it('warns on unknown machine type', () => {
    const bad = { ...MINIMAL_SCHEME, machines: [{ ...MINIMAL_SCHEME.machines[0], type: 'unknown' as any }] };
    const warnings = validateScheme(bad);
    expect(warnings.some(w => w.includes('unknown'))).toBe(true);
  });

  it('warns on invalid floor reference', () => {
    const bad = { ...MINIMAL_SCHEME, machines: [{ ...MINIMAL_SCHEME.machines[0], floor: 99 }] };
    const warnings = validateScheme(bad);
    expect(warnings.some(w => w.includes('floor'))).toBe(true);
  });

  it('builds a correct scheme index', () => {
    const index = buildSchemeIndex(MINIMAL_SCHEME, '/data/schemes/test.json');
    expect(index.id).toBe('test-1');
    expect(index.name).toBe('Test Scheme');
    expect(index.floorCount).toBe(1);
    expect(index.filePath).toBe('/data/schemes/test.json');
  });
});
