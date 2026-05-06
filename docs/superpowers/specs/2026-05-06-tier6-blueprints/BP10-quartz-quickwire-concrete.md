# BP10 石英 + 硅土 + 快速线 + 混凝土 + AI 限制器 (C5)

## 概要

- **集群**: C5 MAM + 混凝土 + SAM
- **规格**: Mk2 **2 实例**（BP10a + BP10b，相同蓝图复制；T9 满载 28 台）
- **机器**: 1 quartz-crystal + 1 silica + 3 quickwire constructor + 3 concrete constructor + 1 AI-limiter assembler = **9 台**（T6）
- **激活时间线**: T6 1+1+3+3+1 → T7 2+3+5+4+1 → T8 3+5+8+5+2 → T9 **4+7+10+5+2 = 28**
- **产能 T6**: 石英晶体 40.5 / 硅土 37.5 / 快速线 370 / 混凝土 111 / AI 限制器 5

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

## 俯视图（1F BP10a, 0-8m）

```
       col=0   col=1   col=2   col=3   col=4   col=5
      ┌──────┬──────┬──────┬──────┬──────┐
r=0   │ ┌──┐ │ ┌──┐ │ ┌──┐ │ ┌──┐ │ ┌──┐ │  row 1: 1 quartz + 1 silica + 3 quickwire = 5 constructor
      │ │Qz│ │ │Si│ │ │Qw│ │ │Qw│ │ │Qw│ │  Qz=quartz, Si=silica, Qw=quickwire
r=1   │ └─↓┘ │ └─↓┘ │ └─↓┘ │ └─↓┘ │ └─↓┘ │
      ├──────┼──────┼──────┼──────┼──────┤
r=2   │ ┌──┐ │ ┌──┐ │ ┌──┐ │ ┌─────┐  │  │  row 2: 3 concrete + 1 AI 限制器 assembler
      │ │Cn│ │ │Cn│ │ │Cn│ │ │AILim│  │  │  Cn=concrete, AILim=AI 限制器 (10m×15m)
r=3   │ │  │ │ │  │ │ │  │ │ │     │  │  │
      │ └─↓┘ │ └─↓┘ │ └─↓┘ │ │     │  │  │
      ├──────┼──────┼──────┼─└─────┘──┤  │
r=4   │ ===collect (5 物料 row 各独立)│  │
      └──────┴──────┴──────┴──────┴──────┘
```

> AI 限制器 assembler 占 row=2-4 (15m 长 = 1.875 cells)，与 constructor 错开。

## 屋顶总线层（35-40m）

```
B1 ═════════════════════════════════════════> B1
B2 ═════════════════════════════════════════> B2
B3 ═════════════════════════════════════════> B3
B4 ═══[merger ←──混凝土 96 lift]═══════════> B4 (+96)
B5 ═══[merger ←──mainNode 140 lift]═════════> B5 (+140)
B6 ═══[smart split (filter=铜金74 + 铜板25)──99┐ ]═> B6 余 (-99 +228)
                                             │
                                          lift-bot ↓
                                             │
                                  → 1F quickwire/AI 限制器 进料
B6 (after merger) ═══[merger ←──石英18 + 快速线210]═══>
```

- 屋顶 1 个 smart splitter（filter=铜金锭 74 + 铜板 25 共 99）从 B6 取
- 屋顶 1 个 merger 注 B4（混凝土 96）
- 屋顶 1 个 merger 注 B5（5 种 mainNode 余量混合 140）
- 屋顶 1 个 merger 注 B6（石英 18 + 快速线 210 = 228，在 splitter 之后）

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

## 关键路由

- **铜板从 BP7（C3）跨 C4 到 BP10（C5）**：经 B6 总线携带（与铜金锭同向）。BP10 屋顶 smart splitter 必须同时取 铜金锭 74 + 铜板 25 = 99/min（按 filter 类型分两个 splitter 输出）。
- **混凝土反向到 BP13（C6 → 但 BP13 在 BP10 后面，所以是正向）**：B4 总线在 BP10 注入 96，BP13 在 BP10 之后取走，正向流。

## 验证

- [ ] B6 上铜金锭+铜板 99 流量满足 BP10 取（B6 BP7→BP10 段需 ≥ 99）
- [ ] 5 物料独立 row（不混料）
- [ ] 屋顶 4 个 merger filter 正确（B4=混凝土、B5=5 mainNode 混、B6=石英+快速线、smart split B6 取铜金/铜板）
- [ ] AI 限制器**已迁移到此**，BP8 不再有
- [ ] 8 + 9 + 9 = 26 台 T6 不开（BP10b 全闲）
