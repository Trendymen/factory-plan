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
| 输入 | 电线 → 定子 | 120 | **屋顶 B4** ← BP7 → splitter |
| 内部 | 转子 + 定子 → 电机 | 10 + 10 | 蓝图内 lift |
| 输出 | 转子 → B5 终端 | 4 | 屋顶 merger → B5 |
| 输出 | 定子 → B5 终端 | 5 | 屋顶 merger → B5 |
| 输出 | 电机 → B5 终端 | 5 | 屋顶 merger → B5 |

**屋顶总线接入**:
- 取自 B1 (螺丝 350) + B2 (铁棒 70) + B3 (钢管 45) + B4 (电线 120)
- 注入 B5 (转子 4 + 定子 5 + 电机 5 = 14 mainNode)

> **进料 4 路独立**：螺丝 / 铁棒 / 钢管 / 电线各走一条独立总线（B1/B2/B3/B4），屋顶 **4 个独立 splitter**（B1 smart 螺丝、B2 铁棒、B3 钢管、B4 电线）→ **4 根 lift-bot** 分别下楼。钢管与电线**不再共用一条 B3**——拆为 B3(钢管)/B4(电线) 两条总线。<br>
> manifold / splitter / lift 一次按 **T7 满载**（3+3+1）尺寸接到全部 7 台 in 端口；T6 阶段未通电的 2 台 in 段管路已就位，只是上游 splitter 出该端口的物料流过去也不会被消化（机器关电）。

## 楼层占用

> **拆三层布局（审查修订）**：原「1F 同层放 3 rotor + 3 stator」按真实 assembler 15m 长度计算会让定子排底边落到 y≈42m **越界**，且违反「北墙内缩 ≥4m 留进料巷」公约。改为 **rotor / stator / motor 各占一独立楼层**，每层北侧留 4m 进料巷、南侧留 collect belt 净空。

| 层 | 高度 | 内容 | 物理台数 | T6 通电 |
|---|---|---|---:|---:|
| 1F | 0-8m | 3 rotor (R1-R3) | 3 | **2** (R1/R2) |
| 4m 地基 | 8-12m | 隔层 | — | — |
| 2F | 12-20m | 3 stator (S1-S3) | 3 | **2** (S1/S2) |
| 4m 地基 | 20-24m | 隔层 | — | — |
| 3F | 24-32m | 1 motor (M1) | 1 | **1** |
| 4m 地基 | 32-35m | 隔层 | — | — |
| 屋顶 | 35-40m | B1-B6 + 4 splitter + 1 merger | — | — |

> **T6 阶段**：1F R1/R2 通电（Network A），R3 Power Switch **关**（Network B 待 T7 启用）；2F S1/S2 通电（Network A），S3 Power Switch **关**（Network B 待 T7 启用）；3F M1 通电（Network A）。所有 belt / lift / manifold / Power Switch 一次到位。

## 俯视图（按实际比例，每层独立）

**比例约定**（同 BP02）：1 字符 = 1m 横向；1 行 = 2m 纵向；蓝图 40×40m = 40 字符 × 20 行。

**图例**：
- `*` 后缀 = T6 通电；无 `*` = T7+ Power Switch 关（物理已建，不耗电不产出）
- `v` = front (south) 输出；`^` = back (north) 输入侧
- `10x15` = 10m 宽 × 15m 长（assembler 真实尺寸 10W×15L×8H）
- 纵向 1 行 = 2m，机器框高 = 真实长度 15m ÷ 2 ≈ **7.5 行**
- 北侧 0-4m = **进料巷**（back 输入侧，manifold + lift 落点）；机器从 y=4 起建

### 1F (0-8m): 3 rotor — T6 仅 R1/R2 通电

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬───────┐
 0      │   ^         ^         ^      进料巷(back 输入)     │
 2      │ lift-bot: screw / iron-rod 落点 → 北侧 manifold    │
 4      │  ┌────────┐ ┌────────┐ ┌────────┐                  │
 6      │  │  R1*   │ │  R2*   │ │   R3   │  3 rotor         │
 8      │  │ rotor  │ │ rotor  │ │ rotor  │  T6 R1/R2 ON     │
10      │  │ 10x15  │ │ 10x15  │ │ 10x15  │  R3 Switch OFF   │
12      │  │        │ │        │ │        │  → T7 R3 翻 ON   │
14      │  │        │ │        │ │        │                  │
16      │  │   v    │ │   v    │ │   v    │  (front 输出南)  │
18      │  └────────┘ └────────┘ └────────┘                  │
20      │ ══════ rotor collect belt (front 边外) ══════════  │
22      │ central splitter: rotor 14 →                       │
24      │   10 → lift-up 到 3F M1 in-0                       │
26      │    4 → lift-out-top 到屋顶 merger (B5 mainNode)    │
30      │ R3 管路已接(in/out)，T6 物料流过不消化(关电)       │
34      │ 机器 x: R1=2-12 / R2=15-25 / R3=28-38 (留台间隙)   │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴───────┘
```

- R1-R3: rotor assembler 10W × 15L × 8H（转子），占 y=4-19（15m，约 7.5 行）；T6 仅 R1/R2 通电
- 北侧 y=0-4 进料巷：screw / iron-rod 两路 lift-bot 落点 + 东西向 manifold 接 3 台 back in-0/in-1
- R3 **物理已建 + belt 已接**，shard 槽空、Switch 关 → T7 翻 ON
- collect belt 走机器 front（南）边外 y≈20，不穿机身

### 2F (12-20m): 3 stator — T6 仅 S1/S2 通电

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬───────┐
 0      │   ^         ^         ^      进料巷(back 输入)     │
 2      │ lift-bot: steel-pipe / wire 落点 → 北侧 manifold   │
 4      │  ┌────────┐ ┌────────┐ ┌────────┐                  │
 6      │  │  S1*   │ │  S2*   │ │   S3   │  3 stator        │
 8      │  │ stator │ │ stator │ │ stator │  T6 S1/S2 ON     │
10      │  │ 10x15  │ │ 10x15  │ │ 10x15  │  S3 Switch OFF   │
12      │  │        │ │        │ │        │  → T7 S3 翻 ON   │
14      │  │        │ │        │ │        │                  │
16      │  │   v    │ │   v    │ │   v    │  (front 输出南)  │
18      │  └────────┘ └────────┘ └────────┘                  │
20      │ ══════ stator collect belt (front 边外) ═════════  │
22      │ central splitter: stator 15 →                      │
24      │   10 → lift-up 到 3F M1 in-1                       │
26      │    5 → lift-out-top 到屋顶 merger (B5 mainNode)    │
30      │ S3 管路已接(in/out)，T6 物料流过不消化(关电)       │
34      │ 机器 x: S1=2-12 / S2=15-25 / S3=28-38 (留台间隙)   │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴───────┘
```

- S1-S3: stator assembler 10W × 15L × 8H（定子），占 y=4-19（15m）；T6 仅 S1/S2 通电
- 北侧进料巷：steel-pipe(B3) / wire(B4) 两路独立 lift-bot 落点 + manifold 接 3 台 back in-0/in-1
- S3 物理已建 + belt 已接，shard 槽空、Switch 关 → T7 翻 ON
- 定子 10 给 M1、5 给 mainNode（定子流量按当前配方，审查已否决误报，不强改）

### 3F (24-32m): 1 motor — T6 通电

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬───────┐
 0      │   ^      进料巷(back 输入)                         │
 2      │ lift-up 落点: rotor 10 + stator 10 → 北侧 manifold │
 4      │  ┌────────┐                                        │
 6      │  │  M1*   │  motor assembler                       │
 8      │  │ motor  │  T6 即满载 100% 5/min                  │
10      │  │ 10x15  │  in-0 ← rotor 10 (1F lift-up)          │
12      │  │        │  in-1 ← stator 10 (2F lift-up)         │
14      │  │        │                                        │
16      │  │   v    │  (front 输出南)                        │
18      │  └────────┘                                        │
20      │ ══════ motor collect belt (front 边外) ══════════  │
22      │ out: motor 5/min → lift-out-top 到屋顶 merger(B5)  │
28      │ T6→T7 motor 不扩容，固定 1 台满载                  │
32      │ 扩容仅发生在 1F (R3) + 2F (S3)                     │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴───────┘
```

- M1: motor assembler 10W × 15L × 8H，占 y=4-19（15m），x=2-12；T6 即满载 100% 5/min
- 北侧进料巷：rotor 10（1F 升上来）+ stator 10（2F 升上来）两路 lift-up 落点 + manifold 接 M1 back in-0/in-1
- T7+ motor 不扩容，3F 不增加机器；扩容仅发生在 1F (R3) / 2F (S3)

### 屋顶 (35-40m): B1-B6 + 4 splitter + 1 merger

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬──────┐
 0.5    │ o B1 ──[smart split: screw 350]─────────────── o  │
 4.5    │ o B2 ──[split: iron-rod 70]─────────────────── o  │
 8.5    │ o B3 ──[smart split: steel-pipe 45]─────────── o  │
12.5    │ o B4 ──[smart split: wire 120]──────────────── o  │
16.5    │ o B5 ──[merger << lift-top mainNode 14]─────── o  │
20.5    │ o B6 ───────────────────────────────────────── o  │
24      │ 6 条 Mk5 平行 belt 按子 cell 行距 ~4m 排开        │
28      │ 4 lift-bot: screw→1F / rod→1F / pipe→2F / wire→2F │
32      │ 3 lift-top: rotor 4(1F)+stator 5(2F)+motor 5(3F)  │
36      │     → 屋顶 merger 级联汇 B5 (14 mainNode)         │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴──────┘
```

- 6 条总线按子 cell 行距排开（B1 row=0.25 / B2 row=0.75 / … 约 4m 一条），同屋顶层 35-40m，非高度堆叠
- B1 取螺丝 350 → BP12（smart splitter，B1 流量在此清零）
- B2 取铁棒 70（来自 BP2，splitter）
- B3 取钢管 45（来自 BP5，smart splitter）— **独立总线**
- B4 取电线 120（来自 BP7，smart splitter）— **独立总线**（钢管/电线不再共用 B3）
- **4 个独立屋顶 splitter**：B1 螺丝 / B2 铁棒 / B3 钢管 / B4 电线，各接 1 根 lift-bot 下楼（screw+rod→1F rotor；pipe+wire→2F stator）
- B5 merger 注入：转子 4 + 定子 5 + 电机 5 = 14 mainNode（3 路上送，需 1 个 merger 级联，预留 4×4m 脚印）

## Power Switch 分网

把 7 台 assembler 拆 2 个独立 Power Network，由 2 个 Power Switch 控制。**2 个 Switch 全部 T6 一次安装好**，只是 T6 阶段只合 Network A。

| 网 | 范围 | 数量 | T6 状态 | 升级触发 |
|---|---|---:|---|---|
| Network A | 1F R1/R2 + 2F S1/S2 + 3F M1 | 5 | **ON** | — |
| Network B | 1F R3 + 2F S3 | 2 | OFF | T7 翻 ON |

> Power Switch 物理位置建议放 1F col=4 操作区（北侧进料巷东端、manifold 旁边、避开机器占地），2 个并排，方便玩家在场内一眼区分。R3 在 1F、S3 在 2F，分别由 Network B 同一 Switch 控制（跨层电网共用一个 Power Switch）。

## 建造步骤

1. **框架**：5×5 cell × 5 cell 高（40×40×40m）
2. **1F (0-8m)**：放 3 台 rotor assembler — 北墙内缩 4m，机器占 y=4-19；x=2-12 (R1) / 15-25 (R2) / 28-38 (R3)，台间留 ~3m belt 折线净空
3. **1F belt**：北侧 y=0-4 进料巷东西向铺 rotor manifold（screw + iron-rod 喂 3 台 back in-0/in-1）；机器 front 边外 y≈20 横铺 rotor collect belt（合 R1-R3 三台 front 输出），末端接 central splitter（10 给 M1 + 4 mainNode）
4. **1F 地基**：y=8m 铺 4m 厚地基覆盖整层
5. **2F (12-20m)**：放 3 台 stator assembler — 同 1F 布局（北缩 4m，x=2-12/15-25/28-38）
6. **2F belt**：北侧进料巷铺 stator manifold（steel-pipe + wire 喂 3 台 back in-0/in-1）；front 边外横铺 stator collect belt，末端接 central splitter（10 给 M1 + 5 mainNode）
7. **2F 地基**：y=20m 铺 4m 厚地基
8. **3F (24-32m)**：col=0 (x=2-12)、北缩 4m 放 1 台 M1 motor assembler；北侧进料巷接 rotor 10 + stator 10 两路 lift-up；front 边外横铺 motor collect belt → lift-out-top
9. **3F 地基**：y=32m 铺 3m 厚地基（32-35m）
10. **电机进料 lift**：1F rotor splitter 出的 10 + 2F stator splitter 出的 10，各走专用 lift 列升到 3F M1 in-0 / in-1（跨层「先水平转弯相→再垂直爬升相」分两段，每条 lift 标 (col,row)+3.5×2m 包围盒，避开各层机身）
11. **垂直汇总**：1F rotor 4 mainNode + 2F stator 5 mainNode + 3F motor 5 → 3 根 lift-out-top 升到屋顶，经 1 个 merger 级联汇合注 B5
12. **屋顶 (35m)**：铺 6 条 Mk5 平行 belt（B1 row=0.25 / B2 row=0.75 / … 子 cell 行距 ~4m），左右各嵌 Wall Mount；**4 个独立屋顶进料 splitter**（B1 smart 螺丝 / B2 铁棒 / B3 smart 钢管 / B4 smart 电线），1 个 B5 merger
13. **进料管路**：屋顶 **4 个 splitter → 4 根 lift-bot**：screw + iron-rod → 1F rotor manifold（接全 3 台 rotor，含 R3）；steel-pipe + wire → 2F stator manifold（接全 3 台 stator，含 S3）
14. **Power Switch ×2**：按上面"Power Switch 分网"表布置 Network A / B；T6 只合 A，B 关闭（R3 在 1F、S3 在 2F 同属 Network B）
15. **Power Shard（T6 阶段）**：R1/R2 各插 2 shard（175%），S1/S2 各插 1 shard（150%），M1 不插（100%）；**R3 / S3 物理已就位但 shard 槽空着**

## Tier 7+ 启用流程（仅翻 Switch + 插 shard，不动结构 / 不动 belt）

| Tier | 操作 | 通电总数 |
|---|---|---:|
| T7 | 翻 Network B Switch ON → R3 插 2 shard (175%) + S3 插 1 shard (150%) | 7 (满载) |
| T8 | 无操作（产能不再变化） | 7 |
| T9 | 无操作 | 7 |

## 验证

- [ ] **7 台 assembler 全部物理放置**（1F 3 rotor + 2F 3 stator + 3F 1 motor，含 T6 不通电的 R3 / S3）
- [ ] 每层北墙内缩 ≥4m 留进料巷；每台机器按真实 10×15 占地、同层无 AABB 重叠（x=2-12/15-25/28-38）
- [ ] 1F rotor manifold 接全 3 台 rotor、2F stator manifold 接全 3 台 stator in-0 / in-1（不只是 T6 通电的 4 台）
- [ ] collect belt 走机器 front 边外（y≈20），不穿机身
- [ ] 跨层 lift（电机进料 + 出料汇总）已标 (col,row)+包围盒，避开各层机身、跨度 ≥4m、转弯相/爬升相分两段
- [ ] 2 个 Power Switch 一次建好，Network A 合上，Network B 断开（R3+S3 同属 B）
- [ ] T6 仅 R1/R2 各 2 shard、S1/S2 各 1 shard；R3 / S3 物理就位但 shard 槽空
- [ ] **屋顶 4 个独立 splitter** filter 正确（B1 螺丝 / B2 铁棒 / B3 钢管 / B4 电线），钢管与电线分两条总线
- [ ] B1 上 350 螺丝是 BP3→BP12 全部流量（B1 总流量 = 350，BP12 取完后 0）
- [ ] B5 + 14 流量在容量内（B5 累计 ~80）
- [ ] manufacturer 反转端口规则不适用（BP12 全是 assembler，端口正向）
