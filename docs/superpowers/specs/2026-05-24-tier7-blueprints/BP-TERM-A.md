# BP-TERM-A 终端汇流（前 13 mainNode，无 sink）

## 概要

- **集群**: 总线尾端（紧贴 BP15 之后）
- **规格**: Mk2 单实例
- **建筑**: 13 个 Dim Depot Uploader（**5×10×8m，尺寸待游戏内实测**，假设参照 storage）+ 13 个 smart splitter（每 mainNode 1 个，filter=该物料，priority=Uploader / overflow→ overflow belt）+ 6 个 merger（overflow 13 路级联汇流，merger 为 3in1out）
- **作用**: 26 mainNode 中的**前 13 个**送入位面仓；**overflow 不在本蓝图 sink，全部走 belt 反向到 BP-TERM-B 共享 sink**

> **本蓝图无生产机器**；所有 Uploader / smart splitter / belt / lift / wall mount T6 一次建造到位，**不涉及 Power Switch**（Uploader 0 W 耗电）。T7+ 扩容仅需在 2F 预留槽位补建 Uploader+splitter，不动现有结构。

## 极简示意图

```floorstack
# BP-TERM-A · 前13种主节点料 位面仓 · 40×40m · 自下而上
1F (0-12m) | 上传机×13 + 合流×6 | 前13种主节点料 209/min | 13路 → 位面仓(Dimensional Depot) · overflow → BP-TERM-B(后段共享回收机) |
2F (16-32m) | 上传机×3（科技7阶后预留槽位） | 科技7-9阶新增主节点料 | 新增路 → 位面仓(Dimensional Depot) |
屋顶 (35-40m) | 分流器 | 把主干料分送各层上传机 | 前13路分下1F · 多余料送往 BP-TERM-B | ↓1F:主节点料
```

> BP-TERM-A 取前13种主节点料送位面仓(Dimensional Depot)；本蓝图无回收机，overflow 汇流后全部交给 BP-TERM-B 后段共享回收机处理。
