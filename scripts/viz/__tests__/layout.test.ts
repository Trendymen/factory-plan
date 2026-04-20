// scripts/viz/__tests__/layout.test.ts
import { describe, it, expect } from 'vitest';
import { layoutPanel } from '../layout';
import { buildPanel } from '../build-panel';

describe('layoutPanel', () => {
  it('返回所有节点的 x/y 坐标', () => {
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
    const layout = layoutPanel(panel);
    expect(layout.positions.size).toBeGreaterThan(0);
    const p0 = layout.positions.get('p#0');
    const c0 = layout.positions.get('c#0');
    expect(p0).toBeDefined();
    expect(c0).toBeDefined();
    expect(p0!.x).toBeLessThan(c0!.x);
  });

  it('输出整体宽高', () => {
    const panel = buildPanel({
      id: 'test',
      title: 'test',
      material: 'x',
      trunks: [{
        producer: { id: 'p', type: 't', recipe: 'x', count: 1, ratePerMachine: 30, label: 'p' },
        consumers: [{ id: 'c', type: 't', recipe: 'y', count: 1, ratePerMachine: 30, label: 'c' }],
        terminalRate: 0,
      }],
    });
    const layout = layoutPanel(panel);
    expect(layout.width).toBeGreaterThan(0);
    expect(layout.height).toBeGreaterThan(0);
  });

  it('多 trunk：每条主干垂直堆叠', () => {
    const panel = buildPanel({
      id: 'multi',
      title: 'multi',
      material: 'x',
      trunks: [
        {
          producer: { id: 'pA', type: 't', recipe: 'x', count: 3, ratePerMachine: 30, label: 'pA' },
          consumers: [{ id: 'cA', type: 't', recipe: 'y', count: 3, ratePerMachine: 30, label: 'cA' }],
          terminalRate: 0,
        },
        {
          producer: { id: 'pB', type: 't', recipe: 'x', count: 3, ratePerMachine: 30, label: 'pB' },
          consumers: [{ id: 'cB', type: 't', recipe: 'y', count: 3, ratePerMachine: 30, label: 'cB' }],
          terminalRate: 0,
        },
      ],
    });
    const layout = layoutPanel(panel);
    const pA0 = layout.positions.get('pA#0');
    const pB0 = layout.positions.get('pB#0');
    expect(pA0).toBeDefined();
    expect(pB0).toBeDefined();
    // 第二条主干的产源 y 应大于第一条（垂直堆叠）
    expect(pB0!.y).toBeGreaterThan(pA0!.y);
  });
});
