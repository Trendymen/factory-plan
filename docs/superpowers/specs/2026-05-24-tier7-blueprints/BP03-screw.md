# BP3 螺丝双线 (C1)

## 概要

- **集群**: C1 铁系（紧贴 BP2b 之后，C1 末端）
- **规格**: Mk2 单实例
- **机器**: **19 constructor 一次物理建造到位**（screw 配方）
- **激活时间线**（仅翻 Power Switch + 插 Power Shard，不动结构）:
  - T6 → 9 台通电（其余 10 台 Power Switch 关）
  - T7 → 12 台通电
  - T8 → 16 台通电
  - T9 → 19 台通电（满载 241%）
- **产能**: T6 866 / T9 ~1828 /min 螺丝

> **核心设计原则**：**19 台 constructor 在 T6 阶段就全部摆好 + belt/manifold/电网/Power Switch 全部接好**。后续升 Tier 时**不重新放机器、不重新拉 belt**——只需 (1) 翻对应 Power Switch (2) 插 Power Shard (3) 调超频百分比。

## 机器超频清单（T6，Plan C ≤250%）

| 配方 | 物理 | T6 通电 | 超频 | 单台产能 (/min) | Power Shard/通电台 |
|---|---:|---:|---:|---:|---:|
| screw (constructor) | 19 | **9** | 240.56% | 96.22 | 3 |
| **合计 (T6)** | 19 | 9 | — | 9 × 96.22 = **866** | 9 × 3 = **27** |

> T6 时未通电的 10 台 constructor：物理建好、belt 接好、shard 槽**空着**、Power Switch **关**，完全不耗电不产出。<br>
> T9 满载 19 台 @ 241% = ~1828/min，每台 3 shard = **57 shard 总**。

## 物料 I/O

| 方向 | 物料 | 流量 (T6) | 路径 |
|---|---|---|---|
| 输入 | 铁棒 | 216.5/min | **集群内部** ← BP2b 右 Wall Outlet (h=6m, row=2.5) → BP3 **左 Wall Inlet** (h=6m, row=2.5) |
| 输出 | 螺丝 → BP2 RIP（C1 内部，**反向流**）| 276 | BP3 **左 Wall Outlet** (h=28m, row=3) → BP2b 右 Wall Inlet (h=28m, row=3) → BP2b 内部反向 belt → BP2a RIP |
| 输出 | 螺丝 → B1 (BP12 转子) | 350 | 屋顶 merger → B1 |
| 输出 | 螺丝 → B2 (BP14 HMF) | 240 | 屋顶 merger → B2 |

**屋顶总线接入**: 注入 B1 (350) + B2 (240)

> ⚠ **关键**：螺丝回流到 BP2 RIP 是**反向路由**——BP3 是 C1 集群最右端，给左边 BP2 的 belt 必须从 **左 Wall Outlet** 出（向左流）。出口在 h=28m 是为了对齐 BP2 蓝图的 3F (24-32m) RIP 螺丝输入。BP2 蓝图自带"右 Inlet 28m → 左 Outlet 28m"反向直通 belt，让螺丝跨 BP2b 到 BP2a。

## 楼层占用

| 层 | 高度 | 内容 | 物理台数 | T6 通电 |
|---|---|---|---:|---:|
| 1F | 0-10m | screw constructor row 0 (C1-C5) + row 2 (C6-C10) | 10 | **5** |
| 4m 地基 | 10-14m | 隔层 | — | — |
| 2F | 14-24m | screw constructor row 0 (C11-C15) + row 2 (C16-C19) | 9 | **4** |
| 4m 地基 | 24-28m | 隔层 | — | — |
| 屋顶 | 35-40m | B1-B6 + 2 merger + 2 lift-top | — | — |

> **T6 阶段**：1F C1-C5 通电（Network A），2F C11-C14 通电（Network B），其余 10 台 Power Switch **关**（Network C/D/E 待 T7+ 渐次启用）。所有 belt / lift / manifold / Power Switch 一次到位。

## 俯视图（按实际比例，每层独立）

**比例约定**（同 BP02）：1 字符 = 1m 横向；1 行 = 2m 纵向；蓝图 40×40m = 40 字符 × 20 行。

**图例**：
- `*` 后缀 = T6 通电；无 `*` = T7+ Power Switch 关（物理已建，不耗电不产出）
- `v` = front (south) 输出
- `8x10` = 8m 宽 × 10m 长

### 1F (0-10m): 10 screw constructor — T6 仅 row 0 通电

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐           │
        ││ C1*  ││ C2*  ││ C3*  ││ C4*  ││ C5*  │ row 0:    │
 4      ││screw ││screw ││screw ││screw ││screw │ 5 台      │
        ││ 8x10 ││ 8x10 ││ 8x10 ││ 8x10 ││ 8x10 │ 全部 T6   │
 8      ││  v   ││  v   ││  v   ││  v   ││  v   │ 通电      │
        │└──────┘└──────┘└──────┘└──────┘└──────┘           │
10      │──── screw collect belt #1 h=2m row=2.5 ──────────│
        │┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐           │
14      ││ C6   ││ C7   ││ C8   ││ C9   ││ C10  │ row 2:    │
        ││screw ││screw ││screw ││screw ││screw │ 5 台 T6   │
18      ││ 8x10 ││ 8x10 ││ 8x10 ││ 8x10 ││ 8x10 │ Switch    │
        ││  v   ││  v   ││  v   ││  v   ││  v   │ OFF       │
22      │└──────┘└──────┘└──────┘└──────┘└──────┘           │
        │──── screw collect belt #2 h=2m row=5.5 ──────────│
26      │ 铁棒进料：左 Wall Inlet h=6m row=2.5              │
        │   splitter manifold 喂 1F 10 台 in-0 (back)       │
30      │   + 续接 lift-up 喂 2F 9 台                       │
        │ 螺丝出料：10 台 front → belt #1/#2 →              │
34      │   col=4.5 主 lift-out-top → h=28m 1→3 splitter    │
        │   (276 反向 + 350 B1 + 240 B2)                    │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- C1-C5：row 0 共 5 台 constructor，T6 **全部通电**（Network A）
- C6-C10：row 2 共 5 台，T6 Power Switch **OFF**（Network C/D，T7/T8 渐次开）
- 进料：左 Wall Inlet (h=6m) → splitter manifold → 喂 1F 10 台 + 续接 lift-up 给 2F
- 出料：10 台 front → 2 条收集 belt → col=4.5 主 lift-out-top → h=28m

### 2F (14-24m): 9 screw constructor — T6 仅 row 0 部分通电

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐           │
        ││ C11* ││ C12* ││ C13* ││ C14* ││ C15  │ row 0:    │
 4      ││screw ││screw ││screw ││screw ││screw │ 5 台      │
        ││ 8x10 ││ 8x10 ││ 8x10 ││ 8x10 ││ 8x10 │ C11-14 ON │
 8      ││  v   ││  v   ││  v   ││  v   ││  v   │ C15 OFF   │
        │└──────┘└──────┘└──────┘└──────┘└──────┘           │
10      │──── screw collect belt #3 h=16m row=2.5 ─────────│
        │┌──────┐┌──────┐┌──────┐┌──────┐                   │
14      ││ C16  ││ C17  ││ C18  ││ C19  │ row 2: 4 台       │
        ││screw ││screw ││screw ││screw │ T6 Switch OFF     │
18      ││ 8x10 ││ 8x10 ││ 8x10 ││ 8x10 │ → T8/T9 渐次开    │
        ││  v   ││  v   ││  v   ││  v   │ col 4 留 manifold │
22      │└──────┘└──────┘└──────┘└──────┘ + lift 操作区     │
        │──── screw collect belt #4 h=16m row=5.5 ─────────│
26      │ 铁棒进料：lift-up 从 1F manifold 上来 (h=6→16m)   │
        │ 螺丝出料：belt #3/#4 → lift-out-top → 28m 主 belt │
30      │                                                   │
34      │ 通电节奏：T7 开 C15+C16+C17（3 台 Network C）     │
        │           T8 再开 C6+C7+C8+C18（共 16）           │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- C11-C14：4 台 T6 **通电**（Network B）；C15 物理已建 Switch OFF（Network C）
- C16-C19：4 台 T6 Switch OFF（Network C/D/E）
- Belt manifold + lift 一次性接到所有 9 台 in-0 / front，与 1F manifold 共用同一进料路径
- 通电节奏：T7 开 C6+C15+C16 → 12；T8 再开 C7+C8+C17+C18 → 16；T9 再开 C9+C10+C19 → 19

### 屋顶 (35-40m): B1 + B2 mergers

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │ o B1 ───[merger << lift-top screw 350]──── o   │
 4      │ o B2 ───[merger << lift-top screw 240]──── o   │
 8      │ o B3 ────────────────────────────────────── o   │
12      │ o B4 ────────────────────────────────────── o   │
16      │ o B5 ────────────────────────────────────── o   │
20      │ o B6 ────────────────────────────────────── o   │
24      │                                                 │
28      │ B1 + B2 each receive one screw merger           │
32      │ Total screw: 350 (B1) + 240 (B2) + 276 reverse  │
36      │ Note: screw is NOT a mainNode, so no B5 merger  │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- 屋顶 2 个 merger 注 B1 (350) + B2 (240)，T6 一次建好
- 1F+2F screw 输出 → 1F 中央 programmable splitter 1→3 → 276 反向 + 350 B1 + 240 B2
- 590 (= 350+240) 上 lift-top → 屋顶分流给 B1 / B2 两个 merger

## Power Switch 分网

把 19 台 constructor 拆 5 个独立 Power Network，由 5 个 Power Switch 控制。**5 个 Switch 全部 T6 一次安装好**，T6 阶段只合 Network A + B。

| 网 | 范围 | 数量 | T6 状态 | 升级触发 |
|---|---|---:|---|---|
| Network A | 1F row 0 C1-C5 | 5 | **ON** | — |
| Network B | 2F row 0 C11-C14 | 4 | **ON** | — |
| Network C | 1F C6 + 2F C15-C16 | 3 | OFF | T7 翻 ON（+3 = 12） |
| Network D | 1F C7-C8 + 2F C17-C18 | 4 | OFF | T8 翻 ON（+4 = 16） |
| Network E | 1F C9-C10 + 2F C19 | 3 | OFF | T9 翻 ON（+3 = 19 满载） |

> Power Switch 物理位置建议放 2F col=4.5（manifold 区角落），5 个并排，方便玩家在场内一眼区分。

## 建造步骤

1. **框架**：5×5 cell × 5 cell 高（40×40×40m）
2. **1F (0-10m)**：放 10 台 screw constructor C1-C10（row 0 cols 0-4 = 5 台 + row 2 cols 0-4 = 5 台）
3. **1F belt**：row=2.5 横铺 belt #1 收 row 0 五台；row=5.5 横铺 belt #2 收 row 2 五台；末端 col=4.5 合流到主 lift-out-top
4. **1F 地基**：y=10m 铺 4m 厚地基覆盖整层
5. **2F (14-24m)**：放 9 台 screw constructor C11-C19（row 0 cols 0-4 = 5 台 + row 2 cols 0-3 = 4 台）
6. **2F belt**：row=2.5 belt #3 + row=5.5 belt #4，末端 lift-out-top
7. **2F 地基**：y=24m 铺 4m 厚地基
8. **垂直汇总**：1F+2F 4 条 belt 的末端 lift-out-top 在 col=4.5 汇合成一根主 lift 上送到 h=28m
9. **铁棒进料**：**左 Wall Inlet (h=6m, row=2.5)** ← BP2b 右 Wall Outlet → splitter manifold 喂 **全部 19 台**（1F 直喂 10 台 + lift-up 喂 2F 9 台）
10. **3 路分配（28m 节点）**：
    - 28m 一个 1→3 programmable splitter（filter=螺丝，按 276 / 350 / 240 比例）
    - 276 → 短 belt → **左 Wall Outlet (col=0, h=28m, row=3)**（**反向**给 BP2b → BP2a 3F RIP）
    - 350 + 240 = 590 → lift-out-top → 屋顶 (35m)
11. **屋顶 (35-40m)**：铺 6 条 Mk5 平行 belt（B1 row=0.5 ... B6 row=4.5），左右各嵌 Wall Mount
    - 590 / 60 < 1 Mk5 容量（76%），分到 1 个 1→2 splitter（350 + 240）
    - 350 → merger 注 B1
    - 240 → merger 注 B2
12. **Power Switch ×5**：按上面"Power Switch 分网"表布置 Network A/B/C/D/E；T6 只合 A+B，C/D/E 全部 OFF
13. **Power Shard（T6 阶段）**：仅 C1-C5 + C11-C14 各插 3 shard，超频到 240.56%；**其余 10 台物理已就位但 shard 槽空着**

## Tier 7+ 启用流程（仅翻 Switch + 插 shard，不动结构 / 不动 belt）

| Tier | 操作 | 通电总数 |
|---|---|---:|
| T7 | 翻 Network C Switch ON → C6 + C15 + C16 各插 3 shard 调超频 | 12 |
| T8 | 翻 Network D Switch ON → C7 + C8 + C17 + C18 各插 3 shard | 16 |
| T9 | 翻 Network E Switch ON → C9 + C10 + C19 各插 3 shard，**全 19 台超频调到 241%**；矿场来料 belt + 1→3 splitter 容量按 T9 复算（~1828/min 即使 Mk6 也不够，需拆分 3 条 Mk5 槽位或 2 条 Mk6）| 19 |

## 同轴对齐关键

- **BP3 左 Wall Outlet (h=28m, row=3, 螺丝反向)** 与 BP2b 右 Wall Inlet (h=28m, row=3) 高度+row 完全镜像对齐 → Auto Connect 自动续接
- BP3 左 Wall Inlet (h=6m, row=2.5, 铁棒) 与 BP2b 右 Wall Outlet (h=6m, row=2.5) 镜像对齐
- BP3 右侧（接 BP4）只有屋顶 6 belt mount + 6m 高度铁棒/24m 高度铁锭 mount 作为继承（这两个 mount 接 BP4 时悬空，BP4 不会取）

## 验证

- [ ] **19 台 constructor 全部物理放置**（包括 T6 不通电的 10 台 C6-C10 + C15-C19）
- [ ] Belt manifold + lift 接到全部 19 台 in-0（不只是 T6 通电的 9 台）
- [ ] 5 个 Power Switch 一次建好，Network A+B 合上，C/D/E 断开
- [ ] T6 仅 C1-C5 + C11-C14 插了 3 shard；其余 10 台物理就位但 shard 槽空
- [ ] 螺丝 276 反向接到 BP2b 3F RIP（避免飞面）
- [ ] 1→3 splitter 比例配置正确（276 / 350 / 240）
- [ ] 屋顶 2 merger 一次建好，B1/B2 流量在 Mk5 容量内（350 < 780 ✓，240 + 其他 = 400.5 < 780 ✓）
- [ ] 铁棒来料 belt 已 Mk5（780/min）；T9 ~457/min 在 Mk5 容量内（59%）
