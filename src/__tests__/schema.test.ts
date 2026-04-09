// src/__tests__/schema.test.ts
import { describe, it, expect } from 'vitest';
import { validateScheme, validateSchemeDetailed } from '../core/schema';
import { buildSchemeIndex } from '../core/schema';
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
  floors: [{ id: 1, label: '1F', heightM: 8, gridSize: { cols: 8, rows: 8 } }],
  machines: [
    { id: 's1', type: 'smelter', pos: { col: 1, row: 1 }, facing: 'south', floor: 1, recipe: '铁锭', label: 'S-1' },
    { id: 'sp1', type: 'splitter', pos: { col: 1, row: 2.5 }, facing: 'south', floor: 1, label: '分流' },
  ],
  belts: [
    { id: 'b1', floor: 1, mark: 1, material: '铁锭', path: [{ col: 1.375, row: 2.125 }, { col: 1.375, row: 2.5 }], fromPort: 's1:out-0', toPort: 'sp1:in-0' },
  ],
  lifts: [],
  structures: [],
  zones: [],
  stats: { totalPowerMW: 4, inputs: [{ material: '铁矿石', rate: 30 }], outputs: [{ material: '铁锭', rate: 30 }] },
};

describe('schema', () => {
  it('validates a correct minimal scheme with no errors', () => {
    const issues = validateSchemeDetailed(MINIMAL_SCHEME);
    const errors = issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });

  it('R1: warns on unknown machine type', () => {
    const bad = { ...MINIMAL_SCHEME, machines: [{ ...MINIMAL_SCHEME.machines[0], type: 'unknown' as any }] };
    const issues = validateSchemeDetailed(bad);
    expect(issues.some(i => i.rule === 'R1-type')).toBe(true);
  });

  it('R1: warns on invalid floor reference', () => {
    const bad = { ...MINIMAL_SCHEME, machines: [{ ...MINIMAL_SCHEME.machines[0], floor: 99 }] };
    const issues = validateSchemeDetailed(bad);
    expect(issues.some(i => i.rule === 'R1-floor')).toBe(true);
  });

  it('R2: warns on non-aligned machine position', () => {
    const bad = {
      ...MINIMAL_SCHEME,
      machines: [{ ...MINIMAL_SCHEME.machines[0], pos: { col: 1.13, row: 2.37 } }],
    };
    const issues = validateSchemeDetailed(bad);
    expect(issues.some(i => i.rule === 'R2-align')).toBe(true);
  });

  it('R3: errors on machine out of bounds', () => {
    const bad = {
      ...MINIMAL_SCHEME,
      machines: [{ ...MINIMAL_SCHEME.machines[0], pos: { col: 10, row: 1 } }],
    };
    const issues = validateSchemeDetailed(bad);
    expect(issues.some(i => i.rule === 'R3-bounds')).toBe(true);
  });

  it('R4: warns on missing fromPort/toPort', () => {
    const bad = {
      ...MINIMAL_SCHEME,
      belts: [{ id: 'b1', floor: 1, mark: 1 as const, material: '铁锭', path: [{ col: 1, row: 2 }, { col: 3, row: 2 }] }],
    };
    const issues = validateSchemeDetailed(bad);
    expect(issues.filter(i => i.rule === 'R4-fromPort').length).toBe(1);
    expect(issues.filter(i => i.rule === 'R4-toPort').length).toBe(1);
  });

  it('R5: errors on invalid port ref format', () => {
    const bad = {
      ...MINIMAL_SCHEME,
      belts: [{ ...MINIMAL_SCHEME.belts[0], fromPort: 'no-colon' }],
    };
    const issues = validateSchemeDetailed(bad);
    expect(issues.some(i => i.rule === 'R5-format')).toBe(true);
  });

  it('R7: errors on diagonal belt segment', () => {
    const bad = {
      ...MINIMAL_SCHEME,
      belts: [{
        id: 'b-diag', floor: 1, mark: 1 as const, material: '铁锭',
        path: [{ col: 1, row: 1 }, { col: 3, row: 3 }],
        fromPort: 's1:out-0', toPort: 'sp1:in-0',
      }],
    };
    const issues = validateSchemeDetailed(bad);
    expect(issues.some(i => i.rule === 'R7-orthogonal')).toBe(true);
  });

  it('R7: passes orthogonal belt path', () => {
    const ok = {
      ...MINIMAL_SCHEME,
      belts: [{
        id: 'b-ok', floor: 1, mark: 1 as const, material: '铁锭',
        path: [{ col: 1, row: 1 }, { col: 1, row: 3 }, { col: 3, row: 3 }],
        fromPort: 's1:out-0', toPort: 'sp1:in-0',
      }],
    };
    const issues = validateSchemeDetailed(ok);
    expect(issues.filter(i => i.rule === 'R7-orthogonal')).toHaveLength(0);
  });

  it('R12: errors on duplicate IDs', () => {
    const bad = {
      ...MINIMAL_SCHEME,
      machines: [MINIMAL_SCHEME.machines[0], { ...MINIMAL_SCHEME.machines[0] }],
    };
    const issues = validateSchemeDetailed(bad);
    expect(issues.some(i => i.rule === 'R12-unique')).toBe(true);
  });

  it('R13: errors on overlapping machines', () => {
    const bad = {
      ...MINIMAL_SCHEME,
      machines: [
        { id: 'm1', type: 'smelter' as const, pos: { col: 1, row: 1 }, facing: 'south' as const, floor: 1 },
        { id: 'm2', type: 'smelter' as const, pos: { col: 1.5, row: 1 }, facing: 'south' as const, floor: 1 },
      ],
      belts: [],
    };
    const issues = validateSchemeDetailed(bad);
    expect(issues.some(i => i.rule === 'R13-collision')).toBe(true);
  });

  it('R13: no collision for machines on different floors', () => {
    const ok = {
      ...MINIMAL_SCHEME,
      floors: [
        { id: 1, label: '1F', heightM: 8, gridSize: { cols: 8, rows: 8 } },
        { id: 2, label: '2F', heightM: 8, gridSize: { cols: 8, rows: 8 } },
      ],
      machines: [
        { id: 'm1', type: 'smelter' as const, pos: { col: 1, row: 1 }, facing: 'south' as const, floor: 1 },
        { id: 'm2', type: 'smelter' as const, pos: { col: 1, row: 1 }, facing: 'south' as const, floor: 2 },
      ],
      belts: [],
    };
    const issues = validateSchemeDetailed(ok);
    expect(issues.filter(i => i.rule === 'R13-collision')).toHaveLength(0);
  });

  it('R13: no collision for adjacent non-overlapping machines', () => {
    const ok = {
      ...MINIMAL_SCHEME,
      machines: [
        { id: 'm1', type: 'smelter' as const, pos: { col: 1, row: 1 }, facing: 'south' as const, floor: 1 },
        { id: 'm2', type: 'smelter' as const, pos: { col: 2, row: 1 }, facing: 'south' as const, floor: 1 },
      ],
      belts: [],
    };
    const issues = validateSchemeDetailed(ok);
    expect(issues.filter(i => i.rule === 'R13-collision')).toHaveLength(0);
  });

  it('R14: warns when belt crosses unrelated machine', () => {
    const bad = {
      ...MINIMAL_SCHEME,
      machines: [
        MINIMAL_SCHEME.machines[0], // s1 at (1,1)
        MINIMAL_SCHEME.machines[1], // sp1 at (1,2.5)
        { id: 'blocker', type: 'constructor' as const, pos: { col: 1, row: 1.75 }, facing: 'south' as const, floor: 1 },
      ],
      belts: [{
        id: 'b-cross', floor: 1, mark: 1 as const, material: '铁锭',
        path: [{ col: 1.5, row: 1 }, { col: 1.5, row: 3 }],
        fromPort: 's1:out-0', toPort: 'sp1:in-0',
      }],
    };
    const issues = validateSchemeDetailed(bad);
    expect(issues.some(i => i.rule === 'R14-belt-cross')).toBe(true);
  });

  it('R15: warns on overlapping belt segments', () => {
    const bad = {
      ...MINIMAL_SCHEME,
      belts: [
        { id: 'b1', floor: 1, mark: 1 as const, material: '铁锭',
          path: [{ col: 1, row: 1 }, { col: 1, row: 3 }], fromPort: 's1:out-0', toPort: 'sp1:in-0' },
        { id: 'b2', floor: 1, mark: 1 as const, material: '铁板',
          path: [{ col: 1, row: 2 }, { col: 1, row: 4 }], fromPort: 's1:out-0', toPort: 'sp1:in-0' },
      ],
    };
    const issues = validateSchemeDetailed(bad);
    expect(issues.some(i => i.rule === 'R15-belt-overlap')).toBe(true);
  });

  it('buildSchemeIndex produces correct index', () => {
    const index = buildSchemeIndex(MINIMAL_SCHEME, '/data/schemes/test.json');
    expect(index.id).toBe('test-1');
    expect(index.name).toBe('Test Scheme');
    expect(index.floorCount).toBe(1);
    expect(index.filePath).toBe('/data/schemes/test.json');
  });

  it('legacy validateScheme returns string array', () => {
    const warnings = validateScheme(MINIMAL_SCHEME);
    expect(Array.isArray(warnings)).toBe(true);
  });
});
