# BP8 电路板 (C3)

## 概要

- **集群**: C3 铜电链（紧贴 BP7c 之后，C3 末端）
- **规格**: Mk2 单实例
- **机器**: **8 assembler 一次物理建造到位**（circuit-board 配方：**2 铜片 (Copper Sheet) + 4 塑料 → 1 电路板，基准 7.5/min**）
- **激活时间线**（仅翻 Power Switch + 插 Power Shard，不动结构）:
  - T6 → 1 台通电（其余 7 台 Power Switch 关）
  - T7 → 4 台通电
  - T8 → 6 台通电
  - T9 → 8 台通电（满载 219%）
- **产能**: T6 13.75 / T9 131.4 /min 电路板

> **核心设计原则**：**8 台 assembler 在 T6 阶段就全部摆好 + belt/manifold/电网/Power Switch 全部接好**。后续升 Tier 时**不重新放机器、不重新拉 belt**——只需 (1) 翻对应 Power Switch (2) 插 Power Shard (3) 调超频百分比。

## 极简示意图

```floorstack
# BP08 电路板 (C3) · Mk2 40×40m · 自下而上
1F | assembler×3（电路板） | 铜片 27.5·塑料 55 | 电路板 → BP14/BP15 | ↑屋顶:电路板
2F | assembler×3（电路板） | 铜片·塑料 | 电路板 → BP14/BP15 | ↑屋顶:电路板
3F | assembler×2（电路板） | 铜片·塑料 | 电路板 → BP14/BP15 | ↑屋顶:电路板
屋顶 | 总线取塑料注电路板 | 塑料 525.6 | 电路板 131.4/min |
```

> 三层各放 3/3/2 台 assembler；铜片走集群内短 belt 进各层、塑料从屋顶下行喂各层；电路板各层上行汇入屋顶总线，先取塑料后注电路板防误取。

## 机器超频清单（T6，Plan C ≤250%）

| 配方 | 物理 | T6 通电 | 超频 | 单台产能 (/min) | Power Shard/通电台 |
|---|---:|---:|---:|---:|---:|
| circuit-board (assembler) | 8 | **1** | 183.33% | 13.75 | 2 |
| **合计 (T6)** | 8 | 1 | — | 1 × 13.75 = **13.75** | 1 × 2 = **2** |

> 配方校正：电路板 = **2 铜片 + 4 塑料 → 1 电路板**，基准产出 **7.5/min**（旧文档「4 铜板 + 8 塑料 → 4 电路板」为笔误：物料是铜片非铜板，比例 2:4:1，基准 7.5/min）。<br>
> 单台 @183.33% = 7.5 × 1.8333 = **13.75/min**，需铜片 27.5、塑料 55（与 I/O 表 T6 列一致）。<br>
> T6 时未通电的 7 台 assembler：物理建好、belt 接好、shard 槽**空着**、Power Switch **关**，完全不耗电不产出。<br>
> T9 满载 8 台 @219% = 单台 16.425 × 8 = **131.4/min**，每台 3 shard = **24 shard 总**。

## 物料 I/O

| 方向 | 物料 | 流量 (T6/T9) | 路径 |
|---|---|---|---|
| 输入 | 铜片 | 27.5 / **262.8** | **集群内部** ← BP7 右 Wall Outlet (z=24m) → BP8 左 Wall Inlet |
| 输入 | 塑料 | 55 / **525.6** | **屋顶 B4** ← C4 BP9 |
| 输出 | 电路板 → BP14 电脑 | 10 / **96** | 屋顶 B4 (集群外) |
| 输出 | 电路板 → BP15 HSC | 3.75 / **35.4** | 屋顶 B4 (集群外) |

> 注：电路板**不是 mainNode**（无 B5 终端注入），全部内部消费。T9 总产出 131.4 = BP14(96) + BP15(35.4)。<br>
> 进出料校验：铜片 262.8、塑料 525.6 均 < 单条 Mk5 780/min（铜片 34%、塑料 67%），单 belt 足够。

**屋顶总线接入**: 取自 B4 (塑料 T9 525.6) + 注入 B4 (电路板 T9 131.4)

## 楼层占用

> 8 台 assembler 不再每排 4 台满宽 40m（旧布局零间隙、与「留 manifold 列」互斥，违反 §2-2）。改为**每层 3 台**留出机间折线净空 + lift 专用列，8 台分 **3 层**（3 + 3 + 2）。

| 层 | 高度 | 内容 | 物理台数 | T6 通电 |
|---|---|---|---:|---:|
| 1F | 0-8m | assembler A1-A3（10×15m，每排 3 台留净空） | 3 | **1** |
| 4m 地基 | 8-12m | 隔层 | — | — |
| 2F | 12-20m | assembler A4-A6 | 3 | **0** |
| 4m 地基 | 20-24m | 隔层 | — | — |
| 3F | 24-32m | assembler A7-A8 | 2 | **0** |
| 3m 地基 | 32-35m | 隔层 | — | — |
| 屋顶 | 35-40m | B1-B6 + smart splitter + merger + lift 列 | — | — |

> **T6 阶段**：1F 仅 A1 通电（Power Network A），1F 其余 2 台 + 2F/3F 全部 Power Switch **关**（Network B/C/D 待 T7+ 渐次启用）。所有 belt / lift / manifold / Power Switch 一次到位。

## 俯视图（按实际比例，每层独立）

**比例约定**（§2-3）：横向 1 字符 = 1m；纵向 1 行 = 2m；蓝图 40×40m = 40 字符 × 20 行。assembler 长 15m → 约 7.5 行（画 8 行框，绝不画短）。

> 注：以下俯视图横向为示意，机器/设备真实 x 坐标以正文坐标表为准（assembler 西起 x=0/13/26，lift 包围盒 x=36.25-39.75）。

**布局公约**（§2）：
- 机器 back（2 输入口，朝北）从北墙内缩 **4m**（rows 0-2 留东西向「进料 manifold 巷」）。
- 每层 3 台，机间留 ~3m 折线净空，机器西起 x=0/13/26（各 10m 宽），东侧 col x=36-40 留 lift + manifold 竖井。
- collect belt 走机器 **front（南）边之外**（机身 y=4-19，belt 画在 y=20 / row=10，不穿机身）。
- lift 集中 x=37 专用列，包围盒四角钉死 **x=36.25-39.75（宽 3.5m）× y=2-4（深 2m）**（避免 x=37 中心导致与 A3 东缘 x=36 或东墙 x=40 越界的歧义）；跨层「先水平转弯相 → 再垂直爬升相」分两段。
- 三条竖井 lift 全部 **Mk5**：进料塑料 525.6、进料铜片 262.8、出料电路板 131.4，均 < Mk5 780/min（分别 67% / 34% / 17%），单 Mk5 lift 足够。

**图例**：
- `*` 后缀 = T6 通电；无 `*` = T7+ Power Switch 关（物理已建，不耗电不产出）
- `v` = front (south) 输出口（assembler @x+4.5）
- `^` = back (north) 2 输入口（assembler @x+2.5 / x+6.5）
- `10x15` = 10m 宽 × 15m 长

### 1F (0-8m): 3 assembler — T6 仅 A1 通电

```
        0    5    10   15   20   25   30   35   40m
        ┌──────────────────────────────────────────┐
 0      │ ^  ^      ^  ^      ^  ^         进料巷  │  y0-4 铜片+塑料 manifold
 2      │ ^  ^      ^  ^      ^  ^      ┌──────┐   │  (北墙内缩 4m)
        │┌────────┐┌────────┐┌────────┐│ lift │    │
 4      ││  A1*   ││   A2   ││   A3   ││ 列   │    │
 6      ││ CB asm ││ CB asm ││ CB asm ││x37   │    │
 8      ││ 10x15  ││ 10x15  ││ 10x15  ││      │    │  机身 y4-19
10      ││ in×2   ││ in×2   ││ in×2   ││ bot  │    │  (15m=7.5行)
12      ││        ││        ││        ││ top  │    │
14      ││        ││        ││        │└──────┘    │
16      ││        ││        ││        │            │
18      ││   v    ││   v    ││   v    │            │
20      │└───┴────┴┴───┴────┴┴───┴────┘            │  front 出口 y19
        │════ collect belt y20 (z=14m) ═══►x37 ═══─│  收集 belt 走机身南侧
22      │ A1 27.5 / A2,A3 关；T9 三台 49.3/台      │
24      │ 铜片进料: 左 Wall Inlet z=24m,col0,y6    │
26      │   → lift-bot 下到 y2 进料巷 → splitter   │
        │   manifold 喂全 8 台 in-0（1F 直喂 3 台  │
28      │   + lift-up 续喂 2F/3F）                 │
30      │ 塑料进料: 屋顶 B4 smart-split → lift-bot │
        │   → y2 进料巷 splitter manifold 喂全 8   │
32      │   台 in-1                                │
34      │ 出料: 3 台 front → collect belt y20 →    │
36      │   x37 lift-out-top → 屋顶 B4 merger      │
38      │                                          │
40      └──────────────────────────────────────────┘
```

- A1-A3：3 台 circuit-board assembler（10m W × 15m L × 8m H），北墙内缩 4m，机间留 3m 净空（x=0-10 / 13-23 / 26-36）
- T6 **仅 A1 通电** (183.33% / 2 shard)，A2-A3 物理建好但 Power Switch **关**
- x=36-40 留 lift + manifold 操作竖井（lift 包围盒四角钉死 x=36.25-39.75 × y=2-4，宽 3.5m × 深 2m）
- 进料：左 Wall Inlet z=24m (铜片) → lift-bot 降到进料巷 + 屋顶 B4 smart-split (塑料) → 1F y2 进料巷 splitter manifold → 喂 1F 3 台 + 续接 lift-up 给 2F/3F
- 出料：3 台 front → collect belt (y=20, z=14m) → x=37 主 lift-out-top → 屋顶 B4 merger

### 2F (12-20m): 3 assembler — T6 全部 Power Switch 关（belt/manifold 已接好）

```
        0    5    10   15   20   25   30   35   40m
        ┌───────────────────────────────────────────┐
 0      │ ^  ^      ^  ^      ^  ^         进料巷   │  y0-4 manifold（北墙内缩4m）
 2      │ ^  ^      ^  ^      ^  ^      ┌──────┐    │
        │┌────────┐┌────────┐┌────────┐│ lift │     │
 4      ││   A4   ││   A5   ││   A6   ││ 列   │     │
 6      ││ CB asm ││ CB asm ││ CB asm ││x37   │     │
 8      ││ 10x15  ││ 10x15  ││ 10x15  ││      │     │  机身 y4-19
10      ││ in×2   ││ in×2   ││ in×2   ││ bot  │     │
12      ││        ││        ││        ││ top  │     │
14      ││        ││        ││        │└──────┘     │
16      ││        ││        ││        │             │
18      ││   v    ││   v    ││   v    │             │
20      │└───┴────┴┴───┴────┴┴───┴────┘             │  front 出口 y19
        │════ collect belt y20 (z=26m) ═══►x37 ═══──│
22      │ T6 全 OFF（A4∈NetB,A5/A6∈NetC）           │
24      │ 进料: x37 lift-up 从 1F 进料巷上来        │
26      │   (z=2→14m 水平转弯相 + 垂直爬升相分段)   │
28      │   铜片 + 塑料两路 lift 共享 x37 竖井      │
30      │ 出料: collect belt → x37 lift-out-top →   │
32      │   屋顶 merger（与 1F/3F 出料汇合再注 B4） │
34      │                                           │
36      │                                           │
38      │                                           │
40      └───────────────────────────────────────────┘
```

- A4-A6：3 台 assembler **物理建造完整**，T6 阶段 Power Switch **全关**
- Belt manifold + lift 一次性接到所有 3 台 in-0 (铜片) / in-1 (塑料) / front (输出)，经 x=37 竖井与 1F manifold 共用进料路径
- 通电节奏：T7 翻 Network B（A2/A3 在 1F + A4 在 2F，合计 +3 → 总 4 台）；T8 翻 Network C（A5/A6）→ 6 台

### 3F (24-32m): 2 assembler — T6 全部 Power Switch 关

```
        0    5    10   15   20   25   30   35   40m
        ┌───────────────────────────────────────────┐
 0      │ ^  ^      ^  ^                  进料巷    │  y0-4 manifold（北墙内缩4m）
 2      │ ^  ^      ^  ^               ┌──────┐     │
        │┌────────┐┌────────┐         │ lift │      │
 4      ││   A7   ││   A8   │         │ 列   │      │
 6      ││ CB asm ││ CB asm │         │x37   │      │
 8      ││ 10x15  ││ 10x15  │         │      │      │  机身 y4-19
10      ││ in×2   ││ in×2   │         │ bot  │      │
12      ││        ││        │         │ top  │      │
14      ││        ││        │         └──────┘      │
16      ││        ││        │                       │
18      ││   v    ││   v    │                       │
20      │└───┴────┴┴───┴────┘                       │  front 出口 y19
        │════ collect belt y20 (z=38m) ═══►x37 ════─│
22      │ T6 全 OFF（A7/A8 ∈ Network D，T9 通电）   │
24      │ 进料: x37 lift-up 从 2F 进料巷续上        │
26      │   (z=14→26m，先转后爬分相)                │
28      │ 出料: collect belt → x37 lift-out-top →   │
30      │   屋顶 B4 merger                          │
32      │ 仅 2 台，西半区 (x0-23) 用满，东半区空    │
34      │                                           │
40      └───────────────────────────────────────────┘
```

- A7-A8：3F 仅 2 台 assembler（x=0-10 / 13-23），东半区空出给 lift 竖井与走线
- T6 全关，归属 **Network D**，T9 翻 ON 后与全 8 台一同超频到 219%
- lift 竖井 x=37 贯穿 1F→2F→3F→屋顶，逐层「先转后爬」分相续接（每段 ≥4m）；进/出料竖井 lift 均 **Mk5**（塑料 525.6 / 铜片 262.8 / 电路板 131.4 均 < 780/min）

### 屋顶 (35-40m): B4 上 smart-split + merger（先取后合）

```
        0    5    10   15   20   25   30   35   40m
        ┌───────────────────────────────────────────┐
 0      │ o B1 ──────────────────────────────── o   │  row=0.25
 2      │ o B2 ──────────────────────────────── o   │  row=0.75
 4      │ o B3 ──────────────────────────────── o   │  row=1.25
 6      │ o B4 ─[smart-split f=塑料]─[merger]── o   │  row=1.75
 8      │           │ ↓塑料         ↑电路板         │
        │        lift-bot         lift-top          │  x37 竖井
10      │           ↓ z降到各层      │ z升自各层    │
        │        全 8 台 in-1      全 8 台 front    │
12      │ o B5 ──────────────────────────────── o   │  row=3.25
14      │ o B6 ──────────────────────────────── o   │  row=3.75
16      │ split BEFORE merge：避免新生电路板被当    │
18      │ 塑料取走。B1/B2/B3/B5/B6 直通无 splitter  │
40      └───────────────────────────────────────────┘
```

- 6 条屋顶 belt 在 35-40m 同层按子 cell 间距排开（row=0.25/0.75/1.25/1.75/3.25/3.75，~4m 一条），不是 6 个高度堆叠（§2-8）
- B4 上**先 smart splitter 后 merger**：smart splitter（filter=塑料）取塑料 T9 525.6/min 下 lift 给所有 assembler in-1；merger 把 1F+2F+3F 上来的电路板 T9 131.4 注回 B4
- smart splitter 必须放在 merger 上游一侧，否则会把新生电路板当塑料一并取走
- 电路板**不是 mainNode**（无 B5 终端注入），全部作为 B4 流量供下游 BP14 电脑 + BP15 HSC 取用

## Power Switch 分网

把 8 台 assembler 拆 4 个独立 Power Network，由 4 个 Power Switch 控制。**4 个 Switch 全部 T6 一次安装好**，只是 T6 阶段只合 Network A。

| 网 | 范围 | 楼层 | 数量 | T6 状态 | 升级触发 | 累计通电 |
|---|---|---|---:|---|---|---:|
| Network A | A1 | 1F | 1 | **ON** | — | 1 |
| Network B | A2, A3 + A4 | 1F + 2F | 3 | OFF | T7 翻 ON | 4 |
| Network C | A5, A6 | 2F | 2 | OFF | T8 翻 ON | 6 |
| Network D | A7, A8 | 3F | 2 | OFF | T9 翻 ON | 8 |

> 拼配校验：T6=A(1)；T7=A+B(1+3)=**4**；T8=+C(2)=**6**；T9=+D(2)=**8**。与激活时间线完全一致（旧表 Network B=4 导致 T7 累计 5，与时间线「T7=4」矛盾，已修正为 B=3）。<br>
> Power Switch 物理位置建议放各层 x=37 lift 列旁（manifold 区），4 个集中，方便玩家在场内一眼区分。

## 建造步骤

1. **框架**：5×5 cell × 5 cell 高（40×40×40m），分 3 个机器层 + 屋顶
2. **1F (0-8m)**：放 3 台 assembler A1-A3（北墙内缩 4m，x=0-10 / 13-23 / 26-36，机间 3m 净空）；x=36-40 留 manifold + lift 竖井
3. **1F belt**：y=20（z=14m）横铺 collect belt 收 A1-A3 三台 front（走机身南侧，不穿机身）；末端 x=37 合流到主 lift-out-top
4. **1F 地基**：y=8m 铺 4m 厚地基覆盖整层
5. **2F (12-20m)**：**同 1F 布局**放 3 台 assembler A4-A6（北墙内缩 4m）
6. **2F belt**：y=20（z=26m）横铺 collect belt（走机身南侧），末端 x=37 lift-out-top
7. **2F 地基**：y=20m 铺 4m 厚地基
8. **3F (24-32m)**：放 2 台 assembler A7-A8（x=0-10 / 13-23），东半区空出
9. **3F belt + 地基**：collect belt y=20（z=38m）；y=32m 铺 4m 厚地基
10. **垂直汇总**：1F/2F/3F 三条 collect belt 末端在 x=37 lift 列汇合成主 lift 上送到 z=35m（逐层「先水平转弯相 → 再垂直爬升相」分段，每段 ≥4m）
11. **左 Wall Inlet（铜片）**：col=0, y=6, z=24m（接 BP7 右 Wall Outlet）→ lift-bot 下到进料巷高度 → splitter manifold 喂 **全部 8 台 in-0**（各层 lift-up 续接）
12. **屋顶 (35m)**：铺 6 条 Mk5 平行 belt（B1 row=0.25 … B6 row=3.75，子 cell 间距），B4 上**先 smart-split（filter=塑料）后 merger**
13. **塑料进料链**：B4 smart-split → lift-bot 下到各层进料巷高度 → splitter manifold 喂 **全部 8 台 in-1**
14. **电路板出料链**：1F/2F/3F 主 lift-out-top → 屋顶 B4 merger 注回 B4
15. **Power Switch ×4**：按「Power Switch 分网」表布置 Network A/B/C/D；T6 只合 A，B/C/D 全部 OFF
16. **Power Shard（T6 阶段）**：仅 A1 插 2 shard，超频到 183.33%；**A2-A8 物理已就位但 shard 槽空着**

## 集群内部短 belt

仅入：BP7 → BP8 铜片 27.5（T9 262.8）（左 Wall Inlet z=24m, col=0, y=6）。

## Tier 7+ 启用流程（仅翻 Switch + 插 shard，不动结构 / 不动 belt）

| Tier | 操作 | 通电总数 | 总产能 (board/min) |
|---|---|---:|---:|
| T7 | 翻 Network B Switch ON → A2/A3（1F）+ A4（2F）各插 shard 调超频 | 4 | 65.7 |
| T8 | 翻 Network C Switch ON → A5/A6（2F）各插 shard | 6 | 98.6 |
| T9 | 翻 Network D Switch ON → A7/A8（3F）插 shard，**全 8 台超频调到 219%**；铜片/塑料来料 belt 已 Mk5（铜片 262.8、塑料 525.6 均 < Mk5 780 = 34% / 67% ✓）| 8 | **131.4** |

## 验证

- [ ] **8 台 assembler 全部物理放置**（包括 T6 不通电的 7 台 A2-A8），分布 1F 3 台 / 2F 3 台 / 3F 2 台
- [ ] 每层机器北墙内缩 4m 留进料巷，机间留折线净空（不再 40m 满宽零间隙）
- [ ] collect belt 画在机身 front 南侧（y=20）而非机身内（不穿模 R14）
- [ ] Belt manifold + lift 接到全部 8 台 in-0 (铜片) / in-1 (塑料) / front (输出)（不只是 T6 通电的 1 台）
- [ ] 4 个 Power Switch 一次建好，Network A 合上，B/C/D 断开（B=3 台使 T7 累计 4 台）
- [ ] T6 仅 A1 插了 2 shard；A2-A8 物理就位但 shard 槽空
- [ ] B4 上 smart splitter 在 merger 之前（避免新生电路板被误取）
- [ ] 配方为 2 铜片 + 4 塑料 → 1 电路板（基准 7.5/min）；输入是**铜片**非铜板
- [ ] AI 限制器**不在**本蓝图（已迁移到 BP10）
- [ ] BP7→BP8 铜片短 belt 高度 z=24m 对齐
- [ ] 塑料 55/min（T9 525.6）取自 B4 上的 BP9 来料（B4 上 BP9→BP8 段流量需 ≥ 该值）
- [ ] 屋顶 B1/B2/B3/B5/B6 直通无 splitter（本蓝图仅在 B4 取 + 注）
- [ ] x=37 lift 竖井贯穿 1F→2F→3F→屋顶，各段「先转后爬」分相、跨度 ≥4m
```
