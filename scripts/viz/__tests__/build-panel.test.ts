import { describe, it, expect } from 'vitest';
import { buildMergerTree, buildManifold } from '../build-panel';

describe('buildMergerTree', () => {
  it('0 个产源：抛错', () => {
    expect(() => buildMergerTree({ sourceIds: [], ratePerSource: 30, material: 'x', idPrefix: 't' }))
      .toThrow(/empty|must not be empty/i);
  });

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
    expect(r.mergers[0].outputs).toEqual([]);
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
    expect(r.mergers[2].outputs).toEqual([]);
    expect(r.trunkRate).toBe(180);
  });

  it('7 台产源：3 个合流器（2×3-in + 1×3-in 合根）', () => {
    const r = buildMergerTree({ sourceIds: Array.from({length:7},(_,i)=>`p${i}`), ratePerSource: 30, material: 'x', idPrefix: 't' });
    expect(r.mergers).toHaveLength(3);
    // 根合流器 3-in：2 个中间合流器 + 1 台产源直连
    expect(r.mergers[2].inputs).toHaveLength(3);
    expect(r.mergers[2].outputs).toEqual([]);
    expect(r.trunkRate).toBe(210);
  });
});

describe('buildManifold', () => {
  it('单消费：从主干直接进消费机器（无分流器）', () => {
    const r = buildManifold({
      trunkEntryId: 'trunk-in',
      trunkRate: 240,
      material: 'screw',
      idPrefix: 's',
      stops: [{ consumerId: 'hmf', take: 240 }],
      terminalRate: 0,
    });
    expect(r.splitters).toHaveLength(0);
    // 一条带：trunk-in → hmf，流量 240
    expect(r.belts).toHaveLength(1);
    expect(r.belts[0].from).toBe('trunk-in');
    expect(r.belts[0].to).toBe('hmf');
    expect(r.belts[0].rate).toBe(240);
    expect(r.terminalBelt).toBeUndefined();
  });

  it('4 个消费 + 0 外输：4 个分流器，末段主干清零', () => {
    const r = buildManifold({
      trunkEntryId: 'trunk-in',
      trunkRate: 240,
      material: 'screw',
      idPrefix: 's',
      stops: [
        { consumerId: 'c0', take: 60 },
        { consumerId: 'c1', take: 60 },
        { consumerId: 'c2', take: 60 },
        { consumerId: 'c3', take: 60 },
      ],
      terminalRate: 0,
    });
    expect(r.splitters).toHaveLength(4);
    // 每个分流器：1 入 2 出（1 下抽给消费，1 续主干）；最后一个是 1 入 1 出（末段不再续）
    expect(r.splitters[0].outputs).toHaveLength(2);
    expect(r.splitters[3].outputs).toHaveLength(1);
    // 主干段数：入口→s0（240）、s0→s1（180）、s1→s2（120）、s2→s3（60）；加上 4 条抽出 60 的下抽带 = 8 条主干+抽出带
    expect(r.belts).toHaveLength(8);
  });

  it('1 个消费 + 外输：主干末端接终端', () => {
    const r = buildManifold({
      trunkEntryId: 'trunk-in',
      trunkRate: 120,
      material: 'rod',
      idPrefix: 'r',
      stops: [
        { consumerId: 'rotor', take: 100 },
      ],
      terminalRate: 20,
    });
    // 1 个分流器：1 入 2 出（100 到 rotor、20 续主干）
    expect(r.splitters).toHaveLength(1);
    expect(r.splitters[0].outputs).toHaveLength(2);
    // belts: trunk-in → s0 (120)、s0 → rotor (100)、s0 → terminal (20) = 3 条
    expect(r.belts).toHaveLength(3);
    expect(r.terminalBelt).toBeDefined();
    expect(r.terminalBelt!.rate).toBe(20);
  });

  it('0 消费 + 外输：主干直接通到终端（无分流器）', () => {
    const r = buildManifold({
      trunkEntryId: 'trunk-in',
      trunkRate: 30,
      material: 'cable',
      idPrefix: 'c',
      stops: [],
      terminalRate: 30,
    });
    expect(r.splitters).toHaveLength(0);
    expect(r.belts).toHaveLength(1);
    expect(r.belts[0].from).toBe('trunk-in');
    expect(r.belts[0].to).toBe('c-terminal');
    expect(r.belts[0].rate).toBe(30);
    expect(r.terminalBelt).toBeDefined();
    expect(r.terminalBelt!.rate).toBe(30);
  });

  it('主干流量不守恒 → 抛错', () => {
    expect(() =>
      buildManifold({
        trunkEntryId: 'trunk-in',
        trunkRate: 100,
        material: 'x',
        idPrefix: 'e',
        stops: [{ consumerId: 'c0', take: 60 }],
        terminalRate: 0, // 100 - 60 = 40 未消化，应抛错
      })
    ).toThrow(/unbalanced/i);
  });
});
