import { describe, it, expect } from 'vitest';
import { buildMergerTree } from '../build-panel';

describe('buildMergerTree', () => {
  it('单机直通：1 台产源无需合流器', () => {
    const r = buildMergerTree({ sourceIds: ['p0'], ratePerSource: 30, material: 'x', idPrefix: 't' });
    expect(r.mergers).toHaveLength(0);
    expect(r.belts).toHaveLength(0);
    expect(r.trunkEntryId).toBe('p0');
    expect(r.trunkRate).toBe(30);
  });

  it('3 台产源：1 个 3→1 合流器', () => {
    const r = buildMergerTree({ sourceIds: ['p0','p1','p2'], ratePerSource: 30, material: 'x', idPrefix: 't' });
    expect(r.mergers).toHaveLength(1);
    expect(r.mergers[0].inputs).toHaveLength(3);
    expect(r.mergers[0].outputs).toHaveLength(1);
    expect(r.belts).toHaveLength(3); // 3 producer-to-merger belts
    expect(r.trunkRate).toBe(90);
  });

  it('6 台产源：3 个合流器（2×3-in + 1×2-in 合根）', () => {
    const r = buildMergerTree({ sourceIds: ['p0','p1','p2','p3','p4','p5'], ratePerSource: 30, material: 'x', idPrefix: 't' });
    expect(r.mergers).toHaveLength(3);
    // 前两个合流器各收 3 台
    expect(r.mergers[0].inputs).toHaveLength(3);
    expect(r.mergers[1].inputs).toHaveLength(3);
    // 根合流器收 2 个中间合流器的输出
    expect(r.mergers[2].inputs).toHaveLength(2);
    expect(r.trunkRate).toBe(180);
  });

  it('7 台产源：3 个合流器（2×3-in + 1×3-in 合根）', () => {
    const r = buildMergerTree({ sourceIds: Array.from({length:7},(_,i)=>`p${i}`), ratePerSource: 30, material: 'x', idPrefix: 't' });
    expect(r.mergers).toHaveLength(3);
    // 根合流器 3-in：2 个中间合流器 + 1 台产源直连
    expect(r.mergers[2].inputs).toHaveLength(3);
    expect(r.trunkRate).toBe(210);
  });
});
