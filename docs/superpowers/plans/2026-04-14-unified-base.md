# Unified Base Production Line v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `data/schemes/unified-base.json` — a 3-floor, 10×9 factory blueprint for the copper/iron/limestone unified production line with single-product outputs, F3 buffer storage, and Smart Plating flex capability.

**Architecture:** 3-floor, 10×9 grid per floor. F1 smelting + output, F2 manufacturing, F3 assembly + buffer storage. 20 production machines + 3 storage. 14 lift pairs. 10 single-product output terminals. All machines south-facing. Pure single-product output architecture — no mixed belts at output.

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
| storage | 0.625 | 1.375 | in-0 | +0.3125 | 0 | back(top) |
| storage | 0.625 | 1.375 | out-0 | +0.3125 | +1.375 | front(bottom) |
| lift | 0.25 | 0.25 | bottom/top | +0.125 | +0.125 | center(top-face) |

**Smelter pos.col trick:** To get port at col N, set `pos.col = N - 0.3125`. Example: port at 2.5 → pos.col = 2.1875. This produces R2 warnings (not 0.25-aligned) which is acceptable per CLAUDE.md alignment rules.

**Constructor pos.col:** Port naturally 0.25-aligned when pos.col is 0.25-aligned. `port_col = pos.col + 0.5`.

**Assembler pos.col trick:** To get in-0 at col N, set `pos.col = N - 0.3125`. Then in-0 at N, in-1 at N+0.5, out-0 at N+0.25.

---

## Task 1: Create Base JSON + All Production Machines + Storage

**Files:**
- Create: `data/schemes/unified-base.json`

- [ ] **Step 1: Create the scheme file with metadata and floors**

```json
{
  "id": "unified-base",
  "name": "大一统基础产线 v2",
  "version": "2.0.0",
  "category": "mixed",
  "description": "铜铁石灰石三矿大一统产线 3F — 10×9 网格，纯单品输出架构，RIP/Rotor/ModFrame 常驻 + Smart Plating flex 机位，F3 缓冲 storage，14 对升降机",
  "designPrinciples": {
    "preferWallOutlets": false,
    "preferWallHoles": false,
    "preferCeilingMounts": false,
    "keepFloorClear": false
  },
  "floors": [
    { "id": 1, "label": "1F 冶炼 & 输出", "gridSize": { "cols": 10, "rows": 9 } },
    { "id": 2, "label": "2F 制造", "gridSize": { "cols": 10, "rows": 9 } },
    { "id": 3, "label": "3F 组装 & 缓冲", "gridSize": { "cols": 10, "rows": 9 } }
  ],
  "machines": [],
  "belts": [],
  "liftPairs": [],
  "zones": []
}
```

- [ ] **Step 2: Add F1 production machines (5 smelters + 2 concrete constructors)**

All south-facing, floor 1.

| id | type | pos.col | pos.row | recipe | label | in-0 col | out-0 col |
|----|------|---------|---------|--------|-------|----------|-----------|
| fe-smelt-1 | smelter | 1.1875 | 1.0 | iron-ingot | 铁冶炼 #1 | 1.5 | 1.5 |
| fe-smelt-2 | smelter | 2.1875 | 1.0 | iron-ingot | 铁冶炼 #2 | 2.5 | 2.5 |
| fe-smelt-3 | smelter | 3.1875 | 1.0 | iron-ingot | 铁冶炼 #3 | 3.5 | 3.5 |
| cu-smelt-1 | smelter | 7.1875 | 1.0 | copper-ingot | 铜冶炼 #1 | 7.5 | 7.5 |
| cu-smelt-2 | smelter | 8.1875 | 1.0 | copper-ingot | 铜冶炼 #2 | 8.5 | 8.5 |
| concrete-1 | constructor | 7.0 | 2.5 | concrete | 混凝土 #1 | 7.5 | 7.5 |
| concrete-2 | constructor | 8.5 | 2.5 | concrete | 混凝土 #2 | 9.0 | 9.0 |

AABB verification (no overlaps):
- Iron smelters: [1.1875..1.8125]×[1.0..2.25], [2.1875..2.8125]×[1.0..2.25], [3.1875..3.8125]×[1.0..2.25] — gaps 0.375 ✓
- Copper smelters: [7.1875..7.8125]×[1.0..2.25], [8.1875..8.8125]×[1.0..2.25] — gap 0.375 ✓
- Concrete: [7.0..8.0]×[2.5..3.75], [8.5..9.5]×[2.5..3.75] — gap 0.5 ✓
- Cross-check: copper smelters end row 2.25, concrete starts row 2.5 — gap 0.25 ✓

- [ ] **Step 3: Add F2 production machines (10 constructors)**

All south-facing, floor 2.

**Tier 1 — ingot consumers (row 1.5):**

| id | type | pos.col | pos.row | recipe | label | in-0 col | out-0 col |
|----|------|---------|---------|--------|-------|----------|-----------|
| plate-1 | constructor | 0.75 | 1.5 | iron-plate | 铁板 #1 | 1.25 | 1.25 |
| plate-2 | constructor | 2.0 | 1.5 | iron-plate | 铁板 #2 | 2.5 | 2.5 |
| rod-1 | constructor | 3.25 | 1.5 | iron-rod | 铁棒 #1 | 3.75 | 3.75 |
| rod-2 | constructor | 4.5 | 1.5 | iron-rod | 铁棒 #2 | 5.0 | 5.0 |
| wire-1 | constructor | 5.75 | 1.5 | wire | 电线 #1 | 6.25 | 6.25 |
| wire-2 | constructor | 7.0 | 1.5 | wire | 电线 #2 | 7.5 | 7.5 |
| sheet-1 | constructor | 8.5 | 1.5 | copper-sheet | 铜板 #1 | 9.0 | 9.0 |

**Tier 2 — rod/wire consumers (row 4.0):**

| id | type | pos.col | pos.row | recipe | label | in-0 col | out-0 col |
|----|------|---------|---------|--------|-------|----------|-----------|
| screw-1 | constructor | 0.75 | 4.0 | screw | 螺丝 #1 | 1.25 | 1.25 |
| screw-2 | constructor | 2.0 | 4.0 | screw | 螺丝 #2 | 2.5 | 2.5 |
| cable-1 | constructor | 5.75 | 4.0 | cable | 电缆 #1 | 6.25 | 6.25 |

AABB verification:
- Tier 1: [0.75..1.75], [2.0..3.0], [3.25..4.25], [4.5..5.5], [5.75..6.75], [7.0..8.0], [8.5..9.5] × [1.5..2.75] — min gap 0.25 ✓
- Tier 2: [0.75..1.75], [2.0..3.0], [5.75..6.75] × [4.0..5.25] — ✓
- Cross-tier: tier 1 ends row 2.75, tier 2 starts row 4.0 — gap 1.25 ✓

- [ ] **Step 4: Add F3 production machines (3 assemblers)**

All south-facing, floor 3. Assembler is 1.125×2.0 grid.

| id | type | pos.col | pos.row | recipe | label | in-0 col | in-1 col | out-0 col |
|----|------|---------|---------|--------|-------|----------|----------|-----------|
| asm-rip | assembler | 0.9375 | 2.0 | reinforced-iron-plate | RIP #1 | 1.25 | 1.75 | 1.5 |
| asm-rotor | assembler | 3.4375 | 2.0 | rotor | Rotor #2 | 3.75 | 4.25 | 4.0 |
| asm-modframe | assembler | 5.9375 | 2.0 | modular-frame | ModFrame #3 (flex) | 6.25 | 6.75 | 6.5 |

AABB: [0.9375..2.0625], [3.4375..4.5625], [5.9375..7.0625] × [2.0..4.0] — gap 1.375 ✓

**Recipe → port mapping:**
- RIP: in-0=铁板(plate), in-1=螺丝(screw)
- Rotor: in-0=铁棒(rod), in-1=螺丝(screw)
- Modular Frame: in-0=强化铁板(RIP), in-1=铁棒(rod)

- [ ] **Step 5: Add F3 buffer storage (3 units)**

All south-facing, floor 3. Storage is 0.625×1.375 grid.

| id | type | pos.col | pos.row | label | in-0 col | out-0 col |
|----|------|---------|---------|-------|----------|-----------|
| st-rip | storage | 1.1875 | 5.5 | RIP 缓冲 | 1.5 | 1.5 |
| st-rotor | storage | 3.6875 | 5.5 | Rotor 缓冲 | 4.0 | 4.0 |
| st-modframe | storage | 6.1875 | 5.5 | ModFrame 缓冲 | 6.5 | 6.5 |

AABB: [1.1875..1.8125], [3.6875..4.3125], [6.1875..6.8125] × [5.5..6.875] — ✓
Cross with assemblers: assemblers end row 4.0, storage starts row 5.5 — gap 1.5 ✓

- [ ] **Step 6: Run validation**

```bash
npx vitest run
```

Expected: R23 warnings (unconnected input ports) and R29 errors (isolated machines) — expected since we haven't added belts yet. Verify NO R1/R3/R13 errors (type, bounds, collision).

- [ ] **Step 7: Commit**

```bash
git add data/schemes/unified-base.json
git commit -m "feat(scheme): add unified-base v2 skeleton with 20 production machines + 3 storage on 3 floors"
```

---

## Task 2: F1 Input Zone — Ore Splitters + Smelter Feed Belts

**Files:**
- Modify: `data/schemes/unified-base.json`

- [ ] **Step 1: Add F1 input splitters**

Place on F1 (floor 1, south-facing) in the input zone:

| id | type | pos.col | pos.row | label | Purpose |
|----|------|---------|---------|-------|---------|
| sp-fe-ore-1 | splitter | 2.25 | 0.25 | 铁矿分流 #1 | E1 iron 90→split |
| sp-fe-ore-2 | splitter | 1.25 | 0.5 | 铁矿分流 #2 | →smelt 1&2 |
| sp-cu-ore | splitter | 7.75 | 0.25 | 铜矿分流 | E3 copper 60→split |
| sp-lime | splitter | 8.75 | 2.0 | 石灰石分流 | E4 lime 90→split |

AABB checks:
- sp-fe-ore-1: [2.25..2.75]×[0.25..0.75] — no collision with smelters (start row 1.0) ✓
- sp-fe-ore-2: [1.25..1.75]×[0.5..1.0] — touches fe-smelt-1 top edge at row 1.0 ✓ (edge touching OK)
- sp-cu-ore: [7.75..8.25]×[0.25..0.75] ✓
- sp-lime: [8.75..9.25]×[2.0..2.5] — no collision with cu-smelt-2 [8.1875..8.8125]×[1.0..2.25] ✓ (left edges: 8.75 > 8.8125? No: 8.75 < 8.8125. Row overlap: [2.0..2.25] — OVERLAP!)

**Fix sp-lime position:** Move to pos.col = 9.0, pos.row = 2.0 → AABB [9.0..9.5]×[2.0..2.5]. cu-smelt-2 ends at col 8.8125. Gap: 9.0 - 8.8125 = 0.1875 ✓

Updated: sp-lime pos (9.0, 2.0), in-0 at (9.25, 2.0), out-0 at (9.25, 2.5), out-2 at (9.0, 2.25).

- [ ] **Step 2: Add iron ore input belts (E1 → smelters)**

| Belt ID | fromPort | toPort | material | mark | Path description |
|---------|----------|--------|----------|------|-----------------|
| b-fe-ore-in | (external) | sp-fe-ore-1:in-0 | iron-ore | 2 | North edge (col 2.5, row 0) → south to (2.5, 0.25) |
| b-fe-split | sp-fe-ore-1:out-0 | sp-fe-ore-2:in-0 | iron-ore | 2 | (2.5, 0.75) → (2.5, 0.85) → (1.5, 0.85) → (1.5, 0.5) — wait, in-0 is at row 0.5 top, belt must enter from above. Rethink. |

**Important belt routing rules:**
- R16: belt approaching back(top) port must have VERTICAL last segment (shared col)
- R16: belt approaching left/right port must have HORIZONTAL last segment (shared row)
- fromPort is where belt starts, toPort is where belt ends
- Belt exits from fromPort direction, enters into toPort direction

For each belt, calculate the exact path from source port position to destination port position, ensuring:
1. Start at source port position
2. End at destination port position
3. All segments orthogonal (R7)
4. Last segment into destination port satisfies R16
5. First segment from source port satisfies R16
6. No crossing unrelated machines (R14)
7. Total length ≤ 1.4× manhattan bbox (R17)

**Belt paths (calculated):**

```
b-fe-ore-in: path = [{col:2.5, row:0}, {col:2.5, row:0.25}]
  External entry → sp-fe-ore-1:in-0. Vertical, enters back port ✓

b-fe-ore-split: sp-fe-ore-1:out-0 → sp-fe-ore-2:in-0
  from (2.5, 0.75) to (1.5, 0.5)
  Need: last segment vertical into back port (col 1.5)
  Path: [{col:2.5, row:0.75}, {col:2.5, row:0.85}, {col:1.5, row:0.85}, {col:1.5, row:0.5}]
  Wait — toPort in-0 is at (1.5, 0.5) which is the TOP of sp-fe-ore-2. Belt approaches from above (going south into back port) means going from row < 0.5 to row 0.5. But our path has row 0.85 > 0.5. 
  
  Correction: sp-fe-ore-2 in-0 is at row 0.5 (top). Back port on south-facing machine = top edge. Belt must approach from ABOVE (smaller row) going DOWN (increasing row). So belt endpoint must be (1.5, 0.5) and the segment before it must be at col 1.5, row < 0.5.
  
  But sp-fe-ore-1:out-0 is at (2.5, 0.75) — that's BELOW sp-fe-ore-2:in-0 at (1.5, 0.5). This means the belt needs to go UPWARD (north), which is unusual but valid.
  
  Revised path: [{col:2.5, row:0.75}, {col:2.5, row:0.35}, {col:1.5, row:0.35}, {col:1.5, row:0.5}]
  Last segment: (1.5, 0.35)→(1.5, 0.5) = vertical into back port ✓
  
b-fe-ore-s3: sp-fe-ore-1:out-1 → fe-smelt-3:in-0
  from (2.75, 0.5) to (3.5, 1.0)
  out-1 is left(→screen right). Last segment into back port must be vertical.
  Path: [{col:2.75, row:0.5}, {col:3.5, row:0.5}, {col:3.5, row:1.0}]
  First segment horizontal (exits left port) ✓, last segment vertical (enters back port) ✓

b-fe-ore-s1: sp-fe-ore-2:out-0 → fe-smelt-1:in-0
  from (1.5, 1.0) to (1.5, 1.0)
  Same point! Direct connection — but R6 requires at least 2 points.
  Path: [{col:1.5, row:1.0}, {col:1.5, row:1.0}]
  Actually same-point path may cause issues. Need minimal offset:
  Path: [{col:1.5, row:0.975}, {col:1.5, row:1.0}]
  Or just accept the alignment is perfect — the port positions are the same.
  Actually, out-0 of sp-fe-ore-2 is at (1.5, 1.0) and in-0 of fe-smelt-1 is at (1.5, 1.0). They're touching. A valid 2-point path: [{col:1.5, row:1.0}, {col:1.5, row:1.0}] should work as a zero-length belt.
  Actually this will likely fail R6 or be weird. Let's give a tiny vertical segment:
  Path: [{col:1.5, row:0.95}, {col:1.5, row:1.0}]

b-fe-ore-s2: sp-fe-ore-2:out-1 → fe-smelt-2:in-0
  from (1.75, 0.75) to (2.5, 1.0)
  Path: [{col:1.75, row:0.75}, {col:2.5, row:0.75}, {col:2.5, row:1.0}]
  Horizontal then vertical into back port ✓
```

- [ ] **Step 3: Add copper ore input belts**

```
b-cu-ore-in: (external) → sp-cu-ore:in-0
  Path: [{col:8.0, row:0}, {col:8.0, row:0.25}]

b-cu-ore-s1: sp-cu-ore:out-2 → cu-smelt-1:in-0
  from (7.75, 0.5) to (7.5, 1.0)
  Path: [{col:7.75, row:0.5}, {col:7.5, row:0.5}, {col:7.5, row:1.0}]

b-cu-ore-s2: sp-cu-ore:out-0 → cu-smelt-2:in-0
  from (8.0, 0.75) to (8.5, 1.0)
  Path: [{col:8.0, row:0.75}, {col:8.5, row:0.75}, {col:8.5, row:1.0}]
```

- [ ] **Step 4: Add limestone input belts**

```
b-lime-in: (external) → sp-lime:in-0
  Path: [{col:9.25, row:0}, {col:9.25, row:2.0}]
  Long vertical run. Verify R14: does not cross any machine AABB.
  Machines in this col range: cu-smelt-2 [8.1875..8.8125]×[1.0..2.25] — col 9.25 is outside ✓
  concrete-2 [8.5..9.5]×[2.5..3.75] — belt ends at row 2.0, concrete starts 2.5 ✓

b-lime-c2: sp-lime:out-0 → concrete-2:in-0
  from (9.25, 2.5) to (9.0, 2.5)
  Same row! But out-0 is front(bottom) port, and concrete-2:in-0 is back(top) port.
  sp-lime out-0 at (9.25, 2.5) exits going south. concrete-2 in-0 at (9.0, 2.5) needs entry from north (going south).
  The belt must go south from splitter, then back up to concrete — problematic.
  
  **Fix:** Reconsider sp-lime position. Place it at row 2.0 with out-2 (right→screen left) going to concrete-1, and reroute out-0 south then west to concrete-2.
  
  Actually, better approach: place sp-lime ABOVE the concrete constructors so out-0 and out-1/out-2 go naturally to each concrete machine.
  
  Move sp-lime to pos (8.25, 2.0):
  - in-0: (8.5, 2.0) — limestone enters from above ✓
  - out-0: (8.5, 2.5) — goes to concrete-1 or concrete-2
  - out-2 (right→screen left): (8.25, 2.25) — goes left
  
  out-0 at (8.5, 2.5): concrete constructors start at row 2.5.
  concrete-1:in-0 at (7.5, 2.5) and concrete-2:in-0 at (9.0, 2.5).
  
  Route out-0 to concrete-2: (8.5, 2.5)→(9.0, 2.5)→(9.0, 2.5) — horizontal then same point. Actually:
  Path: [{col:8.5, row:2.5}, {col:8.5, row:2.4}, {col:9.0, row:2.4}, {col:9.0, row:2.5}]
  
  Route out-2 to concrete-1: (8.25, 2.25)→(7.5, 2.25)→(7.5, 2.5)
  Path: [{col:8.25, row:2.25}, {col:7.5, row:2.25}, {col:7.5, row:2.5}]

  But check sp-lime AABB [8.25..8.75]×[2.0..2.5] vs cu-smelt-2 [8.1875..8.8125]×[1.0..2.25]:
  Col overlap: [8.25..8.75] inside [8.1875..8.8125] ✓ overlaps
  Row overlap: [2.0..2.25] ✓ overlaps
  **COLLISION!** sp-lime overlaps cu-smelt-2.
  
  **Fix:** Move sp-lime to pos (7.25, 2.0) → AABB [7.25..7.75]×[2.0..2.5]
  - in-0: (7.5, 2.0)
  - out-0: (7.5, 2.5) → same col as concrete-1:in-0! Direct connection ✓
  - out-1 (left→screen right): (7.75, 2.25) → route to concrete-2:in-0 at (9.0, 2.5)
  
  Check collision: cu-smelt-1 [7.1875..7.8125]×[1.0..2.25], sp-lime [7.25..7.75]×[2.0..2.5]
  Col overlap: [7.25..7.75] inside [7.1875..7.8125] ✓
  Row overlap: [2.0..2.25] ✓
  **COLLISION again!**
  
  **Fix:** Move sp-lime to row 2.25 → AABB [7.25..7.75]×[2.25..2.75]
  cu-smelt-1 ends row 2.25. sp-lime starts row 2.25. Edge touching = OK ✓
  
  Updated sp-lime: pos (7.25, 2.25)
  - in-0: (7.5, 2.25) — belt from north
  - out-0: (7.5, 2.75) — need to route south to concrete-1:in-0 at (7.5, 2.5)
  
  Problem: out-0 at row 2.75 is BELOW concrete-1 which starts at row 2.5. Can't go back up easily.
  
  **Final fix:** Use a different splitter position. Place at col 9.25 (far right, clear of all smelters):
  sp-lime: pos (9.0, 0.5), AABB [9.0..9.5]×[0.5..1.0]
  - in-0: (9.25, 0.5) — limestone enters from north
  - out-0: (9.25, 1.0) — route south to concrete-1 (long route)
  - out-1: (9.5, 0.75) — out of bounds (col 9.5 is at edge of 10-col grid, need col < 10) ✓ just fits
  
  This is far from concrete constructors but avoids collisions. Route belts south.
  
  Actually, simplest approach: **don't use a splitter for limestone.** Use a direct belt to a merger, or route two separate belts from a single splitter placed safely.
  
  Let me rethink the limestone routing. There are 2 concrete constructors each needing 45 limestone/min. We need to split 90/min into 2×45. 
  
  Place sp-lime at pos (9.0, 0.5) — safe location, far from smelters:
  AABB [9.0..9.5]×[0.5..1.0] — no collision with anything ✓
  - in-0: (9.25, 0.5)
  - out-0: (9.25, 1.0) → route to concrete-2:in-0 at (9.0, 2.5)
  - out-2: (9.0, 0.75) → route to concrete-1:in-0 at (7.5, 2.5)

```
b-lime-in: (external) → sp-lime:in-0
  Path: [{col:9.25, row:0}, {col:9.25, row:0.5}]

b-lime-c2: sp-lime:out-0 → concrete-2:in-0
  from (9.25, 1.0) to (9.0, 2.5)
  Path: [{col:9.25, row:1.0}, {col:9.25, row:2.35}, {col:9.0, row:2.35}, {col:9.0, row:2.5}]
  R14: check path doesn't cross cu-smelt-2 [8.1875..8.8125]×[1.0..2.25] — col 9.25 is outside ✓
  Also check concrete-2 [8.5..9.5]×[2.5..3.75] — belt enters at (9.0, 2.5) which is the in-0 port, first/last segment inside connected machine is OK ✓

b-lime-c1: sp-lime:out-2 → concrete-1:in-0
  from (9.0, 0.75) to (7.5, 2.5)
  Path: [{col:9.0, row:0.75}, {col:7.5, row:0.75}, {col:7.5, row:2.5}]
  R14: horizontal segment at row 0.75 crosses cols 7.5→9.0. Check machines:
    fe-smelt-3 [3.1875..3.8125]×[1.0..2.25] — not in path ✓
    cu-smelt-1 [7.1875..7.8125]×[1.0..2.25] — row 0.75 is above row 1.0 ✓
  Vertical segment col 7.5, rows 0.75→2.5. Check:
    cu-smelt-1 [7.1875..7.8125]×[1.0..2.25] — col 7.5 is inside col range! Row range [1.0..2.25] overlaps [0.75..2.5]. 
    But cu-smelt-1:in-0 is NOT connected to this belt, so R14b applies (warn for unrelated machine crossing).
    
  **Fix:** Route belt around cu-smelt-1. Change path:
  [{col:9.0, row:0.75}, {col:6.75, row:0.75}, {col:6.75, row:2.5}, {col:7.5, row:2.5}]
  Wait — R16: last segment into back(top) port at (7.5, 2.5) must be VERTICAL. But (6.75, 2.5)→(7.5, 2.5) is horizontal.
  
  Fix: [{col:9.0, row:0.75}, {col:7.0, row:0.75}, {col:7.0, row:2.35}, {col:7.5, row:2.35}, {col:7.5, row:2.5}]
  This adds a small L-shape at the end. Last segment vertical ✓
  Check R14: col 7.0 vertical segment — cu-smelt-1 is [7.1875..7.8125], col 7.0 is outside ✓
  R17: manhattan bbox = |9.0-7.5| + |0.75-2.5| = 1.5 + 1.75 = 3.25. Path length = 2.0 + 1.6 + 0.5 + 0.15 = 4.25. 4.25 / 3.25 = 1.31 ≤ 1.4 ✓
```

- [ ] **Step 5: Run validation + commit**

```bash
npx vitest run
git add data/schemes/unified-base.json
git commit -m "feat(scheme): add F1 input zone - ore splitters and smelter/concrete feed belts"
```

---

## Task 3: F1 Smelter Output — Ingot Mergers + Lift L1/L2 Bottom

**Files:**
- Modify: `data/schemes/unified-base.json`

- [ ] **Step 1: Add iron ingot mergers**

3 iron smelters output at col 1.5, 2.5, 3.5 (row 2.25). Merge into one stream.

| id | type | pos.col | pos.row | label |
|----|------|---------|---------|-------|
| mg-fe-ingot-1 | merger | 1.25 | 2.5 | 铁锭合流 #1 |
| mg-fe-ingot-2 | merger | 2.25 | 3.0 | 铁锭合流 #2 |

mg-fe-ingot-1 AABB [1.25..1.75]×[2.5..3.0] — smelters end row 2.25, gap 0.25 ✓
mg-fe-ingot-2 AABB [2.25..2.75]×[3.0..3.5] ✓

Connections:
- fe-smelt-1:out-0 (1.5, 2.25) → mg-fe-ingot-1:in-2 (1.25, 2.75) — right port (screen left)
- fe-smelt-2:out-0 (2.5, 2.25) → mg-fe-ingot-1:in-0 (1.5, 2.5) — back port
- mg-fe-ingot-1:out-0 (1.5, 3.0) → mg-fe-ingot-2:in-0 (2.5, 3.0) — back port
- fe-smelt-3:out-0 (3.5, 2.25) → mg-fe-ingot-2:in-1 (2.75, 3.25) — left port (screen right)

- [ ] **Step 2: Add copper ingot merger**

| id | type | pos.col | pos.row | label |
|----|------|---------|---------|-------|
| mg-cu-ingot | merger | 7.75 | 2.5 | 铜锭合流 |

AABB [7.75..8.25]×[2.5..3.0] — copper smelters end row 2.25, gap 0.25 ✓

Connections:
- cu-smelt-1:out-0 (7.5, 2.25) → mg-cu-ingot:in-2 (7.75, 2.75)
- cu-smelt-2:out-0 (8.5, 2.25) → mg-cu-ingot:in-1 (8.25, 2.75)

- [ ] **Step 3: Add lift L1/L2 bottom machines**

Lifts are 0.25×0.25. Place south of mergers.

| id | type | pos.col | pos.row | floor | label |
|----|------|---------|---------|-------|-------|
| lift-L1-bot | conveyor-lift-in-bottom | 2.375 | 0.5 | 1 | L1·铁锭↑ |
| lift-L2-bot | conveyor-lift-in-bottom | 7.875 | 0.5 | 1 | L2·铜锭↑ |

Note: Lift positions should align with where they're needed on F2 (near the F2 input zone). The pos must be IDENTICAL between bottom and top machines. Place them in the north area of the grid (row 0.5) so they're accessible on F2 as input arrival points.

Port positions:
- lift-L1-bot: bottom port at (2.5, 0.625) — belt-in
- lift-L2-bot: bottom port at (8.0, 0.625) — belt-in

- [ ] **Step 4: Add smelter output → merger → lift belts**

Route each belt from smelter output through mergers to lift bottom ports. Calculate exact paths respecting R16 (vertical into back ports, horizontal into side ports).

| Belt ID | fromPort | toPort | material | mark |
|---------|----------|--------|----------|------|
| b-fe-s1-out | fe-smelt-1:out-0 | mg-fe-ingot-1:in-2 | iron-ingot | 1 |
| b-fe-s2-out | fe-smelt-2:out-0 | mg-fe-ingot-1:in-0 | iron-ingot | 1 |
| b-fe-mg1-mg2 | mg-fe-ingot-1:out-0 | mg-fe-ingot-2:in-0 | iron-ingot | 2 |
| b-fe-s3-out | fe-smelt-3:out-0 | mg-fe-ingot-2:in-1 | iron-ingot | 1 |
| b-fe-ingot-lift | mg-fe-ingot-2:out-0 | lift-L1-bot:bottom | iron-ingot | 2 |
| b-cu-s1-out | cu-smelt-1:out-0 | mg-cu-ingot:in-2 | copper-ingot | 1 |
| b-cu-s2-out | cu-smelt-2:out-0 | mg-cu-ingot:in-1 | copper-ingot | 1 |
| b-cu-ingot-lift | mg-cu-ingot:out-0 | lift-L2-bot:bottom | copper-ingot | 1 |

For each belt, calculate the path from source port to destination port. Key routing:
- Smelter out-0 ports exit going south (front). Merger in-0 (back) needs vertical entry from above. Merger in-1/in-2 (side) needs horizontal entry.
- b-fe-ingot-lift: mg-fe-ingot-2:out-0 at (2.5, 3.5) → lift-L1-bot:bottom at (2.5, 0.625). The lift is ABOVE (north of) the merger! Belt goes north (decreasing row). Path: [{col:2.5, row:3.5}, {col:2.5, row:0.625}]
  Check R14: long vertical run at col 2.5. Crosses: mg-fe-ingot-1 [1.25..1.75] col — no. fe-smelt-2 [2.1875..2.8125]×[1.0..2.25] — col 2.5 is inside! Row 0.625→3.5 crosses [1.0..2.25].
  But fe-smelt-2:out-0 is NOT a connected port of this belt. R14b warn for crossing unrelated machine.
  
  **Fix:** Route around. Or better: move lift-L1-bot to a position that avoids this issue.
  Move lift-L1-bot to pos (2.375, 3.75) → port at (2.5, 3.875). South of mg-fe-ingot-2.
  Path: [{col:2.5, row:3.5}, {col:2.5, row:3.875}] — short direct route ✓
  
  Similarly lift-L2-bot: place south of mg-cu-ingot.
  mg-cu-ingot:out-0 at (8.0, 3.0). Place lift-L2-bot at pos (7.875, 3.25) → port at (8.0, 3.375).
  Path: [{col:8.0, row:3.0}, {col:8.0, row:3.375}] ✓

Updated lift positions:
- lift-L1-bot: pos (2.375, 3.75), floor 1
- lift-L2-bot: pos (7.875, 3.25), floor 1

- [ ] **Step 5: Add concrete output belt to O7**

Concrete constructors output → direct to F1 output zone. We'll add the concrete output belt in Task 8 (F1 output zone) along with the O7 terminal. For now, add the concrete merger:

| id | type | pos.col | pos.row | label |
|----|------|---------|---------|-------|
| mg-concrete | merger | 7.25 | 4.0 | 混凝土合流 |

Connections:
- concrete-1:out-0 (7.5, 3.75) → mg-concrete:in-2 (7.25, 4.25) — right(screen left) port
- concrete-2:out-0 (9.0, 3.75) → mg-concrete:in-1 (7.75, 4.25) — left(screen right) port

- [ ] **Step 6: Route all belt paths and run validation**

Calculate exact paths for all belts in this task. Run:

```bash
npx vitest run
```

Fix any R7/R14/R16/R17 errors.

- [ ] **Step 7: Commit**

```bash
git add data/schemes/unified-base.json
git commit -m "feat(scheme): add F1 smelter output mergers and lift L1/L2 bottom"
```

---

## Task 4: F2 Input Zone — Ingot Distribution to Constructors

**Files:**
- Modify: `data/schemes/unified-base.json`

- [ ] **Step 1: Add lift L1/L2 top machines on F2**

Must match bottom machines' col/row exactly (different floor).

| id | type | pos.col | pos.row | floor | label |
|----|------|---------|---------|-------|-------|
| lift-L1-top | conveyor-lift-out-top | 2.375 | 3.75 | 2 | L1·铁锭↑ |
| lift-L2-top | conveyor-lift-out-top | 7.875 | 3.25 | 2 | L2·铜锭↑ |

Wait — these positions place the lift tops in the MIDDLE of F2, but we want them near the F2 input zone (north area). The lift pos must be identical across floors. In the v1 plan, this was identified as a problem — lifts represent physical vertical connections, and the pos is the screen-space position.

Since we placed lift-L1-bot at (2.375, 3.75) on F1 (south of mergers), the top on F2 is also at (2.375, 3.75) on F2. This puts it between tier 1 (ends row 2.75) and tier 2 (starts row 4.0) constructors on F2 — actually a good position for distributing ingots!

Ports:
- lift-L1-top: top port at (2.5, 3.875) — belt-out (ingots come out here on F2)
- lift-L2-top: top port at (8.0, 3.375) — belt-out

Check collision on F2: lift-L1-top AABB [2.375..2.625]×[3.75..4.0]. screw-1 starts at [0.75..1.75]×[4.0..5.25]. No overlap ✓.
lift-L2-top AABB [7.875..8.125]×[3.25..3.5]. No constructor here ✓.

- [ ] **Step 2: Add iron ingot distribution splitters on F2**

Iron ingot arrives at L1 top exit (2.5, 3.875). Split 90/min → 60 plate + 30 rod.

Use splitter chain:
- sp-fe-ingot: main split plate/rod
- sp-fe-plate: split to plate-1 and plate-2
- sp-fe-rod: split to rod-1 and rod-2

| id | type | pos.col | pos.row | floor | label |
|----|------|---------|---------|-------|-------|
| sp-fe-ingot | splitter | 2.25 | 3.25 | 2 | 铁锭分流 |
| sp-fe-plate | splitter | 1.0 | 1.0 | 2 | 铁锭→铁板 |
| sp-fe-rod | splitter | 3.5 | 1.0 | 2 | 铁锭→铁棒 |

Routing: lift-L1-top:top → sp-fe-ingot:in-0 → sp-fe-plate (for plates) + sp-fe-rod (for rods)
From sp-fe-plate → plate-1:in-0 + plate-2:in-0
From sp-fe-rod → rod-1:in-0 + rod-2:in-0

- [ ] **Step 3: Add copper ingot distribution splitters on F2**

Copper ingot arrives at L2 top exit. Split to wire-1, wire-2, sheet-1.

| id | type | pos.col | pos.row | floor | label |
|----|------|---------|---------|-------|-------|
| sp-cu-ingot | splitter | 6.0 | 1.0 | 2 | 铜锭分流 wire/sheet |
| sp-cu-wire | splitter | 6.0 | 0.5 | 2 | 铜锭→电线 pair |

Routing: lift-L2-top:top → sp-cu-ingot:in-0
sp-cu-ingot:out-0 → sp-cu-wire → wire-1 + wire-2
sp-cu-ingot:out-1 or out-2 → sheet-1:in-0

- [ ] **Step 4: Route all ingot distribution belts**

For each connection, calculate exact belt path. Verify:
- R16 compliance on every port connection
- R14 no crossing unrelated machines
- R17 path length within 1.4× manhattan bbox

- [ ] **Step 5: Run validation + commit**

```bash
npx vitest run
git add data/schemes/unified-base.json
git commit -m "feat(scheme): add F2 ingot distribution from L1/L2 to constructors"
```

---

## Task 5: F2 Product Output — Splitters + Down Lifts L6-L11 + Up Lifts L3-L5

**Files:**
- Modify: `data/schemes/unified-base.json`

- [ ] **Step 1: Add F2 product output splitters**

Each product with dual destination (F3 + F1) needs a splitter. Products without F3 consumer go directly to lift.

**Iron plate** (2 constructors → merger → splitter → L3↑ + L6↓):

| id | type | pos.col | pos.row | floor | label |
|----|------|---------|---------|-------|-------|
| mg-plate | merger | 1.0 | 3.0 | 2 | 铁板合流 |
| sp-plate | splitter | 1.0 | 5.5 | 2 | 铁板分流 F3/F1 |

**Iron rod** (2 constructors → merger → splitter → L5↑ + L7↓ + screw feed):

| id | type | pos.col | pos.row | floor | label |
|----|------|---------|---------|-------|-------|
| mg-rod | merger | 3.5 | 3.0 | 2 | 铁棒合流 |
| sp-rod | splitter | 3.5 | 3.5 | 2 | 铁棒分流 F3/screw/F1 |

Rod splitter has 3 consumers: F3 assemblers, screw constructors, and F1 output. Use 2-way split: out to screw pair + out to a second splitter (F3/F1).

**Screw** (2 constructors → merger → splitter → L4↑ + L8↓):

| id | type | pos.col | pos.row | floor | label |
|----|------|---------|---------|-------|-------|
| mg-screw | merger | 1.0 | 5.5 | 2 | 螺丝合流 |
| sp-screw | splitter | 1.0 | 6.0 | 2 | 螺丝分流 F3/F1 |

**Wire** (2 constructors → merger → splitter → cable + L9↓):

| id | type | pos.col | pos.row | floor | label |
|----|------|---------|---------|-------|-------|
| mg-wire | merger | 6.0 | 3.0 | 2 | 电线合流 |
| sp-wire | splitter | 6.0 | 5.5 | 2 | 电线分流 cable/F1 |

**Cable and Sheet**: direct to lift (no splitter needed).

Note: Exact splitter positions above are approximate. The implementing agent must:
1. Verify no AABB collisions with existing machines
2. Ensure splitter ports align with upstream/downstream for clean belt routing
3. Adjust positions as needed to satisfy R13, R14, R16

- [ ] **Step 2: Add lift machines on F2 — up lifts L3/L4/L5**

These go from F2 to F3. Place near the product output zone on F2 (row 6-7 area). The pos must be identical on F2 (bottom) and F3 (top).

| id | type | pos.col | pos.row | floor | label |
|----|------|---------|---------|-------|-------|
| lift-L3-bot | conveyor-lift-in-bottom | 1.125 | 7.0 | 2 | L3·铁板↑ |
| lift-L4-bot | conveyor-lift-in-bottom | 1.875 | 7.0 | 2 | L4·螺丝↑ |
| lift-L5-bot | conveyor-lift-in-bottom | 3.625 | 7.0 | 2 | L5·铁棒↑ |

- [ ] **Step 3: Add lift machines on F2 — down lifts L6-L11**

These go from F2 down to F1 for single-product output.

| id | type | pos.col | pos.row | floor | label |
|----|------|---------|---------|-------|-------|
| lift-L6-top | conveyor-lift-in-top | 1.125 | 7.5 | 2 | L6·铁板余量↓ |
| lift-L7-top | conveyor-lift-in-top | 3.625 | 7.5 | 2 | L7·铁棒余量↓ |
| lift-L8-top | conveyor-lift-in-top | 1.875 | 7.5 | 2 | L8·螺丝余量↓ |
| lift-L9-top | conveyor-lift-in-top | 5.875 | 7.0 | 2 | L9·电线余量↓ |
| lift-L10-top | conveyor-lift-in-top | 5.875 | 7.5 | 2 | L10·电缆↓ |
| lift-L11-top | conveyor-lift-in-top | 8.875 | 7.0 | 2 | L11·铜板↓ |

Note: These positions are carefully chosen to avoid collisions with each other (each is 0.25×0.25). Verify all AABB non-overlapping.

- [ ] **Step 4: Route all F2 product belts**

For each constructor output, route through mergers, splitters, and to lift machines. This involves ~20+ belts. Calculate each path respecting all routing rules.

Key routing strategy:
- Constructor outputs go south (front ports at row 2.75 for tier 1, row 5.25 for tier 2)
- Mergers collect paired constructor outputs
- Splitters divide between F3 (up lifts) and F1 (down lifts)
- Lifts are in the row 7-8 zone

- [ ] **Step 5: Run validation + commit**

```bash
npx vitest run
git add data/schemes/unified-base.json
git commit -m "feat(scheme): add F2 product splitters and lift machines L3-L11"
```

---

## Task 6: F3 Input Zone — Lift Tops + Assembler Feed Belts

**Files:**
- Modify: `data/schemes/unified-base.json`

- [ ] **Step 1: Add lift L3/L4/L5 top machines on F3**

Must match bottom machine positions exactly.

| id | type | pos.col | pos.row | floor | label |
|----|------|---------|---------|-------|-------|
| lift-L3-top | conveyor-lift-out-top | 1.125 | 7.0 | 3 | L3·铁板↑ |
| lift-L4-top | conveyor-lift-out-top | 1.875 | 7.0 | 3 | L4·螺丝↑ |
| lift-L5-top | conveyor-lift-out-top | 3.625 | 7.0 | 3 | L5·铁棒↑ |

Wait — these positions (row 7.0) are BELOW the assemblers (row 2.0-4.0) and storage (row 5.5-6.875) on F3. Materials need to go from these lifts UP to the assemblers. The belts would run from row 7 northward to row 2.

Alternative: place lift tops in the north area of F3 (row 0-1.5), so materials arrive near the assemblers.

**Move lift L3-L5 positions to row 1.0 area:**

| id | type | pos.col/row (both floors) | label |
|----|------|--------------------------|-------|
| lift-L3 | 1.125, 1.0 | L3·铁板↑ |
| lift-L4 | 1.875, 1.0 | L4·螺丝↑ |
| lift-L5 | 3.625, 1.0 | L5·铁棒↑ |

**Go back to Task 5 Step 2 and update L3/L4/L5 bottom positions to (_, 1.0).**

On F2, these would be at row 1.0 — inside the tier 1 constructor zone. Check collision:
- lift-L3-bot [1.125..1.375]×[1.0..1.25] vs plate-1 [0.75..1.75]×[1.5..2.75] — no row overlap ✓
- But row 1.0 is above tier-1 constructors (row 1.5). This is the ingot distribution zone on F2. Should be OK if no splitter collision.

Actually, this is getting complicated with the position sharing between floors. Let me step back and think about a better approach.

**Key constraint:** Lift bottom and top machines must have identical (col, row) values. The position should make sense on BOTH floors.

For L3/L4/L5 (F2→F3):
- On F2: materials exit constructors (south side, ~row 3-5), go to splitters, then to lift bottoms
- On F3: materials arrive from lift tops, go to assemblers (north side, ~row 2)

Best position: somewhere in the row 1.0-1.5 range. On F2, this is the constructor input zone (above tier 1 constructors). On F3, this is above the assemblers.

Place at row 1.25:
- On F2: lifts at row 1.25, above tier 1 constructors (row 1.5). Belts from F2 product splitters go north to these lifts.
- On F3: lifts at row 1.25, above assemblers (row 2.0). Short belts go south to assembler inputs.

Updated positions:

| id | pos.col | pos.row | Purpose |
|----|---------|---------|---------|
| lift-L3 | 1.125 | 1.25 | plate F2→F3 |
| lift-L4 | 1.875 | 1.25 | screw F2→F3 |
| lift-L5 | 3.625 | 1.25 | rod F2→F3 |

On F2: AABB [1.125..1.375]×[1.25..1.5] vs plate-1 [0.75..1.75]×[1.5..2.75] — edge touch at row 1.5 ✓
On F3: AABB [1.125..1.375]×[1.25..1.5] — clear of assemblers (start row 2.0) ✓

- [ ] **Step 2: Add F3 input distribution splitters**

Materials from lifts need to reach assembler inputs:
- L3 plate → RIP:in-0 (plate)
- L4 screw → RIP:in-1 (screw) + Rotor:in-1 (screw) — need splitter
- L5 rod → Rotor:in-0 (rod) + ModFrame:in-1 (rod) — need splitter

| id | type | pos.col | pos.row | floor | label |
|----|------|---------|---------|-------|-------|
| sp-f3-screw | splitter | 1.5 | 1.5 | 3 | F3 螺丝分流 RIP/Rotor |
| sp-f3-rod | splitter | 3.5 | 1.5 | 3 | F3 铁棒分流 Rotor/ModFrame |

Routing:
- L3 top → belt → asm-rip:in-0 (plate at col 1.25, row 2.0) — direct, no splitter needed
- L4 top → sp-f3-screw → asm-rip:in-1 (1.75, 2.0) + asm-rotor:in-1 (4.25, 2.0)
- L5 top → sp-f3-rod → asm-rotor:in-0 (3.75, 2.0) + asm-modframe:in-1 (6.75, 2.0)

- [ ] **Step 3: Route all F3 input belts**

Calculate paths from lift top ports through splitters to assembler input ports. All connections enter back(top) ports → last segment must be vertical.

- [ ] **Step 4: Run validation + commit**

```bash
npx vitest run
git add data/schemes/unified-base.json
git commit -m "feat(scheme): add F3 input distribution from L3/L4/L5 to assemblers"
```

---

## Task 7: F3 Output Zone — RIP Splitter + Storage + Down Lifts L12-L14

**Files:**
- Modify: `data/schemes/unified-base.json`

- [ ] **Step 1: Add RIP output splitter**

RIP assembler output needs to split: one part to ModFrame assembler in-0, one part to st-rip storage.

| id | type | pos.col | pos.row | floor | label |
|----|------|---------|---------|-------|-------|
| sp-rip-out | splitter | 1.25 | 4.5 | 3 | RIP 分流 ModFrame/storage |

asm-rip:out-0 at (1.5, 4.0) → sp-rip-out:in-0 at (1.5, 4.5) — direct vertical ✓

sp-rip-out:out-0 → st-rip:in-0 at (1.5, 5.5) — vertical ✓
sp-rip-out:out-1 → asm-modframe:in-0 at (6.25, 2.0) — long route, needs careful path

- [ ] **Step 2: Add assembler → storage belts**

| Belt | fromPort | toPort | Description |
|------|----------|--------|-------------|
| b-rip-store | sp-rip-out:out-0 | st-rip:in-0 | RIP surplus → storage |
| b-rip-modframe | sp-rip-out:out-1 or out-2 | asm-modframe:in-0 | RIP → ModFrame input |
| b-rotor-store | asm-rotor:out-0 | st-rotor:in-0 | Rotor → storage |
| b-modframe-store | asm-modframe:out-0 | st-modframe:in-0 | ModFrame → storage |

- [ ] **Step 3: Add down lift machines on F3 (L12-L14 top)**

| id | type | pos.col | pos.row | floor | label |
|----|------|---------|---------|-------|-------|
| lift-L12-top | conveyor-lift-in-top | 1.375 | 7.5 | 3 | L12·RIP↓ |
| lift-L13-top | conveyor-lift-in-top | 3.875 | 7.5 | 3 | L13·Rotor↓ |
| lift-L14-top | conveyor-lift-in-top | 6.375 | 7.5 | 3 | L14·ModFrame↓ |

- [ ] **Step 4: Add storage → lift belts**

| Belt | fromPort | toPort |
|------|----------|--------|
| b-st-rip-lift | st-rip:out-0 | lift-L12-top:top |
| b-st-rotor-lift | st-rotor:out-0 | lift-L13-top:top |
| b-st-modframe-lift | st-modframe:out-0 | lift-L14-top:top |

Storage out-0 ports are at row 5.5 + 1.375 = 6.875. Lift tops at row 7.5 + 0.125 = 7.625. Route south from storage to lifts.

- [ ] **Step 5: Run validation + commit**

```bash
npx vitest run
git add data/schemes/unified-base.json
git commit -m "feat(scheme): add F3 RIP splitter, storage buffers, and down lifts L12-L14"
```

---

## Task 8: F1 Output Zone — Down Lift Bottoms + Output Terminals + Routing

**Files:**
- Modify: `data/schemes/unified-base.json`

- [ ] **Step 1: Add all down lift bottom machines on F1**

Match positions with top machines on F2/F3.

**From F2 (L6-L11):**

| id | type | pos.col | pos.row | floor | label |
|----|------|---------|---------|-------|-------|
| lift-L6-bot | conveyor-lift-out-bottom | (same as L6-top) | 1 | L6·铁板↓ |
| lift-L7-bot | conveyor-lift-out-bottom | (same as L7-top) | 1 | L7·铁棒↓ |
| lift-L8-bot | conveyor-lift-out-bottom | (same as L8-top) | 1 | L8·螺丝↓ |
| lift-L9-bot | conveyor-lift-out-bottom | (same as L9-top) | 1 | L9·电线↓ |
| lift-L10-bot | conveyor-lift-out-bottom | (same as L10-top) | 1 | L10·电缆↓ |
| lift-L11-bot | conveyor-lift-out-bottom | (same as L11-top) | 1 | L11·铜板↓ |

**From F3 (L12-L14):**

| id | type | pos.col | pos.row | floor | label |
|----|------|---------|---------|-------|-------|
| lift-L12-bot | conveyor-lift-out-bottom | 1.375, 7.5 | 1 | L12·RIP↓ |
| lift-L13-bot | conveyor-lift-out-bottom | 3.875, 7.5 | 1 | L13·Rotor↓ |
| lift-L14-bot | conveyor-lift-out-bottom | 6.375, 7.5 | 1 | L14·ModFrame↓ |

Note: L12-L14 are F3→F1 (skip F2). The bottom machine is floor 1, top machine is floor 3. The liftPair will connect them.

Wait — liftPairs connect bottomMachine (lower floor) to topMachine (upper floor). For F3→F1 lifts, the conveyor-lift-in-top is on F3, conveyor-lift-out-bottom is on F1. But they must have the same pos. For a 3-floor span, we need the lift to cover F1 to F3.

**Important:** Check if the system supports multi-floor lifts. Looking at the schema, LiftPair has bottomMachine and topMachine with floor numbers. There's no restriction that topMachine.floor = bottomMachine.floor + 1. So F1→F3 lifts should work.

The pos.col and pos.row must be identical between bottom and top machines.

- [ ] **Step 2: Add 10 output terminal splitters on F1**

Place in a single row at row 7.5:

| id | type | pos.col | pos.row | label | Output product |
|----|------|---------|---------|-------|---------------|
| sp-O1 | splitter | 0.5 | 7.5 | O1 Iron Plate | plate |
| sp-O2 | splitter | 1.25 | 7.5 | O2 Iron Rod | rod |
| sp-O3 | splitter | 2.0 | 7.5 | O3 Screw | screw |
| sp-O4 | splitter | 2.75 | 7.5 | O4 Wire | wire |
| sp-O5 | splitter | 3.5 | 7.5 | O5 Cable | cable |
| sp-O6 | splitter | 4.25 | 7.5 | O6 Copper Sheet | sheet |
| sp-O7 | splitter | 5.0 | 7.5 | O7 Concrete | concrete |
| sp-O8 | splitter | 5.75 | 7.5 | O8 RIP | rip |
| sp-O9 | splitter | 6.5 | 7.5 | O9 Rotor | rotor |
| sp-O10 | splitter | 7.25 | 7.5 | O10 ModFrame/SP | modframe |

Each splitter is 0.5×0.5. Gap between each: 1.25 - (0.5 + 0.5) = 0.25... wait:
sp-O1 AABB [0.5..1.0], sp-O2 [1.25..1.75] — gap 0.25 ✓
Continues with 0.75 spacing (0.5 width + 0.25 gap). Last: sp-O10 [7.25..7.75] — within 10 cols ✓

- [ ] **Step 3: Route lift bottom → output terminal belts**

Each down lift bottom machine outputs material. Route from lift port to the corresponding output terminal's in-0 port.

| Belt | fromPort | toPort | mark |
|------|----------|--------|------|
| b-L6-O1 | lift-L6-bot:bottom | sp-O1:in-0 | 1 |
| b-L7-O2 | lift-L7-bot:bottom | sp-O2:in-0 | 1 |
| b-L8-O3 | lift-L8-bot:bottom | sp-O3:in-0 | 2 |
| b-L9-O4 | lift-L9-bot:bottom | sp-O4:in-0 | 1 |
| b-L10-O5 | lift-L10-bot:bottom | sp-O5:in-0 | 1 |
| b-L11-O6 | lift-L11-bot:bottom | sp-O6:in-0 | 1 |
| b-conc-O7 | mg-concrete:out-0 | sp-O7:in-0 | 1 |
| b-L12-O8 | lift-L12-bot:bottom | sp-O8:in-0 | 1 |
| b-L13-O9 | lift-L13-bot:bottom | sp-O9:in-0 | 1 |
| b-L14-O10 | lift-L14-bot:bottom | sp-O10:in-0 | 1 |

Route each belt from lift arrival area to output terminal row. Most will be L-shaped: horizontal to align with terminal col, then vertical south to terminal.

- [ ] **Step 4: Run validation + commit**

```bash
npx vitest run
git add data/schemes/unified-base.json
git commit -m "feat(scheme): add F1 output zone with 10 single-product terminals and routing"
```

---

## Task 9: Define All Lift Pairs

**Files:**
- Modify: `data/schemes/unified-base.json`

- [ ] **Step 1: Add 14 liftPair entries**

```json
"liftPairs": [
  { "id": "lp-L1", "bottomMachine": "lift-L1-bot", "topMachine": "lift-L1-top", "mark": 2 },
  { "id": "lp-L2", "bottomMachine": "lift-L2-bot", "topMachine": "lift-L2-top", "mark": 1 },
  { "id": "lp-L3", "bottomMachine": "lift-L3-bot", "topMachine": "lift-L3-top", "mark": 1 },
  { "id": "lp-L4", "bottomMachine": "lift-L4-bot", "topMachine": "lift-L4-top", "mark": 1 },
  { "id": "lp-L5", "bottomMachine": "lift-L5-bot", "topMachine": "lift-L5-top", "mark": 1 },
  { "id": "lp-L6", "bottomMachine": "lift-L6-bot", "topMachine": "lift-L6-top", "mark": 1 },
  { "id": "lp-L7", "bottomMachine": "lift-L7-bot", "topMachine": "lift-L7-top", "mark": 1 },
  { "id": "lp-L8", "bottomMachine": "lift-L8-bot", "topMachine": "lift-L8-top", "mark": 2 },
  { "id": "lp-L9", "bottomMachine": "lift-L9-bot", "topMachine": "lift-L9-top", "mark": 1 },
  { "id": "lp-L10", "bottomMachine": "lift-L10-bot", "topMachine": "lift-L10-top", "mark": 1 },
  { "id": "lp-L11", "bottomMachine": "lift-L11-bot", "topMachine": "lift-L11-top", "mark": 1 },
  { "id": "lp-L12", "bottomMachine": "lift-L12-bot", "topMachine": "lift-L12-top", "mark": 1 },
  { "id": "lp-L13", "bottomMachine": "lift-L13-bot", "topMachine": "lift-L13-top", "mark": 1 },
  { "id": "lp-L14", "bottomMachine": "lift-L14-bot", "topMachine": "lift-L14-top", "mark": 1 }
]
```

Verify:
- L1: Mk.2 (90/min iron ingot)
- L8: Mk.2 (≤80/min screw, peak when F3 stopped)
- All others: Mk.1
- bottomMachine floor < topMachine floor for each pair
- L12-L14: bottom on F1, top on F3 (skip F2)

- [ ] **Step 2: Run validation + commit**

```bash
npx vitest run
git add data/schemes/unified-base.json
git commit -m "feat(scheme): define all 14 lift pairs"
```

---

## Task 10: Full Validation + Error Fixing

**Files:**
- Modify: `data/schemes/unified-base.json`

- [ ] **Step 1: Run full validation**

```bash
npx vitest run
```

- [ ] **Step 2: Categorize issues**

Expected:
- **R25 warns**: Output terminal splitters (O1-O10) with only 1 connected output — expected, these are endpoints
- **R2 warns**: Smelter/assembler positions not on 0.25 grid — expected per CLAUDE.md alignment rules
- **R23 warns**: Some production machine inputs may lack belt connections if routing was deferred

Must fix:
- **R1 errors**: Invalid machine types → fix type strings
- **R3 errors**: Out of bounds → fix positions
- **R7 errors**: Non-orthogonal belt segments → fix paths
- **R12 errors**: Duplicate IDs → rename
- **R13 errors**: Machine collisions → adjust positions
- **R14 errors**: Belt crosses connected machine → fix belt path
- **R15 errors**: Overlapping belt segments → fix paths
- **R16 errors**: Belt not perpendicular to port → fix last/first segment
- **R17 errors**: Belt path too long → simplify or adjust machine positions
- **R29 errors**: Isolated machines → add missing belts

- [ ] **Step 3: Fix all errors iteratively**

For each error, read the error message, identify the problematic element, and fix it. Re-run validation after each batch of fixes.

- [ ] **Step 4: Final validation pass**

```bash
npx vitest run
```

Target: 0 errors. Warnings should be only R25 (output splitter endpoints) and R2 (non-0.25 positions for smelter/assembler alignment).

- [ ] **Step 5: Commit**

```bash
git add data/schemes/unified-base.json
git commit -m "fix(scheme): resolve all validation errors in unified-base"
```

---

## Task 11: Final Review

**Files:**
- Read: `data/schemes/unified-base.json`

- [ ] **Step 1: Verify all machines present**

Count machines by type and floor:
- F1: 3 iron smelter + 2 copper smelter + 2 concrete constructor + input splitters + mergers + lift machines + output terminals
- F2: 10 constructors + ingot splitters + product splitters + lift machines
- F3: 3 assemblers + 3 storage + input splitters + RIP splitter + lift machines

- [ ] **Step 2: Verify all lifts connected**

14 lift pairs, each with matching bottom/top positions and correct floor references.

- [ ] **Step 3: Verify all products have output path**

Trace each product from production to output terminal:
1. Iron Plate: plate constructor → merger → splitter → L6 → O1 ✓
2. Iron Rod: rod constructor → merger → splitter → L7 → O2 ✓
3. Screw: screw constructor → merger → splitter → L8 → O3 ✓
4. Wire: wire constructor → merger → splitter → L9 → O4 ✓
5. Cable: cable constructor → L10 → O5 ✓
6. Copper Sheet: sheet constructor → L11 → O6 ✓
7. Concrete: concrete constructor → merger → O7 ✓
8. RIP: asm-rip → splitter → st-rip → L12 → O8 ✓
9. Rotor: asm-rotor → st-rotor → L13 → O9 ✓
10. ModFrame: asm-modframe → st-modframe → L14 → O10 ✓

- [ ] **Step 4: Run vitest one final time**

```bash
npx vitest run
```

- [ ] **Step 5: Commit with final message**

```bash
git add data/schemes/unified-base.json
git commit -m "feat(scheme): complete unified-base v2 — 3F 10×9 single-product output factory"
```
