# BP6 铜锭 + 铜金锭 (C3)

## 概要

- **集群**: C3 铜电链（紧贴 BP5 之后，C3 第一个）
- **规格**: Mk2 **2 实例**（BP6a + BP6b，相同蓝图复制；T9 满载共 31 smelter，单实例 ½ ≈ 15-16 台）
- **机器**: smelter（铜锭配方 + 铜金锭配方）
- **激活时间线**: T6 5 铜锭 + 2 铜金锭 = 7 → T7 14+4 = 18 → T8 20+6 = 26 → T9 **23+8 = 31**
- **产能 T6**: 铜锭 326.5/min · 铜金锭 74/min

## 机器超频清单（T6，Plan C ≤250%）

| 配方 | 数量 | 超频 | 单台产能 (/min) | Power Shard/台 |
|---|---:|---:|---:|---:|
| copper-ingot (smelter) | 5 | **217.67%** | 65.30 | 3 |
| caterium-ingot (smelter) | 2 | **246.67%** | 37.0 | 3 |
| **合计 (T6)** | 7 | — | — | 5×3 + 2×3 = **21** |

> 总产能验证: 5 × 65.3 = 326.5 铜锭 ✓ | 2 × 37 = 74 铜金锭 ✓

## 物料 I/O

| 方向 | 物料 | 流量 (T6) | 路径 |
|---|---|---|---|
| 输入 | 铜矿石 | 326.5 | 矿场直喂 → 左 Wall Inlet (h=4m) |
| 输入 | 铜金矿石 | 222（74×3 配方比）| 矿场直喂 → 左 Wall Inlet (h=4m，第二口) |
| 输出 | 铜锭 → BP7 | 326.5 | 集群内部 → 右 Wall Outlet (h=24m) → BP6b → BP7 |
| 输出 | 铜金锭 → B6 | 74 | 屋顶 merger → B6（→ BP10 快速线） |

> 铜金锭**不再是 mainNode**（74/min 全部消费给快速线，无外部余量）。

**屋顶总线接入**: 注入 B6 (74 铜金锭)

## 楼层占用

| 层 | 高度 | 内容 | 数量（单实例 ≈ ½）|
|---|---|---|---:|
| 1F | 0-10m | smelter（铜锭 3 + 铜金锭 1）| 4 |
| 2F | 14-24m | smelter（铜锭 2 + 铜金锭 1）| 3 |
| 屋顶 | 35-40m | B1-B6 + 1 merger (B6) + 1 lift-top | — |

> 单实例 1F+2F 装 7 台，BP6a + BP6b 共 14 台（T6 激活），剩余 17 台为 T7+ 物理建造但 Power Switch 关。
> T9 满载需 31 台 → 单实例 16 台需放 1F 5 + 2F 5 + **3F 6**（10m + 14m + 14m + 14m = 52m？超 35m）→ 实际只能 1F+2F 各最大 5 台（5+5=10），但 1F+2F+3F 超高 ❌
> **修正**：smelter 1F 10m + 2F 14m = 24m，屋顶在 35m，留 11m 给 lift。3F 不可行（24+14=38m 超 35m）。所以单实例最多 1F+2F = 10 台。BP6a + BP6b 共 20 台。T9 满载 31 → **可能拆 3 个 Mk2** (BP6a/b/c) 而非 2 个。

> ⚠ **再核对**：1F smelter 最大 5 台一字排（5×6m=30m，行距 30m 有余）；2F 同样 5 台。单实例 10 台，2 实例 = 20 台。T9 31 台需 BP6a/b/c 共 31 ÷ 11≈ 3 实例。**README 表更新为 BP6a/b/c 3 实例**。

## 俯视图（按实际比例，每层独立 — 视觉正方形）

**比例约定**：
- 横向：**1 字符 = 1m**
- 纵向：**1 行 = 2m**（补偿 monospace 字符宽高比 1:2）
- 蓝图 40×40m → **40 字符宽 × 20 行高**
- 每 cell (8×8m) = 8 字符宽 × 4 行高

**机器实际尺寸** → ASCII 占位：

| 机器 | 实际 | ASCII 占位（W × H） |
|---|---|---|
| smelter | 6m × 9m | 6 字符 × 4-5 行 |

### 1F (0-10m): 5 smelter (4 copper + 1 caterium)

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐              │
        ││ S1  ││ S2  ││ S3  ││ S4  ││ G1  │              │
 4      ││ Cu  ││ Cu  ││ Cu  ││ Cu  ││ Cat │              │
        ││ 6x9 ││ 6x9 ││ 6x9 ││ 6x9 ││ 6x9 │              │
 8      ││  v  ││  v  ││  v  ││  v  ││  v  │              │
        │└─────┘└─────┘└─────┘└─────┘└─────┘              │
12      │── Cu  ingot collect belt h=2m  (S1-S4) ─────────│
        │── Cat ingot collect belt h=4m  (G1)    ─────────│
16      │                                                 │
        │ IN h=4m row=2: copper-ore  (mine > BP6)         │
20      │ IN h=4m row=3: caterium-ore (mine > BP6)        │
        │ OUT h=24m row=2.5: copper-ingot (BP6 > BP7)     │
24      │                                                 │
28      │ central splitter manifold ore -> 5 smelter in-0 │
        │ central splitter manifold ingot -> 2 lift-top   │
32      │                                                 │
36      │                                                 │
        │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- S1-S4：copper-ingot smelter 6m W × 9m L × 9m H
- G1：caterium-ingot smelter 6m W × 9m L × 9m H
- 铜锭/铜金锭分两条独立 belt 收集（防混料）
- IN h=4m：左 Wall Inlet（铜矿/铜金矿，矿场直喂）
- OUT h=24m：右 Wall Outlet（铜锭，集群内部给 BP7）

### 2F (14-24m): 5 smelter (剩余分布)

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐              │
        ││ S5  ││ S6  ││ S7  ││ S8  ││ G2  │              │
 4      ││ Cu  ││ Cu  ││ Cu  ││ Cu  ││ Cat │              │
        ││ 6x9 ││ 6x9 ││ 6x9 ││ 6x9 ││ 6x9 │              │
 8      ││  v  ││  v  ││  v  ││  v  ││  v  │              │
        │└─────┘└─────┘└─────┘└─────┘└─────┘              │
12      │── Cu  ingot collect belt h=14m (S5-S8) ─────────│
        │── Cat ingot collect belt h=16m (G2)    ─────────│
16      │                                                 │
        │ ore in:    lift-bot from 1F splitter manifold   │
20      │ ingot out: lift-out-top to roof / BP7 outlet    │
24      │                                                 │
28      │ T7+ 满载: G3 在 col=4 备用 (T6 仅激活 G1+G2)    │
        │ T9 31 台 -> 拆 BP6a/b/c 共 3 实例 (单实例 10台) │
32      │                                                 │
36      │                                                 │
        │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- S5-S8：copper-ingot smelter（2F 4 台铜锭）
- G2：caterium-ingot smelter（2F 1 台铜金锭）
- 单实例 1F+2F 共 10 台（8 铜锭 + 2 铜金锭）
- T9 满载 31 台需 BP6a/b/c 3 实例

### 屋顶 (35-40m): B1-B6 + 1 merger (B6)

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │ o B1 ────────────────────────────────────── o   │
 4      │ o B2 ────────────────────────────────────── o   │
 8      │ o B3 ────────────────────────────────────── o   │
12      │ o B4 ────────────────────────────────────── o   │
16      │ o B5 ────────────────────────────────────── o   │
20      │ o B6 ───[merger << caterium-ingot 74]────── o   │
24      │                                                 │
28      │ B6 inject 74/min  (caterium to BP10 fast belt)  │
        │ copper-ingot 326.5 NOT on bus (cluster > BP7)   │
32      │                                                 │
36      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- B6 merger：caterium-ingot 74/min（1F+2F lift-top 上行合流）
- copper-ingot 326.5 走集群内部右 Wall Outlet 给 BP7，不上总线
- B1-B5 在 BP6 蓝图内仅直通无注入

## 多实例侧墙续接

BP6 是**纯同向流**集群（铜锭/铜金锭都是 BP6a→BP6b→...→ 下游 BP7）。详见设计文档 [§多实例集群侧墙 mount 对偶规则](../2026-05-06-tier6-blueprint-design.md#多实例集群侧墙-mount-对偶规则关键设计约定)。

蓝图侧墙集群内 mount（机器层）：

| 高度 | 物料 | 左 Wall | 右 Wall |
|---|---|---|---|
| h=4m row=2.5 | 铜锭 | **Inlet** | **Outlet** |
| h=4m row=3.5 | 铜金锭 | **Inlet**（仅 BP6b/c 用，BP6a 悬空）| **Outlet** |

> BP6a 左侧没有上游，所以左 Inlet 悬空（蓝图相同导致 mount 必须存在但不接料）。
> BP6 不使用反向 belt（无下游回流物料）。

## 建造步骤（BP6a 单实例，BP6b/c 复制）

1. **1F (0-10m)**: 5 台 smelter 一字排 row=0（前 4 台铜锭 + 第 5 台占 col=4 空着 T7+ 用）
2. **1F belt 收集**: row=2 铜锭主 belt + row=3 铜金锭主 belt
3. **铜矿石进料**: 左 Wall Inlet (h=4m, row=2) → splitter manifold (5 路) → 5 台 in-0
4. **铜金矿石进料**: 左 Wall Inlet (h=4m, row=3) → splitter manifold → 铜金锭 smelter
5. **1F→2F**: 4m 地基 (10-14m)
6. **2F (14-24m)**: 5 台 smelter（同 1F 布局）；同样两条 row 收集
7. **垂直汇总**:
   - 铜锭 1F+2F → lift-out-top → 24m 主 belt → 右 Wall Outlet (col=5, h=24m, row=2)
   - 铜金锭 1F+2F → lift-out-top → 屋顶 (35m) → merger 注 B6
8. **屋顶 (35m)**: 6 belt 直通 + 1 merger
9. **Power Switch**: 关闭闲置（T6 单实例只 3-4 台开，T9 全开）

## Tier 7+ 扩容点

| Tier | 铜锭/铜金锭 | 实例数 |
|---|---|---:|
| T6 | 5/2 | 1 BP6a 满 + 1 BP6b 关 |
| T7 | 14/4 | 2 (BP6a+b) |
| T8 | 20/6 | 2-3 |
| T9 | 23/8 | **3** (BP6a/b/c) |

> README 表已写 2 实例（按 T7 配置），T9 需补建 BP6c 第 3 实例。

## 验证

- [ ] 铜锭/铜金锭两条 row 独立
- [ ] 双进料 belt（铜矿+铜金矿）正确分配
- [ ] 屋顶 merger filter=铜金锭（防混料）
- [ ] 矿场容量预留：铜矿 1200/min、铜金矿 600/min（Tier 9 上限）
