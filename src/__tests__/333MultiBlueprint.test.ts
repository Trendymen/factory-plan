import { describe, it, expect } from 'vitest';
import type { Scheme } from '../core/types';
import scheme from '../../data/schemes/333-multi-blueprint-v1.json';

const s = scheme as unknown as Scheme;

describe('333-multi-blueprint-v1 scaffold', () => {
  it('uses 10 floors to represent 5 blueprints x 2 layers', () => {
    expect(s.id).toBe('333-multi-blueprint-v1');
    expect(s.floors.map(f => f.label)).toEqual([
      'BP1-A 铁系预处理（冶炼+板/棒）',
      'BP1-B 铁系物流夹层（螺丝+接口）',
      'BP2-A 铁系入料层',
      'BP2-B 铁系装配层',
      'BP3-A 铜钢基础件',
      'BP3-B 铜钢中间件/接口',
      'BP4-A 终装入料层',
      'BP4-B 终装层',
      'BP5-A 总出口入料层',
      'BP5-B 总出口汇流层',
    ]);
  });
});
