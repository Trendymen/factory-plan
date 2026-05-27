# BP5 钢梁 + 钢管 (C2)

## 概要

- **集群**: C2 钢系（紧贴 BP4 之后）
- **规格**: Mk2 单实例
- **机器**: **8 constructor 一次物理建造到位**（3 钢梁 + 5 钢管）
- **激活时间线**（仅翻 Power Switch + 插 Power Shard，不动结构）:
  - T6 → 5 台通电（2 钢梁 + 3 钢管，其余 3 台 Power Switch 关）
  - T7 → 6 台通电（2 钢梁 + 4 钢管）
  - T8 → 8 台通电（3 钢梁 + 5 钢管，未满超频）
  - T9 → 8 台通电（满载 3 钢梁 + 5 钢管）
- **产能**: T6 钢梁 63 + 钢管 135 /min

> **核心设计原则**：**8 台 constructor 在 T6 阶段就全部摆好 + belt/manifold/电网/Power Switch 全部接好**。后续升 Tier 时**不重新放机器、不重新拉 belt**——只需 (1) 翻对应 Power Switch (2) 插 Power Shard (3) 调超频百分比。

## 机器超频清单（T6，Plan C ≤250%）

| 配方 | 物理 | T6 通电 | 超频 | 单台产能 (/min) | Power Shard/通电台 |
|---|---:|---:|---:|---:|---:|
| steel-beam (constructor) | 3 | **2** | 210.00% | 31.5 | 3 |
| steel-pipe (constructor) | 5 | **3** | 225.00% | 45.0 | 3 |
| **合计 (T6)** | 8 | 5 | — | 钢梁 63 + 钢管 135 | 5 × 3 = **15** |

> T6 时未通电的 3 台 constructor（B3 / P4 / P5）：物理建好、belt 接好、shard 槽**空着**、Power Switch **关**，完全不耗电不产出。<br>
> T9 满载 8 台 = 3 钢梁 + 5 钢管，每台 3 shard = **24 shard 总**。

## 物料 I/O

| 方向 | 物料 | 流量 (T6) | 路径 |
|---|---|---|---|
| 输入 | 钢锭 | 455/min | **集群内部** ← BP4 右 Wall Outlet (h=22m) → BP5 左 Wall Inlet |
| 输出 | 钢梁 → B3 (BP13 包裹) | 48 | 屋顶 merger → B3 |
| 输出 | 钢梁 → B5 终端 | 15 | 屋顶 merger → B5 |
| 输出 | 钢管 → B3 (BP12 + BP14 + BP11) | 115 | 屋顶 merger → B3 |
| 输出 | 钢管 → B5 终端 | 20 | 屋顶 merger → B5 |

**屋顶总线接入**: 注入 B3 (钢梁 48 + 钢管 115 = 163) + B5 (钢梁 15 + 钢管 20 = 35)

## 楼层占用

| 层 | 高度 | 内容 | 物理台数 | T6 通电 |
|---|---|---|---:|---:|
| 1F | 0-10m | constructor row 0 (5 台 B1/B2/P1/P2/P3) + row 2 (3 台 B3/P4/P5) | 8 | **5** |
| 屋顶 | 35-40m | B1-B6 + 2 merger (B3, B5) + 4 lift-top | — | — |

> **T6 阶段**：row 0 全 5 台通电（Power Network A），row 2 全 3 台 Power Switch **关**（Network B/C 待 T7+ 渐次启用）。所有 belt / lift / manifold / Power Switch 一次到位。

## 俯视图（按实际比例，每层独立）

**比例约定**（同 BP02）：1 字符 = 1m 横向；1 行 = 2m 纵向；蓝图 40×40m = 40 字符 × 20 行。

**图例**：
- `*` 后缀 = T6 通电；无 `*` = T7+ Power Switch 关（物理已建，不耗电不产出）
- `v` = front (south) 输出
- `8x10` = 8m 宽 × 10m 长

### 1F (0-10m): 8 constructor — row 0 全通电，row 2 全 Switch OFF

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌───────┐┌───────┐┌───────┐┌───────┐┌───────┐    │
        ││  B1*  ││  B2*  ││  P1*  ││  P2*  ││  P3*  │    │
 4      ││ beam  ││ beam  ││ pipe  ││ pipe  ││ pipe  │    │
        ││ 8x10  ││ 8x10  ││ 8x10  ││ 8x10  ││ 8x10  │    │
 8      ││  v    ││  v    ││  v    ││  v    ││  v    │    │
        │└───────┘└───────┘└───────┘└───────┘└───────┘    │
12      │── beam collect belt h=2m row=2.5 (B1,B2) ───────│
        │── pipe collect belt h=2m row=2.5 (P1,P2,P3) ────│
16      │┌───────┐┌───────┐┌───────┐                      │
        ││  B3   ││  P4   ││  P5   │ row 2: 3 台          │
20      ││ beam  ││ pipe  ││ pipe  │ T6 Switch OFF        │
        ││ 8x10  ││ 8x10  ││ 8x10  │ → T7 翻 P4 ON        │
24      ││  v    ││  v    ││  v    │   (Network B, 1 台)  │
        │└───────┘└───────┘└───────┘ → T8 翻 B3+P5 ON     │
28      │── T7+ collect belt h=4m row=5.5 ────────────────│
        │   (Network C, 2 台)                              │
32      │                                                  │
        │ IN  h=22m row=2.5: steel-ingot (BP4 → BP5)       │
36      │ central splitter manifold → 全部 8 台 in-0       │
        │ + 4 lift-top to roof (beam→B3/B5, pipe→B3/B5)   │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- B1*/B2*：steel-beam constructor，T6 **通电**
- P1*/P2*/P3*：steel-pipe constructor，T6 **通电**
- B3 / P4 / P5：T6 物理已就位，Power Switch **关**；T7+ 渐次启用
- 进料：左 Wall Inlet (h=22m) → lift-bot 下到 1F 中央 splitter → manifold 喂 **全部 8 台** in-0
- 出料：钢梁 / 钢管两条独立收集 belt → col=4.5 主 lift-out-top → 屋顶 merger

### 屋顶 (35-40m): B1-B6 + 2 merger (B3 + B5)

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │ o B1 ────────────────────────────────────── o   │
 4      │ o B2 ────────────────────────────────────── o   │
 8      │ o B3 ───[merger << beam 48 + pipe 115]───── o   │
12      │ o B4 ────────────────────────────────────── o   │
16      │ o B5 ───[merger << beam 15 + pipe 20]────── o   │
20      │ o B6 ────────────────────────────────────── o   │
24      │                                                 │
28      │ B3 inject 163/min  (beam+pipe to BP12-15)       │
        │ B5 inject  35/min  (mainNode terminal)          │
32      │                                                 │
36      │ B1/B2/B4/B6 在 BP5 蓝图内仅直通无注入            │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- B3 merger：beam 48 + pipe 115 = 163/min（上行 lift 4 路在此合流）
- B5 merger：beam 15 + pipe 20 = 35/min mainNode
- B1/B2/B4/B6 直通无注入

## Power Switch 分网

把 8 台 constructor 拆 3 个独立 Power Network，由 3 个 Power Switch 控制。**3 个 Switch 全部 T6 一次安装好**，只是 T6 阶段只合 Network A。

| 网 | 范围 | 数量 | T6 状态 | 升级触发 |
|---|---|---:|---|---|
| Network A | row 0 B1/B2/P1/P2/P3 | 5 | **ON** | — |
| Network B | row 2 P4 | 1 | OFF | T7 翻 ON |
| Network C | row 2 B3/P5 | 2 | OFF | T8 翻 ON（T9 调满超频） |

> Power Switch 物理位置建议放 1F col=4.5 row=2（manifold 区角落），3 个并排，方便玩家在场内一眼区分。

## 建造步骤

1. **框架**：5×5 cell × 5 cell 高（40×40×40m）
2. **1F (0-10m) row 0**：放 5 台 constructor（钢梁 B1/B2 在 col=0/1，钢管 P1/P2/P3 在 col=2/3/4）
3. **1F (0-10m) row 2**：放 3 台 constructor（钢梁 B3 在 col=0，钢管 P4/P5 在 col=1/2）；col=3/4 留 manifold + 主 lift 操作区
4. **1F belt**：row=2.5 横铺钢梁/钢管两条独立收集 belt 收 row 0 五台；row=5.5 横铺第二条接 row 2 三台；末端 col=4.5 合流到主 lift-out-top
5. **钢锭进料**：左 Wall Inlet (h=22m) → lift-bot 下到 1F 中央 splitter
   - 钢锭 splitter 1→2：钢梁 manifold（喂 B1/B2/B3 全部 3 台）+ 钢管 manifold（喂 P1-P5 全部 5 台），按消耗比例分
6. **垂直汇总**：钢梁/钢管两条主 belt 末端 (col=4.5) → 各 1 个 1→2 splitter（按 mainNode 与 B3 流量比）
7. **lift-top ×4**：上行（钢梁→B3、钢梁→B5、钢管→B3、钢管→B5）合到屋顶 2 个 merger
8. **屋顶 (35m)**：铺 6 条 Mk4 平行 belt（B1 row=0.5 ... B6 row=4.5）+ 2 个 merger 注入；左右各嵌 Wall Mount (Inlet 左 / Outlet 右)
9. **Power Switch ×3**：按上面"Power Switch 分网"表布置 Network A/B/C；T6 只合 A，B/C 全部 OFF
10. **Power Shard（T6 阶段）**：仅 B1/B2 各插 3 shard 调 210%，P1/P2/P3 各插 3 shard 调 225%；**B3/P4/P5 物理已就位但 shard 槽空着**

## Tier 7+ 启用流程（仅翻 Switch + 插 shard，不动结构 / 不动 belt）

| Tier | 操作 | 通电总数 |
|---|---|---:|
| T7 | 翻 Network B Switch ON → P4 插 3 shard 调超频 | 6 (2 beam + 4 pipe) |
| T8 | 翻 Network C Switch ON → B3/P5 各插 3 shard | 8 (3 beam + 5 pipe) |
| T9 | **全 8 台超频调到满载**（钢梁 3 × 31.5 = 94.5 / 钢管 5 × 45 = 225）；钢锭进料 belt 容量按 T9 满载预留 | 8 |

## 验证

- [ ] **8 台 constructor 全部物理放置**（包括 T6 不通电的 B3/P4/P5）
- [ ] Belt manifold + lift 接到全部 8 台 in-0（不只是 T6 通电的 5 台）
- [ ] 3 个 Power Switch 一次建好，Network A 合上，B/C 断开
- [ ] T6 仅 B1/B2/P1/P2/P3 插了 3 shard；B3/P4/P5 物理就位但 shard 槽空
- [ ] 钢梁/钢管两条 row 独立 belt（不能混料）
- [ ] B3/B5 流量在 Mk4 容量内（B3 163 < 480 ✓ / B5 35 < 480 ✓）
- [ ] 左 Wall Inlet h=22m 与 BP4 右 Wall Outlet h=22m 对齐
- [ ] 屋顶 6 belt 直通，仅 B3/B5 两个 merger 注入
