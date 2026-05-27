# BP14 重型模块框架 + 电脑 (C6)

## 概要

- **集群**: C6 装配（紧贴 BP13 之后）
- **规格**: Mk2 **3 实例**（BP14a + BP14b + BP14c，每实例 2 manufacturer × 2 层，因为 manufacturer 20×22m 占地大）
- **机器**: **6 manufacturer 一次物理建造到位**（BP14a 1F HMF + 2F 电脑 = 2 台；BP14b 1F+2F 各 1 电脑 = 2 台；BP14c 1F+2F 各 1 电脑 = 2 台）
- **激活时间线**（仅翻 Power Switch + 插 Power Shard，不动结构）:
  - T6 → 2 台通电（BP14a 1F HMF + BP14b 1F 电脑）
  - T7 → 4 台通电（+BP14a 2F 电脑 + BP14c 1F 电脑）
  - T8 → 5 台通电（+BP14b 2F 电脑）
  - T9 → 6 台通电（+BP14c 2F 电脑，满载）
- **产能**: T6 HMF 2/min + 电脑 2.5/min / T9 HMF 2/min + 电脑 12.5/min

> **核心设计原则**：**6 台 manufacturer 在 T6 阶段就全部摆好 + belt/manifold/电网/Power Switch 全部接好**。后续升 Tier 时**不重新放机器、不重新拉 belt**——只需 (1) 翻对应 Power Switch (2)（如需要）插 Power Shard (3) 调超频百分比。

## 机器超频清单（T6，Plan C ≤250%）

| 配方 | 物理 | T6 通电 | 超频 | 单台产能 (/min) | Power Shard/通电台 |
|---|---:|---:|---:|---:|---:|
| heavy-modular-frame (manufacturer) | 1 | **1** | 100.0% | 2.0 | 0 |
| computer (manufacturer) | 5 | **1** | 100.0% | 2.5 | 0 |
| **合计 (T6)** | 6 | 2 | — | HMF 2 + 电脑 2.5 = **4.5** | **0** |

> T6 时未通电的 4 台 manufacturer（BP14a 2F、BP14b 2F、BP14c 1F+2F）：物理建好、belt 接好、shard 槽**空着**、Power Switch **关**，完全不耗电不产出。<br>
> T9 满载 6 台均 100%（电脑配方无需超频），**0 Power Shard 总需求**（manufacturer 满载已能覆盖 T9 需求）。

## 物料 I/O

| 方向 | 物料 | 流量 (T6/T9) | 路径 |
|---|---|---|---|
| **HMF 输入**（manufacturer 4 槽）| | | |
| 输入 | 模块化框架 | 10 / 10 | **集群内部** ← BP13 右 Wall Outlet (h=4m) |
| 输入 | 包裹工业梁 | 10 / 10 | **集群内部** ← BP13 (h=8m) |
| 输入 | 钢管 | 40 / 40 | **屋顶 B3** ← BP5 → smart splitter |
| 输入 | 螺丝 | 240 / 240 | **屋顶 B2** ← BP3 → smart splitter |
| **电脑 输入**（manufacturer 3 槽 + 1 空）| | | |
| 输入 | 电路板 | 10 / 50 | **屋顶 B4** ← BP8 → splitter |
| 输入 | 线缆 | 20 / 100 | **屋顶 B4** ← BP7 → splitter |
| 输入 | 塑料 | 50 / 250 | **屋顶 B4** ← BP9 → splitter |
| **输出** | | | |
| 输出 | HMF → B5 终端 | 2 / 2 | 屋顶 merger → B5 |
| 输出 | 电脑 → B5 终端 | 2.5 / 12.5 | 屋顶 merger → B5 |

**屋顶总线接入**:
- 取自 B2 (螺丝 240)、B3 (钢管 40)、B4 (电路板 50 + 线缆 100 + 塑料 250 = 400 T9 上限)
- 注入 B5 (HMF 2 + 电脑 12.5 = 14.5 mainNode T9)

## 楼层占用

| 实例 | 层 | 物理 | T6 通电 |
|---|---|---:|---:|
| **BP14a** | 1F HMF manufacturer | 1 | **1** |
| **BP14a** | 2F 电脑 manufacturer | 1 | 0 |
| **BP14b** | 1F 电脑 manufacturer | 1 | **1** |
| **BP14b** | 2F 电脑 manufacturer | 1 | 0 |
| **BP14c** | 1F 电脑 manufacturer | 1 | 0 |
| **BP14c** | 2F 电脑 manufacturer | 1 | 0 |
| **小计** | | **6** | **2** |

> manufacturer 20m × 22m × 12m，单实例 1F+2F 各 1 台（1F 0-12m + 4m 地基 + 2F 16-28m，剩 7m 给屋顶）。
> T9 满载 6 台 = 2 台 × 3 实例（每实例 1F+2F 各 1 台 manufacturer）。

## 俯视图（按实际比例，每实例每层独立）

**比例约定**（同 BP02）：1 字符 = 1m 横向；1 行 = 2m 纵向；蓝图 40×40m = 40 字符 × 20 行。

**图例**：
- `*` 后缀 = T6 通电；无 `*` = T7+ Power Switch 关（物理已建，不耗电不产出）
- `v` = front 输出 / `^` = facing=north 时 out-0 朝北
- `20x22` = 20m 宽 × 22m 长
- **facing=north 端口反转**：4 输入朝南 (row=2.75)，1 输出朝北 (row=0)

### BP14a 1F (0-12m): 1 HMF manufacturer — T6 通电

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌───────────────────┐                            │
        ││         ^         │  out-0 -> roof merger (B5) │
 4      ││  HMF* manufacturer│  HMF 2/min mainNode        │
        ││  20m W x 22m L    │  T6 ON (Network A)         │
 8      ││  facing=north     │                            │
        ││  port reversed    │                            │
12      ││                   │  in 0-3 (south, row=2.75): │
        ││                   │    in-0 screw 240          │
16      ││                   │    in-1 steel-pipe 40      │
        ││                   │    in-2 modular-frame 10   │
20      ││                   │    in-3 encased-beam 10    │
        ││  v  v  v  v       │                            │
24      │└───────────────────┘                            │
        │ screw + pipe via lift-bot from roof B2/B3 split │
28      │ frame + beam via left-wall inlet h=4/8m ← BP13  │
        │                                                 │
32      │ HMF out-0 (row=0) >> lift-out-top to roof merger│
36      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- 1 台 HMF manufacturer，**T6 通电**（Network A）
- 4 输入 + 1 输出 belt + lift 全部 T6 一次接好

### BP14a 2F (16-28m): 1 电脑 manufacturer — T6 Power Switch 关

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌───────────────────┐                            │
        ││         ^         │  out-0 -> roof merger (B5) │
 4      ││ Computer manufact.│  computer 2.5/min          │
        ││  20m W x 22m L    │  T6 Switch OFF             │
 8      ││  facing=north     │  → T7 翻 ON (Network B)    │
        ││  port reversed    │                            │
12      ││                   │  in 0-3 (south, row=2.75): │
        ││                   │    in-0 circuit-board 10   │
16      ││                   │    in-1 cable 20           │
        ││                   │    in-2 plastic 50         │
20      ││                  │    in-3 EMPTY (3 ingredient)│
        ││  v  v  v  .       │                            │
24      │└───────────────────┘                            │
        │ all 3 inputs via lift-up from 1F B4 split → in  │
28      │ in-3 lift omitted (no fourth ingredient)        │
        │                                                 │
32      │ computer out-0 >> lift-out-top to roof merger   │
36      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- 1 台电脑 manufacturer **物理建造完整**，T6 阶段 Power Switch **关**
- Belt manifold + lift 一次性接到 3 槽 in-0/1/2（in-3 空，电脑配方无第 4 物料）
- 通电节奏：T7 翻 Network B Switch ON

### BP14b 1F (0-12m): 1 电脑 manufacturer — T6 通电

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌───────────────────┐                            │
        ││         ^         │  out-0 -> roof merger (B5) │
 4      ││ Computer* manufact│  computer 2.5/min          │
        ││  20m W x 22m L    │  T6 ON (Network A)         │
 8      ││  facing=north     │                            │
        ││  port reversed    │                            │
12      ││                   │  in 0-3 (south, row=2.75): │
        ││                   │    in-0 circuit-board 10   │
16      ││                   │    in-1 cable 20           │
        ││                   │    in-2 plastic 50         │
20      ││                  │    in-3 EMPTY               │
        ││  v  v  v  .       │                            │
24      │└───────────────────┘                            │
        │ 3 inputs via lift-bot from roof B4 prog split   │
28      │                                                 │
32      │ computer out-0 >> lift-out-top to roof merger   │
36      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- 1 台电脑 manufacturer，**T6 通电**（Network A）

### BP14b 2F (16-28m): 1 电脑 manufacturer — T6 Power Switch 关

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌───────────────────┐                            │
        ││         ^         │  out-0 -> roof merger (B5) │
 4      ││ Computer manufact.│  computer 2.5/min          │
        ││  20m W x 22m L    │  T6 Switch OFF             │
 8      ││  facing=north     │  → T8 翻 ON (Network C)    │
        ││  port reversed    │                            │
12      ││                   │  in 0-3 (south, row=2.75): │
        ││                   │    in-0 circuit-board 10   │
16      ││                   │    in-1 cable 20           │
        ││                   │    in-2 plastic 50         │
20      ││                  │    in-3 EMPTY               │
        ││  v  v  v  .       │                            │
24      │└───────────────────┘                            │
        │ 3 inputs via lift-up from 1F B4 split           │
28      │                                                 │
32      │ computer out-0 >> lift-out-top to roof merger   │
36      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- 1 台电脑 manufacturer **物理建造完整**，T6 Power Switch **关** → T8 翻 ON（Network C）

### BP14c 1F (0-12m): 1 电脑 manufacturer — T6 Power Switch 关

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌───────────────────┐                            │
        ││         ^         │  out-0 -> roof merger (B5) │
 4      ││ Computer manufact.│  computer 2.5/min          │
        ││  20m W x 22m L    │  T6 Switch OFF             │
 8      ││  facing=north     │  → T7 翻 ON (Network B)    │
        ││  port reversed    │                            │
12      ││                   │  in 0-3 (south, row=2.75): │
        ││                   │    in-0 circuit-board 10   │
16      ││                   │    in-1 cable 20           │
        ││                   │    in-2 plastic 50         │
20      ││                  │    in-3 EMPTY               │
        ││  v  v  v  .       │                            │
24      │└───────────────────┘                            │
        │ 3 inputs via lift-bot from roof B4 prog split   │
28      │                                                 │
32      │ computer out-0 >> lift-out-top to roof merger   │
36      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- 1 台电脑 manufacturer **物理建造完整**，T6 Power Switch **关** → T7 翻 ON（Network B）

### BP14c 2F (16-28m): 1 电脑 manufacturer — T6 Power Switch 关

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌───────────────────┐                            │
        ││         ^         │  out-0 -> roof merger (B5) │
 4      ││ Computer manufact.│  computer 2.5/min          │
        ││  20m W x 22m L    │  T6 Switch OFF             │
 8      ││  facing=north     │  → T9 翻 ON (Network D)    │
        ││  port reversed    │                            │
12      ││                   │  in 0-3 (south, row=2.75): │
        ││                   │    in-0 circuit-board 10   │
16      ││                   │    in-1 cable 20           │
        ││                   │    in-2 plastic 50         │
20      ││                  │    in-3 EMPTY               │
        ││  v  v  v  .       │                            │
24      │└───────────────────┘                            │
        │ 3 inputs via lift-up from 1F B4 split           │
28      │                                                 │
32      │ computer out-0 >> lift-out-top to roof merger   │
36      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- 1 台电脑 manufacturer **物理建造完整**，T6 Power Switch **关** → T9 翻 ON（Network D，满载）

### 屋顶 (35-40m): B1-B6 + 3 splitter + 1 merger（每实例屋顶相同）

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │ o B1 ──────────────────────────────────────── o │
 4      │ o B2 ───[smart split: screw 240]──────────── o  │
 8      │ o B3 ───[smart split: steel-pipe 40]──────── o  │
12      │ o B4 ───[prog split: CB + Cable + Plastic]── o  │
16      │ o B5 ───[merger << lift-top mainNode]────── o   │
20      │ o B6 ──────────────────────────────────────── o │
24      │                                                 │
28      │ BP14a lift-bot: screw / pipe to 1F HMF in-0/1   │
        │ BP14b/c lift-bot: CB+cable+plastic to 1F in-0-2 │
32      │ lift-top: HMF 2 + computer 2.5~12.5 (按通电数)  │
36      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- BP14a 取 B2 (240 螺丝) + B3 (40 钢管) + 集群内部模框 10 + 包裹梁 10
- BP14b/c 取 B4 (电路板 + 线缆 + 塑料，按通电台数分配)
- B5 merger 注入：T6 = 4.5 / T9 = 14.5 mainNode

## Power Switch 分网

把 6 台 manufacturer 拆 4 个独立 Power Network，由 4 个 Power Switch 控制。**4 个 Switch 全部 T6 一次安装好**，只是 T6 阶段只合 Network A。

| 网 | 范围 | 数量 | T6 状态 | 升级触发 |
|---|---|---:|---|---|
| Network A | BP14a 1F HMF + BP14b 1F 电脑 | 2 | **ON** | — |
| Network B | BP14a 2F 电脑 + BP14c 1F 电脑 | 2 | OFF | T7 翻 ON |
| Network C | BP14b 2F 电脑 | 1 | OFF | T8 翻 ON |
| Network D | BP14c 2F 电脑 | 1 | OFF | T9 翻 ON |

> Power Switch 物理位置建议放每实例屋顶 col=4.5（merger 区角落），4 个 Switch 各自就近，方便玩家在场内一眼区分。

## 建造步骤

1. **框架（×3 实例）**：BP14a/b/c 各 5×5 cell × 4 cell 高（40×40×32m），紧贴排列
2. **BP14a 1F (0-12m)**：放 1 台 HMF manufacturer（col 0-2.5 / row 0-2.75，facing=north）
3. **BP14a 1F belt**:
   - 螺丝 240：屋顶 B2 splitter → lift-bot → in-0
   - 钢管 40：屋顶 B3 splitter → lift-bot → in-1
   - 模框 10 + 包裹梁 10：左 Wall Inlet (h=4m + h=8m) ← BP13 集群内 → manifold → in-2 + in-3
   - HMF out-0 (row=0) → lift-out-top → 屋顶 merger 注 B5
4. **BP14a 1F 地基**：y=12m 铺 4m 厚地基
5. **BP14a 2F (16-28m)**：放 1 台电脑 manufacturer（同布局，facing=north）
6. **BP14a 2F belt**:
   - 电路板 + 线缆 + 塑料：从 1F B4 splitter lift-up → manifold → in-0/1/2（in-3 空）
   - out-0 → lift-out-top → 屋顶 merger 注 B5
7. **BP14b/c 类似**：1F+2F 各 1 台电脑 manufacturer，4 路输入全部来自 B4（screw/pipe 不需要）
8. **屋顶 (35-40m)**：6 条 Mk4 直通 belt + 3 splitter (B2/B3/B4) + 1 merger (B5)
9. **Power Switch ×4**：按上面"Power Switch 分网"表布置 Network A/B/C/D；T6 只合 A，B/C/D 全部 OFF
10. **Power Shard（T6 阶段）**：**0 shard**（电脑/HMF 100% 即可，无需超频）；shard 槽全部留空

## Tier 7+ 启用流程（仅翻 Switch + 插 shard，不动结构 / 不动 belt）

| Tier | 操作 | 通电总数 | 电脑产能 |
|---|---|---:|---:|
| T7 | 翻 Network B Switch ON → BP14a 2F + BP14c 1F 各启电脑（100% 无 shard）| 4 | 7.5 |
| T8 | 翻 Network C Switch ON → BP14b 2F 启电脑（100% 无 shard）| 5 | 10.0 |
| T9 | 翻 Network D Switch ON → BP14c 2F 启电脑（100% 无 shard），**电脑满载 5×2.5=12.5** | 6 | 12.5 |

> T9 时 B4 来料升级：电路板 50 / 线缆 100 / 塑料 250 — 屋顶 B4 程序分流器流量上限需按 Mk5 (780/min) 预留。

## 多实例侧墙续接

BP14a/b/c 在机器层**无跨实例短 belt**（HMF 和电脑两条产线独立）。所有进料从屋顶 B2/B3/B4 取，所有出料注 B5。

集群内部短 belt 仅 1 处：**BP13 → BP14a**（模框 + 包裹梁），通过 BP14a 蓝图的左 Wall Inlet 接收。

蓝图侧墙集群内 mount（机器层）：

| 高度 | 物料 | BP14a 左 Wall | BP14a 右 Wall | BP14b/c |
|---|---|---|---|---|
| h=4m row=2.5 | 模块化框架 | **Inlet** ← BP13 | 悬空 | 不需要 |
| h=8m row=3.5 | 包裹工业梁 | **Inlet** ← BP13 | 悬空 | 不需要 |

> BP14a 紧贴 BP13 右侧，BP14b 紧贴 BP14a 右侧，BP14c 紧贴 BP14b 右侧。模框/包裹梁仅供 BP14a 的 HMF 消耗（10+10），BP14b/c 跑电脑不需要这两路。

## 验证

- [ ] **6 台 manufacturer 全部物理放置**（包括 T6 不通电的 4 台：BP14a 2F、BP14b 2F、BP14c 1F+2F）
- [ ] Belt manifold + lift 接到全部 6 台 in-0/1/2(/3)（不只是 T6 通电的 2 台）
- [ ] 4 个 Power Switch 一次建好，Network A 合上，B/C/D 断开
- [ ] T6 阶段 **0 Power Shard**（manufacturer 100% 即可）；shard 槽全部留空
- [ ] manufacturer facing=north（输入朝南 / 输出朝北）
- [ ] HMF 4 输入正确（螺丝 240 / 钢管 40 / 模框 10 / 包裹梁 10）
- [ ] 电脑 4 槽 3 用 1 空（电路板 / 线缆 / 塑料 + 空）
- [ ] B2 上 240 螺丝来自 BP3（B1 取走 350，剩 B2 还能取 240）
- [ ] B4 程序分流器分配 CB+Cable+Plastic（T9 上限 50+100+250=400/min，Mk5 belt 容量预留）
- [ ] B5 merger 出口 mainNode（T6 4.5 / T9 14.5）
- [ ] 3 实例 BP14a/b/c 紧贴排列，BP14a 左 Wall Inlet (h=4m+8m) 对齐 BP13 右 Wall Outlet
