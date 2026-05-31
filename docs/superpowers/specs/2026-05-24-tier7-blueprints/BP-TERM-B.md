# BP-TERM-B 终端汇流（后 13 mainNode + 1 共享 sink）

## 概要

- **集群**: 总线最末端（紧贴 BP-TERM-A 之后）
- **规格**: Mk2 单实例
- **建筑**: 13 个 Dim Depot Uploader（T6 后半批，5×10×8m **尺寸待游戏内实测**）+ **9 个 T7+ 预留 Uploader（2F，T6 物理建好但 Power Switch 关）** + **1 个共享 awesome-sink (16×13×24m)** + 22 个 smart splitter + **13 个 merger（3 级级联汇 26 路 overflow，merger 为 3 进 1 出）**
- **作用**: 26 mainNode 中的**后 13 个**送入位面仓 + **唯一共享 sink** 兜底所有 26 mainNode 的 overflow
- **激活时间线**（仅翻 Power Switch + 按需给 Uploader 插 Power Shard，**sink 不超频**，不动结构）:
  - T6 → 13 个 mainNode Uploader (U14-U25 在 1F + U26 在 2F，均属 Network A) + 共享 sink 通电；2F 9 个 T7+ 槽位 Power Switch 关
  - T7 → 翻 Network B Switch ON → 铝壳 / RCU / 超级计算机 3 个 Uploader 通电
  - T8 → 翻 Network C Switch ON → 涡轮电机 / 融合模块 / 冷却系统 3 个通电
  - T9 → 翻 Network D Switch ON → 神经处理器 / 叠加振荡器 / 虚构三角 3 个通电（满 22 Uploader）

> **核心设计原则**：**全部 22 个 Uploader + 共享 sink + smart splitter + 13 merger 树 + 4 个 Power Switch 在 T6 阶段就一次物理建造到位 + belt/lift/cascade/电网全部接好**。后续升 Tier 时**不重新放机器、不重新拉 belt**——只需 (1) 翻对应 Power Switch (2) 给新通电 Uploader 插 Power Shard（如需超频；sink 永不超频）。
>
> **例外**：需要并联 Uploader / 拆 belt 的高流量路（如 T9 硅土 690、快速线 1384），其全部并联线必须在所属蓝图 T6 阶段一次预建；本蓝图无富余净空，故这两路并联扩容移交 BP-TERM-C（详见下文）。

> ⚠ **共享 sink 设计依据**：AWESOME Sink **无超频、无内在吞吐上限**——它按入料 belt 的实际速率吃料，单条 Mk5 入料即 780/min。26 个 mainNode 的 overflow 经 merger 树汇成 1 条 belt 进 sink in-0；本蓝图 13 路 overflow 加 BP-TERM-A 13 路，汇总流量（T6 数百/min 量级，远 << 780）单条 Mk5 + 单个 sink 即可吃下。无需插 Power Shard、无需超频。
>
> ⚠ **架构修正历史**：原方案有「重油残渣 sink」+ 26 sink 1:1。后修正为残渣本地处理（BP9 内就地 sink，不上 B6）+ sink 共享。awesome-sink 实际尺寸 **16m × 13m × 24m**（高 24m≈3 cell，跨 1F+2F；1 固体输入口、0 输出；只吃固体）。1:1 配比 26 sink 占地 5,408m² 远超单 Mk2 1,600m²，必须共享。

## 物料 I/O

**输入**：
- **B5 终端总线** ← BP-TERM-A 末端 splitter 树剩余 14 路（13 路 mainNode + 1 备用）；进 BP-TERM-B 后再做两级 cascade（屋顶 1→3→9，1F 二级展开到 22-23 路）喂全部 22 个 Uploader
- **左 Wall Inlet (h=8m)** ← BP-TERM-A 右 Wall Outlet（BP-TERM-A 13 路 overflow 经其 merger 级联汇成的单条 belt）

**输出**：
- 13 个 Dim Depot Uploader → 位面仓（玩家 build gun 调用）
- **1 个共享 awesome-sink（无超频）** ← 接收 26 路 overflow 经 13 个 merger 三级级联汇成 1 条 belt（13 路本蓝图 + 13 路 BP-TERM-A 来），按入料 belt 速率吃料

## 13 mainNode 分配（后半批）

| # | mainNode | 流量 (T6) | Tier 7+ 流量 |
|---|---|---:|---:|
| 14 | 电机 | 5 | 12.5 |
| 15 | 模块化框架 | 2 | 19.5 |
| 16 | 包裹工业梁 | 6 | 23.5 |
| 17 | 重型模块框架 | 2 | 3.5 |
| 18 | 电脑 | 2.5 | 28 |
| 19 | 石英晶体 | 22.5 | 187 |
| 20 | 硅土 | 37.5 | 690 |
| 21 | 快速线 | 60 | 1384 |
| 22 | AI 限制器 | 5 | 14.75 |
| 23 | 晶体振荡器 | 1 | 9 |
| 24 | 高速连接器 | 3.75 | 18 |
| 25 | 重生 SAM | 30 | 200 |
| 26 | SAM 波动器 | 10 | 10 |
| **合计** | | **187/min** | **2620/min** |

> 石油焦 234/min（BP9 副产）已在 BP9 内部就地 sink，**不进 BP-TERM-B**。
>
> ⚠ **T8/T9 大流量 mainNode 例外（违反「不动结构」需提前预建）**：T9 时硅土 690/min、快速线 1384/min 均超单 Uploader 入口的单条 Mk5 容量 780/min。单 Mk5 belt 也喂不下。处理办法只有两种：
> 1. **T6 阶段就为硅土 (#20)、快速线 (#21) 预建 2-3 个并联 Uploader + 并联入料 belt**（每条 < 780），T8/T9 仅翻 Power Switch 即用——这是本蓝图唯一允许的「预建多于 T6 需要」的例外，因为 belt/Uploader 一旦建好就不能在不重拉的前提下临时加并联线；
> 2. 或把硅土 / 快速线 这两路整体移交 **BP-TERM-C** 第 3 实例处理（见末尾「如槽位不够」说明）。
>
> **本蓝图采用办法 2**：1F cols 0-3（24×40m）做完 13 个 T6 mainNode Uploader + sink + merger 树后已无富余净空再塞 4-6 个并联 Uploader（套 §2 留巷后单层只放得下 ~13 台），强行加塞会违反 §2「机器间留 belt 折线净空」。因此硅土 (#20)、快速线 (#21) 的 T8/T9 并联扩容**整路移交 BP-TERM-C** 第 3 实例处理（紧贴 BP-TERM-B 末，专用于大流量晚期 mainNode）。本蓝图 1F 只承载这两路的**首条** Uploader（T6/T7 流量 < 780 够用），第 2/3 条并联线在 BP-TERM-C 内 T6 预建。**核心原则例外**：凡需要并联 Uploader/拆 belt 的高流量路，其全部并联线必须在所在蓝图 T6 阶段一次预建（一旦建好不可在「不重拉 belt」前提下临时加线）。

## 楼层占用

| 层 | 高度 | 内容 |
|---|---|---|
| 1F | 0-12m | 12 Uploader (U14-U25，第 13 个 U26 移 2F) + 12 smart splitter + **13 merger（3 级级联 9+3+1 汇 26 路 overflow）** + B5 cascade 二级（1F 段，扩到 22-23 路覆盖全部 Uploader）— **T6 全部通电（Network A）**（硅土/快速线 T8/T9 并联线移交 BP-TERM-C）|
| 1F-2F | 0-24m | **共享 awesome-sink 16×13×24m**（占地 **col=3-5（x=24-40m，宽 16m）row=0-6.5（y=0-13m，长 13m）**，独占东侧整列，跨 1F+2F 高度）— **T6 通电** |
| 2F | 16-32m | **9 个 T7+ Uploader 槽位物理建好 + smart splitter + belt + lift 全部接好**（铝壳/RCU/超级计算机/涡轮电机/融合模块/冷却系统/神经处理器/叠加振荡器/虚构三角）— **T6 Power Switch 关（Network B/C/D 待 T7+ 渐次启用）**；**9 个槽位全部限制在 col=0-3（sink 占用 col=3-5 的 1F+2F 高度，2F 不得在 col≥3 放 Uploader）** |
| 屋顶 | 35-40m | B1-B6 直通 + B5 cascade 一级（屋顶段 1→3→9，9 路 lift-bot 下 1F 做二级展开）|

## 俯视图（按实际比例，每层独立）

> 比例：横向 1 字符 = 1m，纵向 1 行 = 2m。Uploader 5×10m **尺寸待游戏内实测**，按假设 5W×10L 画（5 字符宽 × 5 行高）。Sink 16W×13L（16 字符宽 × ~6.5 行高）。

### 1F (0-12m 机身；sink 跨 0-24m): 12 Uploader (U14-U25) + shared AWESOME Sink + 13 merger cascade + B5 二级 cascade

> sink 独占东侧 col=3-5（x=24-40m）整列；12 个 Uploader 全在 col=0-3（x=0-24m）西侧；第 13 个 mainNode Uploader (U26, SAM 波动器 10/min) 因东列被 sink 占满、西列套 §2 留巷后单层只放得下 12 台，**移到 2F col=0-3（仍属 Network A，T6 通电）**——见 2F 俯视图。

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8   12   16   20   24   28   32   36   40m
        ┌────────────────────────────┬─────────────────────────┐
 0      │ << B5 二级 cascade 出料 + smart│┌──────────────────┐│  ← sink in-0 在
        │   splitter 进料巷 (北侧留巷)  ││  AWESOME SINK x1  ││    南边 (y=13)
 4      │┌───┐ ┌───┐ ┌───┐ ┌───┐      ││  (shared, 无超频)  │  │
        ││U14│ │U15│ │U16│ │U17│      ││  16W x 13L x 24H   ││  跨 1F+2F
 6      ││5x ││5x ││5x ││5x │ sp×4    ││  col=3-5 row=0-6.5 ││  (0-24m 高)
 8      ││10 ││10 ││10 ││10 │ 紧贴back ││  只吃固体/0 输出    ││
        ││   ││   ││   ││   │         ││                   │   │
10      │└───┘ └───┘ └───┘ └───┘      ││                   │   │
        │                              │└──────────────────┘   │
14      │  sp×4 进料巷 (B5 二级分到此)  │  in-0 ▲ (26 路汇 1)  │
        │┌───┐ ┌───┐ ┌───┐ ┌───┐      │      │                 │
16      ││U18│ │U19│ │U20│ │U21│      │  ┌──┐┌──┐┌──┐ merger   │
        ││5x ││5x ││5x ││5x │         │  │M1││M2││M3│ L1(9)    │
18      ││10 ││10 ││10 ││10 │         │  └──┘└──┘└──┘          │
        ││   ││   ││   ││   │         │  ┌──┐┌──┐┌──┐          │
22      │└───┘ └───┘ └───┘ └───┘      │  │M4││M5││M6│          │
        │  sp×4 进料巷                 │  └──┘└──┘└──┘         │
26      │┌───┐ ┌───┐ ┌───┐ ┌───┐      │  ┌──┐┌──┐┌──┐          │
        ││U22│ │U23│ │U24│ │U25│      │  │M7││M8││M9│          │
28      ││5x ││5x ││5x ││5x │         │  └──┘└──┘└──┘          │
        ││10 ││10 ││10 ││10 │         │  ┌──┐┌──┐┌──┐ L2(3)    │
32      ││   ││   ││   ││   │         │  │Ma││Mb││Mc│ +L3(1)   │
        │└───┘ └───┘ └───┘ └───┘      │  └──┘└──┘└──┘ ┌──┐     │
36      │ overflow collect belt (机器  │   merge out →│Mz│→in-0│
        │ front 南侧空带, 汇向东 merger)│              └──┘    │
40      └──────────────────────────────┴───────────────────────┘
```

- **U14-U25**：12 个 Dim Depot Uploader（5W×10L×8H，**尺寸待游戏内实测**），全在 col=0-3；3 排 × 4 台，每排北侧留 4m 进料巷，台间留 belt 折线净空。
- **sp×4**：每排 4 个 smart splitter（priority=Uploader / overflow→merger），画在进料巷内，**不压在 Uploader 脚印上**（修复 R13）。
- **AWESOME Sink (shared)**：占地 **col=3-5（x=24-40m，宽 16m）× row=0-6.5（y=0-13m，长 13m）**，跨 1F+2F 高度 0-24m；in-0 输入口在其南边（y≈13m）朝 merger 汇流 belt；**无超频、按入料 belt 速率吃料**。
- **M1-M9 / Ma-Mc / Mz = 13 个 merger（3in1out，各 4×4m）**：26 路 overflow 三级级联 9+3+1=13 个，全部脚印画在 sink 南侧的 col=3-5 空区（x=24-40m, y=14-38m），最终 Mz 单条 belt 进 sink in-0。
- **overflow collect belt** 走 Uploader **front 南侧空带**（不穿机身，修复 R14），向东汇入 merger 阵列。
- **B5 二级 cascade** 的展开（屋顶 1→3→9 下来的 9 路，在 1F 北侧进料巷扩到 22-23 路喂全部 Uploader）见下「B5 cascade 路由」。

## smart splitter filter 配置（13 路）

| 路 | mainNode | filter |
|---|---|---|
| 14 | 电机 | motor |
| 15 | 模块化框架 | modular-frame |
| 16 | 包裹工业梁 | encased-industrial-beam |
| 17 | 重型模块框架 | heavy-modular-frame |
| 18 | 电脑 | computer |
| 19 | 石英晶体 | quartz-crystal |
| 20 | 硅土 | silica |
| 21 | 快速线 | quickwire |
| 22 | AI 限制器 | ai-limiter |
| 23 | 晶体振荡器 | crystal-oscillator |
| 24 | 高速连接器 | high-speed-connector |
| 25 | 重生 SAM | reanimated-sam |
| 26 | SAM 波动器 | sam-fluctuator |

## 共享 sink 连接路由（merger = 3 进 1 出，三级级联）

> ⚠ merger 是 **3 进 1 出**（不是 4 进），26 路不可能「汇 1 merger」。需 3 级级联，共 **9+3+1 = 13 个 merger**：

```
本蓝图 13 路 overflow  ┐
                       ├─ 共 26 路, 分配进 L1 的 9 个 merger (每个吃 3 路, 最后 1 个吃 2 路)
BP-TERM-A 13 路 overflow┘   (经左 Wall Inlet h=8m 进来)

  L1: M1..M9   26→9   (9 merger, 各 3in1out; M9 只 2 进)
  L2: Ma,Mb,Mc  9→3   (3 merger, 各 3in1out)
  L3: Mz        3→1   (1 merger)
                    └─→ 单条 belt → shared sink in-0
```

- 全部 13 个 merger 脚印画在 1F sink 南侧 col=3-5 (x=24-40m, y=14-38m) 空区，每个 4×4m，见 1F 俯视图 M1-Mz。
- L1 的入料分配：本蓝图 13 个 smart splitter 的 overflow 输出 + BP-TERM-A 经左 Wall Inlet (h=8m) 来的 13 路，共 26 路，均分进 9 个 L1 merger。
- sink in-0 单输入口，按入料 belt 速率（单 Mk5=780/min）吃料；T6 实际 overflow 数百/min << 780，单 sink + 单条汇总 belt 足够。

## B5 cascade 路由（两级：屋顶 1→3→9，1F 二级展开到 22-23）

> 统一口径：B5 终端总线进 BP-TERM-B 后做**两级** cascade，喂全部 22 个 Uploader（13 T6 在 1F+2F-U26，9 T7+ 在 2F）。

- **一级（屋顶 35-40m）**：B5 belt 在屋顶做 `1→3→9` splitter cascade（splitter 均分），得 9 条主干。
- **9 条主干各下一条 lift-bot**（屋顶 35m → 1F），落在 1F 北侧进料巷专用 col（避开机身投影），「先水平转弯相→再垂直爬升相」分两段（§2-5）。
- **二级（1F 北侧进料巷）**：9 条主干在 1F 进料巷内继续 splitter 展开到 **22-23 路**（覆盖 22 个 Uploader + 1 路备用），每路接 1 个 Uploader 的 smart splitter，priority=Uploader、overflow→merger 树。
- 2F 的 9 个 T7+ Uploader 由屋顶/1F 同一 cascade 分出的路 lift-up 到 2F（35m 屋顶 splitter 直接 lift-bot 落 2F 16-32m，**不做 1F→2F 回抬**，§2-5）。

### 屋顶 (35-40m): B5 一级 cascade (1→3→9) + B1-B6 直通

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8   12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬─────┐
 0      │ o B1 ────────────────────────────────────── o    │
 4      │ o B2 ────────────────────────────────────── o    │
 8      │ o B3 ────────────────────────────────────── o    │
12      │ o B4 ────────────────────────────────────── o    │
16      │ o B5 ─[1→3→9 splitter cascade, 一级]──────── o   │
20      │     9 条主干 >> lift-bot 下 1F 北侧进料巷        │
24      │       (1F 二级展开到 22-23 路喂全部 Uploader)    │
28      │     2F 的 9 路另 lift-bot 直落 2F (不回抬)       │
32      │ o B6 ────────────────────────────────────── o    │
36      │ B1-B4 + B6 直通到右边缘 (本蓝图内不分流/不 sink) │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴─────┘
```

### 2F (16-32m): 9 个 T7+ Uploader 槽位 + U26 (Network A) — 全在 col=0-3

> sink 占 col=3-5 高度 0-24m，**2F 在 col≥3 一律不得放 Uploader**；10 台（9 个 T7+ 槽位 + U26）全部限制在 col=0-3（x=0-24m），3 排 × 4 台留巷可放下（实占 10 台）。T6 物理建好，Network B/C/D 关。

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8   12   16   20   24   28   32   36   40m
        ┌──────────────────────────────┬───────────────────────┐
 0      │ << B5 lift-bot 落 2F 进料巷    │ (sink 投影 col=3-5, │
        │┌───┐ ┌───┐ ┌───┐ ┌───┐ sp×4  │  0-24m 高, 2F 此列    │
 4      ││铝壳│ │RCU│ │超算│ │U26│       │  不得放 Uploader)   │
 6      ││5x ││5x ││5x ││5x │  Net B/B/B│                      │
 8      ││10 ││10 ││10 ││Net│  +A(U26)  │                      │
        ││   ││   ││   ││ A │           │ (y=13 以下 col=3-5   │
12      │└───┘ └───┘ └───┘ └───┘        │  仍属 sink 上半段)   │
        │  sp×4 进料巷                   │                     │
16      │┌───┐ ┌───┐ ┌───┐ ┌───┐        ├──────────────────────┘
        ││涡轮│ │融合│ │冷却│ │神经│       │  ← y>24m 处 sink 顶
18      ││电机│ │模块│ │系统│ │处理│       │     已封顶, col=3-5
20      ││Net││Net││Net││Net│        │     2F 上部可走 belt
        ││ C ││ C ││ C ││ D │        │     但不放 Uploader
24      │└───┘ └───┘ └───┘ └───┘                               │
        │  sp×4 进料巷                                         │
28      │┌───┐ ┌───┐                                           │
        ││叠加│ │虚构│   Power Switch×4                        │
30      ││振荡│ │三角│   放此空区 col2-3                       │
32      ││Net││Net│   (4 网并排)                               │
        ││ D ││ D │                                            │
        │└───┘ └───┘                                           │
40      └───────────────────────────────┘ (col=3-5 留给 sink/竖井)
```

- **9 个 T7+ 槽位**：铝壳/RCU/超级计算机 (Network B, T7)、涡轮电机/融合模块/冷却系统 (Network C, T8)、神经处理器/叠加振荡器/虚构三角 (Network D, T9)，T6 物理建好但 Power Switch 关。
- **U26（SAM 波动器, Network A, T6 通电）**：从 1F 溢出到此，与 9 个 T7+ 槽位同在 col=0-3，独立属 Network A。
- 全 10 台均在 col=0-3，**AABB 不与 sink（col=3-5）重叠**；进料巷北侧留 4m，台间留净空（§2-1/2）。
- **Power Switch ×4** 放 2F col=2-3 row 14-15 空区（4 网并排），不撞 sink、不撞 Uploader。

## 建造步骤

1. **1F (0-12m，sink 跨 0-24m)**：col=0-3 西侧分 3 排各 4 台 Uploader，**每排北侧留 4m 进料巷**，smart splitter 摆在进料巷内（不压机身，§2-1，修复 R13）：
   - 排 A (y=4-14)：U14-U17 + 4 smart splitter
   - 排 B (y=18-28)：U18-U21 + 4 smart splitter
   - 排 C (y=30-40)：U22-U25 + 4 smart splitter
   - **第 13 个 mainNode Uploader U26 移到 2F**（col=0-3，Network A）——西列单层套留巷只放得下 12 台。
   - col=3-5（x=24-40m）留给共享 sink + merger 阵列。
2. **共享 sink** (1F+2F 跨高 0-24m, **col=3-5 x=24-40m, row=0-6.5 y=0-13m, 16×13m**)：
   - **不插 Power Shard、不超频**；按入料 belt 速率吃料（单 Mk5 入料 = 780/min）。
   - in-0（单输入口）接 26 路 overflow 经 13 merger 三级级联汇成的单条 belt。
3. **B5 进料（两级 cascade）**：
   - 屋顶 B5 做一级 `1→3→9` splitter cascade，9 条主干 lift-bot 下 1F 北侧进料巷（先转后爬两段，§2-5）。
   - 1F 进料巷做二级展开到 22-23 路（覆盖 22 Uploader + 1 备用），每路接 1 个 Uploader 的 smart splitter。
   - 2F 的 9 路由屋顶 cascade 另 lift-bot 直落 2F（不做 1F→2F 回抬）。
4. **overflow merger 汇流（merger = 3in1out，三级 9+3+1 = 13 个）**：
   - 本蓝图 13 个 smart splitter overflow + BP-TERM-A 经左 Wall Inlet (h=8m) 来的 13 路 = 26 路。
   - L1：9 个 merger 收 26 路（最后 1 个只 2 进）→ 9 路；L2：3 个 merger → 3 路；L3：1 个 merger → 1 路 → sink in-0。
   - 全部 13 个 merger 脚印（各 4×4m）布在 sink 南侧 col=3-5（x=24-40m, y=14-38m）空区。
5. **B6 末端**：直通悬空（本蓝图内无 splitter 无 sink，石油焦已在 BP9 就地处理，不上 B6）。
6. **2F (16-32m)**：9 个 Tier 7+ 备用 Uploader 槽位 + U26，**全在 col=0-3（避开 sink 占用的 col=3-5）**；Power Switch×4 放 col=2-3 空区。
7. **屋顶 (35-40m)**：6 belt 直通 + B5 一级 cascade (1→3→9) + 9 条主干 lift-bot 下 1F/2F。

## Power Switch 分网

把 22 个 Uploader（13 T6 + 9 T7+）+ 共享 sink 拆 4 个独立 Power Network，由 4 个 Power Switch 控制。**4 个 Switch + 全部 22 Uploader + sink + smart splitter + belt + lift 全部 T6 一次安装好**，只是 T6 阶段只合 Network A。

| 网 | 范围 | 数量 | T6 状态 | 升级触发 |
|---|---|---:|---|---|
| Network A | 1F U14-U25 + 2F U26 + 共享 sink（sink **无超频/不插 shard**）| 13 + 1 sink | **ON** | — |
| Network B | 2F 铝壳 / RCU / 超级计算机 Uploader | 3 | OFF | T7 翻 ON |
| Network C | 2F 涡轮电机 / 融合模块 / 冷却系统 Uploader | 3 | OFF | T8 翻 ON |
| Network D | 2F 神经处理器 / 叠加振荡器 / 虚构三角 Uploader | 3 | OFF | T9 翻 ON |

> Power Switch 物理位置建议放 **2F col=2-3 空区**（sink 占 col=3-5，开关避开），4 个并排，方便玩家在场内一眼区分。

## Tier 7+ 启用流程（仅翻 Switch + 插 shard，不动结构 / 不动 belt）

| Tier | 操作 | 通电 Uploader 总数 |
|---|---|---:|
| T7 | 翻 Network B Switch ON → 铝壳 / RCU / 超级计算机 3 个 Uploader 通电（如流量大需要超频，则插 shard）| 16 |
| T8 | 翻 Network C Switch ON → 涡轮电机 / 融合模块 / 冷却系统 3 个通电 | 19 |
| T9 | 翻 Network D Switch ON → 神经处理器 / 叠加振荡器 / 虚构三角 3 个通电；**硅土 (#20 690/min)、快速线 (#21 1384/min) 的并联 Uploader + 拆 belt 整路在 BP-TERM-C 处理**（本蓝图无富余净空，见上「T8/T9 大流量例外」）；部分总线 belt 需 Mk6（B3 电线 ~1400 即使 Mk6 也不够，必拆 B3a/B3b——属 BP07 范畴） | 22 |

T9 总数 BP-TERM-A 16 + BP-TERM-B 22 = 38（含 1 个备用 slot）= **37 mainNode**。石油焦 sink 在 BP9 处理，不计入。

如 9 个 2F 槽位不够（sink 占用 col=3-5），或硅土/快速线需并联扩容，**启用 BP-TERM-C 第 3 实例**（紧贴 BP-TERM-B 末）。

## 验证

- [ ] **22 个 Uploader 全部物理放置**（1F 12 台 U14-U25 + 2F 10 台：U26 + 9 个 T7+ 槽位）
- [ ] Smart splitter + belt manifold + lift 接到全部 22 个 Uploader（不只是 T6 通电的 13 个 mainNode）
- [ ] 4 个 Power Switch 一次建好，Network A 合上（U14-U26 13 Uploader + sink），B/C/D 断开
- [ ] T6 仅 13 个 mainNode Uploader 通电，2F 9 个 T7+ Uploader 物理就位但 Power Switch 关
- [ ] **唯一共享 sink** 在 **col=3-5（x=24-40m）row=0-6.5（y=0-13m），占地 16×13m**，跨 1F+2F (0-24m 高度)，独占东侧整列
- [ ] sink **无超频/不插 Power Shard**，按入料 belt 速率（单 Mk5 780/min）吃料
- [ ] 26 路 overflow（13 本 + 13 BP-TERM-A 来）经 **13 个 merger（3in1out，三级 9+3+1）** 汇成单条 belt → sink in-0
- [ ] B5 两级 cascade（屋顶 1→3→9，1F 二级到 22-23 路）覆盖全部 22 个 Uploader 输入（一次铺到位）
- [ ] **B6/B1-B4 在 BP-TERM-B 内无 splitter/sink**（直通悬空）
- [ ] 左 Wall Inlet (h=8m) 与 BP-TERM-A 右 Wall Outlet 对齐（接 overflow 汇流 belt）
- [ ] **所有 Uploader（1F+2F）均在 col=0-3，无一台落在 sink 独占的 col=3-5**（AABB 不重叠）
- [ ] 13 个 merger 脚印（各 4×4m）布在 sink 南侧 col=3-5 空区，互不重叠
- [ ] Dim Depot Uploader 5×10×8m 尺寸**待游戏内实测**
