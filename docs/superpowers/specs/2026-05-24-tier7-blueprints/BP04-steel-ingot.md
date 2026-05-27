# BP4 钢锭 (C2)

## 概要

- **集群**: C2 钢系（C1 之后第 4 个蓝图）
- **规格**: Mk2 单实例
- **机器**: **6 foundry 一次物理建造到位**（steel-ingot 配方：3 铁矿石 + 3 煤 → 3 钢锭/min）
- **激活时间线**（仅翻 Power Switch + 插 Power Shard，不动结构）:
  - T6 → 5 台通电
  - T7 → 5 台通电（不变）
  - T8 → 6 台通电
  - T9 → 6 台通电（满载 243%）
- **产能**: T6 455 /min 钢锭

> **核心设计原则**：6 台 foundry T6 阶段就全部摆好 + belt/manifold/电网/Power Switch 全部接好。后续升 Tier 只翻 Switch + 插 shard，不动结构、不重新拉 belt。

## 机器超频清单（T6，Plan C ≤250%）

| 配方 | 物理 | T6 通电 | 超频 | 单台产能 (/min) | Power Shard/通电台 |
|---|---:|---:|---:|---:|---:|
| steel-ingot (foundry) | 6 | **5** | 202.0% | 91.0 | 3 |
| **合计 (T6)** | 6 | 5 | — | 5 × 91.0 = **455** | 5 × 3 = **15** |

> T6 未通电的 1 台 foundry：物理建好、belt 接好、shard 槽空着、Power Switch 关。<br>
> T9 满载 6 台 @ 243% = 645/min 钢锭，每台 3 shard = **18 shard 总**。

## 物料 I/O

| 方向 | 物料 | 流量 (T6 / T9) | 路径 |
|---|---|---|---|
| 输入 | 铁矿石 | 410 / 580 | **矿场直喂** → 左 Wall Inlet (h=4m) |
| 输入 | 煤 | 410 / 580 | **煤矿场直喂** → 左 Wall Inlet (h=4m, 第二口) |
| 输出 | 钢锭 → BP5 | 455 / 645 | 集群内部 → 右 Wall Outlet (h=22m) → BP5 左 Wall Inlet |

**屋顶总线接入**: 无（C2 集群内部短 belt 直连，不上 B1-B6）

## 楼层占用

| 层 | 高度 | 内容 | 物理 | T6 通电 |
|---|---|---|---:|---:|
| 1F | 0-9m | foundry row 0 (3 台 F1-F3) | 3 | **3** |
| 4m 地基 | 9-13m | 隔层 | — | — |
| 2F | 13-22m | foundry row 0 (3 台 F4-F6) | 3 | **2** |
| 屋顶 | 35-40m | B1-B6 直通 | — | — |

> **T6 阶段**：1F 全 3 台通电（Network A），2F F4/F5 通电（Network B），F6 Power Switch 关（Network C 待 T8 启用）。所有 belt / lift / manifold / Power Switch 一次到位。

## 俯视图

**图例**：`*` = T6 通电；无 `*` = 已建未通电；`v` = front (south) 输出

### 1F (0-9m): 3 foundry — T6 全部通电

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌───────┐┌───────┐┌───────┐                       │
        ││ F1*  ││ F2*  ││ F3*  │  row 0: 3 台              │
 4      ││steel ││steel ││steel │  T6 全通电                │
        ││ 8x9  ││ 8x9  ││ 8x9  │  (Network A)              │
 8      ││  v   ││  v   ││  v   │                           │
10      │└──────┘└──────┘└──────┘                           │
        │─────────── steel-ingot collect belt h=2m ────────│
14      │ iron-ore in: left Wall Inlet h=4m row=2           │
        │ coal in:     left Wall Inlet h=4m row=2.5         │
20      │   manifold splits to all 6 foundry in-0 + in-1    │
        │   (1F 直喂 3 台 + lift-up 喂 2F 3 台)             │
26      │ steel-ingot out: lift to right Wall Outlet h=22m  │
32      │                                                   │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- F1-F3：3 foundry（steel-ingot），T6 全通电
- 双输入：in-0 = 铁矿石 (back, offset 2)，in-1 = 煤 (back, offset 6)
- 左 Wall Inlet 两条进料 belt 平行 row=2/2.5，manifold 喂全部 6 台

### 2F (13-22m): 3 foundry — F4/F5 通电 + F6 Switch 关

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌───────┐┌───────┐┌───────┐                       │
        ││ F4*  ││ F5*  ││  F6  │  row 0: 3 台              │
 4      ││steel ││steel ││steel │  F4/F5 T6 通电 (Net B)    │
        ││ 8x9  ││ 8x9  ││ 8x9  │  F6 T6 Switch OFF (Net C) │
 8      ││  v   ││  v   ││  v   │     → T8 翻 ON            │
10      │└──────┘└──────┘└──────┘                           │
        │─────────── steel-ingot collect belt h=15m ───────│
14      │ iron-ore + coal in: lift-up 从 1F manifold        │
20      │   (接到全部 3 台 in-0 + in-1，F6 即使 OFF 也接好) │
        │ steel-ingot out: lift-out-top to 22m main belt    │
26      │                                                   │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- F4-F6：3 foundry 物理建造完整；T6 阶段 F4/F5 通电、F6 Power Switch 关
- belt manifold + lift 一次接到所有 3 台 in-0/in-1/front

### 屋顶 (35-40m): B1-B6 直通

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │ o B1 ────────────────────────────────────── o   │
 4      │ o B2 ────────────────────────────────────── o   │
 8      │ o B3 ────────────────────────────────────── o   │
12      │ o B4 ────────────────────────────────────── o   │
16      │ o B5 ────────────────────────────────────── o   │
20      │ o B6 ────────────────────────────────────── o   │
24      │                                                 │
28      │ B1-B6 全部 pass-through，无 splitter/merger     │
32      │ (BP4 不取/不注总线，钢锭走集群内短 belt 给 BP5) │
36      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

## Power Switch 分网

| 网 | 范围 | 数量 | T6 状态 | 升级触发 |
|---|---|---:|---|---|
| Network A | 1F F1-F3 | 3 | **ON** | — |
| Network B | 2F F4-F5 | 2 | **ON** | — |
| Network C | 2F F6 | 1 | OFF | T8 翻 ON |

> 3 个 Switch T6 一次安装好；T6 合 A+B，C 留待 T8。

## 建造步骤

1. **框架**：5×5 cell × 5 cell 高（40×40×40m）
2. **1F (0-9m)**: 3 台 foundry F1-F3 一字排（col=0/1/2 row=0）
3. **1F 双进料**:
   - 铁矿石 belt：左 Wall Inlet (h=4m, row=2) → splitter manifold → 全部 6 台 in-0
   - 煤 belt：左 Wall Inlet (h=4m, row=2.5) → splitter manifold → 全部 6 台 in-1
4. **1F belt 收集**: row=2 横向 Mk5 主 belt 收钢锭
5. **1F 地基**: y=9m 铺 4m 厚地基
6. **2F (13-22m)**: **同 1F 布局**放 3 台 foundry F4-F6（col=0/1/2 row=0）
7. **2F belt**: row=2 横向 Mk5 收集 belt + lift-out-top
8. **垂直汇总**: 1F + 2F belt 末端 → lift-out-top 到 22m
9. **右 Wall Outlet** (col=5, h=22m, row=2)：钢锭出口
10. **左 Wall Inlet** (col=0, h=4m): 两条进料 belt
11. **屋顶 (35-40m)**: 6 belt 直通
12. **Power Switch ×3**：Network A/B/C 一次装好；T6 合 A+B，C 断开
13. **Power Shard（T6）**：F1-F5 各插 3 shard 调 202%；F6 槽空着

## Tier 7+ 启用流程（仅翻 Switch + 插 shard，不动结构）

| Tier | 操作 | 通电总数 |
|---|---|---:|
| T7 | 无变化 | 5 |
| T8 | 翻 Network C Switch ON → F6 插 3 shard | 6 |
| T9 | 6 台全部超频调到 243%；矿场来料 belt 已升 Mk5（580/min < 780 ✓） | 6 |

## 验证

- [ ] **6 台 foundry 全部物理放置**（包括 T6 不通电的 F6）
- [ ] 双进料 manifold 接到全部 6 台 in-0 + in-1（不只是 T6 通电的 5 台）
- [ ] 3 个 Power Switch 一次建好，Network A/B 合上，C 断开
- [ ] T6 仅 F1-F5 插了 3 shard；F6 物理就位但 shard 槽空
- [ ] 钢锭出口与 BP5 左 Wall Inlet 同 h=22m row=2 对齐
- [ ] 屋顶 6 belt 直通无 splitter
- [ ] 矿场来料 belt 已升 Mk5（铁矿 580 / 煤 580 < 780 ✓）
