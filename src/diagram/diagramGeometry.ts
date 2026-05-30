// src/diagram/diagramGeometry.ts
// 薄封装 coordinate.ts 纯函数 + 新增 bounds/viewBox/safe meta。绝不 import schema/store。
import {
  GRID_PX,
  PAD,
  METERS_PER_GRID,
  gridToSvg,
  machineGridSize,
  resolvePortPosition,
  calcViewBox,
} from '../core/coordinate';
import { BUILDING_REGISTRY } from '../core/registry';
import type { BuildingMetadata, PortDef } from '../core/types';
import type { DiagramMachine } from './diagramTypes';

export { GRID_PX, PAD, METERS_PER_GRID, gridToSvg, machineGridSize, resolvePortPosition, calcViewBox };

const GRAY_FALLBACK: BuildingMetadata = {
  type: 'smelter',
  category: 'production',
  displayName: '未知',
  dimensions: { width: 8, length: 8, height: 8 },
  clearanceHeight: 8,
  ports: [],
  color: '--diagram-unknown',
  powerUsage: 0,
  stackable: false,
  wallMounted: false,
};

const warned = new Set<string>();

export function safeGetBuildingMeta(type: string): BuildingMetadata {
  const meta = BUILDING_REGISTRY[type];
  if (meta) return meta;
  if (import.meta.env?.DEV && !warned.has(type)) {
    warned.add(type);
    console.warn(`[diagram] unknown building type "${type}", rendering gray placeholder`);
  }
  return GRAY_FALLBACK;
}

export function resolveDiagramPort(
  ref: string | undefined,
  machines: DiagramMachine[],
): { x: number; y: number } | null {
  if (!ref) return null;
  const idx = ref.indexOf(':');
  if (idx < 0) return null;
  const machineId = ref.slice(0, idx);
  const portId = ref.slice(idx + 1);
  const machine = machines.find((m) => m.id === machineId);
  if (!machine) return null;
  const meta = safeGetBuildingMeta(machine.type);
  const portDef: PortDef | undefined = meta.ports.find((p) => p.id === portId);
  if (!portDef) return null;
  return resolvePortPosition(
    { col: machine.col, row: machine.row },
    machine.facing ?? 'south',
    meta.dimensions,
    portDef,
  );
}

export interface MachineRect {
  x: number;
  y: number;
  w: number;
  h: number;
  cols: number;
  rows: number;
}

export function machineSvgRect(m: DiagramMachine): MachineRect {
  const meta = safeGetBuildingMeta(m.type);
  const { cols, rows } = machineGridSize(meta.dimensions, m.facing ?? 'south');
  const { x, y } = gridToSvg(m.col, m.row);
  return { x, y, w: cols * GRID_PX, h: rows * GRID_PX, cols, rows };
}

export interface Bounds {
  minCol: number;
  minRow: number;
  maxCol: number;
  maxRow: number;
}

export function computeBounds(machines: DiagramMachine[]): Bounds {
  if (machines.length === 0) {
    return { minCol: 0, minRow: 0, maxCol: 1, maxRow: 1 };
  }
  let minCol = Infinity;
  let minRow = Infinity;
  let maxCol = -Infinity;
  let maxRow = -Infinity;
  for (const m of machines) {
    const meta = safeGetBuildingMeta(m.type);
    const { cols, rows } = machineGridSize(meta.dimensions, m.facing ?? 'south');
    minCol = Math.min(minCol, m.col);
    minRow = Math.min(minRow, m.row);
    maxCol = Math.max(maxCol, m.col + cols);
    maxRow = Math.max(maxRow, m.row + rows);
  }
  return { minCol, minRow, maxCol, maxRow };
}

export function fitViewBox(
  grid: { cols: number; rows: number } | undefined,
  machines: DiagramMachine[],
): string {
  if (grid) return calcViewBox(grid.cols, grid.rows);
  const b = computeBounds(machines);
  const cols = Math.max(1, Math.ceil(b.maxCol));
  const rows = Math.max(1, Math.ceil(b.maxRow));
  return calcViewBox(cols, rows);
}
