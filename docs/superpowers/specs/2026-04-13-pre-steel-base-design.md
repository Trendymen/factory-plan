# 铜铁石灰石基础产线 3F — 设计规格

> 状态：**设计中（待补充高频建材调研 + 用户最终确认）**
> 创建：2026-04-13
> 方案文件名（预定）：`data/schemes/pre-steel-base.json`

---

## 1. 项目背景

为 Satisfactory 工厂蓝图查看系统新建一个 JSON 蓝图方案，覆盖**钢之前**的铜/铁/石灰石三矿全产线。

目前项目仅有一个方案 `iron-full-line-v2.json`（铁矿全产线 v2，2层 8×7），本方案是对其的扩展——加入铜和石灰石。

### 核心需求

1. **多层建筑，每层面积相同**，层数与面积由设计决定
2. **涵盖铁+铜+石灰石→钢之前所有核心产物**
3. **为常用建造材料设计输出终端**（铁板、铁棒、螺丝、电线、电缆、铜板、混凝土、强化铁板等）
4. **输出终端在 F1 南侧边缘**，传送带延伸到楼层边界，玩家自行在楼外放置 storage
5. **优先多类型同存储**（industrial-storage 2输入口混存），不搞单类型存储器
6. **为钢系预留充足输出**：铁矿石直通 + 混凝土输出
7. **可复制扩产**：整栋建筑作为标准化模块，需求增长时批量建造或加层

### 关键发现

- **Steel Ingot 标准配方直接消耗 Iron Ore（不是 Iron Ingot）+ Coal → Foundry**
- 因此铁矿石需要在入口处分流：一部分进 smelter 做铁制品，一部分直接输出给钢系
- Encased Industrial Beam 需要 Concrete，所以混凝土也需要部分输出

---

## 2. 方案选型

评估了 3 种架构方案：

### 方案 A：工序分层 3F（✅ 最终选择）

按加工阶段分层：F1 冶炼 → F2 制造 → F3 组装，物料自然从下往上流。

**优点**：
- 流程清晰，同类机器集中管理
- 存储/输出在底层（F1），玩家取用最方便
- 传送带布线最简洁（同类机器排列整齐）
- F3 组装层有大面积预留空间，未来可加 Rotor/Modular Frame

**缺点**：
- 升降机数量较多（F1↔F2, F2↔F3, F3→F1 回送成品）

### 方案 B：矿石分层 3F（❌ 排除）

每层处理一种矿石：F1 铁区、F2 铜区、F3 石灰石+组装。

**排除原因**：
- F3 石灰石区过于空旷浪费空间（只有 2 台 concrete constructor）
- 组装需要跨层取料（铁板+螺丝从 F1，混凝土从 F3），升降机路径复杂
- 铜产品也需要升降机下送到 F1 存储区，层间物流不如方案 A 清晰

### 方案 C：紧凑双层 12×10（❌ 排除）

大面积双层：F1 全部冶炼+制造，F2 组装+输出。

**排除原因**：
- F1 极度拥挤（~14 台生产机器 + 物流网络挤在一层）
- 布线困难，belt 容易碰撞和绕路
- 难以扩展，加机器无处可放

---

## 3. 扩产策略

本蓝图设计为**标准化可复制模块**，当后续钢系生产对铜铁石灰需求增加时，有两种扩产路径：

### 路径 1：批量建造（推荐）

在游戏地图中**并排建造多栋相同蓝图**，每栋处理一组矿机输出。优点是每栋完全独立，互不干扰。

- 每栋处理：铁矿 120/min + 铜矿 60/min + 石灰石 90/min
- 需要 2 栋 → 铁矿 240/min, 铜矿 120/min, 石灰石 180/min
- 所有建筑的 S5/S6 输出终端汇入同一条钢系供给总线

### 路径 2：垂直加层

在现有建筑顶部**增加楼层**来扩大产能：
- 加一层 F1'（冶炼层）→ 增加冶炼吞吐
- 加一层 F2'（制造层）→ 增加制造吞吐
- 需要额外的升降机将新增楼层的产物接入现有物流网络

**注意**：垂直加层需要修改 JSON 方案（增加 floors 条目 + 新机器 + 新升降机），复杂度高于批量建造。钢系产物种类不定、需求弹性大，因此**推荐路径 1（批量建造）**作为主要扩产方式。

---

## 4. 已确认的设计决策

| 决策项 | 结论 | 备注 |
|--------|------|------|
| 架构方案 | **方案 A：工序分层 3F** | 按加工阶段分层，物料自然从下往上流 |
| 网格尺寸 | **10 cols × 8 rows**（80m × 64m）× 3 层 | 与现有 8×7 风格接近 |
| 铁矿石输入 | **120/min** | 60→冶炼制品, 60→钢系直通 |
| 铜矿石输入 | **60/min** | 全部→铜制品 |
| 石灰石输入 | **90/min** | 全部→混凝土（部分存储，部分钢系输出） |
| 存储位置 | **不在方案内** | F1 南侧放 splitter 作输出终端，玩家楼外自建 storage |
| 传送带等级 | 按需混用 Mk.1 / Mk.2 | 主干线 Mk.2（120/min），支线 Mk.1 |

---

## 5. 生产规划

### 5.1 原矿输入（从北侧进入 F1）

| 矿石 | 输入速率 | 分配 |
|------|---------|------|
| 铁矿石 | 120/min | 60 → 2 smelter → 铁锭 60/min；60 → 钢系直通输出 |
| 铜矿石 | 60/min | 60 → 2 smelter → 铜锭 60/min |
| 石灰石 | 90/min | 90 → 2 constructor → 混凝土 30/min |

### 5.2 铁锭分配（60/min）

| 去向 | 消耗铁锭 | 产出 |
|------|---------|------|
| 1× 铁板 constructor | 30/min | 20 iron plate/min |
| 1× 铁棒 constructor | 15/min | 15 iron rod/min → 存储 |
| 1× 铁棒→螺丝 constructor 链 | 15/min → 15 rod → 10 rod 入螺丝机 | 40 screw/min + 5 rod/min 余量 |
| **合计** | **60/min** | — |

### 5.3 铜锭分配（60/min）

| 去向 | 消耗铜锭 | 产出 |
|------|---------|------|
| 2× 电线 constructor | 30/min | 60 wire/min → 全部入 cable |
| 1× 电缆 constructor | (60 wire) | 30 cable/min |
| 1× 铜板 constructor | 20/min | 10 copper sheet/min |
| 余量 | 10/min | 可存储或未来扩展 |

### 5.4 F3 组装

| 配方 | 需要 | 实际供给 | 产出 |
|------|------|---------|------|
| 强化铁板 (RIP) | 30 plate + 60 screw | ~20 plate + ~40 screw（~67%利用率） | ~3.3 RIP/min |

### 5.5 机器总表

| 类型 | 数量 | 楼层 | 配方 |
|------|------|------|------|
| Smelter | 2 | F1 | iron-ingot |
| Smelter | 2 | F1 | copper-ingot |
| Constructor | 2 | F1 | concrete |
| Constructor | 1 | F2 | iron-plate |
| Constructor | 1 | F2 | iron-rod（→存储） |
| Constructor | 1 | F2 | iron-rod（→螺丝链） |
| Constructor | 1 | F2 | screw |
| Constructor | 2 | F2 | wire |
| Constructor | 1 | F2 | cable |
| Constructor | 1 | F2 | copper-sheet |
| Assembler | 1 | F3 | reinforced-iron-plate |
| Splitter/Merger | ~12 | 各层 | 物流分配 |
| 升降机对 | ~6 对 | F1↔F2, F2↔F3 | 层间传输 |
| 输出终端 Splitter | 6 | F1 南侧 | 输出接口 |

---

## 6. 楼层架构

### 6.1 总览

| 层 | 功能 | 关键机器 |
|----|------|---------|
| **F1** | 冶炼 + 混凝土 + 输出终端 | 4 smelter, 2 concrete constructor, 6 output splitter |
| **F2** | 一级制造（8 台 constructor） | plate, rod, screw, wire, cable, sheet |
| **F3** | 组装 + 产品汇流 + 预留扩展 | 1 RIP assembler + 大面积预留 |

所有机器 **south-facing**，矿石/锭从北侧（back）进入，产品从南侧（front）输出。

### 6.2 物料主流向

```
北侧入口（矿石）
    ↓
F1（冶炼 + 混凝土）
    ↓ 升降机上送锭料
F2（制造：plate, rod, screw, wire, cable, sheet）
    ↓ 升降机上送 plate+screw
F3（组装：RIP）
    ↓ 升降机下送成品
F1 南侧输出终端（6 个 splitter）→ 楼外存储 / 钢系
```

### 6.3 F1 布局概念

```
┌──────────── 10 cols (北=row 0) ─────────────┐
│ Row 0-1:   矿石入口 + 铁矿石分流器(60/60)    │
│            铜矿石/石灰石入口                   │
│                                               │
│ Row 1-2.5: [铁 smelter ×2] [铜 smelter ×2]   │
│             左侧铁区      │    右侧铜区        │
│                                               │
│ Row 2.5-4: [混凝土 constructor ×2]            │
│            + 铁锭/铜锭 合流 & 升降机(送F2)     │
│                                               │
│ Row 4-6:   升降机区(F2/F3 产品下送)            │
│            + belt 分配网络                     │
│                                               │
│ Row 6.5-7.5: 输出终端带                       │
│ [S1][S2][S3][S4][S5][S6]                      │
└───────────────────────────────────────────────┘
```

### 6.4 F2 布局概念

```
┌──────────── 10 cols (北=row 0) ─────────────┐
│ Row 0-1:   升降机出口(铁锭/铜锭从 F1 上来)    │
│            + splitter 分配网络                 │
│                                               │
│ Row 1-3:   铁系 constructors (facing south)   │
│  [铁板×1] [铁棒×1] [铁棒→螺丝链 ×1+1]         │
│                                               │
│ Row 3-5:   铜系 constructors (facing south)   │
│  [电线×2] [电缆×1] [铜板×1]                   │
│                                               │
│ Row 5-7:   产品汇流 + 升降机                   │
│  成品 merger → lift(送 F3)                     │
│  部分成品 → lift(直送 F1 输出)                  │
│                                               │
│ Row 7-8:   预留空间                            │
└───────────────────────────────────────────────┘
```

### 6.5 F3 布局概念

```
┌──────────── 10 cols (北=row 0) ─────────────┐
│ Row 0-1:   升降机出口(铁板+螺丝从 F2 上来)    │
│                                               │
│ Row 1-4:   RIP assembler (1.125×2.0)          │
│            in-0: 铁板, in-1: 螺丝             │
│                                               │
│ Row 4-6:   产品汇流区                         │
│            RIP + F2 直送产品 → merger           │
│            → lift(全部下送 F1)                  │
│                                               │
│ Row 6-8:   大面积预留空间                      │
│            (未来加 Rotor / Modular Frame)       │
└───────────────────────────────────────────────┘
```

---

## 7. 升降机规划

| 编号 | 方向 | 物料 | 楼层连接 |
|------|------|------|---------|
| L1 | F1→F2 | 铁锭 60/min | F1 lift-in-bottom → F2 lift-out-top |
| L2 | F1→F2 | 铜锭 60/min | F1 lift-in-bottom → F2 lift-out-top |
| L3 | F2→F3 | 铁板 ~20/min | F2 lift-in-bottom → F3 lift-out-top |
| L4 | F2→F3 | 螺丝 ~40/min | F2 lift-in-bottom → F3 lift-out-top |
| L5 | F2→F1 | 铁棒+螺丝+铜制品（合流） | F2 lift-in-top → F1 lift-out-bottom |
| L6 | F3→F1 | RIP + 其他成品 | F3 lift-in-top → F1 lift-out-bottom |

---

## 8. 输出终端配置（F1 南侧）

6 个 splitter 沿 F1 南侧边缘排列，作为楼外 storage 的接口：

| 终端 | 物料 | 用途 | 来源 |
|------|------|------|------|
| **S1** | 铁板 + 强化铁板 | 建造存储 | F2 铁板 + F3 RIP，F1 merger 合流 |
| **S2** | 铁棒 + 螺丝 | 建造存储 | L5 from F2 |
| **S3** | 电线 + 电缆 | 建造存储 | L5 from F2 |
| **S4** | 铜板 + 混凝土 | 建造存储 | L5 from F2 + F1 concrete |
| **S5** | 铁矿石 60/min | **钢系输出** | F1 入口直分 |
| **S6** | 混凝土 ~15/min | **钢系输出** | F1 concrete splitter |

- S1-S4：玩家在楼外接 industrial-storage，多类型混存
- S5-S6：玩家接传送带送往钢系生产建筑
- splitter 未连接的输出端口产生 R25 warn，不影响验证

---

## 9. 传送带等级

| 段落 | 最大流量 | 推荐 mark |
|------|---------|-----------|
| 铁矿石主干 120/min | 120 | Mk.2 |
| 铜矿石/石灰石 60-90/min | 90 | Mk.2 |
| 铁锭/铜锭干线 60/min | 60 | Mk.1 |
| 各 constructor 进出 15-45/min | 45 | Mk.1 |
| 产品汇流线 | ~80 | Mk.2 |
| 输出终端 | <60 | Mk.1 |

---

## 10. 配方速查表（已查证，来源 satisfactory.wiki.gg）

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
| Steel Ingot | foundry | 3 iron ore (45/min) + 3 coal (45/min) | 3 steel ingot (45/min) | 4s |

---

## 11. 高频建造材料分析

Pre-steel 阶段，玩家建造工厂基建最常消耗的材料（按频率排序）：

| 排名 | 材料 | 主要消耗场景 | 本方案是否生产+输出 |
|------|------|------------|-------------------|
| 1 | **Iron Plate 铁板** | 地基、墙壁、传送带、几乎所有机器 | ✅ S1 输出 |
| 2 | **Concrete 混凝土** | 地基（大量消耗）、电线杆 | ✅ S4 输出 |
| 3 | **Iron Rod 铁棒** | 传送带支架、电线杆、走道栏杆 | ✅ S2 输出 |
| 4 | **Screw 螺丝** | 几乎所有建筑的子材料 | ✅ S2 输出 |
| 5 | **Wire 电线** | 电力连接、Cable 子材料 | ✅ S3 输出 |
| 6 | **Cable 电缆** | 电线杆、电力基建、部分机器 | ✅ S3 输出 |
| 7 | **Reinforced Iron Plate 强化铁板** | Splitter/Merger、Assembler、Rotor 子材料 | ✅ S1 输出 |
| 8 | **Copper Sheet 铜板** | 部分机器（Rotor 替代配方）、里程碑 | ✅ S4 输出 |
| 9 | **Modular Frame 模块化框架** | Constructor、Assembler、升降机等机器建造成本 | ⚠️ 未生产（见下方说明） |
| 10 | **Rotor 转子** | Smart Splitter、部分机器、里程碑 | ⚠️ 未生产（见下方说明） |

### 关于 Modular Frame 和 Rotor

这两个产品虽然是高频建材，但本方案**有意不纳入生产**，原因：

1. **Rotor** 需要 20 rod/min + 100 screw/min — 仅螺丝需求就是本方案全部螺丝产能（40/min）的 2.5 倍，完全无法满足
2. **Modular Frame** 需要 3 RIP/min + 12 rod/min — 而本方案 RIP 产出仅 ~3.3/min，全部投入 Modular Frame 后就无法存储 RIP 了
3. 这两个产品的生产链较深（需要消耗大量铁棒+螺丝），如果在本方案内生产，会大幅挤占基础材料（铁板、铁棒、螺丝）的存储输出量

**推荐做法**：Modular Frame 和 Rotor 由现有的 `iron-full-line-v2` 方案（专用铁矿全产线）负责生产。本方案专注于三矿基础材料 + 强化铁板的高效输出和存储。

如果未来确实需要在本方案内增加 Rotor/Modular Frame，可在 **F3 预留空间**部署 assembler，但需要同时在 F1/F2 增加铁棒和螺丝的产能（加 smelter + constructor），这属于扩产范畴。

---

## 12. 待办事项（下次会话继续）

- [ ] **用户最终确认设计**
- [ ] **写实施计划**：拆分为具体的 JSON 编写步骤（楼层→机器定位→传送带→升降机→输出终端）
- [ ] **实现 JSON 方案**：生成 `data/schemes/pre-steel-base.json`
- [ ] **运行验证**：`npx vitest run` 确认通过所有规则（R1-R31）
- [ ] **Diagnostics 检查**

---

## 13. 参考

- 现有方案：`data/schemes/iron-full-line-v2.json`（8×7, 2层铁矿全产线）
- 建筑注册表：`src/core/registry.ts`
- 配方数据库：`data/recipes.json`（170 个配方）
- 验证规则：`src/core/schema.ts` — `validateSchemeDetailed()`
- 项目规则：`CLAUDE.md`（R1-R31 全部规则）
