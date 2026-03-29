// ============================
// TYPES
// ============================
export interface MaterialIO {
  name: string;
  rate: number | string;
}

export interface Machine {
  id: string;
  name: string;
  type: 'smelter' | 'plate' | 'rod' | 'screw' | 'assembly' | 'storage';
  floor: number;
  col: number;
  row: number;
  w: number;
  h: number;
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

// ============================
// COORDINATE SYSTEM
// ============================
export const C = { w: 95, h: 78 }; // cell size in SVG units
export const PAD = { x: 45, y: 35 };

export function cx(col: number) { return PAD.x + col * C.w; }
export function cy(row: number) { return PAD.y + row * C.h; }
export function cmx(col: number) { return cx(col) + C.w / 2; }
export function cmy(row: number) { return cy(row) + C.h / 2; }

export const VIEW_W = C.w * 8 + PAD.x * 2;
export const VIEW_H = C.h * 7 + PAD.y * 2 + 20;

// ============================
// DATA
// ============================
export const MACHINES: Record<string, Machine> = {
  // ====== FLOOR 1 ======
  smelter1: { id: 'smelter1', name: '冶炼炉 #1', type: 'smelter', floor: 1, col: 1, row: 1, w: 1, h: 2, color: 'var(--smelter)',
    recipe: '铁矿→铁锭', inputs: [{ name: '铁矿', rate: 30 }], outputs: [{ name: '铁锭', rate: 30 }], power: 4, eff: 100, pole: 'B' },
  smelter2: { id: 'smelter2', name: '冶炼炉 #2', type: 'smelter', floor: 1, col: 2, row: 1, w: 1, h: 2, color: 'var(--smelter)',
    recipe: '铁矿→铁锭', inputs: [{ name: '铁矿', rate: 30 }], outputs: [{ name: '铁锭', rate: 30 }], power: 4, eff: 100, pole: 'B' },
  smelter3: { id: 'smelter3', name: '冶炼炉 #3', type: 'smelter', floor: 1, col: 4, row: 1, w: 1, h: 2, color: 'var(--smelter)',
    recipe: '铁矿→铁锭', inputs: [{ name: '铁矿', rate: 30 }], outputs: [{ name: '铁锭', rate: 30 }], power: 4, eff: 100, pole: 'C' },
  smelter4: { id: 'smelter4', name: '冶炼炉 #4', type: 'smelter', floor: 1, col: 5, row: 1, w: 1, h: 2, color: 'var(--smelter)',
    recipe: '铁矿→铁锭', inputs: [{ name: '铁矿', rate: 30 }], outputs: [{ name: '铁锭', rate: 30 }], power: 4, eff: 100, pole: 'C' },
  plate1: { id: 'plate1', name: '铁板制造机 #1', type: 'plate', floor: 1, col: 1, row: 4, w: 1, h: 2, color: 'var(--plate)',
    recipe: '铁锭×3→铁板×2', inputs: [{ name: '铁锭', rate: 30 }], outputs: [{ name: '铁板', rate: 20 }], power: 4, eff: 100, pole: 'D' },
  plate2: { id: 'plate2', name: '铁板制造机 #2', type: 'plate', floor: 1, col: 2, row: 4, w: 1, h: 2, color: 'var(--plate)',
    recipe: '铁锭×3→铁板×2', inputs: [{ name: '铁锭', rate: 30 }], outputs: [{ name: '铁板', rate: 20 }], power: 4, eff: 100, pole: 'D' },
  rod1: { id: 'rod1', name: '铁棒制造机 #1', type: 'rod', floor: 1, col: 4, row: 4, w: 1, h: 2, color: 'var(--rod)',
    recipe: '铁锭×1→铁棒×1', inputs: [{ name: '铁锭', rate: 15 }], outputs: [{ name: '铁棒', rate: 15 }], power: 4, eff: 100, pole: 'E' },
  rod2: { id: 'rod2', name: '铁棒制造机 #2', type: 'rod', floor: 1, col: 5, row: 4, w: 1, h: 2, color: 'var(--rod)',
    recipe: '铁锭×1→铁棒×1', inputs: [{ name: '铁锭', rate: 15 }], outputs: [{ name: '铁棒', rate: 15 }], power: 4, eff: 100, pole: 'E' },
  rod3: { id: 'rod3', name: '铁棒制造机 #3', type: 'rod', floor: 1, col: 6, row: 4, w: 1, h: 2, color: 'var(--rod)',
    recipe: '铁锭×1→铁棒×1', inputs: [{ name: '铁锭', rate: 15 }], outputs: [{ name: '铁棒', rate: 15 }], power: 4, eff: 100, pole: 'F' },
  rod4: { id: 'rod4', name: '铁棒制造机 #4', type: 'rod', floor: 1, col: 7, row: 4, w: 1, h: 2, color: 'var(--rod)',
    recipe: '铁锭×1→铁棒×1', inputs: [{ name: '铁锭', rate: 15 }], outputs: [{ name: '铁棒', rate: 15 }], power: 4, eff: 100, pole: 'F' },

  // ====== FLOOR 2 ======
  screw1: { id: 'screw1', name: '螺丝制造机 #1', type: 'screw', floor: 2, col: 1, row: 1, w: 1, h: 2, color: 'var(--screw)',
    recipe: '铁棒×1→螺丝×4', inputs: [{ name: '铁棒', rate: 10 }], outputs: [{ name: '螺丝', rate: 40 }], power: 4, eff: 75, pole: 'G',
    mk2Note: 'Mk.2升级后效率恢复100%' },
  screw2: { id: 'screw2', name: '螺丝制造机 #2', type: 'screw', floor: 2, col: 2, row: 1, w: 1, h: 2, color: 'var(--screw)',
    recipe: '铁棒×1→螺丝×4', inputs: [{ name: '铁棒', rate: 10 }], outputs: [{ name: '螺丝', rate: 40 }], power: 4, eff: 75, pole: 'G',
    mk2Note: 'Mk.2升级后效率恢复100%' },
  screw3: { id: 'screw3', name: '螺丝制造机 #3', type: 'screw', floor: 2, col: 4, row: 1, w: 1, h: 2, color: 'var(--screw)',
    recipe: '铁棒×1→螺丝×4', inputs: [{ name: '铁棒', rate: 10 }], outputs: [{ name: '螺丝', rate: 40 }], power: 4, eff: 75, pole: 'H',
    mk2Note: 'Mk.2升级后效率恢复100%' },
  screw4: { id: 'screw4', name: '螺丝制造机 #4', type: 'screw', floor: 2, col: 5, row: 1, w: 1, h: 2, color: 'var(--screw)',
    recipe: '铁棒×1→螺丝×4', inputs: [{ name: '铁棒', rate: 10 }], outputs: [{ name: '螺丝', rate: 40 }], power: 4, eff: 75, pole: 'H',
    mk2Note: 'Mk.2升级后效率恢复100%' },
  rip: { id: 'rip', name: '强化铁板 组装机', type: 'assembly', floor: 2, col: 1, row: 4, w: 2, h: 2, color: 'var(--assembly)',
    recipe: '铁板×6+螺丝×12→强化铁板×1', inputs: [{ name: '铁板', rate: 30 }, { name: '螺丝', rate: 60 }], outputs: [{ name: '强化铁板', rate: 5 }], power: 15, eff: 100, pole: 'I' },
  rotor: { id: 'rotor', name: '转子 组装机', type: 'assembly', floor: 2, col: 4, row: 4, w: 2, h: 2, color: 'var(--assembly)',
    recipe: '铁棒×5+螺丝×25→转子×1', inputs: [{ name: '铁棒', rate: 20 }, { name: '螺丝', rate: 100 }], outputs: [{ name: '转子', rate: 4 }], power: 15, eff: 60, pole: 'I',
    mk2Note: '当前Mk.1带限流60螺丝/min → 60%效率(2.4/min)\n升级③号带段为Mk.2后→100%(4/min)' },
  store_plate: { id: 'store_plate', name: '铁板 储存箱', type: 'storage', floor: 2, col: 1, row: 6, w: 1, h: 1, color: 'var(--storage)',
    recipe: '缓冲', inputs: [{ name: '铁板余量', rate: 10 }], outputs: [], power: 0, eff: 100, pole: '-' },
  store_rip: { id: 'store_rip', name: '强化铁板 储存箱', type: 'storage', floor: 2, col: 2, row: 6, w: 1, h: 1, color: 'var(--storage)',
    recipe: '缓冲', inputs: [{ name: '强化铁板', rate: 5 }], outputs: [], power: 0, eff: 100, pole: '-' },
  store_rotor: { id: 'store_rotor', name: '转子 储存箱', type: 'storage', floor: 2, col: 4, row: 6, w: 1, h: 1, color: 'var(--storage)',
    recipe: '缓冲', inputs: [{ name: '转子', rate: '2.4→4' }], outputs: [], power: 0, eff: 100, pole: '-' },
  store_screw: { id: 'store_screw', name: '螺丝溢出 储存箱', type: 'storage', floor: 2, col: 5, row: 6, w: 1, h: 1, color: 'var(--storage)',
    recipe: 'Mk.1限流溢出缓冲', inputs: [{ name: '螺丝溢出', rate: '~0' }], outputs: [], power: 0, eff: 100, pole: '-',
    mk2Note: '升级Mk.2后无溢出，可拆除或改作他用' },
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

// ============================
// BELT BUILDER
// ============================
export function buildBelts(): Belt[] {
  const B: Belt[] = [];

  // ===== FLOOR 1 BELTS =====
  const oreA1 = cy(0) + 15, oreA2 = cy(0) + 35, oreB1 = cy(0) + 45, oreB2 = cy(0) + 60;

  // Ore A
  B.push({ floor: 1, material: 'ore', color: 'var(--ore)', rate: '60/m', points: [[cx(0), oreA1], [cmx(1.5), oreA1]], label: '矿石A 60/m' });
  B.push({ floor: 1, material: 'ore', color: 'var(--ore)', rate: '60/m', points: [[cmx(1.5), oreA1], [cmx(1.5), oreA2]], label: '' });
  B.push({ floor: 1, material: 'ore', color: 'var(--ore)', rate: '30/m', points: [[cmx(1.5), oreA2], [cmx(1), oreA2], [cmx(1), cy(1)]], label: '30/m' });
  B.push({ floor: 1, material: 'ore', color: 'var(--ore)', rate: '30/m', points: [[cmx(1.5), oreA2], [cmx(2), oreA2], [cmx(2), cy(1)]], label: '30/m' });

  // Ore B
  B.push({ floor: 1, material: 'ore', color: 'var(--ore)', rate: '60/m', points: [[cx(0), oreB1], [cmx(4.5), oreB1]], label: '矿石B 60/m' });
  B.push({ floor: 1, material: 'ore', color: 'var(--ore)', rate: '60/m', points: [[cmx(4.5), oreB1], [cmx(4.5), oreB2]], label: '' });
  B.push({ floor: 1, material: 'ore', color: 'var(--ore)', rate: '30/m', points: [[cmx(4.5), oreB2], [cmx(4), oreB2], [cmx(4), cy(1)]], label: '30/m' });
  B.push({ floor: 1, material: 'ore', color: 'var(--ore)', rate: '30/m', points: [[cmx(4.5), oreB2], [cmx(5), oreB2], [cmx(5), cy(1)]], label: '30/m' });

  // Ingots: Smelter → Plate/Rod
  B.push({ floor: 1, material: 'ingot', color: 'var(--smelter)', rate: '30/m', points: [[cmx(1), cy(3)], [cmx(1), cy(4)]], label: '锭30' });
  B.push({ floor: 1, material: 'ingot', color: 'var(--smelter)', rate: '30/m', points: [[cmx(2), cy(3)], [cmx(2), cy(4)]], label: '锭30' });

  B.push({ floor: 1, material: 'ingot', color: 'var(--smelter)', rate: '30/m', points: [[cmx(4), cy(3)], [cmx(4), cmy(3)]], label: '锭30' });
  B.push({ floor: 1, material: 'ingot', color: 'var(--smelter)', rate: '15/m', points: [[cmx(4), cmy(3)], [cmx(4), cy(4)]], label: '15' });
  B.push({ floor: 1, material: 'ingot', color: 'var(--smelter)', rate: '15/m', points: [[cmx(4), cmy(3)], [cmx(5), cmy(3)], [cmx(5), cy(4)]], label: '15' });

  B.push({ floor: 1, material: 'ingot', color: 'var(--smelter)', rate: '30/m', points: [[cmx(5), cy(3)], [cmx(5), cy(3) + 15]], label: '锭30' });
  B.push({ floor: 1, material: 'ingot', color: 'var(--smelter)', rate: '30/m', points: [[cmx(5), cy(3) + 15], [cmx(6.5), cy(3) + 15], [cmx(6.5), cmy(3.2)]], label: '' });
  B.push({ floor: 1, material: 'ingot', color: 'var(--smelter)', rate: '15/m', points: [[cmx(6.5), cmy(3.2)], [cmx(6), cmy(3.2)], [cmx(6), cy(4)]], label: '15' });
  B.push({ floor: 1, material: 'ingot', color: 'var(--smelter)', rate: '15/m', points: [[cmx(6.5), cmy(3.2)], [cmx(7), cmy(3.2)], [cmx(7), cy(4)]], label: '15' });

  // Plate output → merge → lift
  B.push({ floor: 1, material: 'plate', color: 'var(--plate)', rate: '20/m', points: [[cmx(1), cy(6)], [cmx(1), cmy(6.2)], [cmx(1.5), cmy(6.2)]], label: '板20' });
  B.push({ floor: 1, material: 'plate', color: 'var(--plate)', rate: '20/m', points: [[cmx(2), cy(6)], [cmx(2), cmy(6.2)], [cmx(1.5), cmy(6.2)]], label: '板20' });
  B.push({ floor: 1, material: 'plate', color: 'var(--plate)', rate: '40/m', points: [[cmx(1.5), cmy(6.2)], [cmx(1.5), cmy(6.6)]], label: '铁板 40/m' });

  // Rod output → sub-merges → main merge → lift
  B.push({ floor: 1, material: 'rod', color: 'var(--rod)', rate: '15/m', points: [[cmx(4), cy(6)], [cmx(4), cmy(6.15)], [cmx(4.5), cmy(6.15)]], label: '' });
  B.push({ floor: 1, material: 'rod', color: 'var(--rod)', rate: '15/m', points: [[cmx(5), cy(6)], [cmx(5), cmy(6.15)], [cmx(4.5), cmy(6.15)]], label: '' });
  B.push({ floor: 1, material: 'rod', color: 'var(--rod)', rate: '15/m', points: [[cmx(6), cy(6)], [cmx(6), cmy(6.25)], [cmx(6.5), cmy(6.25)]], label: '' });
  B.push({ floor: 1, material: 'rod', color: 'var(--rod)', rate: '15/m', points: [[cmx(7), cy(6)], [cmx(7), cmy(6.25)], [cmx(6.5), cmy(6.25)]], label: '' });
  B.push({ floor: 1, material: 'rod', color: 'var(--rod)', rate: '30/m', points: [[cmx(4.5), cmy(6.15)], [cmx(4.5), cmy(6.4)], [cmx(5.5), cmy(6.4)]], label: '30', labelDx: 50, labelDy: -10 });
  B.push({ floor: 1, material: 'rod', color: 'var(--rod)', rate: '30/m', points: [[cmx(6.5), cmy(6.25)], [cmx(6.5), cmy(6.4)], [cmx(5.5), cmy(6.4)]], label: '30', labelDx: -50, labelDy: 10 });
  B.push({ floor: 1, material: 'rod', color: 'var(--rod)', rate: '60/m', points: [[cmx(5.5), cmy(6.4)], [cmx(5.5), cmy(6.6)]], label: '铁棒 60/m' });

  // ===== FLOOR 2 BELTS =====
  const r1 = cy(0) + 15, r2 = cy(0) + 35, r3 = cy(0) + 55;

  // Rod distribution
  B.push({ floor: 2, material: 'rod', color: 'var(--rod)', rate: '60/m', points: [[cmx(4), cy(0) + 5], [cmx(4), r1]], label: '铁棒 60/m', labelDx: -60 });
  B.push({ floor: 2, material: 'rod', color: 'var(--rod)', rate: '40/m', points: [[cmx(4), r1], [cmx(3), r1], [cmx(3), r2]], label: '40→螺丝线' });
  B.push({ floor: 2, material: 'rod', color: 'var(--rod)', rate: '20/m', points: [[cmx(4), r1], [cmx(7), r1], [cmx(7), cy(4) + C.h * 0.3]], label: '20→转子' });
  B.push({ floor: 2, material: 'rod', color: 'var(--rod)', rate: '20/m', points: [[cmx(3), r2], [cmx(1.5), r2], [cmx(1.5), r3]], label: '20' });
  B.push({ floor: 2, material: 'rod', color: 'var(--rod)', rate: '20/m', points: [[cmx(3), r2], [cmx(4.5), r2], [cmx(4.5), r3]], label: '20', labelDx: -30, labelDy: 8 });
  B.push({ floor: 2, material: 'rod', color: 'var(--rod)', rate: '10/m', points: [[cmx(1.5), r3], [cmx(1), r3], [cmx(1), cy(1)]], label: '10' });
  B.push({ floor: 2, material: 'rod', color: 'var(--rod)', rate: '10/m', points: [[cmx(1.5), r3], [cmx(2), r3], [cmx(2), cy(1)]], label: '10' });
  B.push({ floor: 2, material: 'rod', color: 'var(--rod)', rate: '10/m', points: [[cmx(4.5), r3], [cmx(4), r3], [cmx(4), cy(1)]], label: '10' });
  B.push({ floor: 2, material: 'rod', color: 'var(--rod)', rate: '10/m', points: [[cmx(4.5), r3], [cmx(5), r3], [cmx(5), cy(1)]], label: '10' });

  // Screw corridor
  const sM = cy(3) + 15, sS = cy(3) + 38;
  B.push({ floor: 2, material: 'screw', color: 'var(--screw)', rate: '40/m', points: [[cmx(1), cy(3)], [cmx(1), sM], [cmx(1.5), sM]], label: '' });
  B.push({ floor: 2, material: 'screw', color: 'var(--screw)', rate: '40/m', points: [[cmx(2), cy(3)], [cmx(2), sM], [cmx(1.5), sM]], label: '' });
  B.push({ floor: 2, material: 'screw', color: 'var(--screw)', rate: '80/m', mk2: true, mk2id: '①', points: [[cmx(1.5), sM], [cmx(1.5), sS]], label: '80/m ⚠', labelDx: -45 });
  B.push({ floor: 2, material: 'screw', color: 'var(--screw)', rate: '60/m', points: [[cmx(1.5), sS], [cmx(1.5), cy(4)]], label: '螺丝60→RIP' });
  B.push({ floor: 2, material: 'screw', color: 'var(--screw)', rate: '20/m', points: [[cmx(1.5), sS], [cmx(4.5), sS]], label: '20→', labelDy: -25 });
  B.push({ floor: 2, material: 'screw', color: 'var(--screw)', rate: '40/m', points: [[cmx(4), cy(3)], [cmx(4), sM], [cmx(4.5), sM]], label: '' });
  B.push({ floor: 2, material: 'screw', color: 'var(--screw)', rate: '40/m', points: [[cmx(5), cy(3)], [cmx(5), sM], [cmx(4.5), sM]], label: '' });
  B.push({ floor: 2, material: 'screw', color: 'var(--screw)', rate: '80/m', mk2: true, mk2id: '②', points: [[cmx(4.5), sM], [cmx(4.5), sS]], label: '80/m ⚠', labelDx: -45 });
  B.push({ floor: 2, material: 'screw', color: 'var(--screw)', rate: '100/m', mk2: true, mk2id: '③', points: [[cmx(4.5), sS], [cmx(4.5), cy(4)]], label: '螺丝100→转子 ⚠', labelDx: 20, mk2Dx: -25 });

  // Rod to rotor
  B.push({ floor: 2, material: 'rod', color: 'var(--rod)', rate: '20/m', points: [[cmx(7), cy(4) + C.h * 0.3], [cx(6), cy(4) + C.h * 0.3]], label: '棒20→转子' });

  // Plate distribution
  const pA = cy(0) + 25, pB = cy(0) + 45;
  B.push({ floor: 2, material: 'plate', color: 'var(--plate)', rate: '40/m', points: [[cmx(1), cy(0) + 5], [cmx(1), pA]], label: '铁板 40/m', labelDx: 50 });
  B.push({ floor: 2, material: 'plate', color: 'var(--plate)', rate: '40/m', points: [[cmx(1), pA], [cmx(1), pB]], label: '' });
  B.push({ floor: 2, material: 'plate', color: 'var(--plate)', rate: '40/m', points: [[cmx(1), pB], [cmx(0.5), pB]], label: '' });
  B.push({ floor: 2, material: 'plate', color: 'var(--plate)', rate: '30/m', points: [[cmx(0.5), pB], [cmx(0.5), cy(4) + C.h * 0.3]], label: '板30→RIP', labelDx: -55 });
  B.push({ floor: 2, material: 'plate', color: 'var(--plate)', rate: '10/m', points: [[cmx(0.5), pB], [cmx(0), pB], [cmx(0), cmy(6.3)]], label: '余板10→储存', labelDx: -60, labelDy: -15 });
  B.push({ floor: 2, material: 'plate', color: 'var(--plate)', rate: '10/m', points: [[cmx(0), cmy(6.3)], [cmx(1), cmy(6.3)]], label: '' });

  // Assembly outputs → storage
  B.push({ floor: 2, material: 'rip', color: 'var(--assembly)', rate: '5/m', points: [[cmx(2), cy(6)], [cmx(2), cmy(6.3)]], label: '强化铁板 5/m', labelDx: -75, labelDy: -20 });
  B.push({ floor: 2, material: 'rotor', color: 'var(--assembly)', rate: '2.4/m', points: [[cmx(5), cy(6)], [cmx(5), cmy(6.3)], [cmx(4), cmy(6.3)]], label: '转子 2.4/m', labelDx: 50 });

  return B;
}

export const BELTS = buildBelts();

export const LIFTS: Lift[] = [
  { id: 'lift_plate', name: '铁板升降机', floor: 1, col: 1.2, row: 6.5, targetFloor: 2, material: 'plate' },
  { id: 'lift_rod', name: '铁棒升降机', floor: 1, col: 4.7, row: 6.5, targetFloor: 2, material: 'rod' },
  { id: 'lift_plate2', name: '铁板升降机', floor: 2, col: 1.2, row: -0.3, material: 'plate' },
  { id: 'lift_rod2', name: '铁棒升降机', floor: 2, col: 4.7, row: -0.3, material: 'rod' },
];

export const SPLITTERS: Splitter[] = [
  // Floor 1 — ore input
  { floor: 1, type: 'split', x: cmx(1.5), y: cy(0) + 35, label: '分流' },
  { floor: 1, type: 'split', x: cmx(4.5), y: cy(0) + 60, label: '分流' },
  // Floor 1 — ingot corridor
  { floor: 1, type: 'split', x: cmx(4), y: cmy(3), label: '分流' },
  { floor: 1, type: 'split', x: cmx(6.5), y: cmy(3.2), label: '分流' },
  // Floor 1 — output merges
  { floor: 1, type: 'merge', x: cmx(1.5), y: cmy(6.2), label: '合流' },
  { floor: 1, type: 'merge', x: cmx(4.5), y: cmy(6.15), label: '合流' },
  { floor: 1, type: 'merge', x: cmx(6.5), y: cmy(6.25), label: '合流' },
  { floor: 1, type: 'merge', x: cmx(5.5), y: cmy(6.4), label: '合流' },
  // Floor 2 — rod distribution
  { floor: 2, type: 'split', x: cmx(4), y: cy(0) + 15, label: '分流 60→40+20' },
  { floor: 2, type: 'split', x: cmx(3), y: cy(0) + 35, label: '分流 40→20+20' },
  { floor: 2, type: 'split', x: cmx(1.5), y: cy(0) + 55, label: '分流' },
  { floor: 2, type: 'split', x: cmx(4.5), y: cy(0) + 55, label: '分流' },
  // Floor 2 — screw corridor
  { floor: 2, type: 'merge', x: cmx(1.5), y: cy(3) + 15, label: '合流' },
  { floor: 2, type: 'merge', x: cmx(4.5), y: cy(3) + 15, label: '合流' },
  { floor: 2, type: 'split', x: cmx(1.5), y: cy(3) + 38, label: '分流 80→60+20' },
  { floor: 2, type: 'merge', x: cmx(4.5), y: cy(3) + 38, label: '合流 20+80→100' },
  // Floor 2 — plate split
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
  { name: '铁板', rate: '40', color: 'var(--plate)', pct: 100, note: '30→RIP, 10→储存' },
  { name: '铁棒', rate: '60', color: 'var(--rod)', pct: 100, note: '40→螺丝, 20→转子' },
  { name: '螺丝', rate: '120~160', color: 'var(--screw)', pct: 75, note: 'Mk.1限流' },
  { name: '强化铁板', rate: '5', color: 'var(--assembly)', pct: 100, note: '产出' },
  { name: '转子', rate: '2.4→4', color: 'var(--assembly)', pct: 60, note: 'Mk.2后满速' },
];

// Build list
export const BUILD_LIST = [
  ['8m 地基', '112 (8×7×2)'],
  ['冶炼炉', '×4'], ['铁板制造机', '×2'], ['铁棒制造机', '×4'],
  ['螺丝制造机', '×4'], ['强化铁板组装机', '×1'], ['转子组装机', '×1'],
  ['储存箱', '×4'], ['Mk.1升降机', '×2'],
  ['分流器', '×9'], ['合流器', '×6'], ['Mk.1电线杆', '×9'],
];
