// src/diagram/diagramTypes.ts
// 示意图数据类型 —— 独立于 core/types.ts 的严格 MachineInstance。
// 坐标用扁平 col/row（子 cell，1 cell = 8m），允许小数、重叠，不做任何可建性校验。
import type { Facing, BeltMark } from '../core/types';

export type { Facing, BeltMark };

/** 一台机器（示意）。type 故意宽松为 string：未知 type 渲染为灰占位框。 */
export interface DiagramMachine {
  id: string;
  type: string;
  col: number;
  row: number;
  facing?: Facing;        // 默认 'south'
  label?: string;
  recipe?: string;
}

/** 一条传送带（示意）。path 原样画 polyline，from/to 可选用于把首尾贴到端口。 */
export interface DiagramBelt {
  id: string;
  mark?: BeltMark;        // 仅样式，不做容量校验
  from?: string;          // "machineId:portId"
  to?: string;            // "machineId:portId"
  path: [number, number][]; // [col,row][]，至少 1 点（软校验）
  label?: string;
  material?: string;      // 可选，影响 belt 颜色（缺省走默认色）
}

/** 区域底色块（示意）。color 是字面颜色字符串（如 "#3a8"），不是 CSS var 名。 */
export interface DiagramZone {
  label?: string;
  col: number;
  row: number;
  w: number;
  h: number;
  color?: string;         // 字面色，缺省走默认半透明
}

/** 文字注记。 */
export interface DiagramNote {
  col: number;
  row: number;
  text: string;
}

/** 一张示意图 = 一层（首批单层结构；叠层 BP14 用两个独立块）。 */
export interface DiagramScheme {
  id: string;
  title?: string;
  grid?: { cols: number; rows: number }; // 可选；缺省时由 computeBounds 推断
  machines: DiagramMachine[];
  belts?: DiagramBelt[];
  zones?: DiagramZone[];
  notes?: DiagramNote[];
}

/** parseDiagramBlock 的返回：成功 data，或失败 error（永不抛）。 */
export type ParseResult =
  | { ok: true; data: DiagramScheme }
  | { ok: false; error: string; raw: string };
