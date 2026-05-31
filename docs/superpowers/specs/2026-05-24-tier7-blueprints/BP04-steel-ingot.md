# BP4 钢锭 (C2)

## 概要

- **集群**: C2 钢系（C1 之后第 4 个蓝图）
- **规格**: Mk2 单实例
- **机器**: **6 foundry 一次物理建造到位**（foundry 8×9×9m，2 输入在 back、1 输出在 front；steel-ingot 配方：3 铁矿石 + 3 煤 → 3 钢锭/min）
- **激活时间线**（仅翻 Power Switch + 插 Power Shard，不动结构）:
  - T6 → 5 台通电
  - T7 → 5 台通电（不变）
  - T8 → 6 台通电
  - T9 → 6 台通电（满载 239%，645/min ÷ 6 ÷ 45/min 基础 ≈ 238.6%，取整 239%）
- **产能**: T6 455 /min 钢锭

> **核心设计原则**：6 台 foundry T6 阶段就全部摆好 + belt/manifold/电网/Power Switch 全部接好。后续升 Tier 只翻 Switch + 插 shard，不动结构、不重新拉 belt。

## 机器超频清单（T6，Plan C ≤250%）

| 配方 | 物理 | T6 通电 | 超频 | 单台产能 (/min) | Power Shard/通电台 |
|---|---:|---:|---:|---:|---:|
| steel-ingot (foundry) | 6 | **5** | 202.0% | 91.0 | 3 |
| **合计 (T6)** | 6 | 5 | — | 5 × 91.0 = **455** | 5 × 3 = **15** |

> T6 未通电的 1 台 foundry：物理建好、belt 接好、shard 槽空着、Power Switch 关。<br>
> T9 满载 6 台 @ 239%（645/min ÷ 6 ÷ 45/min 基础 ≈ 238.6%，取整 239%）= 645/min 钢锭，每台 3 shard = **18 shard 总**。645 < 780 Mk5 上限 ✓。

## 物料 I/O

> steel-ingot 配方为 **1:1:1**（铁矿石 : 煤 : 钢锭），故输入流量 = 输出流量。

| 方向 | 物料 | 流量 (T6 / T9) | 路径 |
|---|---|---|---|
| 输入 | 铁矿石 | **455 / 645** | **矿场直喂** → 左 Wall Inlet (z=4m) → 铁矿 manifold |
| 输入 | 煤 | **455 / 645** | **煤矿场直喂** → 左 Wall Inlet (z=6m, 第二口) → 煤 manifold |
| 输出 | 钢锭 → BP5 | 455 / 645 | 集群内部 → 右 Wall Outlet (z=22m) → BP5 左 Wall Inlet |

> 单条 Mk5 belt 上限 780/min；T9 满载 645 < 780，铁矿/煤/钢锭三料各 1 条 Mk5 即可，无需拆条。

**屋顶总线接入**: 无（C2 集群内部短 belt 直连，不上 B1-B6）

## 楼层占用

| 层 | 高度 | 内容 | 物理 | T6 通电 |
|---|---|---|---:|---:|
| 1F | 0-9m | foundry row 0 (3 台 F1-F3) | 3 | **3** |
| 4m 地基 | 9-13m | 隔层 | — | — |
| 2F | 13-22m | foundry row 0 (3 台 F4-F6) | 3 | **2** |
| 屋顶 | 35-40m | B1-B6 直通 | — | — |

> **T6 阶段**：1F 全 3 台通电（Network A），2F F4/F5 通电（Network B），F6 Power Switch 关（Network C 待 T8 启用）。所有 belt / lift / manifold / Power Switch 一次到位。

## 俯视图

> **比例**：横向 1 字符 = 1m（0-40m），纵向 1 行 = 2m。foundry 真实 8m 宽 × 9m 长 ≈ 8 字符宽 × 4.5 行高。**(横向为示意，机器/设备真实 x 坐标以正文坐标表为准)**
>
> **§2 公约要点**：foundry 双输入在 back（北侧），故机器从北墙内缩 4m 留**北侧进料巷**；输出 front 在南侧，**收集 belt 走机身南侧之外**。
>
> **图例**：`*` = T6 通电；无 `*` = 已建未通电；`^` = back 输入 (north)；`v` = front 输出 (south)；`[S]` = splitter (4×4m)；`#L` = 输出 lift 落点。

### 1F (0-9m): 3 foundry — T6 全部通电

```
        0    4    8    12   16   20   24   28   32   36   40m  (x)
 y=0    ┌─────────────────────────────────────────────────────┐
        │ 北侧进料巷(y0-4): 铁矿 splitter @z=4m / 煤 @z=6m    │
 2      │ [Sa] [Sd][Sb] [Se][Sc] [Sf]  (x错开,见下)           │
        │  │i   │c  │i    │c  │i   │c    i=铁矿in-0/c=煤in-1  │
 4      │ ┌┴───┐   ┌┴───┐    ┌┴───┐                           │
        │ │ F1*│   │ F2*│    │ F3*│   3 台 foundry (8×9m)     │
 6      │ │stl │   │stl │    │stl │   北缘 y=4m, T6 全通电    │
        │ │8×9 │   │8×9 │    │8×9 │   (Network A)             │
 8      │ │^^  │   │^^  │    │^^  │   台间 4m 净空(x12-16/    │
        │ │    │   │    │    │    │    x24-28)                │
10      │ │ v  │   │ v  │    │ v  │                           │
        │ │ v  │   │ v  │    │ v  │                           │
12      │ └─┬──┘   └─┬──┘    └─┬──┘   南缘 y=13m=front 出口   │
        │   │        │         │     R16 垂直引出段 2m        │
14      │ ══╧════════╧═════════╧═══════════════ collect ──→   │
        │   steel-ingot collect belt z=2m (row≈1.875cell)     │
16      │                                          ┌─┐#L1     │
        │   #L1 = 1F 输出 lift riser 落点 (x=37,y=15)└─┘      │
18      │        纯 riser 2×2m (x=36-38, y=14-16, col≈4.625)  │
        │        z=2m → z=22m (爬升 20m)；水平转弯段单列见下  │
40      └─────────────────────────────────────────────────────┘
```

- F1-F3：3 foundry（steel-ingot），8m 宽 × 9m 长，T6 全通电。col 落点 x=4/16/28（机宽 8m → F1 占 x4-12、F2 占 x16-24、F3 占 x28-36；台间 4m 净空 x12-16 / x24-28，build-step 间隙）。机器北缘 y=4m（从北墙内缩 4m），南缘 y=13m，front 出口在 y=13m。
- **北侧进料巷 (y=0-4)**：两组 splitter 沿 **x 交错**、各 4×4m，**全部紧贴北墙钉在进料巷顶端**——splitter 北缘 y=0m（**row=0**），南缘 y=4m（row=0.5），即占 **row=0–0.5cell**：
  - 铁矿 splitter `[Sa][Sb][Sc]` 落 **x=4 / 16 / 28**（占 x4-8 / 16-20 / 28-32，y0-4 / **row 0–0.5**），各下行接对应 foundry 的 **in-0**（铁矿，back offset 2m，foundry 中心 x6/18/30 — 注：splitter out 端口 + R16 折弯落到 x6/18/30）。
  - 煤 splitter `[Sd][Se][Sf]` 落 **x=8 / 20 / 32**（占 x8-12 / 20-24 / 32-36，y0-4 / **row 0–0.5**），各下行接对应 foundry 的 **in-1**（煤，back offset 6m，落到 x10/22/34）。
  - 两组 splitter 同处 **row 0–0.5**（北缘 row=0 贴北墙）、沿 x 邻接但不交叠（Sa x4-8 ↔ Sd x8-12 边缘相接，AABB 不重叠）；铁矿 manifold belt z=4m、煤 manifold belt z=6m 分属不同 z 高度（原则6），2D 投影仅示意。
- **收集 belt 走南侧（3 路 → 2 merger 串接）**：3 台 foundry front 出口 (y=13m) 经 2m 垂直引出段（R16）下接到 y=15m（row≈1.875cell，机身南缘 y=13m 之外、净距 2m）的 z=2m 横向 Mk5 collect belt。3 路汇成 1 路需 **2 个 merger 串接**（每个 merger 仅 2-into-1，避免 3-input 分配不均）：
  - **M1a**（F1+F2 合流）@ **(x=14, y=16)**，占 x12-16 / y16-20（row≈2cell），落在 F1/F2 台间净空 x12-16 正南、机身 y=13m 之外的空区；F1 出口(x6)、F2 出口(x18) 各 R16 折弯入 M1a 的 in-1/in-2，out-0 向右接 collect belt。
  - **M1b**（M1a 输出 + F3 合流）@ **(x=26, y=16)**，占 x24-28 / y16-20（row≈2cell），落在 F2/F3 台间净空 x24-28 正南空区；M1a out(x14) 沿 z=2m collect belt 走到 x24 入 in-1，F3 出口(x30) R16 折弯入 in-2，out-0 向右汇到 #L1。
  - 两 merger footprint（x12-16 / x24-28）沿 x 相隔 8m 不重叠，且均在机身南缘 y=13m 以南，collect belt 在 y=15m 全程不穿任何 foundry 机身。
- 双输入：in-0 = 铁矿石 (back, offset 2m)，in-1 = 煤 (back, offset 6m)。

### 2F (13-22m): 3 foundry — F4/F5 通电 + F6 Switch 关

```
        0    4    8    12   16   20   24   28   32   36   40m  (x)
 y=0    ┌─────────────────────────────────────────────────────┐
        │ 北侧进料巷(y0-4): 铁矿lift-up@z=17m / 煤@z=19m      │
 2      │ [Sg] [Sj][Sh] [Sk][Si] [Sl]  (x错开,接全3台)        │
        │  │i   │c  │i    │c  │i   │c    F6 OFF 也接好        │
 4      │ ┌┴───┐   ┌┴───┐    ┌┴───┐                           │
        │ │ F4*│   │ F5*│    │ F6 │   3 台 foundry (8×9m)     │
 6      │ │stl │   │stl │    │stl │   F4/F5 T6 通电 (Net B)   │
        │ │8×9 │   │8×9 │    │8×9 │   F6 T6 Switch OFF (Net C)│
 8      │ │^^  │   │^^  │    │^^  │     → T8 翻 ON            │
        │ │    │   │    │    │    │   台间 4m 净空(x12-16/    │
10      │ │ v  │   │ v  │    │ v  │    x24-28)                │
        │ │ v  │   │ v  │    │ v  │                           │
12      │ └─┬──┘   └─┬──┘    └─┬──┘   南缘 y=13m=front 出口   │
        │   │        │         │     R16 垂直引出段 2m        │
14      │ ══╧════════╧═════════╧═══════════════ collect ──→   │
        │   steel-ingot collect belt z=15m (row≈1.875cell)    │
16      │                                      ┌─┐#L2         │
        │   #L2 = 2F 输出 lift riser 落点(x=33,y=15)└─┘       │
18      │        纯 riser 2×2m (x=32-34, y=14-16, col≈4.125)  │
        │        z=15m → z=22m (爬升 7m)；水平转弯段单列见下  │
40      └─────────────────────────────────────────────────────┘
```

- F4-F6：3 foundry 物理建造完整；T6 阶段 F4/F5 通电、F6 Power Switch 关。布局与 1F 同（col 落点 x=4/16/28，机宽 8m，台间 4m 净空 x12-16 / x24-28；北侧进料巷 + 南侧收集 belt）。
- 2F 北侧进料巷 splitter 同样沿 **x 交错**、各 4×4m，**同样紧贴北墙钉在进料巷顶端**（北缘 y=0m / **row=0**，占 **row 0–0.5cell**）：
  - 铁矿 `[Sg][Sh][Si]` 落 **x=4 / 16 / 28**（→ in-0），煤 `[Sj][Sk][Sl]` 落 **x=8 / 20 / 32**（→ in-1）；均占 **row 0–0.5**；2F splitter ID 与 1F 不同（Sa-Sf vs Sg-Sl），分属不同楼层投影不冲突。
  - 铁矿 manifold belt z=17m、煤 manifold belt z=19m（2F 楼面 13m 之上），分属不同 z 高度（原则6）。
  - belt manifold + lift 一次接到所有 3 台 in-0/in-1/front（F6 即使 OFF 也接好）。
- 2F 收集 belt 在 z=15m，3 路 (F4+F5+F6) 同样经 **2 个 merger 串接**汇成 1 路（与 1F 同布局，x 坐标相同、z=15m）：**M2a**（F4+F5）@ **(x=14, y=16)**，占 x12-16 / y16-20；**M2b**（M2a+F6）@ **(x=26, y=16)**，占 x24-28 / y16-20；两 merger 在机身南缘 y=13m 以南空区，与 1F 的 M1a/M1b 分属不同楼层 z（z=15m vs z=2m）投影不冲突。汇出后经 #L2 升至 z=22m，再与 1F 输出（#L1 升至 z=22m）合流进右 Wall Outlet。

### 输出 lift 走线（分相，§2-5）

> 1F 收集 belt 在 z=2m，需升到右墙 z=22m（跨 20m）。belt **不能同时转弯+爬升**，故分两相：

| 相 | 高度 | 操作 | 落点/路径 |
|---|---|---|---|
| 转弯相 | z=2m | 1F collect belt 水平向右走到 #L1 列 | 沿 row≈1.875cell (y=15m) 到 x=37 |
| 爬升相 | z=2m → z=22m | #L1 垂直 lift 爬升 20m（< lift 上限 48m ✓） | 落点 (x=37, y=15)，纯 riser 2×2m (x=36-38, y=14-16, col≈4.625, row≈1.75)。水平转弯段已单列于上一行 |
| 转弯相 | z=15m | 2F collect belt 水平向右走到 #L2 列 | 沿 row≈1.875cell (y=15m) 到 x=33 |
| 爬升相 | z=15m → z=22m | #L2 垂直 lift 爬升 7m | 落点 (x=33, y=15)，纯 riser 2×2m (x=32-34, y=14-16, col≈4.125, row≈1.75)。水平转弯段已单列于上一行 |
| 汇合 | z=22m | 1F (#L1 顶, x=37) + 2F (#L2 顶, x=33) 两路在 z=22m 经 merger 合流 | merger (4×4m) @ (x=35, y=18) |
| 出墙 | z=22m | merger 出口 → 右 Wall Outlet | (col=5, z=22m, row≈2) → BP5 左 Wall Inlet |

- **两条 lift riser 占互不相同的 col（原则1）**：#L1 纯 riser 2×2m 占 x=36-38（col≈4.625），#L2 纯 riser 2×2m 占 x=32-34（col≈4.125），两 riser 在 x 上相隔 2m（x=34↔36）不重叠，故跨楼层升降时不在任何 z 区间 3D 重叠。水平转弯相 belt 段（z=2m / 15m 上走到 x=37 / x=33）与 riser 分开标坐标。
- lift 只做纯垂直（原则2）：collect belt 在 z=2m / 15m 上的水平位移（走到 x=37 / x=33）是独立的转弯相 belt 段，与各自 riser 分开标坐标；riser 两端共享同一 (col,row)。
- 两条 riser 列 x=32-38 在两层均为空区，**不穿任何 foundry 机身**（机身止于 x=36 的 F3/F6 右缘 → #L1 riser x=36-38 全在机身右；且两 lift 落点 y=15m / row≈1.875cell 在机身南缘 y=13m / row≈1.625cell 之外，整段 riser 沿 y 都不与机身 AABB 交叠）。
- z=22m 的 merger (x=35, y=18, 占 x33-37 / y16-20) 在两层 foundry 机身南缘 (y=13m) 之外，且 z=22m 已高于 2F 机身顶 (z=22m 楼面)，不与任何机身碰撞。

### 屋顶 (35-40m): B1-B6 直通

```
        0    4    8    12   16   20   24   28   32   36   40m  (x)
 y=0    ┌───────────────────────────────────────────────────┐
        │ o B1 ─────────────────────────────────────────o  │  row=0.25
 2      │ o B2 ─────────────────────────────────────────o  │  row=0.75
        │ o B3 ─────────────────────────────────────────o  │  row=1.25
 4      │ o B4 ─────────────────────────────────────────o  │  row=1.75
        │ o B5 ─────────────────────────────────────────o  │  row=2.25
 6      │ o B6 ─────────────────────────────────────────o  │  row=2.75
        │                                                   │
 8      │ B1-B6 全部 pass-through，无 splitter/merger       │
        │ 6 条 belt 子 cell 间距 ~4m 排开 (§2-8)            │
12      │ (BP4 不取/不注总线，钢锭走集群内短 belt 给 BP5)   │
40      └───────────────────────────────────────────────────┘
```

## Power Switch 分网

| 网 | 范围 | 数量 | T6 状态 | 升级触发 |
|---|---|---:|---|---|
| Network A | 1F F1-F3 | 3 | **ON** | — |
| Network B | 2F F4-F5 | 2 | **ON** | — |
| Network C | 2F F6 | 1 | OFF | T8 翻 ON |

> 3 个 Switch T6 一次安装好；T6 合 A+B，C 留待 T8。Switch 装在进料巷/lift 列空区，不撞机身。

## 建造步骤

1. **框架**：5×5 cell × 5 cell 高（40×40×40m）
2. **1F (0-9m)**: 3 台 foundry F1-F3 一字排，机器北缘 y=4m（**从北墙内缩 4m 留进料巷**），col 落点 x=4/16/28（机宽 8m，台间留 4m 净空）
3. **1F 北侧进料巷 (y=0-4)** — 两组 splitter 沿 **x 交错**，各 4×4m 在 x 上不重叠（原则4）:
   - 铁矿石 belt：左 Wall Inlet (z=4m) → 铁矿 manifold belt @z=4m → splitter `[Sa][Sb][Sc]` 落 **x=4/16/28**（占 x4-8/16-20/28-32）→ 各下行 R16 折弯接对应 foundry **in-0**（落到 x6/18/30）
   - 煤 belt：左 Wall Inlet (z=6m) → 煤 manifold belt @z=6m → splitter `[Sd][Se][Sf]` 落 **x=8/20/32**（占 x8-12/20-24/32-36）→ 各下行接对应 foundry **in-1**（落到 x10/22/34）
   - 铁矿/煤两条 manifold belt 处于不同 z 高度（z=4m / z=6m，原则6），splitter footprint 沿 x 邻接不交叠（AABB 不重叠）
   - manifold 接全部 6 台（含 2F lift-up 分支），F6 OFF 也接好
4. **1F 收集 belt（南侧）**: foundry front 出口 (y=13m) → 2m 垂直引出段 → y=15m / row≈1.875cell 的 z=2m 横向 Mk5 collect belt（机身南缘 y=13m 之外、净距 2m，不穿机身）
5. **1F 地基**: y=9m 铺 4m 厚地基（隔层 9-13m）
6. **2F (13-22m)**: **同 1F 布局**放 3 台 foundry F4-F6（北缘 y=4m，col=x=4/16/28，台间 4m 净空 x12-16/x24-28）；北侧进料巷 splitter 同样沿 x 交错：铁矿 `[Sg][Sh][Si]` 落 x=4/16/28（→in-0，manifold @z=17m），煤 `[Sj][Sk][Sl]` 落 x=8/20/32（→in-1，manifold @z=19m）
7. **2F belt**: z=15m 横向 Mk5 收集 belt + #L2 输出 lift（riser 占 x=31.5-35，与 #L1 不同 col）
8. **垂直汇总（分相，原则2）**: 1F collect (z=2m) 水平到 x=37 → #L1 riser 纯垂直爬升 20m 到 z=22m；2F collect (z=15m) 水平到 x=33 → #L2 riser 纯垂直爬升 7m 到 z=22m；两 riser 占互不相同 col（#L1 x=35.5-39 / #L2 x=31.5-35），两路在 z=22m 经 merger (x=35,y=18) 合流
9. **右 Wall Outlet** (col=5, z=22m, row≈2)：钢锭出口
10. **左 Wall Inlet** (col=0): 两条进料 belt 分属不同 z（铁矿 z=4m；煤 z=6m）
11. **屋顶 (35-40m)**: 6 belt 直通，子 cell 间距 row=0.25/0.75/…/2.75（~4m 一条）
12. **Power Switch ×3**：Network A/B/C 一次装好（装进料巷/lift 列空区）；T6 合 A+B，C 断开
13. **Power Shard（T6）**：F1-F5 各插 3 shard 调 202%；F6 槽空着

## Tier 7+ 启用流程（仅翻 Switch + 插 shard，不动结构）

| Tier | 操作 | 通电总数 |
|---|---|---:|
| T7 | 无变化 | 5 |
| T8 | 翻 Network C Switch ON → F6 插 3 shard | 6 |
| T9 | 6 台全部超频调到 239%（645/min ÷ 6 ÷ 45/min ≈ 238.6%，取整 239%）；矿场来料 belt 已升 Mk5（645/min < 780 ✓） | 6 |

## 验证

- [ ] **6 台 foundry 全部物理放置**（包括 T6 不通电的 F6），机器北缘 y=4m（北侧留 ≥4m 进料巷），col=x=4/16/28（机宽 8m → 占 x4-12/16-24/28-36，台间 4m 净空 x12-16/x24-28，同层无 AABB 重叠）
- [ ] 双进料 splitter 沿 **x 交错不重叠** + **紧贴北墙钉在进料巷顶端（北缘 row=0，占 row 0–0.5cell）**：铁矿 `[Sa][Sb][Sc]` @x=4/16/28 (→in-0) + 煤 `[Sd][Se][Sf]` @x=8/20/32 (→in-1)，各 4×4m 沿 x 邻接不交叠（Sa x4-8 ↔ Sd x8-12 边缘相接）；接全部 6 台 in-0+in-1；铁矿 manifold z=4m / 煤 manifold z=6m 分属不同 z（原则6）
- [ ] 收集端 **3 路 foundry 输出 → 2 merger 串接**：1F M1a@(x=14,y=16) + M1b@(x=26,y=16)；2F M2a@(x=14,y=16) + M2b@(x=26,y=16)；各 4×4m 占 x12-16 / x24-28（y16-20，机身南缘 y=13m 以南空区），同层沿 x 相隔 8m 不重叠，跨层分属 z=2m / z=15m
- [ ] 收集 belt 走机身南侧之外（z=2m / 15m，y=15m / row≈1.875cell，距 front 出口 y=13m 净 2m），全程在所有机身南缘 y=13m 以南，不穿 foundry 机身（R14）
- [ ] 输出 lift 分相 + **两 riser 占互不相同 col（原则1）**：#L1 纯 riser 2×2m x=36-38 (col≈4.625, z=2m→22m, 落点 x=37,y=15)、#L2 纯 riser 2×2m x=32-34 (col≈4.125, z=15m→22m, 落点 x=33,y=15)；两 riser 在 x 上相隔 2m (x=34↔36) 不重叠、不穿任何 foundry 机身（落点 y=15m 在机身南缘 y=13m 之外）；水平转弯相 belt 段单列、与 riser 分开标坐标
- [ ] 3 个 Power Switch 一次建好，Network A/B 合上，C 断开
- [ ] T6 仅 F1-F5 插了 3 shard；F6 物理就位但 shard 槽空
- [ ] 钢锭出口与 BP5 左 Wall Inlet 同 z=22m row≈2 对齐
- [ ] 屋顶 6 belt 直通无 splitter（子 cell 间距 row=0.25-2.75）
- [ ] 矿场来料 belt 已升 Mk5（铁矿 T9 645 / 煤 645 < 780 ✓）
- [ ] I/O 平衡：1:1:1 配方，输入铁矿 = 输入煤 = 输出钢锭（T6 455 / T9 645）
