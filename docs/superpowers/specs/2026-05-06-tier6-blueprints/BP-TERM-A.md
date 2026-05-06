# BP-TERM-A 终端汇流（前 13 mainNode）

## 概要

- **集群**: 总线尾端（紧贴 BP15 之后）
- **规格**: Mk2 单实例
- **建筑**: 13 个 Dim Depot Uploader + 13 个 awesome-sink + 多 splitter
- **作用**: 26 mainNode 的**前 13 个**送入位面存储，满后 sink overflow

## 物料 I/O

**输入**：
- 屋顶 **B5 终端总线** ← BP15 末端（396/min 26 mainNode 混合流）

**输出**：
- 13 个 Dim Depot Uploader → 位面仓（玩家 build gun 直接调用）
- 13 个 awesome-sink overflow → 长期赚 ticket

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
| 1F | 0-12m | 中央分流器树 + 13 Uploader + 13 sink |
| 2F | 16-32m | T7+ 备用 Uploader 槽位（铝壳/铝包铝板/RCU/超级计算机/散热器/时间晶体）|
| 屋顶 | 35-40m | B1-B6 直通 + B5 末端 splitter 树 |

## 1F 平面（0-12m）

```
       col=0   col=1   col=2   col=3   col=4   col=5
      ┌──────┬──────┬──────┬──────┬──────┐
r=0   │┌──┐  │┌──┐  │┌──┐  │┌──┐  │┌──┐  │  Row 0: 5 Uploader（Dim Depot）
      ││U1│  ││U2│  ││U3│  ││U4│  ││U5│  │  5m × 10m × 8m (≈industrial-storage)
r=1   ││  │  ││  │  ││  │  ││  │  ││  │  │  in-0 back
      │└──┘  │└──┘  │└──┘  │└──┘  │└──┘  │
      ├──────┼──────┼──────┼──────┼──────┤
r=2   │┌──┐  │┌──┐  │┌──┐  │┌──┐  │┌──┐  │  Row 1: 5 sink（awesome-sink）
      ││S1│  ││S2│  ││S3│  ││S4│  ││S5│  │  4m × 6m × 4m
      │└──┘  │└──┘  │└──┘  │└──┘  │└──┘  │
      ├──────┼──────┼──────┼──────┼──────┤
r=3   │┌──┐ ┌─┴──── 中央分流器树 ─────┐ │  4 级 splitter cascade
      ││S│  │  1→3→9→27 输出 (24 active)│  │
      │└──┘ │                          │ │
r=4   │     └──────────────────────────┘ │
      └──────┴──────┴──────┴──────┴──────┘
```

> 13 mainNode 用前 13 输出槽（剩 14 槽给 BP-TERM-B 的 13 + 1 备用）。
> 实际 BP-TERM-A 内只放 13 对 Uploader+sink。

## Uploader + sink 单元布局

每对 Uploader+sink 占 ~5×10m + 4×6m = 50+24 = 74 m²，13 对 ≈ 1000 m²，加分流器树 ~200 m² ≈ 1200 m² < 1600 m² (单 Mk2)。

```
[B5 main belt] ─── smart splitter (filter=item) ───┬─→ Uploader (item) → 位面仓
                                                   │
                                                   └─→ awesome-sink (item) ← overflow
```

**关键**：smart splitter 第一输出 = Uploader（**优先送 Uploader**），第二输出 = sink（仅当 Uploader 满才走）。

## 屋顶总线层（35-40m）

```
B1 ═════════════════════════════════════════> B1 直通到 BP-TERM-B
B2 ═════════════════════════════════════════> B2 直通到 BP-TERM-B
B3 ═════════════════════════════════════════> B3 直通到 BP-TERM-B
B4 ═════════════════════════════════════════> B4 直通到 BP-TERM-B
B5 ═══[programmable splitter cascade 1→3→9→27]═══┐
                                                  ↓
                                          13 路下到 1F Uploader+sink 树
                                          其余 14 路继续到 BP-TERM-B
B6 ═════════════════════════════════════════> B6 直通到 BP-TERM-B
```

> B5 在 BP-TERM-A 屋顶 1→3→9 一级 splitter 把 mainNode 分到前 13 路（Uploader 树）；剩 14 路走 belt 继续到 BP-TERM-B 屋顶继续分。
>
> 实际上为了简单：可以把整个 1→3→9→27 树**全部放在 BP-TERM-A 屋顶**（27 路输出），然后用 belt 把"BP-TERM-B 那 13 路"走集群内短 belt 接到 BP-TERM-B Uploader。但**更实用方案**：BP-TERM-A 只负责前 13 路 Uploader/sink，B5 继续流到 BP-TERM-B 处理剩下的。

## 建造步骤

1. **1F (0-12m)**:
   - row=0 摆 5 个 Uploader 一字排
   - row=1 摆 5 个 sink 一字排
   - row=2 摆 5 个 Uploader（共 10 台）
   - row=3 摆 5 个 sink（共 10 台）
   - col=0-2 row=4 中央 splitter 树 + 剩余 3 对 Uploader+sink
2. **B5 → splitter 树**: 屋顶 B5 belt 在 col=2.5 处 lift-bot 下到 1F → splitter 1→3→9→27 cascade
3. **每路输出**: 27 路中前 13 路接 smart splitter → Uploader + sink
4. **剩余 14 路输出**:
   - 13 路用 belt 拉到右 Wall Outlet (col=5, h=2m, 13 个 Wall Outlet 一排) → BP-TERM-B 接
   - 1 路留作 Tier 7+ 扩容
5. **2F (16-32m)**:
   - 预留 6 对 Uploader+sink 槽位（铝壳/铝包铝板/RCU/超级计算机/散热器/时间晶体）
   - **不必预先放 Uploader/sink 建筑**——T7+ 解锁后再补
   - 留 lift-bot/lift-top 通孔
6. **屋顶 (35-40m)**: 6 belt 直通 + B5 上的 splitter 一级 cascade
7. **Power Switch**: 不需要（Uploader/sink 0 W 耗电）

## Tier 7+ 扩容点

| Tier | 新增 mainNode（A 占位）|
|---|---|
| T7 | 铝包铝板 → 2F slot 1 |
| T8 | 散热器 → 2F slot 2 |
| T9 | 时间晶体 → 2F slot 3 |

> BP-TERM-A 共 13（T6）+ 3（T7-9）= **16 mainNode**，剩 21 个全在 BP-TERM-B。如 21 太多可启用 BP-TERM-C。

## 验证

- [ ] 13 个 mainNode 全 Uploader 接 belt（不漏）
- [ ] smart splitter Uploader 第一优先级（满后才 sink）
- [ ] B5 splitter 配置为前 13 路 filter（剩 14 路 catch-all 流到 BP-TERM-B）
- [ ] 2F 6 个 Uploader 槽位预留（不放建筑）
- [ ] B1-B4/B6 直通无分流（仅 B5 分流）
- [ ] **位面存储研究升到合适等级**（默认 50 容量 → 升级 5000 容量）
