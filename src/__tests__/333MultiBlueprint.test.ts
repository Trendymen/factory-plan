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

  it('defines the BP1 machine roster and outbound lift pair interfaces', () => {
    const machineIds = new Set(s.machines.map(machine => machine.id));
    const liftPairIds = new Set(s.liftPairs.map(pair => pair.id));

    expect(machineIds).toEqual(expect.objectContaining({
      has: expect.any(Function),
    }));

    expect(machineIds.has('bp1a-smelter-iron-1')).toBe(true);
    expect(machineIds.has('bp1a-smelter-iron-2')).toBe(true);
    expect(machineIds.has('bp1a-smelter-copper')).toBe(true);
    expect(machineIds.has('bp1a-foundry-steel')).toBe(true);
    expect(machineIds.has('bp1a-con-plate')).toBe(true);
    expect(machineIds.has('bp1a-con-rod-1')).toBe(true);
    expect(machineIds.has('bp1a-con-rod-2')).toBe(true);
    expect(machineIds.has('bp1a-con-rod-3')).toBe(true);
    expect(machineIds.has('bp1b-con-screw-1')).toBe(true);
    expect(machineIds.has('bp1b-con-screw-2')).toBe(true);

    expect(liftPairIds.has('bp1-plate-to-bp2')).toBe(true);
    expect(liftPairIds.has('bp1-rod-rotor-to-bp2')).toBe(true);
    expect(liftPairIds.has('bp1-rod-frame-to-bp2')).toBe(true);
    expect(liftPairIds.has('bp1-screw-to-bp2')).toBe(true);
    expect(liftPairIds.has('bp1-copper-to-bp3')).toBe(true);
    expect(liftPairIds.has('bp1-steel-to-bp3')).toBe(true);
  });
});
