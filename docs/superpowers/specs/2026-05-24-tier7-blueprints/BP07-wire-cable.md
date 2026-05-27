# BP7 铜板 + 电线 + 线缆 (C3)

## 概要

- **集群**: C3 铜电链（紧贴 BP6c 之后）
- **规格**: Mk2 **3 实例**（BP7a/b/c，同一蓝图复制；T9 满载 46 constructor）
- **机器**: **46 constructor 一次物理建造到位**（铜板 + 电线 + 线缆 三种配方）
  - **BP7a**: 16 台（6 sheet + 7 wire + 3 cable）
  - **BP7b**: 16 台（6 sheet + 7 wire + 3 cable）
  - **BP7c**: 14 台（6 sheet + 6 wire + 2 cable）
  - **合计**: 18 sheet + 20 wire + 8 cable = **46**
- **激活时间线**（仅翻 Power Switch + 插 Power Shard，不动结构）:
  - T6 → 11 台通电（3 sheet + 6 wire + 2 cable，单实例 BP7a 局部启用）
  - T7 → 24 台通电（8 sheet + 12 wire + 4 cable，BP7a+b）
  - T8 → 36 台通电（14 sheet + 16 wire + 6 cable，BP7a+b+c）
  - T9 → 46 台通电（18 sheet + 20 wire + 8 cable，**全部满载**）
- **产能 T6**: 铜板 62.5 / 电线 403 / 线缆 101.5
- **产能 T9**: 铜板 ~500 / 电线 ~1450 / 线缆 ~545（按 T9 配比超频）

> **核心设计原则**：**46 台 constructor 在 T6 阶段就全部摆好 + belt/manifold/电网/Power Switch 全部接好**。后续升 Tier 时**不重新放机器、不重新拉 belt**——只需 (1) 翻对应 Power Switch (2) 插 Power Shard (3) 调超频百分比。

## 机器超频清单（T6，Plan C ≤250%）

| 配方 | 物理 | T6 通电 | 超频 | 单台产能 (/min) | Power Shard/通电台 |
|---|---:|---:|---:|---:|---:|
| copper-sheet (constructor) | 18 | **3** | 208.33% | 20.83 | 3 |
| wire (constructor) | 20 | **6** | 223.89% | 67.17 | 3 |
| cable (constructor) | 8 | **2** | 169.17% | 50.75 | 2 |
| **合计 (T6)** | 46 | **11** | — | 62.5 + 403 + 101.5 | 3×3 + 6×3 + 2×2 = **31** |

> 总产能验证: 3 × 20.83 = 62.5 铜板 ✓ | 6 × 67.17 = 403 电线 ✓ | 2 × 50.75 = 101.5 线缆 ✓<br>
> T6 时未通电的 35 台 constructor：物理建好、belt 接好、shard 槽**空着**、Power Switch **关**，完全不耗电不产出。<br>
> T9 满载 46 台，按各产物 T9 目标配比调超频与 shard，3 实例合计 shard 见各实例 Power Switch 分网表。

## 物料 I/O

| 方向 | 物料 | 流量 (T6) | 路径 |
|---|---|---|---|
| 输入 | 铜锭 | 326.5 | **集群内部** ← BP6 右 Wall Outlet (h=24m) → BP7a 左 Wall Inlet |
| 输入 | 电线 | 203（内部回流，铜板/电线先做出来再喂给线缆）| 蓝图内部 lift |
| 输出 | 铜板 → BP8 电路板（C3 内部）| 27.5 | 集群内部 → BP8 |
| 输出 | 铜板 → B6 (BP10 AI 限制器) | 25 | 屋顶 merger → B6 |
| 输出 | 铜板 → B5 终端 | 10 | 屋顶 merger → B5 |
| 输出 | 电线 → B3 (BP12 + BP11) | 170 | 屋顶 merger → B3 |
| 输出 | 电线 → B5 终端 | 30 | 屋顶 merger → B5 |
| 输出 | 线缆 → B4 (BP14 + BP15) | 71.5 | 屋顶 merger → B4 |
| 输出 | 线缆 → B5 终端 | 30 | 屋顶 merger → B5 |

**屋顶总线接入**: 注入 B3 (170)、B4 (71.5)、B5 (10+30+30=70)、B6 (25)

## 楼层占用（标准实例 BP7a / BP7b，16 台）

| 层 | 高度 | 内容 | 物理台数 | T6 通电（BP7a）|
|---|---|---|---:|---:|
| 1F | 0-10m | constructor 6 台（2 sheet + 3 wire + 1 cable）| 6 | **6** (3 sheet + 2 wire + 1 cable) |
| 4m 地基 | 10-14m | 隔层 | — | — |
| 2F | 14-24m | constructor 6 台（2 sheet + 3 wire + 1 cable）| 6 | **5** (T6 启用 4 wire + 1 cable) |
| 4m 地基 | 24-28m | 隔层 | — | — |
| 3F | 28-38m | constructor 4 台（2 sheet + 1 wire + 1 cable）| 4 | **0** |
| 屋顶 | 40-45m | B1-B6 + 4 merger + 多 lift | — | — |

> BP7c 变体：1F 5 台 + 2F 5 台 + 3F 4 台 = 14 台（少一台 wire、一台 cable）。<br>
> **T6 阶段**：BP7a 1F 全 6 台 + 2F 部分 5 台共 11 台通电（Network A+B 局部），其余 BP7a 2F/3F + 全 BP7b/c 物理建好但 Switch **关**。所有 belt / lift / manifold / Power Switch 一次到位。

## 俯视图（按实际比例，每层独立）

**比例约定**（同 BP02）：
- 横向：**1 字符 = 1m**
- 纵向：**1 行 = 2m**（补偿 monospace 字符宽高比 1:2）
- 蓝图 40×40m → **40 字符宽 × 20 行高**
- 每 cell (8×8m) = 8 字符宽 × 4 行高

**图例**：
- `*` 后缀 = T6 通电；无 `*` = T7+ Power Switch 关（物理已建，不耗电不产出）
- `v` = front (south) 输出
- `8x10` = 8m 宽 × 10m 长

**机器实际尺寸** → ASCII 占位：

| 机器 | 实际 | ASCII 占位（W × H） |
|---|---|---|
| constructor | 8m × 10m | 8 字符 × 5 行 |

### 1F (0-10m): 6 constructor — BP7a T6 全部通电

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌───────┐┌───────┐┌───────┐┌───────┐┌───────┐    │
        ││ Cu1* ││ Cu2* ││ Wi1* ││ Wi2* ││ Cb1* │ row0:    │
 4      ││sheet ││sheet ││wire  ││wire  ││cable │ 5 台      │
        ││ 8x10 ││ 8x10 ││ 8x10 ││ 8x10 ││ 8x10 │           │
 8      ││  v   ││  v   ││  v   ││  v   ││  v   │           │
        │└───────┘└───────┘└───────┘└───────┘└───────┘    │
12      │── sheet collect belt h=2m  row=2.5      ─────────│
        │── wire  collect belt h=4m  row=3.5      ─────────│
16      │── cable collect belt h=6m  row=4.5      ─────────│
        │┌───────┐                                          │
20      ││ Wi3* │  row 2: 1 台 wire（BP7a T6 通电）         │
        ││wire  │                                           │
24      ││ 8x10 │  col 1-4 row=2 留 manifold + lift 操作    │
        ││  v   │                                           │
28      │└───────┘                                          │
        │ 铜锭进料：左 Wall Inlet h=24m → lift-bot →        │
32      │  中央 splitter manifold（按比例分给本层 6 台 in-0）│
        │ 电线回流：1F wire → lift-bot → Cb1 in-0           │
36      │ 产出：6 台 front → 3 条收集 belt → lift-out-top   │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- Cu1-Cu2：copper-sheet constructor，T6 通电
- Wi1-Wi3：wire constructor 3 台，T6 通电
- Cb1：cable constructor 1 台，T6 通电
- 三种 row 独立 belt（铜板/电线/线缆）防混料
- 电线内部回流：1F wire 部分输出 lift-bot 喂 cable in-0

### 2F (14-24m): 6 constructor — BP7a T6 启用 5 台（其余 Power Switch 关）

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌───────┐┌───────┐┌───────┐┌───────┐┌───────┐    │
        ││ Cu3  ││ Cu4  ││ Wi4* ││ Wi5* ││ Cb2* │ row0:    │
 4      ││sheet ││sheet ││wire  ││wire  ││cable │ 5 台      │
        ││ 8x10 ││ 8x10 ││ 8x10 ││ 8x10 ││ 8x10 │           │
 8      ││  v   ││  v   ││  v   ││  v   ││  v   │           │
        │└───────┘└───────┘└───────┘└───────┘└───────┘    │
12      │── sheet collect belt h=16m row=2.5      ─────────│
        │── wire  collect belt h=18m row=3.5      ─────────│
16      │── cable collect belt h=20m row=4.5      ─────────│
        │┌───────┐                                          │
20      ││ Wi6* │  row 2: 1 台 wire（T6 启用）              │
        ││wire  │                                           │
24      ││ 8x10 │  col 1-4 row=2 留 manifold + lift 操作    │
        ││  v   │  注：BP7a T6 启用 4 wire + 1 cable；     │
28      │└───────┘  2 sheet 物理就位但 Switch 关           │
        │ 铜锭进料：lift-bot 从 1F manifold 上行            │
32      │ 产出：5 台 front → 3 条收集 belt → lift-out-top   │
        │ Cu3/Cu4 T6 不耗电不产出（Power Switch OFF）       │
36      │                                                   │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- Cu3-Cu4：copper-sheet 2 台 **T6 关**（T7 → BP7a 启用 1 台、T8 启用第 2 台）
- Wi4-Wi6：wire 3 台，T6 通电
- Cb2：cable 1 台，T6 通电
- 所有 belt + lift + manifold 一次接好到全部 6 台 in-0/front

### 3F (28-38m): 4 constructor — T6 全部 Power Switch 关

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌───────┐┌───────┐┌───────┐┌───────┐                │
        ││ Cu5  ││ Cu6  ││ Wi7  ││ Cb3  │ row 0: 4 台         │
 4      ││sheet ││sheet ││wire  ││cable │ T6 Switch OFF      │
        ││ 8x10 ││ 8x10 ││ 8x10 ││ 8x10 │ → T8/T9 渐次 ON    │
 8      ││  v   ││  v   ││  v   ││  v   │ (Network C/D)      │
        │└───────┘└───────┘└───────┘└───────┘                │
12      │── sheet collect belt h=30m row=2.5      ─────────│
        │── wire  collect belt h=32m row=3.5      ─────────│
16      │── cable collect belt h=34m row=4.5      ─────────│
        │                                                   │
20      │ col=4 row=0 空：备用 / lift 操作区                │
        │                                                   │
24      │ 铜锭进料：lift-bot 从 2F manifold 上行            │
        │ 产出：lift-out-top 到屋顶 4 merger                │
28      │                                                   │
        │ T6: 4 台全 Power Switch OFF（不耗电不产出）       │
32      │ T8: Cu5/Wi7/Cb3 ON；T9: Cu6 ON（满 BP7a 16 台）   │
        │                                                   │
36      │                                                   │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- Cu5-Cu6 / Wi7 / Cb3：4 台 constructor **物理建造完整**，T6 阶段 Power Switch **全关**
- Belt manifold + lift 一次性接到所有 4 台 in-0 / front，与 1F+2F manifold 共用进料路径
- BP7a 单实例通电节奏：T6 11 台 → T7 +Cu3+Wi4-Wi5（→14）→ T8 +Cu5+Wi7+Cb3（→18）→ T9 +Cu4+Cu6+Cb2 微调（→ BP7a 16 台全开）

### 屋顶 (40-45m): B1-B6 + 4 merger (B3 + B4 + B5 + B6)

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │ o B1 ────────────────────────────────────── o   │
 4      │ o B2 ────────────────────────────────────── o   │
 8      │ o B3 ───[merger << wire 170]─────────────── o   │
12      │ o B4 ───[merger << cable 71.5]───────────── o   │
16      │ o B5 ───[merger << mainNode 70]──────────── o   │
20      │ o B6 ───[merger << copper-sheet 25]──────── o   │
24      │                                                 │
28      │ B3 inject 170/min (wire to BP12 + BP11)         │
        │ B4 inject  71.5   (cable to BP14 + BP15)        │
32      │ B5 inject  70     (mainNode: sheet/wire/cable)  │
        │ B6 inject  25     (sheet to BP10 AI limiter)    │
36      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- 4 个 merger（B3=电线、B4=线缆、B5=mainNode 三合一、B6=铜板）
- 各产物 1F+2F+3F 收集 → lift-out-top → 4 路注入
- T6 阶段流量低，merger 一次建好按 T9 满载流量预留容量

## Power Switch 分网（BP7a 标准实例，BP7b/c 同结构 OFF 启动）

把 BP7a 16 台 constructor 拆 4 个独立 Power Network，由 4 个 Power Switch 控制。**4 个 Switch 全部 T6 一次安装好**，只是 T6 阶段只合 Network A+B 局部。

| 网 | 范围 | 数量 | T6 状态 | 升级触发 |
|---|---|---:|---|---|
| Network A | 1F 全部（Cu1-2 / Wi1-3 / Cb1）| 6 | **ON**（6 台 T6 通电）| — |
| Network B | 2F wire+cable（Wi4-6 / Cb2）| 4 | **ON** 部分（5 台 T6 通电，含 Wi6）| 2F sheet (Cu3-4) T7/T8 翻 ON |
| Network C | 3F wire+cable（Wi7 / Cb3）| 2 | OFF | T8 翻 ON |
| Network D | 3F sheet（Cu5-6）| 2 | OFF | T8 翻 Cu5 ON / T9 翻 Cu6 ON |

> Power Switch 物理位置建议放 3F col=4 row=0 角落（lift 操作区旁），4 个并排，方便玩家在场内一眼区分。<br>
> **BP7b**：与 BP7a 结构完全相同（16 台 4 个 Network），但 T6 阶段 **A/B/C/D 全 OFF**；T7 翻 BP7b Network A、T8 翻 B+C、T9 翻 D。<br>
> **BP7c**：14 台变体（少 1 wire + 1 cable），4 个 Network 同布局；T6 阶段全 OFF；T8 启用 A+B、T9 启用 C+D。

## 建造步骤（BP7a 标准实例，BP7b/c 完全复制结构）

1. **框架**：5×5 cell × 6 cell 高（40×40×48m，留屋顶 5m）
2. **1F (0-10m)**：放 6 台 constructor（row 0 col 0-4 = 5 台 Cu1/Cu2/Wi1/Wi2/Cb1 + row 2 col 0 = 1 台 Wi3）
3. **1F belt**：row=2.5 sheet belt 收 Cu1/Cu2；row=3.5 wire belt 收 Wi1/Wi2/Wi3；row=4.5 cable belt 收 Cb1；末端 col=4.5 合流到主 lift-out-top
4. **1F 地基**：y=10m 铺 4m 厚地基覆盖整层
5. **2F (14-24m)**：**同 1F 布局**放 6 台 constructor（row 0 col 0-4 = 5 台 Cu3/Cu4/Wi4/Wi5/Cb2 + row 2 col 0 = 1 台 Wi6）
6. **2F belt**：row=2.5/3.5/4.5 三条独立 collect belt，末端 lift-out-top
7. **2F 地基**：y=24m 铺 4m 厚地基
8. **3F (28-38m)**：放 4 台 constructor（row 0 col 0-3 = Cu5/Cu6/Wi7/Cb3）
9. **3F belt**：row=2.5/3.5/4.5 三条独立 collect belt，末端 lift-out-top
10. **垂直汇总**：1F+2F+3F 各 3 路 belt 末端 lift-out-top 在 col=4.5 汇合成主 lift 上送到 h=40m 屋顶
11. **铜锭进料**：左 Wall Inlet (col=0, h=24m, row=2.5) → lift-bot → 1F 中央 splitter manifold 喂 **全部 16 台**（1F 直喂 + lift-up 喂 2F+3F）
12. **电线内部回流**：1F wire (Wi1-3) 部分输出 → lift-bot → 1F Cb1 in-0 + lift-up → 2F Cb2 / 3F Cb3 in-0
13. **集群内部出料**：铜板右 Wall Outlet (col=5, h=24m, row=2.5)、铜锭右 Wall Outlet (BP7a/b 转下游 BP7b/c)
14. **屋顶 (40m)**：铺 6 条 Mk4 平行 belt（B1-B6）+ 4 个 merger（B3/B4/B5/B6），左右各嵌 Wall Mount (Inlet 左 / Outlet 右)
15. **Power Switch ×4**：按上面"Power Switch 分网"表布置 Network A/B/C/D；T6 BP7a 只合 A + B 局部，BP7b/c 全部 OFF
16. **Power Shard（T6 阶段）**：仅 BP7a 11 台 T6 通电机各插 shard（Cu1-Cu2 各 3 + Wi1-Wi5/Wi6 各 3 + Cb1-Cb2 各 2）；**其余 35 台物理已就位但 shard 槽空着**

## Tier 7+ 启用流程（仅翻 Switch + 插 shard，不动结构 / 不动 belt）

| Tier | 操作 | 通电总数 | 实例 |
|---|---|---:|---:|
| T7 | BP7a 内 Cu3/Wi 等补开（Network B 全开 + C 部分），BP7b 翻 Network A | 24 | 2 |
| T8 | BP7a Network C/D 部分开，BP7b 全开，BP7c 翻 Network A | 36 | 3 |
| T9 | 全部 4 个 Network × 3 实例 ON → 46 台超频调到 T9 配比；矿场来料 belt 升 Mk5 | **46** | 3 |

> 各 Tier 具体通电台数与超频百分比按蓝图 spec 给出的配比（T6 11 / T7 24 / T8 36 / T9 46）分摊到 BP7a/b/c 各实例的 Network 上。

## 多实例侧墙续接

BP7 是**纯同向流**集群（铜锭从 BP6→BP7a→BP7b→BP7c→BP8）。详见设计文档 [§多实例集群侧墙 mount 对偶规则](../2026-05-06-tier6-blueprint-design.md#多实例集群侧墙-mount-对偶规则关键设计约定)。

蓝图侧墙集群内 mount（机器层）：

| 高度 | 物料 | 左 Wall | 右 Wall |
|---|---|---|---|
| h=4m row=2.5 | 铜锭 | **Inlet** | **Outlet**（剩余给下游 BP7b/c）|
| h=4m row=3.5 | 铜板 | — | **Outlet**（仅 BP7c 用，给 BP8）|

> BP7c 右 Outlet 铜板接 BP8（C3 末端）；BP7a/b 右 Outlet 铜板悬空（这些实例的铜板内部消耗 + 屋顶 B6 走，不出右墙）。<br>
> 电线内部回流（自给线缆配方）**仅在同蓝图内部 lift**，不跨实例。<br>
> **关键**：BP7b/c 即便 T6 全 OFF，侧墙 Inlet/Outlet 也必须一次开洞 + belt 接通，避免 T7/T8 升级时再破墙。

## 集群内部短 belt

- BP7 → BP8 铜板 27.5：右 Wall Outlet (col=5, h=24m, row=2) → BP8 左 Wall Inlet (h=24m, row=2)
- 仅 BP7c 实例参与（BP7a/b 铜板进集群内 BP7c 合流后再去 BP8）；或每个实例独立出口（BP8 左侧 3 个 Wall Inlet）

## 验证

- [ ] **46 台 constructor 全部物理放置**（包括 T6 不通电的 35 台）
- [ ] 三种产物 row belt 独立（铜板/电线/线缆）并接到全部 46 台 in-0/front（不只是 T6 通电的 11 台）
- [ ] 3 实例 × 4 = 12 个 Power Switch 一次建好；T6 仅 BP7a Network A + B 局部合上，其余全断
- [ ] T6 仅 11 台插了 shard；其余 35 台物理就位但 shard 槽空
- [ ] 4 个屋顶 merger filter 正确（B3=电线、B4=线缆、B5=mainNode 三种合、B6=铜板）
- [ ] 电线内部回流 belt 不与外部进出料混淆
- [ ] B3 流量 T9 ≈ 1400 < Mk5 780？需 Mk6（或拆分到多 B 槽），T6 阶段 170 < 480 ✓
- [ ] 3 实例间侧墙 Inlet/Outlet 一次开洞接通，避免 T7/T8 破墙
- [ ] 矿场来料 belt 容量按 T9 满载预留（T9 升 Mk5+；T6 临时 Mk4 也可，物理升级位置预留好）
