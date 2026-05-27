# BP12 转子 + 定子 + 电机 (C6)

## 概要

- **集群**: C6 装配（紧贴 BP11 之后，C6 第一个）
- **规格**: Mk2 单实例
- **机器**: **7 assembler 一次物理建造到位**（3 rotor + 3 stator + 1 motor）
- **激活时间线**（仅翻 Power Switch + 插 Power Shard，不动结构）:
  - T6 → 5 台通电（2 rotor + 2 stator + 1 motor；其余 2 台 Power Switch 关）
  - T7 → 7 台通电（满载 3 + 3 + 1）
  - T8 = T9 → 7 台（不再扩容）
- **产能**: T6 转子 14 / 定子 15 / 电机 5 → T7+ 满载

> **核心设计原则**：**7 台 assembler 在 T6 阶段就全部摆好 + belt/manifold/电网/Power Switch 全部接好**。后续升 Tier 时**不重新放机器、不重新拉 belt**——只需 (1) 翻对应 Power Switch (2) 插 Power Shard (3) 调超频百分比。

## 机器超频清单（T6，Plan C ≤250%）

| 配方 | 物理 | T6 通电 | 超频 | 单台产能 (/min) | Power Shard/通电台 |
|---|---:|---:|---:|---:|---:|
| rotor (assembler) | 3 | **2** | 175.0% | 7.0 | 2 |
| stator (assembler) | 3 | **2** | 150.0% | 7.5 | 1 |
| motor (assembler) | 1 | **1** | 100.0% | 5.0 | 0 |
| **合计 (T6)** | 7 | 5 | — | 转子 14 / 定子 15 / 电机 5 | 2×2 + 2×1 + 0 = **6** |

> T6 时未通电的 2 台（R3 / S3）：物理建好、belt 接好、shard 槽**空着**、Power Switch **关**，完全不耗电不产出。<br>
> T7 满载 7 台，新增 R3 / S3 按既定超频（175% / 150%）插 shard，转子/定子产能各增 7。

## 物料 I/O

| 方向 | 物料 | 流量 (T6) | 路径 |
|---|---|---|---|
| 输入 | 螺丝 → 转子 | 350 | **屋顶 B1** ← BP3 → smart splitter |
| 输入 | 铁棒 → 转子 | 70 | **屋顶 B2** ← BP2 → splitter |
| 输入 | 钢管 → 定子 | 45 | **屋顶 B3** ← BP5 → splitter |
| 输入 | 电线 → 定子 | 120 | **屋顶 B3** ← BP7 → splitter |
| 内部 | 转子 + 定子 → 电机 | 10 + 10 | 蓝图内 lift |
| 输出 | 转子 → B5 终端 | 4 | 屋顶 merger → B5 |
| 输出 | 定子 → B5 终端 | 5 | 屋顶 merger → B5 |
| 输出 | 电机 → B5 终端 | 5 | 屋顶 merger → B5 |

**屋顶总线接入**:
- 取自 B1 (螺丝 350) + B2 (铁棒 70) + B3 (钢管 45 + 电线 120 = 165)
- 注入 B5 (转子 4 + 定子 5 + 电机 5 = 14 mainNode)

> manifold / splitter / lift 一次按 **T7 满载**（3+3+1）尺寸接到全部 7 台 in 端口；T6 阶段未通电的 2 台 in 段管路已就位，只是上游 splitter 出该端口的物料流过去也不会被消化（机器关电）。

## 楼层占用

| 层 | 高度 | 内容 | 物理台数 | T6 通电 |
|---|---|---|---:|---:|
| 1F | 0-8m | 3 rotor (R1-R3) + 3 stator (S1-S3) | 6 | **4** (R1/R2/S1/S2) |
| 4m 地基 | 8-12m | 隔层 | — | — |
| 2F | 12-20m | 1 motor (M1) | 1 | **1** |
| 4m 地基 | 20-24m | 隔层 | — | — |
| 屋顶 | 35-40m | B1-B6 + 3 splitter + 1 merger | — | — |

> **T6 阶段**：1F R1/R2/S1/S2 通电（Network A），R3/S3 Power Switch **关**（Network B 待 T7 启用）；2F M1 通电。所有 belt / lift / manifold / Power Switch 一次到位。

## 俯视图（按实际比例，每层独立）

**比例约定**（同 BP02）：1 字符 = 1m 横向；1 行 = 2m 纵向；蓝图 40×40m = 40 字符 × 20 行。

**图例**：
- `*` 后缀 = T6 通电；无 `*` = T7+ Power Switch 关（物理已建，不耗电不产出）
- `v` = front (south) 输出
- `10x15` = 10m 宽 × 15m 长

### 1F (0-8m): 3 rotor + 3 stator — T6 仅 R1/R2/S1/S2 通电

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌─────────┐┌─────────┐┌─────────┐                 │
        ││  R1*    ││  R2*    ││   R3    │ row 0: 3 rotor  │
 4      ││ rotor   ││ rotor   ││ rotor   │ T6 R1/R2 ON     │
        ││ 10x15   ││ 10x15   ││ 10x15   │ R3 Switch OFF   │
 8      ││  v      ││  v      ││  v      │ → T7 R3 翻 ON   │
        │└─────────┘└─────────┘└─────────┘                 │
12      │────── rotor collect belt h=2m row=4 ─────────────│
        │┌─────────┐┌─────────┐┌─────────┐                 │
        ││  S1*    ││  S2*    ││   S3    │ row 2.5: 3 stator│
16      ││ stator  ││ stator  ││ stator  │ T6 S1/S2 ON     │
        ││ 10x15   ││ 10x15   ││ 10x15   │ S3 Switch OFF   │
20      ││  v      ││  v      ││  v      │ → T7 S3 翻 ON   │
        │└─────────┘└─────────┘└─────────┘                 │
24      │────── stator collect belt h=2m row=8 ────────────│
        │ in: screw 350  + iron-rod 70  (rotor in-0/in-1)  │
28      │ in: steel-pipe 45 + wire 120 (stator in-0/in-1)  │
        │ 4 lift-bot from roof splitter manifold 喂全 6 台 │
32      │ (R3/S3 管路已接，T6 物料流过不消化)              │
        │                                                  │
36      │ out >> central splitter:                         │
        │   rotor 14 (10 to M1 + 4 mainNode)               │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- R1-R3: rotor assembler 10m W × 15m L × 8m H（转子）；T6 仅 R1/R2 通电
- S1-S3: stator assembler 10m W × 15m L × 8m H（定子）；T6 仅 S1/S2 通电
- col=3 row=0 / row=2.5 的 R3 / S3 **物理已建 + belt 已接**，shard 槽空、Switch 关
- 进料：屋顶 4 路 splitter manifold 一次接到全 6 台 in-0 / in-1

### 2F (12-20m): 1 motor — T6 通电

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌─────────┐                                       │
        ││  M1*    │  T6 通电（Network A）                 │
 4      ││ motor   │                                       │
        ││ 10x15   │                                       │
 8      ││  v      │                                       │
        │└─────────┘                                       │
12      │─────── motor output belt h=14m row=4 ────────────│
        │ in: rotor 10 (lift-bot from 1F rotor splitter)   │
16      │ in: stator 10 (lift-bot from 1F stator splitter) │
        │                                                  │
20      │ out: motor 5/min >> lift-out-top to roof merger  │
        │                                                  │
24      │ T6→T7 motor 不扩容，固定 1 台满载                │
        │                                                  │
32      │                                                  │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- M1: motor assembler 10m W × 15m L × 8m H，T6 即满载 100% 5/min
- T7+ motor 不扩容，2F 不增加机器；扩容仅发生在 1F (R3 / S3)

### 屋顶 (35-40m): B1-B6 + 3 splitter + 1 merger

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │ o B1 ───[smart split: screw 350]──────────── o   │
 4      │ o B2 ───[split: iron-rod 70]──────────────── o   │
 8      │ o B3 ───[prog split: pipe 45 + wire 120]──── o   │
12      │ o B4 ───────────────────────────────────────── o │
16      │ o B5 ───[merger << lift-top mainNode 14]──── o   │
20      │ o B6 ───────────────────────────────────────── o │
24      │                                                  │
28      │ 4 lift-bot: screw / rod / pipe / wire to 1F      │
32      │ 3 lift-top: rotor 4 + stator 5 + motor 5 to B5   │
36      │                                                  │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- B1 取螺丝 350 → BP12（B1 流量在此清零）
- B2 取铁棒 70（来自 BP2）
- B3 取钢管 45 + 电线 120 = 165（programmable splitter）
- B5 merger 注入：转子 4 + 定子 5 + 电机 5 = 14 mainNode

## Power Switch 分网

把 7 台 assembler 拆 2 个独立 Power Network，由 2 个 Power Switch 控制。**2 个 Switch 全部 T6 一次安装好**，只是 T6 阶段只合 Network A。

| 网 | 范围 | 数量 | T6 状态 | 升级触发 |
|---|---|---:|---|---|
| Network A | 1F R1/R2/S1/S2 + 2F M1 | 5 | **ON** | — |
| Network B | 1F R3 + S3 | 2 | OFF | T7 翻 ON |

> Power Switch 物理位置建议放 1F col=4 row=4 操作区（manifold 旁边），2 个并排，方便玩家在场内一眼区分。

## 建造步骤

1. **框架**：5×5 cell × 5 cell 高（40×40×40m）
2. **1F (0-8m)**：放 6 台 assembler — row 0 cols 0-2 = R1/R2/R3 rotor；row 2.5 cols 0-2 = S1/S2/S3 stator
3. **1F belt**：row=4 横铺 rotor collect belt（合 R1-R3 三台 front 输出）；row=8 横铺 stator collect belt（合 S1-S3 三台 front 输出）；末端接 central splitter
4. **1F 地基**：y=8m 铺 4m 厚地基覆盖整层
5. **2F (12-20m)**：col=0 row=0 放 1 台 M1 motor assembler
6. **2F belt**：row=4 横铺 motor output belt → col=4 lift-out-top
7. **2F 地基**：y=20m 铺 4m 厚地基
8. **电机进料**：1F rotor splitter（10 给 M1 + 4 mainNode）+ stator splitter（10 给 M1 + 5 mainNode）→ lift-up → 2F M1 in-0 / in-1
9. **垂直汇总**：1F rotor 4 mainNode + stator 5 mainNode + 2F motor 5 → 3 根 lift-out-top 在屋顶汇合到 merger 注 B5
10. **屋顶 (35m)**：铺 6 条 Mk5 平行 belt（B1 row=0.5 ... B6 row=4.5），左右各嵌 Wall Mount；4 路屋顶进料 splitter (B1 smart / B2 / B3 prog)，1 个 B5 merger
11. **进料管路**：屋顶 4 splitter → 4 lift-bot → 1F manifold 一次接到 **全 6 台 rotor + stator in 端口**（含 R3 / S3）
12. **Power Switch ×2**：按上面"Power Switch 分网"表布置 Network A / B；T6 只合 A，B 关闭
13. **Power Shard（T6 阶段）**：R1/R2 各插 2 shard（175%），S1/S2 各插 1 shard（150%），M1 不插（100%）；**R3 / S3 物理已就位但 shard 槽空着**

## Tier 7+ 启用流程（仅翻 Switch + 插 shard，不动结构 / 不动 belt）

| Tier | 操作 | 通电总数 |
|---|---|---:|
| T7 | 翻 Network B Switch ON → R3 插 2 shard (175%) + S3 插 1 shard (150%) | 7 (满载) |
| T8 | 无操作（产能不再变化） | 7 |
| T9 | 无操作 | 7 |

## 验证

- [ ] **7 台 assembler 全部物理放置**（包括 T6 不通电的 R3 / S3）
- [ ] Belt manifold + lift 接到全部 6 台 rotor / stator in-0 / in-1（不只是 T6 通电的 4 台）
- [ ] 2 个 Power Switch 一次建好，Network A 合上，Network B 断开
- [ ] T6 仅 R1/R2 各 2 shard、S1/S2 各 1 shard；R3 / S3 物理就位但 shard 槽空
- [ ] 4 路屋顶 splitter filter 正确（螺丝/铁棒/钢管/电线）
- [ ] B1 上 350 螺丝是 BP3→BP12 全部流量（B1 总流量 = 350，BP12 取完后 0）
- [ ] B5 + 14 流量在容量内（B5 累计 ~80）
- [ ] manufacturer 反转端口规则不适用（BP12 全是 assembler，端口正向）
