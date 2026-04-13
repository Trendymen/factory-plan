# 传送带物料推导 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从 belt/lift JSON 中移除硬编码 `material` 字段，改为运行时从流量图自动推导物料身份。

**Architecture:** 新增 `src/core/deriveMaterials.ts` 模块，从生产机器配方前向传播物料到下游传送带/升降机。结果存为 `MaterialMap = Map<string, string[]>`，所有 UI 消费者从 store 中的 materialMap 查询物料，不再读 belt.material / pair.material。

**Tech Stack:** TypeScript, Zustand, Vitest

---

## File Structure

| 操作 | 文件 | 职责 |
|------|------|------|
| Create | `src/core/deriveMaterials.ts` | 物料推导算法 |
| Create | `src/__tests__/deriveMaterials.test.ts` | 推导算法单元测试 |
| Modify | `src/core/types.ts` | 删除 BeltSegment.material 和 LiftPair.material |
| Modify | `src/core/computeStats.ts` | BeltFlowEntry 删除 material；computeBeltFlows 不再读 belt.material |
| Modify | `src/core/schema.ts` | 删除 R31 校验 |
| Modify | `src/core/labelLayout.ts` | 接收 materialMap 参数替代 belt.material |
| Modify | `src/store/useAppStore.ts` | 新增 materialMap state |
| Modify | `src/renderers/BeltRenderer.tsx` | 从 materialMap 获取颜色 |
| Modify | `src/renderers/BeltLabelLayer.tsx` | 传递 materialMap 到 labelLayout |
| Modify | `src/renderers/FlowLabelLayer.tsx` | 从 materialMap 获取物料名 |
| Modify | `src/renderers/FlowTooltip.tsx` | 从 materialMap 获取物料名 |
| Modify | `src/renderers/LiftRenderer.tsx` | 从 materialMap 获取物料名 |
| Modify | `src/views/FloorPlanView.tsx` | 传递 materialMap 给子组件 |
| Modify | `src/ui/RightPanel.tsx` | 图例从 materialMap 获取 |
| Modify | `src/ui/MachineDetail.tsx` | 从 materialMap 获取物料名 |
| Modify | `src/ui/MachineTooltip.tsx` | 从 materialMap 获取物料名 |
| Modify | `src/__tests__/schema.test.ts` | 删除 R31 测试；belt 数据移除 material 字段 |
| Modify | `data/schemes/iron-full-line-v2.json` | 删除所有 belt/liftPair 的 material 字段 |

---

### Task 1: 创建 deriveMaterials 核心模块 + 测试

**Files:**
- Create: `src/core/deriveMaterials.ts`
- Create: `src/__tests__/deriveMaterials.test.ts`

- [ ] **Step 1: 写失败测试 — 生产机器直连 belt**

```ts
// src/__tests__/deriveMaterials.test.ts
import { describe, it, expect } from 'vitest';
import { deriveMaterials } from '../core/deriveMaterials';
import type { Scheme } from '../core/types';

const BASE_SCHEME: Scheme = {
  id: 'test', name: 'Test', version: '1.0.0', category: '测试',
  description: '', designPrinciples: { preferWallOutlets: true, preferWallHoles: true, preferCeilingMounts: false, keepFloorClear: true },
  floors: [{ id: 1, label: '1F', gridSize: { cols: 8, rows: 8 } }],
  machines: [], belts: [], liftPairs: [], zones: [],
};

describe('deriveMaterials', () => {
  it('生产机器直连 belt → 单物料', () => {
    const scheme: Scheme = {
      ...BASE_SCHEME,
      machines: [
        { id: 's1', type: 'smelter', pos: { col: 1, row: 1 }, facing: 'south', floor: 1, recipe: 'iron-ingot' },
        { id: 'c1', type: 'constructor', pos: { col: 1, row: 3 }, facing: 'south', floor: 1, recipe: 'iron-plate' },
      ],
      belts: [
        { id: 'b1', floor: 1, mark: 1, path: [{ col: 1.375, row: 2.125 }, { col: 1.375, row: 3 }], fromPort: 's1:out-0', toPort: 'c1:in-0' },
      ],
    };
    const map = deriveMaterials(scheme);
    expect(map.get('b1')).toEqual(['铁锭']);
  });

  it('经过 splitter → 物料透传', () => {
    const scheme: Scheme = {
      ...BASE_SCHEME,
      machines: [
        { id: 's1', type: 'smelter', pos: { col: 1, row: 1 }, facing: 'south', floor: 1, recipe: 'iron-ingot' },
        { id: 'sp1', type: 'splitter', pos: { col: 1, row: 2.5 }, facing: 'south', floor: 1 },
      ],
      belts: [
        { id: 'b1', floor: 1, mark: 1, path: [{ col: 1.375, row: 2.125 }, { col: 1.375, row: 2.5 }], fromPort: 's1:out-0', toPort: 'sp1:in-0' },
        { id: 'b2', floor: 1, mark: 1, path: [{ col: 1.25, row: 2.75 }, { col: 1.25, row: 3.5 }], fromPort: 'sp1:out-0' },
      ],
    };
    const map = deriveMaterials(scheme);
    expect(map.get('b1')).toEqual(['铁锭']);
    expect(map.get('b2')).toEqual(['铁锭']);
  });

  it('经过 merger 混合 → 多物料 union', () => {
    const scheme: Scheme = {
      ...BASE_SCHEME,
      machines: [
        { id: 'c1', type: 'constructor', pos: { col: 0, row: 0 }, facing: 'south', floor: 1, recipe: 'iron-plate' },
        { id: 'c2', type: 'constructor', pos: { col: 2, row: 0 }, facing: 'south', floor: 1, recipe: 'iron-rod' },
        { id: 'mg1', type: 'merger', pos: { col: 1, row: 2.5 }, facing: 'south', floor: 1 },
      ],
      belts: [
        { id: 'b1', floor: 1, mark: 1, path: [{ col: 0.5, row: 1.25 }, { col: 0.5, row: 2.5 }], fromPort: 'c1:out-0', toPort: 'mg1:in-0' },
        { id: 'b2', floor: 1, mark: 1, path: [{ col: 2, row: 1.25 }, { col: 2, row: 2.5 }], fromPort: 'c2:out-0', toPort: 'mg1:in-1' },
        { id: 'b3', floor: 1, mark: 1, path: [{ col: 1.25, row: 2.75 }, { col: 1.25, row: 3.5 }], fromPort: 'mg1:out-0' },
      ],
    };
    const map = deriveMaterials(scheme);
    expect(map.get('b1')).toEqual(['铁板']);
    expect(map.get('b2')).toEqual(['铁棒']);
    expect(map.get('b3')).toEqual(expect.arrayContaining(['铁板', '铁棒']));
    expect(map.get('b3')!.length).toBe(2);
  });

  it('无 fromPort 的外部输入 belt → 空数组', () => {
    const scheme: Scheme = {
      ...BASE_SCHEME,
      machines: [
        { id: 's1', type: 'smelter', pos: { col: 1, row: 1 }, facing: 'south', floor: 1, recipe: 'iron-ingot' },
      ],
      belts: [
        { id: 'b_ext', floor: 1, mark: 1, path: [{ col: 1.375, row: 0 }, { col: 1.375, row: 1 }], toPort: 's1:in-0' },
      ],
    };
    const map = deriveMaterials(scheme);
    expect(map.get('b_ext')).toEqual([]);
  });

  it('同物料 merger → 不重复', () => {
    const scheme: Scheme = {
      ...BASE_SCHEME,
      machines: [
        { id: 's1', type: 'smelter', pos: { col: 0, row: 0 }, facing: 'south', floor: 1, recipe: 'iron-ingot' },
        { id: 's2', type: 'smelter', pos: { col: 2, row: 0 }, facing: 'south', floor: 1, recipe: 'iron-ingot' },
        { id: 'mg1', type: 'merger', pos: { col: 1, row: 2.5 }, facing: 'south', floor: 1 },
      ],
      belts: [
        { id: 'b1', floor: 1, mark: 1, path: [{ col: 0.375, row: 1.25 }, { col: 0.375, row: 2.5 }], fromPort: 's1:out-0', toPort: 'mg1:in-0' },
        { id: 'b2', floor: 1, mark: 1, path: [{ col: 2, row: 1.25 }, { col: 2, row: 2.5 }], fromPort: 's2:out-0', toPort: 'mg1:in-1' },
        { id: 'b3', floor: 1, mark: 1, path: [{ col: 1.25, row: 2.75 }, { col: 1.25, row: 3.5 }], fromPort: 'mg1:out-0' },
      ],
    };
    const map = deriveMaterials(scheme);
    expect(map.get('b3')).toEqual(['铁锭']);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run src/__tests__/deriveMaterials.test.ts`
Expected: FAIL — `deriveMaterials` 模块不存在

- [ ] **Step 3: 实现 deriveMaterials**

```ts
// src/core/deriveMaterials.ts
import type { Scheme, BeltSegment, MachineInstance } from './types';
import { getRecipe } from './recipes';

export type MaterialMap = Map<string, string[]>;

const PRODUCTION_TYPES = new Set<string>([
  'smelter', 'foundry', 'constructor', 'assembler', 'manufacturer',
  'refinery', 'packager', 'blender', 'particle-accelerator', 'quantum-encoder', 'converter',
]);

/**
 * 从流量图前向传播，推导每条 belt 和 liftPair 的物料身份。
 * 返回 Map<elementId, materials[]>。
 */
export function deriveMaterials(scheme: Scheme): MaterialMap {
  const machineById = new Map(scheme.machines.map(m => [m.id, m]));
  const beltByToPort = new Map<string, BeltSegment>();
  for (const belt of scheme.belts) {
    if (belt.toPort) beltByToPort.set(belt.toPort, belt);
  }

  const cache = new Map<string, string[]>();
  const visiting = new Set<string>();

  function deriveBelt(belt: BeltSegment): string[] {
    if (cache.has(belt.id)) return cache.get(belt.id)!;
    if (visiting.has(belt.id)) return [];
    visiting.add(belt.id);

    let materials: string[] = [];

    if (!belt.fromPort) {
      // 外部输入，无法推导
      materials = [];
    } else {
      const [machineId, portId] = belt.fromPort.split(':');
      const machine = machineById.get(machineId);

      if (!machine) {
        materials = [];
      } else if (PRODUCTION_TYPES.has(machine.type)) {
        // 生产机器：从 recipe output 获取物料
        const recipe = getRecipe(machine.recipe);
        if (recipe) {
          const idx = parseInt(portId.split('-')[1] ?? '0', 10);
          const output = recipe.outputs[idx];
          materials = output ? [output.item] : [];
        }
      } else if (machine.type === 'splitter') {
        // 分流器：透传入口物料
        const inBelt = beltByToPort.get(`${machineId}:in-0`);
        materials = inBelt ? deriveBelt(inBelt) : [];
      } else if (machine.type === 'merger') {
        // 合流器：union 所有输入
        const seen = new Set<string>();
        const result: string[] = [];
        for (const inPort of ['in-0', 'in-1', 'in-2']) {
          const inBelt = beltByToPort.get(`${machineId}:${inPort}`);
          if (!inBelt) continue;
          for (const mat of deriveBelt(inBelt)) {
            if (!seen.has(mat)) {
              seen.add(mat);
              result.push(mat);
            }
          }
        }
        materials = result;
      } else if (machine.type === 'storage' || machine.type === 'industrial-storage') {
        // 储存箱：透传
        const inBelt = beltByToPort.get(`${machineId}:in-0`);
        materials = inBelt ? deriveBelt(inBelt) : [];
      } else if (machine.type.startsWith('conveyor-lift-out-')) {
        // 升降机出口：追溯配对升降机入口
        materials = deriveLiftOut(machine);
      }
    }

    visiting.delete(belt.id);
    cache.set(belt.id, materials);
    return materials;
  }

  function deriveLiftOut(outMachine: MachineInstance): string[] {
    // outMachine 是 lift-out-top 或 lift-out-bottom
    // 找到对应的 pair，再找配对的入口机器
    const isTop = outMachine.type.includes('-top');
    for (const pair of scheme.liftPairs) {
      const matchId = isTop ? pair.topMachine : pair.bottomMachine;
      if (matchId !== outMachine.id) continue;
      // 配对的入口机器
      const inMachineId = isTop ? pair.bottomMachine : pair.topMachine;
      // 找连接到入口机器的 belt（升降机入口端口是 "bottom" 或 "top"）
      const inBelt = beltByToPort.get(`${inMachineId}:bottom`) ?? beltByToPort.get(`${inMachineId}:top`);
      return inBelt ? deriveBelt(inBelt) : [];
    }
    return [];
  }

  // 推导所有 belt
  const result: MaterialMap = new Map();
  for (const belt of scheme.belts) {
    result.set(belt.id, deriveBelt(belt));
  }

  // 推导所有 liftPair
  for (const pair of scheme.liftPairs) {
    // 取进入 pair 的 belt 的物料
    const botInBelt = beltByToPort.get(`${pair.bottomMachine}:bottom`);
    const topInBelt = beltByToPort.get(`${pair.topMachine}:top`);
    const inBelt = botInBelt ?? topInBelt;
    result.set(pair.id, inBelt ? deriveBelt(inBelt) : []);
  }

  return result;
}
```

- [ ] **Step 4: 运行测试确认通过**

Run: `npx vitest run src/__tests__/deriveMaterials.test.ts`
Expected: 全部 PASS

- [ ] **Step 5: 提交**

```bash
git add src/core/deriveMaterials.ts src/__tests__/deriveMaterials.test.ts
git commit -m "feat(core): add deriveMaterials module for runtime material inference"
```

---

### Task 2: 类型变更 — 删除 material 字段

**Files:**
- Modify: `src/core/types.ts:80-96`
- Modify: `src/core/computeStats.ts:408-441`

- [ ] **Step 1: 从 BeltSegment 删除 material**

`src/core/types.ts` — 将：

```ts
export interface BeltSegment {
  id: string;
  floor: number;
  mark: BeltMark;
  material: string;
  path: GridPos[];
  fromPort?: string;
  toPort?: string;
}
```

改为：

```ts
export interface BeltSegment {
  id: string;
  floor: number;
  mark: BeltMark;
  path: GridPos[];
  fromPort?: string;
  toPort?: string;
}
```

- [ ] **Step 2: 从 LiftPair 删除 material**

`src/core/types.ts` — 将：

```ts
export interface LiftPair {
  id: string;                   // pair 标识，全局唯一
  bottomMachine: string;        // 指向 scheme.machines 中 F1 的 lift 机器 id
  topMachine: string;           // 指向 scheme.machines 中 F2 的 lift 机器 id
  material: string;             // 物流元数据，用于 LiftOverlay 徽标
  mark: BeltMark;               // 升降机等级（沿用原 Lift.mark 字段含义）
}
```

改为：

```ts
export interface LiftPair {
  id: string;                   // pair 标识，全局唯一
  bottomMachine: string;        // 指向 scheme.machines 中 F1 的 lift 机器 id
  topMachine: string;           // 指向 scheme.machines 中 F2 的 lift 机器 id
  mark: BeltMark;               // 升降机等级（沿用原 Lift.mark 字段含义）
}
```

- [ ] **Step 3: 从 BeltFlowEntry 删除 material，更新 computeBeltFlows**

`src/core/computeStats.ts` — 将：

```ts
export interface BeltFlowEntry {
  material: string;
  flow: number;
  mark?: number;
}
```

改为：

```ts
export interface BeltFlowEntry {
  flow: number;
  mark?: number;
}
```

同文件中 `computeBeltFlows()` 函数内，将：

```ts
    result.set(belt.id, { material: belt.material, flow, mark: belt.mark });
```

改为：

```ts
    result.set(belt.id, { flow, mark: belt.mark });
```

将：

```ts
    result.set(pair.id, { material: pair.material, flow });
```

改为：

```ts
    result.set(pair.id, { flow });
```

- [ ] **Step 4: 运行类型检查，记录所有报错位置**

Run: `npx tsc -b`
Expected: 多处编译错误（所有读 `belt.material` / `pair.material` / `entry.material` 的地方）。这些将在后续 Task 中逐一修复。记下所有报错文件和行号。

- [ ] **Step 5: 提交（类型暂时 broken）**

```bash
git add src/core/types.ts src/core/computeStats.ts
git commit -m "refactor(types): remove material from BeltSegment, LiftPair, BeltFlowEntry"
```

---

### Task 3: Store 集成 — 新增 materialMap

**Files:**
- Modify: `src/store/useAppStore.ts:1-137`

- [ ] **Step 1: 导入 deriveMaterials 并添加 materialMap state**

`src/store/useAppStore.ts` — 添加导入：

```ts
import { deriveMaterials, type MaterialMap } from '../core/deriveMaterials';
```

在 `AppState` interface 中 `beltFlows` 后添加：

```ts
  materialMap: MaterialMap;
```

在初始 state 中 `beltFlows: new Map(),` 后添加：

```ts
  materialMap: new Map(),
```

在 `loadScheme` 的 return 对象中 `beltFlows: computeBeltFlows(scheme),` 后添加：

```ts
      materialMap: deriveMaterials(scheme),
```

- [ ] **Step 2: 运行类型检查确认 store 无误**

Run: `npx tsc -b 2>&1 | head -5`
Expected: store 本身无新错误（其他文件的 material 引用错误仍存在）

- [ ] **Step 3: 提交**

```bash
git add src/store/useAppStore.ts
git commit -m "feat(store): add materialMap to app state via deriveMaterials"
```

---

### Task 4: 删除 R31 校验 + 测试修复

**Files:**
- Modify: `src/core/schema.ts:680-709`
- Modify: `src/__tests__/schema.test.ts`

- [ ] **Step 1: 删除 schema.ts 中的 R31 校验块**

`src/core/schema.ts` — 删除整个 R31 block（第 680-709 行）：

```ts
  // ----------------------------------------------------------
  // R31: 传送带物料类型一致性
  // ----------------------------------------------------------
  {
    const productionSet = new Set<PlaceableType>(['smelter', 'foundry', 'constructor', 'assembler', 'manufacturer', 'refinery', 'packager', 'blender', 'particle-accelerator', 'quantum-encoder', 'converter']);

    for (const b of scheme.belts) {
      if (!b.fromPort) continue;
      const parts = b.fromPort.split(':');
      if (parts.length !== 2) continue;

      const srcMachine = machineById.get(parts[0]);
      if (!srcMachine || !productionSet.has(srcMachine.type)) continue;
      if (!srcMachine.recipe) continue;

      const recipe = getRecipe(srcMachine.recipe);
      if (!recipe) continue;

      const outputItems = recipe.outputs.map(o => o.item);
      if (!outputItems.includes(b.material)) {
        issues.push({
          severity: 'error',
          rule: 'R31-material-mismatch',
          message: `Belt "${b.id}": material "${b.material}" does not match source machine "${srcMachine.id}" output [${outputItems.join(', ')}]`,
          elementId: b.id,
        });
      }
    }
  }
```

如果删除后 `getRecipe` 的导入变为未使用（检查同文件其他引用），保留（R21 仍使用它）。

- [ ] **Step 2: 删除 schema.test.ts 中的 R31 测试**

删除以下三个 test case：

```ts
  it('R31: errors when belt material mismatches source output', () => { ... });
  it('R31: passes when belt material matches source output', () => { ... });
  it('R31: skips belts from splitter/merger', () => { ... });
```

- [ ] **Step 3: 修复 schema.test.ts 中所有 belt/liftPair 的 material 字段**

从测试文件中所有 belt 对象和 liftPair 对象中删除 `material` 属性。

`MINIMAL_SCHEME` 中的 belt：

```ts
// 旧
{ id: 'b1', floor: 1, mark: 1, material: '铁锭', path: [...], fromPort: 's1:out-0', toPort: 'sp1:in-0' },
// 新
{ id: 'b1', floor: 1, mark: 1, path: [...], fromPort: 's1:out-0', toPort: 'sp1:in-0' },
```

对所有 belt 字面量和 liftPair 字面量执行同样操作（约 30+ 处 `material: '...'` 需删除）。

- [ ] **Step 4: 运行测试确认 schema 测试通过**

Run: `npx vitest run src/__tests__/schema.test.ts`
Expected: PASS（R31 测试已删除，其余不受影响）

- [ ] **Step 5: 提交**

```bash
git add src/core/schema.ts src/__tests__/schema.test.ts
git commit -m "refactor(schema): remove R31 material-mismatch validation (now derived)"
```

---

### Task 5: labelLayout 接收 materialMap

**Files:**
- Modify: `src/core/labelLayout.ts:119-237`
- Modify: `src/renderers/BeltLabelLayer.tsx`

- [ ] **Step 1: 修改 computeBeltLabelPositions 签名和内部实现**

`src/core/labelLayout.ts` — 在导入区添加：

```ts
import type { MaterialMap } from './deriveMaterials';
```

修改函数签名，将：

```ts
export function computeBeltLabelPositions(
  belts: BeltSegment[],
  machines: MachineInstance[],
  options?: LabelLayoutOptions,
): BeltLabelPlacement[] {
```

改为：

```ts
export function computeBeltLabelPositions(
  belts: BeltSegment[],
  machines: MachineInstance[],
  materialMap: MaterialMap,
  options?: LabelLayoutOptions,
): BeltLabelPlacement[] {
```

函数体内，将（约第 181-182 行）：

```ts
    const color = getMaterialColor(belt.material);
    const charW = belt.material.length * 7 + 8;
```

改为：

```ts
    const materials = materialMap.get(belt.id) ?? [];
    const label = materials.length > 0 ? materials.join('+') : belt.id;
    const color = getMaterialColor(materials[0] ?? '');
    const charW = label.length * 7 + 8;
```

将（约第 229 行）：

```ts
      text: belt.material,
```

改为：

```ts
      text: label,
```

- [ ] **Step 2: 更新 BeltLabelLayer 传递 materialMap**

`src/renderers/BeltLabelLayer.tsx` — 添加导入：

```ts
import type { MaterialMap } from '../core/deriveMaterials';
```

在 `BeltLabelLayerProps` 中添加：

```ts
  materialMap: MaterialMap;
```

将函数参数解构中添加 `materialMap`：

```ts
}: BeltLabelLayerProps) {
```

修改 `useMemo` 调用中 `computeBeltLabelPositions` 的参数，将：

```ts
  const placements = useMemo(
    () => computeBeltLabelPositions(belts, machines),
    [belts, machines],
  );
```

改为：

```ts
  const placements = useMemo(
    () => computeBeltLabelPositions(belts, machines, materialMap),
    [belts, machines, materialMap],
  );
```

- [ ] **Step 3: 运行类型检查**

Run: `npx tsc -b 2>&1 | grep -c 'error TS'`
Expected: 错误数减少（labelLayout 和 BeltLabelLayer 已修复）

- [ ] **Step 4: 提交**

```bash
git add src/core/labelLayout.ts src/renderers/BeltLabelLayer.tsx
git commit -m "refactor(labelLayout): accept materialMap parameter instead of belt.material"
```

---

### Task 6: FlowLabelLayer + FlowTooltip 迁移

**Files:**
- Modify: `src/renderers/FlowLabelLayer.tsx`
- Modify: `src/renderers/FlowTooltip.tsx`

- [ ] **Step 1: 修改 FlowLabelLayer**

`src/renderers/FlowLabelLayer.tsx` — 添加导入：

```ts
import type { MaterialMap } from '../core/deriveMaterials';
import { getMaterialColor } from '../core/registry';
```

在 `FlowLabelLayerProps` 中添加：

```ts
  materialMap: MaterialMap;
```

函数参数解构中添加 `materialMap`。

在 `renderLabel` 函数内，将（约第 61 行）：

```ts
    const text = `${entry.material} ${entry.flow}/min${markLabel}`;
```

改为：

```ts
    const materials = materialMap.get(id) ?? [];
    const matLabel = materials.length > 0 ? materials.join('+') : '?';
    const text = `${matLabel} ${entry.flow}/min${markLabel}`;
```

- [ ] **Step 2: 修改 FlowTooltip**

`src/renderers/FlowTooltip.tsx` — 添加导入：

```ts
import type { MaterialMap } from '../core/deriveMaterials';
```

在 `FlowTooltipProps` 中添加：

```ts
  materialMap: MaterialMap;
```

函数参数解构中添加 `materialMap`。

将（约第 24 行）：

```ts
  const text = `${entry.material} ${entry.flow}/min${markLabel}`;
```

改为：

```ts
  const materials = materialMap.get(beltId) ?? [];
  const matLabel = materials.length > 0 ? materials.join('+') : '?';
  const text = `${matLabel} ${entry.flow}/min${markLabel}`;
```

- [ ] **Step 3: 提交**

```bash
git add src/renderers/FlowLabelLayer.tsx src/renderers/FlowTooltip.tsx
git commit -m "refactor(renderers): FlowLabelLayer and FlowTooltip use materialMap"
```

---

### Task 7: BeltRenderer + LiftRenderer 迁移

**Files:**
- Modify: `src/renderers/BeltRenderer.tsx`
- Modify: `src/renderers/LiftRenderer.tsx`

- [ ] **Step 1: 修改 BeltRenderer**

`src/renderers/BeltRenderer.tsx` — 添加导入：

```ts
import type { MaterialMap } from '../core/deriveMaterials';
```

在 `BeltRendererProps` 中添加：

```ts
  materialMap: MaterialMap;
```

函数参数解构中添加 `materialMap`。

将（第 42 行）：

```ts
  const color = getMaterialColor(belt.material);
```

改为：

```ts
  const materials = materialMap.get(belt.id) ?? [];
  const color = getMaterialColor(materials[0] ?? '');
```

- [ ] **Step 2: 修改 LiftRenderer**

`src/renderers/LiftRenderer.tsx` — 添加导入：

```ts
import type { MaterialMap } from '../core/deriveMaterials';
```

在 `LiftOverlayProps` 中添加：

```ts
  materialMap: MaterialMap;
```

函数参数解构中添加 `materialMap`。

修改 `BadgeInfo` interface，将 `material: string` 改为 `materials: string[]`。

修改 `computeBadge` 函数签名：添加 `materialMap: MaterialMap` 参数。将：

```ts
  return { pairId: pair.id, material: pair.material, mark: pair.mark, machine, direction, role, targetFloor };
```

改为：

```ts
  const materials = materialMap.get(pair.id) ?? [];
  return { pairId: pair.id, materials, mark: pair.mark, machine, direction, role, targetFloor };
```

在 `LiftOverlay` 组件内，将 `computeBadge` 调用：

```ts
    .map(pair => computeBadge(pair, machines, floorId))
```

改为：

```ts
    .map(pair => computeBadge(pair, machines, floorId, materialMap))
```

将 `<title>` 中的 `{badge.material}` 改为 `{badge.materials.join('+')}`.

- [ ] **Step 3: 提交**

```bash
git add src/renderers/BeltRenderer.tsx src/renderers/LiftRenderer.tsx
git commit -m "refactor(renderers): BeltRenderer and LiftRenderer use materialMap"
```

---

### Task 8: FloorPlanView 透传 materialMap

**Files:**
- Modify: `src/views/FloorPlanView.tsx`

- [ ] **Step 1: 从 store 获取 materialMap 并透传给子组件**

`src/views/FloorPlanView.tsx` — 在 store selector 区域添加：

```ts
  const materialMap = useAppStore(s => s.materialMap);
```

给各子组件传递 `materialMap` prop：

`BeltRenderer`：

```tsx
<BeltRenderer key={b.id} belt={b} machines={scheme.machines} materialMap={materialMap} highlight={...} ... />
```

`BeltLabelLayer`：

```tsx
<BeltLabelLayer belts={belts} machines={scheme.machines} materialMap={materialMap} highlightChain={...} ... />
```

`FlowLabelLayer`：

```tsx
<FlowLabelLayer belts={belts} machines={scheme.machines} materialMap={materialMap} beltFlows={beltFlows} ... />
```

`FlowTooltip`：

```tsx
<FlowTooltip beltId={hoveredId} beltFlows={beltFlows} materialMap={materialMap} svgX={...} svgY={...} />
```

`LiftOverlay`：

```tsx
<LiftOverlay pairs={scheme.liftPairs} machines={scheme.machines} materialMap={materialMap} floorId={floorId} ... />
```

- [ ] **Step 2: 运行类型检查**

Run: `npx tsc -b 2>&1 | grep -c 'error TS'`
Expected: FloorPlanView 和 renderers 的错误已全部消除

- [ ] **Step 3: 提交**

```bash
git add src/views/FloorPlanView.tsx
git commit -m "refactor(views): thread materialMap from store to all renderers"
```

---

### Task 9: UI 面板迁移 — RightPanel / MachineDetail / MachineTooltip

**Files:**
- Modify: `src/ui/RightPanel.tsx`
- Modify: `src/ui/MachineDetail.tsx`
- Modify: `src/ui/MachineTooltip.tsx`

- [ ] **Step 1: 修改 RightPanel**

`src/ui/RightPanel.tsx` — 添加 store selector：

```ts
  const materialMap = useAppStore(s => s.materialMap);
```

将图例部分（约第 21 行）：

```ts
  const usedMaterials = new Set(scheme.belts.map(b => b.material));
```

改为：

```ts
  const usedMaterials = new Set(
    [...materialMap.values()].flatMap(mats => mats),
  );
```

- [ ] **Step 2: 修改 MachineDetail**

`src/ui/MachineDetail.tsx` — 添加 store selector：

```ts
  const materialMap = useAppStore(s => s.materialMap);
```

**升降机详情 — 物料显示**（约第 181 行），将：

```ts
                <span className="detail-key">物料</span><span className="detail-val">{liftPair.material}</span>
```

改为：

```ts
                <span className="detail-key">物料</span><span className="detail-val">{(materialMap.get(liftPair.id) ?? []).join('+') || '—'}</span>
```

**升降机详情 — 吞吐行**（约第 187-188 行），将：

```ts
                    <span className="stat-dot" style={{ background: MATERIAL_RAW_COLORS[liftFlowEntry.material] ?? '#888' }} />
                    <span className="detail-val">↕ {liftFlowEntry.material}</span>
```

改为：

```ts
                    <span className="stat-dot" style={{ background: MATERIAL_RAW_COLORS[(materialMap.get(liftPair.id) ?? [])[0] ?? ''] ?? '#888' }} />
                    <span className="detail-val">↕ {(materialMap.get(liftPair.id) ?? []).join('+') || '—'}</span>
```

**升降机详情 — 连接传送带列表**（约第 198-200 行），将：

```ts
                      <span className="stat-dot" style={{ background: MATERIAL_RAW_COLORS[b.material] ?? '#888' }} />
                      <span className="detail-val">{b.material}</span>
```

改为：

```ts
                      <span className="stat-dot" style={{ background: MATERIAL_RAW_COLORS[(materialMap.get(b.id) ?? [])[0] ?? ''] ?? '#888' }} />
                      <span className="detail-val">{(materialMap.get(b.id) ?? []).join('+') || '—'}</span>
```

**分流器/合流器吞吐 — computeLogisticsFlow**（约第 72-75 行），将：

```ts
      inputs.push({ item: entry.material, rate: entry.flow });
    }
    if (belt.fromPort?.startsWith(machine.id + ':')) {
      outputs.push({ item: entry.material, rate: entry.flow });
```

改为：

```ts
      const matLabel = (materialMap.get(belt.id) ?? []).join('+') || '?';
      inputs.push({ item: matLabel, rate: entry.flow });
    }
    if (belt.fromPort?.startsWith(machine.id + ':')) {
      const matLabel = (materialMap.get(belt.id) ?? []).join('+') || '?';
      outputs.push({ item: matLabel, rate: entry.flow });
```

`computeLogisticsFlow` 函数需要接收 `materialMap` 参数。修改签名：

```ts
function computeLogisticsFlow(
  machine: MachineInstance,
  scheme: Scheme,
  beltFlows: Map<string, BeltFlowEntry>,
  materialMap: MaterialMap,
): ...
```

添加导入：

```ts
import type { MaterialMap } from '../core/deriveMaterials';
```

调用处也需传入 `materialMap`：

```ts
  const logisticsFlow = isLogistics ? computeLogisticsFlow(machine, scheme, beltFlows, materialMap) : null;
```

**普通机器详情 — 连接传送带列表**（约第 300-301 行），与升降机部分同理：

```ts
                    <span className="stat-dot" style={{ background: MATERIAL_RAW_COLORS[(materialMap.get(b.id) ?? [])[0] ?? ''] ?? '#888' }} />
                    <span className="detail-val">{(materialMap.get(b.id) ?? []).join('+') || '—'}</span>
```

- [ ] **Step 3: 修改 MachineTooltip**

`src/ui/MachineTooltip.tsx` — 添加 store selector：

```ts
  const materialMap = useAppStore(s => s.materialMap);
```

添加导入：

```ts
import type { MaterialMap } from '../core/deriveMaterials';
```

**computeLogisticsFlow**（约第 63-66 行），与 MachineDetail 相同的修改 — 添加 `materialMap` 参数并使用。

**computeLiftFlow**（约第 77-80 行），将：

```ts
function computeLiftFlow(
  pair: LiftPair,
  beltFlows: Map<string, BeltFlowEntry>,
): { material: string; rate: number } | null {
  const entry = beltFlows.get(pair.id);
  if (!entry || entry.flow <= 0) return null;
  return { material: entry.material, rate: entry.flow };
}
```

改为：

```ts
function computeLiftFlow(
  pair: LiftPair,
  beltFlows: Map<string, BeltFlowEntry>,
  materialMap: MaterialMap,
): { material: string; rate: number } | null {
  const entry = beltFlows.get(pair.id);
  if (!entry || entry.flow <= 0) return null;
  const matLabel = (materialMap.get(pair.id) ?? []).join('+') || '?';
  return { material: matLabel, rate: entry.flow };
}
```

更新调用处传入 `materialMap`：

```ts
    const liftFlow = computeLiftFlow(liftPair, beltFlows, materialMap);
```

以及：

```ts
    const logisticsFlow = isLogistics ? computeLogisticsFlow(machine, scheme, beltFlows, materialMap) : null;
```

- [ ] **Step 4: 运行完整类型检查**

Run: `npx tsc -b`
Expected: 零错误

- [ ] **Step 5: 提交**

```bash
git add src/ui/RightPanel.tsx src/ui/MachineDetail.tsx src/ui/MachineTooltip.tsx
git commit -m "refactor(ui): RightPanel, MachineDetail, MachineTooltip use materialMap"
```

---

### Task 10: JSON 数据迁移

**Files:**
- Modify: `data/schemes/iron-full-line-v2.json`

- [ ] **Step 1: 从所有 belt 对象中删除 `"material"` 字段**

在 `iron-full-line-v2.json` 中的每条 belt 对象里，删除 `"material": "xxx",` 行（约 45 处）。

例如将：

```json
{
  "id": "b_ore_to_smelter1",
  "floor": 1,
  "mark": 1,
  "material": "铁矿石",
  "path": [...]
}
```

改为：

```json
{
  "id": "b_ore_to_smelter1",
  "floor": 1,
  "mark": 1,
  "path": [...]
}
```

- [ ] **Step 2: 从所有 liftPair 对象中删除 `"material"` 字段**

将：

```json
{ "id": "lift_plate", "bottomMachine": "lift_plate_bot", "topMachine": "lift_plate_top", "material": "铁板", "mark": 1 },
{ "id": "lift_rod",   "bottomMachine": "lift_rod_bot",   "topMachine": "lift_rod_top",   "material": "铁棒", "mark": 1 }
```

改为：

```json
{ "id": "lift_plate", "bottomMachine": "lift_plate_bot", "topMachine": "lift_plate_top", "mark": 1 },
{ "id": "lift_rod",   "bottomMachine": "lift_rod_bot",   "topMachine": "lift_rod_top",   "mark": 1 }
```

- [ ] **Step 3: 运行全部测试确认通过**

Run: `npx vitest run`
Expected: 所有测试 PASS

- [ ] **Step 4: 运行类型检查最终确认**

Run: `npx tsc -b`
Expected: 零错误

- [ ] **Step 5: 提交**

```bash
git add data/schemes/iron-full-line-v2.json
git commit -m "data: remove hardcoded material field from iron-full-line-v2 belts and lifts"
```

---

### Task 11: FlowLabelLayer 的 labelLayout 调用也需传 materialMap

**Files:**
- Modify: `src/renderers/FlowLabelLayer.tsx`

注意：FlowLabelLayer 内部也调用了 `computeBeltLabelPositions`（第 38 行），该函数签名已在 Task 5 改为需要 `materialMap` 参数。

- [ ] **Step 1: 更新 FlowLabelLayer 中的 computeBeltLabelPositions 调用**

将：

```ts
  const placements = useMemo(
    () => computeBeltLabelPositions(normalBelts, machines, { tPreference: 'offset' }),
    [normalBelts, machines],
  );
```

改为：

```ts
  const placements = useMemo(
    () => computeBeltLabelPositions(normalBelts, machines, materialMap, { tPreference: 'offset' }),
    [normalBelts, machines, materialMap],
  );
```

- [ ] **Step 2: 运行类型检查确认无误**

Run: `npx tsc -b`
Expected: 零错误

- [ ] **Step 3: 提交**

```bash
git add src/renderers/FlowLabelLayer.tsx
git commit -m "fix: pass materialMap to computeBeltLabelPositions in FlowLabelLayer"
```

---

### Task 12: 最终验证

- [ ] **Step 1: 运行全部测试**

Run: `npx vitest run`
Expected: 所有测试 PASS

- [ ] **Step 2: 运行类型检查**

Run: `npx tsc -b`
Expected: 零错误

- [ ] **Step 3: 启动开发服务器验证 UI**

Run: `npm run dev`
验证：
- 传送带标签正确显示物料名（如"铁锭"、"铁板"等）
- 传送带颜色与物料匹配
- 升降机徽标显示正确物料
- 右侧面板图例正确
- 点击机器的详情弹窗中物料信息正确
- hover tooltip 显示正确物料

- [ ] **Step 4: 检查 VS Code diagnostics**

使用 `vscode-mcp-server` 检查本次修改的所有文件的 diagnostics，确认无新增问题。
