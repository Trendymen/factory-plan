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

## 2. 已确认的设计决策

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

## 3. 生产规划

### 3.1 原矿输入（从北侧进入 F1）

| 矿石 | 输入速率 | 分配 |
|------|---------|------|
| 铁矿石 | 120/min | 60 → 2 smelter → 铁锭 60/min；60 → 钢系直通输出 |
| 铜矿石 | 60/min | 60 → 2 smelter → 铜锭 60/min |
| 石灰石 | 90/min | 90 → 2 constructor → 混凝土 30/min |

### 3.2 铁锭分配（60/min）

| 去向 | 消耗铁锭 | 产出 |
|------|---------|------|
| 1× 铁板 constructor | 30/min | 20 iron plate/min |
| 1× 铁棒 constructor | 15/min | 15 iron rod/min → 存储 |
| 1× 铁棒→螺丝 constructor 链 | 15/min → 15 rod → 10 rod 入螺丝机 | 40 screw/min + 5 rod/min 余量 |
| **合计** | **60/min** | — |

### 3.3 铜锭分配（60/min）

| 去向 | 消耗铜锭 | 产出 |
|------|---------|------|
| 2× 电线 constructor | 30/min | 60 wire/min → 全部入 cable |
| 1× 电缆 constructor | (60 wire) | 30 cable/min |
| 1× 铜板 constructor | 20/min | 10 copper sheet/min |
| 余量 | 10/min | 可存储或未来扩展 |

### 3.4 F3 组装

| 配方 | 需要 | 实际供给 | 产出 |
|------|------|---------|------|
| 强化铁板 (RIP) | 30 plate + 60 screw | ~20 plate + ~40 screw（~67%利用率） | ~3.3 RIP/min |

### 3.5 机器总表

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

## 4. 楼层架构

### 4.1 总览

| 层 | 功能 | 关键机器 |
|----|------|---------|
| **F1** | 冶炼 + 混凝土 + 输出终端 | 4 smelter, 2 concrete constructor, 6 output splitter |
| **F2** | 一级制造（8 台 constructor） | plate, rod, screw, wire, cable, sheet |
| **F3** | 组装 + 产品汇流 + 预留扩展 | 1 RIP assembler + 大面积预留 |

所有机器 **south-facing**，矿石/锭从北侧（back）进入，产品从南侧（front）输出。

### 4.2 物料主流向

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

### 4.3 F1 布局概念

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

### 4.4 F2 布局概念

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

### 4.5 F3 布局概念

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

## 5. 升降机规划

| 编号 | 方向 | 物料 | 楼层连接 |
|------|------|------|---------|
| L1 | F1→F2 | 铁锭 60/min | F1 lift-in-bottom → F2 lift-out-top |
| L2 | F1→F2 | 铜锭 60/min | F1 lift-in-bottom → F2 lift-out-top |
| L3 | F2→F3 | 铁板 ~20/min | F2 lift-in-bottom → F3 lift-out-top |
| L4 | F2→F3 | 螺丝 ~40/min | F2 lift-in-bottom → F3 lift-out-top |
| L5 | F2→F1 | 铁棒+螺丝+铜制品（合流） | F2 lift-in-top → F1 lift-out-bottom |
| L6 | F3→F1 | RIP + 其他成品 | F3 lift-in-top → F1 lift-out-bottom |

---

## 6. 输出终端配置（F1 南侧）

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

## 7. 传送带等级

| 段落 | 最大流量 | 推荐 mark |
|------|---------|-----------|
| 铁矿石主干 120/min | 120 | Mk.2 |
| 铜矿石/石灰石 60-90/min | 90 | Mk.2 |
| 铁锭/铜锭干线 60/min | 60 | Mk.1 |
| 各 constructor 进出 15-45/min | 45 | Mk.1 |
| 产品汇流线 | ~80 | Mk.2 |
| 输出终端 | <60 | Mk.1 |

---

## 8. 配方速查表（已查证，来源 satisfactory.wiki.gg）

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

## 9. 待办事项（下次会话继续）

- [ ] **补充高频建材调研**：确认除铁板/铁棒/螺丝/电线/电缆/铜板/混凝土/强化铁板外，是否还有其他 pre-steel 高频建造材料需要加入存储输出（候选：Modular Frame、Rotor）
- [ ] **用户最终确认设计**
- [ ] **Spec 自审**：检查占位符、矛盾、歧义
- [ ] **写实施计划**：调用 writing-plans 技能，拆分为具体的 JSON 编写步骤
- [ ] **实现 JSON 方案**：按实施计划生成 `data/schemes/pre-steel-base.json`
- [ ] **运行验证**：`npx vitest run` 确认通过所有规则
- [ ] **Diagnostics 检查**

---

## 10. 参考

- 现有方案：`data/schemes/iron-full-line-v2.json`（8×7, 2层铁矿全产线）
- 建筑注册表：`src/core/registry.ts`
- 配方数据库：`data/recipes.json`（170 个配方）
- 验证规则：`src/core/schema.ts` — `validateSchemeDetailed()`
- 项目规则：`CLAUDE.md`（R1-R31 全部规则）
