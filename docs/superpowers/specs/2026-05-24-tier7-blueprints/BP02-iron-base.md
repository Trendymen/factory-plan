# BP2 铁板 + 铁棒 + 强化铁板 (C1)

## 概要

- **集群**: C1 铁系（紧贴 BP1 之后）
- **规格**: Mk2 **2 实例**（BP2a + BP2b，相同蓝图复制贴贴）
- **机器**（每实例物理建造，T6 一次到位）: **8 plate constructor + 11 rod constructor + 3 RIP assembler = 22 台/实例**（2 实例合计 44 台物理建造）
- **激活时间线**（仅翻 Power Switch + 插 Power Shard，不动结构）:
  - T6 → BP2a 4+11+3 = 18 台通电；BP2b 0 通电（纯直通管道）
  - T7 → BP2a 6+11+3 = 20 台；BP2b 0+4+1 = 5 台（合计 25）
  - T8 → BP2a 7+11+3 = 21 台；BP2b 0+7+2 = 9 台（合计 30）
  - T9 → BP2a 8+10+3 = 21 台；BP2b 0+10+2 = 12 台（合计 33）
- **产能 T6**: 铁板 173 / 铁棒 381 / 强化铁板 25.5 (per minute)

> **核心设计原则**：每个 BP2 实例**22 台机器 + belt/manifold/电网/lift/Power Switch 全部 T6 一次建好**。BP2a 在 T6 阶段就通电 18 台，剩余 4 台 Power Switch 关；BP2b 整副本 Power Switch 全关（仅作为铁锭/铁棒/螺丝直通管道）。后续升 Tier 时**不重新放机器、不重新拉 belt**——只需 (1) 翻对应 Power Switch (2) 插 Power Shard (3) 调超频百分比。

## 机器超频清单（T6，Plan C ≤250%）

| 配方 | 物理/实例 | T6 通电 (BP2a) | T6 通电 (BP2b) | 超频 | 单台产能 (/min) | Power Shard/通电台 |
|---|---:|---:|---:|---:|---:|---:|
| iron-plate (constructor) | 8 | **4** | 0 | 216.25% | 43.25 | 3 |
| iron-rod (constructor) | 11 | **11** | 0 | 230.91% | 34.64 | 3 |
| reinforced-iron-plate (assembler) | 3 | **3** | 0 | 170.0% | 8.5 | 2 |
| **合计 (T6, 每实例)** | 22 | 18 | 0 | — | — | 4×3 + 11×3 + 3×2 = **51** (BP2a) / 0 (BP2b) |

> 总产能验证 (T6, BP2a 单实例): 4 × 43.25 = 173 铁板 ✓ | 11 × 34.64 = 381 铁棒 ✓ | 3 × 8.5 = 25.5 RIP ✓
> T6 未通电机器（BP2a 的 4 台 plate reserve + BP2b 全部 22 台）：物理建好、belt 接好、shard 槽**空着**、Power Switch **关**，完全不耗电不产出。
> T9 满载 33 台合计（BP2a 21 + BP2b 12）@ 各自超频，每实例最多 51 + 部分扩容 shard。

## C1 集群完整路由（关键！）

C1 物理顺序（左→右）: **`BP1 | BP2a | BP2b | BP3`**

```
[BP1]─铁锭→[BP2a]─铁棒→[BP2b]─铁棒→[BP3]
              ↑                       │
              └─────螺丝 306 反向←────┘
                  (跨 BP2b 直通贯穿)
```

**BP2 蓝图必须自带反向贯穿 belt**（左↔右），否则 BP3 螺丝无法到 BP2a 的 RIP。

## 物料 I/O

| 方向 | 物料 | 流量 | 路径（BP2a 视角）| 路径（BP2b 视角）|
|---|---|---|---|---|
| 输入 | 铁锭 | 640/min | **左 Wall Inlet (h=4m)** ← BP1 右 Outlet（低位进料，沿东侧 col=4.75 lift 竖井上送，不沿 col=0 下沉穿 2F/3F 机身）| 左 Wall Inlet ← BP2a 右 Outlet（剩余）|
| **直通输出** | 铁锭剩余 | — | 右 Wall Outlet → BP2b 左 Inlet | 右 Wall Outlet → 悬空（C1 末端）|
| 输出 | 铁棒 (生产) | 224 给 BP3 | 右 Wall Outlet (h=6m) → BP2b 左 Inlet | 右 Wall Outlet → BP3 左 Inlet |
| **直通输出** | 铁棒 | — | — | 左 Inlet ← BP2a → 蓝图内 belt → 右 Outlet → BP3 |
| 输入 | 螺丝（**反向**）| 306/min 给 RIP | **右 Wall Inlet (h=35m)** ← BP2b 左 Outlet | 右 Wall Inlet ← BP3 左 Outlet |
| **反向直通** | 螺丝 | — | — | 右 Inlet ← BP3 → 蓝图内反向 belt → 左 Outlet → BP2a |
| 输出 | 铁板 → RIP 内部 | 153 | 蓝图内 lift 1F→3F | — |
| 输出 | 铁板 → B5 终端 | 20 | 屋顶 merger → B5 | — |
| 输出 | 铁棒 → B2 (C6) | 140 | 屋顶 merger → B2 | — |
| 输出 | 铁棒 → B5 终端 | 15 | 屋顶 merger → B5 | — |
| 输出 | RIP → B2 (BP13/BP15) | 18 + 2.5 | 屋顶 merger → B2 | — |
| 输出 | RIP → B5 终端 | 5 | 屋顶 merger → B5 | — |

> T6 阶段 BP2a 通电 18 台（剩 4 台 plate Power Switch 关），**BP2b Power Switch 全关**——BP2b 仅作为**铁锭/铁棒/螺丝直通管道**存在（蓝图内 belt 物理连接好但不消化）。T7+ 启用 BP2b 内部机器后才开始消化。

**屋顶总线接入**: 注入 B2 (铁棒 140 + RIP 20.5)、B5 (mainNode 40)

## 集群内部跨蓝图侧墙 mount 配置（BP2 蓝图必备）

每个 BP2 实例侧墙在**机器层**有 3 对独立 Wall Mount：

| 高度 | 物料 | 左 Wall (col=0) | 右 Wall (col=5) | 蓝图内连接 |
|---|---|---|---|---|
| **h=4m row=0.5** | 铁锭 | **Inlet** ← 上游 | **Outlet** → 下游 | 低位进 1F 北侧巷，沿东侧 col=4.75 lift 竖井上送；splitter manifold tap 部分铁锭给本实例 19 台 constructor，剩余直通 |
| **h=6m row=0.75** | 铁棒 | **Inlet** ← 上游（仅 BP2b 用，BP2a 收来自 BP1 的"无铁棒"）| **Outlet** → 下游 | 内部 splitter manifold tap 部分铁棒给本实例 RIP，剩余直通 + 本实例新产铁棒合流 |
| **h=35m row=3**（屋顶层）| 螺丝（**反向**）| **Outlet** → 上游（给左边 BP）| **Inlet** ← 下游（来自右边 BP）| 屋顶层贯穿；splitter tap 部分螺丝 lift-down 11m 给本实例 3F RIP，剩余反向直通到左 Outlet |

**关键**：相同蓝图设计，左右各有 6 对侧墙 mount（屋顶 6 belt + 机器层 3 belt）= 共 9 对。Auto Connect 时所有 9 对自动续接相邻蓝图。

> **BP2 副本（BP2a/b）实际使用差异**：
> - **BP2a**：左 Inlet 收来自 BP1 的铁锭（无铁棒上游，铁棒 Inlet 悬空）；左 Outlet 螺丝输出给左边的 BP1（无效，悬空，但 mount 必须存在）
> - **BP2b**：左 Inlet 收来自 BP2a 的铁锭+铁棒（双 belt）；右 Outlet 给 BP3 铁棒+剩余铁锭；右 Inlet 收来自 BP3 的螺丝→反向 belt 直通到左 Outlet 给 BP2a

## 楼层占用

| 层 | 高度 | 内容 | 物理/实例 | T6 通电 (BP2a) | T6 通电 (BP2b) |
|---|---|---|---:|---:|---:|
| 1F | 0-8m | 5 plate + 5 rod constructor（每排 4 台 3 排 4+4+2） | 10 | **9** | 0 |
| 4m 地基 | 8-12m | 隔层 | — | — | — |
| 2F | 12-20m | 6 rod + 3 plate constructor（每排 4 台 3 排 4+4+1） | 9 | **6** | 0 |
| 4m 地基 | 20-24m | 隔层 | — | — | — |
| 3F | 24-32m | 3 RIP assembler（10×15m，占 4-19m 进深） | 3 | **3** | 0 |
| 屋顶 | 35-40m | B1-B6 + 反向螺丝贯穿 belt(h=35m) + merger × 2 + lift × 多 | — | — | — |

> 每副本 22 台一次物理到位。T6 BP2a 通电 18 台（1F 9 + 2F 6 + 3F 3，剩 4 台 plate Power Switch 关）；BP2b 全 22 台 Power Switch 关。T7+ 渐次翻 Switch，不动结构。

## 俯视图（按实际比例，每层独立 — 视觉正方形）（横向为示意，机器/设备真实 x 坐标以正文坐标表为准）

**比例约定**：
- 横向：**1 字符 ≈ 1m（示意）**——注意 ASCII 内嵌的 0/4/8…40m 标尺实际约 1.25 字符/m（4m=5 字符），与本行名义 1 字符=1m 不完全一致；**横向仅为示意，机器/设备真实 x 坐标一律以正文坐标表为准**
- 纵向：**1 行 = 2m**（补偿 monospace 字符宽高比 1:2）
- 蓝图 40×40m → **40 字符宽 × 20 行高**，渲染为视觉正方形
- 每 cell (8×8m) = 8 字符宽 × 4 行高

**图例**：
- `*` 后缀 = T6 BP2a 通电；无 `*` = T6 Power Switch 关（物理已建，不耗电不产出）
- BP2b 副本所有机器**均无 `*`**（T6 全关）
- `v` = front (south) 输出；`──` = belt；尺寸 8x10 = 8m 宽 × 10m 长

**机器实际尺寸** → ASCII 占位：

| 机器 | 实际 | ASCII 占位（W × H） |
|---|---|---|
| smelter | 6m × 9m | 6 字符 × 4-5 行 |
| foundry | 8m × 9m | 8 字符 × 4-5 行 |
| constructor | 8m × 10m | 8 字符 × 5 行 |
| assembler | 10m × 15m | 10 字符 × 7-8 行 |
| manufacturer | 20m × 22m | 20 字符 × 11 行 |
| refinery | 10m × 20m | 10 字符 × 10 行 |

### 1F (0-8m): 5 plate + 5 rod constructor = 10 台（每排 4 台 + 北侧进料巷；T6 BP2a 通电 9 台）

> **盒内仅单宽字符**（Unicode 盒形 ┌─┐│└┘ 单宽 OK；避开 CJK 宽字符 `━ ═ ↓ ← →` + 中文）。中文注释在盒外右侧。
> **§2 公约**：每排 4 台 constructor（非 5 台满宽），北墙内缩 4m 留东西向进料巷，机器间留 1m 间隙；东侧 col=4.75（x=37-40）整列预留为 lift 竖井（避开全部机器脚印）。constructor 8m W × 10m L → 8 字符宽 × 5 行高。

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │ iron-ingot/rod feed manifold (north aisle)   │L│  进料巷 0-4m
 2      │ splitter tap >> 各 constructor back (in-0)   │I│
        │┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐           │F│
 4      ││ P1*  │ │ P2*  │ │ P3*  │ │ P4*  │           │T│  排1 plate 4-14m
        ││plate │ │plate │ │plate │ │plate │           │ │
 6      ││ 8x10 │ │ 8x10 │ │ 8x10 │ │ 8x10 │           │s│
        ││      │ │      │ │      │ │      │           │h│
 8      ││  v   │ │  v   │ │  v   │ │  v   │           │a│
        │└──────┘ └──────┘ └──────┘ └──────┘           │f│
14      │──── plate collect belt (front side, h=2m) ───│t│  收集带 14-16m
        │┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐           │ │
        ││ R1*  │ │ R2*  │ │ R3*  │ │ R4*  │           │c│  排2 rod 16-26m
        ││ rod  │ │ rod  │ │ rod  │ │ rod  │           │o│
        ││ 8x10 │ │ 8x10 │ │ 8x10 │ │ 8x10 │           │l│
        ││      │ │      │ │      │ │      │           │=│
        ││  v   │ │  v   │ │  v   │ │  v   │           │4│
        │└──────┘ └──────┘ └──────┘ └──────┘           │.│
26      │──── rod collect belt (front side, h=2m) ─────│7│  收集带 26-28m
        │┌──────┐ ┌──────┐                             │5│
        ││ P5   │ │ R5*  │   (排3：2 台 reserve/rod)    │ │  排3 28-38m
        ││plate │ │ rod  │                             │ │
        ││ 8x10 │ │ 8x10 │                             │ │
        ││      │ │      │                             │ │
        ││  v   │ │  v   │                             │ │
        │└──────┘ └──────┘                             │ │
38      │ output manifold / Wall Mount 区              │ │  38-40m
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴───┘
```

左/右侧墙 Wall Mount（机器层，row 标注见下表）：
- **IN  iron-ingot h=4m**（左 Wall Inlet ← BP1 右 Outlet）：进 1F 北侧 manifold，沿 col=4.75 lift 竖井上送各楼层
- **IN  iron-rod  h=6m**（左 Wall Inlet ← 上游；BP2a 此口悬空）
- **OUT iron-ingot h=4m / iron-rod h=6m**（右 Wall Outlet → 下游）
- 螺丝**反向**口已移至屋顶层 h=35m（旧 h=28m 落在 3F 机身内，见「反向螺丝贯穿 belt（屋顶层 h=35m）」节）

- P1-P5：plate constructor 8m W × 10m L × 8m H（铁板）；T6 BP2a 通电 P1-P4，P5 Power Switch 关（T7 启用）
- R1-R5：rod constructor 8m W × 10m L × 8m H（铁棒）；T6 BP2a 全部 5 台通电
- BP2b 副本：P1-P5 + R1-R5 全部物理建好，**所有 10 台 Power Switch 关**（T7+ 渐次启用）
- 排布：排1 (4-14m) P1-P4 / 排2 (16-26m) R1-R4 / 排3 (28-38m) P5+R5；每排 4 台上限，北侧 0-4m 进料巷，东侧 col=4.75 lift 竖井。
- collect belt 走机器 **front 边之外**（plate 在 14-16m、rod 在 26-28m），不穿机身。

### 2F (12-20m): 3 plate + 6 rod constructor = 9 台（T6 BP2a 通电 6 台 rod）

> **§2 公约**：同 1F——每排 4 台、北侧 0-4m 进料巷、东侧 col=4.75 lift 竖井、collect belt 走 front 外侧。9 台分 3 排（4+4+1）。

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │ iron-ingot feed manifold (north aisle)       │L│  进料巷 0-4m
 2      │ splitter tap >> 各 constructor back (in-0)   │I│
        │┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐           │F│
        ││ R6*  │ │ R7*  │ │ R8*  │ │ R9*  │           │T│  排1 rod 4-14m
        ││ rod  │ │ rod  │ │ rod  │ │ rod  │           │ │
        ││ 8x10 │ │ 8x10 │ │ 8x10 │ │ 8x10 │           │s│
        ││      │ │      │ │      │ │      │           │h│
        ││  v   │ │  v   │ │  v   │ │  v   │           │a│
        │└──────┘ └──────┘ └──────┘ └──────┘           │f│
14      │──── rod collect belt (front side) ───────────│t│  收集带 14-16m
        │┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐           │ │
        ││ R10* │ │ R11* │ │ P6   │ │ P7   │           │c│  排2 16-26m
        ││ rod  │ │ rod  │ │plate │ │plate │           │o│
        ││ 8x10 │ │ 8x10 │ │ 8x10 │ │ 8x10 │           │l│
        ││      │ │      │ │      │ │      │           │=│
        ││  v   │ │  v   │ │  v   │ │  v   │           │4│
        │└──────┘ └──────┘ └──────┘ └──────┘           │.│
26      │──── rod/plate collect belt (front side) ─────│7│  收集带 26-28m
        │┌──────┐                                      │5│
        ││ P8   │   (排3：1 台 plate reserve)           │ │  排3 28-38m
        ││plate │                                      │ │
        ││ 8x10 │                                      │ │
        ││      │                                      │ │
        ││  v   │                                      │ │
        │└──────┘                                      │ │
38      │ iron-rod/plate out manifold >> lift-up 竖井  │ │  38-40m
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴───┘
```

- R6-R11：6 rod constructor（T6 BP2a 全部通电；BP2b 全关）
- P6-P8：3 plate constructor 物理建造完成，**T6 BP2a + BP2b 均 Power Switch 关**（T7 起 BP2a 渐次开 P6/P7/P8）
- 配合 1F P1-P5，每实例 plate 总数 = 8 台（T9 BP2a 通电 8 台，BP2b 0 台）
- 进出料走 col=4.75 lift 竖井：iron-ingot 从 1F manifold lift-up 进 2F 北侧巷；iron-rod 输出 lift-up 至屋顶 B2 merger；iron-plate 输出 lift-up 至 3F RIP / 屋顶。竖井避开全部机器脚印。

### 3F (24-32m): 3 RIP assembler

> **§2 公约**：assembler 10m W × 15m L → 10 字符宽 × 7-8 行高（不得画短）。北侧 0-4m 进料巷（plate manifold + 屋顶螺丝 lift-down 落点）；机器占 4-19m；输出 belt 在 front 边（19m）之外、y≥21m（满足 R16 垂直进出净空，旧 y=16 仅 1m 间隙已废弃）；东侧 output lift 列左界收到 **x≥35**（即 x=35-40，旧 x=34 与 RIP3 右缘 x=35 名义重叠 1m，已废弃；RIP3 占 x=25-35，lift 列 x=35 起仅边缘接触不重叠）。

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │ plate feed manifold + screw lift-down 落点    │ │  进料巷 0-4m
 2      │ split >> 各 RIP back: in-0 plate + in-1 screw │ │
        │┌─────────┐ ┌─────────┐ ┌─────────┐            │L│
 4      ││ RIP 1*  │ │ RIP 2*  │ │ RIP 3*  │            │I│  RIP 进深 4-19m
        ││assembler│ │assembler│ │assembler│            │F│  x: R1 5-15 / R2 15-25
 6      ││ 10x15m  │ │ 10x15m  │ │ 10x15m  │            │T│  / R3 25-35（右缘 x=35
        ││         │ │         │ │         │            │ │  与 lift 列 x≥35 边缘接触）
 8      ││in0 plate│ │in0 plate│ │in0 plate│            │o│
        ││in1 screw│ │in1 screw│ │in1 screw│            │u│
        ││ (back N)│ │ (back N)│ │ (back N)│            │t│
        ││         │ │         │ │         │            │ │
        ││         │ │         │ │         │            │x│
        ││  out v  │ │  out v  │ │  out v  │            │=│
        │└─────────┘ └─────────┘ └─────────┘            │3│
20      │  (front 边 = 19m)                             │5│
22      │──── RIP output belt (front side) ────────────│-│  收集带 ≥21m
        │ iron-plate in: 1F+2F plate >> lift-up 北侧巷  │4│
26      │ screw in: 屋顶 35m reverse belt >> lift-down  │0│
        │   到 3F 北侧巷(24m，落差 11m≥4m) >> 中央       │ │
30      │   splitter >> 3 RIP in-1                       │ │
34      │ RIP out >> x>=35 col output lift-up >> 屋顶   │ │
38      │   B2 merger (RIP 20.5) / B5 merger (5)         │ │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴───┘
```

- RIP 1-3：3 RIP assembler 10m W × 15m L × 8m H，双输入 (back/北: in-0 铁板 @col 偏 2.5m + in-1 螺丝 @col 偏 6.5m)，单输出 (front/南 @col 偏 4.5m)
- T6 BP2a 通电全部 3 台；BP2b Power Switch 全关
- 每实例物理只需 3 台 RIP；T9 BP2a 满载 3 台，超出部分由 BP2b 副本提供（不再隐含「BP2a 5 台 RIP」的旧错误）
- 注：T9 总 RIP = 5。BP2a 满载 3，BP2b 启用 2，合计 5（T9 行已统一为 BP2a 8+10+3=21 / BP2b 0+10+2=12 / 合计 33）。BP2b 副本的 RIP 1-3 中 T9 通电 2 台（RIP 1/RIP 2 ON，RIP 3 待 reserve）

### 反向螺丝贯穿 belt（屋顶层 h=35m）

> **修正（§4-BP02 建）**：旧设计把螺丝贯穿 belt 放 h=28m，但 28m 落在 **3F assembler 实际占用区 24-32m 内**（assembler 8m 高，24-32m），belt 直接穿 3F 机身；且从 28m 下行到 3F RIP 输入面（~26m）只有 ~2m < lift 最小 4m，建不出。**改：螺丝贯穿 belt 抬到屋顶层 h=35m**（与 6 条总线同层、避开所有机身），到 3F 北侧进料巷由 lift-down 11m 落到 24m 输入面（11m ≥ 4m 最小高度 ✓），再水平进 RIP in-1。跨层走线遵循 §2-5「先水平转弯相（屋顶 35m 上水平引到目标 col）→ 再垂直爬升相（垂直下降 11m）」分两段。

螺丝贯穿 belt 与屋顶 6 条总线同层，沿 row=3（h=35m）单独一条横穿（左 Outlet ↔ 右 Inlet）：

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │ (此层即屋顶层 35-40m，与下方「屋顶」节同层)        │
 4      │ LEFT Outlet o═══════════════════════o RIGHT Inlet│  h=35m row=3
 8      │   reverse-screw belt（贯穿，col 0↔5）              │
12      │   splitter 在 col≈2.5 取本实例 306/min            │
16      │   >> lift-down 11m 到 3F 北侧巷(24m) >> RIP in-1   │
20      │   余量继续反向 belt >> 左 Outlet                   │
24      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- 左 Wall Outlet (h=35m)：螺丝**反向**给上游 BP（BP2a 给 BP1 此 Outlet 悬空；BP2b 给 BP2a 用此输出）
- 右 Wall Inlet (h=35m)：螺丝从下游来（BP2a 接 BP2b；BP2b 接 BP3 螺丝）
- 蓝图内 splitter 取本实例 3 台 RIP 所需 306/min 螺丝（3 RIP @170% × 12 螺丝/RIP × 8.5 RIP/min = 306），余量直通到左 Outlet
- lift-down 落点在 3F 北侧进料巷专用 col，避开 RIP 机身；先水平后垂直分两段（§2-5）

### 屋顶 (35-40m): B1-B6 + 螺丝反向 belt + 2 merger

> **§2-8 公约**：7 条 belt（6 主线 + 1 螺丝反向）在 40m 进深内按 ~5m 子 cell 间距并排（非 8m 堆叠、非高度堆叠），全部同处 35-40m 这一层、靠 row 错开。

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 1      │ o B1 ────────────────────────────────────── o   │  y=2m
 4      │ o B2 ───[merger << lift-top iron-rod+RIP]── o   │  y=8m
 7      │ o B3 ────────────────────────────────────── o   │  y=14m
10      │ o B4 ────────────────────────────────────── o   │  y=20m
13      │ o B5 ───[merger << lift-top mainNode]────── o   │  y=26m
16      │ o B6 ────────────────────────────────────── o   │  y=32m
18      │ o SCREW ══(reverse)══[split tap 306>lift-dn]══ o │  y=36m 螺丝反向
20      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- B1-B6：6 条 Mk5 belt 横穿，左 Wall Inlet → 右 Wall Outlet
- SCREW：螺丝反向贯穿 belt（右 Inlet ← 下游 → 左 Outlet → 上游），col≈2.5 处 splitter tap 本实例 306/min → lift-down 11m 进 3F RIP in-1
- B2 merger 注入：铁棒 140/min + RIP 20.5/min（来自 1F+2F+3F 上行 lift）
- B5 merger 注入：铁板 20 + 铁棒 15 + RIP 5 = 40/min mainNode
- B7/B8 预留：T7+ 铝链/超级计算机用，子 cell 间距下仍可在本层再插入 1-2 条（T6 空跑）

### 侧视剖面（east-west，沿 col=2 切面）

```
40m ┌──────────────────────────────────────┐
    │ Roof 35-40m: 6 belt + 螺丝贯穿 belt  │
    │   + 2 merger (h=35m)                 │
35m ├──────────────────────────────────────┤
    │   reserved 真空档 (32-35m)           │
32m ├──────────────────────────────────────┤
    │  3F  RIP assembler x3 (24-32m)       │
24m ├──────────────────────────────────────┤
    │   4m foundation (20-24m)             │
20m ├──────────────────────────────────────┤
    │  2F  3 plate + 6 rod con (12-20m)    │
12m ├──────────────────────────────────────┤
    │   4m foundation (8-12m)              │
 8m ├──────────────────────────────────────┤
    │  1F  5 plate + 5 rod con (0-8m)      │
 0m └──────────────────────────────────────┘
```

> 此为简化层叠示意图（仅展示垂直分层），非俯视。每个分层完整布局见上方 1F/2F/3F 各小节。

> 屋顶 2 个 merger（一个注 B2、一个注 B5）+ 2 条 lift-top（铁棒/RIP 从 2F+3F 上行）。

## Power Switch 分网

每实例 22 台机器拆 5 个独立 Power Network，由 5 个 Power Switch 控制。**5 个 Switch 全部 T6 一次安装好**——BP2a 只合 Network A+B+C；BP2a 的 Reserve-D/E 和 BP2b 的 A-E 全部 OFF。

| 网 | 范围 | 数量 | T6 BP2a 状态 | T6 BP2b 状态 | 升级触发 |
|---|---|---:|---|---|---|
| Network A | 1F P1-P4 + R1-R5 (4 plate + 5 rod) | 9 | **ON** | OFF | — |
| Network B | 2F R6-R11 (6 rod) | 6 | **ON** | OFF | — |
| Network C | 3F RIP 1-3 (3 assembler) | 3 | **ON** | OFF | — |
| Network D (plate reserve) | 1F P5 + 2F P6-P8 (4 plate) | 4 | OFF | OFF | BP2a T7 翻 P5/P6（2 台），T8 翻 P7，T9 翻 P8；BP2b T7-T9 维持 OFF |
| Network E (BP2b 副本启用) | 仅 BP2b 用：R6-R11 + P6/P7 | — | — | OFF | BP2b T7 翻部分 rod；T8/T9 渐次扩 |

> Power Switch 物理位置建议放各副本 1F **北侧进料巷内（row=0.25-1.5、col=4-5 的 lift/manifold 专用列旁，不占任何 constructor 脚印）**，5 个并排沿东墙竖排，方便玩家在场内一眼区分各 Network 状态。（旧 col=4.5 落点会撞 P5/R5 占地，已废弃）
> BP2b 副本：所有 5 个 Switch T6 全 OFF（蓝图 Auto Connect 后玩家手动确认）

## 建造步骤（BP2 蓝图，BP2a/b 完全相同复制）

1. **1F (0-8m)**: 10 constructor（5 plate P1-P5 + 5 rod R1-R5）按俯视图布置（每排 4 台、3 排 4+4+2、北侧 0-4m 进料巷、东侧 col=4.75 lift 竖井），**全部一次物理到位**
2. **1F belt 收集**（collect belt 走机器 front 边之外）:
   - plate 输出 → 排1 front 外侧 14-16m collect belt（铁板，**接到全部 5 台 plate 包括 P5**）
   - rod 输出 → 排2 front 外侧 26-28m collect belt（铁棒，**接到全部 5 台 rod**）
3. **铁锭进料 + 直通**:
   - 左 Wall Inlet (h=4m, row=0.5) ← 上游来料（低位进 1F 北侧进料巷）
   - 沿东侧 col=4.75 lift 竖井 lift-up 分送各楼层北侧巷 → splitter manifold（按 T9 满载预留 tap 全部 8 plate + 11 rod 进料口 in-0）
   - splitter manifold 末端 → 右 Wall Outlet (h=4m, row=0.5) → 下游（铁锭低位进出，不在 col=0 做下沉 lift 穿机身）
4. **铁棒进料 + 直通 + 自产合流**:
   - 左 Wall Inlet (h=6m, row=0.75) ← 上游铁棒（BP2a 实例此 Inlet 悬空，BP2b 接 BP2a 输出）
   - 蓝图内 belt 沿 col=4.75 竖井上行 → splitter manifold（直通余量 + 本蓝图自产合流；**RIP 不消耗铁棒**，铁棒只做直通+下游输出）
   - 自产铁棒（rod constructor 1F+2F 共 11 台 @230.91% 输出 381/min）→ merger 合流到上述 manifold
   - 末端 → 右 Wall Outlet (h=6m, row=0.75) → 下游
5. **螺丝反向贯穿 belt（关键，屋顶层 h=35m）**:
   - 右 Wall Inlet (h=35m, row=3) ← 下游螺丝（来自 BP3 或 BP2b）
   - 屋顶层内部 splitter（取本实例 3F RIP 所需 306/min 螺丝）→ lift-down 11m 到 3F 北侧进料巷 → 中央 splitter → 3 RIP in-1；余量继续反向 belt
   - 反向 belt 末端 → **左 Wall Outlet (h=35m, row=3)** → 给左边的 BP（BP2a 给 BP1 这段悬空；BP2b 给 BP2a 给 RIP 用）
6. **1F→2F**: 4m 地基 (8-12m)；**2F 9 台一次到位**（6 rod R6-R11 + 3 plate P6-P8），进料从中央 splitter manifold 取
7. **2F→3F**: 4m 地基 (20-24m)；**3F 3 台 RIP assembler 一次到位**（双输入：铁板 + 螺丝）
8. **3F 输入**:
   - 铁板：1F+2F plate 输出 → lift-out-top 上到 3F → 中央 splitter → 3 台 RIP in-0
   - 螺丝：第 5 步反向 belt 在屋顶 35m 处先水平引到目标 col，再下行 lift-down 11m 到 3F 北侧进料巷(24m) → 中央 splitter → 3 台 RIP in-1（先转后爬两段，§2-5）
9. **屋顶 (35-40m)**:
   - 6 条 Mk5 belt 直通 + 1 条螺丝反向贯穿 belt，7 条按 ~5m 子 cell 间距同层并排（§2-8）
   - B2 belt (y=8m) 处放 1 个 merger 注入（铁棒/RIP）
   - B5 belt (y=26m) 处放 1 个 merger 注入（mainNode 余量）
   - 2 个 lift-top（铁棒上行 → B2 merger，mainNode 上行 → B5 merger）
   - 螺丝反向 belt (y=36m, h=35m)：col≈2.5 splitter tap 306/min → lift-down 11m 进 3F RIP in-1
10. **Power Switch ×5**: 按上面"Power Switch 分网"表布置 Network A/B/C/D/E。**BP2a 蓝图实例**：T6 合上 A+B+C，D+E OFF；**BP2b 蓝图实例**：T6 全部 5 个 Switch OFF（仅作为铁锭/铁棒/螺丝直通管道）
11. **Power Shard（T6 阶段）**:
    - **BP2a**: P1-P4 各插 3 shard (216.25%)；R1-R11 各插 3 shard (230.91%)；RIP 1-3 各插 2 shard (170%)；共 4×3 + 11×3 + 3×2 = **51 shard**
    - **BP2b**: 22 台物理就位但 shard 槽全部空着

## Tier 7+ 启用流程（仅翻 Switch + 插 shard，不动结构 / 不动 belt）

| Tier | 操作 | 通电总数 (BP2a / BP2b / 合计) |
|---|---|---:|
| T7 | BP2a: 翻 D 部分 ON → P5/P6 各插 3 shard（+2 plate，RIP 维持 3 台不变）。BP2b: 翻 E 部分 ON → R1-R4 各插 3 shard（+4 rod）+ RIP 1 ON（第 4 台 RIP 由 BP2b 提供） | 20 / 5 / 25 |
| T8 | BP2a: 翻 D 继续 ON → P7 +1（RIP 维持 3 台）。BP2b: 翻 E 续 ON → R5-R7 (+3 rod) + RIP 2 ON（第 5 台 RIP 由 BP2b 提供） | 21 / 9 / 30 |
| T9 | BP2a: P8 ON (满 8 plate)，rod 总数微调到 10（关 1 台 R11 优化），RIP 维持 3 台。BP2b: 翻 E 满 ON → R8-R10 满 10 rod + RIP 维持 2 台；（矿场 belt 已 Mk5；T8/T9 需拆分槽位） | 21 / 12 / 33 |

> T7+ 启用流程仅涉及：(1) 翻 Power Switch；(2) 插 Power Shard；(3) 微调超频百分比。**不放任何新机器，不拉任何新 belt，不挪任何 lift**。

## 关键同轴对齐

- 3F RIP assembler 的螺丝输入端口(in-1) 必须 col 同轴对齐螺丝 lift-down 落点（屋顶 35m 反向 belt → 3F 北侧巷的垂直爬升相轴线），避免 R17 飞面
- BP2 蓝图的左 Wall Outlet h=35m 螺丝口与 BP1 右 Wall Inlet 不会续接（BP1 蓝图无 35m 螺丝口），自然悬空 ✓
- BP3 蓝图必须有**左 Wall Outlet h=35m**（螺丝出口）匹配 BP2b 右 Wall Inlet h=35m

## 验证

- [ ] **每副本 22 台机器全部物理放置**（包括 T6 不通电的 BP2a 4 台 plate + BP2b 全部 22 台）
- [ ] Belt manifold + lift 接到全部 22 台机器进出口（不只是 T6 通电的部分）
- [ ] BP2a + BP2b 各 5 个 Power Switch 一次建好；BP2a 合 A+B+C，D+E 关；BP2b 全 5 个关
- [ ] T6 仅 BP2a 通电机器插 shard（共 51 shard）；其余 22 + 4 = 26 台物理就位但 shard 槽空
- [ ] BP2a 紧贴 BP1 右侧；BP2b 紧贴 BP2a 右侧；BP3 紧贴 BP2b 右侧
- [ ] BP2 蓝图侧墙含 3 对集群内 Wall Mount（铁锭 4m / 铁棒 6m / 螺丝 35m **反向**屋顶层）
- [ ] 蓝图内有「螺丝右 Inlet → 左 Outlet」反向贯穿 belt（不进 BP2b 内部 RIP 的部分直通到 BP2a）
- [ ] BP2a 左 Outlet 螺丝口悬空（无 BP1 接收，正常）
- [ ] BP2a 左 Inlet 铁棒口悬空（BP1 不产铁棒，正常）
- [ ] BP3 蓝图必须有左 Wall Outlet h=35m 螺丝（让 BP2b 接收）
- [ ] 3F RIP 螺丝输入(in-1) 与屋顶 35m 反向 belt 的 lift-down 垂直爬升相同轴；lift-down 跨度 11m ≥ 4m 最小高度
- [ ] 屋顶 2 个 merger filter 正确（B2 = 铁棒+RIP，B5 = 铁板+铁棒+RIP mainNode）
- [ ] **T6 BP2b 全 Power Switch 关，仅作为直通管道**
- [ ] 矿场来料 belt 已升 Mk5；T8/T9 满载需按物料拆分槽位
