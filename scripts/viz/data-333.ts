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

const allSpecs: PanelSpec[] = [
  panelIronIngot,
  panelCopperIngot,
  panelScrew,
  panelIronRod,
  // 后续 15 个面板由 Task 7 补齐
];

export const panels333: Panel[] = allSpecs.map(buildPanel);
