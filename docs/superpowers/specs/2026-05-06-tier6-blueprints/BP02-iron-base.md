# BP2 铁板 + 铁棒 + 强化铁板 (C1)

## 概要

- **集群**: C1 铁系（紧贴 BP1 之后）
- **规格**: Mk2 **2 实例**（BP2a + BP2b，相同蓝图复制贴贴）
- **机器**（每实例 ½ 配额）: 4 plate constructor + 11 rod constructor + 3 RIP assembler = **18 台**（T6 激活），**33 台**（T7+ 满载，物理建造）
- **激活时间线**: T6 4+11+3 → T7 6+15+4 → T8 7+18+5 → T9 8+20+5
- **产能 T6**: 铁板 173 / 铁棒 381 / 强化铁板 25.5 (per minute)

## 机器超频清单（T6，Plan C ≤250%）

| 配方 | 数量 | 超频 | 单台产能 (/min) | Power Shard/台 |
|---|---:|---:|---:|---:|
| iron-plate (constructor) | 4 | **216.25%** | 43.25 | 3 |
| iron-rod (constructor) | 11 | **230.91%** | 34.64 | 3 |
| reinforced-iron-plate (assembler) | 3 | **170.0%** | 8.5 | 2 |
| **合计 (T6)** | 18 | — | — | 4×3 + 11×3 + 3×2 = **51** |

> 总产能验证: 4 × 43.25 = 173 铁板 ✓ | 11 × 34.64 = 381 铁棒 ✓ | 3 × 8.5 = 25.5 RIP ✓

## 物料 I/O

| 方向 | 物料 | 流量 | 路径 |
|---|---|---|---|
| 输入 | 铁锭 | 640/min | **集群内部** ← BP1 右 Wall Outlet (h=24m) → BP2a 左 Wall Inlet |
| 输入 | 螺丝 | 276/min | **集群内部** ← BP3 右 Wall Outlet (h=24m) → BP2b 末端 |
| 输出 | 铁板 → RIP 内部 | 153 | 集群内部回流 1F→3F |
| 输出 | 铁板 → B5 终端 | 20 | 屋顶 merger → B5 |
| 输出 | 铁棒 → C1 内部 BP3 | 224 | 集群内部 → BP3 左 Wall Inlet |
| 输出 | 铁棒 → B2 (C6 转子+模框) | 140 | 屋顶 merger → B2 |
| 输出 | 铁棒 → B5 终端 | 15 | 屋顶 merger → B5 |
| 输出 | 强化铁板 → B2 (BP13/BP15) | 18 + 2.5 | 屋顶 merger → B2 |
| 输出 | 强化铁板 → B5 终端 | 5 | 屋顶 merger → B5 |

**屋顶总线接入**: 注入 B2 (铁棒 140 + RIP 20.5)、B5 (mainNode 40)

## 楼层占用

| 层 | 高度 | 内容 | 数量 |
|---|---|---|---:|
| 1F | 0-8m | 4 plate + 5 rod constructor 混排 | 9 |
| 2F | 12-20m | 6 rod constructor | 6 |
| 3F | 24-32m | 3 RIP assembler | 3 |
| 屋顶 | 35-40m | B1-B6 + merger × 2 + lift × 多 | — |

> 单 Mk2 实例只装 ½ 配额，剩余建在 BP2b 副本中。下表数字是单实例。

## 俯视图（BP2a 1F, 0-8m）

```
       col=0   col=1   col=2   col=3   col=4   col=5
      ┌──────┬──────┬──────┬──────┬──────┐
r=0   │ ┌──┐ │┌──┐  │┌──┐  │┌──┐  │      │  4 plate constructor (8×10m)
      │ │P1│ ││P2│  ││P3│  ││P4│  │      │
r=1   │ └─↓┘ │└─↓┘  │└─↓┘  │└─↓┘  │      │
      ├──────┼──────┼──────┼──────┼──────┤
r=2   │ ============ collect belt =======│  ← 1F 主 belt h=2m
      ├──────┼──────┼──────┼──────┼──────┤
r=3   │ ┌──┐ │┌──┐  │┌──┐  │┌──┐  │┌──┐  │  5 rod constructor
      │ │R1│ ││R2│  ││R3│  ││R4│  ││R5│  │
r=4   │ └─↓┘ │└─↓┘  │└─↓┘  │└─↓┘  │└─↓┘  │
      └──────┴──────┴──────┴──────┴──────┘
```

2F (12-20m): 6 rod constructor，2×3 grid（每行 3 台 24m × 10m）
3F (24-32m): 3 RIP assembler 一字排（assembler 10m × 15m，3 台 30m × 15m）

## 屋顶总线层（35-40m）

```
B1 ═════════════════════════════════════════> B1 直通
B2 ═══[merger ←──铁棒/RIP lift-top]═════════> B2 (铁棒 140 + RIP 20.5)
B3 ═════════════════════════════════════════> B3 直通
B4 ═════════════════════════════════════════> B4 直通
B5 ═══[merger ←──mainNode lift-top]═════════> B5 (铁板 20 + 铁棒 15 + RIP 5)
B6 ═════════════════════════════════════════> B6 直通
```

- 屋顶 2 个 merger（一个注 B2，一个注 B5）
- 2 条 lift-top（铁棒/RIP 上行）连接 2F+3F 输出到屋顶 merger 进口

## 建造步骤（BP2a，BP2b 完全相同复制）

1. **1F (0-8m)**: 9 constructor（4 plate + 5 rod）按俯视图布置
2. **1F belt 收集**:
   - plate 输出 → row=2 主 belt（铁板）
   - rod 输出 → row=2 主 belt 第二条（铁棒）
3. **铁锭进料**: 左 Wall Inlet (h=24m)? 不对，集群内部是 24m。重新核对：
   - 改为 BP1 输出在 24m，BP2 输入也在 24m → 进入 BP2 后用 lift-bot 下到 1F splitter manifold
   - splitter manifold 把铁锭分配给 9 + 6 = 15 台 rod/plate constructor
4. **1F→2F**: 4m 地基 (8-12m)；2F 6 台 rod，进料同样从中央 splitter manifold 取
5. **2F→3F**: 4m 地基 (20-24m)；3F 3 台 RIP assembler（双输入：铁板 + 螺丝）
6. **3F 输入**:
   - 铁板：1F plate 输出 → lift-out-top 上到 3F 4m row 中央 splitter
   - 螺丝：右 Wall Inlet (h=28m) ← BP3 输出（实际从 BP3 集群内反向接）→ 3F splitter
7. **屋顶 (35-40m)**:
   - 6 条 Mk4 belt 直通
   - row=1 处放 1 个 merger 注入 B2（铁棒/RIP）
   - row=4 处放 1 个 merger 注入 B5（mainNode 余量）
   - 2 个 lift-top（铁棒上行 → B2 merger，mainNode 上行 → B5 merger）
8. **Power Switch**: 关闭闲置（BP2a 单实例先全开，BP2b 副本只关 1 台）

## 关键同轴对齐

- 3F RIP assembler 的螺丝输入端口必须 col 同轴对齐 BP3 的螺丝主 belt（避免 R17 飞天面条神）
- BP3 螺丝输出在 BP3 右 Wall Outlet h=24m → BP2b 右 Wall Inlet h=24m → lift 上到 28m
- 由此 BP2b 必须紧贴 BP3 之前

## Tier 7+ 扩容点

| Tier | 增量 |
|---|---|
| T7 | +6 (=4 plate diff)+4 (=4 rod diff)+1 (=1 RIP diff) → BP2a 6+8+2，BP2b 0+7+2 |
| T8 | 7+18+5 = 30 总，BP2a 7+10+3，BP2b 0+8+2 |
| T9 | 8+20+5 = 33 满载，BP2a/b 均开足 |

## 验证

- [ ] BP2a 紧贴 BP1 右侧；BP2b 紧贴 BP2a 右侧
- [ ] BP2a 左 Wall Inlet h=24m 接铁锭（来自 BP1）
- [ ] BP2b 右 Wall Outlet h=24m 接铁棒（去 BP3）
- [ ] 3F RIP 螺丝输入与 BP3 螺丝主 belt 同轴
- [ ] 屋顶 2 个 merger filter 正确（B2 = 铁棒+RIP，B5 = 铁板+铁棒+RIP mainNode）
