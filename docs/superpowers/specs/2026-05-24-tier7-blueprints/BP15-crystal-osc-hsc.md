# BP15 晶体振荡器 + 高速连接器 (C6)

## 概要

- **集群**: C6 装配（紧贴 BP14 之后，C6 末端，整厂最后生产蓝图）
- **规格**: Mk2 **3 实例**（BP15a 跑晶振 / BP15b 跑 HSC / BP15c 跑晶振），每实例 1F+2F = 2 台 manufacturer
- **机器**: **6 manufacturer 一次物理建造到位**（BP15a 2 晶振 + BP15b 2 HSC + BP15c 2 晶振）
- **激活时间线**（仅翻 Power Switch + 插 Power Shard，不动结构）:
  - T6 → 2 台通电（BP15a 1F 晶振 + BP15b 1F HSC）
  - T7 → 3 台通电（+BP15a 2F 晶振）
  - T8 → 5 台通电（+BP15b 2F HSC + BP15c 1F 晶振）
  - T9 → 6 台通电（+BP15c 2F 晶振，满载 4+2=6）
- **产能 T6**: 晶体振荡器 1/min · 高速连接器 3.75/min
- **产能 T9**: 晶体振荡器 4/min · 高速连接器 7.5/min

> **核心设计原则**：**6 台 manufacturer 在 T6 阶段就全部摆好 + belt/manifold/电网/Power Switch 全部接好**。后续升 Tier 时**不重新放机器、不重新拉 belt**——只需 (1) 翻对应 Power Switch (2) 插 Power Shard（晶振/HSC 均 100% 不超频，无需 shard）。

## 机器超频清单（T6，Plan C ≤250%）

| 配方 | 物理 | T6 通电 | 超频 | 单台产能 (/min) | Power Shard/通电台 |
|---|---:|---:|---:|---:|---:|
| crystal-oscillator (manufacturer) | 4 | **1** | 100.0% | 1.0 | 0 |
| high-speed-connector (manufacturer) | 2 | **1** | 100.0% | 3.75 | 0 |
| **合计 (T6)** | 6 | 2 | — | 1 + 3.75 = **4.75** | **0** |

> T6 时未通电的 4 台 manufacturer：物理建好、belt 接好、shard 槽不需要、Power Switch **关**，完全不耗电不产出。<br>
> T9 满载 4 晶振 + 2 HSC = 4 × 1.0 + 2 × 3.75 = **11.5/min**，全程 100% 无需 shard。

## 物料 I/O

| 方向 | 物料 | 流量 (T6/T9) | 路径 |
|---|---|---|---|
| **晶振 输入** | | | |
| 输入 | 强化铁板 | 2.5 / 10 | **屋顶 B2** ← BP2 → splitter |
| 输入 | 线缆 | 14 / 56 | **屋顶 B4** ← BP7 → splitter |
| 输入 | 石英晶体 | 18 / 72 | **屋顶 B6** ← BP10 → splitter |
| **HSC 输入** | | | |
| 输入 | 快速线 | 210 / 420 | **屋顶 B6** ← BP10 → splitter |
| 输入 | 线缆 | 37.5 / 75 | **屋顶 B4** ← BP7 → splitter |
| 输入 | 电路板 | 3.75 / 7.5 | **屋顶 B4** ← BP8 → splitter |
| **输出** | | | |
| 输出 | 晶体振荡器 → B5 终端 | 1 / 4 | 屋顶 merger → B5 |
| 输出 | 高速连接器 → B5 终端 | 3.75 / 7.5 | 屋顶 merger → B5 |

**屋顶总线接入**:
- 取自 B2 (强化铁板 T9 10)、B4 (线缆 T9 131 + 电路板 T9 7.5)、B6 (石英 T9 72 + 快速线 T9 420 = 492)
- 注入 B5 (T9 4 + 7.5 = 11.5 mainNode)

> ⚠ B6 已 Mk5：T7 现在 228 = 29% Mk5 ✓；T9 满载 492/min = 63% Mk5 ✓。B6 在 BP15 段全 Tier 周期内容量充裕。BP15 取尽 B6 后段归 0（重油残渣不上 B6，BP9 本地 sink）。

## 楼层占用

| 实例 | 层 | 高度 | 内容 | 物理台数 | T6 通电 |
|---|---|---|---|---:|---:|
| **BP15a** | 1F | 0-12m | 1 晶振 manufacturer | 1 | **1** |
| **BP15a** | 2F | 16-28m | 1 晶振 manufacturer | 1 | **0** (T7 ON) |
| **BP15b** | 1F | 0-12m | 1 HSC manufacturer | 1 | **1** |
| **BP15b** | 2F | 16-28m | 1 HSC manufacturer | 1 | **0** (T8 ON) |
| **BP15c** | 1F | 0-12m | 1 晶振 manufacturer | 1 | **0** (T8 ON) |
| **BP15c** | 2F | 16-28m | 1 晶振 manufacturer | 1 | **0** (T9 ON) |
| 屋顶 | 35-40m | B1-B6 6 条 Mk5 belt + splitter/merger | — | — | — |

> **T6 阶段**：BP15a 1F + BP15b 1F 通电（Network A1 + B1），其余 4 台 Power Switch **关**。所有 belt / lift / manifold / Power Switch 一次到位。

## 俯视图（按实际比例，每实例独立 — 视觉正方形）

**比例约定（§2-3 严格等比，图长=真实长）**：
- 横向：**1 字符 = 1m** → 画布内宽 40 字符 = 40m；横向标尺每 4m 一刻度（`┬` 间距严格 4 字符）。
- 纵向：**1 行 = 2m** → 画布内高 20 行 = 40m；纵轴标签**均匀 2m/行**（0,2,4,…,40），不跳格。
- 蓝图 40×40m → 40 字符宽 × 20 行高（视觉非正方形，但每方向各自等比；真实为正方形）。

**机器实际尺寸** → ASCII 占位（横 1 字符=1m、纵 1 行=2m）：

| 机器 | 实际 W×L | ASCII 占位（W 字符 × H 行） |
|---|---|---|
| manufacturer | 20m × 22m | **20 字符 × 11 行**（22m÷2=11 行，不得画短） |

**图例**：
- `*` 后缀 = T6 通电；无 `*` = T7+ Power Switch 关（物理已建，不耗电不产出）
- `^` = back (north) 输出（manufacturer 输出在 back）
- `v` = front (south) 输入（manufacturer 输入在 front）

> **facing=south**（manufacturer 一律 facing=south）：manufacturer 是唯一输入在 **front** 的机器。4 输入 front 朝南、1 输出 back 朝北。机器 north 边内缩 ≥4m 留 output lift 巷；进料 manifold 走南侧 front。

> **坐标说明**（§2-7）：俯视图纵轴 = 楼层**南北进深**（0=北墙、40m=南墙），与楼层 z 安装高度（1F z=0-12m / 2F z=16-28m 等）是两个独立维度，不混写。每层 manufacturer 在**进深平面上占相同位置 y=4-26m（22m=11 行）**：北侧 y0-4 留 output lift 巷、南侧 y26-40 留 front 进料区。1F 与 2F 仅 z 安装高度不同（差 16m），进深平面坐标一致，不存在水平错位也不存在垂直叠压。

### BP15a 1F (0-12m): 1 晶振 manufacturer — T6 通电

> facing=south：机器 north 边内缩到 y=4m（北侧 0-4m 留 output lift 巷），机身 y=4-26m（22m=11 行），南侧 y=26-40m 留 front 进料 manifold + lift 区。

```
        0   4   8   12  16  20  24  28  32  36  40m   (1字符=1m)
        ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬──────┐
 0m     │ L^ out-0 back(north,y≈1) >> lift-out-top │
 2m     │ ││ to roof merger (B5) osc 1/min main    │
 4m     │ ┌────────────────────┐                  │  机身北边 y=4m
 6m     │ │ Crystal-Osc M1*    │ T6 ON(Network A1) │
 8m     │ │ 20m W x 22m L      │ 100% 不超频       │
10m     │ │ facing=south       │ (out back=north   │
12m     │ │                    │  in front=south)  │
14m     │ │                    │                   │
16m     │ │                    │                   │
18m     │ │                    │                   │
20m     │ │                    │                   │
22m     │ │                    │                   │
24m     │ │ v    v    v    .   │ in front y≈25m:   │
26m     │ └─┼────┼────┼────────┘ in-0 RIP 2.5     │  机身南边 y=26m
28m     │   │    │    │          in-1 cable 14     │
30m     │   L0   L1   L2         in-2 quartz 18    │
32m     │   │    │    │          in-3 EMPTY(3 ingr)│
34m     │ ══╧══╤═╧══╤═╧══ 南侧进料 manifold(y32-34)│
36m     │      │    │     水平转弯相 y34-38        │
38m     │   ┌──┴────┴──┐  3 路爬升相直上屋顶(35→11)│
40m     └───┴──────────┴──────────────────────────┘  lift-bot↑ L0←B2/L1←B4/L2←B6
```

- M1 (Crystal-Osc) T6 **通电**；100% 不超频；facing=south
- 出料：out-0 back(north, y≈1m) → 北侧 0-4m output lift 巷 `L^` → lift-out-top 直上屋顶 merger 注 B5
- 进料：3 路 front 输入 in-0/1/2 在南侧 y≈26m，col 分别对齐 lift L0/L1/L2；走线分两相——
  - **垂直爬升相**：屋顶 B2/B4/B6 splitter → lift-bot 落点 row34-38（南侧空区）→ 直下到 1F 进料层
  - **水平转弯相**：lift 落点 → row34-38 平面水平折到各 in 端口正下方 col → 短垂直段进 in-0/1/2（满足「先转后爬」分相，互不重叠）
- in-3 空（crystal-oscillator 配方仅 3 输入）

### BP15a 2F (z=16-28m): 1 晶振 manufacturer — T6 Power Switch 关

> 进深平面同 1F（机身 y=4-26m=11 行，北侧 output lift 巷、南侧 front 进料区），仅 z 安装高度 +16m。进料**直接从屋顶 splitter 分一路 lift-bot 落 2F（z 35m→22m）**，不从 1F manifold 回抬（避免无谓下-上往返）。

```
        0   4   8   12  16  20  24  28  32  36  40m   (1字符=1m)
        ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬──────┐
 0m     │ L^ out-0 back(north,y≈1) >> lift-out-top │
 2m     │ ││ to roof merger (B5)                   │
 4m     │ ┌────────────────────┐                  │  机身北边 y=4m
 6m     │ │ Crystal-Osc M2     │ T6 OFF→T7 翻 ON   │
 8m     │ │ 20m W x 22m L      │ (Network A2)      │
10m     │ │ facing=south       │ 100% 不超频       │
12m     │ │                    │                   │
14m     │ │                    │                   │
16m     │ │                    │                   │
18m     │ │                    │                   │
20m     │ │                    │                   │
22m     │ │                    │                   │
24m     │ │ v    v    v    .   │ in front y≈25m:   │
26m     │ └─┼────┼────┼────────┘ in-0 RIP/in-1 cab│  机身南边 y=26m
28m     │   │    │    │          in-2 quartz       │
30m     │   v    v    v          in-3 空           │
32m     │ ══╧══╤═╧══╤═╧══ 水平转弯相 y30-34        │
34m     │      │    │                              │
36m     │   ┌──┴────┴──┐  屋顶 lift-bot 落 2F      │
38m     │   └──────────┘  (z35→22m)→转弯相→进 front│
40m     └───┴──────────┴───────────────────────────┘
```

- M2：物理建造完整，T6 Power Switch **关**；facing=south
- 进料：屋顶 B2/B4/B6 splitter **各分一路** lift-bot 直落 2F 进料层（35m→约 22m），不经 1F——避免「lift-up 回抬」的下-上往返；落点后水平转弯相→垂直进 in-0/1/2
- 出料：out-0 back(north) → output lift 巷 → 屋顶 merger
- 通电节奏：T7 翻 Network A2 ON → 晶振 1 → 2/min

### BP15b 1F (z=0-12m): 1 HSC manufacturer — T6 通电

> facing=south：机身 y=4-26m（22m=11 行），北侧 y0-4 留 output lift 巷，南侧 y26-40 留 front 进料 manifold + lift 区。进深平面同 BP15a 1F。

```
        0   4   8   12  16  20  24  28  32  36  40m   (1字符=1m)
        ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬──────┐
 0m     │ L^ out-0 back(north,y≈1) >> lift-out-top │
 2m     │ ││ to roof merger (B5) HSC 3.75/min main │
 4m     │ ┌────────────────────┐                  │  机身北边 y=4m
 6m     │ │ HSC M1*            │ T6 ON(Network B1) │
 8m     │ │ 20m W x 22m L      │ 100% 不超频       │
10m     │ │ facing=south       │ (out back=north   │
12m     │ │                    │  in front=south)  │
14m     │ │                    │                   │
16m     │ │                    │                   │
18m     │ │                    │                   │
20m     │ │                    │                   │
22m     │ │                    │                   │
24m     │ │ v    v    v    .   │ in front y≈25m:   │
26m     │ └─┼────┼────┼────────┘ in-0 qwire 210   │  机身南边 y=26m
28m     │   │    │    │          in-1 cable 37.5   │
30m     │   L0   L1   L2         in-2 CB 3.75      │
32m     │   │    │    │          in-3 EMPTY        │
34m     │ ══╧══╤═╧══╤═╧══ 南侧进料 manifold(y32-34)│
36m     │      │    │     水平转弯相 y34-38        │
38m     │   ┌──┴────┴──┐  3 路爬升相直上屋顶(35→11)│
40m     └───┴──────────┴──────────────────────────┘  lift-bot↑ L0←B6/L1←B4/L2←B4
```

- HSC M1 T6 **通电**；100% 不超频；facing=south
- 出料：out-0 back(north, y≈1m) → 北侧 output lift 巷 `L^` → lift-out-top 直上屋顶 merger 注 B5
- 进料：3 路 front 输入 in-0/1/2 在南侧 y≈26m，col 对齐 lift L0/L1/L2；走线分两相（先垂直爬升相 y34-38m lift-bot 落料、再水平转弯相折到各 in 端口正下方），互不重叠
- in-3 空（high-speed-connector 配方仅 3 输入）

### BP15b 2F (z=16-28m): 1 HSC manufacturer — T6 Power Switch 关

> 进深平面同 1F（机身 y=4-26m=11 行），仅 z 安装高度 +16m。进料**直接从屋顶 splitter 分一路 lift-bot 落 2F（z 35m→22m）**，不从 1F manifold 回抬。

```
        0   4   8   12  16  20  24  28  32  36  40m   (1字符=1m)
        ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬──────┐
 0m     │ L^ out-0 back(north,y≈1) >> lift-out-top │
 2m     │ ││ to roof merger (B5)                   │
 4m     │ ┌────────────────────┐                  │  机身北边 y=4m
 6m     │ │ HSC M2             │ T6 OFF→T8 翻 ON   │
 8m     │ │ 20m W x 22m L      │ (Network B2)      │
10m     │ │ facing=south       │ 100% 不超频       │
12m     │ │                    │                   │
14m     │ │                    │                   │
16m     │ │                    │                   │
18m     │ │                    │                   │
20m     │ │                    │                   │
22m     │ │                    │                   │
24m     │ │ v    v    v    .   │ in front y≈25m:   │
26m     │ └─┼────┼────┼────────┘ in-0 qwire/in-1cb│  机身南边 y=26m
28m     │   │    │    │          in-2 circuit-board│
30m     │   v    v    v          in-3 空           │
32m     │ ══╧══╤═╧══╤═╧══ 水平转弯相 y30-34        │
34m     │      │    │                              │
36m     │   ┌──┴────┴──┐  屋顶 lift-bot 落 2F      │
38m     │   └──────────┘  (z35→22m)→转弯相→进 front│
40m     └───┴──────────┴───────────────────────────┘
```

- HSC M2：物理建造完整，T6 Power Switch **关**；facing=south；T8 翻 Network B2 ON → HSC 3.75 → 7.5/min
- 进料：屋顶 B6/B4 splitter **各分一路** lift-bot 直落 2F（35m→约 22m），不经 1F；落点后水平转弯相→垂直进 in-0/1/2
- 出料：out-0 back(north) → output lift 巷 → 屋顶 merger

### BP15c 1F (z=0-12m): 1 晶振 manufacturer — T6 Power Switch 关

> facing=south：机身 y=4-26m（22m=11 行），北侧 y0-4 留 output lift 巷，南侧 y26-40 留 front 进料区。进深平面同 BP15a 1F。

```
        0   4   8   12  16  20  24  28  32  36  40m   (1字符=1m)
        ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬──────┐
 0m     │ L^ out-0 back(north,y≈1) >> lift-out-top │
 2m     │ ││ to roof merger (B5) osc 1/min main    │
 4m     │ ┌────────────────────┐                  │  机身北边 y=4m
 6m     │ │ Crystal-Osc M1     │ T6 OFF→T8 翻 ON   │
 8m     │ │ 20m W x 22m L      │ (Network C1)      │
10m     │ │ facing=south       │ 100% 不超频       │
12m     │ │                    │                   │
14m     │ │                    │                   │
16m     │ │                    │                   │
18m     │ │                    │                   │
20m     │ │                    │                   │
22m     │ │                    │                   │
24m     │ │ v    v    v    .   │ in front y≈25m:   │
26m     │ └─┼────┼────┼────────┘ in-0 RIP 2.5     │  机身南边 y=26m
28m     │   │    │    │          in-1 cable 14     │
30m     │   L0   L1   L2         in-2 quartz 18    │
32m     │   │    │    │          in-3 EMPTY        │
34m     │ ══╧══╤═╧══╤═╧══ 南侧进料 manifold(y32-34)│
36m     │      │    │     水平转弯相 y34-38        │
38m     │   ┌──┴────┴──┐  3 路爬升相直上屋顶(35→11)│
40m     └───┴──────────┴──────────────────────────┘  lift-bot↑ 续接 B2/B4/B6 splitter
```

- BP15c M1：物理建造完整，T6 Power Switch **关**；facing=south；T8 翻 ON（HSC + 晶振同步扩容）
- 进料/出料走线同 BP15a 1F：3 路 front lift（先垂直爬升相、再水平转弯相）+ 北侧 output lift；取自屋顶 B2/B4/B6 续接 splitter

### BP15c 2F (z=16-28m): 1 晶振 manufacturer — T6 Power Switch 关

> 进深平面同 1F（机身 y=4-26m=11 行），仅 z 安装高度 +16m。进料**直接从屋顶 splitter 分一路 lift-bot 落 2F（z 35m→22m）**，不从 1F manifold 回抬。

```
        0   4   8   12  16  20  24  28  32  36  40m   (1字符=1m)
        ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬──────┐
 0m     │ L^ out-0 back(north,y≈1) >> lift-out-top │
 2m     │ ││ to roof merger (B5)                   │
 4m     │ ┌────────────────────┐                  │  机身北边 y=4m
 6m     │ │ Crystal-Osc M2     │ T6 OFF→T9 翻 ON   │
 8m     │ │ 20m W x 22m L      │ (Network C2 满载) │
10m     │ │ facing=south       │ 100% 不超频       │
12m     │ │                    │                   │
14m     │ │                    │                   │
16m     │ │                    │                   │
18m     │ │                    │                   │
20m     │ │                    │                   │
22m     │ │                    │                   │
24m     │ │ v    v    v    .   │ in front y≈25m:   │
26m     │ └─┼────┼────┼────────┘ in-0 RIP/in-1 cab│  机身南边 y=26m
28m     │   │    │    │          in-2 quartz       │
30m     │   v    v    v          in-3 空           │
32m     │ ══╧══╤═╧══╤═╧══ 水平转弯相 y30-34        │
34m     │      │    │                              │
36m     │   ┌──┴────┴──┐  屋顶 lift-bot 落 2F      │
38m     │   └──────────┘  (z35→22m)→转弯相→进 front│
40m     └───┴──────────┴───────────────────────────┘
```

- BP15c M2：物理建造完整，T6 Power Switch **关**；facing=south；T9 翻 ON → 全部 6 台满载 4+2=6
- 进料：屋顶 B2/B4/B6 splitter **各分一路** lift-bot 直落 2F（35m→约 22m），不经 1F；落点后水平转弯相→垂直进 in-0/1/2
- 出料：out-0 back(north) → output lift 巷 → 屋顶 merger

### 屋顶 (35-40m): B1-B6 + 3 splitter + 1 merger（每实例屋顶相同）

> 6 条 Mk5 belt 在 z=35-40m 同层东西向并排，按 **进深 ~6m 行距（y=4/10/16/22/28/34m）** 排开（§2-8），**不是高度堆叠**。纵轴仍 1 行=2m。穿层 lift 口落在相邻 belt 轴线之间的空隙 row（不压任何 belt 轴）。穿层口坐标如下表。
>
> **B5→B6 间距 12m（y22→y34）是有意布局**：B5 上挂 merger（注入 mainNode），其余 belt 维持 ~6m 行距，唯独在 B5 与 B6 之间多留一段（y24-32m 空区）给 merger 本体 + 进出料折弯腾出占位，避免 merger 压到 B6 轴线。此空区不放任何 belt，保留。
>
> (横向为示意，机器/设备真实 x 坐标以正文坐标表为准)

```
        0   4   8   12  16  20  24  28  32  36  40m   (1字符=1m)
        ┌───┬───┬───┬───┬───┬───┬───┬───┬───┬─────┐
 0m     │ o B1 ═══════════════════════════════ o │  (passthru)
 2m     │  ↓Ldn-RIP(x12)                          │  lift 口空隙
 4m     │ o B2 ═══[smart split RIP T9 10]═══════ o│  (强化铁板)
 6m     │                                         │
 8m     │  ↓Ldn-cable+CB(x12)                     │  lift 口空隙
10m     │ o B3 ═══════════════════════════════ o │  (passthru)
12m     │                                         │
14m     │  ↑Lup-out(x3)→merger                    │  lift 口空隙
16m     │ o B4 ═[prog split cable131 + CB7.5 T9]═ o│  (线缆/电路板)
18m     │                                         │
20m     │  ↓Ldn-quartz+qwire(x16)                 │  lift 口空隙
22m     │ o B5 ═[merger ←lift-top mainNode T9 11.5]o│  (输出总线)
24m     │                                         │
26m     │                                         │
28m     │                                         │
30m     │                                         │
32m     │                                         │
34m     │ o B6 ═[smart split quartz72 + qwire420]═ o│  (石英/快速线)
36m     │                                         │
38m     │                                         │
40m     └───┴───┴───┴───┴───┴───┴───┴───┴───┴─────┘
```

**穿层 lift 口坐标**（落在 belt 轴线之间空隙；每口 3.5×2m 包围盒不互相重叠；x、落点 y 均用米标）：

| lift 口 | 落点 (x m, y m) | 服务 belt | 用途 |
|---|---|---|---|
| Ldn-RIP | (12, 2) | B2 | 强化铁板 splitter → 下落 1F/2F in-0 |
| Ldn-cable+CB | (12, 8) | B4 | 线缆+电路板 prog split → 下落 in-1/2 |
| Lup-out | (3, 14) | B5 | M1+M2 lift-top mainNode → merger 注 B5 |
| Ldn-quartz+qwire | (16, 20) | B6 | 石英/快速线 smart split → 下落 in-2/0 |

- 每口分 2 路并行（M1 落 1F、M2 直落 2F，详见各层进料图），同口两 lift 沿 col 错开 ≥4m（包围盒不撞）。
- B2/B4/B6 smart/prog splitter 按 T9 流量一次配好（T6 取较少不影响）。
- B5 merger 注入：T6 4.75 → T9 11.5 mainNode。
- Splitter/merger 一次全装；T7+ 物料量自动增加，结构不动。

## Power Switch 分网

把 6 台 manufacturer 拆 6 个独立 Power Network，由 6 个 Power Switch 控制。**6 个 Switch 全部 T6 一次安装好**，只是 T6 阶段只合 Network A1 + B1。

| 网 | 范围 | 数量 | T6 状态 | 升级触发 |
|---|---|---:|---|---|
| Network A1 | BP15a 1F 晶振 M1 | 1 | **ON** | — |
| Network A2 | BP15a 2F 晶振 M2 | 1 | OFF | T7 翻 ON |
| Network B1 | BP15b 1F HSC M1 | 1 | **ON** | — |
| Network B2 | BP15b 2F HSC M2 | 1 | OFF | T8 翻 ON |
| Network C1 | BP15c 1F 晶振 M1 | 1 | OFF | T8 翻 ON |
| Network C2 | BP15c 2F 晶振 M2 | 1 | OFF | T9 翻 ON |

> Power Switch 物理位置建议每实例 2F 角落，2 个一组，方便玩家在场内一眼区分。

## 建造步骤

1. **框架**：3 个实例 BP15a/b/c，每实例 5×5 cell × 5 cell 高（40×40×40m）
2. **每实例 1F (0-12m)**：放 1 台 manufacturer，**facing=south**（输入 front 朝南、输出 back 朝北）；机器 north 边内缩 ≥4m 留 output lift 巷
   - BP15a/c：crystal-oscillator
   - BP15b：high-speed-connector
3. **每实例 1F 进料 belt + manifold + lift-bot**：从屋顶 B2/B4/B6 splitter 各分一路 lift-bot 下落到南侧进料区（先垂直爬升相、再水平转弯相），喂 front in-0/1/2（in-3 空）
4. **每实例 1F 出料**: out-0 back(north, y≈1m) → 北侧 output lift 巷 lift-out-top → 屋顶 merger
5. **每实例 1F 地基**：y=12m 铺 4m 厚地基
6. **每实例 2F (16-28m)**：**同 1F 布局**放第 2 台 manufacturer（配方同 1F），同样 facing=south
7. **每实例 2F belt + lift**：进料**从屋顶 splitter 各再分一路 lift-bot 直落 2F（35m→约 22m）**，不从 1F manifold lift-up 回抬（避免无谓下-上往返）；出料同 1F 北侧 output lift
8. **每实例 2F 地基**：y=28m 铺 4m 厚地基
9. **屋顶 (35-40m)**：每实例 6 条 Mk5 belt 直通 + B2/B4/B6 splitter + B5 merger，左右各嵌 Wall Mount
10. **B6 已 Mk5（780/min）**：T7 取 228 = 29% / T9 取 492 = 63% 均充裕，无需进一步升级
11. **Power Switch ×6**：按上面"Power Switch 分网"表布置 Network A1/A2/B1/B2/C1/C2；T6 只合 A1 + B1，其余全部 OFF
12. **Power Shard（T6 阶段）**：晶振 / HSC 全程 100% 不超频，**0 shard**

## Tier 7+ 启用流程（仅翻 Switch，不动结构 / 不动 belt / 无需 shard）

| Tier | 操作 | 通电总数 | 产能 (osc / HSC) |
|---|---|---:|---|
| T7 | 翻 Network A2 Switch ON → BP15a 2F 晶振 M2 加电 | 3 | 2 / 3.75 |
| T8 | 翻 Network B2 + C1 Switch ON → BP15b 2F HSC + BP15c 1F 晶振 加电 | 5 | 3 / 7.5 |
| T9 | 翻 Network C2 Switch ON → BP15c 2F 晶振 M2 加电；**B6 已 Mk5；T9 取 492 = 63% Mk5 ✓** | 6 | 4 / 7.5 |

> 全程**无需插 Power Shard**（所有机器 100% 运转）。Tier 升级只翻 Switch + 检查屋顶 B6 belt 等级。

## 多实例侧墙续接

BP15a/b/c 在机器层**无跨实例短 belt**（晶振和 HSC 各产线独立，进料全从屋顶取）。

蓝图侧墙集群内 mount（机器层）：**无**。BP15 仅有屋顶 6 belt mount。

> 3 实例物料完全独立，通过屋顶 B2/B4/B6 各自取料 → 通过屋顶 B5 各自输出 mainNode。

## 关键约束：B6 流量分配

B6 流入 BP15 共 T6 228 → T9 492（石英 72 + 快速线 420），是 B6 最大段。
- BP10 注入 B6: 石英 72 + 快速线 420 = 492（**T9 新源**）。
- BP15 取走 T9 全部 492，B6 在 BP15 段末尾归 0。

> **重油残渣不上 B6**：BP9 的重油残渣在 BP9 本地直接进 sink（按入料 belt 速率），不携带到 BP6/B6 总线，也不进入 BP15。BP15 段 B6 仅承载石英 + 快速线。

> T7 时 B6 → BP15 段 = 228 = 29% Mk5 ✓；T9 时 = 492 = 63% Mk5 ✓。BP15 取尽后 B6 段归 0。

## 验证

- [ ] **6 台 manufacturer 全部物理放置**（包括 T6 不通电的 4 台 BP15a-M2 / BP15b-M2 / BP15c-M1/M2）
- [ ] Belt manifold + lift 接到全部 6 台 in-0/1/2（不只是 T6 通电的 2 台）；in-3 槽留空
- [ ] **6 个 Power Switch 一次建好**，Network A1 + B1 合上，A2/B2/C1/C2 断开
- [ ] T6 阶段所有 manufacturer 100% 不超频，shard 槽全空（晶振 / HSC 全 Tier 均 100%）
- [ ] B5 merger 注入路径一次接到 3 实例 lift-out-top（T9 总 11.5/min = 1.5% Mk5 ✓）
- [ ] B6 流量分段：T7 BP10→BP15 段 228 = 29% Mk5 ✓；T9 段 492 = 63% Mk5 ✓（已 Mk5 不需进一步升级）；重油残渣不上 B6（BP9 本地 sink）
- [ ] 晶振 / HSC 在不同实例（a/c vs b），跨实例集群内无 belt（屋顶 B5 共用）
- [ ] 屋顶 splitter/merger 一次按 T9 流量配置，T7+ 自动续流
