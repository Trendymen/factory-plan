// scripts/viz/data-333.ts
import { Panel } from './types';
import { buildPanel, PanelSpec } from './build-panel';

// ======== 面板 01: 铁锭 ========
// 19 台冶炼站 → 24 台铁棒 + 7 台铁板
// 拆分：7+6+6 台冶炼站 → 3 条主干
//   - Trunk A: 7 台 → 7 台铁板 (210/min)
//   - Trunk B: 6 台 → 12 台铁棒 (180/min)
//   - Trunk C: 6 台 → 12 台铁棒 (180/min)
const panelIronIngot: PanelSpec = {
  id: 'iron-ingot',
  title: '面板 01 · 铁锭（19 台冶炼站 → 24 台铁棒 + 7 台铁板）',
  material: 'iron-ingot',
  trunks: [
    {
      producer: { id: 'smelter-iron-A', type: 'smelter', recipe: 'iron-ingot', count: 7, ratePerMachine: 30, label: '×7 铁锭冶炼站 (A)' },
      consumers: [{ id: 'plate', type: 'constructor', recipe: 'iron-plate', count: 7, ratePerMachine: 30, label: '×7 铁板构筑站' }],
      terminalRate: 0,
    },
    {
      producer: { id: 'smelter-iron-B', type: 'smelter', recipe: 'iron-ingot', count: 6, ratePerMachine: 30, label: '×6 铁锭冶炼站 (B)' },
      consumers: [{ id: 'rod-B', type: 'constructor', recipe: 'iron-rod', count: 12, ratePerMachine: 15, label: '×12 铁棒构筑站 (B)' }],
      terminalRate: 0,
    },
    {
      producer: { id: 'smelter-iron-C', type: 'smelter', recipe: 'iron-ingot', count: 6, ratePerMachine: 30, label: '×6 铁锭冶炼站 (C)' },
      consumers: [{ id: 'rod-C', type: 'constructor', recipe: 'iron-rod', count: 12, ratePerMachine: 15, label: '×12 铁棒构筑站 (C)' }],
      terminalRate: 0,
    },
  ],
};

// ======== 面板 02: 铜锭 ========
// 6 台冶炼站 → 8 台电线 + 3 台铜板
// 拆分：4+2 → 2 条主干
//   - Trunk A: 4 台 → 8 台电线 (120/min, 每台消耗 15)
//   - Trunk B: 2 台 → 3 台铜板 (60/min, 每台消耗 20)
const panelCopperIngot: PanelSpec = {
  id: 'copper-ingot',
  title: '面板 02 · 铜锭（6 台冶炼站 → 8 台电线 + 3 台铜板）',
  material: 'copper-ingot',
  trunks: [
    {
      producer: { id: 'smelter-cu-A', type: 'smelter', recipe: 'copper-ingot', count: 4, ratePerMachine: 30, label: '×4 铜锭冶炼站 (A)' },
      consumers: [{ id: 'wire', type: 'constructor', recipe: 'wire', count: 8, ratePerMachine: 15, label: '×8 电线构筑站' }],
      terminalRate: 0,
    },
    {
      producer: { id: 'smelter-cu-B', type: 'smelter', recipe: 'copper-ingot', count: 2, ratePerMachine: 30, label: '×2 铜锭冶炼站 (B)' },
      consumers: [{ id: 'sheet', type: 'constructor', recipe: 'copper-sheet', count: 3, ratePerMachine: 20, label: '×3 铜板构筑站' }],
      terminalRate: 0,
    },
  ],
};

// ======== 面板 06: 螺丝 ========
// 20 台螺丝构筑站 → RIP/转子/HMF/外输
// 拆分：6+6+5+3 → 4 条主干
//   - Trunk A: 6 台 → 4 台 RIP (240/min, 每台 60)
//   - Trunk B: 6 台 → 1 台 HMF (240/min)
//   - Trunk C: 5 台 → 2 台转子 (200/min, 每台 100)
//   - Trunk D: 3 台 → 1 台转子 (100) + 20 外输
const panelScrew: PanelSpec = {
  id: 'screw',
  title: '面板 06 · 螺丝（20 台构筑站，4 条主干）',
  material: 'screw',
  trunks: [
    {
      producer: { id: 'screw-A', type: 'constructor', recipe: 'screw', count: 6, ratePerMachine: 40, label: '×6 螺丝构筑站 (A)' },
      consumers: [{ id: 'rip', type: 'assembler', recipe: 'reinforced-iron-plate', count: 4, ratePerMachine: 60, label: '×4 强化铁板装配站' }],
      terminalRate: 0,
    },
    {
      producer: { id: 'screw-B', type: 'constructor', recipe: 'screw', count: 6, ratePerMachine: 40, label: '×6 螺丝构筑站 (B)' },
      consumers: [{ id: 'hmf', type: 'manufacturer', recipe: 'heavy-modular-frame', count: 1, ratePerMachine: 240, label: '×1 重型模块框架制造站' }],
      terminalRate: 0,
    },
    {
      producer: { id: 'screw-C', type: 'constructor', recipe: 'screw', count: 5, ratePerMachine: 40, label: '×5 螺丝构筑站 (C)' },
      consumers: [{ id: 'rotor-2', type: 'assembler', recipe: 'rotor', count: 2, ratePerMachine: 100, label: '×2 转子装配站 (C)' }],
      terminalRate: 0,
    },
    {
      producer: { id: 'screw-D', type: 'constructor', recipe: 'screw', count: 3, ratePerMachine: 40, label: '×3 螺丝构筑站 (D)' },
      consumers: [{ id: 'rotor-1', type: 'assembler', recipe: 'rotor', count: 1, ratePerMachine: 100, label: '×1 转子装配站 (D)' }],
      terminalRate: 20,
    },
  ],
};

// ======== 面板 04: 铁棒 ========
// 24 台铁棒构筑站 → 螺丝/转子/MF/外输
// 拆分：6+6+6+6 → 4 条主干（每干 ≤9 台，满足 buildMergerTree 容量）
//   - Trunk A1: 6 台 → 9 台螺丝构筑站 (90/min)
//   - Trunk A2: 6 台 → 9 台螺丝构筑站 (90/min)
//   - Trunk B1: 6 台 → 3 台转子 + 1 台MF (90/min, 外输 18)
//   - Trunk B2: 6 台 → 2 台螺丝 + 5 台MF (90/min, 外输 10)
// 总计：18 螺丝消费(rods) = screw-9a+screw-9b; 2 螺丝消费(rods) = screw-2b
// 合计外输：18+10=28 ✓  转子：3 ✓  MF：6 ✓  螺丝消费：9+9+2=20 ✓
const panelIronRod: PanelSpec = {
  id: 'iron-rod',
  title: '面板 04 · 铁棒（24 台构筑站，4 条主干）',
  material: 'iron-rod',
  trunks: [
    {
      producer: { id: 'rod-A1', type: 'constructor', recipe: 'iron-rod', count: 6, ratePerMachine: 15, label: '×6 铁棒构筑站 (A1)' },
      consumers: [{ id: 'screw-9a', type: 'constructor', recipe: 'screw', count: 9, ratePerMachine: 10, label: '×9 螺丝构筑站 (A1)' }],
      terminalRate: 0,
    },
    {
      producer: { id: 'rod-A2', type: 'constructor', recipe: 'iron-rod', count: 6, ratePerMachine: 15, label: '×6 铁棒构筑站 (A2)' },
      consumers: [{ id: 'screw-9b', type: 'constructor', recipe: 'screw', count: 9, ratePerMachine: 10, label: '×9 螺丝构筑站 (A2)' }],
      terminalRate: 0,
    },
    {
      producer: { id: 'rod-B1', type: 'constructor', recipe: 'iron-rod', count: 6, ratePerMachine: 15, label: '×6 铁棒构筑站 (B1)' },
      consumers: [
        { id: 'rotor', type: 'assembler', recipe: 'rotor', count: 3, ratePerMachine: 20, label: '×3 转子装配站' },
        { id: 'mf-1', type: 'assembler', recipe: 'modular-frame', count: 1, ratePerMachine: 12, label: '×1 模块化框架装配站 (B1)' },
      ],
      terminalRate: 18,
    },
    {
      producer: { id: 'rod-B2', type: 'constructor', recipe: 'iron-rod', count: 6, ratePerMachine: 15, label: '×6 铁棒构筑站 (B2)' },
      consumers: [
        { id: 'screw-2', type: 'constructor', recipe: 'screw', count: 2, ratePerMachine: 10, label: '×2 螺丝构筑站 (B2)' },
        { id: 'mf-5', type: 'assembler', recipe: 'modular-frame', count: 5, ratePerMachine: 12, label: '×5 模块化框架装配站 (B2)' },
      ],
      terminalRate: 10,
    },
  ],
};

// ======== 面板 03: 钢锭 ========
// 8 台熔炉 × 45/min = 360/min
// 拆分：4+4 台 → 2 条主干 180 各
//   - Trunk A: 4 台 → 3 台钢梁构筑站 (60/台)
//   - Trunk B: 4 台 → 6 台钢管构筑站 (30/台)
const panelSteelIngot: PanelSpec = {
  id: 'steel-ingot',
  title: '面板 03 · 钢锭（8 台熔炉 → 3 台钢梁 + 6 台钢管）',
  material: 'steel-ingot',
  trunks: [
    {
      producer: { id: 'foundry-A', type: 'foundry', recipe: 'steel-ingot', count: 4, ratePerMachine: 45, label: '×4 钢锭熔炉 (A)' },
      consumers: [{ id: 'beam', type: 'constructor', recipe: 'steel-beam', count: 3, ratePerMachine: 60, label: '×3 钢梁构筑站' }],
      terminalRate: 0,
    },
    {
      producer: { id: 'foundry-B', type: 'foundry', recipe: 'steel-ingot', count: 4, ratePerMachine: 45, label: '×4 钢锭熔炉 (B)' },
      consumers: [{ id: 'pipe', type: 'constructor', recipe: 'steel-pipe', count: 6, ratePerMachine: 30, label: '×6 钢管构筑站' }],
      terminalRate: 0,
    },
  ],
};

// ======== 面板 05: 铁板 ========
// 7 台铁板构筑站 × 20/min = 140/min
// 消费：4 台 RIP 装配站 × 30 = 120；外输 20
const panelIronPlate: PanelSpec = {
  id: 'iron-plate',
  title: '面板 05 · 铁板（7 台构筑站 → 4 台 RIP + 20 外输）',
  material: 'iron-plate',
  trunks: [
    {
      producer: { id: 'plate-c', type: 'constructor', recipe: 'iron-plate', count: 7, ratePerMachine: 20, label: '×7 铁板构筑站' },
      consumers: [{ id: 'rip-p', type: 'assembler', recipe: 'reinforced-iron-plate', count: 4, ratePerMachine: 30, label: '×4 强化铁板装配站' }],
      terminalRate: 20,
    },
  ],
};

// ======== 面板 07: 电线 ========
// 8 台电线构筑站 × 30/min = 240/min
// 消费：1 台电缆构筑站 × 60 + 3 台定子装配站 × 40；外输 60
const panelWire: PanelSpec = {
  id: 'wire',
  title: '面板 07 · 电线（8 台构筑站 → 1 电缆 + 3 定子 + 60 外输）',
  material: 'wire',
  trunks: [
    {
      producer: { id: 'wire-c', type: 'constructor', recipe: 'wire', count: 8, ratePerMachine: 30, label: '×8 电线构筑站' },
      consumers: [
        { id: 'cable-c', type: 'constructor', recipe: 'cable', count: 1, ratePerMachine: 60, label: '×1 电缆构筑站' },
        { id: 'stator-w', type: 'assembler', recipe: 'stator', count: 3, ratePerMachine: 40, label: '×3 定子装配站' },
      ],
      terminalRate: 60,
    },
  ],
};

// ======== 面板 08: 电缆 ========
// 1 台电缆构筑站 × 30/min = 30/min；无消费，全部外输
const panelCable: PanelSpec = {
  id: 'cable',
  title: '面板 08 · 电缆（1 台构筑站 → 30 外输）',
  material: 'cable',
  trunks: [
    {
      producer: { id: 'cable', type: 'constructor', recipe: 'cable', count: 1, ratePerMachine: 30, label: '×1 电缆构筑站' },
      consumers: [],
      terminalRate: 30,
    },
  ],
};

// ======== 面板 09: 铜板 ========
// 3 台铜板构筑站 × 10/min = 30/min；无消费，全部外输
const panelCopperSheet: PanelSpec = {
  id: 'copper-sheet',
  title: '面板 09 · 铜板（3 台构筑站 → 30 外输）',
  material: 'copper-sheet',
  trunks: [
    {
      producer: { id: 'sheet-c', type: 'constructor', recipe: 'copper-sheet', count: 3, ratePerMachine: 10, label: '×3 铜板构筑站' },
      consumers: [],
      terminalRate: 30,
    },
  ],
};

// ======== 面板 10: 钢梁 ========
// 3 台钢梁构筑站 × 15/min = 45/min
// 消费：2 台 ESP 装配站 × 18；外输 9
const panelSteelBeam: PanelSpec = {
  id: 'steel-beam',
  title: '面板 10 · 钢梁（3 台构筑站 → 2 台 ESP + 9 外输）',
  material: 'steel-beam',
  trunks: [
    {
      producer: { id: 'beam-c', type: 'constructor', recipe: 'steel-beam', count: 3, ratePerMachine: 15, label: '×3 钢梁构筑站' },
      consumers: [{ id: 'esp-b', type: 'assembler', recipe: 'encased-industrial-beam', count: 2, ratePerMachine: 18, label: '×2 ESP 装配站' }],
      terminalRate: 9,
    },
  ],
};

// ======== 面板 11: 钢管 ========
// 6 台钢管构筑站 × 20/min = 120/min
// 消费：3 台定子装配站 × 15 + 1 台 HMF 制造站 × 40；外输 35
const panelSteelPipe: PanelSpec = {
  id: 'steel-pipe',
  title: '面板 11 · 钢管（6 台构筑站 → 3 定子 + 1 HMF + 35 外输）',
  material: 'steel-pipe',
  trunks: [
    {
      producer: { id: 'pipe-c', type: 'constructor', recipe: 'steel-pipe', count: 6, ratePerMachine: 20, label: '×6 钢管构筑站' },
      consumers: [
        { id: 'stator-p', type: 'assembler', recipe: 'stator', count: 3, ratePerMachine: 15, label: '×3 定子装配站' },
        { id: 'hmf-p', type: 'manufacturer', recipe: 'heavy-modular-frame', count: 1, ratePerMachine: 40, label: '×1 HMF 制造站' },
      ],
      terminalRate: 35,
    },
  ],
};

// ======== 面板 12: 混凝土 ========
// 5 台混凝土构筑站 × 15/min = 75/min
// 消费：2 台 ESP 装配站 × 36；外输 3
const panelConcrete: PanelSpec = {
  id: 'concrete',
  title: '面板 12 · 混凝土（5 台构筑站 → 2 台 ESP + 3 外输）',
  material: 'concrete',
  trunks: [
    {
      producer: { id: 'concrete-c', type: 'constructor', recipe: 'concrete', count: 5, ratePerMachine: 15, label: '×5 混凝土构筑站' },
      consumers: [{ id: 'esp-con', type: 'assembler', recipe: 'encased-industrial-beam', count: 2, ratePerMachine: 36, label: '×2 ESP 装配站' }],
      terminalRate: 3,
    },
  ],
};

// ======== 面板 13: 强化铁板 (RIP) ========
// 4 台 RIP 装配站 × 5/min = 20/min
// 消费：6 台 MF 装配站 × 3；外输 2
const panelRIP: PanelSpec = {
  id: 'reinforced-iron-plate',
  title: '面板 13 · 强化铁板（4 台装配站 → 6 台 MF + 2 外输）',
  material: 'reinforced-iron-plate',
  trunks: [
    {
      producer: { id: 'rip-a', type: 'assembler', recipe: 'reinforced-iron-plate', count: 4, ratePerMachine: 5, label: '×4 强化铁板装配站' },
      consumers: [{ id: 'mf-r', type: 'assembler', recipe: 'modular-frame', count: 6, ratePerMachine: 3, label: '×6 MF 装配站' }],
      terminalRate: 2,
    },
  ],
};

// ======== 面板 14: 模块化框架 (MF) ========
// 6 台 MF 装配站 × 2/min = 12/min
// 消费：1 台 HMF 制造站 × 10；外输 2
const panelMF: PanelSpec = {
  id: 'modular-frame',
  title: '面板 14 · 模块化框架（6 台装配站 → 1 台 HMF + 2 外输）',
  material: 'modular-frame',
  trunks: [
    {
      producer: { id: 'mf-a', type: 'assembler', recipe: 'modular-frame', count: 6, ratePerMachine: 2, label: '×6 MF 装配站' },
      consumers: [{ id: 'hmf-mf', type: 'manufacturer', recipe: 'heavy-modular-frame', count: 1, ratePerMachine: 10, label: '×1 HMF 制造站' }],
      terminalRate: 2,
    },
  ],
};

// ======== 面板 15: 封装工业钢梁 (ESP) ========
// 2 台 ESP 装配站 × 6/min = 12/min
// 消费：1 台 HMF 制造站 × 10；外输 2
const panelESP: PanelSpec = {
  id: 'encased-industrial-beam',
  title: '面板 15 · ESP（2 台装配站 → 1 台 HMF + 2 外输）',
  material: 'encased-industrial-beam',
  trunks: [
    {
      producer: { id: 'esp-a', type: 'assembler', recipe: 'encased-industrial-beam', count: 2, ratePerMachine: 6, label: '×2 ESP 装配站' },
      consumers: [{ id: 'hmf-esp', type: 'manufacturer', recipe: 'heavy-modular-frame', count: 1, ratePerMachine: 10, label: '×1 HMF 制造站' }],
      terminalRate: 2,
    },
  ],
};

// ======== 面板 16: 转子 ========
// 3 台转子装配站 × 4/min = 12/min
// 消费：1 台电动机装配站 × 10；外输 2
const panelRotor: PanelSpec = {
  id: 'rotor',
  title: '面板 16 · 转子（3 台装配站 → 1 台电动机 + 2 外输）',
  material: 'rotor',
  trunks: [
    {
      producer: { id: 'rotor-a', type: 'assembler', recipe: 'rotor', count: 3, ratePerMachine: 4, label: '×3 转子装配站' },
      consumers: [{ id: 'motor-r', type: 'assembler', recipe: 'motor', count: 1, ratePerMachine: 10, label: '×1 电动机装配站' }],
      terminalRate: 2,
    },
  ],
};

// ======== 面板 17: 定子 ========
// 3 台定子装配站 × 5/min = 15/min
// 消费：1 台电动机装配站 × 10；外输 5
const panelStator: PanelSpec = {
  id: 'stator',
  title: '面板 17 · 定子（3 台装配站 → 1 台电动机 + 5 外输）',
  material: 'stator',
  trunks: [
    {
      producer: { id: 'stator-a', type: 'assembler', recipe: 'stator', count: 3, ratePerMachine: 5, label: '×3 定子装配站' },
      consumers: [{ id: 'motor-s', type: 'assembler', recipe: 'motor', count: 1, ratePerMachine: 10, label: '×1 电动机装配站' }],
      terminalRate: 5,
    },
  ],
};

// ======== 面板 18: 电动机 ========
// 1 台电动机装配站 × 5/min = 5/min；无消费，全部外输
const panelMotor: PanelSpec = {
  id: 'motor',
  title: '面板 18 · 电动机（1 台装配站 → 5 外输）',
  material: 'motor',
  trunks: [
    {
      producer: { id: 'motor-a', type: 'assembler', recipe: 'motor', count: 1, ratePerMachine: 5, label: '×1 电动机装配站' },
      consumers: [],
      terminalRate: 5,
    },
  ],
};

// ======== 面板 19: 重型模块框架 (HMF) ========
// 1 台 HMF 制造站 × 2/min = 2/min；无消费，全部外输
const panelHMF: PanelSpec = {
  id: 'heavy-modular-frame',
  title: '面板 19 · 重型模块框架（1 台制造站 → 2 外输）',
  material: 'heavy-modular-frame',
  trunks: [
    {
      producer: { id: 'hmf-a', type: 'manufacturer', recipe: 'heavy-modular-frame', count: 1, ratePerMachine: 2, label: '×1 HMF 制造站' },
      consumers: [],
      terminalRate: 2,
    },
  ],
};

const allSpecs: PanelSpec[] = [
  panelIronIngot,
  panelCopperIngot,
  panelSteelIngot,
  panelIronRod,
  panelIronPlate,
  panelScrew,
  panelWire,
  panelCable,
  panelCopperSheet,
  panelSteelBeam,
  panelSteelPipe,
  panelConcrete,
  panelRIP,
  panelMF,
  panelESP,
  panelRotor,
  panelStator,
  panelMotor,
  panelHMF,
];

export const panels333: Panel[] = allSpecs.map(buildPanel);
