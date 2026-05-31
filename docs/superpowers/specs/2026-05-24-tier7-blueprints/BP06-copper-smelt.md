# BP6 铜锭 + 铜金锭 (C3)

## 概要

- **集群**: C3 铜电链（紧贴 BP5 之后，C3 第一个）
- **规格**: Mk2 **3 实例**（BP6a + BP6b + BP6c，相同蓝图复制）
- **机器**: **每实例 11 smelter 一次物理建造到位**，3 实例共 **33 smelter**（铜锭 + 铜金锭混合）
- **激活时间线**（仅翻 Power Switch + 插 Power Shard）:
  - T6 → 7 台通电（仅 BP6a 部分网；其余 26 台 Switch 关）
  - T7 → 18 台通电
  - T8 → 26 台通电
  - T9 → 31 台通电（满载；剩 2 台备用）
- **产能 T6**: 铜锭 326.5/min · 铜金锭 74/min

> **核心设计原则**：33 台 smelter T6 一次物理建造到位（3 实例共用同一蓝图各 11 台）+ belt/manifold/电网/Power Switch 全部接好。后续升 Tier 只翻 Switch + 插 shard，不动结构、不重新拉 belt。

## 机器超频清单（T6，Plan C ≤250%）

| 配方 | 物理 | T6 通电 | 超频 | 单台产能 (/min) | Power Shard/通电台 |
|---|---:|---:|---:|---:|---:|
| copper-ingot (smelter) | 24 | **5** | 217.67% | 65.30 | 3 |
| caterium-ingot (smelter) | 9 | **2** | 246.67% | 37.0 | 3 |
| **合计 (T6)** | 33 | 7 | — | 326.5 + 74 = **400.5** | 5×3 + 2×3 = **21** |

> T6 未通电的 26 台 smelter：物理建好、belt 接好、shard 槽空着、Power Switch 关。<br>
> T9 满载 31 台（23 Cu + 8 Cat），每台 3 shard = **93 shard 总**；剩余 2 台（1 Cu + 1 Cat）保留备用。

## 物料 I/O

| 方向 | 物料 | 流量 (T6 / T9) | 路径 |
|---|---|---|---|
| 输入 | 铜矿石 | 326.5 / 1380 | 矿场直喂 → 左 Wall Inlet (h=4m row=2.5)；**T9 1380>1200 单 belt 上限 → 拆 2 条 Mk5/Mk6 并联（row=2.25/2.75）** |
| 输入 | 铜金矿石 | 222 / 888 | 矿场直喂 → 左 Wall Inlet (h=4m row=3.5)；caterium 3:1 配方（888 矿 → 296 锭） |
| 输出 | 铜锭 → BP7 | 326.5 / 1380 | 集群内部汇总 → 右 Wall Outlet (h=4m row=2.5) → BP6b → BP6c → BP7；**T9 1380>1200 → 拆 2 条 Mk5/Mk6 并联（row=2.25/2.75）** |
| 输出 | 铜金锭 → B6 | 74 / 296 | 侧墙续接 BP6c→BP6b→**BP6a**（h=4m row=3.5）→ 仅 BP6a 屋顶 merger lift-up → B6（→ BP10 caterium 锭快速线）|

> **流量自洽（1:1 / 3:1 配方）**：铜锭 1:1 配方，铜矿入料 = 铜锭出料（T6 326.5、T9 1380）。铜金锭（caterium-ingot）3:1 配方，铜金矿入料 = 铜金锭出料 × 3（T6 222=74×3、T9 888=296×3）。
>
> **侧墙墙口拆分**：T9 铜矿入料与铜锭出料均 1380/min，超过 Mk6 单 belt 1200 上限，左 Wall Inlet 与右 Wall Outlet 各拆 **2 条并联**（row=2.25 / 2.75）；铜金矿 888 < 1200，单条即可。拆分槽位 T6 即一次预埋，升 Tier 不重拉 belt。

**屋顶总线接入**: 注入 B6 (74 铜金锭，T9 296)；caterium 锭单一去向 = B6（供 BP10 快速线），不另走右墙 Outlet。

## 楼层占用

| 层 | 高度 | 内容（单实例）| 物理/实例 | T6 通电 (BP6a) | T6 通电 (BP6b/c) |
|---|---|---|---:|---:|---:|
| 1F | 0-10m | row 0 (5 Cu S1-S5) + row 2 (1 Cat G1) | 6 | **6** | 0 |
| 4m 地基 | 10-14m | 隔层 | — | — | — |
| 2F | 14-24m | row 0 (3 Cu S6-S8) + row 2 (2 Cat G2-G3) | 5 | **1** (仅 G2) | 0 |
| 屋顶 | 35-40m | B1-B6 + B6 merger | — | — | — |
| **合计/实例** | | | **11** | **7** | **0** |

> **T6 阶段**：BP6a 通电 7 台（1F 6 + 2F G2 = 7），BP6a 剩 4 台 Switch 关；BP6b、BP6c 整实例全关。所有 33 台 belt / lift / manifold / Power Switch 一次到位。

## 俯视图

**图例**：`*` = T6 通电 (BP6a)；无 `*` = 已建未通电（BP6a 余下 4 台 + BP6b/c 全部）；`v` = front (south) 输出

### 1F (0-10m): 6 smelter — BP6a 全部 T6 通电，BP6b/c 全关

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬──────┐
 0      │┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐                │
        ││ S1* ││ S2* ││ S3* ││ S4* ││ S5* │ row 0: 5 Cu    │
 4      ││ Cu  ││ Cu  ││ Cu  ││ Cu  ││ Cu  │ BP6a T6 ON     │
        ││ 6x9 ││ 6x9 ││ 6x9 ││ 6x9 ││ 6x9 │ (Network A)    │
 8      ││  v  ││  v  ││  v  ││  v  ││  v  │                │
10      │└─────┘└─────┘└─────┘└─────┘└─────┘                │
        │──── Cu ingot belt #1 h=2m row=2.5 ────────────────│
14      │┌─────┐                                            │
        ││ G1* │ row 2: 1 Cat                               │
18      ││ Cat │ BP6a T6 ON (Network B)                     │
        ││ 6x9 │                                            │
22      ││  v  │                                            │
        │└─────┘                                            │
26      │──── Cat ingot belt h=2m row=5.5 ──────────────────│
        │ 铜矿石进料：左 Wall Inlet h=4m row=2.5            │
32      │ 铜金矿石：左 Wall Inlet h=4m row=5.5              │
        │   manifold 喂全部 11 台 in-0（含 2F lift-up）     │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴──────┘
```

- BP6a 1F：S1-S5 + G1 全 6 台 T6 通电（`*`）
- BP6b/c 1F：物理同样布局，但 Power Switch 关，无 `*`

### 2F (14-24m): 5 smelter — BP6a 仅 G2 通电，其余 BP6 全关

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬──────┐
 0      │┌─────┐┌─────┐┌─────┐                              │
        ││ S6  ││ S7  ││ S8  │ row 0: 3 Cu                  │
 4      ││ Cu  ││ Cu  ││ Cu  │ BP6a T6 Switch OFF           │
        ││ 6x9 ││ 6x9 ││ 6x9 │ (Network C, T7 翻 ON)        │
 8      ││  v  ││  v  ││  v  │                              │
10      │└─────┘└─────┘└─────┘                              │
        │──── Cu ingot belt #3 h=16m row=2.5 ───────────────│
14      │┌─────┐┌─────┐                                     │
        ││ G2* ││ G3  │ row 2: 2 Cat                        │
18      ││ Cat ││ Cat │ G2: BP6a T6 ON (Network D)          │
        ││ 6x9 ││ 6x9 │ G3: T6 OFF (Network E, T8 翻 ON)    │
22      ││  v  ││  v  │                                     │
        │└─────┘└─────┘                                     │
26      │──── Cat ingot belt h=16m row=5.5 ─────────────────│
        │ 进料：lift-up 从 1F manifold                      │
32      │ 出料：lift-out-top 到 24m / 屋顶 merger           │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴──────┘
```

- BP6a 2F：仅 G2 通电；S6-S8 + G3 物理建好但 Power Switch 关
- BP6b/c 2F：物理同样布局，全部 Switch 关

### 屋顶 (35-40m): B1-B6 + B6 merger（铜金锭注入）

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬─────┐
 0      │ o B1 ────────────────────────────────────── o    │
 4      │ o B2 ────────────────────────────────────── o    │
 8      │ o B3 ────────────────────────────────────── o    │
12      │ o B4 ────────────────────────────────────── o    │
16      │ o B5 ────────────────────────────────────── o    │
20      │ o B6 ───[merger << caterium-ingot 74/T9 296]── o │
24      │                                                  │
28      │ B6 注入：仅 BP6a 屋顶 merger，集群 caterium 锭   │
32      │   经侧墙汇 BP6a 后 lift-up 上 35m 注入 B6        │
36      │ copper-ingot 不上屋顶：h=4m 右 Wall Outlet 出    │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴─────┘
```

> **铜金锭单一去向**：caterium 锭仅经侧墙续接 BP6c→BP6b→BP6a（h=4m row=3.5）汇集到 BP6a，再由 **BP6a 屋顶 merger** lift-up 注入 B6 总线（→ BP10 快速线）。BP6b/BP6c 不各自接 B6，也不走右墙 Outlet（右墙 Outlet 仅走铜锭）。

## 多实例侧墙续接

BP6 是**纯同向流**集群（铜锭/铜金锭都是 BP6a→BP6b→BP6c→ 下游 BP7）。详见设计文档 [§多实例集群侧墙 mount 对偶规则](../2026-05-24-tier7-blueprint-design.md#多实例集群侧墙-mount-对偶规则关键设计约定)。

| 高度 | 物料 | 左 Wall | 右 Wall | 流向 |
|---|---|---|---|---|
| h=4m row=2.5 | 铜锭 | **Inlet** | **Outlet**（T9 1380>1200 → 拆 2 槽 row=2.25/2.75）| BP6a→BP6b→BP6c→ 右出 → 下游 BP7 |
| h=4m row=3.5 | 铜金锭 | **Outlet**（汇往上游实例）| **Inlet**（仅 BP6b/c 收下游来料；BP6a 右口悬空）| BP6c→BP6b→**BP6a** → BP6a 屋顶 merger → B6 |

> **铜锭右墙高度统一为 h=4m**（与上表「侧墙 mount 对偶规则」一致，删除旧 I/O 表 h=24m 写法）：集群内部 4 条收集 belt 汇总后**下行**到 h=4m 右 Wall Outlet 出料，相邻实例 Auto Connect 高度一致。
>
> **铜金锭流向与铜锭相反**：铜金锭沿侧墙向上游（BP6c→BP6a）汇集，故左墙为 Outlet、右墙为 Inlet（与铜锭左 Inlet/右 Outlet 相反）。caterium 锭最终只在 BP6a 屋顶并入 B6，不从右墙离开集群。

## Power Switch 分网（每实例 5 网）

每个 BP6 实例 5 个独立 Power Network；3 实例 × 5 = **15 个 Power Switch 一次安装到位**。

| 网 | 范围（每实例）| 数量 | BP6a T6 | BP6b T6 | BP6c T6 | 升级触发 |
|---|---|---:|---|---|---|---|
| Network A | 1F S1-S5 (5 Cu) | 5 | **ON** | OFF | OFF | BP6b T7 / BP6c T8 |
| Network B | 1F G1 (1 Cat) | 1 | **ON** | OFF | OFF | BP6b T7 / BP6c T8 |
| Network C | 2F S6-S8 (3 Cu) | 3 | OFF | OFF | OFF | BP6a T7 / BP6b T8 / BP6c T9 |
| Network D | 2F G2 (1 Cat) | 1 | **ON** | OFF | OFF | BP6b T7 / BP6c T9 |
| Network E | 2F G3 (1 Cat) | 1 | OFF | OFF | OFF | BP6a/b/c T9 渐启 |

> T6 阶段：仅 BP6a 的 A + B + D 三网合闸（5+1+1 = 7 台），其余 4 + 22 = 26 台 Power Switch 全关。

## 建造步骤（BP6 蓝图，BP6a/b/c 完全相同复制 3 份）

1. **框架**：5×5 cell × 5 cell 高（40×40×40m）
2. **1F (0-10m)**：5 Cu smelter S1-S5（row 0 cols 0-4）+ 1 Cat smelter G1（row 2 col 0）
3. **1F belt**：row 2.5 Cu 收集 belt #1 + row 5.5 Cat 收集 belt #2，末端 lift-out-top
4. **1F 地基**：y=10m 铺 4m 地基
5. **2F (14-24m)**：**同 1F 布局**放 3 Cu smelter S6-S8（row 0 cols 0-2）+ 2 Cat smelter G2-G3（row 2 cols 0-1）
6. **2F belt**：row 2.5 Cu 收集 belt #3 + row 5.5 Cat 收集 belt #4，末端 lift-out-top
7. **2F 地基**：y=24m 铺 4m 地基
8. **垂直汇总**：4 条 belt 末端 lift-out-top 汇主 lift → 铜锭汇总后**下行**到 h=4m 右 Wall Outlet（与侧墙 mount 对偶规则统一，不再停在 h=24m）；铜金锭经侧墙汇 BP6a 后 lift-up 到屋顶 35m
9. **右 Wall Outlet** (col=5, h=4m, row=2.5)：铜锭出口；**T9 1380>1200 → 预埋 2 槽并联**（row=2.25/2.75，T6 一次建好不重拉）
10. **左 Wall Inlet** (col=0, h=4m)：铜矿 (row=2.5，**T9 1380>1200 预埋 2 槽 row=2.25/2.75**) + 铜金矿 (row=3.5，888<1200 单槽) 双进料
11. **屋顶 (35m)**：6 Mk5 belt + 仅 BP6a 一处 B6 merger（caterium 锭注入；BP6b/c 不接 B6）
12. **Power Switch ×5**：Network A/B/C/D/E 一次装好；BP6a T6 合 A+B+D，其余实例 5 网全断
13. **Power Shard（T6）**：仅 BP6a 的 7 台通电机器各插 3 shard；其余 shard 槽空着

## Tier 7+ 启用流程（仅翻 Switch + 插 shard，不动结构）

| Tier | 操作 | 通电总数 |
|---|---|---:|
| T7 | BP6a 翻 C+E ON，BP6b 翻 A+B+D ON；各通电台插 3 shard | 18 |
| T8 | BP6b 翻 C+E ON，BP6c 翻 A+B ON；预留 2 台备用暂缓通电（见下注） | 26 |
| T9 | BP6c 翻 C+D+E ON，全 31 台超频调到目标值；矿场来料 belt 已 Mk5/Mk6；铜矿入料 1380 与铜锭出料 1380 均 >1200 Mk6 上限 → 左 Inlet/右 Outlet 各走 2 条并联（槽位 T6 已预埋，T9 不重拉 belt） | 31 |

> **T8 计数说明（26 与 31 口径自洽）**：若按网格逐网累加，T8 在 T7 的 18 台基础上加 BP6b(C+E=4) + BP6c(A+B=6) = +10 → 28 台。但全集群恒定保留 **2 台备用**（**1 Cu + 1 Cat**，即 BP6c Network A 中 1 台 Cu smelter + BP6b Network E 的 G3 Cat smelter 暂缓通电），故 T8 = 28 − 2 = **26**。这 2 台备用一直空载到 T9 仍保留：T9 物理 33 台 − 2 备用 = **31** 满载，与 §概要「剩 2 台备用」「23 Cu + 8 Cat」口径一致。

## 验证

- [ ] **33 台 smelter 全部物理放置**（每实例 11 × 3 实例）
- [ ] 铜锭/铜金锭两条独立 row belt（防混料）
- [ ] 双进料 manifold（铜矿+铜金矿）接到全部 33 台 in-0
- [ ] **15 个 Power Switch 一次建好**（每实例 5 × 3 实例）
- [ ] T6 仅 BP6a 7 台通电机器插了 shard，其余 26 台 shard 槽空
- [ ] 屋顶 B6 merger（仅 BP6a 一处）filter=铜金锭（防混料）；BP6b/c 不接 B6
- [ ] 铜锭右墙 Outlet 高度统一 h=4m（与侧墙 mount 对偶规则一致，无 h=24m 残留）
- [ ] 左 Wall Inlet / 右 Wall Outlet 铜料各预埋 2 槽并联（T9 1380>1200 Mk6 上限）
- [ ] 矿场容量预留：铜矿 1380/min、铜金矿 888/min（T9 上限；1:1 / 3:1 配方自洽）
