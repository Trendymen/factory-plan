# T7 Mk5 蓝图升级实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 T6 蓝图设计文档（顶层 + 18 个 BP + README）整套复制到 T7 命名空间，按 spec 五类机械改动规则改写，原 T6 文档不动作为对照。

**Architecture:** 一次目录复制 → 逐文件应用 spec § 3 五类替换规则 → 最后 grep 聚合验收。BP 文件互相独立可并行 subagent 处理；顶层文档与 README 单独处理。

**Tech Stack:** PowerShell `Copy-Item -Recurse`、Edit 工具、Grep 工具、git commit 频繁分文件提交。

**Spec 引用:** [docs/superpowers/specs/2026-05-24-tier7-belt-upgrade-design.md](docs/superpowers/specs/2026-05-24-tier7-belt-upgrade-design.md)

---

## 文件结构

本计划不产生新代码文件，仅产生 20 个新文档（复制 + 改写）。

**复制源 → 目标**：
- `docs/superpowers/specs/2026-05-06-tier6-blueprint-design.md` → `docs/superpowers/specs/2026-05-24-tier7-blueprint-design.md`
- `docs/superpowers/specs/2026-05-06-tier6-blueprints/` （整目录 19 文件） → `docs/superpowers/specs/2026-05-24-tier7-blueprints/`

**任务依赖**：
- Task 1 必须最先完成
- Task 2-21 在 Task 1 完成后可任意顺序（subagent 模式可并行）
- Task 22 必须最后

---

## 共享替换规则速查（所有任务引用）

### 类别 1：Belt 等级字面替换（在「屋顶/总线 belt」上下文里）

| Find | Replace |
|---|---|
| `6 条 Mk4 belt` | `6 条 Mk5 belt` |
| `6 Mk4 belt` | `6 Mk5 belt` |
| `Mk4 平行 belt` | `Mk5 平行 belt` |
| `Mk4 belt 横穿` | `Mk5 belt 横穿` |
| `Mk4 belt 直通` | `Mk5 belt 直通` |
| `Mk4 直通` | `Mk5 直通` |
| `Mk4 主 belt` | `Mk5 主 belt` |
| `Mk4 收集 belt` | `Mk5 收集 belt` |
| `8 条 Mk4 belt` | `8 条 Mk5 belt` |
| `8 条 Mk4 总线` | `8 条 Mk5 总线` |
| `Mk4 belt` （独立短语，屋顶上下文）| `Mk5 belt` |
| `Mk4 (480/min)` | `Mk5 (780/min)` |
| `Mk4 容量` | `Mk5 容量` |
| `Mk4 额定 480` | `Mk5 额定 780` |

**例外（保留 Mk4 不动）**：
- 历史叙述/反例上下文（「原 Mk4 时代…」「Mk4 不够时…」）
- megabase-v3 对比段落
- spec § 3 类别 5 BP9/BP15 论证翻案段落里有意保留的 Mk4 反例

### 类别 2：容量 % 重算（按 spec § 3 类别 2 权威表）

替换形如 `X/480 = Y% Mk4` 或 `Y% Mk4` 的字眼：

| 流量 | 旧 % Mk4 | 新 % Mk5 |
|---:|---:|---:|
| 11.5 | 2.4% | 1.5% |
| 35 | 7% | 4% |
| 78 | 16% | 10% |
| 163 | 34% | 21% |
| 170 | 35% | 22% |
| 228 | 48% | 29% |
| 240 | 50% | 31% |
| 306 | 64% | 39% |
| 350 | 73% | 45% |
| 396 | 83% | 51% |
| 400.5 | 83% | 51% |
| 462 | 96% | 59% |
| 540 | 112%（溢出）| 69%（安全）|
| 570 | 119%（溢出）| 73% |
| 590 | 123%（溢出）| 76% |
| 750 | 156%（溢出）| 96% |

遇到不在表里的流量 X，按 `X / 780 = (X/7.8)% Mk5` 计算，保留 1 位小数。

### 类别 3：升级路径表里「升 Mk5」全部移除

每个 BP 文件末尾 `## Tier 升级路径` 表里的：

| Find | Replace |
|---|---|
| `矿场来料 belt 升 Mk5（XXX 超 Mk4 额定 480）` | `矿场来料 belt 已升 Mk5（780/min）` |
| `矿场来料 belt 升 Mk5/Mk6 按物料流量` | `T8/T9 时矿场来料 belt 按需拆分槽位（部分物料超 Mk5）` |
| `T9 时矿场来料 belt 升 Mk5/Mk6` | `T8/T9 时矿场来料 belt 按需拆分槽位` |
| `T9 升 Mk5；T6 临时 Mk4 也可，但物理升级位置要预留好` | `已升 Mk5；T8/T9 个别物料按需拆分槽位` |
| `T9 升 Mk5；T6 临时 Mk4 也可，物理升级位置预留好` | `已升 Mk5；T8/T9 个别物料按需拆分槽位` |
| `T9 升 Mk5+；T6 临时 Mk4 也可，物理升级位置预留好` | `已升 Mk5；T8/T9 拆分槽位（电线 ~1400 即使 Mk6 也不够）` |

### 类别 4：顶层文档独有的章节改动（见 Task 2）

### 类别 5：BP9 论证翻案 + BP15 B6 升级论证翻案（见各自 Task）

---

## Task 1: 整目录与顶层文档复制

**Files:**
- Copy: `docs/superpowers/specs/2026-05-06-tier6-blueprint-design.md` → `docs/superpowers/specs/2026-05-24-tier7-blueprint-design.md`
- Copy: `docs/superpowers/specs/2026-05-06-tier6-blueprints/` → `docs/superpowers/specs/2026-05-24-tier7-blueprints/`

- [ ] **Step 1: 复制顶层文档**

```powershell
Copy-Item "docs/superpowers/specs/2026-05-06-tier6-blueprint-design.md" "docs/superpowers/specs/2026-05-24-tier7-blueprint-design.md"
```

- [ ] **Step 2: 复制整目录**

```powershell
Copy-Item -Recurse "docs/superpowers/specs/2026-05-06-tier6-blueprints" "docs/superpowers/specs/2026-05-24-tier7-blueprints"
```

- [ ] **Step 3: 验证文件存在**

```powershell
(Get-ChildItem "docs/superpowers/specs/2026-05-24-tier7-blueprints" -File).Count
```

Expected: `19` (1 README + 18 BP 文件)

```powershell
Test-Path "docs/superpowers/specs/2026-05-24-tier7-blueprint-design.md"
```

Expected: `True`

- [ ] **Step 4: 验证原文档未动**

```bash
git status docs/superpowers/specs/2026-05-06-tier6-blueprints/
git status docs/superpowers/specs/2026-05-06-tier6-blueprint-design.md
```

Expected: 两条命令都报「无变化」（unmodified, no diff）

- [ ] **Step 5: 暂存并提交复制结果**

```bash
git add docs/superpowers/specs/2026-05-24-tier7-blueprints/ docs/superpowers/specs/2026-05-24-tier7-blueprint-design.md
git commit -m "$(cat <<'EOF'
docs(spec): 复制 T6 蓝图文档到 T7 命名空间（未改内容）

Task 1 of T7 Mk5 蓝图升级计划。整目录 + 顶层文档原样复制；
原 T6 文档保留不动作为对照。后续 task 逐文件按 spec § 3 改写。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: 改写顶层 `2026-05-24-tier7-blueprint-design.md`

**Files:**
- Modify: `docs/superpowers/specs/2026-05-24-tier7-blueprint-design.md`

此文件 ~1400 行 / ~40 处修改。分 6 步处理。

- [ ] **Step 1: 文件头加 T7 前提说明**

在文件最顶部「## 背景与上下文」**之前**插入新章节：

```markdown
## T7 升级版前提（2026-05-24）

本文档是 T6 设计文档 [2026-05-06-tier6-blueprint-design.md](2026-05-06-tier6-blueprint-design.md) 的 T7 升级版：

- **Tier 7 Bauxite Refinement milestone 已解锁**，Mk5 belt (780/min) 可用
- 所有屋顶总线 belt + 矿场来料 belt 物理升级到 **Mk5**
- **机器激活规模仍为 T6 阶段 96 台**（扩产未启动；物理建造仍按 T9 满载 250 台预留）
- 不变设计：BP9 本地 sink、8 槽位预留、TERM-A/B 拆分、机器布局、Power Switch 网络

仅 belt 等级与容量计算与 T6 版不同，其他设计决策、坐标、楼层、连接拓扑全部一致。

---
```

- [ ] **Step 2: 应用类别 1（Mk4 → Mk5 字面替换）**

用 Edit 工具，按共享规则速查里类别 1 的 Find/Replace 表 `replace_all=true` 替换。每个替换确认上下文是「屋顶/总线 belt」语境（非历史/反例）。

特别注意以下 5 处区域**必须替换**：
- 「总线 belt 设计（8 条 Mk4 槽位：6 active + 2 reserved）」标题 → `8 条 Mk5 槽位`
- 「屋顶总线层 35-40m」描述里 `6 条 Mk4 belt 横穿` → `6 条 Mk5 belt 横穿`
- 「跨集群连接拓扑」段里的 Mk4 引用
- L433 附近「总线层 35-40m，5m 厚」附近的 Mk4 → Mk5
- L797 BP-TERM 描述里的 Mk4

- [ ] **Step 3: 应用类别 2（容量 % 重算）**

按共享规则速查里类别 2 表替换所有 `Y% Mk4` 形式。重点段落：
- 「BP9 重油残渣处理」章节里 `462/min（96% Mk4）` → `462/min（59% Mk5）`、`306（64% Mk4）` → `306（39% Mk5）`、`540 = 112% Mk4` → `540 = 69% Mk5`
- 「Tier 7+ 扩容详细规划」章节里 B1-B6 流量百分比

- [ ] **Step 4: 改写「Tier 7+ 扩容详细规划」章节**

精确替换以下文本：

| 旧（原 L959-961）| 新 |
|---|---|
| `## Tier 7+ 扩容详细规划\n\n> 本章节是 **Tier 7-9 解锁后的实施参考**。Tier 6 玩家可跳过，但建造时**必须按本章预留**（总线 belt 槽位、矿场容量、BP-TERM 槽位、机器物理数量）以避免后期推倒重来。` | `## Tier 8/9 扩容详细规划\n\n> Tier 7 已是当前阶段（Mk5 belt 已升级，96 台机器激活）。本章节是 **Tier 8/9 解锁后的实施参考**。建造时**必须按本章预留**（总线 belt 槽位、矿场容量、BP-TERM 槽位、机器物理数量）以避免后期推倒重来。` |

在「### 1. 现有 BP1-BP15 的逐 Tier 激活时间线」表格后增加一行说明：

```markdown
> **当前阶段定位**：T7 milestone 已解锁但激活数仍为 T6 列（96 台）。表中 T7/T8/T9 列代表玩家后续扩产步骤。
```

- [ ] **Step 5: 改写「2. 总线 belt 全开后的物料分配」表格**

把表格里所有 `→ Mk5 升级` 或 `Mk5 升级` 字眼替换：

| Find | Replace |
|---|---|
| `→ Mk5 升级` | `→ ✓（Mk5 已升）` |
| `Mk5 升级` | `✓（Mk5 已升）` |
| `B2 → Mk5 升级` | `B2 ✓（Mk5 已升级，96% 容量警告但不溢出）` |

把 B3 行 T9 列从 `同左` 改为 `**B3 必须拆为 B3a + B3b**（电线 ~1400/min 即使 Mk6 也不够）`：

| Find | Replace |
|---|---|
| `| **B3** \| 钢管/钢梁/电线 → C6 \| 钢管/电线流量翻倍 \| → Mk5 升级 \| 同左 \|` | `| **B3** \| 钢管/钢梁/电线 → C6 \| 钢管/电线流量翻倍 \| ✓（Mk5 已升）\| **拆为 B3a + B3b**（~1400 超 Mk6）\|` |

把 B5 行 T9 列 `拆为 **B5a + B5b**（如不升 Mk5）` 改为 `Mk5 充裕（554/780 = 71%）` ：

| Find | Replace |
|---|---|
| `| **B5** \| 26 mainNode → BP-TERM \| — \| 部分 mainNode 流量倍增 \| 拆为 **B5a + B5b**（如不升 Mk5） \|` | `| **B5** \| 26 mainNode → BP-TERM \| — \| 部分 mainNode 流量倍增 \| ✓ Mk5 充裕（554/780 = 71%）\|` |

- [ ] **Step 6: 改写「9. 已知 Tier 7+ 路由痛点与对策」**

删除 B2 升 Mk5 行：

| Find | Replace |
|---|---|
| `| **B2 螺丝总线 T9 时 ~750/min 超 Mk4** \| T8 起 B2 升级 Mk5（780/min 容量） \|` | `` （整行删除）|

新增 B3 拆分行（插入到 B2 行原位置）：

```markdown
| **B3 电线总线 T9 时 ~1400/min 即使 Mk6 也不够** | 物理建造时 B3 槽位预留拆分位置（B3a + B3b 共 2 槽，占用 B7/B8 reserved 中的 1 个或新增槽位）|
```

- [ ] **Step 7: 改写「BP9 重油残渣处理」章节**

定位 L922 起的 `## 重油残渣处理` 章节。**保留**「BP9 内部本地 coke + 本地 sink」的设计决定，但**改写「为什么不上 B6」论证**：

| Find | Replace |
|---|---|
| `### 为什么不上 B6 总线` 章节下的 Mk4 论证段落 | 改写为「Mk5 物理上能承载（540/780 = 69%），但保留本地 sink 留出 B6 头部空间给 T8/T9 扩产」式表述 |

具体精确替换由实施时读取该章节后定位。

- [ ] **Step 8: 验收 grep**

```bash
grep -c "Mk4" docs/superpowers/specs/2026-05-24-tier7-blueprint-design.md
```

Expected: ≤ 5（剩余应都是历史对比、反例、与原 T6 文档对照的语境）。逐一人工确认每处保留合理。

```bash
grep -n "Mk5" docs/superpowers/specs/2026-05-24-tier7-blueprint-design.md | wc -l
```

Expected: ≥ 30（新增的 Mk5 引用应该明显多于残留 Mk4）

- [ ] **Step 9: 提交**

```bash
git add docs/superpowers/specs/2026-05-24-tier7-blueprint-design.md
git commit -m "$(cat <<'EOF'
docs(spec): T7 顶层设计文档 — 五类机械改动应用

Task 2 of T7 Mk5 蓝图升级计划。Mk4→Mk5 字面替换、容量 % 重算、
Tier 7+ 扩容章节改名为 Tier 8/9、B3/B5 升级路径表更新（B5 拆分预案
取消、B3 仍需拆分）、BP9 残渣处理论证翻案。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: 改写 `2026-05-24-tier7-blueprints/README.md`

**Files:**
- Modify: `docs/superpowers/specs/2026-05-24-tier7-blueprints/README.md`

- [ ] **Step 1: 在文件顶部加 T7 升级版说明**

在第 1-2 行（`# Tier 6 蓝图施工手册` 标题之后）插入：

```markdown
> **T7 升级版**：本目录是 [2026-05-06-tier6-blueprints/](../2026-05-06-tier6-blueprints/) 的 T7 副本，前提：玩家已解锁 T7 Bauxite Refinement，所有屋顶/矿场 belt 升级到 Mk5 (780/min)，机器激活规模仍为 T6 阶段 96 台。原 T6 文档保留对照。
```

- [ ] **Step 2: 应用类别 1（Mk4 → Mk5）**

替换所有屋顶/总线相关 `Mk4` → `Mk5`。文件较短，扫一遍人工确认上下文。

- [ ] **Step 3: 验收**

```bash
grep -c "Mk4" docs/superpowers/specs/2026-05-24-tier7-blueprints/README.md
```

Expected: ≤ 2

- [ ] **Step 4: 提交**

```bash
git add docs/superpowers/specs/2026-05-24-tier7-blueprints/README.md
git commit -m "docs(spec): T7 蓝图目录 README 升 Mk5

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4-18: BP01-BP15 逐文件改写

**所有 BP 任务共享模板**（参数化文件路径），每个 BP 任务 4-5 步骤：

1. **Read 文件**
2. **应用类别 1 全局替换**（Mk4 → Mk5 in 屋顶/总线/矿场 belt 上下文）
3. **应用类别 2 容量 % 重算**（按权威表替换 `Y% Mk4` → `Z% Mk5`）
4. **应用类别 3 Tier 升级路径表清理**（移除「升 Mk5」字眼）
5. **应用类别 5 论证翻案**（仅 BP09、BP15 适用）
6. **grep 验收**：`grep -c "Mk4"` ≤ 2
7. **commit**

每个 BP 任务单独 commit。下面只展开 BP01、BP09、BP15 三个有特殊处理的任务，其余 12 个按同模板（仅替换文件路径）。

---

### Task 4: BP01-iron-ingot.md

**Files:**
- Modify: `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP01-iron-ingot.md`

- [ ] **Step 1: 应用类别 1（Mk4 → Mk5）**

定位以下 5 处替换（按文件原行号 L44, L140, L167, L177, L187 大致定位）：

| Find | Replace |
|---|---|
| `B1-B6 6 条 Mk4 直通` | `B1-B6 6 条 Mk5 直通` |
| `B1-B6：6 条 Mk4 belt 直通，BP1 不接入总线` | `B1-B6：6 条 Mk5 belt 直通，BP1 不接入总线` |
| `铺 6 条 Mk4 平行 belt` | `铺 6 条 Mk5 平行 belt` |

- [ ] **Step 2: 应用类别 3（清理 Tier 升级路径表）**

L177 行：

| Find | Replace |
|---|---|
| `矿场来料 belt 升 Mk5（1140 超 Mk4 额定 480）` | `矿场来料 belt 已升 Mk5（780/min）；1140 超 Mk5，T8/T9 需拆分槽位` |

L187 行（验证 checklist 项）：

| Find | Replace |
|---|---|
| `矿场来料 belt 容量按 1140 预留（T9 升 Mk5；T6 临时 Mk4 也可，但物理升级位置要预留好）` | `矿场来料 belt 已升 Mk5（780/min）；1140 超 Mk5，T8/T9 时拆分为 2 条 Mk5 槽位` |

- [ ] **Step 3: 验收 + 提交**

```bash
grep -c "Mk4" docs/superpowers/specs/2026-05-24-tier7-blueprints/BP01-iron-ingot.md
```

Expected: ≤ 2

```bash
git add docs/superpowers/specs/2026-05-24-tier7-blueprints/BP01-iron-ingot.md
git commit -m "docs(spec): BP01 升 Mk5 + 矿场 belt 拆分路径更新

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: BP02-iron-base.md

**Files:**
- Modify: `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP02-iron-base.md`

- [ ] **Step 1: 类别 1（Mk4 → Mk5）**

替换屋顶 belt 描述里 `Mk4` → `Mk5`（L259、L328 等位置约 4 处）。

- [ ] **Step 2: 类别 3（清理升级路径）**

L343、L368 行：

| Find | Replace |
|---|---|
| `C1 集群升级矿场 Mk5 belt` | `（矿场 belt 已 Mk5；T8/T9 需拆分槽位）` |
| `矿场来料 belt 容量按 T9 满载预留（T9 升 Mk5；T6 临时 Mk4 也可，但物理升级位置要预留好）` | `矿场来料 belt 已升 Mk5；T8/T9 满载需按物料拆分槽位` |

- [ ] **Step 3: 验收 + 提交**

```bash
grep -c "Mk4" docs/superpowers/specs/2026-05-24-tier7-blueprints/BP02-iron-base.md
```

Expected: ≤ 2

```bash
git add docs/superpowers/specs/2026-05-24-tier7-blueprints/BP02-iron-base.md
git commit -m "docs(spec): BP02 升 Mk5

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: BP03-screw.md

**Files:**
- Modify: `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP03-screw.md`

- [ ] **Step 1: 类别 1（Mk4 → Mk5）**

L180、L181 附近替换屋顶 belt 描述里 `Mk4` → `Mk5`。

- [ ] **Step 2: 类别 2（容量 % 重算）**

L181、L209、L210：

| Find | Replace |
|---|---|
| `590 / 60 < 1 Mk4 容量` | `590 / 60 < 1 Mk5 容量（76%）` |
| `B1/B2 流量在 Mk4 容量内（350 < 480 ✓，240 + 其他 = 400.5 < 480 ✓）` | `B1/B2 流量在 Mk5 容量内（350 < 780 ✓，240 + 其他 = 400.5 < 780 ✓）` |

- [ ] **Step 3: 类别 3（升级路径）**

L193、L210：

| Find | Replace |
|---|---|
| `T9 复算（~1828/min 需 Mk5）` | `T9 复算（~1828/min 即使 Mk6 也不够，需拆分 3 条 Mk5 槽位或 2 条 Mk6）` |
| `铁棒来料 belt 容量按 T9 ~457/min 预留（T9 升 Mk5；T6 阶段 Mk4 即可）` | `铁棒来料 belt 已 Mk5（780/min）；T9 ~457/min 在 Mk5 容量内（59%）` |

- [ ] **Step 4: 验收 + 提交**

```bash
grep -c "Mk4" docs/superpowers/specs/2026-05-24-tier7-blueprints/BP03-screw.md
```

Expected: ≤ 2

```bash
git add docs/superpowers/specs/2026-05-24-tier7-blueprints/BP03-screw.md
git commit -m "docs(spec): BP03 升 Mk5 + 螺丝供料拆分路径更新

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: BP04-steel-ingot.md

**Files:**
- Modify: `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP04-steel-ingot.md`

- [ ] **Step 1: 类别 1（Mk4 → Mk5）**

L137、L140 行：

| Find | Replace |
|---|---|
| `row=2 横向 Mk4 主 belt 收钢锭` | `row=2 横向 Mk5 主 belt 收钢锭` |
| `row=2 横向 Mk4 收集 belt + lift-out-top` | `row=2 横向 Mk5 收集 belt + lift-out-top` |

- [ ] **Step 2: 类别 3（升级路径）**

L154、L164：

| Find | Replace |
|---|---|
| `矿场来料 belt 升 Mk5（580/min）` | `矿场来料 belt 已升 Mk5（580/min < 780 ✓）` |
| `矿场容量预留 Mk5（铁矿 580 / 煤 580，T9 上限）` | `矿场来料 belt 已升 Mk5（铁矿 580 / 煤 580 < 780 ✓）` |

- [ ] **Step 3: 验收 + 提交**

```bash
grep -c "Mk4" docs/superpowers/specs/2026-05-24-tier7-blueprints/BP04-steel-ingot.md
```

Expected: ≤ 2

```bash
git add docs/superpowers/specs/2026-05-24-tier7-blueprints/BP04-steel-ingot.md
git commit -m "docs(spec): BP04 升 Mk5

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: BP05-steel-beam-pipe.md

**Files:**
- Modify: `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP05-steel-beam-pipe.md`

- [ ] **Step 1: 类别 1（Mk4 → Mk5）**

L139 附近：

| Find | Replace |
|---|---|
| `铺 6 条 Mk4 平行 belt（B1 row=0.5 ... B6 row=4.5）` | `铺 6 条 Mk5 平行 belt（B1 row=0.5 ... B6 row=4.5）` |

- [ ] **Step 2: 类别 2（容量 %）**

L158：

| Find | Replace |
|---|---|
| `B3/B5 流量在 Mk4 容量内（B3 163 < 480 ✓ / B5 35 < 480 ✓）` | `B3/B5 流量在 Mk5 容量内（B3 163 < 780 = 21% ✓ / B5 35 < 780 = 4% ✓）` |

- [ ] **Step 3: 验收 + 提交**

```bash
grep -c "Mk4" docs/superpowers/specs/2026-05-24-tier7-blueprints/BP05-steel-beam-pipe.md
```

Expected: ≤ 2

```bash
git add docs/superpowers/specs/2026-05-24-tier7-blueprints/BP05-steel-beam-pipe.md
git commit -m "docs(spec): BP05 升 Mk5

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: BP06-copper-smelt.md

**Files:**
- Modify: `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP06-copper-smelt.md`

- [ ] **Step 1: 类别 1（Mk4 → Mk5）**

L166 行：

| Find | Replace |
|---|---|
| `6 Mk4 belt + B6 merger` | `6 Mk5 belt + B6 merger` |

- [ ] **Step 2: 类别 3（升级路径）**

L176：

| Find | Replace |
|---|---|
| `矿场来料 belt 升 Mk5/Mk6` | `矿场来料 belt 已 Mk5；T8/T9 需个别物料拆分（铜矿 1200 接近 Mk6 上限）` |

- [ ] **Step 3: 验收 + 提交**

```bash
grep -c "Mk4" docs/superpowers/specs/2026-05-24-tier7-blueprints/BP06-copper-smelt.md
```

Expected: ≤ 2

```bash
git add docs/superpowers/specs/2026-05-24-tier7-blueprints/BP06-copper-smelt.md
git commit -m "docs(spec): BP06 升 Mk5

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 10: BP07-wire-cable.md

**Files:**
- Modify: `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP07-wire-cable.md`

此 BP 的 B3 电线总线是 T8/T9 的最大瓶颈（即使 Mk6 也不够）。**重点更新 L280**。

- [ ] **Step 1: 类别 1（Mk4 → Mk5）**

L238 行：

| Find | Replace |
|---|---|
| `铺 6 条 Mk4 平行 belt（B1-B6）` | `铺 6 条 Mk5 平行 belt（B1-B6）` |

- [ ] **Step 2: 类别 3（升级路径，含 B3 特殊处理）**

L248、L280、L282：

| Find | Replace |
|---|---|
| `T9 全部 4 个 Network × 3 实例 ON → 46 台超频调到 T9 配比；矿场来料 belt 升 Mk5` | `T9 全部 4 个 Network × 3 实例 ON → 46 台超频调到 T9 配比；矿场来料 belt 已 Mk5（电线物料 T9 ~1400 需拆 B3a/B3b）` |
| `B3 流量 T9 ≈ 1400 < Mk5 780？需 Mk6（或拆分到多 B 槽），T6 阶段 170 < 480 ✓` | `B3 流量 T9 ≈ 1400 即使 Mk6 (1200) 也不够，**必须拆为 B3a + B3b 双 Mk5 槽位**（每槽 ~700 = 90%）。当前 T7 阶段 170 < 780 = 22% ✓` |
| `矿场来料 belt 容量按 T9 满载预留（T9 升 Mk5+；T6 临时 Mk4 也可，物理升级位置预留好）` | `矿场来料 belt 已 Mk5；T8/T9 满载需按物料拆分槽位（电线即使 Mk6 也不够，必拆 B3a/B3b）` |

- [ ] **Step 3: 验收 + 提交**

```bash
grep -c "Mk4" docs/superpowers/specs/2026-05-24-tier7-blueprints/BP07-wire-cable.md
```

Expected: ≤ 3（B3 拆分说明里可能保留 Mk4 历史引用）

```bash
git add docs/superpowers/specs/2026-05-24-tier7-blueprints/BP07-wire-cable.md
git commit -m "docs(spec): BP07 升 Mk5 + B3 电线拆分路径明确化

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 11: BP08-circuit-board.md

**Files:**
- Modify: `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP08-circuit-board.md`

- [ ] **Step 1: 类别 1（Mk4 → Mk5）**

L171 行：

| Find | Replace |
|---|---|
| `铺 6 条 Mk4 平行 belt（B1 row=0.5 ... B6 row=4.5），B4 上**先 smart-split（filter=塑料 55）后 merger**` | `铺 6 条 Mk5 平行 belt（B1 row=0.5 ... B6 row=4.5），B4 上**先 smart-split（filter=塑料 55）后 merger**` |

- [ ] **Step 2: 类别 3（升级路径）**

L187：

| Find | Replace |
|---|---|
| `铜板/塑料来料 belt 升 Mk5（铜板 175.2、塑料 350.4 均超 Mk4 480 安全余量但塑料接近上限，必要时升 Mk5）` | `铜板/塑料来料 belt 已 Mk5（铜板 175.2、塑料 350.4 均 < Mk5 780 = 22%/45% ✓）` |

- [ ] **Step 3: 验收 + 提交**

```bash
grep -c "Mk4" docs/superpowers/specs/2026-05-24-tier7-blueprints/BP08-circuit-board.md
```

Expected: ≤ 2

```bash
git add docs/superpowers/specs/2026-05-24-tier7-blueprints/BP08-circuit-board.md
git commit -m "docs(spec): BP08 升 Mk5

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 12: BP09-plastic-rubber.md（**特殊：论证翻案**）

**Files:**
- Modify: `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP09-plastic-rubber.md`

此文件除了机械替换，**核心是 L33、L267 的「不上 B6」论证翻案**：原表述「Mk4 几近溢出」是被迫；新表述「Mk5 物理可承载但保留头部空间给 T8/T9」是主动选择。

- [ ] **Step 1: 改写 L33 的「为什么不上 B6」论证**

| Find（原 L33 整段）| Replace |
|---|---|
| `> **为什么不上 B6**：石油焦上 B6 会让 BP10→BP15 段达 462/min（96% Mk4），几乎溢出；就地 sink 让 B6 流量保持 306（64% Mk4）安全水平。` | `> **为什么保留本地 sink（即使 Mk5 物理可上 B6）**：石油焦上 B6 在 T7 阶段 462/min = 59% Mk5（780/min），物理上完全可承载；但本设计**主动保留本地 sink** 让 B6 维持 306/min = 39% Mk5，给 T8/T9 扩产时 BP10→BP15 段可能达 570+/min 留出头部空间。` |

- [ ] **Step 2: 改写 L267 的容量论证**

| Find | Replace |
|---|---|
| `即使单实例 234 上 B6 也会让 BP10→BP15 段流量从 306 → 540（112% Mk4，溢出）` | `单实例 234 上 B6 让 BP10→BP15 段流量从 306 → 540 = 69% Mk5（Mk5 时代物理上安全），但仍保留本地 sink 以备 T8/T9 扩产` |

- [ ] **Step 3: 类别 1（Mk4 → Mk5）剩余替换**

L219 行：

| Find | Replace |
|---|---|
| `Mk1 pipe 300/min` | `Mk1 pipe 300/min`（**不动**——这是 pipe 不是 belt）|

主体屋顶 belt 描述里的 Mk4 → Mk5 按通用规则替换。

- [ ] **Step 4: 类别 3（升级路径）**

L244 行：

| Find | Replace |
|---|---|
| `油田 pipe 升 Mk2 应对每实例满载` | （不动，pipe 等级 Mk1→Mk2 与 belt 无关）|

- [ ] **Step 5: 验收 + 提交**

```bash
grep -c "Mk4" docs/superpowers/specs/2026-05-24-tier7-blueprints/BP09-plastic-rubber.md
```

Expected: ≤ 2

人工抽查 L33、L267 论证语气是否从「被迫」变成「主动」。

```bash
git add docs/superpowers/specs/2026-05-24-tier7-blueprints/BP09-plastic-rubber.md
git commit -m "docs(spec): BP09 升 Mk5 + 石油焦不上 B6 论证翻案

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 13: BP10-quartz-quickwire-concrete.md

**Files:**
- Modify: `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP10-quartz-quickwire-concrete.md`

- [ ] **Step 1: 类别 1（Mk4 → Mk5）**

L198 行：

| Find | Replace |
|---|---|
| `铺 6 条 Mk4 平行 belt + 4 merger + smart splitter` | `铺 6 条 Mk5 平行 belt + 4 merger + smart splitter` |

- [ ] **Step 2: 类别 3（升级路径）**

L208、L234：

| Find | Replace |
|---|---|
| `矿场来料 belt 升 Mk5/Mk6 按物料流量` | `矿场来料 belt 已 Mk5；T8/T9 个别物料拆分（硅土 ~660 < 780 ✓）` |
| `矿场来料 belt 容量按 T9 流量预留（T9 升 Mk5/Mk6；T6 临时 Mk4 可，物理升级位置预留好）` | `矿场来料 belt 已 Mk5；T8/T9 部分物料拆分槽位（硅土最高 ~660 < 780 ✓）` |

- [ ] **Step 3: 验收 + 提交**

```bash
grep -c "Mk4" docs/superpowers/specs/2026-05-24-tier7-blueprints/BP10-quartz-quickwire-concrete.md
```

Expected: ≤ 2

```bash
git add docs/superpowers/specs/2026-05-24-tier7-blueprints/BP10-quartz-quickwire-concrete.md
git commit -m "docs(spec): BP10 升 Mk5

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 14: BP11-sam.md

**Files:**
- Modify: `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP11-sam.md`

- [ ] **Step 1: 类别 1（Mk4 → Mk5）**

按通用规则替换屋顶 belt 描述里的 Mk4。

- [ ] **Step 2: 验收 + 提交**

```bash
grep -c "Mk4" docs/superpowers/specs/2026-05-24-tier7-blueprints/BP11-sam.md
```

Expected: ≤ 2

```bash
git add docs/superpowers/specs/2026-05-24-tier7-blueprints/BP11-sam.md
git commit -m "docs(spec): BP11 升 Mk5

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 15: BP12-rotor-stator-motor.md

**Files:**
- Modify: `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP12-rotor-stator-motor.md`

- [ ] **Step 1: 类别 1（Mk4 → Mk5）**

L176 行：

| Find | Replace |
|---|---|
| `铺 6 条 Mk4 平行 belt（B1 row=0.5 ... B6 row=4.5）` | `铺 6 条 Mk5 平行 belt（B1 row=0.5 ... B6 row=4.5）` |

- [ ] **Step 2: 验收 + 提交**

```bash
grep -c "Mk4" docs/superpowers/specs/2026-05-24-tier7-blueprints/BP12-rotor-stator-motor.md
```

Expected: ≤ 2

```bash
git add docs/superpowers/specs/2026-05-24-tier7-blueprints/BP12-rotor-stator-motor.md
git commit -m "docs(spec): BP12 升 Mk5

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 16: BP13-frame-encased-beam.md

**Files:**
- Modify: `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP13-frame-encased-beam.md`

- [ ] **Step 1: 类别 1（Mk4 → Mk5）**

按通用规则替换屋顶 belt 描述里的 Mk4。

- [ ] **Step 2: 验收 + 提交**

```bash
grep -c "Mk4" docs/superpowers/specs/2026-05-24-tier7-blueprints/BP13-frame-encased-beam.md
```

Expected: ≤ 2

```bash
git add docs/superpowers/specs/2026-05-24-tier7-blueprints/BP13-frame-encased-beam.md
git commit -m "docs(spec): BP13 升 Mk5

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 17: BP14-hmf-computer.md

**Files:**
- Modify: `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP14-hmf-computer.md`

- [ ] **Step 1: 类别 1（Mk4 → Mk5）**

L299 行：

| Find | Replace |
|---|---|
| `6 条 Mk4 直通 belt + 3 splitter (B2/B3/B4) + 1 merger (B5)` | `6 条 Mk5 直通 belt + 3 splitter (B2/B3/B4) + 1 merger (B5)` |

- [ ] **Step 2: 类别 3（B4 程序分流器容量预留更新）**

L311、L338：

| Find | Replace |
|---|---|
| `T9 时 B4 来料升级：电路板 50 / 线缆 100 / 塑料 250 — 屋顶 B4 程序分流器流量上限需按 Mk5 (780/min) 预留` | `B4 已 Mk5；T9 时 B4 来料：电路板 50 / 线缆 100 / 塑料 250 = 400/min = 51% Mk5 ✓` |
| `B4 程序分流器分配 CB+Cable+Plastic（T9 上限 50+100+250=400/min，Mk5 belt 容量预留）` | `B4 已 Mk5（780/min）；程序分流器分配 CB+Cable+Plastic 上限 400/min = 51% Mk5 ✓` |

- [ ] **Step 3: 验收 + 提交**

```bash
grep -c "Mk4" docs/superpowers/specs/2026-05-24-tier7-blueprints/BP14-hmf-computer.md
```

Expected: ≤ 2

```bash
git add docs/superpowers/specs/2026-05-24-tier7-blueprints/BP14-hmf-computer.md
git commit -m "docs(spec): BP14 升 Mk5

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Task 18: BP15-crystal-osc-hsc.md（**特殊：B6 升级翻案**）

**Files:**
- Modify: `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP15-crystal-osc-hsc.md`

此 BP 文件多处提到「T9 B6 需 Mk5」。现在 Mk5 已是 T7 起点，所有 T9 升 Mk5 论证翻成「Mk5 已够」。**注意 L49、L310-311、L321、L340、L349 都需精确修改**。

- [ ] **Step 1: 类别 1（Mk4 → Mk5）**

L61、L310 行：

| Find | Replace |
|---|---|
| `B1-B6 6 条 Mk4 belt + splitter/merger` | `B1-B6 6 条 Mk5 belt + splitter/merger` |
| `每实例 6 条 Mk4 belt 直通 + B2/B4/B6 splitter + B5 merger` | `每实例 6 条 Mk5 belt 直通 + B2/B4/B6 splitter + B5 merger` |

- [ ] **Step 2: 类别 5 + 类别 3 — 翻案 B6 升级路径论证**

L49 警告语：

| Find | Replace |
|---|---|
| `> ⚠ T9 B6 上 BP15 取 492/min，需要 Mk5 (780)；T6 时仅 228 可临时 Mk4 (480)。物理 belt 升级位置一次预留好。` | `> ⚠ B6 已 Mk5：T7 现在 228 = 29% Mk5 ✓；T9 满载 492/min = 63% Mk5 ✓。B6 在 BP15 段全 Tier 周期内容量充裕。` |

L311 行：

| Find | Replace |
|---|---|
| `总线 belt 升级预留：B6 物理 Mk4 即可（T6 取 228 ≤ 480），但升级位置预留 Mk5（T9 取 492 > 480）` | `B6 已 Mk5（780/min）：T7 取 228 = 29% / T9 取 492 = 63% 均充裕，无需进一步升级` |

L321 行：

| Find | Replace |
|---|---|
| `矿场 → BP10 → B6 belt 升 Mk5（492 超 Mk4 480）` | `B6 已 Mk5；T9 取 492 = 63% Mk5 ✓` |

L340 行（容量分段说明）：

| Find | Replace |
|---|---|
| `T6 时 B6 BP10 → BP15 段 = 306 (Mk4 64% ✓)；T9 时 = 570 → 需 **Mk5 belt** (73% Mk5 780)。BP15 → BP-TERM 段 = 78。` | `T7 时 B6 BP10 → BP15 段 = 306 = 39% Mk5 ✓；T9 时 = 570 = 73% Mk5 ✓。BP15 → BP-TERM 段 = 78 = 10% Mk5 ✓。` |

L348、L349 验收项：

| Find | Replace |
|---|---|
| `B5 merger 注入路径一次接到 3 实例 lift-out-top（T9 总 11.5/min ≤ 480 Mk4 ✓）` | `B5 merger 注入路径一次接到 3 实例 lift-out-top（T9 总 11.5/min = 1.5% Mk5 ✓）` |
| `B6 流量分段：T6 BP10→BP15 段 306 ≤ 480 Mk4 ✓；**T9 升 Mk5 (570 ≤ 780)**` | `B6 流量分段：T7 BP10→BP15 段 306 = 39% Mk5 ✓；T9 段 570 = 73% Mk5 ✓（已 Mk5 不需进一步升级）` |

- [ ] **Step 3: 验收 + 提交**

```bash
grep -c "Mk4" docs/superpowers/specs/2026-05-24-tier7-blueprints/BP15-crystal-osc-hsc.md
```

Expected: ≤ 2

人工抽查：L49、L340 不再有「物理预留升级位置」语气。

```bash
git add docs/superpowers/specs/2026-05-24-tier7-blueprints/BP15-crystal-osc-hsc.md
git commit -m "docs(spec): BP15 升 Mk5 + B6 升级路径翻案

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 19: BP-BUS-FILLER.md

**Files:**
- Modify: `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP-BUS-FILLER.md`

- [ ] **Step 1: 类别 1（Mk4 → Mk5）**

L23、L64 行：

| Find | Replace |
|---|---|
| `B1-B6 6 条 Mk4 belt 平行直通` | `B1-B6 6 条 Mk5 belt 平行直通` |
| `铺 6 条 Mk4 belt 平行（B1 row=0.5 → B6 row=4.5，间距 8m）` | `铺 6 条 Mk5 belt 平行（B1 row=0.5 → B6 row=4.5，间距 8m）` |

- [ ] **Step 2: 验收 + 提交**

```bash
grep -c "Mk4" docs/superpowers/specs/2026-05-24-tier7-blueprints/BP-BUS-FILLER.md
```

Expected: ≤ 2

```bash
git add docs/superpowers/specs/2026-05-24-tier7-blueprints/BP-BUS-FILLER.md
git commit -m "docs(spec): BP-BUS-FILLER 升 Mk5

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 20: BP-TERM-A.md

**Files:**
- Modify: `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP-TERM-A.md`

- [ ] **Step 1: 类别 1 + 类别 3（Mk4 → Mk5，单 Uploader 入口容量更新）**

L42 行：

| Find | Replace |
|---|---|
| `Tier 7+ 流量翻 25x，单 Uploader 入口 Mk5 容量 780/min 可能不够（电线 1455 超）→ **T7+ 时拆为 2 个 Uploader 并联**（每个吃 727）。` | `T8/T9 流量翻 25x，单 Uploader 入口 Mk5 容量 780/min 可能不够（电线 1455 超）→ **T8/T9 时拆为 2 个 Uploader 并联**（每个吃 727 = 93% Mk5）。` |

- [ ] **Step 2: 验收 + 提交**

```bash
grep -c "Mk4" docs/superpowers/specs/2026-05-24-tier7-blueprints/BP-TERM-A.md
```

Expected: ≤ 2

```bash
git add docs/superpowers/specs/2026-05-24-tier7-blueprints/BP-TERM-A.md
git commit -m "docs(spec): BP-TERM-A 升 Mk5 + Uploader 拆分时机更新

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 21: BP-TERM-B.md

**Files:**
- Modify: `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP-TERM-B.md`

- [ ] **Step 1: 类别 1 + 类别 3**

L51、L187 行：

| Find | Replace |
|---|---|
| `Tier 7+ 时硅土 + 快速线 流量极大，需要拆为 2-3 个 Uploader 并联（每个吃 < 780 Mk5 容量）。` | `T8/T9 时硅土 + 快速线 流量极大，需要拆为 2-3 个 Uploader 并联（每个吃 < 780 Mk5 容量）。` |
| `所有总线 belt 升 Mk5/Mk6` | `部分总线 belt 需 Mk6 或拆分（B3 电线 ~1400 即使 Mk6 也不够，必拆 B3a/B3b）` |

- [ ] **Step 2: 验收 + 提交**

```bash
grep -c "Mk4" docs/superpowers/specs/2026-05-24-tier7-blueprints/BP-TERM-B.md
```

Expected: ≤ 2

```bash
git add docs/superpowers/specs/2026-05-24-tier7-blueprints/BP-TERM-B.md
git commit -m "docs(spec): BP-TERM-B 升 Mk5

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 22: 聚合验收 + 总结提交

**Files:**
- No file modifications (verification only, optional summary commit)

- [ ] **Step 1: 聚合 grep Mk4 残留**

```bash
grep -rn "Mk4" docs/superpowers/specs/2026-05-24-tier7-blueprints/ docs/superpowers/specs/2026-05-24-tier7-blueprint-design.md
```

Expected: 总数 ≤ 30（包含历史对比/反例上下文的合理保留）。逐一人工浏览每处残留，确认上下文合理。

- [ ] **Step 2: 抽样核验容量 %**

```bash
grep -n "% Mk5" docs/superpowers/specs/2026-05-24-tier7-blueprints/BP09-plastic-rubber.md docs/superpowers/specs/2026-05-24-tier7-blueprints/BP15-crystal-osc-hsc.md
```

抽取 5-10 处，人工验证：`流量 / 780 = % Mk5` 算术正确。

- [ ] **Step 3: 确认原 T6 文件未动**

```bash
git log --oneline -- docs/superpowers/specs/2026-05-06-tier6-blueprints/ docs/superpowers/specs/2026-05-06-tier6-blueprint-design.md
```

Expected: 仅显示历史提交，无本次 T7 升级相关 commit。

- [ ] **Step 4: 验证文件总数**

```powershell
(Get-ChildItem "docs/superpowers/specs/2026-05-24-tier7-blueprints" -File).Count
```

Expected: `19`

- [ ] **Step 5: （可选）写入升级 changelog 总结**

如需在 spec 文档加 changelog 节，编辑 `docs/superpowers/specs/2026-05-24-tier7-belt-upgrade-design.md`，在文末追加：

```markdown
---

## 实施完成记录（2026-05-24 完成）

- Task 1-21 全部完成，22 个 commit
- 新文件夹 19 文件 + 顶层文档 1 文件 = 20 个新文档
- 原 T6 文件夹/顶层文档完全未动
- Mk4 残留共 N 处（全部为历史对比/反例语境）
```

```bash
git add docs/superpowers/specs/2026-05-24-tier7-belt-upgrade-design.md
git commit -m "docs(spec): T7 升级实施完成记录

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## 自审记录（plan-writing self-review）

**1. Spec coverage**：
- ✓ Spec § 1 前提与定位 → Task 2 Step 1 写入新顶层文档头
- ✓ Spec § 2 文件映射 → Task 1 复制操作
- ✓ Spec § 3 类别 1-6 → Task 2-21 各步骤
- ✓ Spec § 4 关键流量重算 → Task 12（BP09）/ Task 18（BP15）特殊处理，其余 BP 套用类别 2 表
- ✓ Spec § 5 实施顺序 → Task 编号顺序与之一致
- ✓ Spec § 6 验收 → Task 22

**2. Placeholder 扫描**：无 TBD/TODO；每个 task 都有具体 Find/Replace 文本或精确步骤。

**3. 类型/字段一致性**：所有任务使用一致的「类别 1-5」分类、一致的容量 % 表数值、一致的 commit 消息格式。

**4. 风险点**：
- 类别 1 全局替换可能误改非屋顶 belt 上下文里的 Mk4 引用（如 megabase-v3 对比段、历史叙述）。每个 task 的 grep 验收 ≤ 2 残留作为安全网。
- BP09/BP15 论证翻案是最非机械的部分，需人工抽查语气是否从「被迫」翻成「主动」。Task 12/18 中明确标注此点。
