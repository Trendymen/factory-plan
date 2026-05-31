# BP5 钢梁 + 钢管 (C2)

## 概要

- **集群**: C2 钢系（紧贴 BP4 之后）
- **规格**: Mk2 单实例
- **机器**: **8 constructor 一次物理建造到位**（3 钢梁 + 5 钢管）
- **激活时间线**（仅翻 Power Switch + 插 Power Shard，不动结构）:
  - T6 → 5 台通电（2 钢梁 + 3 钢管，其余 3 台 Power Switch 关）
  - T7 → 6 台通电（2 钢梁 + 4 钢管）
  - T8 → 8 台通电（3 钢梁 + 5 钢管，未满超频）
  - T9 → 8 台通电（满载 3 钢梁 + 5 钢管）
- **产能**: T6 钢梁 63 + 钢管 135 /min

> **核心设计原则**：**8 台 constructor 在 T6 阶段就全部摆好 + belt/manifold/电网/Power Switch 全部接好**。后续升 Tier 时**不重新放机器、不重新拉 belt**——只需 (1) 翻对应 Power Switch (2) 插 Power Shard (3) 调超频百分比。

## 机器超频清单（T6，Plan C）

> **命名说明**：constructor 机器一律用 `BEAM1/2/3`、`PIPE1-5` 前缀，避免与屋顶总线 `B3`/`B5` 混淆。

| 配方 | 物理 | T6 通电 | 超频 | 单台产能 (/min) | Power Shard/通电台 |
|---|---:|---:|---:|---:|---:|
| steel-beam (constructor) | 3 | **2** | 210.00% | 31.5 | 3 |
| steel-pipe (constructor) | 5 | **3** | 225.00% | 45.0 | 3 |
| **合计 (T6)** | 8 | 5 | — | 钢梁 63 + 钢管 135 | 5 × 3 = **15** |

> **超频上限说明**：本蓝图的「满载」= 钢梁 constructor **210%**、钢管 constructor **225%**（均 3 Power Shard、≤250% 硬上限内），**不是 250%**。T9 满载即此超频值，并非进一步拉到 250%。<br>
> T6 时未通电的 3 台 constructor（BEAM3 / PIPE4 / PIPE5）：物理建好、belt 接好、shard 槽**空着**、Power Switch **关**，完全不耗电不产出。<br>
> T9 满载 8 台 = 3 钢梁 + 5 钢管，每台 3 shard = **24 shard 总**。

## 物料 I/O

| 方向 | 物料 | 流量 (T6) | 路径 |
|---|---|---|---|
| 输入 | 钢锭 | 455/min | **集群内部** ← BP4 右 Wall Outlet (z=22m) → BP5 左 Wall Inlet |
| 输出 | 钢梁 → B3 (BP13 包裹) | 48 | 屋顶 merger → B3 |
| 输出 | 钢梁 → B5 终端 | 15 | 屋顶 merger → B5 |
| 输出 | 钢管 → B3 (BP12 + BP14 + BP11) | 115 | 屋顶 merger → B3 |
| 输出 | 钢管 → B5 终端 | 20 | 屋顶 merger → B5 |

**屋顶总线接入**: 注入 B3 (钢梁 48 + 钢管 115 = 163) + B5 (钢梁 15 + 钢管 20 = 35)

## 楼层占用

| 层 | 高度 | 内容 | 物理台数 | T6 通电 |
|---|---|---|---:|---:|
| 1F | 0-32m 平面 | row A (4 台 BEAM1/BEAM2/PIPE1/PIPE2) + row B (4 台 PIPE3/PIPE4/PIPE5/BEAM3)；南侧进料巷 + lift 列 | 8 | **5** |
| 屋顶 | 35-40m | 总线 B1-B6 + 2 merger (注入 B3, B5) + 4 lift-top | — | — |

> **T6 阶段**：Power Network A 的 5 台通电（BEAM1/BEAM2/PIPE1/PIPE2/PIPE3，跨 row A/row B），其余 3 台（PIPE4/PIPE5/BEAM3）Power Switch **关**（Network B/C 待 T7+ 渐次启用）。所有 belt / lift / manifold / Power Switch 一次到位。<br>
> 机器从北墙 y=0 内缩 ≥4m，留东西向「进料 manifold 巷」；row A 与 row B 之间留 collect belt + 进料巷净空（§2-1）。

## 俯视图（按实际比例，每层独立）

**比例约定**（同 BP02）：1 字符 = 1m 横向；1 行 = 2m 纵向；蓝图 40×40m = 40 字符 × 20 行。

**图例**：
- `*` 后缀 = T6 通电；无 `*` = T7+ Power Switch 关（物理已建，不耗电不产出）
- `v` = front (south) 输出；constructor 输入在 back (north)
- `8x10` = 8m 宽 × 10m 长（constructor，纵向 10m = 5 行）
- 坐标：平面 row/col 用 cell 单位（1cell=8m，≤5）；安装高度单独用 `z=…m`

### 1F 平面: 8 constructor — row A (4 台) + row B (4 台)，北侧进料巷

> **布局公约（§2）**：每排 4 台（不再 5 台满宽），机器从北墙 y=0 内缩 ≥4m 留进料巷，台间留 ~2m belt 折线净空，collect belt 走机器 front 边之外。constructor 8m 宽 × 10m 长 = 8 字符 × 5 行。

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬──────┐
 0      │  ←── steel-ingot 进料 manifold 巷 (北侧 y=0-4) ──→│
 4      │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐               │
 6      │ │BEAM1*│ │BEAM2*│ │PIPE1*│ │PIPE2*│  row A        │
 8      │ │ beam │ │ beam │ │ pipe │ │ pipe │  4 台 ON      │
10      │ │ 8x10 │ │ 8x10 │ │ 8x10 │ │ 8x10 │               │
12      │ │  v   │ │  v   │ │  v   │ │  v   │               │
14      │ └──────┘ └──────┘ └──────┘ └──────┘               │
16      │ ══ beam/pipe collect belt (row A, row=1.875) ══   │
18      │  ←── row B 进料巷 (y=18-20) ──→                   │
20      │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐               │
22      │ │PIPE3*│ │PIPE4 │ │PIPE5 │ │BEAM3 │  row B        │
24      │ │ pipe │ │ pipe │ │ pipe │ │ beam │  1 ON+3 OFF   │
26      │ │ 8x10 │ │ 8x10 │ │ 8x10 │ │ 8x10 │               │
28      │ │  v   │ │  v   │ │  v   │ │  v   │               │
30      │ └──────┘ └──────┘ └──────┘ └──────┘               │
32      │ ══ beam/pipe collect belt (row B, row=4.125) ══   │
34      │ IN z=22m (左墙 Wall Inlet): steel-ingot           │
36      │   → lift-bot → prog. splitter → 全 8 台 in-0      │
38      │ lift 列 col=3.5/4.0 (y=34/37): 4×lift-top→屋顶    │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴──────┘
```

- **BEAM1\*/BEAM2\***：steel-beam constructor，T6 **通电**（Network A）
- **PIPE1\*/PIPE2\*/PIPE3\***：steel-pipe constructor，T6 **通电**（Network A）
- **PIPE4**：T7 启用（Network B）；**PIPE5 / BEAM3**：T8 启用（Network C）。T6 物理已就位、Power Switch **关**、shard 槽空
- 机器列中心：col≈0.5/1.5/2.5/3.5（x=5/15/25/35m），台间 2m 间隙 + 侧墙 1m 余量，belt 折线有净空
- **进料**：左墙 Wall Inlet (z=22m) → lift-bot 下到南侧 → **programmable splitter**（按 beam:pipe 消耗比非等分，§2-9）→ 北侧进料巷 manifold 喂 **全部 8 台** in-0
- **出料**：钢梁 / 钢管两条独立 collect belt（row A 收 row=1.875、row B 收 row=4.125，走机器 front 南侧空带，不穿机身）→ 南侧 lift 列 → 屋顶 merger

### 南侧 lift 列走线 (§2-5：先转弯相 → 再爬升相)

> collect belt 在南侧空带做**水平转弯相**汇到各 lift 落点，lift 再做**垂直爬升相** z=2m→35m（climb 33m，<48m 上限）。4 条 lift 集中在 col=3.5/4.0 专用列，落点在 y 方向错开，3.5×2m 包围盒互不重叠、不穿任何机身。

| lift | 用途 | 落点 (col,row) ≈ (x,y)m | 3.5×2m 包围盒 (x,y)m | 爬升 z |
|---|---|---|---|---|
| lift-1 | 钢梁 → B3 | (3.5, 4.25) ≈ (28, 34) | x 24.5–28 / y 33–35 | 2→35m |
| lift-2 | 钢梁 → B5 | (3.5, 4.625) ≈ (28, 37) | x 24.5–28 / y 36–38 | 2→35m |
| lift-3 | 钢管 → B3 | (4.0, 4.25) ≈ (32, 34) | x 28.5–32 / y 33–35 | 2→35m |
| lift-4 | 钢管 → B5 | (4.0, 4.625) ≈ (32, 37) | x 28.5–32 / y 36–38 | 2→35m |

> col=4.5（仅 4m 宽）不足以塞 2 splitter + 4 lift，已按 §2-5 内移到 col=3.5/4.0 并沿 row 错开。钢梁/钢管各 1 个 **programmable splitter**（按 B3:B5 流量比 48:15 与 115:20 非等分分流，§2-9）置于各自 collect belt 末端、lift 落点之前。

### 屋顶 (35-40m): 总线 B1-B6 + 2 merger (注入 B3 + B5)

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬─────┐
 0      │ o B1 ────────────────────────────────────── o    │
 4      │ o B2 ────────────────────────────────────── o    │
 8      │ o B3 ───[merger << beam 48 + pipe 115]───── o    │
12      │ o B4 ────────────────────────────────────── o    │
16      │ o B5 ───[merger << beam 15 + pipe 20]────── o    │
20      │ o B6 ────────────────────────────────────── o    │
24      │                                                  │
28      │ B3 inject 163/min  (beam+pipe to BP12-15)        │
        │ B5 inject  35/min  (mainNode terminal)           │
32      │                                                  │
36      │ B1/B2/B4/B6 在 BP5 蓝图内仅直通无注入            │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴─────┘
```

- 总线 **B3** merger：beam 48 + pipe 115 = 163/min（南侧上行 lift-1/lift-3 在此合流）
- 总线 **B5** merger：beam 15 + pipe 20 = 35/min mainNode（lift-2/lift-4 合流）
- 总线 B1/B2/B4/B6 直通无注入
- 6 条 Mk5 总线在 35-40m 同层按子 cell 间距排开（row=0.25/0.75/…，§2-8），左右各嵌 Wall Mount（Inlet 左 / Outlet 右），row 严格对齐邻图以保证 Auto Connect

## Power Switch 分网

把 8 台 constructor 拆 3 个独立 Power Network，由 3 个 Power Switch 控制。**3 个 Switch 全部 T6 一次安装好**，只是 T6 阶段只合 Network A。

| 网 | 范围 | 数量 | T6 状态 | 升级触发 |
|---|---|---:|---|---|
| Network A | BEAM1/BEAM2/PIPE1/PIPE2（row A）+ PIPE3（row B） | 5 | **ON** | — |
| Network B | PIPE4（row B） | 1 | OFF | T7 翻 ON |
| Network C | BEAM3/PIPE5（row B） | 2 | OFF | T8 翻 ON（T9 调满超频） |

> Power Switch 物理位置建议放 1F 南侧进料巷/lift 列旁（col≈3 row=2.25，避开机身与 lift 包围盒），3 个并排，方便玩家在场内一眼区分。

## 建造步骤

1. **框架**：5×5 cell × 5 cell 高（40×40×40m）
2. **1F row A (机身 y=4-14)**：从北墙内缩 4m，放 4 台 constructor（钢梁 BEAM1/BEAM2 在 col 中心 0.5/1.5，钢管 PIPE1/PIPE2 在 2.5/3.5），台间留 2m 间隙
3. **1F row B (机身 y=20-30)**：放 4 台 constructor（钢管 PIPE3/PIPE4/PIPE5 在 col 中心 0.5/1.5/2.5，钢梁 BEAM3 在 3.5）；row A/row B 之间 y=14-20 留 collect belt + 进料巷
4. **1F belt**：row A collect belt 在 row≈1.875（y≈15，机器 front 南侧空带）；row B collect belt 在 row≈4.125（y≈33）；钢梁、钢管各走独立轴，不混；末端汇到南侧 lift 列（col=3.5/4.0），不再用 col=4.5
5. **钢锭进料**：左墙 Wall Inlet (z=22m) → lift-bot 下到南侧地面 → **programmable splitter**
   - programmable splitter 按 beam:pipe 消耗比非等分分流（§2-9）：钢梁 manifold（喂 BEAM1/BEAM2/BEAM3 全部 3 台）+ 钢管 manifold（喂 PIPE1-PIPE5 全部 5 台），经北侧进料巷 manifold 接各机 in-0
6. **垂直汇总**：钢梁、钢管两条 collect belt 末端各 1 个 **programmable splitter**（按 B5 mainNode 与 B3 流量比 15:48 / 20:115 非等分，§2-9）分出 →B3 与 →B5 两路
7. **lift-top ×4**：南侧 lift 列上行（lift-1 钢梁→B3、lift-2 钢梁→B5、lift-3 钢管→B3、lift-4 钢管→B5），先水平转弯相汇到落点、再垂直爬升 z=2→35m，合到屋顶 2 个 merger（见「南侧 lift 列走线」表）
8. **屋顶 (35-40m)**：铺 6 条 Mk5 平行总线 B1-B6，按子 cell 间距 row=0.25/0.75/…（§2-8）+ 2 个 merger 注入 B3/B5；左右各嵌 Wall Mount (Inlet 左 / Outlet 右)，row 严格对齐邻图
9. **Power Switch ×3**：按上面"Power Switch 分网"表布置 Network A/B/C；T6 只合 A，B/C 全部 OFF
10. **Power Shard（T6 阶段）**：仅 BEAM1/BEAM2 各插 3 shard 调 210%，PIPE1/PIPE2/PIPE3 各插 3 shard 调 225%；**BEAM3/PIPE4/PIPE5 物理已就位但 shard 槽空着**

## Tier 7+ 启用流程（仅翻 Switch + 插 shard，不动结构 / 不动 belt）

| Tier | 操作 | 通电总数 |
|---|---|---:|
| T7 | 翻 Network B Switch ON → PIPE4 插 3 shard 调 225% | 6 (2 beam + 4 pipe) |
| T8 | 翻 Network C Switch ON → BEAM3/PIPE5 各插 3 shard | 8 (3 beam + 5 pipe) |
| T9 | **全 8 台超频调到「满载」= 钢梁 210% / 钢管 225%**（钢梁 3 × 31.5 = 94.5 / 钢管 5 × 45 = 225；**非 250%**）；钢锭进料 belt 容量按 T9 满载预留 | 8 |

## 验证

- [ ] **8 台 constructor 全部物理放置**（包括 T6 不通电的 BEAM3/PIPE4/PIPE5）
- [ ] 每排 4 台、从北墙内缩 ≥4m 留进料巷、台间 ~2m 净空（§2-1/2）
- [ ] Belt manifold + lift 接到全部 8 台 in-0（不只是 T6 通电的 5 台）
- [ ] 3 个 Power Switch 一次建好，Network A 合上，B/C 断开
- [ ] T6 仅 BEAM1/BEAM2/PIPE1/PIPE2/PIPE3 插了 3 shard；BEAM3/PIPE4/PIPE5 物理就位但 shard 槽空
- [ ] 钢锭进料分流、钢梁/钢管→B3/B5 分流均用 **programmable splitter**（非等分，§2-9）
- [ ] 总线 B3/B5 为 beam+pipe **混料总线**（设计本意）；下游 BP12-15 用 smart splitter 按物料分拣取料
- [ ] 总线 B3/B5 流量在 Mk5 容量内（B3 163 < 780 = 21% ✓ / B5 35 < 780 = 4% ✓）
- [ ] 4 条 lift 在 col=3.5/4.0 专用列，3.5×2m 包围盒互不重叠、不穿机身；跨层先转弯相后爬升相（§2-5）
- [ ] 左墙 Wall Inlet z=22m 与 BP4 右 Wall Outlet z=22m 对齐
- [ ] 屋顶 6 belt 直通，仅 B3/B5 两个 merger 注入
