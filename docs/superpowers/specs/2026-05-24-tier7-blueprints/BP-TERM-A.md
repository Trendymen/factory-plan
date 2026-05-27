# BP-TERM-A 终端汇流（前 13 mainNode，无 sink）

## 概要

- **集群**: 总线尾端（紧贴 BP15 之后）
- **规格**: Mk2 单实例
- **建筑**: 13 个 Dim Depot Uploader + 13 个 smart splitter（每 mainNode 1 个，filter=该物料，priority=Uploader / overflow→ overflow belt）
- **作用**: 26 mainNode 中的**前 13 个**送入位面仓；**overflow 不在本蓝图 sink，全部走 belt 反向到 BP-TERM-B 共享 sink**

> **本蓝图无生产机器**；所有 Uploader / smart splitter / belt / lift / wall mount T6 一次建造到位，**不涉及 Power Switch**（Uploader 0 W 耗电）。T7+ 扩容仅需在 2F 预留槽位补建 Uploader+splitter，不动现有结构。

## 物料 I/O

**输入**：
- 屋顶 **B5 终端总线** ← BP15 末端（396/min 26 mainNode 混合流）

**输出**：
- 13 个 Dim Depot Uploader → 位面仓（玩家 build gun 直接调用）
- 13 路 overflow belt → 1F merger → 右 Wall Outlet (h=8m) → BP-TERM-B 共享 sink

**屋顶 B1-B4 + B6 直通**（在 BP-TERM-A 内不分流，继续到 BP-TERM-B）

## 13 mainNode 分配（前半批）

| # | mainNode | 流量 (T6) | Tier 7+ 流量 |
|---|---|---:|---:|
| 1 | 铁板 | 20 | 362 |
| 2 | 铁棒 | 15 | 734 |
| 3 | 强化铁板 | 5 | 57 |
| 4 | 钢梁 | 15 | 86 |
| 5 | 钢管 | 20 | 210 |
| 6 | 铜板 | 10 | 428 |
| 7 | 电线 | 30 | 1455 |
| 8 | 线缆 | 30 | 568 |
| 9 | 混凝土 | 15 | 156 |
| 10 | 塑料 | 20 | 1134 |
| 11 | 橡胶 | 20 | 92 |
| 12 | 转子 | 4 | 29 |
| 13 | 定子 | 5 | 30 |
| **合计** | | **209** | **5341** |

> Tier 7+ 流量翻 25x，单 Uploader 入口 Mk5 容量 780/min 可能不够（电线 1455 超）→ **T7+ 时拆为 2 个 Uploader 并联**（每个吃 727）。

## 楼层占用

| 层 | 高度 | 内容 |
|---|---|---|
| 1F | 0-12m | 中央分流器树 + 13 Uploader + 13 smart splitter + 1 merger（汇流 13 路 overflow → 右 Wall Outlet）|
| 2F | 16-32m | T7+ 备用 Uploader 槽位（铝壳/铝包铝板/RCU/超级计算机/散热器/时间晶体）|
| 屋顶 | 35-40m | B1-B6 直通 + B5 上的 1→27 splitter 树（前 13 路下 1F，其余 14 路继续到 BP-TERM-B）|

## 俯视图（按实际比例，每层独立）

### 1F (0-12m): 13 Uploader + 13 smart splitter + overflow merger

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐            │
        ││ U1 │  │ U2 │  │ U3 │  │ U4 │  │ U5 │            │
 4      ││5x10│  │5x10│  │5x10│  │5x10│  │5x10│            │
        │└────┘  └────┘  └────┘  └────┘  └────┘            │
 8      │ sp     sp      sp      sp      sp                │
        │── overflow belt >> right Wall Outlet h=8m ──────│
12      │┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐            │
        ││ U6 │  │ U7 │  │ U8 │  │ U9 │  │ U10│            │
16      ││5x10│  │5x10│  │5x10│  │5x10│  │5x10│            │
        │└────┘  └────┘  └────┘  └────┘  └────┘            │
20      │ sp     sp      sp      sp      sp                │
        │── overflow merger belt ─────────────────────────│
24      │┌────┐  ┌────┐  ┌────┐    [B5 splitter cascade]   │
        ││ U11│  │ U12│  │ U13│    1->3->9->27 (in roof)   │
28      ││5x10│  │5x10│  │5x10│    13 paths down to 1F     │
        │└────┘  └────┘  └────┘    14 paths to BP-TERM-B   │
32      │ sp     sp      sp                                │
        │ 13 smart splitters: priority=Uploader, ovf>>merge│
36      │                                                  │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- U1-U13：Dim Depot Uploader 5m W × 10m L × 8m H
- sp：smart splitter（filter=该路 mainNode 物料），紧贴 Uploader back
- overflow merger belt：13 路 overflow 汇流 → 右 Wall Outlet (h=8m) → BP-TERM-B 共享 sink
- B5 splitter cascade 在屋顶做 1→27 树，前 13 路下到 1F 各 Uploader，剩 14 路右贯穿到 BP-TERM-B

### 2F (16-32m): T7+ 备用 Uploader 槽位

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │ T7+ reserve slots (do NOT place Uploader at T6)  │
 8      │   slot 1: aluminum-casing                        │
        │   slot 2: alclad-aluminum-sheet                  │
16      │   slot 3: heat-sink                              │
        │   slot 4: time-crystal                           │
24      │   slot 5: radio-control-unit                     │
        │   slot 6: supercomputer                          │
32      │                                                  │
        │ lift-bot/top access holes preserved for T7+      │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

### 屋顶 (35-40m): B5 splitter cascade + B1-B4/B6 直通

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │ o B1 ────────────────────────────────────── o   │
 4      │ o B2 ────────────────────────────────────── o   │
 8      │ o B3 ────────────────────────────────────── o   │
12      │ o B4 ────────────────────────────────────── o   │
16      │ o B5 ───[1->27 splitter cascade tree]────── o   │
20      │   13 paths >> 1F Uploaders                  │   │
        │   14 paths >> right Outlet >> BP-TERM-B     │   │
24      │ o B6 ────────────────────────────────────── o   │
28      │                                                 │
32      │ B1-B4 + B6 pass-through to BP-TERM-B            │
36      │ B5 splitter tree consumes 13/27 paths here      │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- B5 屋顶 1→3→9→27 三级 cascade splitter 树
- 27 路输出中前 13 路 lift-bot 下到本蓝图 1F；剩 14 路右贯穿到 BP-TERM-B

## 建造步骤

1. **1F (0-12m)**:
   - row=0 (col=0-4) 摆 5 个 Uploader (U1-U5)
   - row=0.75 (col=0-4) 紧贴 5 个 smart splitter (filter 配置见下表)
   - row=1.5-3.5 摆 8 个 Uploader (U6-U13) + 8 个 smart splitter
   - col=0-4 row=4 中央 splitter cascade（1→3→9→27 树）
   - 13 路 overflow belt 汇到 1 个 merger → 右 Wall Outlet (col=5, h=8m, row=2)
2. **B5 → 屋顶 splitter 树**: 屋顶 B5 belt 在 col=2.5 处不动，**屋顶上**做 1→27 splitter cascade（不下 1F）
   - 27 路输出中前 13 路 lift-bot 下到 1F 各对应 Uploader+splitter
   - 剩 14 路 belt 继续右贯穿到 BP-TERM-B 屋顶
3. **smart splitter filter 配置**（重要）：13 个 splitter 各 filter 1 个 mainNode 物料
4. **2F (16-32m)**: 预留 6 对槽位（不放建筑，T7+ 加铝包铝板/散热器/时间晶体等）
5. **屋顶 (35-40m)**: 6 belt 直通 + B5 上的 1→27 splitter cascade（共 4 级）
6. **Power Switch**: 不需要（Uploader 0 W 耗电）

## smart splitter filter 配置（13 路）

| 路 | mainNode | smart splitter filter |
|---|---|---|
| 1 | 铁板 | iron-plate |
| 2 | 铁棒 | iron-rod |
| 3 | 强化铁板 | reinforced-iron-plate |
| 4 | 钢梁 | steel-beam |
| 5 | 钢管 | steel-pipe |
| 6 | 铜板 | copper-sheet |
| 7 | 电线 | wire |
| 8 | 线缆 | cable |
| 9 | 混凝土 | concrete |
| 10 | 塑料 | plastic |
| 11 | 橡胶 | rubber |
| 12 | 转子 | rotor |
| 13 | 定子 | stator |

## Tier 7+ 扩容点

| Tier | 新增 mainNode（A 占位）|
|---|---|
| T7 | 铝包铝板 → 2F slot 1 |
| T8 | 散热器 → 2F slot 2 |
| T9 | 时间晶体 → 2F slot 3 |

> BP-TERM-A 共 13（T6）+ 3（T7-9）= **16 mainNode**，剩 21 个全在 BP-TERM-B（含共享 sink）。如 21 太多可启用 BP-TERM-C。

## 验证

- [ ] 13 个 mainNode 全 Uploader 接 belt（不漏）
- [ ] **本蓝图无 sink**（所有 overflow 汇流走右 Wall Outlet → BP-TERM-B 共享 sink）
- [ ] smart splitter priority 配置正确（Uploader 优先、overflow 默认）
- [ ] B5 在屋顶做 1→27 splitter，13 路下 1F + 14 路 belt 继续右贯穿
- [ ] 2F 6 个 Uploader 槽位预留（不放建筑）
- [ ] B1-B4/B6 屋顶直通无分流
- [ ] **位面存储研究升到合适等级**（默认 50 容量 → 升级 5000 容量）
- [ ] 右 Wall Outlet (h=8m) overflow belt 与 BP-TERM-B 左 Wall Inlet 对齐
