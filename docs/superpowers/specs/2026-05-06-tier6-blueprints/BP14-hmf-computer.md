# BP14 重型模块框架 + 电脑 (C6)

## 概要

- **集群**: C6 装配（紧贴 BP13 之后）
- **规格**: Mk2 **2 实例**（BP14a + BP14b，每实例 1 manufacturer，因为 manufacturer 20×22m 占地大）
- **机器**: 1 HMF + 1 电脑 manufacturer（T6）→ 1+5=6（T9 满载，电脑 11x uplift 大头）
- **激活时间线**: T6 1+1=2 → T7 1+3=4 → T8 1+4=5 → T9 **1+5=6**
- **产能 T6**: HMF 2/min · 电脑 2.5/min

## 机器超频清单（T6，Plan C ≤250%）

| 配方 | 数量 | 超频 | 单台产能 (/min) | Power Shard/台 |
|---|---:|---:|---:|---:|
| heavy-modular-frame (manufacturer) | 1 | **100.0%** | 2.0 | 0 |
| computer (manufacturer) | 1 | **100.0%** | 2.5 | 0 |
| **合计 (T6)** | 2 | — | — | **0** |

> 总产能验证: 1 × 2.0 = 2 HMF ✓ | 1 × 2.5 = 2.5 电脑 ✓
> T6 阶段 2 台都 100% 不超频，**0 Power Shard 需求**。T7+ 启用更多 manufacturer 时各台 100% 即可（电脑 5 台满载产 12.5/min 满足 T9 28.25 mainNode 中 12.5 内部消化部分）。

## 物料 I/O

| 方向 | 物料 | 流量 (T6) | 路径 |
|---|---|---|---|
| **HMF 输入**（manufacturer 4 槽）| | | |
| 输入 | 模块化框架 | 10 | **集群内部** ← BP13 右 Wall Outlet (h=20m) |
| 输入 | 包裹工业梁 | 10 | **集群内部** ← BP13 |
| 输入 | 钢管 | 40 | **屋顶 B3** ← BP5 → smart splitter |
| 输入 | 螺丝 | 240 | **屋顶 B2** ← BP3 → smart splitter |
| **电脑 输入**（manufacturer 4 槽）| | | |
| 输入 | 电路板 | 10 | **屋顶 B4** ← BP8 → splitter |
| 输入 | 线缆 | 20 | **屋顶 B4** ← BP7 → splitter |
| 输入 | 塑料 | 50 | **屋顶 B4** ← BP9 → splitter |
| **输出** | | | |
| 输出 | HMF → B5 终端 | 2 | 屋顶 merger → B5 |
| 输出 | 电脑 → B5 终端 | 2.5 | 屋顶 merger → B5 |

**屋顶总线接入**:
- 取自 B2 (螺丝 240)、B3 (钢管 40)、B4 (电路板 10 + 线缆 20 + 塑料 50 = 80)
- 注入 B5 (HMF 2 + 电脑 2.5 = 4.5 mainNode)

## 楼层占用

| 实例 | 1F | 2F (T7+) | 屋顶 |
|---|---|---|---|
| **BP14a** | 1 HMF manufacturer | T7+ +1 电脑 | 7 路 splitter/merger |
| **BP14b** | 1 电脑 manufacturer | T7+ +2 电脑 (3F 1 电脑) | 同 BP14a |

> manufacturer 20m × 22m × 12m，1 Mk2 装 2 台并排（共 40m × 22m，刚好满 1 行 row=0-2.75）。
> T9 满载需 6 台 = 3 台 × 2 实例（BP14a 3 台 = 1 HMF + 2 电脑 多层；BP14b 3 台 = 3 电脑 多层）。

## 俯视图（按实际比例，每实例独立 — 视觉正方形）

**比例约定**：
- 横向：**1 字符 = 1m**
- 纵向：**1 行 = 2m**
- 蓝图 40×40m → 40 字符宽 × 20 行高

**机器实际尺寸** → ASCII 占位：

| 机器 | 实际 | ASCII 占位（W × H） |
|---|---|---|
| manufacturer | 20m × 22m | 20 字符 × 11 行 |

> manufacturer 占地大，单实例 1F 仅装 1 台（占 col 0-2.5 / row 0-2.75）。
> **facing=north 端口反转**：4 输入朝南 (row=2.75)，1 输出朝北 (row=0)。

### BP14a 1F (0-12m): 1 HMF manufacturer

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌───────────────────┐                             │
        ││         ^         │  out-0 -> roof merger (B5)  │
 4      ││  HMF  manufacturer│  HMF 2/min mainNode         │
        ││  20m W x 22m L    │                             │
 8      ││  facing=north     │                             │
        ││  port reversed    │                             │
12      ││                   │  in 0-3 (south, row=2.75):  │
        ││                   │    in-0 screw 240           │
16      ││                   │    in-1 steel-pipe 40       │
        ││                   │    in-2 modular-frame 10    │
20      ││                   │    in-3 encased-beam 10     │
        ││  v  v  v  v       │                             │
24      │└───────────────────┘                             │
        │ screw + pipe via lift-bot from roof B2/B3 split  │
28      │ frame + beam via left-wall inlet h=4m from BP13  │
        │                                                  │
32      │ HMF out-0 (row=0) >> lift-out-top to roof merger │
36      │                                                  │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- HMF manufacturer 20m W × 22m L × 12m H，4 输入 1 输出
- T7+ 加 1 电脑 manufacturer（2F），单实例物理上限 2 台（28+16=44m 顶限）

### BP14b 1F (0-12m): 1 电脑 manufacturer

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌───────────────────┐                             │
        ││         ^         │  out-0 -> roof merger (B5)  │
 4      ││ Computer manufact.│  computer 2.5/min mainNode  │
        ││  20m W x 22m L    │                             │
 8      ││  facing=north     │                             │
        ││  port reversed    │                             │
12      ││                   │  in 0-3 (south, row=2.75):  │
        ││                   │    in-0 circuit-board 10    │
16      ││                   │    in-1 cable 20            │
        ││                   │    in-2 plastic 50          │
20      ││                   │    in-3 EMPTY (3 ingredient)│
        ││  v  v  v  .       │                             │
24      │└───────────────────┘                             │
        │ all 3 inputs via lift-bot from roof B4 prog split│
28      │ in-3 lift omitted (no fourth ingredient)         │
        │                                                  │
32      │ computer out-0 (row=0) >> lift-out-top to merger │
36      │                                                  │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- computer manufacturer 20m W × 22m L × 12m H，3 输入实用 + 1 槽空

### 屋顶 (35-40m): B1-B6 + 3 splitter + 1 merger（每实例屋顶相同）

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │ o B1 ──────────────────────────────────────── o  │
 4      │ o B2 ───[smart split: screw 240]──────────── o   │
 8      │ o B3 ───[smart split: steel-pipe 40]──────── o   │
12      │ o B4 ───[prog split: CB 10 + Cab 20 + P 50]── o  │
16      │ o B5 ───[merger << lift-top mainNode 4.5]── o    │
20      │ o B6 ──────────────────────────────────────── o  │
24      │                                                  │
28      │ BP14a lift-bot: screw / pipe to 1F HMF in-0/1    │
        │ BP14b lift-bot: CB / cable / plastic to 1F in-0-2│
32      │ lift-top: HMF 2 (BP14a) + computer 2.5 (BP14b)   │
36      │                                                  │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- BP14a 取 B2 (240 螺丝) + B3 (40 钢管) + 集群内部模框 10 + 包裹梁 10
- BP14b 取 B4 (电路板 10 + 线缆 20 + 塑料 50 = 80)
- B5 merger 注入：HMF 2 + 电脑 2.5 = 4.5 mainNode

## 建造步骤（BP14a）

1. **1F (0-12m)**: 1 台 HMF manufacturer，facing=north（输入朝南）
2. **HMF 4 路输入**:
   - 螺丝 240：屋顶 B2 splitter → lift-bot → in-0
   - 钢管 40：屋顶 B3 splitter → lift-bot → in-1
   - 模框 10 + 包裹梁 10：左 Wall Inlet (h=8m, 2 条 belt) ← BP13 集群内 → manifold → in-2 + in-3
3. **HMF 输出**: out-0 (row=0 顶) → lift-out-top → 屋顶 merger 注 B5（2 mainNode）
4. **1F→2F (T7+)**: 4m 地基；2F 1 台电脑 manufacturer（T7+ 加）
5. **屋顶 (35-40m)**: 6 belt 直通 + 3 splitter + 1 merger
6. **Power Switch**: 单实例 T6 全开（HMF 1 台）；T7+ 启用 2F

## 建造步骤（BP14b）

同 BP14a，但 1F 装 1 台**电脑** manufacturer：
1. **电脑 4 路输入**:
   - 电路板 10 + 线缆 20 + 塑料 50 = 80（B4 programmable splitter 3 物料）→ lift-bot → in-0/1/2
   - 第 4 槽空（电脑配方仅 3 输入：CB + Cab + Plas）
2. **电脑输出**: 2.5/min → lift-out-top → 屋顶 merger 注 B5

## 多实例侧墙续接

BP14a/b 在机器层**无跨实例短 belt**（HMF 和电脑两条产线独立）。所有进料从屋顶 B2/B3/B4 取，所有出料注 B5。

集群内部短 belt 仅 1 处：**BP13 → BP14**（模框 + 包裹梁），通过 BP14 蓝图的左 Wall Inlet 接收。

蓝图侧墙集群内 mount（机器层）：

| 高度 | 物料 | 左 Wall | 右 Wall |
|---|---|---|---|
| h=4m row=2.5 | 模块化框架 | **Inlet** ← BP13 | 悬空 |
| h=4m row=3.5 | 包裹工业梁 | **Inlet** ← BP13 | 悬空 |

> BP14a 紧贴 BP13 右侧，BP14b 紧贴 BP14a 右侧。BP14b 左 Inlet 模框/包裹梁悬空（来自 BP14a 的不直通——实际 BP13 输出量 10+10 都给 BP14a HMF 一台消化，BP14b 跑电脑不需要）。

## Tier 7+ 扩容点

| Tier | HMF/电脑 | BP14a/b 各承载 |
|---|---|---|
| T6 | 1/1 | a=1 HMF, b=1 电脑 |
| T7 | 1/3 | a=1 HMF + 1 电脑 (2F), b=2 电脑 (1F+2F) |
| T8 | 1/4 | a=1 HMF + 1 电脑, b=3 电脑 (1F+2F) |
| T9 | 1/5 | a=1 HMF + 1 电脑 (满载), b=4 电脑 (1F+2F+3F? 但 manufacturer 净高 12m + 16m + 16m = 44m 超 35m) |

> ⚠ **T9 6 台空间问题**：manufacturer 1F 12m + 2F 16m = 28m，**第 3 层不可行**（28+16=44m > 35m）。所以单实例最多 2 台 manufacturer（1F+2F）；T9 6 台需 **3 实例 BP14a/b/c**。
> **README 表更新为 BP14a/b/c 3 实例**（T9 时启用第 3 实例 BP14c）。

## 验证

- [ ] manufacturer facing=north
- [ ] HMF 4 输入正确（螺丝/钢管/模框/包裹梁）
- [ ] 电脑 4 槽 3 用 1 空（电路板/线缆/塑料 + 空）
- [ ] B2 上 240 螺丝来自 BP3（B1 取走 350，剩 B2 还能取 240）
- [ ] T9 时 BP14c 第 3 实例物理建造（README 当前写 2，需补建议）
