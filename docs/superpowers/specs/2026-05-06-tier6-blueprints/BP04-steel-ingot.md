# BP4 钢锭 (C2)

## 概要

- **集群**: C2 钢系（C1 之后第 4 个蓝图）
- **规格**: Mk2 单实例（6 foundry 物理建造，T6 仅 5 台激活）
- **机器**: foundry（steel-ingot 配方：3 铁矿石 + 3 煤 → 3 钢锭/min）
- **激活时间线**: T6 **5** (202%) → T7 5 → T8 6 → T9 **6** (243%)
- **产能 T6**: 455/min 钢锭

## 机器超频清单（T6，Plan C ≤250%）

| 配方 | 数量 | 超频 | 单台产能 (/min) | Power Shard/台 |
|---|---:|---:|---:|---:|
| steel-ingot (foundry) | 5 | **202.0%** | 91.0 | 3 |
| **合计 (T6)** | 5 | — | — | 5×3 = **15** |

> 总产能验证: 5 × 91.0 = 455 钢锭 ✓

## 物料 I/O

| 方向 | 物料 | 流量 (T6) | 路径 |
|---|---|---|---|
| 输入 | 铁矿石 | 410/min | **矿场直喂** → 左 Wall Inlet (h=4m) |
| 输入 | 煤 | 410/min | **煤矿场直喂** → 左 Wall Inlet (h=4m，第二口) |
| 输出 | 钢锭 → BP5 | 455/min | **集群内部** → 右 Wall Outlet (h=22m) → BP5 左 Wall Inlet |

**屋顶总线接入**: 无（C2 集群内部短 belt 直连，不上 B1-B6）

## 楼层占用

| 层 | 高度 | 内容 | 数量 |
|---|---|---|---:|
| 1F | 0-9m | foundry（8m × 9m × 9m）| 3 |
| 2F | 13-22m | foundry | 2-3 |
| 屋顶 | 35-40m | B1-B6 直通 | — |

> foundry 8m × 9m，3 台一行 24m × 9m。1F 装 3 台 row=0 + 4F row=0 ↔ 23m 留 11m 给 lift。
> 2F 装 2 台（T6）/ 3 台（T9 满载）。

## 俯视图（1F, 0-9m）

### 1F (0-9m): 3 foundry

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌───────┐┌───────┐┌───────┐                       │
        ││ F1   ││ F2   ││ F3   │                          │
 4      ││steel ││steel ││steel │ T7+ T8 add F4 here       │
        ││ 8x9  ││ 8x9  ││ 8x9  │ (T9 satellite 6 total)   │
 8      ││  v   ││  v   ││  v   │                          │
10      │└──────┘└──────┘└──────┘                          │
        │─────────── steel-ingot collect belt h=2m ───────│
14      │                                                  │
        │ iron-ore in:  left Wall Inlet h=4m (row=2)       │
20      │ coal in:      left Wall Inlet h=4m (row=2.5)     │
        │   manifold splits to 3 foundry in-0 + in-1       │
26      │                                                  │
        │ steel-ingot out: lift to right Wall Outlet h=22m │
32      │                                                  │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- F1-F3：3 foundry（steel-ingot 配方）一字排 row=0，8m W × 9m L × 9m H
- 双输入：in-0 = 铁矿石 (back, offset 2)，in-1 = 煤 (back, offset 6)，左 Wall Inlet 两条进料 belt 平行 row=2/2.5

### 2F (13-22m): 2 foundry

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌───────┐┌───────┐                                 │
        ││ F4   ││ F5   │                                   │
 4      ││steel ││steel │ T7+ reserve F6 col=2 row=0        │
        ││ 8x9  ││ 8x9  │ (T8/T9 satellite 6 total)         │
 8      ││  v   ││  v   │                                   │
10      │└──────┘└──────┘                                   │
        │─────────── steel-ingot collect belt h=15m ──────│
14      │                                                  │
20      │ iron-ore + coal in: shared from 1F manifold      │
        │ steel-ingot out: lift-out-top to 22m main belt   │
26      │                                                  │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

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
28      │ B1-B6 all pass-through, no splitter/merger      │
32      │ (BP4 doesn't tap or feed any bus belt)          │
36      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- 钢锭走集群内短 belt (h=22m) 给 BP5；不上总线

## 建造步骤

1. **1F (0-9m)**: 3 台 foundry 一字排（col=0/1/2，row=0）
2. **1F 双进料**:
   - 铁矿石 belt：左 Wall Inlet (h=4m, row=0) → splitter manifold (5m row=0 row 1) → 3 个 in-0 端口
   - 煤 belt：左 Wall Inlet (h=4m, row=0.5 第二条) → 类似 manifold → 3 个 in-1 端口
   - 注：foundry 双 back 端口 in-0 (offset 2) + in-1 (offset 6)，两条进料 belt 平行
3. **1F belt 收集**: row=2 横向 Mk4 主 belt（钢锭）
4. **1F→2F**: 4m 地基 (9-13m)
5. **2F (13-22m)**: 2 台 foundry（col=0/1）；同样 row=2 收集
6. **垂直汇总**: 1F + 2F 主 belt 末端 → lift-out-top 到 22m
7. **右 Wall Outlet** (col=5, h=22m, row=2)：钢锭 455/min 出去
8. **屋顶 (35-40m)**: 6 belt 直通
9. **Power Switch**: 闲置 1 台（2F col=2，T6 不开）

## Tier 7+ 扩容点

| Tier | 总数 | BP4 |
|---|---:|---|
| T6 | 5 | 1F 3 + 2F 2 |
| T7 | 5 | 不变 |
| T8 | 6 | +1 2F |
| T9 | 6 | 满载 1F 3 + 2F 3 @ 243% |

> 钢链整体 uplift 较小（1.4-1.6x），BP4/BP5 是少数物理建造接近满载的蓝图。

## 验证

- [ ] foundry 双输入 belt 正确分配（in-0=铁矿石、in-1=煤）
- [ ] 钢锭出口与 BP5 左 Wall Inlet 同 h=22m row=2 对齐
- [ ] 矿场容量预留 1500/min（Tier 9 煤需求）
