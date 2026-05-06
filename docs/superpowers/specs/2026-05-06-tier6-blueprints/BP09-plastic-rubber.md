# BP9 塑料 + 橡胶 + 石油焦 (C4)

## 概要

- **集群**: C4 油精炼（紧贴 BP8 之后）
- **规格**: Mk2 **5 实例**（BP9a/b/c/d/e，相同蓝图复制；T9 满载 25 plastic/rubber + 13 coke = 38 refinery 总）
- **机器**: refinery（plastic / rubber / **petroleum-coke** 三种配方）
- **激活时间线**: T6 **BP9a 1 实例满载 5 台**（3+1+1）→ T7 3 实例 16 台 → T8 6 实例 27 台 → T9 **8 实例 38 台**
- **产能 T6**: 塑料 115/min · 橡胶 20/min · **石油焦 ~234/min**（残渣本地转化，BP9a 内部 sink）

> ⚠ **架构修正**：重油残渣是**流体**（refinery out-1 是 pipe），不能上 belt，AWESOME Sink 也不接受流体。
> **解决方案**：每个 BP9 实例内部加 1 台 coke refinery 跑 `petroleum-coke` 配方（40 残渣 → 120 石油焦），残渣**本地转固体石油焦** → **就地 sink**（每实例配 1 个 awesome-sink）。
> **为什么不上 B6**：石油焦 234/min 上 B6 会让 BP10→BP15 段达 462/min（96% Mk4），几乎溢出；就地 sink 让 B6 流量保持 306（64% Mk4）安全水平。

## 物料 I/O

| 方向 | 物料 | 流量 (T6) | 路径 |
|---|---|---|---|
| 输入 | 原油 | 172.5 | **油田管道** → 左 Wall 管道孔 (h=4m) |
| 输入 | 水 | refinery 内部循环 | — |
| 输出 | 塑料 → BP8 + BP14 | 95 | 屋顶 merger → B4 |
| 输出 | 塑料 → B5 终端 | 20 | 屋顶 merger → B5 |
| 输出 | 橡胶 → B5 终端 | 20 | 屋顶 merger → B5 |
| **内部** | 残渣 (fluid) → coke refinery | 78 | **本地 pipe**（不出蓝图）|
| **内部** | 石油焦 → 本地 awesome-sink | 234 | **本地 belt**（不上总线）|

**屋顶总线接入**: 注入 B4 (95)、B5 (40)（**B6 不再有石油焦/残渣**）

## ⚠ 关键约束：refinery 31m 高

- refinery 净高 31m，机器层顶 31m
- 离屋顶总线 (35m) 只有 **4m** 余量
- lift（产物上行/原油下行）必须挤在这 4m 内
- **不能用多层堆叠**——单实例只 1F

## 楼层占用（单实例）

| 层 | 高度 | 内容 | 数量 (T6/T9) |
|---|---|---|---:|
| 1F | 0-31m | refinery（**10m × 20m × 31m**）+ 1 本地 awesome-sink | 5 refinery + 1 sink / **物理上限**：单实例 5 槽位 |
| 31-35m | 输出 lift + 进料 lift + 残渣 pipe（1F 内部） | — | — |
| 屋顶 | 35-40m | B1-B6 + 2 merger（B4/B5）+ 2 lift（塑料/橡胶）| — | — |

### 单实例物理槽位 = 5 refinery（精确计算）

- refinery 10m W × 20m L → 单 Mk2 (40×40m) 1F 平面：
  - 4 台一字排 row=0-2.5 (= 0-20m) → 占 40m W × 20m L 满（4 × 10m = 40m wide ✓）
  - 第 5 台 row=2.5-5 (= 20-40m) → 占 10m × 20m，col 任意
- 共 5 槽位，**第 6 台在 1F 平面上塞不下**（地基外或屋顶层会撞到 35m 总线）
- T9 时 5 实例共 25 槽位 < 38 台需求 → **T7+ 时增加实例（BP9a-h 8 实例 = 40 槽位）**

### Tier 7+ 激活时间线（所有 refinery 类型合计）

**关键约束**：残渣是流体，不能跨蓝图 pipe 汇流，所以**每个跑 plastic/rubber 的实例必须自带 coke refinery 处理本实例残渣**。

| Tier | plastic / rubber / coke | 总数 | 实例分配 |
|---|---|---:|---|
| **T6** | 3 / 1 / 1 = **5** | 5 | **BP9a 满载（5 槽位刚好用完）；BP9b-e 全 Power Switch 关闭** |
| T7 | 11 / 1 / 4 = 16 | 16 | BP9a (3+1+1) + BP9b (4+0+1) + BP9c (4+0+1) + BP9d (0+0+1, 仅 coke @100% 处理 BP9a 溢出?) — **不可行**（coke 不跨蓝图）<br/>**改为**: BP9a (3+1+1) + BP9b (4+0+1) + BP9c (4+0+2) = 16，**每实例自包含** |
| T8 | 18 / 2 / 7 = 27 | 27 | BP9a-e 各 5 台（5 实例×5 = 25），加 BP9f (2+0+0) = 27 → 但 BP9f 无 coke 处理自己 0 残渣 ✓ |
| T9 | 23 / 2 / 13 ≈ 38 | 38 | 需扩到 **8 实例**（BP9a-h），每实例 5 台满载（plas/rub + coke 自包含）|

> **T6 单实例搞定的核心机制**：
> - BP9a 1 台 coke refinery @ **250% 超频** 处理本实例 78 残渣（产 234 石油焦）
> - BP9a 1 台 awesome-sink @ 250% 吃 234 石油焦
> - 全部物料/残渣/石油焦/sink 都在 BP9a 内部循环
> - BP9b-e 物理建造但激活 0 台，等 Tier 7+ 渐次开
>
> **T7+ 扩容原则**：每加 1 个实例，5 个槽位中 1 个必须是 coke（处理本实例残渣）。所以单实例最多 4 台 plas/rub + 1 台 coke。

> 单实例 1F 容量：4 台并排 (40m × 20m, row 0-2.5) + 第 5 台 row=2.5-4.5（错位）= 5 台 refinery。
> T6 单实例: 1 plastic + 0 rubber + 1 coke = 2 台运行 (其余 power switch 关)
> T9 满载: 单实例需 ~5 plastic + 0.4 rubber + 2.6 coke = 8 台 → **超 1F 容量** → T9 时拆为 8 实例（BP9a-h）或单实例多层堆叠，用户实施时再决定。**T6 阶段 5 实例 5 台/实例足够**。

## 俯视图（1F BP9a, 0-31m，按精确尺寸绘制）

每字符 = 2m（每 cell 8m = 4 字符宽 × 4 字符高）。**refinery 10m W × 20m L = 5 字符 × 10 字符**（跨 1.25 cell × 2.5 cell）。

```
        col=0       col=1       col=2       col=3       col=4    col=5
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐    │ row=0
        ││  R1    │ │  R2    │ │  R3    │ │  R4    │    │
 4      ││Plastic │ │Plastic │ │Plastic │ │Rubber  │    │ row=0.5
        ││ 10m W  │ │        │ │        │ │        │    │
 8      ││ × 20m L│ │        │ │        │ │        │    │ row=1
        ││        │ │        │ │        │ │        │    │
12      ││  out-0 │ │  out-0 │ │  out-0 │ │  out-0 │    │ row=1.5
        ││   ↓    │ │   ↓    │ │   ↓    │ │   ↓    │    │  (产物 belt)
16      ││ out-1→ │ │ out-1→ │ │ out-1→ │ │ out-1→ │    │ row=2
        │└────────┘ └────────┘ └────────┘ └────────┘    │  (残渣 pipe)
20      ├─── 残渣 pipe 汇流 (junction)──────────────────┤ row=2.5
        │                                               │
24      │      ┌────────┐                               │ row=3
        │      │  R5    │                               │
28      │      │  Coke  │      [本地 sink]              │ row=3.5
        │      │ 10m W  │      ┌──────┐                 │
32      │      │ × 20m L│      │AwSink│ 4×6m            │ row=4
        │      │        │      │ ←──── R5 out-0 (固体)  │
36      │      │  out-0→│      └──────┘                 │ row=4.5
        │      └────────┘                               │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴┘
```

**关键尺寸**：
- R1-R4: 各 10m W × 20m L，row=0-2.5（即 0-20m），col 起点 0/10/20/30m → cell col=0/1.25/2.5/3.75
- R5 (coke): 10m W × 20m L，col=10-20m（cell 1.25-2.5），row=22-42m → 截到 row=2.75-5（22-40m）
- 本地 sink: 4m W × 6m L（很小），col=22-26m，row=3.5-4.25
- 4 台 R1-R4 的残渣 pipe 在 row=2.5（20m）处用 junction 汇流到 R5 in-0
- R5 输出固体石油焦 → 短 belt 直连本地 sink

> **注意**：R5 长度 20m 实际超出 row=4.5（36m）一点；实际需要 R5 起点 row=2.75（22m）→ 终点 row=5.25（42m），稍超 1F 上限 40m。**解决**：把 R5 旋转 90°（10m 长 × 20m 宽，朝向 east），改为 col=10-30m × row=27-37m，刚好落在 1F 内。
>
> 旋转后版本：
> ```
> 22m ┌──────────────┐
> 27m │ R5 横放      │  20m W × 10m L (facing=east)
> 37m │ in-0← out-0→ │
>     └──────────────┘
> ```
> col=22-32m row=3.4-4.6（10m 长）。具体定位看玩家偏好。

## 屋顶总线层（35-40m）

```
B1 ═════════════════════════════════════════> B1
B2 ═════════════════════════════════════════> B2
B3 ═════════════════════════════════════════> B3
B4 ═══[merger ←──塑料 95 lift-top]══════════> B4 (+95)
B5 ═══[merger ←──塑料 20 + 橡胶 20]═════════> B5 (+40)
B6 ═════════════════════════════════════════> B6 直通（**石油焦不上 B6**）
```

- 2 个 merger（B4 塑料 95 + B5 塑料 20 / 橡胶 20）
- 2 条 lift-top（塑料 → B4 + B5、橡胶 → B5）
- **残渣不上屋顶**（流体在 1F 内部 pipe 直连 R5 coke refinery）
- **石油焦不上屋顶**（1F R5 输出 → 本地 awesome-sink，1F 内部消化）

## 建造步骤（BP9a，BP9b/c/d/e 完全复制）

1. **1F (0-31m)**:
   - row=0 4 台 refinery 一字排（R1-R3 plastic + R4 rubber）
   - row=4 第 5 台 refinery (R5) 跑 `petroleum-coke` 配方（错位放置避免 pipe 跨越其他机器）
2. **原油进料**: 左 Wall 管道孔 (h=4m, row=0) → 1F 中央油管 manifold → R1-R4 in-0 (back, fluid)
   > refinery 流体输入是 fluid pipe，需要 Pipeline Wall Hole（不是 Conveyor Wall Inlet）
3. **水循环**: refinery byproduct 水（如 rubber out-1 是水）→ 内部短管循环回 in-1
4. **残渣 pipe 汇流**: R1-R4 out-1（残渣 fluid）→ pipe junction（4 输入 → 1 输出）→ R5 in-0
   > pipe junction 用 Pipeline Junction Cross 或 Industrial Pipeline Support，4 台合 1 路
   > 注意 pipe 容量：Mk1 pipe 300/min，78 残渣远低于上限 ✓
5. **R5 石油焦输出**: R5 out-0（固体 belt）→ 短 belt 直连本地 1 台 awesome-sink（在 1F 角落 col=4 row=4 处放置，4m × 6m × 4m）
   > 1 台 sink 上限 60/min；47/实例 < 60，单 sink 即可（保险起见装 power shard 提速到 250%）
6. **1F belt 收集**:
   - row=2 plastic 主 belt（R1-R3 out-0 合流）
   - row=2 rubber 主 belt（R4 out-0）
   - **石油焦不收集主 belt**（R5 短 belt 直连本地 sink）
7. **垂直汇总（31m → 屋顶 35m）**: 4m 内放 2 条 lift-out-top
   - 塑料 lift × 1（屋顶再 1→2 split）
   - 橡胶 lift × 1
   - 共 2 lift（4m 内塞 2 条 lift 比塞 4 条更轻松）
8. **屋顶 (35m)**:
   - 塑料 lift-top → 1→2 splitter (95:20) → 一支 merger 注 B4，一支 merger 注 B5
   - 橡胶 lift-top → 直接 merger 注 B5
   - 共 2 个 merger（B4、B5 各 1）
9. **本地 sink**: 1F col=4 row=4 处放 1 个 awesome-sink，R5 石油焦 belt 直连
10. **Power Switch**: T6 阶段**BP9a 5 台全开**（3 plastic @191.67% + 1 rubber @100% + 1 coke @250%）；BP9b-e 5 实例**全部 Power Switch 关闭**（物理建造 25 台 refinery + 5 sink，仅 BP9a 5 台运行）

## 集群内部连接

无 belt 跨蓝图（C4 仅 BP9 自己）。原油从外部油田 pipe 接入。

## 残渣 → 石油焦 → 本地 sink（默认）

每个 BP9 实例：
- 78/5 ≈ 16/min 残渣（pipe）→ 1 台 coke refinery @ 40% → 47/min 石油焦（固体）
- 47 石油焦 → 1 台本地 awesome-sink（@250% 提速到 60/min，留 13/min 余量）
- 5 实例独立 sink，**不上 B6 总线**
- BP-TERM-B 不再有"石油焦/残渣 sink"

**为什么就地 sink 而不是上 B6**：
- 234 石油焦/min 上 B6 会让 BP10→BP15 段流量从 306 → 540（112% Mk4，溢出）
- 即使升 Mk5（780/min）也只 ~70%，但 Mk5 在 Tier 6 不可用
- 就地 sink 让 BP9 完全自包含，不影响其他蓝图

> **可选升级路径**：把第 5 台 coke refinery 改为 `residual-fuel` 配方（60 残渣 → 40 燃料 = 流体），燃料管道接到旁挂的燃料发电机（每台 250 MW）→ 自给 ~1300 MW（约整厂 70% 电力）。
> 此升级**不需要改 BP9 主蓝图**，仅切换配方 + 加燃料发电机即可；本地 sink 撤掉换为燃料 pipe。

## Tier 7+ 扩容点

| Tier | plastic/rubber/coke | 单实例平均 |
|---|---|---|
| T6 | 3 / 1 / 2 = 6 | 0.6 / 0.2 / 0.4 → 单实例 1+0+1=2 台运行 |
| T7 | 11 / 1 / 5 = 17 | 单实例 2+0+1=3 台运行 |
| T8 | 18 / 2 / 8 = 28 | 单实例 4+0+2=6 台运行（已超 1F 5 台容量）|
| T9 | 23 / 2 / 13 = 38 | 单实例 5+0+3=8 台 → 需扩到 8 实例或单实例多层堆叠 |

> ⚠ T8/T9 时 5 实例 × 5 槽位 = 25 不足，需要扩容方案（待 T8 解锁时再决定）：
> 1) **垂直堆叠**：1F refinery + 4m 地基 + 2F refinery（refinery 31m + 4 + 31 = 66m **超 40m 不可行**）
> 2) **横向扩容**：拆为 8 实例（BP9a-h），每实例仍 5 refinery 满载（推荐）
> 3) **coke 独立蓝图**：只在 BP9 内保留 plastic/rubber，coke refinery 集中到 BP9-coke 旁挂蓝图

## 验证

- [ ] refinery 原油输入用 Pipeline Wall Hole（左 Wall）
- [ ] R1-R4 残渣 out-1 用 pipe junction 合流到 R5 in-0（4 进 1 出）
- [ ] R5 跑 `petroleum-coke` 配方（不是 plastic/rubber）
- [ ] R5 输出是石油焦（固体，belt 可输送）
- [ ] **每实例 1 台本地 awesome-sink** 接 R5 输出（@250% 处理 47/min）
- [ ] **B6 不携带石油焦/残渣**（屋顶 B6 直通无 merger）
- [ ] 原油矿场 belt/pipe 容量按 T9 1700/min 预留
- [ ] 5 实例物理紧贴
- [ ] BP-TERM-B 不再有残渣/石油焦 sink
