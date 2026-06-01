# BP13 模块化框架 + 包裹工业梁 (C6)

## 概要

- **集群**: C6 装配（紧贴 BP12 之后）
- **规格**: Mk2 单实例
- **机器**: **6 assembler 一次物理建造到位**（4 modular-frame + 2 encased-industrial-beam）
- **激活时间线**（仅翻 Power Switch + 插 Power Shard，不动结构）:
  - T6 → 5 台通电（3 frame + 2 beam；其余 1 台 frame Power Switch 关）
  - T7 → 5 台通电（同 T6，仅超频百分比不变）
  - T8 → 6 台通电（开第 4 台 frame）
  - T9 → 6 台通电（满载）
- **产能**: T6 模块化框架 12 / 包裹工业梁 16 → T8+ 模块化框架 **16** / 包裹工业梁 16

> **核心设计原则**：**6 台 assembler 在 T6 阶段就全部摆好 + belt/manifold/电网/Power Switch 全部接好**。后续升 Tier 时**不重新放机器、不重新拉 belt、不动 lift**——只需 (1) 翻对应 Power Switch (2) 插 Power Shard (3) 调超频百分比。<br>
> **唯一例外**：T8 开 M4 时需在屋顶 B2 programmable splitter 改一次分配参数（RIP 18→24、rod 72→96），belt 物理不动（详见「物料 I/O」T8 缺料补丁）。

## 极简示意图

```floorstack
# BP13 模块化框架+包裹工业梁 (C6) · Mk2 单实例 · 自下而上
1F | modular-frame assembler×4（模块框架，T6 通电3） | 强化铁板 18·铁棒 72 | 模框 12/min（10→BP14·2→终端） |
2F | encased-beam assembler×2（包裹工业梁） | 钢梁 48·混凝土 96 | 包裹梁 16/min（10→BP14·6→终端） |
屋顶 | 总线汇流 | 强化铁板·铁棒·钢梁·混凝土 | 模框2·包裹梁6 = 8/min |
```

> 两层独立生产（frame/beam 各一层），各自分流后 10/min 走集群内短 belt 直送 BP14，余量经屋顶 merger 注 B5 终端；T8 翻开 M4 时需同步调整屋顶 B2 programmable splitter 配置上量。

## 机器超频清单（T6，Plan C ≤250%）

| 配方 | 物理 | T6 通电 | 超频 | 单台产能 (/min) | Power Shard/通电台 |
|---|---:|---:|---:|---:|---:|
| modular-frame (assembler) | 4 | **3** | 200.0% | 4.0 | 2 |
| encased-industrial-beam (assembler) | 2 | **2** | 133.33% | 8.0 | 1 |
| **合计 (T6)** | 6 | 5 | — | 3×4.0 + 2×8.0 = **12 + 16** | 3×2 + 2×1 = **8** |

> T6 时未通电的 1 台 frame assembler（M4）：物理建好、belt 接好、shard 槽**空着**、Power Switch **关**，完全不耗电不产出。<br>
> T8 起 M4 通电，6 台全开继续 200% 超频。

## 物料 I/O

| 方向 | 物料 | 流量 (T6, 3 frame + 2 beam) | 流量 (T8+, 4 frame + 2 beam) | 路径 |
|---|---|---:|---:|---|
| 输入 | 强化铁板 | 18 | **24** | **屋顶 B2** ← BP2 → programmable splitter |
| 输入 | 铁棒 | 72 | **96** | **屋顶 B2** ← BP2 → programmable splitter |
| 输入 | 钢梁 | 48 | 48 | **屋顶 B3** ← BP5 → smart splitter |
| 输入 | 混凝土 | 96 | 96 | **屋顶 B4** ← BP10 → smart splitter |
| 输出 | 模块化框架 → BP14 HMF（C6 内部）| 10 | 10 | 集群内短 belt |
| 输出 | 包裹工业梁 → BP14 HMF | 10 | 10 | 集群内短 belt |
| 输出 | 模块化框架 → B5 终端 | 2 | 6 | 屋顶 merger → B5 |
| 输出 | 包裹工业梁 → B5 终端 | 6 | 6 | 屋顶 merger → B5 |

> **§4-BP13 修正（T8 缺料补丁）**：manifold 物理一次接全 **4 台** frame assembler，但 T6 阶段进料 I/O 只够 **3 台** powered（强化铁板 18 + 铁棒 72）。T8 翻开 M4 后 frame 通电台数 3→4，进料须同步上量：
> - **强化铁板 18 → 24**（+6），**铁棒 72 → 96**（+24）。
> - **B2 总线取料 90 → 120**：在 BP2 端把 B2 给 BP13 的 programmable splitter 分配比例调到 RIP 24 / rod 96（共 120），不需重拉 belt（B2 单 Mk5=780 容量足够）。
> - frame 输出随之上量：模块化框架 12 → 16，集群内出口仍 10，**B5 终端 2 → 6**。
> 此为「翻 Switch + 插 shard」之外**唯一需要在屋顶 splitter 改配置**的步骤，已并入下方「Tier 7+ 启用流程」表，belt/lift/机器均不动。

**屋顶总线接入**:
- 取自 B2 (T6: 强化铁板 18 + 铁棒 72 = 90 → T8+: 24 + 96 = 120) + B3 (钢梁 48) + B4 (混凝土 96)
- 注入 B5 (T6: 8 mainNode → T8+: 12 mainNode)

## 楼层占用

| 层 | 高度 | 内容 | 物理台数 | T6 通电 |
|---|---|---|---:|---:|
| 1F | 0-12m | 4 模块化框架 assembler（M1-M4，南移留北侧进料巷）| 4 | **3** |
| 4m 地基 | 12-16m | 隔层 | — | — |
| 2F | 16-24m | 2 包裹工业梁 assembler（E1-E2，南移留北侧进料巷）| 2 | **2** |
| 4m 地基 | 24-28m | 隔层 | — | — |
| 屋顶 | 35-40m | B1-B6 + 3 splitter (1 prog + 2 smart) + 1 merger + lift 列 | — | — |

> **§2-1/§2-3 重画**：assembler 真实占地 10m(W)×15m(L)×8m(H)。每层机器从北墙(y=0)**内缩 6m** 留东西向「进料 manifold 巷」（lift 落点 + 4-way manifold 都在巷内），机器本体占 **y=6-21m**；层高 0-12m 容下机器(8m)+巷顶走线。collect belt 走机器 **front(南)边之外**。
> **T6 阶段**：1F M1-M3 通电（Network A），M4 Power Switch **关**（Network B 待 T8 启用）；2F E1-E2 通电（Network C）。所有 belt / lift / manifold / Power Switch 一次到位。

## 俯视图（按 §2 公约重画，每层独立 — 视觉正方形）

**比例约定（§2-3）**：
- 横向：**1 字符 = 1m**
- 纵向：**1 行 = 2m**
- 蓝图 40×40m → 40 字符宽 × 20 行高
- assembler 10m×15m → 框宽 10 字符、框高约 8 行（15m÷2）

**图例**：
- `*` 后缀 = T6 通电；无 `*` = T7+ Power Switch 关（物理已建，不耗电不产出）
- `↑i` = back (north) 输入（in-0/in-1，朝北进料巷）
- `↓v` = front (south) 输出
- `L#` = conveyor lift 落点（包围盒 3.5m×2m）
- 北侧 y=0-6m = 进料 manifold 巷（east-west）；机器本体 y=6-21m

### 1F (0-12m): 4 模块化框架 assembler — T6 通电 3 台

> 北墙内缩 6m 留进料巷；4 台 M1-M4 各 10m 宽紧邻排开（col 0-4），back 输入朝北进巷。**进料 lift（L1@x=4 / L1'@x=20）落北侧进料巷 y=0-6m；输出 lift L_out@x=36 落南侧 output 区 y≈28m**——均不压机身（机身 y=6-21m）。**各 riser 占互不相同的 col（见下「全 riser col 分配」表），跨层不冲突**。collect belt 走机器 front 之外（南侧 y≥22m）。

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬─────────┐
 0      │ L1───────────────L1'──── feed manifold (RIP+rod)─────│  ← 进料巷 y=0-6m
 2      │  ═══╦════╦════╦════╦════╦════╦════╦════╦══════       │  (L1@x4 / L1'@x20)
 4      │ ↑i  ↑i   ↑i   ↑i   ↑i   ↑i   ↑i   ↑i                 │  back in-0/in-1 朝北
 6      │┌─────────┬─────────┬─────────┬─────────┐             │  ┐ 机器本体
 8      ││  M1*    │  M2*    │  M3*    │  M4      │         │  │ y=6-21m
10      ││ frame   │ frame   │ frame   │ frame    │         │  │ (15m=7.5→8行)
12      ││ 10×15   │ 10×15   │ 10×15   │ 10×15    │         │  │ z=0-8m
14      ││  200%   │  200%   │  200%   │  OFF(T6) │         │  │
16      ││         │         │         │ →T8 ON   │         │  │
18      ││  ↓v     │  ↓v     │  ↓v     │  ↓v      │         │  │
20      ││         │         │         │          │         │  │
21      │└─────────┴─────────┴─────────┴─────────┘             │  ┘ ← 机身底 y=21m
22      │ ════╩════╩════╩════╩ frame collect belt ════════     │  ← collect 走 front 之外
24      │  central splitter: frame 12/min(T6) / 16(T8+)        │
26      │    ├ 10 → 右墙 Wall Outlet (col=5, row≈3) → BP14     │
28      │    └ 2(T6)/6(T8+) → L_out → 屋顶 merger (B5)         │  L_out 落点 col=4.5/x=36,y=28
30      │                                                      │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴─────────┘
```

lift 落点坐标（包围盒 3.5m×2m）：**进料 lift（L1@x=4 / L1'@x=20）在北侧进料巷 y=0-6m；输出 lift L_out@x=36 在南侧 output 区 y≈28m**——三者均不压机身（机身 y=6-21m，L_out 落点 y=27-29m 在机身南 ≥6m 外）。**全 6 条 riser 的 col 互不相同（见 2F 节后「全 riser col 分配」总表）**。

| lift | 用途 | 落点 (x,y)m | col | 包围盒 | 垂直跨度 | 落点区 |
|---|---|---|---|---|---|---|
| L1  | RIP 进料 lift-bot（屋顶 35m → 1F 巷 ~6m）| (4, 4) | 0.5 | 3.5×2 | ~29m | 北侧进料巷 |
| L1' | iron-rod 进料 lift-bot | (20, 4) | 2.5 | 3.5×2 | ~29m | 北侧进料巷 |
| L_out | frame mainNode lift-out-top（1F splitter z≈6m → 屋顶 35m）| (36, 28) | 4.5 | 3.5×2 | ~29m | 南侧 output 区 |

- M1-M3：3 台 modular-frame assembler 10×15×8m，T6 **通电**（200%，各 4.0/min）
- M4：第 4 台 modular-frame assembler **物理建造完整**，T6 阶段 Power Switch **关**（Network B），T8 翻 ON
- back 输入 in-0/in-1 朝北进巷，4-way manifold 一次性接全 4 台（含 T6 不通电的 M4）
- **进巷走线**：L1/L1' 落巷 → 先沿巷东西向 manifold（转弯相）→ 各机 back 端口处垂直短段进 in-0/in-1（爬升/进料相分离，§2-5）

### 2F (16-24m): 2 包裹工业梁 assembler — T6 全部通电

> 同 1F 公约：北墙内缩 6m 进料巷；2 台 E1-E2 各 10m 宽（col 0-2），余下东半 col 2-5 留空给 lift 列与走线。**进料 lift L2@x=12 / L2'@x=28、输出 lift L_out2@x=8——各 riser col 与 1F 的 L1/L1'/L_out 互不相同（见下「全 riser col 分配」总表），跨层不冲突**。

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────────┐
 0      │ ──L2───────────────────────L2'─ feed manifold ──────│  ← 进料巷 y=0-6m
 2      │  ═══╦════╦════╦════╦                                │  (L2@x12 / L2'@x28)
 4      │ ↑i  ↑i   ↑i   ↑i                                    │  back in-0/in-1 朝北
 6      │┌─────────┬─────────┐                                │  ┐ 机器本体
 8      ││  E1*    │  E2*    │                             │  │ y=6-21m
10      ││ encased │ encased │                             │  │ (15m=7.5→8行)
12      ││ 10×15   │ 10×15   │                             │  │ z=16-24m
14      ││ 133.33% │ 133.33% │                             │  │
16      ││         │         │                             │  │
18      ││  ↓v     │  ↓v     │                             │  │
20      ││         │         │                             │  │
21      │└─────────┴─────────┘                                │  ┘ ← 机身底 y=21m
22      │ ════╩════╩ beam collect belt ════════               │  ← collect 走 front 之外
24      │  central splitter: beam 16/min                      │
26      │    ├ 10 → 右墙 Wall Outlet (col=5, row≈3) → BP14    │
28      │    └ 6  → L_out2 → 屋顶 merger (B5)                 │  L_out2 落点 col=1.0/x=8,y=28
30      │                                                     │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────────┘
```

lift 落点坐标（包围盒 3.5m×2m）：**进料 lift（L2@x=12 / L2'@x=28）在北侧进料巷 y=0-6m；输出 lift L_out2@x=8 在南侧 output 区 y≈28m**——均不压机身（机身 y=6-21m）。

| lift | 用途 | 落点 (x,y)m | col | 包围盒 | 垂直跨度 | 落点区 |
|---|---|---|---|---|---|---|
| L2   | steel-beam 进料 lift-bot（屋顶 35m → 2F 巷 ~22m）| (12, 4) | 1.5 | 3.5×2 | ~13m | 北侧进料巷 |
| L2'  | concrete 进料 lift-bot | (28, 4) | 3.5 | 3.5×2 | ~13m | 北侧进料巷 |
| L_out2 | beam mainNode lift-out-top（2F splitter z≈22m → 屋顶 35m）| (8, 28) | 1.0 | 3.5×2 | ~13m | 南侧 output 区 |

- E1-E2：2 台 encased-industrial-beam assembler 10×15×8m，T6 **全部通电**（133.33%，各 8.0/min）
- back 输入 in-0(钢梁)/in-1(混凝土) 朝北进巷，manifold 一次性接 2 台
- **进巷走线**：L2/L2' 落巷 → 东西向 manifold（转弯相）→ 各机 back 处垂直短段进 in-0/in-1（§2-5）

#### 全 riser col 分配（跨层 3D 不冲突核对）

> 每条 conveyor lift 的竖直 riser 必须占据**唯一的 col**——跨不同楼层的进料/出料 lift 不得共用同一 col，否则两条 riser 在某 z 区间 3D 重叠（建不出，§原则1）。下表逐条列出全 6 条 riser 的 (x,y) 落点与 col，**6 条 col 值 {0.5, 1.5, 2.5, 3.5, 4.5, 1.0} 两两互不相同**，故任意两条 riser 不共享 (col,row)，跨层无 3D 重叠。

| riser | 层 | 用途 | 落点 (x,y)m | col | riser z 区间 |
|---|---|---|---|---:|---|
| L1     | 1F | RIP 进料   | (4, 4)   | **0.5** | ~6-35m |
| L2     | 2F | steel-beam 进料 | (12, 4)  | **1.5** | ~22-35m |
| L1'    | 1F | iron-rod 进料 | (20, 4)  | **2.5** | ~6-35m |
| L2'    | 2F | concrete 进料 | (28, 4)  | **3.5** | ~22-35m |
| L_out  | 1F | frame mainNode 出料 | (36, 28) | **4.5** | ~6-35m |
| L_out2 | 2F | beam mainNode 出料 | (8, 28)  | **1.0** | ~22-35m |

> **逐条核对（各 riser col 互不相同、跨层不冲突）**：
> - L1(col0.5) vs L2(col1.5)：原同占 x=4 → 现 L1@x=4 / L2@x=12，col 0.5≠1.5，z 虽都过 22-35m 但 col 不同，**不冲突**。
> - L1'(col2.5) vs L2'(col3.5)：原同占 x=12 → 现 L1'@x=20 / L2'@x=28，col 2.5≠3.5，**不冲突**。
> - 4 条进料 riser 同在 row(y=4)，col 分别 0.5/1.5/2.5/3.5 全不同；3.5×2m 包围盒沿 x 排：L1(4-7.5)/L2(12-15.5)/L1'(20-23.5)/L2'(28-31.5)，区间互不重叠。
> - L_out(col4.5/x=36) 与 L_out2(col1.0/x=8) 同在 row(y=28)，col 不同且包围盒 x=36-39.5 / x=8-11.5 不重叠。
> - 出料 riser vs 进料 riser：分属 row y=28 与 y=4，row 不同，即便个别 col 相近也不共享 (col,row)；且 6 个 col 值仍取为两两不同以满足原则1的纯 col 唯一性。
> - **riser 不穿其它楼层机身**：4 条进料 riser 落 y=4（进料巷，y=0-6m），位于所有机身（y=6-21m）以北，竖直上升不穿任何机身；2 条出料 riser 落 y=28（output 区），位于所有机身以南，亦不穿机身。故各 riser 全程在机身 y 区间之外，与 x 位置无关地不穿任何楼层机身。

### 屋顶 (35-40m): B1-B6 + 3 splitter (1 prog + 2 smart) + 1 merger + lift 列

> §2-8：6 条总线在 35-40m 同层按子 cell 行距 ~0.8m 排开（不是 6 个高度堆叠）。BP13 仅取 B2/B3/B4 三条进料、注 B5 一条，B1/B6 透传过路。

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬───────┐
 0.0    │ ═══ B1 ═════════════════════════════════════════───│  透传
 0.8    │ ═══ B2 ══[prog split: RIP 18/24 + rod 72/96]═════──│  → L1@x4/L1'@x20 下 1F
 1.6    │ ═══ B3 ══[smart split: steel-beam 48]════════════──│  → L2@x12 下 2F
 2.4    │ ═══ B4 ══[smart split: concrete 96]══════════════──│  → L2'@x28 下 2F
 3.2    │ ═══ B5 ══[merger << L_out+L_out2 mainNode 8/12]══──│  注入终端
 4.0    │ ═══ B6 ═════════════════════════════════════════───│  透传
        │                                                    │
        │ lift 列(屋顶面, 各占唯一 col):                     │
        │   进料 L1(x4,c0.5) L2(x12,c1.5) L1'(x20,c2.5)      │
        │        L2'(x28,c3.5)                               │
        │   出料 L_out(x36,c4.5)→B5  L_out2(x8,c1.0)→B5      │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴───────┘
```

- B2 取强化铁板 18(T6)/24(T8+) + 铁棒 72(T6)/96(T8+)（**programmable splitter**，非等分按 §2-9 配置；T8 改配置上量，见上「T8 缺料补丁」）
- B3 取钢梁 48（**smart splitter**，filter=steel-beam）
- B4 取混凝土 96（**smart splitter**，filter=concrete；来自 BP10 跨 C5 段经 B4 总线）
- B5 merger 注入：模框 2(T6)/6(T8+) + 包裹梁 6 = 8(T6)/12(T8+) mainNode（merger 3in1out，2 路汇流 1 个 merger 够，§2-10）

## Power Switch 分网

把 6 台 assembler 拆 3 个独立 Power Network，由 3 个 Power Switch 控制。**3 个 Switch 全部 T6 一次安装好**，T6 阶段合 Network A + C，Network B 留到 T8 开。

| 网 | 范围 | 数量 | T6 状态 | 升级触发 |
|---|---|---:|---|---|
| Network A | 1F M1-M3（frame）| 3 | **ON** | — |
| Network B | 1F M4（frame）| 1 | OFF | T8 翻 ON |
| Network C | 2F E1-E2（beam）| 2 | **ON** | — |

> Power Switch 物理位置：放屋顶 **lift 列东侧 col≈4.5、row=3.5** 一带（避开 B1-B6 总线行 row 0-3.2 与 lift 落点），3 个并排，方便玩家在场内一眼区分。**不放在机身 / belt / lift 包围盒上**。

## 建造步骤

1. **框架**：5×5 cell × 5 cell 高（40×40×40m）
2. **1F (0-12m)**：放 4 台 modular-frame assembler M1-M4，**北墙内缩 6m**（机器本体 y=6-21m，col 0-4），back 输入朝北
3. **1F 进料巷（y=0-6m）**:
   - 强化铁板 18(T6)/24(T8+)：屋顶 B2 prog splitter → **L1 lift-bot 落巷 (4,4) col=0.5** → 东西向 manifold → **全 4 台** in-0
   - 铁棒 72(T6)/96(T8+)：屋顶 B2 prog splitter → **L1' lift-bot 落巷 (20,4) col=2.5** → manifold → **全 4 台** in-1
   - manifold 在巷内东西向行走（转弯相），仅在各机 back 端口处垂直短段进料（§2-5）
4. **1F belt 收集**：机器 front(南)边之外 y≈22m 走 frame collect belt（不穿机身），收 4 台 front → 中央 splitter
5. **1F 地基**：y=12m 铺 4m 厚地基（12-16m）
6. **2F (16-24m)**：放 2 台 encased-industrial-beam assembler E1-E2，北墙内缩 6m（机器本体 y=6-21m，col 0-2）
7. **2F 进料巷（y=0-6m）**:
   - 钢梁 48：屋顶 B3 smart splitter → **L2 lift-bot 落巷 (12,4) col=1.5** → manifold → 2 台 in-0
   - 混凝土 96：屋顶 B4 smart splitter → **L2' lift-bot 落巷 (28,4) col=3.5** → manifold → 2 台 in-1
8. **2F belt 收集**：机器 front 之外 y≈22m 走 beam collect belt → 中央 splitter
9. **2F 地基**：y=24m 铺 4m 厚地基（24-28m）
10. **集群内短 belt 出口**：模框 10 + 包裹梁 10 → 右 Wall Outlet (col=5, row≈3) → BP14 左 Wall Inlet
11. **垂直汇总（mainNode）**：模框 2(T6)/6(T8+) → **L_out (1F, col=4.5/x=36)**；包裹梁 6 → **L_out2 (2F, col=1.0/x=8)** → 屋顶 merger 注 B5（各 riser 占唯一 col，落 y=4/y=28 巷与 output 区，不穿任何楼层机身，§2-5）
12. **屋顶 (35-40m)**：6 belt 子 cell 行距排开 + **3 个分流器（B2 programmable / B3 smart / B4 smart）** + 1 merger（详见屋顶图）
13. **Power Switch ×3**：按"Power Switch 分网"表布置 Network A/B/C，放屋顶 col≈4.5 row=3.5；T6 合 A + C，B **OFF**
14. **Power Shard（T6 阶段）**：M1-M3 各插 2 shard（200%），E1-E2 各插 1 shard（133.33%）；**M4 物理已就位但 shard 槽空着**

## 集群内部连接

- 出口右 Wall Outlet（模框来自 1F z≈6m、包裹梁来自 2F z≈22m，各一条 belt，col=5）→ BP14 左 Wall Inlet
- BP14 HMF manufacturer 4 输入：模框 10 + 包裹梁 10 + 钢管 40 + 螺丝 240，前两路从这里接（BP14 manufacturer **facing=south**，输入在 front 朝南，见 BP14）

## Tier 7+ 启用流程（不动机器 / 不动 belt / 不动 lift；仅翻 Switch + 插 shard + 调屋顶 splitter 配置）

| Tier | 操作 | 通电总数 | 进料 |
|---|---|---:|---|
| T7 | 无变化（5 台继续运行）| 5 | RIP 18 + rod 72 + beam 48 + concrete 96 |
| T8 | (1) 翻 Network B Switch ON → M4 插 2 shard 调 200% (2) **屋顶 B2 prog splitter 改配置：RIP 18→24、rod 72→96（B2 取料 90→120）** | 6 | **RIP 24 + rod 96** + beam 48 + concrete 96 |
| T9 | 无新操作（6 台满载）；如需进一步上量可整体调超频百分比 | 6 | 同 T8 |

> T8 的「改屋顶 splitter 配置」只动 programmable splitter 的分配参数（不重拉 belt），是除翻 Switch / 插 shard 外唯一额外动作，已在「物料 I/O」的 T8 缺料补丁详述。

## 验证

- [x] **6 台 assembler 全部物理放置**（包括 T6 不通电的 M4）
- [x] **每层机器北墙内缩 6m 留进料巷**；assembler 本体 **y=6-21m（15m 满长，ASCII 画 8 行不画短）**
- [x] **同层无 AABB 重叠 + 全在 40×40 内**（已自检）：1F 4 台各 10m 占 x=0-10/10-20/20-30/30-40、y=6-21，相邻仅边缘接触无面积重叠，四角全在 40×40；2F 2 台占 x=0-10/10-20、y=6-21，同样无重叠在界内
- [ ] Belt manifold + lift 接到全部 6 台 in-0 / in-1（不只是 T6 通电的 5 台）
- [x] **collect belt 走机器 front 之外（y=22m，机身底 y=21m 之南），不穿机身**（R14）
- [x] **lift 落点分区核对（已自检）**：进料 L1(4,4)/L1'(20,4)/L2(12,4)/L2'(28,4) 落北侧巷 y=0-6m（box y=3-5）；输出 L_out(36,28)/L_out2(8,28) 落南侧 output 区（box y=27-29），均在机身 y=6-21 之外不压机身；所有 lift 垂直跨度 ≥13m ≥4m 下限
- [x] **各 riser col 互不相同、跨层不冲突（已自检，逐条列出）**：6 条 riser 的 col = L1:0.5 / L2:1.5 / L1':2.5 / L2':3.5 / L_out:4.5 / L_out2:1.0，**两两互不相同**。修复了原残留 3D 冲突：① 原 1F L1(4,4) 与 2F L2(4,4) 同 (x,y)、z 区间在 22-35m 段重叠 → 现 L1@x=4(col0.5) / L2@x=12(col1.5) 分列；② 原 1F L1'(12,4) 与 2F L2'(12,4) 同列 → 现 L1'@x=20(col2.5) / L2'@x=28(col3.5) 分列。4 条进料 riser 同 row(y=4) 但 col 全不同，3.5m 包围盒沿 x 排 4-7.5/12-15.5/20-23.5/28-31.5 不重叠；2 条出料 riser 同 row(y=28) col 4.5/1.0 不同，包围盒 36-39.5/8-11.5 不重叠。**任意两条 riser 不共享 (col,row)，跨层 z 区间无 3D 重叠**
- [x] **riser 不穿其它楼层机身（已自检）**：4 条进料 riser 落 y=4（巷 y=0-6m，在机身 y=6-21m 以北）；2 条出料 riser 落 y=28（output 区，在机身以南）。全 6 条 riser 全程 y 不进入任何楼层机身 y 区间(6-21m)，故与 x 无关地不穿 1F/2F 任何机身
- [ ] 3 个 Power Switch 一次建好，Network A + C 合上，B 断开
- [ ] T6 仅 M1-M3 + E1-E2 插 shard；M4 物理就位但 shard 槽空
- [ ] 3 路屋顶 splitter filter 正确（B2 prog: 强化铁板+铁棒；B3 smart: 钢梁；B4 smart: 混凝土）
- [ ] **T8 缺料补丁**：开 M4 时同步把 B2 prog splitter 配置改 RIP 24 / rod 96（取料 90→120），frame 输出 12→16、B5 终端 2→6
- [ ] 集群内出口 row 与 BP14 输入对齐
- [ ] 模框 + 包裹梁 各 10/min 走集群内短 belt（不是 B5）
- [ ] B4 混凝土 96 来自 BP10（C5），跨 C5→C6 经 B4 总线
