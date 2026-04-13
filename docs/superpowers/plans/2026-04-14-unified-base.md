# Unified Base Production Line Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `data/schemes/unified-base.json` — a 3-floor factory blueprint for the copper/iron/limestone unified production line with Rotor, Modular Frame, and Smart Plating capability.

**Architecture:** 3-floor, 12×10 grid per floor. F1 smelting + output, F2 manufacturing, F3 assembly. 21 production machines, 8 lift pairs, 7 output terminals. All machines south-facing. Designed for vertical copy-paste expansion.

**Tech Stack:** JSON scheme file, validated by `src/core/schema.ts` → `validateSchemeDetailed()`, tested via `npx vitest run`.

---

## Required Reading

Before starting any task, read these files:
- **Spec**: `docs/superpowers/specs/2026-04-14-unified-base-design.md`
- **Rules**: `CLAUDE.md` — especially R2 (grid align), R7 (orthogonal belts), R13 (collision), R14/R15/R16/R17 (belt routing)
- **Registry**: `src/core/registry.ts` — machine dimensions and port definitions
- **Recipes**: `data/recipes.json` — recipe IDs for each machine
- **Example**: `data/schemes/iron-full-line-v2.json` — working scheme reference

## Port Position Reference (all south-facing)

All positions are `pos + offset` in grid units (1 grid = 8m).

| Machine | Width | Length | Port | Col Offset | Row Offset | Side |
|---------|-------|--------|------|------------|------------|------|
| smelter | 0.625 | 1.25 | in-0 | +0.3125 | 0 | back(top) |
| smelter | 0.625 | 1.25 | out-0 | +0.3125 | +1.25 | front(bottom) |
| constructor | 1.0 | 1.25 | in-0 | +0.5 | 0 | back(top) |
| constructor | 1.0 | 1.25 | out-0 | +0.5 | +1.25 | front(bottom) |
| assembler | 1.125 | 2.0 | in-0 | +0.3125 | 0 | back(top) |
| assembler | 1.125 | 2.0 | in-1 | +0.8125 | 0 | back(top) |
| assembler | 1.125 | 2.0 | out-0 | +0.5625 | +2.0 | front(bottom) |
| splitter | 0.5 | 0.5 | in-0 | +0.25 | 0 | back(top) |
| splitter | 0.5 | 0.5 | out-0 | +0.25 | +0.5 | front(bottom) |
| splitter | 0.5 | 0.5 | out-1 | +0.5 | +0.25 | left(→screen right) |
| splitter | 0.5 | 0.5 | out-2 | 0 | +0.25 | right(→screen left) |
| merger | 0.5 | 0.5 | in-0 | +0.25 | 0 | back(top) |
| merger | 0.5 | 0.5 | in-1 | +0.5 | +0.25 | left(→screen right) |
| merger | 0.5 | 0.5 | in-2 | 0 | +0.25 | right(→screen left) |
| merger | 0.5 | 0.5 | out-0 | +0.25 | +0.5 | front(bottom) |
| lift | 0.25 | 0.25 | bottom/top | +0.125 | +0.125 | top(center) |

**Smelter pos.col trick:** To get port at col N (0.25-aligned), set `pos.col = N - 0.3125`. Example: port at 2.5 → pos.col = 2.1875. This produces R2 warnings (not 0.25-aligned) which is acceptable per CLAUDE.md alignment rules.

**Constructor pos.col:** Port naturally 0.25-aligned when pos.col is 0.25-aligned. `port_col = pos.col + 0.5`.

**Assembler pos.col trick:** To get both in-0 and in-1 on 0.25 grid, set `pos.col = N - 0.3125` where N is a multiple of 0.25. Then in-0 at N, in-1 at N+0.5, out-0 at N+0.25.

---

## Task 1: Create Base JSON + All Production Machines

**Files:**
- Create: `data/schemes/unified-base.json`

- [ ] **Step 1: Create the scheme file with metadata and floors**

```json
{
  "id": "unified-base",
  "name": "大一统基础产线",
  "version": "1.0.0",
  "category": "mixed",
  "description": "铜铁石灰石三矿大一统产线 3F — RIP/Rotor/ModFrame 常驻 + Smart Plating flex 机位，12×10×3F 垂直可复制模块",
  "designPrinciples": {
    "preferWallOutlets": false,
    "preferWallHoles": false,
    "preferCeilingMounts": false,
    "keepFloorClear": false
  },
  "floors": [
    { "id": 1, "label": "1F 冶炼 & 输出", "gridSize": { "cols": 12, "rows": 10 } },
    { "id": 2, "label": "2F 制造", "gridSize": { "cols": 12, "rows": 10 } },
    { "id": 3, "label": "3F 组装", "gridSize": { "cols": 12, "rows": 10 } }
  ],
  "machines": [],
  "belts": [],
  "liftPairs": [],
  "zones": []
}
```

- [ ] **Step 2: Add F1 production machines (5 smelters + 2 concrete constructors)**

All south-facing, floor 1.

| id | type | pos.col | pos.row | recipe | label | Port col |
|----|------|---------|---------|--------|-------|----------|
| fe-smelt-1 | smelter | 1.1875 | 1.25 | iron-ingot | 铁冶炼 #1 | 1.5 |
| fe-smelt-2 | smelter | 2.1875 | 1.25 | iron-ingot | 铁冶炼 #2 | 2.5 |
| fe-smelt-3 | smelter | 3.1875 | 1.25 | iron-ingot | 铁冶炼 #3 | 3.5 |
| cu-smelt-1 | smelter | 7.1875 | 1.25 | copper-ingot | 铜冶炼 #1 | 7.5 |
| cu-smelt-2 | smelter | 8.1875 | 1.25 | copper-ingot | 铜冶炼 #2 | 8.5 |
| concrete-1 | constructor | 7.0 | 3.5 | concrete | 混凝土 #1 | 7.5 |
| concrete-2 | constructor | 8.5 | 3.5 | concrete | 混凝土 #2 | 9.0 |

AABB verification (no overlaps):
- Iron smelters: [1.1875..1.8125]×[1.25..2.5], [2.1875..2.8125]×[1.25..2.5], [3.1875..3.8125]×[1.25..2.5] — gaps 0.375 ✓
- Copper smelters: [7.1875..7.8125]×[1.25..2.5], [8.1875..8.8125]×[1.25..2.5] — gap 0.375 ✓
- Concrete: [7.0..8.0]×[3.5..4.75], [8.5..9.5]×[3.5..4.75] — gap 0.5 ✓
- Cross-check: smelters end row 2.5, concrete starts row 3.5 — gap 1.0 ✓

- [ ] **Step 3: Add F2 production machines (10 constructors)**

All south-facing, floor 2.

**Tier 1 — ingot consumers (row 1.5):**

| id | type | pos.col | pos.row | recipe | label | Port col |
|----|------|---------|---------|--------|-------|----------|
| plate-1 | constructor | 1.0 | 1.5 | iron-plate | 铁板 #1 | 1.5 |
| plate-2 | constructor | 2.5 | 1.5 | iron-plate | 铁板 #2 | 3.0 |
| rod-1 | constructor | 4.0 | 1.5 | iron-rod | 铁棒 #1 | 4.5 |
| rod-2 | constructor | 5.5 | 1.5 | iron-rod | 铁棒 #2 | 6.0 |
| wire-1 | constructor | 7.0 | 1.5 | wire | 电线 #1 | 7.5 |
| wire-2 | constructor | 8.5 | 1.5 | wire | 电线 #2 | 9.0 |
| sheet-1 | constructor | 10.0 | 1.5 | copper-sheet | 铜板 #1 | 10.5 |

**Tier 2 — rod/wire consumers (row 4.0):**

| id | type | pos.col | pos.row | recipe | label | Port col |
|----|------|---------|---------|--------|-------|----------|
| screw-1 | constructor | 1.0 | 4.0 | screw | 螺丝 #1 | 1.5 |
| screw-2 | constructor | 2.5 | 4.0 | screw | 螺丝 #2 | 3.0 |
| cable-1 | constructor | 7.0 | 4.0 | cable | 电缆 #1 | 7.5 |

AABB verification (same-row no overlaps):
- Tier 1: [1.0..2.0], [2.5..3.5], [4.0..5.0], [5.5..6.5], [7.0..8.0], [8.5..9.5], [10.0..11.0] — min gap 0.5 ✓
- Tier 2: [1.0..2.0], [2.5..3.5], [7.0..8.0] — ✓
- Cross-tier: tier 1 ends row 2.75, tier 2 starts row 4.0 — gap 1.25 ✓

- [ ] **Step 4: Add F3 production machines (4 assemblers)**

All south-facing, floor 3. Assembler is 1.125×2.0 grid.

| id | type | pos.col | pos.row | recipe | label | in-0 col | in-1 col | out-0 col |
|----|------|---------|---------|--------|-------|----------|----------|-----------|
| asm-rip-1 | assembler | 0.4375 | 2.5 | reinforced-iron-plate | RIP #1 | 0.75 | 1.25 | 1.0 |
| asm-rotor | assembler | 2.4375 | 2.5 | rotor | Rotor | 2.75 | 3.25 | 3.0 |
| asm-modframe | assembler | 4.4375 | 2.5 | modular-frame | ModFrame | 4.75 | 5.25 | 5.0 |
| asm-rip-2 | assembler | 6.4375 | 2.5 | reinforced-iron-plate | RIP #2 (flex) | 6.75 | 7.25 | 7.0 |

AABB verification:
- [0.4375..1.5625], [2.4375..3.5625], [4.4375..5.5625], [6.4375..7.5625] ×[2.5..4.5] — gap 0.875 between each ✓

**Recipe → port mapping (inputs[0]→in-0, inputs[1]→in-1):**
- RIP: in-0=铁板(plate), in-1=螺丝(screw)
- Rotor: in-0=螺丝(screw), in-1=铁棒(rod)
- Modular Frame: in-0=强化铁板(RIP), in-1=铁棒(rod)

- [ ] **Step 5: Run validation**

```bash
npx vitest run
```

Expected: R23 warnings (unconnected input ports) and R29 errors (isolated machines) — these are expected since we haven't added belts yet. Verify NO R1/R3/R13 errors (type, bounds, collision).

- [ ] **Step 6: Commit**

```bash
git add data/schemes/unified-base.json
git commit -m "feat(scheme): add unified-base skeleton with 21 production machines on 3 floors"
```

---

## Task 2: F1 Input Zone — Ore Splitters + Smelter Belts

**Files:**
- Modify: `data/schemes/unified-base.json`

- [ ] **Step 1: Add F1 input splitters**

Place these splitters on F1 (floor 1, south-facing) in the input zone (row 0-1):

| id | type | pos.col | pos.row | label | Purpose |
|----|------|---------|---------|-------|---------|
| sp-fe-ore-1 | splitter | 2.25 | 0.25 | 铁矿分流 #1 | E1 iron 90→60+30 |
| sp-fe-ore-2 | splitter | 0.75 | 0.5 | 铁矿分流 #2 | 60→30+30 to smelt 1&2 |
| sp-cu-ore | splitter | 7.75 | 0.25 | 铜矿分流 | E3 copper 60→30+30 |
| sp-limestone | splitter | 7.75 | 2.75 | 石灰石分流 | E4 limestone 90→45+45 |

Check: no collision with smelters (smelters start at row 1.25, splitters end at row 0.75) ✓

- [ ] **Step 2: Add iron ore input belts (E1 → smelters)**

All belts on floor 1. Iron ore travels from north (row 0) southward to splitters, then to smelters.

| Belt ID | fromPort | toPort | material | mark | Routing |
|---------|----------|--------|----------|------|---------|
| b-fe-ore-in | _(none, external)_ | sp-fe-ore-1:in-0 | 铁矿石 | 2 | Vertical from north edge to splitter |
| b-fe-ore-60 | sp-fe-ore-1:out-0 | sp-fe-ore-2:in-0 | 铁矿石 | 2 | Route from sp-fe-ore-1 front to sp-fe-ore-2 back |
| b-fe-ore-s3 | sp-fe-ore-1:out-1 | fe-smelt-3:in-0 | 铁矿石 | 1 | Right output → smelter 3 back port |
| b-fe-ore-s1 | sp-fe-ore-2:out-0 | fe-smelt-1:in-0 | 铁矿石 | 1 | Front output → smelter 1 back port |
| b-fe-ore-s2 | sp-fe-ore-2:out-1 | fe-smelt-2:in-0 | 铁矿石 | 1 | Side output → smelter 2 back port |

- [ ] **Step 3: Add copper ore + limestone input belts**

| Belt ID | fromPort | toPort | material | mark | Routing |
|---------|----------|--------|----------|------|---------|
| b-cu-ore-in | _(none)_ | sp-cu-ore:in-0 | 铜矿石 | 1 | Vertical from north edge |
| b-cu-ore-s1 | sp-cu-ore:out-0 | cu-smelt-1:in-0 | 铜矿石 | 1 | Front → smelter 1 |
| b-cu-ore-s2 | sp-cu-ore:out-1 or out-2 | cu-smelt-2:in-0 | 铜矿石 | 1 | Side → smelter 2 |
| b-lime-in | _(none)_ | sp-limestone:in-0 | 石灰石 | 2 | Vertical from north edge, past smelters |
| b-lime-c1 | sp-limestone:out-0 | concrete-1:in-0 | 石灰石 | 1 | Front → concrete 1 |
| b-lime-c2 | sp-limestone:out-1 or out-2 | concrete-2:in-0 | 石灰石 | 1 | Side → concrete 2 |

- [ ] **Step 4: Route all belt paths**

For each belt above, calculate the exact `path` array following these rules:
- R7: Only orthogonal segments (each pair of adjacent points shares col OR row)
- R8: All coordinates on 0.0625 grid (matches port positions like 0.3125, 0.8125)
- R16: Last segment entering a back port must be vertical (shared col); last segment entering a left/right port must be horizontal (shared row)
- R14: Don't cross through machine AABBs (except the connected machine's first/last segment)
- R17: Total path length ≤ 1.4× manhattan bbox

**Path routing approach:** Start from the source port position, go orthogonally (typically vertical first for back→back connections), add one turn if needed to align with destination port col, then go vertical into destination.

- [ ] **Step 5: Run validation**

```bash
npx vitest run
```

Check for R7, R14, R15, R16, R17 errors on the new belts. Fix any issues.

- [ ] **Step 6: Commit**

```bash
git add data/schemes/unified-base.json
git commit -m "feat(scheme): add F1 input zone - ore splitters and smelter feed belts"
```

---

## Task 3: F1 Smelter Output Zone — Mergers + Lifts Up

**Files:**
- Modify: `data/schemes/unified-base.json`

- [ ] **Step 1: Add iron ingot mergers**

Place 2 mergers south of iron smelters to combine output into one stream:

| id | type | pos.col | pos.row | label |
|----|------|---------|---------|-------|
| mg-fe-ingot-1 | merger | 1.25 | 2.75 | 铁锭合流 #1 |
| mg-fe-ingot-2 | merger | 2.25 | 3.25 | 铁锭合流 #2 |

- [ ] **Step 2: Add copper ingot merger**

| id | type | pos.col | pos.row | label |
|----|------|---------|---------|-------|
| mg-cu-ingot | merger | 7.75 | 2.75 | 铜锭合流 |

- [ ] **Step 3: Add lift L1 and L2 bottom machines (F1 side)**

Lifts are 0.25×0.25. Place south of mergers:

| id | type | pos.col | pos.row | floor | label |
|----|------|---------|---------|-------|-------|
| lift-L1-bot | conveyor-lift-in-bottom | 2.375 | 4.0 | 1 | 升降机·铁锭↑ |
| lift-L2-bot | conveyor-lift-in-bottom | 8.125 | 4.0 | 1 | 升降机·铜锭↑ |

- [ ] **Step 4: Add smelter output → merger → lift belts**

| Belt ID | fromPort | toPort | material | mark |
|---------|----------|--------|----------|------|
| b-fe-s1-out | fe-smelt-1:out-0 | mg-fe-ingot-1:in-2 | 铁锭 | 1 |
| b-fe-s2-out | fe-smelt-2:out-0 | mg-fe-ingot-1:in-0 | 铁锭 | 1 |
| b-fe-mg1-mg2 | mg-fe-ingot-1:out-0 | mg-fe-ingot-2:in-0 | 铁锭 | 2 |
| b-fe-s3-out | fe-smelt-3:out-0 | mg-fe-ingot-2:in-1 | 铁锭 | 1 |
| b-fe-ingot-lift | mg-fe-ingot-2:out-0 | lift-L1-bot:bottom | 铁锭 | 2 |
| b-cu-s1-out | cu-smelt-1:out-0 | mg-cu-ingot:in-2 | 铜锭 | 1 |
| b-cu-s2-out | cu-smelt-2:out-0 | mg-cu-ingot:in-1 | 铜锭 | 1 |
| b-cu-ingot-lift | mg-cu-ingot:out-0 | lift-L2-bot:bottom | 铜锭 | 1 |

Route paths following R16 rules (vertical into back ports, horizontal into side ports).

- [ ] **Step 5: Add concrete output mergers and splitter**

| id | type | pos.col | pos.row | label |
|----|------|---------|---------|-------|
| mg-concrete | merger | 7.75 | 5.0 | 混凝土合流 |
| sp-concrete | splitter | 7.75 | 5.75 | 混凝土分流 (S4/S6) |

Belts:

| Belt ID | fromPort | toPort | material | mark |
|---------|----------|--------|----------|------|
| b-conc-1-out | concrete-1:out-0 | mg-concrete:in-2 | 混凝土 | 1 |
| b-conc-2-out | concrete-2:out-0 | mg-concrete:in-1 | 混凝土 | 1 |
| b-conc-merge | mg-concrete:out-0 | sp-concrete:in-0 | 混凝土 | 1 |

- [ ] **Step 6: Run validation + commit**

```bash
npx vitest run
git add data/schemes/unified-base.json
git commit -m "feat(scheme): add F1 smelter output mergers and lift L1/L2 bottom machines"
```

---

## Task 4: F1 Output Zone — Terminal Splitters + Steel Pass-Through

**Files:**
- Modify: `data/schemes/unified-base.json`

- [ ] **Step 1: Add return lift bottom machines (L6/L7/L8)**

These lifts bring products DOWN from F2/F3 to F1 for output:

| id | type | pos.col | pos.row | floor | label |
|----|------|---------|---------|-------|-------|
| lift-L6-bot | conveyor-lift-out-bottom | 1.375 | 6.0 | 1 | 升降机·铁系↓ |
| lift-L7-bot | conveyor-lift-out-bottom | 5.375 | 6.0 | 1 | 升降机·铜系↓ |
| lift-L8b-bot | conveyor-lift-out-bottom | 3.375 | 7.75 | 1 | 升降机·组装品↓ |

- [ ] **Step 2: Add 7 output terminal splitters along south edge**

Place in row 8.0-8.5 area, evenly spaced:

| id | type | pos.col | pos.row | label | Content |
|----|------|---------|---------|-------|---------|
| sp-S1 | splitter | 0.75 | 8.5 | S1 铁系建材 | Plate+Rod+Screw |
| sp-S2 | splitter | 2.25 | 8.5 | S2 组装产品 | RIP+Rotor+ModFrame |
| sp-S3 | splitter | 3.75 | 8.5 | S3 铜系产品 | Wire+Cable+Sheet |
| sp-S4 | splitter | 5.25 | 8.5 | S4 混凝土 | Concrete (building) |
| sp-S5 | splitter | 6.75 | 8.5 | S5 铁矿直通 | Iron Ore (steel) |
| sp-S6 | splitter | 8.25 | 8.5 | S6 混凝土钢系 | Concrete (steel) |
| sp-S7 | splitter | 9.75 | 8.5 | S7 预留/SP | Smart Plating |

- [ ] **Step 3: Add iron ore pass-through belt (E2 → S5)**

External iron ore 90/min enters north and goes straight to S5:

```json
{
  "id": "b-fe-ore-passthru",
  "floor": 1,
  "mark": 2,
  "path": [
    {"col": 7.0, "row": 0},
    {"col": 7.0, "row": 8.5}
  ],
  "toPort": "sp-S5:in-0"
}
```

**Important:** This belt runs the full height of F1. Verify it does NOT cross any machine AABB on its path (check R14). If it does, adjust col or add waypoints to route around machines.

- [ ] **Step 4: Add return lift → output terminal belts**

| Belt ID | fromPort | toPort | material | mark |
|---------|----------|--------|----------|------|
| b-L6-S1 | lift-L6-bot:bottom | sp-S1:in-0 | (mixed iron) | 1 |
| b-L8-S2 | lift-L8b-bot:bottom | sp-S2:in-0 | (mixed assembly) | 1 |
| b-L7-S3 | lift-L7-bot:bottom | sp-S3:in-0 | (mixed copper) | 1 |
| b-conc-S4 | sp-concrete:out-0 | sp-S4:in-0 | 混凝土 | 1 |
| b-conc-S6 | sp-concrete:out-1 or out-2 | sp-S6:in-0 | 混凝土 | 1 |

Route from lift exits (row ~6) and concrete splitter (row ~5.75) south to output terminals (row 8.5).

- [ ] **Step 5: Run validation + commit**

```bash
npx vitest run
git add data/schemes/unified-base.json
git commit -m "feat(scheme): add F1 output terminals, steel pass-through, return lift exits"
```

---

## Task 5: F2 Input Zone — Ingot Distribution

**Files:**
- Modify: `data/schemes/unified-base.json`

- [ ] **Step 1: Add lift L1/L2 top machines on F2**

Must match bottom machines' pos exactly:

| id | type | pos.col | pos.row | floor | label |
|----|------|---------|---------|-------|-------|
| lift-L1-top | conveyor-lift-out-top | 2.375 | 4.0 | 2 | 升降机·铁锭↑ |
| lift-L2-top | conveyor-lift-out-top | 8.125 | 4.0 | 2 | 升降机·铜锭↑ |

**Wait — lift top floor must = bottom floor + 1.** L1 bottom is floor 1, so top is floor 2. ✓
**Pos must be identical between top and bottom machines.** However, the top machines should be in the F2 INPUT zone (row 0-1), not row 4. But R18-align requires same pos!

**Fix:** Move lift L1/L2 bottom machines in Task 3 to a position that makes sense for BOTH F1 (south of mergers) and F2 (north input area). Since lifts are physically between floors, the pos represents the screen-space position on the grid.

Set lift positions to row 0.5 (F2 north input zone) — and update the F1 bottom machines to match:
- lift-L1-bot: pos (2.375, 0.5), floor 1
- lift-L1-top: pos (2.375, 0.5), floor 2
- lift-L2-bot: pos (8.125, 0.5), floor 1
- lift-L2-top: pos (8.125, 0.5), floor 2

**Go back to Task 3 Step 3 and update the lift bottom positions to match.** This is critical for R18-align.

- [ ] **Step 2: Add iron ingot distribution splitters on F2**

Iron ingot arrives at L1 top exit. Need to split 90/min → 60 plate + 30 rod:

| id | type | pos.col | pos.row | floor | label |
|----|------|---------|---------|-------|-------|
| sp-fe-ingot | splitter | 2.25 | 0.75 | 2 | 铁锭分流 |

Belts:

| Belt ID | fromPort | toPort | material | mark |
|---------|----------|--------|----------|------|
| b-L1-dist | lift-L1-top:top | sp-fe-ingot:in-0 | 铁锭 | 2 |
| b-ingot-plate-1 | sp-fe-ingot:out-0 or out-1 | plate-1:in-0 | 铁锭 | 1 |
| b-ingot-plate-2 | sp-fe-ingot:out-0 or out-2 | plate-2:in-0 | 铁锭 | 1 |

**Problem:** Splitter has 3 outputs but we need to split to 4 machines (plate×2 + rod×2). Use a chain of splitters:

| id | type | pos.col | pos.row | floor | label |
|----|------|---------|---------|-------|-------|
| sp-fe-ingot-1 | splitter | 2.25 | 0.75 | 2 | 铁锭分流 plate/rod |
| sp-fe-plate | splitter | 1.25 | 1.0 | 2 | 铁锭→铁板 pair |
| sp-fe-rod | splitter | 4.25 | 1.0 | 2 | 铁锭→铁棒 pair |

Belts:
| Belt ID | fromPort | toPort | material | mark |
|---------|----------|--------|----------|------|
| b-L1-sp | lift-L1-top:top | sp-fe-ingot-1:in-0 | 铁锭 | 2 |
| b-fe-to-plate | sp-fe-ingot-1:out-2 | sp-fe-plate:in-0 | 铁锭 | 2 |
| b-fe-to-rod | sp-fe-ingot-1:out-1 | sp-fe-rod:in-0 | 铁锭 | 1 |
| b-plate-1-in | sp-fe-plate:out-0 or out-2 | plate-1:in-0 | 铁锭 | 1 |
| b-plate-2-in | sp-fe-plate:out-1 | plate-2:in-0 | 铁锭 | 1 |
| b-rod-1-in | sp-fe-rod:out-0 or out-2 | rod-1:in-0 | 铁锭 | 1 |
| b-rod-2-in | sp-fe-rod:out-1 | rod-2:in-0 | 铁锭 | 1 |

Exact splitter output port choices depend on routing geometry. Choose whichever makes the belt path shortest and satisfies R16.

- [ ] **Step 3: Add copper ingot distribution on F2**

| id | type | pos.col | pos.row | floor | label |
|----|------|---------|---------|-------|-------|
| sp-cu-ingot | splitter | 8.0 | 0.75 | 2 | 铜锭分流 |

Belts:
| Belt ID | fromPort | toPort | material | mark |
|---------|----------|--------|----------|------|
| b-L2-sp | lift-L2-top:top | sp-cu-ingot:in-0 | 铜锭 | 1 |
| b-cu-to-wire-1 | sp-cu-ingot:out-0 or out-2 | wire-1:in-0 | 铜锭 | 1 |
| b-cu-to-wire-2 | sp-cu-ingot:out-1 | wire-2:in-0 | 铜锭 | 1 |

For copper sheet (20/min), need another splitter or tap from the wire line. Since wire constructors consume 15/min each (30 total) and we have 60 ingot, the splitter can send:
- out-0/out-2 → 2 wires (30/min shared via another splitter)
- out-1 → copper sheet (20/min)

Adjust splitter outputs and add:

| Belt ID | fromPort | toPort | material | mark |
|---------|----------|--------|----------|------|
| b-cu-to-sheet | sp-cu-ingot:out-2 | sheet-1:in-0 | 铜锭 | 1 |

- [ ] **Step 4: Run validation + commit**

```bash
npx vitest run
git add data/schemes/unified-base.json
git commit -m "feat(scheme): add F2 ingot distribution - iron and copper splitter networks"
```

---

## Task 6: F2 Product Zone — Constructor Outputs + F3/F1 Split

**Files:**
- Modify: `data/schemes/unified-base.json`

- [ ] **Step 1: Add rod → screw distribution**

Iron rod constructors output at row 2.75. Rod goes to screw constructors (row 4.0) and also to F3/F1:

| id | type | pos.col | pos.row | floor | label |
|----|------|---------|---------|-------|-------|
| mg-rod | merger | 4.75 | 3.0 | 2 | 铁棒合流 |
| sp-rod-dist | splitter | 4.75 | 3.25 | 2 | 铁棒分流 screw/F3 |
| sp-rod-screw | splitter | 1.75 | 3.5 | 2 | 铁棒→螺丝 pair |

Belts:
| Belt ID | fromPort | toPort | material | mark |
|---------|----------|--------|----------|------|
| b-rod-1-out | rod-1:out-0 | mg-rod:in-2 | 铁棒 | 1 |
| b-rod-2-out | rod-2:out-0 | mg-rod:in-1 | 铁棒 | 1 |
| b-rod-merge | mg-rod:out-0 | sp-rod-dist:in-0 | 铁棒 | 1 |
| b-rod-to-screw | sp-rod-dist:out-0 | sp-rod-screw:in-0 | 铁棒 | 1 |
| b-rod-screw-1 | sp-rod-screw:out-0 or out-2 | screw-1:in-0 | 铁棒 | 1 |
| b-rod-screw-2 | sp-rod-screw:out-1 | screw-2:in-0 | 铁棒 | 1 |

- [ ] **Step 2: Add wire → cable distribution**

Wire constructors output at row 2.75. Wire goes to cable (row 4.0) and to F1 output:

| id | type | pos.col | pos.row | floor | label |
|----|------|---------|---------|-------|-------|
| mg-wire | merger | 7.75 | 3.0 | 2 | 电线合流 |
| sp-wire-dist | splitter | 7.75 | 3.25 | 2 | 电线分流 cable/output |

Belts:
| Belt ID | fromPort | toPort | material | mark |
|---------|----------|--------|----------|------|
| b-wire-1-out | wire-1:out-0 | mg-wire:in-2 | 电线 | 1 |
| b-wire-2-out | wire-2:out-0 | mg-wire:in-1 | 电线 | 1 |
| b-wire-merge | mg-wire:out-0 | sp-wire-dist:in-0 | 电线 | 1 |
| b-wire-to-cable | sp-wire-dist:out-0 | cable-1:in-0 | 电线 | 1 |

Wire to F1 output belt (via sp-wire-dist:out-1 or out-2) will be connected to L7 in Task 8.

- [ ] **Step 3: Add product distribution splitters (F3↑ / F1↓ split)**

Each product that goes to F3 assemblers needs a splitter. Products are: plate, screw, rod (surplus). Products going only to F1: cable, copper sheet.

| id | type | pos.col | pos.row | floor | label | Sends to |
|----|------|---------|---------|-------|-------|----------|
| mg-plate | merger | 1.75 | 3.0 | 2 | 铁板合流 | — |
| sp-plate-dist | splitter | 1.75 | 6.0 | 2 | 铁板分流 F3/F1 | L3↑ + L6↓ |
| mg-screw | merger | 1.75 | 5.5 | 2 | 螺丝合流 | — |
| sp-screw-dist | splitter | 1.75 | 6.5 | 2 | 螺丝分流 F3/F1 | L4↑ + L6↓ |

Belts connecting plate constructors → merger → splitter:
| Belt ID | fromPort | toPort | material | mark |
|---------|----------|--------|----------|------|
| b-plate-1-out | plate-1:out-0 | mg-plate:in-2 | 铁板 | 1 |
| b-plate-2-out | plate-2:out-0 | mg-plate:in-1 | 铁板 | 1 |
| b-plate-mg-sp | mg-plate:out-0 | sp-plate-dist:in-0 | 铁板 | 1 |
| b-screw-1-out | screw-1:out-0 | mg-screw:in-2 | 螺丝 | 1 |
| b-screw-2-out | screw-2:out-0 | mg-screw:in-1 | 螺丝 | 2 |
| b-screw-mg-sp | mg-screw:out-0 | sp-screw-dist:in-0 | 螺丝 | 2 |

Rod surplus also needs to go to F3. Use sp-rod-dist from Step 1:
- sp-rod-dist:out-1 or out-2 → merges into L5↑ / L6↓ path

- [ ] **Step 4: Run validation + commit**

```bash
npx vitest run
git add data/schemes/unified-base.json
git commit -m "feat(scheme): add F2 constructor output mergers and product distribution splitters"
```

---

## Task 7: F2 Lift Machines (L3-L7)

**Files:**
- Modify: `data/schemes/unified-base.json`

- [ ] **Step 1: Add F2→F3 lift bottom machines (L3, L4, L5)**

These carry plate, screw, rod UP to F3 assemblers:

| id | type | pos.col | pos.row | floor | label |
|----|------|---------|---------|-------|-------|
| lift-L3-bot | conveyor-lift-in-bottom | 3.0 | 7.0 | 2 | 升降机·铁板↑ |
| lift-L4-bot | conveyor-lift-in-bottom | 4.25 | 7.0 | 2 | 升降机·螺丝↑ |
| lift-L5-bot | conveyor-lift-in-bottom | 5.5 | 7.0 | 2 | 升降机·铁棒↑ |

Placed in F2 south zone (row 7.0), well clear of tier 2 constructors (end row 5.25). On F3, same positions are south of assemblers (end row 4.5) in reserved space. F3 input splitters route northward from lift exits to assemblers.

- [ ] **Step 2: Add F2→F1 lift top machines (L6, L7)**

These carry surplus products DOWN to F1 output:

| id | type | pos.col | pos.row | floor | label |
|----|------|---------|---------|-------|-------|
| lift-L6-top | conveyor-lift-in-top | (same as L6 bot) | (same) | 2 | 升降机·铁系↓ |
| lift-L7-top | conveyor-lift-in-top | (same as L7 bot) | (same) | 2 | 升降机·铜系↓ |

**Update L6/L7 bottom machines from Task 4 to match these positions.**

- [ ] **Step 3: Connect product splitters to lift machines**

| Belt ID | fromPort | toPort | material | mark | Note |
|---------|----------|--------|----------|------|------|
| b-plate-to-L3 | sp-plate-dist:out-0 | lift-L3-bot:bottom | 铁板 | 1 | → F3 |
| b-plate-to-L6 | sp-plate-dist:out-1 | lift-L6-top:top | 铁板 | 1 | → F1 output |
| b-screw-to-L4 | sp-screw-dist:out-0 | lift-L4-bot:bottom | 螺丝 | 1 | → F3 |
| b-screw-to-L6 | sp-screw-dist:out-1 | lift-L6-top:top | 螺丝 | 1 | → F1 (via merger) |
| b-rod-to-L5 | sp-rod-dist:out-1 | lift-L5-bot:bottom | 铁棒 | 1 | → F3 |

For L6, multiple products merge before entering. Add a merger if needed.

Copper products to L7:
| Belt ID | fromPort | toPort | material | mark |
|---------|----------|--------|----------|------|
| b-cable-out | cable-1:out-0 | (copper merger) | 线缆 | 1 |
| b-sheet-out | sheet-1:out-0 | (copper merger) | 铜板 | 1 |
| b-wire-to-L7 | sp-wire-dist:out-1 | (copper merger) | 电线 | 1 |

Add a merger chain to combine wire surplus + cable + copper sheet → lift L7.

- [ ] **Step 4: Run validation + commit**

```bash
npx vitest run
git add data/schemes/unified-base.json
git commit -m "feat(scheme): add F2 lift machines L3-L7 and product-to-lift belts"
```

---

## Task 8: F3 Assembly Zone — Input Distribution + Assembler Belts

**Files:**
- Modify: `data/schemes/unified-base.json`

- [ ] **Step 1: Add F3 lift top machines (L3, L4, L5)**

Must match L3/L4/L5 bottom machine positions from Task 7:

| id | type | pos.col | pos.row | floor | label |
|----|------|---------|---------|-------|-------|
| lift-L3-top | conveyor-lift-out-top | (same as bot) | (same) | 3 | 升降机·铁板↑ |
| lift-L4-top | conveyor-lift-out-top | (same as bot) | (same) | 3 | 升降机·螺丝↑ |
| lift-L5-top | conveyor-lift-out-top | (same as bot) | (same) | 3 | 升降机·铁棒↑ |

- [ ] **Step 2: Add F3 input distribution splitters**

Plate needs to reach RIP #1 (in-0 col 0.75) and RIP #2 flex (in-0 col 6.75):

| id | type | pos.col | pos.row | floor | label |
|----|------|---------|---------|-------|-------|
| sp-plate-f3 | splitter | (align with L3) | 1.5 | 3 | F3 铁板分流 |
| sp-screw-f3 | splitter | (align with L4) | 1.5 | 3 | F3 螺丝分流 |
| sp-rod-f3 | splitter | (align with L5) | 1.5 | 3 | F3 铁棒分流 |

**Screw distribution on F3:** screw goes to RIP #1 (in-1 col 1.25), Rotor (in-0 col 2.75), and RIP #2 (in-1 col 7.25). This needs a chain of splitters. First splitter sends to Rotor + second splitter. Second splitter sends to RIP #1 and RIP #2.

**Rod distribution on F3:** rod goes to Rotor (in-1 col 3.25) and ModFrame (in-1 col 5.25). One splitter with 2 used outputs.

- [ ] **Step 3: Add belts from splitters to assembler input ports**

| Belt ID | fromPort | toPort | material | mark | Note |
|---------|----------|--------|----------|------|------|
| b-plate-rip1 | sp-plate-f3:out-X | asm-rip-1:in-0 | 铁板 | 1 | in-0=plate |
| b-plate-rip2 | sp-plate-f3:out-X | asm-rip-2:in-0 | 铁板 | 1 | in-0=plate |
| b-screw-rip1 | sp-screw-f3-2:out-X | asm-rip-1:in-1 | 螺丝 | 1 | in-1=screw |
| b-screw-rotor | sp-screw-f3:out-X | asm-rotor:in-0 | 螺丝 | 1 | in-0=screw |
| b-screw-rip2 | sp-screw-f3-2:out-X | asm-rip-2:in-1 | 螺丝 | 1 | in-1=screw |
| b-rod-rotor | sp-rod-f3:out-X | asm-rotor:in-1 | 铁棒 | 1 | in-1=rod |
| b-rod-modframe | sp-rod-f3:out-X | asm-modframe:in-1 | 铁棒 | 1 | in-1=rod |
| b-rip1-modframe | asm-rip-1:out-0 → sp → asm-modframe:in-0 | 强化铁板 | 1 | in-0=RIP |

**RIP #1 output routing:** RIP #1 output goes to a splitter that sends part to ModFrame (in-0) and part to L8 output. Add:

| id | type | pos.col | pos.row | floor | label |
|----|------|---------|---------|-------|-------|
| sp-rip1-out | splitter | (near asm-rip-1 out) | 5.0 | 3 | RIP#1 分流 ModFrame/output |

- [ ] **Step 4: Add F3 product collection and L8 lift**

All assembler outputs merge into one stream → lift L8 down to F1:

| id | type | pos.col | pos.row | floor | label |
|----|------|---------|---------|-------|-------|
| mg-f3-out-1 | merger | 3.0 | 5.5 | 3 | F3 产品合流 #1 |
| mg-f3-out-2 | merger | 5.0 | 6.0 | 3 | F3 产品合流 #2 |
| lift-L8a-top | conveyor-lift-in-top | 3.375 | 7.5 | 3 | 升降机·组装品↓ |

Belts from assembler outputs → mergers → lift:
| Belt ID | fromPort | toPort | material | mark |
|---------|----------|--------|----------|------|
| b-rip1-sp | asm-rip-1:out-0 | sp-rip1-out:in-0 | 强化铁板 | 1 |
| b-rotor-mg | asm-rotor:out-0 | mg-f3-out-1:in-X | 转子 | 1 |
| b-modframe-mg | asm-modframe:out-0 | mg-f3-out-1:in-X | 模块化框架 | 1 |
| b-rip1-to-out | sp-rip1-out:out-X | mg-f3-out-2:in-X | 强化铁板 | 1 |
| b-rip2-mg | asm-rip-2:out-0 | mg-f3-out-2:in-X | 强化铁板 | 1 |
| b-f3-merge | mg-f3-out-1:out-0 | mg-f3-out-2:in-0 | (mixed) | 1 |
| b-f3-to-L8 | mg-f3-out-2:out-0 | lift-L8a-top:top | (mixed) | 1 |

- [ ] **Step 5: Run validation + commit**

```bash
npx vitest run
git add data/schemes/unified-base.json
git commit -m "feat(scheme): add F3 assembly zone - input distribution, assembler belts, product collection"
```

---

## Task 9: Define All Lift Pairs

**Files:**
- Modify: `data/schemes/unified-base.json`

- [ ] **Step 1: Verify all lift machine positions match across floors**

For each lift pair, the `pos` must be **identical** between bottom and top machines:

| Pair | Bottom Machine | Top Machine | Expected pos |
|------|---------------|-------------|-------------|
| L1 | lift-L1-bot (F1) | lift-L1-top (F2) | must match |
| L2 | lift-L2-bot (F1) | lift-L2-top (F2) | must match |
| L3 | lift-L3-bot (F2) | lift-L3-top (F3) | must match |
| L4 | lift-L4-bot (F2) | lift-L4-top (F3) | must match |
| L5 | lift-L5-bot (F2) | lift-L5-top (F3) | must match |
| L6 | lift-L6-bot (F1) | lift-L6-top (F2) | must match |
| L7 | lift-L7-bot (F1) | lift-L7-top (F2) | must match |
| L8 | lift-L8-bot (F1) | lift-L8-top (F3) | ⚠️ SKIP — see below |

**L8 skips F2 (F3→F1):** R18 requires top floor = bottom floor + 1. But L8 goes from F3 (floor 3) to F1 (floor 1), skipping F2. **Solution:** Create 2 lift pairs in series:
- L8a: F3 → F2 (lift-L8a-top on F3, lift-L8a-bot on F2)
- L8b: F2 → F1 (lift-L8b-top on F2, lift-L8b-bot on F1)

Add 2 extra lift machines on F2 (L8a-bot and L8b-top) at the same col, connected by a short belt.

- [ ] **Step 2: Add liftPairs array**

```json
"liftPairs": [
  { "id": "lift-L1", "bottomMachine": "lift-L1-bot", "topMachine": "lift-L1-top", "mark": 2 },
  { "id": "lift-L2", "bottomMachine": "lift-L2-bot", "topMachine": "lift-L2-top", "mark": 1 },
  { "id": "lift-L3", "bottomMachine": "lift-L3-bot", "topMachine": "lift-L3-top", "mark": 1 },
  { "id": "lift-L4", "bottomMachine": "lift-L4-bot", "topMachine": "lift-L4-top", "mark": 1 },
  { "id": "lift-L5", "bottomMachine": "lift-L5-bot", "topMachine": "lift-L5-top", "mark": 1 },
  { "id": "lift-L6", "bottomMachine": "lift-L6-bot", "topMachine": "lift-L6-top", "mark": 1 },
  { "id": "lift-L7", "bottomMachine": "lift-L7-bot", "topMachine": "lift-L7-top", "mark": 1 },
  { "id": "lift-L8a", "bottomMachine": "lift-L8a-bot", "topMachine": "lift-L8a-top", "mark": 1 },
  { "id": "lift-L8b", "bottomMachine": "lift-L8b-bot", "topMachine": "lift-L8b-top", "mark": 1 }
]
```

- [ ] **Step 3: Add F2 relay machines for L8 and connecting belt**

| id | type | pos.col | pos.row | floor | label |
|----|------|---------|---------|-------|-------|
| lift-L8a-bot | conveyor-lift-out-bottom | 3.375 | 7.5 | 2 | 升降机·组装品↓(relay) |
| lift-L8b-top | conveyor-lift-in-top | 3.375 | 7.75 | 2 | 升降机·组装品↓(relay) |

Short belt on F2 connecting them:
```json
{
  "id": "b-L8-relay",
  "floor": 2,
  "mark": 1,
  "path": [relay exit pos, relay entry pos],
  "fromPort": "lift-L8a-bot:bottom",
  "toPort": "lift-L8b-top:top"
}
```

- [ ] **Step 4: Run validation + commit**

```bash
npx vitest run
git add data/schemes/unified-base.json
git commit -m "feat(scheme): define all 9 lift pairs including L8 F3→F2→F1 relay"
```

---

## Task 10: Full Validation + Error Fixing

**Files:**
- Modify: `data/schemes/unified-base.json`

- [ ] **Step 1: Run full validation**

```bash
npx vitest run
```

- [ ] **Step 2: Categorize errors**

List all errors and warnings. Prioritize:
1. **Must fix (errors):** R1, R3, R5, R7, R12, R13, R14a, R18, R23, R29, R31
2. **Should fix (warnings):** R2 (alignment), R14b, R15, R16, R17, R25
3. **Acceptable warnings:** R2 on smelter/assembler pos (intentional for port alignment), R25 on output terminal unused ports

- [ ] **Step 3: Fix all errors**

Common issues and fixes:
- **R13 collision:** Adjust pos.col/pos.row to create gaps. Never overlap AABBs.
- **R14 belt crossing:** Add waypoints to route around machines. Typical fix: add an L-turn.
- **R15 belt overlap:** Offset parallel belts by at least one grid step.
- **R16 port approach:** Ensure last segment is vertical for back/front ports, horizontal for left/right ports.
- **R17 path too long:** Realign source/destination machines so ports are coaxial (see CLAUDE.md alignment rules).
- **R23 missing input:** Add a belt to every production machine's belt-in port.
- **R29 isolated machine:** Ensure every production machine has at least one input AND one output belt.

- [ ] **Step 4: Re-run validation until 0 errors**

```bash
npx vitest run
```

Repeat Steps 2-3 until `validateSchemeDetailed()` reports 0 errors. Minimize warnings.

- [ ] **Step 5: Commit**

```bash
git add data/schemes/unified-base.json
git commit -m "fix(scheme): resolve all validation errors for unified-base"
```

---

## Task 11: Final Review + Push

**Files:**
- Modify: `data/schemes/unified-base.json` (if needed)

- [ ] **Step 1: Verify scheme completeness against spec**

Check against `docs/superpowers/specs/2026-04-14-unified-base-design.md`:

- [ ] 21 production machines present (5 smelter + 12 constructor + 4 assembler)
- [ ] 4 input entry points (E1-E4) — belts with no fromPort entering from north
- [ ] 7 output terminals (S1-S7) — splitters on south edge
- [ ] 8 lift pairs (L1-L8, with L8 being 2 pairs via relay)
- [ ] Iron ore pass-through (E2→S5) on Mk.2 belt
- [ ] Concrete split to S4 + S6
- [ ] RIP #1, Rotor, ModFrame assemblers have input belts connected
- [ ] RIP #2 (flex) assembler has plate+screw inputs connected (default RIP mode)
- [ ] All machines within 12×10 grid bounds per floor
- [ ] No machine crosses floor boundary or protrudes outside footprint

- [ ] **Step 2: Run final validation**

```bash
npx vitest run
```

Expected: 0 errors. Acceptable warnings: R2 (smelter/assembler alignment), R25 (output terminal unused ports).

- [ ] **Step 3: Start dev server and visually verify**

```bash
npm run dev
```

Open browser and switch to "大一统基础产线" scheme. Check:
- All 3 floors render correctly
- Machines are not overlapping visually
- Belt paths look reasonable (no spaghetti)
- Lifts show connections between floors

- [ ] **Step 4: Final commit + push**

```bash
git add data/schemes/unified-base.json
git commit -m "feat(scheme): complete unified-base 3-ore production line (12×10×3F)"
git push origin feat/engineering-rewrite
```

---

## Summary

| Task | Description | Key Deliverable |
|------|-------------|-----------------|
| 1 | Base JSON + production machines | 21 machines across 3 floors |
| 2 | F1 input zone | Ore splitters + smelter feed belts |
| 3 | F1 smelter outputs | Ingot mergers + lift L1/L2 bottoms |
| 4 | F1 output zone | 7 output terminals + steel pass-through |
| 5 | F2 ingot distribution | Iron/copper splitter networks |
| 6 | F2 product zone | Constructor outputs + F3/F1 split |
| 7 | F2 lifts | L3-L7 machines + product-to-lift belts |
| 8 | F3 assembly zone | Assembler inputs + product collection |
| 9 | Lift pairs | 9 lift pair definitions (L8 = 2 pairs) |
| 10 | Validation fixes | 0 errors, minimal warnings |
| 11 | Final review + push | Visual check + push to remote |
