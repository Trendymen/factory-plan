# Multi-Terminal Megabase v3 — 12 楼层全终端重构

## 背景与上下文

### 来源

- **源数据**：根目录 `333`（Satisfactory Calculator 导出的 cytoscape JSON）。27 生产节点 + **15 个 mainNode 终端产物** + 84 条流量边
- **v1 归档**：`data/schemes/multi-terminal-megabase-v1.json` — 作为参考保留
- **v2 失败**：`data/schemes/multi-terminal-megabase-v2.json` — 8 楼层方案，只接了 5 个终端到 8F 合流，其余 10 个当成纯中间产物消耗，不符合 333 "所有 mainNode 皆为终端产出" 的本意。**本次重构将彻底删除 v2 及其附属文件**。

### 失败根因

v2 的设计错误地把 plate/rod/beam/pipe/screw/concrete/RIP/rotor/stator/mframe/EIB 视为"中间产物"，只接了 5 个 mainNode 的终端 lift（wire/cable/sheet/motor/HMF）。这违反 333 的核心要求：**所有 15 个 mainNode 都必须作为终端流入最终仓储**。

## 设计目标

### 硬约束

1. **每楼层 `gridSize` 锁定 4×4**（用户要求，蓝图系统核心限制，不可突破）
2. **27 个生产机器全部落地**（3 smelter + 1 foundry + 12 constructor + 6 assembler + 1 manufacturer + 4 storage-as-miner）
3. **15 个 mainNode 全部流入 12F 最终 storage**（单点汇流 merger tree）
4. **产量不得减少**（按 333 原始数据）
5. **楼层数可以增加**（不限于 8 层）

### 可验证成功标准

- `scripts/validate-megabase-v3.ts` 输出 **0 error**
- warn 按类别：R14b / R15 / R16 / R17 / R19 合计 **≤ 20**（全方案）
- 每楼层 warn **≤ 3**
- 15 个 mainNode 物料全部有可达 12F storage 的路径（通过 `computeUncappedFlows()` 验证）
- ass-hmf 的 4 个 input port 全部连接（2 R23 消除）

### YAGNI

- 不支持动态 clockSpeed 调整（按 333 原始 clockSpeed 固化）
- 不做多仓库层（用户选 A：单点汇流）
- 不保留 v2（用户要求彻底删除）

## 15 个终端产出清单

| # | 物料 | 英文 ID | qty (/min) | 产出楼层 | 物流楼层 |
|---|---|---|---|---|---|
| 1 | 铁板 | Desc_IronPlate_C | 0.1 | 2F | **8F** |
| 2 | 铁棒 | Desc_IronRod_C | 0.1 | 2F | **8F** |
| 3 | 钢梁 | Desc_SteelPlate_C | 0.2 | 3F | **8F** |
| 4 | 钢管 | Desc_SteelPipe_C | 0.25 | 3F | **8F** |
| 5 | 铜板 | Desc_CopperSheet_C | 0.05 | 4F | **8F** |
| 6 | 混凝土 | Desc_Cement_C | 0.3 | 4F | **9F** |
| 7 | 电线 | Desc_Wire_C | 6 | 4F | **9F** |
| 8 | 电缆 | Desc_Cable_C | 9 | 4F | **9F** |
| 9 | 强化铁板 | Desc_IronPlateReinforced_C | 0.1 | 5F | **9F** |
| 10 | 转子 | Desc_Rotor_C | 0.25 | 5F | **9F** |
| 11 | 定子 | Desc_Stator_C | 0.05 | 5F | **10F** |
| 12 | 模块化框架 | Desc_ModularFrame_C | 0.1 | 6F | **10F** |
| 13 | 钢筋混凝土梁 | Desc_SteelPlateReinforced_C | 0.25 | 6F | **10F** |
| 14 | 马达 | Desc_Motor_C | 0.25 | 6F | **10F** |
| 15 | 重型模块化框架 | Desc_ModularFrameHeavy_C | 0.25 | 7F | **10F** |

合计 ≈ 17.5/min 汇入 12F 总出口 storage。

按产出楼层就近分组（与用户已确认一致）：
- **8F 收 2F–4F 低端 5 路**：plate, rod, beam, pipe, sheet
- **9F 收 4F–5F 中端 5 路**：concrete, wire, cable, RIP, rotor
- **10F 收 5F–7F 高端 5 路**：stator, mframe, EIB, motor, HMF

## 楼层骨架（12 楼层）

| 楼层 | 功能 | 主要机器 | 新增 splitter | 新增终端 skip-lift |
|---|---|---|---|---|
| **1F** | 冶炼 | 4 storage-miner + 3 smelter + 1 foundry + 1 splitter-iron-ore | 0 | 0（1F 没有终端）|
| **2F** | 铁板/铁棒 | 4 constructor + merger-iron + 2 splitter-iron | +2（plate, rod-3）| 2（plate→8F, rod→8F）|
| **3F** | 钢/螺丝 | 4 constructor + 1 splitter-steel | +3（beam, pipe, screw-hmf）| 2（beam→8F, pipe→8F）|
| **4F** | 铜/混凝土 | 4 constructor + 1 splitter-copper + 1 splitter-wire | +1（concrete）| 4（wire→9F, cable→9F, sheet→8F, concrete→9F）|
| **5F** | 装配 A | 3 assembler（RIP + rotor + stator）| +3（RIP, rotor, stator）| 3（RIP→9F, rotor→9F, stator→10F）|
| **6F** | 装配 B | 3 assembler（mframe + EIB + motor）| +3（mframe, EIB, motor）| 3（mframe→10F, EIB→10F, motor→10F）|
| **7F** | 制造 | 1 manufacturer（HMF）| +1（HMF）| 1（HMF→10F）|
| **8F** | 物流 L1a | 5 lift-top + 2 merger（3-in + 2-in）+ 1 lift-bot | — | 1（到 11F）|
| **9F** | 物流 L1b | 5 lift-top + 2 merger + 1 lift-bot | — | 1（到 11F）|
| **10F** | 物流 L1c | 5 lift-top + 2 merger + 1 lift-bot | — | 1（到 11F）|
| **11F** | 终合流 L2 | 3 lift-top（来自 8F/9F/10F）+ 1 merger（3-in）+ 1 lift-bot | — | 1（到 12F）|
| **12F** | 总仓储 | 1 lift-top + 1 storage（终极出口）| — | — |

**楼层数：12**。27 生产机器分布 1F(4)+2F(4)+3F(4)+4F(4)+5F(3)+6F(3)+7F(1) = 23（另 4 个 storage-as-miner 在 1F，合计 27）。

## 物流塔 8F–11F 架构

### 5/5/5 分组（已与用户确认）

**8F 收 2F–4F 低端 5 路**：plate（2F）、rod（2F）、beam（3F）、pipe（3F）、sheet（4F）

**9F 收 4F–5F 中端 5 路**：concrete（4F）、wire（4F）、cable（4F）、RIP（5F）、rotor（5F）

**10F 收 5F–7F 高端 5 路**：stator（5F）、mframe（6F）、EIB（6F）、motor（6F）、HMF（7F）

### 每个 L1 楼层结构（8F/9F/10F 通用模板）

```
Row 0 (上):    [lift-top-1] [lift-top-2] [lift-top-3] [lift-top-4] [lift-top-5]
                 col 0.125    col 0.75     col 1.375    col 2.0      col 2.625
                   |            |             |           |             |
                   ↓            ↓             ↓           ↓             ↓
Row 1.5:       [merger-L1a (3-in)]          [merger-L1b (2-in)]
                 col 0.5-1.0                  col 2.0-2.5
                        \                          /
                         \                        /
Row 2.5 (下):            \  [merger-L1-final]   /
                              col 1.25-1.75
                                    |
Row 3.75:                  [lift-bot 到 11F]
                              col 1.375
```

**机器数量**：5 lift-top + 3 merger + 1 lift-bot = **9 机器**（4×4 可容，参考 v2 的 8F 布局）。

**关键约束**：
- 每个 lift-top 的 port col 必须与下游 merger 的某个 input col 对齐（或 0.5 间距 reachable via L-belt）
- merger 的 facing 需要与上下游相容（避免 U 形绕路）
- 5 个 lift-top 按"源楼层"分配到 merger-L1a（3 个低层源）和 merger-L1b（2 个高层源）

### 11F 终合流层

```
Row 0 (上):   [lift-top-8F]  [lift-top-9F]  [lift-top-10F]
                col 0.625      col 1.625       col 2.625
                    \              |              /
                     \             |             /
Row 2:               [merger-final (3-in)]
                       col 1.25-1.75
                             |
Row 3.75:             [lift-bot 到 12F]
                        col 1.375
```

**机器数量**：3 lift-top + 1 merger + 1 lift-bot = **5 机器**。

### 12F 总仓储

仅 1 lift-top（接 11F 输出）+ 1 storage（最终出口）。2 机器。

## 生产楼层 1F–7F 重新设计原则

v2 的生产楼层会被**整体重写**（不是 retrofit）。新设计原则：

### 1. 每个终端产出机器后直接接"终端分流器"

每个 mainNode 产出机器的 out-0 必须经过一个 splitter 分叉：一路进入下一级内部消费者（如 plate → 5F RIP），另一路进入 **终端 skip-lift**（送到对应物流楼层）。

对于有多个内部消费者的物料（如 rod → screw/rotor/mframe），用 **3-way splitter**。

### 2. facing 规则（与 v2 保持一致，已验证可行）

- 1F smelter/foundry: facing=south（原矿从北 edge 输入）
- 2F–4F constructor: facing=north（input 南边接下层 lift-top，output 北边接上层 lift-bot）
- 5F–6F assembler: 混合 facing（根据上游/下游 col 对齐需求）
- 7F manufacturer: facing=north（input 在 front=top 侧）

### 3. Skip-lift pair 终端直送

每个终端 lift-pair：
- 2F/3F/4F 终端 → 8F：跨 4–6 层
- 4F/5F 终端 → 9F：跨 4–5 层
- 5F/6F/7F 终端 → 10F：跨 3–5 层

R18 两端 pos 必须完全相等。中间楼层不占格。

### 4. 生产楼层机器数与摆放（精细核算）

| 楼层 | 生产机器 | 内部合/分流 | 终端分流 | 入口 lift-top | 出口 lift-bot | **合计** |
|---|---|---|---|---|---|---|
| 1F | 3 smelter + 1 foundry + 4 storage-miner | 1 splitter-iron-ore | 0 | 0 | 4 | **13** |
| 2F | 4 constructor | 1 merger + 2 splitter | +2（plate, rod-3）| 2 | 7 | **18** |
| 3F | 4 constructor | 1 splitter-steel | +3（beam, pipe, screw-hmf）| 3 | 8 | **19** ⚠️ |
| 4F | 4 constructor | 1 splitter-copper + 1 splitter-wire | +1（concrete）| 1 | 6 | **14** |
| 5F | 3 assembler | — | +3（RIP, rotor, stator）| 6 | 6 | **18** |
| 6F | 3 assembler | — | +3（mframe, EIB, motor）| 6 | 5 | **17** |
| 7F | 1 manufacturer | — | +1（HMF）| 4 | 1 | **7** |

**几个楼层会非常紧**（19/18/17），4×4 有 16 格，但机器实际占地只需 ~7 sq（约 40%），瓶颈是 **belt 路由密度**而不是 AABB 碰撞。

### 5. 密度风险与应急预案

**风险 R1：3F 19 机器 belt 交织过密**
- 起因：beam/pipe/screw 都有多路消费者（内部 + 终端 + HMF），出口 lift 多达 8 条
- 预案 A：拆 **3F + 3G**（beam/pipe 在 3F，screw ×2 在 3G），总楼层 → 13
- 预案 B：部分终端 splitter 下移到 8F 物流层（把"产线分流"变成"汇流前分流"），3F 保持生产纯粹

**风险 R2：5F/6F assembler 层 18/17 机器**
- 预案：若拆分，则 **5F+5G**（装配机分两层，各 1–2 台）；**6F+6G** 同理

**风险 R3：物流 L1 层每层 9 机器 + 3 级 merger**
- 预案：把 L1-final merger 从 L1 楼层移到独立楼层（8F/9F/10F 只做 5→2，另加 8G/9G/10G 做 2→1），总楼层 → 最多 16

实施时按"楼层递增 + 每层 warn ≤ 3 条"严格验收，**任何一层超标立即触发该层的应急预案**。

### 5. 已知复杂点

- **rod-3 splitter**：3-way 分流（→ 5F rotor, → 6F mframe, → 8F 终端），单个 splitter 即可
- **pipe splitter**：3-way 分流（→ 5F stator, → 7F HMF, → 8F 终端）
- **screw splitter**：需要分一路到 7F HMF（HMF 需要 pipe + screw + mframe + EIB 共 4 路输入，pipe 和 screw 来自 3F）
- **HMF 4 路输入齐备**：mframe(in-0)、pipe(in-1)、EIB(in-2)、screw(in-3)，消除 v2 的 2 R23

## 关键架构决策

### D1. gridSize 锁定 4×4，楼层数增至 12

用户确认：4×4 是蓝图核心限制不可破。通过增加楼层数（8 → 12）容纳 15 终端的 merger tree。

### D2. 单点汇流 vs 分层归仓（已决策 A）

用户选择 **A：单点汇流到 12F 一个 storage**。虽然物料混合难单独取用，但符合 333 "所有 mainNode 流到最终仓储" 的原始意图。

### D3. 5/5/5 分组

按产出楼层就近分组减少跨层 lift 长度。已确认。

### D4. merger tree 形状 15→5→1→1

每个 L1 楼层（8F/9F/10F）内部完成 5→1（3 个 merger：L1a 3-in + L1b 2-in + L1-final 2-in），只输出 1 条流到 11F。11F 再把 3 条 L1 流合为 1 条到 12F。

这比 v2 的 "15→5→2→1 外部合流" 更紧凑：把二级合流从楼层间移到楼层内。

### D5. 生产楼层重设计（不 retrofit）

既然 v2 "全丢"，1F-7F 生产楼层也重新设计，把终端分流作为一等公民，不做事后硬塞。

### D6. 彻底删除 v2

删除：
- `data/schemes/multi-terminal-megabase-v2.json`
- `docs/superpowers/specs/2026-04-22-megabase-v2-8floor-redesign.md`
- `scripts/validate-megabase-v2.ts`

保留：
- `data/schemes/multi-terminal-megabase-v1.json`（归档参考）

### D7. 新方案文件

- `data/schemes/multi-terminal-megabase-v3.json`
- 方案 id: `multi-terminal-megabase-v3`
- 方案 name: `综合多终点产线 v3（12 层全终端汇流）`
- `scripts/validate-megabase-v3.ts`（复制 validate 模板）

## 实施策略

严格按楼层递增顺序分阶段实施。每阶段验证 0 error + 本层 warn ≤ 3，否则迭代当前层，不推进。

1. **1F 冶炼** — 保留 v2 设计
2. **2F 铁基础** — 新增 plate-term + rod-term splitter 和 skip-lift
3. **3F 钢/螺丝** — 新增 beam/pipe/screw 终端 + HMF 支路，若超标拆 3F/3G
4. **4F 铜/混凝土** — 新增 concrete-term
5. **5F 装配 A** — 新增 RIP/rotor/stator 终端
6. **6F 装配 B** — 新增 mframe/EIB/motor 终端
7. **7F 制造** — HMF 4 路输入齐备 + 终端分流
8. **8F 物流 L1a** — 5 lift + 3 merger + 输出 lift
9. **9F 物流 L1b** — 同模板
10. **10F 物流 L1c** — 同模板
11. **11F 终合流 L2** — 3 lift + 1 merger + 输出 lift
12. **12F 总仓储** — 1 lift + 1 storage

每步完成后跑 `npx tsx scripts/validate-megabase-v3.ts`。

## 验收标准

### 零 error 硬性规则

R1 / R2（0.25 对齐，允许 assembler pos 0.125 例外）/ R3 / R5 / R6 / R7 / R8 / R9 / R10 / R12 / R13 / R14a / R14c / R17 / R18 / R20 / R21 / R24 / R29

### 允许 warn

R14b（穿越无关机器）、R15（同轴 belt 重叠）、R16（端口 col/row 未对齐）、R19（belt 垂直交叉）、R22（容量）、R23（输入端口悬空）、R25、R30、R31

**硬性目标**：全方案 warn 合计 **≤ 20**；每层 ≤ 3 条。

### 功能性验证

- 15 个 mainNode 物料全部有到达 12F storage 的可达路径
- 所有生产机器（27 个）I/O 连通（无 R29）
- 所有 manufacturer/assembler 的所有 input port 连接（无 R23）

## 产出文件

- `data/schemes/multi-terminal-megabase-v3.json`（新方案主文件）
- `scripts/validate-megabase-v3.ts`（新验证脚本，基于 v2 验证模板修改 import 路径）
- `docs/superpowers/specs/2026-04-22-megabase-v3-all-terminals-design.md`（本设计文档）
- `docs/superpowers/plans/2026-04-22-megabase-v3-implementation.md`（实施计划，下一步由 writing-plans skill 生成）

### 删除文件

- `data/schemes/multi-terminal-megabase-v2.json`
- `docs/superpowers/specs/2026-04-22-megabase-v2-8floor-redesign.md`
- `scripts/validate-megabase-v2.ts`

### 保留文件

- `data/schemes/multi-terminal-megabase-v1.json`

## 自我复审

- ✅ 无 TBD（每层机器数 / 分流器映射 / 跨层流向 / 楼层数 / 文件名都明确）
- ✅ 内部一致（27 生产机器 + 15 终端 + 10 个新 splitter + 12 楼层数字相互吻合）
- ✅ 范围清晰（单方案文件 v3，分 12 阶段迭代）
- ✅ 歧义已消除（5/5/5 分组、merger tree 形状、facing 规则、splitter 数量全部定义清楚）
- ⚠️ **风险 1**：3F 16 机器在 4×4 可能 R13 碰撞。应急预案：拆 3F 为 3F + 3G，总楼层 → 13
- ⚠️ **风险 2**：物流塔 L1 层每层 9 机器 + 复杂 belt 路由可能导致 R19 > 3/层。应急预案：把 L1-final 从 L1 楼层移到独立楼层（15 → 5 → 5 → 1 两级合流分到 2 套独立楼层）
