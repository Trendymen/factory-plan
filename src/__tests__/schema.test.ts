// src/__tests__/schema.test.ts
import { describe, it, expect } from 'vitest';
import { validateScheme, validateSchemeDetailed } from '../core/schema';
import { buildSchemeIndex } from '../core/schema';
import type { Scheme, MachineInstance, PlaceableType, LiftPair } from '../core/types';

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
  liftPairs: [],
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

  it('R17: warns on belt path that loops back to starting area', () => {
    // 6 点绕圈：起于 (2,4)，绕一圈又回到 (2,4) 附近
    // bbox 半周长 = 0.75 + 1.25 = 2.0, 总长 = 0.5+0.75+1.25+0.75+0.75 = 4.0, 比 2.0
    const bad = {
      ...MINIMAL_SCHEME,
      belts: [{
        id: 'b_loop',
        floor: 1,
        mark: 1 as const,
        material: '铁锭',
        path: [
          { col: 2, row: 4 },
          { col: 2, row: 4.5 },
          { col: 1.25, row: 4.5 },
          { col: 1.25, row: 3.25 },
          { col: 2, row: 3.25 },
          { col: 2, row: 4 },
        ],
        fromPort: 's1:out-0',
        toPort: 'sp1:in-0',
      }],
    };
    const issues = validateSchemeDetailed(bad);
    expect(issues.some(i => i.rule === 'R17-belt-backtrack')).toBe(true);
  });

  it('R17: does NOT warn on reasonable L-shape detour', () => {
    // 正常 L 形：path 长 = bbox 半周长，比 1.0
    const ok = {
      ...MINIMAL_SCHEME,
      belts: [{
        id: 'b_L',
        floor: 1,
        mark: 1 as const,
        material: '铁锭',
        path: [
          { col: 1, row: 1 },
          { col: 1, row: 4.5 },
          { col: 1.75, row: 4.5 },
          { col: 1.75, row: 4.75 },
        ],
        fromPort: 's1:out-0',
        toPort: 'sp1:in-0',
      }],
    };
    const issues = validateSchemeDetailed(ok);
    expect(issues.some(i => i.rule === 'R17-belt-backtrack')).toBe(false);
  });

  it('R17: does NOT warn on straight-line belt', () => {
    const ok = {
      ...MINIMAL_SCHEME,
      belts: [{
        id: 'b_straight',
        floor: 1,
        mark: 1 as const,
        material: '铁锭',
        path: [{ col: 2, row: 1 }, { col: 2, row: 5 }],
        fromPort: 's1:out-0',
        toPort: 'sp1:in-0',
      }],
    };
    const issues = validateSchemeDetailed(ok);
    expect(issues.some(i => i.rule === 'R17-belt-backtrack')).toBe(false);
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

describe('R18 - LiftPair 一致性', () => {
  function makeLiftMachine(id: string, type: PlaceableType, floor: number, col = 1.5, row = 6.5): MachineInstance {
    return { id, type, floor, facing: 'south', pos: { col, row } };
  }

  function baseScheme(machines: MachineInstance[], liftPairs: LiftPair[]): Scheme {
    return {
      id: 'test', name: 'test', version: '1.0.0', category: 'test', description: '',
      designPrinciples: { preferWallOutlets: false, preferWallHoles: false, preferCeilingMounts: false, keepFloorClear: false },
      floors: [
        { id: 1, label: 'F1', heightM: 4, gridSize: { cols: 8, rows: 8 } },
        { id: 2, label: 'F2', heightM: 4, gridSize: { cols: 8, rows: 8 } },
      ],
      machines, belts: [], liftPairs, structures: [], zones: [],
      stats: { totalPowerMW: 0, inputs: [], outputs: [] },
    };
  }

  it('pair 引用不存在的机器 → error', () => {
    const scheme = baseScheme([], [
      { id: 'lp1', bottomMachine: 'missing_bot', topMachine: 'missing_top', material: '铁板', mark: 1 },
    ]);
    const issues = validateSchemeDetailed(scheme);
    expect(issues.some(i => i.severity === 'error' && i.rule.startsWith('R18'))).toBe(true);
  });

  it('合法向上运输 pair → 无 R18 error', () => {
    const scheme = baseScheme([
      makeLiftMachine('bot', 'conveyor-lift-in-bottom', 1),
      makeLiftMachine('top', 'conveyor-lift-out-top', 2),
    ], [
      { id: 'lp1', bottomMachine: 'bot', topMachine: 'top', material: '铁板', mark: 1 },
    ]);
    const issues = validateSchemeDetailed(scheme);
    expect(issues.filter(i => i.severity === 'error' && i.rule.startsWith('R18'))).toEqual([]);
  });

  it('非法类型组合（bottom 机器用 top 类型）→ error', () => {
    const scheme = baseScheme([
      makeLiftMachine('bot', 'conveyor-lift-out-top', 1),
      makeLiftMachine('top', 'conveyor-lift-in-bottom', 2),
    ], [
      { id: 'lp1', bottomMachine: 'bot', topMachine: 'top', material: '铁板', mark: 1 },
    ]);
    const issues = validateSchemeDetailed(scheme);
    expect(issues.some(i => i.severity === 'error' && i.rule.startsWith('R18'))).toBe(true);
  });

  it('跨越多层（floor 差不为 1）→ error', () => {
    const scheme = baseScheme([
      makeLiftMachine('bot', 'conveyor-lift-in-bottom', 1),
      { id: 'top', type: 'conveyor-lift-out-top', floor: 3, facing: 'south', pos: { col: 1.5, row: 6.5 } },
    ], [
      { id: 'lp1', bottomMachine: 'bot', topMachine: 'top', material: '铁板', mark: 1 },
    ]);
    // 添加 floor 3 避免 R1-floor 失败抢先
    scheme.floors.push({ id: 3, label: 'F3', heightM: 4, gridSize: { cols: 8, rows: 8 } });
    const issues = validateSchemeDetailed(scheme);
    expect(issues.some(i => i.severity === 'error' && i.rule.startsWith('R18'))).toBe(true);
  });

  it('pair 两端 pos 不相等 → error', () => {
    const scheme = baseScheme([
      makeLiftMachine('bot', 'conveyor-lift-in-bottom', 1, 1.5, 6.5),
      makeLiftMachine('top', 'conveyor-lift-out-top', 2, 2.0, 6.5),
    ], [
      { id: 'lp1', bottomMachine: 'bot', topMachine: 'top', material: '铁板', mark: 1 },
    ]);
    const issues = validateSchemeDetailed(scheme);
    expect(issues.some(i => i.severity === 'error' && i.rule.startsWith('R18'))).toBe(true);
  });
});
