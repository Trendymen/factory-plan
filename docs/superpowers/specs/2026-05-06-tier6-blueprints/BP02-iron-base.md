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

## C1 集群完整路由（关键！）

C1 物理顺序（左→右）: **`BP1 | BP2a | BP2b | BP3`**

```
[BP1]─铁锭→[BP2a]─铁棒→[BP2b]─铁棒→[BP3]
              ↑                       │
              └─────螺丝 276 反向←────┘
                  (跨 BP2b 直通贯穿)
```

**BP2 蓝图必须自带反向贯穿 belt**（左↔右），否则 BP3 螺丝无法到 BP2a 的 RIP。

## 物料 I/O

| 方向 | 物料 | 流量 | 路径（BP2a 视角）| 路径（BP2b 视角）|
|---|---|---|---|---|
| 输入 | 铁锭 | 640/min | **左 Wall Inlet (h=24m)** ← BP1 右 Outlet | 左 Wall Inlet ← BP2a 右 Outlet（剩余）|
| **直通输出** | 铁锭剩余 | — | 右 Wall Outlet → BP2b 左 Inlet | 右 Wall Outlet → 悬空（C1 末端）|
| 输出 | 铁棒 (生产) | 224 给 BP3 | 右 Wall Outlet (h=6m) → BP2b 左 Inlet | 右 Wall Outlet → BP3 左 Inlet |
| **直通输出** | 铁棒 | — | — | 左 Inlet ← BP2a → 蓝图内 belt → 右 Outlet → BP3 |
| 输入 | 螺丝（**反向**）| 276/min 给 RIP | **右 Wall Inlet (h=28m)** ← BP2b 左 Outlet | 右 Wall Inlet ← BP3 左 Outlet |
| **反向直通** | 螺丝 | — | — | 右 Inlet ← BP3 → 蓝图内反向 belt → 左 Outlet → BP2a |
| 输出 | 铁板 → RIP 内部 | 153 | 蓝图内 lift 1F→3F | — |
| 输出 | 铁板 → B5 终端 | 20 | 屋顶 merger → B5 | — |
| 输出 | 铁棒 → B2 (C6) | 140 | 屋顶 merger → B2 | — |
| 输出 | 铁棒 → B5 终端 | 15 | 屋顶 merger → B5 | — |
| 输出 | RIP → B2 (BP13/BP15) | 18 + 2.5 | 屋顶 merger → B2 | — |
| 输出 | RIP → B5 终端 | 5 | 屋顶 merger → B5 | — |

> T6 阶段 BP2a 满载 18 台，**BP2b Power Switch 全关**——BP2b 仅作为**铁锭/铁棒/螺丝直通管道**存在（蓝图内 belt 物理连接好但不消化）。T7+ 启用 BP2b 内部机器后才开始消化。

**屋顶总线接入**: 注入 B2 (铁棒 140 + RIP 20.5)、B5 (mainNode 40)

## 集群内部跨蓝图侧墙 mount 配置（BP2 蓝图必备）

每个 BP2 实例侧墙在**机器层**有 3 对独立 Wall Mount：

| 高度 | 物料 | 左 Wall (col=0) | 右 Wall (col=5) | 蓝图内连接 |
|---|---|---|---|---|
| **h=24m row=2** | 铁锭 | **Inlet** ← 上游 | **Outlet** → 下游 | 内部 splitter manifold tap 部分铁锭给本实例 9+6=15 台 constructor，剩余直通 |
| **h=6m row=2.5** | 铁棒 | **Inlet** ← 上游（仅 BP2b 用，BP2a 收来自 BP1 的"无铁棒"）| **Outlet** → 下游 | 内部 splitter manifold tap 部分铁棒给本实例 RIP，剩余直通 + 本实例新产铁棒合流 |
| **h=28m row=3** | 螺丝（**反向**）| **Outlet** → 上游（给左边 BP）| **Inlet** ← 下游（来自右边 BP）| 内部 splitter manifold tap 部分螺丝给本实例 3F RIP，剩余反向直通到左 Outlet |

**关键**：相同蓝图设计，左右各有 6 对侧墙 mount（屋顶 6 belt + 机器层 3 belt）= 共 9 对。Auto Connect 时所有 9 对自动续接相邻蓝图。

> **BP2 副本（BP2a/b）实际使用差异**：
> - **BP2a**：左 Inlet 收来自 BP1 的铁锭（无铁棒上游，铁棒 Inlet 悬空）；左 Outlet 螺丝输出给左边的 BP1（无效，悬空，但 mount 必须存在）
> - **BP2b**：左 Inlet 收来自 BP2a 的铁锭+铁棒（双 belt）；右 Outlet 给 BP3 铁棒+剩余铁锭；右 Inlet 收来自 BP3 的螺丝→反向 belt 直通到左 Outlet 给 BP2a

## 楼层占用

| 层 | 高度 | 内容 | 数量 |
|---|---|---|---:|
| 1F | 0-8m | 4 plate + 5 rod constructor 混排 | 9 |
| 2F | 12-20m | 6 rod constructor | 6 |
| 3F | 24-32m | 3 RIP assembler | 3 |
| 屋顶 | 35-40m | B1-B6 + merger × 2 + lift × 多 | — |

> 单 Mk2 实例只装 ½ 配额，剩余建在 BP2b 副本中。下表数字是单实例。

## 俯视图（按实际比例，每层独立 — 视觉正方形）

**比例约定**：
- 横向：**1 字符 = 1m**
- 纵向：**1 行 = 2m**（补偿 monospace 字符宽高比 1:2）
- 蓝图 40×40m → **40 字符宽 × 20 行高**，渲染为视觉正方形
- 每 cell (8×8m) = 8 字符宽 × 4 行高

**机器实际尺寸** → ASCII 占位：

| 机器 | 实际 | ASCII 占位（W × H） |
|---|---|---|
| smelter | 6m × 9m | 6 字符 × 4-5 行 |
| foundry | 8m × 9m | 8 字符 × 4-5 行 |
| constructor | 8m × 10m | 8 字符 × 5 行 |
| assembler | 10m × 15m | 10 字符 × 7-8 行 |
| manufacturer | 20m × 22m | 20 字符 × 11 行 |
| refinery | 10m × 20m | 10 字符 × 10 行 |

### 1F (0-8m): 4 plate + 5 rod constructor = 9 台

> **盒内仅单宽字符**（Unicode 盒形 ┌─┐│└┘ 单宽 OK；避开 CJK 宽字符 `━ ═ ↓ ← →` + 中文）。中文注释在盒外右侧。
> 图例：`v` = 输出 front (south)；`──` = belt；尺寸 8x10 = 8m 宽 × 10m 长

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌───────┐┌───────┐┌───────┐┌───────┐             │
        ││  P1   ││  P2   ││  P3   ││  P4   │  T7+ R6     │
 4      ││plate  ││plate  ││plate  ││plate  │  reserve    │
        ││ 8x10  ││ 8x10  ││ 8x10  ││ 8x10  │             │
 8      ││  v    ││  v    ││  v    ││  v    │             │
        │└───────┘└───────┘└───────┘└───────┘             │
12      │─────────── plate collect belt h=2m ─────────────│
        │┌───────┐┌───────┐┌───────┐┌───────┐┌───────┐    │
        ││  R1   ││  R2   ││  R3   ││  R4   ││  R5   │    │
16      ││ rod   ││ rod   ││ rod   ││ rod   ││ rod   │    │
        ││ 8x10  ││ 8x10  ││ 8x10  ││ 8x10  ││ 8x10  │    │
20      ││  v    ││  v    ││  v    ││  v    ││  v    │    │
        │└───────┘└───────┘└───────┘└───────┘└───────┘    │
24      │─────────── rod collect belt h=2m ───────────────│
        │ IN  h=4m  row=2.5: iron-ingot   (BP1 > BP2a)    │
28      │ IN  h=6m  row=2.5: iron-rod     (BP2a > BP2b)   │
        │ OUT h=4m  row=2.5: iron-ingot   (>> downstream) │
32      │ OUT h=6m  row=2.5: iron-rod     (>> downstream) │
        │ OUT h=28m row=3:   screw (REVERSE << upstream)  │
36      │ splitter manifold + lift access area            │
        │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- P1-P4：plate constructor 8m W × 10m L × 8m H（铁板）
- R1-R5：rod constructor 8m W × 10m L × 8m H（铁棒）
- T7+ R6 reserve：col=4 row=0 预留第 6 台 plate constructor（Tier 7+ 满载时启用）
- IN h=4m / h=6m：左 Wall Inlet（铁锭/铁棒进料）
- OUT h=28m row=3：左 Wall Outlet（螺丝**反向**给上游 BP，详见 BP2 反向 belt 设计）

### 2F (12-20m): 6 rod constructor

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌───────┐┌───────┐┌───────┐                      │
        ││  R6   ││  R7   ││  R8   │                      │
 4      ││ rod   ││ rod   ││ rod   │ T7+ R12-R15 reserve  │
        ││ 8x10  ││ 8x10  ││ 8x10  │ col 3-4 row 0/1.5    │
 8      ││  ↓    ││  ↓    ││  ↓    │              ◯       │
        │└───────┘└───────┘└───────┘                      │
12      │─────────── rod collect belt h=14m ──────────────│
        │┌───────┐┌───────┐┌───────┐                      │
        ││  R9   ││  R10  ││  R11  │                      │
16      ││ rod   ││ rod   ││ rod   │                      │
        ││ 8x10  ││ 8x10  ││ 8x10  │                      │
20      ││  v    ││  v    ││  v    │                      │
        │└───────┘└───────┘└───────┘                      │
24      │─────────── rod collect belt h=14m ──────────────│
        │ iron-ingot in:  lift-bot from 1F splitter       │
28      │ iron-rod  out:  lift-out-top to roof B2 merger  │
        │                                                 │
32      │                                                 │
36      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- R6-R11：6 rod constructor（T6 全部启用）
- T7+ R12-R15 预留：col=3-4 row=0/1.5 各加 1 台，T9 满载共 6 台保持不变（仅 1F 多 4 台 R2-R5 → R6-R11，2F 6 台不变；T7+ 总数 18+ 见 BP2 概要表）

### 3F (24-32m): 3 RIP assembler

```
        col=0       col=1       col=2       col=2       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌─────────┐┌─────────┐┌─────────┐                │
        ││  RIP 1  ││  RIP 2  ││  RIP 3  │                │
 4      ││assembler││assembler││assembler│                │
        ││ 10x15m  ││ 10x15m  ││ 10x15m  │ T7+ RIP 4-5    │
 8      ││in: plate││in: plate││in: plate│ reserve        │
        ││  +screw ││  +screw ││  +screw │ col 3-4        │
12      ││  out v  ││  out v  ││  out v  │                │
        │└─────────┘└─────────┘└─────────┘                │
16      │─────────── RIP output belt h=26m ───────────────│
        │ iron-plate in: 1F plate >> lift-out-top to 3F   │
20      │ screw in:      28m reverse belt >> lift-bot 3F  │
        │    >> central splitter >> 3 RIP in-0 + in-1     │
24      │                                                 │
        │ RIP out >> lift-out-top >> roof B2/B5 merger    │
28      │    B2: RIP 20.5/min  +  B5: mainNode 5/min      │
        │                                                 │
32      │                                                 │
36      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- RIP assembler 10m W × 15m L × 8m H，双输入 (back: in-0 铁板 + in-1 螺丝)，单输出 (front)
- T7+ 满载需 5 RIP（T6 3 + T7-9 渐次加 2），col 3-4 row 0 预留 2 个槽位

### 4F: 28m 反向螺丝贯穿 belt 层

28m 高度（3F 顶 24m 之上 4m，3F 与屋顶之间）。仅 1 条贯穿 belt，盒内空：

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │                                                 │
 8      │                                                 │
12      │ LEFT Outlet o─────────────────────o RIGHT Inlet │
16      │     h=28m row=2.5 reverse-screw belt            │
20      │     splitter taps RIP 138/min for this instance │
24      │                                                 │
32      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- 左 Wall Outlet (h=28m)：螺丝**反向**给上游 BP（BP2a 给 BP1 此 Outlet 悬空；BP2b 给 BP2a 用此输出）
- 右 Wall Inlet (h=28m)：螺丝从下游来（BP2a 接 BP2b；BP2b 接 BP3 螺丝）
- 蓝图内 splitter 取本实例 3 台 RIP 所需 138/min 螺丝，余量直通到左 Outlet

### 屋顶 (35-40m): B1-B6 + 2 merger

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │ o B1 ────────────────────────────────────── o   │
 4      │ o B2 ───[merger << lift-top iron-rod+RIP]── o   │
 8      │ o B3 ────────────────────────────────────── o   │
12      │ o B4 ────────────────────────────────────── o   │
16      │ o B5 ───[merger << lift-top mainNode]────── o   │
20      │ o B6 ────────────────────────────────────── o   │
24      │                                                 │
28      │ B7/B8 reserved (Tier 7+ slots, idle in T6)      │
32      │                                                 │
36      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- B1-B6：6 条 Mk4 belt 横穿，左 Wall Inlet → 右 Wall Outlet
- B2 merger 注入：铁棒 140/min + RIP 20.5/min（来自 1F+2F+3F 上行 lift）
- B5 merger 注入：铁板 20 + 铁棒 15 + RIP 5 = 40/min mainNode
- B7/B8 物理建造但 T6 空跑（Tier 7+ 铝链/超级计算机预留）

### 侧视剖面（east-west，沿 col=2 切面）

```
40m ┌──────────────────────────────────────┐
    │ Roof Bus 35-40m: 6 belt + 2 merger   │
35m ├──────────────────────────────────────┤
    │   reserved (32-35m)                  │
32m ├──────────────────────────────────────┤
    │  3F  RIP assembler x3 (24-32m)       │
24m ├──────────────────────────────────────┤
    │   4m foundation (20-24m)             │
20m ├──────────────────────────────────────┤
    │  2F  rod constructor x6 (12-20m)     │
12m ├──────────────────────────────────────┤
    │   4m foundation (8-12m)              │
 8m ├──────────────────────────────────────┤
    │  1F  4 plate + 5 rod con (0-8m)      │
 0m └──────────────────────────────────────┘
```

> 此为简化层叠示意图（仅展示垂直分层），非俯视。每个分层完整布局见上方 1F/2F/3F 各小节。

> 屋顶总线层细节已在前述「屋顶 (35-40m)」小节给出，此处不再重复（旧版有重复段已删除）。
> 屋顶 2 个 merger（一个注 B2、一个注 B5）+ 2 条 lift-top（铁棒/RIP 从 2F+3F 上行）。

## 建造步骤（BP2 蓝图，BP2a/b 完全相同复制）

1. **1F (0-8m)**: 9 constructor（4 plate + 5 rod）按俯视图布置
2. **1F belt 收集**:
   - plate 输出 → row=2 主 belt（铁板）
   - rod 输出 → row=2 主 belt 第二条（铁棒）
3. **铁锭进料 + 直通**:
   - 左 Wall Inlet (h=24m, row=2) ← 上游来料
   - lift-bot 下到 1F → splitter manifold（取本实例 15 台 constructor 所需 ~640/min）
   - splitter manifold 末端 lift-out-top 回到 24m → 右 Wall Outlet (h=24m, row=2) → 下游
4. **铁棒进料 + 直通 + 自产合流**:
   - 左 Wall Inlet (h=6m, row=2.5) ← 上游铁棒（BP2a 实例此 Inlet 悬空，BP2b 接 BP2a 输出）
   - 蓝图内 belt 上行到 24m → splitter manifold（取本实例 RIP 螺丝消耗+本蓝图自产合流）
   - 自产铁棒（rod constructor 1F+2F 输出 281/min）→ merger 合流到上述 manifold
   - 末端 → 右 Wall Outlet (h=6m, row=2.5) → 下游
5. **螺丝反向贯穿 belt（关键）**:
   - 右 Wall Inlet (h=28m, row=3) ← 下游螺丝（来自 BP3 或 BP2b）
   - 内部 splitter（取本实例 3F RIP 所需 ~138/min）→ 余量继续反向 belt
   - 反向 belt 末端 → **左 Wall Outlet (h=28m, row=3)** → 给左边的 BP（BP2a 给 BP1 这段悬空；BP2b 给 BP2a 给 RIP 用）
6. **1F→2F**: 4m 地基 (8-12m)；2F 6 台 rod，进料从中央 splitter manifold 取
7. **2F→3F**: 4m 地基 (20-24m)；3F 3 台 RIP assembler（双输入：铁板 + 螺丝）
8. **3F 输入**:
   - 铁板：1F plate 输出 → lift-out-top 上到 3F → 中央 splitter → 3 台 RIP in-0
   - 螺丝：第 5 步反向 belt 在 28m 处下行 lift-bot 到 3F → 中央 splitter → 3 台 RIP in-1
9. **屋顶 (35-40m)**:
   - 6 条 Mk4 belt 直通
   - row=1 处放 1 个 merger 注入 B2（铁棒/RIP）
   - row=4 处放 1 个 merger 注入 B5（mainNode 余量）
   - 2 个 lift-top（铁棒上行 → B2 merger，mainNode 上行 → B5 merger）
10. **Power Switch**: T6 BP2a 全开 18 台；BP2b 全关（BP2b 仅作为铁锭/铁棒/螺丝直通管道）

## 关键同轴对齐

- 3F RIP assembler 的螺丝输入端口必须 col 同轴对齐 28m 反向 belt 主轴（避免 R17 飞面）
- BP2 蓝图的左 Wall Outlet h=28m 螺丝口与 BP1 右 Wall Inlet 不会续接（BP1 蓝图无 28m 螺丝口），自然悬空 ✓
- BP3 蓝图必须有**左 Wall Outlet h=28m**（螺丝出口）匹配 BP2b 右 Wall Inlet h=28m

## Tier 7+ 扩容点

| Tier | 增量 |
|---|---|
| T7 | +6 (=4 plate diff)+4 (=4 rod diff)+1 (=1 RIP diff) → BP2a 6+8+2，BP2b 0+7+2 |
| T8 | 7+18+5 = 30 总，BP2a 7+10+3，BP2b 0+8+2 |
| T9 | 8+20+5 = 33 满载，BP2a/b 均开足 |

## 验证

- [ ] BP2a 紧贴 BP1 右侧；BP2b 紧贴 BP2a 右侧；BP3 紧贴 BP2b 右侧
- [ ] BP2 蓝图侧墙含 3 对集群内 Wall Mount（铁锭 24m / 铁棒 22m / 螺丝 28m **反向**）
- [ ] 蓝图内有「螺丝右 Inlet → 左 Outlet」反向贯穿 belt（不进 BP2b 内部 RIP 的部分直通到 BP2a）
- [ ] BP2a 左 Outlet 螺丝口悬空（无 BP1 接收，正常）
- [ ] BP2a 左 Inlet 铁棒口悬空（BP1 不产铁棒，正常）
- [ ] BP3 蓝图必须有左 Wall Outlet h=28m 螺丝（让 BP2b 接收）
- [ ] 3F RIP 螺丝输入与 28m 反向 belt 同轴
- [ ] 屋顶 2 个 merger filter 正确（B2 = 铁棒+RIP，B5 = 铁板+铁棒+RIP mainNode）
- [ ] **T6 BP2b 全 Power Switch 关，仅作为直通管道**
