# BP1 铁锭 (C1)

## 概要

- **集群**: C1 铁系（最前端，整厂第一蓝图）
- **规格**: Mk2 单实例
- **机器**: **18 smelter 一次物理建造到位**（iron-ingot 配方）
- **激活时间线**（仅翻 Power Switch + 插 Power Shard，不动结构）:
  - T6 → 9 台通电（其余 9 台 Power Switch 关）
  - T7 → 14 台通电
  - T8 → 16 台通电
  - T9 → 18 台通电（满载 237%）
- **产能**: T6 610.5 / T9 1140 /min 铁锭

> **核心设计原则**：**18 台 smelter 在 T6 阶段就全部摆好 + belt/manifold/电网/Power Switch 全部接好**。后续升 Tier 时**不重新放机器、不重新拉 belt**——只需 (1) 翻对应 Power Switch (2) 插 Power Shard (3) 调超频百分比。

## 机器超频清单（T6，Plan C ≤250%）

| 配方 | 物理 | T6 通电 | 超频 | 单台产能 (/min) | Power Shard/通电台 |
|---|---:|---:|---:|---:|---:|
| iron-ingot (smelter) | 18 | **9** | 226.11% | 67.83 | 3 |
| **合计 (T6)** | 18 | 9 | — | 9 × 67.83 = **610.5** | 9 × 3 = **27** |

> T6 时未通电的 9 台 smelter：物理建好、belt 接好、shard 槽**空着**、Power Switch **关**，完全不耗电不产出。<br>
> T9 满载 18 台 @ 237% = 1140/min，每台 3 shard = **54 shard 总**。

## 物料 I/O

| 方向 | 物料 | 流量 (T6/T9) | 路径 |
|---|---|---|---|
| 输入 | 铁矿石 | 610.5 / 1140 | 矿场 belt → **左 Wall Inlet** (col=0, h=4m) |
| 输出 | 铁锭 | 610.5 / 1140 | 集群内部 → **右 Wall Outlet** (col=5, h=24m) → BP2 左 Wall Inlet |

**屋顶总线接入**: 无（铁锭走集群内短 belt 直连 BP2，不上 B1-B6）

## 楼层占用

| 层 | 高度 | 内容 | 物理台数 | T6 通电 |
|---|---|---|---:|---:|
| 1F | 0-10m | smelter row 0 (5 台 S1-S5) + row 2 (4 台 S6-S9) | 9 | **9** |
| 4m 地基 | 10-14m | 隔层 | — | — |
| 2F | 14-24m | smelter row 0 (5 台 S10-S14) + row 2 (4 台 S15-S18) | 9 | **0** |
| 4m 地基 | 24-28m | 隔层 | — | — |
| 屋顶 | 35-40m | B1-B6 6 条 Mk4 直通 | — | — |

> **T6 阶段**：1F 全 9 台通电（Power Network A），2F 全 9 台 Power Switch **关**（Network B/C/D 待 T7+ 渐次启用）。所有 belt / lift / manifold / Power Switch 一次到位。

## 俯视图（按实际比例，每层独立）

**比例约定**（同 BP02）：1 字符 = 1m 横向；1 行 = 2m 纵向；蓝图 40×40m = 40 字符 × 20 行。

**图例**：
- `*` 后缀 = T6 通电；无 `*` = T7+ Power Switch 关（物理已建，不耗电不产出）
- `v` = front (south) 输出
- `6x9` = 6m 宽 × 9m 长

### 1F (0-10m): 9 smelter — T6 全部通电

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐                │
        ││ S1* ││ S2* ││ S3* ││ S4* ││ S5* │ row 0: 5 台    │
 4      ││iron ││iron ││iron ││iron ││iron │ 全部 T6 通电   │
        ││ 6x9 ││ 6x9 ││ 6x9 ││ 6x9 ││ 6x9 │                │
 8      ││  v  ││  v  ││  v  ││  v  ││  v  │                │
        │└─────┘└─────┘└─────┘└─────┘└─────┘                │
12      │──── iron-ingot collect belt #1 h=2m row=2.5 ─────│
        │┌─────┐┌─────┐┌─────┐┌─────┐                       │
16      ││ S6* ││ S7* ││ S8* ││ S9* │  row 2: 4 台          │
        ││iron ││iron ││iron ││iron │  全部 T6 通电         │
20      ││ 6x9 ││ 6x9 ││ 6x9 ││ 6x9 │                       │
        ││  v  ││  v  ││  v  ││  v  │  col 4 留 manifold +  │
24      │└─────┘└─────┘└─────┘└─────┘  lift 操作区          │
        │──── iron-ingot collect belt #2 h=2m row=5.5 ─────│
28      │ 铁矿石进料：左 Wall Inlet h=4m row=2.5            │
        │   splitter manifold 分到 1F 9 台 in-0 (back)      │
32      │   + 续接 lift-up 喂 2F 9 台                       │
        │ 铁锭出料：9 台 front → belt #1/#2 →               │
36      │   col=4.5 主 lift-out-top → h=24m 右 Wall Outlet  │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- S1-S9：9 台 smelter（iron-ingot），T6 **全部通电**
- col=4 row=2 空位：作为 manifold + 主 lift 操作区
- 进料：左 Wall Inlet (h=4m) → splitter manifold → 喂 1F 9 台 + 续接 lift-up 给 2F
- 出料：9 台 front → 2 条收集 belt → col=4.5 主 lift-out-top → h=24m

### 2F (14-24m): 9 smelter — T6 全部 Power Switch 关（belt/manifold 已接好）

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌─────┐┌─────┐┌─────┐┌─────┐┌─────┐                │
        ││ S10 ││ S11 ││ S12 ││ S13 ││ S14 │ row 0: 5 台    │
 4      ││iron ││iron ││iron ││iron ││iron │ T6 Switch OFF  │
        ││ 6x9 ││ 6x9 ││ 6x9 ││ 6x9 ││ 6x9 │ → T7 翻 ON     │
 8      ││  v  ││  v  ││  v  ││  v  ││  v  │ (Network B)    │
        │└─────┘└─────┘└─────┘└─────┘└─────┘                │
12      │──── iron-ingot collect belt #3 h=16m row=2.5 ────│
        │┌─────┐┌─────┐┌─────┐┌─────┐                       │
16      ││ S15 ││ S16 ││ S17 ││ S18 │  row 2: 4 台          │
        ││iron ││iron ││iron ││iron │  T6 Switch OFF        │
20      ││ 6x9 ││ 6x9 ││ 6x9 ││ 6x9 │  → T8 翻 S15/S16 ON   │
        ││  v  ││  v  ││  v  ││  v  │    (Network C, 2 台)  │
24      │└─────┘└─────┘└─────┘└─────┘  → T9 翻 S17/S18 ON   │
        │──── iron-ingot collect belt #4 h=16m row=5.5 ────│
28      │      (Network D, 2 台)                            │
        │ 铁矿石进料：lift-up 从 1F manifold 上来 (h=4→16m) │
32      │ 铁锭出料：belt #3/#4 → lift-out-top → 24m 主 belt │
36      │                                                   │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- S10-S18：9 台 smelter **物理建造完整**，T6 阶段 Power Switch **全关**
- Belt manifold + lift 一次性接到所有 9 台 in-0 / front，与 1F manifold 共用同一进料路径
- 通电节奏：T7 开 S10-S14（5 台）；T8 再开 S15-S16（共 16）；T9 再开 S17-S18（满 18）

### 屋顶 (35-40m): B1-B6 直通

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │ o B1 ────────────────────────────────────── o   │
 4      │ o B2 ────────────────────────────────────── o   │
 8      │ o B3 ────────────────────────────────────── o   │
12      │ o B4 ────────────────────────────────────── o   │
16      │ o B5 ────────────────────────────────────── o   │
20      │ o B6 ────────────────────────────────────── o   │
24      │                                                 │
28      │ B1-B6 全部 pass-through，无 splitter/merger     │
32      │ (BP1 不取/不注总线，铁锭走集群内短 belt 直连 BP2)│
36      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- B1-B6：6 条 Mk4 belt 直通，BP1 不接入总线

## Power Switch 分网

把 18 台 smelter 拆 4 个独立 Power Network，由 4 个 Power Switch 控制。**4 个 Switch 全部 T6 一次安装好**，只是 T6 阶段只合 Network A。

| 网 | 范围 | 数量 | T6 状态 | 升级触发 |
|---|---|---:|---|---|
| Network A | 1F S1-S9 | 9 | **ON** | — |
| Network B | 2F row 0 S10-S14 | 5 | OFF | T7 翻 ON |
| Network C | 2F row 2 S15-S16 | 2 | OFF | T8 翻 ON |
| Network D | 2F row 2 S17-S18 | 2 | OFF | T9 翻 ON |

> Power Switch 物理位置建议放 2F col=4.5（manifold 区角落），4 个并排，方便玩家在场内一眼区分。

## 建造步骤

1. **框架**：5×5 cell × 5 cell 高（40×40×40m）
2. **1F (0-10m)**：放 9 台 smelter S1-S9（row 0 cols 0-4 = 5 台 + row 2 cols 0-3 = 4 台）；col=4 row=2 留空
3. **1F belt**：row=2.5 横铺 belt #1 收 row 0 五台；row=5.5 横铺 belt #2 收 row 2 四台；末端 col=4.5 合流到主 lift-out-top
4. **1F 地基**：y=10m 铺 4m 厚地基覆盖整层
5. **2F (14-24m)**：**同 1F 布局**放 9 台 smelter S10-S18（row 0 cols 0-4 = 5 台 + row 2 cols 0-3 = 4 台）
6. **2F belt**：row=2.5 belt #3 + row=5.5 belt #4，末端 lift-out-top
7. **2F 地基**：y=24m 铺 4m 厚地基
8. **垂直汇总**：1F+2F 4 条 belt 的末端 lift-out-top 在 col=4.5 汇合成一根主 lift 上送到 h=24m
9. **右 Wall Outlet**：col=5, row=2.5, h=24m，接 24m 主 belt 出去
10. **左 Wall Inlet**：col=0, row=2.5, h=4m（接矿场来料）→ splitter manifold 喂 **全部 18 台**（1F 直喂 9 台 + lift-up 喂 2F 9 台）
11. **屋顶 (35m)**：铺 6 条 Mk4 平行 belt（B1 row=0.5 ... B6 row=4.5），左右各嵌 Wall Mount (Inlet 左 / Outlet 右)
12. **Power Switch ×4**：按上面"Power Switch 分网"表布置 Network A/B/C/D；T6 只合 A，B/C/D 全部 OFF
13. **Power Shard（T6 阶段）**：仅 S1-S9 各插 3 shard，超频到 226.11%；**S10-S18 物理已就位但 shard 槽空着**

## Tier 7+ 启用流程（仅翻 Switch + 插 shard，不动结构 / 不动 belt）

| Tier | 操作 | 通电总数 |
|---|---|---:|
| T7 | 翻 Network B Switch ON → S10-S14 各插 3 shard 调超频 | 14 |
| T8 | 翻 Network C Switch ON → S15-S16 各插 3 shard | 16 |
| T9 | 翻 Network D Switch ON → S17-S18 各插 3 shard，**全 18 台超频调到 237%**；矿场来料 belt 升 Mk5（1140 超 Mk4 额定 480）| 18 |

## 验证

- [ ] **18 台 smelter 全部物理放置**（包括 T6 不通电的 9 台 S10-S18）
- [ ] Belt manifold + lift 接到全部 18 台 in-0（不只是 T6 通电的 9 台）
- [ ] 4 个 Power Switch 一次建好，Network A 合上，B/C/D 断开
- [ ] T6 仅 S1-S9 插了 3 shard；S10-S18 物理就位但 shard 槽空
- [ ] 右 Wall Outlet h=24m 与 BP2 左 Wall Inlet h=24m 对齐
- [ ] 屋顶 6 belt 直通无 splitter（本蓝图不参与总线 tap）
- [ ] 矿场来料 belt 容量按 1140 预留（T9 升 Mk5；T6 临时 Mk4 也可，但物理升级位置要预留好）
