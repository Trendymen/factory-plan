// src/core/schema.ts
import type { Scheme, SchemeIndex, GridPos, Facing, MachineInstance, PlaceableType } from './types';
import { BUILDING_REGISTRY } from './registry';
import { getRecipe } from './recipes';
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
// 网格对齐步进（0.0625 = 0.5m 精度）
// 放宽至 0.0625 以兼容端口同轴对齐场景（如 storage 2.5m 端口偏移 = 0.3125 格）
// ============================================================
const GRID_STEP = 0.0625;

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
// R18 辅助：lift pair 两端在各楼层 transform 之后是否落到同一屏幕坐标
// 当前所有 floor.transform 为 identity，退化为 pos 相等比较。
// 未来引入 Floor.transform 后，只需修改本函数实现，不改签名和调用点。
// ============================================================
function liftPairAligned(
  bot: MachineInstance,
  top: MachineInstance,
  _scheme: Scheme,
): boolean {
  return Math.abs(bot.pos.col - top.pos.col) < 0.001
      && Math.abs(bot.pos.row - top.pos.row) < 0.001;
}

// 合法的 pair 类型组合：bottom machine 类型 → 对应合法的 top machine 类型
const LIFT_PAIR_COMBOS = new Map<PlaceableType, PlaceableType>([
  ['conveyor-lift-in-bottom',  'conveyor-lift-out-top'],   // 向上运输
  ['conveyor-lift-out-bottom', 'conveyor-lift-in-top'],    // 向下运输
]);

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
  const machineById = new Map(scheme.machines.map(m => [m.id, m]));

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

    // ----------------------------------------------------------
    // R21: recipe 字段必须引用有效配方 id，且配方所需机器类型与实际类型一致
    // 生产类机器（smelter/constructor/assembler/manufacturer/foundry）必须声明 recipe
    // （R18-R20 已分别被 LiftPair / 垂直交叉 / 紧凑 U 型占用）
    // ----------------------------------------------------------
    const productionTypes: PlaceableType[] = ['smelter', 'foundry', 'constructor', 'assembler', 'manufacturer'];
    if (productionTypes.includes(m.type)) {
      if (!m.recipe) {
        issues.push({ severity: 'warn', rule: 'R21-missing-recipe', message: `Machine "${m.id}": production machine should declare recipe id`, elementId: m.id });
      } else {
        const recipe = getRecipe(m.recipe);
        if (!recipe) {
          issues.push({ severity: 'error', rule: 'R21-unknown-recipe', message: `Machine "${m.id}": recipe id "${m.recipe}" not found in RECIPE_REGISTRY`, elementId: m.id });
        } else if (recipe.machine !== m.type) {
          issues.push({ severity: 'error', rule: 'R21-type-mismatch', message: `Machine "${m.id}": recipe "${m.recipe}" requires ${recipe.machine}, but machine type is ${m.type}`, elementId: m.id });
        }
      }
    } else if (m.recipe) {
      // 非生产机器（splitter/merger/storage/lift）不应该有 recipe
      issues.push({ severity: 'warn', rule: 'R21-unexpected-recipe', message: `Machine "${m.id}" (${m.type}) should not have recipe field`, elementId: m.id });
    }
  }

  // ----------------------------------------------------------
  // R4: 传送带必须有 fromPort 和 toPort
  // （楼层边界外部输入/输出除外）
  // ----------------------------------------------------------
  function isAtFloorEdge(b: { floor: number; path: GridPos[] }, end: 'start' | 'end'): boolean {
    const bounds = floorBounds.get(b.floor);
    if (!bounds) return false;
    const p = end === 'start' ? b.path[0] : b.path[b.path.length - 1];
    return p.col <= 0 || p.row <= 0 || p.col >= bounds.cols || p.row >= bounds.rows;
  }
  for (const b of scheme.belts) {
    if (!b.fromPort && !isAtFloorEdge(b, 'start')) {
      issues.push({ severity: 'warn', rule: 'R4-fromPort', message: `Belt "${b.id}": missing fromPort`, elementId: b.id });
    }
    if (!b.toPort && !isAtFloorEdge(b, 'end')) {
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
  // R12: ID 唯一性
  // ----------------------------------------------------------
  const allElementIds: string[] = [
    ...scheme.machines.map(m => m.id),
    ...scheme.belts.map(b => b.id),
    ...scheme.liftPairs.map(p => p.id),
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
  // R14a: 非端口段不得穿越连接机器 (error)
  // R14b: 传送带线段不穿过无关机器 (warn)
  // ----------------------------------------------------------
  for (const b of scheme.belts) {
    const fromMachine = b.fromPort?.split(':')[0];
    const toMachine = b.toPort?.split(':')[0];
    const lastSegIdx = b.path.length - 2;

    for (let i = 0; i < b.path.length - 1; i++) {
      const segRect = rectFromSegment(b.path[i], b.path[i + 1]);

      for (const box of machineBoxes) {
        if (box.floor !== b.floor) continue;

        // 端口段允许与连接机器重叠：首段→fromMachine，末段→toMachine
        const isFrom = box.id === fromMachine;
        const isTo = box.id === toMachine;
        if (isFrom && i === 0) continue;
        if (isTo && i === lastSegIdx) continue;

        if (rectsOverlap(segRect, box.rect, 0.02)) {
          if (isFrom || isTo) {
            // R14a: 非端口段穿越了连接机器
            issues.push({
              severity: 'error', rule: 'R14a-connected-cross',
              message: `Belt "${b.id}" segment ${i}→${i + 1} crosses through connected machine "${box.id}" (only terminal segment may enter machine body)`,
              elementId: b.id,
            });
          } else {
            // R14b: 穿越无关机器
            issues.push({
              severity: 'warn', rule: 'R14b-belt-cross',
              message: `Belt "${b.id}" segment ${i}→${i + 1} crosses through machine "${box.id}" on floor ${b.floor}`,
              elementId: b.id,
            });
          }
        }
      }
    }
  }

  // ----------------------------------------------------------
  // R16: 传送带端口-路径正交对齐（渲染时不产生斜线）
  // 检查传送带首尾路径点与端口位置是否在同一轴上，
  // 以及接近端口的线段方向是否垂直于端口所在边。
  // ----------------------------------------------------------
  function portGridPos(portRef: string): { pos: GridPos; screenSide: string } | null {
    const [mid, pid] = portRef.split(':');
    const machine = machineById.get(mid);
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
      // R15: 同方向共线重叠
      if (a.horizontal === b.horizontal) {
        if (Math.abs(a.fixed - b.fixed) > 0.01) continue;
        if (intervalsOverlap(a.min, a.max, b.min, b.max, 0.02)) {
          issues.push({
            severity: 'warn', rule: 'R15-belt-overlap',
            message: `Belt overlap on floor ${a.floor}: "${a.beltId}" and "${b.beltId}" share the same ${a.horizontal ? 'horizontal' : 'vertical'} path at ${a.horizontal ? 'row' : 'col'}=${a.fixed}`,
          });
        }
        continue;
      }
      // R19: 垂直交叉（一条水平一条垂直，在内部点相交）
      const h = a.horizontal ? a : b; // horizontal segment: fixed=row, min/max=col
      const v = a.horizontal ? b : a; // vertical segment: fixed=col, min/max=row
      const x = v.fixed;
      const y = h.fixed;
      const EPS = 0.02;
      if (x < h.min - EPS || x > h.max + EPS) continue;
      if (y < v.min - EPS || y > v.max + EPS) continue;
      // 只当交点严格位于至少一个段的内部时才算交叉；双端点相触属于共用连接点。
      const interiorH = x > h.min + EPS && x < h.max - EPS;
      const interiorV = y > v.min + EPS && y < v.max - EPS;
      if (!interiorH && !interiorV) continue;
      issues.push({
        severity: 'warn', rule: 'R19-belt-cross',
        message: `Belt 垂直交叉 on floor ${a.floor}: "${h.beltId}"(row=${h.fixed}) × "${v.beltId}"(col=${v.fixed}) 在 (${x}, ${y})`,
      });
    }
  }

  // ----------------------------------------------------------
  // R17: 传送带不得回头绕路
  // 路径实际总长 ≤ 起终点 bbox 半周长（曼哈顿距离）× 1.4
  // 违反表现：belt 绕圈、U 形回头、S 形多次折线后回到起始区域。
  // 根本原因常为机器端口未同轴对齐，被迫在狭小空间里强行折线。
  // 修复思路：调整上下游机器布局让相关端口落在同一 col 或 row 主轴上。
  // ----------------------------------------------------------
  const BACKTRACK_RATIO = 1.4;
  const MIN_SEMI_PERIMETER = 0.5; // 过短的 belt 跳过，避免数值抖动

  for (const b of scheme.belts) {
    if (b.path.length < 2) continue;

    let minCol = Infinity, maxCol = -Infinity, minRow = Infinity, maxRow = -Infinity;
    for (const pt of b.path) {
      if (pt.col < minCol) minCol = pt.col;
      if (pt.col > maxCol) maxCol = pt.col;
      if (pt.row < minRow) minRow = pt.row;
      if (pt.row > maxRow) maxRow = pt.row;
    }

    let totalLength = 0;
    for (let i = 0; i < b.path.length - 1; i++) {
      totalLength += Math.abs(b.path[i].col - b.path[i + 1].col)
                   + Math.abs(b.path[i].row - b.path[i + 1].row);
    }

    const semiPerimeter = (maxCol - minCol) + (maxRow - minRow);
    if (semiPerimeter < MIN_SEMI_PERIMETER) continue;

    if (totalLength > semiPerimeter * BACKTRACK_RATIO + 0.001) {
      issues.push({
        severity: 'warn',
        rule: 'R17-belt-backtrack',
        message: `Belt "${b.id}": 路径总长 ${totalLength.toFixed(2)} 超过 bbox 半周长 ${semiPerimeter.toFixed(2)} × ${BACKTRACK_RATIO}，存在回头绕路，应调整上下游机器让端口同轴`,
        elementId: b.id,
      });
    }
  }

  // ----------------------------------------------------------
  // R20: 紧凑空间内的多段 U 型 belt 不可能实际布线
  // 当机器紧挨着（端口间距极短）但端口未对齐时，现实中无法在狭缝里完成
  // 垂直进出 + 水平转折的折线布置；这类情况必须通过调整机器坐标让端口同轴
  // 使 belt 变为单段直线（2 点路径）或合法的 L 型（3 点路径）。
  // ----------------------------------------------------------
  const TIGHT_BBOX_SPAN = 0.5;
  for (const b of scheme.belts) {
    if (b.path.length < 4) continue; // 2 点直线 / 3 点 L 不检查
    let minCol = Infinity, maxCol = -Infinity, minRow = Infinity, maxRow = -Infinity;
    for (const pt of b.path) {
      if (pt.col < minCol) minCol = pt.col;
      if (pt.col > maxCol) maxCol = pt.col;
      if (pt.row < minRow) minRow = pt.row;
      if (pt.row > maxRow) maxRow = pt.row;
    }
    const colSpan = maxCol - minCol;
    const rowSpan = maxRow - minRow;
    if (colSpan < TIGHT_BBOX_SPAN && rowSpan < TIGHT_BBOX_SPAN) {
      issues.push({
        severity: 'error', rule: 'R20-tight-u-turn',
        message: `Belt "${b.id}": 紧凑空间 (col span=${colSpan.toFixed(3)}, row span=${rowSpan.toFixed(3)}) 内的 ${b.path.length}-点折线在游戏里无法实际布线，需对齐上下游机器端口让 belt 变为单段直线`,
        elementId: b.id,
      });
    }
  }

  // ----------------------------------------------------------
  // R18: LiftPair 一致性
  // ----------------------------------------------------------
  for (const pair of scheme.liftPairs) {
    const bot = machineById.get(pair.bottomMachine);
    const top = machineById.get(pair.topMachine);

    if (!bot) {
      issues.push({ severity: 'error', rule: 'R18-ref',
        message: `LiftPair "${pair.id}": bottomMachine "${pair.bottomMachine}" 不存在`,
        elementId: pair.id });
    }
    if (!top) {
      issues.push({ severity: 'error', rule: 'R18-ref',
        message: `LiftPair "${pair.id}": topMachine "${pair.topMachine}" 不存在`,
        elementId: pair.id });
    }
    if (!bot || !top) continue;

    // 类型合法性
    const expectedTopType = LIFT_PAIR_COMBOS.get(bot.type);
    if (!expectedTopType) {
      issues.push({ severity: 'error', rule: 'R18-type',
        message: `LiftPair "${pair.id}": bottomMachine 类型 "${bot.type}" 不是合法的 lift 底部类型`,
        elementId: pair.id });
    } else if (top.type !== expectedTopType) {
      issues.push({ severity: 'error', rule: 'R18-type',
        message: `LiftPair "${pair.id}": bottom 类型 "${bot.type}" 应配对 top 类型 "${expectedTopType}"，实际是 "${top.type}"`,
        elementId: pair.id });
    }

    // 楼层关系
    if (top.floor !== bot.floor + 1) {
      issues.push({ severity: 'error', rule: 'R18-floor',
        message: `LiftPair "${pair.id}": topMachine.floor (${top.floor}) 必须为 bottomMachine.floor (${bot.floor}) + 1`,
        elementId: pair.id });
    }

    // 屏幕坐标对齐
    if (!liftPairAligned(bot, top, scheme)) {
      issues.push({ severity: 'error', rule: 'R18-align',
        message: `LiftPair "${pair.id}": 两端机器 pos 不相等 (bot=${bot.pos.col},${bot.pos.row} vs top=${top.pos.col},${top.pos.row})`,
        elementId: pair.id });
    }

    // facing 一致（warn）
    if (bot.facing !== top.facing) {
      issues.push({ severity: 'warn', rule: 'R18-facing',
        message: `LiftPair "${pair.id}": 两端 facing 不一致 (bot=${bot.facing} vs top=${top.facing})`,
        elementId: pair.id });
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
