# BP13 模块化框架 + 包裹工业梁 (C6)

## 概要

- **集群**: C6 装配（紧贴 BP12 之后）
- **规格**: Mk2 单实例
- **机器**: **6 assembler 一次物理建造到位**（4 modular-frame + 2 encased-industrial-beam）
- **激活时间线**（仅翻 Power Switch + 插 Power Shard，不动结构）:
  - T6 → 5 台通电（3 frame + 2 beam；其余 1 台 frame Power Switch 关）
  - T7 → 5 台通电（同 T6，仅超频百分比不变）
  - T8 → 6 台通电（开第 4 台 frame）
  - T9 → 6 台通电（满载）
- **产能**: T6 模块化框架 12 / 包裹工业梁 16 → T8+ 模块化框架 **16** / 包裹工业梁 16

> **核心设计原则**：**6 台 assembler 在 T6 阶段就全部摆好 + belt/manifold/电网/Power Switch 全部接好**。后续升 Tier 时**不重新放机器、不重新拉 belt、不动 lift**——只需 (1) 翻对应 Power Switch (2) 插 Power Shard (3) 调超频百分比。<br>
> **唯一例外**：T8 开 M4 时需在屋顶 B2 programmable splitter 改一次分配参数（RIP 18→24、rod 72→96），belt 物理不动（详见「物料 I/O」T8 缺料补丁）。

## 极简示意图

```floorstack
# BP13 模块化框架+包裹工业梁 (C6) · Mk2 单实例 · 自下而上
1F | 模块框架 组装机×4（模块框架，T6 通电3） | 强化铁板 18·铁棒 72 | 模框 12/min（10→BP14·2→终端） |
2F | 包裹梁 组装机×2（包裹工业梁） | 钢梁 48·混凝土 96 | 包裹梁 16/min（10→BP14·6→终端） |
屋顶 | 总线汇流 | 强化铁板·铁棒·钢梁·混凝土 | 模框2·包裹梁6 = 8/min |
```

> 两层独立生产（frame/beam 各一层），各自分流后 10/min 走集群内短 belt 直送 BP14，余量经屋顶 merger 注 B5 终端；T8 翻开 M4 时需同步调整屋顶 B2 programmable splitter 配置上量。
