# BP10 石英 + 硅土 + 快速线 + 混凝土 + AI 限制器 (C5)

## 概要

- **集群**: C5 MAM + 混凝土 + SAM
- **规格**: Mk2 **2 实例**（BP10a + BP10b，近似相同蓝图复制）
- **机器**: **28 台一次物理建造到位**（T9 上限分布 = 4 quartz + 7 silica + 10 quickwire + 5 concrete + 2 ai-limiter）。28 台分两个 14 台实例：
  - **BP10a 物理 14 台**：2 quartz + 3 silica + 5 quickwire + 3 concrete + 1 ai-limiter
  - **BP10b 物理 14 台**：2 quartz + 4 silica + 5 quickwire + 2 concrete + 1 ai-limiter
  - 两实例每实例固定 **5 quickwire + 1 ai-limiter**；silica/concrete 因 7/5 为奇数无法严格对半，按 3+4 / 3+2 分配（蓝图近似复制，仅 silica/concrete 实例数差 1）。
- **激活时间线**（仅翻 Power Switch + 插 Power Shard，不动结构；以下为**两实例合计**通电台数）:
  - T6 → 9 台通电（全部在 BP10a 1F：1 quartz + 1 silica + 3 quickwire + 3 concrete + 1 ai-limiter；BP10b 全关）
  - T7 → 15 台通电（合计 2 quartz + 3 silica + 5 quickwire + 4 concrete + 1 ai-limiter）
  - T8 → 23 台通电（合计 3 quartz + 5 silica + 8 quickwire + 5 concrete + 2 ai-limiter）
  - T9 → 28 台满载（合计 4 quartz + 7 silica + 10 quickwire + 5 concrete + 2 ai-limiter）
- **产能 T6**: 石英晶体 40.5 / 硅土 37.5 / 快速线 370 / 混凝土 111 / AI 限制器 5

> **核心设计原则**：**28 台机器在 T6 阶段就全部摆好 + belt/manifold/电网/Power Switch 全部接好**（BP10a 14 台 + BP10b 14 台一次性建完）。后续升 Tier 时**不重新放机器、不重新拉 belt**——只需 (1) 翻对应 Power Switch (2) 插 Power Shard (3) 调超频百分比。

> **快速线原料 = caterium 锭（钦金锭）**：标准 quickwire 配方为 `1 caterium 锭 → 5 快速线`（100% 时 12 caterium 锭/min → 60 快速线/min，5:1）。T6 快速线 370/min → caterium 锭 **74/min**。本蓝图**不使用铜金锭**喂快速线；需补一条 caterium 锭来源（74/min，与 BP6 铜金锭产线同套路：caterium 矿 → smelter → caterium 锭，经屋顶总线送到本图）。来源产线属上游蓝图/主设计范畴，本文件仅声明需求并在屋顶 B6 取料。

## 机器超频清单（T6，Plan C ≤250%）

| 配方 | 物理 | T6 通电 | 超频 | 单台产能 (/min) | Power Shard/通电台 |
|---|---:|---:|---:|---:|---:|
| quartz-crystal (constructor) | 4 | **1** | 180.0% | 40.5 | 2 |
| silica (constructor) | 7 | **1** | 100.0% | 37.5 | 0 |
| quickwire (constructor) | 10 | **3** | 205.56% | 123.33 | 3 |
| concrete (constructor) | 5 | **3** | 246.67% | 37.0 | 3 |
| ai-limiter (assembler) | 2 | **1** | 100.0% | 5.0 | 0 |
| **合计 (T6)** | 28 | 9 | — | — | 1×2 + 0 + 3×3 + 3×3 + 0 = **20** |

> T6 时未通电的 19 台机器：物理建好、belt 接好、shard 槽**空着**、Power Switch **关**，完全不耗电不产出。<br>
> 总产能验证 (T6): 1 × 40.5 = 40.5 石英 ✓ | 1 × 37.5 = 37.5 硅土 ✓ | 3 × 123.33 = 370 快速线 ✓ | 3 × 37 = 111 混凝土 ✓ | 1 × 5 = 5 AI 限制器 ✓

## 物料 I/O

| 方向 | 物料 | 流量 (T6) | 路径 |
|---|---|---|---|
| 输入 | 原始石英 | 90 | 矿场 → 左 Wall Inlet (z=4m)（石英晶体 67.5 @180% + 硅土 22.5 @100%）|
| 输入 | 石灰石 | 333 | 矿场 → 左 Wall Inlet (z=4m，第二口) |
| 输入 | **caterium 锭** | 74 | **屋顶 B6** ← 上游 caterium 产线 → smart splitter（快速线原料，5:1）|
| 输入 | **铜片 (Copper Sheet)** | 25 | **屋顶 B6** ← BP7（与 caterium 锭同向走 B6）→ smart splitter（AI 限制器原料）|
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
- 取自 B6 (caterium 锭 74 + 铜片 25 = 99)
- 注入 B4 (混凝土 96)
- 注入 B5 (140 mainNode = 22.5+37.5+60+15+5)
- 注入 B6 (228 = 石英 18 + 快速线 210)

## 楼层占用（BP10a 代表实例；BP10b 近似同结构，仅 silica/concrete 实例数差 1，且 T6 全 OFF）

> 高度列的 m 是**安装标高 z**；俯视图里的 row/col 是**平面格位**（1cell=8m），二者不混写（§2-7）。constructor 占地 8×10m（俯视图框高 5 行），ai-limiter (assembler) 占地 10×15m（俯视图框高约 8 行）。每排机器从北墙内缩 ≥4m 留 back 进料巷（§2-1），每排最多 4 台 constructor 以留侧向 belt 净空（§2-2）。

| 层 | 安装标高 z | 内容 | 物理台数 | T6 通电 |
|---|---|---|---:|---:|
| 1F | 0-15m | row A (4 constructor)：1 quartz + 1 silica + 2 quickwire；row B (4 constructor)：1 quickwire + 3 concrete；ai-limiter 独占东侧 col4 | 9 | **9 (BP10a) / 0 (BP10b)** |
| 4m 地基 | 15-19m | 隔层 | — | — |
| 2F | 19-34m | row A (4 constructor)：1 quartz + 2 silica + 1 quickwire；row B 预留 — T7+ 扩容位 | 5 | **0** |
| 4m 地基 | — | （2F 顶即接屋顶层）| — | — |
| 屋顶 | 35-40m | B1-B6 + 4 merger + 1 smart splitter + lift 列 | — | — |

> **T6 阶段**：BP10a 1F 9 台全部通电（Network A），其余 1F/2F 全部 Power Switch **关**。BP10b 全部 14 台物理建造但 Power Switch 全 OFF。所有 belt / lift / manifold / Power Switch 一次到位。
> 注：BP10a 实例分布 = 2 quartz + 3 silica + 5 quickwire + 3 concrete + 1 ai-limiter = 14；其中 1F 放 9（T6 通电组），2F 放剩余 5（1 quartz + 2 silica + 2 quickwire）。BP10b = 2 quartz + 4 silica + 5 quickwire + 2 concrete + 1 ai-limiter = 14。

## 俯视图（按实际比例，每层独立）

**比例约定**（§2-3）：1 字符 = 1m 横向；1 行 = 2m 纵向；蓝图 40×40m = 40 字符 × 20 行。机器框高 = 真实长度 ÷ 2 行：constructor 10m→5 行；ai-limiter(assembler) 15m→约 8 行。

**图例**：
- `*` 后缀 = T6 通电；无 `*` = T7+ Power Switch 关（物理已建，不耗电不产出）
- `[B]` = back 进料口（北侧，所有机器输入在北）；`v` = front (south) 输出
- ai-limiter 唯一例外端口：2 个 back 输入（caterium 锭快速线 + 铜片），1 个 front 输出
- `8x10` = 8m 宽 × 10m 长（占地）；`L` = 垂直 conveyor lift 落点（包围盒 3.5×2m，§1）
- 北墙 y=0；每排机器从北墙内缩 ≥4m 留 back 进料巷（§2-1），collect belt 走机器 front 边之外（§2-4）

### 1F (z=0-15m): 9 台 — BP10a T6 全部通电 / BP10b 全 OFF

> 8 constructor（1 Qz+1 Si+3 Qw+3 Cn）排 3 排（每排 ≤4 台，§2-2）+ 1 ai-limiter 独占东侧 col4 整列。北墙内缩 4m 留 back 进料巷（§2-1）。collect belt 走各排 front 边外侧（§2-4）。

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬──────────┐
 0      │ ←── back 进料巷 (raw-quartz / limestone manifold) ──→ │
 2      │  [B]      [B]      [B]                  ┌────────┐    │
 4      │ ┌───────┐┌───────┐┌───────┐            │ AILim* │     │
        │ │  Qz*  ││  Si*  ││  Qw1* │            │ai-limit│     │
 6      │ │quartz ││silica ││quickwr│  T6 ON     │ 10x15  │     │
        │ │ 8x10  ││ 8x10  ││ 8x10  │  row A     │[B][B]在 │    │
 8      │ │       ││       ││       │            │ 北侧   │     │
        │ │   v   ││   v   ││   v   │            │        │     │
10      │ └───────┘└───────┘└───────┘            │   v    │     │
12      │ ── collect A (Qz/Si/Qw front) ──→ L    └────────┘     │
14      │  [B]      [B]      [B]                                │
16      │ ┌───────┐┌───────┐┌───────┐                  L L      │
        │ │  Qw2* ││  Qw3* ││  Cn1* │            lift 列        │
18      │ │quickwr││quickwr││concret│  T6 ON     col4 南段      │
        │ │ 8x10  ││ 8x10  ││ 8x10  │  row B     (5 物料各      │
20      │ │       ││       ││       │            1 条上送       │
        │ │   v   ││   v   ││   v   │            屋顶 merger)   │
22      │ └───────┘└───────┘└───────┘                           │
24      │ ── collect B (Qw/Cn front) ──────────→ L              │
26      │  [B]      [B]                                         │
28      │ ┌───────┐┌───────┐                                    │
        │ │  Cn2* ││  Cn3* │  row C                             │
30      │ │concret││concret│  T6 ON                             │
        │ │ 8x10  ││ 8x10  │                                    │
32      │ │       ││       │                                    │
        │ │   v   ││   v   │                                    │
34      │ └───────┘└───────┘                                    │
36      │ ── collect C (Cn front) ─────────────→ L              │
38      │ 进料：左 Wall Inlet raw-quartz 90 (z=4m) + 石灰石     │
40      │       333 (z=4m 第二口) → 北侧 splitter manifold      │
        └────┴────┴────┴────┴────┴────┴────┴────┴────┴──────────┘
```

- **row A** (y=4-14，10m 进深)：quartz + silica + quickwire1 = 3 constructor（x≈1-9 / 11-19 / 21-29），back 进料口在北（y=4 边），front 输出向南
- **row B** (y=16-26，10m 进深)：quickwire2 + quickwire3 + concrete1 = 3 constructor
- **row C** (y=28-38，10m 进深)：concrete2 + concrete3 = 2 constructor（x≈1-9 / 11-19）
- **ai-limiter**（10×15）独占东侧 x=30-40、y=4-19；2 个 back 输入在北（caterium 锭→快速线在内部 lift 喂、铜片）、front 输出向南；与 row A/B/C 机身 x 范围（≤29）不重叠（AABB 校验 ✓）
- **lift 列**集中在 col4 南段（x≈34-38，y>19，避开 ai-limiter 机身 y≤19）：5 物料各 1 条 lift 上送屋顶 merger，包围盒 3.5×2m 沿 row 错开不重叠（§2-5）
- 进料：左 Wall Inlet (z=4m) 两口（raw-quartz 90 / 石灰石 333）→ 北侧 back 进料巷 splitter manifold 喂全部 8 constructor；caterium 锭/铜片走屋顶 lift-down 到 quickwire/ai-limiter back 口
- BP10b 同布局（仅 silica 4 台、concrete 2 台，机位微调），9 台 T6 全 OFF（shard 槽空）

### 2F (z=19-34m): 5 台扩容 constructor — T6 全部 Power Switch 关（belt/manifold 已接好）

> BP10a 2F = 1 quartz + 2 silica + 2 quickwire = 5 台 constructor，全部 T7+ 扩容位。北墙内缩 4m 留 back 进料巷；每排 ≤3 台并**全部限制在 col0-2（x≤29）**，把东侧 col4（x≥30）整列让给 1F 输出 lift 的贯穿竖井——这样 1F 的 5 条输出 lift 经 col4 直上屋顶时**不穿 2F 任何机身**（§2-5）。

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────────┐
 0      │ ←─ back 进料巷 (与 1F 同物料 splitter manifold) ─→  │
 2      │  [B]      [B]      [B]                              │
 4      │ ┌───────┐┌───────┐┌───────┐               L L L     │
        │ │  Qz2  ││  Si2  ││  Si3  │  row A      1F 输出     │
 6      │ │quartz ││silica ││silica │  T6 OFF     lift 贯穿   │
        │ │ 8x10  ││ 8x10  ││ 8x10  │  → T7/T8 ON 竖井(col4)  │
 8      │ │       ││       ││       │  (Net B)    避开机身    │
        │ │   v   ││   v   ││   v   │             直上屋顶    │
10      │ └───────┘└───────┘└───────┘               L L       │
12      │ ── collect A (Qz/Si front) ──→ 并入 col4 上送 ───→  │
14      │  [B]      [B]                                       │
16      │ ┌───────┐┌───────┐                                  │
        │ │  Qw4  ││  Qw5  │  row B (2 台)                    │
18      │ │quickwr││quickwr│  T6 OFF → T7 ON                  │
        │ │ 8x10  ││ 8x10  │                                  │
20      │ │       ││       │                                  │
        │ │   v   ││   v   │                                  │
22      │ └───────┘└───────┘                                  │
24      │ ── collect B (Qw front) ──────→ 并入 col4 上送 ──→  │
26      │ 进料：屋顶 splitter 直接分一路 lift-down 落 2F      │
28      │       back 进料巷（与 1F manifold 同物料，不绕回）  │
30      │ 出料：2F 自身 5 物料 lane 在 col4 与 1F lift 共列   │
32      │       沿 row 错开（包围盒 3.5×2m 不重叠，§2-5）     │
34      │                                                     │
36      │ 注：2F 无 ai-limiter（ai-limiter 两台都在 1F）      │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────────┘
```

- BP10a 2F 5 台：Qz2 / Si2 / Si3（row A 3 台，x≈1-9/11-19/21-29）+ Qw4 / Qw5（row B 2 台，x≈1-9/11-19），**物理建造完整**，T6 阶段 Power Switch **全关**
- 全部机身限制在 col0-2（x≤29），col4（x≥30）整列留给 1F 输出 lift 贯穿竖井 + 2F 自身收集 lift，沿 row 错开不重叠
- Belt manifold + lift 一次性接到所有 5 台 back/front，进料由屋顶 splitter 分一路 lift-down 落 2F（z=35m→约 26m），**不从 1F 回抬**
- 通电节奏：T7 开部分 row A/B；T8 补齐（见下方分网表）

### 屋顶 (z=35-40m): B6 上 1 smart-splitter + 4 merger（B4/B5/B6 注入）

> 6 条总线在 35-40m **同层**按子 cell 行距 ~4m 平行排开（row=0.25/0.75/1.25/…，§2-8），不是「6 个高度堆叠」。B5 注入 5 物料需 merger 级联（⌈(5-1)/2⌉=2 merger，§2-10）；B6 注入 2 物料 1 merger；B4 注入 1 物料 1 merger（接驳总线）。合计 **4 merger + 1 smart splitter**。

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬───────┐
 1      │ o B1 ───────────────────────────────────────── o│  row=0.25
 4      │ o B2 ───────────────────────────────────────── o│  row=0.75
 7      │ o B3 ───────────────────────────────────────── o│  row=1.25
10      │ o B4 ───────────[mrg4 ← concrete 96]─────────── o│  row=1.75
        │                       ↑ lift-up from 1F/2F         │
13      │ o B5 ──[mrg2]──[mrg3 ← mainNode 140]─────────── o│  row=2.25
        │           ↑ mrg2: Qz22.5+Si37.5+Qw60               │
16      │           ↑ mrg3: +Cn15+AI5  = 140 注入 B5      │  (2 级级联)
19      │ o B6 ─[smart]──────────────[mrg1 ← Qz18+Qw210]─ o│  row=2.75
        │         │ f=caterium 锭74 + 铜片25 = 99            │
22      │         │ (2 路 filter: caterium→quickwire,        │
        │         │  铜片→ai-limiter)                        │
25      │      lift-down ↓ 落 1F/2F back 进料巷              │
28      │         → quickwire in-0 (caterium 锭)             │
        │         → ai-limiter in (铜片 + 内部快速线)        │
31      │ mrg1: B6 splitter 下游注入 石英18 + 快速线210=228  │
34      │ (B7/B8 reserved T7+ slots，子 cell row=3.25/3.75)  │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴───────┘
```

- **smart splitter**（B6 取料）：2 路 filter 取 caterium 锭 74（→ quickwire 原料）+ 铜片 25（→ ai-limiter 原料）= 99/min，经 lift-down 落 1F/2F back 进料巷
- **mrg1**（B6 注入）：smart splitter 下游 1 merger 注入 石英 18 + 快速线 210 = 228 → BP15
- **mrg2 + mrg3**（B5 注入，2 级级联）：mrg2 合 石英 22.5 + 硅土 37.5 + 快速线 60；mrg3 续合 混凝土 15 + AI 限制器 5，总 mainNode 140 注入 B5
- **mrg4**（B4 注入）：混凝土 96 接驳 B4 → BP13 包裹下游取
- 每条 merger 预留 4×4m 脚印（§2-10），沿总线 col 错开不重叠

## Power Switch 分网（每实例 14 台拆 2 个 Power Network）

每实例 14 台拆 **2 个独立 Power Network**（1F 9 台 = Net A，2F 5 台 = Net B），由 2 个 Power Switch 控制；两实例共 **4 个 Switch**。**全部 T6 一次安装好**，T6 阶段仅合 BP10a Net A，其余 3 个 Switch OFF。升级时按下表逐 Switch 翻 ON（不动结构、不动 belt）。

| 网 | 实例 | 范围 | 数量 | T6 | T7 | T8 | T9 |
|---|---|---|---:|---|---|---|---|
| Net A | BP10a | 1F 9 台 (1Qz+1Si+3Qw+3Cn+1AI) | 9 | **ON** | ON | ON | ON |
| Net B | BP10a | 2F 5 台 (Qz2/Si2/Si3/Qw4/Qw5) | 5 | OFF | **部分 ON** | ON | ON |
| Net A | BP10b | 1F 9 台 (1Qz+1Si+3Qw+2Cn+1AI) | 9 | OFF | **部分 ON** | ON | ON |
| Net B | BP10b | 2F 5 台 (Qz2/Si2/Si3/Si4/Qw5) | 5 | OFF | OFF | **部分 ON** | ON |

> 通电台数对齐**集群激活时间线**：T6=9 / T7=15 / T8=23 / T9=28。由于配方台数在各 Tier 非整网增减（如 concrete 3→4→5），Net B / BP10b Net A 的 Power Switch 可按需细分为子开关（每子网 1 Switch），或在翻网后单独插 shard 控制实际产出；本表给出主开关，子开关数量在游戏内按实际 Tier 产能微调（**待游戏内实测**确认逐台通电次序）。
> Power Switch 物理位置建议放各层 back 进料巷东端（lift 列旁），不占机身脚印，方便玩家在场内一眼区分。

## 建造步骤（BP10a；BP10b 近似复制，仅 silica/concrete 实例数差 1）

> 进料口物料名按 §3 修正：快速线吃 **caterium 锭**、ai-limiter 吃 **铜片 (Copper Sheet)**，均经屋顶 B6 smart splitter 取后 lift-down 落进料巷。

1. **框架**：5×5 cell × 5 cell 高（40×40×40m）
2. **1F (z=0-15m)**：放 9 台（row A：1 Qz + 1 Si + 1 Qw1；row B：Qw2 + Qw3 + Cn1；row C：Cn2 + Cn3）= 8 constructor + ai-limiter 独占东侧 col4；北墙内缩 4m 留 back 进料巷（§2-1）
3. **1F belt**：5 物料独立收集 belt 走各排 front 边外侧（collect A/B/C），各物料 1 条上送 col4 lift；back 进料巷布 splitter manifold
4. **1F 地基**：z=15m 铺 4m 厚地基覆盖整层
5. **2F (z=19-34m)**：放 5 台扩容 constructor（row A：Qz2/Si2/Si3/Qw4；row B：Qw5）；无 ai-limiter
6. **2F belt**：与 1F 共物料收集 lane，lift 接同一屋顶 merger；进料由屋顶 splitter 分一路 lift-down 落 2F，**不从 1F 回抬**
7. **垂直汇总**：5 条 lift-out（5 物料各 1 条）集中 col4 lift 列 → 屋顶 4 个 merger（lift 包围盒 3.5×2m 沿 row 错开不重叠，§2-5）
   - 快速线先在收集端 splitter 1→3（100 内部供 ai-limiter + 210 上 B6 + 60 上 B5）
   - 石英晶体 splitter 1→2（18 上 B6 + 22.5 上 B5）
8. **进料**：
   - 原始石英 90：左 Wall Inlet (z=4m, 第一口) → splitter → **全部 quartz + silica**（BP10a 2 quartz + 3 silica）
   - 石灰石 333：左 Wall Inlet (z=4m, 第二口) → splitter → **全部 concrete**（BP10a 3 concrete）
   - **caterium 锭 74**：屋顶 B6 smart splitter (filter=caterium) → lift-down → **全部 5 quickwire in-0**（本实例）
   - **铜片 25**：同 smart splitter (filter=铜片) → lift-down → **ai-limiter in（铜片口）**
9. **快速线 → AI 限制器**: 1F quickwire 输出取 100/min → 短 belt → ai-limiter 另一 back 入口
10. **屋顶 (z=35-40m)**：6 条 Mk5 平行 belt（子 cell row 间距 ~4m，§2-8）+ 4 merger + 1 smart splitter
11. **Power Switch ×2/实例**：按"Power Switch 分网"表布置 Net A/B；BP10a T6 只合 Net A，其余 OFF（两实例共 4 个 Switch）
12. **Power Shard（T6 阶段）**：仅 BP10a 1F 9 台插 shard（Qz 2 shard + 3 Qw × 3 + 3 Cn × 3 = 20 shard）；**其余 19 台物理已就位但 shard 槽空着**

## Tier 7+ 启用流程（仅翻 Switch + 插 shard，不动结构 / 不动 belt）

| Tier | 操作 | 通电总数（集群合计）|
|---|---|---:|
| T7 | 翻 BP10a Net B（部分）+ BP10b Net A（部分）Switch ON，使集群通电达 2Qz+3Si+5Qw+4Cn+1AI=15；各台插对应 shard 调超频 | 15 |
| T8 | 续翻 Switch 使集群达 3Qz+5Si+8Qw+5Cn+2AI=23 | 23 |
| T9 | 翻齐全部 Switch → **28 台满载**（4Qz+7Si+10Qw+5Cn+2AI）；矿场来料 belt 已 Mk5；T8/T9 个别物料拆分（硅土 ~660 < 780 ✓） | 28 |

## 多实例侧墙续接

BP10 是 **2 实例 + 无机器层跨蓝图 belt**：BP10 不消化集群内部物料（输入全从屋顶 B6 取或左 Wall Inlet，输出全到屋顶 B4/B5/B6）。BP10a/b 之间机器层无短 belt。

蓝图侧墙集群内 mount（机器层）：**无**（BP10 蓝图侧墙仅有屋顶 6 belt mount）。

> T6 仅 BP10a 9 台通电；BP10b 物理 14 台全部建造但 0 激活。
> T7+ 启用 BP10b 时，所有物料仍走屋顶（不需要机器层短 belt）。

## 关键路由

- **caterium 锭 74/min 喂快速线**：标准 quickwire 配方吃 caterium 锭（非铜金锭）。需在上游补一条 caterium 产线（caterium 矿 → smelter → caterium 锭，与 BP6 铜金锭产线同套路），经 B6 总线送到 BP10。屋顶 smart splitter filter=caterium 取 74/min。**注：该 caterium 来源产线属上游蓝图/主设计范畴，需在主设计 §BP10 与对应矿场/冶炼蓝图补齐（本文件不含 caterium 产线本体）。**
- **铜片 (Copper Sheet) 25/min 从 BP7（C3）跨 C4 到 BP10（C5）**：经 B6 总线携带（与 caterium 锭同向）。BP10 屋顶 smart splitter 同时取 caterium 锭 74 + 铜片 25 = 99/min（按 filter 类型分两路输出）。
- **混凝土到 BP13（C6，正向流）**：B4 总线在 BP10 注入 96，BP13 在 BP10 之后取走。

## 验证

- [ ] **28 台机器全部物理放置**（BP10a 14 台 = 2Qz+3Si+5Qw+3Cn+1AI；BP10b 14 台 = 2Qz+4Si+5Qw+2Cn+1AI；含 T6 不通电的 19 台）
- [ ] 每实例固定 **5 quickwire + 1 ai-limiter**（与「2 实例独立屋顶」一致，不再「单 splitter 喂全部 10 quickwire/2 ai」）
- [ ] Belt manifold + lift 接到全部 28 台 back/front（不只是 T6 通电的 9 台）
- [ ] 每实例 2 个 Power Network / Switch（共 4 个），BP10a Net A 合上，其余 Switch 断开
- [ ] T6 仅 BP10a 1F 9 台插了 shard；其余 19 台物理就位但 shard 槽空
- [ ] B6 上 **caterium 锭 74 + 铜片 25 = 99** 流量满足 BP10 取（B6 段需 ≥ 99）；**caterium 锭来源产线已在上游蓝图/主设计补齐**
- [ ] 快速线原料为 **caterium 锭**（非铜金锭）；ai-limiter 原料为 **铜片 (Copper Sheet)**（非铜板）
- [ ] 5 物料独立收集 belt（不混料），collect belt 走机器 front 边外侧不穿机身
- [ ] 屋顶 **4 merger + 1 smart splitter**：B4=混凝土、B5=5 mainNode 混（2 级 merger 级联）、B6=石英+快速线（1 merger）、smart splitter B6 取 caterium 锭/铜片
- [ ] 每排机器 ≤4 台 constructor + 北墙内缩 ≥4m 进料巷；同层无 AABB 重叠；lift 列 col4 不撞机身
- [ ] AI 限制器**已迁移到此**，BP8 不再有
- [ ] 矿场来料 belt 已 Mk5；T8/T9 部分物料拆分槽位（硅土最高 ~660 < 780 ✓）
