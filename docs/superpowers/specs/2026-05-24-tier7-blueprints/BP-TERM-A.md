# BP-TERM-A 终端汇流（前 13 mainNode，无 sink）

## 概要

- **集群**: 总线尾端（紧贴 BP15 之后）
- **规格**: Mk2 单实例
- **建筑**: 13 个 Dim Depot Uploader（**5×10×8m，尺寸待游戏内实测**，假设参照 storage）+ 13 个 smart splitter（每 mainNode 1 个，filter=该物料，priority=Uploader / overflow→ overflow belt）+ 6 个 merger（overflow 13 路级联汇流，merger 为 3in1out）
- **作用**: 26 mainNode 中的**前 13 个**送入位面仓；**overflow 不在本蓝图 sink，全部走 belt 反向到 BP-TERM-B 共享 sink**

> **本蓝图无生产机器**；所有 Uploader / smart splitter / belt / lift / wall mount T6 一次建造到位，**不涉及 Power Switch**（Uploader 0 W 耗电）。T7+ 扩容仅需在 2F 预留槽位补建 Uploader+splitter，不动现有结构。

## 物料 I/O

**输入**：
- 屋顶 **B5 终端总线** ← BP15 末端（396/min 26 mainNode 混合流）

**输出**：
- 13 个 Dim Depot Uploader → 位面仓（玩家 build gun 直接调用）
- 13 路 overflow belt → **6 merger 级联**（merger 3in1out，13 路需 ⌈(13−1)/2⌉=6 个）→ 右 Wall Outlet (z=8m) → BP-TERM-B 共享 sink

**屋顶 B1-B4 + B6 直通**（在 BP-TERM-A 内不分流，继续到 BP-TERM-B）

## 13 mainNode 分配（前半批）

| # | mainNode | 流量 (T6) | Tier 7+ 流量 |
|---|---|---:|---:|
| 1 | 铁板 | 20 | 362 |
| 2 | 铁棒 | 15 | 734 |
| 3 | 强化铁板 | 5 | 57 |
| 4 | 钢梁 | 15 | 86 |
| 5 | 钢管 | 20 | 210 |
| 6 | 铜板 | 10 | 428 |
| 7 | 电线 | 30 | 1455 |
| 8 | 线缆 | 30 | 568 |
| 9 | 混凝土 | 15 | 156 |
| 10 | 塑料 | 20 | 1134 |
| 11 | 橡胶 | 20 | 92 |
| 12 | 转子 | 4 | 29 |
| 13 | 定子 | 5 | 30 |
| **合计** | | **209** | **5341** |

> T8/T9 流量翻 25x，单 Uploader 入口 Mk5 容量 780/min 可能不够（电线 1455 超）→ **T8/T9 时拆为 2 个 Uploader 并联**（每个吃 727 = 93% Mk5）。**注意**：并联 Uploader + 拆 belt 必须在 T6 一次预建到位（否则违反「不动现有结构」原则），或将超额 mainNode 改走 BP-TERM-C。

### overflow 汇总流量与 Mk 等级

overflow = 进入本蓝图的 mainNode 流量中**位面仓吃饱后的剩余**，由 13 个 smart splitter 的 overflow 出口汇入 6-merger 级联。位面仓研究升满（5000 容量）后稳态多数 mainNode 的 overflow ≈ 该路全部入料（仓满则全溢）。

- **T6 上界**：13 路入料合计 **209/min**（见上表 T6 列），即 overflow 汇总 ≤ 209/min。单条 Mk2 belt（120/min）不够，**6-merger 级联出口段及右 Wall Outlet 用 Mk3（270/min）**即可吞下 T6 全部 overflow。
- **T7 上界**：13 路 T7 入料合计 **5341/min**，远超任何单 belt。但本蓝图 overflow 仅是「位面仓溢出」，且 BP-TERM-B 共享 sink 单 Mk5=780/min；overflow 汇总段必须**限流到 ≤780/min 再送 sink**，超出部分应在上游（各产线本地 sink，见 §3）消化，不应堆到 TERM 段。
- **结论**：merger 级联出口 + 右 Wall Outlet **指定 Mk3（270/min）**，覆盖 T6；T7+ 若 overflow 汇总逼近/超过 270，升级该段为 Mk5（780/min，与 BP-TERM-B sink 入料 belt 同级），并在 T6 预留 belt 路由净空。

## 楼层占用

| 层 | 高度 | 内容 |
|---|---|---|
| 1F | 0-12m | 13 Uploader（**2 band：band1 7 + band2 6**）+ 13 smart splitter + **6 merger 竖列**（汇流 13 路 overflow → 右 Wall Outlet）|
| 2F | 16-32m | T7+ 备用 Uploader 槽位 ×3（铝包铝板 / 散热器 / 时间晶体，对应 T7/T8/T9）|
| 屋顶 | 35-40m | B1-B6 直通 + B5 上的 **3 级 1→3→9→27 splitter cascade**（前 13 路下 1F，13 路继续到 BP-TERM-B，1 路封堵）|

## 俯视图（按实际比例重画，每层独立）

> 比例：横向 1 字符 = 1m，纵向 1 行 = 2m。Uploader 真实 5W×10L → 框宽 5 字符、框高 5 行。
> 布局公约：**2 个 band（7 + 6 台）**，每 band = 北侧 4m 进料巷 + 10m Uploader = 14m，2 band 共 28m ≤ 40m。每个 Uploader（输入在 back=北）从所在 band 北缘内缩 ≥4m 留进料/lift 巷；smart splitter 紧贴对应 Uploader 北侧（back）落在进料巷内、不压机身；6 个 overflow merger 在东侧 x=34-38m **竖向单列堆叠**（6×4m=24m）；**东缘 x=38-40m 留空作 overflow riser 竖向干道**；下行 lift 落在各 band 北缘巷内。

### 1F (0-12m → 实占 0-38m): 13 Uploader（band1 7 + band2 6）+ 13 smart splitter + 6 merger 竖列

> band1 Uploader y=4-14（7 台，x=0-38，末台 U7 x=33-38）；band2 Uploader y=18-28（6 台，x≤34，给东侧 merger 列让位）。merger 竖列在 band1 之下、band2 之东（y=14-38、x=34-38），与两 band 均无 x/y 重叠（band1 在其北、band2 在其西，仅边缘相切）。**东缘 x=38-40 全程留空**作 overflow riser 竖向干道（band1/band2 splitter 的 overflow 均沿各自北进料巷东行汇入此 riser，再从东侧折入各 merger 入口，不下穿任何机身）。**(横向为示意，机器/设备真实 x 坐标以正文坐标表为准)**

```
        x=0    5.5   11   16.5  22   27.5  33  38  40m
        ┌──────────────────────────────────────────────┐
 0  ────┤ S1    S2    S3    S4    S5    S6    S7   ║rise │  ← band1 进料巷 y0-4（S1-S7 + lift-DOWN 落点）；east riser x38-40
 4      │┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐║over │
        ││U1 │ │U2 │ │U3 │ │U4 │ │U5 │ │U6 │ │U7 │║flow │  ← U1-U7 真实 5W×10L（U7 x=33-38）
 8      ││5x │ │5x │ │5x │ │5x │ │5x │ │5x │ │5x │║belt │
        ││10 │ │10 │ │10 │ │10 │ │10 │ │10 │ │10 │║ ↓   │
12      ││   │ │   │ │   │ │   │ │   │ │   │ │   │║ ↓   │
        │└───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘║ ↓   │
14  ────┤ S8    S9    S10   S11   S12   S13   ────────────>║↓   │  ← band2 进料巷 y14-18 overflow 东行→riser
        │┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐   ┌────┐║ ↓  │     东列 merger（x34-38）；东缘 riser x38-40
18      ││U8 │ │U9 │ │U10│ │U11│ │U12│ │U13│   │ M1 │<─↓  │     M1=p1+p2+p3（东入口←riser）  (col4.25-4.75,row1.75-2.25)
        ││5x │ │5x │ │5x │ │5x │ │5x │ │5x │   ├────┤  ↓  │
22      ││10 │ │10 │ │10 │ │10 │ │10 │ │10 │   │ M2 │<─↓  │     M2=p4+p5+p6  (col4.25-4.75,row2.25-2.75)
        ││   │ │   │ │   │ │   │ │   │ │   │   ├────┤  ↓  │
26      ││   │ │   │ │   │ │   │ │   │ │   │   │ M3 │<─↓  │     M3=p7+p8+p9  (col4.25-4.75,row2.75-3.25)
        │└───┘ └───┘ └───┘ └───┘ └───┘ └───┘   ├────┤  ↓  │
30  ────┤  band1 overflow: y0-4 巷东行→x38-40    │ M4 │<─↓  │     M4=p10+p11+p12  (col4.25-4.75,row3.25-3.75)
        │  band2 overflow: y14-18 巷东行→x38-40   ├────┤  ↓  │
34  ────┤  两 band 均汇东缘 x38-40 riser 竖↓，    │ M5 │     │     M5=M1+M2+M3  (col4.25-4.75,row3.75-4.25)
        │  逐行从东侧折入 merger（不下穿机身,R14） ├────┤     │
38      │                                       │ M6 │═════>  ← M6=M4+p13+M5  (col4.25-4.75,row4.25-4.75) → 右 Wall Outlet (z=8m,row=4)
40      └───────────────────────────────────────┴────┴─────┘
        说明：p13(=S13 overflow) 旁路直入 M6 第三入口；M5/M6 为级联内部段（M1-M4 输出→M5/M6），不接 riser
```

- **U1-U13**：Dim Depot Uploader 5m W × 10m L × 8m H（**尺寸待游戏内实测**，假设参照 storage）。**2 个 band**，每 band 北缘留 ≥4m 进料巷。
  - **band1（7 台 U1-U7）**：x≈0 / 5.5 / 11 / 16.5 / 22 / 27.5 / 33（步距 5.5m，5m 宽 + 0.5m 间隙；末台 U7 x=33-38，**东缘 x=38-40 留作 overflow riser 空带**），y=4-14。
  - **band2（6 台 U8-U13）**：x≈0 / 5.8 / 11.6 / 17.4 / 23.2 / 29（同步距，末台 x=29-34，**全部 ≤34** 给东侧 merger 列让位），y=18-28。
  - y 验证：band1 y=4-14、band2 y=18-28，整栋实占 y=0-38m（≤40m，无越界，见报告 §5）。
- **S1-S13**：smart splitter（4×4m，filter=该路 mainNode 物料，priority=Uploader / overflow→merger）。x = 对应 Uploader 中线 −2m（即 S_i x=Uᵢ 中心 col），紧贴对应 Uploader 北侧 back 输入：S1-S7 落 band1 进料巷 y=0-4、S8-S13 落 band2 进料巷 y=14-18，**全部在进料巷内、不压 Uploader 脚印**（修复 R13）。每个 splitter 的 overflow 出口朝**东**（同一进料巷内）引出，不向南穿越其所属 Uploader 机身。
- **M1-M6**：6 个 merger（各 4×4m）做 13 路 overflow 级联，**东侧 x=34-38m 竖向单列堆叠**，y=14/18/22/26/30/34（即 M1=y14-18 … M6=y34-38，6×4=24m ≤40m）。逐个坐标（cell 单位，1cell=8m）：
  - M1 col=4.25-4.75 row=1.75-2.25（x=34-38 y=14-18）
  - M2 col=4.25-4.75 row=2.25-2.75（x=34-38 y=18-22）
  - M3 col=4.25-4.75 row=2.75-3.25（x=34-38 y=22-26）
  - M4 col=4.25-4.75 row=3.25-3.75（x=34-38 y=26-30）
  - M5 col=4.25-4.75 row=3.75-4.25（x=34-38 y=30-34）
  - M6 col=4.25-4.75 row=4.25-4.75（x=34-38 y=34-38）
  - 竖列在 band1（y4-14，在其北）之下、band2（x≤34，在其西）之东，仅边缘相切，**无 AABB 重叠**。
- **overflow merger 级联（merger 3in1out）**：
  - L1：`M1=p1+p2+p3`、`M2=p4+p5+p6`、`M3=p7+p8+p9`、`M4=p10+p11+p12`（共 4 merger，吃 12 路）
  - L2：`M5=M1+M2+M3`、`M6=M4+p13+M5`（p13 旁路直入 M6）
  - M6 出口 → 右 Wall Outlet（z=8m，row=4）→ BP-TERM-B 共享 sink。出口段 belt **Mk3（270/min，覆盖 T6 ≤209）**。
- **overflow collect belt（修复 R14，与 splitter 位置自洽）**：13 个 smart splitter 的 overflow 出口在各自所在的**北侧进料巷内向东行走**，绝不向南下穿其所属 Uploader 机身——
  - **band1（S1-S7）**：overflow 沿 band1 进料巷 **y=0-4** 一路向东，到东缘 **x=38-40** 空带后**竖向向下（沿 x=38-40）** 行进。
  - **band2（S8-S13）**：overflow 沿 band2 进料巷 **y=14-18** 向东，到东缘 **x=38-40** 空带汇入同一竖向干道。该东行段在 x=34-38 处于 M1（merger，y14-18）正上方——**此段 belt 安装于 z≈6-8m（高于 merger 机身 0-5m），仅在 2D 俯视图投影上与 M1 交叠，实际 z 错层不碰撞**（见多排原则 6）；到 x=38-40 后并入东缘 riser 再下降到目标 merger 端口高度。
  - 该东缘竖向干道（x=38-40，y 贯穿 0-38）再从**东侧**水平折入 merger 竖列（x=34-38）各自的 in 端口；merger 列东边正对 x=38-40 空带，水平折入段 ≤2m，**折入前才降到该端口 z 高**。
  - 全程 belt 仅在「北进料巷（y0-4 / y14-18）」与「东缘空带（x38-40）」内行走，**与任何 Uploader 机身带（band1 y4-14 / band2 y18-28）零 x×y 投影重叠**（绝不下穿 Uploader）；唯一与机身投影交叠处是 band2 东行段越过 M1 顶（x34-38 y14-18），该处为 z 错层（belt z≈6-8m vs merger 0-5m），非同层碰撞——R14 消除。
  - **z 错层说明（多排投影叠加，见多排原则 6）**：东缘 x=38-40 corridor 内并行多条 overflow 干线（band1 7 路 + band2 6 路在汇入 merger 前可能多线并行），俯视图把它们叠画为单列 `↓`；实际它们按不同 z 高度（belt 可堆叠/不同安装高）或 x=38/39/40 子列错开，2D 仅为投影，**彼此不在同一 (x,y,z) 占位**，不构成真实碰撞。各干线均在折入对应 merger 入口前才下降到该 merger 端口高度（z=端口高），转弯相与竖直 riser 相分开计坐标。
- **B5 cascade 在屋顶**做 1→3→9→27 三级树，27 路输出中 13 路 lift-DOWN 落到上图各 band 北缘进料巷再进 splitter，13 路继续到 BP-TERM-B，1 路封堵（见屋顶图）。lift-DOWN 走「先在屋顶水平转弯相对齐目标 col → 再垂直爬升相直下 1F」分两段（§2-5）。

### 2F (16-32m): T7+ 备用 Uploader 槽位 ×3

> 仅预留 3 个 Uploader 槽位（对应 T7/T8/T9 各 1 个 mainNode），与扩容表一致。T6 时**不放建筑**，只保留 lift 穿层口与底座。

```
        x=0   5    10   15   20   25   30   35   40m
        ┌─────────────────────────────────────────┐
 0  ────┤ T7+ reserve slots — 不在 T6 放建筑        │  ← 进料巷 y0-4（lift 穿层口落点）
 2      │                                          │
 4      │ ┌───┐       ┌───┐       ┌───┐            │
 6      │ │R1 │       │R2 │       │R3 │            │  ← 各槽 Uploader 5W×10L 占位
 8      │ │5x │       │5x │       │5x │            │
10      │ │10 │       │10 │       │10 │            │
12      │ │   │       │   │       │   │            │
14      │ └───┘       └───┘       └───┘            │  ← R 槽 y4-14（10m 长）
16      │ R1=铝包铝板(T7) R2=散热器(T8) R3=时间晶体(T9)│
18      │                                          │
20      │                                          │
22      │ lift 穿层口（屋顶 cascade → 2F splitter）  │
24      │ 落在各槽北缘进料巷 y0-4，避开 1F 输出 lift  │
26      │                                          │
28      │                                          │
30      │                                          │
32      │                                          │
34      │                                          │
36      │                                          │
38      │                                          │
40      └─────────────────────────────────────────┘
```

### 屋顶 (35-40m): B5 splitter cascade（3 级）+ B1-B4/B6 直通

> belt 间距用子 cell（§2-8）：6 条总线在 0-40m 高度内按 row≈0.25/0.75/1.25… 排开，下图行位仅示意。

```
        x=0   5    10   15   20   25   30   35   40m
        ┌─────────────────────────────────────────┐
 0      │ o B1 ──────────────────────────────── o  │  → 直通 BP-TERM-B
 4      │ o B2 ──────────────────────────────── o  │  → 直通
 8      │ o B3 ──────────────────────────────── o  │  → 直通
12      │ o B4 ──────────────────────────────── o  │  → 直通
16      │ o B5 ─┬[1→3→9→27 splitter cascade]──── o  │  → 13 路继续到 BP-TERM-B
        │       │  L1:1→3  L2:3→9  L3:9→27       │  │
20      │       └─▼ 13 路 lift-DOWN → 1F          │  │
        │         （先水平对齐 col→再垂直下降）    │  │
24      │ o B6 ──────────────────────────────── o  │  → 直通
28      │                                          │
32      │ B5: 27 出口 = 13 下 1F + 13 续 TERM-B    │
36      │            + 1 封堵(cap)                  │
40      └─────────────────────────────────────────┘
```

- B5 屋顶 **1→3→9→27 三级 cascade splitter 树**（L1 1→3、L2 3→9、L3 9→27，共 13 个 splitter）。
- 27 路输出口分配：**13 路 lift-DOWN 下到本蓝图 1F** 各 Uploader+splitter；**13 路右贯穿到 BP-TERM-B**（与 TERM-B 的 13 mainNode 对应）；**剩 1 路封堵（cap，不接 belt）**——27 比 26 个 mainNode 多 1。
- lift-DOWN 分相（§2-5）：先在屋顶水平转弯相把 belt 引到目标 Uploader 的 col 轴，再垂直爬升相直下 1F 落入进料巷，跨度 35m ≫ 4m 最小值，合规。

## 建造步骤

1. **1F（实占 0-38m，2 个 band）**:
   - band1（7 台）：进料巷 y=0-4 摆 7 个 smart splitter (S1-S7)；其南 y=4-14 摆 7 个 Uploader (U1-U7)，x≈0/5.5/11/16.5/22/27.5/33（步距 5.5m，末台 U7 x=33-38，**东缘 x=38-40 留空作 overflow riser**）
   - band2（6 台）：进料巷 y=14-18 摆 S8-S13；其南 y=18-28 摆 U8-U13，x≈0/5.8/11.6/17.4/23.2/29（末台 x=29-34，**全部 ≤34** 让出东侧 merger 列）
   - 每个 splitter 紧贴对应 Uploader 北侧 back 输入，落在进料巷内不压机身，priority=Uploader、overflow→merger；overflow 出口朝东沿本进料巷东行至 x=38-40 riser，不向南穿越机身
   - 东侧专用通道 x=34-38m 摆 **6 个 merger 竖向单列**（M1-M6，y=14/18/22/26/30/34，逐个坐标见俯视图）；M6 出口 → 右 Wall Outlet (z=8m, row=4)，出口段 belt Mk3
2. **B5 → 屋顶 splitter 树**: 屋顶 B5 belt 不动，**屋顶上**做 **1→3→9→27 三级 cascade**（13 个 splitter，不下 1F）
   - 27 路输出：13 路 lift-DOWN 下到 1F 各对应 Uploader+splitter（先水平转弯相对齐 col→再垂直下降，§2-5）
   - 13 路 belt 继续右贯穿到 BP-TERM-B 屋顶；剩 1 路封堵
3. **smart splitter filter 配置**（重要）：13 个 splitter 各 filter 1 个 mainNode 物料
4. **2F (16-32m)**: 预留 **3 个** Uploader 槽位（不放建筑，T7/T8/T9 各加 1：铝包铝板/散热器/时间晶体），保留 lift 穿层口
5. **屋顶 (35-40m)**: 6 belt 直通 + B5 上的 1→3→9→27 splitter cascade（**3 级**）
6. **Power Switch**: 不需要（Uploader 0 W 耗电）

## smart splitter filter 配置（13 路）

| 路 | mainNode | smart splitter filter |
|---|---|---|
| 1 | 铁板 | iron-plate |
| 2 | 铁棒 | iron-rod |
| 3 | 强化铁板 | reinforced-iron-plate |
| 4 | 钢梁 | steel-beam |
| 5 | 钢管 | steel-pipe |
| 6 | 铜板 | copper-sheet |
| 7 | 电线 | wire |
| 8 | 线缆 | cable |
| 9 | 混凝土 | concrete |
| 10 | 塑料 | plastic |
| 11 | 橡胶 | rubber |
| 12 | 转子 | rotor |
| 13 | 定子 | stator |

## Tier 7+ 扩容点

| Tier | 新增 mainNode（A 占位）|
|---|---|
| T7 | 铝包铝板 → 2F slot 1 |
| T8 | 散热器 → 2F slot 2 |
| T9 | 时间晶体 → 2F slot 3 |

> BP-TERM-A 共 13（T6）+ 3（T7-9）= **16 mainNode**，剩 21 个全在 BP-TERM-B（含共享 sink）。如 21 太多可启用 BP-TERM-C。

## 验证

- [ ] 13 个 mainNode 全 Uploader 接 belt（不漏）
- [ ] **本蓝图无 sink**（所有 overflow 汇流走右 Wall Outlet → BP-TERM-B 共享 sink）
- [ ] smart splitter priority 配置正确（Uploader 优先、overflow 默认）
- [ ] **6 个 merger 竖向单列**（东侧 x=34-38m，y=14/18/22/26/30/34，merger 3in1out）正确汇 13 路 overflow（L1 M1-M4 吃 12 路、L2 M5/M6 + p13 旁路）
- [ ] B5 在屋顶做 **1→3→9→27 三级 cascade**（13 splitter），**13 路下 1F + 13 路续 BP-TERM-B + 1 路封堵**（27=13+13+1）
- [ ] 13 路 lift-DOWN 分相（先水平转弯→再垂直下降），落点在 **2 个 band（band1 7 路 / band2 6 路）**北缘进料巷
- [ ] 2F **3 个** Uploader 槽位预留（不放建筑，对应 T7/T8/T9）
- [ ] B1-B4/B6 屋顶直通无分流
- [ ] **位面存储研究升到合适等级**（默认 50 容量 → 升级 5000 容量）
- [ ] 右 Wall Outlet (z=8m, row=4) overflow belt（Mk3）与 BP-TERM-B 左 Wall Inlet 对齐
- [ ] **overflow collect belt 不穿任何机身（R14）**：13 splitter 的 overflow 出口在各自北进料巷内向东行（band1 沿 y0-4、band2 沿 y14-18），到东缘 **x=38-40 空带**竖向汇成一条 riser，再逐行从东侧（≤2m）水平折入各 merger 入口；全程仅占「北进料巷 + 东缘 x38-40」，与 band1（y4-14）/band2（y18-28）Uploader 机身带、merger 列（x34-38）均无 x×y 投影重叠，绝不下穿任何机身
- [ ] **同层无 AABB 重叠 + 全部在 40×40 内**（已逐矩形自检通过）：
  - band1 U1-U7：x=0/5.5/11/16.5/22/27.5/33（各 +5 宽），y=4-14；相邻间隙 0.5m，U7 右缘 x=38（≤40）；东缘 x=38-40 留空
  - band2 U8-U13：x=0/5.8/11.6/17.4/23.2/29（各 +5 宽，末台右缘 x=34），y=18-28；全部 ≤34
  - S1-S13（4×4）在进料巷 y0-4 / y14-18 内、不压 Uploader 脚印
  - M1-M6（4×4）东列 x=34-38，y=14/18/22/26/30/34（M6 右缘 x=38、下缘 y=38，均 ≤40）；与 band1（其北）band2（其西）仅边缘相切，无面积重叠
- [ ] **各 lift riser 占互不相同的 (col,row) 且纯垂直**：13 路 lift-DOWN 各自对齐到不同目标 Uploader 的 col（13 台 Uploader col 两两不同），屋顶→lift 顶、lift 底→splitter 的水平位移为独立转弯段（与 riser 分相标坐标）；1F 输出 lift 列与 2F 进料 lift 穿层口在 col 上错开，不同楼层 riser 不共用同一 (col,row)，无 3D z 区间重叠
