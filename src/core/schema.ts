// src/core/schema.ts
import type { Scheme, SchemeIndex, GridPos, Facing } from './types';
import { BUILDING_REGISTRY } from './registry';
import {
  type Rect, machineRect, rectFromSegment,
  rectsOverlap, intervalsOverlap,
} from './collision';
import { SIDE_MAP, machineGridSize, METERS_PER_GRID } from './coordinate';

/** 验证严重级别 */
export type Severity = 'error' | 'warn';

export interface ValidationIssue {
  severity: Severity;
  rule: string;
  message: string;
  elementId?: string;
}

// ============================================================
// 网格对齐步进（0.25 = 2m 精度）
// ============================================================
const GRID_STEP = 0.25;

function isAligned(v: number): boolean {
  return Math.abs(v - Math.round(v / GRID_STEP) * GRID_STEP) < 0.001;
}

// ============================================================
// 传送带正交性检查：相邻两点必须共享 col 或 row
// ============================================================
function isOrthogonal(a: GridPos, b: GridPos): boolean {
  const dCol = Math.abs(a.col - b.col);
  const dRow = Math.abs(a.row - b.row);
  return dCol < 0.001 || dRow < 0.001;
}

// ============================================================
// 端口引用格式验证
// ============================================================
function isValidPortRef(ref: string): boolean {
  const parts = ref.split(':');
  return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0;
}

// ============================================================
// 主验证函数
// ============================================================
export function validateScheme(scheme: Scheme): string[] {
  const issues = validateSchemeDetailed(scheme);
  return issues.map(i => `[${i.severity}] ${i.message}`);
}

export function validateSchemeDetailed(scheme: Scheme): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const floorIds = new Set(scheme.floors.map(f => f.id));
  const machineIds = new Set(scheme.machines.map(m => m.id));
  const beltIds = new Set(scheme.belts.map(b => b.id));

  // 构建楼层边界映射
  const floorBounds = new Map<number, { cols: number; rows: number }>();
  for (const f of scheme.floors) {
    floorBounds.set(f.id, f.gridSize);
  }

  // ----------------------------------------------------------
  // R1: 机器类型合法性
  // ----------------------------------------------------------
  for (const m of scheme.machines) {
    if (!BUILDING_REGISTRY[m.type]) {
      issues.push({ severity: 'error', rule: 'R1-type', message: `Machine "${m.id}": unknown type "${m.type}"`, elementId: m.id });
    }
    if (!floorIds.has(m.floor)) {
      issues.push({ severity: 'error', rule: 'R1-floor', message: `Machine "${m.id}": references non-existent floor ${m.floor}`, elementId: m.id });
    }

    // R2: 机器坐标网格对齐
    if (!isAligned(m.pos.col) || !isAligned(m.pos.row)) {
      issues.push({ severity: 'warn', rule: 'R2-align', message: `Machine "${m.id}": pos (${m.pos.col}, ${m.pos.row}) not aligned to ${GRID_STEP} grid step`, elementId: m.id });
    }

    // R3: 机器完整占地不超出画布边界（含 dimensions + facing 旋转）
    const bounds = floorBounds.get(m.floor);
    if (bounds) {
      const rect = machineRect(m);
      if (rect) {
        if (rect.x1 < -0.001 || rect.y1 < -0.001 || rect.x2 > bounds.cols + 0.001 || rect.y2 > bounds.rows + 0.001) {
          issues.push({ severity: 'error', rule: 'R3-bounds', message: `Machine "${m.id}": AABB (${rect.x1},${rect.y1})-(${rect.x2.toFixed(3)},${rect.y2.toFixed(3)}) exceeds floor bounds (${bounds.cols}×${bounds.rows})`, elementId: m.id });
        }
      } else if (m.pos.col < 0 || m.pos.row < 0 || m.pos.col >= bounds.cols || m.pos.row >= bounds.rows) {
        issues.push({ severity: 'error', rule: 'R3-bounds', message: `Machine "${m.id}": pos (${m.pos.col}, ${m.pos.row}) out of floor bounds (${bounds.cols}×${bounds.rows})`, elementId: m.id });
      }
    }
  }

  // ----------------------------------------------------------
  // R4: 传送带必须有 fromPort 和 toPort
  // （升降机连接的传送带、楼层边界外部输入/输出除外）
  // ----------------------------------------------------------
  const liftConnectedBelts = new Set(scheme.lifts.flatMap(l => l.connectedBelts ?? []));
  function isAtFloorEdge(b: { floor: number; path: GridPos[] }, end: 'start' | 'end'): boolean {
    const bounds = floorBounds.get(b.floor);
    if (!bounds) return false;
    const p = end === 'start' ? b.path[0] : b.path[b.path.length - 1];
    return p.col <= 0 || p.row <= 0 || p.col >= bounds.cols || p.row >= bounds.rows;
  }
  for (const b of scheme.belts) {
    if (!b.fromPort && !liftConnectedBelts.has(b.id) && !isAtFloorEdge(b, 'start')) {
      issues.push({ severity: 'warn', rule: 'R4-fromPort', message: `Belt "${b.id}": missing fromPort`, elementId: b.id });
    }
    if (!b.toPort && !liftConnectedBelts.has(b.id) && !isAtFloorEdge(b, 'end')) {
      issues.push({ severity: 'warn', rule: 'R4-toPort', message: `Belt "${b.id}": missing toPort`, elementId: b.id });
    }

    // R5: 端口引用格式正确且目标存在
    if (b.fromPort) {
      if (!isValidPortRef(b.fromPort)) {
        issues.push({ severity: 'error', rule: 'R5-format', message: `Belt "${b.id}": fromPort "${b.fromPort}" invalid format (expect "machineId:portId")`, elementId: b.id });
      } else {
        const machineId = b.fromPort.split(':')[0];
        if (!machineIds.has(machineId)) {
          issues.push({ severity: 'error', rule: 'R5-ref', message: `Belt "${b.id}": fromPort references unknown machine "${machineId}"`, elementId: b.id });
        }
      }
    }
    if (b.toPort) {
      if (!isValidPortRef(b.toPort)) {
        issues.push({ severity: 'error', rule: 'R5-format', message: `Belt "${b.id}": toPort "${b.toPort}" invalid format (expect "machineId:portId")`, elementId: b.id });
      } else {
        const machineId = b.toPort.split(':')[0];
        if (!machineIds.has(machineId)) {
          issues.push({ severity: 'error', rule: 'R5-ref', message: `Belt "${b.id}": toPort references unknown machine "${machineId}"`, elementId: b.id });
        }
      }
    }

    // R6: 传送带路径至少 2 个点
    if (b.path.length < 2) {
      issues.push({ severity: 'error', rule: 'R6-path', message: `Belt "${b.id}": path must have at least 2 points (has ${b.path.length})`, elementId: b.id });
    }

    // R7: 传送带路径必须正交（相邻点共享 col 或 row）
    for (let i = 0; i < b.path.length - 1; i++) {
      if (!isOrthogonal(b.path[i], b.path[i + 1])) {
        issues.push({
          severity: 'error', rule: 'R7-orthogonal',
          message: `Belt "${b.id}": segment ${i}→${i + 1} is diagonal ((${b.path[i].col},${b.path[i].row})→(${b.path[i + 1].col},${b.path[i + 1].row}))`,
          elementId: b.id,
        });
      }
    }

    // R8: 传送带路径点网格对齐
    for (let i = 0; i < b.path.length; i++) {
      const p = b.path[i];
      if (!isAligned(p.col) || !isAligned(p.row)) {
        issues.push({ severity: 'warn', rule: 'R8-align', message: `Belt "${b.id}": path point ${i} (${p.col}, ${p.row}) not aligned to ${GRID_STEP} step`, elementId: b.id });
      }
    }

    // R9: 楼层引用
    if (!floorIds.has(b.floor)) {
      issues.push({ severity: 'error', rule: 'R9-floor', message: `Belt "${b.id}": references non-existent floor ${b.floor}`, elementId: b.id });
    }
  }

  // ----------------------------------------------------------
  // R10: 升降机验证
  // ----------------------------------------------------------
  for (const l of scheme.lifts) {
    if (!floorIds.has(l.fromFloor)) {
      issues.push({ severity: 'error', rule: 'R10-floor', message: `Lift "${l.id}": non-existent fromFloor ${l.fromFloor}`, elementId: l.id });
    }
    if (!floorIds.has(l.toFloor)) {
      issues.push({ severity: 'error', rule: 'R10-floor', message: `Lift "${l.id}": non-existent toFloor ${l.toFloor}`, elementId: l.id });
    }
    if (l.connectedBelts) {
      for (const bid of l.connectedBelts) {
        if (!beltIds.has(bid)) {
          issues.push({ severity: 'warn', rule: 'R10-belt', message: `Lift "${l.id}": references unknown belt "${bid}"`, elementId: l.id });
        }
      }
    }
  }

  // ----------------------------------------------------------
  // R12: ID 唯一性
  // ----------------------------------------------------------
  const allElementIds: string[] = [
    ...scheme.machines.map(m => m.id),
    ...scheme.belts.map(b => b.id),
    ...scheme.lifts.map(l => l.id),
    ...scheme.structures.map(s => s.id),
  ];
  const idCounts = new Map<string, number>();
  for (const id of allElementIds) {
    idCounts.set(id, (idCounts.get(id) ?? 0) + 1);
  }
  for (const [id, count] of idCounts) {
    if (count > 1) {
      issues.push({ severity: 'error', rule: 'R12-unique', message: `Duplicate element ID "${id}" (appears ${count} times)` });
    }
  }

  // ----------------------------------------------------------
  // R13: 机器间碰撞检测（AABB 重叠）
  // ----------------------------------------------------------
  const machineBoxes = scheme.machines
    .map(m => ({ id: m.id, floor: m.floor, rect: machineRect(m) }))
    .filter((e): e is { id: string; floor: number; rect: Rect } => e.rect !== null);

  for (let i = 0; i < machineBoxes.length; i++) {
    for (let j = i + 1; j < machineBoxes.length; j++) {
      const a = machineBoxes[i];
      const b = machineBoxes[j];
      if (a.floor !== b.floor) continue;
      if (rectsOverlap(a.rect, b.rect, 0.01)) {
        issues.push({
          severity: 'error', rule: 'R13-collision',
          message: `Machine collision on floor ${a.floor}: "${a.id}" (${a.rect.x1},${a.rect.y1})-(${a.rect.x2.toFixed(2)},${a.rect.y2.toFixed(2)}) overlaps "${b.id}" (${b.rect.x1},${b.rect.y1})-(${b.rect.x2.toFixed(2)},${b.rect.y2.toFixed(2)})`,
        });
      }
    }
  }

  // ----------------------------------------------------------
  // R14: 传送带线段不穿过机器主体
  // ----------------------------------------------------------
  for (const b of scheme.belts) {
    const fromMachine = b.fromPort?.split(':')[0];
    const toMachine = b.toPort?.split(':')[0];

    for (let i = 0; i < b.path.length - 1; i++) {
      const segRect = rectFromSegment(b.path[i], b.path[i + 1]);

      for (const box of machineBoxes) {
        if (box.floor !== b.floor) continue;
        if (box.id === fromMachine || box.id === toMachine) continue;
        if (rectsOverlap(segRect, box.rect, 0.02)) {
          issues.push({
            severity: 'warn', rule: 'R14-belt-cross',
            message: `Belt "${b.id}" segment ${i}→${i + 1} crosses through machine "${box.id}" on floor ${b.floor}`,
            elementId: b.id,
          });
        }
      }
    }
  }

  // ----------------------------------------------------------
  // R16: 传送带端口-路径正交对齐（渲染时不产生斜线）
  // 检查传送带首尾路径点与端口位置是否在同一轴上，
  // 以及接近端口的线段方向是否垂直于端口所在边。
  // ----------------------------------------------------------
  const machineMap = new Map(scheme.machines.map(m => [m.id, m]));

  function portGridPos(portRef: string): { pos: GridPos; screenSide: string } | null {
    const [mid, pid] = portRef.split(':');
    const machine = machineMap.get(mid);
    if (!machine) return null;
    const meta = BUILDING_REGISTRY[machine.type];
    if (!meta) return null;
    const portDef = meta.ports.find(p => p.id === pid);
    if (!portDef) return null;
    const { cols, rows } = machineGridSize(meta.dimensions, machine.facing);
    const screenSide = SIDE_MAP[machine.facing as Facing][portDef.side];
    const offsetGrid = portDef.offsetAlongEdge / METERS_PER_GRID;
    let pos: GridPos;
    switch (screenSide) {
      case 'top':    pos = { col: machine.pos.col + offsetGrid, row: machine.pos.row }; break;
      case 'bottom': pos = { col: machine.pos.col + offsetGrid, row: machine.pos.row + rows }; break;
      case 'left':   pos = { col: machine.pos.col,              row: machine.pos.row + offsetGrid }; break;
      case 'right':  pos = { col: machine.pos.col + cols,       row: machine.pos.row + offsetGrid }; break;
    }
    return { pos, screenSide };
  }

  for (const b of scheme.belts) {
    // 检查 fromPort 端
    if (b.fromPort && b.path.length >= 2) {
      const portInfo = portGridPos(b.fromPort);
      if (portInfo) {
        const nextPt = b.path[1];
        const isVerticalPort = portInfo.screenSide === 'top' || portInfo.screenSide === 'bottom';
        // 端口位置与第二路径点不共轴 → 渲染会产生斜线
        if (isVerticalPort && Math.abs(portInfo.pos.col - nextPt.col) > 0.01) {
          issues.push({
            severity: 'warn', rule: 'R16-port-align',
            message: `Belt "${b.id}": fromPort 在 ${portInfo.screenSide} 边(col=${portInfo.pos.col.toFixed(3)})，但路径第2点 col=${nextPt.col}，应垂直接入`,
            elementId: b.id,
          });
        }
        if (!isVerticalPort && Math.abs(portInfo.pos.row - nextPt.row) > 0.01) {
          issues.push({
            severity: 'warn', rule: 'R16-port-align',
            message: `Belt "${b.id}": fromPort 在 ${portInfo.screenSide} 边(row=${portInfo.pos.row.toFixed(3)})，但路径第2点 row=${nextPt.row}，应水平接入`,
            elementId: b.id,
          });
        }
      }
    }
    // 检查 toPort 端
    if (b.toPort && b.path.length >= 2) {
      const portInfo = portGridPos(b.toPort);
      if (portInfo) {
        const lastIdx = b.path.length - 1;
        const prevPt = b.path[lastIdx - 1];
        const isVerticalPort = portInfo.screenSide === 'top' || portInfo.screenSide === 'bottom';
        if (isVerticalPort && Math.abs(portInfo.pos.col - prevPt.col) > 0.01) {
          issues.push({
            severity: 'warn', rule: 'R16-port-align',
            message: `Belt "${b.id}": toPort 在 ${portInfo.screenSide} 边(col=${portInfo.pos.col.toFixed(3)})，但路径倒数第2点 col=${prevPt.col}，应垂直接入`,
            elementId: b.id,
          });
        }
        if (!isVerticalPort && Math.abs(portInfo.pos.row - prevPt.row) > 0.01) {
          issues.push({
            severity: 'warn', rule: 'R16-port-align',
            message: `Belt "${b.id}": toPort 在 ${portInfo.screenSide} 边(row=${portInfo.pos.row.toFixed(3)})，但路径倒数第2点 row=${prevPt.row}，应水平接入`,
            elementId: b.id,
          });
        }
      }
    }
  }

  // ----------------------------------------------------------
  // R15: 传送带线段间碰撞（同一楼层的重叠线段）
  // ----------------------------------------------------------
  interface Segment { beltId: string; floor: number; horizontal: boolean; fixed: number; min: number; max: number; }
  const segments: Segment[] = [];

  for (const b of scheme.belts) {
    for (let i = 0; i < b.path.length - 1; i++) {
      const p1 = b.path[i];
      const p2 = b.path[i + 1];
      const dCol = Math.abs(p1.col - p2.col);
      const dRow = Math.abs(p1.row - p2.row);
      if (dCol < 0.001) {
        segments.push({ beltId: b.id, floor: b.floor, horizontal: false, fixed: p1.col, min: Math.min(p1.row, p2.row), max: Math.max(p1.row, p2.row) });
      } else if (dRow < 0.001) {
        segments.push({ beltId: b.id, floor: b.floor, horizontal: true, fixed: p1.row, min: Math.min(p1.col, p2.col), max: Math.max(p1.col, p2.col) });
      }
    }
  }

  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 1; j < segments.length; j++) {
      const a = segments[i];
      const b = segments[j];
      if (a.beltId === b.beltId) continue;
      if (a.floor !== b.floor) continue;
      if (a.horizontal !== b.horizontal) continue;
      if (Math.abs(a.fixed - b.fixed) > 0.01) continue;
      if (intervalsOverlap(a.min, a.max, b.min, b.max, 0.02)) {
        issues.push({
          severity: 'warn', rule: 'R15-belt-overlap',
          message: `Belt overlap on floor ${a.floor}: "${a.beltId}" and "${b.beltId}" share the same ${a.horizontal ? 'horizontal' : 'vertical'} path at ${a.horizontal ? 'row' : 'col'}=${a.fixed}`,
        });
      }
    }
  }

  return issues;
}

export function buildSchemeIndex(scheme: Scheme, filePath: string): SchemeIndex {
  return {
    id: scheme.id,
    name: scheme.name,
    category: scheme.category,
    description: scheme.description,
    floorCount: scheme.floors.length,
    filePath,
  };
}
