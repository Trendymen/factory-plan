// src/core/types.ts

// ===== 坐标与尺寸 =====

export interface Dimensions {
  width: number;
  length: number;
  height: number;
}

export interface GridPos {
  col: number;
  row: number;
}

export type Facing = 'north' | 'south' | 'east' | 'west';

// ===== 端口 =====

export type PortKind = 'belt-in' | 'belt-out' | 'pipe-in' | 'pipe-out';
export type PortSide = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';

export interface PortDef {
  id: string;
  kind: PortKind;
  side: PortSide;
  offsetAlongEdge: number;
  heightM: number;
  direction: 'outward';
}

// ===== 建筑类型 =====

export type BuildingCategory = 'production' | 'logistics' | 'storage';

export type PlaceableType =
  | 'smelter' | 'foundry' | 'constructor' | 'assembler' | 'manufacturer'
  | 'splitter' | 'merger'
  | 'storage' | 'industrial-storage'
  // 传送带升降机（一台物理升降机由 bottom + top 两条配对 machine 组成，类型表达方向与楼层位置）
  | 'conveyor-lift-in-bottom'   // F1 底座：物料从这里进入，向上输送
  | 'conveyor-lift-out-bottom'  // F1 底座：物料从这里吐出（来自上方）
  | 'conveyor-lift-in-top'      // F2 顶部：物料从这里进入，向下输送
  | 'conveyor-lift-out-top';    // F2 顶部：物料从这里吐出（来自下方）

export type BuildingType = PlaceableType;

// ===== 建筑元数据 =====

export interface BuildingMetadata {
  type: BuildingType;
  category: BuildingCategory;
  displayName: string;
  dimensions: Dimensions;
  clearanceHeight: number;
  ports: PortDef[];
  color: string;
  powerUsage: number;
  stackable: boolean;
  wallMounted: boolean;
}

// ===== 方案数据实例 =====

export type BeltMark = 1 | 2 | 3 | 4 | 5 | 6;

export interface MachineInstance {
  id: string;
  type: PlaceableType;
  pos: GridPos;
  facing: Facing;
  floor: number;
  recipe?: string;
  clockSpeed?: number;
  label?: string;
}

export interface BeltSegment {
  id: string;
  floor: number;
  mark: BeltMark;
  material: string;
  path: GridPos[];
  fromPort?: string;
  toPort?: string;
}

export interface LiftPair {
  id: string;                   // pair 标识，全局唯一
  bottomMachine: string;        // 指向 scheme.machines 中 F1 的 lift 机器 id
  topMachine: string;           // 指向 scheme.machines 中 F2 的 lift 机器 id
  material: string;             // 物流元数据，用于 LiftOverlay 徽标
  mark: BeltMark;               // 升降机等级（沿用原 Lift.mark 字段含义）
}

export interface Zone {
  id: string;
  floor: number;
  pos: GridPos;
  size: { w: number; h: number };
  kind: string;
  label: string;
  color?: string;
}

export interface Floor {
  id: number;
  label: string;
  gridSize: { cols: number; rows: number };
}

export interface DesignPrinciples {
  preferWallOutlets: boolean;
  preferWallHoles: boolean;
  preferCeilingMounts: boolean;
  keepFloorClear: boolean;
}

// ===== 方案顶层结构 =====

export interface Scheme {
  id: string;
  name: string;
  version: string;
  category: string;
  description: string;
  designPrinciples: DesignPrinciples;
  floors: Floor[];
  machines: MachineInstance[];
  belts: BeltSegment[];
  liftPairs: LiftPair[];
  zones: Zone[];
  // 注意：不再持久化 stats。输入/输出/总功耗由 src/core/computeStats.ts
  // 基于 machines + recipes 实时计算。旧 scheme 文件里遗留的 stats 字段
  // 会被 JSON 导入静默忽略。
}

// ===== 方案索引 =====

export interface SchemeIndex {
  id: string;
  name: string;
  category: string;
  description: string;
  floorCount: number;
  filePath: string;
}

// ===== 视图状态 =====

export type ViewMode = 'single' | 'linked';

export interface Viewport {
  zoom: number;
  panX: number;
  panY: number;
}

export interface Layers {
  belts: boolean;
  zones: boolean;
  storage: boolean;
  beltFlow: boolean;
  showBeltMark: boolean;
}
