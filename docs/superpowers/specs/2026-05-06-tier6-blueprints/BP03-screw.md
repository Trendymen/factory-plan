# BP3 螺丝双线 (C1)

## 概要

- **集群**: C1 铁系（紧贴 BP2b 之后，C1 末端）
- **规格**: Mk2 单实例（19 constructor 物理建造，T6 仅 9 台激活）
- **机器**: screw constructor
- **激活时间线**: T6 **9** (240.56%) → T7 12 → T8 16 → T9 **19** (241%)
- **产能 T6**: 866/min 螺丝

## 机器超频清单（T6，Plan C ≤250%）

| 配方 | 数量 | 超频 | 单台产能 (/min) | Power Shard/台 |
|---|---:|---:|---:|---:|
| screw (constructor) | 9 | **240.56%** | 96.22 | 3 |
| **合计 (T6)** | 9 | — | — | 9×3 = **27** |

> 总产能验证: 9 × 96.22 = 866 螺丝 ✓

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

| 层 | 高度 | 内容 | 数量 (T6/T9) |
|---|---|---|---:|
| 1F | 0-8m | screw constructor | 5 / 10 |
| 2F | 12-20m | screw constructor | 4 / 9 |
| 屋顶 | 35-40m | B1-B6 + 2 merger + 2 lift-top | — |

> T7+ 满载需 19 台：1F 10 + 2F 9。T6 只激活前 9 台（其余物理建造 + Power Switch 关）。

## 俯视图（1F, 0-8m）

```
       col=0   col=1   col=2   col=3   col=4   col=5
      ┌──────┬──────┬──────┬──────┬──────┐
r=0   │ ┌──┐ │┌──┐  │┌──┐  │┌──┐  │┌──┐  │  5 screw constructor
      │ │C1│ ││C2│  ││C3│  ││C4│  ││C5│  │  8m × 10m
r=1   │ └─↓┘ │└─↓┘  │└─↓┘  │└─↓┘  │└─↓┘  │
      ├──────┼──────┼──────┼──────┼──────┤
r=2   │ ====== Mk4 收集 belt（螺丝）======│
      ├──────┼──────┼──────┼──────┼──────┤
r=3   │      │      │      │      │      │  T7+ 第二行 5 台
r=4   │      │      │      │      │      │
      └──────┴──────┴──────┴──────┴──────┘
                                ← 左 Wall Inlet (h=6m, row=2.5, 铁棒来自 BP2b)
                                ← 左 Wall Outlet (h=28m, row=3, 螺丝**反向**给 BP2b → BP2a RIP)
                                → 右 Wall Outlet/Inlet 仅屋顶 6 belt 续接 BP4
```

2F (12-20m): 4 台 screw constructor 一字排（同 1F row=0 布局，col=0→3）+ T7+ 加 5 台第二行

## 屋顶总线层（35-40m）

```
B1 ═══[merger ←──螺丝 lift-top 350]═════════> B1 (350)
B2 ═══[merger ←──螺丝 lift-top 240]═════════> B2 (240)
B3 ═════════════════════════════════════════> B3
B4 ═════════════════════════════════════════> B4
B5 ═════════════════════════════════════════> B5 (BP3 不上 mainNode，因螺丝不是 mainNode)
B6 ═════════════════════════════════════════> B6
```

- 屋顶 2 个 merger，分别注入 B1 和 B2
- 1F+2F 螺丝输出 split 为 3 路：276 给 BP2b RIP（反向走集群内）、350 上 B1、240 上 B2
- 3 路分配用 1F 中央 1 个 programmable splitter（filter=螺丝，3 输出按比例 276:350:240）
- 350 + 240 = 590 上 lift-top，到屋顶后再用 splitter 分到 B1 / B2 各 1 个 merger

## 建造步骤

1. **1F (0-8m)**: 5 台 screw constructor 一字排 row=0
2. **1F belt 收集**: row=2 横向 Mk4 主 belt 收集 5 台输出（合流后 ~480/min）
3. **铁棒进料**: 左 Wall Inlet (h=6m, row=2.5) ← BP2b 右 Wall Outlet → 同高度 belt 直通 1F → splitter manifold 喂 5 台 (T6) / 10 台 (T9)
4. **1F→2F**: 4m 地基 (8-12m)
5. **2F (12-20m)**: 4 台 screw constructor 一字排 row=0；同样 row=2 收集 belt
6. **2F 铁棒进料**: 与 1F 共用同一进料 lift（左 Wall Inlet 在 12m，自然进 2F 高度；再下行到 1F）
7. **3 路分配**:
   - 1F + 2F 主 belt 末端 → lift-out-top 上送到 28m
   - 28m 一个 1→3 programmable splitter（filter=螺丝，按 276 / 350 / 240 比例）
   - 276 → 短 belt → **左 Wall Outlet (col=0, h=28m, row=3)**（**反向**给 BP2b → BP2a 3F RIP）
   - 350 + 240 = 590 → lift-out-top → 屋顶 (35m)
8. **屋顶 (35-40m)**:
   - 6 条 Mk4 belt 直通
   - 590 / 60 < 1 Mk4 容量，分到 1 个 1→2 splitter（350 + 240）
   - 350 → merger 注 B1
   - 240 → merger 注 B2
9. **Power Switch**: 关闭 1F + 2F 中后建的 4 + 5 = 9 台（T6 阶段）；T7+ 渐次开

## 同轴对齐关键

- **BP3 左 Wall Outlet (h=28m, row=3, 螺丝反向)** 与 BP2b 右 Wall Inlet (h=28m, row=3) 高度+row 完全镜像对齐 → Auto Connect 自动续接
- BP3 左 Wall Inlet (h=6m, row=2.5, 铁棒) 与 BP2b 右 Wall Outlet (h=6m, row=2.5) 镜像对齐
- BP3 右侧（接 BP4）只有屋顶 6 belt mount + 6m 高度铁棒/24m 高度铁锭 mount 作为继承（这两个 mount 接 BP4 时悬空，BP4 不会取）

## Tier 7+ 扩容点

| Tier | 总数 | BP3 单实例 |
|---|---:|---|
| T6 | 9 | 1F 5 + 2F 4 |
| T7 | 12 | +1 1F、+2 2F |
| T8 | 16 | +1 1F、+3 2F |
| T9 | 19 | 1F 10 + 2F 9 (满载) |

## 验证

- [ ] 螺丝 276 反向接到 BP2b 3F RIP（避免飞面）
- [ ] 1→3 splitter 比例配置正确
- [ ] B1/B2 流量在 Mk4 容量内（350 < 480 ✓，240 + 其他 = 400.5 < 480 ✓）
- [ ] 9 激活 constructor 各 3 power shard 超频 240%
