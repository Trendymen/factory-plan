# BP-TERM-A 终端汇流（前 13 mainNode，无 sink）

## 概要

- **集群**: 总线尾端（紧贴 BP15 之后）
- **规格**: Mk2 单实例
- **建筑**: 13 个 Dim Depot Uploader（**5×10×8m，尺寸待游戏内实测**，假设参照 storage）+ 13 个 smart splitter（每 mainNode 1 个，filter=该物料，priority=Uploader / overflow→ overflow belt）+ 6 个 merger（overflow 13 路级联汇流，merger 为 3in1out）
- **作用**: 26 mainNode 中的**前 13 个**送入位面仓；**overflow 不在本蓝图 sink，全部走 belt 反向到 BP-TERM-B 共享 sink**

> **本蓝图无生产机器**；所有 Uploader / smart splitter / belt / lift / wall mount T6 一次建造到位，**不涉及 Power Switch**（Uploader 0 W 耗电）。T7+ 扩容仅需在 2F 预留槽位补建 Uploader+splitter，不动现有结构。

## 极简示意图

```floorstack
# BP-TERM-A · 前13 mainNode 位面仓 · 40×40m · 自下而上
1F | 上传机×13 + 合流×6 | 前13路 mainNode 209/min | 13路 → 位面仓 · overflow → BP-TERM-B |
2F | 上传机×3（T7+预留槽位） | T7-9 新增 mainNode | 新增路 → 位面仓 |
屋顶 | 分流 | 总线前13路 | 13路下1F · 13路续 BP-TERM-B | ↓1F:mainNode料
```

> BP-TERM-A 取总线前 13 个 mainNode 送位面仓；本蓝图无 sink，overflow 汇流后交给 BP-TERM-B 共享 sink。
