# 极简 BP 文档：表示法 + 渲染 + 游戏数据 深研报告

> 2026-06-01 · 两轨 deep-research workflow（9 角度 / 21 agents / 仅 WebSearch+WebFetch，禁浏览器）
> 服务目标：为每个 BP 出一版**极简示意图**——只表达「每层放哪些机器 / 进什么料出什么料 / 本 BP 的料往上或往下传到哪层」，文字放图下方，且仍能在现有 React `ManualView` 文档站浏览。

## 一句话结论

新版极简图采用唯一表示法 **【自下而上堆叠的楼层栈盒图 + 层间 ↑/↓ 流向箭头】**，渲染采用唯一方案 **【自定义 React 组件 + 自定义 fence 语言标签 ` ```floorstack `】**，复用 `ManualView.tsx` 现有 `components={{ pre: PreBlock }}` 拦截机制按 `className` 分流——带标签走新 SVG/HTML 楼层栈组件、无标签旧 ASCII 块原样保留，新旧并存可逐 BP 灰度。该方案用正常文本流 / SVG `<text>` 排版 CJK 标签，**从原理上不依赖中英文 1:2 等宽 advance**，彻底根治此前 53/70 张 ASCII 图竖线不对齐的结构性问题。

## 推荐表示法：楼层栈盒图

每层楼 = 一个横向盒子，按物理高度自下而上排列（底层冶炼 → 顶层制造/屋顶总线）。三要素一一映射：

1. **每层放哪些机器** — 盒内左列用文字 chip 列机器（如「9× smelter」），普通文本，不靠字符网格。
2. **进/出什么料** — 盒子左侧标进料（物料名+流量），右侧标出料（+目的地 BP）；外部进出料用伸入/伸出的小箭头。
3. **料往上/往下传到哪层** — 相邻盒子间竖直 ↑/↓ 箭头，旁标「物料 + 可选 lift Mk/流量 + 目标层」（对应游戏 Conveyor Lift 竖井语义）。

去掉传送带走线 / manifold / splitter 路径等细节，只保留 **层 / 机器 / 进出料 / 跨层方向** 四要素；每层盒子下方留一行简短说明。

## 推荐渲染：自定义组件 + `floorstack` fence 标签

- **架构同构、改动面小**：`ManualView.tsx` 已用 react-markdown ^10.1.0 + remark-gfm ^4.0.1，已有 `PreBlock` 截获 fenced code 交给自定义组件。只需在 `PreBlock` 内按内层 `code` 的 `className`（`language-floorstack`）分流，无新依赖。
- **零破坏灰度**：现有 70 张 ASCII 图都是无语言标签的 fenced 块（走 `AsciiBlock`）；新图用 ` ```floorstack ` 走新组件，旧块原样保留、随时回退。
- **根治 CJK 对齐**：盒框/箭头是矢量图形，文字是独立文本节点，位置由组件布局逻辑决定而非字符列对齐 → CJK 长短任意混排都不会错位，问题被结构性消除（自托管双宽字体方案已被 53/70 实证击穿）。

### 明确排除

| 方案 | 排除理由 |
|---|---|
| Mermaid flowchart | 仅作「最小开发量过渡备选」。`rehype-mermaid` 异步需 `MarkdownHooks`；自动布局对「楼层从下到上 + 料明确上下传」的空间语义控制力弱于自绘组件 |
| Sankey / 复杂流量节点图 | 链宽∝流量擅长瓶颈定位，但仅适用单向无环、节点一多退化「意大利面」，强调「流了多少量」而非「每层放什么+传到哪层」，与极简目标相反 |
| 继续修 ASCII `<pre>` 网格 | CJK 在等宽网格 1:2 advance 不可靠是结构性问题，继续投入是错误方向 |

## React 接入要点

1. 新建 `src/manual/FloorStackBlock.tsx`：纯函数组件，props 为解析后结构 `floors: { name, height?, machines: string[], inputs: string[], outputs: string[], upTo?, downTo?, note? }[]`；用 CSS Grid/Flex 渲染纵向盒栈（底层在下），盒间 SVG/HTML 箭头标 ↑/↓ + 目标层 + 流量。导出零依赖的 `parseFloorStack(text)` 按行 split 解析紧凑 DSL（不引入 yaml/重型库）。
2. 改 `ManualView.tsx` 的 `PreBlock`：读内层 `code` 的 `className`，含 `language-floorstack` → `<FloorStackBlock>`；否则维持 `<AsciiBlock>`。复用现有 `extractText()` 取原始文本，新增取 `code.className` 的小工具（语言标签在内层 `code` 上，非 `pre`）。
3. DSL 约定（作者显式声明跨层方向，组件不猜）：每行一层，`层名 | 机器列表 | 进料 | 出料 | ↑到X层:物料 / ↓到Y层:物料`，空字段留空；首行 `#` 注释跳过。
4. `manual.css` 增 `.floor-stack / .floor-box / .floor-arrow`；盒子自下而上（`column-reverse` 或倒序渲染），移动端纵向滚动，每层 note 放盒下方。
5. 先在 1 个代表 BP 试点确认中文渲染，再批量补块；旧 ASCII 块全程不动。

### BP01 样张（DSL 写法 + 渲染示意）

```floorstack
# BP01 铁锭 (C1) — 40×40m，自下而上
2F | 9× smelter (S10-S18) | 铁矿石(经 lift 上送) | 铁锭(右墙 Wall Outlet) |
1F | 9× smelter (S1-S9) | 铁矿石 610.5/min（左墙进料） | 铁锭(右墙 Wall Outlet) | ↑到2F:铁矿石(lift Mk5)
```

> 真实 BP01：1F+2F 各 9 台均冶炼，lift 上送的是**铁矿石**给 2F，成品经**右墙 Wall Outlet ×2 Mk5 槽**分流出料给 BP2。（样张数据口径见 openQuestions）

## 游戏数据核验（机器尺寸沿用 registry，未重复核验）

- **传送带 / 升降机吞吐**：Mk1-6 = 60 / 120 / 270 / 480 / 780 / 1200 items/min（lift 同档）。与项目 CLAUDE.md R22 / R28 **逐项一致，无需改动**。Mk.6=1200 为 1.0 现行上限。
- **分流器/合流器**：内部吞吐 2000/min 远超最快 belt(1200)，**永不是瓶颈** → 极简图可放心忽略分流/合流细节。
- **配方**（confirmed/high，1.x 现行）：Iron Ingot 30→30、Iron Plate 3 锭(30)→2 板(20)、Iron Rod 1 锭(15)→1 棒(15)、Screw 1 棒(10)→4 螺丝(40)、Steel Ingot 3 矿+3 煤(45)→3 锭(45)、Steel Beam 4 锭(60)→1 梁(15)、Steel Pipe 3 锭(30)→2 管(20)、Copper Ingot 30→30、Wire 1 锭(15)→2 线(30)、Cable 2 线(60)→1 缆(30)、Copper Sheet 2 锭(20)→1 板(10)、Plastic 3 油(30)→2 塑料(20)+1 HOR(10)、**Rubber 3 油(30)→2 橡胶(20)+2 HOR(20)**、Petroleum Coke 4 HOR(40)→12 焦(120)、Circuit Board 2 板(15)+4 塑料(30)→1(7.5)、Rotor 5 棒(20)+25 螺丝(100)→1(4)、Quartz 5 原(37.5)→3(22.5)、Quickwire 1 铸锭(12)→5(60)、Concrete 3 石灰(45)→1(15)。

### 需校正的数据点

- **Rubber 副产 Heavy Oil Residue = 2 (20/min)**，是 Plastic 副产 HOR = 1 (10/min) 的**两倍，不对称**。BP09 做「副产料往上/下传到哪层」标注时，Rubber 线 HOR 跨层速率按 20/min，不可照搬 Plastic 规则。
- 防误改记录：CLAUDE.md R22/R28 吞吐表已交叉验证与 wiki.gg 一致，**不要改**。
- 上游曾标 uncertain 的 5 条配方（Steel Pipe / Copper Sheet / Rubber 副产 / Quickwire / Concrete）本轮已全部实测 confirmed。

## 待用户拍板（openQuestions）

1. **数据口径**：极简图忠于真实 BP 文档数据，还是按简化口径重画？
2. **floorstack 数据来源**：作者手写 DSL 块（推荐，显式声明跨层方向、与正文解耦），还是组件从现有「楼层占用」表+「物料 I/O」段自动解析（需猜跨层方向、耦合格式）？
3. **跨层箭头信息量**：只标方向+物料名（更极简），还是加 lift Mk 等级/流量？
4. **DSL 字段顺序/分隔符**是否采纳 `层名 | 机器 | 进料 | 出料 | ↑/↓到X层:物料`。
5. **旧 ASCII 图去留**：新组件上线后删除，还是保留灰度并存（默认保留）？
6. 是否区分「BP 内跨层」与「跨 BP 传递」两种箭头样式（实线 vs 虚线）。

## 引用来源（31）

数据轨：satisfactory.wiki.gg 各配方页 + Conveyor_Belts / Conveyor_Lifts / Conveyor_Splitter；fandom 镜像旁证。
表示法轨：react-markdown / rehype-mermaid / react-markdown-mermaid（GitHub/npm）、mermaid.js.org、aphyr/grimoire 工厂建造法、Sankey 适用性（data-to-viz / vistable / chartmekko）、建筑流线图（archisoup / illustrarch）。
（完整 31 条 URL 见 workflow 输出 `tasks/w33pkqq1l.output`。）
