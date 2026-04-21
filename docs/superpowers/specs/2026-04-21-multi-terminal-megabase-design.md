# Multi-Terminal Megabase v1 — 设计规范

## 来源

外部 Satisfactory Calculator 生产图 (文件 `333`) 的 factory-plan 等效蓝图。

**原始图数据**：71 节点（27 生产建筑 + 8 merger + 21 splitter + 15 终点物料）+ 84 条流量边。

## 产物目标（15 个终端）

| 物料 | 单位/min |
|---|---|
| 电缆 | 9 |
| 电线 | 6 |
| 马达 | 0.25 |
| 定子 | 0.05 |
| 转子 | 0.25 |
| 重型模块化框架 | 0.25 |
| 模块化框架 | 0.1 |
| 钢筋混凝土梁 | 0.25 |
| 钢梁 | 0.2 |
| 钢管 | 0.25 |
| 铜板 | 0.05 |
| 强化铁板 | 0.1 |
| 铁板 | 0.1 |
| 铁棒 | 0.1 |
| 混凝土 | 0.3 |

15 路总流量 ≈ 17.5/min。

## 约束决策（已与用户对齐）

1. **原矿入口**：采矿机不在 registry，用 `storage` 占位作为"外部原矿入口"。接受 4 条 R30 warning
2. **规模**：27 台生产机器 **全部落地**（原 333 零删减，仅剔除 4 台 miner）
3. **楼层**：每层 **4×4 格**（32m×32m），共 **6 层**（细窄高塔）
4. **物流合并**：F6 做专用物流合并层，用 **merger 3-路树**（7 台 merger）汇 15 路→ 1 个 storage 总出口
5. **交付方式**：**分层**（F1 → 跑测 → F2 → …），每层跑通再进入下层

## 建筑映射（333 → factory-plan）

```
Build_MinerMk2_C     → storage (占位入口)
Build_SmelterMk1_C   → smelter
Build_FoundryMk1_C   → foundry
Build_ConstructorMk1_C → constructor
Build_AssemblerMk1_C → assembler
Build_ManufacturerMk1_C → manufacturer
Build_ConveyorAttachmentSplitter → splitter
Build_ConveyorAttachmentMerger   → merger
```

Recipe 映射：`Recipe_IngotIron_C → iron-ingot` 等，按 `src/core/recipes.ts` 中的 id 对应。

## 楼层结构

| 层 | 内容 | 机器数 |
|---|---|---|
| F1 冶炼层 | 4× storage（原矿入口：Iron/Copper/Coal/Limestone）+ 1× splitter（铁矿 3 路）+ 2× smelter（铁锭）+ 1× smelter（铜锭）+ 1× foundry（钢锭）+ 升降机出口 | 9 生产/物流 + 4-5 lift |
| F2 构筑层 A | IronPlate ×1 / IronRod ×3 / SteelBeam ×1 / SteelPipe ×1 / Screw ×2 + splitter/merger | ~14 |
| F3 构筑层 B | Wire ×1 / CopperSheet ×1 / Cable ×1 / Concrete ×1 + splitter/merger | ~10 |
| F4 装配层 | Stator / Rotor / Motor / ModularFrame / ReinforcedIronPlate / EncasedIndustrialBeam + splitter/merger | ~12 |
| F5 制造层 | Manufacturer ×1（HeavyModularFrame）独占 | 1-2 |
| F6 物流合并层 | 15× lift-out-top（15 路终端上升口）+ 7× merger（3 路汇流树）+ 1× storage（全厂总出口） | 23 |

**总建筑数**：约 **70+**（含 4 原矿入口 + 23 生产 + 29 分合流 + 若干升降机 + 1 总出口）。

## 关键布局原则

- **同轴对齐优先**：上下游端口尽量落在同一 col/row，belt 直线化（消除 R17 警告）
- **端口偏移非 0.25 对齐允许用 0.0625 步进**（smelter 2.5m = 0.3125, foundry 3m/7m = 0.375/0.875）
- **facing=south 默认**：back=top（输入在屏幕上方），front=bottom（输出在屏幕下方）
- **升降机贴一侧**：跨层升降机放楼层边缘（col 4 或 row 4 一侧），保持楼中央空间
- **Manufacturer 特殊**：输入在 front，输出在 back（唯一反向建筑）

## 流量规则

- **传送带 mark**：按流量分级——≤60 Mk.1；≤120 Mk.2；≤270 Mk.3；…
- **大部分流量 < 30/min**：绝大多数 belt 用 Mk.1 即可
- **大流量位**：iron-ore splitter 下游 ~79/min（需 Mk.2）、screw 合流 ~25/min（Mk.1 ok）

## 验收标准

每层交付后跑 `npx vitest run`：

- **零 error**：R1/R2/R3/R4/R5/R6/R7/R8/R9/R10/R12/R13/R14a/R18/R20/R21/R24/R29 全部为 0
- **可残留 warn**：R2 (0.0625 步进), R22 (流量), R25 (端口悬空), R30 (原矿入口无输入), R31
- **硬性目标**：每层 R14b/R15/R16/R17 警告合计 **≤ 3 条**。超出阈值必须迭代修复

## 产出文件

- `data/schemes/multi-terminal-megabase-v1.json`
- id: `multi-terminal-megabase-v1`
- name: `综合多终点产线 v1（重型框架/马达/电缆等 15 终点）`
- category: 新增 `'megabase'` 或复用 `'mixed'`

## 迭代策略

F1 → F2 → F3 → F4 → F5 → F6 依次实现，每层：
1. 只添加本层 machines + belts + 本层到上层的 lifts
2. 跑 `npx vitest run` 确认 error=0 且 warn ≤ 目标阈值
3. 若超出阈值：优先调整上下游端口同轴，其次拆 belt 路径
4. 通过后再进入下层

## 自我复审

- 无 TBD/占位
- 内部一致（15 产物、6 层、merger=7 与正文反复一致）
- 范围清晰（单方案文件，分 6 层迭代）
- 歧义已消除（"合并到一个"明确为 merger tree → 1 storage）
