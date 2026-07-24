# Factory Plan 工程化重构设计文档

> 日期：2026-04-08
> 状态：待审核
> 方案：全部重写（方案 B）

---

## 1. 项目定位

Factory Plan 是一个 Satisfactory（幸福工厂）的**工厂蓝图查看系统**。

- 蓝图/方案由 AI 生成，用户只负责查看和切换
- 所有交互围绕"查看更方便"设计，无拖拽编辑功能
- 坐标和机器占地与游戏内 1:1 对应，确保方案可在游戏中原样复刻
- 蓝图概念对标游戏官方蓝图系统，是纯展示层的可视化组件库

## 2. 需求清单

| # | 需求 | 说明 |
|---|------|------|
| 1 | 多方案切换 | 下拉列表切换不同工厂设计方案 |
| 2 | 正方形网格 | 1 格 = 1 地基 = 8m x 8m |
| 3 | 精确机器尺寸 | 按 Wiki 数据校准，支持 facing 旋转 |
| 4 | 精确端口位置 | 端口坐标尽可能贴近游戏实际，支持后续精度提升 |
| 5 | 多层支持 | 多层工厂、单层工厂、模块化蓝图 |
| 6 | 垂直空间展现 | 并排联动俯视图 + 侧视剖面图 |
| 7 | JSON 数据驱动 | JSON 文件为主存储，预留运行时 API 导入 |
| 8 | UI 重设计 | 暗色主题，三栏布局，现代化风格 |
| 9 | 结构件支持 | 墙壁孔、挂墙/吊顶传送带支架、墙插电源 |
| 10 | 物料链路追踪 | 点击传送带高亮整条物料链路（含跨层） |

**近期具体目标**：铁矿/铜矿/石灰石在钢之前的全产物、储存、输出多层工厂设计。

**布局优化原则**：
- 电力优先使用墙插（Wall Outlet）而非落地电线杆
- 传送带使用墙壁孔（Wall Conveyor Hole）穿墙
- 使用挂墙/吊顶传送带支架让出地面可行走区域
- 充分利用垂直空间

## 3. 技术栈

- React 19 + TypeScript
- Vite 6 构建
- Zustand 状态管理
- Motion 动画库（已有）
- @floating-ui/react Tooltip 定位（已有）
- SVG 声明式渲染

## 4. 目录结构

```
src/
├── core/                        # 纯数据层，零 UI 依赖
│   ├── types.ts                 # 所有类型定义
│   ├── schema.ts                # JSON Schema 验证 + 加载
│   ├── coordinate.ts            # 坐标系统（网格↔SVG↔游戏米制）
│   └── registry.ts              # 建筑注册表（尺寸、端口、颜色元数据）
│
├── renderers/                   # SVG 绘制函数，纯函数组件
│   ├── MachineRenderer.tsx      # 机器绘制
│   ├── BeltRenderer.tsx         # 传送带绘制
│   ├── PowerRenderer.tsx        # 电力网络绘制
│   ├── LiftRenderer.tsx         # 升降机绘制
│   ├── SplitterRenderer.tsx     # 分流/合流器绘制
│   ├── ZoneRenderer.tsx         # 布局分区绘制
│   └── GridRenderer.tsx         # 正方形网格绘制
│
├── views/                       # 视图容器
│   ├── FloorPlanView.tsx        # 单层俯视图
│   ├── LinkedFloorView.tsx      # 并排联动俯视图
│   ├── CrossSectionView.tsx     # 侧视剖面图
│   └── ViewportControls.tsx     # 缩放/平移/重置控件
│
├── ui/                          # UI 面板组件
│   ├── SchemeSelector.tsx       # 方案下拉选择器
│   ├── FloorTabs.tsx            # 楼层切换
│   ├── LayerToggles.tsx         # 图层开关
│   ├── StatsPanel.tsx           # 产能/电力统计
│   ├── BuildList.tsx            # 建造清单
│   ├── Legend.tsx               # 图例
│   ├── MachineTooltip.tsx       # 悬停提示
│   └── MachineDetail.tsx        # 机器详情弹窗
│
├── store/                       # 状态管理
│   └── useAppStore.ts           # Zustand store
│
├── App.tsx                      # 顶层布局
├── main.tsx                     # 入口
└── styles/
    └── theme.css                # CSS 变量 + 暗色主题 + 动画

data/                            # 项目根目录下
└── schemes/                     # JSON 方案文件
    ├── _schema.json             # JSON Schema 定义
    └── *.json                   # 各方案数据文件
```

**模块职责边界**：

- `core/` — 零依赖 React，纯 TypeScript，可单独测试
- `renderers/` — 纯函数组件，只接收数据和坐标系，不持有状态
- `views/` — 组合 renderers + 视口管理（缩放/平移）
- `ui/` — 交互面板，从 store 读状态
- `data/schemes/` — 在 src 外部，JSON 文件可独立管理

## 5. 核心数据模型（core/types.ts）

### 坐标与尺寸

```typescript
/** 游戏内米制尺寸 */
interface Dimensions {
  width: number;   // 米
  length: number;  // 米
  height: number;  // 米
}

/** 网格坐标（1单位=1地基=8m） */
interface GridPos {
  col: number;
  row: number;
}

/** 朝向（决定输入/输出端口方向） */
type Facing = 'north' | 'south' | 'east' | 'west';
```

### 端口定义

```typescript
interface PortDef {
  id: string;                // 'in-0', 'out-0', 'power-0'
  kind: 'belt-in' | 'belt-out' | 'pipe-in' | 'pipe-out' | 'power';
  side: 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';
  offsetAlongEdge: number;   // 沿该边的偏移（米）
  heightM: number;           // 距地面高度（米）
  direction: 'outward';
}
```

### 建筑类型

```typescript
type BuildingCategory = 'production' | 'logistics' | 'storage' | 'power' | 'structure';

type BuildingType =
  // 生产
  | 'smelter' | 'foundry' | 'constructor' | 'assembler' | 'manufacturer'
  // 物流
  | 'splitter' | 'merger' | 'conveyor-lift'
  // 存储
  | 'storage' | 'industrial-storage'
  // 电力（优先墙插）
  | 'wall-outlet-mk1' | 'wall-outlet-mk2' | 'wall-outlet-mk3'
  | 'double-wall-outlet-mk1' | 'double-wall-outlet-mk2' | 'double-wall-outlet-mk3'
  | 'power-pole-mk1' | 'power-pole-mk2' | 'power-pole-mk3'
  // 结构件
  | 'wall-conveyor-hole' | 'wall-pipe-hole'
  | 'conveyor-wall-mount' | 'conveyor-ceiling-mount' | 'conveyor-floor-stand';
```

### 方案数据实例

```typescript
/** 生产机器 + 物流设备实例（不含电力和结构件，它们有独立数组） */
type PlaceableType =
  | 'smelter' | 'foundry' | 'constructor' | 'assembler' | 'manufacturer'
  | 'splitter' | 'merger'
  | 'storage' | 'industrial-storage';

interface MachineInstance {
  id: string;
  type: PlaceableType;
  pos: GridPos;
  facing: Facing;
  floor: number;
  recipe?: string;
  clockSpeed?: number;   // 默认 100
  label?: string;
}

interface BeltSegment {
  id: string;
  floor: number;
  mark: 1 | 2 | 3 | 4 | 5 | 6;
  material: string;
  path: GridPos[];
  fromPort?: string;     // "machine-id:port-id"
  toPort?: string;
}

interface Lift {
  id: string;
  pos: GridPos;
  mark: 1 | 2 | 3 | 4 | 5 | 6;
  fromFloor: number;
  toFloor: number;
  material: string;
  connectedBelts?: [string, string];
}

interface PowerPole {
  id: string;
  type: BuildingType;    // wall-outlet-mk2 等
  pos: GridPos;
  floor: number;
  wallSide?: 'north' | 'south' | 'east' | 'west';
}

interface PowerConnection {
  from: string;
  to: string;
}

interface StructureInstance {
  id: string;
  type: BuildingType;    // wall-conveyor-hole 等
  pos: GridPos;
  floor: number;
  wallSide?: 'north' | 'south' | 'east' | 'west';
  heightM?: number;      // 安装高度
}

interface Zone {
  id: string;
  floor: number;
  pos: GridPos;
  size: { w: number; h: number };
  kind: string;
  label: string;
  color?: string;
}

interface Floor {
  id: number;
  label: string;
  heightM: number;
  gridSize: { cols: number; rows: number };
}
```

### 顶层方案结构

```typescript
interface Scheme {
  id: string;
  name: string;
  version: string;
  category: string;
  description: string;
  designPrinciples: {
    preferWallOutlets: boolean;
    preferWallHoles: boolean;
    preferCeilingMounts: boolean;
    keepFloorClear: boolean;
  };
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
```

## 6. 坐标系统（core/coordinate.ts）

```typescript
const GRID_PX = 80;           // 1 网格 = 80px（正方形）
const METERS_PER_GRID = 8;    // 1 网格 = 8m = 1 地基
const PAD = 40;               // 画布内边距 px

// 网格坐标 → SVG 像素
gridToSvg(col, row) → { x: col * GRID_PX + PAD, y: row * GRID_PX + PAD }

// SVG 像素 → 网格坐标（hover 命中检测）
svgToGrid(x, y) → { col, row }

// 网格坐标 → 游戏米制（tooltip 显示）
gridToMeters(col, row) → { x: col * 8, y: row * 8 }
```

**机器渲染坐标计算流程**：

1. 查注册表得到米制尺寸 → 转网格尺寸（除以 8）
2. 根据 facing 决定宽长映射到 col/row 方向
3. `gridToSvg` 得到 SVG 矩形坐标
4. 端口位置 = 机器矩形边缘 + `portDef.side` + `portDef.offsetAlongEdge`（facing 旋转后）

**Facing 旋转映射**：

| facing | front→ | back→ | left→ | right→ |
|--------|--------|-------|-------|--------|
| south（默认） | 下 | 上 | 右 | 左 |
| north（180°） | 上 | 下 | 左 | 右 |
| east（90°CW） | 右 | 左 | 下 | 上 |
| west（90°CCW）| 左 | 右 | 上 | 下 |

**剖面图坐标**：独立坐标系，X 轴 = 俯视图切面方向，Y 轴 = 垂直高度（由 `floor.heightM` 累加）。

**并排联动视图**：两个 FloorPlanView 共享同一个 viewport 状态，任一侧操作同步。

## 7. 建筑注册表（core/registry.ts）

```typescript
interface BuildingMetadata {
  type: BuildingType;
  category: BuildingCategory;
  displayName: string;
  dimensions: Dimensions;
  clearanceHeight: number;     // 碰撞箱高度
  ports: PortDef[];
  color: string;               // CSS 变量名
  powerUsage: number;          // MW
  stackable: boolean;
  wallMounted: boolean;
}
```

**已校准的生产机器数据（Wiki 数据源）**：

| 类型 | 尺寸 (m) | 碰撞高 (m) | 端口 | 功耗 |
|------|----------|-----------|------|------|
| smelter | 6×9×9 | 9 | 1in(back) + 1out(front) | 4 MW |
| foundry | 10×9×9 | 9 | 2in(back) + 1out(front) | 16 MW |
| constructor | 8×10×8 | 8 | 1in(back) + 1out(front) | 4 MW |
| assembler | 10×15×10 | 10 | 2in(back) + 1out(front) | 15 MW |
| manufacturer | 18×20×12 | 8 | 4in(**front**) + 1out(back) | 55 MW |
| storage | 5×10×4 | 4 | 1in + 1out | 0 |
| industrial-storage | 5×10×8 | 8 | 2in + 2out | 0 |
| splitter | 4×4×3 | 3 | 1in(back) + 3out(front/left/right) | 0 |
| merger | 4×4×3 | 3 | 3in(back/left/right) + 1out(front) | 0 |

注意：制造站是唯一输入在前方的生产机器。

**端口精度分级策略**：

- Level 1（当前）：基于 Wiki + 社区测量的近似值
  - 传送带端口高度统一 1m，位置居中或对称分布
- Level 2（后续）：从游戏存档文件反算精确坐标
- Level 3（理想）：直接解析 UAsset 中的 UFGFactoryConnectionComponent

## 8. 渲染器设计（renderers/）

所有渲染器遵循统一模式：

```typescript
interface RendererProps<T> {
  data: T;
  coord: CoordinateSystem;
  interactive?: boolean;
  highlight?: boolean;
  dimmed?: boolean;
}
```

**MachineRenderer**：占地矩形（虚线，精确尺寸）+ 主体矩形（实心带颜色）+ 名称/功耗标签 + 端口标记（hover 时显示）。

**BeltRenderer**：polyline 路径 + 流动动画（CSS stroke-dashoffset）+ 物料颜色查表 + 标签芯片 + 箭头。线宽随 mark 等级变化。

**PowerRenderer**：电源到机器的连线（金色虚线脉冲动画）。墙插渲染为贴墙标记。

**LiftRenderer**：俯视图中为小方块 + 箭头标注；剖面图中为垂直贯穿线 + 物料/速率标签。

**GridRenderer**：正方形网格 + 列/行标号 + 可选 0.5 地基细分线。

## 9. 视图系统（views/）

### FloorPlanView — 单层俯视图
- 正方形网格 SVG 画布
- 鼠标滚轮缩放（0.3x~3x）+ 拖拽平移
- 楼层切换下拉
- 所有渲染器按图层 z-order 叠加

### LinkedFloorView — 并排联动俯视图
- 所有楼层水平并排显示
- 共享 viewport 状态（zoom/pan 同步）
- 升降机跨层虚线关联，hover 时两侧同时高亮
- 超过 3 层时水平滚动

### CrossSectionView — 侧视剖面图
- 上方小型俯视图选择切面位置（点击某行/列）
- 下方展示该切面的侧视图
- 显示：楼层高度比例、机器侧面轮廓、升降机垂直线、吊顶/挂墙传送带、可行走区域标记

### 视图切换
TopBar 中三个按钮：`[单层] [联动] [剖面]`，对应 store 中 `viewMode` 状态。

## 10. UI 布局

```
┌─ TopBar ──────────────────────────────────────────────┐
│ 🏭 Factory Plan    [方案▼]   [单层|联动|剖面]    [⚙]  │
├─ LeftPanel ─┬─ Canvas ──────────────────┬─ RightPanel ┤
│ 楼层导航    │                            │ 产能统计    │
│ 图层控制    │       SVG 主画布           │ 电力统计    │
│ 缩略地图    │                            │ 建造清单    │
│             │                            │ 图例        │
├─ BottomBar ─┴────────────────────────────┴─────────────┤
│ 坐标: (3,5) = 24m,40m     缩放: 100%     网格: 8m     │
└────────────────────────────────────────────────────────┘
```

**响应式**：
- `>1400px`：三栏
- `900-1400px`：两栏（左面板折叠为图标栏）
- `<900px`：画布全屏，面板通过底部抽屉唤出

**关键交互**：
- 方案切换 → 全局联动刷新
- hover 机器 → MachineTooltip
- click 机器 → MachineDetail 弹窗
- click 传送带 → 高亮整条物料链路（含跨层）
- hover 升降机（联动视图）→ 两侧同时高亮

## 11. 状态管理（store/useAppStore.ts）

```typescript
interface AppState {
  // 方案
  schemes: SchemeIndex[];
  currentSchemeId: string | null;
  currentScheme: Scheme | null;

  // 视图
  viewMode: 'single' | 'linked' | 'section';
  currentFloor: number;
  sectionCut: { axis: 'col' | 'row'; position: number } | null;

  // 视口
  viewport: { zoom: number; panX: number; panY: number };

  // 图层
  layers: {
    belts: boolean;
    power: boolean;
    zones: boolean;
    structures: boolean;
    storage: boolean;
  };

  // 交互
  hoveredId: string | null;
  selectedId: string | null;
  highlightChain: string[];

  // Actions
  loadScheme: (id: string) => Promise<void>;
  setViewMode: (mode: ViewMode) => void;
  setFloor: (floor: number) => void;
  setSectionCut: (cut: SectionCut | null) => void;
  setViewport: (vp: Partial<Viewport>) => void;
  toggleLayer: (key: keyof Layers) => void;
  hover: (id: string | null) => void;
  select: (id: string | null) => void;
}
```

**方案加载策略**：使用 Vite 的 `import.meta.glob('/data/schemes/*.json', { eager: false })` 在编译时收集方案文件路径，运行时按需动态 import 加载完整 JSON。每个 JSON 文件顶部的 `id/name/category/description` 作为索引元数据。已加载方案缓存在内存中。

**物料链路高亮**：click 传送带 → 递归追踪 fromPort 上游 + toPort 下游 → 跨层时包含升降机 → 所有关联 ID 写入 `highlightChain` → 非链路元素 dimmed。

## 12. 暗色主题设计语言

### 基础色板

```css
--bg-primary: #0f1419;        /* 页面背景 */
--bg-secondary: #1a2332;      /* 面板背景 */
--bg-canvas: #0a0e14;         /* SVG 画布 */
--border: #2a3a4e;
--text-primary: #e0e8f0;
--text-secondary: #7eb8da;
--text-muted: #556677;
```

### 机器颜色

```css
--smelter: #ff6b35;            --foundry: #ff8f00;
--constructor: #00bcd4;        --assembler: #ce93d8;
--manufacturer: #ef5350;       --storage: #8d6e63;
--splitter: #ffd740;           --merger: #69f0ae;
```

### 物料颜色（传送带着色）

```css
--mat-iron-ore: #a0782c;       --mat-iron-ingot: #ff6b35;
--mat-iron-plate: #00bcd4;     --mat-iron-rod: #448aff;
--mat-screw: #66bb6a;          --mat-copper-ore: #e67333;
--mat-copper-ingot: #ff7043;   --mat-wire: #ef5350;
--mat-cable: #c62828;          --mat-copper-sheet: #ff8a65;
--mat-limestone: #bdbdbd;      --mat-concrete: #9e9e9e;
--mat-reinforced-plate: #00838f; --mat-rotor: #7c4dff;
--mat-modular-frame: #aa00ff;
```

### 功能色

```css
--power: #ffd740;
--structure: #78909c;
--walkable: #1b5e20;
```

### 动画

- 传送带流动：CSS `stroke-dashoffset` 动画，速率随 mark 等级加快（Mk.1 = 2s, Mk.6 = 0.3s）
- 电力脉冲：金色虚线流动动画
- 升降机垂直流动（剖面图）
- 交互反馈：hover = `brightness(1.3)`, highlight = `brightness(1.5) + drop-shadow`, dimmed = `opacity: 0.25`

## 13. JSON 方案文件格式

一个 JSON 文件 = 一个完整方案。存放于 `data/schemes/` 目录。

结构遵循 `Scheme` 接口定义（见第 5 节）。

加载时验证关键约束：
1. 所有 `machine.type` 在 `BUILDING_REGISTRY` 中存在
2. 所有 `belt.fromPort/toPort` 引用有效
3. 所有 `lift.connectedBelts` 引用有效
4. 所有 `power.connections` 引用有效
5. `floor.id` 唯一且连续
6. 所有元素的 `floor` 在范围内

验证失败不阻断加载，输出 console warning，UI 中标记问题元素。

## 14. 运行时导入 API（预留）

```typescript
window.__factoryPlan = {
  importScheme: (json: string | object) => void,
  getSchemes: () => SchemeIndex[],
  switchScheme: (id: string) => void,
};
```

供 AI 生成方案后通过浏览器 console 或自动化脚本注入。

## 15. 与现有代码的差异总结

| 维度 | 现有 | 重构后 |
|------|------|--------|
| 数据 | 硬编码 TS 常量 | JSON 文件 + Schema 验证 |
| 网格 | 非正方形 (95×78) | 正方形 (80×80), 1格=1地基=8m |
| 机器尺寸 | 近似值 | Wiki 校准精确值 |
| 端口 | 手工硬编码坐标 | 注册表元数据 + facing 旋转计算 |
| 方案 | 单方案 | 多方案切换 |
| 视图 | 单层切换 + 简单剖面 | 单层/联动/剖面三模式 |
| 布局 | 画布 + 右侧栏 | 三栏（左导航+画布+右信息） |
| 建筑类型 | 生产机+储存 | +墙插+墙壁孔+传送带支架 |
| 状态管理 | useState 分散 | Zustand 集中管理 |
| 物料链路 | 无 | 点击高亮整条链路 |
