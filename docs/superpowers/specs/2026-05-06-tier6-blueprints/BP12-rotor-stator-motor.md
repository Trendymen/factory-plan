# BP12 转子 + 定子 + 电机 (C6)

## 概要

- **集群**: C6 装配（紧贴 BP11 之后，C6 第一个）
- **规格**: Mk2 单实例（7 assembler 物理建造，T6 仅 5 台激活）
- **机器**: 2 转子 + 2 定子 + 1 电机 assembler（T6）→ 3 转子 + 3 定子 + 1 电机（T7+ 满载，**T7 起即满载**）
- **激活时间线**: T6 2+2+1=5 → T7 3+3+1=7 (满载) → T8 = T9 = 7
- **产能 T6**: 转子 14 / 定子 15 / 电机 5

## 机器超频清单（T6，Plan C ≤250%）

| 配方 | 数量 | 超频 | 单台产能 (/min) | Power Shard/台 |
|---|---:|---:|---:|---:|
| rotor (assembler) | 2 | **175.0%** | 7.0 | 2 |
| stator (assembler) | 2 | **150.0%** | 7.5 | 1 |
| motor (assembler) | 1 | **100.0%** | 5.0 | 0 |
| **合计 (T6)** | 5 | — | — | 2×2 + 2×1 + 0 = **6** |

> 总产能验证: 2 × 7.0 = 14 转子 ✓ | 2 × 7.5 = 15 定子 ✓ | 1 × 5.0 = 5 电机 ✓

## 物料 I/O

| 方向 | 物料 | 流量 (T6) | 路径 |
|---|---|---|---|
| 输入 | 螺丝 → 转子 | 350 | **屋顶 B1** ← BP3 → smart splitter |
| 输入 | 铁棒 → 转子 | 70 | **屋顶 B2** ← BP2 → splitter |
| 输入 | 钢管 → 定子 | 45 | **屋顶 B3** ← BP5 → splitter |
| 输入 | 电线 → 定子 | 120 | **屋顶 B3** ← BP7 → splitter |
| 输入 | 转子 + 定子 → 电机（内部）| 10+10 | 蓝图内 lift |
| 输出 | 转子 → B5 终端 | 4 | 屋顶 merger → B5 |
| 输出 | 定子 → B5 终端 | 5 | 屋顶 merger → B5 |
| 输出 | 电机 → B5 终端 | 5 | 屋顶 merger → B5 |

**屋顶总线接入**:
- 取自 B1 (螺丝 350) + B2 (铁棒 70) + B3 (钢管 45 + 电线 120 = 165)
- 注入 B5 (转子 4 + 定子 5 + 电机 5 = 14 mainNode)

## 楼层占用

| 层 | 高度 | 内容 | 数量 |
|---|---|---|---:|
| 1F | 0-8m | 4 assembler（2 转子 + 2 定子）| 4 |
| 2F | 12-20m | 1 电机 assembler（T7+ 加 1 转子 + 1 定子）| 1-3 |
| 屋顶 | 35-40m | B1-B6 + 4 splitter + 1 merger + 多 lift | — |

## 俯视图（按实际比例，每层独立 — 视觉正方形）

**比例约定**：
- 横向：**1 字符 = 1m**
- 纵向：**1 行 = 2m**
- 蓝图 40×40m → 40 字符宽 × 20 行高

**机器实际尺寸** → ASCII 占位：

| 机器 | 实际 | ASCII 占位（W × H） |
|---|---|---|
| assembler | 10m × 15m | 10 字符 × 7-8 行 |

### 1F (0-8m): 2 转子 + 2 定子 assembler = 4 台

> 盒内仅单宽字符，中文注释在盒外。`v` = 输出 front (south)。

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌─────────┐┌─────────┐                           │
        ││   R1    ││   R2    │                           │
 4      ││ rotor   ││ rotor   │                           │
        ││ 10x15   ││ 10x15   │                           │
 8      ││  v      ││  v      │                           │
        │└─────────┘└─────────┘                           │
12      │─────────── rotor collect belt h=2m ─────────────│
        │┌─────────┐┌─────────┐                           │
        ││   S1    ││   S2    │                           │
16      ││ stator  ││ stator  │                           │
        ││ 10x15   ││ 10x15   │                           │
20      ││  v      ││  v      │                           │
        │└─────────┘└─────────┘                           │
24      │─────────── stator collect belt h=2m ────────────│
        │ in: screw 350  + iron-rod 70  (rotor in-0/in-1) │
28      │ in: steel-pipe 45 + wire 120 (stator in-0/in-1) │
        │ all 4 lift-bot from roof splitter manifold      │
32      │                                                 │
        │ out >> central splitter:                        │
36      │   rotor 14 (10 to motor + 4 mainNode)           │
        │   stator 15 (10 to motor + 5 mainNode)          │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- R1-R2: rotor assembler 10m W × 15m L × 8m H（转子）
- S1-S2: stator assembler 10m W × 15m L × 8m H（定子）
- T7+ 各加 1 台 R3 / S3，col 2-3 row 0/2.5 预留

### 2F (12-20m): 1 电机 assembler

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌─────────┐                                      │
        ││   M1    │  T7+ R3 / S3 reserve                 │
 4      ││ motor   │  (col 1-2 row 0 / row 2.5)           │
        ││ 10x15   │                                      │
 8      ││  v      │                                      │
        │└─────────┘                                      │
12      │─────────── motor output belt h=14m ─────────────│
        │ in: rotor 10 (lift-bot from 1F splitter)        │
16      │ in: stator 10 (lift-bot from 1F splitter)       │
        │                                                 │
20      │ out: motor 5/min >> lift-out-top to roof merger │
        │                                                 │
24      │                                                 │
        │                                                 │
32      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- M1: motor assembler 10m W × 15m L × 8m H（电机）
- T7+ 加 1 转子 + 1 定子（满载 7 台），col 1-2 row 0 / 2.5 预留

### 屋顶 (35-40m): B1-B6 + 4 splitter + 1 merger

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │ o B1 ───[smart split: screw 350]──────────── o  │
 4      │ o B2 ───[split: iron-rod 70]─────────────── o   │
 8      │ o B3 ───[prog split: pipe 45 + wire 120]── o    │
12      │ o B4 ──────────────────────────────────────── o │
16      │ o B5 ───[merger << lift-top mainNode 14]─── o   │
20      │ o B6 ──────────────────────────────────────── o │
24      │                                                 │
28      │ 4 lift-bot: screw / rod / pipe / wire to 1F     │
32      │ 2 lift-top: rotor+stator+motor mainNode to B5   │
36      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- B1 取螺丝 350 → BP12（B1 流量在此清零）
- B2 取铁棒 70（来自 BP2）
- B3 取钢管 45 + 电线 120 = 165（programmable splitter）
- B5 merger 注入：转子 4 + 定子 5 + 电机 5 = 14 mainNode

## 建造步骤

1. **1F (0-8m)**: 4 assembler 2×2 grid（2 转子 row=0-1，2 定子 row=2.5-3.5）
2. **进料 4 路**:
   - 螺丝 350：屋顶 B1 smart splitter → lift-bot → 1F → manifold → 2 转子 in-0
   - 铁棒 70：屋顶 B2 splitter → lift-bot → 1F → 2 转子 in-1
   - 钢管 45：屋顶 B3 → lift-bot → 1F → 2 定子 in-0
   - 电线 120：屋顶 B3 → lift-bot → 1F → 2 定子 in-1
3. **1F belt 收集**: row=4 转子+定子 主 belt（合流 row 不同物料但共 lift-up）
4. **1F→2F**: 4m 地基；2F 1 台 电机 assembler
5. **电机进料**: 1F 转子 + 定子 各 splitter 1 部分 → lift-up → 2F 电机 in
6. **垂直汇总 + 屋顶**:
   - 转子 1F 输出 splitter（10 给电机 + 4 mainNode）
   - 定子 1F 输出 splitter（10 给电机 + 5 mainNode）
   - 电机 2F 输出 → lift-out-top → 屋顶 merger
   - 三条 mainNode (4+5+5=14) → 屋顶 merger 注 B5
7. **屋顶 (35-40m)**: 6 belt 直通 + 3 splitter (B1/B2/B3) + 1 merger (B5)
8. **Power Switch**: 关闭 2 台 T7+ 才接（T6 仅 5 台开）

## Tier 7+ 扩容点

| Tier | 转子/定子/电机 |
|---|---|
| T6 | 2/2/1 = 5 |
| T7 | 3/3/1 = 7 (满载) |
| T8 = T9 | 7 不变 |

## 验证

- [ ] 4 路屋顶 splitter filter 正确（螺丝/铁棒/钢管/电线）
- [ ] B1 上 350 螺丝是 BP3→BP12 全部流量（B1 总流量 = 350，BP12 取完后 0）
- [ ] manufacturer 反转端口规则不适用（BP12 全是 assembler，端口正向）
- [ ] B5 + 14 流量在容量内（B5 累计 ~80）
