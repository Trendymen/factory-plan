# BP14 重型模块框架 + 电脑 (C6)

## 概要

- **集群**: C6 装配（紧贴 BP13 之后）
- **规格**: Mk2 **2 实例**（BP14a + BP14b，每实例 1 manufacturer，因为 manufacturer 20×22m 占地大）
- **机器**: 1 HMF + 1 电脑 manufacturer（T6）→ 1+5=6（T9 满载，电脑 11x uplift 大头）
- **激活时间线**: T6 1+1=2 → T7 1+3=4 → T8 1+4=5 → T9 **1+5=6**
- **产能 T6**: HMF 2/min · 电脑 2.5/min

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

## 俯视图（1F BP14a, 0-12m）

```
       col=0   col=1   col=2   col=3   col=4   col=5
      ┌──────┬──────┬──────┬──────┬──────┐
r=0   │ ┌──────────────────────────────┐ │  1 HMF manufacturer
      │ │ HMF manufacturer (T6 active) │ │  20m × 22m × 12m
r=1   │ │  4-input front (south)       │ │  facing=north (端口反转)
      │ │  1-output back (north)       │ │
r=2   │ │  ↑ ↑ ↑ ↑ (in 0-3, row=2.75)  │ │
      │ │                              │ │
r=2.75│ │  out-0 ↓ back (row=0)        │ │
      │ └──────────────────────────────┘ │
      ├──────┼──────┼──────┼──────┼──────┤
r=3   │ ===collect HMF mainNode lift──── │
      └──────┴──────┴──────┴──────┴──────┘
```

> **manufacturer 端口反转**：facing=north，让 4 输入朝南、1 输出朝北。
> 输入 4 槽（screw 240, steel-pipe 40, modular-frame 10, encased-beam 10）从 row=2.75 进。

## 屋顶总线层（35-40m）

```
B1 ═════════════════════════════════════════> B1 余
B2 ═══[smart split (filter=螺丝240)──240┐]═> B2 余 (-240)
B3 ═══[smart split (filter=钢管40)──40┐ ]═> B3 余 (-40)
B4 ═══[programmable split (CB10+Cab20+Plas50)─80┐]═> B4 余 (-80)
B5 ═══[merger ←──HMF2 + 电脑2.5 lift]══════> B5 (+4.5)
B6 ═════════════════════════════════════════> B6
                                          │
                                       lift-bot (3-7 路)
                                          ↓
                                       1F manufacturer in
```

- 屋顶 3 个 splitter（B2/B3/B4）
- 屋顶 1 个 merger（注 B5）

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
