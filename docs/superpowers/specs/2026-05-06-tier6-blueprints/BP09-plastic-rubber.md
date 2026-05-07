# BP9 塑料 + 橡胶 + 石油焦 (C4)

## 概要

- **集群**: C4 油精炼（紧贴 BP8 之后）
- **规格**: Mk2 **5 实例物理建造**（BP9a/b/c/d/e，相同蓝图复制；T9 满载需扩到 **7 实例** BP9a-g，每实例 5 槽位刚好用满）
- **机器**: refinery（plastic / rubber / **petroleum-coke** 三种配方，全部按 Plan C 250% 超频）
- **激活时间线**（Plan C 250% 超频）：
  - T6: **BP9a 1 实例满载 5 台**（3 plas + 1 rub + 1 coke）
  - T7: 3 实例 15 台（11 plas + 1 rub + 3 coke，每实例 4 plas/rub + 1 coke）
  - T8: 5 实例 25 台（18 plas + 2 rub + 5 coke）
  - T9: **7 实例 32 台**（23 plas + 2 rub + 7 coke，需新建 BP9f + BP9g）
- **产能 T6**: 塑料 115/min · 橡胶 20/min · **石油焦 ~234/min**（残渣本地转化，BP9a 内部 sink）

## 机器超频清单（T6，BP9a 单实例满载）

| 配方 | 数量 | 超频 | 单台产能 (/min) | Power Shard/台 |
|---|---:|---:|---:|---:|
| plastic (refinery) | 3 | **191.67%** | 38.33 塑料 + 19.17 残渣 | 2 |
| rubber (refinery) | 1 | **100.0%** | 20 橡胶 + 20 残渣 | 0 |
| petroleum-coke (refinery) | 1 | **78.0%**（处理本实例 78 残渣 → 234 石油焦）| 234 石油焦 | 1 |
| **合计 (T6)** | 5 | — | — | 3×2 + 0 + 1 = **7** |

> 总产能验证: 3 × 38.33 = 115 塑料 ✓ | 1 × 20 = 20 橡胶 ✓ | 残渣 3×19.17 + 20 = 77.5 ≈ 78 ✓ | coke 78×3 = 234 石油焦 ✓
> sink 配 1 台 awesome-sink @ 250%（3 shard）吃 234 石油焦（240/min 容量，余 6/min）

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
- T9 时 5 实例共 25 槽位 < 32 台需求 → **T9 时新建 BP9f + BP9g 共 7 实例 = 35 槽位**（用 32 个，余 3 备用）

### Tier 7+ 激活时间线（所有 refinery 全部按 Plan C 250% 超频）

**关键约束**：残渣是流体，不能跨蓝图 pipe 汇流，所以**每个跑 plastic/rubber 的实例必须自带至少 1 台 coke refinery 处理本实例残渣**。

| Tier | plastic / rubber / coke | 总数 | 残渣量 | coke 容量 (@250%) | 实例分配 |
|---|---|---:|---:|---:|---|
| **T6** | 3 / 1 / 1 = **5** | 5 | 78/min | 100 (1×100) | **BP9a 满载（5 槽位刚好）**；BP9b-e Power Switch 全关 |
| T7 | 11 / 1 / 3 = **15** | 15 | ~291 | 300 (3×100) | BP9a-c 各 (4 plas/rub + 1 coke = 5)，BP9a 含 1 rubber |
| T8 | 18 / 2 / 5 = **25** | 25 | ~470 | 500 (5×100) | BP9a-e 各满 5 台 |
| T9 | 23 / 2 / 7 = **32** | 32 | ~567 | 700 (7×100) | 扩到 **7 实例 BP9a-g**：BP9a-f 各 (4 plas/rub + 1 coke)，BP9g (3 plas + 1 coke + 1 备用) |

> **T6 单实例搞定的核心机制**：
> - BP9a 1 台 coke refinery @ **78% 超频**（不需要 250%，本实例只产 78 残渣）→ 234 石油焦
> - BP9a 1 台 awesome-sink @ 250% 吃 234 石油焦
> - 全部物料/残渣/石油焦/sink 都在 BP9a 内部循环
> - BP9b-e 物理建造但激活 0 台，等 Tier 7+ 渐次开
>
> **T7+ 扩容原则**：每加 1 个实例，5 个槽位中 ≥1 个必须是 coke（处理本实例残渣）。单实例最多 4 台 plas/rub + 1 台 coke。
>
> **T9 时新建 BP9f + BP9g 两个实例**（BP9a-e 已建在 T6，T7-T8 启用，T9 时仍不够 5×4=20<25 plas/rub）。

> 单实例 1F 容量：4 台并排 (40m × 20m, row 0-2.5) + 第 5 台 row=2.5-4.5（错位）= 5 台 refinery。
> T6 阶段 BP9a 满载 5 台（3 plastic + 1 rubber + 1 coke），其余 BP9b-e 全 Power Switch 关。
> T9 满载需 32 台 (23 plas + 2 rub + 7 coke @ 250%) → 7 实例 BP9a-g（每实例 5 槽位刚好用满）。

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

## 集群内部连接 / 多实例侧墙

无 belt 跨蓝图（C4 仅 BP9 自己；每实例完全独立、油田直进、残渣本地处理）。

**蓝图侧墙集群内 mount（机器层）：无**。BP9 蓝图侧墙仅有：
- 屋顶 6 belt mount（B1-B6 续接相邻 BP9 实例）
- 左 Wall Pipeline Hole（h=4m，原油 pipe 进料）

> BP9a-e 之间机器层完全不互通——每实例独立的油田 pipe（或共享油田主 pipe + 各实例分支）。
> 详见设计文档 [§多实例集群侧墙 mount 对偶规则](../2026-05-06-tier6-blueprint-design.md#多实例集群侧墙-mount-对偶规则关键设计约定)。

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

| Tier | plastic/rubber/coke (Plan C 250%) | 实例数 |
|---|---|---:|
| T6 | 3 / 1 / 1 = 5 | **1（BP9a）** |
| T7 | 11 / 1 / 3 = 15 | 3（BP9a-c）|
| T8 | 18 / 2 / 5 = 25 | 5（BP9a-e，物理建造刚好用完）|
| T9 | 23 / 2 / 7 = 32 | **7（扩到 BP9a-g）** |

> ⚠ T9 时 5 实例 × 5 槽位 = 25 不足以放 32 台 → 必须新建 BP9f + BP9g（横向扩容，**蓝图本身不变，仅复制粘贴 2 份**）。
>
> **注意**：coke refinery 只能跟 plastic/rubber 同蓝图（残渣不跨蓝图），所以"coke 独立蓝图"方案不可行——coke 必须分散到每个跑 plas/rub 的实例内。

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
