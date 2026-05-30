# BP7 铜板 + 电线 + 线缆 (C3)

## 概要

- **集群**: C3 铜电链（紧贴 BP6c 之后）
- **规格**: Mk2 **3 实例**（BP7a/b/c，同一蓝图复制；T9 满载 46 constructor）
- **机器**: **46 constructor 一次物理建造到位**（铜板 + 电线 + 线缆 三种配方）
  - **BP7a**: 16 台（6 sheet + 7 wire + 3 cable）
  - **BP7b**: 16 台（6 sheet + 7 wire + 3 cable）
  - **BP7c**: 14 台（6 sheet + 6 wire + 2 cable）
  - **合计**: 18 sheet + 20 wire + 8 cable = **46**
- **激活时间线**（仅翻 Power Switch + 插 Power Shard，不动结构）:
  - T6 → 11 台通电（3 sheet + 6 wire + 2 cable，单实例 BP7a 局部启用）
  - T7 → 24 台通电（8 sheet + 12 wire + 4 cable，BP7a+b）
  - T8 → 36 台通电（14 sheet + 16 wire + 6 cable，BP7a+b+c）
  - T9 → 46 台通电（18 sheet + 20 wire + 8 cable，**全部满载**）
- **产能 T6**: 铜板 62.5 / 电线 403 / 线缆 101.5
- **产能 T9**: 铜板 ~500 / 电线 ~1450 / 线缆 ~545（按 T9 配比超频）

> **核心设计原则**：**46 台 constructor 在 T6 阶段就全部摆好 + belt/manifold/电网/Power Switch 全部接好**。后续升 Tier 时**不重新放机器、不重新拉 belt**——只需 (1) 翻对应 Power Switch (2) 插 Power Shard (3) 调超频百分比。

## 机器超频清单（T6，Plan C ≤250%）

| 配方 | 物理 | T6 通电 | 超频 | 单台产能 (/min) | Power Shard/通电台 |
|---|---:|---:|---:|---:|---:|
| copper-sheet (constructor) | 18 | **3** | 208.33% | 20.83 | 3 |
| wire (constructor) | 20 | **6** | 223.89% | 67.17 | 3 |
| cable (constructor) | 8 | **2** | 169.17% | 50.75 | 2 |
| **合计 (T6)** | 46 | **11** | — | 62.5 + 403 + 101.5 | 3×3 + 6×3 + 2×2 = **31** |

> 总产能验证: 3 × 20.83 = 62.5 铜板 ✓ | 6 × 67.17 = 403 电线 ✓ | 2 × 50.75 = 101.5 线缆 ✓<br>
> T6 时未通电的 35 台 constructor：物理建好、belt 接好、shard 槽**空着**、Power Switch **关**，完全不耗电不产出。<br>
> T9 满载 46 台，按各产物 T9 目标配比调超频与 shard，3 实例合计 shard 见各实例 Power Switch 分网表。

## 物料 I/O

| 方向 | 物料 | 流量 (T6) | 路径 |
|---|---|---|---|
| 输入 | 铜锭 | 326.5 | **集群内部** ← BP6 右 Wall Outlet (h≈4-6m) → BP7a 左 Wall Inlet (h≈4-6m) |
| 输入 | 电线 | 203（内部回流，铜板/电线先做出来再喂给线缆）| 蓝图内部 lift |
| 输出 | 铜板 → BP8 电路板（C3 内部）| 27.5 | 集群内部 → BP8 |
| 输出 | 铜板 → B6 (BP10 AI 限制器) | 25 | 屋顶 merger → B6 |
| 输出 | 铜板 → B5 终端 | 10 | 屋顶 merger → B5 |
| 输出 | 电线 → B3 (BP12 + BP11) | 170 | 屋顶 merger → B3 |
| 输出 | 电线 → B5 终端 | 30 | 屋顶 merger → B5 |
| 输出 | 线缆 → B4 (BP14 + BP15) | 71.5 | 屋顶 merger → B4 |
| 输出 | 线缆 → B5 终端 | 30 | 屋顶 merger → B5 |

**屋顶总线接入**: 注入 B3 (170)、B4 (71.5)、B5 (10+30+30=70)、B6 (25)

> **B3 容量预留（审查 §4 BP07）**：T9 满载电线注入 B3 ≈ 1400/min，**单条 Mk6 (1200) 也不够**。屋顶一次铺 **7 条 belt 槽位 = B1-B6 + B3b**（B3 拆成 B3a/B3b 双 Mk5，每槽 ~700/min ≈ 90% 满载）。T6 阶段电线仅 170/min，先全部走 B3a（22% < 780 ✓），B3b 物理槽位 T6 即建好、T9 翻 splitter 分流上线，**不重拉 belt**。

## 楼层占用（标准实例 BP7a / BP7b，16 台）

> **层高修订（审查 §4 BP07）**：原 48m / 6cell 整栋撑破 Mk2 蓝图 40m 高度上限，且屋顶 40-45m 与邻居蓝图 35-40m 屋顶错位会断总线。改为 **8m / 层**，屋顶下移到 35-40m，与全集群屋顶总线层对齐。constructor 高 8m（§1 数据卡），恰落在每层 8m 净空内不越层；其占地长 10m（俯视图南北深度方向 = 5 ASCII 行），机身从北墙内缩 4m 留北侧进料巷（北排机身平面 y=4-14m，中排 y=16-26m），收集 belt 走 y=14-16 真空隙（北排）/ y=26-28 机身南侧（中排），均在机身外不穿机身（详见各层俯视图）。

| 层 | 高度 | 内容 | 物理台数 | T6 通电（BP7a）|
|---|---|---|---:|---:|
| 1F | 0-8m | constructor 6 台（2 sheet + 3 wire + 1 cable）| 6 | **6** (2 sheet + 3 wire + 1 cable，全开) |
| 4m 地基 | 8-12m | 隔层（兼 1F 收集 belt + lift 巷）| — | — |
| 2F | 12-20m | constructor 6 台（2 sheet + 3 wire + 1 cable）| 6 | **5** (T6 启用 3 wire + 1 cable + 1 sheet Cu3；Cu4 暂关) |
| 4m 地基 | 20-24m | 隔层（兼 2F 收集 belt + lift 巷）| — | — |
| 3F | 24-32m | constructor 4 台（2 sheet + 1 wire + 1 cable）| 4 | **0** |
| 4m 地基 | 32-35m | 隔层（兼 3F 收集 belt + lift 巷）| — | — |
| 屋顶 | 35-40m | B1-B6 + B3b + 4 merger + 多 lift | — | — |

> BP7c 变体：1F 5 台 + 2F 5 台 + 3F 4 台 = 14 台（少一台 wire、一台 cable）。<br>
> **T6 阶段**：BP7a 1F 全 6 台 + 2F 部分 5 台共 11 台通电（Network A+B 局部），其余 BP7a 2F/3F + 全 BP7b/c 物理建好但 Switch **关**。所有 belt / lift / manifold / Power Switch 一次到位。<br>
> **总高 35-40m 屋顶层 ≤ Mk2 蓝图 40m 上限**；屋顶总线层与 BP6/BP8 等邻居蓝图统一在 35-40m，跨蓝图总线对齐不断线。

## 俯视图（按实际比例，每层独立）

**比例约定**（同 BP02）：
- 横向：**1 字符 = 1m**
- 纵向：**1 行 = 2m**（补偿 monospace 字符宽高比 1:2）
- 蓝图 40×40m → **40 字符宽 × 20 行高**
- 每 cell (8×8m) = 8 字符宽 × 4 行高

**图例**：
- `*` 后缀 = T6 通电；无 `*` = T7+ Power Switch 关（物理已建，不耗电不产出）
- `v` = front (south) 输出
- `8x10` = 8m 宽 × 10m 长

**机器实际尺寸** → ASCII 占位：

| 机器 | 实际 | ASCII 占位（W × H） |
|---|---|---|
| constructor | 8m × 10m | 8 字符 × 5 行 |

### 1F (0-8m): 6 constructor — BP7a T6 全部通电

> 6 台拆北排 4 + 中排 2。机身从北墙内缩 4m 留 **北侧进料巷 (y=0-4m)**；机身长 10m=**5 行 (y=4-14m)**。<br>
> **北排不顶到 x=40**：4 台占 x=4-36（西缘 x=0-4 留进料 riser 井、东缘 x=36-40 留产出竖向 belt 走廊，机身均不进东西缘）。<br>
> **collect belt 不穿机身（R14）**：北排 front 在 y=14；北排 collect belt 只走 **y=14-16m 真空隙**（北排 y4-14 与中排 y16-26 之间），绝不落进 y16-26 机身带。中排 front 在 y=26；中排 collect belt 走中排**南侧** y=26-28m（机身外）。<br>
> **lift riser 各占唯一 col（原则1）**：进料 riser col=0(井 x=0-4)、sheet 产出 riser 中心 x=30(井 x=28-32)、wire x=34(井 x=32-36)、cable x=38(井 x=36-40)，四井互不同列、全落在无机器的南侧服务带 (y≥28m)。<br>
> **北排 collect belt 下送 merger 的竖向段走 x>20**（中排机身 x≤20 以东，即在中排机身东侧空带内向南折下到 x30/x34/x38 产出 riser），**不穿中排机身**。<br>
> （横向为示意，机器/设备真实 x 坐标以正文坐标表为准）

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0  y0  │ ←─ 北侧进料巷：铜锭 splitter manifold (y=0-4m) ─→│
 2  y2  │ I ┌─split──split──split──split──┐                │
 4  y4  │ I │ Cu1*   │ Wi1*   │ Wi2*   │ Cb1*   │          │
 6  y6  │ I │ sheet  │ wire   │ wire   │ cable  │ 北排4台  │
 8  y8  │ I │ 8x10   │ 8x10   │ 8x10   │ 8x10   │ x=4-36   │
10  y10 │ I │        │        │        │        │ y=4-14   │
12  y12 │ I │   v    │   v    │   v    │   v    │          │
14  y14 │ I └───v────────v────────v────────v────┘  (front) │
        │ ═══ 北排 collect belt 带 y=14-16（真空隙，z错层）═│
16  y16 │ ┌────────┬────────┐  中排2台 x=4-20 y=16-26       │
18  y18 │ │ Cu2*   │ Wi3*   │  (back 进料从北侧 manifold)   │
20  y20 │ │ sheet  │ wire   │                               │
22  y22 │ │ 8x10   │ 8x10   │                               │
24  y24 │ │        │        │                               │
26  y26 │ └───v────────v────┘  (front, y=26)                │
        │ ═══ 中排 collect belt 带 y=26-28（机身外）════════ │
28  y28 │   [sheet mg] [wire mg] [cable mg]  ← 同层 merger   │
30  y30 │      o S       o W       o C    ← 3 产出 riser     │
32  y32 │     x30        x34        x38    (各唯一 col)      │
34  y34 │  进料 riser I：col=0 (x=0-4)，独立井               │
36  y36 │  S=sheet→屋顶B6  W=wire→B3a  C=cable→B4            │
38  y38 │  riser 包围盒各 4×4m，互不同列、不穿机身/不互叠     │
40  y40 └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- 机器框高严格 5 行 = 真实 10m（1 行=2m）；北排 y=4-14、中排 y=16-26，两带间留 y=14-16 真空隙
- Cu1-Cu2：copper-sheet constructor，T6 通电；Wi1-Wi3：wire 3 台，T6 通电；Cb1：cable 1 台，T6 通电
- **collect belt（R14）**：北排 3 产物 belt 全走 y=14-16 真空隙 → 不进中排 y16-26 机身；中排 2 产物 belt 走 y=26-28 机身南侧 → 也在机身外。两带均不落在任一机身矩形内
- **北排 collect 带 3 belt（sheet/wire/cable）2D 投影同处 y=14-16（仅 2m），实为 z 错层**：1F collect 基面 z≈10-11m，sheet belt z≈10.0m、wire belt z≈10.5m、cable belt z≈11.0m，竖直分层不互撞（原则6）。中排带同理 sheet/wire 两 belt z 错层
- **lift riser 各占唯一 col（原则1/2）**：进料 riser=col0(井 x0-4)；sheet 产出 riser 中心 x=30、wire x=34、cable x=38（井各 4m：28-32/32-36/36-40），四井 col 互不相同，全在 y≥28m 无机器服务带；riser 纯垂直，屋顶 splitter→riser 顶、riser 底→机器 back 的水平位移是独立 belt 段（转弯相，§2-5）
- 电线内部回流：1F wire 部分输出 → lift-bot → Cb1 in-0（同层短 belt，不占产出 riser 井）

### 2F (12-20m): 6 constructor — BP7a T6 启用 5 台（其余 Power Switch 关）

> 与 1F 同几何：北排 4（x=4-36, y=4-14）+ 中排 2（x=4-20, y=16-26），北侧进料巷 + collect belt 走 y=14-16 真空隙（北排）/ y=26-28 机身南侧（中排）。<br>
> **lift riser 各占唯一 col**：2F 的进料 riser 与 3 产出 riser 同 1F 列分配（col0 进料、x30 sheet、x34 wire、x38 cable），riser 纯垂直直通各层，与 1F/3F 同 col 同井（不同物料 riser 互不同列，跨层不撞机身）。

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0  y0  │ ←─ 北侧进料巷：铜锭 splitter manifold (y=0-4m) ─→│
 2  y2  │ I ┌─split──split──split──split──┐                │
 4  y4  │ I │ Cu3*   │ Wi4*   │ Wi5*   │ Cb2*   │          │
 6  y6  │ I │ sheet  │ wire   │ wire   │ cable  │ 北排4台  │
 8  y8  │ I │ 8x10   │ 8x10   │ 8x10   │ 8x10   │ x=4-36   │
10  y10 │ I │        │        │        │        │ y=4-14   │
12  y12 │ I │   v    │   v    │   v    │   v    │          │
14  y14 │ I └───v────────v────────v────────v────┘  (front) │
        │ ═══ 北排 collect belt 带 y=14-16（真空隙，z错层）═│
16  y16 │ ┌────────┬────────┐  中排2台 x=4-20 y=16-26       │
18  y18 │ │ Cu4    │ Wi6*   │  Cu4 T6 OFF（物理已建）       │
20  y20 │ │ sheet  │ wire   │                               │
22  y22 │ │ 8x10   │ 8x10   │                               │
24  y24 │ │        │        │                               │
26  y26 │ └──(v)───────v────┘  (front, y=26; Cu4标(v))      │
        │ ═══ 中排 collect belt 带 y=26-28（机身外）════════ │
28  y28 │   [sheet mg] [wire mg] [cable mg]  ← 同层 merger   │
30  y30 │      o S       o W       o C    ← 3 产出 riser     │
32  y32 │     x30        x34        x38    (各唯一 col)      │
34  y34 │  进料 riser I：col=0，从 1F manifold 上行          │
36  y36 │  BP7a T6 2F 启用 5 台 = 3 wire(Wi4-6)+1 cable(Cb2) │
38  y38 │    + 1 sheet(Cu3)；仅 Cu4 物理就位 Switch OFF      │
40  y40 └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- 机器框高严格 5 行 = 真实 10m；北排 y=4-14、中排 y=16-26，留 y=14-16 真空隙
- Cu3：copper-sheet **T6 通电**（2F 第 5 台，凑满 T6 = 1F 6 + 2F 5 = 11）；Cu4：copper-sheet **T6 关**（图中 `(v)` 表示物理已建但 Switch OFF；T7 翻 ON，Network B 满 6）
- Wi4-Wi6：wire 3 台，T6 通电；Cb2：cable 1 台，T6 通电
- **collect belt（R14）同 1F**：北排 3 产物 belt 走 y=14-16 真空隙、中排 2 产物 belt 走 y=26-28 南侧，均在机身外；北排 3 belt 与中排 2 belt 各为 z 错层投影（2F collect 基面 z≈22-23m，sheet z≈22.0m / wire z≈22.5m / cable z≈23.0m，原则6）
- **lift riser 各占唯一 col**：进料 col0 / sheet x30 / wire x34 / cable x38，与 1F/3F 同井直通，互不同列不撞机身
- 所有 belt + lift + manifold 一次接好到全部 6 台 in-0/front

### 3F (24-32m): 4 constructor — T6 全部 Power Switch 关

> 4 台单排（无中排），北侧进料巷 (y=0-4) + 机身 y=4-14（5 行=10m）+ 南侧 collect belt 走 y=14-16 真空隙（单排机身南侧，机身外）。<br>
> **北排不顶 x=40**：4 台占 x=4-36，东缘 x=36-40 留竖向 belt 走廊。<br>
> **lift riser 各占唯一 col**：进料 col0、sheet x30、wire x34、cable x38，与 1F/2F 同井直通屋顶，互不同列不撞机身。

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0  y0  │ ←─ 北侧进料巷：铜锭 splitter manifold (y=0-4m) ─→│
 2  y2  │ I ┌─split──split──split──split──┐                │
 4  y4  │ I │ Cu5    │ Cu6    │ Wi7    │ Cb3    │          │
 6  y6  │ I │ sheet  │ sheet  │ wire   │ cable  │ 单排4台  │
 8  y8  │ I │ 8x10   │ 8x10   │ 8x10   │ 8x10   │ x=4-36   │
10  y10 │ I │        │        │        │        │ y=4-14   │
12  y12 │ I │  (v)   │  (v)   │  (v)   │  (v)   │ T6 全OFF │
14  y14 │ I └──(v)──────(v)──────(v)──────(v)───┘  (front) │
        │ ═══ collect belt 带 y=14-16（单排机身南侧，z错层）│
16  y16 │  (此层无中排机器，y=16 以南全空)                   │
18  y18 │   [sheet mg] [wire mg] [cable mg]  ← 同层 merger   │
20  y20 │      o S       o W       o C    ← 3 产出 riser     │
22  y22 │     x30        x34        x38    (各唯一 col)      │
24  y24 │  进料 riser I：col=0，从 2F manifold 上行          │
26  y26 │  S=sheet→屋顶B6  W=wire→B3a  C=cable→B4            │
28  y28 │  T6: 4 台全 Switch OFF（不耗电不产出，标(v)）      │
30  y30 │  T8: Cu5/Wi7/Cb3 ON；T9: Cu6 ON（满 BP7a 16 台）   │
40  y40 └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- 机器框高严格 5 行 = 真实 10m（y=4-14）；单排无中排，y=16 以南为服务带
- Cu5-Cu6 / Wi7 / Cb3：4 台 constructor **物理建造完整**，T6 阶段 Power Switch **全关**（图中 `(v)` 表示物理已建但 Switch OFF）
- **collect belt（R14）**：3 产物 belt 走 y=14-16 真空隙（单排机身正南、机身外），互为 z 错层投影（3F collect 基面 z≈34-35m，sheet z≈34.0m / wire z≈34.5m / cable z≈35.0m，原则6），不进任一机身矩形
- **lift riser 各占唯一 col**：进料 col0 / sheet x30 / wire x34 / cable x38，与 1F/2F 同井直通屋顶，互不同列、不撞机身
- Belt manifold + lift 一次性接到所有 4 台 in-0 / front，与 1F+2F manifold 共用进料路径
- BP7a 单实例通电节奏（与通电矩阵 BP7a 行逐列一致）：T6 11 台（A6 + B5，2F 余 Cu4 关）→ T7 +Cu4（B 满，→12）→ T8 +Wi7+Cb3+Cu5+Cu6（3F C2+D2 全开，→16 全满）→ T9 不变（BP7a 已满 16）

### 屋顶 (35-40m): B1-B6 + B3b + 4 merger (B3 + B4 + B5 + B6)

> **7 条 belt 槽位**（B1-B6 + **B3b**，§2-8 子 cell 行距）：40m 内 7 条按 row≈0.4/0.9/1.4/1.9/2.4/2.9/3.4（实际行距 ~5m）排开，不是「7 个高度堆叠」。B3 电线 T9~1400 拆 **B3a + B3b** 双 Mk5。<br>
> **收集汇流（审查 §4 BP07）**：1F+2F+3F 每产物各 3 路 collect belt，原本 9 路全挤一井 → 改 **每产物先在所属楼层南侧服务带用 merger 同层合流成 1 路，再走该产物专用 riser 上送屋顶**（sheet riser x30 / wire riser x34 / cable riser x38，三井互不同列，原则1；各层 sheet/wire/cable 各 1 merger，3 层 = 3 路上送）。屋顶 merger 只汇 3 层 3 路 + 内部回流，3in1out 一级足够，预留 4×4m 脚印。

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │ o B1 ════════════════════════════════════════ o │
        │ o B2 ════════════════════════════════════════ o │
 6      │ o B3a ──[merger << wire 170 (T6); ≤700 (T9)]── o │
        │ o B3b ──[T9 拆流：splitter 分电线 >700 入此槽]─ o │
12      │ o B4 ───[merger << cable 71.5]──────────────── o │
        │ o B5 ───[merger << mainNode 70]─────────────── o │
18      │ o B6 ───[merger << copper-sheet 25]─────────── o │
        │                                                 │
24      │ 各产物 riser lift-out-top 落点（各唯一 col）：    │
        │   sheet riser x30 → B6mg; wire riser x34 →       │
28      │   B3a/B3b splitter; cable riser x38 → B4mg;      │
        │   mainNode 三合一 → B5mg（进料 riser col0 分列）  │
        │ B3 inject 170/min (wire→BP12+BP11), T9~1400 拆双│
32      │ B4 inject  71.5   (cable→BP14+BP15)             │
        │ B5 inject  70     (mainNode: sheet/wire/cable)  │
36      │ B6 inject  25     (sheet→BP10 AI limiter)       │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- 4 个 merger（B3=电线、B4=线缆、B5=mainNode 三合一、B6=铜板）+ B3 的 T9 拆流 splitter
- **7 条屋顶 belt 槽位**：B1/B2 过境总线 + B3a/B3b（电线）+ B4（线缆）+ B5（mainNode）+ B6（铜板）
- 各产物 1F+2F+3F 收集 → **各楼层 merger 同层合流 → 3 路 lift-out-top → 屋顶 merger 注入**
- T6 阶段电线仅 170 全走 B3a；T9 满载 ~1400 → splitter 把超 700 的部分分入 B3b（两槽各 ~700 ≈ 90% Mk5），B3b 物理槽位 T6 即建好不重拉
- T6 阶段流量低，merger/splitter 一次建好按 T9 满载流量预留容量

## Power Switch 分网（BP7a 标准实例，BP7b/c 同结构 OFF 启动）

把 BP7a 16 台 constructor 拆 4 个独立 Power Network，由 4 个 Power Switch 控制。**4 个 Switch 全部 T6 一次安装好**，只是 T6 阶段只合 Network A+B 局部。

| 网 | 范围 | 数量 | T6 状态 | 升级触发 |
|---|---|---:|---|---|
| Network A | 1F 全部（Cu1-2 / Wi1-3 / Cb1）| 6 | **ON**（6 台 T6 通电）| — |
| Network B | 2F 全部（Cu3-4 / Wi4-6 / Cb2）| 6 | **ON** 部分（5 台 T6 通电：Wi4-6 + Cb2 + 1 sheet Cu3）| 2F 余 1 sheet (Cu4) T7 翻 ON |
| Network C | 3F wire+cable（Wi7 / Cb3）| 2 | OFF | T8 翻 ON |
| Network D | 3F sheet（Cu5-6）| 2 | OFF | T8 翻 Cu5+Cu6 ON |

> Power Switch 物理位置建议放 3F 南侧服务带 riser 列旁（避开机身占地，y≥28m），4 个并排，方便玩家在场内一眼区分。<br>
> **BP7b**：与 BP7a 结构完全相同（16 台 4 个 Network），但 T6 阶段 **A/B/C/D 全 OFF**；T7 翻 A+B（12 台）、T8 翻 C+D（满 16 台）、T9 不变（已满）。<br>
> **BP7c**：14 台变体（少 1 wire + 1 cable，D 仅 0 台），4 个 Network 同布局；T6/T7 阶段全 OFF；T8 启用 A 局部（4 台）、T9 启用 A 余 + B + C（满 14 台）。

### 通电矩阵（3 实例 × 4 Network × Tier，统一口径）

> 每格 = 该 Tier 末该实例该 Network 通电台数（累计，逐 Tier 单调不减）。Network 与楼层一一对应：**A = 1F 全 6**、**B = 2F 全 6**、**C = 3F wire+cable 2**、**D = 3F sheet 2**（BP7a 满载 6+6+2+2 = 16；BP7b 同 = 16；BP7c 14 台变体满载 6+6+2+0，少 1 wire + 1 cable）。**逐 Tier 通电总数 = 该列各行直接求和**，无任何「微调」修正项——各列相加即得权威口径 T6 11 / T7 24 / T8 36 / T9 46。

| 实例 \ Tier | T6 | T7 | T8 | T9 (满载) |
|---|---:|---:|---:|---:|
| **BP7a** A (1F 6) | 6 | 6 | 6 | 6 |
| **BP7a** B (2F 6) | 5 | 6 | 6 | 6 |
| **BP7a** C (3F wire+cable 2) | 0 | 0 | 2 | 2 |
| **BP7a** D (3F sheet 2) | 0 | 0 | 2 | 2 |
| **BP7b** A/B/C/D (满载 16) | 0 | 12 | 16 | 16 |
| **BP7c** A/B/C/D (满载 14) | 0 | 0 | 4 | 14 |
| **逐 Tier 通电总数（列求和）** | **11** | **24** | **36** | **46** |

> 各列逐行相加直接等于权威总数，无脚注式微调：<br>
> - **T6 = 11**：BP7a A6 + B5（2F 启用 5 台：3 wire + 1 cable + 1 sheet）= 11。3F（C/D）+ BP7b/c 全 OFF。<br>
> - **T7 = 24**：BP7a A6 + B6（2F 余 1 sheet 补开）= 12；BP7b A6 + B6（=12，C/D 暂缓）= 12。合计 24（净增 13）。<br>
> - **T8 = 36**：BP7a 满 16（3F C2 + D2 全开）；BP7b 满 16；BP7c A4（1F 启用 4 台）= 4。合计 36（净增 12）。<br>
> - **T9 = 46**：BP7a 16 + BP7b 16 + BP7c 14（满载）= 46（净增 10）。<br>
> 矩阵口径与本文档 §概要「激活时间线」「Tier 7+ 启用流程」表三处一致：**T6 11 → T7 24 → T8 36 → T9 46**。

## 建造步骤（BP7a 标准实例，BP7b/c 完全复制结构）

1. **框架**：5×5 cell × 5 cell 高（40×40×40m，屋顶总线层落在 35-40m，**整栋 ≤ Mk2 蓝图 40m 上限**）
2. **1F (0-8m)**：放 6 台 constructor，北排 4 台（Cu1/Wi1/Wi2/Cb1，机身从北墙内缩 4m 留进料巷）+ 中排 2 台（Cu2/Wi3）
3. **1F belt**：北排 3 产物 belt 走 **y=14-16 真空隙**（z 错层，1F collect 基面 z≈10-11m：sheet z≈10.0m 收 Cu1、wire z≈10.5m 收 Wi1/Wi2、cable z≈11.0m 收 Cb1）；中排 2 产物 belt 走 **y=26-28 机身南侧**（sheet 收 Cu2、wire 收 Wi3）；各产物**同层 merger 合流成 1 路** → 该产物专用 riser（sheet x30 / wire x34 / cable x38）lift-out-top
4. **1F 地基**：y=8m 铺 4m 厚地基（8-12m，兼 1F 收集 belt + lift 巷）
5. **2F (12-20m)**：**同 1F 布局**放 6 台 constructor，北排 4 台（Cu3/Wi4/Wi5/Cb2）+ 中排 2 台（Cu4/Wi6）
6. **2F belt**：同 1F 几何——北排 3 belt 走 y=14-16 真空隙（z 错层）、中排 2 belt 走 y=26-28 南侧 → 各产物同层 merger 合流 → 该产物专用 riser（sheet x30 / wire x34 / cable x38）lift-out-top
7. **2F 地基**：y=20m 铺 4m 厚地基（20-24m）
8. **3F (24-32m)**：放 4 台 constructor 单排（Cu5/Cu6/Wi7/Cb3，机身内缩 4m 留进料巷）
9. **3F belt**：单排 4 台 front 在 y=14，collect belt 走 **y=14-16 真空隙**（机身南侧、z 错层）→ 同层 merger 合流 → 该产物专用 riser（sheet x30 / wire x34 / cable x38）lift-out-top
10. **3F 地基**：y=32m 铺 3m 厚地基（32-35m）
11. **垂直汇总**：1F+2F+3F 各产物先同层 merger 合流（避免 9 路挤同一井），**每产物一条专用 riser col 贯通三层**：sheet riser x=30、wire riser x=34、cable riser x=38（三井互不同列，原则1），3 层各产物经各自井上送 35m 屋顶；riser 纯垂直、屋顶 splitter→riser 顶与 riser 底→merger 的水平段是独立转弯相（原则2）。每井 4×4m 包围盒落在 y≥28 无机器服务带，互不重叠、不穿任何楼层机身
12. **铜锭进料**：左 Wall Inlet (col=0, **h≈4-6m**, row≈1.0) → lift-bot → 1F 北侧 splitter manifold 喂 **全部 16 台**（1F 直喂 + **进料 riser col=0 (x=0-4)** 上行喂 2F+3F）；进料 riser 占独立 col=0 井，与 3 条产出 riser(x30/x34/x38)分列，四井 col 全互不相同
13. **电线内部回流**：1F wire (Wi1-3) 部分输出 → lift-bot → 1F Cb1 in-0 + lift-up → 2F Cb2 / 3F Cb3 in-0
14. **集群内部出料**：铜板右 Wall Outlet (col=5, h≈4-6m, row≈1.0)、铜锭右 Wall Outlet (BP7a/b 转下游 BP7b/c)
15. **屋顶 (35-40m)**：铺 **7 条 Mk5 平行 belt（B1-B6 + B3b，§2-8 子 cell 行距 ~5m）** + 4 个 merger（B3/B4/B5/B6）+ B3 的 T9 拆流 splitter，左右各嵌 Wall Mount (Inlet 左 / Outlet 右)
16. **Power Switch ×4**：按下面"Power Switch 分网"表布置 Network A/B/C/D；T6 BP7a 只合 A + B 局部，BP7b/c 全部 OFF
17. **Power Shard（T6 阶段）**：仅 BP7a **11 台** T6 通电机各插 shard，**逐台枚举**（含 2F 的 Cu3）：
    - **sheet ×3**（各 3 shard）：Cu1、Cu2（1F）、**Cu3（2F）**
    - **wire ×6**（各 3 shard）：Wi1、Wi2、Wi3（1F）、Wi4、Wi5、Wi6（2F）
    - **cable ×2**（各 2 shard）：Cb1（1F）、Cb2（2F）
    - 小计 shard = 3×3 + 6×3 + 2×2 = 9 + 18 + 4 = **31**（与 §机器超频清单一致）
    - **其余 35 台物理已就位但 shard 槽空着**（含 2F Cu4 + 全 3F 4 台 + BP7b 16 台 + BP7c 14 台）

## Tier 7+ 启用流程（仅翻 Switch + 插 shard，不动结构 / 不动 belt）

| Tier | 操作 | 通电总数 | 实例 |
|---|---|---:|---:|
| T7 | BP7a 补开 Cu4（Network B 满 6 → BP7a 12 台）；BP7b 翻 Network A+B（12 台）。净增 13 | 24 | 2 |
| T8 | BP7a 翻 Network C+D（3F 4 台 → BP7a 满 16）；BP7b 翻 C+D（满 16）；BP7c 翻 Network A 局部（4 台）。净增 12 | 36 | 3 |
| T9 | 全部 4 个 Network × 3 实例 ON → 46 台超频调到 T9 配比；矿场来料 belt 已 Mk5（电线物料 T9 ~1400 需拆 B3a/B3b）| **46** | 3 |

> 各 Tier 具体通电台数与超频百分比按蓝图 spec 给出的配比（T6 11 / T7 24 / T8 36 / T9 46）分摊到 BP7a/b/c 各实例的 Network 上。

## 多实例侧墙续接

BP7 是**纯同向流**集群（铜锭从 BP6→BP7a→BP7b→BP7c→BP8）。详见设计文档 [§多实例集群侧墙 mount 对偶规则](../2026-05-24-tier7-blueprint-design.md#多实例集群侧墙-mount-对偶规则关键设计约定)。

蓝图侧墙集群内 mount（机器层）：

| 高度 | 物料 | 左 Wall | 右 Wall |
|---|---|---|---|
| h≈4-6m row≈1.0 | 铜锭 | **Inlet** | **Outlet**（剩余给下游 BP7b/c）|
| h≈4-6m row≈1.25 | 铜板 | — | **Outlet**（仅 BP7c 用，给 BP8）|

> BP7c 右 Outlet 铜板接 BP8（C3 末端）；BP7a/b 右 Outlet 铜板悬空（这些实例的铜板内部消耗 + 屋顶 B6 走，不出右墙）。<br>
> 电线内部回流（自给线缆配方）**仅在同蓝图内部 lift**，不跨实例。<br>
> **关键**：BP7b/c 即便 T6 全 OFF，侧墙 Inlet/Outlet 也必须一次开洞 + belt 接通，避免 T7/T8 升级时再破墙。

## 集群内部短 belt

- BP7 → BP8 铜板 27.5：右 Wall Outlet (col=5, h≈4-6m, row≈1.0) → BP8 左 Wall Inlet (h≈4-6m, row≈1.0)
- 仅 BP7c 实例参与（BP7a/b 铜板进集群内 BP7c 合流后再去 BP8）；或每个实例独立出口（BP8 左侧 3 个 Wall Inlet）

## 验证

- [ ] **整栋 ≤ 40m**：1F 0-8 / 2F 12-20 / 3F 24-32 / 屋顶 35-40m，**不撑破 Mk2 蓝图 40m 上限**；屋顶 35-40m 与邻居蓝图屋顶总线层对齐
- [ ] 机器框高严格 5 行=10m（北排 y=4-14、中排 y=16-26）；北排 4 台占 x=4-36 **不顶到 x=40**（东缘 x=36-40 留竖向 belt 走廊）
- [ ] **所有机器矩形在 40×40 内、同层无 AABB 重叠**：每层北排 4×(8×10) 占 x=4-36/y=4-14 互相只边接不叠；中排 2×(8×10) 占 x=4-20/y=16-26；北排 y4-14 与中排 y16-26 间留 y14-16 真空隙（不接触不重叠）
- [ ] **collect belt 不穿机身（R14）**：北排 collect 只走 y=14-16 真空隙、中排 collect 只走 y=26-28 机身南侧，**无 belt 落在 y16-26 机身带**；3F 单排 collect 走 y14-16 机身南侧
- [ ] **各 lift riser 占互不相同的 col 且不穿其它楼层机身（原则1）**：进料 riser col=0(x0-4)、sheet x30、wire x34、cable x38，四井 col 全不同、各 4×4m 包围盒落在 y≥28 无机器服务带，跨 1F/2F/3F 同 col 直通竖井不与任一楼层机身(x4-36,y4-26)重叠
- [ ] **46 台 constructor 全部物理放置**（包括 T6 不通电的 35 台）
- [ ] 三种产物 row belt 独立（铜板/电线/线缆）并接到全部 46 台 in-0/front（不只是 T6 通电的 11 台）
- [ ] 9 路 collect belt **先各楼层 merger 同层合流成 3 路再上送**，每产物走各自专用 riser 井（x30/x34/x38），不全挤同一井
- [ ] **多 belt 投影交叠处已注明 z 错层**：北排 3 belt（y14-16, 2m 内）与中排 2 belt（y26-28）2D 重叠实为竖直分层，**各楼层各自基面高度**（1F z≈10-11m / 2F z≈22-23m / 3F z≈34-35m，各层内 sheet/wire/cable 仍错开 ~0.5m），已按原则6 在图注标明
- [ ] 3 实例 × 4 = 12 个 Power Switch 一次建好；T6 仅 BP7a Network A + B 局部合上，其余全断
- [ ] T6 仅 11 台插了 shard；其余 35 台物理就位但 shard 槽空
- [ ] 通电矩阵口径一致：T6 11 → T7 24 → T8 36 → T9 46（概要/Power Switch 矩阵/Tier 7+ 三处统一）
- [ ] 4 个屋顶 merger filter 正确（B3=电线、B4=线缆、B5=mainNode 三种合、B6=铜板）
- [ ] 电线内部回流 belt 不与外部进出料混淆
- [ ] 铜锭左墙 Inlet 降到 **h≈4-6m**（不再 h=24m 先降后升往返）
- [ ] 屋顶预留 **7 条 belt 槽位（B1-B6 + B3b）**；B3 流量 T9 ≈ 1400 即使 Mk6 (1200) 也不够，**必须拆为 B3a + B3b 双 Mk5 槽位**（每槽 ~700 = 90%）。当前 T7 阶段 170 < 780 = 22% ✓
- [ ] 3 实例间侧墙 Inlet/Outlet 一次开洞接通，避免 T7/T8 破墙
- [ ] 矿场来料 belt 已 Mk5；T8/T9 满载需按物料拆分槽位（电线即使 Mk6 也不够，必拆 B3a/B3b，T6 即预建 B3b 物理槽位）
