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
| 输入 | 铜矿石 | 326.5 / 1500 | 矿场直喂 → 左 Wall Inlet (h=4m) |
| 输入 | 铜金矿石 | 222 / 600 | 矿场直喂 → 左 Wall Inlet (h=4m, 第二口) |
| 输出 | 铜锭 → BP7 | 326.5 / 1380 | 集群内部 → 右 Wall Outlet (h=24m) → BP6b → BP6c → BP7 |
| 输出 | 铜金锭 → B6 | 74 / 296 | 屋顶 merger → B6（→ BP10 快速线）|

**屋顶总线接入**: 注入 B6 (74 铜金锭，T9 296)

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
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐                │
        ││ S1* ││ S2* ││ S3* ││ S4* ││ S5* │ row 0: 5 Cu    │
 4      ││ Cu  ││ Cu  ││ Cu  ││ Cu  ││ Cu  │ BP6a T6 ON     │
        ││ 6x9 ││ 6x9 ││ 6x9 ││ 6x9 ││ 6x9 │ (Network A)    │
 8      ││  v  ││  v  ││  v  ││  v  ││  v  │                │
10      │└─────┘└─────┘└─────┘└─────┘└─────┘                │
        │──── Cu ingot belt #1 h=2m row=2.5 ───────────────│
14      │┌─────┐                                            │
        ││ G1* │ row 2: 1 Cat                               │
18      ││ Cat │ BP6a T6 ON (Network B)                     │
        ││ 6x9 │                                            │
22      ││  v  │                                            │
        │└─────┘                                            │
26      │──── Cat ingot belt h=2m row=5.5 ─────────────────│
        │ 铜矿石进料：左 Wall Inlet h=4m row=2.5            │
32      │ 铜金矿石：左 Wall Inlet h=4m row=5.5             │
        │   manifold 喂全部 11 台 in-0（含 2F lift-up）     │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- BP6a 1F：S1-S5 + G1 全 6 台 T6 通电（`*`）
- BP6b/c 1F：物理同样布局，但 Power Switch 关，无 `*`

### 2F (14-24m): 5 smelter — BP6a 仅 G2 通电，其余 BP6 全关

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌─────┐┌─────┐┌─────┐                              │
        ││ S6  ││ S7  ││ S8  │ row 0: 3 Cu                  │
 4      ││ Cu  ││ Cu  ││ Cu  │ BP6a T6 Switch OFF           │
        ││ 6x9 ││ 6x9 ││ 6x9 │ (Network C, T7 翻 ON)        │
 8      ││  v  ││  v  ││  v  │                              │
10      │└─────┘└─────┘└─────┘                              │
        │──── Cu ingot belt #3 h=16m row=2.5 ──────────────│
14      │┌─────┐┌─────┐                                     │
        ││ G2* ││ G3  │ row 2: 2 Cat                        │
18      ││ Cat ││ Cat │ G2: BP6a T6 ON (Network D)          │
        ││ 6x9 ││ 6x9 │ G3: T6 OFF (Network E, T8 翻 ON)    │
22      ││  v  ││  v  │                                     │
        │└─────┘└─────┘                                     │
26      │──── Cat ingot belt h=16m row=5.5 ────────────────│
        │ 进料：lift-up 从 1F manifold                      │
32      │ 出料：lift-out-top 到 24m / 屋顶 merger           │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- BP6a 2F：仅 G2 通电；S6-S8 + G3 物理建好但 Power Switch 关
- BP6b/c 2F：物理同样布局，全部 Switch 关

### 屋顶 (35-40m): B1-B6 + B6 merger（铜金锭注入）

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │ o B1 ────────────────────────────────────── o   │
 4      │ o B2 ────────────────────────────────────── o   │
 8      │ o B3 ────────────────────────────────────── o   │
12      │ o B4 ────────────────────────────────────── o   │
16      │ o B5 ────────────────────────────────────── o   │
20      │ o B6 ───[merger << caterium-ingot 74]────── o   │
24      │                                                 │
28      │ B6 注入：本实例铜金锭 lift-top 上行合流          │
32      │ copper-ingot 走集群内 h=24m 短 belt 给下游 BP    │
36      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

## 多实例侧墙续接

BP6 是**纯同向流**集群（铜锭/铜金锭都是 BP6a→BP6b→BP6c→ 下游 BP7）。详见设计文档 [§多实例集群侧墙 mount 对偶规则](../2026-05-06-tier6-blueprint-design.md#多实例集群侧墙-mount-对偶规则关键设计约定)。

| 高度 | 物料 | 左 Wall | 右 Wall |
|---|---|---|---|
| h=4m row=2.5 | 铜锭 | **Inlet** | **Outlet** |
| h=4m row=3.5 | 铜金锭 | **Inlet**（仅 BP6b/c 用，BP6a 悬空）| **Outlet** |

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
8. **垂直汇总**：4 条 belt 末端 lift-out-top 汇主 lift → 铜锭到 h=24m，铜金锭到屋顶 35m
9. **右 Wall Outlet** (col=5, h=24m, row=2.5)：铜锭出口
10. **左 Wall Inlet** (col=0, h=4m)：铜矿 (row=2.5) + 铜金矿 (row=5.5) 双进料
11. **屋顶 (35m)**：6 Mk5 belt + B6 merger（铜金锭注入）
12. **Power Switch ×5**：Network A/B/C/D/E 一次装好；BP6a T6 合 A+B+D，其余实例 5 网全断
13. **Power Shard（T6）**：仅 BP6a 的 7 台通电机器各插 3 shard；其余 shard 槽空着

## Tier 7+ 启用流程（仅翻 Switch + 插 shard，不动结构）

| Tier | 操作 | 通电总数 |
|---|---|---:|
| T7 | BP6a 翻 C+E ON，BP6b 翻 A+B+D ON；各通电台插 3 shard | 18 |
| T8 | BP6b 翻 C+E ON，BP6c 翻 A+B ON | 26 |
| T9 | BP6c 翻 C+D+E ON，全 31 台超频调到目标值；矿场来料 belt 已 Mk5；T8/T9 需个别物料拆分（铜矿 1200 接近 Mk6 上限） | 31 |

## 验证

- [ ] **33 台 smelter 全部物理放置**（每实例 11 × 3 实例）
- [ ] 铜锭/铜金锭两条独立 row belt（防混料）
- [ ] 双进料 manifold（铜矿+铜金矿）接到全部 33 台 in-0
- [ ] **15 个 Power Switch 一次建好**（每实例 5 × 3 实例）
- [ ] T6 仅 BP6a 7 台通电机器插了 shard，其余 26 台 shard 槽空
- [ ] 屋顶 B6 merger filter=铜金锭（防混料）
- [ ] 矿场容量预留：铜矿 1500/min、铜金矿 600/min（T9 上限）
