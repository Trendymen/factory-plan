# BP14 重型模块框架 + 电脑 (C6)

## 概要

- **集群**: C6 装配（紧贴 BP13 之后）
- **规格**: Mk2 **3 实例**（BP14a + BP14b + BP14c，每实例 2 manufacturer × 2 层，因为 manufacturer 20×22m 占地大）
- **机器**: **6 manufacturer 一次物理建造到位**（BP14a 1F HMF + 2F 电脑 = 2 台；BP14b 1F+2F 各 1 电脑 = 2 台；BP14c 1F+2F 各 1 电脑 = 2 台）
- **激活时间线**（仅翻 Power Switch + 插 Power Shard，不动结构）:
  - T6 → 2 台通电（BP14a 1F HMF + BP14b 1F 电脑）
  - T7 → 4 台通电（+BP14a 2F 电脑 + BP14c 1F 电脑）
  - T8 → 5 台通电（+BP14b 2F 电脑）
  - T9 → 6 台通电（+BP14c 2F 电脑，满载）
- **产能**: T6 HMF 2/min + 电脑 2.5/min / T9 HMF 2/min + 电脑 12.5/min

> **核心设计原则**：**6 台 manufacturer 在 T6 阶段就全部摆好 + belt/manifold/电网/Power Switch 全部接好**。后续升 Tier 时**不重新放机器、不重新拉 belt**——只需 (1) 翻对应 Power Switch (2)（如需要）插 Power Shard (3) 调超频百分比。

## 机器超频清单（T6，Plan C ≤250%）

| 配方 | 物理 | T6 通电 | 超频 | 单台产能 (/min) | Power Shard/通电台 |
|---|---:|---:|---:|---:|---:|
| heavy-modular-frame (manufacturer) | 1 | **1** | 100.0% | 2.0 | 0 |
| computer (manufacturer) | 5 | **1** | 100.0% | 2.5 | 0 |
| **合计 (T6)** | 6 | 2 | — | HMF 2 + 电脑 2.5 = **4.5** | **0** |

> T6 时未通电的 4 台 manufacturer（BP14a 2F、BP14b 2F、BP14c 1F+2F）：物理建好、belt 接好、shard 槽**空着**、Power Switch **关**，完全不耗电不产出。<br>
> T9 满载 6 台均 100%（电脑配方无需超频），**0 Power Shard 总需求**（manufacturer 满载已能覆盖 T9 需求）。

> **机器朝向统一**：6 台 manufacturer **一律 `facing=south`**——输入 4 槽在 **front（南侧，机身南边界 y=26m 即 row≈13 一线）**，输出 out-0 在 **back（北侧，row=0 一线）**。本 BP 不使用任何「facing=north / port reversed」布局。

## 物料 I/O

| 方向 | 物料 | 流量 (T6/T9) | 路径 |
|---|---|---|---|
| **HMF 输入**（manufacturer 4 槽 front 南侧）| | | |
| 输入 | 模块化框架 | 10 / 10 | **集群内部** ← BP13 右 Wall Outlet (z=4m) → 南侧进料巷转弯相 → front in |
| 输入 | 包裹工业梁 | 10 / 10 | **集群内部** ← BP13 (z=8m) → 南侧进料巷转弯相 → front in |
| 输入 | 钢管 | 40 / 40 | **屋顶 B3** ← BP5 → smart splitter → lift-DOWN → 南侧进料巷 → front in |
| 输入 | 螺丝 | 240 / 240 | **屋顶 B2** ← BP3 → smart splitter → lift-DOWN → 南侧进料巷 → front in |
| **电脑 输入**（manufacturer 3 槽 + 1 空 front 南侧）| | | |
| 输入 | 电路板 | 10 / 50 | **屋顶 B4** ← BP8 → programmable splitter → lift-DOWN → front in |
| 输入 | 线缆 | 20 / 100 | **屋顶 B4** ← BP7 → programmable splitter → lift-DOWN → front in |
| 输入 | 塑料 | 50 / 250 | **屋顶 B4** ← BP9 → programmable splitter → lift-DOWN → front in |
| **输出**（manufacturer out-0 back 北侧）| | | |
| 输出 | HMF → B5 终端 | 2 / 2 | back out-0 (row=0) → 北侧 ≥4m 净空 lift-UP → 屋顶 merger → B5 |
| 输出 | 电脑 → B5 终端 | 2.5 / 12.5 | back out-0 (row=0) → 北侧 ≥4m 净空 lift-UP → 屋顶 merger → B5 |

**屋顶总线接入**:
- 取自 B2 (螺丝 240)、B3 (钢管 40)、B4 (电路板 50 + 线缆 100 + 塑料 250 = 400 T9 上限)
- 注入 B5 (HMF 2 + 电脑 12.5 = 14.5 mainNode T9)

## 楼层占用

| 实例 | 层 | 物理 | T6 通电 |
|---|---|---:|---:|
| **BP14a** | 1F HMF manufacturer | 1 | **1** |
| **BP14a** | 2F 电脑 manufacturer | 1 | 0 |
| **BP14b** | 1F 电脑 manufacturer | 1 | **1** |
| **BP14b** | 2F 电脑 manufacturer | 1 | 0 |
| **BP14c** | 1F 电脑 manufacturer | 1 | 0 |
| **BP14c** | 2F 电脑 manufacturer | 1 | 0 |
| **小计** | | **6** | **2** |

> manufacturer 20m × 22m × 12m（registry 实测确认），单实例 1F+2F 各 1 台（1F 0-12m + 4m 地基 + 2F 16-28m，剩 7m 给屋顶）。
> **机器南移留北侧 output lift 净空**：facing=south 时 output out-0 在 back（北边界）。机器从北墙 y=0 南移 0.5 cell（机身占 y=4-26m），北侧 0-4m 留作 out-0 → lift-UP 的净空巷。
> T9 满载 6 台 = 2 台 × 3 实例（每实例 1F+2F 各 1 台 manufacturer）。

## 俯视图（按实际比例，每实例每层独立）

**比例约定**（同 BP02）：1 字符 = 1m 横向；1 行 = 2m 纵向；蓝图 40×40m = 40 字符 × 20 行。

**图例**：
- `*` 后缀 = T6 通电；无 `*` = T7+ Power Switch 关（物理已建，不耗电不产出）
- `20x22` = 20m 宽 × 22m 长（横向 2.5 cell × 纵向 11 行）
- `^` = out-0 输出 back 朝北 (row=0) / `v v v v` = 4 输入 front 朝南 (机身南边 y=26m 一线)；4 个 `v` 对应 registry front 端口偏移 **3/7/11/15m**（in-0/1/2/3，自机身西边界起算）
- `L` = lift 落点 (3.5×2m 包围盒)；输入 lift 走南侧进料巷、输出 lift 走北侧净空巷
- **facing=south 统一**：输入 4 槽在 front（南），输出 1 槽在 back（北）；机身南移占 y=4-26m
- *(下列各图横向为示意，机器/设备真实 x 坐标以正文坐标表与 registry 端口偏移 3/7/11/15m 为准)*

### BP14a 1F (0-12m): 1 HMF manufacturer — T6 通电

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │  out-0 ───────────────► Lo  out-0 -> roof B5    │ ← 北侧 0-4m output lift 净空巷
 2      │┌───────────────────┐    L   HMF 2/min mainNode  │   (out-0 水平东引到 col3.5 再 lift-UP)
 4      ││         ^ (back N) │        T6 ON (Network A)   │
 6      ││  HMF* manufacturer │                           │
 8      ││  20m W x 22m L     │   front in 0-3 (south,     │
10      ││  facing=south      │   y=26m 一线):             │
12      ││  (2.5 cell x 11行) │     in-0 screw 240         │
14      ││                    │     in-1 steel-pipe 40     │
16      ││                    │     in-2 modular-frame 10  │
18      ││                    │     in-3 encased-beam 10   │
20      ││                    │                            │
22      ││                    │                            │
24      ││                    │                            │
26      │└───v───v───v───v───┘                            │
        │   Ls  Lp  Lf  Lb  ← 南侧进料巷 (y=26-40m)        │
30      │  Ls=screw  Lp=pipe (屋顶 B2/B3 smart split DOWN) │
32      │  Lf=frame  Lb=beam (BP13 左 Wall Inlet z=4/8m)   │
34      │  4 路 lift 落点 row13-14、各转弯相→垂直进 front  │
36      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- 1 台 HMF manufacturer，**T6 通电**（Network A），`facing=south`（输入 front 南、输出 back 北）
- 机身南移占 y=4-26m（col 0-2.5），北墙 y=0-4m 留 output lift 净空巷
- out-0 在 back（北边界 row=0）→ 沿北巷水平东引到 col=3.5（避开正上方 2F 机身投影）→ `Lo` lift-UP 至屋顶 merger
- 4 输入从南侧进料巷 (y=26-40m) 经各自 lift 落点 + 转弯相 + 垂直相进 front in-0/1/2/3，T6 一次接好

### BP14a 2F (16-28m): 1 电脑 manufacturer — T6 Power Switch 关

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │  out-0 ──────────────────► Lo2  out-0 -> roof B5│ ← 北侧 0-4m output lift 净空巷
 2      │┌───────────────────┐         L   computer 2.5   │   (2F lift 用 col=4.0，避开 1F lift col=3.5)
 4      ││         ^ (back N) │             T6 Switch OFF  │
 6      ││ Computer manufact. │             → T7 翻 ON (B) │
 8      ││  20m W x 22m L     │   front in 0-3 (south,     │
10      ││  facing=south      │   y=26m 一线):             │
12      ││  (2.5 cell x 11行) │     in-0 circuit-board 10  │
14      ││                    │     in-1 cable 20          │
16      ││                    │     in-2 plastic 50        │
18      ││                    │     in-3 EMPTY (3 料配方)  │
20      ││                    │                            │
22      ││                    │                            │
24      ││                    │                            │
26      │└───v───v───v───.───┘                            │
        │   Lc  Ll  Lp  ← 南侧进料巷 (y=26-40m)            │
30      │  Lc=circuit-board Ll=cable Lp=plastic            │
32      │  屋顶 B4 程序分流器 → lift-DOWN 落 2F (35→22m)   │
34      │  3 路 lift 落点 row13-14、转弯相→垂直进 in-0/1/2 │
36      │  in-3 无 lift（电脑配方无第 4 物料）             │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- 1 台电脑 manufacturer **物理建造完整**，T6 阶段 Power Switch **关**；`facing=south`
- 机身南移占 y=4-26m（col 0-2.5），与 1F 同 footprint 叠层
- out-0 在 back（北边界）→ 北巷水平东引到 **col=4.0**（区别于 1F 输出 lift 的 col=3.5，两 lift 3.5×2m 包围盒不重叠、互不穿对方机身投影）→ `Lo2` lift-UP 至屋顶 merger
- 3 路输入由屋顶 B4 程序分流器分一路 **lift-DOWN 直落 2F 南侧进料巷**（35m→22m），不走「1F 回抬」往返；接 in-0/1/2（in-3 空）
- 通电节奏：T7 翻 Network B Switch ON

### BP14b 1F (0-12m): 1 电脑 manufacturer — T6 通电

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │  out-0 ───────────────► Lo  out-0 -> roof B5    │ ← 北侧 0-4m output lift 净空巷
 2      │┌───────────────────┐    L   computer 2.5/min    │
 4      ││         ^ (back N) │        T6 ON (Network A)   │
 6      ││ Computer* manufact │                           │
 8      ││  20m W x 22m L     │   front in 0-3 (south,     │
10      ││  facing=south      │   y=26m 一线):             │
12      ││  (2.5 cell x 11行) │     in-0 circuit-board 10  │
14      ││                    │     in-1 cable 20          │
16      ││                    │     in-2 plastic 50        │
18      ││                    │     in-3 EMPTY             │
20      ││                    │                            │
22      ││                    │                            │
24      ││                    │                            │
26      │└───v───v───v───.───┘                            │
        │   Lc  Ll  Lp  ← 南侧进料巷 (y=26-40m)            │
30      │  Lc=circuit-board Ll=cable Lp=plastic            │
32      │  屋顶 B4 程序分流器 → lift-DOWN 落 1F            │
34      │  3 路 lift 落点 row13-14、转弯相→垂直进 in-0/1/2 │
36      │  in-3 无 lift（电脑配方无第 4 物料）             │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- 1 台电脑 manufacturer，**T6 通电**（Network A），`facing=south`
- 机身南移占 y=4-26m；out-0 (back 北) → 北巷东引 col=3.5 → `Lo` lift-UP 屋顶 merger
- 3 路输入由屋顶 B4 程序分流器 lift-DOWN → 南侧进料巷 → in-0/1/2（in-3 空）

### BP14b 2F (16-28m): 1 电脑 manufacturer — T6 Power Switch 关

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │  out-0 ──────────────────► Lo2  out-0 -> roof B5│ ← 北侧 0-4m output lift 净空巷
 2      │┌───────────────────┐         L   computer 2.5   │   (2F lift 用 col=4.0，避开 1F lift col=3.5)
 4      ││         ^ (back N) │             T6 Switch OFF  │
 6      ││ Computer manufact. │             → T8 翻 ON (C) │
 8      ││  20m W x 22m L     │   front in 0-3 (south,     │
10      ││  facing=south      │   y=26m 一线):             │
12      ││  (2.5 cell x 11行) │     in-0 circuit-board 10  │
14      ││                    │     in-1 cable 20          │
16      ││                    │     in-2 plastic 50        │
18      ││                    │     in-3 EMPTY             │
20      ││                    │                            │
22      ││                    │                            │
24      ││                    │                            │
26      │└───v───v───v───.───┘                            │
        │   Lc  Ll  Lp  ← 南侧进料巷 (y=26-40m)            │
30      │  Lc=circuit-board Ll=cable Lp=plastic            │
32      │  屋顶 B4 程序分流器 → lift-DOWN 直落 2F (35→22m) │
34      │  3 路 lift 落点 row13-14、转弯相→垂直进 in-0/1/2 │
36      │  in-3 无 lift（电脑配方无第 4 物料）             │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- 1 台电脑 manufacturer **物理建造完整**，T6 Power Switch **关** → T8 翻 ON（Network C）；`facing=south`
- 机身南移占 y=4-26m；out-0 (back 北) → 北巷东引 col=4.0（避开 1F lift col=3.5）→ `Lo2` lift-UP 屋顶 merger
- 3 路输入由屋顶 B4 程序分流器 lift-DOWN **直落 2F**（不走 1F 回抬往返）→ 南侧进料巷 → in-0/1/2

### BP14c 1F (0-12m): 1 电脑 manufacturer — T6 Power Switch 关

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │  out-0 ───────────────► Lo  out-0 -> roof B5    │ ← 北侧 0-4m output lift 净空巷
 2      │┌───────────────────┐    L   computer 2.5/min    │
 4      ││         ^ (back N) │        T6 Switch OFF       │
 6      ││ Computer manufact. │        → T7 翻 ON (B)      │
 8      ││  20m W x 22m L     │   front in 0-3 (south,     │
10      ││  facing=south      │   y=26m 一线):             │
12      ││  (2.5 cell x 11行) │     in-0 circuit-board 10  │
14      ││                    │     in-1 cable 20          │
16      ││                    │     in-2 plastic 50        │
18      ││                    │     in-3 EMPTY             │
20      ││                    │                            │
22      ││                    │                            │
24      ││                    │                            │
26      │└───v───v───v───.───┘                            │
        │   Lc  Ll  Lp  ← 南侧进料巷 (y=26-40m)            │
30      │  Lc=circuit-board Ll=cable Lp=plastic            │
32      │  屋顶 B4 程序分流器 → lift-DOWN 落 1F            │
34      │  3 路 lift 落点 row13-14、转弯相→垂直进 in-0/1/2 │
36      │  in-3 无 lift（电脑配方无第 4 物料）             │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- 1 台电脑 manufacturer **物理建造完整**，T6 Power Switch **关** → T7 翻 ON（Network B）；`facing=south`
- 机身南移占 y=4-26m；out-0 (back 北) → 北巷东引 col=3.5 → `Lo` lift-UP 屋顶 merger
- 3 路输入由屋顶 B4 程序分流器 lift-DOWN → 南侧进料巷 → in-0/1/2（in-3 空）

### BP14c 2F (16-28m): 1 电脑 manufacturer — T6 Power Switch 关

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │  out-0 ──────────────────► Lo2  out-0 -> roof B5│ ← 北侧 0-4m output lift 净空巷
 2      │┌───────────────────┐         L   computer 2.5   │   (2F lift 用 col=4.0，避开 1F lift col=3.5)
 4      ││         ^ (back N) │             T6 Switch OFF  │
 6      ││ Computer manufact. │             → T9 翻 ON (D) │
 8      ││  20m W x 22m L     │   front in 0-3 (south,     │
10      ││  facing=south      │   y=26m 一线):             │
12      ││  (2.5 cell x 11行) │     in-0 circuit-board 10  │
14      ││                    │     in-1 cable 20          │
16      ││                    │     in-2 plastic 50        │
18      ││                    │     in-3 EMPTY             │
20      ││                    │                            │
22      ││                    │                            │
24      ││                    │                            │
26      │└───v───v───v───.───┘                            │
        │   Lc  Ll  Lp  ← 南侧进料巷 (y=26-40m)            │
30      │  Lc=circuit-board Ll=cable Lp=plastic            │
32      │  屋顶 B4 程序分流器 → lift-DOWN 直落 2F (35→22m) │
34      │  3 路 lift 落点 row13-14、转弯相→垂直进 in-0/1/2 │
36      │  in-3 无 lift（电脑配方无第 4 物料）             │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- 1 台电脑 manufacturer **物理建造完整**，T6 Power Switch **关** → T9 翻 ON（Network D，满载）；`facing=south`
- 机身南移占 y=4-26m；out-0 (back 北) → 北巷东引 col=4.0（避开 1F lift col=3.5）→ `Lo2` lift-UP 屋顶 merger
- 3 路输入由屋顶 B4 程序分流器 lift-DOWN **直落 2F**（不走 1F 回抬往返）→ 南侧进料巷 → in-0/1/2

### 屋顶 (35-40m): B1-B6 + 3 splitter + 1 merger（每实例屋顶相同）

**屋顶 6 条总线按子 cell 行距排开**（§2-8：35-40m 同层、row≈0.25/0.75/…，约 4m 一条，非高度堆叠）：

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 2      │ o B1 ──────────────────────────────────────── o │ row≈0.25
 6      │ o B2 ──[smart split: screw 240]────────────── o │ row≈0.75
10      │ o B3 ──[smart split: steel-pipe 40]────────── o │ row≈1.25
14      │ o B4 ──[prog split: CB10+Cable20+Plastic50]── o │ row≈1.75  ← 唯一一处程序分流器
18      │ o B5 ──[merger << lift-UP mainNode]────────── o │ row≈2.25
22      │ o B6 ──────────────────────────────────────── o │ row≈2.75
26      │                                                 │
28      │ B2/B3 smart split → lift-DOWN：screw/pipe 落 1F │
        │ B4 prog split（一处）→ lift-DOWN：各层各取 1 路 │
32      │   CB+cable+plastic，1F/2F 一律向下取料           │
34      │ lift-UP (来自各层 out-0)：HMF 2 + 电脑 2.5~12.5  │
36      │   → B5 merger（按通电台数级联，merger 3in1out）  │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- BP14a 取 B2 (240 螺丝) + B3 (40 钢管) + 集群内部模框 10 + 包裹梁 10
- BP14b/c 取 B4 (电路板 + 线缆 + 塑料，按通电台数分配)
- **B4 程序分流器只在屋顶设一处**：各楼层（1F/2F）一律 lift-DOWN 取料，消除「屋顶 vs 1F splitter」归属矛盾
- B5 merger 注入：T6 = 4.5 / T9 = 14.5 mainNode（多路 out-0 汇流用 merger 3in1out 级联）

## Power Switch 分网

把 6 台 manufacturer 拆 4 个独立 Power Network，由 4 个 Power Switch 控制。**4 个 Switch 全部 T6 一次安装好**，只是 T6 阶段只合 Network A。

| 网 | 范围 | 数量 | T6 状态 | 升级触发 |
|---|---|---:|---|---|
| Network A | BP14a 1F HMF + BP14b 1F 电脑 | 2 | **ON** | — |
| Network B | BP14a 2F 电脑 + BP14c 1F 电脑 | 2 | OFF | T7 翻 ON |
| Network C | BP14b 2F 电脑 | 1 | OFF | T8 翻 ON |
| Network D | BP14c 2F 电脑 | 1 | OFF | T9 翻 ON |

> Power Switch 物理位置放每实例屋顶 **东南角空区 (col=4.5, row=3-4)**，避开输出 lift 列 (col=3.5/4.0) 与 B5 merger 脚印，4 个 Switch 各自就近，方便玩家在场内一眼区分。

## 建造步骤

1. **框架（×3 实例）**：BP14a/b/c 各 5×5 cell × 4 cell 高（40×40×32m），紧贴排列
2. **BP14a 1F (0-12m)**：放 1 台 HMF manufacturer，**`facing=south`**，机身南移占 col 0-2.5 / **y=4-26m**（北墙 0-4m 留 output lift 净空巷）
3. **BP14a 1F belt**:
   - 螺丝 240：屋顶 B2 smart splitter → lift-DOWN → 南侧进料巷 → front in-0
   - 钢管 40：屋顶 B3 smart splitter → lift-DOWN → 南侧进料巷 → front in-1
   - 模框 10 + 包裹梁 10：左 Wall Inlet (**z=4m + z=8m**) ← BP13 集群内 → **下移到机身南侧 row≥2.75 (y≥22m) 落料** → 南侧空地转弯相 + 垂直相 → front in-2 + in-3
   - HMF out-0 (back, row=0) → 北巷水平东引到 col=3.5（避开正上方 2F 机身投影）→ lift-UP → 屋顶 merger 注 B5
4. **BP14a 1F 地基**：z=12-16m 铺 4m 厚地基（1F 机身 z=0-12m 之上、2F 机身 z=16-28m 之下）
5. **BP14a 2F (16-28m)**：放 1 台电脑 manufacturer（同布局，**`facing=south`**，机身南移占 y=4-26m）
6. **BP14a 2F belt**:
   - 电路板 + 线缆 + 塑料：**屋顶 B4 程序分流器分一路 lift-DOWN 直落 2F**（35m→22m，不走 1F 回抬）→ 南侧进料巷 manifold → front in-0/1/2（in-3 空）
   - out-0 (back) → 北巷东引到 **col=4.0**（避开 1F 输出 lift 的 col=3.5）→ lift-UP → 屋顶 merger 注 B5
7. **BP14b/c 类似**：1F+2F 各 1 台电脑 manufacturer，3 路输入全部来自屋顶 B4 程序分流器 lift-DOWN（screw/pipe 不需要）；1F 输出 lift col=3.5、2F 输出 lift col=4.0
8. **屋顶 (35-40m)**：6 条 Mk5 直通 belt（子 cell 行距排开，§2-8）+ 2 smart splitter (B2/B3) + **1 程序分流器 (B4)** + B5 merger 级联 (3in1out)
9. **Power Switch ×4**：按上面"Power Switch 分网"表布置 Network A/B/C/D；T6 只合 A，B/C/D 全部 OFF
10. **Power Shard（T6 阶段）**：**0 shard**（电脑/HMF 100% 即可，无需超频）；shard 槽全部留空

## Tier 7+ 启用流程（仅翻 Switch + 插 shard，不动结构 / 不动 belt）

| Tier | 操作 | 通电总数 | 电脑产能 |
|---|---|---:|---:|
| T7 | 翻 Network B Switch ON → BP14a 2F + BP14c 1F 各启电脑（100% 无 shard）| 4 | 7.5 |
| T8 | 翻 Network C Switch ON → BP14b 2F 启电脑（100% 无 shard）| 5 | 10.0 |
| T9 | 翻 Network D Switch ON → BP14c 2F 启电脑（100% 无 shard），**电脑满载 5×2.5=12.5** | 6 | 12.5 |

> B4 已 Mk5；T9 时 B4 来料：电路板 50 / 线缆 100 / 塑料 250 = 400/min = 51% Mk5 ✓

## 多实例侧墙续接

BP14a/b/c 在机器层**无跨实例短 belt**（HMF 和电脑两条产线独立）。所有进料从屋顶 B2/B3/B4 取，所有出料注 B5。

集群内部短 belt 仅 1 处：**BP13 → BP14a**（模框 + 包裹梁），通过 BP14a 蓝图的左 Wall Inlet 接收。

蓝图侧墙集群内 mount（机器层）：

| 安装高度 | 落料 row | 物料 | BP14a 左 Wall | BP14a 右 Wall | BP14b/c |
|---|---|---|---|---|---|
| z=4m | row≥2.75 (y≥22m) | 模块化框架 | **Inlet** ← BP13 | 悬空 | 不需要 |
| z=8m | row≥2.75 (y≥22m) | 包裹工业梁 | **Inlet** ← BP13 | 悬空 | 不需要 |

> **左 Wall Inlet 下移到机身南侧**：原 row=2.5 (y=20m) 落在机身投影 (y=4-26m) 内，改到 **row≥2.75 (y≥22m) 即机身南侧空地**，在南侧进料巷做转弯相 + 垂直相进 front in-2/in-3，不穿机身。`z=4m/8m` 为侧墙安装高度（与平面 row/col 分列，§2-7）。
> BP14a 紧贴 BP13 右侧，BP14b 紧贴 BP14a 右侧，BP14c 紧贴 BP14b 右侧。模框/包裹梁仅供 BP14a 的 HMF 消耗（10+10），BP14b/c 跑电脑不需要这两路。

## 验证

- [ ] **6 台 manufacturer 全部物理放置**（包括 T6 不通电的 4 台：BP14a 2F、BP14b 2F、BP14c 1F+2F）
- [ ] Belt manifold + lift 接到全部 6 台 in-0/1/2(/3)（不只是 T6 通电的 2 台）
- [ ] 4 个 Power Switch 一次建好，Network A 合上，B/C/D 断开
- [ ] T6 阶段 **0 Power Shard**（manufacturer 100% 即可）；shard 槽全部留空
- [ ] manufacturer **facing=south**（输入 front 朝南 / 输出 back 朝北），全 6 台一致
- [ ] 机身南移占 y=4-26m，北墙 0-4m 留 output lift 净空巷
- [ ] 1F 输出 lift col=3.5、2F 输出 lift col=4.0（错开 col，3.5×2m 包围盒不重叠、不穿对方机身投影）
- [ ] B4 程序分流器仅屋顶一处，各层一律 lift-DOWN 取料（无 1F vs 屋顶归属矛盾）
- [ ] BP14a 左 Wall Inlet 落料下移到机身南侧 row≥2.75（不穿机身），南侧转弯相+垂直相进 front
- [ ] HMF 4 输入正确（螺丝 240 / 钢管 40 / 模框 10 / 包裹梁 10）
- [ ] 电脑 4 槽 3 用 1 空（电路板 / 线缆 / 塑料 + 空）
- [ ] B2 上 240 螺丝来自 BP3（B1 取走 350，剩 B2 还能取 240）
- [ ] B4 已 Mk5（780/min）；程序分流器分配 CB+Cable+Plastic 上限 400/min = 51% Mk5 ✓
- [ ] B5 merger 出口 mainNode（T6 4.5 / T9 14.5）
- [ ] 3 实例 BP14a/b/c 紧贴排列，BP14a 左 Wall Inlet (z=4m+8m) 对齐 BP13 右 Wall Outlet
