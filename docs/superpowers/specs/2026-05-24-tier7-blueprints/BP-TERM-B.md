# BP-TERM-B 终端汇流（后 13 mainNode + 1 共享 sink）

## 概要

- **集群**: 总线最末端（紧贴 BP-TERM-A 之后）
- **规格**: Mk2 单实例
- **建筑**: 13 个 Dim Depot 位面存储站上传器（T6 后半批，5×10×8m **尺寸待游戏内实测**）+ **9 个 T7+ 预留位面存储站上传器（2F，T6 物理建好但 Power Switch 关）** + **1 个共享 AWESOME回收器 (16×13×24m)** + 22 个 smart 分离器 + **13 个合并器（3 级级联汇 26 路 overflow，合并器为 3 进 1 出）**
- **作用**: 26 mainNode 中的**后 13 个**送入位面存储站 + **唯一共享 AWESOME回收器** 兜底所有 26 mainNode 的 overflow
- **激活时间线**（仅翻 Power Switch + 按需给位面存储站上传器插 Power Shard，**AWESOME回收器不超频**，不动结构）:
  - T6 → 13 个 mainNode 位面存储站上传器 (U14-U25 在 1F + U26 在 2F，均属 Network A) + 共享 AWESOME回收器 通电；2F 9 个 T7+ 槽位 Power Switch 关
  - T7 → 翻 Network B Switch ON → 铝制外壳 / RCU / 超级计算机 3 个位面存储站上传器通电
  - T8 → 翻 Network C Switch ON → 涡轮马达 / 融合模块 / 冷却系统 3 个通电
  - T9 → 翻 Network D Switch ON → 神经处理器 / 叠加振荡器 / F金三角 3 个通电（满 22 位面存储站上传器）

> **核心设计原则**：**全部 22 个位面存储站上传器 + 共享 AWESOME回收器 + smart 分离器 + 13 合并器树 + 4 个 Power Switch 在 T6 阶段就一次物理建造到位 + belt/lift/cascade/电网全部接好**。后续升 Tier 时**不重新放机器、不重新拉 belt**——只需 (1) 翻对应 Power Switch (2) 给新通电位面存储站上传器插 Power Shard（如需超频；AWESOME回收器永不超频）。
>
> **例外**：需要并联位面存储站上传器 / 拆 belt 的高流量路（如 T9 二氧化硅 690、急速电线 1384），其全部并联线必须在所属蓝图 T6 阶段一次预建；本蓝图无富余净空，故这两路并联扩容移交 BP-TERM-C（详见下文）。

> ⚠ **共享 AWESOME回收器设计依据**：AWESOME回收器 **无超频、无内在吞吐上限**——它按入料 belt 的实际速率吃料，单条 Mk5 入料即 780/min。26 个 mainNode 的 overflow 经合并器树汇成 1 条 belt 进 AWESOME回收器 in-0；本蓝图 13 路 overflow 加 BP-TERM-A 13 路，汇总流量（T6 数百/min 量级，远 << 780）单条 Mk5 + 单个 AWESOME回收器 即可吃下。无需插 Power Shard、无需超频。
>
> ⚠ **架构修正历史**：原方案有「重油残渣 AWESOME回收器」+ 26 AWESOME回收器 1:1。后修正为残渣本地处理（BP9 内就地 AWESOME回收器，不上 B6）+ AWESOME回收器共享。AWESOME回收器实际尺寸 **16m × 13m × 24m**（高 24m≈3 cell，跨 1F+2F；1 固体输入口、0 输出；只吃固体）。1:1 配比 26 AWESOME回收器占地 5,408m² 远超单 Mk2 1,600m²，必须共享。

## 极简示意图

```floorstack
# BP-TERM-B · 后13种主节点料 + 共享AWESOME回收器 · 40×40m · 自下而上
1F (0-12m) | 位面存储站上传器×12 + 共享AWESOME回收器 + 合并器×13 | 后13种主节点料 187/min · BP-TERM-A 来的溢出料 | 12路 → 位面存储站(Dimensional Depot) · 26路溢出 → AWESOME回收器 |
2F (16-32m) | 位面存储站上传器×10（U26 T6通电 + 9个科技7阶后预留槽位） | T6+T7-9阶主节点料 | 10路 → 位面存储站(Dimensional Depot) |
屋顶 (35-40m) | 分离器 | 把主干料分送各层位面存储站上传器 | 后13路分下各层喂位面存储站上传器 | ↓1F:主节点料
```

> BP-TERM-B 取后13种主节点料送位面存储站(Dimensional Depot)；唯一共享AWESOME回收器兜底全部26路溢出（本蓝图13路 + BP-TERM-A 来的13路）；2F 含 T6 通电的 U26 及科技7阶后预留槽位。

## 超频 & 碎片

无超频：位面存储站上传器 / AWESOME回收器均不超频、不插碎片；T6 通电 14 台（1F 12 台 U14-U25 + 2F U26 + 共享AWESOME回收器），T7+ 逐步启用 2F 预留槽位（铝制外壳/RCU/超级计算机 → 涡轮马达/融合模块/冷却系统 → 神经处理器/叠加振荡器/F金三角，每阶 3 台）。
