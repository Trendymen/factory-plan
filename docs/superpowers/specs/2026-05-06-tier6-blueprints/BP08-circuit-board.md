# BP8 电路板 (C3)

## 概要

- **集群**: C3 铜电链（紧贴 BP7c 之后，C3 末端）
- **规格**: Mk2 单实例
- **机器**: **8 assembler 一次物理建造到位**（circuit-board 配方：4 铜板 + 8 塑料 → 4 电路板/min）
- **激活时间线**（仅翻 Power Switch + 插 Power Shard，不动结构）:
  - T6 → 1 台通电（其余 7 台 Power Switch 关）
  - T7 → 4 台通电
  - T8 → 6 台通电
  - T9 → 8 台通电（满载 219%）
- **产能**: T6 13.75 / T9 87.6 /min 电路板

> **核心设计原则**：**8 台 assembler 在 T6 阶段就全部摆好 + belt/manifold/电网/Power Switch 全部接好**。后续升 Tier 时**不重新放机器、不重新拉 belt**——只需 (1) 翻对应 Power Switch (2) 插 Power Shard (3) 调超频百分比。

## 机器超频清单（T6，Plan C ≤250%）

| 配方 | 物理 | T6 通电 | 超频 | 单台产能 (/min) | Power Shard/通电台 |
|---|---:|---:|---:|---:|---:|
| circuit-board (assembler) | 8 | **1** | 183.33% | 13.75 | 2 |
| **合计 (T6)** | 8 | 1 | — | 1 × 13.75 = **13.75** | 1 × 2 = **2** |

> T6 时未通电的 7 台 assembler：物理建好、belt 接好、shard 槽**空着**、Power Switch **关**，完全不耗电不产出。<br>
> T9 满载 8 台 @ 219% = 87.6/min，每台 3 shard = **24 shard 总**。

## 物料 I/O

| 方向 | 物料 | 流量 (T6/T9) | 路径 |
|---|---|---|---|
| 输入 | 铜板 | 27.5 / 175.2 | **集群内部** ← BP7 右 Wall Outlet (h=24m) → BP8 左 Wall Inlet |
| 输入 | 塑料 | 55 / 350.4 | **屋顶 B4** ← C4 BP9 |
| 输出 | 电路板 → BP14 计算机 | 10 / 64 | 屋顶 B4 (集群外) |
| 输出 | 电路板 → BP15 HSC | 3.75 / 23.6 | 屋顶 B4 (集群外) |

> 注：电路板**不是 mainNode**（无 B5 终端注入），全部内部消费。

**屋顶总线接入**: 取自 B4 (塑料 55) + 注入 B4 (电路板 13.75)

## 楼层占用

| 层 | 高度 | 内容 | 物理台数 | T6 通电 |
|---|---|---|---:|---:|
| 1F | 0-8m | assembler row 0 (4 台 A1-A4，10×15m) | 4 | **1** |
| 4m 地基 | 8-12m | 隔层 | — | — |
| 2F | 12-20m | assembler row 0 (4 台 A5-A8) | 4 | **0** |
| 4m 地基 | 20-24m | 隔层 | — | — |
| 屋顶 | 35-40m | B1-B6 + smart splitter + merger + 2 lift | — | — |

> **T6 阶段**：1F 仅 A1 通电（Power Network A），1F 其余 3 台 + 2F 全 4 台 Power Switch **关**（Network B/C/D 待 T7+ 渐次启用）。所有 belt / lift / manifold / Power Switch 一次到位。

## 俯视图（按实际比例，每层独立）

**比例约定**（同 BP02）：1 字符 = 1m 横向；1 行 = 2m 纵向；蓝图 40×40m = 40 字符 × 20 行。

**图例**：
- `*` 后缀 = T6 通电；无 `*` = T7+ Power Switch 关（物理已建，不耗电不产出）
- `v` = front (south) 输出
- `10x15` = 10m 宽 × 15m 长

### 1F (0-8m): 4 assembler — T6 仅 A1 通电

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌─────────┐┌─────────┐┌─────────┐┌─────────┐     │
        ││  A1*    ││   A2    ││   A3    ││   A4    │T6 仅│
 4      ││ CB asm  ││ CB asm  ││ CB asm  ││ CB asm  │A1   │
        ││ 10x15   ││ 10x15   ││ 10x15   ││ 10x15   │通电 │
 8      ││ in*2    ││ in*2    ││ in*2    ││ in*2    │     │
        ││  v      ││  v      ││  v      ││  v      │     │
12      │└─────────┘└─────────┘└─────────┘└─────────┘     │
        │───── circuit-board collect belt h=14m row=8 ────│
16      │ 铜板进料: 左 Wall Inlet h=24m row=2             │
        │   → lift-bot → splitter manifold 喂 1F+2F 全 8 台│
20      │ 塑料进料: 屋顶 B4 smart-split → lift-bot 下到 1F│
        │   → splitter manifold 喂 1F+2F 全 8 台 in-1      │
24      │ 电路板出料: 4 台 front → collect belt →         │
        │   col=4.5 lift-out-top → 屋顶 B4 merger          │
28      │                                                 │
32      │                                                 │
36      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- A1-A4：4 台 circuit-board assembler（10m W × 15m L × 8m H），row 0 一字排开（4 × 10m = 40m 满）
- T6 **仅 A1 通电** (183.33% / 2 shard)，A2-A4 物理建好但 Power Switch **关**
- col=4 留 manifold + 主 lift 操作区
- 进料：左 Wall Inlet (铜板) + 屋顶 B4 smart-split (塑料) → 1F splitter manifold → 喂 1F 4 台 + 续接 lift-up 给 2F
- 出料：4 台 front → collect belt → col=4.5 主 lift-out-top → 屋顶 B4 merger

### 2F (12-20m): 4 assembler — T6 全部 Power Switch 关（belt/manifold 已接好）

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌─────────┐┌─────────┐┌─────────┐┌─────────┐     │
        ││   A5    ││   A6    ││   A7    ││   A8    │T6   │
 4      ││ CB asm  ││ CB asm  ││ CB asm  ││ CB asm  │Switch│
        ││ 10x15   ││ 10x15   ││ 10x15   ││ 10x15   │ OFF │
 8      ││ in*2    ││ in*2    ││ in*2    ││ in*2    │ → T7│
        ││  v      ││  v      ││  v      ││  v      │翻 ON│
12      │└─────────┘└─────────┘└─────────┘└─────────┘     │
        │───── 2F collect belt h=26m row=8 → lift-out ────│
16      │ 进料: lift-up 从 1F manifold 上来 (h=4→16m)     │
        │   铜板 + 塑料两路 lift 共享同一 manifold 主轴   │
20      │ 出料: collect belt → lift-out-top → 屋顶 merger │
        │   与 1F 出料在屋顶 merger 前汇合再注 B4         │
24      │                                                 │
28      │                                                 │
32      │                                                 │
36      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- A5-A8：4 台 assembler **物理建造完整**，T6 阶段 Power Switch **全关**
- Belt manifold + lift 一次性接到所有 4 台 in-0 (铜板) / in-1 (塑料) / front (输出)，与 1F manifold 共用同一进料路径
- 通电节奏：T7 翻 A2/A3/A4 + 1 台 2F；T8 再开 2 台；T9 再开 2 台（满 8 台）

### 屋顶 (35-40m): B4 上 smart-split + merger（先取后合）

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │ o B1 ───────────────────────────────────────── o│
 4      │ o B2 ───────────────────────────────────────── o│
 8      │ o B3 ───────────────────────────────────────── o│
12      │ o B4 ─[smart-split f=plastic 55]─[merger]───── o│
        │          │                          ↑           │
16      │       lift-bot                  lift-top        │
        │          ↓                          │           │
20      │       1F+2F asm in-1            1F+2F out       │
24      │ o B5 ───────────────────────────────────────── o│
28      │ o B6 ───────────────────────────────────────── o│
32      │ split BEFORE merge: 避免新生电路板被当塑料取走  │
36      │ B1/B2/B3/B5/B6 直通                             │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- B4 上**先 splitter 后 merger**：splitter 取塑料 55/min（T9 350.4）下 lift 给所有 assembler in-1；merger 把 1F+2F 上来的电路板 13.75（T9 87.6）注回 B4
- splitter 必须放在 merger 上游一侧，否则会把新生电路板当塑料一并取走
- 电路板**不是 mainNode**（无 B5 终端注入），全部作为 B4 流量供下游 BP14 计算机 + BP15 HSC 取用

## Power Switch 分网

把 8 台 assembler 拆 4 个独立 Power Network，由 4 个 Power Switch 控制。**4 个 Switch 全部 T6 一次安装好**，只是 T6 阶段只合 Network A。

| 网 | 范围 | 数量 | T6 状态 | 升级触发 |
|---|---|---:|---|---|
| Network A | 1F A1 | 1 | **ON** | — |
| Network B | 1F A2-A4 + 2F A5 | 4 | OFF | T7 翻 ON（4 台→4 通电窗口；按设计取 3 + 1 拼到 4 台合计）|
| Network C | 2F A6-A7 | 2 | OFF | T8 翻 ON |
| Network D | 2F A8 | 1 | OFF | T9 翻 ON |

> Power Switch 物理位置建议放 2F col=4.5（manifold 区角落），4 个并排，方便玩家在场内一眼区分。

## 建造步骤

1. **框架**：5×5 cell × 5 cell 高（40×40×40m）
2. **1F (0-8m)**：放 4 台 assembler A1-A4（row=0 cols 0-3，10×15m 一字排满 40m）；col=4 留 manifold + lift 操作区
3. **1F belt**：row=8（h=14m）横铺 collect belt 收 A1-A4 四台 front；末端 col=4.5 合流到主 lift-out-top
4. **1F 地基**：y=8m 铺 4m 厚地基覆盖整层
5. **2F (12-20m)**：**同 1F 布局**放 4 台 assembler A5-A8（row=0 cols 0-3）
6. **2F belt**：row=8（h=26m）横铺 collect belt，末端 lift-out-top
7. **2F 地基**：y=20m 铺 4m 厚地基
8. **垂直汇总**：1F+2F 两条 collect belt 末端 lift-out-top 在 col=4.5 汇合成主 lift 上送到 h=35m
9. **左 Wall Inlet（铜板）**：col=0, row=2, h=24m（接 BP7 右 Wall Outlet）→ lift-bot 下到 1F manifold 高度 → splitter manifold 喂 **全部 8 台 in-0**（1F 直喂 4 台 + lift-up 喂 2F 4 台）
10. **屋顶 (35m)**：铺 6 条 Mk4 平行 belt（B1 row=0.5 ... B6 row=4.5），B4 上**先 smart-split（filter=塑料 55）后 merger**
11. **塑料进料链**：B4 smart-split → lift-bot 下到 1F 塑料 manifold 高度 → splitter manifold 喂 **全部 8 台 in-1**
12. **电路板出料链**：1F+2F 主 lift-out-top → 屋顶 B4 merger 注回 B4
13. **Power Switch ×4**：按上面"Power Switch 分网"表布置 Network A/B/C/D；T6 只合 A，B/C/D 全部 OFF
14. **Power Shard（T6 阶段）**：仅 A1 插 2 shard，超频到 183.33%；**A2-A8 物理已就位但 shard 槽空着**

## 集群内部短 belt

仅入：BP7 → BP8 铜板 27.5（T9 175.2）（左 Wall Inlet h=24m row=2）。

## Tier 7+ 启用流程（仅翻 Switch + 插 shard，不动结构 / 不动 belt）

| Tier | 操作 | 通电总数 |
|---|---|---:|
| T7 | 翻 Network B Switch ON → A2-A4 + A5 各插 shard 调超频 | 4 |
| T8 | 翻 Network C Switch ON → A6-A7 各插 shard | 6 |
| T9 | 翻 Network D Switch ON → A8 插 shard，**全 8 台超频调到 219%**；铜板/塑料来料 belt 升 Mk5（铜板 175.2、塑料 350.4 均超 Mk4 480 安全余量但塑料接近上限，必要时升 Mk5）| 8 |

## 验证

- [ ] **8 台 assembler 全部物理放置**（包括 T6 不通电的 7 台 A2-A8）
- [ ] Belt manifold + lift 接到全部 8 台 in-0 (铜板) / in-1 (塑料) / front (输出)（不只是 T6 通电的 1 台）
- [ ] 4 个 Power Switch 一次建好，Network A 合上，B/C/D 断开
- [ ] T6 仅 A1 插了 2 shard；A2-A8 物理就位但 shard 槽空
- [ ] B4 上 splitter 在 merger 之前（避免新生电路板被误取）
- [ ] AI 限制器**不在**本蓝图（已迁移到 BP10）
- [ ] BP7→BP8 铜板短 belt 高度 24m 对齐
- [ ] 塑料 55/min（T9 350.4）取自 B4 上的 BP9 来料（B4 上 BP9→BP8 段流量需 ≥ 该值）
- [ ] 屋顶 B1/B2/B3/B5/B6 直通无 splitter（本蓝图仅在 B4 取 + 注）
