# Megabase v3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `data/schemes/multi-terminal-megabase-v3.json` — a 12-floor, 4×4-grid factory blueprint that faithfully produces all **15 mainNode terminal outputs** from `333` (cytoscape source), routing every terminal through a merger tree to a single 12F storage.

**Architecture:** 12 floors × 4×4 grid. 1F-7F = production (27 machines preserved from 333); 8F-10F = 3-tier L1 logistics (each collects 5 terminals, merges to 1); 11F = L2 final merger; 12F = final storage. ~13 new splitters + 15 terminal skip-lifts.

**Tech Stack:** JSON scheme file, validated by `src/core/schema.ts` → `validateSchemeDetailed()`. Per-floor TDD via `npx tsx scripts/validate-megabase-v3.ts`.

---

## Required Reading

Before starting any task, read these files:

- **Spec**: `docs/superpowers/specs/2026-04-22-megabase-v3-all-terminals-design.md`
- **Rules**: `CLAUDE.md` — especially R2 (grid align), R7 (orthogonal belts), R13 (collision), R14/R15/R16/R17 (belt routing), R18 (lift pair pos equal)
- **Registry**: `src/core/registry.ts` — machine dimensions and port definitions
- **Recipes**: `data/recipes.json` — recipe IDs for each machine
- **Reference v2 (deleted)**: `git show 188998f:data/schemes/multi-terminal-megabase-v2.json` — the 0-error / 6-warn v2 is the LAST known-good reference for 1F-7F production floor positions
- **Source data**: `/Users/liuzhuo/webstorm_project/factory-plan/333` — cytoscape JSON with 27 production nodes + 15 terminals + 84 flow edges

## Port Position Reference

All positions are `pos + offset` in grid units (1 grid = 8m). `facing=north` rotates 180° from `facing=south`; port side name flips per `SIDE_MAP` in `src/core/coordinate.ts`.

| Machine | Width (grid) | Length (grid) | Port | Offset Col | Side (south) | Side (north) |
|---------|--------------|---------------|------|------------|--------------|--------------|
| smelter | 0.625 | 1.25 | in-0 | +0.3125 | top | bottom |
| smelter | 0.625 | 1.25 | out-0 | +0.3125 | bottom | top |
| foundry | 1.25 | 1.125 | in-0 | +0.1875 | top | bottom |
| foundry | 1.25 | 1.125 | in-1 | +0.8125 | top | bottom |
| foundry | 1.25 | 1.125 | out-0 | +0.625 | bottom | top |
| constructor | 1.0 | 1.25 | in-0 | +0.5 | top | bottom |
| constructor | 1.0 | 1.25 | out-0 | +0.5 | bottom | top |
| assembler | 1.25 | 1.875 | in-0 | +0.3125 | top | bottom |
| assembler | 1.25 | 1.875 | in-1 | +0.8125 | top | bottom |
| assembler | 1.25 | 1.875 | out-0 | +0.5625 | bottom | top |
| manufacturer | 2.25 | 2.5 | in-0 | +0.375 | **bottom**（唯一前入）| **top** |
| manufacturer | 2.25 | 2.5 | in-1 | +0.875 | bottom | top |
| manufacturer | 2.25 | 2.5 | in-2 | +1.375 | bottom | top |
| manufacturer | 2.25 | 2.5 | in-3 | +1.875 | bottom | top |
| manufacturer | 2.25 | 2.5 | out-0 | +1.125 | top | bottom |
| splitter | 0.5 | 0.5 | in-0 | +0.25 | top | bottom |
| splitter | 0.5 | 0.5 | out-0 | +0.25 | bottom | top |
| splitter | 0.5 | 0.5 | out-1 | +0.25（row）| right | left |
| splitter | 0.5 | 0.5 | out-2 | +0.25（row）| left | right |
| merger | 0.5 | 0.5 | in-0 | +0.25 | top | bottom |
| merger | 0.5 | 0.5 | in-1 | +0.25（row）| right | left |
| merger | 0.5 | 0.5 | in-2 | +0.25（row）| left | right |
| merger | 0.5 | 0.5 | out-0 | +0.25 | bottom | top |
| storage | 0.625 | 1.25 | in-0 | +0.3125 | top | bottom |
| storage | 0.625 | 1.25 | out-0 | +0.3125 | bottom | top |
| conveyor-lift | 0.25 | 0.25 | top | +0.125 | top | top |

## Terminal Material Mapping (15 mainNodes)

| # | 物料 | Source Floor → Logistics Floor | Splitter on Source? |
|---|---|---|---|
| 1 | plate | 2F → **8F** | ✅ 2-way (RIP + term) |
| 2 | rod | 2F → **8F** | ✅ 3-way (rotor + mframe + term) |
| 3 | beam | 3F → **8F** | ✅ 2-way (EIB + term) |
| 4 | pipe | 3F → **8F** | ✅ 3-way (stator + HMF + term) |
| 5 | sheet | 4F → **8F** | ❌ direct (terminal-only) |
| 6 | concrete | 4F → **9F** | ✅ 2-way (EIB + term) |
| 7 | wire | 4F → **9F** | ✅ 3-way (existing splitter-wire: cable + stator + term) |
| 8 | cable | 4F → **9F** | ❌ direct |
| 9 | RIP | 5F → **9F** | ✅ 2-way (mframe + term) |
| 10 | rotor | 5F → **9F** | ✅ 2-way (motor + term) |
| 11 | stator | 5F → **10F** | ✅ 2-way (motor + term) |
| 12 | mframe | 6F → **10F** | ✅ 2-way (HMF + term) |
| 13 | EIB | 6F → **10F** | ✅ 2-way (HMF + term) |
| 14 | motor | 6F → **10F** | ❌ direct |
| 15 | HMF | 7F → **10F** | ❌ direct |

---

## Task 0: 脚手架（Scaffold）

**Files:**
- Create: `data/schemes/multi-terminal-megabase-v3.json`
- Create: `scripts/validate-megabase-v3.ts`
- Create: `src/__tests__/megabase-v3-smoke.test.ts`

- [ ] **Step 1: Create empty v3 scheme skeleton**

Create `data/schemes/multi-terminal-megabase-v3.json`:

```json
{
  "id": "multi-terminal-megabase-v3",
  "name": "综合多终点产线 v3（12 层全终端汇流）",
  "version": "0.1.0",
  "category": "megabase",
  "description": "按 333 cytoscape 源重新设计，12 楼层 4×4，15 个 mainNode 全部汇入 12F 总 storage。1F-7F 生产 + 8F-10F 三组 L1 汇流 + 11F L2 终合流 + 12F 总仓储。",
  "designPrinciples": {
    "preferWallOutlets": false,
    "preferWallHoles": false,
    "preferCeilingMounts": false,
    "keepFloorClear": false
  },
  "floors": [
    { "id": 1, "label": "1F 冶炼", "gridSize": { "cols": 4, "rows": 4 } },
    { "id": 2, "label": "2F 铁基础", "gridSize": { "cols": 4, "rows": 4 } },
    { "id": 3, "label": "3F 钢/螺丝", "gridSize": { "cols": 4, "rows": 4 } },
    { "id": 4, "label": "4F 铜/混凝土", "gridSize": { "cols": 4, "rows": 4 } },
    { "id": 5, "label": "5F 装配 A（RIP/rotor/stator）", "gridSize": { "cols": 4, "rows": 4 } },
    { "id": 6, "label": "6F 装配 B（mframe/EIB/motor）", "gridSize": { "cols": 4, "rows": 4 } },
    { "id": 7, "label": "7F 制造（HMF）", "gridSize": { "cols": 4, "rows": 4 } },
    { "id": 8, "label": "8F 物流 L1a（plate/rod/beam/pipe/sheet 汇流）", "gridSize": { "cols": 4, "rows": 4 } },
    { "id": 9, "label": "9F 物流 L1b（concrete/wire/cable/RIP/rotor 汇流）", "gridSize": { "cols": 4, "rows": 4 } },
    { "id": 10, "label": "10F 物流 L1c（stator/mframe/EIB/motor/HMF 汇流）", "gridSize": { "cols": 4, "rows": 4 } },
    { "id": 11, "label": "11F 终合流 L2", "gridSize": { "cols": 4, "rows": 4 } },
    { "id": 12, "label": "12F 总仓储", "gridSize": { "cols": 4, "rows": 4 } }
  ],
  "machines": [],
  "belts": [],
  "lifts": [],
  "liftPairs": [],
  "zones": []
}
```

- [ ] **Step 2: Create validator script**

Create `scripts/validate-megabase-v3.ts` (copy of v2 pattern):

```typescript
import scheme from '../data/schemes/multi-terminal-megabase-v3.json';
import { validateSchemeDetailed } from '../src/core/schema';
import { deriveMaterials } from '../src/core/deriveMaterials';
import type { Scheme } from '../src/core/types';

const s = scheme as unknown as Scheme;
const issues = validateSchemeDetailed(s);
const errors = issues.filter(i => i.severity === 'error');
const warns = issues.filter(i => i.severity === 'warn');

console.log(`\n=== multi-terminal-megabase-v3 Validation ===`);
console.log(`Errors: ${errors.length}`);
errors.forEach(e => console.log(`  [${e.rule}] ${e.message}`));

console.log(`\nWarnings: ${warns.length}`);
const byRule = new Map<string, number>();
warns.forEach(w => byRule.set(w.rule, (byRule.get(w.rule) ?? 0) + 1));
for (const [rule, count] of [...byRule].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${rule}: ${count}`);
}

console.log(`\nAll warnings:`);
warns.forEach(w => console.log(`  [${w.rule}] ${w.message}`));

const mat = deriveMaterials(s);
console.log(`\n=== Belt labels (${s.belts.length} belts) ===`);
for (const belt of s.belts) {
  const mats = mat.get(belt.id) ?? [];
  const label = mats.length > 0 ? mats.join('+') : belt.id;
  console.log(`  ${belt.id.padEnd(40)} → "${label}"`);
}

if (errors.length > 0) process.exit(1);
```

- [ ] **Step 3: Create smoke test**

Create `src/__tests__/megabase-v3-smoke.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import scheme from '../../data/schemes/multi-terminal-megabase-v3.json';
import { validateSchemeDetailed } from '../core/schema';
import type { Scheme } from '../core/types';

describe('multi-terminal-megabase-v3', () => {
  it('loads and has 12 floors', () => {
    const s = scheme as unknown as Scheme;
    expect(s.id).toBe('multi-terminal-megabase-v3');
    expect(s.floors).toHaveLength(12);
    expect(s.floors.every(f => f.gridSize.cols === 4 && f.gridSize.rows === 4)).toBe(true);
  });

  it('has zero error when loaded', () => {
    const s = scheme as unknown as Scheme;
    const issues = validateSchemeDetailed(s);
    const errors = issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
```

- [ ] **Step 4: Run validation and tests**

Run:
```bash
npx tsx scripts/validate-megabase-v3.ts
npx vitest run src/__tests__/megabase-v3-smoke.test.ts
```

Expected: 0 errors, 0 warnings (empty scheme), all tests pass.

- [ ] **Step 5: Commit**

```bash
git add data/schemes/multi-terminal-megabase-v3.json scripts/validate-megabase-v3.ts src/__tests__/megabase-v3-smoke.test.ts
git commit -m "feat(megabase-v3): scaffold 12-floor 4×4 scheme + validator"
```

---

## Task 1: 1F 冶炼层

**Files:**
- Modify: `data/schemes/multi-terminal-megabase-v3.json` — add 1F machines, belts, lifts

**1F 机器清单（13 个）**：
- 4 storage-as-miner（铁矿 ×2、铜矿、煤）— 原矿入口，无需内部 belt
- 1 splitter-iron-ore（铁矿 3 路分流：2 smelter + 1 foundry）
- 3 smelter（铜锭、铁锭 ×2）
- 1 foundry（钢锭）
- 4 lift-bot（→ 2F 铁锭 ×2，→ 3F 钢锭 skip，→ 4F 铜锭 skip）

**关键 col 对齐**：
- lift-bot-copper → 4F splitter-copper:in-0（col 0.75）
- lift-bot-iron-1 → 2F merger-iron:in-1
- lift-bot-iron-2 → 2F merger-iron:in-2
- lift-bot-steel → 3F lift-top-steel（col 3.125, row 3.75 on 3F）

参考 v2 位置（从 `git show 188998f:data/schemes/multi-terminal-megabase-v2.json` 读取 1F 部分，作为已验证 0 warn 的基线直接复用）。

- [ ] **Step 1: 添加 1F 机器**

参考 v2 的 1F 机器块（`git show 188998f:data/schemes/multi-terminal-megabase-v2.json` 中 floor=1 的所有 machines），复制进 v3 `machines` 数组。**预计 13 个机器**，包括：
- `splitter-iron-ore` at (2.125, 0.0625), facing=south
- `smelter-copper` at (0.1875, 0.75), facing=south, recipe="copper-ingot"
- `smelter-iron-1` at (1.1875, 0.75), facing=south, recipe="iron-ingot"
- `smelter-iron-2` at (2, 0.75), facing=south, recipe="iron-ingot"
- `foundry-steel` at (2.75, 0.75), facing=south, recipe="steel-ingot"
- `lift-bot-copper` at (0.625, 3.75), facing=south
- `lift-bot-iron-1` at (1.4375, 3.75), facing=south
- `lift-bot-iron-2` at (2.25, 3.75), facing=south
- `lift-bot-steel` at (3.125, 3.75), facing=south
- 4 storage-as-miner：参考 v2 位置（分布在 row=0 北侧边缘作为"原矿 edge 入口"）

- [ ] **Step 2: 添加 1F belts**

复制 v2 1F 的 belt 块（belt.floor=1）。包括：
- 原矿 edge 进入 smelter/foundry 的 belt
- splitter-iron-ore 分 3 路 belt
- smelter/foundry output → lift-bot（4 条 belt）

- [ ] **Step 3: 运行验证**

```bash
npx tsx scripts/validate-megabase-v3.ts
```

期望：Errors=0, Warnings ≤ 2（只计 1F 相关；此阶段其他楼层为空）。

- [ ] **Step 4: 提交**

```bash
git add data/schemes/multi-terminal-megabase-v3.json
git commit -m "feat(megabase-v3): 1F 冶炼层（13 机器 + 原矿入口）"
```

---

## Task 2: 2F 铁板/铁棒

**Files:**
- Modify: `data/schemes/multi-terminal-megabase-v3.json` — 2F machines + belts + lift pairs

**2F 机器清单（18 个）**：
- 2 lift-top（接收 1F 铁锭 #1、#2）
- 4 constructor（plate + rod×3）— 全部 facing=north
- 1 merger-iron（合流 2 路铁锭）
- 2 splitter（splitter-A-iron 分 4 路铁锭到 cons；splitter-B-iron 二级分流）
- **NEW**: 2 splitter 终端分流
  - `splitter-plate-term`：plate output → (→ 5F RIP, → 8F term)
  - `splitter-rod-3-term`：rod-3 output → (→ 5F rotor, → 6F mframe, → 8F term) 3-way
- **NEW**: 7 lift-bot
  - `lift-bot-plate` → 5F RIP（内部）
  - `lift-bot-rod-1` → 3F screw-1（内部）
  - `lift-bot-rod-2` → 3F screw-2（内部）
  - `lift-bot-rod-3-rotor` → 5F rotor（内部）
  - `lift-bot-rod-3-mframe` → 6F mframe（内部）
  - `lift-bot-plate-term` → 8F terminal（新）
  - `lift-bot-rod-term` → 8F terminal（新）

- [ ] **Step 1: 添加 2F lift-top 和 constructors**

添加：
- `lift-top-iron-1` at (1.4375, 3.75), facing=south, floor=2
- `lift-top-iron-2` at (2.25, 3.75), facing=south, floor=2  [R18 配对 lift-bot-iron-2]
- `con-plate` at (0, 0.75), facing=north, floor=2, recipe="iron-plate"
- `con-rod-1` at (1, 0.75), facing=north, floor=2, recipe="iron-rod"
- `con-rod-2` at (2, 0.75), facing=north, floor=2, recipe="iron-rod"
- `con-rod-3` at (3, 0.75), facing=north, floor=2, recipe="iron-rod"

- [ ] **Step 2: 添加 2F 内部 merger/splitter**

添加：
- `merger-iron` at (1.25, 2.75), facing=north, floor=2（接收 2 路铁锭 → 输出到 splitter-A-iron）
- `splitter-A-iron` at (1.25, 2.125), facing=north, floor=2（分 3 路：plate、rod-1、splitter-B-iron）
- `splitter-B-iron` at (2.25, 2.25), facing=east, floor=2（分 2 路：rod-2、rod-3）

- [ ] **Step 3: 添加 2F 新终端分流器**

添加：
- `splitter-plate-term` at (0.25, 0.25), facing=south, floor=2, label="plate → RIP + 8F 终端"
- `splitter-rod-3-term` at (2.75, 0.25), facing=south, floor=2, label="rod-3 → rotor + mframe + 8F 终端"

- [ ] **Step 4: 添加 2F lift-bot（内部+终端）**

添加 7 个 lift-bot，row=0 顶部北边，按 col 排列（均匀 0.5 间距避免 R13 碰撞）：
- `lift-bot-plate` at (0.1875, 0) body [0.1875, 0.4375]
- `lift-bot-plate-term` at (0.6875, 0) body [0.6875, 0.9375]
- `lift-bot-rod-1` at (1.1875, 0) body [1.1875, 1.4375]
- `lift-bot-rod-2` at (1.6875, 0) body [1.6875, 1.9375]
- `lift-bot-rod-3-rotor` at (2.1875, 0) body [2.1875, 2.4375]
- `lift-bot-rod-3-mframe` at (2.6875, 0) body [2.6875, 2.9375]
- `lift-bot-rod-term` at (3.1875, 0) body [3.1875, 3.4375]

碰撞检查：lift 体 0.25 wide × 0.25 长，col 间距 0.5（body 之间 0.25 gap）确保 R13 eps 无重叠。

- [ ] **Step 5: 添加 2F belts**

按以下流连接：
- `b-f2-iron-1-to-merger`: lift-top-iron-1:top → merger-iron:in-1
- `b-f2-iron-2-to-merger`: lift-top-iron-2:top → merger-iron:in-2
- `b-f2-merger-to-splitterA`: merger-iron:out-0 → splitter-A-iron:in-0
- `b-f2-splitterA-to-plate`: splitter-A-iron:out-0 → con-plate:in-0
- `b-f2-splitterA-to-rod-1`: splitter-A-iron:out-1 → con-rod-1:in-0
- `b-f2-splitterA-to-splitterB`: splitter-A-iron:out-2 → splitter-B-iron:in-0
- `b-f2-splitterB-to-rod-2`: splitter-B-iron:out-0 → con-rod-2:in-0
- `b-f2-splitterB-to-rod-3`: splitter-B-iron:out-1 → con-rod-3:in-0
- `b-f2-plate-to-splitterTerm`: con-plate:out-0 → splitter-plate-term:in-0
- `b-f2-splitterPlateTerm-to-lift-plate`: splitter-plate-term:out-0 → lift-bot-plate:top
- `b-f2-splitterPlateTerm-to-lift-plate-term`: splitter-plate-term:out-1 → lift-bot-plate-term:top
- `b-f2-rod-1-to-lift`: con-rod-1:out-0 → lift-bot-rod-1:top
- `b-f2-rod-2-to-lift`: con-rod-2:out-0 → lift-bot-rod-2:top
- `b-f2-rod-3-to-splitterTerm`: con-rod-3:out-0 → splitter-rod-3-term:in-0
- `b-f2-splitterRod3-to-rotor`: splitter-rod-3-term:out-0 → lift-bot-rod-3-rotor:top
- `b-f2-splitterRod3-to-mframe`: splitter-rod-3-term:out-1 → lift-bot-rod-3-mframe:top
- `b-f2-splitterRod3-to-term`: splitter-rod-3-term:out-2 → lift-bot-rod-term:top

路径设计原则：
- 每 belt 路径至少 2 点，R16 要求最后 1 段垂直于端口所在边
- 顺着 col 边界走避免 R14b（如 col 1.25、2.5 是 con 边界，belt 贴边 eps 无重叠）
- 贴 row 4 / row 0 边缘做长距离横向走线（lift 体贴边但 eps 无重叠）

- [ ] **Step 6: 添加 2F lift pairs 条目**

在 `liftPairs` 数组添加（暂时对应 lift-top 在上层楼还没有对应机器，先留空 topMachine 或填占位。实际 top 配对在后续楼层 task 添加）：
- 本阶段仅添加：`{ "id": "lift-iron-1", "bottomMachine": "lift-bot-iron-1", "topMachine": "lift-top-iron-1", "mark": 1 }`
- 同理 `lift-iron-2`

其他 lift-bot 的 top 配对在各自目标楼层 task 添加。

- [ ] **Step 7: 运行验证**

```bash
npx tsx scripts/validate-megabase-v3.ts
```

期望：Errors=0；Warnings ≤ 3（可接受 R23 输入悬空 warn，因为 plate/rod 的 lift-top 尚未创建）。

- [ ] **Step 8: 提交**

```bash
git add data/schemes/multi-terminal-megabase-v3.json
git commit -m "feat(megabase-v3): 2F 铁基础 + plate/rod 终端分流器"
```

---

## Task 3: 3F 钢/螺丝

**Files:**
- Modify: `data/schemes/multi-terminal-megabase-v3.json`

**3F 机器清单（目标 ≤ 19 个）**：
- 3 lift-top（steel 从 1F, rod-1/rod-2 从 2F）
- 4 constructor（beam facing=north, pipe facing=north, screw-1 facing=south, screw-2 facing=south）
- 1 splitter-steel（分 beam + pipe）
- **NEW**: 3 splitter 终端分流
  - `splitter-beam-term`：beam → (EIB 6F + 8F term)
  - `splitter-pipe-term`：pipe → (stator 5F + HMF 7F + 8F term) 3-way
  - `splitter-screw-hmf`：screw-2 → (rotor 5F + HMF 7F)
- **NEW**: 8 lift-bot

**密度风险**：19 机器 + 大量 belt。**若实施时**：
- R13 碰撞 或
- 单层 warn > 3 条

→ 触发应急预案：**拆 3F + 3G**（beam/pipe 在 3F，screw×2 在 3G，总楼层增至 13），更新 spec 后继续。

- [ ] **Step 1: 添加 3F lift-top**

添加：
- `lift-top-steel` at (3.125, 3.75), facing=south, floor=3 [R18 配对 lift-bot-steel 位置 (3.125, 3.75) on 1F — 注意这是 skip-lift（1F→3F），中间层不占]。等等 —— lift pair 两端 pos 必须相等，但 1F lift-bot-steel pos 是 (3.125, 3.75)，3F 这个 lift-top pos 也是 (3.125, 3.75)。同 pos ✓
- `lift-top-rod-1` at (1.375, 0), facing=south, floor=3（对齐 2F lift-bot-rod-1 pos = (1.375, 0)，但 2F 是 (1.375, 0) 顶部）。R18 等端 pos 相等，这里 lift-top 在 3F 的 pos 是 (1.375, 0) 南边 row=0 —— 与 2F lift-bot-rod-1 在 (1.375, 0) 也 row=0。两端 row=0 相等 ✓
- `lift-top-rod-2` at (2.375, 0), facing=south, floor=3

- [ ] **Step 2: 添加 3F constructors**

- `con-steel-beam` at (0, 0.75), facing=north, floor=3, recipe="steel-beam"
- `con-steel-pipe` at (3, 0.75), facing=north, floor=3, recipe="steel-pipe"
- `con-screw-1` at (1, 0.75), facing=south, floor=3, recipe="screw"
- `con-screw-2` at (2, 0.75), facing=south, floor=3, recipe="screw"

注意 beam/pipe facing=north（input 从 south 边 row 2 接），screw×1/2 facing=south（input 从 north 边 row 0.75 接）。

- [ ] **Step 3: 添加 3F 内部 splitter-steel**

- `splitter-steel` at (3, 2.5), facing=north, floor=3（接收 steel ingot → 分 beam + pipe）

- [ ] **Step 4: 添加 3F 3 个新终端分流器**

- `splitter-beam-term` at (0.25, 2.25), facing=south, floor=3, label="beam → EIB + 8F 终端"
- `splitter-pipe-term` at (3.25, 0), facing=north, floor=3, label="pipe → stator + HMF + 8F 终端 3-way"
- `splitter-screw-hmf` at (2, 3.25), facing=east, floor=3, label="screw-2 → rotor + HMF"

- [ ] **Step 5: 添加 3F lift-bot（共 8 个）**

row=0 或 row=3.75 边：
- `lift-bot-beam` at (0.6875, 0)（→ 6F EIB）
- `lift-bot-beam-term` at (0.1875, 0)（→ 8F term）
- `lift-bot-pipe` at (2.6875, 0)（→ 5F stator，复用 v2 位置）
- `lift-bot-pipe-hmf` at (3.4375, 0)（→ 7F HMF）
- `lift-bot-pipe-term` at (2.1875, 0)（→ 8F term）
- `lift-bot-screw-1` at (0.6875, 3.75)（→ 5F RIP）
- `lift-bot-screw-2` at (1.4375, 3.75)（→ 5F rotor）
- `lift-bot-screw-hmf` at (2.1875, 3.75)（→ 7F HMF）

**运行验证捕获碰撞**：如果 R13 error，微调 col。

- [ ] **Step 6: 添加 3F belts**

- `b-f3-steel-to-splitter`: lift-top-steel:top → splitter-steel:in-0
- `b-f3-splitter-to-pipe`: splitter-steel:out-0 → splitter-pipe-term:in-0
- `b-f3-splitter-to-beam`: splitter-steel:out-1 → splitter-beam-term:in-0
- `b-f3-splitterBeam-to-lift-beam`: splitter-beam-term:out-0 → lift-bot-beam:top
- `b-f3-splitterBeam-to-lift-beam-term`: splitter-beam-term:out-1 → lift-bot-beam-term:top
- `b-f3-splitterPipe-to-lift-pipe`: splitter-pipe-term:out-0 → lift-bot-pipe:top
- `b-f3-splitterPipe-to-lift-pipe-hmf`: splitter-pipe-term:out-1 → lift-bot-pipe-hmf:top
- `b-f3-splitterPipe-to-lift-pipe-term`: splitter-pipe-term:out-2 → lift-bot-pipe-term:top
- `b-f3-rod-1-to-screw-1`: lift-top-rod-1:top → con-screw-1:in-0
- `b-f3-rod-2-to-screw-2`: lift-top-rod-2:top → con-screw-2:in-0
- `b-f3-screw-1-to-lift`: con-screw-1:out-0 → lift-bot-screw-1:top
- `b-f3-screw-2-to-splitterHmf`: con-screw-2:out-0 → splitter-screw-hmf:in-0
- `b-f3-splitterScrewHmf-to-rotor`: splitter-screw-hmf:out-0 → lift-bot-screw-2:top
- `b-f3-splitterScrewHmf-to-hmf`: splitter-screw-hmf:out-1 → lift-bot-screw-hmf:top
- `b-f3-pipe-to-con`: splitter-pipe-term (above) already handles; check if beam/pipe cons have input from splitter-steel... actually `splitter-steel:out-0 → con-steel-pipe` OR `splitter-pipe-term`? Since we put terminal splitter AFTER con, it's: `splitter-steel` distributes ingot TO con-steel-pipe (input), con produces pipe, THEN splitter-pipe-term handles the output 3-way.
  - **修正**: 改为 `splitter-steel:out-0 → con-steel-pipe:in-0`（ingot 输入 con），`con-steel-pipe:out-0 → splitter-pipe-term:in-0`（产品进入终端分流器）。同理 beam。
  - 重新列出受影响 belt：
    - `b-f3-splitter-to-pipe`: splitter-steel:out-0 → **con-steel-pipe:in-0**
    - `b-f3-splitter-to-beam`: splitter-steel:out-1 → **con-steel-beam:in-0**
    - `b-f3-beam-to-splitterTerm`: con-steel-beam:out-0 → splitter-beam-term:in-0
    - `b-f3-pipe-to-splitterTerm`: con-steel-pipe:out-0 → splitter-pipe-term:in-0

- [ ] **Step 7: 添加 lift pairs**

在 liftPairs 添加：
- `lift-steel`（1F↔3F）、`lift-rod-1`（2F↔3F）、`lift-rod-2`（2F↔3F）

- [ ] **Step 8: 运行验证**

```bash
npx tsx scripts/validate-megabase-v3.ts
```

期望：Errors=0；Warnings：≤ 3 条 3F 本层 + 历史累积 ≤ 6。

**若 Errors > 0 或 3F warns > 3**：调整 col/row 直至通过。**若调整后仍无解** → 拆 3F + 3G（更新 spec + floors 数组，分配机器到两层）。

- [ ] **Step 9: 提交**

```bash
git add data/schemes/multi-terminal-megabase-v3.json
git commit -m "feat(megabase-v3): 3F 钢/螺丝 + beam/pipe/screw 终端分流"
```

---

## Task 4: 4F 铜/混凝土

**Files:**
- Modify: `data/schemes/multi-terminal-megabase-v3.json`

**4F 机器清单（14 个）**：
- 1 lift-top（铜锭 from 1F）
- 1 edge storage-miner（石灰石，为 concrete 供料）
- 4 constructor（wire + cable + sheet + concrete 全部 facing=north）
- 1 splitter-copper（分铜锭到 wire + sheet）
- 1 splitter-wire（wire 3-way：cable + stator + term）
- **NEW**: 1 splitter-concrete-term（concrete → EIB + term）
- **NEW**: 6 lift-bot
  - `lift-bot-concrete` → 6F EIB（内部）
  - `lift-bot-concrete-term` → 9F 终端（新）
  - `lift-bot-wire` → 5F stator（已在 v2）
  - `lift-bot-wire-term` → 9F 终端（新，替代 v2 的 8F）
  - `lift-bot-cable-term` → 9F 终端（新）
  - `lift-bot-sheet-term` → 8F 终端

- [ ] **Step 1: 添加 4F lift-top 和 edge storage**

- `lift-top-copper` at (0.625, 3.75), facing=south, floor=4 [R18 配对 1F lift-bot-copper]
- `limestone-miner-storage` at (3.25, 3.75), facing=south, floor=4（edge 来源）

- [ ] **Step 2: 添加 4F constructors**

- `con-wire` at (0, 0.75), facing=north, floor=4, recipe="wire"
- `con-cable` at (1, 0.75), facing=north, floor=4, recipe="cable"
- `con-copper-sheet` at (2, 0.75), facing=north, floor=4, recipe="copper-sheet"
- `con-concrete` at (3, 0.75), facing=north, floor=4, recipe="concrete"

- [ ] **Step 3: 添加 4F 内部 splitter**

- `splitter-copper` at (0.5, 2.5), facing=north, floor=4, label="copper ingot → wire + sheet"
- `splitter-wire` at (0.25, 0.1875), facing=north, floor=4, label="wire 3-way: cable + stator + term"

- [ ] **Step 4: 添加 4F 新 splitter-concrete-term**

- `splitter-concrete-term` at (3.25, 2.5), facing=north, floor=4, label="concrete → EIB + 9F 终端"

- [ ] **Step 5: 添加 6 个 lift-bot**

- `lift-bot-concrete` at (1.1875, 0) → 6F EIB
- `lift-bot-concrete-term` at (3.1875, 0) → 9F 终端
- `lift-bot-wire` at (3.1875, 0)（对齐 5F stator in-1）—— 撞 concrete-term col，需挪开其中一个
- 重新分配：`lift-bot-wire` at (2.6875, 0), `lift-bot-concrete-term` at (3.6875, 0)
- `lift-bot-wire-term` at (0.1875, 0)
- `lift-bot-cable-term` at (0.6875, 0)
- `lift-bot-sheet-term` at (1.6875, 0)

**运行后按 R13 碰撞修正**。

- [ ] **Step 6: 添加 4F belts**

- `b-f4-copper-to-splitter`: lift-top-copper:top → splitter-copper:in-0
- `b-f4-splitterCopper-to-wire`: splitter-copper:out-0 → con-wire:in-0
- `b-f4-splitterCopper-to-sheet`: splitter-copper:out-1 → con-copper-sheet:in-0
- `b-f4-wire-to-splitterWire`: con-wire:out-0 → splitter-wire:in-0
- `b-f4-splitterWire-to-cable`: splitter-wire:out-0 → con-cable:in-0
- `b-f4-splitterWire-to-stator`: splitter-wire:out-1 → lift-bot-wire:top（→ 5F stator）
- `b-f4-splitterWire-to-term`: splitter-wire:out-2 → lift-bot-wire-term:top（→ 9F）
- `b-f4-cable-to-lift-term`: con-cable:out-0 → lift-bot-cable-term:top
- `b-f4-sheet-to-lift-term`: con-copper-sheet:out-0 → lift-bot-sheet-term:top
- `b-f4-limestone-to-concrete`: limestone-miner-storage:out-0 → con-concrete:in-0
- `b-f4-concrete-to-splitterTerm`: con-concrete:out-0 → splitter-concrete-term:in-0
- `b-f4-splitterConcreteTerm-to-eib`: splitter-concrete-term:out-0 → lift-bot-concrete:top
- `b-f4-splitterConcreteTerm-to-term`: splitter-concrete-term:out-1 → lift-bot-concrete-term:top

- [ ] **Step 7: 添加 lift pair**

- `lift-copper`（1F↔4F）

- [ ] **Step 8: 运行验证 + 提交**

```bash
npx tsx scripts/validate-megabase-v3.ts
```

期望 Errors=0；4F warns ≤ 3。

```bash
git add data/schemes/multi-terminal-megabase-v3.json
git commit -m "feat(megabase-v3): 4F 铜/混凝土 + concrete 终端分流"
```

---

## Task 5: 5F 装配 A (RIP + rotor + stator)

**Files:**
- Modify: `data/schemes/multi-terminal-megabase-v3.json`

**5F 机器清单（目标 ≤ 18 个）**：
- 6 lift-top（plate 2F, rod-3-rotor 2F, wire 4F, pipe 3F, screw-1 3F, screw-2 3F）
- 3 assembler（RIP + rotor + stator 全部 facing=south）
- **NEW**: 3 splitter 终端分流
- **NEW**: 6 lift-bot

**关键 col 对齐**（assembler in-0/in-1 port 精确到 0.3125/0.8125 col offset）：
- ass-rip 在 (0, 0.25) body [0, 1.25] × [0.25, 2.125]
  - in-0 at (0.3125, 0.25) — 接 plate
  - in-1 at (0.8125, 0.25) — 接 screw-1
  - out-0 at (0.5625, 2.125) — RIP 输出
- ass-rotor 在 (1.25, 0.25)
  - in-0 at (1.5625, 0.25) — 接 screw-2
  - in-1 at (2.0625, 0.25) — 接 rod-3
  - out-0 at (1.8125, 2.125)
- ass-stator 在 (2.5, 0.25)
  - in-0 at (2.8125, 0.25) — 接 pipe
  - in-1 at (3.3125, 0.25) — 接 wire
  - out-0 at (3.0625, 2.125)

参考 v2 的 5F 布局（`git show b8cc5bf:data/schemes/multi-terminal-megabase-v2.json` 中 floor=5）。

- [ ] **Step 1: 添加 5F lift-top**

6 个，row=0 北边，col 按 assembler input 对齐：
- `lift-top-plate` at (0.1875, 0)（对齐 ass-rip:in-0 col 0.3125，port col 0.3125）
- `lift-top-screw-1` at (0.6875, 0)（对齐 ass-rip:in-1 col 0.8125，port col 0.8125）
- `lift-top-screw-2` at (1.4375, 0)（对齐 ass-rotor:in-0 col 1.5625，port col 1.5625）
- `lift-top-rod-3-rotor` at (1.9375, 0)（对齐 ass-rotor:in-1 col 2.0625）
- `lift-top-pipe` at (2.6875, 0)（对齐 ass-stator:in-0 col 2.8125）
- `lift-top-wire` at (3.1875, 0)（对齐 ass-stator:in-1 col 3.3125）

- [ ] **Step 2: 添加 5F assemblers**

- `ass-rip` at (0, 0.25), facing=south, floor=5, recipe="reinforced-iron-plate"
- `ass-rotor` at (1.25, 0.25), facing=south, floor=5, recipe="rotor"
- `ass-stator` at (2.5, 0.25), facing=south, floor=5, recipe="stator"

- [ ] **Step 3: 添加 5F 3 个终端分流器**

在 row=2.5（assembler 出口下方）放 splitter：
- `splitter-rip-term` at (0.3125, 2.5), facing=south, floor=5
- `splitter-rotor-term` at (1.5625, 2.5), facing=south, floor=5
- `splitter-stator-term` at (2.8125, 2.5), facing=south, floor=5

- [ ] **Step 4: 添加 5F 6 个 lift-bot**

row=3.75 南边：
- `lift-bot-rip` at (0.4375, 3.75) → 6F mframe
- `lift-bot-rip-term` at (0.9375, 3.75) → 9F 终端
- `lift-bot-rotor` at (1.6875, 3.75) → 6F motor
- `lift-bot-rotor-term` at (2.1875, 3.75) → 9F 终端
- `lift-bot-stator` at (2.9375, 3.75) → 6F motor
- `lift-bot-stator-term` at (3.4375, 3.75) → 10F 终端

**按 R13 调整 col 防碰撞**。

- [ ] **Step 5: 添加 5F belts**

每个 assembler 的 out → splitter-term，splitter-term 的 out-0/out-1 分别到两个 lift-bot（内部 + 终端）：

- `b-f5-plate-to-rip`: lift-top-plate:top → ass-rip:in-0
- `b-f5-screw-1-to-rip`: lift-top-screw-1:top → ass-rip:in-1
- `b-f5-screw-2-to-rotor`: lift-top-screw-2:top → ass-rotor:in-0
- `b-f5-rod-3-to-rotor`: lift-top-rod-3-rotor:top → ass-rotor:in-1
- `b-f5-pipe-to-stator`: lift-top-pipe:top → ass-stator:in-0
- `b-f5-wire-to-stator`: lift-top-wire:top → ass-stator:in-1
- `b-f5-rip-to-splitterTerm`: ass-rip:out-0 → splitter-rip-term:in-0
- `b-f5-rotor-to-splitterTerm`: ass-rotor:out-0 → splitter-rotor-term:in-0
- `b-f5-stator-to-splitterTerm`: ass-stator:out-0 → splitter-stator-term:in-0
- `b-f5-splitterRip-to-mframe`: splitter-rip-term:out-0 → lift-bot-rip:top
- `b-f5-splitterRip-to-term`: splitter-rip-term:out-1 → lift-bot-rip-term:top
- `b-f5-splitterRotor-to-motor`: splitter-rotor-term:out-0 → lift-bot-rotor:top
- `b-f5-splitterRotor-to-term`: splitter-rotor-term:out-1 → lift-bot-rotor-term:top
- `b-f5-splitterStator-to-motor`: splitter-stator-term:out-0 → lift-bot-stator:top
- `b-f5-splitterStator-to-term`: splitter-stator-term:out-1 → lift-bot-stator-term:top

- [ ] **Step 6: 添加 lift pairs**

- `lift-plate`, `lift-rod-3-rotor`, `lift-pipe`, `lift-wire`, `lift-screw-1`, `lift-screw-2`（连接 5F lift-top 到下层对应 lift-bot）

- [ ] **Step 7: 运行验证 + 提交**

```bash
npx tsx scripts/validate-megabase-v3.ts
```

期望：Errors=0；5F warns ≤ 3。

```bash
git add data/schemes/multi-terminal-megabase-v3.json
git commit -m "feat(megabase-v3): 5F 装配 A（RIP/rotor/stator 三终端分流）"
```

---

## Task 6: 6F 装配 B (mframe + EIB + motor)

**Files:**
- Modify: `data/schemes/multi-terminal-megabase-v3.json`

**6F 机器清单（目标 ≤ 17 个）**：
- 6 lift-top（RIP 5F, rod-3-mframe 2F, beam 3F, concrete 4F, rotor 5F, stator 5F）
- 3 assembler（mframe + EIB + motor）— facing 按 input 方向决定（可 mixed）
- **NEW**: 3 splitter 终端分流（mframe/EIB/motor）
- **NEW**: 5 lift-bot（mframe→HMF、mframe→term、EIB→HMF、EIB→term、motor→term）

参考 v2 的 6F 布局（`git show eca4940:data/schemes/multi-terminal-megabase-v2.json` floor=6）作为基线，然后增加 3 个新 splitter-term 和 3 个新 lift-bot-term。

- [ ] **Step 1: 添加 6F lift-top**

6 个，按对应 assembler input col 对齐：
- `lift-top-rip` at (0.4375, 3.75) [R18 配对 lift-bot-rip 5F]
- `lift-top-rod-3-mframe` at (0.6875, 3.75)
- `lift-top-beam` at (0.6875, 0)
- `lift-top-concrete` at (2.1875, 0)
- `lift-top-rotor` at (1.6875, 3.75)
- `lift-top-stator` at (2.9375, 3.75)

- [ ] **Step 2: 添加 6F assemblers**

- `ass-mframe` at (0, 0.25), facing=north, floor=6, recipe="modular-frame"
- `ass-eib` at (1.5, 0.25), facing=south, floor=6, recipe="encased-industrial-beam"
- `ass-motor` at (2.75, 0.25), facing=north, floor=6, recipe="motor"

facing 混合是 v2 验证过的最佳布局：mframe/motor 用 facing=north（input 从南边 lift-top-rip/rotor 接），EIB 用 facing=south（input 从北边 lift-top-beam/concrete 接）。

- [ ] **Step 3: 添加 6F 3 个终端分流器**

- `splitter-mframe-term` at (0.3125, 0.1875), facing=south, floor=6
- `splitter-eib-term` at (2.0625, 2.5), facing=north, floor=6
- `splitter-motor-term` at (3.0625, 0.1875), facing=south, floor=6

- [ ] **Step 4: 添加 6F lift-bot（共 5 个）**

- `lift-bot-mframe` at (0.4375, 0) → 7F HMF
- `lift-bot-mframe-term` at (0.1875, 0) → 10F 终端
- `lift-bot-eib` at (3.5, 3.75) → 7F HMF
- `lift-bot-eib-term` at (3.0625, 3.75) → 10F 终端
- `lift-bot-motor-term` at (3.1875, 0) → 10F 终端

- [ ] **Step 5: 添加 6F belts**

按 v2 的工作路径（`git show eca4940:data/schemes/multi-terminal-megabase-v2.json` 中 belt.floor=6），**增加** 3 条新 splitter-term belt：
- `b-f6-rip-to-splitterTerm`: lift-top-rip:top → splitter-mframe-term:in-0（实际上应该先 RIP 到 mframe 输入，再出来的 mframe 输出才分流。修正如下）

**修正流程**：
- RIP 进入 ass-mframe:in-0（已处理）
- rod-3-mframe 进入 ass-mframe:in-1
- ass-mframe 输出 → `splitter-mframe-term` → (→ lift-bot-mframe [HMF], → lift-bot-mframe-term [10F])
- 类似地 EIB：ass-eib out → splitter-eib-term → (lift-bot-eib, lift-bot-eib-term)
- 类似地 motor：ass-motor out → splitter-motor-term → (lift-bot-motor-term)（motor 只有终端无内部消费者，所以本质上不需要 splitter——可考虑简化为 motor 直接 → lift-bot-motor-term）

**简化 motor**：
- 删除 `splitter-motor-term`（motor 无内部消费者）
- 改为 `b-f6-motor-to-term`: ass-motor:out-0 → lift-bot-motor-term:top

最终 6F 机器数：3 ass + 6 lift-top + 2 splitter-term（mframe/EIB）+ 4 lift-bot（mframe/mframe-term/eib/eib-term）+ 1 lift-bot-motor-term = **16 机器**。

- [ ] **Step 6: 添加 lift pairs**

- `lift-rip`（5F↔6F）、`lift-rod-3-mframe`（2F↔6F skip）、`lift-beam`（3F↔6F）、`lift-concrete`（4F↔6F）、`lift-rotor`（5F↔6F）、`lift-stator`（5F↔6F）

- [ ] **Step 7: 运行验证 + 提交**

```bash
npx tsx scripts/validate-megabase-v3.ts
```

期望：Errors=0；6F warns ≤ 3。

```bash
git add data/schemes/multi-terminal-megabase-v3.json
git commit -m "feat(megabase-v3): 6F 装配 B（mframe/EIB/motor 终端分流）"
```

---

## Task 7: 7F 制造 HMF (含 4 路输入齐备)

**Files:**
- Modify: `data/schemes/multi-terminal-megabase-v3.json`

**7F 机器清单（7 个）**：
- 4 lift-top（mframe 6F, pipe 3F, EIB 6F, screw 3F — HMF 的 4 路输入）
- 1 manufacturer（HMF）facing=north（input 在 top 侧）
- **NEW**: splitter 或直连？HMF 只有终端用途，所以 con-HMF 输出直接到 lift-bot-hmf-term（无 splitter）
- 1 lift-bot（HMF → 10F 终端）

- [ ] **Step 1: 添加 7F lift-top（4 路 HMF 输入）**

manufacturer HMF at (0.375, 0.25), facing=north, body [0.375, 2.625] × [0.25, 2.75]. Port col offsets:
- in-0 at col 0.375 + 0.375 = **0.75**
- in-1 at col 0.375 + 0.875 = **1.25**
- in-2 at col 0.375 + 1.375 = **1.75**
- in-3 at col 0.375 + 1.875 = **2.25**

所有 in 在 top 边 row=0.25（facing=north → front=top）。注意 manufacturer 是唯一 **front=input** 机器。

lift-top 配对：
- `lift-top-mframe-hmf` at (0.625, 0) — port col 0.75 对齐 HMF:in-0 [配对 6F lift-bot-mframe]
- `lift-top-pipe-hmf` at (1.125, 0) — port col 1.25 对齐 HMF:in-1 [配对 3F lift-bot-pipe-hmf]
- `lift-top-eib-hmf` at (1.625, 0) — port col 1.75 对齐 HMF:in-2 [配对 6F lift-bot-eib]
- `lift-top-screw-hmf` at (2.125, 0) — port col 2.25 对齐 HMF:in-3 [配对 3F lift-bot-screw-hmf]

- [ ] **Step 2: 添加 7F manufacturer**

- `ass-hmf` at (0.375, 0.25), facing=north, floor=7, recipe="heavy-modular-frame"

- [ ] **Step 3: 添加 7F lift-bot**

- `lift-bot-hmf-term` at (1.125, 2.75) or similar safe position → 10F 终端

HMF out-0 at col 0.375 + 1.125 = 1.5, row 2.75（facing=north → back=bottom）。lift-bot-hmf-term port col 需对齐 HMF:out-0 的 col 1.5，所以 lift-bot pos = (1.375, 2.75)，port col 1.5。

- `lift-bot-hmf-term` at (1.375, 2.75), facing=south, floor=7

**碰撞检查**：HMF body [0.375, 2.625] × [0.25, 2.75]，lift-bot 在 row [2.75, 3] 边缘，row 2.75 edge，col 1.375–1.625。eps 无重叠 ✓。

- [ ] **Step 4: 添加 7F belts**

- `b-f7-mframe-to-hmf`: lift-top-mframe-hmf:top → ass-hmf:in-0
- `b-f7-pipe-to-hmf`: lift-top-pipe-hmf:top → ass-hmf:in-1
- `b-f7-eib-to-hmf`: lift-top-eib-hmf:top → ass-hmf:in-2
- `b-f7-screw-to-hmf`: lift-top-screw-hmf:top → ass-hmf:in-3
- `b-f7-hmf-to-term`: ass-hmf:out-0 → lift-bot-hmf-term:top

- [ ] **Step 5: 添加 lift pairs**

- `lift-mframe-hmf`（6F↔7F）、`lift-pipe-hmf`（3F↔7F skip）、`lift-eib-hmf`（6F↔7F）、`lift-screw-hmf`（3F↔7F skip）

- [ ] **Step 6: 运行验证 + 提交**

```bash
npx tsx scripts/validate-megabase-v3.ts
```

期望：Errors=0；7F warns ≤ 3；**HMF 所有 4 路输入已连（无 R23）**。

```bash
git add data/schemes/multi-terminal-megabase-v3.json
git commit -m "feat(megabase-v3): 7F HMF 4 路输入齐备"
```

---

## Task 8: 8F 物流 L1a (plate/rod/beam/pipe/sheet)

**Files:**
- Modify: `data/schemes/multi-terminal-megabase-v3.json`

**8F 机器清单（9 个）**：
- 5 lift-top（plate、rod、beam、pipe、sheet 从各源楼层 skip）
- 3 merger（L1a 3-in merges plate+rod+beam；L1b 2-in merges pipe+sheet；L1-final 2-in merges L1a+L1b）
- 1 lift-bot（→ 11F 终合流）

**布局模板**：

```
Row 0 (上):    [lift-top-plate] [lift-top-rod] [lift-top-beam] [lift-top-pipe] [lift-top-sheet]
               col 0.1875         0.6875         1.4375         2.4375           3.1875
                 |                  |               |              |               |

Row 1.5:      [merger-L1a (3-in)]              [merger-L1b (2-in)]
               col 0.75-1.25                    col 2.5-3
                        \                         /
                         \                       /
Row 2.75:              [merger-L1-final (2-in)]
                         col 1.5-2
                               |
Row 3.5:                 [lift-bot → 11F]
                            col ~1.625
```

- [ ] **Step 1: 添加 8F lift-top**

- `lift-top-plate-term` at (0.1875, 0), facing=south, floor=8 [R18 配对 2F lift-bot-plate-term at (0.1875, 0)]

**注意**：lift pair R18 要求 pos 相等。2F lift-bot-plate-term 位置是 (0.6875, 0)（见 Task 2 Step 4），所以这里 lift-top-plate-term 要同 pos (0.6875, 0)，不是 0.1875。

- 修正：按 2F lift-bot 实际位置：
  - `lift-top-plate-term` at (0.6875, 0) [配对 2F lift-bot-plate-term]
  - `lift-top-rod-term` at (3.375, 0) [配对 2F lift-bot-rod-term]
  - `lift-top-beam-term` at (0.1875, 0) [配对 3F lift-bot-beam-term]
  - `lift-top-pipe-term` at (2.1875, 0) [配对 3F lift-bot-pipe-term]
  - `lift-top-sheet-term` at (1.6875, 0) [配对 4F lift-bot-sheet-term]

- [ ] **Step 2: 添加 8F merger**

- `merger-l1a` at (0.5, 1.5), facing=south, floor=8, label="L1a 3-in（plate+rod+beam）"
  - 3 inputs: in-0(top)=(0.75, 1.5), in-1(right→left→left side col 0.5)=(0.5, 1.75), in-2(right side col 1)=(1, 1.75)
- `merger-l1b` at (2.5, 1.5), facing=south, floor=8, label="L1b 2-in（pipe+sheet）"
- `merger-l1-final` at (1.5, 2.75), facing=south, floor=8, label="L1-final 2-in（l1a+l1b）"

- [ ] **Step 3: 添加 8F lift-bot**

- `lift-bot-l1a-to-11f` at (1.625, 3.75), facing=south, floor=8 [配对 11F lift-top-l1a at (1.625, 3.75)]

- [ ] **Step 4: 添加 8F belts（5 终端 → 2 merger → 1 merger → 1 lift-bot）**

- `b-f8-plate-to-mergerL1a`: lift-top-plate-term:top → merger-l1a:in-0 (或 in-1/in-2 按几何决定)
- `b-f8-rod-to-mergerL1a`: lift-top-rod-term:top → merger-l1a:in-1
- `b-f8-beam-to-mergerL1a`: lift-top-beam-term:top → merger-l1a:in-2
- `b-f8-pipe-to-mergerL1b`: lift-top-pipe-term:top → merger-l1b:in-0
- `b-f8-sheet-to-mergerL1b`: lift-top-sheet-term:top → merger-l1b:in-1
- `b-f8-mergerL1a-to-final`: merger-l1a:out-0 → merger-l1-final:in-0
- `b-f8-mergerL1b-to-final`: merger-l1b:out-0 → merger-l1-final:in-1
- `b-f8-final-to-lift`: merger-l1-final:out-0 → lift-bot-l1a-to-11f:top

**belt 路径**：由于 8F 很拥挤（9 机器 + 8 条 belt），根据 R16/R14b 可能需要多次迭代。建议先尝试直接垂直 belt，验证后按 warn 调整。

- [ ] **Step 5: 添加 lift pairs**

- `lift-plate-term`（2F↔8F skip）、`lift-rod-term`（2F↔8F skip）、`lift-beam-term`（3F↔8F skip）、`lift-pipe-term`（3F↔8F skip）、`lift-sheet-term`（4F↔8F skip）

- [ ] **Step 6: 运行验证 + 提交**

```bash
npx tsx scripts/validate-megabase-v3.ts
```

期望：Errors=0；8F warns ≤ 3。

**若 warns > 3**：应急预案 — 把 merger-l1-final 移到独立楼层（8G），减少 8F 机器数。更新 floors 数组，总楼层增至 13。

```bash
git add data/schemes/multi-terminal-megabase-v3.json
git commit -m "feat(megabase-v3): 8F 物流 L1a（plate/rod/beam/pipe/sheet 5→1 汇流）"
```

---

## Task 9: 9F 物流 L1b (concrete/wire/cable/RIP/rotor)

**Files:**
- Modify: `data/schemes/multi-terminal-megabase-v3.json`

**9F 机器清单（9 个）**：5 lift-top + 3 merger + 1 lift-bot。**与 Task 8 相同模板**，但物料和楼层不同。

**9F 分组**：
- merger-L1a (3-in) 合并 concrete, wire, cable（全 4F 来）
- merger-L1b (2-in) 合并 RIP, rotor（全 5F 来）
- merger-L1-final (2-in) 合 L1a+L1b → lift-bot → 11F

- [ ] **Step 1: 添加 9F lift-top（R18 配对源楼层 lift-bot pos）**

- `lift-top-concrete-term` at (3.1875, 0), facing=south, floor=9 [配对 4F lift-bot-concrete-term]
- `lift-top-wire-term` at (0.1875, 0), facing=south, floor=9 [配对 4F lift-bot-wire-term]
- `lift-top-cable-term` at (0.6875, 0), facing=south, floor=9 [配对 4F lift-bot-cable-term]
- `lift-top-rip-term` at (0.9375, 3.75), facing=south, floor=9 [配对 5F lift-bot-rip-term]
- `lift-top-rotor-term` at (2.1875, 3.75), facing=south, floor=9 [配对 5F lift-bot-rotor-term]

- [ ] **Step 2: 添加 9F merger**

- `merger-9f-l1a` at (0.5, 1.5), facing=south, floor=9, label="9F L1a（concrete+wire+cable）3-in"
- `merger-9f-l1b` at (1.75, 2.5), facing=south, floor=9, label="9F L1b（RIP+rotor）2-in"
- `merger-9f-final` at (1.5, 2.75), facing=south, floor=9, label="9F L1-final 2-in"

- [ ] **Step 3: 添加 9F lift-bot**

- `lift-bot-l1b-to-11f` at (1.625, 3.75), facing=south, floor=9

注：与 8F/10F 的 lift-bot 同 pos (1.625, 3.75) 会 R13 碰撞吗？不同楼层的机器 R13 是按楼层独立检查的，所以 pos 相同无碰撞问题。反而配合 11F 有三个 lift-top 在 row 3.75 需要三个不同 col。

**修正 pos**：8F lift-bot 用 col 1.0625，9F 用 col 1.625，10F 用 col 2.1875 — 三个 col 不同，在 11F 配对三个不同 lift-top。

- `lift-bot-l1b-to-11f` at (1.625, 3.75), facing=south, floor=9

(8F 和 10F 的对应 lift-bot 在各自 task 中修正 col)

- [ ] **Step 4: 添加 9F belts**

- `b-f9-concrete-to-mergerL1a`: lift-top-concrete-term:top → merger-9f-l1a:in-0 or side input
- `b-f9-wire-to-mergerL1a`: lift-top-wire-term:top → merger-9f-l1a:in-1/in-2
- `b-f9-cable-to-mergerL1a`: lift-top-cable-term:top → merger-9f-l1a:in-1/in-2
- `b-f9-rip-to-mergerL1b`: lift-top-rip-term:top → merger-9f-l1b:in-0 or side
- `b-f9-rotor-to-mergerL1b`: lift-top-rotor-term:top → merger-9f-l1b:in-1 or in-2
- `b-f9-mergerL1a-to-final`: merger-9f-l1a:out-0 → merger-9f-final:in-0 or side
- `b-f9-mergerL1b-to-final`: merger-9f-l1b:out-0 → merger-9f-final:in-1
- `b-f9-final-to-lift`: merger-9f-final:out-0 → lift-bot-l1b-to-11f:top

端口具体选择按路径长度最优化（避免 R17 回头绕路）。

- [ ] **Step 5: 添加 lift pairs**

- `lift-concrete-term`（4F↔9F）、`lift-wire-term`（4F↔9F）、`lift-cable-term`（4F↔9F）、`lift-rip-term`（5F↔9F）、`lift-rotor-term`（5F↔9F）、`lift-l1b-to-11f`（9F↔11F）

- [ ] **Step 6: 运行验证 + 提交**

```bash
npx tsx scripts/validate-megabase-v3.ts
```

期望：Errors=0；9F warns ≤ 3。

```bash
git add data/schemes/multi-terminal-megabase-v3.json
git commit -m "feat(megabase-v3): 9F 物流 L1b（concrete/wire/cable/RIP/rotor 5→1 汇流）"
```

---

## Task 10: 10F 物流 L1c (stator/mframe/EIB/motor/HMF)

**Files:**
- Modify: `data/schemes/multi-terminal-megabase-v3.json`

**10F 机器清单（9 个）**：5 lift-top + 3 merger + 1 lift-bot。同 Task 8/9 模板。

**10F 分组**：
- merger-L1a (3-in) 合并 stator, mframe, EIB
- merger-L1b (2-in) 合并 motor, HMF
- merger-L1-final (2-in) 合 L1a+L1b → lift-bot → 11F

- [ ] **Step 1: 添加 10F lift-top（R18 配对）**

- `lift-top-stator-term` at (3.4375, 3.75), facing=south, floor=10 [配对 5F lift-bot-stator-term]
- `lift-top-mframe-term` at (0.1875, 0), facing=south, floor=10 [配对 6F lift-bot-mframe-term]
- `lift-top-eib-term` at (3.0625, 3.75), facing=south, floor=10 [配对 6F lift-bot-eib-term]
- `lift-top-motor-term` at (3.1875, 0), facing=south, floor=10 [配对 6F lift-bot-motor-term]
- `lift-top-hmf-term` at (1.375, 2.75), facing=south, floor=10 [配对 7F lift-bot-hmf-term]

注：lift-top-hmf-term 在 row 2.75 是因为 7F HMF 的 lift-bot-hmf-term 在同 pos (1.375, 2.75)。R18 要求等 pos，所以 10F 这个 lift 不在边缘而在中间。

- [ ] **Step 2: 添加 10F merger**

- `merger-10f-l1a` at (0.5, 1.5), facing=south, floor=10
- `merger-10f-l1b` at (2.5, 1.5), facing=south, floor=10
- `merger-10f-final` at (1.5, 2.75), facing=south, floor=10

- [ ] **Step 3: 添加 10F lift-bot**

- `lift-bot-l1c-to-11f` at (2.1875, 3.75), facing=south, floor=10

- [ ] **Step 4: 添加 10F belts**

```
stator, mframe, EIB → merger-10f-l1a
motor, HMF → merger-10f-l1b
l1a, l1b → merger-10f-final → lift-bot-l1c-to-11f
```

具体 belt 命名按 8F/9F 模板（`b-f10-<mat>-to-merger-<layer>`）。

- [ ] **Step 5: 添加 lift pairs**

- `lift-stator-term`、`lift-mframe-term`、`lift-eib-term`、`lift-motor-term`、`lift-hmf-term`、`lift-l1c-to-11f`

- [ ] **Step 6: 运行验证 + 提交**

```bash
npx tsx scripts/validate-megabase-v3.ts
```

期望：Errors=0；10F warns ≤ 3。

```bash
git add data/schemes/multi-terminal-megabase-v3.json
git commit -m "feat(megabase-v3): 10F 物流 L1c（装配产品 5→1 汇流）"
```

---

## Task 11: 11F 终合流 L2

**Files:**
- Modify: `data/schemes/multi-terminal-megabase-v3.json`

**11F 机器清单（5 个）**：
- 3 lift-top（from 8F/9F/10F）
- 1 merger-final (3-in)
- 1 lift-bot（→ 12F 总仓储）

**R18 约束**：11F lift-top pos 必须与 8F/9F/10F 的对应 lift-bot pos 相同。三个 lift-top 在不同 col 以避免 11F 本层碰撞：
- 8F 的 `lift-bot-l1a-to-11f` pos = (1.0625, 3.75) → 11F `lift-top-l1a` 同 pos
- 9F 的 `lift-bot-l1b-to-11f` pos = (1.625, 3.75) → 11F `lift-top-l1b` 同 pos
- 10F 的 `lift-bot-l1c-to-11f` pos = (2.1875, 3.75) → 11F `lift-top-l1c` 同 pos

**重要**：Task 8 的 lift-bot-l1a 位置要改为 (1.0625, 3.75)（之前是 1.625）。Task 10 的 lift-bot-l1c 已是 (2.1875, 3.75)。Task 9 保持 (1.625, 3.75)。

- [ ] **Step 1: 添加 11F lift-top**

- `lift-top-l1a` at (1.0625, 3.75), facing=south, floor=11 [配对 8F lift-bot-l1a-to-11f]
- `lift-top-l1b` at (1.625, 3.75), facing=south, floor=11 [配对 9F lift-bot-l1b-to-11f]
- `lift-top-l1c` at (2.1875, 3.75), facing=south, floor=11 [配对 10F lift-bot-l1c-to-11f]

碰撞检查：三个 lift 体 col [1.0625, 1.3125], [1.625, 1.875], [2.1875, 2.4375]，gap 0.3125/0.3125 → eps 无重叠 ✓

- [ ] **Step 2: 添加 11F merger + lift-bot**

- `merger-l2-final` at (1.5, 2), facing=north, floor=11, label="11F 终合流 3-in（15 mainNode 全汇入）"
  - facing=north: in-0 (back→bottom row 2.5) = (1.75, 2.5), in-1 (left→left col 1.5) = (1.5, 2.25), in-2 (right→right col 2) = (2, 2.25), out-0 (front→top row 2) = (1.75, 2)

- `lift-bot-to-12f` at (1.625, 0), facing=south, floor=11 [port col 1.75 对齐 merger out-0]

- [ ] **Step 3: 添加 11F belts**

- `b-f11-l1a-to-merger`: lift-top-l1a:top → merger-l2-final:in-1 (left side)
- `b-f11-l1b-to-merger`: lift-top-l1b:top → merger-l2-final:in-0 (back)
- `b-f11-l1c-to-merger`: lift-top-l1c:top → merger-l2-final:in-2 (right side)
- `b-f11-merger-to-lift`: merger-l2-final:out-0 → lift-bot-to-12f:top

- [ ] **Step 4: 添加 lift pairs**

- `lift-l1a-to-11f`（8F↔11F）、`lift-l1b-to-11f`（9F↔11F）、`lift-l1c-to-11f`（10F↔11F）、`lift-to-12f`（11F↔12F）

- [ ] **Step 5: 运行验证 + 提交**

```bash
npx tsx scripts/validate-megabase-v3.ts
```

期望：Errors=0；11F warns ≤ 2。

```bash
git add data/schemes/multi-terminal-megabase-v3.json
git commit -m "feat(megabase-v3): 11F 终合流 L2（3 路 L1 → 1 路 storage）"
```

---

## Task 12: 12F 总仓储

**Files:**
- Modify: `data/schemes/multi-terminal-megabase-v3.json`

**12F 机器清单（2 个）**：
- 1 lift-top（from 11F）
- 1 storage（总终端）

- [ ] **Step 1: 添加 12F lift-top + storage**

- `lift-top-final` at (1.625, 0), facing=south, floor=12 [配对 11F lift-bot-to-12f at (1.625, 0)]
- `storage-final` at (1.3125, 1), facing=south, floor=12, label="12F 总仓储（所有 15 mainNode 最终汇聚）"

storage body [1.3125, 1.9375] × [1, 2.25]. in-0 at (1.625, 1) (top 边，facing=south → back=top)，col 1.625 正好与 lift-top-final port col 对齐（port col = 1.625 + 0.125 = 1.75... 等等）

实际 port 计算：
- lift-top-final at (1.625, 0). port 'top' at (1.625 + 0.125, 0) = (1.75, 0)
- storage-final at (1.3125, 1). in-0 (back=top, facing=south) at (1.3125 + 0.3125, 1) = (1.625, 1)

两者 col 不等（1.75 vs 1.625）。需要调整：
- lift-top-final at (1.5, 0), port col 1.625 → 对齐 storage in-0 col 1.625 ✓
- 更新 Task 11 的 lift-bot-to-12f 为 pos (1.5, 0) 同 col

**修正**（回溯 Task 11 Step 2）：`lift-bot-to-12f` at (1.5, 0), port col 1.625 对齐 storage col 1.625。

- [ ] **Step 2: 添加 belt**

- `b-f12-lift-to-storage`: lift-top-final:top → storage-final:in-0

- [ ] **Step 3: 添加 lift pair**

- `lift-final`（11F↔12F）

- [ ] **Step 4: 最终验证**

```bash
npx tsx scripts/validate-megabase-v3.ts
npx vitest run src/__tests__/megabase-v3-smoke.test.ts
```

**最终期望**：
- Errors = 0
- 全方案 warns ≤ 20
- 每层 warns ≤ 3
- 所有 15 mainNode 物料可达 storage-final（通过 belt label 反推）
- HMF 4 路输入齐备（无 R23）

- [ ] **Step 5: 提交**

```bash
git add data/schemes/multi-terminal-megabase-v3.json
git commit -m "feat(megabase-v3): 12F 总仓储（15 mainNode 全汇聚）"
```

---

## Task 13: 最终集成测试

**Files:**
- Modify: `src/__tests__/megabase-v3-smoke.test.ts` — 加强测试

- [ ] **Step 1: 完善 smoke test**

追加测试：

```typescript
it('has 27 production machines', () => {
  const s = scheme as unknown as Scheme;
  const productionTypes = ['smelter', 'foundry', 'constructor', 'assembler', 'manufacturer'];
  const productionMachines = s.machines.filter(m => productionTypes.includes(m.type));
  expect(productionMachines.length).toBe(23); // 3+1+12+6+1=23 (storage-miner 另计)
  const storageMiners = s.machines.filter(m => m.type === 'storage' && m.id.includes('miner'));
  expect(storageMiners.length).toBe(4);
});

it('has 15 terminal skip-lifts', () => {
  const s = scheme as unknown as Scheme;
  const termLifts = s.machines.filter(m =>
    m.id.startsWith('lift-bot-') && m.id.endsWith('-term')
  );
  expect(termLifts.length).toBe(15);
});

it('HMF has all 4 inputs connected', () => {
  const s = scheme as unknown as Scheme;
  const hmfInputBelts = s.belts.filter(b => b.toPort?.startsWith('ass-hmf:in-'));
  const connectedPorts = new Set(hmfInputBelts.map(b => b.toPort));
  expect(connectedPorts.size).toBe(4);
  expect(connectedPorts.has('ass-hmf:in-0')).toBe(true);
  expect(connectedPorts.has('ass-hmf:in-1')).toBe(true);
  expect(connectedPorts.has('ass-hmf:in-2')).toBe(true);
  expect(connectedPorts.has('ass-hmf:in-3')).toBe(true);
});

it('final storage receives material from L2 merger', () => {
  const s = scheme as unknown as Scheme;
  const storageInBelts = s.belts.filter(b => b.toPort === 'storage-final:in-0');
  expect(storageInBelts.length).toBeGreaterThanOrEqual(1);
});

it('all 12 floors have at least one machine', () => {
  const s = scheme as unknown as Scheme;
  for (let floor = 1; floor <= 12; floor++) {
    const floorMachines = s.machines.filter(m => m.floor === floor);
    expect(floorMachines.length).toBeGreaterThan(0);
  }
});

it('total warning count stays under 20', () => {
  const s = scheme as unknown as Scheme;
  const issues = validateSchemeDetailed(s);
  const warns = issues.filter(i => i.severity === 'warn');
  expect(warns.length).toBeLessThanOrEqual(20);
});
```

- [ ] **Step 2: 运行所有测试**

```bash
npx vitest run src/__tests__/megabase-v3-smoke.test.ts
npx tsc -b
```

期望：所有测试通过，TypeScript 编译无错误（除已知 unified-base test 的 TS2307）。

- [ ] **Step 3: 最终提交**

```bash
git add src/__tests__/megabase-v3-smoke.test.ts
git commit -m "test(megabase-v3): 完整性测试（27 生产 + 15 终端 + HMF 4 路 + 12 楼层）"
```

---

## 密度风险与应急预案

### 3F 预案（19 机器）
如 Errors > 0 或 warns > 3：
1. 拆 3F + 3G：3F = beam + pipe cons + 相关分流；3G = screw-1 + screw-2 + screw-hmf 分流
2. 更新 spec floors 数组，总楼层 → 13
3. 重做 Task 3，拆分为 Task 3a + Task 3b

### 5F/6F 预案（18/17 机器）
如超标：类似拆 5F/5G、6F/6G。

### 8F/9F/10F 预案（9 机器 + 3 merger）
如单层 merger tree 无法收敛：
1. 把 L1-final merger 移到独立楼层（8G/9G/10G）
2. L1 楼层只做 5→2，新增楼层做 2→1
3. 总楼层最多 → 16

---

## 实施检查清单（每 task 结束时）

- [ ] `npx tsx scripts/validate-megabase-v3.ts` — Errors=0
- [ ] 当前楼层 warns ≤ 3
- [ ] 全方案 warns 累计 ≤ 20（完工时）
- [ ] TypeScript 编译 `npx tsc -b` — 无新错误
- [ ] 若新增测试，`npx vitest run` — 通过
- [ ] Git 已提交当前阶段

完工后，memo/memory 里更新项目状态。
