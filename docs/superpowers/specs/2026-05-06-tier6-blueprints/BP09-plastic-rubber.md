# BP9 塑料 + 橡胶 + 石油焦 (C4)

## 概要

- **集群**: C4 油精炼（紧贴 BP8 之后）
- **规格**: Mk2 **7 实例物理建造**（BP9a/b/c/d/e/f/g，相同蓝图复制）
- **机器**: **35 refinery 一次物理建造到位**（plastic / rubber / **petroleum-coke** 三种配方，全部按 Plan C 250% 超频）+ **7 awesome-sink 一次物理建造到位**（每实例 1 个，处理本实例石油焦）
- **激活时间线**（仅翻 Power Switch + 插 Power Shard，不动结构）:
  - T6 → **5 台通电**（BP9a 满载 3 plas + 1 rub + 1 coke；BP9b-g Power Switch 全关）
  - T7 → 15 台通电（BP9a-c 各 4 plas/rub + 1 coke）
  - T8 → 25 台通电（BP9a-e 各满 5 台）
  - T9 → **32 台通电**（BP9a-f 各 4 plas/rub + 1 coke，BP9g 3 plas + 1 coke + 1 备用）
- **产能 T6**: 塑料 115/min · 橡胶 20/min · **石油焦 234/min**（残渣本地转化，BP9a 内部 sink）

> **核心设计原则**：**7 实例 BP9a-g 在 T6 阶段就全部摆好 + belt/pipe/manifold/电网/Power Switch 全部接好**（共 35 refinery + 7 sink）。后续升 Tier 时**不重新放机器、不重新拉 belt/pipe**——只需 (1) 翻对应 Power Switch (2) 插 Power Shard (3) 调超频百分比。

## 机器超频清单（T6，BP9a 单实例满载）

| 配方 | 物理 | T6 通电 | 超频 | 单台产能 (/min) | Power Shard/通电台 |
|---|---:|---:|---:|---:|---:|
| plastic (refinery) | **21** | **3** | 191.67% | 38.33 塑料 + 19.17 残渣 | 2 |
| rubber (refinery) | **7** | **1** | 100.0% | 20 橡胶 + 20 残渣 | 0 |
| petroleum-coke (refinery) | **7** | **1** | 78.0%（处理本实例 78 残渣 → 234 石油焦）| 234 石油焦 | 1 |
| **合计 (T6)** | **35** | **5** | — | — | 3×2 + 0 + 1 = **7** |

> 物理建造数 21 + 7 + 7 = 35 refinery（7 实例 × 5 槽位），另加 7 台 awesome-sink。
> T6 仅 BP9a 5 台通电；BP9b-g 共 30 refinery + 6 sink 物理就位但 Power Switch **全关**、shard 槽**空着**。
> T6 总产能验证: 3 × 38.33 = 115 塑料 ✓ | 1 × 20 = 20 橡胶 ✓ | 残渣 3×19.17 + 20 = 77.5 ≈ 78 ✓ | coke 78×3 = 234 石油焦 ✓
> T9 满载 32 台 @ 250% = 690 塑料 + 40 橡胶 + 各实例残渣本地处理。

> ⚠ **架构修正**：重油残渣是**流体**（refinery out-1 是 pipe），不能上 belt，AWESOME Sink 也不接受流体。
> **解决方案**：每个 BP9 实例内部固定配 1 台 coke refinery 跑 `petroleum-coke` 配方（残渣**本地转固体石油焦**）→ **本地 sink**（每实例配 1 个 awesome-sink）。
> **为什么不上 B6**：石油焦上 B6 会让 BP10→BP15 段达 462/min（96% Mk4），几乎溢出；就地 sink 让 B6 流量保持 306（64% Mk4）安全水平。

## 物料 I/O

| 方向 | 物料 | 流量 (T6/T9) | 路径 |
|---|---|---|---|
| 输入 | 原油 | 172.5 / ~1100（每实例独立 pipe） | **油田管道** → 左 Wall 管道孔 (h=4m) |
| 输入 | 水 | refinery 内部循环 | — |
| 输出 | 塑料 → BP8 + BP14 | 95 / 跨实例累加 | 屋顶 merger → B4 |
| 输出 | 塑料 → B5 终端 | 20 / 跨实例累加 | 屋顶 merger → B5 |
| 输出 | 橡胶 → B5 终端 | 20 / 跨实例累加 | 屋顶 merger → B5 |
| **内部** | 残渣 (fluid) → coke refinery | 78（每实例独立） | **本地 pipe**（不出蓝图）|
| **内部** | 石油焦 → 本地 awesome-sink | 234（每实例独立） | **本地 belt**（不上总线）|

**屋顶总线接入**: 注入 B4 (95)、B5 (40)（**B6 不再有石油焦/残渣**）

## ⚠ 关键约束：refinery 31m 高

- refinery 净高 31m，机器层顶 31m
- 离屋顶总线 (35m) 只有 **4m** 余量
- lift（产物上行/原油下行）必须挤在这 4m 内
- **不能用多层堆叠**——单实例只 1F

## 楼层占用（单实例）

| 层 | 高度 | 内容 | 物理 (单实例) | T6 通电 (BP9a) | T6 通电 (BP9b-g) |
|---|---|---|---:|---:|---:|
| 1F | 0-31m | refinery 5 台 + 本地 awesome-sink 1 个 | 5 + 1 | **5 + 1** | **0 + 0** |
| 31-35m | 输出 lift + 进料 lift + 残渣 pipe（1F 内部） | — | — | — | — |
| 屋顶 | 35-40m | B1-B6 + 2 merger（B4/B5）+ 2 lift（塑料/橡胶）| — | — | — |

### 单实例物理槽位 = 5 refinery（精确计算）

- refinery 10m W × 20m L → 单 Mk2 (40×40m) 1F 平面：
  - 4 台一字排 row=0-2.5 (= 0-20m) → 占 40m W × 20m L 满（4 × 10m = 40m wide ✓）
  - 第 5 台 row=2.5-5 (= 20-40m) → 占 10m × 20m，col 任意
- 共 5 槽位，**第 6 台在 1F 平面上塞不下**
- **7 实例 × 5 槽位 = 35 槽位** > T9 32 台需求（余 3 备用，全部 T6 一次建好）

### 通电时间线（仅翻 Switch + 插 shard，不动结构）

**关键约束**：残渣是流体，不能跨蓝图 pipe 汇流，所以**每个跑 plastic/rubber 的实例必须自带至少 1 台 coke refinery 处理本实例残渣**。

| Tier | plastic / rubber / coke | 通电总数 | 残渣量 | 实例分配（通电状态） |
|---|---|---:|---:|---|
| **T6** | 3 / 1 / 1 = **5** | 5 | 78/min | **BP9a 5 台全开**；BP9b-g 全关 |
| T7 | 11 / 1 / 3 = **15** | 15 | ~291 | BP9a-c 各 5 台开（4 plas/rub + 1 coke）；BP9d-g 全关 |
| T8 | 18 / 2 / 5 = **25** | 25 | ~470 | BP9a-e 各 5 台开；BP9f/g 全关 |
| T9 | 23 / 2 / 7 = **32** | 32 | ~567 | BP9a-f 各 5 台开；BP9g 4 台开（3 plas + 1 coke + 1 备用 Switch 关） |

> **T6 单实例搞定的核心机制**：
> - BP9a 1 台 coke refinery @ 78% 超频（本实例只产 78 残渣）→ 234 石油焦
> - BP9a 1 台 awesome-sink @ 250% 吃 234 石油焦
> - 全部物料/残渣/石油焦/sink 都在 BP9a 内部循环
> - BP9b-g 6 实例物理建造完整（30 refinery + 6 sink）但 Power Switch **全关**、shard 槽**空着**

## 俯视图（按实际比例，每层独立 — 视觉正方形）

**比例约定**（同 BP02）：1 字符 = 1m 横向；1 行 = 2m 纵向；蓝图 40×40m = 40 字符 × 20 行。

**图例**：
- `*` 后缀 = T6 通电；无 `*` = T7+ Power Switch 关（物理已建，不耗电不产出）
- `v` = front (south) 输出

### 1F (0-31m): 4 refinery + 1 coke refinery + 1 AWESOME Sink — BP9a 视图（T6 全部通电）

refinery 31m 高占满 1F 整层，sink 24m 高（0-24m）。1F 内部水平不重叠。

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌─────────┐┌─────────┐┌─────────┐┌─────────┐      │
        ││   R1*   ││   R2*   ││   R3*   ││   R4*   │      │
 4      ││Plastic  ││Plastic  ││Plastic  ││Rubber   │      │
        ││ 10x20   ││ 10x20   ││ 10x20   ││ 10x20   │      │
 8      ││ ×31 H   ││ ×31 H   ││ ×31 H   ││ ×31 H   │      │
        ││         ││         ││         ││         │      │
12      ││ out-0 v ││ out-0 v ││ out-0 v ││ out-0 v │      │
        ││ out-1>> ││ out-1>> ││ out-1>> ││ out-1>> │      │
16      │└─────────┘└─────────┘└─────────┘└─────────┘      │
20      ├── residue pipe junction (row=2.5) >> R5 in-0 ────│
        │┌─────────┐                                       │
24      ││   R5*   │  ┌────────────────┐                   │
        ││  Coke   │  │ AWESOME Sink*  │                   │
28      ││ 10x20   │  │   16W x 13L    │                   │
        ││ ×31 H   │  │   × 24m H      │                   │
32      ││in-0<<   │  │  in-0 (back)   │                   │
        ││residue  │  │   << R5 belt   │                   │
36      ││out-0>>  │  │ (sink coke)    │                   │
        │└─────────┘  └────────────────┘                   │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- BP9a：R1-R5 五台 refinery + AWESOME Sink **全部 T6 通电**（带 `*`）
- R1-R3：plastic refinery，R4：rubber refinery，各 10m W × 20m L × 31m H，row=0-2 (0-16m)
- R5：coke refinery（残渣 → 石油焦），col=0-1.25 row=2.75-4.5 (0-10m × 22-36m)
- AWESOME Sink：16m W × 13m L × 24m H，col=1.5-3.5 row=3-4.6
- 4 台 R1-R4 的残渣 pipe 在 row=2.5 汇流到 R5 in-0；R5 输出石油焦短 belt 直连 Sink
- 占地核算：4×R1-4 (200m²×4=800) + R5 (200m²) + Sink (208m²) = 1208m² < 1600m² 1F 容量 ✓

### 1F (0-31m): BP9b-g 视图（T6 Power Switch 全关，belt/pipe/manifold 已接好）

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌─────────┐┌─────────┐┌─────────┐┌─────────┐      │
        ││   R1    ││   R2    ││   R3    ││   R4    │      │
 4      ││Plastic  ││Plastic  ││Plastic  ││Rubber   │      │
        ││ 10x20   ││ 10x20   ││ 10x20   ││ 10x20   │      │
 8      ││ ×31 H   ││ ×31 H   ││ ×31 H   ││ ×31 H   │      │
        ││ OFF     ││ OFF     ││ OFF     ││ OFF     │      │
12      ││ out-0 v ││ out-0 v ││ out-0 v ││ out-0 v │      │
        ││ out-1>> ││ out-1>> ││ out-1>> ││ out-1>> │      │
16      │└─────────┘└─────────┘└─────────┘└─────────┘      │
20      ├── residue pipe junction (row=2.5) >> R5 in-0 ────│
        │┌─────────┐                                       │
24      ││   R5    │  ┌────────────────┐                   │
        ││  Coke   │  │  AWESOME Sink  │                   │
28      ││ 10x20   │  │   16W x 13L    │                   │
        ││ ×31 H   │  │   × 24m H      │                   │
32      ││ OFF     │  │  in-0 (back)   │                   │
        ││residue  │  │   << R5 belt   │                   │
36      ││         │  │ (Switch OFF)   │                   │
        │└─────────┘  └────────────────┘                   │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- BP9b-g 6 实例：5 refinery + 1 sink **物理建造完整**，T6 阶段 Power Switch **全关**
- Belt / pipe / pipe junction / 本地 sink belt 一次性接到所有 R1-R5
- 通电节奏：T7 开 BP9b/c（共 15）；T8 开 BP9d/e（共 25）；T9 开 BP9f/g（满 32）

### 屋顶 (35-40m): B4 + B5 mergers

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │ o B1 ────────────────────────────────────── o   │
 4      │ o B2 ────────────────────────────────────── o   │
 8      │ o B3 ────────────────────────────────────── o   │
12      │ o B4 ───[merger << plastic 95 lift-top]──── o   │
16      │ o B5 ───[merger << plastic 20 + rubber 20]─ o   │
20      │ o B6 ────────────────────────────────────── o   │
24      │                                                 │
28      │ B4 inject 95/min plastic (to BP8 + BP14)        │
        │ B5 inject 40/min mainNode (plastic 20 + rub 20) │
32      │ B6 NO injection (coke locally sinked)           │
36      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- 2 个 merger（B4 塑料 95 + B5 塑料 20 / 橡胶 20）
- 2 条 lift-top（塑料 → B4 + B5、橡胶 → B5）
- **残渣不上屋顶**（流体在 1F 内部 pipe 直连 R5 coke refinery）
- **石油焦不上屋顶**（1F R5 输出 → 本地 awesome-sink，1F 内部消化）

## Power Switch 分网

把 35 台 refinery 拆 7 个独立 Power Network（每实例 1 个），由 7 个 Power Switch 控制。**7 个 Switch 全部 T6 一次安装好**，只是 T6 阶段只合 Network A。

| 网 | 范围 | 数量 | T6 状态 | 升级触发 |
|---|---|---:|---|---|
| Network A | BP9a 全部 (R1-R5 + sink) | 5 + 1 sink | **ON** | — |
| Network B | BP9b 全部 | 5 + 1 sink | OFF | T7 翻 ON |
| Network C | BP9c 全部 | 5 + 1 sink | OFF | T7 翻 ON |
| Network D | BP9d 全部 | 5 + 1 sink | OFF | T8 翻 ON |
| Network E | BP9e 全部 | 5 + 1 sink | OFF | T8 翻 ON |
| Network F | BP9f 全部 | 5 + 1 sink | OFF | T9 翻 ON |
| Network G | BP9g 全部 (1 台备用 Switch 单独关) | 4 + 1 sink | OFF | T9 翻 ON（保留 1 台备用 Switch 关） |

> Power Switch 物理位置建议放每实例 1F col=4.5 角落（manifold 区），方便玩家在场内一眼区分。
> BP9g 内部多 1 个子 Switch 控制第 5 台 refinery（T9 满载 32 台不需要它）。

## 建造步骤（每实例一次建好，BP9a-g 物理完全相同）

1. **框架**：每实例 5×5 cell × 5 cell 高（40×40×40m）；总 7 个并排实例
2. **1F (0-31m)**:
   - row=0 4 台 refinery 一字排（R1-R3 plastic + R4 rubber）
   - row=4 第 5 台 refinery (R5) 跑 `petroleum-coke` 配方（错位放置避免 pipe 跨越其他机器）
3. **原油进料**: 左 Wall 管道孔 (h=4m, row=0) → 1F 中央油管 manifold → R1-R4 in-0 (back, fluid)
   > refinery 流体输入是 fluid pipe，需要 Pipeline Wall Hole（不是 Conveyor Wall Inlet）
4. **水循环**: refinery byproduct 水（如 rubber out-1 是水）→ 内部短管循环回 in-1
5. **残渣 pipe 汇流**: R1-R4 out-1（残渣 fluid）→ pipe junction（4 输入 → 1 输出）→ R5 in-0
   > pipe junction 用 Pipeline Junction Cross 或 Industrial Pipeline Support，4 台合 1 路
   > 注意 pipe 容量：Mk1 pipe 300/min，78 残渣远低于上限 ✓
6. **R5 石油焦输出**: R5 out-0（固体 belt）→ 短 belt（~2m）直连本地 1 台 **AWESOME Sink (16m × 13m × 24m高)**（位于 col=1.5-3.5 row=3-4.625）
   > 1 台 sink @ 100% = 60/min；@ 250% (3 power shard) = 240/min。234/min 单实例石油焦低于 sink 容量 ✓
7. **1F belt 收集**:
   - row=2 plastic 主 belt（R1-R3 out-0 合流）
   - row=2 rubber 主 belt（R4 out-0）
   - **石油焦不收集主 belt**（R5 短 belt 直连本地 sink）
8. **垂直汇总（31m → 屋顶 35m）**: 4m 内放 2 条 lift-out-top
   - 塑料 lift × 1（屋顶再 1→2 split）
   - 橡胶 lift × 1
9. **屋顶 (35m)**:
   - 塑料 lift-top → 1→2 splitter (95:20) → 一支 merger 注 B4，一支 merger 注 B5
   - 橡胶 lift-top → 直接 merger 注 B5
   - 共 2 个 merger（B4、B5 各 1）
10. **本地 sink**: 1F col=1.5-3.5 row=3-4.625 处放 1 个 AWESOME Sink (16×13m × 24m高)，R5 石油焦 belt 直连
11. **复制 7 份**：BP9a-g 完全相同的物理建造（共 35 refinery + 7 sink + 7 套 belt/pipe/manifold/lift）
12. **Power Switch ×7**：按上面"Power Switch 分网"表布置 Network A-G；T6 只合 A，B-G 全部 OFF
13. **Power Shard（T6 阶段）**：仅 BP9a R1-R3 各插 2 shard、R5 插 1 shard、sink 插 3 shard（共 10 shard）；**BP9b-g 物理已就位但所有 shard 槽空着**

## Tier 7+ 启用流程（仅翻 Switch + 插 shard，不动结构 / 不动 belt / 不动 pipe）

| Tier | 操作 | 通电总数 |
|---|---|---:|
| T7 | 翻 Network B + C Switch ON → BP9b/c 各 5 台插 shard（plastic @191.67% 2 shard / rubber @100% 0 shard / coke @78% 1 shard） | 15 |
| T8 | 翻 Network D + E Switch ON → BP9d/e 各 5 台插 shard | 25 |
| T9 | 翻 Network F + G Switch ON → BP9f 5 台 + BP9g 4 台插 shard（BP9g 第 5 台备用 Switch 保留 OFF）；油田 pipe 升 Mk2 应对每实例满载 | 32 |

## 集群内部连接 / 多实例侧墙

无 belt 跨蓝图（C4 仅 BP9 自己；每实例完全独立、油田直进、残渣本地处理）。

**蓝图侧墙集群内 mount（机器层）：无**。BP9 蓝图侧墙仅有：
- 屋顶 6 belt mount（B1-B6 续接相邻 BP9 实例）
- 左 Wall Pipeline Hole（h=4m，原油 pipe 进料）

> BP9a-g 之间机器层完全不互通——每实例独立的油田 pipe（或共享油田主 pipe + 各实例分支）。
> 详见设计文档 [§多实例集群侧墙 mount 对偶规则](../2026-05-06-tier6-blueprint-design.md#多实例集群侧墙-mount-对偶规则关键设计约定)。

## 残渣 → 石油焦 → 本地 sink（默认）

每个 BP9 实例（通电后）：
- 78/min 残渣（pipe）→ 1 台 coke refinery @ 78% → 234/min 石油焦（固体）
- 234 石油焦 → 1 台本地 awesome-sink（@250% 提速到 240/min，留 6/min 余量）
- 7 实例独立 sink，**不上 B6 总线**
- BP-TERM-B 不再有"石油焦/残渣 sink"

**为什么就地 sink 而不是上 B6**：
- 234 石油焦/min × 7 实例 = 1638/min，远超任何 belt 等级
- 即使单实例 234 上 B6 也会让 BP10→BP15 段流量从 306 → 540（112% Mk4，溢出）
- 就地 sink 让 BP9 完全自包含，不影响其他蓝图

> **可选升级路径**：把第 5 台 coke refinery 改为 `residual-fuel` 配方（60 残渣 → 40 燃料 = 流体），燃料管道接到旁挂的燃料发电机（每台 250 MW）→ 自给 ~1300 MW（约整厂 70% 电力）。
> 此升级**不需要改 BP9 主蓝图**，仅切换配方 + 加燃料发电机即可；本地 sink 撤掉换为燃料 pipe。

## 验证

- [ ] **7 实例 BP9a-g 全部物理建造**（共 35 refinery + 7 sink，包括 T6 不通电的 30 refinery + 6 sink）
- [ ] 每实例 belt / pipe / pipe junction / 本地 sink belt / lift 一次到位（不只是 T6 通电的 BP9a）
- [ ] **7 个 Power Switch 全部物理安装好**（Network A-G），T6 只合 Network A，B-G 断开
- [ ] T6 仅 BP9a 插 shard（R1-R3 各 2 + R5 1 + sink 3 = 10 shard）；BP9b-g 物理就位但 shard 槽空
- [ ] refinery 原油输入用 Pipeline Wall Hole（左 Wall）
- [ ] R1-R4 残渣 out-1 用 pipe junction 合流到 R5 in-0（4 进 1 出）
- [ ] R5 跑 `petroleum-coke` 配方（不是 plastic/rubber）
- [ ] R5 输出是石油焦（固体，belt 可输送）
- [ ] **每实例 1 台本地 awesome-sink** 接 R5 输出（@250% 处理 234/min）
- [ ] **B6 不携带石油焦/残渣**（屋顶 B6 直通无 merger）
- [ ] 原油矿场 pipe 容量按 T9 ~1100/min 预留（7 实例满载）
- [ ] 7 实例物理紧贴（屋顶 B1-B6 跨实例续接）
- [ ] BP-TERM-B 不再有残渣/石油焦 sink
