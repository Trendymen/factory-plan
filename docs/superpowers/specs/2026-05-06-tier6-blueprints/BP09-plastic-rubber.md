# BP9 塑料 + 橡胶 (C4)

## 概要

- **集群**: C4 油精炼（紧贴 BP8 之后）
- **规格**: Mk2 **5 实例**（BP9a/b/c/d/e，相同蓝图复制；T9 满载 25 refinery，单实例 5 台）
- **机器**: refinery（plastic / rubber 两种配方）
- **激活时间线**: T6 3+1=4 → T7 11+1=12 → T8 18+2=20 → T9 **23+2=25**
- **产能 T6**: 塑料 115/min · 橡胶 20/min · 重油残渣 ~78/min（副产）

## 物料 I/O

| 方向 | 物料 | 流量 (T6) | 路径 |
|---|---|---|---|
| 输入 | 原油 | 172.5 | **油田管道** → 左 Wall 管道孔 (h=4m) |
| 输入 | 水 | refinery 内部循环 | — |
| 输出 | 塑料 → BP8 + BP14 | 95 | 屋顶 merger → B4 |
| 输出 | 塑料 → B5 终端 | 20 | 屋顶 merger → B5 |
| 输出 | 橡胶 → B5 终端 | 20 | 屋顶 merger → B5 |
| 输出 | 重油残渣 → BP-TERM-B sink | 78 | 屋顶 merger → B6 |

**屋顶总线接入**: 注入 B4 (95)、B5 (40)、B6 (78)

## ⚠ 关键约束：refinery 31m 高

- refinery 净高 31m，机器层顶 31m
- 离屋顶总线 (35m) 只有 **4m** 余量
- lift（产物上行/原油下行）必须挤在这 4m 内
- **不能用多层堆叠**——单实例只 1F

## 楼层占用（单实例）

| 层 | 高度 | 内容 | 数量 |
|---|---|---|---:|
| 1F | 0-31m | refinery（10m × 20m × 31m）| 4-5 |
| 31-35m | 输出 lift + 进料 lift | — | — |
| 屋顶 | 35-40m | B1-B6 + 3 merger + 多 lift | — |

> refinery 4 台并排：4 × 10m = 40m 宽 × 20m 长（半层）；row=0-2 范围。
> 单实例 5 台需 row=2-4 加 1 台（错位摆放）。

## 俯视图（1F BP9a, 0-31m）

```
       col=0    col=1    col=2    col=3    col=4    col=5
      ┌──────┬──────┬──────┬──────┬──────┐
r=0   │┌────┐│┌────┐│┌────┐│┌────┐│      │  4 refinery 一字排
      ││R1  │││R2  │││R3  │││R4  ││      │  10m × 20m × 31m
r=1   ││Plas│││Plas│││Plas│││Rubr││      │  R1-3 = plastic, R4 = rubber
      ││tic │││tic │││tic │││er  ││      │
r=2   ││ ↓  │││ ↓  │││ ↓  │││ ↓  ││      │
      │└────┘│└────┘│└────┘│└────┘│      │
      ├──────┼──────┼──────┼──────┼──────┤
r=3   │ ===collect 塑料/橡胶/残渣 row ====│  3 条独立 belt
      ├──────┼──────┼──────┼──────┼──────┤
r=4   │      │      │ ┌──┐ │      │      │  T7+ 第 5 台 row=4 错位
      │      │      │ │R5│ │      │      │
      └──────┴──────┴──────┴──────┴──────┘
```

> refinery 双输入 (in-0=原油, in-1=水) + 双输出 (out-0=产物, out-1=副产)。
> in/out 端口都在 back/front (row=0/row=2)。

## 屋顶总线层（35-40m）

```
B1 ═════════════════════════════════════════> B1
B2 ═════════════════════════════════════════> B2
B3 ═════════════════════════════════════════> B3
B4 ═══[merger ←──塑料 95 lift-top]══════════> B4 (+95)
B5 ═══[merger ←──塑料 20 + 橡胶 20]═════════> B5 (+40)
B6 ═══[merger ←──重油残渣 78 lift-top]═════> B6 (+78)
```

- 3 个 merger（B4 塑料 95 + B5 塑料 20 / 橡胶 20 + B6 残渣 78）
- 4 条 lift-top（塑料 → B4、塑料 → B5、橡胶 → B5、残渣 → B6）

## 建造步骤（BP9a，BP9b/c/d/e 完全复制）

1. **1F (0-31m)**: 4 台 refinery 一字排 row=0（前 3 台 plastic + 第 4 台 rubber）
2. **原油进料**: 左 Wall 管道孔 (h=4m, row=0) → 1F 中央油管 manifold → 4 台 in-0 (back, fluid)
   > refinery 流体输入是 fluid pipe（不是 belt），需要 Pipeline Wall Hole 而非 Conveyor Wall Inlet
3. **水循环**: refinery byproduct 水 → 内部短管循环回另一端 in-1（如 plastic 不需水，rubber 需要）
4. **1F belt 收集**:
   - row=2-3 行 plastic 主 belt（前 3 台 out-0）
   - row=2-3 行 rubber 主 belt（第 4 台 out-0）
   - row=2-3 行 残渣 主 belt（4 台 out-1 副产合流）
5. **垂直汇总（31m → 屋顶 35m）**: 4m 内放 4 条 lift-out-top（每条物料 1 个）
6. **屋顶 (35m)**:
   - 塑料 lift-top → 1→2 splitter (95:20) → 一支 merger 注 B4，一支 merger 注 B5
   - 橡胶 lift-top → 直接 merger 注 B5
   - 残渣 lift-top → merger 注 B6
   - 共 3 个 merger（B4、B5、B6 各 1）
7. **Power Switch**: T6 单实例只开 1 台 plastic + 0 台 rubber（rubber 全靠 BP9b 等开 1 台即可）

## 集群内部连接

无 belt 跨蓝图（C4 仅 BP9 自己）。原油从外部油田 pipe 接入。

## 残渣处理（默认）

每个 BP9 实例 78/min ÷ 5 ≈ 16/min 残渣注 B6 → BP-TERM-B sink。
> **升级路径**：可选 BP9 旁挂 1 个 **BP9b residual-fuel** 蓝图（2 台 refinery，吃 78/min 残渣 → 燃料 52/min → 1300 MW 发电）。

## Tier 7+ 扩容点

| Tier | 塑料/橡胶 | 实例数 |
|---|---|---:|
| T6 | 3/1 | 5 实例（每实例 0.6/0.2 平均，实际 BP9a/b/c 跑 plastic，BP9d 1 台 rubber，BP9e 闲置）|
| T7 | 11/1 | 5 |
| T8 | 18/2 | 5 |
| T9 | 23/2 | 5（满载，单实例 4-5 台）|

> 5 实例 ≈ 5 × 5 = 25 物理槽位，T9 用满。

## 验证

- [ ] refinery 流体输入用 pipe wall hole，不是 belt wall inlet
- [ ] 屋顶 31-35m 4m 内能塞下 4 条 lift（每条占 2×2m，4 条占 ~16m²，足够）
- [ ] 残渣 78 注 B6（默认方案，不就地 sink）
- [ ] 原油矿场 belt/pipe 容量按 T9 1700/min 预留
- [ ] 5 实例物理紧贴
