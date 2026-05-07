# BP10 石英 + 硅土 + 快速线 + 混凝土 + AI 限制器 (C5)

## 概要

- **集群**: C5 MAM + 混凝土 + SAM
- **规格**: Mk2 **2 实例**（BP10a + BP10b，相同蓝图复制；T9 满载 28 台）
- **机器**: 1 quartz-crystal + 1 silica + 3 quickwire constructor + 3 concrete constructor + 1 AI-limiter assembler = **9 台**（T6）
- **激活时间线**: T6 1+1+3+3+1 → T7 2+3+5+4+1 → T8 3+5+8+5+2 → T9 **4+7+10+5+2 = 28**
- **产能 T6**: 石英晶体 40.5 / 硅土 37.5 / 快速线 370 / 混凝土 111 / AI 限制器 5

## 机器超频清单（T6，Plan C ≤250%）

| 配方 | 数量 | 超频 | 单台产能 (/min) | Power Shard/台 |
|---|---:|---:|---:|---:|
| quartz-crystal (constructor) | 1 | **180.0%** | 40.5 | 2 |
| silica (constructor) | 1 | **100.0%** | 37.5 | 0 |
| quickwire (constructor) | 3 | **205.56%** | 123.33 | 3 |
| concrete (constructor) | 3 | **246.67%** | 37.0 | 3 |
| ai-limiter (assembler) | 1 | **100.0%** | 5.0 | 0 |
| **合计 (T6)** | 9 | — | — | 1×2 + 0 + 3×3 + 3×3 + 0 = **20** |

> 总产能验证: 1 × 40.5 = 40.5 石英 ✓ | 1 × 37.5 = 37.5 硅土 ✓ | 3 × 123.33 = 370 快速线 ✓ | 3 × 37 = 111 混凝土 ✓ | 1 × 5 = 5 AI 限制器 ✓

## 物料 I/O

| 方向 | 物料 | 流量 (T6) | 路径 |
|---|---|---|---|
| 输入 | 原始石英 | 78 | 矿场 → 左 Wall Inlet (h=4m) |
| 输入 | 石灰石 | 333 | 矿场 → 左 Wall Inlet (h=4m，第二口) |
| 输入 | 铜金锭 | 74 | **屋顶 B6** ← BP6 → smart splitter |
| 输入 | 铜板 | 25 | **屋顶 B6** ← BP7（与铜金锭同向走 B6）→ smart splitter |
| 输出 | 石英晶体 → BP15 晶振 | 18 | 屋顶 merger → B6 |
| 输出 | 石英晶体 → B5 终端 | 22.5 | 屋顶 merger → B5 |
| 输出 | 硅土 → B5 终端 | 37.5 | 屋顶 merger → B5 |
| 输出 | 快速线 → BP15 HSC | 210 | 屋顶 merger → B6 |
| 输出 | 快速线 → AI 限制器（内部）| 100 | 蓝图内 lift |
| 输出 | 快速线 → B5 终端 | 60 | 屋顶 merger → B5 |
| 输出 | 混凝土 → BP13 包裹 | 96 | 屋顶 merger → B4 |
| 输出 | 混凝土 → B5 终端 | 15 | 屋顶 merger → B5 |
| 输出 | AI 限制器 → B5 终端 | 5 | 屋顶 merger → B5 |

**屋顶总线接入**:
- 取自 B6 (铜金锭 74 + 铜板 25)
- 注入 B4 (混凝土 96)
- 注入 B5 (140 mainNode = 22.5+37.5+60+15+5)
- 注入 B6 (228 = 石英 18 + 快速线 210)

## 楼层占用（单实例）

| 层 | 高度 | 内容 | 数量 |
|---|---|---|---:|
| 1F | 0-8m | constructor + AI 限制器 assembler | 4-9 |
| 2F | 12-20m | constructor 第二行 | 0-9 |
| 屋顶 | 35-40m | B1-B6 + 多 merger + smart splitter + 多 lift | — |

> 9 台机器 + 1 assembler ≈ 9 × 80 + 150 = 870 m²，1F 1600m² 装下。

## 俯视图（按实际比例，每层独立 — 视觉正方形）

**比例约定**：横向 1 字符 = 1m，纵向 1 行 = 2m；蓝图 40×40m → 51 字符 × 20 行画布。

机器 ASCII 占位：constructor 8m × 10m → 9 字符宽 × 5 行；assembler 10m × 15m → 11 字符宽 × 7-8 行。

### 1F (0-8m): 5 constructor row=0 + 3 concrete + 1 AI-limiter row=2 = 9 台（T6 满载，混排）

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌───────┐┌───────┐┌───────┐┌───────┐┌───────┐    │
        ││  Qz   ││  Si   ││  Qw1  ││  Qw2  ││  Qw3  │    │
 4      ││quartz ││silica ││quickwr││quickwr││quickwr│    │
        ││ 8x10  ││ 8x10  ││ 8x10  ││ 8x10  ││ 8x10  │    │
 8      ││   v   ││   v   ││   v   ││   v   ││   v   │    │
        │└───────┘└───────┘└───────┘└───────┘└───────┘    │
12      │──── row1 collect: 5 mat lanes (Qz/Si/Qw) ───────│
        │┌───────┐┌───────┐┌───────┐┌─────────┐           │
16      ││  Cn1  ││  Cn2  ││  Cn3  ││  AILim  │           │
        ││concret││concret││concret││ai-limit │           │
20      ││ 8x10  ││ 8x10  ││ 8x10  ││ 10x15   │           │
        ││   v   ││   v   ││   v   ││  in*2   │           │
24      │└───────┘└───────┘└───────┘│   v     │           │
        │                            └─────────┘          │
28      │──── row2 collect: concrete + AI-limiter ────────│
32      │ in raw-quartz 78:  left Wall Inlet h=4m row=0   │
        │ in limestone 333:  left Wall Inlet h=4m row=2   │
36      │ in copper-ingot 74 + copper-plate 25: B6 split  │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- row=0 (0-10m): Qz/Si + 3 Qw 共 5 constructor 一字排（5 × 8m = 40m 满）
- row=2 (12-22m): 3 concrete constructor + 1 AI-limiter assembler；AI-limiter 10m W × 15m L 占 col=3.75-4.875、row=12-26m，比 concrete 长 5m，整体下沉
- 5 物料独立 row 收集：Qz/Si 走 row=1，3 Qw 走 row=1（共享 row=1 lane 但物料独立 belt），concrete 走 row=2.5，AI-limiter 走 row=3.5
- T7+ 第 6-7 台 quickwire / 第 4-5 台 concrete / 第 2 台 AI-limiter 在 2F 扩容（12-20m）

### 屋顶 (35-40m): B6 上 smart-split + 4 merger（B4/B5/B6 注入）

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │ o B1 ───────────────────────────────────────── o│
        │                                                 │
 4      │ o B2 ───────────────────────────────────────── o│
        │                                                 │
 8      │ o B3 ───────────────────────────────────────── o│
        │                                                 │
12      │ o B4 ──────────────[merger ← concrete 96]───── o│
        │                            ↑ lift-top from 1F   │
16      │ o B5 ──────────────[merger ← mainNode 140]──── o│
        │                            ↑ Qz22.5+Si37.5+Qw60 │
20      │                              +Cn15+AI5 = 140    │
        │                                                 │
24      │ o B6 ─[smart f=Cu-ingot74+Cu-plate25]─[merger]─o│
        │          │ 99/min                  ↑            │
28      │       lift-bot                Qz18+Qw210        │
        │          ↓                       = 228          │
32      │       1F Qw in-0 + AI in-0     after split      │
36      │ B7/B8 reserved (T7+ slots)                      │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- B4 merger: 注入混凝土 96 → BP13 包裹下游取
- B5 merger: 5 物料 mainNode 余量混合 140（石英 22.5 + 硅土 37.5 + 快速线 60 + 混凝土 15 + AI 限制器 5）
- B6 上**先 smart-splitter 后 merger**：splitter 取铜金锭 74 + 铜板 25 共 99 给 1F quickwire 三台 in-0 + AI-limiter in-0；merger 在 splitter 下游注入石英 18 + 快速线 210 = 228（避免新注入的快速线被 splitter 误取）
- B6 上 BP7→BP10 段流量必须 ≥ 99（满足铜金 74 + 铜板 25）

## 建造步骤（BP10a，BP10b 复制）

1. **1F (0-8m)**: 9 台机器（按俯视图布置）
2. **原始石英进料**: 左 Wall Inlet (h=4m, row=0) → splitter → quartz 1 台 + silica 1 台
3. **石灰石进料**: 左 Wall Inlet (h=4m, row=2) → splitter → 3 台 concrete
4. **铜金锭进料 (B6)**: 屋顶 smart splitter → lift-bot → 1F quickwire 3 台 in-0
5. **铜板进料 (B6)**: 同 splitter 取 25 → lift-bot → AI 限制器 in-0
6. **快速线 → AI 限制器**: 1F quickwire 输出 1 部分 → 短 belt → AI 限制器 in-1（同 1F 内连接）
7. **1F belt 收集**: row=4 横向 5 条独立 row 主 belt（每物料 1 条）
8. **1F→2F** (T7+): 4m 地基；2F 第二行 constructor
9. **垂直汇总 + 屋顶**:
   - 5 条 lift-out-top（5 物料各 1 条）→ 屋顶 4 个 merger
   - 快速线先在 1F splitter 1→3（100 内部 + 210 上 B6 + 60 上 B5）
   - 石英晶体 1F splitter 1→2（18 上 B6 + 22.5 上 B5）
10. **Power Switch**: 关闭闲置（T6 单实例 ≈ 5 台开）

## Tier 7+ 扩容点

| Tier | 石英/硅土/快速线/混凝土/AI 限制器 | 实例 |
|---|---|---:|
| T6 | 1/1/3/3/1 = 9 | 1 (BP10a 跑) |
| T7 | 2/3/5/4/1 = 15 | 2 (BP10a + BP10b) |
| T8 | 3/5/8/5/2 = 23 | 2 (满载) |
| T9 | 4/7/10/5/2 = 28 | 2 (满载，T9 时 BP10a 14 台 + BP10b 14 台) |

## 多实例侧墙续接

BP10 是 **2 实例 + 无机器层跨蓝图 belt**：BP10 不消化集群内部物料（输入全从屋顶 B6 取，输出全到屋顶 B4/B5/B6）。BP10a/b 之间机器层无短 belt。

蓝图侧墙集群内 mount（机器层）：**无**（BP10 蓝图侧墙仅有屋顶 6 belt mount）。

> T6 仅 BP10a 1 实例满载 9 台；BP10b 物理建造但 0 激活。
> T7+ 启用 BP10b 时，所有物料仍走屋顶（不需要机器层短 belt）。

## 关键路由

- **铜板从 BP7（C3）跨 C4 到 BP10（C5）**：经 B6 总线携带（与铜金锭同向）。BP10 屋顶 smart splitter 必须同时取 铜金锭 74 + 铜板 25 = 99/min（按 filter 类型分两个 splitter 输出）。
- **混凝土反向到 BP13（C6 → 但 BP13 在 BP10 后面，所以是正向）**：B4 总线在 BP10 注入 96，BP13 在 BP10 之后取走，正向流。

## 验证

- [ ] B6 上铜金锭+铜板 99 流量满足 BP10 取（B6 BP7→BP10 段需 ≥ 99）
- [ ] 5 物料独立 row（不混料）
- [ ] 屋顶 4 个 merger filter 正确（B4=混凝土、B5=5 mainNode 混、B6=石英+快速线、smart split B6 取铜金/铜板）
- [ ] AI 限制器**已迁移到此**，BP8 不再有
- [ ] 8 + 9 + 9 = 26 台 T6 不开（BP10b 全闲）
