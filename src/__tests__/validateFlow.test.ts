// src/__tests__/validateFlow.test.ts
import { describe, it, expect } from 'vitest';
import { validateFlowRules } from '../core/validateFlow';
import type { Scheme } from '../core/types';

// 铁产线 v2 方案（用于回归测试）
import ironFullLineV2 from '../../data/schemes/iron-full-line-v2.json';

const BASE_SCHEME: Scheme = {
  id: 'flow-test', name: 'Flow Test', version: '1', category: '测试', description: '',
  designPrinciples: { preferWallOutlets: true, preferWallHoles: true, preferCeilingMounts: false, keepFloorClear: true },
  floors: [{ id: 1, label: '1F', gridSize: { cols: 10, rows: 10 } }],
  machines: [],
  belts: [],
  liftPairs: [],
  zones: [],
};

describe('R22: 传送带容量溢出', () => {
  it('2台 screw constructor 合流后走 Mk.1 → 溢出', () => {
    const scheme: Scheme = {
      ...BASE_SCHEME,
      machines: [
        { id: 'c1', type: 'constructor', pos: { col: 1, row: 1 }, facing: 'south', floor: 1, recipe: 'screw' },
        { id: 'c2', type: 'constructor', pos: { col: 2.5, row: 1 }, facing: 'south', floor: 1, recipe: 'screw' },
        { id: 'mg1', type: 'merger', pos: { col: 1.75, row: 3.5 }, facing: 'south', floor: 1 },
        { id: 'st1', type: 'storage', pos: { col: 1.5, row: 5 }, facing: 'south', floor: 1 },
      ],
      belts: [
        { id: 'b_in1', floor: 1, mark: 1 as const, path: [{ col: 1.5, row: 0 }, { col: 1.5, row: 1 }], toPort: 'c1:in-0' },
        { id: 'b_in2', floor: 1, mark: 1 as const, path: [{ col: 3, row: 0 }, { col: 3, row: 1 }], toPort: 'c2:in-0' },
        { id: 'b_c1', floor: 1, mark: 1 as const, path: [{ col: 1.5, row: 2.25 }, { col: 1.5, row: 3.5 }], fromPort: 'c1:out-0', toPort: 'mg1:in-0' },
        { id: 'b_c2', floor: 1, mark: 1 as const, path: [{ col: 3, row: 2.25 }, { col: 3, row: 3.75 }, { col: 2.25, row: 3.75 }], fromPort: 'c2:out-0', toPort: 'mg1:in-1' },
        // Mk.1 (60/min) 但合流后 2×40=80/min → 溢出
        { id: 'b_overflow', floor: 1, mark: 1 as const, path: [{ col: 2, row: 3.75 }, { col: 2, row: 5 }], fromPort: 'mg1:out-0', toPort: 'st1:in-0' },
      ],
    };
    const issues = validateFlowRules(scheme);
    expect(issues.some(i => i.rule === 'R22-belt-overcapacity')).toBe(true);
    const issue = issues.find(i => i.rule === 'R22-belt-overcapacity');
    expect(issue?.severity).toBe('error');
    expect(issue?.elementId).toBe('b_overflow');
  });

  it('合流后走 Mk.2 → 不溢出', () => {
    const scheme: Scheme = {
      ...BASE_SCHEME,
      machines: [
        { id: 'c1', type: 'constructor', pos: { col: 1, row: 1 }, facing: 'south', floor: 1, recipe: 'screw' },
        { id: 'c2', type: 'constructor', pos: { col: 2.5, row: 1 }, facing: 'south', floor: 1, recipe: 'screw' },
        { id: 'mg1', type: 'merger', pos: { col: 1.75, row: 3.5 }, facing: 'south', floor: 1 },
        { id: 'st1', type: 'storage', pos: { col: 1.5, row: 5 }, facing: 'south', floor: 1 },
      ],
      belts: [
        { id: 'b_in1', floor: 1, mark: 1 as const, path: [{ col: 1.5, row: 0 }, { col: 1.5, row: 1 }], toPort: 'c1:in-0' },
        { id: 'b_in2', floor: 1, mark: 1 as const, path: [{ col: 3, row: 0 }, { col: 3, row: 1 }], toPort: 'c2:in-0' },
        { id: 'b_c1', floor: 1, mark: 1 as const, path: [{ col: 1.5, row: 2.25 }, { col: 1.5, row: 3.5 }], fromPort: 'c1:out-0', toPort: 'mg1:in-0' },
        { id: 'b_c2', floor: 1, mark: 1 as const, path: [{ col: 3, row: 2.25 }, { col: 3, row: 3.75 }, { col: 2.25, row: 3.75 }], fromPort: 'c2:out-0', toPort: 'mg1:in-1' },
        // Mk.2 (120/min) ≥ 80/min → OK
        { id: 'b_overflow', floor: 1, mark: 2 as const, path: [{ col: 2, row: 3.75 }, { col: 2, row: 5 }], fromPort: 'mg1:out-0', toPort: 'st1:in-0' },
      ],
    };
    const issues = validateFlowRules(scheme);
    expect(issues.some(i => i.rule === 'R22-belt-overcapacity')).toBe(false);
  });
});

describe('R28: 升降机容量溢出', () => {
  it('流量超过 Mk.1 升降机容量 → 溢出', () => {
    const scheme: Scheme = {
      ...BASE_SCHEME,
      floors: [
        { id: 1, label: '1F', gridSize: { cols: 10, rows: 10 } },
        { id: 2, label: '2F', gridSize: { cols: 10, rows: 10 } },
      ],
      machines: [
        { id: 'c1', type: 'constructor', pos: { col: 1, row: 1 }, facing: 'south', floor: 1, recipe: 'screw' },
        { id: 'c2', type: 'constructor', pos: { col: 2.5, row: 1 }, facing: 'south', floor: 1, recipe: 'screw' },
        { id: 'mg1', type: 'merger', pos: { col: 1.75, row: 3.5 }, facing: 'south', floor: 1 },
        { id: 'lift_bot', type: 'conveyor-lift-in-bottom', pos: { col: 2, row: 5 }, facing: 'south', floor: 1 },
        { id: 'lift_top', type: 'conveyor-lift-out-top', pos: { col: 2, row: 5 }, facing: 'south', floor: 2 },
        { id: 'st1', type: 'storage', pos: { col: 1.5, row: 3 }, facing: 'south', floor: 2 },
      ],
      belts: [
        { id: 'b_in1', floor: 1, mark: 1 as const, path: [{ col: 1.5, row: 0 }, { col: 1.5, row: 1 }], toPort: 'c1:in-0' },
        { id: 'b_in2', floor: 1, mark: 1 as const, path: [{ col: 3, row: 0 }, { col: 3, row: 1 }], toPort: 'c2:in-0' },
        { id: 'b_c1', floor: 1, mark: 1 as const, path: [{ col: 1.5, row: 2.25 }, { col: 1.5, row: 3.5 }], fromPort: 'c1:out-0', toPort: 'mg1:in-0' },
        { id: 'b_c2', floor: 1, mark: 1 as const, path: [{ col: 3, row: 2.25 }, { col: 3, row: 3.75 }, { col: 2.25, row: 3.75 }], fromPort: 'c2:out-0', toPort: 'mg1:in-1' },
        { id: 'b_to_lift', floor: 1, mark: 2 as const, path: [{ col: 2, row: 3.75 }, { col: 2, row: 5 }], fromPort: 'mg1:out-0', toPort: 'lift_bot:bottom' },
        { id: 'b_from_lift', floor: 2, mark: 2 as const, path: [{ col: 2, row: 5 }, { col: 2, row: 3 }], fromPort: 'lift_top:top', toPort: 'st1:in-0' },
      ],
      liftPairs: [
        { id: 'lift_screw', bottomMachine: 'lift_bot', topMachine: 'lift_top', mark: 1 as const },
      ],
    };
    const issues = validateFlowRules(scheme);
    expect(issues.some(i => i.rule === 'R28-lift-overcapacity')).toBe(true);
    const issue = issues.find(i => i.rule === 'R28-lift-overcapacity');
    expect(issue?.severity).toBe('error');
    expect(issue?.elementId).toBe('lift_screw');
  });
});

describe('iron-full-line-v2 流量校验', () => {
  it('记录 v2 方案的流量校验结果（不强制通过，仅收集）', () => {
    const issues = validateFlowRules(ironFullLineV2 as unknown as Scheme);
    // 输出所有问题供主线程分析
    if (issues.length > 0) {
      console.log('v2 flow validation issues:');
      issues.forEach(i => console.log(`  [${i.severity}] ${i.rule}: ${i.message}`));
    }
    // 不做 expect(issues).toHaveLength(0)，因为可能有合法的容量问题需要 Task 7 修复
    // 仅确保函数不抛异常
    expect(Array.isArray(issues)).toBe(true);
  });
});
