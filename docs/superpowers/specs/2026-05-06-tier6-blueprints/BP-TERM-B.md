# BP-TERM-B 终端汇流（后 13 mainNode + 1 共享 sink）

## 概要

- **集群**: 总线最末端（紧贴 BP-TERM-A 之后）
- **规格**: Mk2 单实例
- **建筑**: 13 个 Dim Depot Uploader + **1 个共享 awesome-sink** + 13 个 smart splitter + 1 个 merger（接收 BP-TERM-A + 本蓝图共 26 路 overflow）
- **作用**: 26 mainNode 中的**后 13 个**送入位面仓 + **唯一共享 sink** 兜底所有 26 mainNode 的 overflow

> ⚠ **共享 sink 设计依据**：26 个 Uploader 持续向位面仓传送，溢流速率远低于 mainNode 总产能。1 个 sink @ 250% 超频（≈150/min）即可消化绝大多数场景溢流；若位面研究升级到高级，Uploader 容量更大，溢流极少触发。
>
> ⚠ **架构修正历史**：原方案有「重油残渣 sink」+ 26 sink 1:1。后修正为残渣本地处理 + sink 共享。awesome-sink 实际尺寸 **16m × 13m × 24m**（不是早期记错的 4×6×4），1:1 配比 26 sink 占地 5,408m² 远超单 Mk2 1,600m²，必须共享。

## 物料 I/O

**输入**：
- **B5 终端总线** ← BP-TERM-A 末端 splitter 树剩余 14 路（13 路 mainNode + 1 备用）
- **左 Wall Inlet (h=8m)** ← BP-TERM-A 右 Wall Outlet（13 路 overflow merger 汇流 belt）

**输出**：
- 13 个 Dim Depot Uploader → 位面仓（玩家 build gun 调用）
- **1 个共享 awesome-sink @ 250%** ← 接收 26 路 overflow merger 汇流（13 路本蓝图 + 13 路 BP-TERM-A 来）

## 13 mainNode 分配（后半批）

| # | mainNode | 流量 (T6) | Tier 7+ 流量 |
|---|---|---:|---:|
| 14 | 电机 | 5 | 12.5 |
| 15 | 模块化框架 | 2 | 19.5 |
| 16 | 包裹工业梁 | 6 | 23.5 |
| 17 | 重型模块框架 | 2 | 3.5 |
| 18 | 电脑 | 2.5 | 28 |
| 19 | 石英晶体 | 22.5 | 187 |
| 20 | 硅土 | 37.5 | 690 |
| 21 | 快速线 | 60 | 1384 |
| 22 | AI 限制器 | 5 | 14.75 |
| 23 | 晶体振荡器 | 1 | 9 |
| 24 | 高速连接器 | 3.75 | 18 |
| 25 | 重生 SAM | 30 | 200 |
| 26 | SAM 波动器 | 10 | 10 |
| **合计** | | **187/min** | **2620/min** |

> 石油焦 234/min（BP9 副产）已在 BP9 内部就地 sink，**不进 BP-TERM-B**。
> Tier 7+ 时硅土 + 快速线 流量极大，需要拆为 2-3 个 Uploader 并联（每个吃 < 780 Mk5 容量）。

## 楼层占用

| 层 | 高度 | 内容 |
|---|---|---|
| 1F | 0-12m | 13 Uploader + 13 smart splitter + 1 merger (26 路 overflow 汇流) + 中央 splitter 树 (B5 → 14 路) |
| 1F-2F | 0-24m | **共享 awesome-sink 16×13×24m**（占地 col=3.5-5 row=2-3.6 区域，跨 1F+2F 高度）|
| 2F | 16-32m | T7+ 备用 Uploader 槽位（铝壳/RCU/超级计算机/涡轮电机/融合模块/冷却系统/神经处理器/叠加振荡器/虚构三角）— 仅 sink 占用区之外 |
| 屋顶 | 35-40m | B1-B6 直通 + B5 splitter 子树 |

## 1F 平面（0-12m，按实际比例）

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │ U14   U15   U16   U17   U18                      │  Row 0:
        │┌──┐  ┌──┐  ┌──┐  ┌──┐  ┌──┐                      │  5 Uploader (5×10m)
 4      ││  │  │  │  │  │  │  │  │  │   B5 splitter 树     │  电机/模框/包裹梁
        │└──┘  └──┘  └──┘  └──┘  └──┘   1→14 路下到此处   │  HMF/电脑
 8      │ sp    sp    sp    sp    sp                       │
        │━━━━━━━ overflow merger belt 来自 BP-TERM-A ━━━━━│  ← 左 Wall Inlet h=8m
12      │ U19   U20   U21   U22   U23                      │
        │┌──┐  ┌──┐  ┌──┐  ┌──┐  ┌──┐  ┌──────────────┐   │  Row 1: 5 Uploader
16      ││  │  │  │  │  │  │  │  │  │  │              │   │  + 共享 sink (右下角)
        │└──┘  └──┘  └──┘  └──┘  └──┘  │  AWESOME     │   │
20      │ sp    sp    sp    sp    sp   │  Sink 共享   │   │
        │━━━━━━━ overflow merger ━━━━━━│  16×13m      │   │  sink 跨 1F-2F 高度 (0-24m)
24      │ U24   U25   U26              │   24m H      │   │
        │┌──┐  ┌──┐  ┌──┐              │              │   │  Row 2: 3 Uploader
28      ││  │  │  │  │  │              │  接收所有    │   │
        │└──┘  └──┘  └──┘              │  26 路       │   │
32      │ sp    sp    sp               │  overflow    │   │
        │━━━━━━ overflow merger ━━━━━━━│  汇流 →      │   │
36      │  splitter cascade 1→3→9→14   │  back in-0   │   │
        │  (B5 进料 14 路下到 1F)       └──────────────┘   │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

> **共享 sink** 占 col=3.5-5 row=2-3.6（16×13m），高度 0-24m（跨 1F+2F vertical 占用）。
> 26 个 smart splitter 各 priority=Uploader / overflow→merger，13 路本蓝图 + 13 路 BP-TERM-A 来料 = 26 路全部 merger 汇流到共享 sink。

## smart splitter filter 配置（13 路）

| 路 | mainNode | filter |
|---|---|---|
| 14 | 电机 | motor |
| 15 | 模块化框架 | modular-frame |
| 16 | 包裹工业梁 | encased-industrial-beam |
| 17 | 重型模块框架 | heavy-modular-frame |
| 18 | 电脑 | computer |
| 19 | 石英晶体 | quartz-crystal |
| 20 | 硅土 | silica |
| 21 | 快速线 | quickwire |
| 22 | AI 限制器 | ai-limiter |
| 23 | 晶体振荡器 | crystal-oscillator |
| 24 | 高速连接器 | high-speed-connector |
| 25 | 重生 SAM | reanimated-sam |
| 26 | SAM 波动器 | sam-fluctuator |

## 共享 sink 连接路由

```
本蓝图 13 个 smart splitter overflow → 1F merger A → 共享 sink in-0 (back)
                                          ↑
BP-TERM-A 13 个 splitter overflow → 左 Wall Inlet (h=8m) → 1F merger B → merger A
```

26 路 → 多级 merger 汇流 → 1 个 belt → sink in-0

## 屋顶总线层（35-40m）

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │ ◯ B1 ══════════════════════════════════════ ◯   │  B1-B6 直通到右边界悬空
 8      │ ◯ B2 ══════════════════════════════════════ ◯   │  (无生产，BP-TERM 末端)
16      │ ◯ B3 ══════════════════════════════════════ ◯   │
20      │ ◯ B4 ══════════════════════════════════════ ◯   │
24      │ ◯ B5 ═══[14 路 belt 来自 BP-TERM-A splitter]   │
        │                            │                   │
28      │                       lift-bot ↓ 到 1F          │
        │                                                  │
32      │ ◯ B6 ══════════════════════════════════════ ◯   │  B6 也悬空 (石油焦在 BP9)
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

## 建造步骤

1. **1F (0-12m)**:
   - row=0 col=0-4 摆 5 Uploader (U14-18) + 5 smart splitter (各 filter)
   - row=1.5 col=0-3.5 摆 5 Uploader (U19-23) + 5 splitter
   - row=3 col=0-2.5 摆 3 Uploader (U24-26) + 3 splitter
   - col=3.5-5 row=2-3.6 留出 16×13m 给共享 sink
   - 中央 col=0-3 row=4 splitter cascade (1→14) 接 B5 来料
2. **共享 sink** (1F+2F 跨高 0-24m, col=3.5-5 row=2-3.6)：
   - 装 3 power shard 超频到 250%（处理量 ~150/min）
   - in-0 (back) 接 26 路 overflow merger 汇流 belt
3. **B5 进料**:
   - BP-TERM-A 屋顶做 1→27 splitter 树，前 13 路下 A 1F，剩 14 路 belt 继续右贯穿
   - 进入 BP-TERM-B 屋顶后下 lift-bot 到 1F splitter cascade 二级
   - 14 路接 13 个 Uploader smart splitter（剩 1 路备用悬空）
4. **overflow merger 汇流**:
   - 本蓝图 13 个 smart splitter overflow output → 1F 主 merger → sink
   - BP-TERM-A 13 路 overflow → 左 Wall Inlet (h=8m) → 同 merger
   - 26 路 → 多级 merger（merger 4 进 1 出，需要 ~6-8 个 merger 级联）→ sink in-0
5. **B6 末端**: 直通悬空（无 splitter 无 sink，石油焦已在 BP9 处理）
6. **2F (16-32m)**: 9 个 Tier 7+ 备用 Uploader 槽位（避开 sink 占用区 col=3.5-5）
7. **屋顶 (35-40m)**: 6 belt 直通 + B5 lift-bot 到 1F

## Tier 7+ 扩容点

| Tier | 新增 mainNode (B 占位) |
|---|---|
| T7 | 铝壳 + RCU + 超级计算机 → 2F slots 1-3 |
| T8 | 涡轮电机 + 融合模块 + 冷却系统 → 2F slots 4-6 |
| T9 | 神经处理器 + 叠加振荡器 + 虚构三角 → 2F slots 7-9 |

T9 总数 BP-TERM-A 16 + BP-TERM-B 22 = 38（含 1 个备用 slot）= **37 mainNode**。石油焦 sink 在 BP9 处理，不计入。

如 9 个 2F 槽位不够（sink 占用 col=3.5-5），启用 BP-TERM-C 第 3 实例（紧贴 BP-TERM-B 末）。

## 验证

- [ ] 13 mainNode 全部接 Uploader
- [ ] **唯一共享 sink** 在 col=3.5-5 row=2-3.6（占地 16×13m）+ 跨 1F+2F (0-24m 高度)
- [ ] sink 装 3 power shard @ 250%
- [ ] 26 路 overflow（13 本 + 13 BP-TERM-A 来）通过 merger 树汇流到 sink in-0
- [ ] B5 splitter 树覆盖所有 26 mainNode（A 13 + B 13）
- [ ] **B6/B1-B4 在 BP-TERM-B 内无 splitter/sink**（直通悬空）
- [ ] 左 Wall Inlet (h=8m) 与 BP-TERM-A 右 Wall Outlet 对齐（接 overflow 汇流 belt）
- [ ] 2F 槽位避开 sink 占用区（col=0-3.5 可用）
