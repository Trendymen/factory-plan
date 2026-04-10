# 传送带升降机一等机器化 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把升降机（vertical conveyor lift）从独立的 `Lift` 数据/渲染通道升级为一等 `MachineInstance`，参与所有几何校验、支持真实端口对接和交互，并同步手工重建 `iron-full-line` 方案的 F2 产线以满足新约束。

**Architecture:** 把 `conveyor-lift` 拆成 4 个静态 `PlaceableType`（in-bottom / out-bottom / in-top / out-top），通过跨楼层成对机器 + 顶层 `LiftPair` 索引表达"一台物理升降机"。校验层新增 R18（pair 一致性）并删除 R4/R10 的 lift 豁免。渲染层 `MachineRenderer` 零改动，新建 `LiftOverlay` 图层叠加跨楼层徽标。方案文件从 v1 迁移到手工重建的 v2，F2 产线物流方向由 north→south 翻转为 south→north。

**Tech Stack:** TypeScript, React 19, Zustand, Vitest, Vite 6 (参考 [CLAUDE.md](../../../CLAUDE.md) 项目规则)

**Spec:** [2026-04-10-conveyor-lift-first-class-machine-design.md](../specs/2026-04-10-conveyor-lift-first-class-machine-design.md)

---

## 文件结构总览

| 文件 | 动作 | 责任 |
|---|---|---|
| [src/core/types.ts](../../../src/core/types.ts) | modify | `PlaceableType` 新增 4 类型；删除 `Lift` 接口；新增 `LiftPair` 接口；`Scheme.lifts` → `Scheme.liftPairs` |
| [src/core/registry.ts](../../../src/core/registry.ts) | modify | 删除旧 `'conveyor-lift'`；新增 4 条 lift 类型条目 |
| [src/core/schema.ts](../../../src/core/schema.ts) | modify | 新增 R18 校验；删除 R4 `liftConnectedBelts` 豁免；删除旧 R10 lift 校验块；更新 R12 ID 集合 |
| [src/renderers/LiftRenderer.tsx](../../../src/renderers/LiftRenderer.tsx) | rewrite | 改名为 `LiftOverlay`，职责从"独立绘制"变为"跨楼层徽标叠加层" |
| [src/renderers/MachineRenderer.tsx](../../../src/renderers/MachineRenderer.tsx) | **no change** | 通用机器渲染，零改动 |
| [src/views/FloorPlanView.tsx](../../../src/views/FloorPlanView.tsx) | modify | 删除 `lifts` 过滤与 `LiftRenderer` 循环；改为遍历 `liftPairs` 渲染 `LiftOverlay` |
| [src/views/CrossSectionView.tsx](../../../src/views/CrossSectionView.tsx) | modify | 数据源从 `scheme.lifts` 改为 `scheme.liftPairs` + 反查 machine |
| [src/store/useAppStore.ts](../../../src/store/useAppStore.ts) | modify | lift 相关的 highlight chain 引用从 lift id 改为 lift machine id |
| [src/__tests__/schema.test.ts](../../../src/__tests__/schema.test.ts) | modify | 新增 R18 单元测试；新增加载 v2 方案的断言；移除针对 v1 的旧断言 |
| [data/schemes/iron-full-line-v1.json](../../../data/schemes/iron-full-line-v1.json) | **delete** | 旧模型方案，完全删除 |
| [data/schemes/iron-full-line-v2.json](../../../data/schemes/iron-full-line-v2.json) | **create** | 新模型方案，F1 从 v1 继承（仅 lift 位置允许微调），F2 手工重建 south→north 物流 |

**被影响但不应改动**：`MachineRenderer.tsx`、`BeltRenderer.tsx`、`GridRenderer.tsx`、`ZoneRenderer.tsx`、`StructureRenderer.tsx`、`BeltLabelLayer.tsx`、`collision.ts`、`beltGeometry.ts`、`coordinate.ts`。如果实现过程中发现必须改动其中任一个，停下来与用户确认。

---

## 任务顺序与依赖

任务之间的依赖拓扑是线性的：

```
Task 1 (类型系统重构)
  ↓
Task 2 (Registry 新增 4 类型)
  ↓
Task 3 (R18 校验 + 删除旧 lift 豁免)
  ↓
Task 4 (创建 v2 方案 - F1 部分)
  ↓
Task 5 (创建 v2 方案 - F2 手工重建)
  ↓
Task 6 (删除 v1 方案 + 更新 schema 测试)
  ↓
Task 7 (渲染层：LiftOverlay 组件)
  ↓
Task 8 (渲染层：FloorPlanView / CrossSectionView / store 接线)
  ↓
Task 9 (终局验证：vitest + 浏览器手测)
```

每个 Task 完成后必须 commit，commit message 遵循项目现有风格（中文 + 前缀 `feat:` / `refactor:` / `fix:` / `test:` / `chore:`）。

---

## Task 1: 类型系统重构

**目标**：在不动 registry 和任何消费方的前提下，完成 `types.ts` 的类型定义层重构。这一步完成后 tsc 会爆出一堆错误，这是预期的——它们会在 Task 2-8 里被逐个修复。

**Files:**
- Modify: [src/core/types.ts](../../../src/core/types.ts)

- [ ] **Step 1.1：在 `PlaceableType` 联合类型里新增 4 条 lift 类型**

打开 [src/core/types.ts](../../../src/core/types.ts) 找到 `PlaceableType` 定义（约 line 36-39），改为：

```ts
export type PlaceableType =
  | 'smelter' | 'foundry' | 'constructor' | 'assembler' | 'manufacturer'
  | 'splitter' | 'merger'
  | 'storage' | 'industrial-storage'
  | 'conveyor-lift-in-bottom'
  | 'conveyor-lift-out-bottom'
  | 'conveyor-lift-in-top'
  | 'conveyor-lift-out-top';
```

- [ ] **Step 1.2：从 `BuildingType` 移除旧的 `'conveyor-lift'` 分支**

同文件找到 `BuildingType` 定义（约 line 45）：

```ts
// 旧：
export type BuildingType = PlaceableType | StructureType | 'conveyor-lift';

// 新：
export type BuildingType = PlaceableType | StructureType;
```

- [ ] **Step 1.3：删除 `Lift` 接口、新增 `LiftPair` 接口**

同文件找到 `Lift` 接口（约 line 87-95）。**删除整个 `Lift` 接口定义**，在原位置替换为：

```ts
export interface LiftPair {
  id: string;                   // pair 标识，全局唯一
  bottomMachine: string;        // 指向 scheme.machines 中 F1 的 lift 机器 id
  topMachine: string;           // 指向 scheme.machines 中 F2 的 lift 机器 id
  material: string;             // 物流元数据，用于 LiftOverlay 徽标和 cross-section 连线
  mark: BeltMark;               // 升降机等级（沿用原 Lift.mark 字段含义）
}
```

- [ ] **Step 1.4：把 `Scheme.lifts` 字段替换为 `liftPairs`**

同文件找到 `Scheme` 接口定义里的 `lifts: Lift[]` 字段（约 line 142）：

```ts
// 旧：
lifts: Lift[];

// 新：
liftPairs: LiftPair[];
```

- [ ] **Step 1.5：运行 tsc 确认类型层变更已就绪（允许消费方报错）**

Run: `npx tsc --noEmit 2>&1 | head -50`

Expected: **大量类型错误**，全部应该来自 `schema.ts`、`registry.ts`、`FloorPlanView.tsx`、`CrossSectionView.tsx`、`LiftRenderer.tsx`、`useAppStore.ts`、`schema.test.ts` 这 7 个文件。这些错误在后续 Task 会被修复。**本步骤只确认 `types.ts` 本身无语法错误**。

如果 `types.ts` 自身有错误（比如 `BeltMark` 未定义等），回到 Step 1.3 检查 import。如果错误只出现在其他 7 个文件里，视为通过。

- [ ] **Step 1.6：commit**

```bash
git add src/core/types.ts
git commit -m "refactor(types): 升降机类型模型重构 - LiftPair 替代 Lift + PlaceableType 扩展 4 类型"
```

---

## Task 2: Registry 新增 4 个 lift 类型

**目标**：在 `BUILDING_REGISTRY` 中为 Task 1 定义的 4 个新类型提供元数据，并删除旧的 `'conveyor-lift'` 条目。完成后 `registry.ts` 自身应 tsc 通过。

**Files:**
- Modify: [src/core/registry.ts](../../../src/core/registry.ts)

- [ ] **Step 2.1：删除旧的 `'conveyor-lift'` 条目**

打开 [src/core/registry.ts](../../../src/core/registry.ts) 找到 `'conveyor-lift': { ... }` 条目（约 line 55-60），**整段删除**。

- [ ] **Step 2.2：在 `BUILDING_REGISTRY` 里 `merger` 之后、`storage` 之前插入 4 条新条目**

在 `BUILDING_REGISTRY` 对象中，`merger` 条目结束后、`storage` 条目开始前的位置插入：

```ts
  'conveyor-lift-in-bottom': {
    type: 'conveyor-lift-in-bottom', category: 'logistics', displayName: '传送带升降机(底入)',
    dimensions: { width: 2, length: 2, height: 7 }, clearanceHeight: 7,
    ports: [port('bottom', 'belt-in', 'bottom', 1, 0)],
    color: '--lift', powerUsage: 0, stackable: false, wallMounted: false,
  },
  'conveyor-lift-out-bottom': {
    type: 'conveyor-lift-out-bottom', category: 'logistics', displayName: '传送带升降机(底出)',
    dimensions: { width: 2, length: 2, height: 7 }, clearanceHeight: 7,
    ports: [port('bottom', 'belt-out', 'bottom', 1, 0)],
    color: '--lift', powerUsage: 0, stackable: false, wallMounted: false,
  },
  'conveyor-lift-in-top': {
    type: 'conveyor-lift-in-top', category: 'logistics', displayName: '传送带升降机(顶入)',
    dimensions: { width: 2, length: 2, height: 7 }, clearanceHeight: 7,
    ports: [port('top', 'belt-in', 'top', 1, 7)],
    color: '--lift', powerUsage: 0, stackable: false, wallMounted: false,
  },
  'conveyor-lift-out-top': {
    type: 'conveyor-lift-out-top', category: 'logistics', displayName: '传送带升降机(顶出)',
    dimensions: { width: 2, length: 2, height: 7 }, clearanceHeight: 7,
    ports: [port('top', 'belt-out', 'top', 1, 7)],
    color: '--lift', powerUsage: 0, stackable: false, wallMounted: false,
  },
```

注意：`port` 签名是 `port(id, kind, side, offset, height = 1)`。这里的 `offset = 1`（米）= 0.125 grid（因为 1 grid = 8m），是 2m 边的中点。`height` 分别是 0 和 7（底部端口在 F1 楼面、顶部端口在 F2 楼面）。

- [ ] **Step 2.3：运行 tsc 确认 `registry.ts` 不再有类型错误**

Run: `npx tsc --noEmit 2>&1 | grep "registry.ts"`

Expected: 无输出（registry.ts 无错误）。如果仍有错误，检查 4 个新条目的字段拼写是否和 `BuildingMetadata` 接口一致。

- [ ] **Step 2.4：commit**

```bash
git add src/core/registry.ts
git commit -m "refactor(registry): 升降机拆为 4 静态类型（in/out × bottom/top）"
```

---

## Task 3: Schema 校验 R18 + 删除旧 lift 豁免（TDD）

**目标**：在 `schema.ts` 中实现 R18 校验（LiftPair 一致性），并删除 R4 的 `liftConnectedBelts` 豁免和旧的 R10 lift 校验块。R18 按 TDD 流程：先写失败测试，再实现。

**Files:**
- Modify: [src/__tests__/schema.test.ts](../../../src/__tests__/schema.test.ts)
- Modify: [src/core/schema.ts](../../../src/core/schema.ts)

- [ ] **Step 3.1：为 R18 写 5 条单元测试（失败态）**

打开 [src/__tests__/schema.test.ts](../../../src/__tests__/schema.test.ts)，在文件末尾的最后一个 `describe` 块之前（或者独立添加一个新 describe 块），添加：

```ts
describe('R18 - LiftPair 一致性', () => {
  function makeLiftMachine(id: string, type: PlaceableType, floor: number, col = 1.5, row = 6.5): MachineInstance {
    return { id, type, floor, facing: 'south', pos: { col, row } };
  }

  function baseScheme(machines: MachineInstance[], liftPairs: LiftPair[]): Scheme {
    return {
      id: 'test', name: 'test', version: '1.0.0', category: 'test', description: '',
      designPrinciples: { preferWallOutlets: false, preferWallHoles: false, preferCeilingMounts: false, keepFloorClear: false },
      floors: [
        { id: 1, label: 'F1', heightM: 4, gridSize: { cols: 8, rows: 8 } },
        { id: 2, label: 'F2', heightM: 4, gridSize: { cols: 8, rows: 8 } },
      ],
      machines, belts: [], liftPairs, structures: [], zones: [],
      stats: { totalPowerMW: 0, inputs: [], outputs: [] },
    };
  }

  it('pair 引用不存在的机器 → error', () => {
    const scheme = baseScheme([], [
      { id: 'lp1', bottomMachine: 'missing_bot', topMachine: 'missing_top', material: '铁板', mark: 1 },
    ]);
    const issues = validateSchemeDetailed(scheme);
    expect(issues.some(i => i.severity === 'error' && i.rule.startsWith('R18'))).toBe(true);
  });

  it('合法向上运输 pair → 无 R18 error', () => {
    const scheme = baseScheme([
      makeLiftMachine('bot', 'conveyor-lift-in-bottom', 1),
      makeLiftMachine('top', 'conveyor-lift-out-top', 2),
    ], [
      { id: 'lp1', bottomMachine: 'bot', topMachine: 'top', material: '铁板', mark: 1 },
    ]);
    const issues = validateSchemeDetailed(scheme);
    expect(issues.filter(i => i.severity === 'error' && i.rule.startsWith('R18'))).toEqual([]);
  });

  it('非法类型组合（bottom 机器用 top 类型）→ error', () => {
    const scheme = baseScheme([
      makeLiftMachine('bot', 'conveyor-lift-out-top', 1),
      makeLiftMachine('top', 'conveyor-lift-in-bottom', 2),
    ], [
      { id: 'lp1', bottomMachine: 'bot', topMachine: 'top', material: '铁板', mark: 1 },
    ]);
    const issues = validateSchemeDetailed(scheme);
    expect(issues.some(i => i.severity === 'error' && i.rule.startsWith('R18'))).toBe(true);
  });

  it('跨越多层（floor 差不为 1）→ error', () => {
    const scheme = baseScheme([
      makeLiftMachine('bot', 'conveyor-lift-in-bottom', 1),
      { id: 'top', type: 'conveyor-lift-out-top', floor: 3, facing: 'south', pos: { col: 1.5, row: 6.5 } },
    ], [
      { id: 'lp1', bottomMachine: 'bot', topMachine: 'top', material: '铁板', mark: 1 },
    ]);
    // 先添加 floor 3 以避免 R1-floor 失败抢先
    scheme.floors.push({ id: 3, label: 'F3', heightM: 4, gridSize: { cols: 8, rows: 8 } });
    const issues = validateSchemeDetailed(scheme);
    expect(issues.some(i => i.severity === 'error' && i.rule.startsWith('R18'))).toBe(true);
  });

  it('pair 两端 pos 不相等 → error', () => {
    const scheme = baseScheme([
      makeLiftMachine('bot', 'conveyor-lift-in-bottom', 1, 1.5, 6.5),
      makeLiftMachine('top', 'conveyor-lift-out-top', 2, 2.0, 6.5),
    ], [
      { id: 'lp1', bottomMachine: 'bot', topMachine: 'top', material: '铁板', mark: 1 },
    ]);
    const issues = validateSchemeDetailed(scheme);
    expect(issues.some(i => i.severity === 'error' && i.rule.startsWith('R18'))).toBe(true);
  });
});
```

确保文件顶部已 `import` 了 `MachineInstance`、`PlaceableType`、`LiftPair`、`Scheme`、`validateSchemeDetailed`（如果缺失请补齐）。

- [ ] **Step 3.2：运行测试确认失败**

Run: `npx vitest run src/__tests__/schema.test.ts -t "R18"`

Expected: 5 条 R18 测试**全部失败**，因为 R18 规则还没实现，所以任何包含 lift 的合法 pair 也会错误地返回无 R18 issue（断言 `expect(...).toBe(true)` 失败），或 `validateSchemeDetailed` 完全没有 R18 相关的 issue。

如果此时测试因为其他错误（比如 `R10-floor` 或现有 lift 块崩溃）失败而非 R18 断言本身失败，说明 Task 1 的类型迁移还没走通——检查 `schema.test.ts` 文件顶部是否还有旧的 `lifts: []` 引用需要改成 `liftPairs: []`，修复这些兼容问题再回到本步。

- [ ] **Step 3.3：在 `schema.ts` 中实现 R18 校验块 + `liftPairAligned` 辅助函数**

打开 [src/core/schema.ts](../../../src/core/schema.ts)。在文件顶部 `isValidPortRef` 函数之后（约 line 44 之后）、`validateScheme` 函数之前，添加：

```ts
// ============================================================
// R18 辅助：lift pair 两端在各楼层 transform 之后是否落到同一屏幕坐标
// 当前所有 floor.transform 为 identity，退化为 pos 相等比较。
// 未来引入 Floor.transform 后，只需修改本函数实现，不改签名和调用点。
// ============================================================
function liftPairAligned(
  bot: MachineInstance,
  top: MachineInstance,
  _scheme: Scheme,
): boolean {
  return Math.abs(bot.pos.col - top.pos.col) < 0.001
      && Math.abs(bot.pos.row - top.pos.row) < 0.001;
}

// 合法的 pair 类型组合（bottom type → 合法的 top type）
const LIFT_PAIR_COMBOS: Record<string, string> = {
  'conveyor-lift-in-bottom':  'conveyor-lift-out-top',   // 向上运输
  'conveyor-lift-out-bottom': 'conveyor-lift-in-top',    // 向下运输
};
```

在文件顶部的 `import type` 里补上 `MachineInstance`（如果还没 import）：

```ts
import type { Scheme, SchemeIndex, GridPos, Facing, MachineInstance } from './types';
```

然后在 `validateSchemeDetailed` 函数内部、R17 校验块之后（约 line 402 之后）、`return issues` 之前，添加：

```ts
  // ----------------------------------------------------------
  // R18: LiftPair 一致性
  // ----------------------------------------------------------
  const machineById = new Map(scheme.machines.map(m => [m.id, m]));
  for (const pair of scheme.liftPairs) {
    const bot = machineById.get(pair.bottomMachine);
    const top = machineById.get(pair.topMachine);

    if (!bot) {
      issues.push({ severity: 'error', rule: 'R18-ref',
        message: `LiftPair "${pair.id}": bottomMachine "${pair.bottomMachine}" 不存在`,
        elementId: pair.id });
    }
    if (!top) {
      issues.push({ severity: 'error', rule: 'R18-ref',
        message: `LiftPair "${pair.id}": topMachine "${pair.topMachine}" 不存在`,
        elementId: pair.id });
    }
    if (!bot || !top) continue;

    // 类型合法性
    const expectedTopType = LIFT_PAIR_COMBOS[bot.type];
    if (!expectedTopType) {
      issues.push({ severity: 'error', rule: 'R18-type',
        message: `LiftPair "${pair.id}": bottomMachine 类型 "${bot.type}" 不是合法的 lift 底部类型`,
        elementId: pair.id });
    } else if (top.type !== expectedTopType) {
      issues.push({ severity: 'error', rule: 'R18-type',
        message: `LiftPair "${pair.id}": bottom 类型 "${bot.type}" 应配对 top 类型 "${expectedTopType}"，实际是 "${top.type}"`,
        elementId: pair.id });
    }

    // 楼层关系
    if (top.floor !== bot.floor + 1) {
      issues.push({ severity: 'error', rule: 'R18-floor',
        message: `LiftPair "${pair.id}": topMachine.floor (${top.floor}) 必须为 bottomMachine.floor (${bot.floor}) + 1`,
        elementId: pair.id });
    }

    // 屏幕坐标对齐
    if (!liftPairAligned(bot, top, scheme)) {
      issues.push({ severity: 'error', rule: 'R18-align',
        message: `LiftPair "${pair.id}": 两端机器 pos 不相等 (bot=${bot.pos.col},${bot.pos.row} vs top=${top.pos.col},${top.pos.row})`,
        elementId: pair.id });
    }

    // facing 一致（warn）
    if (bot.facing !== top.facing) {
      issues.push({ severity: 'warn', rule: 'R18-facing',
        message: `LiftPair "${pair.id}": 两端 facing 不一致 (bot=${bot.facing} vs top=${top.facing})`,
        elementId: pair.id });
    }
  }
```

- [ ] **Step 3.4：删除 R4 的 `liftConnectedBelts` 豁免**

仍在 `schema.ts`，找到 R4 检查块前的 `liftConnectedBelts` Set 构建代码（约 line 100-113）：

```ts
// 删除这一整段：
const liftConnectedBelts = new Set(scheme.lifts.flatMap(l => l.connectedBelts ?? []));
function isAtFloorEdge(b: { floor: number; path: GridPos[] }, end: 'start' | 'end'): boolean {
  // ...
}
```

实际上 `isAtFloorEdge` 是一个**独立功能**（允许 belt 在楼层边界外部输入/输出时缺省端口），和 lift 豁免无关。**只删除 `liftConnectedBelts` 这一行和对它的引用**，保留 `isAtFloorEdge` 函数。

然后找到 R4 检查的两行：

```ts
// 旧：
if (!b.fromPort && !liftConnectedBelts.has(b.id) && !isAtFloorEdge(b, 'start')) { ... }
if (!b.toPort && !liftConnectedBelts.has(b.id) && !isAtFloorEdge(b, 'end')) { ... }

// 新（去掉 liftConnectedBelts 条件）：
if (!b.fromPort && !isAtFloorEdge(b, 'start')) { ... }
if (!b.toPort && !isAtFloorEdge(b, 'end')) { ... }
```

- [ ] **Step 3.5：删除旧的 R10 lift 校验块**

同文件找到旧的 R10 `for (const l of scheme.lifts)` 循环（约 line 170-184）：

```ts
// 删除整段：
for (const l of scheme.lifts) {
  if (!floorIds.has(l.fromFloor)) { ... }
  if (!floorIds.has(l.toFloor)) { ... }
  if (l.connectedBelts) { ... }
}
```

这些校验的职责已由 R1（机器楼层）和 R5（belt 端口引用）自动接管。

- [ ] **Step 3.6：更新 R12 ID 唯一性检查，用 `liftPairs` 替代 `lifts`**

同文件找到 `allElementIds` 数组（约 line 189-194）：

```ts
// 旧：
const allElementIds: string[] = [
  ...scheme.machines.map(m => m.id),
  ...scheme.belts.map(b => b.id),
  ...scheme.lifts.map(l => l.id),
  ...scheme.structures.map(s => s.id),
];

// 新：
const allElementIds: string[] = [
  ...scheme.machines.map(m => m.id),
  ...scheme.belts.map(b => b.id),
  ...scheme.liftPairs.map(p => p.id),
  ...scheme.structures.map(s => s.id),
];
```

- [ ] **Step 3.7：运行 R18 测试确认通过**

Run: `npx vitest run src/__tests__/schema.test.ts -t "R18"`

Expected: 5 条 R18 测试**全部通过**。

如果其中某条失败，读错误消息定位：
- "pair 两端 pos 不相等" 失败 → 检查 `liftPairAligned` 的浮点比较阈值
- "楼层关系" 失败 → 检查 `top.floor !== bot.floor + 1` 条件方向
- "引用不存在的机器" 失败 → 检查 `machineById.get()` 和 push 顺序

- [ ] **Step 3.8：运行完整 schema 测试套件确认无回归**

Run: `npx vitest run src/__tests__/schema.test.ts`

Expected: **全部通过**。如果出现之前通过但现在失败的测试，说明删除 R4 豁免或 R10 块时影响到了别的用例——很可能是现有测试用例里的 schema 数据有 `lifts: []` 需要改成 `liftPairs: []`。**逐一修复**。

- [ ] **Step 3.9：运行 tsc 看 `schema.ts` / `schema.test.ts` 是否已绿**

Run: `npx tsc --noEmit 2>&1 | grep -E "schema\.(ts|test\.ts)"`

Expected: 无输出。

- [ ] **Step 3.10：commit**

```bash
git add src/core/schema.ts src/__tests__/schema.test.ts
git commit -m "feat(schema): 新增 R18 LiftPair 一致性校验 + 删除 R4/R10 lift 豁免"
```

---

## Task 4: 创建 `iron-full-line-v2.json` 骨架（复制 v1 F1 部分）

**目标**：创建 v2 文件，先把 F1 部分从 v1 原样复制过来，F2 部分先留空，并把顶层结构从 `lifts` 改为 `liftPairs`。这一步结束后文件自身能通过 JSON parse 但 F2 是空的。

**Files:**
- Create: [data/schemes/iron-full-line-v2.json](../../../data/schemes/iron-full-line-v2.json)

- [ ] **Step 4.1：读取 v1 全部内容作为起点**

使用 Read 工具读取 [data/schemes/iron-full-line-v1.json](../../../data/schemes/iron-full-line-v1.json) 的完整内容。

- [ ] **Step 4.2：用 Write 工具创建 v2 文件，做以下变换**

创建 [data/schemes/iron-full-line-v2.json](../../../data/schemes/iron-full-line-v2.json)，内容来自 v1 并做以下修改：

1. **顶层字段**：
   - `"id": "iron-full-line-v1"` → `"id": "iron-full-line-v2"`
   - `"name": "铁矿全产线 v1"` → `"name": "铁矿全产线 v2"`
   - `"version": "1.0.0"` → `"version": "2.0.0"`
   - `"description"` 末尾追加：`"（升降机一等机器化 + F2 南向北重建）"`
   
2. **floors**：保持两层结构不变，F1 `rows: 7`、F2 `rows: 10` 不改。

3. **machines 数组**：
   - 保留**所有 `floor: 1` 的机器**原样（Task 4 不改 F1）
   - 删除**所有 `floor: 2` 的机器**（Task 5 会手工重建）
   - 暂时不添加任何 lift 机器（Task 5 一起加）

4. **belts 数组**：
   - 保留所有 `floor: 1` 的 belt **除了** `b_plate_lift` 和 `b_rod_lift`（这两条是旧的"断头 belt"，末端要指向新 lift 机器，Task 5 处理）
   - 删除所有 `floor: 2` 的 belt（Task 5 会重新设计）

5. **lifts → liftPairs**：
   - 把顶层的 `"lifts": [...]` 字段整个**替换为** `"liftPairs": []`（空数组）
   - Task 5 会填充 `liftPairs` 和重写 F1 的 `b_plate_lift` / `b_rod_lift`

6. **structures**：保留（v1 里 structures 是 `[]`，直接原样）

7. **zones**：
   - 保留 `floor: 1` 的所有 zone
   - 删除 `floor: 2` 的所有 zone（Task 5 会根据新 F2 布局决定是否重建）

8. **stats**：保留原样。

- [ ] **Step 4.3：运行 tsc 确认 JSON import 类型对齐**

Run: `npx tsc --noEmit 2>&1 | grep -v "schema\.test" | head -20`

Expected: 没有与 `iron-full-line-v2.json` 或 JSON 模块解析相关的新错误。其他文件（App.tsx、FloorPlanView 等）的 `Scheme.lifts` 引用错误仍然存在，这是预期的，Task 7-8 会处理。

- [ ] **Step 4.4：运行 vitest 确认 v2 骨架能通过 load**（不进入 schema 校验也可）

Run: `npx vitest run src/__tests__/schema.test.ts -t "R18"`

Expected: R18 测试仍然全部通过（和 Step 3.7 一致）。v2 文件本身此时未被测试加载，骨架只要是 valid JSON 就够了。可以额外运行 `node -e "JSON.parse(require('fs').readFileSync('data/schemes/iron-full-line-v2.json','utf8'))"` 验证 JSON 合法。

- [ ] **Step 4.5：commit**

```bash
git add data/schemes/iron-full-line-v2.json
git commit -m "feat(scheme): 创建 v2 骨架 - F1 从 v1 继承，F2 待重建"
```

---

## Task 5: 手工重建 v2 的 F2 产线 + 添加 liftPairs

**目标**：按照 spec 5.3 在 v2 里填充 F2 的全部内容（machines、belts、zones）并添加两对 liftPair。迭代直到 `validateSchemeDetailed` 对 v2 的 error 数为 0。

**这是本计划最长的单任务。** 执行者需要对 [CLAUDE.md](../../../CLAUDE.md) 的"同轴对齐规则"和"机器尺寸参考"熟悉。

**Files:**
- Modify: [data/schemes/iron-full-line-v2.json](../../../data/schemes/iron-full-line-v2.json)

**要保留的 F2 生产机器（尺度 2，id/label/recipe 完全不改）**：

| id | type | recipe | label |
|---|---|---|---|
| `screw1` | constructor | 铁棒→螺丝 | 螺丝机 #1 |
| `screw2` | constructor | 铁棒→螺丝 | 螺丝机 #2 |
| `screw3` | constructor | 铁棒→螺丝 | 螺丝机 #3 |
| `screw4` | constructor | 铁棒→螺丝 | 螺丝机 #4 |
| `rip` | assembler | 铁板×6+螺丝×12→强化铁板 | 强化铁板 组装机 |
| `rotor` | assembler | 铁棒×5+螺丝×25→转子 | 转子 组装机 |
| `store_plate` | storage | — | 铁板 储存箱 |
| `store_rip` | storage | — | 强化铁板 储存箱 |
| `store_rotor` | storage | — | 转子 储存箱 |

**F2 物流方向**：south→north（与 v1 相反）。
- 南部 (row ≈ 6-7)：lift pair 落点 + 接料分流
- 中部 (row ≈ 3-5)：螺丝 constructor + rip/rotor assembler
- 北部 (row ≈ 0-2)：成品储存

**F2 grid**：cols=8, rows=10（保持 v1 结构，不 resize）。

**F1 lift 位置**（由 F1 部分继承决定，b2 允许微调但不建议动）：
- `lift_plate` 对应位置：col=1.5, row=6.5（来自 v1 原始数据）
- `lift_rod` 对应位置：col=5.5, row=6.5

**lift pair 两端必须有相同 pos**（R18-align 强制），所以 F2 的 lift top machine 也在 col=1.5/5.5、row=6.5。

- [ ] **Step 5.1：在 machines 数组里追加 4 条 lift 机器**

```jsonc
{ "id": "lift_plate_bot", "type": "conveyor-lift-in-bottom",
  "pos": { "col": 1.5, "row": 6.5 }, "facing": "south", "floor": 1 },
{ "id": "lift_plate_top", "type": "conveyor-lift-out-top",
  "pos": { "col": 1.5, "row": 6.5 }, "facing": "south", "floor": 2 },
{ "id": "lift_rod_bot",   "type": "conveyor-lift-in-bottom",
  "pos": { "col": 5.5, "row": 6.5 }, "facing": "south", "floor": 1 },
{ "id": "lift_rod_top",   "type": "conveyor-lift-out-top",
  "pos": { "col": 5.5, "row": 6.5 }, "facing": "south", "floor": 2 },
```

- [ ] **Step 5.2：填充 `liftPairs` 数组**

把顶层 `"liftPairs": []` 替换为：

```jsonc
"liftPairs": [
  { "id": "lift_plate", "bottomMachine": "lift_plate_bot", "topMachine": "lift_plate_top",
    "material": "铁板", "mark": 1 },
  { "id": "lift_rod",   "bottomMachine": "lift_rod_bot",   "topMachine": "lift_rod_top",
    "material": "铁棒", "mark": 1 }
]
```

- [ ] **Step 5.3：修复 F1 的 `b_plate_lift` / `b_rod_lift`，连到新 lift 机器**

从 v1 原始数据里取回这两条 belt 的骨架，修改 path 和添加 `toPort`：

```jsonc
{
  "id": "b_plate_lift",
  "floor": 1,
  "mark": 1,
  "material": "铁板",
  "path": [
    { "col": 2, "row": 6 },     // 来自 mg_plate:out-0 位置
    { "col": 2, "row": 6.75 },  // 垂直下降到对齐 lift 端口 row
    { "col": 1.625, "row": 6.75 }  // 水平对齐到 lift bottom 端口 col（1.5 + 0.125）
  ],
  "fromPort": "mg_plate:out-0",
  "toPort": "lift_plate_bot:bottom"
}
```

**注意**：lift 的 `bottom` 端口在 screen 的 `bottom` 边（即 pos.row + rows，rows=0.25 grid）上，offset = 1m = 0.125 grid。所以端口实际坐标 = (pos.col + 0.125, pos.row + 0.25) = (1.625, 6.75)。根据 R16，belt 最后一段必须垂直于底边（即水平线进入），**不对**——底边是水平的，"垂直于底边"指的是**垂直线段**。重新读 spec 和 R16 代码确认：

根据 [src/core/schema.ts:278-325](../../../src/core/schema.ts#L278-L325) 的 R16 实现，端口在 `bottom` 边时 `isVerticalPort = true`，要求倒数第 2 个点和端口点 col 相同（即最后一段是**垂直线**）。所以：

```jsonc
// 正确的 b_plate_lift path：最后一段必须是垂直线（col 相同）
"path": [
  { "col": 2, "row": 6 },
  { "col": 1.625, "row": 6 },   // 水平到 lift 端口 col
  { "col": 1.625, "row": 6.75 } // 垂直下降到端口
]
```

同理修 `b_rod_lift`：

```jsonc
{
  "id": "b_rod_lift",
  "floor": 1,
  "mark": 1,
  "material": "铁棒",
  "path": [
    { "col": 5.5, "row": 6.5 },   // 来自 mg_rod_final:out-0
    { "col": 5.625, "row": 6.5 }, // 水平到 lift 端口 col
    { "col": 5.625, "row": 6.75 } // 垂直下降到端口
  ],
  "fromPort": "mg_rod_final:out-0",
  "toPort": "lift_rod_bot:bottom"
}
```

**如果 `mg_plate:out-0` 或 `mg_rod_final:out-0` 的实际端口位置不是 (2, 6) 或 (5.5, 6.5)**，需要从 v1 原始数据查这两个 merger 的 pos + 尺寸 + out-0 端口 offset 重新算。merger 尺寸 4m×4m = 0.5×0.5 grid、out-0 在 front 边中点 offset=2m=0.25 grid。

- [ ] **Step 5.4：添加 F2 的 9 台生产机器（保持 id/label/recipe，新位置）**

**推荐 F2 布局**（初稿；如果 vitest 报错再迭代调整）：

```jsonc
// 储存箱（北部 row 0-1）
{ "id": "store_plate",  "type": "storage", "pos": { "col": 1, "row": 0 },       "facing": "south", "floor": 2, "label": "铁板 储存箱" },
{ "id": "store_rip",    "type": "storage", "pos": { "col": 2.5, "row": 0 },     "facing": "south", "floor": 2, "label": "强化铁板 储存箱" },
{ "id": "store_rotor",  "type": "storage", "pos": { "col": 5, "row": 0 },       "facing": "south", "floor": 2, "label": "转子 储存箱" },

// 组装机（中北部 row 1.5-3.5）
{ "id": "rip",   "type": "assembler", "pos": { "col": 1.375, "row": 1.625 }, "facing": "south", "floor": 2, "label": "强化铁板 组装机", "recipe": "铁板×6+螺丝×12→强化铁板" },
{ "id": "rotor", "type": "assembler", "pos": { "col": 4.375, "row": 1.625 }, "facing": "south", "floor": 2, "label": "转子 组装机",     "recipe": "铁棒×5+螺丝×25→转子" },

// 螺丝机（中部 row 4-5.5）
{ "id": "screw1", "type": "constructor", "pos": { "col": 1, "row": 4 }, "facing": "south", "floor": 2, "label": "螺丝机 #1", "recipe": "铁棒→螺丝" },
{ "id": "screw2", "type": "constructor", "pos": { "col": 2, "row": 4 }, "facing": "south", "floor": 2, "label": "螺丝机 #2", "recipe": "铁棒→螺丝" },
{ "id": "screw3", "type": "constructor", "pos": { "col": 4, "row": 4 }, "facing": "south", "floor": 2, "label": "螺丝机 #3", "recipe": "铁棒→螺丝" },
{ "id": "screw4", "type": "constructor", "pos": { "col": 5, "row": 4 }, "facing": "south", "floor": 2, "label": "螺丝机 #4", "recipe": "铁棒→螺丝" }
```

**facing 说明**：facing=south 时，constructor/assembler/storage 的 `back` (in-0) 在 screen 的 top 边（row 较小侧），`front` (out-0) 在 screen 的 bottom 边（row 较大侧）。但我们 F2 是 south→north 流向，物料应该从南边 lift 过来、向北流到储存箱。在当前 facing=south 下，机器的 `front` 在南（row 大）、`back` 在北（row 小）——意味着机器**面朝南**，物料从南面进入（via front = out 端口？不对）。

**重要检查**：仔细看 [src/core/registry.ts](../../../src/core/registry.ts) 的 constructor 定义：`ports: [port('in-0', 'belt-in', 'back', 4), port('out-0', 'belt-out', 'front', 4)]`——**`back` 是入口**。facing=south 意味着机器的 back 方向对着 south 吗？看 `SIDE_MAP`（[src/core/coordinate.ts](../../../src/core/coordinate.ts)）和 [CLAUDE.md](../../../CLAUDE.md) 的分流器方向表：`facing=south` 时 `back` → `top`（screen 上方，row 小）、`front` → `bottom`（row 大）。

所以 **facing=south 的 constructor**：
- `in-0` (back) 在 **row 小** 的一侧（北）
- `out-0` (front) 在 **row 大** 的一侧（南）

这意味着 facing=south 的 constructor 是"物料从北进、成品往南出"——**和 south→north 流向相反**。需要用 `facing: "north"` 把机器翻过来。

**修正**：F2 的所有生产机器 `facing` 改为 `"north"`。然后：
- `in-0` (back) 在 row 大（南）一侧 — 接 lift 来料 ✓
- `out-0` (front) 在 row 小（北）一侧 — 输出到下一环 ✓

**修正后的 F2 布局（facing 全部 north）**：

```jsonc
{ "id": "store_plate",  "type": "storage",    "pos": { "col": 1, "row": 0 },        "facing": "north", "floor": 2, "label": "铁板 储存箱" },
{ "id": "store_rip",    "type": "storage",    "pos": { "col": 2.5, "row": 0 },      "facing": "north", "floor": 2, "label": "强化铁板 储存箱" },
{ "id": "store_rotor",  "type": "storage",    "pos": { "col": 5, "row": 0 },        "facing": "north", "floor": 2, "label": "转子 储存箱" },
{ "id": "rip",    "type": "assembler",   "pos": { "col": 1.375, "row": 1.625 }, "facing": "north", "floor": 2, "label": "强化铁板 组装机", "recipe": "铁板×6+螺丝×12→强化铁板" },
{ "id": "rotor",  "type": "assembler",   "pos": { "col": 4.375, "row": 1.625 }, "facing": "north", "floor": 2, "label": "转子 组装机",     "recipe": "铁棒×5+螺丝×25→转子" },
{ "id": "screw1", "type": "constructor", "pos": { "col": 1, "row": 4 }, "facing": "north", "floor": 2, "label": "螺丝机 #1", "recipe": "铁棒→螺丝" },
{ "id": "screw2", "type": "constructor", "pos": { "col": 2, "row": 4 }, "facing": "north", "floor": 2, "label": "螺丝机 #2", "recipe": "铁棒→螺丝" },
{ "id": "screw3", "type": "constructor", "pos": { "col": 4, "row": 4 }, "facing": "north", "floor": 2, "label": "螺丝机 #3", "recipe": "铁棒→螺丝" },
{ "id": "screw4", "type": "constructor", "pos": { "col": 5, "row": 4 }, "facing": "north", "floor": 2, "label": "螺丝机 #4", "recipe": "铁棒→螺丝" }
```

**lift top 机器的 facing 核查**：`conveyor-lift-out-top` 的唯一端口在 `side: 'top'`。facing=south 时，top side → screen top。lift 位置 col=1.5 row=6.5，`top` 边在 row=6.5（pos.row），out-0 端口坐标 = (1.5 + 0.125, 6.5) = (1.625, 6.5)。F2 的接料 belt 要从 (1.625, 6.5) 垂直向北延伸（row 减小方向）出发。**facing=south 对 lift 是 OK 的**（因为 lift 是方形且端口在 top/bottom，和 facing 无关的对称位置）。保持 facing=south 即可。

- [ ] **Step 5.5：添加 F2 的分流/合流器（按需，数量和位置自由调整）**

F2 生产链的中间物流（尺度 2 允许重排）。**推荐最小集**：

- `sp_plate_2f`（splitter）：接 lift_plate 出口，把铁板分到 rip（组装）和 store_plate
- `sp_rod_2f`（splitter）：接 lift_rod 出口，把铁棒分到 4 台 screw + rotor（组装机需要铁棒）
- `mg_screw_l` / `mg_screw_r`（merger）：把 4 台 screw 的输出汇合
- `sp_screw_route`（splitter）：把合并后的螺丝分到 rip 和 rotor

具体位置在实现中确定。**注意**：这些物流机器的 facing 依然按 south→north 流向选择，原则是"入口朝南、出口朝北"——大多数情况下用 `facing: "north"`。

- [ ] **Step 5.6：添加 F2 接料 belt 和产线内部 belt**

F2 belt 必须全部有 `fromPort` + `toPort`，且：
- 接入 lift 的 belt：`fromPort: "lift_plate_top:top"` / `fromPort: "lift_rod_top:top"`
- 最后一段必须**垂直**进入 lift top 端口（R16 要求，lift top 端口在 screen top 边 → 垂直线段）
- 路径遵守 R7 正交、R8 对齐、R17 不绕路

**示例接料 belt**：

```jsonc
{
  "id": "b_plate_2f_in",
  "floor": 2,
  "mark": 1,
  "material": "铁板",
  "path": [
    { "col": 1.625, "row": 6.5 },  // 起点：lift_plate_top:top 端口位置
    { "col": 1.625, "row": 5 },    // 向北延伸
    { "col": 1, "row": 5 },        // 水平到 sp_plate_2f 所在 col
    { "col": 1, "row": 4.5 }       // 进入 sp_plate_2f
  ],
  "fromPort": "lift_plate_top:top",
  "toPort": "sp_plate_2f:in-0"
}
```

注意起点 col=1.625 是因为 lift `top` 端口 offset=0.125。**第一段必须是垂直线**（端口在 top 边，R16 要求第 2 个路径点 col 和端口 col 相同）。

- [ ] **Step 5.7：跑 vitest，根据报错迭代修正**

Run: `npx vitest run`

**第一次大概率会失败**。按严重程度逐一修：
1. **R13 collision**（机器碰撞）→ 调整相邻机器的 pos，让 bbox 不重叠
2. **R14 belt-cross**（belt 穿机器）→ 调整 belt path 绕开无关机器
3. **R16 port-align**（端口非正交进入）→ 调整 belt path 末段方向
4. **R17 belt-backtrack**（belt 绕路）→ 按 [CLAUDE.md](../../../CLAUDE.md) 同轴对齐规则，调整上下游机器让端口落在同一 col/row 主轴
5. **R18 align**（pair 两端 pos 不等）→ 核对 lift 机器 4 条位置
6. **R18 type**（类型组合不合法）→ 核对类型拼写
7. **R1 / R3**（机器位置越界）→ 核对 pos 是否在 F2 `gridSize` 范围内

**每次迭代**：用 Edit 工具逐条修改 JSON，然后重跑 vitest，观察 issues 数量下降。**不允许用 bash 脚本批量改 JSON**（[CLAUDE.md](../../../CLAUDE.md) 禁止）。

**目标**：`validateSchemeDetailed(ironFullLineV2).filter(i => i.severity === 'error').length === 0`。

- [ ] **Step 5.8：验证所有 error 清零**

Run: `npx vitest run`

Expected: **全部通过**。如果只剩下 R2/R8 `.125` 对齐 warn（来自 lift 端口固有 offset），可以接受。其他任何 warn（尤其 R17-backtrack）也应尽量消除。

- [ ] **Step 5.9：commit**

```bash
git add data/schemes/iron-full-line-v2.json
git commit -m "feat(scheme): v2 手工重建 F2 产线 - south→north 物流 + 升降机端口接通"
```

---

## Task 6: 删除 v1 方案 + schema 测试更新

**目标**：删除 `iron-full-line-v1.json`，确认没有任何测试或加载逻辑仍然依赖它，并添加一条针对 v2 的 error=0 断言。

**Files:**
- Delete: [data/schemes/iron-full-line-v1.json](../../../data/schemes/iron-full-line-v1.json)
- Modify: [src/__tests__/schema.test.ts](../../../src/__tests__/schema.test.ts)

- [ ] **Step 6.1：grep 搜索是否有代码引用 `iron-full-line-v1`**

Run: `grep -rn "iron-full-line-v1" src/ data/ docs/ 2>/dev/null` (via Bash tool)

Expected: 如果 grep 有结果，除了本 plan/spec 文档中的引用之外，**不应有代码引用**。如果代码里仍有硬编码引用（例如默认方案 id 常量），说明有遗漏——修改该引用为 `iron-full-line-v2`。

**注意**：[src/App.tsx](../../../src/App.tsx) 使用 `import.meta.glob('/data/schemes/*.json')` 自动扫描，不硬编码文件名。但如果发现 App.tsx 或 store 里有默认选中 id（`defaultSchemeId`）写的是 `"iron-full-line-v1"`，需要改成 `"iron-full-line-v2"`。

- [ ] **Step 6.2：删除 `iron-full-line-v1.json`**

Run via Bash: `rm data/schemes/iron-full-line-v1.json`

- [ ] **Step 6.3：在 `schema.test.ts` 里添加 v2 加载断言**

打开 [src/__tests__/schema.test.ts](../../../src/__tests__/schema.test.ts)，在文件末尾添加（或更新现有的 iron-full-line 相关测试）：

```ts
import ironFullLineV2 from '../../data/schemes/iron-full-line-v2.json';

describe('iron-full-line-v2 方案校验', () => {
  it('validateSchemeDetailed 无 error', () => {
    const issues = validateSchemeDetailed(ironFullLineV2 as unknown as Scheme);
    const errors = issues.filter(i => i.severity === 'error');
    if (errors.length > 0) {
      console.error('Unexpected errors:', errors);
    }
    expect(errors).toHaveLength(0);
  });
});
```

如果 `schema.test.ts` 里已有针对 `iron-full-line-v1` 的类似断言，**整段替换**为上面的 v2 版本。

- [ ] **Step 6.4：运行 vitest 确认所有测试通过**

Run: `npx vitest run`

Expected: **全部通过**。如果失败：
- 如果错误来自加载 v2 解析失败 → 检查 v2 JSON 格式
- 如果错误来自 `Scheme` 类型与 v2 数据结构不匹配 → 检查 v2 是否有缺失的 `Scheme` 字段
- 如果 v2 自身 validate 有 error → 回到 Task 5 修复

- [ ] **Step 6.5：commit**

```bash
git add -A
git commit -m "chore(scheme): 删除 v1 方案 + 测试断言切换到 v2"
```

---

## Task 7: 渲染层 - 重写 `LiftRenderer` 为 `LiftOverlay`

**目标**：重写 `LiftRenderer.tsx`，职责从"独立绘制单个 Lift"变为"遍历 liftPairs 为每个 pair 在对应楼层叠加跨楼层徽标"。`MachineRenderer` 零改动——升降机机器走通用渲染路径。

**Files:**
- Rewrite: [src/renderers/LiftRenderer.tsx](../../../src/renderers/LiftRenderer.tsx)

- [ ] **Step 7.1：用 Write 工具整体重写 `LiftRenderer.tsx`**

新内容：

```tsx
import { memo } from 'react';
import type { LiftPair, MachineInstance, PlaceableType } from '../core/types';
import { gridToSvg, machineGridSize, GRID_PX } from '../core/coordinate';
import { getBuildingMeta, getMaterialColor } from '../core/registry';

interface LiftOverlayProps {
  pairs: LiftPair[];
  machines: MachineInstance[];
  floorId: number;
  highlightChain?: string[];
  onHover?: (id: string | null) => void;
  onClick?: (id: string) => void;
}

interface BadgeInfo {
  pairId: string;
  material: string;
  machine: MachineInstance;
  symbol: string;        // '↑' | '↓'
  targetFloor: number;
}

function computeBadge(pair: LiftPair, machines: MachineInstance[], floorId: number): BadgeInfo | null {
  const bot = machines.find(m => m.id === pair.bottomMachine);
  const top = machines.find(m => m.id === pair.topMachine);
  if (!bot || !top) return null;

  let thisMachine: MachineInstance;
  let symbol: string;
  let targetFloor: number;

  if (bot.floor === floorId) {
    thisMachine = bot;
    targetFloor = top.floor;
    symbol = bot.type === 'conveyor-lift-in-bottom' ? '↑' : '↓';
  } else if (top.floor === floorId) {
    thisMachine = top;
    targetFloor = bot.floor;
    symbol = top.type === 'conveyor-lift-out-top' ? '↑' : '↓';
  } else {
    return null;
  }

  return { pairId: pair.id, material: pair.material, machine: thisMachine, symbol, targetFloor };
}

export const LiftOverlay = memo(function LiftOverlay({
  pairs, machines, floorId, highlightChain = [], onHover, onClick,
}: LiftOverlayProps) {
  const badges = pairs
    .map(pair => computeBadge(pair, machines, floorId))
    .filter((b): b is BadgeInfo => b !== null);

  return (
    <g className="lift-overlay-layer">
      {badges.map(badge => {
        const meta = getBuildingMeta(badge.machine.type);
        const { cols, rows } = machineGridSize(meta.dimensions, badge.machine.facing);
        const { x, y } = gridToSvg(badge.machine.pos.col, badge.machine.pos.row);
        const w = cols * GRID_PX;
        const h = rows * GRID_PX;
        const color = getMaterialColor(badge.material);

        // 徽标定位在机器 bbox 的右上角内侧
        const badgeW = Math.max(18, w * 0.55);
        const badgeH = 10;
        const bx = x + w - badgeW - 1;
        const by = y + 1;

        const isHighlighted = highlightChain.includes(badge.pairId);
        const className = ['lift-overlay-badge', isHighlighted && 'element-highlight']
          .filter(Boolean).join(' ');

        return (
          <g key={badge.pairId} className={className}
            onMouseEnter={() => onHover?.(badge.pairId)}
            onMouseLeave={() => onHover?.(null)}
            onClick={() => onClick?.(badge.pairId)}
            style={{ cursor: 'pointer' }}
          >
            <rect x={bx} y={by} width={badgeW} height={badgeH} rx={2}
              fill="rgba(0,0,0,0.6)" stroke={color} strokeWidth={0.5} />
            <text x={bx + badgeW / 2} y={by + badgeH / 2 + 2.5}
              textAnchor="middle" dominantBaseline="middle"
              fill={color} style={{ fontSize: 7, fontWeight: 'bold' }}>
              {badge.symbol}{badge.targetFloor}F
            </text>
          </g>
        );
      })}
    </g>
  );
});
```

**注意**：原文件导出名是 `LiftRenderer`。新文件导出名是 `LiftOverlay`——Task 8 会更新调用点。**本 Task 不改调用点**，所以完成本 Task 后 `FloorPlanView.tsx` 会有类型错误，这是预期的。

- [ ] **Step 7.2：运行 tsc 确认 `LiftRenderer.tsx` 自身无错**

Run: `npx tsc --noEmit 2>&1 | grep "LiftRenderer"`

Expected: 无输出（文件自身无错）。`FloorPlanView.tsx` 的错误仍然存在，这是预期。

- [ ] **Step 7.3：commit**

```bash
git add src/renderers/LiftRenderer.tsx
git commit -m "feat(renderer): 重写 LiftRenderer 为 LiftOverlay 跨楼层徽标层"
```

---

## Task 8: 接线 - FloorPlanView / CrossSectionView / useAppStore

**目标**：把 Task 7 的 `LiftOverlay` 接入 `FloorPlanView`，把 `CrossSectionView` 的数据源从 `scheme.lifts` 切换到 `scheme.liftPairs`，把 `useAppStore` 里所有 lift 相关的引用从 lift id 改为 lift machine id 或 liftPair id。完成后全项目 tsc 绿、vitest 绿。

**Files:**
- Modify: [src/views/FloorPlanView.tsx](../../../src/views/FloorPlanView.tsx)
- Modify: [src/views/CrossSectionView.tsx](../../../src/views/CrossSectionView.tsx)
- Modify: [src/store/useAppStore.ts](../../../src/store/useAppStore.ts)

- [ ] **Step 8.1：更新 `FloorPlanView.tsx`**

打开 [src/views/FloorPlanView.tsx](../../../src/views/FloorPlanView.tsx)。

1. import 从 `LiftRenderer` 改为 `LiftOverlay`：

```tsx
// 旧：
import { LiftRenderer } from '../renderers/LiftRenderer';

// 新：
import { LiftOverlay } from '../renderers/LiftRenderer';
```

2. 删除 line 41 的 `const lifts = scheme.lifts.filter(...)`，替换为：

```tsx
const liftPairs = scheme.liftPairs;
```

3. 删除 lines 72-74 的 `{lifts.map(l => <LiftRenderer ... />)}`，替换为单个 `<LiftOverlay>` 调用：

```tsx
<LiftOverlay
  pairs={liftPairs}
  machines={scheme.machines}
  floorId={floorId}
  highlightChain={highlightChain}
  onHover={hover}
  onClick={select}
/>
```

插入位置：在 machines 渲染之后、belts 渲染之前**或之后**都可（建议**之后**，保证徽标在 belt 之上不被遮挡）。建议放在 `BeltLabelLayer` 之后。

- [ ] **Step 8.2：更新 `CrossSectionView.tsx`**

打开 [src/views/CrossSectionView.tsx](../../../src/views/CrossSectionView.tsx)，找到引用 `scheme.lifts` 的地方（line 25 和 46）。

**修改 line 25** 附近：

```tsx
// 旧：
const lifts = scheme.lifts.filter(l => l.fromFloor === floor.id || l.toFloor === floor.id);

// 新：把 pair 转成"楼层相关"的视图数据
const floorLiftPairs = scheme.liftPairs.filter(pair => {
  const bot = scheme.machines.find(m => m.id === pair.bottomMachine);
  const top = scheme.machines.find(m => m.id === pair.topMachine);
  return bot?.floor === floor.id || top?.floor === floor.id;
});
```

**修改 line 46** 附近的 `lifts.map(l => { ... })`：

原逻辑大概是对每个 `lift` 从 `lift.pos / lift.fromFloor / lift.toFloor / lift.material / lift.mark` 读数据画竖线。新逻辑：

```tsx
{floorLiftPairs.map(pair => {
  const bot = scheme.machines.find(m => m.id === pair.bottomMachine)!;
  const top = scheme.machines.find(m => m.id === pair.topMachine)!;
  // 使用 bot.pos（与 top.pos 相等）作为 xy 位置
  const pos = bot.pos;
  const fromFloor = bot.floor;
  const toFloor = top.floor;
  const material = pair.material;
  const mark = pair.mark;

  // ... 使用这些变量复用原先的绘制逻辑
  return (
    // 原渲染 JSX，把 l.pos / l.fromFloor / l.toFloor / l.material / l.mark
    // 全部替换为 pos / fromFloor / toFloor / material / mark
  );
})}
```

**实现者注意**：cross-section view 的具体渲染 JSX 要保留原样（颜色、线宽、label 全部不变），只改数据来源。

- [ ] **Step 8.3：更新 `useAppStore.ts`**

打开 [src/store/useAppStore.ts](../../../src/store/useAppStore.ts)。

搜索所有 `lift` 相关引用，判断含义后修改：

1. 如果是构建 `highlightChain`（高亮关联链）时从 `scheme.lifts` 遍历取 lift id 的代码，**把数据源改为 `scheme.liftPairs`**，并且把"lift id"的引用语义改为"liftPair id"（overlay 事件传的是 pair.id）。
2. 如果是 `hover` / `select` 处理中把 lift id 映射到机器的逻辑，理解为：现在 pair id 对应两台机器（bot + top），但 highlightChain 的元素粒度仍是**单个 id**。最简单做法：**将来** pair id 被传入 hover/select 时，把 pair 的 bottomMachine 和 topMachine 一起加入 highlightChain。**本 Task 不实现这个展开逻辑**，只确保 store 不再引用旧的 `scheme.lifts`、不再有 `Lift` 类型。
3. 如果有 `lift.connectedBelts` 的读取用于 highlight，**改为从 `liftPair` 找到对应的两台 machine，再查 belts 里 `fromPort` / `toPort` 包含这两个 machine id 的 belt，展开成 belt 集合**。

**搜索命令**（执行时用 Grep tool）：

```
pattern: "scheme\.lifts|lift\.(pos|fromFloor|toFloor|material|mark|connectedBelts)|Lift\b"
path: "src/store/useAppStore.ts"
```

逐条决定如何迁移。如果某处逻辑过于复杂导致无法简单迁移，**简化为"选中 lift pair 时 highlightChain 只包含 pair.id 自身"**，其他展开逻辑留 `// TODO: 未来 pair 级联动高亮` 注释。

- [ ] **Step 8.4：运行 tsc 确认全项目无类型错误**

Run: `npx tsc --noEmit`

Expected: **无输出**（全项目 tsc 绿）。如果仍有错误，查看文件和行号逐一修复。常见遗漏：
- 某处 import 了 `Lift` 类型
- 某处遍历了 `scheme.lifts`
- 某处 React 组件 props 类型引用了 `Lift`

- [ ] **Step 8.5：运行 vitest 确认无回归**

Run: `npx vitest run`

Expected: **全部通过**。

- [ ] **Step 8.6：commit**

```bash
git add src/views/FloorPlanView.tsx src/views/CrossSectionView.tsx src/store/useAppStore.ts
git commit -m "feat(view): 接入 LiftOverlay + CrossSectionView 和 store 切换到 liftPairs"
```

---

## Task 9: 终局验证

**目标**：运行完整的验证链条（tsc + vitest + 浏览器手测），确认本次 PR 的目标达成。

**Files:** 无新增修改（除非发现问题回溯修复）。

- [ ] **Step 9.1：运行完整 tsc**

Run: `npx tsc --noEmit`

Expected: 无输出。

- [ ] **Step 9.2：运行完整 vitest**

Run: `npx vitest run`

Expected: 全部通过，包括：
- Task 3 的 5 条 R18 单元测试
- Task 6 的 v2 方案 error=0 断言
- 所有原有的 beltGeometry / schema 其他测试

- [ ] **Step 9.3：诊断 v2 方案的 warn 分布**

写一段临时验证脚本并运行：

Run: `npx tsx -e "import scheme from './data/schemes/iron-full-line-v2.json' assert { type: 'json' }; import { validateSchemeDetailed } from './src/core/schema.js'; const issues = validateSchemeDetailed(scheme as any); const byRule = issues.reduce((acc, i) => { const k = \`\${i.severity}/\${i.rule}\`; acc[k] = (acc[k] ?? 0) + 1; return acc; }, {} as Record<string, number>); console.log(JSON.stringify(byRule, null, 2));"`

**注意**：项目规则禁止用 bash 脚本修改文件，但**只读验证脚本允许**（[CLAUDE.md](../../../CLAUDE.md) 文件修改规则第 2 条允许读 only）。

Expected: 输出应该只包含：
- `warn/R2-align`: 少量（lift 端口 0.125 偏移引入的机器位置 warn）
- `warn/R8-align`: 少量（belt path 含 0.125 点引入的 warn）
- **没有** R4/R13/R14/R15/R16/R17/R18 的任何 error 或 warn

如果出现其他 warn，回到 Task 5 步骤 5.7 继续迭代。

如果 tsx 命令因为 esm/cjs 问题执行不起来，可以改为在 `src/__tests__/schema.test.ts` 里临时写一个 `console.log(byRule)` 的辅助测试观察输出。

- [ ] **Step 9.4：启动 dev server 做浏览器手测**

Run: `npm run dev` (run_in_background: true)

然后告诉用户：**启动成功后请手动在浏览器中打开 dev server URL，逐项检查**：

- [ ] F1 视图能看到两个升降机 2×2 占地矩形（位置 col=1.5 row=6.5 和 col=5.5 row=6.5）
- [ ] F1 每个 lift 占地显示端口圆点（bottom 端口）
- [ ] F1 每个 lift 右上角显示 `↑2F` 徽标
- [ ] F2 视图能看到两个升降机 2×2 占地矩形（同位置）
- [ ] F2 每个 lift 占地显示端口圆点（top 端口）
- [ ] F2 每个 lift 右上角显示 `↑1F` 徽标
- [ ] F1 的 `b_plate_lift` / `b_rod_lift` 在升降机底部有正常的箭头结尾（不是"凭空断开"）
- [ ] F2 的接料 belt 在升降机顶部有正常的箭头起点
- [ ] F2 产线从 lift 出发向北流动，最终抵达北边储存箱
- [ ] 鼠标 hover 升降机占地矩形或徽标触发高亮
- [ ] 点击升降机触发选中状态（视觉反馈由现有 `element-selected` CSS 提供）
- [ ] 方案选择菜单中只有一份 `"铁矿全产线 v2"`，v1 已消失

如果任意一项不符，记录问题并回到相应 Task 修复。

- [ ] **Step 9.5：关闭 dev server**

杀掉 `npm run dev` 后台进程。

- [ ] **Step 9.6：最终 commit（如有遗留小修）**

如果前面的手测有小的修复，一并 commit。如果没有修复，跳过本步。

```bash
git status  # 确认工作区干净
git log --oneline -10  # 查看本次 PR 的提交历史
```

Expected: 工作区干净，最近 8-9 个 commit 是本计划的产物。

---

## Self-Review Checklist

**spec 覆盖**：
- [x] Spec 2.1 PlaceableType 4 类型 → Task 1 Step 1.1
- [x] Spec 2.1 BuildingType 移除 conveyor-lift → Task 1 Step 1.2
- [x] Spec 2.2 Lift→LiftPair + Scheme.liftPairs → Task 1 Steps 1.3-1.4
- [x] Spec 2.3 MachineInstance 零改 → 全程不动
- [x] Spec 2.4 Registry 4 条新条目 → Task 2 Step 2.2
- [x] Spec 3.1 R18 校验 → Task 3 Step 3.3
- [x] Spec 3.2 R4 豁免删除 → Task 3 Step 3.4
- [x] Spec 3.3 R10 lift 块删除 → Task 3 Step 3.5
- [x] Spec 3.4 R12 ID 集合更新 → Task 3 Step 3.6
- [x] Spec 4.1 LiftOverlay 组件 → Task 7
- [x] Spec 4.2 MachineRenderer 零改 → 文件结构表明确声明
- [x] Spec 4.3 FloorPlanView 接入 → Task 8 Step 8.1
- [x] Spec 4.4 CrossSectionView 数据源 → Task 8 Step 8.2
- [x] Spec 4.5 useAppStore 更新 → Task 8 Step 8.3
- [x] Spec 5.1 v1 删除 + v2 新建 → Tasks 4, 5, 6
- [x] Spec 5.2 F1 保持 + b2 微调空间 → Task 4 Step 4.2 保留 F1 原样
- [x] Spec 5.3 F2 手工重建（尺度 2） → Task 5
- [x] Spec 5.4 验收标准 → Task 9 Steps 9.1-9.4
- [x] Spec 6.2 floorTransform 挂点 → Task 3 Step 3.3 `liftPairAligned(bot, top, _scheme)` 签名预留

**Placeholder 扫描**：已检查无 "TBD"、"TODO: 实现"、"fill in"、"similar to"、"handle error" 等占位符。Task 5 中的 "如果失败回到 Step 5.7 迭代" 是合法的迭代指导，不是占位符。

**类型一致性**：
- `liftPairAligned(bot, top, scheme)` 签名在 Step 3.3 定义，R18 校验调用处一致
- `LiftOverlay` 导出名在 Task 7 定义、Task 8 引用一致
- `LiftPair.bottomMachine` / `topMachine` / `material` / `mark` 字段名在所有 Task 中一致
- `conveyor-lift-in-bottom` / `-out-top` 等类型字符串在 Task 1/2/3/5 中一致

---

## 风险提示（执行时注意）

1. **Task 5 是本计划最长、最易卡住的单任务**。执行者应熟读 [CLAUDE.md](../../../CLAUDE.md) 的"同轴对齐规则"和"机器尺寸参考"，理解 facing / port side / grid offset 的关系。如果 Step 5.7 迭代超过 6 次仍有 error 未消除，停下来和用户对齐 F2 布局方向。

2. **不允许用 bash 脚本修改 JSON**（[CLAUDE.md](../../../CLAUDE.md) 第 1 条）。Task 5 的所有 JSON 修改必须用 Edit/Write 工具。

3. **facing=north 的影响**：F2 生产机器用 facing=north 才能让入口面向南、出口面向北。这和 F1 用 facing=south 的模式相反。belt 端口位置会对应翻转，需要仔细核对 `SIDE_MAP`。

4. **lift 端口 offset=1m=0.125 grid** 会在 belt path 里引入 `.125` 值，触发 R2/R8 的 warn。这是 [CLAUDE.md](../../../CLAUDE.md) "同轴对齐规则" 允许的代价，不要为了消除它去改成 0.25 步进值——会破坏端口同轴对齐。

5. **Task 8 Step 8.3 `useAppStore` 的 lift highlight 迁移可能遇到复杂逻辑**。如果原 store 对 `lift.connectedBelts` 有深度依赖（比如 hover lift 时高亮所有相关 belt），按 Task 8 Step 8.3 最后的降级方案——只高亮 pair.id 自身、其他展开留 TODO。

6. **Task 9 Step 9.4 浏览器手测是必须的**，不能跳过。有些问题只有视觉上才能发现（比如 LiftOverlay 徽标压住了端口圆点）。
