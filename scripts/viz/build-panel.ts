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
