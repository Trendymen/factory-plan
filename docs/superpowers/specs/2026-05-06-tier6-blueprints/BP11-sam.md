# BP11 重生 SAM + SAM 波动器 (C5 末)

## 概要

- **集群**: C5 末端（紧贴 BP10b 之后；C5 最后一个蓝图）
- **规格**: Mk2 单实例
- **机器**: 2 reanimated-sam constructor + 1 sam-fluctuator manufacturer = **3 台**
- **激活时间线**: T6 = T7 = T8 = T9 = **2+1**（uplift 1.0-2.2x 但 T6 已物理满载）
- **产能 T6**: 重生 SAM 90/min · SAM 波动器 10/min

## 机器超频清单（T6，Plan C ≤250%）

| 配方 | 数量 | 超频 | 单台产能 (/min) | Power Shard/台 |
|---|---:|---:|---:|---:|
| reanimated-sam (constructor) | 2 | **150.0%** | 45 重生SAM | 1 |
| sam-fluctuator (manufacturer) | 1 | **100.0%** | 10 SAM 波动器 | 0 |
| **合计 (T6)** | 3 | — | — | 2×1 + 0 = **2** |

> 总产能验证: 2 × 45 = 90 重生SAM ✓（其中 60 内部消费 + 30 mainNode）| 1 × 10 = 10 SAM 波动器 ✓
> **唯一全 T6/T9 不变的蓝图**：3 台已物理满载，无 Power Switch 控制需求。

## 物料 I/O

| 方向 | 物料 | 流量 | 路径 |
|---|---|---|---|
| 输入 | SAM 矿石 | 360/min | **SAM 矿场直喂** → 左 Wall Inlet (h=4m) |
| 输入 | 电线 | 50 | **屋顶 B3** ← BP7 → smart splitter |
| 输入 | 钢管 | 30 | **屋顶 B3** ← BP5 → smart splitter |
| 输出 | 重生 SAM → SAM 波动器（蓝图内）| 60 | 内部 lift |
| 输出 | 重生 SAM → B5 终端 | 30 | 屋顶 merger → B5 |
| 输出 | SAM 波动器 → B5 终端 | 10 | 屋顶 merger → B5 |

**屋顶总线接入**:
- 取自 B3 (电线 50 + 钢管 30)
- 注入 B5 (重生 SAM 30 + SAM 波动器 10 = 40 mainNode)

## 楼层占用

| 层 | 高度 | 内容 | 数量 |
|---|---|---|---:|
| 1F | 0-12m | SAM 波动器 manufacturer（20m × 22m × 12m）| 1 |
| 2F | 16-24m | 重生 SAM constructor（8m × 10m）| 2 |
| 屋顶 | 35-40m | B1-B6 + smart splitter (B3) + merger (B5) + 多 lift | — |

> manufacturer 20×22m 占 1F 几乎一半（1600m² × 12m）；2F 上 2 台 constructor 一字排（16m × 10m，剩 24m 空地）。

## 俯视图（按实际比例，每层独立 — 视觉正方形）

**比例约定**：横向 1 字符 = 1m，纵向 1 行 = 2m；蓝图 40×40m → 51 字符 × 20 行画布。

机器 ASCII 占位：manufacturer 20m × 22m → 21 字符宽 × ~12 行（占 1F 一半）；constructor 8m × 10m → 9 字符宽 × 5 行。

> manufacturer 端口反转: facing=north 让 input 在 front (南/row=10-11) 朝下、output 在 back (北/row=0) 朝上，方便配料从 1F 南侧 manifold 进、产物从 row=0 出顶上 lift。

### 1F (0-12m): 1 SAM-fluctuator manufacturer (20m W × 22m L × 12m H)

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌───────────────────┐                            │
        ││    M1 (out N)     │  facing=north              │
 4      ││ sam-fluctuator    │  out-0 -> back -> row=0    │
        ││ manufacturer      │  in 0..3 -> front (S)      │
 8      ││    20 x 22 m      │  4-input slots row=10      │
        ││                   │                            │
12      ││ out-0  ^ (north)  │                            │
        ││                   │                            │
16      ││ in-0 wire 50      │  via lift-bot from B3      │
        ││ in-1 pipe 30      │  via lift-bot from B3      │
20      ││ in-2 reSAM 60     │  via lift-bot from 2F      │
        ││ in-3 (empty)      │                            │
24      │└───────────────────┘                            │
        │                                                 │
28      │ in raw-SAM 360 -> 2F (Wall Inlet h=20m row=0)   │
32      │ out SAM-fluctuator 10 -> lift-top -> roof B5    │
36      │ out reSAM 30 -> lift-top -> roof B5 (mainNode)  │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- 占 col=0-2.5、row=0-2.75（20×22m，21 字符 × 11-12 行），1F 另一半（col=2.5-4）留空作 lift 通道
- 配方 sam-fluctuator = 6 reSAM + 5 wire + 3 steel-pipe → 1/min。100% 1 台需 60 reSAM + 50 wire + 30 pipe，仅 3 槽用，in-3 空槽
- output 走 row=0 北向 → lift-out-top 到屋顶 B5 merger（10/min）

### 2F (16-24m): 2 reanim-sam constructor 一字排

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌───────┐┌───────┐                               │
        ││  R1   ││  R2   │  2 reanim-sam constructor     │
 4      ││reanim ││reanim │  8m W x 10m L x 8m H          │
        ││ 8x10  ││ 8x10  │  in-0 back, out-0 front       │
 8      ││   v   ││   v   │  150% = 45/min each (90 tot)  │
        │└───────┘└───────┘                               │
12      │──── reSAM collect h=20m row=2.5 ────────────────│
        │                                                 │
16      │ in raw-SAM 360: left Wall Inlet h=20m row=0     │
20      │    -> splitter -> R1 in-0 + R2 in-0             │
        │ out reSAM 90: 1F splitter 60+30                 │
24      │   60 -> lift-bot -> 1F manufacturer in-2        │
        │   30 -> lift-out-top -> roof B5 merger          │
28      │                                                 │
32      │                                                 │
36      │ T6 saturated; T7-T9 unchanged 2+1=3 (uplift 1x) │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- R1/R2 占 col=0-1, row=0-1.25（8m × 10m × 2 = 16m W × 10m L），剩 24m 空地
- 输出 90/min reSAM 在 2F splitter 1→2: 60 下到 1F manufacturer in-2 + 30 上到屋顶 B5 merger

### 屋顶 (35-40m): B3 smart-splitter (取 wire+pipe 80) + B5 merger (注 reSAM 30 + fluct 10)

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │ o B1 ───────────────────────────────────────── o│
        │                                                 │
 4      │ o B2 ───────────────────────────────────────── o│
        │                                                 │
 8      │ o B3 ─[smart-split f=wire 50 + pipe 30]─80──── o│
        │          │                                      │
12      │       lift-bot                                  │
        │          ↓                                      │
16      │       1F sam-fluctuator in-0/in-1 (wire+pipe)   │
        │                                                 │
20      │ o B4 ───────────────────────────────────────── o│
        │                                                 │
24      │ o B5 ──────────[merger ← reSAM 30 + fluct 10]─ o│
        │                            ↑ = 40 mainNode      │
28      │                            lift-top from 1F+2F  │
32      │                                                 │
        │ o B6 ───────────────────────────────────────── o│
36      │ B7/B8 reserved (T7+ slots, BP11 stays 1.0x)     │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- B3 smart-splitter 双 filter: wire 50 + pipe 30 = 80，下 lift-bot 到 1F manufacturer in-0/in-1
- B5 merger 注入 reSAM 30 + SAM-fluctuator 10 = 40 mainNode
- BP11 是**唯一全 T6/T9 不变的蓝图**（uplift 1.0x），3 台已物理满载，无 Power Switch 控制需求

## 建造步骤

1. **1F (0-12m)**: 1 台 SAM 波动器 manufacturer，facing=north（input 朝南 row=2-3，output 朝北 row=0-1）
2. **3 路输入分配**:
   - 屋顶 smart splitter (B3) 取 电线 50 + 钢管 30 → 各 lift-bot 下到 1F → manufacturer 各 1 个 in 端口
   - 重生 SAM 60：从 2F constructor 输出 → lift-bot 下到 1F → manufacturer in 第 3 槽
3. **1F → 2F**: 4m 地基 (12-16m)
4. **2F (16-24m)**: 2 台重生 SAM constructor 一字排
5. **SAM 矿石进料**: 左 Wall Inlet (h=20m, row=0) → splitter → 2 台 in-0
6. **2F 输出 splitter (90/min)**:
   - 60 → lift-bot 到 1F SAM 波动器 in
   - 30 → lift-out-top 到屋顶 merger 注 B5
7. **SAM 波动器输出**: manufacturer out-0 (row=0 顶) → lift-out-top → 屋顶 merger 注 B5（10/min mainNode）
8. **屋顶 (35-40m)**: 6 belt 直通 + B3 smart splitter + B5 merger
9. **Power Switch**: 不需要（3 台全开，T6 已满载）

## Tier 7+ 扩容点

T7-T9 不变（uplift = 1.0x），3 台已满载。
> **唯一 1.0x 蓝图**：BP11 物理建造 = T9 满载 = 3 台，Power Switch 不参与。

## 验证

- [ ] manufacturer facing=north（端口反转）
- [ ] 4 输入位置正确（电线 50 + 钢管 30 + 重生 SAM 60 + 空槽）
- [ ] SAM 矿场容量按 600/min（T9 上限）预留
- [ ] B5 + 40 流量在容量内
- [ ] Power Switch 不接 BP11（全开）
