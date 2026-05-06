# BP12 转子 + 定子 + 电机 (C6)

## 概要

- **集群**: C6 装配（紧贴 BP11 之后，C6 第一个）
- **规格**: Mk2 单实例（7 assembler 物理建造，T6 仅 5 台激活）
- **机器**: 2 转子 + 2 定子 + 1 电机 assembler（T6）→ 3 转子 + 3 定子 + 1 电机（T7+ 满载，**T7 起即满载**）
- **激活时间线**: T6 2+2+1=5 → T7 3+3+1=7 (满载) → T8 = T9 = 7
- **产能 T6**: 转子 14 / 定子 15 / 电机 5

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

## 俯视图（1F, 0-8m）

```
       col=0   col=1   col=2   col=3   col=4   col=5
      ┌──────┬──────┬──────┬──────┬──────┐
r=0   │ ┌────┐ ┌────┐                     │  2 转子 assembler
      │ │R1  │ │R2  │                     │  10m × 15m × 8m
r=1   │ │Rotor│ │Rotor│                   │
r=2   │ └────┘ └────┘                     │
      ├──────┼──────┼──────┼──────┼──────┤
r=2.5 │ ┌────┐ ┌────┐                     │  2 定子 assembler
      │ │S1  │ │S2  │                     │
r=3.5 │ │Stat│ │Stat│                     │
r=4   │ └────┘ └────┘                     │
      └──────┴──────┴──────┴──────┴──────┘
```

> assembler 10m × 15m，4 台 2×2 grid（20m × 30m），剩 col 2-4 空。

## 屋顶总线层（35-40m）

```
B1 ═══[smart split (filter=螺丝 350)──350┐]═> B1 余 (-350)
B2 ═══[split (filter=铁棒 70)──70┐  ]═══════> B2 余 (-70)
B3 ═══[programmable split (钢管45+电线120)─165┐]═> B3 余 (-165)
B4 ═════════════════════════════════════════> B4
B5 ═══[merger ←──14 mainNode lift]═════════> B5 (+14)
B6 ═════════════════════════════════════════> B6
                       │ │ │
                  lift-bot (3-4 路)
                       ↓ ↓ ↓
                    1F splitter manifold
```

- 屋顶 3 个 splitter（B1 取螺丝、B2 取铁棒、B3 取钢管+电线）
- 屋顶 1 个 merger（注 B5）
- 4 路 lift-bot（螺丝/铁棒/钢管/电线分别下到 1F manifold）
- 2 路 lift-top（mainNode 转子+定子+电机 上行 → merger）

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
