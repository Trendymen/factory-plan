# BP10 石英 + 硅土 + 快速线 + 混凝土 + AI 限制器 (C5)

## 概要

- **集群**: C5 MAM + 混凝土 + SAM
- **规格**: Mk2 **2 实例**（BP10a + BP10b，近似相同蓝图复制）
- **机器**: **28 台一次物理建造到位**（T9 上限分布 = 4 quartz + 7 silica + 10 quickwire + 5 concrete + 2 ai-limiter）。28 台分两个 14 台实例：
  - **BP10a 物理 14 台**：2 quartz + 3 silica + 5 quickwire + 3 concrete + 1 ai-limiter
  - **BP10b 物理 14 台**：2 quartz + 4 silica + 5 quickwire + 2 concrete + 1 ai-limiter
  - 两实例每实例固定 **5 quickwire + 1 ai-limiter**；silica/concrete 因 7/5 为奇数无法严格对半，按 3+4 / 3+2 分配（蓝图近似复制，仅 silica/concrete 实例数差 1）。
- **激活时间线**（仅翻 Power Switch + 插 Power Shard，不动结构；以下为**两实例合计**通电台数）:
  - T6 → 9 台通电（全部在 BP10a 1F：1 quartz + 1 silica + 3 quickwire + 3 concrete + 1 ai-limiter；BP10b 全关）
  - T7 → 15 台通电（合计 2 quartz + 3 silica + 5 quickwire + 4 concrete + 1 ai-limiter）
  - T8 → 23 台通电（合计 3 quartz + 5 silica + 8 quickwire + 5 concrete + 2 ai-limiter）
  - T9 → 28 台满载（合计 4 quartz + 7 silica + 10 quickwire + 5 concrete + 2 ai-limiter）
- **产能 T6**: 石英晶体 40.5 / 硅土 37.5 / 快速线 370 / 混凝土 111 / AI 限制器 5

> **核心设计原则**：**28 台机器在 T6 阶段就全部摆好 + belt/manifold/电网/Power Switch 全部接好**（BP10a 14 台 + BP10b 14 台一次性建完）。后续升 Tier 时**不重新放机器、不重新拉 belt**——只需 (1) 翻对应 Power Switch (2) 插 Power Shard (3) 调超频百分比。

> **快速线原料 = caterium 锭（钦金锭）**：标准 quickwire 配方为 `1 caterium 锭 → 5 快速线`（100% 时 12 caterium 锭/min → 60 快速线/min，5:1）。T6 快速线 370/min → caterium 锭 **74/min**。本蓝图**不使用铜金锭**喂快速线；需补一条 caterium 锭来源（74/min，与 BP6 铜金锭产线同套路：caterium 矿 → smelter → caterium 锭，经屋顶总线送到本图）。来源产线属上游蓝图/主设计范畴，本文件仅声明需求并在屋顶 B6 取料。

## 极简示意图

### BP10a（T6 主实例，14 台）

```floorstack
# BP10a 石英+硅土+快速线+混凝土+AI限制器 (C5) · 自下而上
1F (0-15m) | 建造机×8（石英晶体×1·硅土×1·快速线×3·混凝土×3）+ AI限制器机×1（T6 全部通电） | 原始石英 90·石灰石 333·caterium 锭 74·铜片 25 | 石英晶体·硅土·快速线·混凝土·AI限制器 → 屋顶 | ↑屋顶:5物料
2F (19-34m) | 建造机×5（石英晶体×1·硅土×2·快速线×2，T6 全部暂未通电） | 原始石英·石灰石 | 5物料 → 屋顶 | ↑屋顶:5物料
屋顶 (35-40m) | 汇料台 | caterium 锭 74·铜片 25 | 混凝土 96 → 外运·石英晶体 18+快速线 210+AI限制器 → 外运·终端 140 |
```

> BP10a T6 阶段 1F 全 9 台通电（含 ai-limiter）；2F 5 台物理建好但 Power Switch 全关，T7+ 渐次启用。

### BP10b（近似复制，14 台，T6 全 OFF）

```floorstack
# BP10b 石英+硅土+快速线+混凝土+AI限制器 (C5) · 自下而上
1F (0-15m) | 建造机×8（石英晶体×1·硅土×1·快速线×3·混凝土×2）+ AI限制器机×1（T6 全部暂未通电） | 原始石英 90·石灰石·caterium 锭·铜片 | 5物料 → 屋顶 | ↑屋顶:5物料
2F (19-34m) | 建造机×5（石英晶体×1·硅土×2·快速线×2，T6 全部暂未通电） | 原始石英·石灰石 | 5物料 → 屋顶 | ↑屋顶:5物料
屋顶 (35-40m) | 汇料台（结构同 BP10a） | caterium 锭·铜片 | 混凝土·石英晶体·快速线·AI限制器 → 外运·终端（同 BP10a，产能叠加） |
```

> BP10b 与 BP10a 近似复制，仅 silica 4 台、concrete 2 台；T6 阶段全 14 台 Power Switch 关，T7+ 逐步启用。两实例共享同一屋顶总线路由，产能叠加。
