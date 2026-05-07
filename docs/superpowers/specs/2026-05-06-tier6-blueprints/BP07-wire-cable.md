# BP7 铜板 + 电线 + 线缆 (C3)

## 概要

- **集群**: C3 铜电链（紧贴 BP6c 之后）
- **规格**: Mk2 **3 实例**（BP7a/b/c，相同蓝图复制；T9 满载 46 constructor，单实例 ≈ 15-16 台）
- **机器**: constructor（铜板 + 电线 + 线缆 三种配方）
- **激活时间线**: T6 3+6+2=11 → T7 8+12+4=24 → T8 14+16+6=36 → T9 **18+20+8=46**
- **产能 T6**: 铜板 62.5 / 电线 403 / 线缆 101.5

## 机器超频清单（T6，Plan C ≤250%）

| 配方 | 数量 | 超频 | 单台产能 (/min) | Power Shard/台 |
|---|---:|---:|---:|---:|
| copper-sheet (constructor) | 3 | **208.33%** | 20.83 | 3 |
| wire (constructor) | 6 | **223.89%** | 67.17 | 3 |
| cable (constructor) | 2 | **169.17%** | 50.75 | 2 |
| **合计 (T6)** | 11 | — | — | 3×3 + 6×3 + 2×2 = **31** |

> 总产能验证: 3 × 20.83 = 62.5 铜板 ✓ | 6 × 67.17 = 403 电线 ✓ | 2 × 50.75 = 101.5 线缆 ✓

## 物料 I/O

| 方向 | 物料 | 流量 (T6) | 路径 |
|---|---|---|---|
| 输入 | 铜锭 | 326.5 | **集群内部** ← BP6 右 Wall Outlet (h=24m) → BP7a 左 Wall Inlet |
| 输入 | 电线 | 203（内部回流，铜板/电线先做出来再喂给线缆）| 蓝图内部 lift |
| 输出 | 铜板 → BP8 电路板（C3 内部）| 27.5 | 集群内部 → BP8 |
| 输出 | 铜板 → B6 (BP10 AI 限制器) | 25 | 屋顶 merger → B6 |
| 输出 | 铜板 → B5 终端 | 10 | 屋顶 merger → B5 |
| 输出 | 电线 → B3 (BP12 + BP11) | 170 | 屋顶 merger → B3 |
| 输出 | 电线 → B5 终端 | 30 | 屋顶 merger → B5 |
| 输出 | 线缆 → B4 (BP14 + BP15) | 71.5 | 屋顶 merger → B4 |
| 输出 | 线缆 → B5 终端 | 30 | 屋顶 merger → B5 |

**屋顶总线接入**: 注入 B3 (170)、B4 (71.5)、B5 (10+30+30=70)、B6 (25)

## 楼层占用（单实例）

| 层 | 高度 | 内容 | 数量 |
|---|---|---|---:|
| 1F | 0-8m | constructor（铜板 1 + 电线 2 + 线缆 1）| 4-5 |
| 2F | 12-20m | constructor（剩余分布）| 4-5 |
| 3F | 24-32m | constructor（T8/T9 才用）| 0-5 |
| 屋顶 | 35-40m | B1-B6 + 4 merger + 多 lift | — |

> constructor 8m × 10m，1F 装 5 台一行；T9 单实例 ≈ 15 台需 1F+2F+3F 各 5 台。

## 俯视图（按实际比例，每层独立 — 视觉正方形）

**比例约定**：
- 横向：**1 字符 = 1m**
- 纵向：**1 行 = 2m**（补偿 monospace 字符宽高比 1:2）
- 蓝图 40×40m → **40 字符宽 × 20 行高**
- 每 cell (8×8m) = 8 字符宽 × 4 行高

**机器实际尺寸** → ASCII 占位：

| 机器 | 实际 | ASCII 占位（W × H） |
|---|---|---|
| constructor | 8m × 10m | 8 字符 × 5 行 |

### 1F (0-8m): 5 constructor (1 sheet + 2 wire + 1 cable + 1 reserve)

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌───────┐┌───────┐┌───────┐┌───────┐┌───────┐    │
        ││  Cu1  ││  Wi1  ││  Wi2  ││  Cb1  ││  --   │    │
 4      ││ sheet ││ wire  ││ wire  ││ cable ││reserve│    │
        ││ 8x10  ││ 8x10  ││ 8x10  ││ 8x10  ││ 8x10  │    │
 8      ││  v    ││  v    ││  v    ││  v    ││       │    │
        │└───────┘└───────┘└───────┘└───────┘└───────┘    │
12      │── sheet collect belt h=2m  (Cu1)         ───────│
        │── wire  collect belt h=4m  (Wi1,Wi2)     ───────│
16      │── cable collect belt h=6m  (Cb1)         ───────│
        │                                                 │
20      │ IN  h=24m row=2.5: copper-ingot (BP6 > BP7)     │
        │ OUT h=24m row=2.5: copper-ingot (BP7 > BP8)     │
24      │ OUT h=24m row=3.5: copper-sheet (BP7c > BP8)    │
        │                                                 │
28      │ wire internal feedback: 1F wire -> lift -> Cb1  │
        │   in-0 (replace external supply for cable feed) │
32      │                                                 │
36      │ central splitter ingot -> 4 constructor in-0    │
        │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- Cu1：copper-sheet constructor 8m W × 10m L × 8m H
- Wi1-Wi2：wire constructor 8m W × 10m L × 8m H
- Cb1：cable constructor 8m W × 10m L × 8m H
- reserve：col=4 预留（T7+ 第 5 台占用）
- 三种 row 独立 belt（铜板/电线/线缆）防混料
- 电线内部回流：1F wire 部分输出 lift-bot 喂 cable in-0

### 2F (12-20m): 5 constructor (剩余分布)

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌───────┐┌───────┐┌───────┐┌───────┐┌───────┐    │
        ││  Cu2  ││  Wi3  ││  Wi4  ││  Cb2  ││  --   │    │
 4      ││ sheet ││ wire  ││ wire  ││ cable ││reserve│    │
        ││ 8x10  ││ 8x10  ││ 8x10  ││ 8x10  ││ 8x10  │    │
 8      ││  v    ││  v    ││  v    ││  v    ││       │    │
        │└───────┘└───────┘└───────┘└───────┘└───────┘    │
12      │── sheet collect belt h=14m (Cu2)         ───────│
        │── wire  collect belt h=16m (Wi3,Wi4)     ───────│
16      │── cable collect belt h=18m (Cb2)         ───────│
        │                                                 │
20      │ ingot in:  lift-bot from 1F splitter manifold   │
        │ products:  lift-out-top to roof 4 mergers       │
24      │                                                 │
28      │ T7+ 加 Cu3 / Wi5 / Cb3 (col=4 reserve 启用)     │
        │                                                 │
32      │                                                 │
36      │                                                 │
        │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- 2F 同 1F 布局：1 sheet + 2 wire + 1 cable + 1 reserve
- 三种产物上行 lift-out-top 到屋顶 4 个 merger

### 3F (24-32m): 5 constructor (T8/T9 才用)

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌───────┐┌───────┐┌───────┐┌───────┐┌───────┐    │
        ││  Cu3  ││  Wi5  ││  Wi6  ││  Cb3  ││  --   │    │
 4      ││ sheet ││ wire  ││ wire  ││ cable ││reserve│    │
        ││ 8x10  ││ 8x10  ││ 8x10  ││ 8x10  ││ 8x10  │    │
 8      ││  v    ││  v    ││  v    ││  v    ││       │    │
        │└───────┘└───────┘└───────┘└───────┘└───────┘    │
12      │── sheet collect belt h=26m (Cu3)         ───────│
        │── wire  collect belt h=28m (Wi5,Wi6)     ───────│
16      │── cable collect belt h=30m (Cb3)         ───────│
        │                                                 │
20      │ T6 idle (Power Switch off); T8/T9 启用          │
        │ 3F products lift-out-top to roof 4 mergers      │
24      │                                                 │
28      │ T9 满载单实例 ≈ 15-16 台分布 1F+2F+3F 各 5      │
        │ 3 实例 BP7a/b/c 共 46 台                        │
32      │                                                 │
36      │                                                 │
        │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- 3F 全部 T6 物理建造 Power Switch 关，T8/T9 渐次启用
- 1F+2F+3F 单实例最多 15 台，3 实例覆盖 T9 46 台

### 屋顶 (35-40m): B1-B6 + 4 merger (B3 + B4 + B5 + B6)

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │ o B1 ────────────────────────────────────── o   │
 4      │ o B2 ────────────────────────────────────── o   │
 8      │ o B3 ───[merger << wire 170]─────────────── o   │
12      │ o B4 ───[merger << cable 71.5]───────────── o   │
16      │ o B5 ───[merger << mainNode 70]──────────── o   │
20      │ o B6 ───[merger << copper-sheet 25]──────── o   │
24      │                                                 │
28      │ B3 inject 170/min (wire to BP12 + BP11)         │
        │ B4 inject  71.5   (cable to BP14 + BP15)        │
32      │ B5 inject  70     (mainNode: sheet/wire/cable)  │
        │ B6 inject  25     (sheet to BP10 AI limiter)    │
36      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- 4 个 merger（B3=电线、B4=线缆、B5=mainNode 三合一、B6=铜板）
- 各产物 1F+2F+3F 收集 → lift-out-top → 4 路注入

## 建造步骤（BP7a，BP7b/c 完全复制）

1. **1F (0-8m)**: 5 台 constructor 一字排 row=0（按当前激活配比：1 铜板 + 2 电线 + 1 线缆 + 1 占位）
2. **铜锭进料**: 左 Wall Inlet (h=24m) → lift-bot → 1F 中央 splitter manifold（按消耗比例分给 4-5 台）
3. **电线回流**: 1F 电线输出 1 部分 → lift-bot 回到 1F 线缆 constructor in-0
4. **1F belt 收集**:
   - row=2 铜板 belt (col 0)
   - row=3 电线 belt (col 1-2)
   - row=4 线缆 belt (col 3)
5. **1F→2F**: 4m 地基；2F 5 台同布局
6. **2F→3F** (T7+): 4m 地基；3F 5 台
7. **垂直汇总 + 屋顶**:
   - 铜板：3 路 splitter（→ BP8 27.5、→ B6 25、→ B5 10）→ 一支右 Wall Outlet (h=24m, row=2)、两支屋顶 merger
   - 电线：2 路 splitter（→ B3 170、→ B5 30，自身回流不计入）
   - 线缆：2 路 splitter（→ B4 71.5、→ B5 30）
8. **屋顶 (35m)**: 6 belt 直通 + 4 merger
9. **Power Switch**: 关闭闲置（T6 单实例 ≈ 4 台开，剩 11+台关）

## 多实例侧墙续接

BP7 是**纯同向流**集群（铜锭从 BP6→BP7a→BP7b→BP7c→BP8）。详见设计文档 [§多实例集群侧墙 mount 对偶规则](../2026-05-06-tier6-blueprint-design.md#多实例集群侧墙-mount-对偶规则关键设计约定)。

蓝图侧墙集群内 mount（机器层）：

| 高度 | 物料 | 左 Wall | 右 Wall |
|---|---|---|---|
| h=4m row=2.5 | 铜锭 | **Inlet** | **Outlet**（剩余给下游 BP7b/c）|
| h=4m row=3.5 | 铜板 | — | **Outlet**（仅 BP7c 用，给 BP8）|

> BP7c 右 Outlet 铜板接 BP8（C3 末端）；BP7a/b 右 Outlet 铜板悬空（这些实例的铜板内部消耗 + 屋顶 B6 走，不出右墙）。
> 电线内部回流（自给线缆配方）**仅在同蓝图内部 lift**，不跨实例。

## 集群内部短 belt

- BP7 → BP8 铜板 27.5：右 Wall Outlet (col=5, h=24m, row=2) → BP8 左 Wall Inlet (h=24m, row=2)
- 仅 BP7c 实例参与（BP7a/b 铜板进集群内 BP7c 合流后再去 BP8）；或每个实例独立出口（BP8 左侧 3 个 Wall Inlet）

## Tier 7+ 扩容点

| Tier | 铜板/电线/线缆 | 实例 |
|---|---|---:|
| T6 | 3/6/2 | 1 (BP7a 满) |
| T7 | 8/12/4 | 2 (BP7a+b) |
| T8 | 14/16/6 | 3 (BP7a+b+c) |
| T9 | 18/20/8 | 3 (BP7a/b/c 满载) |

## 验证

- [ ] 三种产物 row belt 独立（铜板/电线/线缆）
- [ ] 4 个屋顶 merger filter 正确（B3=电线、B4=线缆、B5=mainNode 三种合、B6=铜板）
- [ ] 电线内部回流 belt 不与外部进出料混淆
- [ ] B3 流量 333 < 480 ✓
