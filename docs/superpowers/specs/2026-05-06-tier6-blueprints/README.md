# Tier 6 大而全蓝图 — 分册手册

> 主设计文档：[../2026-05-06-tier6-blueprint-design.md](../2026-05-06-tier6-blueprint-design.md)
>
> 本目录是**逐蓝图施工手册**，每个 `.md` 文件对应一个 Mk2 蓝图。游戏内开蓝图设计器时按文件内容从下到上拼装即可。

## 蓝图索引

### 生产蓝图（15 个唯一 / 22-24 个 Mk2 实例）

| 集群 | 蓝图 | 当前激活 | 满载 | 拆分 | 文件 |
|---|---|---:|---:|---|---|
| C1 铁系 | **BP1** 铁锭 | 9 | 18 | 1 Mk2 | [BP01-iron-ingot.md](BP01-iron-ingot.md) |
| C1 | **BP2** 铁板/铁棒/RIP | 18 | 33 | 2 Mk2 (a/b) | [BP02-iron-base.md](BP02-iron-base.md) |
| C1 | **BP3** 螺丝双线 | 9 | 19 | 1 Mk2 | [BP03-screw.md](BP03-screw.md) |
| C2 钢系 | **BP4** 钢锭 | 5 | 6 | 1 Mk2 | [BP04-steel-ingot.md](BP04-steel-ingot.md) |
| C2 | **BP5** 钢梁/钢管 | 5 | 8 | 1 Mk2 | [BP05-steel-beam-pipe.md](BP05-steel-beam-pipe.md) |
| C3 铜电 | **BP6** 铜锭/铜金锭 | 7 | 31 | 2 Mk2 (a/b) | [BP06-copper-smelt.md](BP06-copper-smelt.md) |
| C3 | **BP7** 铜板/电线/线缆 | 11 | 46 | 3 Mk2 (a/b/c) | [BP07-wire-cable.md](BP07-wire-cable.md) |
| C3 | **BP8** 电路板 | 1 | 8 | 1 Mk2 | [BP08-circuit-board.md](BP08-circuit-board.md) |
| C4 油 | **BP9** 塑料/橡胶 + 本地石油焦 | 5 | 32 | 5 Mk2 (a-e), T9 扩 7 (a-g) | [BP09-plastic-rubber.md](BP09-plastic-rubber.md) |
| C5 MAM | **BP10** 石英/硅土/快速线/混凝土/AI 限制器 | 9 | 28 | 2 Mk2 (a/b) | [BP10-quartz-quickwire-concrete.md](BP10-quartz-quickwire-concrete.md) |
| C5 末 | **BP11** 重生 SAM/SAM 波动器 | 3 | 3 | 1 Mk2 | [BP11-sam.md](BP11-sam.md) |
| C6 装配 | **BP12** 转子/定子/电机 | 5 | 7 | 1 Mk2 | [BP12-rotor-stator-motor.md](BP12-rotor-stator-motor.md) |
| C6 | **BP13** 模块化框架/包裹工业梁 | 5 | 6 | 1 Mk2 | [BP13-frame-encased-beam.md](BP13-frame-encased-beam.md) |
| C6 | **BP14** HMF/电脑 | 2 | 6 | 2 Mk2 (a/b) | [BP14-hmf-computer.md](BP14-hmf-computer.md) |
| C6 | **BP15** 晶振/HSC | 2 | 6 | 2 Mk2 (a/b) | [BP15-crystal-osc-hsc.md](BP15-crystal-osc-hsc.md) |
| **小计** | | **96** | **257** | T9 时新增 BP9f-g 扩到 7 实例 + 各 BP coke 内置 | |

### 终端蓝图（2 个）

| 蓝图 | 内容 | 文件 |
|---|---|---|
| **BP-TERM-A** | 前 13 mainNode Dim Depot Uploader + sink overflow | [BP-TERM-A.md](BP-TERM-A.md) |
| **BP-TERM-B** | 后 13 mainNode + 残渣 sink | [BP-TERM-B.md](BP-TERM-B.md) |

### 填充蓝图（按需，0-2 个）

| 蓝图 | 用途 | 文件 |
|---|---|---|
| **BP-BUS-FILLER** | 集群间留空隙时填充，保持总线连续 | [BP-BUS-FILLER.md](BP-BUS-FILLER.md) |

### Tier 7+ 扩容蓝图（参考，未来实施）

详见主设计文档 [§Tier 7+ 扩容详细规划](../2026-05-06-tier6-blueprint-design.md#tier-7-扩容详细规划)。

| 集群 | 蓝图 | 触发 |
|---|---|---|
| C7 铝链 | BP16a/b/c, BP17, BP18 | Tier 7 Bauxite Refinement |
| C8 粒子 | BP19a/b, BP20 | Tier 8 Leading-edge |
| C9 量子（**Mk3**）| BP21a/b, BP22, BP23, BP24 | Tier 9 Quantum/Matter |

---

## 通用约定

### 蓝图规格

- 所有生产蓝图 = **Mk2** = 40m × 40m × 40m 内部空间（5 × 5 × 5 cells，每 cell 8m）
- 蓝图设计器外框需要 1 cell 边距 → 实际工作区 **5×5×5 cells**

### 高度分层

```
40m ┌─────────────────────────┐
    │  屋顶总线层 35-40m       │  6 条 Mk4 belt 横穿，splitter/merger/lift 在此
35m ├─────────────────────────┤
    │  机器层 0-35m            │  按各蓝图分 1-3 层，含 4m 地基
 0m └─────────────────────────┘
       ↑                ↑
    左 Wall Inlet   右 Wall Outlet
```

机器净高（来自 [src/core/registry.ts](../../../src/core/registry.ts)）：

| 机器 | 净高 | 1F | 2F+（含 4m 地基）|
|---|---:|---:|---:|
| smelter | 10 | 10 | 14 |
| foundry | 9 | 9 | 13 |
| constructor | 8 | 8 | 12 |
| assembler | 8 | 8 | 12 |
| manufacturer | 12 | 12 | 16 |
| refinery | 31 | 31 | — |
| blender | 16 | 16 | 20 |

### 屋顶总线 6 条 belt（B1-B6）

| Belt | 内容 | 流量(/min) |
|---|---|---:|
| B1 | 螺丝（C1 → BP12 转子）| 350 |
| B2 | 螺丝/铁棒/RIP → C6 | 400.5 |
| B3 | 钢管/钢梁/电线 → C6 | 333 |
| B4 | 塑料/混凝土/电路板/线缆 → C6 | 276 |
| B5 | **26 mainNode 终端汇流** | 396 |
| B6 | 铜金锭/铜板/快速线/石英晶体/重油残渣 | 306 |

预留 B7/B8（Tier 7+ 扩容）= 屋顶 8 belt 槽位；当前 6 active + 2 空跑。

### 边界锚点

- **左边界面 (col=0)**：6 个 Conveyor Wall Inlet（屋顶层 35-40m）+ 集群内部短 belt 入口（机器层各高度）
- **右边界面 (col=5)**：6 个 Conveyor Wall Outlet（屋顶层）+ 集群内部短 belt 出口

跨蓝图连接靠 **Auto Connect (1.1 起)**：放置时按 R 切换，16m 内自动续接。

### ASCII 平面图惯例

每个蓝图给出 1F 的俯视图，比例 **1 字符 = 2m**（每 cell 8m = 4 字符 × 4 字符）：

```
俯视图（1F）：col 0 → 5（左→右），row 0 → 5（上→下）
┌────────────────────┐  40m
│ ▓▓▓ ▓▓▓ ▓▓▓ ▓▓▓   │  ▓ = 机器占地
│ ▓▓▓ ▓▓▓ ▓▓▓ ▓▓▓   │
│                    │
└────────────────────┘
←── 40m ──→
```

### 端口方向（registry 默认 facing=south）

- **back** = 上（北面），机器输入口（除 manufacturer 例外）
- **front** = 下（南面），机器输出口（除 manufacturer 例外）
- **manufacturer 反转**：input 在 front（南），output 在 back（北）

### 物料颜色编码（建议玩家手动统一）

- 铁锭 橙 / 铁板 青 / 铁棒 蓝 / 螺丝 绿
- 铜锭 浅橙 / 电线 红 / 线缆 深红 / 铜板 桃红
- 钢锭 深灰 / 混凝土 灰
- 塑料 半透 / 橡胶 黑

---

## 建造顺序建议

按集群顺序物理建造，每个集群内按 BP 编号顺序紧贴排列：

```
[BP1][BP2a][BP2b][BP3]   [BP4][BP5]   [BP6a][BP6b][BP7a][BP7b][BP7c][BP8]
  ────── C1 ──────       ── C2 ──    ─────────── C3 ───────────────

[BP9a][BP9b][BP9c][BP9d][BP9e]   [BP10a][BP10b][BP11]   [BP12][BP13][BP14a][BP14b][BP15a][BP15b]
  ──────────── C4 ──────────     ───── C5 ─────         ─────────── C6 ───────────

[BP-TERM-A][BP-TERM-B]
   ── 总线尾 ──
```

每个 Mk2 间距 = 0m（紧贴），Auto Connect 自动续接 6 条总线 belt。

---

## 验证清单（每个蓝图保存前）

- [ ] 屋顶 6 条 Mk4 belt 横穿（左 Wall Inlet → 右 Wall Outlet）
- [ ] 机器层无机器超出 5×5 cell × 35m 高
- [ ] 总线 splitter/merger 接的物料类型正确（智能/可编程分流器配置好 filter）
- [ ] 集群内部 belt 出口的 Wall Outlet 位置与下一蓝图 Wall Inlet 对齐
- [ ] 多层之间用 4m 地基隔层
- [ ] Power Switch 已分组接好闲置机器
- [ ] 机器净高未碰屋顶总线层（refinery 31m + 屋顶 5m = 36m，1m 余量）
