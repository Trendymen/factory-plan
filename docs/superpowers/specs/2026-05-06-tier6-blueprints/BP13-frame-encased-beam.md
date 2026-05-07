# BP13 模块化框架 + 包裹工业梁 (C6)

## 概要

- **集群**: C6 装配（紧贴 BP12 之后）
- **规格**: Mk2 单实例（6 assembler 物理建造，T6 仅 5 台激活）
- **机器**: 3 模块化框架 + 2 包裹工业梁 assembler（T6）→ 4+2 = 6（T9 满载）
- **激活时间线**: T6 3+2=5 → T7 3+2=5 → T8 4+2=6 → T9 **4+2=6**
- **产能 T6**: 模块化框架 12 / 包裹工业梁 16

## 机器超频清单（T6，Plan C ≤250%）

| 配方 | 数量 | 超频 | 单台产能 (/min) | Power Shard/台 |
|---|---:|---:|---:|---:|
| modular-frame (assembler) | 3 | **200.0%** | 4.0 | 2 |
| encased-industrial-beam (assembler) | 2 | **133.33%** | 8.0 | 1 |
| **合计 (T6)** | 5 | — | — | 3×2 + 2×1 = **8** |

> 总产能验证: 3 × 4.0 = 12 模块化框架 ✓ | 2 × 8.0 = 16 包裹工业梁 ✓

## 物料 I/O

| 方向 | 物料 | 流量 (T6) | 路径 |
|---|---|---|---|
| 输入 | 强化铁板 | 18 | **屋顶 B2** ← BP2 → splitter |
| 输入 | 铁棒 | 72 | **屋顶 B2** ← BP2 → splitter |
| 输入 | 钢梁 | 48 | **屋顶 B3** ← BP5 → splitter |
| 输入 | 混凝土 | 96 | **屋顶 B4** ← BP10 → splitter |
| 输出 | 模块化框架 → BP14 HMF（C6 内部）| 10 | 集群内短 belt |
| 输出 | 包裹工业梁 → BP14 HMF | 10 | 集群内短 belt |
| 输出 | 模块化框架 → B5 终端 | 2 | 屋顶 merger → B5 |
| 输出 | 包裹工业梁 → B5 终端 | 6 | 屋顶 merger → B5 |

**屋顶总线接入**:
- 取自 B2 (强化铁板 18 + 铁棒 72 = 90) + B3 (钢梁 48) + B4 (混凝土 96)
- 注入 B5 (8 mainNode)

## 楼层占用

| 层 | 高度 | 内容 | 数量 |
|---|---|---|---:|
| 1F | 0-8m | 3 模块化框架 assembler 一字排 | 3 |
| 2F | 12-20m | 2 包裹工业梁 assembler 一字排 | 2 |
| 屋顶 | 35-40m | B1-B6 + 3 splitter + 1 merger + 多 lift | — |

> 1F 3 台一行（30m × 15m，剩 10m 给 belt）；2F 2 台（20m × 15m，剩更多）。

## 俯视图（按实际比例，每层独立 — 视觉正方形）

**比例约定**：
- 横向：**1 字符 = 1m**
- 纵向：**1 行 = 2m**
- 蓝图 40×40m → 40 字符宽 × 20 行高

**机器实际尺寸** → ASCII 占位：

| 机器 | 实际 | ASCII 占位（W × H） |
|---|---|---|
| assembler | 10m × 15m | 10 字符 × 7-8 行 |

### 1F (0-8m): 3 模块化框架 assembler

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌─────────┐┌─────────┐┌─────────┐                 │
        ││   M1    ││   M2    ││   M3    │                 │
 4      ││ frame   ││ frame   ││ frame   │  T9 +1 reserve  │
        ││ 10x15   ││ 10x15   ││ 10x15   │  (col 3 row 0)  │
 8      ││  v      ││  v      ││  v      │                 │
        │└─────────┘└─────────┘└─────────┘                 │
12      │─────────── frame collect belt h=2m ──────────────│
        │ in: RIP 18 + iron-rod 72 (each split to 3 in-0)  │
16      │ all 2 lift-bot from roof B2 prog splitter        │
        │                                                  │
20      │ out: frame 12/min >> central splitter            │
        │   10 -> right-wall outlet to BP14 HMF            │
24      │   2  -> lift-out-top to roof merger (B5)         │
        │                                                  │
32      │                                                  │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- M1-M3: modular-frame assembler 10m W × 15m L × 8m H（模块化框架）
- T9 满载加 1 台（col 3 row 0 预留）

### 2F (12-20m): 2 包裹工业梁 assembler

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌─────────┐┌─────────┐                            │
        ││   E1    ││   E2    │                            │
 4      ││ encased ││ encased │                            │
        ││ 10x15   ││ 10x15   │                            │
 8      ││  v      ││  v      │                            │
        │└─────────┘└─────────┘                            │
12      │─────────── beam collect belt h=14m ──────────────│
        │ in: steel-beam 48 + concrete 96 (each split 2)   │
16      │ steel-beam from B3 splitter, concrete from B4    │
        │ both via lift-bot to 2F manifold                 │
20      │                                                  │
        │ out: beam 16/min >> central splitter             │
24      │   10 -> right-wall outlet to BP14 HMF            │
        │   6  -> lift-out-top to roof merger (B5)         │
32      │                                                  │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- E1-E2: encased-industrial-beam assembler 10m W × 15m L × 8m H（包裹工业梁）

### 屋顶 (35-40m): B1-B6 + 3 splitter + 1 merger

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │ o B1 ──────────────────────────────────────── o  │
 4      │ o B2 ───[prog split: RIP 18 + rod 72 = 90]─── o  │
 8      │ o B3 ───[smart split: steel-beam 48]──────── o   │
12      │ o B4 ───[smart split: concrete 96]────────── o   │
16      │ o B5 ───[merger << lift-top mainNode 8]──── o    │
20      │ o B6 ──────────────────────────────────────── o  │
24      │                                                  │
28      │ 4 lift-bot: RIP+rod / beam / concrete to 1F/2F   │
32      │ 2 lift-top: frame + beam mainNode to B5          │
36      │                                                  │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- B2 取强化铁板 18 + 铁棒 72 = 90（programmable splitter）
- B3 取钢梁 48（smart splitter）
- B4 取混凝土 96（smart splitter，来自 BP10 跨 C5 段）
- B5 merger 注入：模框 2 + 包裹梁 6 = 8 mainNode

## 建造步骤

1. **1F (0-8m)**: 3 台模块化框架 assembler 一字排
2. **1F 进料**:
   - 强化铁板 18：屋顶 splitter → lift-bot → manifold → 3 台 in-0
   - 铁棒 72：屋顶 splitter → lift-bot → manifold → 3 台 in-1
3. **1F belt 收集**: row=3 模块化框架 主 belt
4. **1F→2F**: 4m 地基；2F 2 台包裹工业梁 assembler
5. **2F 进料**:
   - 钢梁 48：屋顶 splitter → lift-bot 下到 2F → 2 台 in-0
   - 混凝土 96：屋顶 splitter → lift-bot 下到 2F → 2 台 in-1
6. **2F belt 收集**: row=3 包裹工业梁 主 belt
7. **集群内短 belt 出口**: 模块化框架 10 + 包裹工业梁 10 → 右 Wall Outlet (col=5, h=20m, row=3) → BP14 左 Wall Inlet
8. **垂直汇总（mainNode）**: 模框 2 + 包裹梁 6 → lift-out-top → 屋顶 merger 注 B5
9. **屋顶 (35-40m)**: 6 belt 直通 + 3 splitter + 1 merger
10. **Power Switch**: 关闭 1 台闲置（T6 5 台开，T9 6 台开）

## 集群内部连接

- 出口右 Wall Outlet (h=20m, 模框 + 包裹梁 各一条 belt) → BP14 左 Wall Inlet
- BP14 HMF manufacturer 4 输入：模框 10 + 包裹梁 10 + 钢管 40 + 螺丝 240，前两路从这里接

## Tier 7+ 扩容点

T7 起即满载（uplift 1.5-1.6x），无变化。

## 验证

- [ ] 4 路屋顶 splitter filter 正确（强化铁板/铁棒/钢梁/混凝土）
- [ ] 集群内出口 row 与 BP14 输入对齐
- [ ] 模框 + 包裹梁 各 10/min 走集群内（不是 B5）
- [ ] B4 混凝土 96 来自 BP10（C5），跨 C5→C6 经 B4 总线
