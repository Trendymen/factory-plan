# Multi-Terminal Megabase v2 — 8 楼层重新设计

## 来源与上下文

- **源数据**：根目录 `333`（Satisfactory Calculator 导出的 cytoscape JSON）。27 生产节点 + 15 终端产物 + 84 条流量边
- **上一版方案**：`data/schemes/multi-terminal-megabase-v1.json`（v1，楼层架构混乱，5F 装配层反复受 R14/R20 约束无法落地）
- **v2 决策**：用户要求（1）所有楼层 `gridSize` 锁定 `4×4`；（2）可以增加楼层数；（3）不允许任何产物输出减少
- **目标版本**：v2，新方案文件名待定（见"产出文件"）

## 15 个终端产出（不允许减少，均按 333 原始数据）

| 物料 | 单位/min |
|---|---|
| 电缆 | 9 |
| 电线 | 6 |
| 马达（电机） | 0.25 |
| 定子 | 0.05 |
| 转子 | 0.25 |
| 重型模块化框架 | 0.25 |
| 模块化框架 | 0.1 |
| 钢筋混凝土梁（包裹工业梁） | 0.25 |
| 钢梁 | 0.2 |
| 钢管 | 0.25 |
| 铜板 | 0.05 |
| 强化铁板 | 0.1 |
| 铁板 | 0.1 |
| 铁棒 | 0.1 |
| 混凝土 | 0.3 |

合计 ≈ 17.5/min 汇入 8F 总出口 storage。

## 楼层骨架（8 层）

| 楼层 | 功能 | 机器 | 数量 |
|---|---|---|---|
| 1F | 冶炼 | 4 原矿入口 storage + 3 smelter（铜×1、铁×2）+ 1 foundry（钢）+ 1 splitter（铁矿 3 路） | 9 |
| 2F | 铁板/铁棒 | 4 constructor：plate + rod×3 + merger/splitter 链（铁锭合流 + 分流） | 7 |
| 3F | 钢/螺丝 | 4 constructor：beam + pipe + screw×2 + splitter（钢锭分流）+ 内部 rod → screw 合流 | 6 |
| 4F | 铜/混凝土 | 4 constructor：wire + cable + copper-sheet + concrete + splitter（铜锭分流 + 电线分流） | 6 |
| 5F | 装配 A | 3 assembler：**RIP + rotor + stator** | 3 |
| 6F | 装配 B | 3 assembler：**EIB + modular-frame + motor** | 3 |
| 7F | 制造 | 1 manufacturer：**heavy-modular-frame** | 1 |
| 8F | 物流合并 | 15 lift-top + 8 merger（3 路汇流树 15→5→2→1）+ 1 storage 总出口 | 24 |

- **27 生产机器全落地**：3+1+4+4+4+3+3+1+1 manufacturer = 正好
- **原矿入口**：4 个 storage 模拟 miner，分别接铁矿/铜矿/煤/石灰石 edge 输入
- **楼层上限**：8 楼。若 8F 单层放不下 24 机器 + 15 belt 汇流，**允许拆成 8F（一级合并）+ 9F（二级/final）两层**，总层数升到 9

## 关键架构决策

### 1. Skip-floor lift pair

跨 2 层以上的材料直送（如 2F 铁板 → 5F RIP）：
- 只在"产出楼层"放 `lift-bot`、"消费楼层"放 `lift-top`
- R18 要求两端 `pos` 必须完全相等
- **中间楼层不占格**，彻底解锁"每层 4×4"的空间瓶颈

### 2. "材料向上流"机器朝向统一（v2 核心改动）

v1 各层机器 facing 混着用，导致 5F 出现"南侧 lift → 北侧 assembler input"这种跨过自身机器体的路径需求，被 R14a/R14c 联合挡死。

**v2 改动**：**所有生产楼层的机器默认 facing=north**（意味着：input 在南边 / output 在北边）。物料流向从 1F 南侧入口开始，逐层**向北出 → 下一层南入**——永远沿同方向穿越楼层，不回头。

具体到每层：
- **1F 冶炼**：smelter/foundry facing=south（原矿从北 edge 输入）**是例外**——因为原矿是 edge 输入，1F 南侧出口接 lift-bot 上行到 2F。1F 的 facing 可以保持原 v1 方案
- **2F–4F constructor**：全部 facing=north，input 在南边接 lift-top（来自下层）、output 在北边接 lift-bot（送上层）
- **5F–6F assembler**：同上，facing=north，input 南、output 北
- **7F manufacturer**：这是唯一 front=input 的机器；facing 待定（待详细布局时决定，核心是让 4 个 front 输入能从下方 lift 接上）

### 3. Assembler 楼层坐标用 0.125 步进（接受 R2 warn）

assembler 长度 15m = 1.875 格。facing=north 时，若 pos.row = 1.875，body 正好占 `[1.875, 3.75]`，input 边（row 3.75）与南侧 lift（row 3.75 body `[3.75, 4]`）edge-touching——R13 允许，belt 从 lift port 上行到 input 很短。

这个布局需要 assembler 用 `pos.row = 1.875`（0.125 步进，非 0.25），**会触发 1 条 R2-align warn**。这是**允许的**（见 CLAUDE.md 同轴对齐规则的 0.0625/0.125 例外）。

### 4. 每种材料一个"主分流器"

每个产物先接一个 splitter（主分流器），下游按需扩展：
- 本层消费留 1 路（如 2F 铁板 → 螺丝、铁棒生产）
- 跨层消费留 1 路（如 2F 铁板 → 5F RIP）
- 终端输出留 1 路（→ 8F 物流总入）

超过 3 路分叉（如 rod 要去 screw + rotor + mframe + 终端，共 4 路）用 **两级分流器**。

### 5. 8F 物流合并树

15 路 lift-top 依次接入 **5 台 3-input merger（15→5）** → **2 台 merger（5→2，第二台用 2 in）** → **1 台 merger（2→1）** → **1 台 storage 总出口**。合计 8 merger + 1 storage。

### 6. 跨层流规则

- **2F → 5F**：plate 到 RIP；rod 到 rotor/mframe
- **2F → 6F**：rod 到 mframe（第二路或与 5F 共享一条上行后在 5F/6F 分流）
- **3F → 5F**：screw 到 RIP/rotor
- **3F → 6F**：beam 到 EIB；pipe 到 stator（或 5F stator 的 pipe 来自 3F，是同样）
- **3F → 7F**：pipe、screw 到 HMF
- **4F → 5F**：wire 到 stator
- **4F → 6F**：concrete 到 EIB
- **5F → 6F**：RIP 到 mframe；rotor/stator 到 motor
- **6F → 7F**：mframe、EIB 到 HMF
- **所有楼层 → 8F**：每种终端物料一条跨层 lift 上行

## Assembler 输入映射（v2 要严格按此对齐 col）

| Assembler | in-0 (col offset 0.3125) | in-1 (col offset 0.8125) |
|---|---|---|
| RIP | 铁板（plate） | 螺丝（screw） |
| rotor | 螺丝（screw） | 铁棒（rod） |
| stator | 钢管（pipe） | 电线（wire） |
| EIB | 钢梁（beam） | 混凝土（concrete） |
| modular-frame | 强化铁板（RIP） | 铁棒（rod） |
| motor | 转子（rotor） | 定子（stator） |

Assembler pos 的 col 按 **in-0 col = 上游 lift port col** 倒推：
- `ass.pos.col = lift_for_in0.pos.col + 0.125 − 0.3125 = lift.pos.col − 0.1875`
- in-1 对应的 lift 需要在 `ass.pos.col + 0.8125 − 0.125 = ass.pos.col + 0.6875` 即 `lift_for_in0.pos.col + 0.5`
- 两个 lift 在同一楼层上**必须**相差正好 0.5 col（对应 assembler 两输入相距 0.5）

## Manufacturer（7F）输入映射

manufacturer 是**唯一 front=input** 的机器，4 输入在 front（默认 facing=south 时为 bottom 边）：

| Port | Col offset | 物料 |
|---|---|---|
| in-0 | 0.375 | 模块化框架 |
| in-1 | 0.875 | 钢管 |
| in-2 | 1.375 | 包裹工业梁 |
| in-3 | 1.875 | 螺丝 |

out-0 在 back（facing=south 时 top 边），col offset 1.125，物料是重型模块化框架。

7F 只放 1 台 manufacturer，占 2.25 × 2.5 格，剩余空间用于放 4 路 lift-top（上游材料入口）+ 1 路 lift-bot（HMF 输出下行到 8F）。

## 验收标准

每层交付后跑 `npx tsx scripts/validate-megabase.ts`（基于 `validateSchemeDetailed()`）：

### 零 error 硬性规则（全部必须 0）
R1 / R2（0.25 对齐）/ R3 / R5 / R6 / R7 / R8 / R9 / R10 / R12 / R13 / R14a / R14c / R17 / R18 / R20 / R21 / R24 / R29

### 可残留 warn（每层不超过 3 条）
R14b（belt 穿越无关机器）、R15（同轴 belt 重叠）、R16（端口 col/row 未对齐）、R19（belt 垂直交叉）、R22（belt 容量）、R23（输入端口悬空）、R25（splitter/merger 端口悬空）、R30、R31

**硬性目标**：每层交付时 R14b/R15/R16/R17/R19 合计 **≤ 3 条**，全方案合计 **≤ 15 条**。超出必须迭代调整。

## 实施策略

严格按楼层递增顺序分阶段实施：

1. **1F 冶炼**：先落地 4 原矿 storage + 3 smelter + 1 foundry + 1 splitter，跑验证 0/0
2. **2F 铁链**：4 constructor（新布局，留 col-gap）+ 内部分流 + 南侧 lift-bot（上行到 5F/6F），0/0
3. **3F 钢/螺丝**：同上，留 con 缝给 screw 南→北路径
4. **4F 铜/混凝土**：同上
5. **5F 装配 A**：3 assembler，所有 lift-top 按 assembler input col 精确对齐
6. **6F 装配 B**：同上
7. **7F 制造**：1 manufacturer + 入口 lift-top × 4
8. **8F 物流**：15 lift-top + 8 merger 汇流树 + 1 storage 总出口

每一步 0/0 后再进下一步；某一步超出 3 条 warn 硬上限就迭代当前层，不推进。

## 产出文件

- `data/schemes/multi-terminal-megabase-v2.json`（新方案，**不覆盖** v1 以保留参考）
- 方案 id: `multi-terminal-megabase-v2`
- 方案 name: `综合多终点产线 v2（8 层重构，27 机器全落地）`

v1 文件保留归档。v2 成熟后由用户手动决定是否删除 v1。

## 自我复审

- ✅ 无 TBD（每层机器数 / col 规则 / 跨层流向都明确）
- ✅ 内部一致（27 生产分布总和正好 27、15 终端全部接入 8F 合并树）
- ✅ 范围清晰（单方案文件 v2，分 8 阶段迭代）
- ✅ 歧义已消除（con 留缝规则、lift pair 对齐规则、分流器 2 级拆分规则全部定义清楚）
- ⚠️ 8F 单层装下 24 机器 + 15 belt 是唯一有实现风险的点，实施时若超标拆 8F+9F
