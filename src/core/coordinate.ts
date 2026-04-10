// src/core/coordinate.ts
import type { Dimensions, Facing, GridPos, PortDef } from './types';

export const GRID_PX = 80;
export const METERS_PER_GRID = 8;
export const PAD = 40;

export function gridToSvg(col: number, row: number): { x: number; y: number } {
  return { x: PAD + col * GRID_PX, y: PAD + row * GRID_PX };
}

export function svgToGrid(x: number, y: number): { col: number; row: number } {
  return { col: (x - PAD) / GRID_PX, row: (y - PAD) / GRID_PX };
}

export function gridToMeters(col: number, row: number): { x: number; y: number } {
  return { x: col * METERS_PER_GRID, y: row * METERS_PER_GRID };
}

export function metersToGrid(mx: number, my: number): { col: number; row: number } {
  return { col: mx / METERS_PER_GRID, row: my / METERS_PER_GRID };
}

export function metersToGridSize(m: number): number {
  return m / METERS_PER_GRID;
}

export function machineGridSize(dim: Dimensions, facing: Facing): { cols: number; rows: number } {
  const w = metersToGridSize(dim.width);
  const l = metersToGridSize(dim.length);
  if (facing === 'south' || facing === 'north') return { cols: w, rows: l };
  return { cols: l, rows: w };
}

export const SIDE_MAP: Record<Facing, Record<string, 'top' | 'bottom' | 'left' | 'right'>> = {
  south: { front: 'bottom', back: 'top', left: 'right', right: 'left', top: 'top', bottom: 'bottom' },
  north: { front: 'top', back: 'bottom', left: 'left', right: 'right', top: 'top', bottom: 'bottom' },
  east:  { front: 'right', back: 'left', left: 'bottom', right: 'top', top: 'top', bottom: 'bottom' },
  west:  { front: 'left', back: 'right', left: 'top', right: 'bottom', top: 'top', bottom: 'bottom' },
};

export function resolvePortPosition(
  machinePos: GridPos,
  facing: Facing,
  dimensions: Dimensions,
  port: PortDef,
): { x: number; y: number } {
  const { cols, rows } = machineGridSize(dimensions, facing);
  const { x: mx, y: my } = gridToSvg(machinePos.col, machinePos.row);
  const wPx = cols * GRID_PX;
  const hPx = rows * GRID_PX;

  const screenSide = SIDE_MAP[facing][port.side];
  const offsetPx = (port.offsetAlongEdge / METERS_PER_GRID) * GRID_PX;

  switch (screenSide) {
    case 'top':    return { x: mx + offsetPx, y: my };
    case 'bottom': return { x: mx + offsetPx, y: my + hPx };
    case 'left':   return { x: mx,            y: my + offsetPx };
    case 'right':  return { x: mx + wPx,      y: my + offsetPx };
  }
}

export function calcViewBox(cols: number, rows: number): string {
  const w = cols * GRID_PX + PAD * 2;
  const h = rows * GRID_PX + PAD * 2;
  return `0 0 ${w} ${h}`;
}
