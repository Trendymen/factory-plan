# 333 Multi-Blueprint Scheme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增一个 `333-multi-blueprint-v1` 方案文件，把 `333` 的 27 台生产机器与 15 路终端产物落成 5 个 `4×4` 蓝图（用 10 个 scheme floor 表示 5 个蓝图的双层结构），并通过专用验证脚本与回归测试。

**Architecture:** 不覆盖现有 `multi-terminal-megabase-v1.json` 或仓库里的 v2 8 层重构方向，而是新增一套独立 scheme。每个蓝图用两个 scheme floor 表示：`A` 层负责生产或入料，`B` 层负责物流夹层、装配或汇流。铁系最复杂的 `iron-rod -> screw` 物流完全留在 `BP1` 内；为释放 `4×4` 布局空间，第三台 `rod constructor` 上移到 `BP1-B`。`BP2` 只做铁系装配，`BP4` 只做终装，`BP5` 只做总出口。

**Tech Stack:** JSON scheme 数据、TypeScript (`tsx`) 验证脚本、Vitest、现有 `validateSchemeDetailed` / `computeSchemeStats` / `deriveMaterials` 纯函数。

**参考文档：**
- Spec: `docs/superpowers/specs/2026-04-22-333-multi-blueprint-design.md`
- Source graph: `333`
- Existing scheme reference: `data/schemes/multi-terminal-megabase-v1.json`
- Validation rules: `src/core/schema.ts`
- Flow/stats helpers: `src/core/computeStats.ts`, `src/core/deriveMaterials.ts`

---

## 文件结构

| 文件 | 职责 |
|---|---|
| `data/schemes/333-multi-blueprint-v1.json` | 新方案文件；用 10 个 floor 表示 5 个蓝图的双层结构 |
| `scripts/validate-333-multi-blueprint.ts` | 方案级 CLI 验证入口；打印 error/warn 与 belt material label |
| `src/__tests__/333MultiBlueprint.test.ts` | 新方案的回归测试：floor 结构、机器编组、终端产出、无 error |
| `project_megabase_session_state.md` | 记录当前推荐实现入口、方案文件名、验证命令 |

**不修改的文件：**
- `src/App.tsx` 已通过 `import.meta.glob('/data/schemes/*.json')` 自动发现新方案
- `package.json` 现有命令足够，验证脚本通过 `npx tsx` 直接运行

**Floor 命名固定为：**

1. `BP1-A 铁系预处理（冶炼+板/棒）`
2. `BP1-B 铁系物流夹层（螺丝+接口）`
3. `BP2-A 铁系入料层`
4. `BP2-B 铁系装配层`
5. `BP3-A 铜钢基础件`
6. `BP3-B 铜钢中间件/接口`
7. `BP4-A 终装入料层`
8. `BP4-B 终装层`
9. `BP5-A 总出口入料层`
10. `BP5-B 总出口汇流层`

---

### Task 1: 脚手架新方案文件、专用 validator 与 smoke test

**Files:**
- Create: `data/schemes/333-multi-blueprint-v1.json`
- Create: `scripts/validate-333-multi-blueprint.ts`
- Create: `src/__tests__/333MultiBlueprint.test.ts`

- [ ] **Step 1: 写失败测试，先锁定 floor 骨架和方案 id**

```typescript
// src/__tests__/333MultiBlueprint.test.ts
import { describe, it, expect } from 'vitest';
import type { Scheme } from '../core/types';
import scheme from '../../data/schemes/333-multi-blueprint-v1.json';

const s = scheme as unknown as Scheme;

describe('333-multi-blueprint-v1 scaffold', () => {
  it('uses 10 floors to represent 5 blueprints x 2 layers', () => {
    expect(s.id).toBe('333-multi-blueprint-v1');
    expect(s.floors.map(f => f.label)).toEqual([
      'BP1-A 铁系预处理（冶炼+板/棒）',
      'BP1-B 铁系物流夹层（螺丝+接口）',
      'BP2-A 铁系入料层',
      'BP2-B 铁系装配层',
      'BP3-A 铜钢基础件',
      'BP3-B 铜钢中间件/接口',
      'BP4-A 终装入料层',
      'BP4-B 终装层',
      'BP5-A 总出口入料层',
      'BP5-B 总出口汇流层',
    ]);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run src/__tests__/333MultiBlueprint.test.ts`

Expected: FAIL，报错 `Cannot find module '../../data/schemes/333-multi-blueprint-v1.json'` 或等价导入错误

- [ ] **Step 3: 写最小 scheme 骨架**

```json
{
  "id": "333-multi-blueprint-v1",
  "name": "333 多蓝图方案 v1（5 蓝图 / 总出口汇流）",
  "version": "1.0.0",
  "category": "megabase",
  "description": "把 333 生产链拆分为 5 个 4x4 蓝图，每个蓝图用 2 个 floor 表示双层结构。",
  "designPrinciples": {
    "preferWallOutlets": true,
    "preferWallHoles": true,
    "preferCeilingMounts": false,
    "keepFloorClear": true
  },
  "floors": [
    { "id": 1, "label": "BP1-A 铁系预处理（冶炼+板/棒）", "gridSize": { "cols": 4, "rows": 4 } },
    { "id": 2, "label": "BP1-B 铁系物流夹层（螺丝+接口）", "gridSize": { "cols": 4, "rows": 4 } },
    { "id": 3, "label": "BP2-A 铁系入料层", "gridSize": { "cols": 4, "rows": 4 } },
    { "id": 4, "label": "BP2-B 铁系装配层", "gridSize": { "cols": 4, "rows": 4 } },
    { "id": 5, "label": "BP3-A 铜钢基础件", "gridSize": { "cols": 4, "rows": 4 } },
    { "id": 6, "label": "BP3-B 铜钢中间件/接口", "gridSize": { "cols": 4, "rows": 4 } },
    { "id": 7, "label": "BP4-A 终装入料层", "gridSize": { "cols": 4, "rows": 4 } },
    { "id": 8, "label": "BP4-B 终装层", "gridSize": { "cols": 4, "rows": 4 } },
    { "id": 9, "label": "BP5-A 总出口入料层", "gridSize": { "cols": 4, "rows": 4 } },
    { "id": 10, "label": "BP5-B 总出口汇流层", "gridSize": { "cols": 4, "rows": 4 } }
  ],
  "machines": [],
  "belts": [],
  "liftPairs": [],
  "zones": []
}
```

- [ ] **Step 4: 写专用 validator 脚本**

```typescript
// scripts/validate-333-multi-blueprint.ts
import scheme from '../data/schemes/333-multi-blueprint-v1.json';
import { validateSchemeDetailed } from '../src/core/schema';
import { deriveMaterials } from '../src/core/deriveMaterials';
import type { Scheme } from '../src/core/types';

const s = scheme as unknown as Scheme;
const issues = validateSchemeDetailed(s);
const errors = issues.filter(i => i.severity === 'error');
const warns = issues.filter(i => i.severity === 'warn');

console.log('\n=== 333-multi-blueprint-v1 Validation ===');
console.log(`Errors: ${errors.length}`);
errors.forEach(e => console.log(`  [${e.rule}] ${e.message}`));

console.log(`\nWarnings: ${warns.length}`);
warns.forEach(w => console.log(`  [${w.rule}] ${w.message}`));

console.log('\n=== Belt labels ===');
const materialMap = deriveMaterials(s);
for (const belt of s.belts) {
  const mats = materialMap.get(belt.id) ?? [];
  const label = mats.length > 0 ? mats.join('+') : belt.id;
  console.log(`  ${belt.id.padEnd(40)} → "${label}"`);
}

if (errors.length > 0) process.exit(1);
```

- [ ] **Step 5: 运行 smoke test 并提交**

Run:
- `npx vitest run src/__tests__/333MultiBlueprint.test.ts`
- `npx tsx scripts/validate-333-multi-blueprint.ts`

Expected:
- floor scaffold test PASS
- validator 输出 `Errors: 0`

```bash
git add data/schemes/333-multi-blueprint-v1.json scripts/validate-333-multi-blueprint.ts src/__tests__/333MultiBlueprint.test.ts
git commit -m "feat(scheme): scaffold 333 multi-blueprint scheme"
```

---

### Task 2: 实现 BP1（铁系预处理总成）

**Files:**
- Modify: `data/schemes/333-multi-blueprint-v1.json`
- Modify: `src/__tests__/333MultiBlueprint.test.ts`

**实现目标：**
- `BP1-A` 放 `2×smelter(iron) + 1×smelter(copper) + 1×foundry(steel) + 1×constructor(plate) + 2×constructor(rod)`
- `BP1-B` 放 `1×constructor(rod) + 2×constructor(screw)` + 必要 `splitter / merger / lift`
- 完成 `BP1 -> BP2` 的 `plate / rod / screw` 输出
- 完成 `BP1 -> BP3` 的 `copper / steel` 输出

- [ ] **Step 1: 先补失败测试，锁定 BP1 roster 和接口对**

```typescript
import { validateSchemeDetailed } from '../core/schema';

describe('BP1 roster', () => {
  it('contains BP1 machine roster and outbound lift pairs', () => {
    const ids = new Set(s.machines.map(m => m.id));
    [
      'bp1a-smelter-iron-1',
      'bp1a-smelter-iron-2',
      'bp1a-smelter-copper',
      'bp1a-foundry-steel',
      'bp1a-con-plate',
      'bp1a-con-rod-1',
      'bp1a-con-rod-2',
      'bp1b-con-rod-3',
      'bp1b-con-screw-1',
      'bp1b-con-screw-2',
    ].forEach(id => expect(ids.has(id)).toBe(true));

    const pairIds = new Set(s.liftPairs.map(p => p.id));
    [
      'bp1-plate-to-bp2',
      'bp1-rod-rotor-to-bp2',
      'bp1-rod-frame-to-bp2',
      'bp1-screw-to-bp2',
      'bp1-copper-to-bp3',
      'bp1-steel-to-bp3',
    ].forEach(id => expect(pairIds.has(id)).toBe(true));
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run src/__tests__/333MultiBlueprint.test.ts`

Expected: FAIL，缺少 `bp1*` machine ids 和 `bp1-*` liftPairs

- [ ] **Step 3: 把 BP1 机器与接口骨架写进 scheme**

实现时优先复用当前 `data/schemes/multi-terminal-megabase-v1.json` 的已验证命名与局部路由习惯，但不要直接沿用旧楼层编号。

先把以下 machine ids 固定下来：

```json
[
  { "id": "bp1a-smelter-iron-1", "type": "smelter", "floor": 1, "recipe": "iron-ingot", "facing": "south", "label": "BP1-A 铁冶炼 1" },
  { "id": "bp1a-smelter-iron-2", "type": "smelter", "floor": 1, "recipe": "iron-ingot", "facing": "south", "label": "BP1-A 铁冶炼 2" },
  { "id": "bp1a-smelter-copper", "type": "smelter", "floor": 1, "recipe": "copper-ingot", "facing": "south", "label": "BP1-A 铜冶炼" },
  { "id": "bp1a-foundry-steel", "type": "foundry", "floor": 1, "recipe": "steel-ingot", "facing": "south", "label": "BP1-A 钢锭铸造" },
  { "id": "bp1a-con-plate", "type": "constructor", "floor": 1, "recipe": "iron-plate", "facing": "south", "label": "BP1-A 铁板" },
  { "id": "bp1a-con-rod-1", "type": "constructor", "floor": 1, "recipe": "iron-rod", "facing": "south", "label": "BP1-A 铁棒 1" },
  { "id": "bp1a-con-rod-2", "type": "constructor", "floor": 1, "recipe": "iron-rod", "facing": "south", "label": "BP1-A 铁棒 2" },
  { "id": "bp1b-con-rod-3", "type": "constructor", "floor": 2, "recipe": "iron-rod", "facing": "south", "label": "BP1-B 铁棒 3" },
  { "id": "bp1b-con-screw-1", "type": "constructor", "floor": 2, "recipe": "screw", "facing": "south", "label": "BP1-B 螺丝 1" },
  { "id": "bp1b-con-screw-2", "type": "constructor", "floor": 2, "recipe": "screw", "facing": "south", "label": "BP1-B 螺丝 2" }
]
```

同时补齐 6 个对外 `liftPairs`：

```json
[
  { "id": "bp1-plate-to-bp2", "bottomMachine": "bp1b-lift-plate-in-bottom", "topMachine": "bp2a-lift-plate-out-top", "mark": 1 },
  { "id": "bp1-rod-rotor-to-bp2", "bottomMachine": "bp1b-lift-rod-rotor-in-bottom", "topMachine": "bp2a-lift-rod-rotor-out-top", "mark": 1 },
  { "id": "bp1-rod-frame-to-bp2", "bottomMachine": "bp1b-lift-rod-frame-in-bottom", "topMachine": "bp2a-lift-rod-frame-out-top", "mark": 1 },
  { "id": "bp1-screw-to-bp2", "bottomMachine": "bp1b-lift-screw-in-bottom", "topMachine": "bp2a-lift-screw-out-top", "mark": 1 },
  { "id": "bp1-copper-to-bp3", "bottomMachine": "bp1b-lift-copper-in-bottom", "topMachine": "bp3a-lift-copper-out-top", "mark": 1 },
  { "id": "bp1-steel-to-bp3", "bottomMachine": "bp1b-lift-steel-in-bottom", "topMachine": "bp3a-lift-steel-out-top", "mark": 1 }
]
```

**重要补充：**
- 用户已确认把 `rod constructor #3` 上移到 `BP1-B`，以释放 `BP1-A` 的几何空间，便于把 `smelter -> constructor` 的真实接入做对。
- `BP1 -> BP2/BP3` 的 6 个对外接口必须按“向上运输”语义实现：`bottomMachine = conveyor-lift-in-bottom`，`topMachine = conveyor-lift-out-top`。

- [ ] **Step 4: 让 BP1 单独通过结构性验证**

补齐 BP1 内部 belts 后，运行：

Run:
- `npx vitest run src/__tests__/333MultiBlueprint.test.ts`
- `npx tsx scripts/validate-333-multi-blueprint.ts`

Expected:
- BP1 roster test PASS
- validator 仍然 `Errors: 0`
- 当前若出现 `R25` / `R30` warn，可以接受；`R13` / `R14a` / `R14c` / `R17` 不可接受

- [ ] **Step 5: 提交**

```bash
git add data/schemes/333-multi-blueprint-v1.json src/__tests__/333MultiBlueprint.test.ts
git commit -m "feat(scheme): implement bp1 iron preprocessing blueprint"
```

---

### Task 3: 实现 BP2 和 BP3（铁系装配 + 铜钢件）

**Files:**
- Modify: `data/schemes/333-multi-blueprint-v1.json`
- Modify: `src/__tests__/333MultiBlueprint.test.ts`

**实现目标：**
- `BP2-A/B` 接住 BP1 的 `plate / rod / screw`，完成 `RIP / Rotor / Modular Frame`
- `BP3-A/B` 接住 BP1 的 `copper / steel`，完成 `Wire / Cable / Copper Sheet / Concrete / Beam / Pipe / Stator / EIB`

- [ ] **Step 1: 写失败测试，锁定 BP2/BP3 关键 machine ids 与 inter-blueprint material**

```typescript
import { deriveMaterials } from '../core/deriveMaterials';

describe('BP2/BP3 structure', () => {
  it('contains BP2/BP3 production roster', () => {
    const ids = new Set(s.machines.map(m => m.id));
    [
      'bp2b-asm-rip',
      'bp2b-asm-rotor',
      'bp2b-asm-modular-frame',
      'bp3a-con-wire',
      'bp3a-con-cable',
      'bp3a-con-copper-sheet',
      'bp3a-con-concrete',
      'bp3a-con-steel-beam',
      'bp3a-con-steel-pipe',
      'bp3b-asm-stator',
      'bp3b-asm-eib',
    ].forEach(id => expect(ids.has(id)).toBe(true));
  });

  it('derives expected materials on key cross-blueprint lift pairs', () => {
    const materialMap = deriveMaterials(s);
    expect(materialMap.get('bp1-screw-to-bp2')).toEqual(['螺丝']);
    expect(materialMap.get('bp1-copper-to-bp3')).toEqual(['铜锭']);
    expect(materialMap.get('bp1-steel-to-bp3')).toEqual(['钢锭']);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run src/__tests__/333MultiBlueprint.test.ts`

Expected: FAIL，缺少 `bp2*` / `bp3*` machine ids；`deriveMaterials` 断言失败

- [ ] **Step 3: 写 BP2 / BP3 机器与 lift 对**

先固定 BP2 / BP3 的装配与基础件 ids：

```json
[
  { "id": "bp2b-asm-rip", "type": "assembler", "floor": 4, "recipe": "reinforced-iron-plate", "facing": "south", "label": "BP2-B 强化铁板" },
  { "id": "bp2b-asm-rotor", "type": "assembler", "floor": 4, "recipe": "rotor", "facing": "south", "label": "BP2-B 转子" },
  { "id": "bp2b-asm-modular-frame", "type": "assembler", "floor": 4, "recipe": "modular-frame", "facing": "south", "label": "BP2-B 模块化框架" },

  { "id": "bp3a-con-wire", "type": "constructor", "floor": 5, "recipe": "wire", "facing": "south", "label": "BP3-A 电线" },
  { "id": "bp3a-con-cable", "type": "constructor", "floor": 5, "recipe": "cable", "facing": "south", "label": "BP3-A 电缆" },
  { "id": "bp3a-con-copper-sheet", "type": "constructor", "floor": 5, "recipe": "copper-sheet", "facing": "south", "label": "BP3-A 铜板" },
  { "id": "bp3a-con-concrete", "type": "constructor", "floor": 5, "recipe": "concrete", "facing": "south", "label": "BP3-A 混凝土" },
  { "id": "bp3a-con-steel-beam", "type": "constructor", "floor": 5, "recipe": "steel-beam", "facing": "south", "label": "BP3-A 钢梁" },
  { "id": "bp3a-con-steel-pipe", "type": "constructor", "floor": 5, "recipe": "steel-pipe", "facing": "south", "label": "BP3-A 钢管" },
  { "id": "bp3b-asm-stator", "type": "assembler", "floor": 6, "recipe": "stator", "facing": "south", "label": "BP3-B 定子" },
  { "id": "bp3b-asm-eib", "type": "assembler", "floor": 6, "recipe": "encased-industrial-beam", "facing": "south", "label": "BP3-B 钢筋混凝土梁" }
]
```

同时补齐 `BP2 -> BP4` 和 `BP3 -> BP4` 的半成品 lift 对：

```json
[
  { "id": "bp2-rotor-to-bp4", "bottomMachine": "bp2b-lift-rotor-out-bottom", "topMachine": "bp4a-lift-rotor-in-top", "mark": 1 },
  { "id": "bp2-frame-to-bp4", "bottomMachine": "bp2b-lift-frame-out-bottom", "topMachine": "bp4a-lift-frame-in-top", "mark": 1 },
  { "id": "bp2-screw-to-bp4", "bottomMachine": "bp2b-lift-screw-out-bottom", "topMachine": "bp4a-lift-screw-in-top", "mark": 1 },
  { "id": "bp3-stator-to-bp4", "bottomMachine": "bp3b-lift-stator-out-bottom", "topMachine": "bp4a-lift-stator-in-top", "mark": 1 },
  { "id": "bp3-pipe-to-bp4", "bottomMachine": "bp3b-lift-pipe-out-bottom", "topMachine": "bp4a-lift-pipe-in-top", "mark": 1 },
  { "id": "bp3-eib-to-bp4", "bottomMachine": "bp3b-lift-eib-out-bottom", "topMachine": "bp4a-lift-eib-in-top", "mark": 1 }
]
```

- [ ] **Step 4: 补全 belts，并让 inter-blueprint material 断言通过**

Run:
- `npx vitest run src/__tests__/333MultiBlueprint.test.ts`
- `npx tsx scripts/validate-333-multi-blueprint.ts`

Expected:
- BP2/BP3 structure tests PASS
- `bp1-screw-to-bp2` / `bp1-copper-to-bp3` / `bp1-steel-to-bp3` 均能被 `deriveMaterials` 正确推导
- validator 没有 structural error

- [ ] **Step 5: 提交**

```bash
git add data/schemes/333-multi-blueprint-v1.json src/__tests__/333MultiBlueprint.test.ts
git commit -m "feat(scheme): implement bp2 and bp3 blueprints"
```

---

### Task 4: 实现 BP4 / BP5，并补终端产出回归测试

**Files:**
- Modify: `data/schemes/333-multi-blueprint-v1.json`
- Modify: `src/__tests__/333MultiBlueprint.test.ts`

**实现目标：**
- `BP4-A` 只做终装入料 landing
- `BP4-B` 放 `motor + heavy-modular-frame`
- `BP5-A` 接 15 路终端 lift landing
- `BP5-B` 放 merger 树 + 总出口 storage

- [ ] **Step 1: 先补失败测试，锁定最终产物与零 error**

```typescript
import { computeSchemeStats } from '../core/computeStats';

describe('333-multi-blueprint-v1 outputs', () => {
  it('matches 333 terminal outputs', () => {
    const stats = computeSchemeStats(s);
    const expected = new Map([
      ['电缆', 9],
      ['电线', 6],
      ['马达', 0.25],
      ['定子', 0.05],
      ['转子', 0.25],
      ['重型模块化框架', 0.25],
      ['模块化框架', 0.1],
      ['钢筋混凝土梁', 0.25],
      ['钢梁', 0.2],
      ['钢管', 0.25],
      ['铜板', 0.05],
      ['强化铁板', 0.1],
      ['铁板', 0.1],
      ['铁棒', 0.1],
      ['混凝土', 0.3],
    ]);

    for (const [material, rate] of expected) {
      expect(stats.outputs.find(o => o.material === material)?.rate).toBe(rate);
    }
  });

  it('has no validation errors', () => {
    const issues = validateSchemeDetailed(s);
    const errors = issues.filter(i => i.severity === 'error');
    if (errors.length > 0) {
      console.error('Unexpected errors in 333-multi-blueprint-v1:');
      errors.forEach(e => console.error(`  [${e.rule}] ${e.message}`));
    }
    expect(errors).toHaveLength(0);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run src/__tests__/333MultiBlueprint.test.ts`

Expected: FAIL，缺少 `bp4*` / `bp5*` 机器，终端产出断言失败

- [ ] **Step 3: 写 BP4 / BP5 机器与 lift 对**

把终装和总出口 ids 固定成下面这组：

```json
[
  { "id": "bp4b-asm-motor", "type": "assembler", "floor": 8, "recipe": "motor", "facing": "south", "label": "BP4-B 马达" },
  { "id": "bp4b-man-hmf", "type": "manufacturer", "floor": 8, "recipe": "heavy-modular-frame", "facing": "south", "label": "BP4-B 重型模块化框架" },

  { "id": "bp5b-merger-01", "type": "merger", "floor": 10, "facing": "south", "label": "BP5-B 合流 01" },
  { "id": "bp5b-merger-02", "type": "merger", "floor": 10, "facing": "south", "label": "BP5-B 合流 02" },
  { "id": "bp5b-merger-03", "type": "merger", "floor": 10, "facing": "south", "label": "BP5-B 合流 03" },
  { "id": "bp5b-merger-04", "type": "merger", "floor": 10, "facing": "south", "label": "BP5-B 合流 04" },
  { "id": "bp5b-merger-05", "type": "merger", "floor": 10, "facing": "south", "label": "BP5-B 合流 05" },
  { "id": "bp5b-merger-06", "type": "merger", "floor": 10, "facing": "south", "label": "BP5-B 合流 06" },
  { "id": "bp5b-merger-07", "type": "merger", "floor": 10, "facing": "south", "label": "BP5-B 合流 07" },
  { "id": "bp5b-storage-out", "type": "storage", "floor": 10, "facing": "south", "label": "BP5-B 总出口" }
]
```

并为所有终端产物补 `liftPairs` 到 `BP5-A`：

```json
[
  "bp2-rip-terminal-to-bp5",
  "bp2-rotor-terminal-to-bp5",
  "bp2-frame-terminal-to-bp5",
  "bp2-plate-terminal-to-bp5",
  "bp2-rod-terminal-to-bp5",
  "bp3-wire-terminal-to-bp5",
  "bp3-cable-terminal-to-bp5",
  "bp3-sheet-terminal-to-bp5",
  "bp3-concrete-terminal-to-bp5",
  "bp3-beam-terminal-to-bp5",
  "bp3-pipe-terminal-to-bp5",
  "bp3-stator-terminal-to-bp5",
  "bp3-eib-terminal-to-bp5",
  "bp4-motor-terminal-to-bp5",
  "bp4-hmf-terminal-to-bp5"
]
```

- [ ] **Step 4: 跑终局验证**

Run:
- `npx vitest run src/__tests__/333MultiBlueprint.test.ts`
- `npx tsx scripts/validate-333-multi-blueprint.ts`

Expected:
- 终端产出断言全部 PASS
- validator 输出 `Errors: 0`
- 若仍有 warns，只保留已知可解释 warn；优先清掉 `R14b / R15 / R16 / R17 / R19`

- [ ] **Step 5: 提交**

```bash
git add data/schemes/333-multi-blueprint-v1.json src/__tests__/333MultiBlueprint.test.ts
git commit -m "feat(scheme): implement bp4 and bp5 blueprints"
```

---

### Task 5: 收尾验证、更新状态文档并做全量回归

**Files:**
- Modify: `project_megabase_session_state.md`
- Modify: `src/__tests__/333MultiBlueprint.test.ts`（若需要收紧 warn 断言）

- [ ] **Step 1: 更新 session state，让后续工作默认指向新方案**

在 `project_megabase_session_state.md` 顶部追加一段摘要，明确：

```md
## 2026-04-22 多蓝图方案入口

- 新方案文件：`data/schemes/333-multi-blueprint-v1.json`
- 专用验证：`npx tsx scripts/validate-333-multi-blueprint.ts`
- 拆分方式：5 个蓝图 / 10 个 floor
- 旧文件 `multi-terminal-megabase-v1.json` 仅作参考，不再作为本轮主实现入口
```

- [ ] **Step 2: 跑方案专用验证**

Run: `npx tsx scripts/validate-333-multi-blueprint.ts`

Expected: `Errors: 0`

- [ ] **Step 3: 跑 targeted regression**

Run:
- `npx vitest run src/__tests__/333MultiBlueprint.test.ts`
- `npx vitest run src/__tests__/schema.test.ts src/__tests__/validateFlow.test.ts`

Expected:
- 新方案测试 PASS
- 现有 schema / flow 回归不被新方案破坏

- [ ] **Step 4: 跑全量回归与构建**

Run:
- `npm test`
- `npm run build`

Expected:
- Vitest 全绿
- Vite build 成功，无 TypeScript 错误

- [ ] **Step 5: 提交**

```bash
git add project_megabase_session_state.md src/__tests__/333MultiBlueprint.test.ts data/schemes/333-multi-blueprint-v1.json scripts/validate-333-multi-blueprint.ts
git commit -m "feat(scheme): finalize 333 multi-blueprint implementation"
```

---

## 自我复审

### 1. Spec coverage

- `5 个蓝图`：由 10 个 floor 映射到 5 个 blueprint，Task 1 已锁死 floor skeleton
- `BP1 吃下铁系预处理与螺丝`：Task 2
- `BP2 只做 RIP / Rotor / Modular Frame`：Task 3
- `BP3 负责铜钢件`：Task 3
- `BP4 负责 Motor + HMF`：Task 4
- `BP5 负责 15 路 → 1 路总出口`：Task 4
- `专用 validator / 回归验证 / 状态文档`：Task 1 与 Task 5

### 2. Placeholder scan

- 无 `TBD` / `TODO`
- 无“后面再补”“类似 Task N”之类跳步写法
- 所有 task 都给了具体文件路径、命令和 commit message

### 3. Type consistency

- 方案 id 固定为 `333-multi-blueprint-v1`
- validator 脚本、测试文件、session state 都引用同一文件名
- floor label、machine id 前缀、liftPair id 前缀全部统一为 `bpN*`
