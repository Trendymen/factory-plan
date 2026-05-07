# BP8 电路板 (C3)

## 概要

- **集群**: C3 铜电链（紧贴 BP7c 之后，C3 末端）
- **规格**: Mk2 单实例（8 assembler 物理建造，T6 仅 1 台激活）
- **机器**: assembler（circuit-board 配方：4 铜板 + 8 塑料 → 4 电路板/min）
- **激活时间线**: T6 **1** (183%) → T7 4 → T8 6 → T9 **8** (219%)
- **产能 T6**: 13.75/min 电路板

## 机器超频清单（T6，Plan C ≤250%）

| 配方 | 数量 | 超频 | 单台产能 (/min) | Power Shard/台 |
|---|---:|---:|---:|---:|
| circuit-board (assembler) | 1 | **183.33%** | 13.75 | 2 |
| **合计 (T6)** | 1 | — | — | 1×2 = **2** |

> 总产能验证: 1 × 13.75 = 13.75 电路板 ✓
> T9 满载 8 台 @ 219% 时仍是 3 shard/台 = 24 shard 总。

## 物料 I/O

| 方向 | 物料 | 流量 (T6) | 路径 |
|---|---|---|---|
| 输入 | 铜板 | 27.5 | **集群内部** ← BP7 右 Wall Outlet (h=24m) → BP8 左 Wall Inlet |
| 输入 | 塑料 | 55 | **屋顶 B4** ← C4 BP9 |
| 输出 | 电路板 → BP14 电脑 | 10 | 屋顶 B4 (集群外) |
| 输出 | 电路板 → BP15 HSC | 3.75 | 屋顶 B4 (集群外) |

> 注：电路板**不是 mainNode**（无 B5 终端注入），全部内部消费。

**屋顶总线接入**: 取自 B4 (塑料 55) + 注入 B4 (电路板 13.75)

## 楼层占用

| 层 | 高度 | 内容 | 数量 |
|---|---|---|---:|
| 1F | 0-8m | assembler（10m × 15m × 8m）| 1 (T6) → 4 (T9) |
| 2F | 12-20m | assembler | 0 (T6) → 4 (T9) |
| 屋顶 | 35-40m | B1-B6 + smart splitter + merger + 2 lift | — |

> assembler 10m × 15m，1F 装 4 台 row=0 横排（4 × 10m = 40m，刚好满）；2F 同样 4 台。

## 俯视图（1F, 0-8m）

```
       col=0   col=1   col=2   col=3   col=4   col=5
      ┌──────┬──────┬──────┬──────┬──────┐
r=0   │ ┌────┐ ┌────┐ ┌────┐ ┌────┐       │  4 assembler 一字排
      │ │A1  │ │A2  │ │A3  │ │A4  │       │  10m × 15m × 8m
r=1   │ │CB  │ │CB  │ │CB  │ │CB  │       │
      │ │↓   │ │↓   │ │↓   │ │↓   │       │  ↓ = 输出 front 南
r=2   │ └────┘ └────┘ └────┘ └────┘       │
      ├──────┼──────┼──────┼──────┼──────┤
r=3   │ === collect (电路板 lift-top) ────│  → 屋顶 merger 注 B4
      ├──────┼──────┼──────┼──────┼──────┤
r=4   │      │      │      │      │      │
      └──────┴──────┴──────┴──────┴──────┘
```

> assembler 占 row 0-2 (15m 长 = 1.875 cells)，行末有 5m 余量。

## 屋顶总线层（35-40m）

```
B1 ═════════════════════════════════════════> B1
B2 ═════════════════════════════════════════> B2
B3 ═════════════════════════════════════════> B3
B4 ═══[smart split (filter=塑料)──55┐    ]═> B4 余 (-55 +13.75)
                                    │
                                  lift-bot
                                    │
                                    ↓
                            到 1F assembler in-1
B4 (此处也合) ═══[merger ←──电路板 13.75]═══>
                       (上方 lift-top 来)
                       (此 merger 在 B4 上 splitter 之后，重新合流)
```

- 屋顶 1 个 smart splitter（filter=塑料 55/min）从 B4 取
- 屋顶 1 个 merger（电路板 13.75）注回 B4
- splitter 在 merger 之前（先取走塑料，再注入电路板，避免新出的电路板被取塑料的 splitter 误吸）

## 建造步骤

1. **1F (0-8m)**: 1 台 assembler（col=0, row=0，T6）；T7+ 渐次加 col=1/2/3
2. **铜板进料**: 左 Wall Inlet (h=24m, row=2) → lift-bot → 1F splitter manifold → assembler in-0 (back)
3. **塑料进料**: 屋顶 (35m) smart splitter (filter=塑料 55) 从 B4 取 → lift-bot 下到 1F → assembler in-1 (back)
4. **1F belt 收集**: row=3 主 belt 收集 1F 输出
5. **1F→2F** (T7+): 4m 地基 (8-12m)；2F 4 台 assembler
6. **垂直汇总**: 1F + 2F 输出 → lift-out-top → 屋顶 (35m) merger 注 B4
7. **屋顶 (35m)**: 6 belt 直通 + B4 上的 splitter + merger
8. **Power Switch**: 关闭 7 台闲置（T6 仅 1 台开）

## 集群内部短 belt

仅入：BP7 → BP8 铜板 27.5（左 Wall Inlet h=24m row=2）。

## Tier 7+ 扩容点

| Tier | 总数 |
|---|---:|
| T6 | 1 |
| T7 | 4（电脑 uplift 11x，电路板 uplift 4-5x）|
| T8 | 6 |
| T9 | 8 (满载 219%) |

## 验证

- [ ] B4 上 splitter 在 merger 之前（避免新生电路板被误取）
- [ ] AI 限制器**不在**本蓝图（已迁移到 BP10）
- [ ] BP7→BP8 铜板短 belt 高度 24m 对齐
- [ ] 塑料 55/min 取自 B4 上的 BP9 来料（B4 上 BP9→BP8 段流量需 ≥ 55）
