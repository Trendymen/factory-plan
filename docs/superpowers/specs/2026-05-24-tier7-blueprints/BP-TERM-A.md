# BP-TERM-A 终端汇流（前 13 mainNode，无 sink）

## 概要

- **集群**: 总线尾端（紧贴 BP15 之后）
- **规格**: Mk2 单实例
- **建筑**: 13 个 Dim Depot 位面存储站上传器（**5×10×8m，尺寸待游戏内实测**，假设参照 storage）+ 13 个 smart 分离器（每 mainNode 1 个，filter=该物料，priority=位面存储站上传器 / overflow→ overflow belt）+ 6 个合并器（overflow 13 路级联汇流，合并器为 3in1out）
- **作用**: 26 mainNode 中的**前 13 个**送入位面存储站；**overflow 不在本蓝图 sink，全部走 belt 反向到 BP-TERM-B 共享 AWESOME回收器**

> **本蓝图无生产机器**；所有位面存储站上传器 / smart 分离器 / belt / lift / wall mount T6 一次建造到位，**不涉及 Power Switch**（位面存储站上传器 0 W 耗电）。T7+ 扩容仅需在 2F 预留槽位补建位面存储站上传器+分离器，不动现有结构。

## 极简示意图

```floorstack
# BP-TERM-A · 前13种主节点料 位面存储站 · 40×40m · 自下而上
1F (0-12m) | 位面存储站上传器×13 + 合并器×6 | 前13种主节点料 209/min | 13路 → 位面存储站(Dimensional Depot) · overflow → BP-TERM-B(后段共享AWESOME回收器) |
2F (16-32m) | 位面存储站上传器×3（科技7阶后预留槽位） | 科技7-9阶新增主节点料 | 新增路 → 位面存储站(Dimensional Depot) |
屋顶 (35-40m) | 分离器 | 把主干料分送各层位面存储站上传器 | 前13路分下1F · 多余料送往 BP-TERM-B | ↓1F:主节点料
```

> BP-TERM-A 取前13种主节点料送位面存储站(Dimensional Depot)；本蓝图无AWESOME回收器，overflow 汇流后全部交给 BP-TERM-B 后段共享AWESOME回收器处理。
