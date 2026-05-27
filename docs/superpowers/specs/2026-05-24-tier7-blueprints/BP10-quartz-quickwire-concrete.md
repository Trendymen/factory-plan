# BP10 石英 + 硅土 + 快速线 + 混凝土 + AI 限制器 (C5)

## 概要

- **集群**: C5 MAM + 混凝土 + SAM
- **规格**: Mk2 **2 实例**（BP10a + BP10b，相同蓝图复制）
- **机器**: **28 台一次物理建造到位**（每实例 14 台：4 quartz + 7 quickwire + 5 concrete + 7 silica + 2 ai-limiter 的 T9 上限合并到 BP10a/b 各半）。BP10a 物理 14 台，BP10b 物理 14 台。
- **激活时间线**（仅翻 Power Switch + 插 Power Shard，不动结构）:
  - T6 → 9 台通电（BP10a：1 quartz + 1 silica + 3 quickwire + 3 concrete + 1 ai-limiter；BP10b 全关）
  - T7 → 15 台通电
  - T8 → 23 台通电
  - T9 → 28 台通电（满载）
- **产能 T6**: 石英晶体 40.5 / 硅土 37.5 / 快速线 370 / 混凝土 111 / AI 限制器 5

> **核心设计原则**：**28 台机器在 T6 阶段就全部摆好 + belt/manifold/电网/Power Switch 全部接好**（BP10a 14 台 + BP10b 14 台一次性建完）。后续升 Tier 时**不重新放机器、不重新拉 belt**——只需 (1) 翻对应 Power Switch (2) 插 Power Shard (3) 调超频百分比。

## 机器超频清单（T6，Plan C ≤250%）

| 配方 | 物理 | T6 通电 | 超频 | 单台产能 (/min) | Power Shard/通电台 |
|---|---:|---:|---:|---:|---:|
| quartz-crystal (constructor) | 4 | **1** | 180.0% | 40.5 | 2 |
| silica (constructor) | 7 | **1** | 100.0% | 37.5 | 0 |
| quickwire (constructor) | 10 | **3** | 205.56% | 123.33 | 3 |
| concrete (constructor) | 5 | **3** | 246.67% | 37.0 | 3 |
| ai-limiter (assembler) | 2 | **1** | 100.0% | 5.0 | 0 |
| **合计 (T6)** | 28 | 9 | — | — | 1×2 + 0 + 3×3 + 3×3 + 0 = **20** |

> T6 时未通电的 19 台机器：物理建好、belt 接好、shard 槽**空着**、Power Switch **关**，完全不耗电不产出。<br>
> 总产能验证 (T6): 1 × 40.5 = 40.5 石英 ✓ | 1 × 37.5 = 37.5 硅土 ✓ | 3 × 123.33 = 370 快速线 ✓ | 3 × 37 = 111 混凝土 ✓ | 1 × 5 = 5 AI 限制器 ✓

## 物料 I/O

| 方向 | 物料 | 流量 (T6) | 路径 |
|---|---|---|---|
| 输入 | 原始石英 | 78 | 矿场 → 左 Wall Inlet (h=4m) |
| 输入 | 石灰石 | 333 | 矿场 → 左 Wall Inlet (h=4m，第二口) |
| 输入 | 铜金锭 | 74 | **屋顶 B6** ← BP6 → smart splitter |
| 输入 | 铜板 | 25 | **屋顶 B6** ← BP7（与铜金锭同向走 B6）→ smart splitter |
| 输出 | 石英晶体 → BP15 晶振 | 18 | 屋顶 merger → B6 |
| 输出 | 石英晶体 → B5 终端 | 22.5 | 屋顶 merger → B5 |
| 输出 | 硅土 → B5 终端 | 37.5 | 屋顶 merger → B5 |
| 输出 | 快速线 → BP15 HSC | 210 | 屋顶 merger → B6 |
| 输出 | 快速线 → AI 限制器（内部）| 100 | 蓝图内 lift |
| 输出 | 快速线 → B5 终端 | 60 | 屋顶 merger → B5 |
| 输出 | 混凝土 → BP13 包裹 | 96 | 屋顶 merger → B4 |
| 输出 | 混凝土 → B5 终端 | 15 | 屋顶 merger → B5 |
| 输出 | AI 限制器 → B5 终端 | 5 | 屋顶 merger → B5 |

**屋顶总线接入**:
- 取自 B6 (铜金锭 74 + 铜板 25)
- 注入 B4 (混凝土 96)
- 注入 B5 (140 mainNode = 22.5+37.5+60+15+5)
- 注入 B6 (228 = 石英 18 + 快速线 210)

## 楼层占用（单实例 BP10a / BP10b 同结构）

| 层 | 高度 | 内容 | 物理台数 | T6 通电 |
|---|---|---|---:|---:|
| 1F | 0-10m | constructor row 0 (5 台) + concrete row 2 (3 台) + AI-limiter row 2 (1 台) | 9 | **9 (BP10a) / 0 (BP10b)** |
| 4m 地基 | 10-14m | 隔层 | — | — |
| 2F | 14-24m | constructor row 0 (4 台) + AI-limiter row 2 (1 台) — T7+ 扩容位 | 5 | **0** |
| 4m 地基 | 24-28m | 隔层 | — | — |
| 屋顶 | 35-40m | B1-B6 + 4 merger + smart splitter + lift | — | — |

> **T6 阶段**：BP10a 1F 9 台全部通电（Network A），其余 1F/2F 全部 Power Switch **关**。BP10b 全部 14 台物理建造但 Power Switch 全 OFF。所有 belt / lift / manifold / Power Switch 一次到位。

## 俯视图（按实际比例，每层独立）

**比例约定**（同 BP02）：1 字符 = 1m 横向；1 行 = 2m 纵向；蓝图 40×40m = 40 字符 × 20 行。

**图例**：
- `*` 后缀 = T6 通电；无 `*` = T7+ Power Switch 关（物理已建，不耗电不产出）
- `v` = front (south) 输出
- `8x10` = 8m 宽 × 10m 长

### 1F (0-10m): 9 台 — BP10a T6 全部通电 / BP10b 全 OFF

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌───────┐┌───────┐┌───────┐┌───────┐┌───────┐    │
        ││  Qz*  ││  Si*  ││  Qw1* ││  Qw2* ││  Qw3* │    │
 4      ││quartz ││silica ││quickwr││quickwr││quickwr│    │
        ││ 8x10  ││ 8x10  ││ 8x10  ││ 8x10  ││ 8x10  │    │
 8      ││   v   ││   v   ││   v   ││   v   ││   v   │    │
        │└───────┘└───────┘└───────┘└───────┘└───────┘    │
12      │──── row1 collect: 5 mat lanes (Qz/Si/Qw) ───────│
        │┌───────┐┌───────┐┌───────┐┌─────────┐           │
16      ││  Cn1* ││  Cn2* ││  Cn3* ││ AILim*  │           │
        ││concret││concret││concret││ai-limit │           │
20      ││ 8x10  ││ 8x10  ││ 8x10  ││ 10x15   │           │
        ││   v   ││   v   ││   v   ││  in*2   │           │
24      │└───────┘└───────┘└───────┘│   v     │           │
        │                            └─────────┘          │
28      │──── row2 collect: concrete + AI-limiter ────────│
32      │ raw-quartz 78:   left Wall Inlet h=4m row=0     │
        │ limestone 333:   left Wall Inlet h=4m row=2     │
36      │ copper-ingot 74 + copper-plate 25: B6 split    │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- row 0：1 quartz + 1 silica + 3 quickwire = 5 台 constructor，BP10a **T6 全部通电**
- row 2：3 concrete + 1 AI-limiter assembler = 4 台，BP10a **T6 全部通电**
- BP10b 同布局，但 9 台全部 Power Switch OFF（shard 槽空）
- 5 物料独立 row 收集：Qz/Si 走 row=1，3 Qw 走 row=1（共享 lane 但物料独立 belt），concrete 走 row=2.5，AI-limiter 走 row=3.5
- 进料：左 Wall Inlet (h=4m, row=0/row=2) → splitter manifold 喂 **全部 9 台 1F + lift-up 喂 2F 5 台扩容**

### 2F (14-24m): 5 台 — T6 全部 Power Switch 关（belt/manifold 已接好）

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │┌───────┐┌───────┐┌───────┐┌───────┐                │
        ││  Qz2  ││  Si2  ││  Qw4  ││  Qw5  │ row 0: 4 台    │
 4      ││quartz ││silica ││quickwr││quickwr│ T6 Switch OFF  │
        ││ 8x10  ││ 8x10  ││ 8x10  ││ 8x10  │ → T7 渐次 ON   │
 8      ││   v   ││   v   ││   v   ││   v   │ (Network B)    │
        │└───────┘└───────┘└───────┘└───────┘                │
12      │──── row1 collect (扩容 lane，与 1F 同物料) ───────│
        │┌───────┐                                          │
16      ││ AILim2│  row 2: 1 台 AI 限制器扩容               │
        ││ai-limit  T6 Switch OFF → T8 翻 ON               │
20      ││ 10x15 │  (Network D)                             │
        ││  in*2 │                                           │
24      ││   v   │                                          │
        │└───────┘                                          │
28      │──── row2 collect ───────────────────────────────│
32      │ 进料：lift-up 从 1F manifold 上来 (h=4→16m)      │
        │ 出料：5 物料 lane → 屋顶 merger（与 1F 共用）    │
36      │                                                  │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- Qz2/Si2/Qw4/Qw5/AILim2：5 台机器 **物理建造完整**，T6 阶段 Power Switch **全关**
- Belt manifold + lift 一次性接到所有 5 台 in / front，与 1F manifold 共用进料路径
- 通电节奏：T7 开 Network B（row 0 4 台）；T8 开 Network D（AILim2）

### 屋顶 (35-40m): B6 上 smart-split + 4 merger（B4/B5/B6 注入）

```
        col=0       col=1       col=2       col=3       col=4
        0    4    8    12   16   20   24   28   32   36   40m
        ┌────┬────┬────┬────┬────┬────┬────┬────┬────┬────┐
 0      │ o B1 ───────────────────────────────────────── o│
 4      │ o B2 ───────────────────────────────────────── o│
 8      │ o B3 ───────────────────────────────────────── o│
12      │ o B4 ──────────────[merger ← concrete 96]───── o│
        │                            ↑ lift-top from 1F   │
16      │ o B5 ──────────────[merger ← mainNode 140]──── o│
        │                            ↑ Qz22.5+Si37.5+Qw60 │
20      │                              +Cn15+AI5 = 140    │
24      │ o B6 ─[smart f=Cu-ingot74+Cu-plate25]─[merger]─o│
        │          │ 99/min                  ↑            │
28      │       lift-bot                Qz18+Qw210        │
        │          ↓                       = 228          │
32      │       1F Qw in-0 + AI in-0     after split      │
36      │ B7/B8 reserved (T7+ slots)                      │
40      └────┴────┴────┴────┴────┴────┴────┴────┴────┴────┘
```

- B4 merger: 注入混凝土 96 → BP13 包裹下游取
- B5 merger: 5 物料 mainNode 余量混合 140
- B6 上**先 smart-splitter 后 merger**：splitter 取铜金锭 74 + 铜板 25 共 99 给 1F quickwire 3 台 + AI-limiter；merger 在 splitter 下游注入石英 18 + 快速线 210 = 228

## Power Switch 分网（单实例 BP10a；BP10b 同结构但所有 Switch T6=OFF）

把 14 台机器拆 4 个独立 Power Network，由 4 个 Power Switch 控制。**4 个 Switch 全部 T6 一次安装好**，T6 阶段 BP10a 只合 Network A，BP10b 全 OFF。

| 网 | 范围 | 数量 | T6 状态 (BP10a) | T6 状态 (BP10b) | 升级触发 |
|---|---|---:|---|---|---|
| Network A | 1F 全 9 台 (Qz/Si/3Qw/3Cn/AILim) | 9 | **ON** | OFF | — |
| Network B | 2F row 0 (Qz2/Si2/Qw4/Qw5) | 4 | OFF | OFF | T7 翻 ON（先 BP10a 后 BP10b） |
| Network C | 1F (BP10b 1F 9 台启用) | — | — | OFF | T7 翻 ON BP10b 1F |
| Network D | 2F AILim2 | 1 | OFF | OFF | T8 翻 ON |

> Power Switch 物理位置建议放 2F col=4.5（manifold 区角落），4 个并排，方便玩家在场内一眼区分。两实例总共 8 个 Switch（每实例 4 个）。

## 建造步骤（BP10a，BP10b 复制）

1. **框架**：5×5 cell × 5 cell 高（40×40×40m）
2. **1F (0-10m)**：放 9 台（row 0：1 Qz + 1 Si + 3 Qw = 5 constructor；row 2：3 Cn constructor + 1 AILim assembler）
3. **1F belt**：5 物料独立 lane（row=1 Qz/Si/Qw 共享，row=2.5 concrete，row=3.5 AI-limiter）
4. **1F 地基**：y=10m 铺 4m 厚地基覆盖整层
5. **2F (14-24m)**：放 5 台扩容机器（row 0：Qz2/Si2/Qw4/Qw5；row 2：AILim2）
6. **2F belt**：与 1F 共物料 lane，lift 接同一屋顶 merger
7. **2F 地基**：y=24m 铺 4m 厚地基
8. **垂直汇总**：5 条 lift-out-top（5 物料各 1 条）→ 屋顶 4 个 merger
   - 快速线先在 1F splitter 1→3（100 内部 + 210 上 B6 + 60 上 B5）
   - 石英晶体 1F splitter 1→2（18 上 B6 + 22.5 上 B5）
9. **进料**：
   - 原始石英 78：左 Wall Inlet (h=4m, row=0) → splitter → quartz **全部 4 台** + silica **全部 7 台**（BP10a + BP10b 合计）
   - 石灰石 333：左 Wall Inlet (h=4m, row=2) → splitter → **全部 5 台 concrete**
   - 铜金锭 74：屋顶 smart splitter → lift-bot → **全部 10 台 quickwire in-0**
   - 铜板 25：同 splitter → lift-bot → **全部 2 台 AI-limiter in-0**
10. **快速线 → AI 限制器**: 1F quickwire 输出 1 部分 → 短 belt → AI 限制器 in-1
11. **屋顶 (35m)**：铺 6 条 Mk4 平行 belt + 4 merger + smart splitter
12. **Power Switch ×4**：按上面"Power Switch 分网"表布置 Network A/B/C/D；BP10a T6 只合 A，BP10b T6 全部 OFF
13. **Power Shard（T6 阶段）**：仅 BP10a 1F 9 台插 shard（Qz 2 shard + 3 Qw × 3 + 3 Cn × 3 = 20 shard）；**其余 19 台物理已就位但 shard 槽空着**

## Tier 7+ 启用流程（仅翻 Switch + 插 shard，不动结构 / 不动 belt）

| Tier | 操作 | 通电总数 |
|---|---|---:|
| T7 | 翻 BP10a Network B Switch ON + BP10b Network A Switch ON → 共 15 台通电；各台插对应 shard 调超频 | 15 |
| T8 | 翻 BP10b Network B Switch ON + BP10a Network D ON → 23 台 | 23 |
| T9 | 翻 BP10b Network D Switch ON → **28 台满载**；矿场来料 belt 升 Mk5/Mk6 按物料流量 | 28 |

## 多实例侧墙续接

BP10 是 **2 实例 + 无机器层跨蓝图 belt**：BP10 不消化集群内部物料（输入全从屋顶 B6 取或左 Wall Inlet，输出全到屋顶 B4/B5/B6）。BP10a/b 之间机器层无短 belt。

蓝图侧墙集群内 mount（机器层）：**无**（BP10 蓝图侧墙仅有屋顶 6 belt mount）。

> T6 仅 BP10a 9 台通电；BP10b 物理 14 台全部建造但 0 激活。
> T7+ 启用 BP10b 时，所有物料仍走屋顶（不需要机器层短 belt）。

## 关键路由

- **铜板从 BP7（C3）跨 C4 到 BP10（C5）**：经 B6 总线携带（与铜金锭同向）。BP10 屋顶 smart splitter 必须同时取 铜金锭 74 + 铜板 25 = 99/min（按 filter 类型分两个 splitter 输出）。
- **混凝土反向到 BP13（C6 → 但 BP13 在 BP10 后面，所以是正向）**：B4 总线在 BP10 注入 96，BP13 在 BP10 之后取走，正向流。

## 验证

- [ ] **28 台机器全部物理放置**（BP10a 14 台 + BP10b 14 台，包括 T6 不通电的 19 台）
- [ ] Belt manifold + lift 接到全部 28 台 in / front（不只是 T6 通电的 9 台）
- [ ] 每实例 4 个 Power Switch 一次建好（共 8 个），BP10a Network A 合上，其余 7 个 Switch 断开
- [ ] T6 仅 BP10a 1F 9 台插了 shard；其余 19 台物理就位但 shard 槽空
- [ ] B6 上铜金锭+铜板 99 流量满足 BP10 取（B6 BP7→BP10 段需 ≥ 99）
- [ ] 5 物料独立 row（不混料）
- [ ] 屋顶 4 个 merger filter 正确（B4=混凝土、B5=5 mainNode 混、B6=石英+快速线、smart split B6 取铜金/铜板）
- [ ] AI 限制器**已迁移到此**，BP8 不再有
- [ ] 矿场来料 belt 容量按 T9 流量预留（T9 升 Mk5/Mk6；T6 临时 Mk4 可，物理升级位置预留好）
