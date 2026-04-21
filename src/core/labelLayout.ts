// src/core/labelLayout.ts — 传送带标签碰撞避让算法
// 使用统一碰撞检测模块，同时避让其他标签和传送带线段
import type { BeltSegment, MachineInstance } from './types';
import type { MaterialMap } from './deriveMaterials';
import { gridToSvg, machineGridSize, GRID_PX } from './coordinate';
import { getMaterialColor, getBuildingMeta } from './registry';
import { type Rect, rectFromCenter, rectFromPos, rectsOverlap } from './collision';
import { buildBeltRenderPath } from './beltGeometry';

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

/** 将传送带路径转为 SVG 坐标，使用与渲染一致的端口桥接逻辑 */
function beltSvgPoints(belt: BeltSegment, machines: MachineInstance[]): Point[] {
  return buildBeltRenderPath(belt, machines).map(point => gridToSvg(point.col, point.row));
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

/* ── 常量 ── */

const LABEL_H = 12;
const COLLISION_PAD_X = 4;
const COLLISION_PAD_Y = 2;
/** 传送带线障碍物的半宽（线宽最大3.5 + 视觉间距） */
const BELT_LINE_HALF_W = 5;
/** 机器障碍物外扩 padding（像素） */
const MACHINE_PAD = 2;

/* ── 候选位置生成 ── */

interface Candidate { x: number; y: number }

/**
 * 沿传送带各线段生成候选标签位置。
 * 按距离优先排序：近距离的所有(seg,t)组合排在前面，再考虑远距离。
 * 这样回退时优先选最近的可用位置。
 */
function generateCandidates(pts: Point[], labelW: number, tPreference: 'center' | 'offset' = 'center'): Candidate[] {
  const segs: { i: number; len: number }[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const dx = pts[i + 1].x - pts[i].x;
    const dy = pts[i + 1].y - pts[i].y;
    segs.push({ i, len: Math.sqrt(dx * dx + dy * dy) });
  }
  segs.sort((a, b) => b.len - a.len);

  const tValues = tPreference === 'offset'
    ? [0.35, 0.2, 0.65, 0.8, 0.5]
    : [0.5, 0.35, 0.65, 0.2, 0.8];
  // 边距（标签近边到线段近边的间距），水平/垂直统一
  // 最小 4px 给视觉喘息空间（旧值 1 会导致贴边观感=覆盖）
  const gaps = [4, 8, 14, 22];

  // 距离优先：先遍历 gap 层，再遍历 seg 和 t
  const candidates: Candidate[] = [];
  for (const gap of gaps) {
    for (const seg of segs) {
      const a = pts[seg.i];
      const b = pts[seg.i + 1];
      const horiz = Math.abs(a.y - b.y) < 1;
      // 中心距 = 线段半宽 + 间距 + 标签半尺寸
      const d = horiz
        ? BELT_LINE_HALF_W + gap + LABEL_H / 2     // 上下偏移：用标签半高
        : BELT_LINE_HALF_W + gap + (labelW + COLLISION_PAD_X) / 2; // 左右偏移：用标签半宽
      const maxDist = Math.max(seg.len * 0.8, d + 2);
      if (d > maxDist) continue;

      for (const t of tValues) {
        const mx = a.x + (b.x - a.x) * t;
        const my = a.y + (b.y - a.y) * t;
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

/**
 * 为一组传送带计算不重叠的标签位置。
 * 硬约束（绝不违反）：① 已放置标签 ② 机器主体
 * 软约束（尽量避免）：③ 传送带线段
 */
export interface LabelLayoutOptions {
  /** 候选位置 t 值偏好：'center' 优先中点，'offset' 优先偏移（避免与中心标签重叠） */
  tPreference?: 'center' | 'offset';
}

export function computeBeltLabelPositions(
  belts: BeltSegment[],
  machines: MachineInstance[],
  materialMap: MaterialMap,
  options?: LabelLayoutOptions,
): BeltLabelPlacement[] {
  const tPref = options?.tPreference ?? 'center';
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

  // 传送带线段作为软障碍物（按 belt id 分组，区分自己和别人的线）
  const softByBelt = new Map<string, Rect[]>();
  for (const belt of belts) {
    if (belt.path.length < 2) continue;
    const pts = beltSvgPoints(belt, machines);
    beltPointsMap.set(belt.id, pts);
    const rects: Rect[] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const r = segmentToObstacle(pts[i], pts[i + 1], BELT_LINE_HALF_W);
      softObstacles.push(r);
      rects.push(r);
    }
    softByBelt.set(belt.id, rects);
  }

  // ── 2. 贪心放置标签 ──
  const placements: BeltLabelPlacement[] = [];
  const placedLabelRects: Rect[] = [];

  for (const belt of belts) {
    const pts = beltPointsMap.get(belt.id);
    if (!pts) continue;

    // 极短连接带（< 30px）跳过标签
    if (belt.fromPort && belt.toPort && pts.length >= 2) {
      let totalLen = 0;
      for (let i = 0; i < pts.length - 1; i++) {
        const dx = pts[i + 1].x - pts[i].x;
        const dy = pts[i + 1].y - pts[i].y;
        totalLen += Math.sqrt(dx * dx + dy * dy);
      }
      if (totalLen < 30) continue;
    }

    const materials = materialMap.get(belt.id) ?? [];
    const label = materials.length > 0 ? materials.join('+') : belt.id;
    const color = getMaterialColor(materials[0] ?? '');
    const charW = label.length * 7 + 8;
    const colW = charW + COLLISION_PAD_X;
    const colH = LABEL_H + COLLISION_PAD_Y;

    const candidates = generateCandidates(pts, charW, tPref);
    if (candidates.length === 0) continue;

    const selfLines = softByBelt.get(belt.id) ?? [];
    // 所有传送带线（含自身其它分段）都作为 soft 障碍。
    // 候选生成已保证标签偏离"当前分段"一段距离，但 L/U 形带可能让候选落到自己另一分段上，
    // 因此此处仍需把自身分段一并检查，避免标签压在自家其它分段上。
    // 碰自身分段优先级较低（soft-self < soft-other），以便短带回退时优先选择压自家线。
    const otherLines = softObstacles.filter(so => !selfLines.includes(so));

    function test(c: Candidate): 'perfect' | 'soft-self' | 'soft-other' | 'hard' {
      const rect = rectFromCenter(c.x, c.y, colW, colH);
      if (placedLabelRects.some(pr => rectsOverlap(rect, pr))) return 'hard';
      if (hardObstacles.some(ho => rectsOverlap(rect, ho))) return 'hard';
      if (otherLines.some(ol => rectsOverlap(rect, ol))) return 'soft-other';
      if (selfLines.some(sl => rectsOverlap(rect, sl))) return 'soft-self';
      return 'perfect';
    }

    // 候选按距离排序（近→远）。
    // 规则：距离近的 soft 优于距离远的 perfect（宁可贴着传送带线也不飘远）。
    // 回退优先级：perfect > soft-self（压自家其它分段）> soft-other（压别的带）
    let chosen: Candidate | null = null;
    let firstSoftSelf: Candidate | null = null;
    let firstSoftOther: Candidate | null = null;
    for (const c of candidates) {
      const r = test(c);
      if (r === 'perfect') {
        if (firstSoftSelf) chosen = firstSoftSelf;
        else chosen = c;
        break;
      }
      if (r === 'soft-self' && !firstSoftSelf) firstSoftSelf = c;
      if (r === 'soft-other' && !firstSoftOther) firstSoftOther = c;
    }
    if (!chosen) chosen = firstSoftSelf ?? firstSoftOther;

    // 无可用位置 → 不放置标签
    if (!chosen) continue;

    placements.push({
      id: belt.id,
      x: chosen.x,
      y: chosen.y,
      text: label,
      color,
      width: charW,
      height: LABEL_H,
    });
    placedLabelRects.push(rectFromCenter(chosen.x, chosen.y, colW, colH));
  }

  return placements;
}
