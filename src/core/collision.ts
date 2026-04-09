// src/core/collision.ts — 统一碰撞检测模块
// 坐标无关：可用于网格坐标(schema 验证)或 SVG 像素坐标(标签避让)
import type { MachineInstance, GridPos } from './types';
import { BUILDING_REGISTRY } from './registry';
import { machineGridSize } from './coordinate';

/* ── 核心类型 ── */

/** 轴对齐包围盒 (AABB) */
export interface Rect {
  x1: number; y1: number;
  x2: number; y2: number;
}

/* ── Rect 构建 ── */

/** 左上角 + 宽高 → Rect */
export function rectFromPos(x: number, y: number, w: number, h: number): Rect {
  return { x1: x, y1: y, x2: x + w, y2: y + h };
}

/** 中心点 + 宽高 → Rect */
export function rectFromCenter(cx: number, cy: number, w: number, h: number): Rect {
  return { x1: cx - w / 2, y1: cy - h / 2, x2: cx + w / 2, y2: cy + h / 2 };
}

/** 线段两端点 → Rect（取 min/max 构建 AABB） */
export function rectFromSegment(p1: GridPos, p2: GridPos): Rect {
  return {
    x1: Math.min(p1.col, p2.col), y1: Math.min(p1.row, p2.row),
    x2: Math.max(p1.col, p2.col), y2: Math.max(p1.row, p2.row),
  };
}

/** 机器实例 → 网格空间 Rect（实际尺寸，R13/R14 通用） */
export function machineRect(m: MachineInstance): Rect | null {
  const meta = BUILDING_REGISTRY[m.type];
  if (!meta) return null;
  const { cols, rows } = machineGridSize(meta.dimensions, m.facing);
  return rectFromPos(m.pos.col, m.pos.row, cols, rows);
}

/* ── 碰撞检测 ── */

/**
 * 两个 AABB 是否重叠。
 * eps > 0 时，允许边缘接触不算重叠（用于 R13/R14 等允许机器贴边放置的场景）。
 */
export function rectsOverlap(a: Rect, b: Rect, eps = 0): boolean {
  return a.x1 < b.x2 - eps && a.x2 > b.x1 + eps
      && a.y1 < b.y2 - eps && a.y2 > b.y1 + eps;
}

/** 两个一维区间 [aMin,aMax] 与 [bMin,bMax] 是否重叠 */
export function intervalsOverlap(
  aMin: number, aMax: number,
  bMin: number, bMax: number,
  eps = 0,
): boolean {
  return aMin < bMax - eps && aMax > bMin + eps;
}
