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

## 俯视图（按实际比例，每层独立 — 视觉正方形）

**比例约定**：横向 1 字符 = 1m，纵向 1 行 = 2m；蓝图 40×40m → 51 字符 × 20 行画布。

机器 ASCII 占位：assembler 10m × 15m → 11 字符宽 × 7-8 行（CB asm 即 circuit-board assembler）。

### 1F (0-12m): 4 assembler row=0（T6 仅 A1 启用）

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌─────────┐┌─────────┐┌─────────┐┌─────────┐     │
        ││   A1    ││   A2    ││   A3    ││   A4    │T6   │
 4      ││ CB asm  ││ CB asm  ││ CB asm  ││ CB asm  │A1   │
        ││ 10x15   ││ 10x15   ││ 10x15   ││ 10x15   │only │
 8      ││  in*2   ││  in*2   ││  in*2   ││  in*2   │     │
        ││   v     ││   v     ││   v     ││   v     │     │
12      │└─────────┘└─────────┘└─────────┘└─────────┘     │
        │─────── circuit-board collect belt h=14m ────────│
16      │ in copper-plate 27.5: BP7 right Wall Inlet      │
20      │ in plastic 55:        roof B4 smart-split lift  │
        │ out circuit-board 13.75: lift-out-top to roof   │
24      │ T7+ A5-A8 on 2F (12-20m), reserved              │
28      │                                                 │
32      │                                                 │
36      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- A1-A4：circuit-board assembler 10m W × 15m L × 8m H，4 台 row=0 一字排（4 × 10m = 40m 满）
- T6 仅 A1 (183.33%) 启用，其他 3 台物理建造 + Power Switch 关闭
- 单输入: in-0 铜板 27.5 (左 Wall Inlet) + in-1 塑料 55 (屋顶 B4 lift)
- 单输出: 电路板 13.75 → 屋顶 B4 merger

### 2F (12-20m): 4 assembler（T7+ 才启用）

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌─────────┐┌─────────┐┌─────────┐┌─────────┐     │
        ││   A5    ││   A6    ││   A7    ││   A8    │T7+  │
 4      ││ CB asm  ││ CB asm  ││ CB asm  ││ CB asm  │only │
        ││ 10x15   ││ 10x15   ││ 10x15   ││ 10x15   │     │
 8      ││  in*2   ││  in*2   ││  in*2   ││  in*2   │     │
        ││   v     ││   v     ││   v     ││   v     │     │
12      │└─────────┘└─────────┘└─────────┘└─────────┘     │
        │─────── 2F collect belt h=14m → lift-out-top ────│
16      │ idle in T6 (Power Switch off all 4)             │
20      │ 2F lift-bot from 1F: shared in feeds via lift   │
        │ merge with 1F output before roof B4 merger      │
24      │                                                 │
28      │                                                 │
32      │                                                 │
36      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- A5-A8：T6 全部 Power Switch off，2F 集装 + lift 共享 in-0/in-1 进料
- T7 时 4→4，T8 时启 6/8，T9 时 8/8 满载

### 屋顶 (35-40m): B4 上 smart-split + merger（先取后合）

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │ o B1 ───────────────────────────────────────── o│
        │                                                 │
 4      │ o B2 ───────────────────────────────────────── o│
        │                                                 │
 8      │ o B3 ───────────────────────────────────────── o│
        │                                                 │
12      │ o B4 ─[smart-split f=plastic 55]─[merger]───── o│
        │          │                          ↑           │
16      │       lift-bot                  lift-top        │
        │          ↓                          │           │
20      │       1F asm in-1               1F+2F out       │
        │                                                 │
24      │ o B5 ───────────────────────────────────────── o│
        │                                                 │
28      │ o B6 ───────────────────────────────────────── o│
32      │ split BEFORE merge: avoid taking new circuit-b  │
36      │ B7/B8 reserved (T7+)                            │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- B4 上**先 splitter 后 merger**：splitter 取塑料 55/min 下 lift 给 1F assembler in-1；merger 把 1F+2F 上来的电路板 13.75 注回 B4
- splitter 必须放在 merger 上游一侧，否则会把新生电路板当塑料一并取走
- 电路板**不是 mainNode**（无 B5 终端注入），全部作为 B4 流量供下游 BP14 电脑 + BP15 HSC 取用

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
