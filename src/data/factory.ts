// ============================
// TYPES
// ============================
export interface MaterialIO {
  name: string;
  rate: number | string;
}

export interface MachineBox {
  w: number;
  h: number;
}

export interface MachineBody {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type MachinePortName = 'power' | 'input' | 'output' | 'left' | 'right' | 'top' | 'bottom';

export type MachinePorts = Partial<Record<MachinePortName, [number, number]>>;

export interface Machine {
  id: string;
  name: string;
  type: 'smelter' | 'plate' | 'rod' | 'screw' | 'assembly' | 'storage';
  floor: number;
  col: number;
  row: number;
  footprint: MachineBox;
  body: MachineBody;
  ports: MachinePorts;
  color: string;
  recipe: string;
  inputs: MaterialIO[];
  outputs: MaterialIO[];
  power: number;
  eff: number;
  pole: string;
  mk2Note?: string;
}

export interface Pole {
  id: string;
  name: string;
  floor: number;
  col: number;
  row: number;
  conns: string[];
  used: number;
}

export interface Belt {
  floor: number;
  material: string;
  color: string;
  rate: string;
  points: number[][];
  label: string;
  labelDx?: number;
  labelDy?: number;
  mk2?: boolean;
  mk2id?: string;
  mk2Dx?: number;
  mk2Dy?: number;
}

export interface Lift {
  id: string;
  name: string;
  floor: number;
  col: number;
  row: number;
  targetFloor?: number;
  material: string;
}

export interface Splitter {
  floor: number;
  type: 'split' | 'merge';
  x: number;
  y: number;
  label: string;
}

export interface LayoutZone {
  id: string;
  floor: number;
  col: number;
  row: number;
  w: number;
  h: number;
  kind: 'trunk' | 'maintenance' | 'reserve' | 'front';
  label: string;
}

// ============================
// COORDINATE SYSTEM
// ============================
export const C = { w: 95, h: 78 }; // cell size in SVG units
export const PAD = { x: 45, y: 35 };

export function cx(col: number) { return PAD.x + col * C.w; }
export function cy(row: number) { return PAD.y + row * C.h; }
export function cmx(col: number) { return cx(col) + C.w / 2; }
export function cmy(row: number) { return cy(row) + C.h / 2; }

export function floorRows(floor: number) {
  return floor === 2 ? 8 : 7;
}

export function floorViewHeight(floor: number) {
  return C.h * floorRows(floor) + PAD.y * 2 + 20;
}

export function sectionViewHeight() {
  return floorViewHeight(2) + floorViewHeight(1) + 30;
}

export const VIEW_W = C.w * 8 + PAD.x * 2;
export const VIEW_H = floorViewHeight(2);

export function rectToSvg(col: number, row: number, w: number, h: number) {
  return { x: cx(col), y: cy(row), w: w * C.w, h: h * C.h };
}

export function machineFootprintRect(m: Machine) {
  return rectToSvg(m.col, m.row, m.footprint.w, m.footprint.h);
}

export function machineBodyRect(m: Machine) {
  return rectToSvg(m.col + m.body.x, m.row + m.body.y, m.body.w, m.body.h);
}

export function machinePortPoint(m: Machine, port: MachinePortName) {
  const p = m.ports[port] ?? m.ports.power ?? [m.body.x + m.body.w / 2, m.body.y + m.body.h / 2];
  return [cx(m.col + p[0]), cy(m.row + p[1])] as number[];
}

function baseMachine(
  id: string,
  name: string,
  type: Machine['type'],
  floor: number,
  col: number,
  row: number,
  color: string,
  recipe: string,
  inputs: MaterialIO[],
  outputs: MaterialIO[],
  power: number,
  eff: number,
  pole: string,
  mk2Note?: string,
): Machine {
  const isAssembly = type === 'assembly';
  const isStorage = type === 'storage';

  const footprint = isAssembly
    ? { w: 1.65, h: 1.95 }
    : isStorage
      ? { w: 0.95, h: 0.72 }
      : { w: 1, h: 1.55 };

  const body = isAssembly
    ? { x: 0.14, y: 0.18, w: 1.25, h: 1.46 }
    : isStorage
      ? { x: 0.1, y: 0.1, w: 0.75, h: 0.48 }
      : { x: 0.14, y: 0.1, w: 0.72, h: 1.28 };

  const ports: MachinePorts = isAssembly
    ? {
        power: [0.82, 0.96],
        input: [0.82, 0],
        output: [0.82, 1.95],
        left: [0, 1.02],
        right: [1.65, 1.02],
        top: [0.82, 0.2],
        bottom: [0.82, 1.75],
      }
    : isStorage
      ? {
          power: [0.47, 0.36],
          input: [0, 0.36],
          output: [0.95, 0.36],
          left: [0, 0.36],
          right: [0.95, 0.36],
          top: [0.47, 0],
          bottom: [0.47, 0.72],
        }
      : {
          power: [0.5, 0.78],
          input: [0.5, 0],
          output: [0.5, 1.55],
          top: [0.5, 0.12],
          bottom: [0.5, 1.43],
        };

  return {
    id,
    name,
    type,
    floor,
    col,
    row,
    footprint,
    body,
    ports,
    color,
    recipe,
    inputs,
    outputs,
    power,
    eff,
    pole,
    mk2Note,
  };
}

// ============================
// DATA
// ============================
export const MACHINES: Record<string, Machine> = {
  // ====== FLOOR 1 ======
  smelter1: baseMachine('smelter1', '冶炼炉 #1', 'smelter', 1, 1, 1, 'var(--smelter)', '铁矿→铁锭', [{ name: '铁矿', rate: 30 }], [{ name: '铁锭', rate: 30 }], 4, 100, 'B'),
  smelter2: baseMachine('smelter2', '冶炼炉 #2', 'smelter', 1, 2, 1, 'var(--smelter)', '铁矿→铁锭', [{ name: '铁矿', rate: 30 }], [{ name: '铁锭', rate: 30 }], 4, 100, 'B'),
  smelter3: baseMachine('smelter3', '冶炼炉 #3', 'smelter', 1, 4, 1, 'var(--smelter)', '铁矿→铁锭', [{ name: '铁矿', rate: 30 }], [{ name: '铁锭', rate: 30 }], 4, 100, 'C'),
  smelter4: baseMachine('smelter4', '冶炼炉 #4', 'smelter', 1, 5, 1, 'var(--smelter)', '铁矿→铁锭', [{ name: '铁矿', rate: 30 }], [{ name: '铁锭', rate: 30 }], 4, 100, 'C'),
  plate1: baseMachine('plate1', '铁板制造机 #1', 'plate', 1, 1, 4, 'var(--plate)', '铁锭×3→铁板×2', [{ name: '铁锭', rate: 30 }], [{ name: '铁板', rate: 20 }], 4, 100, 'D'),
  plate2: baseMachine('plate2', '铁板制造机 #2', 'plate', 1, 2, 4, 'var(--plate)', '铁锭×3→铁板×2', [{ name: '铁锭', rate: 30 }], [{ name: '铁板', rate: 20 }], 4, 100, 'D'),
  rod1: baseMachine('rod1', '铁棒制造机 #1', 'rod', 1, 4, 4, 'var(--rod)', '铁锭×1→铁棒×1', [{ name: '铁锭', rate: 15 }], [{ name: '铁棒', rate: 15 }], 4, 100, 'E'),
  rod2: baseMachine('rod2', '铁棒制造机 #2', 'rod', 1, 5, 4, 'var(--rod)', '铁锭×1→铁棒×1', [{ name: '铁锭', rate: 15 }], [{ name: '铁棒', rate: 15 }], 4, 100, 'E'),
  rod3: baseMachine('rod3', '铁棒制造机 #3', 'rod', 1, 6, 4, 'var(--rod)', '铁锭×1→铁棒×1', [{ name: '铁锭', rate: 15 }], [{ name: '铁棒', rate: 15 }], 4, 100, 'F'),
  rod4: baseMachine('rod4', '铁棒制造机 #4', 'rod', 1, 7, 4, 'var(--rod)', '铁锭×1→铁棒×1', [{ name: '铁锭', rate: 15 }], [{ name: '铁棒', rate: 15 }], 4, 100, 'F'),

  // ====== FLOOR 2 ======
  screw1: baseMachine('screw1', '螺丝制造机 #1', 'screw', 2, 1, 1, 'var(--screw)', '铁棒×1→螺丝×4', [{ name: '铁棒', rate: 10 }], [{ name: '螺丝', rate: 40 }], 4, 75, 'G', 'Mk.2升级后效率恢复100%'),
  screw2: baseMachine('screw2', '螺丝制造机 #2', 'screw', 2, 2, 1, 'var(--screw)', '铁棒×1→螺丝×4', [{ name: '铁棒', rate: 10 }], [{ name: '螺丝', rate: 40 }], 4, 75, 'G', 'Mk.2升级后效率恢复100%'),
  screw3: baseMachine('screw3', '螺丝制造机 #3', 'screw', 2, 4, 1, 'var(--screw)', '铁棒×1→螺丝×4', [{ name: '铁棒', rate: 10 }], [{ name: '螺丝', rate: 40 }], 4, 75, 'H', 'Mk.2升级后效率恢复100%'),
  screw4: baseMachine('screw4', '螺丝制造机 #4', 'screw', 2, 5, 1, 'var(--screw)', '铁棒×1→螺丝×4', [{ name: '铁棒', rate: 10 }], [{ name: '螺丝', rate: 40 }], 4, 75, 'H', 'Mk.2升级后效率恢复100%'),
  rip: baseMachine('rip', '强化铁板 组装机', 'assembly', 2, 1, 4.05, 'var(--assembly)', '铁板×6+螺丝×12→强化铁板×1', [{ name: '铁板', rate: 30 }, { name: '螺丝', rate: 60 }], [{ name: '强化铁板', rate: 5 }], 15, 100, 'I'),
  rotor: baseMachine('rotor', '转子 组装机', 'assembly', 2, 4.15, 4.05, 'var(--assembly)', '铁棒×5+螺丝×25→转子×1', [{ name: '铁棒', rate: 20 }, { name: '螺丝', rate: 100 }], [{ name: '转子', rate: 4 }], 15, 60, 'I', '当前Mk.1带限流60螺丝/min → 60%效率(2.4/min)\n升级③号带段为Mk.2后→100%(4/min)'),
  store_plate: baseMachine('store_plate', '铁板 储存箱', 'storage', 2, 1.0, 7.12, 'var(--storage)', '成品前场缓冲', [{ name: '铁板余量', rate: 10 }], [], 0, 100, '-'),
  store_rip: baseMachine('store_rip', '强化铁板 储存箱', 'storage', 2, 2.15, 7.12, 'var(--storage)', '成品前场缓冲', [{ name: '强化铁板', rate: 5 }], [], 0, 100, '-'),
  store_rotor: baseMachine('store_rotor', '转子 储存箱', 'storage', 2, 4.2, 7.12, 'var(--storage)', '成品前场缓冲', [{ name: '转子', rate: '2.4→4' }], [], 0, 100, '-'),
  store_screw: baseMachine('store_screw', '螺丝溢出 储存箱', 'storage', 2, 5.35, 7.12, 'var(--storage)', '前场备用接口', [{ name: '螺丝溢出', rate: '~0' }], [], 0, 100, '-', '升级Mk.2后无溢出，可拆除或改作前场接口'),
};

export const POLES: Record<string, Pole> = {
  A: { id: 'A', name: '入口杆', floor: 1, col: 0, row: 6.2, conns: ['外部', 'B', 'C'], used: 3 },
  B: { id: 'B', name: '冶炼杆-左', floor: 1, col: 1.5, row: 0.3, conns: ['A', '冶炼#1', '冶炼#2', 'D'], used: 4 },
  C: { id: 'C', name: '冶炼杆-右', floor: 1, col: 4.5, row: 0.3, conns: ['A', '冶炼#3', '冶炼#4', 'E'], used: 4 },
  D: { id: 'D', name: '铁板杆', floor: 1, col: 1.5, row: 3.5, conns: ['B', '铁板#1', '铁板#2'], used: 3 },
  E: { id: 'E', name: '铁棒杆-左', floor: 1, col: 5, row: 3.5, conns: ['C', '铁棒#1', '铁棒#2', 'F'], used: 4 },
  F: { id: 'F', name: '中继杆', floor: 1, col: 7, row: 3.5, conns: ['E', '铁棒#3', '铁棒#4', '↑G(2F)'], used: 4 },
  G: { id: 'G', name: '2F主杆', floor: 2, col: 3, row: 0.3, conns: ['F(1F)', '螺丝#1', '螺丝#2', 'H'], used: 4 },
  H: { id: 'H', name: '组装杆', floor: 2, col: 6, row: 2, conns: ['G', '螺丝#3', '螺丝#4', 'I'], used: 4 },
  I: { id: 'I', name: '组装杆-下', floor: 2, col: 3, row: 5, conns: ['H', 'RIP组装机', '转子组装机'], used: 3 },
};

export const LAYOUT_ZONES: LayoutZone[] = [
  { id: 'f1-feed', floor: 1, col: 0, row: 0, w: 8, h: 1, kind: 'trunk', label: '主物流带 · 矿石输入' },
  { id: 'f1-walk', floor: 1, col: 3, row: 1, w: 1, h: 2, kind: 'maintenance', label: '维护走道' },
  { id: 'f1-left-buffer', floor: 1, col: 0, row: 4, w: 1, h: 2, kind: 'reserve', label: '电力 / 缓冲' },
  { id: 'f1-right-reserve', floor: 1, col: 6, row: 1, w: 2, h: 2, kind: 'reserve', label: '扩产预留' },
  { id: 'f1-front', floor: 1, col: 0, row: 6, w: 8, h: 1, kind: 'front', label: '前场缓冲 · 升降机/出货' },
  { id: 'f2-arrival', floor: 2, col: 0, row: 0, w: 8, h: 1, kind: 'trunk', label: '主物流带 · 升降机到达' },
  { id: 'f2-walk', floor: 2, col: 3, row: 1, w: 1, h: 2, kind: 'maintenance', label: '维护走道' },
  { id: 'f2-screw-lane', floor: 2, col: 1, row: 3, w: 5, h: 1, kind: 'trunk', label: '主物流带 · 螺丝走廊' },
  { id: 'f2-right-reserve', floor: 2, col: 6, row: 4, w: 2, h: 2, kind: 'reserve', label: '扩产预留 · 终端件' },
  { id: 'f2-front', floor: 2, col: 0, row: 6, w: 8, h: 1, kind: 'front', label: '成品前场 · 储存/接口' },
  { id: 'f2-apron', floor: 2, col: 0, row: 7, w: 8, h: 1, kind: 'front', label: '南扩前场 · 出货缓冲' },
];

// ============================
// BELT BUILDER
// ============================
export function buildBelts(): Belt[] {
  const B: Belt[] = [];
  const port = (id: keyof typeof MACHINES, name: MachinePortName) => {
    const [x, y] = machinePortPoint(MACHINES[id], name);
    return [x, y];
  };

  // ===== FLOOR 1 BELTS =====
  const oreA1 = cy(0) + 15;
  const oreA2 = cy(0) + 35;
  const oreB1 = cy(0) + 45;
  const oreB2 = cy(0) + 60;

  B.push({ floor: 1, material: 'ore', color: 'var(--ore)', rate: '60/m', points: [[cx(0), oreA1], [cmx(1.5), oreA1]], label: '矿石A 60/m' });
  B.push({ floor: 1, material: 'ore', color: 'var(--ore)', rate: '60/m', points: [[cmx(1.5), oreA1], [cmx(1.5), oreA2]], label: '' });
  B.push({ floor: 1, material: 'ore', color: 'var(--ore)', rate: '30/m', points: [[cmx(1.5), oreA2], [port('smelter1', 'input')[0], oreA2], port('smelter1', 'input')], label: '30/m' });
  B.push({ floor: 1, material: 'ore', color: 'var(--ore)', rate: '30/m', points: [[cmx(1.5), oreA2], [port('smelter2', 'input')[0], oreA2], port('smelter2', 'input')], label: '30/m' });

  B.push({ floor: 1, material: 'ore', color: 'var(--ore)', rate: '60/m', points: [[cx(0), oreB1], [cmx(4.5), oreB1]], label: '矿石B 60/m' });
  B.push({ floor: 1, material: 'ore', color: 'var(--ore)', rate: '60/m', points: [[cmx(4.5), oreB1], [cmx(4.5), oreB2]], label: '' });
  B.push({ floor: 1, material: 'ore', color: 'var(--ore)', rate: '30/m', points: [[cmx(4.5), oreB2], [port('smelter3', 'input')[0], oreB2], port('smelter3', 'input')], label: '30/m' });
  B.push({ floor: 1, material: 'ore', color: 'var(--ore)', rate: '30/m', points: [[cmx(4.5), oreB2], [port('smelter4', 'input')[0], oreB2], port('smelter4', 'input')], label: '30/m' });

  B.push({ floor: 1, material: 'ingot', color: 'var(--smelter)', rate: '30/m', points: [port('smelter1', 'output'), port('plate1', 'input')], label: '锭30', labelDx: 14, labelDy: -16 });
  B.push({ floor: 1, material: 'ingot', color: 'var(--smelter)', rate: '30/m', points: [port('smelter2', 'output'), port('plate2', 'input')], label: '锭30', labelDx: 14, labelDy: -16 });

  B.push({ floor: 1, material: 'ingot', color: 'var(--smelter)', rate: '30/m', points: [port('smelter3', 'output'), [port('smelter3', 'output')[0], cmy(3)]], label: '锭30', labelDx: 18, labelDy: -18 });
  B.push({ floor: 1, material: 'ingot', color: 'var(--smelter)', rate: '15/m', points: [[port('smelter3', 'output')[0], cmy(3)], [port('rod1', 'input')[0], cmy(3)], port('rod1', 'input')], label: '15' });
  B.push({ floor: 1, material: 'ingot', color: 'var(--smelter)', rate: '15/m', points: [[port('smelter3', 'output')[0], cmy(3)], [port('rod2', 'input')[0], cmy(3)], port('rod2', 'input')], label: '15' });

  B.push({ floor: 1, material: 'ingot', color: 'var(--smelter)', rate: '30/m', points: [port('smelter4', 'output'), [port('smelter4', 'output')[0], cy(3) + 15]], label: '锭30', labelDx: 18, labelDy: -18 });
  B.push({ floor: 1, material: 'ingot', color: 'var(--smelter)', rate: '30/m', points: [[port('smelter4', 'output')[0], cy(3) + 15], [cmx(6.5), cy(3) + 15], [cmx(6.5), cmy(3.2)]], label: '' });
  B.push({ floor: 1, material: 'ingot', color: 'var(--smelter)', rate: '15/m', points: [[cmx(6.5), cmy(3.2)], [port('rod3', 'input')[0], cmy(3.2)], port('rod3', 'input')], label: '15' });
  B.push({ floor: 1, material: 'ingot', color: 'var(--smelter)', rate: '15/m', points: [[cmx(6.5), cmy(3.2)], [port('rod4', 'input')[0], cmy(3.2)], port('rod4', 'input')], label: '15' });

  B.push({ floor: 1, material: 'plate', color: 'var(--plate)', rate: '20/m', points: [port('plate1', 'output'), [port('plate1', 'output')[0], cmy(6.15)], [cmx(1.5), cmy(6.15)]], label: '板20' });
  B.push({ floor: 1, material: 'plate', color: 'var(--plate)', rate: '20/m', points: [port('plate2', 'output'), [port('plate2', 'output')[0], cmy(6.15)], [cmx(1.5), cmy(6.15)]], label: '板20' });
  B.push({ floor: 1, material: 'plate', color: 'var(--plate)', rate: '40/m', points: [[cmx(1.5), cmy(6.15)], [cmx(1.5), cmy(6.62)]], label: '铁板 40/m' });

  B.push({ floor: 1, material: 'rod', color: 'var(--rod)', rate: '15/m', points: [port('rod1', 'output'), [port('rod1', 'output')[0], cmy(6.12)], [cmx(4.5), cmy(6.12)]], label: '' });
  B.push({ floor: 1, material: 'rod', color: 'var(--rod)', rate: '15/m', points: [port('rod2', 'output'), [port('rod2', 'output')[0], cmy(6.12)], [cmx(4.5), cmy(6.12)]], label: '' });
  B.push({ floor: 1, material: 'rod', color: 'var(--rod)', rate: '15/m', points: [port('rod3', 'output'), [port('rod3', 'output')[0], cmy(6.2)], [cmx(6.5), cmy(6.2)]], label: '' });
  B.push({ floor: 1, material: 'rod', color: 'var(--rod)', rate: '15/m', points: [port('rod4', 'output'), [port('rod4', 'output')[0], cmy(6.2)], [cmx(6.5), cmy(6.2)]], label: '' });
  B.push({ floor: 1, material: 'rod', color: 'var(--rod)', rate: '30/m', points: [[cmx(4.5), cmy(6.12)], [cmx(4.5), cmy(6.4)], [cmx(5.5), cmy(6.4)]], label: '30', labelDx: 50, labelDy: -10 });
  B.push({ floor: 1, material: 'rod', color: 'var(--rod)', rate: '30/m', points: [[cmx(6.5), cmy(6.2)], [cmx(6.5), cmy(6.4)], [cmx(5.5), cmy(6.4)]], label: '30', labelDx: -50, labelDy: 10 });
  B.push({ floor: 1, material: 'rod', color: 'var(--rod)', rate: '60/m', points: [[cmx(5.5), cmy(6.4)], [cmx(5.5), cmy(6.62)]], label: '铁棒 60/m' });

  // ===== FLOOR 2 BELTS =====
  const r1 = cy(0) + 15;
  const r2 = cy(0) + 35;
  const r3 = cy(0) + 55;

  B.push({ floor: 2, material: 'rod', color: 'var(--rod)', rate: '60/m', points: [[cmx(4), cy(0) + 5], [cmx(4), r1]], label: '铁棒 60/m', labelDx: 18, labelDy: -24 });
  B.push({ floor: 2, material: 'rod', color: 'var(--rod)', rate: '40/m', points: [[cmx(4), r1], [cmx(3), r1], [cmx(3), r2]], label: '40→螺丝线', labelDx: -64, labelDy: 18 });
  B.push({ floor: 2, material: 'rod', color: 'var(--rod)', rate: '20/m', points: [[cmx(4), r1], [cmx(7), r1], [cmx(7), machinePortPoint(MACHINES.rotor, 'left')[1]]], label: '20→转子', labelDx: 16, labelDy: -20 });
  B.push({ floor: 2, material: 'rod', color: 'var(--rod)', rate: '20/m', points: [[cmx(3), r2], [cmx(1.5), r2], [cmx(1.5), r3]], label: '20' });
  B.push({ floor: 2, material: 'rod', color: 'var(--rod)', rate: '20/m', points: [[cmx(3), r2], [cmx(4.5), r2], [cmx(4.5), r3]], label: '20', labelDx: -30, labelDy: 8 });
  B.push({ floor: 2, material: 'rod', color: 'var(--rod)', rate: '10/m', points: [[cmx(1.5), r3], [port('screw1', 'input')[0], r3], port('screw1', 'input')], label: '10' });
  B.push({ floor: 2, material: 'rod', color: 'var(--rod)', rate: '10/m', points: [[cmx(1.5), r3], [port('screw2', 'input')[0], r3], port('screw2', 'input')], label: '10' });
  B.push({ floor: 2, material: 'rod', color: 'var(--rod)', rate: '10/m', points: [[cmx(4.5), r3], [port('screw3', 'input')[0], r3], port('screw3', 'input')], label: '10' });
  B.push({ floor: 2, material: 'rod', color: 'var(--rod)', rate: '10/m', points: [[cmx(4.5), r3], [port('screw4', 'input')[0], r3], port('screw4', 'input')], label: '10' });

  const sM = cy(3) + 15;
  const sS = cy(3) + 38;
  B.push({ floor: 2, material: 'screw', color: 'var(--screw)', rate: '40/m', points: [port('screw1', 'output'), [port('screw1', 'output')[0], sM], [cmx(1.5), sM]], label: '' });
  B.push({ floor: 2, material: 'screw', color: 'var(--screw)', rate: '40/m', points: [port('screw2', 'output'), [port('screw2', 'output')[0], sM], [cmx(1.5), sM]], label: '' });
  B.push({ floor: 2, material: 'screw', color: 'var(--screw)', rate: '80/m', mk2: true, mk2id: '①', points: [[cmx(1.5), sM], [cmx(1.5), sS]], label: '80/m ⚠', labelDx: -45 });
  B.push({ floor: 2, material: 'screw', color: 'var(--screw)', rate: '60/m', points: [[cmx(1.5), sS], [machinePortPoint(MACHINES.rip, 'top')[0], cy(4)]], label: '螺丝60→RIP' });
  B.push({ floor: 2, material: 'screw', color: 'var(--screw)', rate: '20/m', points: [[cmx(1.5), sS], [cmx(4.5), sS]], label: '20→', labelDy: -25 });
  B.push({ floor: 2, material: 'screw', color: 'var(--screw)', rate: '40/m', points: [port('screw3', 'output'), [port('screw3', 'output')[0], sM], [cmx(4.5), sM]], label: '' });
  B.push({ floor: 2, material: 'screw', color: 'var(--screw)', rate: '40/m', points: [port('screw4', 'output'), [port('screw4', 'output')[0], sM], [cmx(4.5), sM]], label: '' });
  B.push({ floor: 2, material: 'screw', color: 'var(--screw)', rate: '80/m', mk2: true, mk2id: '②', points: [[cmx(4.5), sM], [cmx(4.5), sS]], label: '80/m ⚠', labelDx: -45 });
  B.push({ floor: 2, material: 'screw', color: 'var(--screw)', rate: '100/m', mk2: true, mk2id: '③', points: [[cmx(4.5), sS], [machinePortPoint(MACHINES.rotor, 'top')[0], cy(4)]], label: '螺丝100→转子 ⚠', labelDx: 20, mk2Dx: -25 });

  B.push({ floor: 2, material: 'rod', color: 'var(--rod)', rate: '20/m', points: [[cmx(7), machinePortPoint(MACHINES.rotor, 'left')[1]], machinePortPoint(MACHINES.rotor, 'left')], label: '棒20→转子' });

  const pA = cy(0) + 25;
  const pB = cy(0) + 45;
  B.push({ floor: 2, material: 'plate', color: 'var(--plate)', rate: '40/m', points: [[cmx(1), cy(0) + 5], [cmx(1), pA]], label: '铁板 40/m', labelDx: 10, labelDy: -26 });
  B.push({ floor: 2, material: 'plate', color: 'var(--plate)', rate: '40/m', points: [[cmx(1), pA], [cmx(1), pB]], label: '' });
  B.push({ floor: 2, material: 'plate', color: 'var(--plate)', rate: '40/m', points: [[cmx(1), pB], [cmx(0.5), pB]], label: '' });
  B.push({ floor: 2, material: 'plate', color: 'var(--plate)', rate: '30/m', points: [[cmx(0.5), pB], [cmx(0.5), machinePortPoint(MACHINES.rip, 'left')[1]], machinePortPoint(MACHINES.rip, 'left')], label: '板30→RIP', labelDx: -55 });
  B.push({ floor: 2, material: 'plate', color: 'var(--plate)', rate: '10/m', points: [[cmx(0.5), pB], [cmx(0), pB], [cmx(0), machinePortPoint(MACHINES.store_plate, 'left')[1]], machinePortPoint(MACHINES.store_plate, 'left')], label: '余板10→储存', labelDx: -60, labelDy: -15 });

  B.push({ floor: 2, material: 'rip', color: 'var(--assembly)', rate: '5/m', points: [machinePortPoint(MACHINES.rip, 'bottom'), [machinePortPoint(MACHINES.rip, 'bottom')[0], cy(7.1)], machinePortPoint(MACHINES.store_rip, 'top')], label: '强化铁板 5/m', labelDx: -75, labelDy: -20 });
  B.push({ floor: 2, material: 'rotor', color: 'var(--assembly)', rate: '2.4/m', points: [machinePortPoint(MACHINES.rotor, 'bottom'), [machinePortPoint(MACHINES.rotor, 'bottom')[0], cy(7.1)], [machinePortPoint(MACHINES.store_rotor, 'top')[0], cy(7.1)], machinePortPoint(MACHINES.store_rotor, 'top')], label: '转子 2.4/m', labelDx: 50 });

  return B;
}

export const BELTS = buildBelts();

export const LIFTS: Lift[] = [
  { id: 'lift_plate', name: '铁板升降机', floor: 1, col: 1.2, row: 6.5, targetFloor: 2, material: 'plate' },
  { id: 'lift_rod', name: '铁棒升降机', floor: 1, col: 4.7, row: 6.5, targetFloor: 2, material: 'rod' },
  { id: 'lift_plate2', name: '铁板升降机', floor: 2, col: 1.2, row: -0.3, material: 'plate' },
  { id: 'lift_rod2', name: '铁棒升降机', floor: 2, col: 4.7, row: -0.3, material: 'rod' },
  { id: 'lift_spare2', name: '预留升降机口', floor: 2, col: 6.5, row: 7.18, material: 'rod' },
];

export const SPLITTERS: Splitter[] = [
  { floor: 1, type: 'split', x: cmx(1.5), y: cy(0) + 35, label: '分流' },
  { floor: 1, type: 'split', x: cmx(4.5), y: cy(0) + 60, label: '分流' },
  { floor: 1, type: 'split', x: cmx(4), y: cmy(3), label: '分流' },
  { floor: 1, type: 'split', x: cmx(6.5), y: cmy(3.2), label: '分流' },
  { floor: 1, type: 'merge', x: cmx(1.5), y: cmy(6.15), label: '合流' },
  { floor: 1, type: 'merge', x: cmx(4.5), y: cmy(6.12), label: '合流' },
  { floor: 1, type: 'merge', x: cmx(6.5), y: cmy(6.2), label: '合流' },
  { floor: 1, type: 'merge', x: cmx(5.5), y: cmy(6.4), label: '合流' },
  { floor: 2, type: 'split', x: cmx(4), y: cy(0) + 15, label: '分流 60→40+20' },
  { floor: 2, type: 'split', x: cmx(3), y: cy(0) + 35, label: '分流 40→20+20' },
  { floor: 2, type: 'split', x: cmx(1.5), y: cy(0) + 55, label: '分流' },
  { floor: 2, type: 'split', x: cmx(4.5), y: cy(0) + 55, label: '分流' },
  { floor: 2, type: 'merge', x: cmx(1.5), y: cy(3) + 15, label: '合流' },
  { floor: 2, type: 'merge', x: cmx(4.5), y: cy(3) + 15, label: '合流' },
  { floor: 2, type: 'split', x: cmx(1.5), y: cy(3) + 38, label: '分流 80→60+20' },
  { floor: 2, type: 'merge', x: cmx(4.5), y: cy(3) + 38, label: '合流 20+80→100' },
  { floor: 2, type: 'split', x: cmx(0.5), y: cy(0) + 45, label: '分流 40→30+10' },
];

// Power line topology
export const POWER_PAIRS: Record<string, [string, string][]> = {
  '1': [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'E'], ['E', 'F']],
  '2': [['G', 'H'], ['H', 'I']],
};

// Production stats
export const PRODUCTION_STATS = [
  { name: '铁矿石', rate: '120', color: 'var(--ore)', pct: 100, note: '输入' },
  { name: '铁锭', rate: '120', color: 'var(--smelter)', pct: 100, note: '中间' },
  { name: '铁板', rate: '40', color: 'var(--plate)', pct: 100, note: '30→RIP, 10→前场' },
  { name: '铁棒', rate: '60', color: 'var(--rod)', pct: 100, note: '40→螺丝, 20→转子' },
  { name: '螺丝', rate: '120~160', color: 'var(--screw)', pct: 75, note: 'Mk.1限流' },
  { name: '强化铁板', rate: '5', color: 'var(--assembly)', pct: 100, note: '产出' },
  { name: '转子', rate: '2.4→4', color: 'var(--assembly)', pct: 60, note: 'Mk.2后满速' },
];

// Build list
export const BUILD_LIST = [
  ['8m 地基', '120 (1F 8×7 + 2F 8×8)'],
  ['冶炼炉', '×4'], ['铁板制造机', '×2'], ['铁棒制造机', '×4'],
  ['螺丝制造机', '×4'], ['强化铁板组装机', '×1'], ['转子组装机', '×1'],
  ['储存箱', '×4'], ['Mk.1升降机', '×2 + 1预留'],
  ['分流器', '×9'], ['合流器', '×6'], ['Mk.1电线杆', '×9'],
];
