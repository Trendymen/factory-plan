# 铜铁石灰石大一统产线 3F — 设计规格 v2

> 状态：**设计完成**
> 创建：2026-04-14
> 修订：2026-04-14（v2 — 缩减面积 + 单品输出架构）
> 基于：v1 设计（12×10, 4 assembler）的重大修订
> 方案文件名（预定）：`data/schemes/unified-base.json`

---

## 1. 项目背景

为 Satisfactory 工厂蓝图查看系统新建一个 JSON 蓝图方案，覆盖**钢之前**的铜/铁/石灰石三矿全产线，含 Rotor、Modular Frame 的持续生产能力和 Smart Plating 的手动切换能力。

### 与 v1 的核心差异

| 项目 | v1 | v2 |
|------|-----|-----|
| 网格尺寸 | 12×10（120 cells/层） | **10×9**（90 cells/层，-25%） |
| F3 assembler | 4（RIP×2, Rotor, ModFrame） | **3**（RIP, Rotor, ModFrame/flex） |
| 输出架构 | 混合品类终端 + 钢系直通 | **纯单品输出**（每种产品独立 belt） |
| 钢系集成 | 铁矿石 90/min 直通 + 混凝土钢系输出 | **无原矿输出**，全部用于生产 |
| 输出终端 | 7 个（混合+直通） | **10 个**（单品，楼外自理存储/路由） |
| 升降机 | 8 对 | **14 对**（单品输出需独立通道） |
| F3 缓冲 | 无 | **3× storage** 缓冲组装成品 |
| 定位 | 大一统 + 钢系中转 | **纯建材自给工厂** |

### 核心需求

1. **自给建材工厂**：铁+铜+石灰石 → 钢之前所有核心产物
2. **Rotor + Modular Frame 始终在线**，背压自动调节
3. **Smart Plating 手动切换**：ModFrame 机位可切换到 SP（不追求配平满速）
4. **纯单品输出**：每种产品独立输出 belt，不混流。楼外由玩家接 storage / 路由到钢厂
5. **F3 缓冲 storage**：组装成品先缓冲再输出，减少 assembler 频繁启停
6. **垂直可复制**：每份 3F 蓝图完全自包含
7. **输出终端在 F1 南侧**，玩家楼外自建 storage

---

## 2. 已确认的设计决策

| 决策项 | 结论 | 备注 |
|--------|------|------|
| 架构方案 | **工序分层 3F** | F1 冶炼 → F2 制造 → F3 组装 |
| 网格尺寸 | **10 cols × 9 rows**（80m × 72m）× 3 层 | 比 v1 缩减 25% |
| 铁矿石输入 | **90/min**（1 条带，全部冶炼） | 无钢系直通 |
| 铜矿石输入 | **60/min** | 全部 → 铜制品 |
| 石灰石输入 | **90/min** | 全部 → 混凝土 |
| 传送带等级 | 按需混用 Mk.1 / Mk.2 | 主干线 Mk.2，支线 Mk.1 |
| 输出架构 | **纯单品输出** | 每种产品独立 belt + 终端 |
| 存储位置 | **不在方案内** | 楼外玩家自建 storage |
| 扩产策略 | **垂直复制（每份独立）** | 输入北侧，输出南侧 |
| RIP/Rotor/ModFrame | **始终在线，背压自动** | 3 台 assembler |
| Smart Plating | **手动切换** | ModFrame 机位切换，不追求配平 |
| 钢厂对接 | **楼外自理** | 玩家从各输出口接 belt 到钢厂 |

---

## 3. 生产规划

### 3.1 原矿输入（北侧进入 F1）

| 入口 | 矿石 | 速率 | Belt Mark | 去向 |
|------|------|------|-----------|------|
| E1 | 铁矿石 | 90/min | Mk.2 | 3× smelter → 90 铁锭/min |
| E2 | 铜矿石 | 60/min | Mk.1 | 2× smelter → 60 铜锭/min |
| E3 | 石灰石 | 90/min | Mk.2 | 2× constructor → 30 混凝土/min |

### 3.2 铁锭分配（90/min）

| 去向 | 消耗铁锭 | 产出 |
|------|---------|------|
| 2× 铁板 constructor | 60/min | 40 iron plate/min |
| 2× 铁棒 constructor | 30/min | 30 iron rod/min |
| **合计** | **90/min** | — |

### 3.3 铁棒二级分配（30 rod/min）

| 去向 | 消耗铁棒 | 产出 |
|------|---------|------|
| 2× 螺丝 constructor | 20/min | 80 screw/min |
| 剩余 → F3 + 输出 | 10/min | Rotor / ModFrame / O2 输出 |

### 3.4 铜锭分配（60/min）

| 去向 | 消耗铜锭 | 产出 |
|------|---------|------|
| 2× 电线 constructor | 30/min | 60 wire/min |
| wire → splitter | — | 部分给 cable constructor，部分到 O4 输出 |
| 1× 电缆 constructor | ≤60 wire | ≤30 cable/min（取决于 wire 分配） |
| 1× 铜板 constructor | 20/min | 10 copper sheet/min |
| 余量 | 10/min | 带上自然背压回堵 |

### 3.5 混凝土（30/min）

2× constructor：90 石灰石 → 30 concrete/min → O7 输出

### 3.6 F3 组装层（3 台 assembler）

| 机位 | 配方 | 模式 | 满速输入 | 满速产出 | 输入来源 |
|------|------|------|---------|---------|---------|
| #1 | RIP | 固定 | 30 plate + 60 screw | 5 RIP/min | F2 plate + screw |
| #2 | Rotor | 固定 | 20 rod + 100 screw | 4 Rotor/min | F2 rod + screw |
| #3 | Modular Frame | 默认（flex→SP） | 3 RIP + 12 rod | 2 ModFrame/min | #1 RIP + F2 rod |

**注意**：共享 90 ingot/min 的产能，所有 assembler 无法同时满速运行。背压自动调节实际分配比例。

### 3.7 背压自动调节机制

F2 每种产品（plate / screw / rod）在出口处经过 splitter，二路分流：
- 一路 → 升降机送 F3（assembler 消耗）
- 一路 → 升降机送 F1（单品输出）

**当 F3 assembler 输出 storage 满了：**

1. Assembler 停转 → 输入带堵塞
2. F2 splitter 的 F3 输出口堵塞
3. Splitter 自动将全部物料转发到 F1 输出口
4. 输出终端获得 100% 供给

**当玩家取走产品（或钢厂消耗）：**

1. F3 storage 有空间 → Assembler 恢复运转
2. Splitter 恢复分流 → F3 和 F1 各获得部分物料

### 3.8 F3 缓冲 storage

每台 assembler 的产出先进入 F3 的 storage 缓冲箱：

| 储存箱 | 缓冲内容 | 下游 |
|--------|---------|------|
| st-rip | RIP 余量（未被 ModFrame 消耗的部分） | → L12 → O8 |
| st-rotor | Rotor 全量 | → L13 → O9 |
| st-modframe | ModFrame 全量（flex 切换时为 SP） | → L14 → O10 |

**效果**：assembler 产出先填满 storage，下游 lift 从 storage 持续输出，assembler 不会因终端背压频繁启停。

### 3.9 机器总表

| 类型 | 数量 | 楼层 | 配方 |
|------|------|------|------|
| Smelter | 3 | F1 | iron-ingot |
| Smelter | 2 | F1 | copper-ingot |
| Constructor | 2 | F1 | concrete |
| Constructor | 2 | F2 | iron-plate |
| Constructor | 2 | F2 | iron-rod |
| Constructor | 2 | F2 | screw |
| Constructor | 2 | F2 | wire |
| Constructor | 1 | F2 | cable |
| Constructor | 1 | F2 | copper-sheet |
| Assembler | 1 | F3 | reinforced-iron-plate (#1) |
| Assembler | 1 | F3 | rotor (#2) |
| Assembler | 1 | F3 | modular-frame (#3 flex) |
| Storage | 3 | F3 | 缓冲（st-rip, st-rotor, st-modframe） |

**总计**：20 台生产机器 + 3 台缓冲 storage + ~12 splitter + 28 台升降机（14 对）+ 10 台输出终端 splitter

---

## 4. 楼层架构

### 4.1 总览

| 层 | 功能 | 关键机器 |
|----|------|---------|
| **F1** | 冶炼 + 混凝土 + 输出终端 | 5 smelter, 2 concrete constructor, 10 output splitter |
| **F2** | 一级制造（10 台 constructor） | plate×2, rod×2, screw×2, wire×2, cable×1, sheet×1 |
| **F3** | 组装 + 缓冲 storage | 3 assembler, 3 storage |

所有机器 **south-facing**，矿石/锭从北侧（back）进入，产品从南侧（front）输出。

### 4.2 物料主流向

```
北侧入口（3 条矿石带: E1-E3）
    ↓
F1（冶炼: 3铁冶+2铜冶 + 混凝土: 2 constructor）
    ↓ L1/L2 升降机上送铁锭+铜锭
F2（制造: 10 constructor）
    ↓ L3/L4/L5 上送 plate+screw+rod 给 F3
    ↓ L6-L11 下送 F2 各单品给 F1 输出
F3（组装: 3 assembler → 3 storage 缓冲）
    ↓ L12/L13/L14 下送各组装成品给 F1 输出
F1 南侧输出终端（10 个 splitter: O1-O10）→ 楼外
```

### 4.3 F1 布局概念（10×9）

```
┌──────────── 10 cols (北=row 0) ────────────┐
│ Row 0-1:   3 入口带                         │
│  E1(铁90) E2(铜60) E3(石灰石90)            │
│                                             │
│ Row 1-2.5: [铁 smelter ×3]  [铜 smelter ×2]│
│             左侧铁区     │   右侧铜区       │
│                                             │
│ Row 2.5-4: [混凝土 constructor ×2]          │
│            + 锭料 merger → L1/L2 ↑ (送F2)   │
│                                             │
│ Row 4-6:   升降机到达区                      │
│            L6-L11 (F2产品↓) L12-L14 (F3产品↓)│
│            + belt 路由到各输出终端            │
│                                             │
│ Row 6-7:   混凝土 belt → O7                  │
│                                             │
│ Row 7-8:   输出终端带 (单排 10 个)           │
│  [O1][O2][O3][O4][O5][O6][O7][O8][O9][O10] │
│                                             │
│ Row 8-9:   南侧边距                         │
└─────────────────────────────────────────────┘
```

### 4.4 F2 布局概念（10×9）

```
┌──────────── 10 cols (北=row 0) ────────────┐
│ Row 0-1:   升降机出口 (L1 铁锭 / L2 铜锭)   │
│            + splitter 分配到各 constructor    │
│                                             │
│ Row 1-3:   Tier 1 — 锭料消费 (facing south)  │
│  [铁板×2] [铁棒×2] [电线×2] [铜板×1]        │
│  = 7 台 constructor，间距 0.25 格            │
│                                             │
│ Row 3-5:   Tier 2 — 中间品消费 (facing south) │
│  [螺丝×2] [电缆×1]                          │
│  = 3 台 constructor                          │
│                                             │
│ Row 5-7:   产品二路分流 + 升降机              │
│  每种产品 → splitter:                        │
│    out → L3/L4/L5 ↑ 送 F3                   │
│    out → L6-L11 ↓ 送 F1 (单品输出)           │
│  cable/sheet: 直连 L10/L11 ↓                 │
│                                             │
│ Row 7-9:   预留空间                          │
└─────────────────────────────────────────────┘
```

### 4.5 F3 布局概念（10×9）

```
┌──────────── 10 cols (北=row 0) ────────────┐
│ Row 0-2:   升降机出口 (L3 plate/L4 screw/L5 rod)│
│            + splitter 分配到各 assembler      │
│                                             │
│ Row 2-4:   3× assembler (facing south, 2.0深) │
│  [RIP #1]    [Rotor #2]    [ModFrame #3 flex]│
│  in-0=plate   in-0=rod      in-0=RIP(#1)    │
│  in-1=screw   in-1=screw    in-1=rod (默认)  │
│                                             │
│ Row 4-5.5: RIP 分流 (→ModFrame + →st-rip)   │
│            Rotor → st-rotor                  │
│            ModFrame → st-modframe            │
│                                             │
│ Row 5.5-7: ★ 缓冲储存箱 ★                    │
│  [st-rip]   [st-rotor]   [st-modframe]       │
│                                             │
│ Row 7-8:   storage → L12/L13/L14 ↓ F1       │
│                                             │
│ Row 8-9:   预留扩展空间                       │
└─────────────────────────────────────────────┘
```

---

## 5. 升降机规划

### 5.1 上行升降机（5 对）

| 编号 | 方向 | 物料 | 预估速率 | Mark | 楼层连接 |
|------|------|------|---------|------|---------|
| L1 | F1→F2 ↑ | 铁锭 | 90/min | Mk.2 | 1↔2 |
| L2 | F1→F2 ↑ | 铜锭 | 60/min | Mk.1 | 1↔2 |
| L3 | F2→F3 ↑ | 铁板 | ~20/min | Mk.1 | 2↔3 |
| L4 | F2→F3 ↑ | 螺丝 | ~40/min | Mk.1 | 2↔3 |
| L5 | F2→F3 ↑ | 铁棒 | ~10/min | Mk.1 | 2↔3 |

### 5.2 下行升降机（9 对）

| 编号 | 方向 | 物料 | 预估速率 | Mark | 楼层连接 | 目标终端 |
|------|------|------|---------|------|---------|---------|
| L6 | F2→F1 ↓ | 铁板余量 | ≤40/min | Mk.1 | 2↔1 | O1 |
| L7 | F2→F1 ↓ | 铁棒余量 | ≤30/min | Mk.1 | 2↔1 | O2 |
| L8 | F2→F1 ↓ | 螺丝余量 | ≤80/min | Mk.2 | 2↔1 | O3 |
| L9 | F2→F1 ↓ | 电线余量 | ≤60/min | Mk.1 | 2↔1 | O4 |
| L10 | F2→F1 ↓ | 电缆 | ≤30/min | Mk.1 | 2↔1 | O5 |
| L11 | F2→F1 ↓ | 铜板 | ≤10/min | Mk.1 | 2↔1 | O6 |
| L12 | F3→F1 ↓ | RIP 余量 | ~5/min | Mk.1 | 3↔1 | O8 |
| L13 | F3→F1 ↓ | Rotor | ~4/min | Mk.1 | 3↔1 | O9 |
| L14 | F3→F1 ↓ | ModFrame/SP | ~2/min | Mk.1 | 3↔1 | O10 |

**注意**：L3-L5 的实际流量取决于背压状态。当 F3 assembler/storage 全部满载时，L3-L5 流量归零，对应产品全部走 L6-L8 到 F1 输出。L8 在此情况下可达 80/min，需 Mk.2。

---

## 6. 输出终端配置（F1 南侧）

10 个 splitter 沿 F1 南侧单排排列，每个终端输出**单一品类**产品。玩家在楼外自行接 storage 或路由到下游工厂。

| 终端 | 产品 | 来源 | 说明 |
|------|------|------|------|
| **O1** | Iron Plate | L6 from F2 | F3 未消耗的余量 |
| **O2** | Iron Rod | L7 from F2 | F3 未消耗的余量 |
| **O3** | Screw | L8 from F2 | F3 未消耗的余量 |
| **O4** | Wire | L9 from F2 | Cable 未消耗的余量 |
| **O5** | Cable | L10 from F2 | 全量 |
| **O6** | Copper Sheet | L11 from F2 | 全量 |
| **O7** | Concrete | F1 直出 | 全量（同层无需 lift） |
| **O8** | Reinforced Iron Plate | L12 from F3 | ModFrame 未消耗的余量 |
| **O9** | Rotor | L13 from F3 | 全量 |
| **O10** | Modular Frame / Smart Plating | L14 from F3 | flex 切换时输出 SP |

### 楼外对接方式

```
O1-O10 各终端 ──belt──→ [单品 Storage] ──(可选)──→ 钢厂 / 其他工厂
```

玩家可自由选择：
- 仅存储（接 storage 即可）
- 存储 + 输出钢厂（storage 后接 belt 到钢厂）
- 后期用 Smart Splitter 做条件路由

---

## 7. Smart Plating 手动切换指南

### 默认状态（JSON 方案表示）

- Assembler #3 配方：**modular-frame**
- 输入带：in-0 = RIP（来自 #1 assembler 分流），in-1 = Iron Rod（来自 F2）
- 输出带：→ st-modframe → L14 → O10

### 切换到 Smart Plating 模式

玩家操作步骤：

1. 在 #3 assembler 上将配方改为 **Smart Plating**
2. 断开 in-1 的 Rod 输入带
3. 将 in-1 连接到 Rotor #2 assembler 的 out-0 输出带（或 st-rotor 输出）
4. in-0（RIP 供给）不动

### 切换后影响

- ModFrame 停产，O10 输出变为 Smart Plating
- RIP #1 产出被 #3 消耗一部分（SP 需 2 RIP/min），O8 RIP 余量减少
- Rotor #2 产出被 #3 消耗一部分（SP 需 2 Rotor/min），O9 Rotor 输出减少
- SP 产速取决于 RIP + Rotor 供给（不追求满速 2/min）

### 切回正常模式

改回 modular-frame 配方，in-1 重接 Rod 输入带即可。

---

## 8. 传送带等级

| 段落 | 最大流量 | 推荐 mark |
|------|---------|-----------|
| 铁矿石入口 E1 90/min | 90 | Mk.2 |
| 铜矿石 E2 60/min | 60 | Mk.1 |
| 石灰石 E3 90/min | 90 | Mk.2 |
| 铁锭干线 90/min | 90 | Mk.2 |
| 铜锭干线 60/min | 60 | Mk.1 |
| F2 各 constructor 进出 | ≤60 | Mk.1 |
| F2→F3 升降机 L3-L5 | ≤40 | Mk.1 |
| F2→F1 下行 L6/L7/L9 | ≤60 | Mk.1 |
| F2→F1 下行 L8（螺丝，峰值） | ≤80 | Mk.2 |
| F2→F1 下行 L10/L11 | ≤30 | Mk.1 |
| F3→F1 下行 L12-L14 | ≤5 | Mk.1 |
| F1 混凝土 → O7 | 30 | Mk.1 |

---

## 9. F2 产品路由详解

### 铁系产品（plate / rod / screw）

每种产品在 F2 出口经 splitter 二路分流：

```
constructor output → [merger if ×2] → splitter
  ├─ out → lift ↑ F3 (assembler input)
  └─ out → lift ↓ F1 (单品输出终端)
```

背压自动调节两路分配比例。F3 满时全部流向 F1 输出。

### 铜系产品（wire / cable / sheet）

```
wire constructor ×2 → merger → splitter
  ├─ out → cable constructor (F2 内部消耗)
  └─ out → L9 ↓ F1 (O4 wire 输出)

cable constructor → L10 ↓ F1 (O5 cable 输出，直连)

sheet constructor → L11 ↓ F1 (O6 sheet 输出，直连)
```

### F3 组装产品

```
RIP #1 → splitter
  ├─ out → ModFrame #3 in-0 (内部消耗)
  └─ out → st-rip → L12 ↓ F1 (O8 RIP 输出)

Rotor #2 → st-rotor → L13 ↓ F1 (O9 Rotor 输出)

ModFrame #3 → st-modframe → L14 ↓ F1 (O10 ModFrame/SP 输出)
```

---

## 10. 高频建造材料覆盖分析

| 排名 | 材料 | 主要消耗场景 | 本方案状态 |
|------|------|------------|-----------|
| 1 | **Iron Plate** | 地基、墙壁、传送带 | ✅ O1 输出 40/min |
| 2 | **Concrete** | 地基（大量消耗）、电线杆 | ✅ O7 输出 30/min |
| 3 | **Iron Rod** | 传送带支架、电线杆 | ✅ O2 输出 |
| 4 | **Screw** | 几乎所有建筑子材料 | ✅ O3 输出 |
| 5 | **Wire** | 电力连接 | ✅ O4 输出 |
| 6 | **Cable** | 电线杆、电力基建 | ✅ O5 输出 |
| 7 | **Reinforced Iron Plate** | Splitter/Merger/Assembler | ✅ O8 输出 |
| 8 | **Copper Sheet** | 部分机器 | ✅ O6 输出 |
| 9 | **Modular Frame** | 机器建造成本 | ✅ O10 输出（背压自动） |
| 10 | **Rotor** | Smart Splitter、部分机器 | ✅ O9 输出（背压自动） |
| 11 | **Smart Plating** | 太空电梯 Phase 1 | ⚡ #3 flex 手动切换 |

**全覆盖**：前 10 名建材全部在线单品输出。Smart Plating 保留手动切换能力。

---

## 11. 垂直复制规格

### 模块接口定义

| 接口 | 位置 | 方向 | 速率/Mark |
|------|------|------|----------|
| E1 铁矿入口 | 北侧 row 0 | 入 | 90/min Mk.2 |
| E2 铜矿入口 | 北侧 row 0 | 入 | 60/min Mk.1 |
| E3 石灰石入口 | 北侧 row 0 | 入 | 90/min Mk.2 |
| O1-O10 输出 | 南侧 row 8 | 出 | 各 Mk.1-Mk.2 |

### 垂直复制约束

1. **输入统一在北侧**：3 条输入带从北侧 Row 0 进入
2. **输出统一在南侧**：10 个 output splitter 沿南侧排列
3. **无元素越界**：所有机器、belt、splitter 严格在 10×9 footprint 内
4. **升降机不穿顶**：本模块升降机只连接自己的 F1↔F2↔F3
5. **输出终端位置固定**：每份的 O1-O10 在相同 col 位置

### 每份资源需求

- 铁矿 90/min
- 铜矿 60/min
- 石灰石 90/min
- 电力：**~113 MW**（5 smelter×4 + 12 constructor×4 + 3 assembler×15）

---

## 12. 钢厂对接策略

本工厂定位为**纯建材自给工厂**，不直接输出原矿。下游钢厂建议采用**独立架构（方案 A）**：

### 推荐：独立钢厂 + 铁厂补充供给

```
铁厂 O1-O10 ──(可选接入)──→ 钢厂外部输入
                              ├─ 钢厂自有铁矿+煤 → Foundry → 钢锭
                              ├─ 钢厂自产 wire/screw 等中间品
                              └─ 铁厂供给作为补充加速
```

- 钢厂自带铁矿+铜矿+煤输入，可独立运行
- 铁厂的单品输出口提供额外供给，提升钢厂产能
- 两厂各自配平，互不依赖
- 扩产时各自垂直复制

### 铁厂可为钢厂提供的产品

| 产品 | 终端 | 钢厂用途 |
|------|------|---------|
| Wire | O4 | Stator 配方 |
| Cable | O5 | Automated Wiring |
| Screw | O3 | Heavy Modular Frame |
| Concrete | O7 | Encased Industrial Beam |
| Rotor | O9 | Motor |
| Modular Frame | O10 | HMF, Versatile Framework |

---

## 13. 配方速查表

| 配方 | 机器 | 输入 | 输出 | 周期 |
|------|------|------|------|------|
| Iron Ingot | smelter | 1 iron ore (30/min) | 1 iron ingot (30/min) | 2s |
| Copper Ingot | smelter | 1 copper ore (30/min) | 1 copper ingot (30/min) | 2s |
| Iron Plate | constructor | 3 iron ingot (30/min) | 2 iron plate (20/min) | 6s |
| Iron Rod | constructor | 1 iron ingot (15/min) | 1 iron rod (15/min) | 4s |
| Screw | constructor | 1 iron rod (10/min) | 4 screw (40/min) | 6s |
| Wire | constructor | 1 copper ingot (15/min) | 2 wire (30/min) | 4s |
| Cable | constructor | 2 wire (60/min) | 1 cable (30/min) | 2s |
| Copper Sheet | constructor | 2 copper ingot (20/min) | 1 copper sheet (10/min) | 6s |
| Concrete | constructor | 3 limestone (45/min) | 1 concrete (15/min) | 4s |
| Reinforced Iron Plate | assembler | 6 plate (30/min) + 12 screw (60/min) | 1 RIP (5/min) | 12s |
| Rotor | assembler | 5 rod (20/min) + 25 screw (100/min) | 1 rotor (4/min) | 15s |
| Modular Frame | assembler | 3 RIP (3/min) + 12 rod (12/min) | 2 frame (2/min) | 60s |
| Smart Plating | assembler | 1 RIP (2/min) + 1 rotor (2/min) | 1 smart plating (2/min) | 30s |

---

## 14. 参考

- 前版 v1 spec：本文件的 git 历史
- 现有方案参考：`data/schemes/iron-full-line-v2.json`（8×7, 2 层铁矿全产线）
- 建筑注册表：`src/core/registry.ts`
- 配方数据库：`data/recipes.json`
- 验证规则：`src/core/schema.ts` — `validateSchemeDetailed()`
- 项目规则：`CLAUDE.md`（R1-R31 全部规则）
