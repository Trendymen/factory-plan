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

export type BuildingCategory = 'production' | 'logistics' | 'storage' | 'structure';

export type PlaceableType =
  | 'smelter' | 'foundry' | 'constructor' | 'assembler' | 'manufacturer'
  | 'splitter' | 'merger'
  | 'storage' | 'industrial-storage';

export type StructureType =
  | 'wall-conveyor-hole' | 'wall-pipe-hole'
  | 'conveyor-wall-mount' | 'conveyor-ceiling-mount' | 'conveyor-floor-stand';

export type BuildingType = PlaceableType | StructureType | 'conveyor-lift';

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

export interface Lift {
  id: string;
  pos: GridPos;
  mark: BeltMark;
  fromFloor: number;
  toFloor: number;
  material: string;
  connectedBelts?: [string, string];
}

export interface StructureInstance {
  id: string;
  type: StructureType;
  pos: GridPos;
  floor: number;
  wallSide?: Facing;
  heightM?: number;
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
  heightM: number;
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
  lifts: Lift[];
  structures: StructureInstance[];
  zones: Zone[];
  stats: {
    totalPowerMW: number;
    inputs: { material: string; rate: number }[];
    outputs: { material: string; rate: number }[];
  };
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

export type ViewMode = 'single' | 'linked' | 'section';

export interface Viewport {
  zoom: number;
  panX: number;
  panY: number;
}

export interface SectionCut {
  axis: 'col' | 'row';
  position: number;
}

export interface Layers {
  belts: boolean;
  zones: boolean;
  structures: boolean;
  storage: boolean;
}
