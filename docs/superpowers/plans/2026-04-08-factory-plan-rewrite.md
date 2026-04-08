# Factory Plan 工程化重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 全部重写 Factory Plan 项目，实现多方案切换、精确坐标系、三种视图模式、暗色主题 UI 的工厂蓝图查看系统。

**Architecture:** 分为 core（纯数据层）、renderers（SVG 绘制纯函数组件）、views（视图容器）、ui（面板组件）、store（Zustand 状态管理）五层。JSON 文件驱动数据，Vite `import.meta.glob` 动态加载方案。

**Tech Stack:** React 19, TypeScript, Vite 6, Zustand, Motion, @floating-ui/react, Vitest

**Design Spec:** `docs/superpowers/specs/2026-04-08-factory-plan-engineering-design.md`

---

## File Structure

### 新建文件

```
src/
├── core/
│   ├── types.ts                    # 所有类型定义（~150行）
│   ├── coordinate.ts               # 坐标系统转换函数（~80行）
│   ├── registry.ts                 # 建筑注册表元数据（~200行）
│   └── schema.ts                   # JSON 验证 + 方案加载（~100行）
├── renderers/
│   ├── GridRenderer.tsx            # 正方形网格（~60行）
│   ├── ZoneRenderer.tsx            # 布局分区（~40行）
│   ├── MachineRenderer.tsx         # 机器绘制（~100行）
│   ├── BeltRenderer.tsx            # 传送带绘制（~90行）
│   ├── PowerRenderer.tsx           # 电力网络（~70行）
│   ├── LiftRenderer.tsx            # 升降机（~50行）
│   └── StructureRenderer.tsx       # 墙壁孔/支架（~50行）
├── views/
│   ├── FloorPlanView.tsx           # 单层俯视图 + 缩放平移（~150行）
│   ├── LinkedFloorView.tsx         # 并排联动视图（~80行）
│   └── CrossSectionView.tsx        # 侧视剖面图（~120行）
├── ui/
│   ├── TopBar.tsx                  # 顶栏：方案选择 + 视图切换（~60行）
│   ├── LeftPanel.tsx               # 左侧：楼层导航 + 图层 + 缩略图（~100行）
│   ├── RightPanel.tsx              # 右侧：统计 + 建造清单 + 图例（~120行）
│   ├── MachineTooltip.tsx          # 悬停提示（~50行）
│   ├── MachineDetail.tsx           # 机器详情弹窗（~80行）
│   └── BottomBar.tsx               # 底部状态栏（~30行）
├── store/
│   └── useAppStore.ts              # Zustand store（~120行）
├── App.tsx                         # 顶层布局（~60行）
├── main.tsx                        # 入口（不变）
└── styles/
    └── theme.css                   # 暗色主题 CSS（~300行）

data/
└── schemes/
    └── iron-full-line-v1.json      # 迁移自现有 factory.ts 的第一个方案

src/__tests__/
├── coordinate.test.ts              # 坐标系统单测
├── registry.test.ts                # 注册表单测
└── schema.test.ts                  # 验证逻辑单测
```

### 删除文件

```
src/components/Header.tsx
src/components/FloorView.tsx
src/components/Sidebar.tsx
src/components/MachineDetail.tsx     # 替换为 src/ui/MachineDetail.tsx
src/components/MachineTooltip.tsx    # 替换为 src/ui/MachineTooltip.tsx
src/data/factory.ts                 # 替换为 core/ + data/schemes/*.json
```

---

## Task 1: 项目脚手架 — 安装依赖、清理旧代码、建立目录

**Files:**
- Modify: `package.json`
- Modify: `tsconfig.app.json`
- Modify: `vite.config.ts`
- Create: `src/core/` `src/renderers/` `src/views/` `src/ui/` `src/store/` `src/__tests__/` `data/schemes/`
- Delete: `src/components/` `src/data/`

- [ ] **Step 1: 安装新依赖**

```bash
npm install zustand
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 2: 配置 Vitest**

在 `vite.config.ts` 中添加 test 配置：

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
```

在 `tsconfig.app.json` 的 `include` 中添加 `"src/__tests__"`。

在 `package.json` 的 `scripts` 中添加：

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: 创建新目录结构**

```bash
mkdir -p src/core src/renderers src/views src/ui src/store src/__tests__ data/schemes
```

- [ ] **Step 4: 备份旧文件后清理**

将旧的 `src/components/` 和 `src/data/factory.ts` 中的数据保留为参考（后续 Task 迁移数据时需要读取），但从 `src/App.tsx` 和 `src/main.tsx` 断开引用：

临时替换 `src/App.tsx`：

```tsx
export default function App() {
  return (
    <div style={{ background: '#0f1419', color: '#e0e8f0', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <h1>Factory Plan — Rebuilding...</h1>
    </div>
  );
}
```

- [ ] **Step 5: 验证项目启动**

```bash
npm run dev
```

预期：浏览器显示 "Factory Plan — Rebuilding..." 暗色页面，无编译错误。

- [ ] **Step 6: 提交**

```bash
git add -A
git commit -m "chore: scaffold new project structure, install zustand + vitest"
```

---

## Task 2: 核心类型定义（core/types.ts）

**Files:**
- Create: `src/core/types.ts`

- [ ] **Step 1: 编写完整类型定义**

```typescript
// src/core/types.ts

// ===== 坐标与尺寸 =====

export interface Dimensions {
  width: number;
  length: number;
  height: number;
}

export interface GridPos {
  col: number;
  row: number;
}

export type Facing = 'north' | 'south' | 'east' | 'west';

// ===== 端口 =====

export type PortKind = 'belt-in' | 'belt-out' | 'pipe-in' | 'pipe-out' | 'power';
export type PortSide = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';

export interface PortDef {
  id: string;
  kind: PortKind;
  side: PortSide;
  offsetAlongEdge: number;
  heightM: number;
  direction: 'outward';
}

// ===== 建筑类型 =====

export type BuildingCategory = 'production' | 'logistics' | 'storage' | 'power' | 'structure';

export type PlaceableType =
  | 'smelter' | 'foundry' | 'constructor' | 'assembler' | 'manufacturer'
  | 'splitter' | 'merger'
  | 'storage' | 'industrial-storage';

export type PowerType =
  | 'wall-outlet-mk1' | 'wall-outlet-mk2' | 'wall-outlet-mk3'
  | 'double-wall-outlet-mk1' | 'double-wall-outlet-mk2' | 'double-wall-outlet-mk3'
  | 'power-pole-mk1' | 'power-pole-mk2' | 'power-pole-mk3';

export type StructureType =
  | 'wall-conveyor-hole' | 'wall-pipe-hole'
  | 'conveyor-wall-mount' | 'conveyor-ceiling-mount' | 'conveyor-floor-stand';

export type BuildingType = PlaceableType | PowerType | StructureType | 'conveyor-lift';

// ===== 建筑元数据 =====

export interface BuildingMetadata {
  type: BuildingType;
  category: BuildingCategory;
  displayName: string;
  dimensions: Dimensions;
  clearanceHeight: number;
  ports: PortDef[];
  color: string;
  powerUsage: number;
  stackable: boolean;
  wallMounted: boolean;
}

// ===== 方案数据实例 =====

export type BeltMark = 1 | 2 | 3 | 4 | 5 | 6;

export interface MachineInstance {
  id: string;
  type: PlaceableType;
  pos: GridPos;
  facing: Facing;
  floor: number;
  recipe?: string;
  clockSpeed?: number;
  label?: string;
}

export interface BeltSegment {
  id: string;
  floor: number;
  mark: BeltMark;
  material: string;
  path: GridPos[];
  fromPort?: string;
  toPort?: string;
}

export interface Lift {
  id: string;
  pos: GridPos;
  mark: BeltMark;
  fromFloor: number;
  toFloor: number;
  material: string;
  connectedBelts?: [string, string];
}

export interface PowerPole {
  id: string;
  type: PowerType;
  pos: GridPos;
  floor: number;
  wallSide?: Facing;
}

export interface PowerConnection {
  from: string;
  to: string;
}

export interface StructureInstance {
  id: string;
  type: StructureType;
  pos: GridPos;
  floor: number;
  wallSide?: Facing;
  heightM?: number;
}

export interface Zone {
  id: string;
  floor: number;
  pos: GridPos;
  size: { w: number; h: number };
  kind: string;
  label: string;
  color?: string;
}

export interface Floor {
  id: number;
  label: string;
  heightM: number;
  gridSize: { cols: number; rows: number };
}

export interface DesignPrinciples {
  preferWallOutlets: boolean;
  preferWallHoles: boolean;
  preferCeilingMounts: boolean;
  keepFloorClear: boolean;
}

// ===== 方案顶层结构 =====

export interface Scheme {
  id: string;
  name: string;
  version: string;
  category: string;
  description: string;
  designPrinciples: DesignPrinciples;
  floors: Floor[];
  machines: MachineInstance[];
  belts: BeltSegment[];
  lifts: Lift[];
  power: {
    poles: PowerPole[];
    connections: PowerConnection[];
  };
  structures: StructureInstance[];
  zones: Zone[];
  stats: {
    totalPowerMW: number;
    inputs: { material: string; rate: number }[];
    outputs: { material: string; rate: number }[];
  };
}

// ===== 方案索引（轻量元数据） =====

export interface SchemeIndex {
  id: string;
  name: string;
  category: string;
  description: string;
  floorCount: number;
  filePath: string;
}

// ===== 视图状态 =====

export type ViewMode = 'single' | 'linked' | 'section';

export interface Viewport {
  zoom: number;
  panX: number;
  panY: number;
}

export interface SectionCut {
  axis: 'col' | 'row';
  position: number;
}

export interface Layers {
  belts: boolean;
  power: boolean;
  zones: boolean;
  structures: boolean;
  storage: boolean;
}
```

- [ ] **Step 2: 验证类型编译**

```bash
npx tsc --noEmit
```

预期：无错误。

- [ ] **Step 3: 提交**

```bash
git add src/core/types.ts
git commit -m "feat: add core type definitions for scheme data model"
```

---

## Task 3: 坐标系统（core/coordinate.ts）+ 测试

**Files:**
- Create: `src/core/coordinate.ts`
- Create: `src/__tests__/coordinate.test.ts`

- [ ] **Step 1: 编写坐标系统测试**

```typescript
// src/__tests__/coordinate.test.ts
import { describe, it, expect } from 'vitest';
import {
  GRID_PX, METERS_PER_GRID, PAD,
  gridToSvg, svgToGrid, gridToMeters,
  metersToGrid, resolvePortPosition,
} from '../core/coordinate';

describe('coordinate', () => {
  describe('gridToSvg', () => {
    it('converts grid origin to padded SVG position', () => {
      const { x, y } = gridToSvg(0, 0);
      expect(x).toBe(PAD);
      expect(y).toBe(PAD);
    });

    it('converts grid (1,1) to correct SVG position', () => {
      const { x, y } = gridToSvg(1, 1);
      expect(x).toBe(PAD + GRID_PX);
      expect(y).toBe(PAD + GRID_PX);
    });

    it('handles fractional grid positions', () => {
      const { x, y } = gridToSvg(0.5, 0.5);
      expect(x).toBe(PAD + GRID_PX * 0.5);
      expect(y).toBe(PAD + GRID_PX * 0.5);
    });
  });

  describe('svgToGrid', () => {
    it('is the inverse of gridToSvg', () => {
      const { col, row } = svgToGrid(PAD + GRID_PX * 3, PAD + GRID_PX * 5);
      expect(col).toBeCloseTo(3);
      expect(row).toBeCloseTo(5);
    });
  });

  describe('gridToMeters', () => {
    it('converts grid units to game meters', () => {
      const { x, y } = gridToMeters(2, 3);
      expect(x).toBe(16);
      expect(y).toBe(24);
    });
  });

  describe('metersToGrid', () => {
    it('converts game meters to grid units', () => {
      const { col, row } = metersToGrid(16, 24);
      expect(col).toBe(2);
      expect(row).toBe(3);
    });
  });

  describe('resolvePortPosition', () => {
    it('computes port SVG position for south-facing machine', () => {
      // smelter: 6m wide, 9m long, port at back center (offset 3m)
      const pos = resolvePortPosition(
        { col: 1, row: 1 },           // machine grid pos
        'south',                        // facing
        { width: 6, length: 9, height: 9 }, // dimensions
        { id: 'in-0', kind: 'belt-in', side: 'back', offsetAlongEdge: 3, heightM: 1, direction: 'outward' as const },
      );
      // south: back=top, so port is at top edge of machine
      // machine SVG x = PAD + 1*GRID_PX, machine width in px = 6/8 * GRID_PX
      // port x = machine_x + offset_along_edge_in_px = machine_x + 3/8 * GRID_PX
      // port y = machine_y (top edge, since back=top when facing south)
      expect(pos.x).toBeCloseTo(PAD + 1 * GRID_PX + (3 / METERS_PER_GRID) * GRID_PX);
      expect(pos.y).toBeCloseTo(PAD + 1 * GRID_PX);
    });

    it('rotates ports correctly for east-facing machine', () => {
      // east: back=left, front=right, left=bottom, right=top
      // smelter back port offset=3m along back edge
      // when facing east, width(6m) maps to row-axis, length(9m) maps to col-axis
      const pos = resolvePortPosition(
        { col: 2, row: 2 },
        'east',
        { width: 6, length: 9, height: 9 },
        { id: 'in-0', kind: 'belt-in', side: 'back', offsetAlongEdge: 3, heightM: 1, direction: 'outward' as const },
      );
      // east: back=left edge. Machine width in col direction = length/8 = 9/8
      // port x = machine_x (left edge)
      // port y = machine_y + offset_along_edge / 8 * GRID_PX
      expect(pos.x).toBeCloseTo(PAD + 2 * GRID_PX);
      expect(pos.y).toBeCloseTo(PAD + 2 * GRID_PX + (3 / METERS_PER_GRID) * GRID_PX);
    });
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

```bash
npx vitest run src/__tests__/coordinate.test.ts
```

预期：FAIL — 模块不存在。

- [ ] **Step 3: 实现坐标系统**

```typescript
// src/core/coordinate.ts
import type { Dimensions, Facing, GridPos, PortDef } from './types';

export const GRID_PX = 80;
export const METERS_PER_GRID = 8;
export const PAD = 40;

export function gridToSvg(col: number, row: number): { x: number; y: number } {
  return { x: PAD + col * GRID_PX, y: PAD + row * GRID_PX };
}

export function svgToGrid(x: number, y: number): { col: number; row: number } {
  return { col: (x - PAD) / GRID_PX, row: (y - PAD) / GRID_PX };
}

export function gridToMeters(col: number, row: number): { x: number; y: number } {
  return { x: col * METERS_PER_GRID, y: row * METERS_PER_GRID };
}

export function metersToGrid(mx: number, my: number): { col: number; row: number } {
  return { col: mx / METERS_PER_GRID, row: my / METERS_PER_GRID };
}

/** 米制尺寸 → 网格尺寸 */
export function metersToGridSize(m: number): number {
  return m / METERS_PER_GRID;
}

/**
 * 获取机器在网格中的宽高（考虑朝向旋转）。
 * south/north: width→col方向, length→row方向
 * east/west:   length→col方向, width→row方向
 */
export function machineGridSize(dim: Dimensions, facing: Facing): { cols: number; rows: number } {
  const w = metersToGridSize(dim.width);
  const l = metersToGridSize(dim.length);
  if (facing === 'south' || facing === 'north') return { cols: w, rows: l };
  return { cols: l, rows: w };
}

/**
 * 将端口的逻辑 side（front/back/left/right）映射为屏幕方向。
 * 屏幕方向：top/bottom/left/right（相对于 SVG 坐标系，Y 轴向下）。
 *
 * facing=south（默认）时：front=下(bottom), back=上(top), left=右(right), right=左(left)
 */
const SIDE_MAP: Record<Facing, Record<string, 'top' | 'bottom' | 'left' | 'right'>> = {
  south: { front: 'bottom', back: 'top', left: 'right', right: 'left' },
  north: { front: 'top', back: 'bottom', left: 'left', right: 'right' },
  east:  { front: 'right', back: 'left', left: 'bottom', right: 'top' },
  west:  { front: 'left', back: 'right', left: 'top', right: 'bottom' },
};

/**
 * 计算端口在 SVG 坐标系中的绝对位置。
 */
export function resolvePortPosition(
  machinePos: GridPos,
  facing: Facing,
  dimensions: Dimensions,
  port: PortDef,
): { x: number; y: number } {
  const { cols, rows } = machineGridSize(dimensions, facing);
  const { x: mx, y: my } = gridToSvg(machinePos.col, machinePos.row);
  const wPx = cols * GRID_PX;
  const hPx = rows * GRID_PX;

  const screenSide = SIDE_MAP[facing][port.side];
  const offsetPx = (port.offsetAlongEdge / METERS_PER_GRID) * GRID_PX;

  switch (screenSide) {
    case 'top':    return { x: mx + offsetPx, y: my };
    case 'bottom': return { x: mx + offsetPx, y: my + hPx };
    case 'left':   return { x: mx,            y: my + offsetPx };
    case 'right':  return { x: mx + wPx,      y: my + offsetPx };
  }
}

/**
 * 计算画布所需的 SVG viewBox 尺寸。
 */
export function calcViewBox(cols: number, rows: number): string {
  const w = cols * GRID_PX + PAD * 2;
  const h = rows * GRID_PX + PAD * 2;
  return `0 0 ${w} ${h}`;
}
```

- [ ] **Step 4: 运行测试验证通过**

```bash
npx vitest run src/__tests__/coordinate.test.ts
```

预期：全部 PASS。

- [ ] **Step 5: 提交**

```bash
git add src/core/coordinate.ts src/__tests__/coordinate.test.ts
git commit -m "feat: add coordinate system with grid/SVG/meters conversions"
```

---

## Task 4: 建筑注册表（core/registry.ts）+ 测试

**Files:**
- Create: `src/core/registry.ts`
- Create: `src/__tests__/registry.test.ts`

- [ ] **Step 1: 编写注册表测试**

```typescript
// src/__tests__/registry.test.ts
import { describe, it, expect } from 'vitest';
import { BUILDING_REGISTRY, MATERIAL_COLORS, getBuildingMeta } from '../core/registry';

describe('registry', () => {
  it('has metadata for all production machines', () => {
    const types = ['smelter', 'foundry', 'constructor', 'assembler', 'manufacturer'];
    for (const t of types) {
      const meta = getBuildingMeta(t as any);
      expect(meta).toBeDefined();
      expect(meta.dimensions.width).toBeGreaterThan(0);
      expect(meta.ports.length).toBeGreaterThan(0);
    }
  });

  it('manufacturer has inputs on front (unique)', () => {
    const meta = getBuildingMeta('manufacturer');
    const inputPorts = meta.ports.filter(p => p.kind === 'belt-in');
    expect(inputPorts.every(p => p.side === 'front')).toBe(true);
  });

  it('all other production machines have inputs on back', () => {
    const types = ['smelter', 'foundry', 'constructor', 'assembler'] as const;
    for (const t of types) {
      const meta = getBuildingMeta(t);
      const inputPorts = meta.ports.filter(p => p.kind === 'belt-in');
      expect(inputPorts.every(p => p.side === 'back')).toBe(true);
    }
  });

  it('has material colors for iron chain products', () => {
    expect(MATERIAL_COLORS['铁矿石']).toBeDefined();
    expect(MATERIAL_COLORS['铁锭']).toBeDefined();
    expect(MATERIAL_COLORS['铁板']).toBeDefined();
    expect(MATERIAL_COLORS['铁棒']).toBeDefined();
    expect(MATERIAL_COLORS['螺丝']).toBeDefined();
  });

  it('has material colors for copper chain products', () => {
    expect(MATERIAL_COLORS['铜矿石']).toBeDefined();
    expect(MATERIAL_COLORS['铜锭']).toBeDefined();
    expect(MATERIAL_COLORS['电线']).toBeDefined();
    expect(MATERIAL_COLORS['线缆']).toBeDefined();
  });

  it('smelter dimensions match wiki data (6x9x9)', () => {
    const meta = getBuildingMeta('smelter');
    expect(meta.dimensions).toEqual({ width: 6, length: 9, height: 9 });
  });

  it('assembler has 2 belt inputs and 1 belt output', () => {
    const meta = getBuildingMeta('assembler');
    expect(meta.ports.filter(p => p.kind === 'belt-in').length).toBe(2);
    expect(meta.ports.filter(p => p.kind === 'belt-out').length).toBe(1);
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

```bash
npx vitest run src/__tests__/registry.test.ts
```

预期：FAIL。

- [ ] **Step 3: 实现注册表**

```typescript
// src/core/registry.ts
import type { BuildingMetadata, BuildingType, PortDef } from './types';

function port(id: string, kind: PortDef['kind'], side: PortDef['side'], offset: number, height = 1): PortDef {
  return { id, kind, side, offsetAlongEdge: offset, heightM: height, direction: 'outward' };
}

export const BUILDING_REGISTRY: Record<string, BuildingMetadata> = {
  // === 生产机器 ===
  smelter: {
    type: 'smelter', category: 'production', displayName: '冶炼炉',
    dimensions: { width: 6, length: 9, height: 9 }, clearanceHeight: 9,
    ports: [
      port('in-0', 'belt-in', 'back', 3),
      port('out-0', 'belt-out', 'front', 3),
    ],
    color: '--smelter', powerUsage: 4, stackable: false, wallMounted: false,
  },
  foundry: {
    type: 'foundry', category: 'production', displayName: '铸造厂',
    dimensions: { width: 10, length: 9, height: 9 }, clearanceHeight: 9,
    ports: [
      port('in-0', 'belt-in', 'back', 3),
      port('in-1', 'belt-in', 'back', 7),
      port('out-0', 'belt-out', 'front', 5),
    ],
    color: '--foundry', powerUsage: 16, stackable: false, wallMounted: false,
  },
  constructor: {
    type: 'constructor', category: 'production', displayName: '建造机',
    dimensions: { width: 8, length: 10, height: 8 }, clearanceHeight: 8,
    ports: [
      port('in-0', 'belt-in', 'back', 4),
      port('out-0', 'belt-out', 'front', 4),
    ],
    color: '--constructor', powerUsage: 4, stackable: false, wallMounted: false,
  },
  assembler: {
    type: 'assembler', category: 'production', displayName: '组装机',
    dimensions: { width: 10, length: 15, height: 10 }, clearanceHeight: 10,
    ports: [
      port('in-0', 'belt-in', 'back', 3),
      port('in-1', 'belt-in', 'back', 7),
      port('out-0', 'belt-out', 'front', 5),
    ],
    color: '--assembler', powerUsage: 15, stackable: false, wallMounted: false,
  },
  manufacturer: {
    type: 'manufacturer', category: 'production', displayName: '制造机',
    dimensions: { width: 18, length: 20, height: 12 }, clearanceHeight: 8,
    ports: [
      port('in-0', 'belt-in', 'front', 3),
      port('in-1', 'belt-in', 'front', 7),
      port('in-2', 'belt-in', 'front', 11),
      port('in-3', 'belt-in', 'front', 15),
      port('out-0', 'belt-out', 'back', 9),
    ],
    color: '--manufacturer', powerUsage: 55, stackable: false, wallMounted: false,
  },

  // === 物流 ===
  splitter: {
    type: 'splitter', category: 'logistics', displayName: '分流器',
    dimensions: { width: 4, length: 4, height: 3 }, clearanceHeight: 3,
    ports: [
      port('in-0', 'belt-in', 'back', 2),
      port('out-0', 'belt-out', 'front', 2),
      port('out-1', 'belt-out', 'left', 2),
      port('out-2', 'belt-out', 'right', 2),
    ],
    color: '--splitter', powerUsage: 0, stackable: true, wallMounted: false,
  },
  merger: {
    type: 'merger', category: 'logistics', displayName: '合流器',
    dimensions: { width: 4, length: 4, height: 3 }, clearanceHeight: 3,
    ports: [
      port('in-0', 'belt-in', 'back', 2),
      port('in-1', 'belt-in', 'left', 2),
      port('in-2', 'belt-in', 'right', 2),
      port('out-0', 'belt-out', 'front', 2),
    ],
    color: '--merger', powerUsage: 0, stackable: true, wallMounted: false,
  },
  'conveyor-lift': {
    type: 'conveyor-lift', category: 'logistics', displayName: '传送带升降机',
    dimensions: { width: 2, length: 2, height: 7 }, clearanceHeight: 7,
    ports: [
      port('bottom', 'belt-in', 'bottom', 1, 0),
      port('top', 'belt-out', 'top', 1, 7),
    ],
    color: '--lift', powerUsage: 0, stackable: false, wallMounted: false,
  },

  // === 存储 ===
  storage: {
    type: 'storage', category: 'storage', displayName: '储存箱',
    dimensions: { width: 5, length: 10, height: 4 }, clearanceHeight: 4,
    ports: [
      port('in-0', 'belt-in', 'back', 2.5),
      port('out-0', 'belt-out', 'front', 2.5),
    ],
    color: '--storage', powerUsage: 0, stackable: true, wallMounted: false,
  },
  'industrial-storage': {
    type: 'industrial-storage', category: 'storage', displayName: '工业储存箱',
    dimensions: { width: 5, length: 10, height: 8 }, clearanceHeight: 8,
    ports: [
      port('in-0', 'belt-in', 'back', 1.5),
      port('in-1', 'belt-in', 'back', 3.5),
      port('out-0', 'belt-out', 'front', 1.5),
      port('out-1', 'belt-out', 'front', 3.5),
    ],
    color: '--industrial-storage', powerUsage: 0, stackable: true, wallMounted: false,
  },

  // === 电力 ===
  'wall-outlet-mk1': {
    type: 'wall-outlet-mk1', category: 'power', displayName: '墙壁电源 Mk.1',
    dimensions: { width: 1, length: 0.5, height: 1 }, clearanceHeight: 1,
    ports: [port('pwr-0', 'power', 'front', 0.5, 0.5)],
    color: '--power', powerUsage: 0, stackable: false, wallMounted: true,
  },
  'wall-outlet-mk2': {
    type: 'wall-outlet-mk2', category: 'power', displayName: '墙壁电源 Mk.2',
    dimensions: { width: 1, length: 0.5, height: 1 }, clearanceHeight: 1,
    ports: [port('pwr-0', 'power', 'front', 0.5, 0.5)],
    color: '--power', powerUsage: 0, stackable: false, wallMounted: true,
  },
  'wall-outlet-mk3': {
    type: 'wall-outlet-mk3', category: 'power', displayName: '墙壁电源 Mk.3',
    dimensions: { width: 1, length: 0.5, height: 1 }, clearanceHeight: 1,
    ports: [port('pwr-0', 'power', 'front', 0.5, 0.5)],
    color: '--power', powerUsage: 0, stackable: false, wallMounted: true,
  },
  'power-pole-mk1': {
    type: 'power-pole-mk1', category: 'power', displayName: '电线杆 Mk.1',
    dimensions: { width: 0.8, length: 0.8, height: 7 }, clearanceHeight: 7,
    ports: [port('pwr-0', 'power', 'top', 0.4, 7)],
    color: '--power', powerUsage: 0, stackable: false, wallMounted: false,
  },

  // === 结构件 ===
  'wall-conveyor-hole': {
    type: 'wall-conveyor-hole', category: 'structure', displayName: '墙壁传送带孔',
    dimensions: { width: 4, length: 1, height: 2 }, clearanceHeight: 2,
    ports: [
      port('in-0', 'belt-in', 'back', 2, 1),
      port('out-0', 'belt-out', 'front', 2, 1),
    ],
    color: '--structure', powerUsage: 0, stackable: false, wallMounted: true,
  },
  'conveyor-ceiling-mount': {
    type: 'conveyor-ceiling-mount', category: 'structure', displayName: '吊顶传送带支架',
    dimensions: { width: 2, length: 2, height: 1 }, clearanceHeight: 1,
    ports: [],
    color: '--structure', powerUsage: 0, stackable: false, wallMounted: true,
  },
  'conveyor-wall-mount': {
    type: 'conveyor-wall-mount', category: 'structure', displayName: '挂墙传送带支架',
    dimensions: { width: 2, length: 1, height: 2 }, clearanceHeight: 2,
    ports: [],
    color: '--structure', powerUsage: 0, stackable: false, wallMounted: true,
  },
};

export function getBuildingMeta(type: BuildingType): BuildingMetadata {
  const meta = BUILDING_REGISTRY[type];
  if (!meta) throw new Error(`Unknown building type: ${type}`);
  return meta;
}

/** 物料 → 颜色映射（传送带着色用） */
export const MATERIAL_COLORS: Record<string, string> = {
  '铁矿石': 'var(--mat-iron-ore)',
  '铁锭': 'var(--mat-iron-ingot)',
  '铁板': 'var(--mat-iron-plate)',
  '铁棒': 'var(--mat-iron-rod)',
  '螺丝': 'var(--mat-screw)',
  '铜矿石': 'var(--mat-copper-ore)',
  '铜锭': 'var(--mat-copper-ingot)',
  '电线': 'var(--mat-wire)',
  '线缆': 'var(--mat-cable)',
  '铜板': 'var(--mat-copper-sheet)',
  '石灰石': 'var(--mat-limestone)',
  '混凝土': 'var(--mat-concrete)',
  '强化铁板': 'var(--mat-reinforced-plate)',
  '转子': 'var(--mat-rotor)',
  '模块化框架': 'var(--mat-modular-frame)',
};

/** 物料颜色回退值（CSS 变量无法解析时用于 SVG 直接着色） */
export const MATERIAL_RAW_COLORS: Record<string, string> = {
  '铁矿石': '#a0782c',
  '铁锭': '#ff6b35',
  '铁板': '#00bcd4',
  '铁棒': '#448aff',
  '螺丝': '#66bb6a',
  '铜矿石': '#e67333',
  '铜锭': '#ff7043',
  '电线': '#ef5350',
  '线缆': '#c62828',
  '铜板': '#ff8a65',
  '石灰石': '#bdbdbd',
  '混凝土': '#9e9e9e',
  '强化铁板': '#00838f',
  '转子': '#7c4dff',
  '模块化框架': '#aa00ff',
};

/** 获取物料颜色原始值（用于 SVG fill/stroke） */
export function getMaterialColor(material: string): string {
  return MATERIAL_RAW_COLORS[material] ?? '#888888';
}
```

- [ ] **Step 4: 运行测试验证通过**

```bash
npx vitest run src/__tests__/registry.test.ts
```

预期：全部 PASS。

- [ ] **Step 5: 提交**

```bash
git add src/core/registry.ts src/__tests__/registry.test.ts
git commit -m "feat: add building registry with wiki-calibrated dimensions and ports"
```

---

## Task 5: 暗色主题 CSS（styles/theme.css）

**Files:**
- Create: `src/styles/theme.css`（覆盖旧文件）

- [ ] **Step 1: 编写完整主题文件**

```css
/* src/styles/theme.css */

/* ===== Reset ===== */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ===== CSS 变量 ===== */
:root {
  /* 基础色板 */
  --bg-primary: #0f1419;
  --bg-secondary: #1a2332;
  --bg-canvas: #0a0e14;
  --bg-hover: #243044;
  --border: #2a3a4e;
  --border-subtle: #1e2d3d;

  --text-primary: #e0e8f0;
  --text-secondary: #7eb8da;
  --text-muted: #556677;

  /* 机器颜色 */
  --smelter: #ff6b35;
  --foundry: #ff8f00;
  --constructor: #00bcd4;
  --assembler: #ce93d8;
  --manufacturer: #ef5350;
  --storage: #8d6e63;
  --industrial-storage: #a1887f;
  --splitter: #ffd740;
  --merger: #69f0ae;
  --lift: #66bb6a;

  /* 物料颜色 */
  --mat-iron-ore: #a0782c;
  --mat-iron-ingot: #ff6b35;
  --mat-iron-plate: #00bcd4;
  --mat-iron-rod: #448aff;
  --mat-screw: #66bb6a;
  --mat-copper-ore: #e67333;
  --mat-copper-ingot: #ff7043;
  --mat-wire: #ef5350;
  --mat-cable: #c62828;
  --mat-copper-sheet: #ff8a65;
  --mat-limestone: #bdbdbd;
  --mat-concrete: #9e9e9e;
  --mat-reinforced-plate: #00838f;
  --mat-rotor: #7c4dff;
  --mat-modular-frame: #aa00ff;

  /* 功能色 */
  --power: #ffd740;
  --structure: #78909c;
  --walkable: #1b5e20;
  --highlight: rgba(255,255,255,0.2);
  --dimmed-opacity: 0.25;

  /* 布局 */
  --topbar-h: 48px;
  --bottombar-h: 28px;
  --left-panel-w: 200px;
  --right-panel-w: 240px;

  /* 字体 */
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

body {
  font-family: var(--font-sans);
  background: var(--bg-primary);
  color: var(--text-primary);
  overflow: hidden;
}

/* ===== 布局 ===== */
.app-layout {
  display: grid;
  grid-template-rows: var(--topbar-h) 1fr var(--bottombar-h);
  grid-template-columns: var(--left-panel-w) 1fr var(--right-panel-w);
  grid-template-areas:
    "topbar topbar topbar"
    "left   canvas right"
    "bottom bottom bottom";
  height: 100vh;
  width: 100vw;
}

.topbar { grid-area: topbar; }
.left-panel { grid-area: left; }
.canvas-area { grid-area: canvas; }
.right-panel { grid-area: right; }
.bottombar { grid-area: bottom; }

/* ===== TopBar ===== */
.topbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  z-index: 10;
}

.topbar-title {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

.scheme-select {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 4px 12px;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  outline: none;
}
.scheme-select:hover { border-color: var(--text-muted); }
.scheme-select:focus { border-color: var(--text-secondary); }

.view-mode-group {
  display: flex;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
}

.view-mode-btn {
  padding: 4px 12px;
  font-size: 12px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s;
}
.view-mode-btn:hover { color: var(--text-secondary); background: var(--bg-hover); }
.view-mode-btn.active { color: var(--text-primary); background: var(--bg-hover); }

/* ===== Side Panels ===== */
.left-panel, .right-panel {
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  overflow-y: auto;
  padding: 12px;
}
.right-panel {
  border-right: none;
  border-left: 1px solid var(--border);
}

.panel-section {
  margin-bottom: 16px;
}

.panel-section-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  margin-bottom: 8px;
}

/* ===== Floor Nav ===== */
.floor-nav { display: flex; flex-direction: column; gap: 4px; }

.floor-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--text-muted);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
}
.floor-btn:hover { background: var(--bg-hover); color: var(--text-secondary); }
.floor-btn.active {
  background: var(--bg-hover);
  border-color: var(--border);
  color: var(--text-primary);
}

.floor-indicator {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--text-muted);
}
.floor-btn.active .floor-indicator { background: var(--text-secondary); }

/* ===== Layer Toggles ===== */
.layer-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  cursor: pointer;
  font-size: 13px;
  color: var(--text-secondary);
}

.layer-toggle input[type="checkbox"] {
  accent-color: var(--text-secondary);
}

.layer-color-dot {
  width: 10px; height: 10px;
  border-radius: 2px;
}

/* ===== Canvas ===== */
.canvas-area {
  background: var(--bg-canvas);
  overflow: hidden;
  position: relative;
}

.canvas-area svg {
  display: block;
  width: 100%;
  height: 100%;
}

/* ===== SVG 元素 ===== */
.grid-line { stroke: var(--border-subtle); stroke-width: 0.5; }
.grid-line-sub { stroke: var(--border-subtle); stroke-width: 0.25; opacity: 0.5; }
.grid-label { fill: var(--text-muted); font-size: 10px; font-family: var(--font-mono); }

.zone-rect { stroke-width: 0.8; stroke-dasharray: 4 2; fill-opacity: 0.03; }
.zone-label { font-size: 10px; fill-opacity: 0.4; }

.machine-footprint {
  stroke-dasharray: 3 2;
  stroke-width: 0.8;
  fill: none;
  cursor: pointer;
}

.machine-body {
  stroke-width: 1;
  fill-opacity: 0.15;
  cursor: pointer;
  transition: filter 0.15s;
}
.machine-body:hover { filter: brightness(1.3); }

.machine-label {
  fill: var(--text-primary);
  font-size: 9px;
  font-family: var(--font-mono);
  pointer-events: none;
}

.machine-sublabel {
  font-size: 7px;
  fill: var(--text-muted);
  font-family: var(--font-mono);
  pointer-events: none;
}

.port-dot {
  r: 2.5;
  fill: var(--bg-canvas);
  stroke-width: 1;
  opacity: 0;
  transition: opacity 0.15s;
}
.machine-group:hover .port-dot { opacity: 1; }

/* ===== 传送带 ===== */
.belt-line {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.belt-mk1 { stroke-width: 1.5; animation: beltFlow 2.0s linear infinite; }
.belt-mk2 { stroke-width: 1.8; animation: beltFlow 1.5s linear infinite; }
.belt-mk3 { stroke-width: 2.0; animation: beltFlow 1.0s linear infinite; }
.belt-mk4 { stroke-width: 2.2; animation: beltFlow 0.7s linear infinite; }
.belt-mk5 { stroke-width: 2.5; animation: beltFlow 0.5s linear infinite; }
.belt-mk6 { stroke-width: 2.8; animation: beltFlow 0.3s linear infinite; }

.belt-label {
  font-size: 7px;
  font-family: var(--font-mono);
  pointer-events: none;
}

.belt-arrow {
  fill: currentColor;
  pointer-events: none;
}

/* ===== 电力 ===== */
.power-line {
  stroke: var(--power);
  stroke-width: 0.8;
  stroke-dasharray: 3 3;
  animation: powerPulse 2s linear infinite;
  opacity: 0.6;
}

.power-pole-marker {
  fill: var(--bg-canvas);
  stroke: var(--power);
  stroke-width: 1;
}

.power-label {
  font-size: 7px;
  fill: var(--power);
  font-family: var(--font-mono);
}

/* ===== 升降机 ===== */
.lift-box {
  stroke-dasharray: 3 2;
  stroke-width: 1;
  fill-opacity: 0.1;
}

.lift-label {
  font-size: 7px;
  font-family: var(--font-mono);
}

/* ===== 结构件 ===== */
.structure-marker {
  stroke: var(--structure);
  stroke-width: 1;
  fill: var(--structure);
  fill-opacity: 0.15;
}

/* ===== 交互状态 ===== */
.element-highlight {
  filter: brightness(1.5) drop-shadow(0 0 4px currentColor);
}

.element-dimmed {
  opacity: var(--dimmed-opacity);
  transition: opacity 0.2s;
}

/* ===== Tooltip ===== */
.tooltip {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 12px;
  color: var(--text-primary);
  pointer-events: none;
  z-index: 100;
  max-width: 280px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
}

.tooltip-title {
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 4px;
}

.tooltip-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* ===== Detail Modal ===== */
dialog.machine-detail {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--text-primary);
  padding: 20px;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.6);
}

dialog.machine-detail::backdrop {
  background: rgba(0,0,0,0.5);
}

/* ===== BottomBar ===== */
.bottombar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 16px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text-muted);
}

/* ===== Stats Panel ===== */
.stat-bar {
  height: 6px;
  border-radius: 3px;
  background: var(--bg-primary);
  overflow: hidden;
  margin-top: 4px;
}

.stat-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.8;
}

.stat-value {
  font-family: var(--font-mono);
  font-size: 11px;
}

/* ===== Legend ===== */
.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.8;
}

.legend-swatch {
  width: 14px;
  height: 10px;
  border-radius: 2px;
}

/* ===== 动画 ===== */
@keyframes beltFlow {
  from { stroke-dashoffset: 16; }
  to { stroke-dashoffset: 0; }
}

@keyframes powerPulse {
  from { stroke-dashoffset: 12; }
  to { stroke-dashoffset: 0; }
}

@keyframes liftFlow {
  from { stroke-dashoffset: 0; }
  to { stroke-dashoffset: -20; }
}

/* ===== 响应式 ===== */
@media (max-width: 1400px) {
  :root {
    --left-panel-w: 48px;
  }
  .left-panel .panel-section-title,
  .left-panel .floor-btn span,
  .left-panel .layer-toggle span {
    display: none;
  }
}

@media (max-width: 900px) {
  .app-layout {
    grid-template-columns: 1fr;
    grid-template-rows: var(--topbar-h) 1fr var(--bottombar-h);
    grid-template-areas:
      "topbar"
      "canvas"
      "bottom";
  }
  .left-panel, .right-panel { display: none; }
}
```

- [ ] **Step 2: 验证 CSS 加载**

在 `src/main.tsx` 中确认 `import './styles/theme.css'` 存在。运行 `npm run dev`，确认暗色背景生效。

- [ ] **Step 3: 提交**

```bash
git add src/styles/theme.css
git commit -m "feat: add dark theme CSS with full variable system and animations"
```

---

## Task 6: Zustand Store（store/useAppStore.ts）

**Files:**
- Create: `src/store/useAppStore.ts`

- [ ] **Step 1: 实现 store**

```typescript
// src/store/useAppStore.ts
import { create } from 'zustand';
import type {
  Scheme, SchemeIndex, ViewMode, Viewport, SectionCut, Layers,
} from '../core/types';

interface AppState {
  // 方案
  schemes: SchemeIndex[];
  currentSchemeId: string | null;
  currentScheme: Scheme | null;

  // 视图
  viewMode: ViewMode;
  currentFloor: number;
  sectionCut: SectionCut | null;

  // 视口
  viewport: Viewport;

  // 图层
  layers: Layers;

  // 交互
  hoveredId: string | null;
  selectedId: string | null;
  highlightChain: string[];

  // Actions
  setSchemes: (schemes: SchemeIndex[]) => void;
  loadScheme: (scheme: Scheme) => void;
  setViewMode: (mode: ViewMode) => void;
  setFloor: (floor: number) => void;
  setSectionCut: (cut: SectionCut | null) => void;
  setViewport: (vp: Partial<Viewport>) => void;
  resetViewport: () => void;
  toggleLayer: (key: keyof Layers) => void;
  hover: (id: string | null) => void;
  select: (id: string | null) => void;
  setHighlightChain: (ids: string[]) => void;
  clearHighlight: () => void;
}

const DEFAULT_VIEWPORT: Viewport = { zoom: 1, panX: 0, panY: 0 };

const DEFAULT_LAYERS: Layers = {
  belts: true,
  power: true,
  zones: true,
  structures: true,
  storage: true,
};

export const useAppStore = create<AppState>((set) => ({
  // 初始状态
  schemes: [],
  currentSchemeId: null,
  currentScheme: null,
  viewMode: 'single',
  currentFloor: 1,
  sectionCut: null,
  viewport: { ...DEFAULT_VIEWPORT },
  layers: { ...DEFAULT_LAYERS },
  hoveredId: null,
  selectedId: null,
  highlightChain: [],

  // Actions
  setSchemes: (schemes) => set({ schemes }),

  loadScheme: (scheme) => set({
    currentSchemeId: scheme.id,
    currentScheme: scheme,
    currentFloor: scheme.floors[0]?.id ?? 1,
    viewport: { ...DEFAULT_VIEWPORT },
    hoveredId: null,
    selectedId: null,
    highlightChain: [],
  }),

  setViewMode: (viewMode) => set({ viewMode }),

  setFloor: (currentFloor) => set({ currentFloor }),

  setSectionCut: (sectionCut) => set({ sectionCut }),

  setViewport: (vp) => set((s) => ({ viewport: { ...s.viewport, ...vp } })),

  resetViewport: () => set({ viewport: { ...DEFAULT_VIEWPORT } }),

  toggleLayer: (key) => set((s) => ({
    layers: { ...s.layers, [key]: !s.layers[key] },
  })),

  hover: (hoveredId) => set({ hoveredId }),

  select: (selectedId) => set({ selectedId }),

  setHighlightChain: (highlightChain) => set({ highlightChain }),

  clearHighlight: () => set({ highlightChain: [], selectedId: null }),
}));
```

- [ ] **Step 2: 验证类型编译**

```bash
npx tsc --noEmit
```

预期：无错误。

- [ ] **Step 3: 提交**

```bash
git add src/store/useAppStore.ts
git commit -m "feat: add Zustand store for app state management"
```

---

## Task 7: JSON Schema 验证 + 方案加载（core/schema.ts）+ 测试

**Files:**
- Create: `src/core/schema.ts`
- Create: `src/__tests__/schema.test.ts`

- [ ] **Step 1: 编写 schema 测试**

```typescript
// src/__tests__/schema.test.ts
import { describe, it, expect } from 'vitest';
import { validateScheme, buildSchemeIndex } from '../core/schema';
import type { Scheme } from '../core/types';

const MINIMAL_SCHEME: Scheme = {
  id: 'test-1',
  name: 'Test Scheme',
  version: '1.0.0',
  category: '测试',
  description: 'A test scheme',
  designPrinciples: {
    preferWallOutlets: true,
    preferWallHoles: true,
    preferCeilingMounts: false,
    keepFloorClear: true,
  },
  floors: [{ id: 1, label: '1F', heightM: 8, gridSize: { cols: 4, rows: 4 } }],
  machines: [
    { id: 's1', type: 'smelter', pos: { col: 1, row: 1 }, facing: 'south', floor: 1, recipe: '铁锭', label: 'S-1' },
  ],
  belts: [
    { id: 'b1', floor: 1, mark: 1, material: '铁锭', path: [{ col: 1, row: 2 }, { col: 3, row: 2 }], fromPort: 's1:out-0' },
  ],
  lifts: [],
  power: { poles: [], connections: [] },
  structures: [],
  zones: [],
  stats: { totalPowerMW: 4, inputs: [{ material: '铁矿石', rate: 30 }], outputs: [{ material: '铁锭', rate: 30 }] },
};

describe('schema', () => {
  it('validates a correct minimal scheme with no warnings', () => {
    const warnings = validateScheme(MINIMAL_SCHEME);
    expect(warnings).toHaveLength(0);
  });

  it('warns on unknown machine type', () => {
    const bad = { ...MINIMAL_SCHEME, machines: [{ ...MINIMAL_SCHEME.machines[0], type: 'unknown' as any }] };
    const warnings = validateScheme(bad);
    expect(warnings.some(w => w.includes('unknown'))).toBe(true);
  });

  it('warns on invalid floor reference', () => {
    const bad = { ...MINIMAL_SCHEME, machines: [{ ...MINIMAL_SCHEME.machines[0], floor: 99 }] };
    const warnings = validateScheme(bad);
    expect(warnings.some(w => w.includes('floor'))).toBe(true);
  });

  it('builds a correct scheme index', () => {
    const index = buildSchemeIndex(MINIMAL_SCHEME, '/data/schemes/test.json');
    expect(index.id).toBe('test-1');
    expect(index.name).toBe('Test Scheme');
    expect(index.floorCount).toBe(1);
    expect(index.filePath).toBe('/data/schemes/test.json');
  });
});
```

- [ ] **Step 2: 运行测试验证失败**

```bash
npx vitest run src/__tests__/schema.test.ts
```

- [ ] **Step 3: 实现 schema 模块**

```typescript
// src/core/schema.ts
import type { Scheme, SchemeIndex } from './types';
import { BUILDING_REGISTRY } from './registry';

/**
 * 验证方案数据，返回 warning 列表。不抛出错误，允许带警告加载。
 */
export function validateScheme(scheme: Scheme): string[] {
  const warnings: string[] = [];
  const floorIds = new Set(scheme.floors.map(f => f.id));

  // 验证机器
  for (const m of scheme.machines) {
    if (!BUILDING_REGISTRY[m.type]) {
      warnings.push(`Machine "${m.id}": unknown type "${m.type}"`);
    }
    if (!floorIds.has(m.floor)) {
      warnings.push(`Machine "${m.id}": references non-existent floor ${m.floor}`);
    }
  }

  // 验证传送带端口引用
  const machineIds = new Set(scheme.machines.map(m => m.id));
  for (const b of scheme.belts) {
    if (!floorIds.has(b.floor)) {
      warnings.push(`Belt "${b.id}": references non-existent floor ${b.floor}`);
    }
    if (b.fromPort) {
      const machineId = b.fromPort.split(':')[0];
      if (!machineIds.has(machineId)) {
        warnings.push(`Belt "${b.id}": fromPort references unknown machine "${machineId}"`);
      }
    }
    if (b.toPort) {
      const machineId = b.toPort.split(':')[0];
      if (!machineIds.has(machineId)) {
        warnings.push(`Belt "${b.id}": toPort references unknown machine "${machineId}"`);
      }
    }
  }

  // 验证升降机
  const beltIds = new Set(scheme.belts.map(b => b.id));
  for (const l of scheme.lifts) {
    if (!floorIds.has(l.fromFloor)) {
      warnings.push(`Lift "${l.id}": references non-existent fromFloor ${l.fromFloor}`);
    }
    if (!floorIds.has(l.toFloor)) {
      warnings.push(`Lift "${l.id}": references non-existent toFloor ${l.toFloor}`);
    }
    if (l.connectedBelts) {
      for (const bid of l.connectedBelts) {
        if (!beltIds.has(bid)) {
          warnings.push(`Lift "${l.id}": references unknown belt "${bid}"`);
        }
      }
    }
  }

  // 验证电力连接
  const allIds = new Set([...machineIds, ...scheme.power.poles.map(p => p.id)]);
  for (const c of scheme.power.connections) {
    if (!allIds.has(c.from)) {
      warnings.push(`Power connection: unknown source "${c.from}"`);
    }
    if (!allIds.has(c.to)) {
      warnings.push(`Power connection: unknown target "${c.to}"`);
    }
  }

  return warnings;
}

/**
 * 从完整方案数据构建轻量索引。
 */
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
```

- [ ] **Step 4: 运行测试验证通过**

```bash
npx vitest run src/__tests__/schema.test.ts
```

预期：全部 PASS。

- [ ] **Step 5: 提交**

```bash
git add src/core/schema.ts src/__tests__/schema.test.ts
git commit -m "feat: add JSON scheme validation and index builder"
```

---

## Task 8: 迁移现有数据为 JSON 方案文件

**Files:**
- Create: `data/schemes/iron-full-line-v1.json`
- 参考: `src/data/factory.ts`（旧文件，读取数据后可删除）

- [ ] **Step 1: 读取旧 factory.ts 数据并转换为 JSON 格式**

根据现有 `factory.ts` 中的 `MACHINES`、`BELTS`、`POLES` 等数据，手动转换为新的 `Scheme` JSON 格式。关键映射：

旧格式 → 新格式：
- `Machine.col/row` → `MachineInstance.pos: { col, row }`
- `Machine.type: 'smelter'|'plate'|'rod'|'screw'` → 统一为 `'smelter'|'constructor'`，具体产物由 `recipe` 字段区分
- `Machine.footprint/body` → 删除，由注册表 `dimensions` 自动计算
- `Machine.ports` → 删除，由注册表 `ports` + `facing` 自动计算
- `Belt.points` (像素坐标数组) → `BeltSegment.path` (网格坐标数组)，需要将像素坐标反算为网格坐标
- 所有机器默认 `facing: 'south'`

创建 `data/schemes/iron-full-line-v1.json`，包含从旧数据转换的完整方案。这个文件内容较长（~300行），需要逐项转换所有 20 台机器、55 条传送带、9 个电线杆的数据。

**注意**：传送带路径的坐标转换公式：
```
旧像素坐标 [px_x, px_y] → 新网格坐标 { col: (px_x - 45) / 95, row: (px_y - 35) / 78 }
```
由于旧网格非正方形，转换后的小数坐标需要手动修正对齐到新的正方形网格。这是一次性的数据迁移工作。

- [ ] **Step 2: 验证 JSON 可加载**

编写一个临时脚本或在测试中验证：

```typescript
// 在 schema.test.ts 中追加
import schemeData from '../../../data/schemes/iron-full-line-v1.json';

it('validates the migrated iron-full-line scheme', () => {
  const warnings = validateScheme(schemeData as Scheme);
  // 可能有一些端口引用警告，但不应有类型错误
  const typeErrors = warnings.filter(w => w.includes('unknown type'));
  expect(typeErrors).toHaveLength(0);
});
```

- [ ] **Step 3: 删除旧文件**

确认新 JSON 数据完整后，删除 `src/data/factory.ts` 和 `src/components/` 目录。

- [ ] **Step 4: 提交**

```bash
git add data/schemes/iron-full-line-v1.json
git rm -r src/data/ src/components/
git commit -m "feat: migrate factory data to JSON scheme format, remove old code"
```

---

## Task 9: GridRenderer + MachineRenderer（基础 SVG 渲染）

**Files:**
- Create: `src/renderers/GridRenderer.tsx`
- Create: `src/renderers/MachineRenderer.tsx`

- [ ] **Step 1: 实现 GridRenderer**

```tsx
// src/renderers/GridRenderer.tsx
import { GRID_PX, PAD } from '../core/coordinate';

interface GridRendererProps {
  cols: number;
  rows: number;
}

export function GridRenderer({ cols, rows }: GridRendererProps) {
  const lines: React.ReactNode[] = [];

  // 垂直线
  for (let c = 0; c <= cols; c++) {
    const x = PAD + c * GRID_PX;
    lines.push(
      <line key={`v${c}`} className="grid-line" x1={x} y1={PAD} x2={x} y2={PAD + rows * GRID_PX} />
    );
  }

  // 水平线
  for (let r = 0; r <= rows; r++) {
    const y = PAD + r * GRID_PX;
    lines.push(
      <line key={`h${r}`} className="grid-line" x1={PAD} y1={y} x2={PAD + cols * GRID_PX} y2={y} />
    );
  }

  // 列标号
  for (let c = 0; c < cols; c++) {
    lines.push(
      <text key={`cl${c}`} className="grid-label" x={PAD + c * GRID_PX + GRID_PX / 2} y={PAD - 8} textAnchor="middle">
        {c + 1}
      </text>
    );
  }

  // 行标号
  for (let r = 0; r < rows; r++) {
    lines.push(
      <text key={`rl${r}`} className="grid-label" x={PAD - 12} y={PAD + r * GRID_PX + GRID_PX / 2 + 4} textAnchor="middle">
        {String.fromCharCode(65 + r)}
      </text>
    );
  }

  return <g className="grid-layer">{lines}</g>;
}
```

- [ ] **Step 2: 实现 MachineRenderer**

```tsx
// src/renderers/MachineRenderer.tsx
import { memo } from 'react';
import type { MachineInstance } from '../core/types';
import { gridToSvg, machineGridSize, GRID_PX, resolvePortPosition } from '../core/coordinate';
import { getBuildingMeta } from '../core/registry';

interface MachineRendererProps {
  machine: MachineInstance;
  highlight?: boolean;
  dimmed?: boolean;
  onHover?: (id: string | null) => void;
  onClick?: (id: string) => void;
}

export const MachineRenderer = memo(function MachineRenderer({
  machine, highlight, dimmed, onHover, onClick,
}: MachineRendererProps) {
  const meta = getBuildingMeta(machine.type);
  const { cols, rows } = machineGridSize(meta.dimensions, machine.facing);
  const { x, y } = gridToSvg(machine.pos.col, machine.pos.row);
  const w = cols * GRID_PX;
  const h = rows * GRID_PX;
  const color = `var(${meta.color})`;

  // 主体内缩 10%
  const inset = Math.min(w, h) * 0.08;
  const bx = x + inset;
  const by = y + inset;
  const bw = w - inset * 2;
  const bh = h - inset * 2;

  const className = [
    'machine-group',
    highlight && 'element-highlight',
    dimmed && 'element-dimmed',
  ].filter(Boolean).join(' ');

  return (
    <g
      className={className}
      onMouseEnter={() => onHover?.(machine.id)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.(machine.id)}
    >
      {/* 占地矩形 */}
      <rect
        className="machine-footprint"
        x={x} y={y} width={w} height={h}
        rx={3}
        stroke={color}
      />

      {/* 机器主体 */}
      <rect
        className="machine-body"
        x={bx} y={by} width={bw} height={bh}
        rx={2}
        fill={color}
        stroke={color}
      />

      {/* 名称标签 */}
      <text className="machine-label" x={bx + bw / 2} y={by + 14} textAnchor="middle">
        {machine.label ?? machine.id}
      </text>

      {/* 功耗 + 效率 */}
      <text className="machine-sublabel" x={bx + bw / 2} y={by + bh - 6} textAnchor="middle" fill={color}>
        {meta.powerUsage > 0 ? `${meta.powerUsage}MW` : ''}{machine.clockSpeed && machine.clockSpeed !== 100 ? ` ${machine.clockSpeed}%` : ''}
      </text>

      {/* 端口标记 */}
      {meta.ports.filter(p => p.kind !== 'power').map(portDef => {
        const pos = resolvePortPosition(machine.pos, machine.facing, meta.dimensions, portDef);
        return (
          <circle
            key={portDef.id}
            className="port-dot"
            cx={pos.x}
            cy={pos.y}
            stroke={portDef.kind.includes('in') ? '#ff9800' : '#4caf50'}
          />
        );
      })}
    </g>
  );
});
```

- [ ] **Step 3: 验证编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: 提交**

```bash
git add src/renderers/GridRenderer.tsx src/renderers/MachineRenderer.tsx
git commit -m "feat: add GridRenderer and MachineRenderer SVG components"
```

---

## Task 10: BeltRenderer + ZoneRenderer + PowerRenderer + LiftRenderer + StructureRenderer

**Files:**
- Create: `src/renderers/BeltRenderer.tsx`
- Create: `src/renderers/ZoneRenderer.tsx`
- Create: `src/renderers/PowerRenderer.tsx`
- Create: `src/renderers/LiftRenderer.tsx`
- Create: `src/renderers/StructureRenderer.tsx`

- [ ] **Step 1: 实现 BeltRenderer**

```tsx
// src/renderers/BeltRenderer.tsx
import { memo } from 'react';
import type { BeltSegment } from '../core/types';
import { gridToSvg } from '../core/coordinate';
import { getMaterialColor } from '../core/registry';

interface BeltRendererProps {
  belt: BeltSegment;
  highlight?: boolean;
  dimmed?: boolean;
  onHover?: (id: string | null) => void;
  onClick?: (id: string) => void;
}

export const BeltRenderer = memo(function BeltRenderer({
  belt, highlight, dimmed, onHover, onClick,
}: BeltRendererProps) {
  if (belt.path.length < 2) return null;

  const color = getMaterialColor(belt.material);
  const points = belt.path.map(p => {
    const { x, y } = gridToSvg(p.col, p.row);
    return `${x},${y}`;
  }).join(' ');

  // 箭头方向：最后两个点
  const p1 = belt.path[belt.path.length - 2];
  const p2 = belt.path[belt.path.length - 1];
  const s1 = gridToSvg(p1.col, p1.row);
  const s2 = gridToSvg(p2.col, p2.row);
  const angle = Math.atan2(s2.y - s1.y, s2.x - s1.x) * (180 / Math.PI);

  // 标签位置：中间点
  const midIdx = Math.floor(belt.path.length / 2);
  const midPt = gridToSvg(belt.path[midIdx].col, belt.path[midIdx].row);

  const className = [
    'belt-group',
    highlight && 'element-highlight',
    dimmed && 'element-dimmed',
  ].filter(Boolean).join(' ');

  return (
    <g
      className={className}
      onMouseEnter={() => onHover?.(belt.id)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.(belt.id)}
      style={{ cursor: 'pointer' }}
    >
      <polyline
        className={`belt-line belt-mk${belt.mark}`}
        points={points}
        stroke={color}
        strokeDasharray="8 8"
      />

      {/* 箭头 */}
      <polygon
        className="belt-arrow"
        points="-5,-3 0,0 -5,3"
        fill={color}
        transform={`translate(${s2.x},${s2.y}) rotate(${angle})`}
      />

      {/* 标签 */}
      <g transform={`translate(${midPt.x},${midPt.y - 6})`}>
        <rect x={-20} y={-7} width={40} height={14} rx={3} fill="#0a0e14" fillOpacity={0.85} stroke={color} strokeWidth={0.5} />
        <text className="belt-label" textAnchor="middle" y={4} fill={color}>
          {belt.material}
        </text>
      </g>
    </g>
  );
});
```

- [ ] **Step 2: 实现 ZoneRenderer**

```tsx
// src/renderers/ZoneRenderer.tsx
import { memo } from 'react';
import type { Zone } from '../core/types';
import { gridToSvg, GRID_PX } from '../core/coordinate';

interface ZoneRendererProps {
  zone: Zone;
}

export const ZoneRenderer = memo(function ZoneRenderer({ zone }: ZoneRendererProps) {
  const { x, y } = gridToSvg(zone.pos.col, zone.pos.row);
  const w = zone.size.w * GRID_PX;
  const h = zone.size.h * GRID_PX;
  const color = zone.color ? `var(${zone.color})` : 'var(--text-muted)';

  return (
    <g>
      <rect className="zone-rect" x={x} y={y} width={w} height={h} rx={4} stroke={color} fill={color} />
      <text className="zone-label" x={x + 8} y={y + 16} fill={color}>{zone.label}</text>
    </g>
  );
});
```

- [ ] **Step 3: 实现 PowerRenderer**

```tsx
// src/renderers/PowerRenderer.tsx
import { memo } from 'react';
import type { PowerPole, PowerConnection, MachineInstance } from '../core/types';
import { gridToSvg, GRID_PX } from '../core/coordinate';

interface PowerRendererProps {
  poles: PowerPole[];
  connections: PowerConnection[];
  machines: MachineInstance[];
  dimmed?: boolean;
}

export const PowerRenderer = memo(function PowerRenderer({
  poles, connections, machines, dimmed,
}: PowerRendererProps) {
  const posMap = new Map<string, { x: number; y: number }>();

  for (const p of poles) {
    const svg = gridToSvg(p.pos.col, p.pos.row);
    posMap.set(p.id, svg);
  }

  for (const m of machines) {
    const svg = gridToSvg(m.pos.col + 0.5, m.pos.row + 0.5);
    posMap.set(m.id, svg);
  }

  const className = dimmed ? 'power-layer element-dimmed' : 'power-layer';

  return (
    <g className={className}>
      {/* 连接线 */}
      {connections.map((c, i) => {
        const from = posMap.get(c.from);
        const to = posMap.get(c.to);
        if (!from || !to) return null;
        return (
          <line key={i} className="power-line" x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
        );
      })}

      {/* 电源标记 */}
      {poles.map(p => {
        const pos = posMap.get(p.id)!;
        return (
          <g key={p.id}>
            <circle className="power-pole-marker" cx={pos.x} cy={pos.y} r={5} />
            <text className="power-label" x={pos.x} y={pos.y + 3} textAnchor="middle">{p.id.slice(-1).toUpperCase()}</text>
          </g>
        );
      })}
    </g>
  );
});
```

- [ ] **Step 4: 实现 LiftRenderer**

```tsx
// src/renderers/LiftRenderer.tsx
import { memo } from 'react';
import type { Lift } from '../core/types';
import { gridToSvg, GRID_PX } from '../core/coordinate';
import { getMaterialColor } from '../core/registry';

interface LiftRendererProps {
  lift: Lift;
  highlight?: boolean;
  dimmed?: boolean;
  onHover?: (id: string | null) => void;
}

export const LiftRenderer = memo(function LiftRenderer({
  lift, highlight, dimmed, onHover,
}: LiftRendererProps) {
  const { x, y } = gridToSvg(lift.pos.col, lift.pos.row);
  const size = (2 / 8) * GRID_PX; // 2m 占地
  const color = getMaterialColor(lift.material);

  const className = [
    highlight && 'element-highlight',
    dimmed && 'element-dimmed',
  ].filter(Boolean).join(' ');

  return (
    <g
      className={className}
      onMouseEnter={() => onHover?.(lift.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <rect className="lift-box" x={x} y={y} width={size} height={size} rx={2} stroke={color} fill={color} />
      <text className="lift-label" x={x + size / 2} y={y + size / 2 + 3} textAnchor="middle" fill={color}>
        ↕{lift.toFloor}F
      </text>
    </g>
  );
});
```

- [ ] **Step 5: 实现 StructureRenderer**

```tsx
// src/renderers/StructureRenderer.tsx
import { memo } from 'react';
import type { StructureInstance } from '../core/types';
import { gridToSvg, GRID_PX } from '../core/coordinate';
import { getBuildingMeta } from '../core/registry';
import { machineGridSize } from '../core/coordinate';

interface StructureRendererProps {
  structure: StructureInstance;
  dimmed?: boolean;
}

export const StructureRenderer = memo(function StructureRenderer({
  structure, dimmed,
}: StructureRendererProps) {
  const meta = getBuildingMeta(structure.type);
  const { cols, rows } = machineGridSize(meta.dimensions, structure.wallSide ?? 'south');
  const { x, y } = gridToSvg(structure.pos.col, structure.pos.row);
  const w = cols * GRID_PX;
  const h = rows * GRID_PX;

  return (
    <g className={dimmed ? 'element-dimmed' : ''}>
      <rect className="structure-marker" x={x} y={y} width={w} height={h} rx={2} />
      <text className="machine-sublabel" x={x + w / 2} y={y + h / 2 + 3} textAnchor="middle" fill="var(--structure)">
        {meta.displayName.slice(0, 4)}
      </text>
    </g>
  );
});
```

- [ ] **Step 6: 验证编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 7: 提交**

```bash
git add src/renderers/
git commit -m "feat: add Belt, Zone, Power, Lift, Structure SVG renderers"
```

---

## Task 11: FloorPlanView（单层俯视图 + 缩放平移）

**Files:**
- Create: `src/views/FloorPlanView.tsx`

- [ ] **Step 1: 实现 FloorPlanView**

```tsx
// src/views/FloorPlanView.tsx
import { useRef, useCallback, type WheelEvent, type MouseEvent } from 'react';
import type { Scheme } from '../core/types';
import { calcViewBox } from '../core/coordinate';
import { useAppStore } from '../store/useAppStore';
import { GridRenderer } from '../renderers/GridRenderer';
import { ZoneRenderer } from '../renderers/ZoneRenderer';
import { MachineRenderer } from '../renderers/MachineRenderer';
import { BeltRenderer } from '../renderers/BeltRenderer';
import { PowerRenderer } from '../renderers/PowerRenderer';
import { LiftRenderer } from '../renderers/LiftRenderer';
import { StructureRenderer } from '../renderers/StructureRenderer';

interface FloorPlanViewProps {
  scheme: Scheme;
  floorId: number;
}

export function FloorPlanView({ scheme, floorId }: FloorPlanViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });

  const viewport = useAppStore(s => s.viewport);
  const layers = useAppStore(s => s.layers);
  const hoveredId = useAppStore(s => s.hoveredId);
  const highlightChain = useAppStore(s => s.highlightChain);
  const setViewport = useAppStore(s => s.setViewport);
  const hover = useAppStore(s => s.hover);
  const select = useAppStore(s => s.select);

  const floor = scheme.floors.find(f => f.id === floorId);
  if (!floor) return null;

  const { cols, rows } = floor.gridSize;
  const baseViewBox = calcViewBox(cols, rows);

  // 缩放
  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.3, Math.min(3, viewport.zoom * delta));
    setViewport({ zoom: newZoom });
  }, [viewport.zoom, setViewport]);

  // 平移
  const onMouseDown = useCallback((e: MouseEvent) => {
    if (e.button !== 0) return;
    isPanning.current = true;
    panStart.current = { x: e.clientX - viewport.panX, y: e.clientY - viewport.panY };
  }, [viewport.panX, viewport.panY]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanning.current) return;
    setViewport({
      panX: e.clientX - panStart.current.x,
      panY: e.clientY - panStart.current.y,
    });
  }, [setViewport]);

  const onMouseUp = useCallback(() => { isPanning.current = false; }, []);

  // 过滤当前楼层的数据
  const machines = scheme.machines.filter(m => m.floor === floorId);
  const belts = scheme.belts.filter(b => b.floor === floorId);
  const lifts = scheme.lifts.filter(l => l.fromFloor === floorId || l.toFloor === floorId);
  const zones = scheme.zones.filter(z => z.floor === floorId);
  const poles = scheme.power.poles.filter(p => p.floor === floorId);
  const structures = scheme.structures.filter(s => s.floor === floorId);
  const connections = scheme.power.connections;

  const hasHighlight = highlightChain.length > 0;
  const isHighlighted = (id: string) => highlightChain.includes(id);
  const isDimmed = (id: string) => hasHighlight && !isHighlighted(id);

  return (
    <svg
      ref={svgRef}
      viewBox={baseViewBox}
      style={{
        transform: `scale(${viewport.zoom}) translate(${viewport.panX / viewport.zoom}px, ${viewport.panY / viewport.zoom}px)`,
        transformOrigin: 'center center',
        cursor: isPanning.current ? 'grabbing' : 'grab',
      }}
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {/* Layer 1: Grid */}
      <GridRenderer cols={cols} rows={rows} />

      {/* Layer 2: Zones */}
      {layers.zones && zones.map(z => <ZoneRenderer key={z.id} zone={z} />)}

      {/* Layer 3: Power */}
      {layers.power && (
        <PowerRenderer
          poles={poles}
          connections={connections}
          machines={machines}
          dimmed={hasHighlight}
        />
      )}

      {/* Layer 4: Belts */}
      {layers.belts && belts.map(b => (
        <BeltRenderer
          key={b.id}
          belt={b}
          highlight={isHighlighted(b.id)}
          dimmed={isDimmed(b.id)}
          onHover={hover}
          onClick={select}
        />
      ))}

      {/* Layer 5: Structures */}
      {layers.structures && structures.map(s => (
        <StructureRenderer key={s.id} structure={s} dimmed={isDimmed(s.id)} />
      ))}

      {/* Layer 6: Machines */}
      {machines.filter(m => layers.storage || m.type !== 'storage' && m.type !== 'industrial-storage').map(m => (
        <MachineRenderer
          key={m.id}
          machine={m}
          highlight={isHighlighted(m.id)}
          dimmed={isDimmed(m.id)}
          onHover={hover}
          onClick={select}
        />
      ))}

      {/* Layer 7: Lifts */}
      {lifts.map(l => (
        <LiftRenderer
          key={l.id}
          lift={l}
          highlight={isHighlighted(l.id)}
          dimmed={isDimmed(l.id)}
          onHover={hover}
        />
      ))}
    </svg>
  );
}
```

- [ ] **Step 2: 验证编译**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: 提交**

```bash
git add src/views/FloorPlanView.tsx
git commit -m "feat: add FloorPlanView with zoom/pan and layered rendering"
```

---

## Task 12: App 布局 + TopBar + 方案加载

**Files:**
- Modify: `src/App.tsx`
- Create: `src/ui/TopBar.tsx`

- [ ] **Step 1: 实现 TopBar**

```tsx
// src/ui/TopBar.tsx
import { useAppStore } from '../store/useAppStore';
import type { ViewMode } from '../core/types';

const VIEW_MODES: { id: ViewMode; label: string }[] = [
  { id: 'single', label: '单层' },
  { id: 'linked', label: '联动' },
  { id: 'section', label: '剖面' },
];

export function TopBar() {
  const schemes = useAppStore(s => s.schemes);
  const currentSchemeId = useAppStore(s => s.currentSchemeId);
  const viewMode = useAppStore(s => s.viewMode);
  const setViewMode = useAppStore(s => s.setViewMode);

  return (
    <header className="topbar">
      <span className="topbar-title">Factory Plan</span>

      <select
        className="scheme-select"
        value={currentSchemeId ?? ''}
        onChange={(e) => {
          // 方案切换由 App 层处理（需要异步加载 JSON）
          const event = new CustomEvent('scheme-change', { detail: e.target.value });
          window.dispatchEvent(event);
        }}
      >
        {schemes.map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      <div className="view-mode-group">
        {VIEW_MODES.map(m => (
          <button
            key={m.id}
            className={`view-mode-btn ${viewMode === m.id ? 'active' : ''}`}
            onClick={() => setViewMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>
    </header>
  );
}
```

- [ ] **Step 2: 实现 App 布局和方案加载**

```tsx
// src/App.tsx
import { useEffect } from 'react';
import type { Scheme } from './core/types';
import { validateScheme, buildSchemeIndex } from './core/schema';
import { useAppStore } from './store/useAppStore';
import { TopBar } from './ui/TopBar';
import { FloorPlanView } from './views/FloorPlanView';

// Vite 动态导入所有方案 JSON
const schemeModules = import.meta.glob<Scheme>('/data/schemes/*.json', { eager: false });

async function loadAllSchemeIndexes() {
  const indexes = [];
  for (const [path, loader] of Object.entries(schemeModules)) {
    const scheme = await loader() as unknown as { default: Scheme } | Scheme;
    const data = 'default' in scheme ? scheme.default : scheme;
    indexes.push(buildSchemeIndex(data, path));
  }
  return indexes;
}

async function loadSchemeByPath(path: string): Promise<Scheme> {
  const loader = schemeModules[path];
  if (!loader) throw new Error(`Scheme not found: ${path}`);
  const mod = await loader() as unknown as { default: Scheme } | Scheme;
  const data = 'default' in mod ? mod.default : mod;
  const warnings = validateScheme(data);
  if (warnings.length > 0) {
    console.warn(`Scheme "${data.id}" validation warnings:`, warnings);
  }
  return data;
}

export default function App() {
  const schemes = useAppStore(s => s.schemes);
  const currentScheme = useAppStore(s => s.currentScheme);
  const currentFloor = useAppStore(s => s.currentFloor);
  const viewMode = useAppStore(s => s.viewMode);
  const setSchemes = useAppStore(s => s.setSchemes);
  const loadScheme = useAppStore(s => s.loadScheme);

  // 启动时加载方案索引
  useEffect(() => {
    loadAllSchemeIndexes().then(async (indexes) => {
      setSchemes(indexes);
      if (indexes.length > 0) {
        const firstScheme = await loadSchemeByPath(indexes[0].filePath);
        loadScheme(firstScheme);
      }
    });
  }, [setSchemes, loadScheme]);

  // 监听方案切换事件
  useEffect(() => {
    const handler = async (e: Event) => {
      const id = (e as CustomEvent).detail;
      const idx = schemes.find(s => s.id === id);
      if (idx) {
        const data = await loadSchemeByPath(idx.filePath);
        loadScheme(data);
      }
    };
    window.addEventListener('scheme-change', handler);
    return () => window.removeEventListener('scheme-change', handler);
  }, [schemes, loadScheme]);

  return (
    <div className="app-layout">
      <TopBar />

      <aside className="left-panel">
        {/* Task 13 实现 */}
      </aside>

      <main className="canvas-area">
        {currentScheme && viewMode === 'single' && (
          <FloorPlanView scheme={currentScheme} floorId={currentFloor} />
        )}
        {currentScheme && viewMode === 'linked' && (
          <div style={{ display: 'flex', width: '100%', height: '100%' }}>
            {currentScheme.floors.map(f => (
              <div key={f.id} style={{ flex: 1, borderRight: '1px solid var(--border)' }}>
                <FloorPlanView scheme={currentScheme} floorId={f.id} />
              </div>
            ))}
          </div>
        )}
        {!currentScheme && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            加载方案中...
          </div>
        )}
      </main>

      <aside className="right-panel">
        {/* Task 14 实现 */}
      </aside>

      <footer className="bottombar">
        {/* Task 15 实现 */}
      </footer>
    </div>
  );
}
```

- [ ] **Step 3: 运行开发服务器验证**

```bash
npm run dev
```

预期：暗色三栏布局显示，SVG 画布中渲染网格和机器（如果 JSON 数据已就绪），可缩放平移。

- [ ] **Step 4: 提交**

```bash
git add src/App.tsx src/ui/TopBar.tsx
git commit -m "feat: add App layout with TopBar, scheme loading, and FloorPlanView"
```

---

## Task 13: LeftPanel（楼层导航 + 图层控制）

**Files:**
- Create: `src/ui/LeftPanel.tsx`
- Modify: `src/App.tsx` — 在 `<aside className="left-panel">` 中替换为 `<LeftPanel />`

- [ ] **Step 1: 实现 LeftPanel**

```tsx
// src/ui/LeftPanel.tsx
import { useAppStore } from '../store/useAppStore';
import type { Layers } from '../core/types';

const LAYER_CONFIG: { key: keyof Layers; label: string; color: string }[] = [
  { key: 'belts', label: '传送带', color: 'var(--mat-iron-plate)' },
  { key: 'power', label: '电力', color: 'var(--power)' },
  { key: 'zones', label: '分区', color: 'var(--text-muted)' },
  { key: 'structures', label: '结构件', color: 'var(--structure)' },
  { key: 'storage', label: '储存', color: 'var(--storage)' },
];

export function LeftPanel() {
  const currentScheme = useAppStore(s => s.currentScheme);
  const currentFloor = useAppStore(s => s.currentFloor);
  const viewMode = useAppStore(s => s.viewMode);
  const layers = useAppStore(s => s.layers);
  const setFloor = useAppStore(s => s.setFloor);
  const toggleLayer = useAppStore(s => s.toggleLayer);

  return (
    <>
      {/* 楼层导航 */}
      {viewMode === 'single' && currentScheme && (
        <div className="panel-section">
          <div className="panel-section-title">楼层</div>
          <div className="floor-nav">
            {currentScheme.floors.map(f => (
              <button
                key={f.id}
                className={`floor-btn ${currentFloor === f.id ? 'active' : ''}`}
                onClick={() => setFloor(f.id)}
              >
                <span className="floor-indicator" />
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 图层控制 */}
      <div className="panel-section">
        <div className="panel-section-title">图层</div>
        {LAYER_CONFIG.map(lc => (
          <label key={lc.key} className="layer-toggle">
            <input
              type="checkbox"
              checked={layers[lc.key]}
              onChange={() => toggleLayer(lc.key)}
            />
            <span className="layer-color-dot" style={{ background: lc.color }} />
            <span>{lc.label}</span>
          </label>
        ))}
      </div>
    </>
  );
}
```

- [ ] **Step 2: 接入 App**

在 `src/App.tsx` 中导入 `LeftPanel` 并替换左侧面板占位内容：

```tsx
import { LeftPanel } from './ui/LeftPanel';
// ...
<aside className="left-panel">
  <LeftPanel />
</aside>
```

- [ ] **Step 3: 验证**

```bash
npm run dev
```

预期：左侧面板显示楼层按钮和图层开关，切换楼层时画布切换，开关图层时对应 SVG 层显隐。

- [ ] **Step 4: 提交**

```bash
git add src/ui/LeftPanel.tsx src/App.tsx
git commit -m "feat: add LeftPanel with floor navigation and layer toggles"
```

---

## Task 14: RightPanel（统计 + 建造清单 + 图例）

**Files:**
- Create: `src/ui/RightPanel.tsx`
- Modify: `src/App.tsx` — 接入 RightPanel

- [ ] **Step 1: 实现 RightPanel**

```tsx
// src/ui/RightPanel.tsx
import { useAppStore } from '../store/useAppStore';
import { getBuildingMeta, MATERIAL_RAW_COLORS } from '../core/registry';
import type { PlaceableType } from '../core/types';

export function RightPanel() {
  const scheme = useAppStore(s => s.currentScheme);
  if (!scheme) return null;

  // 统计机器数量
  const machineCounts = new Map<string, number>();
  for (const m of scheme.machines) {
    const meta = getBuildingMeta(m.type);
    machineCounts.set(meta.displayName, (machineCounts.get(meta.displayName) ?? 0) + 1);
  }

  // 总功耗
  const totalPower = scheme.machines.reduce((sum, m) => {
    const meta = getBuildingMeta(m.type);
    return sum + meta.powerUsage * ((m.clockSpeed ?? 100) / 100);
  }, 0);

  return (
    <>
      {/* 产能统计 */}
      <div className="panel-section">
        <div className="panel-section-title">产出</div>
        {scheme.stats.outputs.map(o => (
          <div key={o.material} className="stat-row">
            <span style={{ color: MATERIAL_RAW_COLORS[o.material] ?? '#888' }}>{o.material}</span>
            <span className="stat-value">{o.rate}/min</span>
          </div>
        ))}
      </div>

      {/* 输入 */}
      <div className="panel-section">
        <div className="panel-section-title">输入</div>
        {scheme.stats.inputs.map(i => (
          <div key={i.material} className="stat-row">
            <span style={{ color: MATERIAL_RAW_COLORS[i.material] ?? '#888' }}>{i.material}</span>
            <span className="stat-value">{i.rate}/min</span>
          </div>
        ))}
      </div>

      {/* 电力 */}
      <div className="panel-section">
        <div className="panel-section-title">电力</div>
        <div className="stat-row">
          <span>总功耗</span>
          <span className="stat-value" style={{ color: 'var(--power)' }}>{totalPower.toFixed(0)} MW</span>
        </div>
      </div>

      {/* 建造清单 */}
      <div className="panel-section">
        <div className="panel-section-title">建造清单</div>
        {[...machineCounts.entries()].map(([name, count]) => (
          <div key={name} className="stat-row">
            <span>{name}</span>
            <span className="stat-value">x{count}</span>
          </div>
        ))}
      </div>

      {/* 图例 */}
      <div className="panel-section">
        <div className="panel-section-title">图例</div>
        {Object.entries(MATERIAL_RAW_COLORS).map(([name, color]) => (
          <div key={name} className="legend-item">
            <span className="legend-swatch" style={{ background: color }} />
            <span>{name}</span>
          </div>
        ))}
      </div>
    </>
  );
}
```

- [ ] **Step 2: 接入 App**

在 `src/App.tsx` 中：

```tsx
import { RightPanel } from './ui/RightPanel';
// ...
<aside className="right-panel">
  <RightPanel />
</aside>
```

- [ ] **Step 3: 提交**

```bash
git add src/ui/RightPanel.tsx src/App.tsx
git commit -m "feat: add RightPanel with stats, build list, and material legend"
```

---

## Task 15: MachineTooltip + MachineDetail + BottomBar

**Files:**
- Create: `src/ui/MachineTooltip.tsx`
- Create: `src/ui/MachineDetail.tsx`
- Create: `src/ui/BottomBar.tsx`
- Modify: `src/App.tsx` — 接入这三个组件

- [ ] **Step 1: 实现 MachineTooltip**

```tsx
// src/ui/MachineTooltip.tsx
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { getBuildingMeta } from '../core/registry';

export function MachineTooltip() {
  const hoveredId = useAppStore(s => s.hoveredId);
  const scheme = useAppStore(s => s.currentScheme);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const machine = scheme?.machines.find(m => m.id === hoveredId);
  const meta = machine ? getBuildingMeta(machine.type) : null;

  // 跟随鼠标位置（SVG 中 hover 时无法用 floating-ui 锚定 SVG 元素，改用鼠标跟随）
  useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX + 12, y: e.clientY + 12 });
    if (hoveredId) {
      window.addEventListener('mousemove', handler);
      return () => window.removeEventListener('mousemove', handler);
    }
  }, [hoveredId]);

  return (
    <AnimatePresence>
      {machine && meta && (
        <motion.div
          className="tooltip"
          style={{ position: 'fixed', left: pos.x, top: pos.y }}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          <div className="tooltip-title" style={{ color: `var(${meta.color})` }}>
            {machine.label ?? machine.id} — {meta.displayName}
          </div>
          {machine.recipe && <div className="tooltip-row"><span>配方</span><span>{machine.recipe}</span></div>}
          <div className="tooltip-row"><span>功耗</span><span>{meta.powerUsage} MW</span></div>
          {machine.clockSpeed && machine.clockSpeed !== 100 && (
            <div className="tooltip-row"><span>超频</span><span>{machine.clockSpeed}%</span></div>
          )}
          <div className="tooltip-row">
            <span>尺寸</span>
            <span>{meta.dimensions.width}m x {meta.dimensions.length}m</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: 实现 MachineDetail**

```tsx
// src/ui/MachineDetail.tsx
import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { getBuildingMeta } from '../core/registry';

export function MachineDetail() {
  const selectedId = useAppStore(s => s.selectedId);
  const scheme = useAppStore(s => s.currentScheme);
  const select = useAppStore(s => s.select);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const machine = scheme?.machines.find(m => m.id === selectedId);
  const meta = machine ? getBuildingMeta(machine.type) : null;

  useEffect(() => {
    if (machine) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [machine]);

  if (!machine || !meta) return <dialog ref={dialogRef} className="machine-detail" />;

  // 找到连接的传送带
  const connectedBelts = scheme?.belts.filter(b =>
    b.fromPort?.startsWith(machine.id + ':') || b.toPort?.startsWith(machine.id + ':')
  ) ?? [];

  return (
    <dialog ref={dialogRef} className="machine-detail" onClose={() => select(null)}>
      <h3 style={{ color: `var(${meta.color})`, marginBottom: 12 }}>
        {machine.label ?? machine.id} — {meta.displayName}
      </h3>

      <div className="stat-row"><span>配方</span><span>{machine.recipe ?? '—'}</span></div>
      <div className="stat-row"><span>楼层</span><span>{machine.floor}F</span></div>
      <div className="stat-row"><span>位置</span><span>({machine.pos.col}, {machine.pos.row})</span></div>
      <div className="stat-row"><span>朝向</span><span>{machine.facing}</span></div>
      <div className="stat-row"><span>功耗</span><span>{meta.powerUsage} MW</span></div>
      <div className="stat-row"><span>尺寸</span><span>{meta.dimensions.width} x {meta.dimensions.length} x {meta.dimensions.height} m</span></div>

      {connectedBelts.length > 0 && (
        <>
          <div className="panel-section-title" style={{ marginTop: 12 }}>连接的传送带</div>
          {connectedBelts.map(b => (
            <div key={b.id} className="stat-row">
              <span>{b.material}</span>
              <span className="stat-value">Mk.{b.mark}</span>
            </div>
          ))}
        </>
      )}

      <button
        style={{
          marginTop: 16, padding: '6px 16px', background: 'var(--bg-primary)',
          border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-secondary)',
          cursor: 'pointer',
        }}
        onClick={() => select(null)}
      >
        关闭
      </button>
    </dialog>
  );
}
```

- [ ] **Step 3: 实现 BottomBar**

```tsx
// src/ui/BottomBar.tsx
import { useAppStore } from '../store/useAppStore';

export function BottomBar() {
  const viewport = useAppStore(s => s.viewport);

  return (
    <footer className="bottombar">
      <span>缩放: {Math.round(viewport.zoom * 100)}%</span>
      <span>网格: 8m/格</span>
    </footer>
  );
}
```

- [ ] **Step 4: 接入 App**

在 `src/App.tsx` 中导入并放置：

```tsx
import { MachineTooltip } from './ui/MachineTooltip';
import { MachineDetail } from './ui/MachineDetail';
import { BottomBar } from './ui/BottomBar';
// ...
{/* 在 </div> 前 */}
<MachineTooltip />
<MachineDetail />
// ...
<footer className="bottombar">
  <BottomBar />
</footer>
```

- [ ] **Step 5: 提交**

```bash
git add src/ui/MachineTooltip.tsx src/ui/MachineDetail.tsx src/ui/BottomBar.tsx src/App.tsx
git commit -m "feat: add MachineTooltip, MachineDetail modal, and BottomBar"
```

---

## Task 16: LinkedFloorView + CrossSectionView（高级视图）

**Files:**
- Create: `src/views/LinkedFloorView.tsx`
- Create: `src/views/CrossSectionView.tsx`
- Modify: `src/App.tsx` — 接入两个视图

- [ ] **Step 1: 实现 LinkedFloorView**

```tsx
// src/views/LinkedFloorView.tsx
import type { Scheme } from '../core/types';
import { FloorPlanView } from './FloorPlanView';

interface LinkedFloorViewProps {
  scheme: Scheme;
}

export function LinkedFloorView({ scheme }: LinkedFloorViewProps) {
  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      {scheme.floors.map((f, i) => (
        <div
          key={f.id}
          style={{
            flex: 1,
            borderRight: i < scheme.floors.length - 1 ? '1px solid var(--border)' : 'none',
            position: 'relative',
          }}
        >
          <div style={{
            position: 'absolute', top: 8, left: 12, fontSize: 11,
            color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', zIndex: 1,
          }}>
            {f.label}
          </div>
          <FloorPlanView scheme={scheme} floorId={f.id} />
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 实现 CrossSectionView（基础版）**

```tsx
// src/views/CrossSectionView.tsx
import type { Scheme } from '../core/types';
import { GRID_PX, PAD } from '../core/coordinate';
import { getBuildingMeta } from '../core/registry';
import { getMaterialColor } from '../core/registry';

interface CrossSectionViewProps {
  scheme: Scheme;
}

export function CrossSectionView({ scheme }: CrossSectionViewProps) {
  const floors = [...scheme.floors].sort((a, b) => b.id - a.id); // 高楼层在上
  const totalHeight = floors.reduce((sum, f) => sum + f.heightM, 0);
  const maxCols = Math.max(...floors.map(f => f.gridSize.cols));

  const SECTION_SCALE = 10; // 1m = 10px
  const svgW = maxCols * GRID_PX + PAD * 2;
  const svgH = totalHeight * SECTION_SCALE + PAD * 2 + floors.length * 20;

  let yOffset = PAD;

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', height: '100%' }}>
      {floors.map(floor => {
        const floorH = floor.heightM * SECTION_SCALE;
        const floorY = yOffset;
        yOffset += floorH + 20; // 20px 楼层间距

        // 该层的机器
        const machines = scheme.machines.filter(m => m.floor === floor.id);
        const lifts = scheme.lifts.filter(l => l.fromFloor === floor.id || l.toFloor === floor.id);

        return (
          <g key={floor.id}>
            {/* 楼层标签 */}
            <text x={12} y={floorY + floorH / 2} fill="var(--text-muted)" fontSize={12} fontFamily="var(--font-mono)">
              {floor.label}
            </text>

            {/* 楼层框 */}
            <rect
              x={PAD} y={floorY} width={maxCols * GRID_PX} height={floorH}
              fill="var(--bg-canvas)" stroke="var(--border)" strokeWidth={1} rx={4}
            />

            {/* 地面线 */}
            <line
              x1={PAD} y1={floorY + floorH}
              x2={PAD + maxCols * GRID_PX} y2={floorY + floorH}
              stroke="var(--border)" strokeWidth={2}
            />

            {/* 机器侧面轮廓 */}
            {machines.map(m => {
              const meta = getBuildingMeta(m.type);
              const mW = (meta.dimensions.width / 8) * GRID_PX;
              const mH = meta.dimensions.height * SECTION_SCALE;
              const mX = PAD + m.pos.col * GRID_PX;
              const mY = floorY + floorH - mH; // 底部对齐地面
              const color = `var(${meta.color})`;

              return (
                <g key={m.id}>
                  <rect x={mX} y={mY} width={mW} height={mH} rx={2}
                    fill={color} fillOpacity={0.15} stroke={color} strokeWidth={0.8} />
                  <text x={mX + mW / 2} y={mY + mH / 2 + 3} textAnchor="middle"
                    fill={color} fontSize={8} fontFamily="var(--font-mono)">
                    {m.label ?? m.id}
                  </text>
                </g>
              );
            })}

            {/* 升降机 */}
            {lifts.map(l => {
              const lX = PAD + l.pos.col * GRID_PX + 4;
              const color = getMaterialColor(l.material);
              return (
                <g key={l.id}>
                  <line x1={lX} y1={floorY} x2={lX} y2={floorY + floorH}
                    stroke={color} strokeWidth={2} strokeDasharray="4 3"
                    style={{ animation: 'liftFlow 1.5s linear infinite' }} />
                  <text x={lX + 6} y={floorY + floorH / 2} fill={color} fontSize={7}
                    fontFamily="var(--font-mono)">
                    {l.material}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
```

- [ ] **Step 3: 接入 App**

在 `src/App.tsx` 中更新 canvas 区域：

```tsx
import { LinkedFloorView } from './views/LinkedFloorView';
import { CrossSectionView } from './views/CrossSectionView';
// ...
<main className="canvas-area">
  {currentScheme && viewMode === 'single' && (
    <FloorPlanView scheme={currentScheme} floorId={currentFloor} />
  )}
  {currentScheme && viewMode === 'linked' && (
    <LinkedFloorView scheme={currentScheme} />
  )}
  {currentScheme && viewMode === 'section' && (
    <CrossSectionView scheme={currentScheme} />
  )}
  {!currentScheme && (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
      加载方案中...
    </div>
  )}
</main>
```

- [ ] **Step 4: 提交**

```bash
git add src/views/LinkedFloorView.tsx src/views/CrossSectionView.tsx src/App.tsx
git commit -m "feat: add LinkedFloorView and CrossSectionView"
```

---

## Task 17: 物料链路高亮 + 运行时 API

**Files:**
- Modify: `src/store/useAppStore.ts` — 添加链路追踪逻辑
- Modify: `src/App.tsx` — 注册 `window.__factoryPlan` API

- [ ] **Step 1: 在 store 中实现链路追踪**

在 `src/store/useAppStore.ts` 中添加链路计算函数：

```typescript
// 在文件顶部添加
import type { Scheme } from '../core/types';

function traceChain(scheme: Scheme, beltId: string): string[] {
  const ids = new Set<string>();
  const belt = scheme.belts.find(b => b.id === beltId);
  if (!belt) return [];

  ids.add(beltId);

  // 追踪同物料的上下游
  const material = belt.material;

  // 递归向上追踪
  function traceUp(fromPort: string | undefined) {
    if (!fromPort) return;
    const machineId = fromPort.split(':')[0];
    ids.add(machineId);
    // 找到输入该机器的传送带
    for (const b of scheme.belts) {
      if (b.toPort?.startsWith(machineId + ':') && !ids.has(b.id)) {
        ids.add(b.id);
        traceUp(b.fromPort);
      }
    }
    // 找到关联的升降机
    for (const l of scheme.lifts) {
      if (l.material === material && !ids.has(l.id)) {
        if (l.connectedBelts?.some(bid => ids.has(bid))) {
          ids.add(l.id);
        }
      }
    }
  }

  // 递归向下追踪
  function traceDown(toPort: string | undefined) {
    if (!toPort) return;
    const machineId = toPort.split(':')[0];
    ids.add(machineId);
    for (const b of scheme.belts) {
      if (b.fromPort?.startsWith(machineId + ':') && !ids.has(b.id)) {
        ids.add(b.id);
        traceDown(b.toPort);
      }
    }
    for (const l of scheme.lifts) {
      if (l.material === material && !ids.has(l.id)) {
        if (l.connectedBelts?.some(bid => ids.has(bid))) {
          ids.add(l.id);
        }
      }
    }
  }

  traceUp(belt.fromPort);
  traceDown(belt.toPort);

  return [...ids];
}
```

在 store 的 `select` action 中集成链路追踪：

```typescript
select: (selectedId) => set((s) => {
  if (!selectedId || !s.currentScheme) return { selectedId, highlightChain: [] };
  // 如果选中的是传送带，追踪链路
  const isBelt = s.currentScheme.belts.some(b => b.id === selectedId);
  if (isBelt) {
    const chain = traceChain(s.currentScheme, selectedId);
    return { selectedId, highlightChain: chain };
  }
  return { selectedId, highlightChain: [] };
}),
```

- [ ] **Step 2: 注册运行时 API**

在 `src/App.tsx` 的 `useEffect` 中添加：

```typescript
useEffect(() => {
  (window as any).__factoryPlan = {
    importScheme: (json: string | object) => {
      const data: Scheme = typeof json === 'string' ? JSON.parse(json) : json;
      const warnings = validateScheme(data);
      if (warnings.length > 0) console.warn('Import warnings:', warnings);
      const idx = buildSchemeIndex(data, `runtime://${data.id}`);
      useAppStore.getState().setSchemes([...useAppStore.getState().schemes, idx]);
      useAppStore.getState().loadScheme(data);
    },
    getSchemes: () => useAppStore.getState().schemes,
    switchScheme: (id: string) => {
      const event = new CustomEvent('scheme-change', { detail: id });
      window.dispatchEvent(event);
    },
  };
}, []);
```

- [ ] **Step 3: 验证链路高亮**

运行 `npm run dev`，点击一条传送带，确认：
- 该传送带 + 上下游机器 + 关联升降机高亮
- 其他元素变暗

- [ ] **Step 4: 提交**

```bash
git add src/store/useAppStore.ts src/App.tsx
git commit -m "feat: add material chain highlighting and runtime import API"
```

---

## Task 18: 最终集成验证 + 清理

**Files:**
- 删除: `src/components/`（如果 Task 8 未删干净）
- 删除: `src/data/`
- 删除: `111`（设计规划临时文件）
- Modify: `.gitignore` — 添加 `.superpowers/`

- [ ] **Step 1: 清理所有旧文件**

```bash
rm -rf src/components src/data
rm -f 111
echo '.superpowers/' >> .gitignore
```

- [ ] **Step 2: 验证完整构建**

```bash
npx tsc --noEmit && npm run build
```

预期：无类型错误，构建成功。

- [ ] **Step 3: 运行所有测试**

```bash
npx vitest run
```

预期：所有 core 测试通过。

- [ ] **Step 4: 最终功能验证**

```bash
npm run dev
```

验证清单：
- [ ] 方案下拉可选择、切换
- [ ] 单层视图：网格、机器、传送带、电力、升降机正确渲染
- [ ] 联动视图：多层并排显示，缩放平移同步
- [ ] 剖面视图：侧面轮廓 + 升降机垂直线
- [ ] 楼层切换正常
- [ ] 图层开关控制各层显隐
- [ ] hover 机器显示 tooltip
- [ ] click 机器弹出详情
- [ ] click 传送带高亮物料链路
- [ ] 底部状态栏显示缩放比例

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat: complete factory-plan engineering rewrite with multi-scheme support"
```
