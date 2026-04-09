// src/core/schema.ts
import type { Scheme, SchemeIndex, GridPos } from './types';
import { BUILDING_REGISTRY } from './registry';
import { machineGridSize } from './coordinate';

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

    // R3: 机器不超出画布边界
    const bounds = floorBounds.get(m.floor);
    if (bounds) {
      if (m.pos.col < 0 || m.pos.row < 0 || m.pos.col >= bounds.cols || m.pos.row >= bounds.rows) {
        issues.push({ severity: 'error', rule: 'R3-bounds', message: `Machine "${m.id}": pos (${m.pos.col}, ${m.pos.row}) out of floor bounds (${bounds.cols}x${bounds.rows})`, elementId: m.id });
      }
    }
  }

  // ----------------------------------------------------------
  // R4: 传送带必须有 fromPort 和 toPort
  // ----------------------------------------------------------
  for (const b of scheme.belts) {
    if (!b.fromPort) {
      issues.push({ severity: 'warn', rule: 'R4-fromPort', message: `Belt "${b.id}": missing fromPort`, elementId: b.id });
    }
    if (!b.toPort) {
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
  // R11: 电力连接验证
  // ----------------------------------------------------------
  const allIds = new Set([...machineIds, ...scheme.power.poles.map(p => p.id)]);
  for (const c of scheme.power.connections) {
    if (!allIds.has(c.from)) {
      issues.push({ severity: 'error', rule: 'R11-ref', message: `Power connection: unknown source "${c.from}"` });
    }
    if (!allIds.has(c.to)) {
      issues.push({ severity: 'error', rule: 'R11-ref', message: `Power connection: unknown target "${c.to}"` });
    }
  }

  // ----------------------------------------------------------
  // R12: ID 唯一性
  // ----------------------------------------------------------
  const allElementIds: string[] = [
    ...scheme.machines.map(m => m.id),
    ...scheme.belts.map(b => b.id),
    ...scheme.lifts.map(l => l.id),
    ...scheme.power.poles.map(p => p.id),
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
  interface AABB { id: string; floor: number; x1: number; y1: number; x2: number; y2: number; }
  const machineBoxes: AABB[] = [];

  for (const m of scheme.machines) {
    const meta = BUILDING_REGISTRY[m.type];
    if (!meta) continue;
    const { cols, rows } = machineGridSize(meta.dimensions, m.facing);
    machineBoxes.push({
      id: m.id, floor: m.floor,
      x1: m.pos.col, y1: m.pos.row,
      x2: m.pos.col + cols, y2: m.pos.row + rows,
    });
  }

  for (let i = 0; i < machineBoxes.length; i++) {
    for (let j = i + 1; j < machineBoxes.length; j++) {
      const a = machineBoxes[i];
      const b = machineBoxes[j];
      if (a.floor !== b.floor) continue;
      // AABB 重叠检测（允许边缘恰好接触，不算重叠）
      const EPS = 0.01;
      if (a.x1 < b.x2 - EPS && a.x2 > b.x1 + EPS && a.y1 < b.y2 - EPS && a.y2 > b.y1 + EPS) {
        issues.push({
          severity: 'error', rule: 'R13-collision',
          message: `Machine collision on floor ${a.floor}: "${a.id}" (${a.x1},${a.y1})-(${a.x2.toFixed(2)},${a.y2.toFixed(2)}) overlaps "${b.id}" (${b.x1},${b.y1})-(${b.x2.toFixed(2)},${b.y2.toFixed(2)})`,
        });
      }
    }
  }

  // ----------------------------------------------------------
  // R14: 传送带线段不穿过机器主体
  // ----------------------------------------------------------
  for (const b of scheme.belts) {
    for (let i = 0; i < b.path.length - 1; i++) {
      const p1 = b.path[i];
      const p2 = b.path[i + 1];
      // 线段的 AABB
      const sx1 = Math.min(p1.col, p2.col);
      const sy1 = Math.min(p1.row, p2.row);
      const sx2 = Math.max(p1.col, p2.col);
      const sy2 = Math.max(p1.row, p2.row);

      for (const box of machineBoxes) {
        if (box.floor !== b.floor) continue;
        // 排除该传送带连接的起终点机器（传送带端点在机器端口上是正常的）
        const fromMachine = b.fromPort?.split(':')[0];
        const toMachine = b.toPort?.split(':')[0];
        if (box.id === fromMachine || box.id === toMachine) continue;

        // 线段 AABB 与机器 AABB 重叠检测
        const EPS = 0.02;
        if (sx1 < box.x2 - EPS && sx2 > box.x1 + EPS && sy1 < box.y2 - EPS && sy2 > box.y1 + EPS) {
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
  // R15: 传送带线段间碰撞（同一楼层同一物料除外的重叠线段）
  // ----------------------------------------------------------
  // 收集所有水平/垂直线段
  interface Segment { beltId: string; floor: number; horizontal: boolean; fixed: number; min: number; max: number; }
  const segments: Segment[] = [];

  for (const b of scheme.belts) {
    for (let i = 0; i < b.path.length - 1; i++) {
      const p1 = b.path[i];
      const p2 = b.path[i + 1];
      const dCol = Math.abs(p1.col - p2.col);
      const dRow = Math.abs(p1.row - p2.row);
      if (dCol < 0.001) {
        // 垂直线段
        segments.push({ beltId: b.id, floor: b.floor, horizontal: false, fixed: p1.col, min: Math.min(p1.row, p2.row), max: Math.max(p1.row, p2.row) });
      } else if (dRow < 0.001) {
        // 水平线段
        segments.push({ beltId: b.id, floor: b.floor, horizontal: true, fixed: p1.row, min: Math.min(p1.col, p2.col), max: Math.max(p1.col, p2.col) });
      }
    }
  }

  // 检测同方向、同轴（fixed值相同）、同楼层的不同传送带线段是否重叠
  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 1; j < segments.length; j++) {
      const a = segments[i];
      const b = segments[j];
      if (a.beltId === b.beltId) continue; // 同一传送带内部不检测
      if (a.floor !== b.floor) continue;
      if (a.horizontal !== b.horizontal) continue;
      if (Math.abs(a.fixed - b.fixed) > 0.01) continue;
      // 同轴线段，检查区间是否重叠
      const EPS = 0.02;
      if (a.min < b.max - EPS && a.max > b.min + EPS) {
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
