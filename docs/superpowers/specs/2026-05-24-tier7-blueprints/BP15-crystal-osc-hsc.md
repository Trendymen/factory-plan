# BP15 晶体振荡器 + 高速连接器 (C6)

## 概要

- **集群**: C6 装配（紧贴 BP14 之后，C6 末端，整厂最后生产蓝图）
- **规格**: Mk2 **3 实例**（BP15a 跑晶振 / BP15b 跑 HSC / BP15c 跑晶振），每实例 1F+2F = 2 台 manufacturer
- **机器**: **6 manufacturer 一次物理建造到位**（BP15a 2 晶振 + BP15b 2 HSC + BP15c 2 晶振）
- **激活时间线**（仅翻 Power Switch + 插 Power Shard，不动结构）:
  - T6 → 2 台通电（BP15a 1F 晶振 + BP15b 1F HSC）
  - T7 → 3 台通电（+BP15a 2F 晶振）
  - T8 → 5 台通电（+BP15b 2F HSC + BP15c 1F 晶振）
  - T9 → 6 台通电（+BP15c 2F 晶振，满载 4+2=6）
- **产能 T6**: 晶体振荡器 1/min · 高速连接器 3.75/min
- **产能 T9**: 晶体振荡器 4/min · 高速连接器 7.5/min

> **核心设计原则**：**6 台 manufacturer 在 T6 阶段就全部摆好 + belt/manifold/电网/Power Switch 全部接好**。后续升 Tier 时**不重新放机器、不重新拉 belt**——只需 (1) 翻对应 Power Switch (2) 插 Power Shard（晶振/HSC 均 100% 不超频，无需 shard）。

## 机器超频清单（T6，Plan C ≤250%）

| 配方 | 物理 | T6 通电 | 超频 | 单台产能 (/min) | Power Shard/通电台 |
|---|---:|---:|---:|---:|---:|
| crystal-oscillator (manufacturer) | 4 | **1** | 100.0% | 1.0 | 0 |
| high-speed-connector (manufacturer) | 2 | **1** | 100.0% | 3.75 | 0 |
| **合计 (T6)** | 6 | 2 | — | 1 + 3.75 = **4.75** | **0** |

> T6 时未通电的 4 台 manufacturer：物理建好、belt 接好、shard 槽不需要、Power Switch **关**，完全不耗电不产出。<br>
> T9 满载 4 晶振 + 2 HSC = 4 × 1.0 + 2 × 3.75 = **11.5/min**，全程 100% 无需 shard。

## 物料 I/O

| 方向 | 物料 | 流量 (T6/T9) | 路径 |
|---|---|---|---|
| **晶振 输入** | | | |
| 输入 | 强化铁板 | 2.5 / 10 | **屋顶 B2** ← BP2 → splitter |
| 输入 | 线缆 | 14 / 56 | **屋顶 B4** ← BP7 → splitter |
| 输入 | 石英晶体 | 18 / 72 | **屋顶 B6** ← BP10 → splitter |
| **HSC 输入** | | | |
| 输入 | 快速线 | 210 / 420 | **屋顶 B6** ← BP10 → splitter |
| 输入 | 线缆 | 37.5 / 75 | **屋顶 B4** ← BP7 → splitter |
| 输入 | 电路板 | 3.75 / 7.5 | **屋顶 B4** ← BP8 → splitter |
| **输出** | | | |
| 输出 | 晶体振荡器 → B5 终端 | 1 / 4 | 屋顶 merger → B5 |
| 输出 | 高速连接器 → B5 终端 | 3.75 / 7.5 | 屋顶 merger → B5 |

**屋顶总线接入**:
- 取自 B2 (强化铁板 T9 10)、B4 (线缆 T9 131 + 电路板 T9 7.5)、B6 (石英 T9 72 + 快速线 T9 420 = 492)
- 注入 B5 (T9 4 + 7.5 = 11.5 mainNode)

> ⚠ B6 已 Mk5：T7 现在 228 = 29% Mk5 ✓；T9 满载 492/min = 63% Mk5 ✓。B6 在 BP15 段全 Tier 周期内容量充裕。

## 楼层占用

| 实例 | 层 | 高度 | 内容 | 物理台数 | T6 通电 |
|---|---|---|---|---:|---:|
| **BP15a** | 1F | 0-12m | 1 晶振 manufacturer | 1 | **1** |
| **BP15a** | 2F | 16-28m | 1 晶振 manufacturer | 1 | **0** (T7 ON) |
| **BP15b** | 1F | 0-12m | 1 HSC manufacturer | 1 | **1** |
| **BP15b** | 2F | 16-28m | 1 HSC manufacturer | 1 | **0** (T8 ON) |
| **BP15c** | 1F | 0-12m | 1 晶振 manufacturer | 1 | **0** (T8 ON) |
| **BP15c** | 2F | 16-28m | 1 晶振 manufacturer | 1 | **0** (T9 ON) |
| 屋顶 | 35-40m | B1-B6 6 条 Mk5 belt + splitter/merger | — | — | — |

> **T6 阶段**：BP15a 1F + BP15b 1F 通电（Network A1 + B1），其余 4 台 Power Switch **关**。所有 belt / lift / manifold / Power Switch 一次到位。

## 俯视图（按实际比例，每实例独立 — 视觉正方形）

**比例约定**：
- 横向：**1 字符 = 1m**
- 纵向：**1 行 = 2m**
- 蓝图 40×40m → 40 字符宽 × 20 行高

**机器实际尺寸** → ASCII 占位：

| 机器 | 实际 | ASCII 占位（W × H） |
|---|---|---|
| manufacturer | 20m × 22m | 20 字符 × 11 行 |

**图例**：
- `*` 后缀 = T6 通电；无 `*` = T7+ Power Switch 关（物理已建，不耗电不产出）
- `^` = front (north) 输出（facing=north 端口反转）
- `v` = back (south) 输入

> **facing=north 端口反转**：4 输入朝南 (row=2.75)，1 输出朝北 (row=0)。

### BP15a 1F (0-12m): 1 晶振 manufacturer — T6 通电

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌───────────────────┐                            │
        ││         ^         │  out-0 -> roof merger (B5) │
 4      ││ Crystal-Osc M1*   │  oscillator 1/min mainNode │
        ││  20m W x 22m L    │  T6 ON (Network A1)        │
 8      ││  facing=north     │                            │
        ││  port reversed    │                            │
12      ││                   │  in 0-3 (south, row=2.75): │
        ││                   │    in-0 RIP 2.5            │
16      ││                   │    in-1 cable 14           │
        ││                   │    in-2 quartz-crystal 18  │
20      ││                   │    in-3 EMPTY (3 ingredient)│
        ││  v  v  v  .       │                            │
24      │└───────────────────┘                            │
        │ RIP via lift-bot from roof B2 smart split       │
28      │ cable via lift-bot from roof B4 prog split      │
        │ quartz via lift-bot from roof B6 smart split    │
32      │                                                 │
        │ osc out-0 (row=0) >> lift-out-top to roof merger│
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- M1 (Crystal-Osc) T6 **通电**；100% 不超频
- 进料：屋顶 B2/B4/B6 → splitter → lift-bot → in-0/1/2（in-3 空，配方只 3 输入）
- 出料：out-0 (north, row=0) → lift-out-top → 屋顶 merger 注 B5

### BP15a 2F (16-28m): 1 晶振 manufacturer — T6 Power Switch 关

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌───────────────────┐                            │
        ││         ^         │  out-0 -> roof merger (B5) │
 4      ││ Crystal-Osc M2    │  T6 Switch OFF → T7 翻 ON  │
        ││  20m W x 22m L    │  (Network A2)              │
 8      ││  facing=north     │                            │
        ││  port reversed    │                            │
12      ││                   │  in 0-3 (south, row=2.75): │
        ││                   │    in-0 RIP 2.5            │
16      ││                   │    in-1 cable 14           │
        ││                   │    in-2 quartz-crystal 18  │
20      ││                   │    in-3 EMPTY              │
        ││  v  v  v  .       │  belt manifold 与 1F 共用  │
24      │└───────────────────┘  (lift-up 从 1F splitter)  │
        │                                                 │
28      │ T6 阶段：物理就位 / belt 接好 / Switch 关       │
        │ T7 翻 Network A2 ON → 晶振产能 1 → 2/min       │
32      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- M2：物理建造完整，T6 Power Switch **关**
- Belt manifold + lift 一次性接到 in-0/1/2（与 1F 共用同一进料 splitter，lift-up 上 2F）
- 通电节奏：T7 翻 Network A2 ON

### BP15b 1F (0-12m): 1 HSC manufacturer — T6 通电

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌───────────────────┐                            │
        ││         ^         │  out-0 -> roof merger (B5) │
 4      ││  HSC  M1*         │  HSC 3.75/min mainNode     │
        ││  20m W x 22m L    │  T6 ON (Network B1)        │
 8      ││  facing=north     │                            │
        ││  port reversed    │                            │
12      ││                   │  in 0-3 (south, row=2.75): │
        ││                   │    in-0 quickwire 210      │
16      ││                   │    in-1 cable 37.5         │
        ││                   │    in-2 circuit-board 3.75 │
20      ││                   │    in-3 EMPTY              │
        ││  v  v  v  .       │                            │
24      │└───────────────────┘                            │
        │ quickwire via lift-bot from roof B6 smart split │
28      │ cable + CB via lift-bot from roof B4 prog split │
        │                                                 │
32      │                                                 │
        │ HSC out-0 (row=0) >> lift-out-top to roof merger│
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- HSC M1 T6 **通电**；100% 不超频
- 出料：out-0 (north, row=0) → lift-out-top → 屋顶 merger 注 B5

### BP15b 2F (16-28m): 1 HSC manufacturer — T6 Power Switch 关

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌───────────────────┐                            │
        ││         ^         │  out-0 -> roof merger (B5) │
 4      ││  HSC  M2          │  T6 Switch OFF → T8 翻 ON  │
        ││  20m W x 22m L    │  (Network B2)              │
 8      ││  facing=north     │                            │
        ││  port reversed    │                            │
12      ││                   │  in 0-3 (south, row=2.75): │
        ││                   │    in-0 quickwire 210      │
16      ││                   │    in-1 cable 37.5         │
        ││                   │    in-2 circuit-board 3.75 │
20      ││                   │    in-3 EMPTY              │
        ││  v  v  v  .       │  belt manifold 与 1F 共用  │
24      │└───────────────────┘  (lift-up 从 1F splitter)  │
        │                                                 │
28      │ T6 阶段：物理就位 / belt 接好 / Switch 关       │
        │ T8 翻 Network B2 ON → HSC 产能 3.75 → 7.5/min  │
32      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- HSC M2：物理建造完整，T6 Power Switch **关**；T8 翻 ON

### BP15c 1F (0-12m): 1 晶振 manufacturer — T6 Power Switch 关

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌───────────────────┐                            │
        ││         ^         │  out-0 -> roof merger (B5) │
 4      ││ Crystal-Osc M1    │  T6 Switch OFF → T8 翻 ON  │
        ││  20m W x 22m L    │  (Network C1)              │
 8      ││  facing=north     │                            │
        ││  port reversed    │                            │
12      ││                   │  in 0-3 (south, row=2.75): │
        ││                   │    in-0 RIP 2.5            │
16      ││                   │    in-1 cable 14           │
        ││                   │    in-2 quartz-crystal 18  │
20      ││                   │    in-3 EMPTY              │
        ││  v  v  v  .       │                            │
24      │└───────────────────┘                            │
        │ 进料同 BP15a（取自屋顶 B2/B4/B6 续接 splitter） │
28      │                                                 │
        │ osc out-0 (row=0) >> lift-out-top to roof merger│
32      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- BP15c M1：物理建造完整，T6 Power Switch **关**；T8 翻 ON（HSC + 晶振同步扩容）

### BP15c 2F (16-28m): 1 晶振 manufacturer — T6 Power Switch 关

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌───────────────────┐                            │
        ││         ^         │  out-0 -> roof merger (B5) │
 4      ││ Crystal-Osc M2    │  T6 Switch OFF → T9 翻 ON  │
        ││  20m W x 22m L    │  (Network C2, 满载触发)    │
 8      ││  facing=north     │                            │
        ││  port reversed    │                            │
12      ││                   │  in 0-3 (south, row=2.75): │
        ││                   │    in-0 RIP 2.5            │
16      ││                   │    in-1 cable 14           │
        ││                   │    in-2 quartz-crystal 18  │
20      ││                   │    in-3 EMPTY              │
        ││  v  v  v  .       │  belt manifold 与 BP15c 1F │
24      │└───────────────────┘  共用                      │
        │                                                 │
28      │ T6 阶段：物理就位 / belt 接好 / Switch 关       │
        │ T9 翻 Network C2 ON → 全部 6 台满载 4+2=6      │
32      │                                                 │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- BP15c M2：物理建造完整，T6 Power Switch **关**；T9 翻 ON 满载

### 屋顶 (35-40m): B1-B6 + 3 splitter + 1 merger（每实例屋顶相同）

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │ o B1 ──────────────────────────────────────── o │
 4      │ o B2 ───[smart split: RIP T9 10]──────────── o  │
 8      │ o B3 ──────────────────────────────────────── o │
12      │ o B4 ───[prog split: cable 131 + CB 7.5 T9]── o │
16      │ o B5 ───[merger << lift-top mainNode T9 11.5] o │
20      │ o B6 ───[smart split: quartz 72 + qwire 420] o  │
24      │                                                 │
28      │ 实例 lift-bot 一次预留：M1 + M2 两路并行       │
        │ (1F 直喂 + lift-up 续喂 2F)                    │
32      │ lift-top: M1 (1F) + M2 (2F) 合到屋顶 merger    │
36      │ Splitter/merger 一次全装；T7+ 物料量自动增加  │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- B2/B4/B6 smart/prog splitter 按 T9 流量一次配好（T6 取较少不影响）
- B5 merger 注入：T6 4.75 → T9 11.5 mainNode

## Power Switch 分网

把 6 台 manufacturer 拆 6 个独立 Power Network，由 6 个 Power Switch 控制。**6 个 Switch 全部 T6 一次安装好**，只是 T6 阶段只合 Network A1 + B1。

| 网 | 范围 | 数量 | T6 状态 | 升级触发 |
|---|---|---:|---|---|
| Network A1 | BP15a 1F 晶振 M1 | 1 | **ON** | — |
| Network A2 | BP15a 2F 晶振 M2 | 1 | OFF | T7 翻 ON |
| Network B1 | BP15b 1F HSC M1 | 1 | **ON** | — |
| Network B2 | BP15b 2F HSC M2 | 1 | OFF | T8 翻 ON |
| Network C1 | BP15c 1F 晶振 M1 | 1 | OFF | T8 翻 ON |
| Network C2 | BP15c 2F 晶振 M2 | 1 | OFF | T9 翻 ON |

> Power Switch 物理位置建议每实例 2F 角落，2 个一组，方便玩家在场内一眼区分。

## 建造步骤

1. **框架**：3 个实例 BP15a/b/c，每实例 5×5 cell × 5 cell 高（40×40×40m）
2. **每实例 1F (0-12m)**：放 1 台 manufacturer，facing=north
   - BP15a/c：crystal-oscillator
   - BP15b：high-speed-connector
3. **每实例 1F 进料 belt + manifold + lift-bot**：从屋顶 splitter 接下来，喂 in-0/1/2（in-3 空）
4. **每实例 1F 出料**: out-0 (row=0) → lift-out-top → 屋顶 merger
5. **每实例 1F 地基**：y=12m 铺 4m 厚地基
6. **每实例 2F (16-28m)**：**同 1F 布局**放第 2 台 manufacturer（配方同 1F）
7. **每实例 2F belt + lift**：复制 1F 的进料/出料路径，lift-up 续接 1F manifold
8. **每实例 2F 地基**：y=28m 铺 4m 厚地基
9. **屋顶 (35-40m)**：每实例 6 条 Mk5 belt 直通 + B2/B4/B6 splitter + B5 merger，左右各嵌 Wall Mount
10. **B6 已 Mk5（780/min）**：T7 取 228 = 29% / T9 取 492 = 63% 均充裕，无需进一步升级
11. **Power Switch ×6**：按上面"Power Switch 分网"表布置 Network A1/A2/B1/B2/C1/C2；T6 只合 A1 + B1，其余全部 OFF
12. **Power Shard（T6 阶段）**：晶振 / HSC 全程 100% 不超频，**0 shard**

## Tier 7+ 启用流程（仅翻 Switch，不动结构 / 不动 belt / 无需 shard）

| Tier | 操作 | 通电总数 | 产能 (osc / HSC) |
|---|---|---:|---|
| T7 | 翻 Network A2 Switch ON → BP15a 2F 晶振 M2 加电 | 3 | 2 / 3.75 |
| T8 | 翻 Network B2 + C1 Switch ON → BP15b 2F HSC + BP15c 1F 晶振 加电 | 5 | 3 / 7.5 |
| T9 | 翻 Network C2 Switch ON → BP15c 2F 晶振 M2 加电；**B6 已 Mk5；T9 取 492 = 63% Mk5 ✓** | 6 | 4 / 7.5 |

> 全程**无需插 Power Shard**（所有机器 100% 运转）。Tier 升级只翻 Switch + 检查屋顶 B6 belt 等级。

## 多实例侧墙续接

BP15a/b/c 在机器层**无跨实例短 belt**（晶振和 HSC 各产线独立，进料全从屋顶取）。

蓝图侧墙集群内 mount（机器层）：**无**。BP15 仅有屋顶 6 belt mount。

> 3 实例物料完全独立，通过屋顶 B2/B4/B6 各自取料 → 通过屋顶 B5 各自输出 mainNode。

## 关键约束：B6 流量分配

B6 流入 BP15 共 T6 228 → T9 492（石英 72 + 快速线 420），是 B6 最大段。
- BP10 注入 B6: 铜金锭 74 + 铜板 25 → 99，被 BP10 自身取走（fix：BP10 取 99 后 = 0）
- BP10 注入 B6: 石英 72 + 快速线 420 = 492（**T9 新源**）+ 重油残渣 78（来自 BP9）= 570
- BP15 取走 T9 492，剩 78（残渣）→ BP-TERM-B sink

> T7 时 B6 BP10 → BP15 段 = 306 = 39% Mk5 ✓；T9 时 = 570 = 73% Mk5 ✓。BP15 → BP-TERM 段 = 78 = 10% Mk5 ✓。

## 验证

- [ ] **6 台 manufacturer 全部物理放置**（包括 T6 不通电的 4 台 BP15a-M2 / BP15b-M2 / BP15c-M1/M2）
- [ ] Belt manifold + lift 接到全部 6 台 in-0/1/2（不只是 T6 通电的 2 台）；in-3 槽留空
- [ ] **6 个 Power Switch 一次建好**，Network A1 + B1 合上，A2/B2/C1/C2 断开
- [ ] T6 阶段所有 manufacturer 100% 不超频，shard 槽全空（晶振 / HSC 全 Tier 均 100%）
- [ ] B5 merger 注入路径一次接到 3 实例 lift-out-top（T9 总 11.5/min = 1.5% Mk5 ✓）
- [ ] B6 流量分段：T7 BP10→BP15 段 306 = 39% Mk5 ✓；T9 段 570 = 73% Mk5 ✓（已 Mk5 不需进一步升级）
- [ ] 晶振 / HSC 在不同实例（a/c vs b），跨实例集群内无 belt（屋顶 B5 共用）
- [ ] 屋顶 splitter/merger 一次按 T9 流量配置，T7+ 自动续流
