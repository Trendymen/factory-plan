# BP13 模块化框架 + 钢筋混凝土梁 (C6)

## 概要

- **集群**: C6 装配（紧贴 BP12 之后）
- **规格**: Mk2 单实例
- **机器**: **6 assembler 一次物理建造到位**（4 modular-frame + 2 encased-industrial-beam）
- **激活时间线**（仅翻 Power Switch + 插 Power Shard，不动结构）:
  - T6 → 5 台通电（3 frame + 2 beam；其余 1 台 frame Power Switch 关）
  - T7 → 5 台通电（同 T6，仅超频百分比不变）
  - T8 → 6 台通电（开第 4 台 frame）
  - T9 → 6 台通电（满载）
- **产能 T6**: 模块化框架 12 / 钢筋混凝土梁 16

> **核心设计原则**：**6 台 assembler 在 T6 阶段就全部摆好 + belt/manifold/电网/Power Switch 全部接好**。后续升 Tier 时**不重新放机器、不重新拉 belt**——只需 (1) 翻对应 Power Switch (2) 插 Power Shard (3) 调超频百分比。

## 机器超频清单（T6，Plan C ≤250%）

| 配方 | 物理 | T6 通电 | 超频 | 单台产能 (/min) | Power Shard/通电台 |
|---|---:|---:|---:|---:|---:|
| modular-frame (assembler) | 4 | **3** | 200.0% | 4.0 | 2 |
| encased-industrial-beam (assembler) | 2 | **2** | 133.33% | 8.0 | 1 |
| **合计 (T6)** | 6 | 5 | — | 3×4.0 + 2×8.0 = **12 + 16** | 3×2 + 2×1 = **8** |

> T6 时未通电的 1 台 frame assembler（M4）：物理建好、belt 接好、shard 槽**空着**、Power Switch **关**，完全不耗电不产出。<br>
> T8 起 M4 通电，6 台全开继续 200% 超频。

## 物料 I/O

| 方向 | 物料 | 流量 (T6) | 路径 |
|---|---|---|---|
| 输入 | 强化铁板 | 18 | **屋顶 B2** ← BP2 → splitter |
| 输入 | 铁棒 | 72 | **屋顶 B2** ← BP2 → splitter |
| 输入 | 钢梁 | 48 | **屋顶 B3** ← BP5 → splitter |
| 输入 | 混凝土 | 96 | **屋顶 B4** ← BP10 → splitter |
| 输出 | 模块化框架 → BP14 HMF（C6 内部）| 10 | 集群内短 belt |
| 输出 | 钢筋混凝土梁 → BP14 HMF | 10 | 集群内短 belt |
| 输出 | 模块化框架 → B5 终端 | 2 | 屋顶 merger → B5 |
| 输出 | 钢筋混凝土梁 → B5 终端 | 6 | 屋顶 merger → B5 |

**屋顶总线接入**:
- 取自 B2 (强化铁板 18 + 铁棒 72 = 90) + B3 (钢梁 48) + B4 (混凝土 96)
- 注入 B5 (8 mainNode)

## 楼层占用

| 层 | 高度 | 内容 | 物理台数 | T6 通电 |
|---|---|---|---:|---:|
| 1F | 0-8m | 4 模块化框架 assembler 一字排（M1-M4）| 4 | **3** |
| 4m 地基 | 8-12m | 隔层 | — | — |
| 2F | 12-20m | 2 钢筋混凝土梁 assembler 一字排（E1-E2）| 2 | **2** |
| 4m 地基 | 20-24m | 隔层 | — | — |
| 屋顶 | 35-40m | B1-B6 + 3 splitter + 1 merger + 多 lift | — | — |

> **T6 阶段**：1F M1-M3 通电（Network A），M4 Power Switch **关**（Network B 待 T8 启用）；2F E1-E2 通电（Network C）。所有 belt / lift / manifold / Power Switch 一次到位。

## 俯视图（按实际比例，每层独立 — 视觉正方形）

**比例约定**：
- 横向：**1 字符 = 1m**
- 纵向：**1 行 = 2m**
- 蓝图 40×40m → 40 字符宽 × 20 行高

**图例**：
- `*` 后缀 = T6 通电；无 `*` = T7+ Power Switch 关（物理已建，不耗电不产出）
- `v` = front (south) 输出
- `10x15` = 10m 宽 × 15m 长

### 1F (0-8m): 4 模块化框架 assembler — T6 通电 3 台

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌─────────┐┌─────────┐┌─────────┐┌─────────┐    │
        ││  M1*    ││  M2*    ││  M3*    ││  M4     │    │
 4      ││ frame   ││ frame   ││ frame   ││ frame   │    │
        ││ 10x15   ││ 10x15   ││ 10x15   ││ 10x15   │    │
 8      ││  v      ││  v      ││  v      ││  v      │    │
        │└─────────┘└─────────┘└─────────┘└─────────┘    │
12      │─────────── frame collect belt h=2m ─────────────│
        │ in: RIP 18 + iron-rod 72 (each split to 4 in-0) │
16      │ all lift-bot from roof B2 prog splitter         │
        │ (manifold 接全 4 台，含 T6 不通电的 M4)         │
20      │                                                 │
        │ out: frame 12/min(T6) >> central splitter       │
24      │   10 -> right-wall outlet to BP14 HMF           │
        │   2  -> lift-out-top to roof merger (B5)        │
32      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- M1-M3：3 台 modular-frame assembler 10m × 15m × 8m，T6 **通电**（200%）
- M4：第 4 台 modular-frame assembler **物理建造完整**，T6 阶段 Power Switch **关**（Network B），T8 翻 ON
- Belt manifold + lift 一次性接到全部 4 台 in-0 / in-1 / front
- 进料：屋顶 B2 → splitter → lift-bot → 4-way manifold
- 出料：4 台 front → 主 belt → 集群内出口（10）+ lift-out-top（2）

### 2F (12-20m): 2 钢筋混凝土梁 assembler — T6 全部通电

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌─────────┐┌─────────┐                           │
        ││  E1*    ││  E2*    │                           │
 4      ││ encased ││ encased │                           │
        ││ 10x15   ││ 10x15   │                           │
 8      ││  v      ││  v      │                           │
        │└─────────┘└─────────┘                           │
12      │─────────── beam collect belt h=14m ─────────────│
        │ in: steel-beam 48 + concrete 96 (each split 2)  │
16      │ steel-beam from B3 splitter, concrete from B4   │
        │ both via lift-bot to 2F manifold                │
20      │                                                 │
        │ out: beam 16/min >> central splitter            │
24      │   10 -> right-wall outlet to BP14 HMF           │
        │   6  -> lift-out-top to roof merger (B5)        │
32      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- E1-E2：2 台 encased-industrial-beam assembler 10m × 15m × 8m，T6 **全部通电**（133.33%）
- Belt manifold + lift 一次性接到 2 台 in-0 / in-1 / front

### 屋顶 (35-40m): B1-B6 + 3 splitter + 1 merger

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │ o B1 ──────────────────────────────────────── o │
 4      │ o B2 ───[prog split: RIP 18 + rod 72 = 90]─── o │
 8      │ o B3 ───[smart split: steel-beam 48]──────── o  │
12      │ o B4 ───[smart split: concrete 96]────────── o  │
16      │ o B5 ───[merger << lift-top mainNode 8]──── o   │
20      │ o B6 ──────────────────────────────────────── o │
24      │                                                 │
28      │ 4 lift-bot: RIP+rod / beam / concrete to 1F/2F  │
32      │ 2 lift-top: frame + beam mainNode to B5         │
36      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- B2 取强化铁板 18 + 铁棒 72 = 90（programmable splitter）
- B3 取钢梁 48（smart splitter）
- B4 取混凝土 96（smart splitter，来自 BP10 跨 C5 段）
- B5 merger 注入：模框 2 + 包裹梁 6 = 8 mainNode

## Power Switch 分网

把 6 台 assembler 拆 3 个独立 Power Network，由 3 个 Power Switch 控制。**3 个 Switch 全部 T6 一次安装好**，T6 阶段合 Network A + C，Network B 留到 T8 开。

| 网 | 范围 | 数量 | T6 状态 | 升级触发 |
|---|---|---:|---|---|
| Network A | 1F M1-M3（frame）| 3 | **ON** | — |
| Network B | 1F M4（frame）| 1 | OFF | T8 翻 ON |
| Network C | 2F E1-E2（beam）| 2 | **ON** | — |

> Power Switch 物理位置建议放屋顶 col=4.5 角落，3 个并排，方便玩家在场内一眼区分。

## 建造步骤

1. **框架**：5×5 cell × 5 cell 高（40×40×40m）
2. **1F (0-8m)**：放 4 台 modular-frame assembler M1-M4（col 0-3 row 0，一字排）
3. **1F 进料**:
   - 强化铁板 18：屋顶 prog splitter → lift-bot → manifold → **全 4 台** in-0
   - 铁棒 72：屋顶 prog splitter → lift-bot → manifold → **全 4 台** in-1
4. **1F belt 收集**：row=3 frame 主 belt，收 4 台 front
5. **1F 地基**：y=8m 铺 4m 厚地基
6. **2F (12-20m)**：放 2 台 encased-industrial-beam assembler E1-E2（col 0-1 row 0）
7. **2F 进料**:
   - 钢梁 48：屋顶 smart splitter → lift-bot 下到 2F → 2 台 in-0
   - 混凝土 96：屋顶 smart splitter → lift-bot 下到 2F → 2 台 in-1
8. **2F belt 收集**：row=3 beam 主 belt
9. **2F 地基**：y=20m 铺 4m 厚地基
10. **集群内短 belt 出口**：模框 10 + 包裹梁 10 → 右 Wall Outlet (col=5, h=20m, row=3) → BP14 左 Wall Inlet
11. **垂直汇总（mainNode）**：模框 2 + 包裹梁 6 → lift-out-top → 屋顶 merger 注 B5
12. **屋顶 (35-40m)**：6 belt 直通 + 3 splitter + 1 merger
13. **Power Switch ×3**：按上面"Power Switch 分网"表布置 Network A/B/C；T6 合 A + C，B **OFF**
14. **Power Shard（T6 阶段）**：M1-M3 各插 2 shard（200%），E1-E2 各插 1 shard（133.33%）；**M4 物理已就位但 shard 槽空着**

## 集群内部连接

- 出口右 Wall Outlet (h=20m, 模框 + 包裹梁 各一条 belt) → BP14 左 Wall Inlet
- BP14 HMF manufacturer 4 输入：模框 10 + 包裹梁 10 + 钢管 40 + 螺丝 240，前两路从这里接

## Tier 7+ 启用流程（仅翻 Switch + 插 shard，不动结构 / 不动 belt）

| Tier | 操作 | 通电总数 |
|---|---|---:|
| T7 | 无变化（5 台继续运行）| 5 |
| T8 | 翻 Network B Switch ON → M4 插 2 shard 调 200% 超频 | 6 |
| T9 | 无新操作（6 台满载）；如需进一步上量可整体调超频百分比 | 6 |

## 验证

- [ ] **6 台 assembler 全部物理放置**（包括 T6 不通电的 M4）
- [ ] Belt manifold + lift 接到全部 6 台 in-0 / in-1（不只是 T6 通电的 5 台）
- [ ] 3 个 Power Switch 一次建好，Network A + C 合上，B 断开
- [ ] T6 仅 M1-M3 + E1-E2 插 shard；M4 物理就位但 shard 槽空
- [ ] 4 路屋顶 splitter filter 正确（强化铁板/铁棒/钢梁/混凝土）
- [ ] 集群内出口 row 与 BP14 输入对齐
- [ ] 模框 + 包裹梁 各 10/min 走集群内短 belt（不是 B5）
- [ ] B4 混凝土 96 来自 BP10（C5），跨 C5→C6 经 B4 总线
