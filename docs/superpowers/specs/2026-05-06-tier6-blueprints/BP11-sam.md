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

## 俯视图（1F, 0-12m）

```
       col=0   col=1   col=2   col=3   col=4   col=5
      ┌──────┬──────┬──────┬──────┬──────┐
r=0   │ ┌────────────────────┐         │  1 SAM 波动器 manufacturer
      │ │ M1 SAM-fluctuator  │         │  20m × 22m × 12m
r=1   │ │                    │         │  4 inputs front (south)
      │ │   front 4-input    │         │  1 output back (north)
r=2   │ │ ↑ ↑ ↑ ↑ (in 0-3)   │         │
      │ │                    │         │
r=3   │ │  out-0 ↓ back      │         │
      │ └────────────────────┘         │
      ├──────┼──────┼──────┼──────┼──────┤
r=4   │      │      │      │      │      │  空地（manufacturer 输出走 row=3-4）
      └──────┴──────┴──────┴──────┴──────┘
```

> ⚠ **manufacturer 反转端口**：input 在 front (row=2-3)，output 在 back (row=0)。布局时把 manufacturer 反转（facing=north）让 input 朝南、output 朝北，方便配料从 1F 中央 manifold 进、产物从 row=0 出顶。

## 俯视图（2F, 16-24m）

```
       col=0   col=1   col=2   col=3   col=4   col=5
      ┌──────┬──────┬──────┬──────┬──────┐
r=0   │ ┌──┐ │ ┌──┐ │      │      │      │  2 reanimated-sam constructor
      │ │R1│ │ │R2│ │      │      │      │  8m × 10m × 8m
r=1   │ │  │ │ │  │ │      │      │      │  in-0 back, out-0 front
      │ │↓ │ │ │↓ │ │      │      │      │
r=2   │ └──┘ │ └──┘ │      │      │      │
      ├──────┼──────┼──────┼──────┼──────┤
r=3   │ === collect 重生SAM lift-bot ────│  90/min: 60 → manufacturer + 30 → B5
      └──────┴──────┴──────┴──────┴──────┘
```

## 屋顶总线层（35-40m）

```
B1 ═════════════════════════════════════════> B1
B2 ═════════════════════════════════════════> B2
B3 ═══[smart split (filter=电线50+钢管30)──80┐]═> B3 (-80)
                                              │
                                           lift-bot ↓
                                              │
                              → 1F SAM 波动器 4 in
B4 ═════════════════════════════════════════> B4
B5 ═══[merger ←──重生 SAM 30 + SAM 波动器 10]═> B5 (+40 mainNode)
B6 ═════════════════════════════════════════> B6
```

> SAM 波动器 manufacturer 4 输入：电线 50 + 钢管 30 + 重生 SAM 60 + 1 个未用槽？
> **核对配方**：sam-fluctuator 配方 = 6 重生SAM + 5 电线 + 3 钢管 → 1 SAM 波动器/min（per machine 100%）。100% 1 台需 60 重生SAM + 50 电线 + 30 钢管 = 3 输入，第 4 个槽空（manufacturer 4 槽配方未占满）。

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
