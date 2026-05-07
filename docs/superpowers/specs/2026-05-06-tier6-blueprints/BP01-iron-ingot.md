# BP1 铁锭 (C1)

## 概要

- **集群**: C1 铁系（最前端，整厂第一蓝图）
- **规格**: Mk2 单实例
- **机器**: 18 smelter（iron-ingot 配方）
- **激活时间线**: T6 **9** (226.11%) → T7 14 → T8 16 → T9 **18** (237%)
- **产能 T6**: 610.5/min 铁锭

## 机器超频清单（T6，Plan C ≤250%）

| 配方 | 数量 | 超频 | 单台产能 (/min) | Power Shard/台 |
|---|---:|---:|---:|---:|
| iron-ingot (smelter) | 9 | **226.11%** | 67.83 | 3 |
| **合计 (T6)** | 9 | — | — | 9×3 = **27** |

> 总产能验证: 9 × 67.83 = 610.5 铁锭 ✓
> T9 满载 18 台 @ 237% 时仍是 3 shard/台 = 54 shard 总。

## 物料 I/O

| 方向 | 物料 | 流量 (T6/T9) | 路径 |
|---|---|---|---|
| 输入 | 铁矿石 | 610.5 / 1140 | 矿场 belt → **左 Wall Inlet** (col=0, h=4m) |
| 输出 | 铁锭 | 610.5 / 1140 | 集群内部 → **右 Wall Outlet** (col=5, h=24m) → BP2 左 Wall Inlet |

**屋顶总线接入**: 无（铁锭走集群内短 belt 直连 BP2，不上 B1-B6）

## 楼层占用

| 层 | 高度 | 内容 | 数量 |
|---|---|---|---:|
| 1F | 0-10m | smelter 一字排（5 台跨 col 0→4，每台 6m 宽×9m 长）| 5 |
| 4m 地基 | 10-14m | 隔层 | — |
| 2F | 14-24m | smelter 一字排（4 台跨 col 0→3）| 4 |
| 屋顶 | 35-40m | B1-B6 6 条 Mk4 直通 | — |

> 1F + 2F 共 9 台（T6 激活）；剩 9 台**Tier 7+ 才补建**——预留 col=4 行 + 第 3 层 (28-38m) 空地。

## 俯视图（按实际比例，每层独立）

### 1F (0-10m): 5 smelter

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐                │
        ││ S1  ││ S2  ││ S3  ││ S4  ││ S5  │                │
 4      ││iron ││iron ││iron ││iron ││iron │ T7+ reserve    │
        ││ 6x9 ││ 6x9 ││ 6x9 ││ 6x9 ││ 6x9 │ for 4 more     │
 8      ││  v  ││  v  ││  v  ││  v  ││  v  │ smelter (3F+)  │
10      │└─────┘└─────┘└─────┘└─────┘└─────┘                │
        │─────────── iron-ingot collect belt h=2m ────────│
14      │                                                  │
        │ iron-ore in: left Wall Inlet h=4m row=2.5        │
20      │   manifold splits to 5 smelter in-0 (back)       │
        │                                                  │
26      │ iron-ingot out: lift to right Wall Outlet h=24m  │
        │                                                  │
32      │                                                  │
        │                                                  │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- S1-S5：5 smelter（铁锭配方）一字排 row=0，6m W × 9m L × 10m H
- 铁矿石进料：左 Wall Inlet (h=4m) → splitter manifold 喂 5 台 in-0 (back)
- 铁锭输出：5 台 front 输出 → row=2.5 主 belt → 1F+2F 合流 lift → 右 Wall Outlet (h=24m)

### 2F (14-24m): 4 smelter

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌─────┐┌─────┐┌─────┐┌─────┐                       │
        ││ S6  ││ S7  ││ S8  ││ S9  │                       │
 4      ││iron ││iron ││iron ││iron │ T7+ reserve           │
        ││ 6x9 ││ 6x9 ││ 6x9 ││ 6x9 │ col 4 + col 5 (S10)   │
 8      ││  v  ││  v  ││  v  ││  v  │                       │
10      │└─────┘└─────┘└─────┘└─────┘                       │
        │─────────── iron-ingot collect belt h=16m ────────│
14      │                                                  │
        │ iron-ore in: shared from 1F manifold (lift-up)   │
20      │ iron-ingot out: lift-out-top to 24m main belt    │
26      │                                                  │
32      │                                                  │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- S6-S9：4 smelter row=0（T6 启用），T9 满载 18 台需 col 4 row 0/2 加 S10-S11，col 0-3 row 2 加 S12-S15

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
32      │ (BP1 doesn't tap or feed any bus belt)          │
36      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- B1-B6 6 条 Mk4 belt 直通；BP1 不取/不注总线（铁锭走集群内短 belt 给 BP2）

## 建造步骤

1. 框 5×5 cell × 5 cell 高（40×40×40m）
2. **1F**: 放 5 台 smelter（4 台 row=0-1 一字排 col 0→3，1 台 S5 在 col=1 row=3 偏置以匹配 manifold 进料）
3. **1F belt**: row=2.5 横铺 1 条 Mk4 主 belt；每台 smelter front 端接 lift 下到 belt manifold
4. **1F 地基**: y=10m 铺 4m 厚地基覆盖整层
5. **2F (14m)**: 放 4 台 smelter（一字排 col 0→3 row=0-1）；同样 row=2.5 row 收集 belt
6. **垂直汇总**: 1F + 2F belt 末端 (col=4.5) 用 lift-out-top 上送到 h=24m
7. **右 Wall Outlet**: col=5, row=2.5, h=24m，接 24m 那条主 belt 出去
8. **左 Wall Inlet**: col=0, row=2.5, h=4m（接矿场来料）→ splitter manifold 喂 9 台
9. **屋顶 (35m)**: 铺 6 条 Mk4 平行 belt（B1 row=0.5, B2 row=1.5, ..., B6 row=4.5）；左右各嵌 1 排 Wall Mount (Inlet 左 / Outlet 右)
10. **Power Switch**: 角落放 1 个，关闭 1F 的 S5 + 2F 全部（4 台）；T6 仅启 4 台 1F
11. **Power Shard**: 9 台激活 smelter 各 3 shard 超频 226%

## Tier 7+ 扩容点

| Tier | 操作 |
|---|---|
| T7 | 物理建造 col=4 那列 5 smelter（1F+2F+3F）+ 启用 Power Switch 共 14 台 |
| T8 | 启用 16 台（继续放电力碎片 + 接 belt manifold 末端封堵口）|
| T9 | 启用 18 台 @ 237%；铁矿 belt 升 Mk5（1140/min 超 Mk4）|

## 验证

- [ ] 9 台 smelter 全部物理放置（不能跳 T6 阶段）—— 但只 9 台激活
- [ ] 右 Wall Outlet h=24m 与 BP2 左 Wall Inlet h=24m 对齐
- [ ] 屋顶 6 belt 直通无 splitter（本蓝图不参与总线 tap）
- [ ] 矿场 belt 容量按 1140 预留（Mk5）
