import { describe, it, expect } from 'vitest';
import { validateSchemeDetailed } from '../core/schema';
import type { Scheme } from '../core/types';
import scheme from '../../data/schemes/333-multi-blueprint-v1.json';

const s = scheme as unknown as Scheme;

describe('333-multi-blueprint-v1 scaffold', () => {
  it('keeps scaffold invariants for the 5 blueprints x 2 layers layout', () => {
    const issues = validateSchemeDetailed(s);
    const errors = issues.filter(issue => issue.severity === 'error');

    expect(s.id).toBe('333-multi-blueprint-v1');
    expect(errors).toHaveLength(0);
    expect(s.floors).toHaveLength(10);
    expect(s.floors.map(floor => floor.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(s.floors.every(floor => floor.gridSize.cols === 4 && floor.gridSize.rows === 4)).toBe(true);

    expect(s.floors[0]?.label).toBe('BP1-A 铁系预处理（冶炼+板/棒）');
    expect(s.floors[9]?.label).toBe('BP5-B 总出口汇流层');
  });
});
