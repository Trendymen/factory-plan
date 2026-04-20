// scripts/viz/types.ts

/** 一类生产/消费机器（同类聚合） */
export interface Machine {
  id: string;
  kind: 'producer' | 'consumer';
  /** 机器类型，如 'constructor'/'assembler'/'smelter'/'foundry'/'manufacturer'/'miner-mk3' */
  type: string;
  /** 配方/产物，用于配色与标签 */
  recipe: string;
  /** 机器台数 */
  count: number;
  /** 单台机器的产出（producer）或消耗（consumer）/min */
  ratePerMachine: number;
  /** 显示标签，如 "×24 铁棒构筑站" */
  label: string;
}

/** 分流器或合流器节点 */
export interface RouteNode {
  id: string;
  kind: 'splitter' | 'merger';
  /**
   * 入口边 id 列表（合流 1~3 个，分流恰好 1 个）。
   * 由 build-panel 层填充，渲染层直接遍历 panel.belts 判定流向，不依赖此字段。
   */
  inputs: string[];
  /**
   * 出口边 id 列表（合流恰好 1 个，分流 1~3 个）。
   * 注意：主干末端的根合流器（buildMergerTree 产出）此字段可为空数组，
   * 因为主干出边由下游 manifold 或上层 buildPanel 创建并直接归属于 belt 列表。
   * 渲染层基于 panel.belts 而非此字段绘制边。
   */
  outputs: string[];
}

/** 传送带段 */
export interface Belt {
  id: string;
  material: string;
  /** 源节点 id（可以是 Machine / RouteNode） */
  from: string;
  /** 目的节点 id */
  to: string;
  /** 稳态流量 /min */
  rate: number;
  /** Mk.3 上限，默认 270 */
  cap?: number;
}

/** 外输终端 */
export interface OutputTerminal {
  id: string;
  material: string;
  rate: number;
  label: string;
}

/** 单个物料子面板 */
export interface Panel {
  id: string;
  title: string;
  material: string;
  producers: Machine[];
  consumers: Machine[];
  mergers: RouteNode[];
  splitters: RouteNode[];
  terminals: OutputTerminal[];
  belts: Belt[];
}

/** 整个工厂可视化 */
export interface FactoryViz {
  panels: Panel[];
}
