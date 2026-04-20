// scripts/viz/build-panel.ts
import { RouteNode, Belt } from './types';

export interface MergerTreeResult {
  mergers: RouteNode[];
  belts: Belt[];
  /** 主干入口节点 id（最后一个合流器，或单机时就是产源 id） */
  trunkEntryId: string;
  trunkRate: number;
}

export function buildMergerTree(opts: {
  sourceIds: string[];
  ratePerSource: number;
  material: string;
  idPrefix: string;
}): MergerTreeResult {
  const { sourceIds, ratePerSource, material, idPrefix } = opts;

  if (sourceIds.length === 0) {
    throw new Error('buildMergerTree: sourceIds must not be empty');
  }

  if (sourceIds.length === 1) {
    return {
      mergers: [],
      belts: [],
      trunkEntryId: sourceIds[0],
      trunkRate: ratePerSource,
    };
  }

  const mergers: RouteNode[] = [];
  const belts: Belt[] = [];

  // 第一层：将产源分组，每组最多 3 个。
  // 若最后一组只有 1 个产源，不为其建合流器——直接作为直连节点传给根合流器。
  const groups: string[][] = [];
  for (let i = 0; i < sourceIds.length; i += 3) {
    groups.push(sourceIds.slice(i, i + 3));
  }

  // 每个叶节点：可能是合流器 id 或直通产源 id
  const leafNodeIds: string[] = [];
  const leafRates: number[] = [];
  // 记录哪些叶节点是合流器（需要在根合并时更新 outputs）
  const leafIsMerger: boolean[] = [];

  for (const group of groups) {
    if (group.length === 1) {
      // 单产源直通，不建合流器
      leafNodeIds.push(group[0]);
      leafRates.push(ratePerSource);
      leafIsMerger.push(false);
    } else {
      // 2 或 3 个产源 → 建叶合流器
      const mergerId = `${idPrefix}-m${mergers.length}`;
      const inputBeltIds: string[] = [];
      for (const src of group) {
        const b: Belt = {
          id: `${idPrefix}-b${belts.length}`,
          material,
          from: src,
          to: mergerId,
          rate: ratePerSource,
        };
        inputBeltIds.push(b.id);
        belts.push(b);
      }
      // outputs 留空，待根阶段写入（或单叶提前返回路径中保持空——调用方负责创建主干 belt）
      mergers.push({
        id: mergerId,
        kind: 'merger',
        inputs: inputBeltIds,
        outputs: [],
      });
      leafNodeIds.push(mergerId);
      leafRates.push(group.length * ratePerSource);
      leafIsMerger.push(true);
    }
  }

  // 如果只有一个叶节点，主干入口就是它
  if (leafNodeIds.length === 1) {
    return {
      mergers,
      belts,
      trunkEntryId: leafNodeIds[0],
      trunkRate: leafRates[0],
    };
  }

  // 否则再做一层根合流器把所有叶节点合起来（≤3 个，直接一个根）
  if (leafNodeIds.length > 3) {
    throw new Error(
      `buildMergerTree: ${sourceIds.length} sources exceed single-root capacity (max 9 sources). Extend tree if needed.`
    );
  }

  const rootMergerId = `${idPrefix}-m${mergers.length}`;
  // 写入叶节点 → 根合流器的边
  const rootInputBeltIds: string[] = [];
  for (let i = 0; i < leafNodeIds.length; i++) {
    const b: Belt = {
      id: `${idPrefix}-b${belts.length}`,
      material,
      from: leafNodeIds[i],
      to: rootMergerId,
      rate: leafRates[i],
    };
    rootInputBeltIds.push(b.id);
    belts.push(b);
    // 将叶合流器的输出指向这条新边（直通产源不需要更新）
    if (leafIsMerger[i]) {
      const leafMerger = mergers.find((m) => m.id === leafNodeIds[i])!;
      leafMerger.outputs = [b.id];
    }
  }
  // outputs 留空，调用方负责创建主干 belt 并回填
  mergers.push({
    id: rootMergerId,
    kind: 'merger',
    inputs: rootInputBeltIds,
    outputs: [],
  });

  return {
    mergers,
    belts,
    trunkEntryId: rootMergerId,
    trunkRate: leafRates.reduce((a, b) => a + b, 0),
  };
}

// ---------- buildManifold ----------

export interface ManifoldStop {
  consumerId: string;
  take: number;
}

export interface ManifoldResult {
  splitters: RouteNode[];
  belts: Belt[];
  /** 若 terminalRate > 0，这条带指向外输终端 */
  terminalBelt?: Belt;
}

export function buildManifold(opts: {
  trunkEntryId: string;
  trunkRate: number;
  material: string;
  idPrefix: string;
  stops: ManifoldStop[];
  /** 主干末端剩余流量（→ 外输终端，0 表示无外输） */
  terminalRate: number;
}): ManifoldResult {
  const { trunkEntryId, trunkRate, material, idPrefix, stops, terminalRate } = opts;

  const totalTake = stops.reduce((s, x) => s + x.take, 0);
  if (Math.abs(totalTake + terminalRate - trunkRate) > 1e-6) {
    throw new Error(
      `buildManifold: unbalanced trunk rate ${trunkRate} != sum(stops.take)=${totalTake} + terminalRate=${terminalRate}`
    );
  }

  const splitters: RouteNode[] = [];
  const belts: Belt[] = [];

  // 单消费且无外输：直连
  if (stops.length === 1 && terminalRate === 0) {
    belts.push({
      id: `${idPrefix}-direct`,
      material,
      from: trunkEntryId,
      to: stops[0].consumerId,
      rate: trunkRate,
    });
    return { splitters, belts };
  }

  let currentSourceId = trunkEntryId;
  let currentRate = trunkRate;

  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i];
    const isLast = i === stops.length - 1;
    const splitterId = `${idPrefix}-s${i}`;

    const inBeltId = `${idPrefix}-in${i}`;
    belts.push({ id: inBeltId, material, from: currentSourceId, to: splitterId, rate: currentRate });

    const downBeltId = `${idPrefix}-down${i}`;
    belts.push({ id: downBeltId, material, from: splitterId, to: stop.consumerId, rate: stop.take });

    const remaining = currentRate - stop.take;
    const hasContinuation = !isLast || terminalRate > 0;

    if (!hasContinuation) {
      // 末段无外输：1 入 1 出
      splitters.push({ id: splitterId, kind: 'splitter', inputs: [inBeltId], outputs: [downBeltId] });
    } else if (isLast) {
      // 末段接 terminal
      const termBeltId = `${idPrefix}-term`;
      belts.push({ id: termBeltId, material, from: splitterId, to: `${idPrefix}-terminal`, rate: terminalRate });
      splitters.push({ id: splitterId, kind: 'splitter', inputs: [inBeltId], outputs: [downBeltId, termBeltId] });
    } else {
      // 中段：续到下一个分流器
      const nextInId = `${idPrefix}-in${i + 1}`;
      splitters.push({ id: splitterId, kind: 'splitter', inputs: [inBeltId], outputs: [downBeltId, nextInId] });
    }

    currentSourceId = splitterId;
    currentRate = remaining;
  }

  const terminalBelt = terminalRate > 0 ? belts.find((b) => b.id === `${idPrefix}-term`) : undefined;
  return { splitters, belts, terminalBelt };
}
