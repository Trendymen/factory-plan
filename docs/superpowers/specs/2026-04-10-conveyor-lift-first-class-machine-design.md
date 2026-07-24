# 传送带升降机升级为一等机器 — 设计文档

**日期**：2026-04-10
**状态**：设计已确认，待进入实现计划阶段
**作者**：Benliu + Claude

---

## 1. 背景与问题陈述

### 1.1 当前现象

`data/schemes/iron-full-line-v1.json` 中，两条"垂直传送带"（升降机）在视觉上以小虚线方块 + `↕2F` 标签形式出现在 F1 和 F2 上。这些方块：

- **没有真实占地矩形** — 仅画一个硬编码 2m×2m 的 SVG 方块
- **不可交互** — 无 onClick、无点击高亮
- **不连接任何传送带** — 所谓 `connectedBelts` 是一对"断头传送带"，belt 的 `fromPort` / `toPort` 并没有真正指向升降机
- **不参与任何几何校验** — R13 碰撞、R14 穿越、R16 端口对齐、R17 回头绕路对它全部失效
- **与 F2 布局存在隐式坐标反转假设** — F1 lift 在 row=6.5（南部），F2 接料 belt 起点在 row=0.25（北部），原作者心里假设"F2 上下翻转显示"让两者屏幕重合，但数据模型未表达这个假设，也没有校验强制

### 1.2 根因分析

**`conveyor-lift` 在 registry 中注册但被排除出 `PlaceableType`**（[src/core/registry.ts:55-60](../../../src/core/registry.ts#L55-L60) 与 [src/core/types.ts:36-45](../../../src/core/types.ts#L36-L45)），所以它永远进不了 `scheme.machines` 数组，也就永远不会经过 `MachineRenderer`、不会参与 R13 碰撞、不会被 belt 的 `machineId:portId` 引用。

升降机走的是一条**独立数据通道** `Lift`（[src/core/types.ts:87-95](../../../src/core/types.ts#L87-L95)）——只有 `pos/fromFloor/toFloor/connectedBelts`，没有 `facing`，不读 registry。`LiftRenderer` 硬编码绘制尺寸，不共享 `MachineRenderer` 的任何基础设施。

为了让"断头 belt"通过校验，`schema.ts:100-113` 专门写了 `liftConnectedBelts` 豁免，让它们跳过 R4 port 必填、跳过 R16 端口正交校验。这个豁免是架构债的症状。

### 1.3 目标

- 将升降机升级为一等 `MachineInstance`，拥有真实占地、真实端口、可被 belt 用 `id:portId` 对接
- 升降机自动参与所有几何校验（R13/R14/R16/R17），无需特殊豁免
- 升降机可交互（hover 高亮、click 选中）
- 升降机跨楼层身份（"F1/F2 上的同一台设备"）在数据模型中有明确表达
- 升降机的**物流方向**（向上 / 向下运输）在类型系统中有明确表达
- 废除 `schema.ts` 中所有 lift 相关豁免
- `iron-full-line-v1.json` 被新版本 `iron-full-line-v2.json` 取代，新版本在新数据模型下完整通过校验
- 为未来 F2 上下翻转（floorTransform）铺好底座但**本次不实现**

### 1.4 非目标

- **F2 上下翻转**（floorTransform 基础设施）：显式推迟到后续 PR。本次通过手工重建 F2 产线来绕开需求。
- **cross-section 视图的 lift 联动高亮**：本次仅做数据源切换，视觉行为不变。
- **LiftOverlay 的 pair 级选中联动**：onClick 仅传 pair id，不实现"同时高亮两层 lift 机器 + 配对连线"。
- **升降机 UI 面板**：MachinePanel / BeltPanel 不为 lift 新增特殊展示逻辑，升降机作为普通机器由通用面板处理。
- **双向升降机**（同时支持上下运输的单体）：YAGNI，不预留类型。

---

## 2. 数据模型变更

### 2.1 `BuildingType` / `PlaceableType`

`src/core/types.ts`：把 `conveyor-lift` 从 `BuildingType` 的旁支移除，并在 `PlaceableType` 中新增四个类型：

```ts
export type PlaceableType =
  | 'smelter' | 'foundry' | 'constructor' | 'assembler' | 'manufacturer'
  | 'splitter' | 'merger'
  | 'storage' | 'industrial-storage'
  | 'conveyor-lift-in-bottom'   // F1 底座：物料从这里进入，向上
  | 'conveyor-lift-out-top'     // F2 顶部：物料从这里吐出（来自下方）
  | 'conveyor-lift-in-top'      // F2 顶部：物料从这里进入，向下
  | 'conveyor-lift-out-bottom'; // F1 底座：物料从这里吐出（来自上方）

export type BuildingType = PlaceableType | StructureType;
```

旧的独立 `'conveyor-lift'` 条目从 `BuildingType` 删除。

### 2.2 `Lift` 接口删除，新增 `LiftPair`

删除 `Lift` 接口。新增：

```ts
export interface LiftPair {
  id: string;                    // pair 标识，如 "lift_plate"
  bottomMachine: string;         // 指向 scheme.machines 里 F1 的 lift 机器 id
  topMachine: string;            // 指向 scheme.machines 里 F2 的 lift 机器 id
  material: string;              // 物流元数据，用于 LiftOverlay 徽标 / cross-section 连线
  mark: BeltMark;                // 等级（沿用原 Lift.mark）
}
```

`Scheme.lifts: Lift[]` 字段替换为 `Scheme.liftPairs: LiftPair[]`。

### 2.3 `MachineInstance` 接口不变

`MachineInstance` **零改动**——没有 `liftDirection`、没有 `pairedWith`、没有 `topFloor`。升降机的所有特性完全由 `type` + `scheme.liftPairs` 表达，通用接口保持干净。

### 2.4 Registry 新增四条

`src/core/registry.ts`：删除旧的 `'conveyor-lift'` 条目，新增四条。所有四条共享以下字段：

```ts
{
  category: 'logistics',
  displayName: '传送带升降机',
  dimensions: { width: 2, length: 2, height: 7 },
  clearanceHeight: 7,
  color: '--lift',
  powerUsage: 0,
  stackable: false,
  wallMounted: false,
}
```

`ports` 字段差异：

| type | ports |
|---|---|
| `conveyor-lift-in-bottom` | `[port('bottom', 'belt-in', 'bottom', 1, 0)]` |
| `conveyor-lift-out-bottom` | `[port('bottom', 'belt-out', 'bottom', 1, 0)]` |
| `conveyor-lift-in-top` | `[port('top', 'belt-in', 'top', 1, 7)]` |
| `conveyor-lift-out-top` | `[port('top', 'belt-out', 'top', 1, 7)]` |

每条机器只声明它在当前楼层真实可接 belt 的那一个端口。底部口 `heightM=0`、顶部口 `heightM=7`（= 两层之间的物理高度）。

**合法 pair 类型组合**（R18 强制）：
- 向上运输：`conveyor-lift-in-bottom` (bottom) + `conveyor-lift-out-top` (top)
- 向下运输：`conveyor-lift-in-top` (top) + `conveyor-lift-out-bottom` (bottom)

---

## 3. 校验规则变更

### 3.1 新增 R18：LiftPair 一致性

`src/core/schema.ts` 新增校验块，对 `scheme.liftPairs` 的每一条 pair 检查：

1. **引用有效**（error）：`bottomMachine` / `topMachine` 必须在 `scheme.machines` 中存在
2. **类型合法**（error）：两台机器的类型必须组成合法组合之一
3. **楼层关系**（error）：`topMachine.floor === bottomMachine.floor + 1`（单层跨越；多层跨越由多个 pair 串联表达，不在本次范围）
4. **屏幕坐标对齐**（error）：两台机器在各自楼层 transform 之后必须落到同一屏幕坐标
5. **facing 一致**（warn）：两台机器的 `facing` 必须相同（异构 facing 不直接影响 2×2 方形占地，但属于语义坏味道）

规则 4 通过以下辅助函数实现，**这是未来 F2 翻转的主要挂点**：

```ts
function liftPairAligned(pair: LiftPair, scheme: Scheme): boolean {
  const bot = scheme.machines.find(m => m.id === pair.bottomMachine);
  const top = scheme.machines.find(m => m.id === pair.topMachine);
  if (!bot || !top) return false;
  // 当前：直接比 pos 相等（所有 floor.transform 为 identity）
  // 未来引入 Floor.transform 后：先对两端 pos 应用各自楼层的 transform 再比较
  return Math.abs(bot.pos.col - top.pos.col) < 0.001
      && Math.abs(bot.pos.row - top.pos.row) < 0.001;
}
```

### 3.2 废除 R4 的 `liftConnectedBelts` 豁免

`schema.ts:100-113` 中的 `liftConnectedBelts` Set 构建以及 R4 `fromPort`/`toPort` 的豁免分支**全部删除**。升级后，接入升降机的 belt 必须显式写 `fromPort: "lift_plate_bot:bottom"` / `toPort: "lift_plate_top:top"` 这类端口引用。所有现有 R4/R5/R14/R15/R16/R17 校验自动覆盖 lift 连接，不再有特殊通道。

### 3.3 废除旧 R10 Lift 校验块

`schema.ts:170-184` 对 `scheme.lifts` 的整段校验删除。R10 原本做的两件事——楼层引用检查、`connectedBelts` 引用检查——分别由 R1（机器楼层）和 R5（belt 端口引用）自动接管。

### 3.4 R12 唯一 ID 检查更新

`schema.ts:189-203` 的 `allElementIds` 数组里移除 `scheme.lifts.map(l => l.id)`，新增 `scheme.liftPairs.map(p => p.id)`。liftPair id 与 machine id 共享同一 ID 空间，避免 `lift_plate` pair id 与某个 machine 重名。

---

## 4. 渲染层变更

### 4.1 `LiftRenderer.tsx` 改造为 `LiftOverlay`

当前 `src/renderers/LiftRenderer.tsx`（硬编码 2m 方块 + `↕2F`）整体重写为 `LiftOverlay`。职责转变：从"独立绘制升降机"变为"为已由 `MachineRenderer` 画好的 lift 机器叠加跨楼层徽标"。

接口：

```ts
interface LiftOverlayProps {
  pairs: LiftPair[];
  machines: MachineInstance[];
  floorId: number;
  highlightChain: string[];
  onHover?: (id: string | null) => void;
  onClick?: (id: string) => void;
}
```

**徽标内容推导**：对每一对 pair，判断"当前楼层是 pair 的 bottom 还是 top"，然后按本楼层机器的类型决定徽标符号与目标楼层：

| 本楼层机器类型 | 符号 | 目标楼层 |
|---|---|---|
| `conveyor-lift-in-bottom` | `↑` | top machine 的 floor |
| `conveyor-lift-out-top` | `↑` | bottom machine 的 floor |
| `conveyor-lift-in-top` | `↓` | bottom machine 的 floor |
| `conveyor-lift-out-bottom` | `↓` | top machine 的 floor |

徽标文本例如 `↑2F` / `↓1F`。渲染为 SVG `<g>`：半透明圆角矩形背景 + `<text>`，叠在机器占地 bbox 的**右上角内侧**（具体偏移在实现时微调，避免压到端口圆点和 id 标签）。

**交互**：整个 overlay `<g>` 响应 onMouseEnter / onClick，事件目标传 **pair.id**（不是 machine.id），为未来"选中 pair 同时高亮两层机器 + 连线"留口子。本次仅做基础事件触发。

### 4.2 `MachineRenderer.tsx` 零改动

`MachineRenderer` 不加任何 lift 分支、不读 `liftPairs`、不关心类型前缀。升降机机器走通用路径：自动获得占地矩形、端口圆点、id 标签、点击高亮。

### 4.3 `FloorPlanView.tsx` 调整

删除当前的 `lifts` 过滤与 `LiftRenderer` 循环（`FloorPlanView.tsx:41, 72-74`），替换为对 `scheme.liftPairs` 的遍历，渲染 `LiftOverlay`。升降机机器本身自动由通用 `machines.filter(...).map(MachineRenderer)` 那一条渲染，不需要特殊分支。

### 4.4 `CrossSectionView.tsx` 调整

将 `scheme.lifts.filter(...)` 替换为从 `scheme.liftPairs` 出发，通过 `bottomMachine` / `topMachine` id 反查对应 `MachineInstance` 的 `pos` / `floor` 画跨层连线。`lift.material` / `lift.mark` 改读 `pair.material` / `pair.mark`。行为输出不变。

### 4.5 `useAppStore.ts` 影响

store 中引用 lift 的地方（highlight chain 等）改为把 lift **机器 id**（不是 pair id）放进高亮链。pair 级高亮是后续工作。

---

## 5. 方案迁移：v1 → v2 手工重建

### 5.1 文件变更

```
data/schemes/
  iron-full-line-v1.json    ← ❌ 删除
  iron-full-line-v2.json    ← ✨ 新建：手工重建 F2 的版本
```

`scheme.id = "iron-full-line-v2"`、`name = "铁全产线 v2"`。SchemeIndex 通过 `import.meta.glob('/data/schemes/*.json')` 自动注册新文件、自动移除旧文件，无需额外代码改动。

### 5.2 F1 保持不变（含 b2 微调）

F1 的 machines / belts / structures / zones 全部从 v1 原样 clone，**仅允许**对 `lift_plate` / `lift_rod` 对应的 bottom machine 的 `pos.row` 在 `{6.25, 6.5, 6.75}` 之间做 ±0.25 微调，以换取 F2 重建时的空间灵活度。`pos.col` 必须保持 `1.5` / `5.5`（F1 产线已按此 col 主轴对齐，动了会破坏 F1 自身的 R16/R17）。

### 5.3 F2 手工重建：尺度 2

**约束**：
- **生产机器保持**：4 台螺丝 constructor（`screw1`-`screw4`）、`rotor` 装配站、`store_rotor` 储存箱的数量、种类、recipe、label **不变**。
- **物流机器可重排**：分流/合流器（splitter/merger）的数量、位置、端口走向可按新物流方向自由调整。
- **物流方向翻转**：从原先的 **north→south** 改为 **south→north**，让接料点落在 F1 lift 同 col 的南部区域。

**新 F2 物流方向（概念草图）**：

```
row 6.5 ← 南边：lift pair 落点
   ├─ lift_plate_top (col 1.5, 接料 belt-out)
   └─ lift_rod_top   (col 5.5, 接料 belt-out)

   ↓ 接料分流（新布局：替代原 sp_plate_2f / sp_rod_2f_1/2/3）
   ↓ 铁棒二次分流

row 4-5 ← 4 台螺丝 constructor（screw1-4，保留 id/label/recipe）
   ↓ sp_screw_route（重排）
   
row 2-3 ← rotor assembler（保留 id/label/recipe）
   ↓
   
row 0-1 ← store_rotor（保留 id/label，作为北部新终点）
```

**实现顺序**（细节留给 plan）：
1. 从 v1 完整 clone 为 v2，仅保留 F1 部分原样
2. 删除 F2 所有 machines/belts，保留 floors/zones 定义
3. 添加两条 lift pair 的 top machine（位置与 F1 bot 相等）+ `liftPairs` 条目
4. 按新物流方向从南到北手工排布生产机器（保持 id/label/recipe）
5. 按 south→north 方向重新设计分流/合流器 + belt 路径
6. 跑 `npx vitest run` 迭代修正 R13/R14/R16/R17/R18 报错
7. 浏览器打开逐层检查视觉效果

### 5.4 验收标准

**`iron-full-line-v2.json` 必须满足**：

- `validateSchemeDetailed(scheme).filter(i => i.severity === 'error').length === 0`
- `severity: 'warn'` 仅允许来自：lift 端口 `offsetAlongEdge = 1m = 0.125 grid` 偏移引入的 R2/R8 对齐告警。**不允许** R4 / R13 / R14 / R15 / R16 / R17 / R18 相关的任何 warn 或 error。
- 浏览器打开方案：
  - F1 和 F2 各自显示两个升降机 2×2 机器占地 + 端口圆点
  - F1 的 lift 机器叠加 `↑2F` 徽标，F2 叠加 `↑1F` 徽标
  - 两层的 lift 在屏幕上落在相同 `(col, row)`
  - 接入 lift 的 belt 在两层都能画出 `BeltRenderer` 的正常端点箭头
  - 鼠标 hover 升降机徽标或占地矩形触发高亮
  - F2 产线语义上仍是"接铁板铁棒 → 螺丝 → 转子 → 入库"，仅物理方向从南流向北

**新增 vitest 用例** `src/__tests__/schema.test.ts`：加载 v2 并断言 error 数量为 0。原针对 v1 的用例若存在，应同步迁移或删除。

---

## 6. 风险与未来挂点

### 6.1 风险

- **R18 的 "pos 相等" 约束暴露了 v1 的隐式 F2 flip 假设**：这是本次发现的设计债务，原作者依赖肉眼对齐而非数据模型。重建 F2 绕开这个债务但不还它；还债时机是未来的 F2 flip。
- **b2 允许的 F1 lift 位置微调**在 review 时可能被误读为"动 F1 产线"。PR 描述需显式列出哪些 F1 元素被动过及理由。
- **F2 分流/合流器重排（a2 尺度 2）**可能引入新的 R15 线段重叠或 R17 绕路问题，需在迭代中逐一消除。
- **LiftOverlay 的事件目标是 pair id 而其他 overlay 传 machine id**：store / highlight 链需要能同时承载两种 id 类型；本次先只传事件不做联动，但需要在实现时确认 store 的 API 允许非 machine id。

### 6.2 未来挂点

- **floorTransform 钩子**：R18 的 `liftPairAligned(pair, scheme)` 函数内部预留"未来先对 pos 应用 floor.transform 再比较"的注释。未来 F2 翻转只需在 `Floor` 接口加 `transform` 字段 + 修改此函数实现，不改签名、不改调用点。
- **LiftPair 物流元数据扩展**：`LiftPair` 接口目前只有 `material`/`mark`，未来可扩展为 `expectedRate` / `saturation` / `bottleneck` 等物流分析字段。
- **pair 级高亮联动**：`LiftOverlay` 的 onClick 已传 pair id；后续扩展 highlightChain 语义让一次选中同时高亮两层机器 + cross-section 连线。
- **双向升降机类型**：若未来出现物理双向升降机，需在 registry 加第 5 种 `conveyor-lift-duplex`，R18 合法 pair 类型集更新。本次**不预留**此口子（YAGNI）。

---

## 7. 影响面速查表

### 7.1 代码文件

| 文件 | 变更 |
|---|---|
| `src/core/types.ts` | `PlaceableType` 新增 4 类型；删除旧 `'conveyor-lift'` 分支；`Lift` 删除；新增 `LiftPair`；`Scheme.lifts` → `Scheme.liftPairs` |
| `src/core/registry.ts` | 删除 `'conveyor-lift'`；新增 4 条 lift 类型条目 |
| `src/core/schema.ts` | 新增 R18；删除 R4 `liftConnectedBelts` 豁免；删除旧 R10 lift 校验块；R12 ID 集合更新 |
| `src/renderers/LiftRenderer.tsx` | 重写为 `LiftOverlay`（改文件名或导出名） |
| `src/renderers/MachineRenderer.tsx` | **零改动** |
| `src/views/FloorPlanView.tsx` | 删除 `lifts` 过滤与 LiftRenderer 循环；改为 `liftPairs` + LiftOverlay |
| `src/views/CrossSectionView.tsx` | 数据源 `scheme.lifts` → `scheme.liftPairs` |
| `src/store/useAppStore.ts` | lift 相关高亮链引用从 lift id 改为 lift machine id |
| `src/__tests__/schema.test.ts` | 新增 R18 / lift-as-machine 用例；加载 v2 方案并断言 error=0 |
| `src/__tests__/beltGeometry.test.ts` | 若涉及 lift 端口计算需核查 |

### 7.2 数据文件

| 文件 | 变更 |
|---|---|
| `data/schemes/iron-full-line-v1.json` | **删除** |
| `data/schemes/iron-full-line-v2.json` | **新建**，内容遵循 5.2 / 5.3 |

### 7.3 不涉及的文件

`CLAUDE.md` 规则文档本次不改——R18 是新增规则，不需要修改现有的 R1-R17 条款；同轴对齐规则继续有效。

---

## 8. 确认的设计选择

| 决策点 | 选项 | 核心理由 |
|---|---|---|
| 升降机架构路线 | 升级为一等 `MachineInstance` | 所有几何校验自动覆盖，消除 `liftConnectedBelts` 豁免的技术债 |
| 跨楼层建模 | 成对机器 | 保持 `MachineInstance` "单楼层"不变量，R13/R14 免分叉维护 |
| 持久化形态 | 双显式机器 + 顶层 `liftPairs` 索引 | JSON 即真相，校验器保持纯函数，未来 transform 扩展只改一个函数 |
| 端口建模 | 四个静态类型（in-bottom / out-bottom / in-top / out-top） | 类型即合同；方向、端口位置、端口 kind 全部写死在 registry，消费方零改动 |
| 视觉识别 | `MachineRenderer` 零改 + 独立 `LiftOverlay` 图层 | 通用 renderer 保持纯净，lift 特有跨楼层视觉集中一处 |
| F2 重建范围 | 尺度 2 + F1 lift 允许 ±0.25 微调 | 生产机器固定保证语义稳定；物流机器可重排适应新方向 |
| 方案文件组织 | 仅保留 v2，删除 v1，不做镜像备份 | c1 机械镜像与 R18 约束内在冲突，留着只会稀释注意力 |
