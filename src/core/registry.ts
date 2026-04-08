// src/core/registry.ts
import type { BuildingMetadata, BuildingType, BuildingCategory, PortDef } from './types';

function port(id: string, kind: PortDef['kind'], side: PortDef['side'], offset: number, height = 1): PortDef {
  return { id, kind, side, offsetAlongEdge: offset, heightM: height, direction: 'outward' };
}

export const BUILDING_REGISTRY: Record<string, BuildingMetadata> = {
  smelter: {
    type: 'smelter', category: 'production', displayName: '冶炼炉',
    dimensions: { width: 6, length: 9, height: 9 }, clearanceHeight: 9,
    ports: [port('in-0', 'belt-in', 'back', 3), port('out-0', 'belt-out', 'front', 3)],
    color: '--smelter', powerUsage: 4, stackable: false, wallMounted: false,
  },
  foundry: {
    type: 'foundry', category: 'production', displayName: '铸造厂',
    dimensions: { width: 10, length: 9, height: 9 }, clearanceHeight: 9,
    ports: [port('in-0', 'belt-in', 'back', 3), port('in-1', 'belt-in', 'back', 7), port('out-0', 'belt-out', 'front', 5)],
    color: '--foundry', powerUsage: 16, stackable: false, wallMounted: false,
  },
  constructor: {
    type: 'constructor' as BuildingType, category: 'production' as BuildingCategory, displayName: '建造机',
    dimensions: { width: 8, length: 10, height: 8 }, clearanceHeight: 8,
    ports: [port('in-0', 'belt-in', 'back', 4), port('out-0', 'belt-out', 'front', 4)],
    color: '--constructor', powerUsage: 4, stackable: false, wallMounted: false,
  },
  assembler: {
    type: 'assembler', category: 'production', displayName: '组装机',
    dimensions: { width: 10, length: 15, height: 10 }, clearanceHeight: 10,
    ports: [port('in-0', 'belt-in', 'back', 3), port('in-1', 'belt-in', 'back', 7), port('out-0', 'belt-out', 'front', 5)],
    color: '--assembler', powerUsage: 15, stackable: false, wallMounted: false,
  },
  manufacturer: {
    type: 'manufacturer', category: 'production', displayName: '制造机',
    dimensions: { width: 18, length: 20, height: 12 }, clearanceHeight: 8,
    ports: [
      port('in-0', 'belt-in', 'front', 3), port('in-1', 'belt-in', 'front', 7),
      port('in-2', 'belt-in', 'front', 11), port('in-3', 'belt-in', 'front', 15),
      port('out-0', 'belt-out', 'back', 9),
    ],
    color: '--manufacturer', powerUsage: 55, stackable: false, wallMounted: false,
  },
  splitter: {
    type: 'splitter', category: 'logistics', displayName: '分流器',
    dimensions: { width: 4, length: 4, height: 3 }, clearanceHeight: 3,
    ports: [port('in-0', 'belt-in', 'back', 2), port('out-0', 'belt-out', 'front', 2), port('out-1', 'belt-out', 'left', 2), port('out-2', 'belt-out', 'right', 2)],
    color: '--splitter', powerUsage: 0, stackable: true, wallMounted: false,
  },
  merger: {
    type: 'merger', category: 'logistics', displayName: '合流器',
    dimensions: { width: 4, length: 4, height: 3 }, clearanceHeight: 3,
    ports: [port('in-0', 'belt-in', 'back', 2), port('in-1', 'belt-in', 'left', 2), port('in-2', 'belt-in', 'right', 2), port('out-0', 'belt-out', 'front', 2)],
    color: '--merger', powerUsage: 0, stackable: true, wallMounted: false,
  },
  'conveyor-lift': {
    type: 'conveyor-lift', category: 'logistics', displayName: '传送带升降机',
    dimensions: { width: 2, length: 2, height: 7 }, clearanceHeight: 7,
    ports: [port('bottom', 'belt-in', 'bottom', 1, 0), port('top', 'belt-out', 'top', 1, 7)],
    color: '--lift', powerUsage: 0, stackable: false, wallMounted: false,
  },
  storage: {
    type: 'storage', category: 'storage', displayName: '储存箱',
    dimensions: { width: 5, length: 10, height: 4 }, clearanceHeight: 4,
    ports: [port('in-0', 'belt-in', 'back', 2.5), port('out-0', 'belt-out', 'front', 2.5)],
    color: '--storage', powerUsage: 0, stackable: true, wallMounted: false,
  },
  'industrial-storage': {
    type: 'industrial-storage', category: 'storage', displayName: '工业储存箱',
    dimensions: { width: 5, length: 10, height: 8 }, clearanceHeight: 8,
    ports: [port('in-0', 'belt-in', 'back', 1.5), port('in-1', 'belt-in', 'back', 3.5), port('out-0', 'belt-out', 'front', 1.5), port('out-1', 'belt-out', 'front', 3.5)],
    color: '--industrial-storage', powerUsage: 0, stackable: true, wallMounted: false,
  },
  'wall-outlet-mk1': {
    type: 'wall-outlet-mk1', category: 'power', displayName: '墙壁电源 Mk.1',
    dimensions: { width: 1, length: 0.5, height: 1 }, clearanceHeight: 1,
    ports: [port('pwr-0', 'power', 'front', 0.5, 0.5)],
    color: '--power', powerUsage: 0, stackable: false, wallMounted: true,
  },
  'wall-outlet-mk2': {
    type: 'wall-outlet-mk2', category: 'power', displayName: '墙壁电源 Mk.2',
    dimensions: { width: 1, length: 0.5, height: 1 }, clearanceHeight: 1,
    ports: [port('pwr-0', 'power', 'front', 0.5, 0.5)],
    color: '--power', powerUsage: 0, stackable: false, wallMounted: true,
  },
  'wall-outlet-mk3': {
    type: 'wall-outlet-mk3', category: 'power', displayName: '墙壁电源 Mk.3',
    dimensions: { width: 1, length: 0.5, height: 1 }, clearanceHeight: 1,
    ports: [port('pwr-0', 'power', 'front', 0.5, 0.5)],
    color: '--power', powerUsage: 0, stackable: false, wallMounted: true,
  },
  'power-pole-mk1': {
    type: 'power-pole-mk1', category: 'power', displayName: '电线杆 Mk.1',
    dimensions: { width: 0.8, length: 0.8, height: 7 }, clearanceHeight: 7,
    ports: [port('pwr-0', 'power', 'top', 0.4, 7)],
    color: '--power', powerUsage: 0, stackable: false, wallMounted: false,
  },
  'wall-conveyor-hole': {
    type: 'wall-conveyor-hole', category: 'structure', displayName: '墙壁传送带孔',
    dimensions: { width: 4, length: 1, height: 2 }, clearanceHeight: 2,
    ports: [port('in-0', 'belt-in', 'back', 2, 1), port('out-0', 'belt-out', 'front', 2, 1)],
    color: '--structure', powerUsage: 0, stackable: false, wallMounted: true,
  },
  'conveyor-ceiling-mount': {
    type: 'conveyor-ceiling-mount', category: 'structure', displayName: '吊顶传送带支架',
    dimensions: { width: 2, length: 2, height: 1 }, clearanceHeight: 1,
    ports: [],
    color: '--structure', powerUsage: 0, stackable: false, wallMounted: true,
  },
  'conveyor-wall-mount': {
    type: 'conveyor-wall-mount', category: 'structure', displayName: '挂墙传送带支架',
    dimensions: { width: 2, length: 1, height: 2 }, clearanceHeight: 2,
    ports: [],
    color: '--structure', powerUsage: 0, stackable: false, wallMounted: true,
  },
};

export function getBuildingMeta(type: BuildingType): BuildingMetadata {
  const meta = BUILDING_REGISTRY[type];
  if (!meta) throw new Error(`Unknown building type: ${type}`);
  return meta;
}

export const MATERIAL_COLORS: Record<string, string> = {
  '铁矿石': 'var(--mat-iron-ore)', '铁锭': 'var(--mat-iron-ingot)',
  '铁板': 'var(--mat-iron-plate)', '铁棒': 'var(--mat-iron-rod)',
  '螺丝': 'var(--mat-screw)', '铜矿石': 'var(--mat-copper-ore)',
  '铜锭': 'var(--mat-copper-ingot)', '电线': 'var(--mat-wire)',
  '线缆': 'var(--mat-cable)', '铜板': 'var(--mat-copper-sheet)',
  '石灰石': 'var(--mat-limestone)', '混凝土': 'var(--mat-concrete)',
  '强化铁板': 'var(--mat-reinforced-plate)', '转子': 'var(--mat-rotor)',
  '模块化框架': 'var(--mat-modular-frame)',
};

export const MATERIAL_RAW_COLORS: Record<string, string> = {
  '铁矿石': '#a0782c', '铁锭': '#ff6b35', '铁板': '#00bcd4', '铁棒': '#448aff',
  '螺丝': '#66bb6a', '铜矿石': '#e67333', '铜锭': '#ff7043', '电线': '#ef5350',
  '线缆': '#c62828', '铜板': '#ff8a65', '石灰石': '#bdbdbd', '混凝土': '#9e9e9e',
  '强化铁板': '#00838f', '转子': '#7c4dff', '模块化框架': '#aa00ff',
};

export function getMaterialColor(material: string): string {
  return MATERIAL_RAW_COLORS[material] ?? '#888888';
}
