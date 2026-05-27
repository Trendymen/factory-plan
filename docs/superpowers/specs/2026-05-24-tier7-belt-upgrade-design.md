# T7 Mk5 蓝图升级设计（机械式重写）

> 把现有 T6 蓝图设计文档（顶层 + 18 个 BP）复制一份到 T7 命名空间，按「玩家已解锁 T7 Bauxite Refinement，所有 belt 升 Mk5，但生产规模仍是 T6 阶段 76 台机器」的前提机械式重算容量与升级路径。**原 T6 文档不动**，作为对照保留。

## 1. 前提与定位

### 玩家状态
- **Tier 7 Bauxite Refinement milestone 已解锁**，Mk5 belt (780/min) 可用
- **机器激活规模仍为 T6 阶段 76 台**（扩产暂未启动）
- **物理建造数量仍按 T9 满载 250 台预留**，T7/T8/T9 扩产通过 Power Switch 启动
- 玩家 belt 已全部物理升级到 Mk5（含矿场来料 belt）

### 文档定位
- **不是新设计**：原 T6 蓝图设计的所有架构决策（集群拓扑、屋顶总线层、Wall Mount 锚点、Auto Connect、BP 拆分实例数）全部保留
- **不是产能扩张**：机器数量、坐标、楼层布局、Power Switch 网络、传送带路径全部不动
- **只是升 belt**：bus belt + 矿场 belt 等级 Mk4 → Mk5，连带容量百分比、升级路径表、几处由 Mk4 容量约束反推出的论证需要更新措辞

### 保留不变的设计决策
- BP9 石油焦本地 sink + 本地 awesome-sink（虽然 Mk5 时代物理上能上 B6，但保留本地 sink 以给 T8/T9 扩产留出 B6 头部空间）
- 8 槽位预留（6 active + 2 reserved）
- BP-TERM-A/B 双 Mk2 拆分
- BP-BUS-FILLER 设计
- 物理建造 250 台 / T6 激活 76 台
- 所有 BP 内部布局、Power Switch 网络、Wall Mount 位置

## 2. 文件映射

整目录复制后逐文件改。原文件完全不动。

| 原路径 | 新路径 |
|---|---|
| `docs/superpowers/specs/2026-05-06-tier6-blueprint-design.md` | `docs/superpowers/specs/2026-05-24-tier7-blueprint-design.md` |
| `docs/superpowers/specs/2026-05-06-tier6-blueprints/README.md` | `docs/superpowers/specs/2026-05-24-tier7-blueprints/README.md` |
| `docs/superpowers/specs/2026-05-06-tier6-blueprints/BP01-iron-ingot.md` | `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP01-iron-ingot.md` |
| `docs/superpowers/specs/2026-05-06-tier6-blueprints/BP02-iron-base.md` | `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP02-iron-base.md` |
| `docs/superpowers/specs/2026-05-06-tier6-blueprints/BP03-screw.md` | `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP03-screw.md` |
| `docs/superpowers/specs/2026-05-06-tier6-blueprints/BP04-steel-ingot.md` | `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP04-steel-ingot.md` |
| `docs/superpowers/specs/2026-05-06-tier6-blueprints/BP05-steel-beam-pipe.md` | `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP05-steel-beam-pipe.md` |
| `docs/superpowers/specs/2026-05-06-tier6-blueprints/BP06-copper-smelt.md` | `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP06-copper-smelt.md` |
| `docs/superpowers/specs/2026-05-06-tier6-blueprints/BP07-wire-cable.md` | `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP07-wire-cable.md` |
| `docs/superpowers/specs/2026-05-06-tier6-blueprints/BP08-circuit-board.md` | `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP08-circuit-board.md` |
| `docs/superpowers/specs/2026-05-06-tier6-blueprints/BP09-plastic-rubber.md` | `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP09-plastic-rubber.md` |
| `docs/superpowers/specs/2026-05-06-tier6-blueprints/BP10-quartz-quickwire-concrete.md` | `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP10-quartz-quickwire-concrete.md` |
| `docs/superpowers/specs/2026-05-06-tier6-blueprints/BP11-sam.md` | `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP11-sam.md` |
| `docs/superpowers/specs/2026-05-06-tier6-blueprints/BP12-rotor-stator-motor.md` | `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP12-rotor-stator-motor.md` |
| `docs/superpowers/specs/2026-05-06-tier6-blueprints/BP13-frame-encased-beam.md` | `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP13-frame-encased-beam.md` |
| `docs/superpowers/specs/2026-05-06-tier6-blueprints/BP14-hmf-computer.md` | `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP14-hmf-computer.md` |
| `docs/superpowers/specs/2026-05-06-tier6-blueprints/BP15-crystal-osc-hsc.md` | `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP15-crystal-osc-hsc.md` |
| `docs/superpowers/specs/2026-05-06-tier6-blueprints/BP-BUS-FILLER.md` | `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP-BUS-FILLER.md` |
| `docs/superpowers/specs/2026-05-06-tier6-blueprints/BP-TERM-A.md` | `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP-TERM-A.md` |
| `docs/superpowers/specs/2026-05-06-tier6-blueprints/BP-TERM-B.md` | `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP-TERM-B.md` |

共 1 个顶层文档 + 1 个 README + 18 个 BP 文档 = **20 个文件**。

## 3. 五类机械改动规则

### 类别 1：Belt 等级名替换

所有指代「屋顶总线 belt 物理等级」的字眼里的 `Mk4` 改为 `Mk5`。具体场景：

| 原文模式 | 替换为 |
|---|---|
| `6 条 Mk4 belt` | `6 条 Mk5 belt` |
| `6 Mk4 belt` | `6 Mk5 belt` |
| `Mk4 平行 belt` | `Mk5 平行 belt` |
| `Mk4 belt 横穿` | `Mk5 belt 横穿` |
| `Mk4 直通` | `Mk5 直通` |
| `Mk4 主 belt` | `Mk5 主 belt` |
| `Mk4 belt 直通` | `Mk5 belt 直通` |
| `Mk4 收集 belt` | `Mk5 收集 belt` |
| `8 条 Mk4 belt 槽位` | `8 条 Mk5 belt 槽位` |
| `8 条 Mk4 总线 belt` | `8 条 Mk5 总线 belt` |
| `Mk4 (480/min)` | `Mk5 (780/min)` |

**例外（保留 Mk4 不动）**：
- 历史叙述／反例上下文：「原 Mk4 时代…」「Mk4 已淘汰」这类
- 旧 megabase-v3 对比段落里如果原文叙述 megabase-v3 用 Mk4
- 某些容量计算的反例引用（如「540/min 在 Mk4 时代溢出 112%」这类历史论证可以保留作背景）

### 类别 2：容量百分比重算

所有形如 `X/min` 流量配 `Y% Mk4` 或 `Y/480` 的百分比表述按 Mk5 780/min 重算。

容量百分比对照表（数据全部来自原文）：

| 流量 (items/min) | 出处样本 | 原 % Mk4 | 新 % Mk5 |
|---:|---|---:|---:|
| 11.5 | BP15 B5 注入 | 2.4% | 1.5% |
| 35 | BP05 B5 | 7% | 4% |
| 78 | BP15 BP15→TERM 段 | 16% | 10% |
| 163 | BP05 B3 | 34% | 21% |
| 170 | BP07 T6 B3 | 35% | 22% |
| 228 | BP15 B6 T6 | 48% | 29% |
| 240 | BP03 B2 路径 | 50% | 31% |
| 306 | BP09 B6 BP10→BP15 段 | 64% | 39% |
| 350 | BP03 B1 路径 | 73% | 45% |
| 400.5 | BP03 B2 合计 | 83% | 51% |
| 462 | BP09 B6 if 加石油焦 | 96% | 59% |
| 540 | 上述若改上 B6 | 112%（溢出） | 69%（安全） |
| 570 | BP15 T9 BP10→BP15 段 | 119%（溢出） | 73% |
| 590 | BP03 T6 B1 总 | 123%（溢出） | 76% |
| 750 | T9 B2 螺丝 | 156%（溢出） | 96% |

实施时按这些数据对所有相关句子做替换。多出的流量数值（如果原文有）按 `值 / 780` 重算。

### 类别 3：升级路径表 shift

每个 BP 文件末尾有「Tier 升级路径」4 列表格 `[T6, T7, T8, T9]`。

**叙述里的「升 Mk5」全部移除**（已完成），具体修改对象：

| 原表述模式 | 新表述 |
|---|---|
| `T9 升 Mk5（XXX 超 Mk4 额定 480）` | `T9 belt 仍在 Mk5 (780) 范围内` 或直接删除该段 |
| `T9 升级 Mk5/Mk6 按物料流量` | `T9 个别 belt 拆分槽位`（详见各 BP 重算）|
| `矿场来料 belt 升 Mk5（T9 升 Mk5；T6 临时 Mk4 也可）` | `矿场来料 belt 已升 Mk5（780/min）；T8/T9 个别物料按需拆分槽位` |
| `T9 时矿场来料 belt 升 Mk5/Mk6` | `T8/T9 时矿场来料 belt 按需拆分槽位（部分物料超 Mk5 780/min 但 Mk6 物理待 Tier 8 解锁）` |

**T8/T9 真正需要 Mk6 / 拆分的 belt**（按原文流量数据重算后）：

| Belt | T9 流量 | Mk5 能否承载 | T8/T9 处理 |
|---|---:|---|---|
| B1 螺丝 | ~590/min | 76% Mk5 ✓ | 不动 |
| B2 螺丝/铁棒/RIP | ~750/min | 96% Mk5 ✓（警告但不溢出）| 监控，必要时拆为 B2a/B2b |
| B3 钢管/钢梁/电线 | T9 电线 ~1400/min | **超 Mk5、超 Mk6** | **必须拆为 B3a + B3b**（不是单纯升等级能解决）|
| B4 塑料/混凝土/电路板/线缆 | T9 塑料 ~350/min 等 | < Mk5 ✓ | 不动 |
| B5 26 mainNode | T9 ~554/min | 71% Mk5 ✓ | **原方案 B5a/B5b 拆分取消** |
| B6 铜金锭/铜板/快速线/石英 | T9 ~570/min（BP10→BP15）| 73% Mk5 ✓ | 不动 |
| B7/B8 reserved | — | — | 用途不变（铝壳/RCU/超级计算机/散热器）|

**关键变更**：原方案 T9 时 B5 拆分为 B5a/B5b 的预案**取消**（Mk5 已足够）；B3 仍需拆分（即使 Mk6 也不够）。

### 类别 4：T7+ 扩容章节措辞调整

新顶层文 `tier7-blueprint-design.md` 里：

**「Tier 7+ 扩容详细规划」章节（原 L959）**：
- 章节标题：`## Tier 7+ 扩容详细规划` → `## Tier 8/9 扩容详细规划`（T7 已是当前阶段）
- 章节引言：`> 本章节是 **Tier 7-9 解锁后的实施参考**` → `> Tier 7 已是当前阶段，本章节是 **Tier 8/9 解锁后的实施参考**`

**「1. 现有 BP1-BP15 的逐 Tier 激活时间线」表格**（原 L967）：
- 表头列保留 `[T6, T7, T8, T9]`
- 增加一行说明：「**当前阶段：T7 milestone 已解锁，但激活数仍为 T6 列**（扩产未启动）。」

**「2. 总线 belt 全开后的物料分配」表格**（原 L988）：
- 表头 `[Belt | T6 用途 | T7 新增 | T8 新增 | T9 新增]` 不动
- T7 列里「→ Mk5 升级」全部删除
- T8 列里「B3 → Mk5 升级」改成「B3 拆为 B3a/B3b（即使 Mk6 也不够 1400/min）」
- T8/T9 列里其他「升 Mk5」项标记为已完成或删除
- 「总线 belt 设计（8 条 Mk4 槽位：6 active + 2 reserved）」标题里 `Mk4` → `Mk5`

**「3. BP-TERM 37-mainNode 最终布局」**（原 L1007）：
- 表格不动（mainNode 数与 belt 等级无关）

**「9. 已知 Tier 7+ 路由痛点与对策」**（原 L1194）：
- 「**B2 螺丝总线 T9 时 ~750/min 超 Mk4** | T8 起 B2 升级 Mk5（780/min 容量）」整条删除（Mk5 已是基线）
- 增加 1 条：「**B3 电线总线 T9 时 ~1400/min 即使 Mk6 也不够** | 物理建造时 B3 槽位预留拆分位置（B3a + B3b 共 2 槽，挤占 B7/B8 reserved 中的 1 个或新增槽位）」

### 类别 5：BP9 容量论证更新

BP9 文件 [BP09-plastic-rubber.md](docs/superpowers/specs/2026-05-06-tier6-blueprints/BP09-plastic-rubber.md) 里关于「不上 B6 因为 Mk4 不够」的几处论证改成「保留 B6 头部空间」式表述：

**修改对象**：
- L33 附近：`> **为什么不上 B6**：石油焦上 B6 会让 BP10→BP15 段达 462/min（96% Mk4），几乎溢出；就地 sink 让 B6 流量保持 306（64% Mk4）安全水平。`
  →
  `> **为什么不上 B6**：石油焦上 B6 会让 BP10→BP15 段达 462/min（59% Mk5，物理上可承载），但本设计保留本地 sink 给 B6 留出 39% (306/780) 头部空间以备 T8/T9 扩产时该段流量可能达 570+/min。`
- L267 附近：`即使单实例 234 上 B6 也会让 BP10→BP15 段流量从 306 → 540（112% Mk4，溢出）`
  →
  `Mk5 下虽然 540/780 = 69% 安全，但本地 sink 设计保留以备 T8/T9 扩产`

同样地，顶层文档「重油残渣处理」章节（原 L922）的相应论证也需要同步更新，措辞从「Mk4 溢出无法上 B6」调整为「主动保留 B6 头部空间」。

### 类别 6（额外）：README 更新

- README.md 顶部链接全部从 `BP0X-*.md` 指向同目录新文件（路径相对，不变）
- 「规格」列里 `Mk2` 实例描述不动（蓝图设计器规格与 belt 无关）
- 文末「屋顶 6 条 Mk4 belt」类描述按类别 1 替换

## 4. 关键流量重算样本表（落地参考）

每个 BP 屋顶 belt 在 T6 激活状态下的 Mk5 使用率（用于验收抽样）：

| BP | 屋顶 belt 主负载（T6 流量） | Mk5 % |
|---|---|---:|
| BP01 | 不接入总线 | — |
| BP02 | B2 注入 RIP+铁棒，~XX/min | < 20% |
| BP03 | B1 注入 350、B2 注入 240 | 45% / 31% |
| BP04 | B4 收集钢锭 | < 30% |
| BP05 | B3 钢管/钢梁 163 / B5 35 | 21% / 4% |
| BP06 | B6 注入铜金锭 | < 20% |
| BP07 | B3 电线 170 等 | 22% |
| BP08 | B4 电路板分流 | < 30% |
| BP09 | B6 不接入（本地 sink）| 上游 306 = 39% |
| BP10 | B6 注入快速线/石英 | < 40% |
| BP11 | B5 注入 SAM 系列 | < 5% |
| BP12 | B5 merger 注入 | < 10% |
| BP13 | B5 merger 注入 | < 10% |
| BP14 | B4 程序分流器进料 | < 30% |
| BP15 | B6 取 228 / B5 注入 11.5 | 29% / 1.5% |
| TERM-A/B | B5 出料汇集 | 396 = 51% |

（精确数字由原文 belt 流量计算结果重算得出。）

## 5. 实施顺序

1. **整目录 + 顶层文档复制**（一次操作）
   - `cp -r 2026-05-06-tier6-blueprints/ 2026-05-24-tier7-blueprints/`
   - `cp 2026-05-06-tier6-blueprint-design.md 2026-05-24-tier7-blueprint-design.md`
2. **改顶层 `2026-05-24-tier7-blueprint-design.md`** （最先，因为 BP 文件部分引用顶层规则）
3. **改 README.md**
4. **改 BP01-BP15** 按顺序
5. **改 BP-TERM-A、BP-TERM-B、BP-BUS-FILLER**
6. **验收 grep**：确认新文件夹里残留的 `Mk4` 字眼数量 ≤ 10 处，且每处都是历史对比/反例上下文

## 6. 验收标准

- [ ] 新文件夹存在，含 1 README + 18 BP = 19 文件；新顶层文存在
- [ ] 原 T6 文件夹 / 顶层文档完全不动
- [ ] 新文件里 `grep -c "Mk4"` 残留处都是历史对比/反例语境（人工抽查）
- [ ] 容量百分比与 Mk5 780/min 一致（抽样 5-10 处人工核验）
- [ ] 升级路径表里 T7 列「升 Mk5」类项全部消失或标记为已完成
- [ ] BP9 论证里不再出现「Mk4 容量不够」式被动语气
- [ ] 顶层文档「9. 已知 Tier 7+ 路由痛点」里 B2 升 Mk5 项已删除，B3 拆分项已加入
- [ ] 原方案 T9 时 B5 拆 B5a/B5b 的预案在新顶层文档里取消
- [ ] 顶层文档「## Tier 7+ 扩容详细规划」改名为「## Tier 8/9 扩容详细规划」

## 7. 不在本次范围

- C7 铝链 / C8 粒子 / C9 量子集群的独立 BP 文件（BP16-BP24）：留待后续 brainstorm 批次
- 机器布局、坐标、楼层、Power Switch 网络的任何调整
- 设计决策的实质重构（如 BP9 改上 B6、TERM-A/B 合并等）
- 原 T6 文档的任何修改

## 8. 风险与对策

| 风险 | 对策 |
|---|---|
| 容量百分比手工重算出错 | 类别 2 表格作为权威源，所有计算引用该表；抽样人工核验 |
| `Mk4` 残留过多影响阅读 | 验收 grep 阶段统一审视，把历史对比上下文加 `~~Mk4~~` 删除线或括号注释 |
| BP9/BP15 论证翻案后语义不连贯 | 单独人工 review BP09-plastic-rubber.md 和 BP15-crystal-osc-hsc.md 这两个最复杂的 |
| 顶层文档 1400 行改动遗漏 | 分章节改，每章节改完 grep 验收一次 |
