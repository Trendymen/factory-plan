# BP3 螺丝双线 (C1)

## 概要

- **集群**: C1 铁系（紧贴 BP2b 之后，C1 末端）
- **规格**: Mk2 单实例
- **机器**: **19 constructor 一次物理建造到位**（screw 配方）
- **激活时间线**（仅翻 Power Switch + 插 Power Shard，不动结构）:
  - T6 → 9 台通电（其余 10 台 Power Switch 关）
  - T7 → 12 台通电
  - T8 → 16 台通电
  - T9 → 19 台通电（满载 240.56%）
- **产能**: T6 866 / T9 ~1828 /min 螺丝（全程统一超频 **240.56%**，单台 96.22/min）

> **核心设计原则**：**19 台 constructor 在 T6 阶段就全部摆好 + belt/manifold/电网/Power Switch 全部接好**。后续升 Tier 时**不重新放机器、不重新拉 belt**——只需 (1) 翻对应 Power Switch (2) 插 Power Shard (3) 调超频百分比。
>
> **belt 容量原则（关键）**：T6 总产 866/min 已超单条 Mk5 上限（780/min），因此 28m 节点**绝不把全部 866 合成一条 belt 再分**。从 T6 起就按 3 个去向（276 反向 / 350 B1 / 240 B2）**分 3 条独立 Mk5 belt 并联**，每条都 < 780。T9 满载 1828/min 时三条分别 ≈583 / 739 / 507/min，仍各 < 780——**三条 Mk5 在 T6 一次建好即可覆盖到 T9，无需重拉 belt**。

## 机器超频清单（T6，Plan C ≤250%）

| 配方 | 物理 | T6 通电 | 超频 | 单台产能 (/min) | Power Shard/通电台 |
|---|---:|---:|---:|---:|---:|
| screw (constructor) | 19 | **9** | 240.56% | 96.22 | 3 |
| **合计 (T6)** | 19 | 9 | — | 9 × 96.22 = **866** | 9 × 3 = **27** |

> T6 时未通电的 10 台 constructor：物理建好、belt 接好、shard 槽**空着**、Power Switch **关**，完全不耗电不产出。<br>
> T9 满载 19 台 @ **240.56%** = ~1828/min，每台 3 shard = **57 shard 总**。<br>
> 超频口径全程统一 **240.56%**（= 96.22/min ÷ 40/min 基础速率），不再出现 241% 写法。

## 物料 I/O

| 方向 | 物料 | 流量 (T6) | 路径 |
|---|---|---|---|
| 输入 | 铁棒 | 216.5/min | **集群内部** ← BP2b 右 Wall Outlet (z=6m, row=2.5) → BP3 **左 Wall Inlet** (z=6m, row=2.5) |
| 输出 | 螺丝 → BP2 RIP（C1 内部，**反向流**）| 276 | BP3 **左 Wall Outlet** (z=28m, row=3) → BP2b 右 Wall Inlet (z=28m, row=3) → BP2b 内部反向 belt → BP2a RIP（独立 Mk5 belt #R，<780） |
| 输出 | 螺丝 → B1 (BP12 转子) | 350 | 屋顶 merger → B1（独立 Mk5 belt #1，<780） |
| 输出 | 螺丝 → B2 (BP14 HMF) | 240 | 屋顶 merger → B2（独立 Mk5 belt #2，<780） |

**屋顶总线接入**: 注入 B1 (+350) + B2 (+240)

> ⚠ **belt 容量**：三条去向流量 276 / 350 / 240 各自 < 780，**全程各走一条独立 Mk5**，从不在 28m 之前合成单条 866 belt。B2 总线本身在此节点之后累计约 400.5/min（240 螺丝 + 上游其它料），仍 < 780（见 §验证）。

> ⚠ **关键**：螺丝回流到 BP2 RIP 是**反向路由**——BP3 是 C1 集群最右端，给左边 BP2 的 belt 必须从 **左 Wall Outlet** 出（向左流）。出口在 z=28m 是为了对齐 BP2 蓝图的 3F (24-32m) RIP 螺丝输入。BP2 蓝图自带"右 Inlet 28m → 左 Outlet 28m"反向直通 belt，让螺丝跨 BP2b 到 BP2a。

## 楼层占用

| 层 | 高度 | 内容 | 物理台数 | T6 通电 |
|---|---|---|---:|---:|
| 1F | 0-10m | screw constructor 3 排（rA C1-C4 / rB C5-C7 / rC C8-C10） | 10 | **5** |
| 4m 地基 | 10-14m | 隔层 | — | — |
| 2F | 14-24m | screw constructor 3 排（rA C11-C13 / rB C14-C16 / rC C17-C19） | 9 | **4** |
| 4m 地基 | 24-28m | 隔层 | — | — |
| 屋顶 | 35-40m | B1-B6 + 2 merger + 2 lift-top（350→B1 / 240→B2 上送；276 反向在 28m 出墙不上屋顶） | — | — |

> **每排 ≤4 台（§2-2）**：constructor 真实 8×10m，每排 4 台占 32m，余 8m 分到台间/侧墙做 belt 折线净空（约 1.6m/缝），不一字排满 40m。每排 y 深 10m（§2-3 真实长度），**北墙内缩 4m 留东西向进料巷**（§2-1）；每排 front 南缘外留 2m 收集 belt 带。3 排×10m + 进料巷 4m + 3 条 collect 带 3×2m = 40m 满铺零越界（这是单层 40m 容 3 排 ×10m 机器的紧排上限）。
>
> **T6 阶段**：1F rA C1-C4 + rB C5（共 5 台）通电（Network A），2F rA C11-C13 + rB C14（共 4 台）通电（Network B），其余 10 台 Power Switch **关**（Network C/D/E 待 T7+ 渐次启用）。所有 belt / lift / manifold / Power Switch 一次到位。

## 俯视图（按实际比例，每层独立）

**比例约定**（§2-3）：1 字符 = 1m 横向；1 行 = 2m 纵向；蓝图 40×40m = 40 字符 × 20 行。constructor 真实 **8×10×8m**，框宽 8 字符、框高 = 10m÷2 = **5 行**。

> **(横向为示意，机器/设备真实 x 坐标以正文坐标表为准)** — ASCII 框的横向字符位置仅示意排布顺序，col 主轴 / lift 列等精确 x 值见正文 §俯视图说明与坐标表。

**图例**：
- `*` 后缀 = T6 通电；无 `*` = T7+ Power Switch 关（物理已建，不耗电不产出）
- `^` = back / in-0（北，朝进料巷）；`v` = front (south) 输出
- 框宽×框高 = `8×10`（8m 宽 × 10m 长）
- `==` = 收集 belt（机器 front 边以外，南侧空带，§2-4）；`L` = lift 落点（col=4.5 专用列）

### 1F (0-10m): 10 screw constructor — 3 排 ×4 max（§2-2），T6 通电 5 台

> 北墙内缩 4m 为东西向**进料巷**（铁棒 manifold，§2-1）。3 排：rA C1-C4（4 台）/ rB C5-C7（3 台）/ rC C8-C10（3 台）。每排 4 台占 32m，台间/侧墙留 ~1.6m belt 净空，不满宽。lift 集中在 **col=4.5 专用列**（避开机身）。
>
> **排布对齐（消除 rA 右缘与 lift 列软冲突）**：满排的 rA（4 台 ×8m = 32m）**统一靠左对齐**（机身 x 跨度落在 col=0–4 主轴内、右缘止于 x≈34），右侧让出 **x=36（col=4.5）专用列**给 lift 纵向走线。如此 rA 右缘与 lift 列之间始终保有间隙，lift 包围盒不与任何机身投影重叠（§2-5 / R14）。

```
   俯视图（纵轴 = 南北深度 y，米；横轴 = 东西 x，米）。1F 安装高度 z=0-10m。
   1 行 = 2m；constructor 真实 8×10m → 框宽 8 字符、机身上下边距 5 行（10m）。
   y 分配：进料巷 0-4 / rA 4-14 / #1A 14-16 / rB 16-26 / #1B 26-28 / rC 28-38 / #1C 38-40。
   `^` 标在机身北边线（back 端口，进料由北侧 manifold 沿机器列间隙竖直滴入）。
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 y0     │ ←─── 铁棒进料巷 manifold（来自左 Wall Inlet z=6m, row=2.5）──→  │
 2      │                                                     │
 4      │ ┌─^────┐┌─^────┐┌─^────┐┌─^────┐                    │
 6      │ │ C1*  ││ C2*  ││ C3*  ││ C4*  │  rA: 4 台          │
 8      │ │screw ││screw ││screw ││screw │  全 T6 通电        │
10      │ │ 8×10 ││ 8×10 ││ 8×10 ││ 8×10 │  (Network A)     L │
12      │ │  v   ││  v   ││  v   ││  v   │                    │
14      │ └──────┘└──────┘└──────┘└──────┘                    │
        │ ==== collect belt #1A (rA front 外 y14, screw) ===== │
16      │ ┌─^────┐┌─^────┐┌─^────┐                            │
18      │ │ C5*  ││ C6   ││ C7   │  rB: 3 台                  │
20      │ │screw ││screw ││screw │  (C5 ON / C6,C7 OFF)      L │
22      │ │ 8×10 ││ 8×10 ││ 8×10 │                            │
24      │ │  v   ││  v   ││  v   │                            │
26      │ └──────┘└──────┘└──────┘                            │
        │ ==== collect belt #1B (rB front 外 y26, screw) ===== │
28      │ ┌─^────┐┌─^────┐┌─^────┐                            │
30      │ │ C8   ││ C9   ││ C10  │  rC: 3 台                  │
32      │ │screw ││screw ││screw │  (T6 OFF)                 L │
34      │ │ 8×10 ││ 8×10 ││ 8×10 │                            │
36      │ │  v   ││  v   ││  v   │                            │
38      │ └──────┘└──────┘└──────┘                            │
40      │ ==== collect belt #1C (rC front 外 y38, screw) ===== │
        └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
        3 条 collect (#1A/#1B/#1C 各在所属排 front 南缘外) → 各自 programmable
        splitter 按 276/350/240 分入 3 条独立 Mk5 → col=4.5 lift 列上送 z=28m
```

> ⚠ **绘图说明**：1F 的 3 排 constructor 全在**同一 z=0-10m 安装高度层**内，沿南北(y)深度方向（y0-4 进料巷 / 4-14 rA / 14-16 #1A / 16-26 rB / 26-28 #1B / 28-38 rC / 38-40 #1C）排开，**非竖直叠层**。每排 constructor 真实 10m 长（ASCII 框上下边线相距 5 行 = 10m），back(`^`)在机身北边线、接进料巷沿机器列间隙竖直滴下的 splitter 支管，front(`v`)朝南落到该排 collect belt（画在机身南缘 y14/y26/y38 **之外**，不进机身投影，§2-4 / R14）。3 排各 10m + 进料巷 4m + 3 条 collect 带各 2m = 40m 满铺、零越界（这是 3 排 ×10m 在单层 40m 的紧排上限，再多一排须加一层）。

- rA C1-C4：T6 **全部通电**（Network A，仅 C1-C4=4 台属 A，C5 见 rB）
- rB C5-C7：C5 T6 通电（Network A 第 5 台），C6/C7 T6 OFF（Network C/D）
- rC C8-C10：T6 OFF（Network D/E）
- 进料：左 Wall Inlet (z=6m, row=2.5) → 北侧进料巷 manifold → splitter 支管下喂 1F 全 10 台 in-0(back) + 续接 lift-up 给 2F 9 台
- 出料：每排 front → 该排 collect belt（#1A/#1B/#1C，机身南侧外）→ **各自的 programmable splitter** 按 276/350/240 比例分入 3 条独立 Mk5 → col=4.5 lift 列上送 z=28m

### 2F (14-24m): 9 screw constructor — 3 排 ×3，T6 通电 4 台

> 与 1F 同构：北墙内缩 4m 进料巷，3 排（rA C11-C13 / rB C14-C16 / rC C17-C19），lift 集中 col=4.5。进料由 1F manifold lift-up（z=6→16m）续接，与 1F 共用同一进料路径。

```
   俯视图（纵轴 = 南北深度 y，米；横轴 = 东西 x，米）。2F 安装高度 z=14-24m。
   1 行 = 2m；constructor 真实 8×10m → 框宽 8 字符、机身上下边距 5 行（10m）。
   y 分配同 1F：进料巷 0-4 / rA 4-14 / #3A 14-16 / rB 16-26 / #3B 26-28 / rC 28-38 / #3C 38-40。
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 y0     │ ←─── 铁棒进料巷 manifold（lift-up 自 1F，z=6→16m）──→     │
 2      │                                                     │
 4      │ ┌─^────┐┌─^────┐┌─^────┐                            │
 6      │ │ C11* ││ C12* ││ C13* │  rA: 3 台                  │
 8      │ │screw ││screw ││screw │  全 T6 通电                │
10      │ │ 8×10 ││ 8×10 ││ 8×10 │  (Network B)             L │
12      │ │  v   ││  v   ││  v   │                            │
14      │ └──────┘└──────┘└──────┘                            │
        │ ==== collect belt #3A (rA front 外 y14, screw) ===== │
16      │ ┌─^────┐┌─^────┐┌─^────┐                            │
18      │ │ C14* ││ C15  ││ C16  │  rB: 3 台                  │
20      │ │screw ││screw ││screw │  (C14 ON/C15,C16 OFF)    L │
22      │ │ 8×10 ││ 8×10 ││ 8×10 │                            │
24      │ │  v   ││  v   ││  v   │                            │
26      │ └──────┘└──────┘└──────┘                            │
        │ ==== collect belt #3B (rB front 外 y26, screw) ===== │
28      │ ┌─^────┐┌─^────┐┌─^────┐                            │
30      │ │ C17  ││ C18  ││ C19  │  rC: 3 台                  │
32      │ │screw ││screw ││screw │  (T6 OFF)                 L │
34      │ │ 8×10 ││ 8×10 ││ 8×10 │                            │
36      │ │  v   ││  v   ││  v   │                            │
38      │ └──────┘└──────┘└──────┘                            │
40      │ ==== collect belt #3C (rC front 外 y38, screw) ===== │
        └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
        3 条 collect (#3A/#3B/#3C 各在所属排 front 南缘外) → 汇 col=4.5 lift 列，
        与 1F 三流在 z=28m 节点同侧分配 → lift 上送 z=28m，再上屋顶。
```

- rA C11-C13：3 台 T6 **通电**（Network B）
- rB C14-C16：C14 T6 通电（Network B 第 4 台），C15/C16 T6 OFF（Network C）
- rC C17-C19：T6 OFF（Network D/E）
- Belt manifold + lift 一次性接到所有 9 台 in-0 / front，与 1F manifold 共用同一进料路径
- 通电节奏：T7 开 C6+C15+C16 → 12；T8 再开 C7+C8+C17+C18 → 16；T9 再开 C9+C10+C19 → 19

### 屋顶 (35-40m): B1 + B2 mergers

> 屋顶 6 条 Mk5 平行 belt 用**子 cell 行距**（§2-8）：B1 row=0.5 / B2 row=1.5 / B3 row=2.5 / B4 row=3.5 / B5 row=4.5 / B6 row≈5.0（实际行距 ~6.4m），不是「6 个高度堆叠」。本图只动 B1/B2（注螺丝）。
>
> 螺丝**两条** lift-top（350 / 240）从 col=4.5 lift 列升到 35m；第三条（276 反向）**不上屋顶**，在 28m 直接出左 Wall Outlet。lift 跨层走线分相：先在 28m 平面**水平转弯相**对到 col=4.5，再**垂直爬升相**直上 35m（§2-5），两相各留独立净空。

```
   俯视图（纵轴 = 南北深度 y，米；横轴 = 东西 x，米）。屋顶 z=35-40m。
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 y1     │ o B1 ══════════[merger ◄═ 350 螺丝]════════════ o │
 3      │ o B2 ══════════[merger ◄═ 240 螺丝]════════════ o │
 5      │ o B3 ══════════════════════════════════════════ o │
 7      │ o B4 ══════════════════════════════════════════ o │
 9      │ o B5 ══════════════════════════════════════════ o │
11      │ o B6 ══════════════════════════════════════════ o │
        │                                          ↑↑      │
24      │                          col=4.5 lift 列：2 条   │
28      │  B1 ← 350 螺丝 (merger)   螺丝 lift-top 落点     L │
32      │  B2 ← 240 螺丝 (merger)   (350 / 240)            L │
36      │  螺丝非 mainNode → 不占 B5；276 反向不上屋顶      │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- 屋顶 2 个 merger 各注 B1 (+350) + B2 (+240)，T6 一次建好
- 1F+2F screw 输出 → 每排 collect belt 的 **programmable splitter** 按 276/350/240 直接分 3 流（**不先合 866 再分**）
- 350 + 240 两条各走独立 Mk5 lift 上屋顶（col=4.5 列，先转后爬分相）；276 在 28m 出左 Wall Outlet

## Power Switch 分网

把 19 台 constructor 拆 5 个独立 Power Network，由 5 个 Power Switch 控制。**5 个 Switch 全部 T6 一次安装好**，T6 阶段只合 Network A + B。

| 网 | 范围 | 数量 | T6 状态 | 升级触发 |
|---|---|---:|---|---|
| Network A | 1F C1-C5（rA 全 4 台 + rB 首台 C5） | 5 | **ON** | — |
| Network B | 2F C11-C14（rA 全 3 台 + rB 首台 C14） | 4 | **ON** | — |
| Network C | 1F C6 + 2F C15-C16 | 3 | OFF | T7 翻 ON（+3 = 12） |
| Network D | 1F C7-C8 + 2F C17-C18 | 4 | OFF | T8 翻 ON（+4 = 16） |
| Network E | 1F C9-C10 + 2F C19 | 3 | OFF | T9 翻 ON（+3 = 19 满载） |

> Power Switch 物理位置建议放 2F col=4.5（lift/manifold 操作列空档），5 个并排，方便玩家在场内一眼区分。

## 建造步骤

1. **框架**：5×5 cell × 5 cell 高（40×40×40m）
2. **1F (z=0-10m)**：放 10 台 screw constructor，**北墙内缩 4m 留进料巷**，3 排 ×4 max（§2-2）；每排机身真实 10m 长（§2-3）：rA C1-C4（y4-14）/ rB C5-C7（y16-26）/ rC C8-C10（y28-38），每排 4 台占 32m、台间/侧墙留 ~1.6m belt 净空（不满宽）
3. **1F collect belt**：每排 front(南)边外铺一条收集 belt（#1A y14 / #1B y26 / #1C y38，均在所属机身南缘 **之外**，不进机身投影 §2-4 / R14），各自接一个 programmable splitter（见步 8）
4. **1F 地基**：z=10m 铺 4m 厚地基覆盖整层
5. **2F (14-24m)**：放 9 台 screw constructor，同构 3 排 ×3：rA C11-C13 / rB C14-C16 / rC C17-C19；同样北墙内缩 4m 留进料巷
6. **2F collect belt**：每排 front 外铺 #3A/#3B/#3C，接 programmable splitter
7. **2F 地基**：z=24m 铺 4m 厚地基
8. **三流分配（关键 — T6 一次建好 3 条独立 Mk5，绝不先合 866 再分）**：
    - 每排 collect belt 末端放一个 **programmable splitter**（§2-9，非等分 276/350/240），把该排螺丝按统一比例分进三条主线 #R（276 反向）/ #1（350 B1）/ #2（240 B2）
    - 三条主线沿 col=4.5 lift 列纵向汇集，各为独立 Mk5：T6 三流分别 276/350/240，T9 满载分别 ≈583/739/507，**全程各 < 780**
    - 普通 splitter 仅用于同一主线内的均分；非 1:1 比例一律 programmable
9. **铁棒进料**：**左 Wall Inlet (z=6m, row=2.5)** ← BP2b 右 Wall Outlet → 北侧进料巷 manifold（splitter 支管）喂 **全部 19 台** in-0(back)（1F 直喂 10 台 + lift-up z=6→16m 喂 2F 9 台）
10. **垂直汇总 + 分相（§2-5）**：col=4.5 为 lift 专用列（避开机身投影）。三条主线在 28m 平面**先水平转弯相**对到 col=4.5，再**垂直爬升相**：
    - #R（276）：28m 平面直接横向出**左 Wall Outlet (col=0, z=28m, row=3)** → 反向给 BP2b → BP2a 3F RIP（不上屋顶）
    - #1（350）/ #2（240）：各自 lift-top 从 z=28m 爬到屋顶 z=35m（垂直跨度 7m ≥ 4m）；两条 lift 落点在 col=4.5 列内沿 row 错开、3.5×2m 包围盒不重叠
11. **屋顶 (35-40m)**：铺 6 条 Mk5 平行 belt（子 cell 行距，B1 row=0.5 … B6 row≈5.0，§2-8），左右各嵌 Wall Mount
    - #1（350）→ merger 注 B1（350 < 780 ✓）
    - #2（240）→ merger 注 B2（B2 累计 ~400.5 < 780 ✓）
    - 螺丝非 mainNode，不占 B5
12. **Power Switch ×5**：按上面"Power Switch 分网"表布置 Network A/B/C/D/E；T6 只合 A+B，C/D/E 全部 OFF
13. **Power Shard（T6 阶段）**：仅 Network A（C1-C5）+ Network B（C11-C14）共 9 台各插 3 shard，超频到 **240.56%**；**其余 10 台物理已就位但 shard 槽空着**

## Tier 7+ 启用流程（仅翻 Switch + 插 shard，不动结构 / 不动 belt）

| Tier | 操作 | 通电总数 |
|---|---|---:|
| T7 | 翻 Network C Switch ON → C6 + C15 + C16 各插 3 shard 调超频 | 12 |
| T8 | 翻 Network D Switch ON → C7 + C8 + C17 + C18 各插 3 shard | 16 |
| T9 | 翻 Network E Switch ON → C9 + C10 + C19 各插 3 shard，**全 19 台超频调到 240.56%**；产能 ~1828/min。**无需重拉 belt**——T6 已建好的 3 条独立 Mk5（#R/#1/#2）按比例承接 T9 三流 ≈583/739/507，各仍 < 780。仅需确认进料铁棒 belt 容量（T9 ~457/min，Mk5 内）| 19 |

## 同轴对齐关键

- **BP3 左 Wall Outlet (z=28m, row=3, 螺丝反向)** 与 BP2b 右 Wall Inlet (z=28m, row=3) 高度+row 完全镜像对齐 → Auto Connect 自动续接
- BP3 左 Wall Inlet (z=6m, row=2.5, 铁棒) 与 BP2b 右 Wall Outlet (z=6m, row=2.5) 镜像对齐
- BP3 右侧（接 BP4）只有屋顶 6 belt mount + 6m 高度铁棒/24m 高度铁锭 mount 作为继承（这两个 mount 接 BP4 时悬空，BP4 不会取）

## 验证

- [ ] **19 台 constructor 全部物理放置**（包括 T6 不通电的 10 台 C6-C10 + C15-C19）
- [ ] Belt manifold + lift 接到全部 19 台 in-0（不只是 T6 通电的 9 台）
- [ ] 5 个 Power Switch 一次建好，Network A+B 合上，C/D/E 断开
- [ ] T6 仅 C1-C5 + C11-C14 插了 3 shard；其余 10 台物理就位但 shard 槽空
- [ ] 螺丝 276 反向接到 BP2b 3F RIP（避免飞面）
- [ ] **3 条独立 Mk5（#R 276 / #1 350 / #2 240）从 T6 一次建好**，绝不在 28m 前合成单条 866 belt
- [ ] programmable splitter 比例配置正确（276 / 350 / 240），T9 三流 ≈583/739/507 各 < 780（无需重拉 belt）
- [ ] col=4.5 lift 列「先水平转弯相 → 再垂直爬升相」分两段，两条 lift-top（350/240）3.5×2m 包围盒不重叠、不穿机身（§2-5）
- [ ] 屋顶 2 merger 一次建好，B1/B2 流量在 Mk5 容量内（B1 350 < 780 ✓；B2 累计 240+上游 = 400.5 < 780 ✓）
- [ ] 全程超频统一 **240.56%**（无 241% 写法）
- [ ] 铁棒来料 belt 已 Mk5（780/min）；T9 ~457/min 在 Mk5 容量内（59%）
