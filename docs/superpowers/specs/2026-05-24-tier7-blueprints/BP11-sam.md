# BP11 重生 SAM + SAM 波动器 (C5 末)

## 概要

- **集群**: C5 末端（紧贴 BP10b 之后；C5 最后一个蓝图）
- **规格**: Mk2 单实例
- **机器**: **3 台一次物理建造到位**（2 reanimated-sam constructor + 1 sam-fluctuator manufacturer）
- **激活时间线**: T6 = T7 = T8 = T9 = **3 台全通电**（uplift 1.0x — 整厂唯一 T6 就满载的蓝图）
- **产能 T6**: 重生 SAM 90/min · SAM 波动器 10/min

> **核心设计原则**：3 台 T6 已全部物理建造且全部通电；T7-T9 不增加机器、不变 shard、不需要 Power Switch 分网（属于 BP01 统一模式的退化情形：所有机器一次到位 + 全部通电）。

## 机器超频清单（T6，Plan C ≤250%）

| 配方 | 物理 | T6 通电 | 超频 | 单台产能 (/min) | Power Shard/台 |
|---|---:|---:|---:|---:|---:|
| reanimated-sam (constructor) | 2 | **2** | 150.0% | 45 重生SAM | 1 |
| sam-fluctuator (manufacturer) | 1 | **1** | 100.0% | 10 SAM 波动器 | 0 |
| **合计 (T6)** | 3 | 3 | — | — | 2×1 + 0 = **2** |

> 总产能验证: 2 × 45 = 90 重生SAM ✓（其中 60 内部消费 + 30 mainNode）| 1 × 10 = 10 SAM 波动器 ✓
> **唯一全 T6/T9 不变的蓝图**：3 台已物理满载且全部通电，**无 Power Switch 分网需求**（统一模式的退化情形）。

## 物料 I/O

| 方向 | 物料 | 流量 | 路径 |
|---|---|---|---|
| 输入 | SAM 矿石 | 360/min | **SAM 矿场直喂** → 左 Wall Inlet (2F, h=20m) → splitter → 2 reanim constructor in-0 |
| 输入 | 电线 | 50 | **屋顶 B3** ← BP7 → smart splitter |
| 输入 | 钢管 | 30 | **屋顶 B3** ← BP5 → smart splitter |
| 输出 | 重生 SAM → SAM 波动器（蓝图内）| 60 | 内部 lift |
| 输出 | 重生 SAM → B5 终端 | 30 | 屋顶 merger → B5 |
| 输出 | SAM 波动器 → B5 终端 | 10 | 屋顶 merger → B5 |

**屋顶总线接入**:
- 取自 B3 (电线 50 + 钢管 30)
- 注入 B5 (重生 SAM 30 + SAM 波动器 10 = 40 mainNode)

## 楼层占用

| 层 | 高度 | 内容 | 物理 | T6 通电 |
|---|---|---|---:|---:|
| 1F | 0-12m | SAM 波动器 manufacturer（20m × 22m × 12m）| 1 | **1** |
| 2F | 16-24m | 重生 SAM constructor（8m × 10m）| 2 | **2** |
| 屋顶 | 35-40m | B1-B6 + smart splitter (B3) + merger (B5) + 多 lift | — | — |

> manufacturer 20×22m 占地 **440m²** × 12m 高（占 1F 一半多）；2F 上 2 台 constructor 一字排（16m × 10m，剩 24m 空地）。

## 俯视图（按实际比例，每层独立 — 视觉正方形）

**比例约定**：横向 1 字符 = 1m，纵向 1 行 = 2m；蓝图 40×40m → 51 字符 × 20 行画布。

机器 ASCII 占位：manufacturer 20m × 22m → 21 字符宽 × 11 行（22m÷2，占 1F 一半）；constructor 8m × 10m → 9 字符宽 × 5 行（10m÷2）。

> manufacturer **facing=south**（统一口径，§2-6）：input 在 front（南）、output 在 back（北）。input 4 槽落在机身南边 row≈2.5 cell，由南侧水平进料 manifold 喂入；output 在机身北边 row≈0.5 cell，北侧留 ≥0.5 cell 给 output riser。（平面 row/col 统一用 cell 单位，1 cell=8m；安装/升降高度单独标 z=…m；§原则5）

### 1F (0-12m): 1 SAM-fluctuator manufacturer (20m W × 22m L × 12m H, facing=south)

机身 row 0.5..3.25 cell（北边内缩 0.5 cell 给 output riser），南侧 row 3.25..5 cell 留水平进料 manifold 平面；东侧 col 2.75-3.75 为 lift 专用通道（3 条 riser 各占独立 col：B3@2.75、fluct@3.0、reSAM60@3.25）。安装高度按楼层 z 标注（1F 机身 z 0-12m）。

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬──────┐
 0      │                      ↑fluct out riser @(3.0,0.5)  │
        │                      │ 1F out-0→roof B5(z 4→35)   │
 4      │┌───────────────────┐←┘ out-0(back,N) row≈0.5cell  │
        ││    M1  out-0 ▲ N   │   ↓riser B3@(2.75,4)        │
 8      ││ sam-fluctuator    │    ↓riser reSAM60@(3.25,4)   │
        ││ manufacturer      │   facing=south               │
12      ││    20 x 22 m      │   (440 m^2)                  │
        ││                   │   lift channel col 2.5-3.75  │
16      ││                   │   (3 riser 各占独立 col)     │
        ││                   │                              │
20      ││ in-0  in-1        │                              │
        ││ in-2  in-3(空)    │  ← front(S) 4 槽 row 2.5cell │
24      ││                   │                              │
        │└──┬──┬───┬─────────┘  ↓ riser 底端 @row=4cell     │
28      │ ←─┘  │   │   feed manifold @ y26-40（南侧水平）   │
        │  ←───┘   │ ┌─belt(转弯相):riser底→front 水平西绕  │
32      │ wire50   └─┤ B3 riser底(2.75,4)·reSAM60底(3.25,4) │
        │  pipe30    └ 各自水平 belt 段绕进 front 各 in 槽  │
36      │  (riser 纯垂直；水平位移=独立 belt 段，分相标注)  │
        │ raw-SAM 360 输入在 2F（左 Wall Inlet）            │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴──────┘
```

- 机身占 col 0-2.5、row 0.5-3.25 cell（21 字符 × 11 行 = 真实 20×22m），北侧 row 0-0.5 cell 留 fluct output riser 落点，东侧 col 2.5-3.75 为 lift 通道（平面 row/col 统一用 cell 单位，1 cell=8m；高度单独标 z=…m，§2-5 原则5）
- **facing=south**：out-0(back) 在机身北边 row≈0.5 cell，向北引出到 **fluct out riser @(3.0,0.5)**（纯垂直 z 4→35m）升至屋顶 B5；in 0..3(front) 在机身南边 row≈2.5 cell
- **lift 两端同坐标 + 水平位移拆独立 belt 段（§2-5 原则2）**：屋顶 B3 的 wire50 / pipe30 → **B3 riser 两端均 @(2.75,4)**（纯垂直 z 35→0m），落地后在南侧 row 3.25-5 cell manifold 平面由**独立水平 belt 段（转弯相）**西绕进 in-0/in-1 槽；riser 自身不含任何水平位移
- 配方 sam-fluctuator = 6 reSAM + 5 wire + 3 steel-pipe → 1/min。100% 1 台需 60 reSAM + 50 wire + 30 pipe，仅 3 槽用，in-3 空槽
- reSAM60（来自 2F）：**reSAM60 riser 两端均 @(3.25,4)**（纯垂直），落地后独立水平 belt 段西绕进 in-2 槽
- output 走北向 row≈0.5 cell → **fluct out riser @(3.0,0.5)** 升至屋顶 B5 merger（fluct 10/min）；3 条 riser 各占互不相同 col（2.75 / 3.0 / 3.25），均 col>2.5 不压机身

### 2F (16-24m): 2 reanim-sam constructor 一字排

机身 row 0.75..2.0 cell（真实长 10m；北边内缩 0.75 cell 给 back 进料巷），in-0 在北、out-0 在南；reSAM 收集 belt 走机身南侧 row≈2.5 cell（机身 front 之外、真实空隙，不穿机身 §原则3）。平面 row/col 统一用 cell 单位（1 cell=8m）；楼层安装高度 z 16-24m。

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬─────┐
 0      │  raw-SAM 360 in: left Wall Inlet h=20m row=0     │
        │   ──┬──────────┬── splitter → R1/R2 in-0(back)   │
 4      │     ↓ in-0     ↓ in-0   (进料巷 row0-4)          │
        │┌───────┐ ┌───────┐                               │
 8      ││  R1   │ │  R2   │  2 reanim-sam constructor     │
        ││reanim │ │reanim │  8m W x 10m L x 8m H          │
12      ││ 8x10  │ │ 8x10  │  in-0 back(N), out-0 front(S) │
        ││  v    │ │  v    │  150% = 45/min each (90 tot)  │
16      │└───┬───┘ └───┬───┘                               │
        │    ↓ out-0   ↓ out-0                             │
20      │──── reSAM collect 90 (row≈2.5cell, 机身南侧) ────│
        │         │  splitter 1→2: 60 + 30                 │
24      │ 60→reSAM60 riser 两端@(3.25,4)→1F in-2(z24→0)    │
        │ 30→reSAM30 riser 两端@(3.75,2.5)→roof B5(z24→35) │
28      │ collect/overflow belt 走机身南侧 row 2.5 真实空隙│
        │ (机身 row 0.75-2.0，belt 在 front 之外不穿机身)  │
32      │ riser 纯垂直；splitter→riser 顶为独立水平 belt 段│
        │ lift 列 col 3.25/3.75（避开机身投影与 1F riser） │
36      │ T6 saturated; T7-T9 unchanged 2+1=3 (uplift 1x)  │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴─────┘
```

- R1/R2 占 **col 0-2**（2×8m）、row 0.75-2.0 cell（机身真实 8×10m，北侧 row 0-0.75 cell 留 back 进料巷），剩 col 2-5 空地
- raw-SAM 360 由左 Wall Inlet 进 → splitter → R1/R2 in-0(back, 北)；in-0 进料垂直向下入 back 端口（§2-1 进料巷）
- 输出 90/min reSAM 在机身南侧 row≈2.5 cell collect belt（走两排 front 之外的真实空隙，不穿机身 §原则3）→ splitter 1→2：
  - 60 → **reSAM60 riser（两端均 @(3.25,4)，纯垂直 z24→0m）** → 落地后独立水平 belt 段绕进 1F manufacturer in-2
  - 30 → **reSAM30 riser（两端均 @(3.75,2.5)，纯垂直 z24→35m）** → 屋顶 B5 merger
- splitter→各 riser 顶端的水平位移为**独立水平 belt 段（转弯相）**；2 条 riser 各占独立 col（3.25 / 3.75），均 col>2（机身东缘），不压机身投影

### 屋顶 (35-40m): B3 smart-splitter (取 wire+pipe 80) + B5 merger (注 reSAM 30 + fluct 10)

屋顶 6 条总线 belt 按子 cell 行距排开（§2-8）；B3 smart splitter 取料后经独立水平 belt 段送到 B3 riser 顶（@2.75,4），riser 纯垂直降到 1F 同坐标 (2.75,4)，落地后由 1F 南侧 manifold 独立水平 belt 段绕进 front。平面 row/col 统一用 cell 单位（1 cell=8m）；高度单独标 z=…m。

> 图注：横向为示意，机器/设备真实 x 坐标以正文坐标表为准；ASCII 中 reSAM30 riser top 画在 y12 行仅为版面避让，其**真实 row=2.5**（与 merger row 2.5 同行），落点直接进 merger，**无 belt 回折**。

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬─────────┐
 0      │ o B1 ───────────────────────────────────────── o     │
        │ o B2 ──────────────────────┐fluct riser top    o     │
 4      │ o B3 ─[smart-split wire50+pipe30]─80─┐ @(3.0,0.5)    │
        │            belt(转弯相)→B3 riser top─┘               │
 8      │                  B3 riser top @(2.75,4)──┐           │
        │                  ↓纯垂直降到 1F 同坐标(2.75,4)       │
12      │   (reSAM30 riser top 真实 row=2.5，见 y20 merger 行) │
        │              ↑ 从 2F 上行(z24→35)，落点同 merger row │
16      │ o B4 ───────────────────────────────────────── o     │
        │                                                      │
20      │ o B5 ──[merger@(3.0,2.5)←reSAM30@(3.75,2.5)]─40─ o   │
        │   ↑ reSAM30 riser top 落 row=2.5 同 merger 行，直进  │
24      │  in: fluct riser top@(3.0,0.5)·reSAM30@(3.75,2.5)    │
        │  各 riser 经独立水平 belt 段(转弯相)汇入 merger      │
28      │ o B6 ───────────────────────────────────────── o     │
        │                                                      │
32      │ B7/B8 reserved (T7+ slots, BP11 stays 1.0x)          │
36      │ riser top 各占独立 col(2.75/3.0/3.75)落 belt 空隙    │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴─────────┘
```

- B3 smart-splitter 双 filter: wire 50 + pipe 30 = 80 → 独立水平 belt 段送到 **B3 riser 顶 @(2.75,4)**，riser **两端同坐标 (2.75,4)** 纯垂直降到 1F，落地后由 1F 南侧 manifold 独立水平 belt 段绕进 manufacturer in-0/in-1（§原则2 riser 与水平段分相）
- B5 merger @(3.0,2.5) 注入 reSAM 30 + SAM-fluctuator 10 = 40 mainNode；2 条进料 riser 顶端各占独立 col（**fluct out riser @(3.0,0.5)**、**reSAM30 riser @(3.75,2.5)**），各经独立水平 belt 段汇入 merger，riser 顶端落在 belt 轴线空隙。其中 **reSAM30 riser top row=2.5 已对齐 merger row 2.5**（同侧落点），仅 col 错 0.75 cell 的纯水平短段进 merger，无 belt 回折
- 4 条 lift riser 全部 col 互不相同（B3@2.75 / fluct@3.0 / reSAM60@3.25 / reSAM30@3.75），各 riser 两端 (col,row) 完全一致，无两条 riser 共用 (col,row) → 任何 z 区间均无 3D 重叠（§原则1）
- BP11 是**唯一全 T6/T9 不变的蓝图**（uplift 1.0x），3 台已物理满载，无 Power Switch 控制需求

## 建造步骤

1. **1F (z 0-12m)**: 1 台 SAM 波动器 manufacturer，**facing=south**（input front 朝南 row≈2.5 cell，output back 朝北 row≈0.5 cell）；机身北边内缩 0.5 cell 给 output riser，南侧 row 3.25-5 cell 留水平进料 manifold 平面（平面 row/col 统一用 cell 单位，1 cell=8m；高度单独标 z=…m）
2. **3 路输入分配（riser 纯垂直 + 水平段分相，§原则2）**:
   - 屋顶 smart splitter (B3) 取 电线 50 + 钢管 30 → 独立水平 belt 段送到 **B3 riser 顶 @(2.75,4)** → riser **两端同坐标 (2.75,4)** 纯垂直降到 1F → 落地后在 1F 南侧 manifold 平面独立水平 belt 段绕进 manufacturer front in-0/in-1（垂直 riser 与水平转弯相分两段）
   - 重生 SAM 60：从 2F constructor 输出 → **reSAM60 riser（两端同坐标 @(3.25,4)）**纯垂直下到 1F → 南侧 manifold 独立水平 belt 段 → manufacturer in-2 槽
3. **1F → 2F**: 4m 地基 (12-16m)
4. **2F (16-24m)**: 2 台重生 SAM constructor 一字排
5. **SAM 矿石进料**: 左 Wall Inlet (h=20m, row=0) → splitter → 2 台 in-0
6. **2F 输出 splitter (90/min)**（collect belt 走机身南侧真实空隙，不穿机身 §原则3）:
   - 60 → **reSAM60 riser（两端同坐标 @(3.25,4)）** 下到 1F SAM 波动器 in-2
   - 30 → **reSAM30 riser（两端同坐标 @(3.75,2.5)）** 上到屋顶 merger 注 B5
7. **SAM 波动器输出**: manufacturer out-0 (back, 北边 row≈0.5 cell) → 向北独立水平 belt 段引到 **fluct out riser @(3.0,0.5)** → riser 纯垂直升到屋顶 → 独立水平 belt 段汇入 B5 merger（10/min mainNode）
8. **屋顶 (35-40m)**: 6 belt 直通 + B3 smart splitter + B5 merger
9. **Power Switch**: 无（3 台全 T6 通电；BP11 不需要 Power Switch 分网，T7-T9 维持现状）

## Tier 7+ 启用流程

**无操作**：BP11 物理建造 = T9 满载 = 3 台全通电，T7-T9 不增加机器、不变 shard、不需要翻 Switch。

## 验证

- [ ] **3 台全部物理放置且全部通电**（T6 已满载）
- [ ] manufacturer **facing=south**（input front 南、output back 北）
- [ ] 4 输入位置正确（电线 50 + 钢管 30 + 重生 SAM 60 + 空槽 in-3）
- [ ] SAM 矿石进料 **360/min**（单 Mk4 belt 480 上限内；非 600 T9 上限）
- [ ] **每条 lift riser 两端 (col,row) 完全一致**：B3@(2.75,4)·reSAM60@(3.25,4)·reSAM30@(3.75,2.5)·fluct@(3.0,0.5)
- [ ] **4 条 riser col 互不相同**（2.75/3.0/3.25/3.75），无两条共用 (col,row) → 任何 z 区间无 3D 重叠
- [ ] riser 纯垂直；splitter↔riser 顶、riser 底↔机器端口的水平位移均为**独立水平 belt 段（转弯相）**，未混入 riser 坐标
- [ ] 各 riser col 均 >2.5（1F 机身 col≤2.5）且 >2（2F 机身 col≤2），不穿任何楼层机身投影
- [ ] B5 + 40 流量在容量内
- [ ] 整个 BP11 无 Power Switch（3 台全通电，符合统一模式的退化情形）

### 几何自检（本轮 lift 坐标修复）

- **机器矩形均在 5×5 cell（40×40m）内**：1F manufacturer col 0-2.5 / row 0.5-3.25 cell ✓；2F R1/R2 col 0-2 / row 0.75-2.0 cell ✓（平面坐标统一 cell；1 cell=8m）
- **同层无 AABB 重叠**：1F 仅 1 台 manufacturer（无可重叠对象）✓；2F R1 占 col 0-1、R2 占 col 1-2，col 区间相邻不重叠，row 同段但 col 错开 ✓
- **各 lift riser 占互不相同 col**：B3@2.75 / fluct@3.0 / reSAM60@3.25 / reSAM30@3.75，4 条 col 全异 → 不会在任何 z 区间 3D 重叠（§原则1）✓
- **riser 不穿其它楼层机身**：所有 riser col≥2.75 > 1F 机身东缘 col=2.5、> 2F 机身东缘 col=2，全部落在东侧 lift 通道内 ✓
- **collect/overflow belt 不穿机身**：2F reSAM collect belt 走 row≈2.5 cell（机身 front row≤2.0 之外的真实空隙）✓；1F 进料 belt 走南侧 manifold 平面 row 3.25-5 cell（机身 row≤3.25 之外）✓
- **2D 投影说明**：屋顶 belt 与 1F/2F 机身、各 riser 处于不同 z 高度（屋顶 35-40m / riser 跨层），2D 俯视图中的列向交叠为投影，非同层碰撞（§原则6）
