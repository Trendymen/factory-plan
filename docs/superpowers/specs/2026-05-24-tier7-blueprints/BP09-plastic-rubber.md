# BP9 塑料 + 橡胶 + 石油焦 (C4)

## 概要

- **集群**: C4 油精炼（紧贴 BP8 之后）
- **规格**: Mk2 **7 实例物理建造**（BP9a/b/c/d/e/f/g，相同蓝图复制）
- **机器**: **35 refinery 一次物理建造到位**（plastic @191.67% / rubber @100% / **petroleum-coke** @195% 三种配方）+ **7 awesome-sink 一次物理建造到位**（每实例 1 个，处理本实例石油焦；**AWESOME Sink 无超频**，按入料 belt 速率吃料）
- **激活时间线**（仅翻 Power Switch + 插 Power Shard，不动结构）:
  - T6 → **5 台通电**（BP9a 满载 3 plas + 1 rub + 1 coke；BP9b-g Power Switch 全关）
  - T7 → 15 台通电（BP9a-c 各 4 plas/rub + 1 coke）
  - T8 → 25 台通电（BP9a-e 各满 5 台）
  - T9 → **32 台通电**（BP9a-f 各 4 plas/rub + 1 coke，BP9g 3 plas + 1 coke + 1 备用）
- **产能 T6**: 塑料 115/min · 橡胶 20/min · **石油焦 234/min**（残渣本地转化，BP9a 内部 sink）

> **核心设计原则**：**7 实例 BP9a-g 在 T6 阶段就全部摆好 + belt/pipe/manifold/电网/Power Switch 全部接好**（共 35 refinery + 7 sink）。后续升 Tier 时**不重新放机器、不重新拉 belt/pipe**——只需 (1) 翻对应 Power Switch (2) 插 Power Shard (3) 调超频百分比。

## 机器超频清单（T6，BP9a 单实例满载）

| 配方 | 物理 | T6 通电 | 超频 | 单台产能 (/min) | Power Shard/通电台 |
|---|---:|---:|---:|---:|---:|
| plastic (refinery) | **21** | **3** | 191.67% | 38.33 塑料 + 19.17 残渣 | 2 |
| rubber (refinery) | **7** | **1** | 100.0% | 20 橡胶 + 20 残渣 | 0 |
| petroleum-coke (refinery) | **7** | **1** | **195%**（处理本实例 78 残渣 → 234 石油焦）| 234 石油焦 | **2** |
| awesome-sink | **7** | **1** | **无超频**（按入料 belt 速率吃料）| 吃 234 石油焦（< Mk5 780）| **0** |
| **合计 (T6)** | **35 ref + 7 sink** | **5 ref + 1 sink** | — | — | 3×2 + 0 + 1×2 + 0 = **8** |

> 物理建造数 21 + 7 + 7 = 35 refinery（7 实例 × 5 槽位），另加 7 台 awesome-sink。
> T6 仅 BP9a 5 refinery + 1 sink 通电；BP9b-g 共 30 refinery + 6 sink 物理就位但 Power Switch **全关**、shard 槽**空着**。
> **AWESOME Sink 无超频/无内在吞吐上限**：按入料 belt 速率吃固体料，单条 Mk5=780/min；234 << 780，1 sink + 1 Mk5 足够（不插 shard）。
> coke 超频核算：petroleum-coke 配方 100% = 40 残渣/min → 120 coke/min；本实例 78 残渣需 78/40 = **195%** 超频（2 power shard）→ 78 残渣 → 234 coke ✓。
> T6 总产能验证: 3 × 38.33 = 115 塑料 ✓ | 1 × 20 = 20 橡胶 ✓ | 残渣 3×19.17 + 20 = 77.5 ≈ 78 ✓ | coke 78÷40×120 = 234 石油焦 ✓
> T9 满载: 23 plastic @191.67% × 38.33 ≈ **881.6 塑料/min** + 2 rubber @100% = 40 橡胶 + 7 coke @195% 各处理本实例残渣本地 sink（**塑料 refinery 一律 191.67%，不是 250%**）。

> ⚠ **架构修正**：重油残渣是**流体**（refinery out-1 是 pipe），不能上 belt，AWESOME Sink 也不接受流体。
> **解决方案**：每个 BP9 实例内部固定配 1 台 coke refinery 跑 `petroleum-coke` 配方（残渣**本地转固体石油焦**）→ **本地 sink**（每实例配 1 个 awesome-sink）。
> **为什么保留本地 sink（即使 Mk5 物理可上 B6）**：石油焦上 B6 在 T7 阶段 462/min = 59% Mk5（780/min），物理上完全可承载；但本设计**主动保留本地 sink** 让 B6 维持 306/min = 39% Mk5，给 T8/T9 扩产时 BP10→BP15 段可能达 570+/min 留出头部空间。

## 物料 I/O

| 方向 | 物料 | 流量 (T6/T9) | 路径 |
|---|---|---|---|
| 输入 | 原油 | 172.5 / ~1100（每实例独立 pipe） | **油田管道** → 左 Wall 管道孔 (h=4m) |
| 输入 | 水 | refinery 内部循环 | — |
| 输出 | 塑料 → BP8 + BP14 | 95 / 跨实例累加 | 屋顶 merger → B4 |
| 输出 | 塑料 → B5 终端 | 20 / 跨实例累加 | 屋顶 merger → B5 |
| 输出 | 橡胶 → B5 终端 | 20 / 跨实例累加 | 屋顶 merger → B5 |
| **内部** | 残渣 (fluid) → coke refinery | 78（每实例独立） | **本地 pipe**（不出蓝图）|
| **内部** | 石油焦 → 本地 awesome-sink | 234（每实例独立） | **本地 belt**（不上总线）|

**屋顶总线接入**: 注入 B4 (95)、B5 (40)（**B6 不再有石油焦/残渣**）

## ⚠ 关键约束：refinery 31m 高

- refinery 净高 31m，机器层顶 31m
- **屋顶总线抬到 36m**（原 35m → 36m，给出 **5m 余量**：31-36m）。lift 最小垂直跨度 4m，5m 余量留出安全裕度，避免贴顶临界。
- lift（产物上行）从 1F **地面 (y=0) 升至屋顶 36m**（refinery out-0 在 front 边出料，belt 水平引到 lift 列再竖直爬升）；**31-36m 段只做横向走线 + 收口**，不是「把 lift 挤进 4m」。
- 跨层走线遵守「先水平转弯相 → 再垂直爬升相」分两段（belt 不能同时转弯+爬升）。
- **不能用多层堆叠**——单实例只 1F（refinery 31m 已吃满层高）。

> ⚠ **待游戏内实测**：lift 顶端贴近屋顶 36m 处的进出口 bend/lip 水平占位（实测包围盒 3.5×2m，朝向待确认）；以及 31-36m 这 5m 窗口内同时建 lift + 屋顶 merger 吸附点是否无碰撞。

## 楼层占用（单实例）

| 层 | 高度 | 内容 | 物理 (单实例) | T6 通电 (BP9a) | T6 通电 (BP9b-g) |
|---|---|---|---:|---:|---:|
| 1F | 0-31m | refinery 5 台 + 本地 awesome-sink 1 个 | 5 + 1 | **5 + 1** | **0 + 0** |
| 31-36m | 输出 lift 收口 + 残渣 pipe junction（横向走线，5m 窗口）| — | — | — | — |
| 屋顶 | 36-40m | B1-B6 + 2 merger（B4/B5）+ 2 lift-top（塑料/橡胶）| — | — | — |

### 单实例物理槽位 = 5 refinery（精确计算 — 真实 10×20m）

refinery 真实占地 **10m W × 20m L × 31m H**（registry/实测）。单 Mk2 (40×40m) 1F 平面只能容下 5 台 refinery + 1 sink，但**不能五台都南北向(N-S)排**：北墙留 4m 进料巷 + 20m 长机身 = 24m，第二排 N-S 又需 20m → 44m > 40m 越界。因此采用 **4 台 N-S（北排）+ R5 旋转 E-W（南带）** 混排：

- **R1-R4（N-S，facing=south）**：back 在北（y=4m，北侧 0-4m 进料巷），front 在南（y=24m）。4 × 10m = 40m 宽占满北排（fluid pipe 进料，无 belt manifold 巷，宽向满排可接受）。
- **R5 coke（旋转 E-W，facing=east）**：20m 宽 × 10m 深，落南带 y=27-37、x=0-20。back（fluid 输入）在西侧 x=0，朝残渣 junction；front（coke belt 输出）在东侧 x=20，短 belt 直连 sink。
- **AWESOME Sink（16m W × 13m L）**：落南带 x=22-38、y=25-38，in-0 朝西接 R5 coke 输出。
- 共 5 refinery + 1 sink，**第 6 台 refinery 在 1F 平面上塞不下**。
- **7 实例 × 5 槽位 = 35 槽位** > T9 32 台需求（余 3 备用，全部 T6 一次建好）。

**AABB 四角校验（米制，floor 0-40 × 0-40）：**

| 物体 | 朝向 | 西x | 东x | 北y | 南y | 占地 |
|---|---|---:|---:|---:|---:|---:|
| R1 plastic | south | 0 | 10 | 4 | 24 | 10×20 |
| R2 plastic | south | 10 | 20 | 4 | 24 | 10×20 |
| R3 plastic | south | 20 | 30 | 4 | 24 | 10×20 |
| R4 rubber | south | 30 | 40 | 4 | 24 | 10×20 |
| R5 coke | east | 0 | 20 | 27 | 37 | 20×10 |
| AWESOME Sink | west(in) | 22 | 38 | 25 | 38 | 16×13 |

- R1-R4 互不重叠（沿 x 首尾相接，南北同区间 y=4-24）✓
- R5(x0-20,y27-37) vs Sink(x22-38,y25-38)：x 区间 [0,20] 与 [22,38] 不相交（2m 间隙）→ 无重叠 ✓
- R5/Sink(y≥25) vs R1-R4(y≤24)：北南区间不相交（1m 间隙留给 collect belt）→ 无重叠 ✓
- 全部矩形落在 0-40 × 0-40 内 ✓（R5 南边 y=37 < 40，Sink 南边 y=38 < 40，**无越界**）

### 通电时间线（仅翻 Switch + 插 shard，不动结构）

**关键约束**：残渣是流体，不能跨蓝图 pipe 汇流，所以**每个跑 plastic/rubber 的实例必须自带至少 1 台 coke refinery 处理本实例残渣**。

| Tier | plastic / rubber / coke | 通电总数 | 残渣量 | 实例分配（通电状态） |
|---|---|---:|---:|---|
| **T6** | 3 / 1 / 1 = **5** | 5 | 78/min | **BP9a 5 台全开**；BP9b-g 全关 |
| T7 | 11 / 1 / 3 = **15** | 15 | ~291 | BP9a-c 各 5 台开（4 plas/rub + 1 coke）；BP9d-g 全关 |
| T8 | 18 / 2 / 5 = **25** | 25 | ~470 | BP9a-e 各 5 台开；BP9f/g 全关 |
| T9 | 23 / 2 / 7 = **32** | 32 | ~567 | BP9a-f 各 5 台开；BP9g 4 台开（3 plas + 1 coke + 1 备用 Switch 关） |

> **T6 单实例搞定的核心机制**：
> - BP9a 1 台 coke refinery @ **195%** 超频（2 shard；本实例 78 残渣 → 234 石油焦）
> - BP9a 1 台 awesome-sink **无超频**（按入料 Mk5 belt 速率吃 234 石油焦 << 780/min，不插 shard）
> - 全部物料/残渣/石油焦/sink 都在 BP9a 内部循环
> - BP9b-g 6 实例物理建造完整（30 refinery + 6 sink）但 Power Switch **全关**、shard 槽**空着**

## 俯视图（按实际比例，每层独立 — 视觉正方形）

**比例约定**（同 BP02）：1 字符 = 1m 横向；1 行 = 2m 纵向；蓝图 40×40m = 40 字符 × 20 行。

**图例**：
- `*` 后缀 = T6 通电；无 `*` = T7+ Power Switch 关（物理已建，不耗电不产出）
- `v` = front (south) 输出

### 1F (0-31m): 4 refinery（N-S）+ 1 coke refinery（旋转 E-W）+ 1 AWESOME Sink — BP9a 视图（T6 全部通电）

按真实比例重画：1 字符=1m 横向，1 行=2m 纵向。refinery 长 20m → 框高 10 行；sink 长 13m → 框高 ~6-7 行。北墙内缩 4m 留 fluid 进料巷。

> (横向为示意，机器/设备真实 x 坐标以正文坐标表为准)

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────────┐
 0      │ <<<<oil manifold (fluid pipe, 北侧进料巷 0-4m)<<<<  │  y=0-4 进料巷
 4      ├─────────┬─────────┬─────────┬───────────────────────┤
        │ R1*back │ R2*back │ R3*back │ R4*back (rubber)      │  back=fluid in (北)
 6      │ Plastic │ Plastic │ Plastic │ Rubber                │
        │ 10x20   │ 10x20   │ 10x20   │ 10x20                 │
10      │ ×31H    │ ×31H    │ ×31H    │ ×31H                  │
        │ 191.67% │ 191.67% │ 191.67% │ 100%                  │
14      │         │         │         │                       │
        │         │         │         │                       │
18      │         │         │         │                       │
        │ out0 v  │ out0 v  │ out0 v  │ out0 v  (塑料/橡胶)   │
22      │ out1 v  │ out1 v  │ out1 v  │ out1 v  (残渣 pipe)   │  front=south (y=24)
24      ├═══ plastic/rubber collect belt (y≈25, x<22 即收口转 lift 列) ═┤  collect belt 走机身外
        │ residue pipe junction (4进1出) ──┐                  │  junction→R5 西面为 fluid pipe(非 belt)
26      ┌──────────────────────┐          │                   │
        │ R5* coke (旋转 E-W)   │←in0(西)  │  ┌────────────┐  │  R5 back=西, 接 junction
28      │  facing=east 20Wx10L  │          └─→│ AWESOME    │  │
        │  ×31H  195%(2 shard)  │             │ Sink* 16x13│  │
30      │  78 残渣 → 234 coke   │  out0→(东)  │ ×24H 无超频 │ │  sink in0=西 (back)
32      │                       │═coke belt══>│ in0<< coke │  │  R5 out0→sink, ~2m belt
34      └──────────────────────┘             │ (吃 234)   │   │
        x=0-20, y=27-37                       └────────────┘  │  x=22-38, y=25-38
36                                                            │
38                                                            │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────────┘
```

- BP9a：R1-R5 五台 refinery + AWESOME Sink **全部 T6 通电**（带 `*`）。
- **R1-R3 plastic（facing=south，191.67%）**，**R4 rubber（facing=south，100%）**：N-S 向，back（fluid 原油输入）在北 y=4，front（out-0 产品 belt + out-1 残渣 pipe）在南 y=24。各 10W×20L×31H。
- **R5 coke（旋转 facing=east，195%/2 shard）**：20W×10L，落 x=0-20 y=27-37；**in-0（fluid 残渣输入）在西侧朝 junction**，out-0（coke 固体 belt）在东侧 x=20。
- **AWESOME Sink（16W×13L×24H，无超频）**：落 x=22-38 y=25-38，in-0（back，固体输入）在西侧接 R5 coke 短 belt（~2m）。
- **残渣 pipe junction**：R1-R4 的 out-1（重油残渣 fluid）→ junction（4 进 1 出）→ 引到 R5 in-0（西）。
- **plastic/rubber collect belt** 走 R1-R4 front 边之外（y≈25，机身南侧空带，不穿机身）。**collect belt 在抵达 sink 所占 x=22-38 区间之前即向 lift 列收口**（即在 x<22 段就完成横向汇流并转向 lift 列竖直上行），不进入 sink/R5 区，排除 R14（传送带穿越机器）误读。
- 占地 AABB 已逐角校验（见上「单实例物理槽位」表）：全部矩形落 0-40×0-40 内，无重叠，**R5 不再越界**。

### 1F (0-31m): BP9b-g 视图（T6 Power Switch 全关，belt/pipe/manifold 已接好）

物理布局与 BP9a 完全相同（同一蓝图复制），仅 Power Switch 全关、shard 槽空。

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────────┐
 0      │ <<<<oil manifold (fluid pipe, 北侧进料巷 0-4m)<<<<  │  y=0-4 进料巷
 4      ├─────────┬─────────┬─────────┬───────────────────────┤
        │ R1 back │ R2 back │ R3 back │ R4 back (rubber)      │  back=fluid in (北)
 6      │ Plastic │ Plastic │ Plastic │ Rubber                │
        │ 10x20   │ 10x20   │ 10x20   │ 10x20                 │
10      │ ×31H    │ ×31H    │ ×31H    │ ×31H                  │
        │ OFF     │ OFF     │ OFF     │ OFF                   │
14      │         │         │         │                       │
        │         │         │         │                       │
18      │         │         │         │                       │
        │ out0 v  │ out0 v  │ out0 v  │ out0 v                │
22      │ out1 v  │ out1 v  │ out1 v  │ out1 v  (残渣 pipe)   │  front=south (y=24)
24      ├═══ plastic/rubber collect belt (y≈25, x<22 即收口转 lift 列) ═┤  collect belt 已接好
        │ residue pipe junction (4进1出) ──┐                  │  junction→R5 西面为 fluid pipe(非 belt)
26      ┌──────────────────────┐          │                   │
        │ R5 coke (旋转 E-W)    │←in0(西)  │  ┌────────────┐  │  R5 back=西, 接 junction
28      │  facing=east 20Wx10L  │          └─→│ AWESOME    │  │
        │  ×31H  OFF            │             │ Sink 16x13 │  │
30      │                       │  out0→(东)  │ ×24H OFF   │  │
32      │                       │═coke belt══>│ in0<< coke │  │  belt 已接好(Switch OFF)
34      └──────────────────────┘             │            │   │
        x=0-20, y=27-37                       └────────────┘  │  x=22-38, y=25-38
36                                                            │
38                                                            │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────────┘
```

- BP9b-g 6 实例：5 refinery + 1 sink **物理建造完整**，T6 阶段 Power Switch **全关**。
- Belt / pipe / residue junction / 本地 sink belt 一次性接到所有 R1-R5（与 BP9a 同布局）。
- 通电节奏：T7 开 BP9b/c（共 15）；T8 开 BP9d/e（共 25）；T9 开 BP9f/g（满 32）。

### 屋顶 (36-40m): B4 + B5 mergers

屋顶总线抬到 **36-40m**（给 1F refinery 31m 顶留 5m 余量）。6 条 belt 按子 cell 行距（~4m 一条）排开，不是堆叠高度。

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │ o B1 ────────────────────────────────────── o   │  row=0.25
 4      │ o B2 ────────────────────────────────────── o   │  row=0.75
 8      │ o B3 ────────────────────────────────────── o   │  row=1.25
12      │ o B4 ───[merger << 塑料 95, lift-top↑]───── o   │  row=1.75
16      │ o B5 ───[merger << 塑料 20 + 橡胶 20]────── o   │  row=2.25
20      │ o B6 ────────────────────────────────────── o   │  row=2.75 (直通无 merger)
24      │  lift-top↑塑料 (≥Mk3)  lift-top↑橡胶 (Mk2)      │
28      │ B4 inject 95/min plastic (to BP8 + BP14)        │
        │ B5 inject 40/min mainNode (plastic 20 + rub 20) │
32      │ B6 NO injection (coke locally sinked)           │
36      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- 2 个 merger（B4 塑料 95 + B5 塑料 20 / 橡胶 20），各预留 4×4m 脚印。
- 2 条 lift-top（塑料 → B4 + B5、橡胶 → B5）。
- **塑料 lift 用 ≥Mk3**：单实例 T9 满载 ~4 plastic refinery × 38.33 ≈ **153/min** 塑料，> Mk2 lift 120/min 上限 → 塑料上行 lift **指定 Mk3（270/min）**；橡胶单实例 ≤40/min，Mk2 lift 足够。
- **残渣不上屋顶**（流体在 1F 内部 pipe 直连 R5 coke refinery）。
- **石油焦不上屋顶**（1F R5 输出 → 本地 awesome-sink，1F 内部消化）。

## Power Switch 分网

把 35 台 refinery 拆 7 个独立 Power Network（每实例 1 个），由 7 个 Power Switch 控制。**7 个 Switch 全部 T6 一次安装好**，只是 T6 阶段只合 Network A。

| 网 | 范围 | 数量 | T6 状态 | 升级触发 |
|---|---|---:|---|---|
| Network A | BP9a 全部 (R1-R5 + sink) | 5 + 1 sink | **ON** | — |
| Network B | BP9b 全部 | 5 + 1 sink | OFF | T7 翻 ON |
| Network C | BP9c 全部 | 5 + 1 sink | OFF | T7 翻 ON |
| Network D | BP9d 全部 | 5 + 1 sink | OFF | T8 翻 ON |
| Network E | BP9e 全部 | 5 + 1 sink | OFF | T8 翻 ON |
| Network F | BP9f 全部 | 5 + 1 sink | OFF | T9 翻 ON |
| Network G | BP9g 全部 (1 台备用 Switch 单独关) | 4 + 1 sink | OFF | T9 翻 ON（保留 1 台备用 Switch 关） |

> Power Switch 物理位置建议放每实例 1F col=4.5 角落（manifold 区），方便玩家在场内一眼区分。
> BP9g 内部多 1 个子 Switch 控制第 5 台 refinery（T9 满载 32 台不需要它）。

## 建造步骤（每实例一次建好，BP9a-g 物理完全相同）

1. **框架**：每实例 5×5 cell × 5 cell 高（40×40×40m）；总 7 个并排实例
2. **1F (0-31m)**:
   - 北排 4 台 refinery（N-S，facing=south）：R1-R3 plastic + R4 rubber，back 在北 y=4m（北侧 0-4m 进料巷），front 在南 y=24m
   - 南带第 5 台 refinery (R5) 跑 `petroleum-coke` 配方，**旋转 facing=east**（20W×10L，x=0-20 y=27-37），back（残渣输入）朝西接 junction，避免与北排机身/sink 重叠
3. **原油进料**: 左 Wall 管道孔 (h=4m) → 北侧进料巷 (y=0-4) 油管 manifold → R1-R4 in-0 (back, fluid)
   > refinery 流体输入是 fluid pipe，需要 Pipeline Wall Hole（不是 Conveyor Wall Inlet）
4. **水（橡胶配方副产）**: rubber 配方副产物是**重油残渣**（fluid），不是水；refinery 自身需要的水从原油 manifold 旁挂水管供给（不在本步骤循环）。
5. **残渣 pipe 汇流**: R1-R3（plastic）+ R4（rubber）的 out-1（**重油残渣 fluid**）→ pipe junction（4 输入 → 1 输出）→ R5 in-0（西侧，fluid）
   > pipe junction 用 Pipeline Junction Cross 或 Industrial Pipeline Support，4 台合 1 路（**待实测：Junction Cross 是否真能 4 进 1 出 + 合流分配规则**）
   > 注意 pipe 容量：Mk1 pipe 300/min，78 残渣远低于上限 ✓
6. **R5 石油焦输出**: R5 out-0（固体 belt，东侧 x=20）→ 短 belt（~2m）直连本地 1 台 **AWESOME Sink (16m × 13m × 24m高)**（位于 x=22-38 y=25-38，in-0 朝西）
   > **AWESOME Sink 无超频/无内在吞吐上限**，按入料 belt 速率吃固体料；234/min 远 < 单 Mk5 belt 780/min → 1 sink + 1 Mk5 入料足够（**不插 shard**）✓
7. **1F belt 收集**:
   - collect belt 走 R1-R4 front 边之外（y≈25，机身南侧空带）：plastic 主 belt（R1-R3 out-0 合流）+ rubber 主 belt（R4 out-0）
   - **石油焦不收集主 belt**（R5 短 belt 直连本地 sink）
8. **垂直汇总（地面 → 屋顶 36m）**: lift 从 1F 地面升至屋顶 36m（先水平把 belt 引到专用 lift 列，再竖直爬升；31-36m 段只做横向走线/收口）
   - **塑料 lift × 1（≥Mk3，270/min）**——单实例 T9 满载 ~153/min > Mk2 lift 120 上限，必须 Mk3；屋顶再 1→2 split
   - 橡胶 lift × 1（Mk2 足够，≤40/min）
9. **屋顶 (36m)**:
   - 塑料 lift-top → 1→2 splitter (95:20) → 一支 merger 注 B4，一支 merger 注 B5
   - 橡胶 lift-top → 直接 merger 注 B5
   - 共 2 个 merger（B4、B5 各 1）
10. **本地 sink**: 1F x=22-38 y=25-38 处放 1 个 AWESOME Sink (16×13m × 24m高)，R5 石油焦 belt 直连
11. **复制 7 份**：BP9a-g 完全相同的物理建造（共 35 refinery + 7 sink + 7 套 belt/pipe/manifold/lift）
12. **Power Switch ×7**：按上面"Power Switch 分网"表布置 Network A-G；T6 只合 A，B-G 全部 OFF
13. **Power Shard（T6 阶段）**：仅 BP9a R1-R3 各插 2 shard（plastic @191.67%）+ R5 插 **2 shard**（coke @195%）= 共 **8 shard**；rubber @100% 与 sink（无超频）**不插 shard**；**BP9b-g 物理已就位但所有 shard 槽空着**

## Tier 7+ 启用流程（仅翻 Switch + 插 shard，不动结构 / 不动 belt / 不动 pipe）

| Tier | 操作 | 通电总数 |
|---|---|---:|
| T7 | 翻 Network B + C Switch ON → BP9b/c 各 5 台插 shard（plastic @191.67% 2 shard / rubber @100% 0 shard / coke @195% 2 shard；sink 无超频不插 shard） | 15 |
| T8 | 翻 Network D + E Switch ON → BP9d/e 各 5 台插 shard | 25 |
| T9 | 翻 Network F + G Switch ON → BP9f 5 台 + BP9g 4 台插 shard（BP9g 第 5 台备用 Switch 保留 OFF）；油田 pipe 升 Mk2 应对每实例满载 | 32 |

## 集群内部连接 / 多实例侧墙

无 belt 跨蓝图（C4 仅 BP9 自己；每实例完全独立、油田直进、残渣本地处理）。

**蓝图侧墙集群内 mount（机器层）：无**。BP9 蓝图侧墙仅有：
- 屋顶 6 belt mount（B1-B6 续接相邻 BP9 实例）
- 左 Wall Pipeline Hole（h=4m，原油 pipe 进料）

> BP9a-g 之间机器层完全不互通——每实例独立的油田 pipe（或共享油田主 pipe + 各实例分支）。
> 详见设计文档 [§多实例集群侧墙 mount 对偶规则](../2026-05-24-tier7-blueprint-design.md#多实例集群侧墙-mount-对偶规则关键设计约定)。

## 残渣 → 石油焦 → 本地 sink（默认）

每个 BP9 实例（通电后）：
- 78/min 残渣（pipe）→ 1 台 coke refinery @ **195%**（2 shard）→ 234/min 石油焦（固体）
- 234 石油焦 → 1 台本地 awesome-sink（**无超频**，按入料 belt 速率吃料；234 << 单 Mk5 780/min，1 sink + 1 Mk5 入料足够，不插 shard）
- 7 实例独立 sink，**不上 B6 总线**
- BP-TERM-B 不再有"石油焦/残渣 sink"

**为什么就地 sink 而不是上 B6**：
- 234 石油焦/min × 7 实例 = 1638/min，远超任何 belt 等级
- 单实例 234 上 B6 让 BP10→BP15 段流量从 306 → 540 = 69% Mk5（Mk5 时代物理上安全），但仍保留本地 sink 以备 T8/T9 扩产
- 就地 sink 让 BP9 完全自包含，不影响其他蓝图

> **可选升级路径**：把第 5 台 coke refinery 改为 `residual-fuel` 配方（60 残渣 → 40 燃料 = 流体），燃料管道接到旁挂的燃料发电机（每台 250 MW）→ 自给 ~1300 MW（约整厂 70% 电力）。
> 此升级**不需要改 BP9 主蓝图**，仅切换配方 + 加燃料发电机即可；本地 sink 撤掉换为燃料 pipe。

## 验证

- [ ] **7 实例 BP9a-g 全部物理建造**（共 35 refinery + 7 sink，包括 T6 不通电的 30 refinery + 6 sink）
- [ ] 每实例 belt / pipe / pipe junction / 本地 sink belt / lift 一次到位（不只是 T6 通电的 BP9a）
- [ ] **7 个 Power Switch 全部物理安装好**（Network A-G），T6 只合 Network A，B-G 断开
- [ ] T6 仅 BP9a 插 shard（R1-R3 各 2 + R5 coke 2 = **8 shard**；rubber 与 sink 不插 shard）；BP9b-g 物理就位但 shard 槽空
- [ ] refinery 原油输入用 Pipeline Wall Hole（左 Wall）
- [ ] R1-R4 残渣 out-1（**重油残渣 fluid**，不是水）用 pipe junction 合流到 R5 in-0（4 进 1 出）
- [ ] R5 跑 `petroleum-coke` 配方（不是 plastic/rubber），@195% 处理 78 残渣 → 234 coke
- [ ] R5 旋转 facing=east（20W×10L），in-0 朝西接 junction，不与北排 / sink AABB 重叠（已逐角校验）
- [ ] R5 输出是石油焦（固体，belt 可输送）
- [ ] **每实例 1 台本地 awesome-sink** 接 R5 输出（**无超频**，按入料 belt 速率，234 << Mk5 780/min）
- [ ] **B6 不携带石油焦/残渣**（屋顶 B6 直通无 merger）
- [ ] 原油矿场 pipe 容量按 T9 ~1100/min 预留（7 实例满载）
- [ ] 7 实例物理紧贴（屋顶 B1-B6 跨实例续接）
- [ ] BP-TERM-B 不再有残渣/石油焦 sink
