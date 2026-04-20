import { describe, it, expect } from 'vitest';
import { validatePanel } from '../validate';
import { buildPanel } from '../build-panel';

describe('validatePanel', () => {
  it('干净 panel 通过', () => {
    const panel = buildPanel({
      id: 'test',
      title: 'test',
      material: 'x',
      trunks: [{
        producer: { id: 'p', type: 't', recipe: 'x', count: 3, ratePerMachine: 30, label: 'p' },
        consumers: [{ id: 'c', type: 't', recipe: 'y', count: 3, ratePerMachine: 30, label: 'c' }],
        terminalRate: 0,
      }],
    });
    const errors = validatePanel(panel);
    expect(errors).toEqual([]);
  });

  it('超 Mk.3 上限报错', () => {
    // 9 台机器 × 31/min = 279/min > 270 (Mk.3 上限)
    // buildMergerTree 最多支持 9 台（3 层），9×31=279 > 270 会在主干上触发 cap 报错
    const panel = buildPanel({
      id: 'test',
      title: 'test',
      material: 'x',
      trunks: [{
        producer: { id: 'p', type: 't', recipe: 'x', count: 9, ratePerMachine: 31, label: 'p' },
        consumers: [{ id: 'c', type: 't', recipe: 'y', count: 9, ratePerMachine: 31, label: 'c' }],
        terminalRate: 0,
      }],
    });
    const errors = validatePanel(panel);
    expect(errors.some(e => /270|Mk\.3/i.test(e))).toBe(true);
  });
});
