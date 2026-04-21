---
name: multi-terminal-megabase-v1 实施进度（具体）
description: 源图 333、已建机器/传送带清单、剩余 5F/6F/7F 需实现的具体配方与输入流
type: project
originSessionId: d82680f1-a3f1-4c10-8753-738a31af16fb
---
## 主任务

完成 `data/schemes/multi-terminal-megabase-v1.json`，这是把 `333`（根目录，Satisfactory Calculator 导出的 cytoscape 图 JSON）翻译成 factory-plan 方案。

**Why:** 用户要一个综合多终点方案，用 `333` 作为单一数据源。所有楼层/机器/传送带必须最终对上 333 的 27 个生产节点 + 15 个终端产物 + 84 条流量边。
**How to apply:** 改动任何一台机器或 belt 前，先回 `333` 确认来源 node/edge；遇到配方输入流量分配时（哪里合流、哪里分流）以 `333` 的 edge.qty 为准。

## 楼层命名（硬约束）

统一 `1F/2F/3F/4F/5F/6F/7F`，**绝不**用 F2a/F2b。belt/machine 内部 id 里残留的 `f2a/f2b/f3` 是 id 不改；label 和 description 里要用 NF。

## 源图 333 的全貌（一次性查清，后续参考即可）

- 节点数：27 生产 + 15 终端产物 + merger/splitter 若干
- 生产建筑：3× smelter + 1× foundry + 12× constructor + 6× assembler + 1× manufacturer + 4× miner（miner 映射为 storage 原矿入口）
- 15 个终端（单位 /min）：电缆 9、电线 6、马达 0.25、定子 0.05、转子 0.25、重型模块化框架 0.25、模块化框架 0.1、钢筋混凝土梁 0.25、钢梁 0.2、钢管 0.25、铜板 0.05、强化铁板 0.1、铁板 0.1、铁棒 0.1、混凝土 0.3

## 已完成：1F–4F（0 error / 0 warn）

### 1F 冶炼层（floor=1）
- splitter-iron-ore（3 路）、smelter-copper、smelter-iron-1、smelter-iron-2、foundry-steel
- 出口 lift：lift-bot-copper (0.625, 3.75)、lift-bot-iron-1/2、lift-bot-steel (3.125, 3.75)
- **特殊**：lift-bot-copper 中心 col=0.75 主轴对齐 4F 铜分流器

### 2F 铁链（floor=2）— 来自 1F 的 iron-1 + iron-2
- con-plate、con-rod-1/2/3（全部 facing=north，输出北）
- merger-iron（合 iron-1/2）→ splitter-A-iron → splitter-B-iron
- 4 个 lift-bot 在北边 (0/1/2/3, 0)：plate、rod-1、rod-2、rod-3
- **skip-floor**：plate 和 rod-3 的 lift-top 直接到 5F（不在 3F 落地），rod-1/rod-2 在 3F 喂螺丝

### 3F 钢/螺丝链（floor=3）— 4 cons 并排
- con-steel-beam（col 0, facing=north）、con-screw-1（col 1, facing=south）、con-screw-2（col 2, facing=south）、con-steel-pipe（col 3, facing=north）
- splitter-steel-f2b 在 (3, 2.5) facing=north，来自 1F skip-floor 钢锭，分 beam + pipe
- 螺丝 lift 在南（row 3.5）；钢梁/钢管 lift 在北（row 0）
- **设计**：con-steel-beam 与 con-steel-pipe 翻 facing=north，让螺丝 lift 对齐 rod lift col，钢梁/管输出北送避开螺丝输出通道

### 4F 铜链（floor=4）— 4 cons 混 facing
- con-wire (col 0, north)、con-cable (col 1, south)、con-copper-sheet (col 2, north)、con-concrete (col 3, south)
- splitter-copper-f3 (0.5, 3) facing=north：铜锭分 wire + copper-sheet
- splitter-wire-f3 (0.25, 0) facing=north：电线分 cable + wire-lift（输入口朝南对齐 wire 顶部输出，贴紧无间隙）
- lift-bot-wire 在北角 (0, 0) 贴 splitter 左出口；lift-bot-cable/sheet 在北；lift-bot-concrete 在南

## 待完成：5F 装配层（floor=5）

**必须实现的 6 台 assembler**（全部输入 in-0/in-1 在 back=top，输出 out-0 在 front=bottom，默认 facing=south）：

| Recipe | 配方名 | 输入 #1 | 输入 #2 | 产出 /min | 来自楼层 |
|---|---|---|---|---|---|
| `stator` | 定子 | 电线 4.4 | 钢管 1.65 | 定子 5 | 4F 电线、3F 钢管 |
| `rotor` | 转子 | 铁棒 3.75 | 螺丝 18.75 | 转子 4 | 2F 铁棒 #3 (skip)、3F 螺丝 #1/2 |
| `motor` | 马达 | 转子 0.5 | 定子 0.5 | 马达 5 | 本层（rotor + stator） |
| `modular-frame` | 模块化框架 | 强化铁板 2.025 | 铁棒 8.1 | 框架 2 | 本层（RIP）、2F 铁棒 |
| `reinforced-iron-plate` | 强化铁板 | 铁板 12.75 | 螺丝 25.5 | RIP 5 | 2F 铁板 (skip)、3F 螺丝 |
| `encased-industrial-beam` | 钢筋混凝土梁 | 钢梁 4.5 | 混凝土 9 | EIB 6 | 3F 钢梁、4F 混凝土 |

**关键**：motor 和 modular-frame 的输入来自本层其他 assembler，必须就近走线而不是走 lift。

现有的 lift-top 入口（已放到 5F）：plate, rod-3, screw-1, screw-2, beam, pipe, wire, cable, copper-sheet, concrete。
需要额外在 5F 增加的 lift：**rod(给 rotor/modular-frame)**；现 rod-3 已在 5F，rod-1/2 在 3F——5F 是否还要 rod-1/2 要看输入量是否够。目前 rod-1/2 消耗是 screw，不是 assembler，所以给 rotor/modular-frame 的铁棒要走 rod-3 单路 8.1+3.75=11.85/min，mk.1 够。

## 待完成：6F 制造层（floor=6）

1 台 manufacturer（重型模块化框架）：
- 配方：`heavy-modular-frame`
- 输入 4 路：模块化框架 1.25、钢管 5、钢筋混凝土梁 1.25、螺丝 30
- 产出：重型框架 2/min
- **注意**：manufacturer 是**唯一 front=input** 的机器（输入 4 路在 front 边，输出 1 路在 back 边），布局时要反转对 facing 的直觉。

## 待完成：7F 物流合并层（floor=7）

- 15 路 lift-out-top（15 个终端的顶出入口）
- 7 台 merger（3 进 1 出的树：15 → 5 → 2→ 1，合起来 7 台 merger；参考 `feedback_merger_three_inputs.md`）
- 1 台 storage 作总出口

## 待加的 skip-floor lift（跨楼层贯通）

从 2F/3F 直接到 5F/6F/7F 的材料：
- `lift-plate` 已 2F→5F（skip 3F/4F）
- `lift-rod-3` 已 2F→5F（skip 3F/4F）
- `lift-screw-1/2` 已 3F→5F（skip 4F）
- `lift-beam`、`lift-pipe` 已 3F→5F（skip 4F）
- `lift-wire`、`lift-cable`、`lift-copper-sheet`、`lift-concrete` 已 4F→5F

**6F/7F 新增的 lift 对**尚未建立，需要时再补 `liftPairs` 数组。

## 容易踩的坑

- 建筑 `facing` 翻过就要反查 `SIDE_MAP`（详见 `src/core/coordinate.ts`），in/out 的屏幕边会互换，belt 路径 col/row 要同步改
- constructor / assembler 的端口 offset 不在 0.25 网格上（如 assembler 2.5m = 0.3125 格），机器 pos 用 0.125 步进换取同轴是**被允许的**（会触发 R2 warn，但整条产线保持直线比消除 R2 更重要 — 见 CLAUDE.md）
- **R14c（新加的 error 规则）**：belt 首/末段必须从端口所在边外侧接近，不得穿过机器体抵达远端端口。lift 例外。违反会 error 级报错
- 每次改完 JSON 必须跑 `npx tsx scripts/validate-megabase.ts`，要求 `Errors: 0`；warn 可以有但优先消除

## 参考文件

- 源数据：`333`（根目录）
- 设计规格：`docs/superpowers/specs/2026-04-21-multi-terminal-megabase-design.md`
- 方案 JSON：`data/schemes/multi-terminal-megabase-v1.json`
- 专用 validator：`scripts/validate-megabase.ts`
- 校验规则：`src/core/schema.ts`（R1–R31 + R14c）
- 建筑尺寸/端口：`src/core/registry.ts`
