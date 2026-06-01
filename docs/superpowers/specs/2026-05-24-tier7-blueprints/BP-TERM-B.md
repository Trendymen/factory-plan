# BP-TERM-B 终端汇流（后 13 mainNode + 1 共享 sink）

## 概要

- **集群**: 总线最末端（紧贴 BP-TERM-A 之后）
- **规格**: Mk2 单实例
- **建筑**: 13 个 Dim Depot Uploader（T6 后半批，5×10×8m **尺寸待游戏内实测**）+ **9 个 T7+ 预留 Uploader（2F，T6 物理建好但 Power Switch 关）** + **1 个共享 awesome-sink (16×13×24m)** + 22 个 smart splitter + **13 个 merger（3 级级联汇 26 路 overflow，merger 为 3 进 1 出）**
- **作用**: 26 mainNode 中的**后 13 个**送入位面仓 + **唯一共享 sink** 兜底所有 26 mainNode 的 overflow
- **激活时间线**（仅翻 Power Switch + 按需给 Uploader 插 Power Shard，**sink 不超频**，不动结构）:
  - T6 → 13 个 mainNode Uploader (U14-U25 在 1F + U26 在 2F，均属 Network A) + 共享 sink 通电；2F 9 个 T7+ 槽位 Power Switch 关
  - T7 → 翻 Network B Switch ON → 铝壳 / RCU / 超级计算机 3 个 Uploader 通电
  - T8 → 翻 Network C Switch ON → 涡轮电机 / 融合模块 / 冷却系统 3 个通电
  - T9 → 翻 Network D Switch ON → 神经处理器 / 叠加振荡器 / 虚构三角 3 个通电（满 22 Uploader）

> **核心设计原则**：**全部 22 个 Uploader + 共享 sink + smart splitter + 13 merger 树 + 4 个 Power Switch 在 T6 阶段就一次物理建造到位 + belt/lift/cascade/电网全部接好**。后续升 Tier 时**不重新放机器、不重新拉 belt**——只需 (1) 翻对应 Power Switch (2) 给新通电 Uploader 插 Power Shard（如需超频；sink 永不超频）。
>
> **例外**：需要并联 Uploader / 拆 belt 的高流量路（如 T9 硅土 690、快速线 1384），其全部并联线必须在所属蓝图 T6 阶段一次预建；本蓝图无富余净空，故这两路并联扩容移交 BP-TERM-C（详见下文）。

> ⚠ **共享 sink 设计依据**：AWESOME Sink **无超频、无内在吞吐上限**——它按入料 belt 的实际速率吃料，单条 Mk5 入料即 780/min。26 个 mainNode 的 overflow 经 merger 树汇成 1 条 belt 进 sink in-0；本蓝图 13 路 overflow 加 BP-TERM-A 13 路，汇总流量（T6 数百/min 量级，远 << 780）单条 Mk5 + 单个 sink 即可吃下。无需插 Power Shard、无需超频。
>
> ⚠ **架构修正历史**：原方案有「重油残渣 sink」+ 26 sink 1:1。后修正为残渣本地处理（BP9 内就地 sink，不上 B6）+ sink 共享。awesome-sink 实际尺寸 **16m × 13m × 24m**（高 24m≈3 cell，跨 1F+2F；1 固体输入口、0 输出；只吃固体）。1:1 配比 26 sink 占地 5,408m² 远超单 Mk2 1,600m²，必须共享。

## 极简示意图

```floorstack
# BP-TERM-B · 后13 mainNode + 共享 sink · 40×40m · 自下而上
1F | 上传机×12 + 共享回收机 + 合流×13 | 后13路 mainNode 187/min · BP-TERM-A overflow | 12路 → 位面仓 · 26路 overflow → sink |
2F | 上传机×10（U26 T6 + 9 个 T7+预留槽位） | T6+T7-9 mainNode | 10路 → 位面仓 |
屋顶 | 分流 | 总线后13路 | 9 路展开喂 Uploader | ↓1F:mainNode料
```

> BP-TERM-B 取总线后 13 个 mainNode 送位面仓；唯一共享回收机汇全部 26 路 overflow（本蓝图 13 路 + BP-TERM-A 来 13 路）；2F 含 T6 通电的 U26 及 T7+ 预留槽位。
