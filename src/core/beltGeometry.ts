import type { BeltSegment, Facing, GridPos, MachineInstance } from './types';
import { getBuildingMeta } from './registry';
import { METERS_PER_GRID, SIDE_MAP, machineGridSize } from './coordinate';

type ScreenSide = 'top' | 'bottom' | 'left' | 'right';

interface ResolvedPort {
  pos: GridPos;
  screenSide: ScreenSide;
}

const EPSILON = 0.0001;

function samePoint(a: GridPos, b: GridPos): boolean {
  return Math.abs(a.col - b.col) < EPSILON && Math.abs(a.row - b.row) < EPSILON;
}

function clonePoint(point: GridPos): GridPos {
  return { col: point.col, row: point.row };
}

function isVerticalSide(side: ScreenSide): boolean {
  return side === 'top' || side === 'bottom';
}

export function isPointAlignedWithPortAxis(port: ResolvedPort, point: GridPos): boolean {
  return isVerticalSide(port.screenSide)
    ? Math.abs(point.col - port.pos.col) < EPSILON
    : Math.abs(point.row - port.pos.row) < EPSILON;
}

export function isPointOnPortExteriorSide(port: ResolvedPort, point: GridPos): boolean {
  switch (port.screenSide) {
    case 'top':
      return point.row < port.pos.row - EPSILON;
    case 'bottom':
      return point.row > port.pos.row + EPSILON;
    case 'left':
      return point.col < port.pos.col - EPSILON;
    case 'right':
      return point.col > port.pos.col + EPSILON;
  }
}

function buildBridge(anchor: GridPos, port: GridPos, vertical: boolean): GridPos {
  return vertical
    ? { col: port.col, row: anchor.row }
    : { col: anchor.col, row: port.row };
}

export function resolvePortGridRef(
  portRef: string | undefined,
  machines: MachineInstance[],
): ResolvedPort | null {
  if (!portRef) return null;

  const [machineId, portId] = portRef.split(':');
  const machine = machines.find(m => m.id === machineId);
  if (!machine) return null;

  try {
    const meta = getBuildingMeta(machine.type);
    const portDef = meta.ports.find(port => port.id === portId);
    if (!portDef) return null;

    const { cols, rows } = machineGridSize(meta.dimensions, machine.facing);
    const screenSide = SIDE_MAP[machine.facing as Facing][portDef.side];
    const offsetGrid = portDef.offsetAlongEdge / METERS_PER_GRID;

    switch (screenSide) {
      case 'top':
        return { pos: { col: machine.pos.col + offsetGrid, row: machine.pos.row }, screenSide };
      case 'bottom':
        return { pos: { col: machine.pos.col + offsetGrid, row: machine.pos.row + rows }, screenSide };
      case 'left':
        return { pos: { col: machine.pos.col, row: machine.pos.row + offsetGrid }, screenSide };
      case 'right':
        return { pos: { col: machine.pos.col + cols, row: machine.pos.row + offsetGrid }, screenSide };
    }
  } catch {
    return null;
  }
}

function normalizeStart(points: GridPos[], port: ResolvedPort): void {
  if (points.length === 0) return;

  points[0] = clonePoint(port.pos);
  if (points.length < 2) return;

  const next = points[1];
  const vertical = isVerticalSide(port.screenSide);
  const axisMatches = isPointAlignedWithPortAxis(port, next);

  if (axisMatches) return;

  const anchor = points[2] ?? next;
  points[1] = buildBridge(anchor, points[0], vertical);
}

function normalizeEnd(points: GridPos[], port: ResolvedPort): void {
  if (points.length === 0) return;

  const lastIdx = points.length - 1;
  points[lastIdx] = clonePoint(port.pos);
  if (points.length < 2) return;

  const prevIdx = lastIdx - 1;
  const prev = points[prevIdx];
  const vertical = isVerticalSide(port.screenSide);
  const axisMatches = isPointAlignedWithPortAxis(port, prev);

  if (axisMatches) return;

  const anchor = points[prevIdx - 1] ?? prev;
  points[prevIdx] = buildBridge(anchor, points[lastIdx], vertical);
}

function dedupePoints(points: GridPos[]): GridPos[] {
  const deduped: GridPos[] = [];

  for (const point of points) {
    if (deduped.length === 0 || !samePoint(deduped[deduped.length - 1], point)) {
      deduped.push(clonePoint(point));
    }
  }

  return deduped;
}

export function buildBeltRenderPath(
  belt: BeltSegment,
  machines: MachineInstance[],
): GridPos[] {
  const points = belt.path.map(clonePoint);

  const fromPort = resolvePortGridRef(belt.fromPort, machines);
  if (fromPort) normalizeStart(points, fromPort);

  const toPort = resolvePortGridRef(belt.toPort, machines);
  if (toPort) normalizeEnd(points, toPort);

  return dedupePoints(points);
}

export function getTerminalSegment(
  points: GridPos[],
  edge: 'start' | 'end',
): [GridPos, GridPos] | null {
  if (points.length < 2) return null;

  if (edge === 'start') {
    for (let i = 0; i < points.length - 1; i++) {
      if (!samePoint(points[i], points[i + 1])) {
        return [points[i], points[i + 1]];
      }
    }
    return null;
  }

  for (let i = points.length - 1; i > 0; i--) {
    if (!samePoint(points[i - 1], points[i])) {
      return [points[i - 1], points[i]];
    }
  }

  return null;
}
