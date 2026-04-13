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
  floors: [{ id: 1, label: '1F', gridSize: { cols: 8, rows: 8 } }],
  machines: [
    { id: 's1', type: 'smelter', pos: { col: 1, row: 1 }, facing: 'south', floor: 1, recipe: 'iron-ingot', label: 'S-1' },
    { id: 'sp1', type: 'splitter', pos: { col: 1, row: 2.5 }, facing: 'south', floor: 1, label: '分流' },
  ],
  belts: [
    { id: 'b1', floor: 1, mark: 1, path: [{ col: 1.375, row: 2.125 }, { col: 1.375, row: 2.5 }], fromPort: 's1:out-0', toPort: 'sp1:in-0' },
  ],
  liftPairs: [],
  zones: [],
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
      belts: [{ id: 'b1', floor: 1, mark: 1 as const, path: [{ col: 1, row: 2 }, { col: 3, row: 2 }] }],
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
        id: 'b-diag', floor: 1, mark: 1 as const,
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
        id: 'b-ok', floor: 1, mark: 1 as const,
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
        { id: 1, label: '1F', gridSize: { cols: 8, rows: 8 } },
        { id: 2, label: '2F', gridSize: { cols: 8, rows: 8 } },
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
        id: 'b-cross', floor: 1, mark: 1 as const,
        path: [{ col: 1.5, row: 1 }, { col: 1.5, row: 3 }],
        fromPort: 's1:out-0', toPort: 'sp1:in-0',
      }],
    };
    const issues = validateSchemeDetailed(bad);
    expect(issues.some(i => i.rule === 'R14b-belt-cross')).toBe(true);
  });

  it('R15: warns on overlapping belt segments', () => {
    const bad = {
      ...MINIMAL_SCHEME,
      belts: [
        { id: 'b1', floor: 1, mark: 1 as const,
          path: [{ col: 1, row: 1 }, { col: 1, row: 3 }], fromPort: 's1:out-0', toPort: 'sp1:in-0' },
        { id: 'b2', floor: 1, mark: 1 as const,
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

  // ==================== R24: clockSpeed 范围校验 ====================

  it('R24: errors on clockSpeed > 250', () => {
    const bad = {
      ...MINIMAL_SCHEME,
      machines: [{ ...MINIMAL_SCHEME.machines[0], clockSpeed: 300 }],
    };
    const issues = validateSchemeDetailed(bad);
    expect(issues.some(i => i.rule === 'R24-clockspeed')).toBe(true);
    expect(issues.find(i => i.rule === 'R24-clockspeed')?.severity).toBe('error');
  });

  it('R24: errors on clockSpeed < 1', () => {
    const bad = {
      ...MINIMAL_SCHEME,
      machines: [{ ...MINIMAL_SCHEME.machines[0], clockSpeed: 0 }],
    };
    const issues = validateSchemeDetailed(bad);
    expect(issues.some(i => i.rule === 'R24-clockspeed')).toBe(true);
  });

  it('R24: passes on valid clockSpeed', () => {
    const ok = {
      ...MINIMAL_SCHEME,
      machines: [{ ...MINIMAL_SCHEME.machines[0], clockSpeed: 250 }],
    };
    const issues = validateSchemeDetailed(ok);
    expect(issues.some(i => i.rule === 'R24-clockspeed')).toBe(false);
  });

  it('R24: passes when clockSpeed is undefined', () => {
    const ok = {
      ...MINIMAL_SCHEME,
      machines: [{ ...MINIMAL_SCHEME.machines[0], clockSpeed: undefined }],
    };
    const issues = validateSchemeDetailed(ok);
    expect(issues.some(i => i.rule === 'R24-clockspeed')).toBe(false);
  });

  // ==================== R25: 分流器/合流器端口悬空检测 ====================

  it('R25: warns when splitter has only 1 output connected', () => {
    const bad = {
      ...MINIMAL_SCHEME,
      machines: [
        MINIMAL_SCHEME.machines[0],
        { id: 'sp1', type: 'splitter' as const, pos: { col: 1, row: 2.5 }, facing: 'south' as const, floor: 1 },
      ],
      belts: [
        { id: 'b1', floor: 1, mark: 1 as const, path: [{ col: 1.375, row: 2.125 }, { col: 1.375, row: 2.5 }], fromPort: 's1:out-0', toPort: 'sp1:in-0' },
        { id: 'b2', floor: 1, mark: 1 as const, path: [{ col: 1.25, row: 2.75 }, { col: 1.25, row: 3.5 }], fromPort: 'sp1:out-0' },
      ],
    };
    const issues = validateSchemeDetailed(bad);
    expect(issues.some(i => i.rule === 'R25-splitter-underuse')).toBe(true);
    expect(issues.find(i => i.rule === 'R25-splitter-underuse')?.severity).toBe('warn');
  });

  it('R25: warns when merger has only 1 input connected', () => {
    const bad = {
      ...MINIMAL_SCHEME,
      machines: [
        MINIMAL_SCHEME.machines[0],
        { id: 'mg1', type: 'merger' as const, pos: { col: 1, row: 2.5 }, facing: 'south' as const, floor: 1 },
      ],
      belts: [
        { id: 'b1', floor: 1, mark: 1 as const, path: [{ col: 1.375, row: 2.125 }, { col: 1.375, row: 2.5 }], fromPort: 's1:out-0', toPort: 'mg1:in-0' },
        { id: 'b2', floor: 1, mark: 1 as const, path: [{ col: 1.25, row: 2.75 }, { col: 1.25, row: 3.5 }], fromPort: 'mg1:out-0' },
      ],
    };
    const issues = validateSchemeDetailed(bad);
    expect(issues.some(i => i.rule === 'R25-merger-underuse')).toBe(true);
  });

  it('R25: passes when splitter has 2+ outputs connected', () => {
    const ok = {
      ...MINIMAL_SCHEME,
      machines: [
        MINIMAL_SCHEME.machines[0],
        { id: 'sp1', type: 'splitter' as const, pos: { col: 1, row: 2.5 }, facing: 'south' as const, floor: 1 },
      ],
      belts: [
        { id: 'b1', floor: 1, mark: 1 as const, path: [{ col: 1.375, row: 2.125 }, { col: 1.375, row: 2.5 }], fromPort: 's1:out-0', toPort: 'sp1:in-0' },
        { id: 'b2', floor: 1, mark: 1 as const, path: [{ col: 1.25, row: 2.75 }, { col: 1.25, row: 3.5 }], fromPort: 'sp1:out-0' },
        { id: 'b3', floor: 1, mark: 1 as const, path: [{ col: 1.25, row: 2.75 }, { col: 2, row: 2.75 }], fromPort: 'sp1:out-1' },
      ],
    };
    const issues = validateSchemeDetailed(ok);
    expect(issues.some(i => i.rule === 'R25-splitter-underuse')).toBe(false);
  });

  // ==================== R23: 生产机器输入端口未连接 ====================

  it('R23: warns when assembler input port has no belt', () => {
    const bad = {
      ...MINIMAL_SCHEME,
      machines: [
        { id: 'asm1', type: 'assembler' as const, pos: { col: 1, row: 1 }, facing: 'south' as const, floor: 1, recipe: 'reinforced-iron-plate' },
      ],
      belts: [
        { id: 'b1', floor: 1, mark: 1 as const, path: [{ col: 1.375, row: 0 }, { col: 1.375, row: 1 }], toPort: 'asm1:in-0' },
      ],
    };
    const issues = validateSchemeDetailed(bad);
    expect(issues.some(i => i.rule === 'R23-unconnected-input')).toBe(true);
    expect(issues.find(i => i.rule === 'R23-unconnected-input')?.severity).toBe('warn');
  });

  it('R23: passes when all inputs connected', () => {
    const ok = {
      ...MINIMAL_SCHEME,
      machines: [
        { id: 'asm1', type: 'assembler' as const, pos: { col: 1, row: 1 }, facing: 'south' as const, floor: 1, recipe: 'reinforced-iron-plate' },
      ],
      belts: [
        { id: 'b1', floor: 1, mark: 1 as const, path: [{ col: 1.375, row: 0 }, { col: 1.375, row: 1 }], toPort: 'asm1:in-0' },
        { id: 'b2', floor: 1, mark: 1 as const, path: [{ col: 1.875, row: 0 }, { col: 1.875, row: 1 }], toPort: 'asm1:in-1' },
      ],
    };
    const issues = validateSchemeDetailed(ok);
    expect(issues.some(i => i.rule === 'R23-unconnected-input')).toBe(false);
  });

  it('R23: skips non-production machines', () => {
    const ok = {
      ...MINIMAL_SCHEME,
      machines: [
        { id: 'sp1', type: 'splitter' as const, pos: { col: 1, row: 2.5 }, facing: 'south' as const, floor: 1 },
      ],
      belts: [],
    };
    const issues = validateSchemeDetailed(ok);
    expect(issues.some(i => i.rule === 'R23-unconnected-input')).toBe(false);
  });

  // ==================== R29: 孤立机器 + R30: Storage 无输入 ====================

  it('R29: errors on completely isolated production machine', () => {
    const bad = {
      ...MINIMAL_SCHEME,
      machines: [
        { id: 'c1', type: 'constructor' as const, pos: { col: 1, row: 1 }, facing: 'south' as const, floor: 1, recipe: 'iron-plate' },
      ],
      belts: [],
    };
    const issues = validateSchemeDetailed(bad);
    expect(issues.some(i => i.rule === 'R29-isolated')).toBe(true);
    expect(issues.find(i => i.rule === 'R29-isolated')?.severity).toBe('error');
  });

  it('R29: warns on production machine with input but no output', () => {
    const bad = {
      ...MINIMAL_SCHEME,
      machines: [
        { id: 'c1', type: 'constructor' as const, pos: { col: 1, row: 1 }, facing: 'south' as const, floor: 1, recipe: 'iron-plate' },
      ],
      belts: [
        { id: 'b1', floor: 1, mark: 1 as const, path: [{ col: 1.5, row: 0 }, { col: 1.5, row: 1 }], toPort: 'c1:in-0' },
      ],
    };
    const issues = validateSchemeDetailed(bad);
    expect(issues.some(i => i.rule === 'R29-no-output')).toBe(true);
    expect(issues.find(i => i.rule === 'R29-no-output')?.severity).toBe('warn');
  });

  it('R30: warns on storage with no input belt', () => {
    const bad = {
      ...MINIMAL_SCHEME,
      machines: [
        { id: 'st1', type: 'storage' as const, pos: { col: 1, row: 1 }, facing: 'south' as const, floor: 1 },
      ],
      belts: [],
    };
    const issues = validateSchemeDetailed(bad);
    expect(issues.some(i => i.rule === 'R30-storage-no-input')).toBe(true);
    expect(issues.find(i => i.rule === 'R30-storage-no-input')?.severity).toBe('warn');
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
        { id: 1, label: 'F1', gridSize: { cols: 8, rows: 8 } },
        { id: 2, label: 'F2', gridSize: { cols: 8, rows: 8 } },
      ],
      machines, belts: [], liftPairs, zones: [],
    };
  }

  it('pair 引用不存在的机器 → error', () => {
    const scheme = baseScheme([], [
      { id: 'lp1', bottomMachine: 'missing_bot', topMachine: 'missing_top', mark: 1 },
    ]);
    const issues = validateSchemeDetailed(scheme);
    expect(issues.some(i => i.severity === 'error' && i.rule.startsWith('R18'))).toBe(true);
  });

  it('合法向上运输 pair → 无 R18 error', () => {
    const scheme = baseScheme([
      makeLiftMachine('bot', 'conveyor-lift-in-bottom', 1),
      makeLiftMachine('top', 'conveyor-lift-out-top', 2),
    ], [
      { id: 'lp1', bottomMachine: 'bot', topMachine: 'top', mark: 1 },
    ]);
    const issues = validateSchemeDetailed(scheme);
    expect(issues.filter(i => i.severity === 'error' && i.rule.startsWith('R18'))).toEqual([]);
  });

  it('非法类型组合（bottom 机器用 top 类型）→ error', () => {
    const scheme = baseScheme([
      makeLiftMachine('bot', 'conveyor-lift-out-top', 1),
      makeLiftMachine('top', 'conveyor-lift-in-bottom', 2),
    ], [
      { id: 'lp1', bottomMachine: 'bot', topMachine: 'top', mark: 1 },
    ]);
    const issues = validateSchemeDetailed(scheme);
    expect(issues.some(i => i.severity === 'error' && i.rule.startsWith('R18'))).toBe(true);
  });

  it('跨越多层（floor 差不为 1）→ error', () => {
    const scheme = baseScheme([
      makeLiftMachine('bot', 'conveyor-lift-in-bottom', 1),
      { id: 'top', type: 'conveyor-lift-out-top', floor: 3, facing: 'south', pos: { col: 1.5, row: 6.5 } },
    ], [
      { id: 'lp1', bottomMachine: 'bot', topMachine: 'top', mark: 1 },
    ]);
    // 添加 floor 3 避免 R1-floor 失败抢先
    scheme.floors.push({ id: 3, label: 'F3', gridSize: { cols: 8, rows: 8 } });
    const issues = validateSchemeDetailed(scheme);
    expect(issues.some(i => i.severity === 'error' && i.rule.startsWith('R18'))).toBe(true);
  });

  it('pair 两端 pos 不相等 → error', () => {
    const scheme = baseScheme([
      makeLiftMachine('bot', 'conveyor-lift-in-bottom', 1, 1.5, 6.5),
      makeLiftMachine('top', 'conveyor-lift-out-top', 2, 2.0, 6.5),
    ], [
      { id: 'lp1', bottomMachine: 'bot', topMachine: 'top', mark: 1 },
    ]);
    const issues = validateSchemeDetailed(scheme);
    expect(issues.some(i => i.severity === 'error' && i.rule.startsWith('R18'))).toBe(true);
  });

  it('pair 两端 facing 不一致 → warn（非 error）', () => {
    const scheme = baseScheme([
      makeLiftMachine('bot', 'conveyor-lift-in-bottom', 1),
      { id: 'top', type: 'conveyor-lift-out-top', floor: 2, facing: 'north', pos: { col: 1.5, row: 6.5 } },
    ], [
      { id: 'lp1', bottomMachine: 'bot', topMachine: 'top', mark: 1 },
    ]);
    const issues = validateSchemeDetailed(scheme);
    expect(issues.filter(i => i.severity === 'error' && i.rule.startsWith('R18'))).toEqual([]);
    expect(issues.some(i => i.severity === 'warn' && i.rule === 'R18-facing')).toBe(true);
  });

  it('合法向下运输 pair → 无 R18 error', () => {
    const scheme = baseScheme([
      { id: 'bot', type: 'conveyor-lift-out-bottom', floor: 1, facing: 'south', pos: { col: 1.5, row: 6.5 } },
      { id: 'top', type: 'conveyor-lift-in-top', floor: 2, facing: 'south', pos: { col: 1.5, row: 6.5 } },
    ], [
      { id: 'lp1', bottomMachine: 'bot', topMachine: 'top', mark: 1 },
    ]);
    const issues = validateSchemeDetailed(scheme);
    expect(issues.filter(i => i.severity === 'error' && i.rule.startsWith('R18'))).toEqual([]);
  });
});

describe('R19 - 垂直交叉检测', () => {
  const baseFloor = { id: 1, label: 'F1', gridSize: { cols: 8, rows: 8 } };
  function schemeWithBelts(belts: Scheme['belts']): Scheme {
    return {
      id: 'test', name: 'test', version: '1.0.0', category: 'test', description: '',
      designPrinciples: { preferWallOutlets: false, preferWallHoles: false, preferCeilingMounts: false, keepFloorClear: false },
      floors: [baseFloor],
      machines: [], belts, liftPairs: [], zones: [],
    };
  }

  it('两条 belt 在内部点垂直交叉 → warn', () => {
    const scheme = schemeWithBelts([
      { id: 'b1', floor: 1, mark: 1,
        path: [{ col: 1, row: 3 }, { col: 5, row: 3 }] },
      { id: 'b2', floor: 1, mark: 1,
        path: [{ col: 3, row: 1 }, { col: 3, row: 5 }] },
    ]);
    const issues = validateSchemeDetailed(scheme);
    expect(issues.some(i => i.rule === 'R19-belt-cross')).toBe(true);
  });

  it('两条 belt 仅在共同端点相触 → 不 warn', () => {
    const scheme = schemeWithBelts([
      { id: 'b1', floor: 1, mark: 1,
        path: [{ col: 1, row: 3 }, { col: 3, row: 3 }] },
      { id: 'b2', floor: 1, mark: 1,
        path: [{ col: 3, row: 3 }, { col: 3, row: 5 }] },
    ]);
    const issues = validateSchemeDetailed(scheme);
    expect(issues.some(i => i.rule === 'R19-belt-cross')).toBe(false);
  });

  it('T 型：belt A 端点落在 belt B 内部 → warn', () => {
    const scheme = schemeWithBelts([
      { id: 'b1', floor: 1, mark: 1,
        path: [{ col: 1, row: 3 }, { col: 5, row: 3 }] },
      { id: 'b2', floor: 1, mark: 1,
        path: [{ col: 3, row: 3 }, { col: 3, row: 5 }] },
    ]);
    const issues = validateSchemeDetailed(scheme);
    expect(issues.some(i => i.rule === 'R19-belt-cross')).toBe(true);
  });

  it('不同楼层的 belt 不触发 R19', () => {
    const scheme = schemeWithBelts([
      { id: 'b1', floor: 1, mark: 1,
        path: [{ col: 1, row: 3 }, { col: 5, row: 3 }] },
      { id: 'b2', floor: 2, mark: 1,
        path: [{ col: 3, row: 1 }, { col: 3, row: 5 }] },
    ]);
    scheme.floors.push({ id: 2, label: 'F2', gridSize: { cols: 8, rows: 8 } });
    const issues = validateSchemeDetailed(scheme);
    expect(issues.some(i => i.rule === 'R19-belt-cross')).toBe(false);
  });
});

import ironFullLineV2 from '../../data/schemes/iron-full-line-v2.json';
import { computeSchemeStats } from '../core/computeStats';

describe('iron-full-line-v2 流量分析（Tier 2）', () => {
  const scheme = ironFullLineV2 as unknown as Scheme;
  const stats = computeSchemeStats(scheme);

  it('铁矿石输入 = 120/min', () => {
    const ore = stats.inputs.find(i => i.material === '铁矿石');
    expect(ore?.rate).toBe(120);
  });

  it('铁板输出 = 10/min (40 生产 - 30 rip 消耗)', () => {
    const plate = stats.outputs.find(o => o.material === '铁板');
    expect(plate?.rate).toBe(10);
  });

  it('强化铁板输出 = 5/min', () => {
    const rip = stats.outputs.find(o => o.material === '强化铁板');
    expect(rip?.rate).toBe(5);
  });

  it('转子输出 = 4/min（sp_screw_bridge 已把 20 螺丝过剩引到 rotor 侧）', () => {
    const rotor = stats.outputs.find(o => o.material === '转子');
    expect(rotor?.rate).toBe(4);
  });

  it('总功耗 = 86 MW（4×smelter + 2×plate + 4×rod + 4×screw + rip + rotor，均 100%）', () => {
    expect(stats.totalPowerMW).toBe(86);
  });

  it('内部物料（铁锭、铁棒、螺丝）完全平衡，不出现在 inputs/outputs', () => {
    const internalMats = ['铁锭', '铁棒', '螺丝'];
    for (const mat of internalMats) {
      expect(stats.inputs.find(i => i.material === mat)).toBeUndefined();
      expect(stats.outputs.find(o => o.material === mat)).toBeUndefined();
    }
  });
});

describe('iron-full-line-v2 方案校验', () => {
  it('validateSchemeDetailed 无 error', () => {
    const issues = validateSchemeDetailed(ironFullLineV2 as unknown as Scheme);
    const errors = issues.filter(i => i.severity === 'error');
    if (errors.length > 0) {
      console.error('Unexpected errors in v2:');
      errors.forEach(e => console.error(`  [${e.rule}] ${e.message}`));
    }
    expect(errors).toHaveLength(0);
  });

  it('仅允许 1 个已知 R19 跨带 warn（螺丝跨组分流强制跨越 rod 主干）', () => {
    const issues = validateSchemeDetailed(ironFullLineV2 as unknown as Scheme);
    const warns = issues.filter(i => i.severity === 'warn');

    // 已知豁免：b_bridge_to_mg_r 必须从 mg_screw_l 侧横跨到 mg_screw_r:in-1
    // 把 screw2 过剩的 20/min 引流到 rotor 侧。rotor:in-0 端口在 col 5.625，
    // rod main belt 被迫走 col 5.625 纵贯 rows 2.875-5.75，此交叉不可避免。
    const KNOWN_R19_CROSSES = new Set<string>([
      'b_bridge_to_mg_r × b_rod_main_to_rotor',
      'b_rod_main_to_rotor × b_bridge_to_mg_r',
    ]);
    const isKnownR19 = (w: { rule: string; message: string }) =>
      w.rule === 'R19-belt-cross' &&
      [...KNOWN_R19_CROSSES].some(k => w.message.includes(k.split(' × ')[0]) && w.message.includes(k.split(' × ')[1]));

    const unexpectedWarns = warns.filter(w => !isKnownR19(w));
    if (unexpectedWarns.length > 0) {
      console.error('Unexpected warns in v2:');
      unexpectedWarns.forEach(w => console.error(`  [${w.rule}] ${w.message}`));
    }
    expect(unexpectedWarns).toHaveLength(0);
  });
});
