// src/core/labelLayout.ts — 传送带标签碰撞避让算法
// 使用统一碰撞检测模块，同时避让其他标签和传送带线段
import type { BeltSegment, MachineInstance } from './types';
import { gridToSvg, resolvePortPosition, machineGridSize, GRID_PX } from './coordinate';
import { getMaterialColor, getBuildingMeta } from './registry';
import { type Rect, rectFromCenter, rectFromPos, rectsOverlap } from './collision';

/* ── 类型 ── */

interface Point { x: number; y: number }

export interface BeltLabelPlacement {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  width: number;
  height: number;
}

/* ── 工具函数 ── */

/** 解析端口引用 "machineId:portId" → SVG 坐标 */
function resolvePortRef(ref: string | undefined, machines: MachineInstance[]): Point | null {
  if (!ref) return null;
  const [machineId, portId] = ref.split(':');
  const machine = machines.find(m => m.id === machineId);
  if (!machine) return null;
  try {
    const meta = getBuildingMeta(machine.type);
    const portDef = meta.ports.find(p => p.id === portId);
    if (!portDef) return null;
    return resolvePortPosition(machine.pos, machine.facing, meta.dimensions, portDef);
  } catch { return null; }
}

/** 将传送带路径转为 SVG 坐标，端点吸附到端口 */
function beltSvgPoints(belt: BeltSegment, machines: MachineInstance[]): Point[] {
  const pts = belt.path.map(p => gridToSvg(p.col, p.row));
  const from = resolvePortRef(belt.fromPort, machines);
  if (from) pts[0] = from;
  const to = resolvePortRef(belt.toPort, machines);
  if (to) pts[pts.length - 1] = to;
  return pts;
}

/** 将线段膨胀为带厚度的 Rect（用于传送带线障碍物） */
function segmentToObstacle(a: Point, b: Point, halfW: number): Rect {
  const horiz = Math.abs(a.y - b.y) < 1;
  if (horiz) {
    const minX = Math.min(a.x, b.x);
    const maxX = Math.max(a.x, b.x);
    return { x1: minX, y1: a.y - halfW, x2: maxX, y2: a.y + halfW };
  }
  const minY = Math.min(a.y, b.y);
  const maxY = Math.max(a.y, b.y);
  return { x1: a.x - halfW, y1: minY, x2: a.x + halfW, y2: maxY };
}

/* ── 候选位置生成 ── */

interface Candidate { x: number; y: number }

/** 沿传送带各线段生成候选标签位置（按优先级排序） */
function generateCandidates(pts: Point[]): Candidate[] {
  const segs: { i: number; len: number }[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const dx = pts[i + 1].x - pts[i].x;
    const dy = pts[i + 1].y - pts[i].y;
    segs.push({ i, len: Math.sqrt(dx * dx + dy * dy) });
  }
  segs.sort((a, b) => b.len - a.len);

  const tValues = [0.5, 0.35, 0.65, 0.2, 0.8];
  const distances = [14, 22, 30, 40, 52]; // 足够远离机器主体
  const candidates: Candidate[] = [];

  for (const seg of segs) {
    const a = pts[seg.i];
    const b = pts[seg.i + 1];
    const horiz = Math.abs(a.y - b.y) < 1;

    for (const t of tValues) {
      const mx = a.x + (b.x - a.x) * t;
      const my = a.y + (b.y - a.y) * t;

      for (const d of distances) {
        if (horiz) {
          candidates.push({ x: mx, y: my - d }); // 上方
          candidates.push({ x: mx, y: my + d }); // 下方
        } else {
          candidates.push({ x: mx + d, y: my }); // 右侧
          candidates.push({ x: mx - d, y: my }); // 左侧
        }
      }
    }
  }
  return candidates;
}

/* ── 主算法：贪心放置 ── */

const LABEL_H = 12;
const COLLISION_PAD_X = 4;
const COLLISION_PAD_Y = 2;
/** 传送带线障碍物的半宽（线宽最大3.5 + 视觉间距） */
const BELT_LINE_HALF_W = 5;

/** 机器障碍物外扩 padding（像素） */
const MACHINE_PAD = 6;

/**
 * 为一组传送带计算不重叠的标签位置。
 * 硬约束（绝不违反）：① 已放置标签 ② 机器主体
 * 软约束（尽量避免）：③ 传送带线段
 */
export function computeBeltLabelPositions(
  belts: BeltSegment[],
  machines: MachineInstance[],
): BeltLabelPlacement[] {
  // ── 1. 预计算障碍物 ──
  const hardObstacles: Rect[] = []; // 机器主体：绝不重叠
  const softObstacles: Rect[] = []; // 传送带线：尽量避让
  const beltPointsMap = new Map<string, Point[]>();

  // 仅当前楼层机器作为硬障碍物
  const beltFloor = belts.length > 0 ? belts[0].floor : 0;
  for (const m of machines) {
    if (m.floor !== beltFloor) continue;
    try {
      const meta = getBuildingMeta(m.type);
      const { cols, rows } = machineGridSize(meta.dimensions, m.facing);
      const svgOrigin = gridToSvg(m.pos.col, m.pos.row);
      hardObstacles.push(rectFromPos(
        svgOrigin.x - MACHINE_PAD,
        svgOrigin.y - MACHINE_PAD,
        cols * GRID_PX + MACHINE_PAD * 2,
        rows * GRID_PX + MACHINE_PAD * 2,
      ));
    } catch { /* unknown type, skip */ }
  }

  // 传送带线段作为软障碍物
  for (const belt of belts) {
    if (belt.path.length < 2) continue;
    const pts = beltSvgPoints(belt, machines);
    beltPointsMap.set(belt.id, pts);
    for (let i = 0; i < pts.length - 1; i++) {
      softObstacles.push(segmentToObstacle(pts[i], pts[i + 1], BELT_LINE_HALF_W));
    }
  }

  // ── 2. 贪心放置标签 ──
  const placements: BeltLabelPlacement[] = [];
  const placedLabelRects: Rect[] = [];

  for (const belt of belts) {
    const pts = beltPointsMap.get(belt.id);
    if (!pts) continue;

    // 短连接带（两端都绑定机器且路径 < 60px）跳过标签
    if (belt.fromPort && belt.toPort && pts.length >= 2) {
      let totalLen = 0;
      for (let i = 0; i < pts.length - 1; i++) {
        const dx = pts[i + 1].x - pts[i].x;
        const dy = pts[i + 1].y - pts[i].y;
        totalLen += Math.sqrt(dx * dx + dy * dy);
      }
      if (totalLen < 60) continue;
    }

    const color = getMaterialColor(belt.material);
    const charW = belt.material.length * 7 + 8;
    const colW = charW + COLLISION_PAD_X;
    const colH = LABEL_H + COLLISION_PAD_Y;

    const candidates = generateCandidates(pts);
    if (candidates.length === 0) continue;

    function hitsHard(c: Candidate): boolean {
      const rect = rectFromCenter(c.x, c.y, colW, colH);
      if (placedLabelRects.some(pr => rectsOverlap(rect, pr))) return true;
      if (hardObstacles.some(ho => rectsOverlap(rect, ho))) return true;
      return false;
    }
    function hitsSoft(c: Candidate): boolean {
      const rect = rectFromCenter(c.x, c.y, colW, colH);
      return softObstacles.some(so => rectsOverlap(rect, so));
    }

    // Phase 1：找完全无重叠的位置
    let chosen: Candidate | null = null;
    for (const c of candidates) {
      if (!hitsHard(c) && !hitsSoft(c)) { chosen = c; break; }
    }

    // Phase 2：允许软重叠（传送带线），但不允许硬重叠（机器/标签）
    if (!chosen) {
      for (const c of candidates) {
        if (!hitsHard(c)) { chosen = c; break; }
      }
    }

    // Phase 3：仍无结果 → 不放置标签（不在机器上强行显示）
    if (!chosen) continue;

    placements.push({
      id: belt.id,
      x: chosen.x,
      y: chosen.y,
      text: belt.material,
      color,
      width: charW,
      height: LABEL_H,
    });
    placedLabelRects.push(rectFromCenter(chosen.x, chosen.y, colW, colH));
  }

  return placements;
}
