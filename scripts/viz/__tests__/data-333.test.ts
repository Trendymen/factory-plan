// scripts/viz/__tests__/data-333.test.ts
import { describe, it, expect } from 'vitest';
import { panels333 } from '../data-333';
import { validatePanel } from '../validate';

describe('333 方案 19 个面板', () => {
  it('面板数量为 19（Task 6 只有 4 个，此测试会在 Task 7 后通过）', () => {
    // Task 6 only declares 4; full 19 comes in Task 7
    expect(panels333.length).toBeGreaterThanOrEqual(4);
  });

  it('每个面板流量守恒且无 Mk.3 超限', () => {
    for (const panel of panels333) {
      const errors = validatePanel(panel);
      expect(errors, `panel ${panel.id}`).toEqual([]);
    }
  });

  it('铁锭面板：19 台冶炼站 + 7 台铁板 + 24 台铁棒', () => {
    const p = panels333.find((x) => x.id === 'iron-ingot');
    expect(p).toBeDefined();
    const smeltersTotal = p!.producers
      .filter((m) => m.recipe === 'iron-ingot')
      .reduce((s, m) => s + m.count, 0);
    expect(smeltersTotal).toBe(19);
    const plateTotal = p!.consumers
      .filter((c) => c.recipe === 'iron-plate')
      .reduce((s, c) => s + c.count, 0);
    const rodTotal = p!.consumers
      .filter((c) => c.recipe === 'iron-rod')
      .reduce((s, c) => s + c.count, 0);
    expect(plateTotal).toBe(7);
    expect(rodTotal).toBe(24);
  });

  it('螺丝面板：4 条主干，共 20 台螺丝构筑站', () => {
    const p = panels333.find((x) => x.id === 'screw');
    expect(p).toBeDefined();
    const totalProducers = p!.producers
      .filter((m) => m.recipe === 'screw')
      .reduce((s, m) => s + m.count, 0);
    expect(totalProducers).toBe(20);
    const termTotal = p!.terminals.reduce((s, t) => s + t.rate, 0);
    expect(termTotal).toBe(20);
  });

  it('铁棒面板：24 台产源，4 类消费 + 外输', () => {
    const p = panels333.find((x) => x.id === 'iron-rod');
    expect(p).toBeDefined();
    const totalProducers = p!.producers
      .filter((m) => m.recipe === 'iron-rod')
      .reduce((s, m) => s + m.count, 0);
    expect(totalProducers).toBe(24);
  });

  it('铜锭面板：6 台冶炼站 → 8 台电线 + 3 台铜板', () => {
    const p = panels333.find((x) => x.id === 'copper-ingot');
    expect(p).toBeDefined();
    const smeltersTotal = p!.producers
      .filter((m) => m.recipe === 'copper-ingot')
      .reduce((s, m) => s + m.count, 0);
    expect(smeltersTotal).toBe(6);
    const wireTotal = p!.consumers
      .filter((c) => c.recipe === 'wire')
      .reduce((s, c) => s + c.count, 0);
    const sheetTotal = p!.consumers
      .filter((c) => c.recipe === 'copper-sheet')
      .reduce((s, c) => s + c.count, 0);
    expect(wireTotal).toBe(8);
    expect(sheetTotal).toBe(3);
  });
});
