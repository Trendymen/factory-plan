# 铜铁石灰石大一统产线 3F — 设计规格

> 状态：**设计完成**
> 创建：2026-04-14
> 基于：`2026-04-13-pre-steel-base-design.md`（扩展版）
> 方案文件名（预定）：`data/schemes/unified-base.json`

---

## 1. 项目背景

为 Satisfactory 工厂蓝图查看系统新建一个 JSON 蓝图方案，覆盖**钢之前**的铜/铁/石灰石三矿全产线，同时纳入 Rotor、Modular Frame、Smart Plating 的生产能力。

这是对 2026-04-13 pre-steel-base-design.md 的重大扩展，核心变更：

- 纳入 Rotor、Modular Frame 作为常规建材持续生产（背压自动调节）
- 新增 Smart Plating 手动切换能力（flex 机位平时跑 RIP）
- 铁矿石输入扩大到 180/min（原 120）
- 网格从 10×8 扩大到 12×10

### 核心需求

1. **大一统方案**：铁+铜+石灰石→钢之前所有核心产物 + 高级组装产品
2. **Rotor + Modular Frame 始终在线**，背压自动调节优先级
3. **Smart Plating 手动切换**：flex 机位平时跑 RIP，需要时改配方+重接输入带
4. **为钢系预留充足输出**：铁矿石直通 90/min + 混凝土输出
5. **垂直可复制**：每份 3F 蓝图完全自包含，可在顶部叠加
6. **输出终端在 F1 南侧**，玩家楼外自建 storage
7. **优先多类型同存储**（industrial-storage 混存）

### 关键发现

- **Steel Ingot 标准配方直接消耗 Iron Ore（不是 Iron Ingot）+ Coal → Foundry**
- 因此铁矿石在入口处分为两条独立输入带：90/min 进 smelter，90/min 直通钢系
- Smart Plating = RIP + Rotor（assembler），其子材料全在本方案内生产
- 标准 splitter 在一个输出口堵塞时自动将物料转发到其他输出口（背压机制），无需 Smart Splitter

---

## 2. 方案选型

评估了 3 种架构方案：

### 方案 A：工序分层 3F — 12×10 网格（✅ 最终选择）

按加工阶段分层：F1 冶炼 → F2 制造 → F3 组装，面积 12×10。

**优点**：
- 与前版 spec 一脉相承，流程清晰
- 每层功能单一，belt 布线最干净
- F3 有 4 台 assembler 后仍有大面积预留空间
- 物料自然从下往上加工，成品回送 F1 输出

**缺点**：
- 面积较大（12×10 = 120 cells/层）
- 升降机 8 对

### 方案 B：工序分层 4F — 10×8 网格（❌ 排除）

保持 10×8 面积不变，加一层容纳新增 assembler。F3 基础组装，F4 高级组装。

**排除原因**：
- 4 层升降机路径复杂（F4→F1 跨 3 层）
- F3/F4 各仅 2 台 assembler，空间利用率低

### 方案 C：混合分层 3F — 10×10 网格（❌ 排除）

F2 合并制造+RIP 组装，F3 专做高级组装。

**排除原因**：
- F2 拥挤（11 台机器 + belt 交叉）
- RIP 成品仍需升降到 F3 给 Smart Plating/ModFrame，物流不清晰

---

## 3. 已确认的设计决策

| 决策项 | 结论 | 备注 |
|--------|------|------|
| 架构方案 | **工序分层 3F** | F1 冶炼 → F2 制造 → F3 组装 |
| 网格尺寸 | **12 cols × 10 rows**（96m × 80m）× 3 层 | belt 布线余量充足 |
| 铁矿石输入 | **180/min**（2 条独立带） | 90→冶炼, 90→钢系直通 |
| 铜矿石输入 | **60/min** | 全部→铜制品 |
| 石灰石输入 | **90/min** | 全部→混凝土 |
| 传送带等级 | 按需混用 Mk.1 / Mk.2 | 主干线 Mk.2，支线 Mk.1 |
| 存储位置 | **不在方案内** | F1 南侧 splitter 作输出终端 |
| 扩产策略 | **垂直复制（每份独立）** | 输入/输出统一南北向，升降机不穿顶 |
| RIP/Rotor/ModFrame | **始终在线，背压自动** | splitter 自动平衡 F3 组装 vs F1 存储 |
| Smart Plating | **手动切换** | flex 机位默认跑 RIP #2 |

---

## 4. 扩产策略

本蓝图设计为**标准化垂直可复制模块**。每份 3F 模块完全自包含。

### 垂直复制约束

1. **输入统一在北侧**：4 条输入带（铁×2, 铜×1, 石灰石×1）从北侧 Row 0 进入
2. **输出统一在南侧**：7 个 output splitter 沿南侧排列
3. **无元素越界**：所有机器、belt、splitter 严格在 12×10 footprint 内
4. **升降机不穿顶**：本模块升降机只连接自己的 F1↔F2↔F3
5. **输出终端位置固定**：每份的 S1-S7 在相同 col 位置

### 复制方法

1. 在游戏中复制整栋 3F 建筑到上方（或并排）
2. 为新复制份接入独立的 4 条矿石输入带
3. 新份的 S1-S7 输出与原份输出在楼外用 merger 汇总
4. 每份处理：铁矿 180/min + 铜矿 60/min + 石灰石 90/min

---

## 5. 生产规划

### 5.1 原矿输入（北侧进入 F1）

| 入口 | 矿石 | 速率 | Belt Mark | 去向 |
|------|------|------|-----------|------|
| E1 | 铁矿石 | 90/min | Mk.2 | 3× smelter → 90 铁锭/min |
| E2 | 铁矿石 | 90/min | Mk.2 | 直通 → S5 钢系输出 |
| E3 | 铜矿石 | 60/min | Mk.1 | 2× smelter → 60 铜锭/min |
| E4 | 石灰石 | 90/min | Mk.2 | 2× constructor → 30 混凝土/min |

### 5.2 铁锭分配（90/min）

| 去向 | 消耗铁锭 | 产出 |
|------|---------|------|
| 2× 铁板 constructor | 60/min | 40 iron plate/min |
| 2× 铁棒 constructor | 30/min | 30 iron rod/min |
| **合计** | **90/min** | — |

### 5.3 铁棒二级分配（30 rod/min）

| 去向 | 消耗铁棒 | 产出 |
|------|---------|------|
| 2× 螺丝 constructor | 20/min | 80 screw/min |
| 剩余 → F3 + 存储 | 10/min | Rotor / ModFrame / 存储 |

### 5.4 铜锭分配（60/min）

| 去向 | 消耗铜锭 | 产出 |
|------|---------|------|
| 2× 电线 constructor | 30/min | 60 wire/min → splitter 分流 |
| wire splitter | — | splitter 分流到 cable + 存储输出（背压自动调节比例） |
| 1× 电缆 constructor | ≤60 wire | ≤30 cable/min（取决于 wire 分配） |
| 1× 铜板 constructor | 20/min | 10 copper sheet/min |
| 余量 | 10/min | 带上自然背压回堵 |

### 5.5 混凝土（30/min）

2× constructor：90 石灰石 → 30 concrete/min

Splitter 分流：~15/min → S4 建材存储，~15/min → S6 钢系输出。

### 5.6 F3 组装层（4 台 assembler）

| 机位 | 配方 | 模式 | 满速输入 | 满速产出 | 输入来源 |
|------|------|------|---------|---------|---------|
| #1 | RIP | 固定 | 30 plate + 60 screw | 5 RIP/min | F2 plate + screw |
| #2 | Rotor | 固定 | 20 rod + 100 screw | 4 Rotor/min | F2 rod + screw |
| #3 | Modular Frame | 固定 | 3 RIP + 12 rod | 2 ModFrame/min | #1 RIP + F2 rod |
| #4 (flex) | **RIP**（默认）| 手动切 | 30 plate + 60 screw | 5 RIP/min | F2 plate + screw |

**注意**：由于共享 90 ingot/min 的产能，所有 assembler 无法同时满速运行。背压自动调节实际分配比例。

### 5.7 背压自动调节机制

F2 每种产品（plate / screw / rod）在出口处经过 splitter：
- 一路 → 升降机送 F3（assembler 消耗）
- 一路 → 升降机送 F1（存储输出）

**当 F3 assembler 输出存储满了：**

1. Assembler 停转 → 输入带堵塞
2. F2 splitter 的 F3 输出口堵塞
3. Splitter 自动将全部物料转发到 F1 存储输出口
4. 建材存储获得 100% 供给

**当玩家取走 F3 产品：**

1. Assembler 恢复运转 → 输入带畅通
2. Splitter 恢复分流 → F3 和 F1 各获得部分物料

**效果**：建材存储始终有供给（高优先级消耗品），F3 高级产品利用剩余产能生产。

### 5.8 机器总表

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
| Assembler | 1 | F3 | modular-frame (#3) |
| Assembler | 1 | F3 | reinforced-iron-plate (#4 flex) |
| Splitter/Merger | ~20 | 各层 | 物流分配 |
| 升降机对 | 8 对 | F1↔F2↔F3 | 层间传输 |
| 输出终端 Splitter | 7 | F1 南侧 | 输出接口 |

**总计**：21 台生产机器 + ~20 splitter/merger + 16 台升降机 + 7 台输出 splitter

---

## 6. 楼层架构

### 6.1 总览

| 层 | 功能 | 关键机器 |
|----|------|---------|
| **F1** | 冶炼 + 混凝土 + 输出终端 | 5 smelter, 2 concrete constructor, 7 output splitter |
| **F2** | 一级制造（10 台 constructor） | plate×2, rod×2, screw×2, wire×2, cable×1, sheet×1 |
| **F3** | 组装 + 产品汇流 + 预留扩展 | 4 assembler (RIP×2, Rotor, ModFrame) |

所有机器 **south-facing**，矿石/锭从北侧（back）进入，产品从南侧（front）输出。

### 6.2 物料主流向

```
北侧入口（4 条矿石带: E1-E4）
    ↓
F1（冶炼: 5 smelter + 混凝土: 2 constructor）
    ↓ L1/L2 升降机上送铁锭+铜锭
F2（制造: 10 constructor）
    ↓ L3/L4/L5 上送 plate+screw+rod 给 F3
    ↓ L6/L7 下送 F2 surplus 给 F1 输出
F3（组装: 4 assembler）
    ↓ L8 下送组装成品给 F1 输出
F1 南侧输出终端（7 个 splitter: S1-S7）→ 楼外存储 / 钢系
```

### 6.3 F1 布局概念

```
┌──────────── 12 cols (北=row 0) ─────────────────┐
│ Row 0-1:   4 入口带                               │
│  E1(铁90→smelter) E2(铁90→S5直通)                 │
│  E3(铜60→smelter) E4(石灰石90→concrete)           │
│                                                   │
│ Row 1-3:   [铁 smelter ×3]  [铜 smelter ×2]      │
│             左侧铁区        │  右侧铜区           │
│                                                   │
│ Row 3-5:   [混凝土 constructor ×2]                │
│            + 锭料 merger → 升降机 L1/L2 (送F2)    │
│            + 混凝土 splitter (S4/S6 分流)          │
│                                                   │
│ Row 5-7:   升降机区 (L6/L7/L8 产品下送到达)       │
│            + belt 分配网络 → 各输出终端             │
│                                                   │
│ Row 7-9:   输出终端带                              │
│  [S1][S2][S3][S4][S5][S6][S7]                     │
│                                                   │
│ Row 9-10:  南侧边距                               │
└───────────────────────────────────────────────────┘
```

### 6.4 F2 布局概念

```
┌──────────── 12 cols (北=row 0) ─────────────────┐
│ Row 0-1:   升降机出口 (L1 铁锭 / L2 铜锭)        │
│            + splitter 分配到各 constructor          │
│                                                   │
│ Row 1-4:   铁系 constructors (facing south)       │
│  [铁板×2] [铁棒×2] [螺丝×2]                       │
│  铁锭 → splitter → 铁板 pair / 铁棒 pair          │
│  铁棒 → splitter → 螺丝 pair / 剩余               │
│                                                   │
│ Row 4-7:   铜系 constructors (facing south)       │
│  [电线×2] [电缆×1] [铜板×1]                       │
│  铜锭 → splitter → 电线 pair / 铜板               │
│  电线 → merger → 电缆                             │
│                                                   │
│ Row 7-9:   产品分流 + 升降机                       │
│  每种产品 → splitter:                              │
│    out → L3/L4/L5 送 F3 (assembler)               │
│    out → L6/L7 送 F1 (存储输出)                    │
│                                                   │
│ Row 9-10:  预留空间                                │
└───────────────────────────────────────────────────┘
```

### 6.5 F3 布局概念

```
┌──────────── 12 cols (北=row 0) ─────────────────┐
│ Row 0-2:   升降机出口 (L3 plate / L4 screw / L5 rod) │
│            + splitter 分配到各 assembler            │
│                                                   │
│ Row 2-5:   4× assembler (facing south, 2.0格 deep) │
│  [RIP #1]  [Rotor #2]  [ModFrame #3]  [RIP #4 flex] │
│  #1: in-0=plate, in-1=screw → RIP                │
│  #2: in-0=screw, in-1=rod → Rotor                 │
│  #3: in-0=RIP(#1), in-1=rod → ModFrame           │
│  #4: in-0=plate, in-1=screw → RIP (可切SP)       │
│                                                   │
│ Row 5-7:   产品汇流区                             │
│  4台 assembler 产出 → merger → L8 下送 F1         │
│                                                   │
│ Row 7-10:  ★ 大面积预留空间 ★                     │
│  (未来扩展 / 加 assembler / 加 constructor)        │
└───────────────────────────────────────────────────┘
```

---

## 7. 升降机规划

| 编号 | 方向 | 物料 | 预估速率 | Mark | 楼层连接 |
|------|------|------|---------|------|---------|
| L1 | F1→F2 ↑ | 铁锭 | 90/min | Mk.2 | F1 lift-in-bottom → F2 lift-out-top |
| L2 | F1→F2 ↑ | 铜锭 | 60/min | Mk.1 | F1 lift-in-bottom → F2 lift-out-top |
| L3 | F2→F3 ↑ | 铁板 | ~20/min | Mk.1 | F2 lift-in-bottom → F3 lift-out-top |
| L4 | F2→F3 ↑ | 螺丝 | ~40/min | Mk.1 | F2 lift-in-bottom → F3 lift-out-top |
| L5 | F2→F3 ↑ | 铁棒 | ~10/min | Mk.1 | F2 lift-in-bottom → F3 lift-out-top |
| L6 | F2→F1 ↓ | 铁系 surplus (plate+rod+screw 混合) | ~60/min | Mk.1 | F2 lift-in-top → F1 lift-out-bottom |
| L7 | F2→F1 ↓ | 铜系产品 (wire+cable+sheet 混合) | ~50/min | Mk.1 | F2 lift-in-top → F1 lift-out-bottom |
| L8 | F3→F1 ↓ | 组装成品 (RIP+Rotor+ModFrame 混合) | ~15/min | Mk.1 | F3 lift-in-top → F1 lift-out-bottom |

**注意**：L3/L4/L5 的实际流量取决于背压状态。当 F3 assembler 全部停转时，这些 lift 流量为 0，所有产品走 L6/L7 到 F1 存储。

---

## 8. 输出终端配置（F1 南侧）

7 个 splitter 沿 F1 南侧排列，作为楼外 storage 的接口：

| 终端 | 物料 | 用途 | 来源 |
|------|------|------|------|
| **S1** | 铁系建材 (Plate + Rod + Screw 混合) | 建造存储 | L6 from F2 |
| **S2** | 组装产品 (RIP + Rotor + ModFrame 混合) | 建造存储 | L8 from F3 |
| **S3** | 铜系产品 (Wire + Cable + Sheet 混合) | 建造存储 | L7 from F2 |
| **S4** | 混凝土 ~15/min | 建造存储 | F1 concrete splitter |
| **S5** | 铁矿石 90/min | **钢系输出** | E2 直通 |
| **S6** | 混凝土 ~15/min | **钢系输出** | F1 concrete splitter |
| **S7** | 预留 (Smart Plating 手动激活时输出) | 太空电梯 | #4 flex assembler 切换后 |

- S1-S4：玩家在楼外接 industrial-storage，多类型混存
- S5-S6：钢系供给总线
- S7：默认空闲（R25 warn 正常），Smart Plating 模式时使用
- 其余未连接端口产生 R25 warn，不影响验证

---

## 9. 传送带等级

| 段落 | 最大流量 | 推荐 mark |
|------|---------|-----------|
| 铁矿石入口 E1/E2 各 90/min | 90 | Mk.2 |
| 铜矿石 E3 60/min | 60 | Mk.1 |
| 石灰石 E4 90/min | 90 | Mk.2 |
| 铁锭干线 90/min | 90 | Mk.2 |
| 铜锭干线 60/min | 60 | Mk.1 |
| F2 各 constructor 进出 | ≤60 | Mk.1 |
| F2→F3 升降机 | ≤40 | Mk.1 |
| F2/F3→F1 产品回送 | ≤60 | Mk.1 |
| 输出终端 S1-S4 | <60 | Mk.1 |
| 钢系输出 S5 (90/min) | 90 | Mk.2 |

---

## 10. Smart Plating 手动切换指南

### 默认状态（JSON 方案表示）

- Assembler #4 配方：**reinforced-iron-plate**
- 输入带连接：F2 plate 分流 + F2 screw 分流（与 RIP #1 相同来源类型）
- 输出带连接：→ merger → L8 → F1 S2 输出

### 切换到 Smart Plating 模式

玩家操作步骤：

1. 在 #4 assembler 上将配方改为 **Smart Plating**
2. 断开原有的 plate + screw 输入带
3. 将 in-0 连接到 RIP #1 assembler 的 out-0 输出带（RIP 供给）
4. 将 in-1 连接到 Rotor #2 assembler 的 out-0 输出带（Rotor 供给）
5. 可选：将输出带改接到 S7 专用终端

### 切换后影响

- RIP #1 产出被 #4 和 #3(ModFrame) 竞争，二者可能均降速
- Rotor #2 产出被 #4 消耗，Rotor 存储输出减少
- Smart Plating 产速取决于 RIP + Rotor 的供给（预估 ~1-2/min）

### 切回正常模式

改回 reinforced-iron-plate 配方，重接 plate + screw 输入带即可。

---

## 11. 配方速查表（已查证，来源 satisfactory.wiki.gg + data/recipes.json）

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
| Steel Ingot | foundry | 3 iron ore (45/min) + 3 coal (45/min) | 3 steel ingot (45/min) | 4s |

---

## 12. 高频建造材料覆盖分析

| 排名 | 材料 | 主要消耗场景 | 本方案状态 |
|------|------|------------|-----------|
| 1 | **Iron Plate** | 地基、墙壁、传送带 | ✅ S1 输出 |
| 2 | **Concrete** | 地基（大量消耗）、电线杆 | ✅ S4 输出 |
| 3 | **Iron Rod** | 传送带支架、电线杆 | ✅ S1 输出 |
| 4 | **Screw** | 几乎所有建筑子材料 | ✅ S1 输出 |
| 5 | **Wire** | 电力连接 | ✅ S3 输出 |
| 6 | **Cable** | 电线杆、电力基建 | ✅ S3 输出 |
| 7 | **Reinforced Iron Plate** | Splitter/Merger/Assembler | ✅ S2 输出 |
| 8 | **Copper Sheet** | 部分机器 | ✅ S3 输出 |
| 9 | **Modular Frame** | 机器建造成本 | ✅ S2 输出（背压自动） |
| 10 | **Rotor** | Smart Splitter、部分机器 | ✅ S2 输出（背压自动） |
| 11 | **Smart Plating** | 太空电梯 Phase 1 | ⚡ #4 flex 手动切换 |

**全覆盖**：前 10 名建材全部在线生产输出。Smart Plating 保留手动切换能力。

---

## 13. 垂直复制规格

### 模块接口定义

| 接口 | 位置 | 方向 | 速率/Mark |
|------|------|------|----------|
| E1 铁矿入口 | 北侧 row 0 | 入 | 90/min Mk.2 |
| E2 铁矿入口 | 北侧 row 0 | 入 | 90/min Mk.2 |
| E3 铜矿入口 | 北侧 row 0 | 入 | 60/min Mk.1 |
| E4 石灰石入口 | 北侧 row 0 | 入 | 90/min Mk.2 |
| S1-S7 输出 | 南侧 row 9-10 | 出 | 各 Mk.1-Mk.2 |

### 每份资源需求

- 铁矿 180/min（2 × Mk.1 矿机 on pure node，或 overclock）
- 铜矿 60/min（1 × Mk.1 矿机 on normal node）
- 石灰石 90/min（1-2 矿机）
- 电力：**~128 MW**（5 smelter×4 + 12 constructor×4 + 4 assembler×15）

---

## 14. 参考

- 前版 spec：`docs/superpowers/specs/2026-04-13-pre-steel-base-design.md`
- 现有方案：`data/schemes/iron-full-line-v2.json`（8×7, 2 层铁矿全产线）
- 建筑注册表：`src/core/registry.ts`
- 配方数据库：`data/recipes.json`（170 个配方）
- 验证规则：`src/core/schema.ts` — `validateSchemeDetailed()`
- 项目规则：`CLAUDE.md`（R1-R31 全部规则）
