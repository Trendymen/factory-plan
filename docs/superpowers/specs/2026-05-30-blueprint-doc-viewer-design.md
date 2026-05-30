# 蓝图施工手册文档查看器（SVG 平面图 + md 实时解析）设计

> 状态：设计已通过分段确认，待用户 review → writing-plans。
> 日期：2026-05-30。分支：feat/engineering-rewrite。

## 1. 背景与问题

`docs/superpowers/specs/2026-05-24-tier7-blueprints/` 下 18 个 BP 施工手册（.md）用 ASCII 俯视图画工厂平面布局。**根本问题**：等宽字体里 CJK 全角字符占 2 格、ASCII 占 1 格，框内混排中文导致每行字符数不同 → 右侧 `│` 边框累积错位（见用户反馈截图）。靠调字体/补空格无法根治（不同浏览器、全角标点会再偏）。

**根治方向**：本项目本身是一个 Satisfactory 蓝图 SVG 查看器（React 19 + TS + Vite 8 + zustand + motion），已有完整渲染栈（FloorPlanView + Machine/Belt/Lift/Grid/Zone Renderer + registry 真实尺寸 + coordinate 坐标换算）。因此最优解不是修 ASCII，而是**把平面图变成结构化数据、用 SVG 按真实尺寸渲染**——对齐问题从根上消失，并附带缩放等能力。

## 2. 核心约束（来自用户确认）

1. **复用渲染能力，但绕过严格可建性校验**：要按 registry 真实尺寸画机器框/belt/网格并自动对齐；但示意图允许「前后出入口高度反、belt 穿过机器、机器紧贴」等简化，**不能被 R13 碰撞 / R14 belt 穿机器 / R16 垂直进出端口 / R17 不绕路 等规则判 error 卡住无法显示**。
2. **md 为唯一来源**：实时解析 docs 下 .md 渲染，改文档不动代码。平面图在 md 中以结构化方式引用，渲染时替换为 SVG。
3. **md 解析用 react-markdown**（用户选定，否决自研解析器）：成熟库在表格/嵌套列表/中文混排上更稳，`components` 注入机制把图块钩成组件自然；加 `remark-gfm` 支持表格（文档大量用表格）。约 ~50KB，本地自用可接受。
4. **首批打样 1-2 个 BP**：BP01（最简，9 smelter）+ BP14（manufacturer 叠层），验证架构再铺开。
5. **本地自用**：集成进现有 Vite app，`npm run dev` 查看，不做额外部署（YAGNI）。
6. **主查看器零回归**：不改 renderer/schema/store/FloorPlanView/coordinate/registry。

## 3. 整体架构

**骨架**：新建 `src/diagram/` 一条**独立渲染管线**，只依赖两个纯模块：
- `src/core/coordinate.ts`（已确认纯函数：`gridToSvg(col,row)` / `machineGridSize(dim,facing)` 已处理 facing 旋转 / `calcViewBox` / `resolvePortPosition` / `GRID_PX=80` / `PAD=40` / `METERS_PER_GRID=8`）
- `src/core/registry.ts`（`BUILDING_REGISTRY` 按 type 字符串键，真实米尺寸/端口/颜色）

**绕过校验的根本手段**：这条管线**绝不 import `src/core/schema.ts`**（validateScheme/validateSchemeDetailed 及 R13/R14/R16/R17 全部不进入）、**绝不 import `src/store/useAppStore.ts`**。不是「放宽规则」，而是这条路根本不接规则与全局状态 → 示意数据永不被校验、与主查看器零耦合零回归。

**视图共存**：复用现有 `ViewMode`（`single | linked`）扩一个 `manual`，TopBar 加「手册」按钮，App.tsx `<main>` 加 `viewMode==='manual'` 分支。不引 react-router。

**数据流**：
```
docs/.../*.md ──import.meta.glob(?raw)──▶ react-markdown(+remark-gfm)
   ├─ 普通 md 块 ──▶ React 元素（标题/表格/列表…）
   └─ ```diagram JSON 块 ──(components.code 拦截 language-diagram)──▶
        parseDiagramBlock ──▶ <DiagramView data={...}/>
                                 └─ 只读 registry + coordinate，画 SVG
```

## 4. 数据格式：```diagram 块

md 中用带语言标签的围栏块承载结构化图数据（人读无害、是解析锚点）：

````markdown
```diagram
{ "id": "BP01-1F", ... }
```
````

react-markdown 配 `components={{ code }}`：当 `className` 含 `language-diagram` → 取 children 文本 → `parseDiagramBlock` → `<DiagramView data={...}/>`；其它代码块走默认渲染。

**`DiagramScheme` 类型**（独立定义于 `src/diagram/diagramTypes.ts`，不复用严格的 `core/types.ts`）。BP01-1F 示例：

```json
{
  "id": "BP01-1F",
  "title": "BP01 1F (0-10m): 9 smelter",
  "grid": { "cols": 5, "rows": 5 },
  "machines": [
    { "id":"S1", "type":"smelter", "col":0.25, "row":0.5, "facing":"south", "label":"S1*", "recipe":"铁锭" },
    { "id":"S2", "type":"smelter", "col":1.0,  "row":0.5, "facing":"south", "label":"S2*" }
  ],
  "belts": [
    { "id":"b1", "mark":2, "from":"S1:out-0", "to":"S2:in-0",
      "path": [[0.5,1.5],[4.5,1.5]], "label":"collect #1" }
  ],
  "zones": [ { "label":"冶炼区", "col":0, "row":0, "w":5, "h":2, "color":"#3a8" } ],
  "notes": [ { "col":4, "row":3, "text":"→ 送往 2F" } ]
}
```

**约定（全部宽松、零硬校验）**：
- `col`/`row`：**子 cell 坐标，1 cell = 8m，允许小数、允许重叠、不校验对齐**（对应文档里 `col=0.75`=6m 这类半格坐标）。
- `type` 必须是 `BUILDING_REGISTRY` 的 key（决定真实尺寸/颜色/端口）；**未知 type → 画灰占位框 + dev `console.warn`，不抛错**（用 `BUILDING_REGISTRY[type] ?? 兜底`，不调会 throw 的 `getBuildingMeta`，封装为 `safeGetBuildingMeta`）。
- **机器尺寸永远由 registry 决定，data 里绝不写尺寸** → 从根上保证与真实一致、对齐正确（ASCII 右侧对不齐问题消失）。
- `belt.path`：折点序列，**原样画 polyline，允许穿机器/绕路/斜线**；`from`/`to`（`机器id:端口id`）可选，用 `resolvePortPosition` 自动把首尾点贴到端口（消除视觉缝隙），中间折点不动。
- `facing` 默认 `south`；`recipe`/`label`/`zones`/`notes` 可选。
- `mark` 仅作 belt 样式（粗细/标签），不做容量校验。

## 5. 渲染：DiagramView 与子层

`DiagramView`（`src/diagram/DiagramView.tsx`）组合纯 SVG 子层，自管本地状态（`useState`/`useRef`），不接 store：
- `viewBox`：由 `grid.cols/rows`（或数据 bounds，`computeBounds`+`fitViewBox`）经 `calcViewBox` 自动算，居中自适应，**无需手填坐标**。
- 子层顺序（z 序）：网格 → zones → 机器 → belt → notes/label 文字。全部经同一 `gridToSvg` → 像素级对齐。
- 机器（`DiagramMachineRenderer`）：`safeGetBuildingMeta(type)` 取 dimensions → `machineGridSize(dim,facing)`（已处理旋转）→ `gridToSvg(col,row)` → 画 footprint 外框 + body 内框（复刻 MachineRenderer 的 inset 风格保持观感）+ 端口点（in 橙 `#ff9800` / out 绿 `#4caf50`，仅示意，不校验高度/方向）+ label/recipe 文字。
- belt（`DiagramBeltRenderer`）：`belt.path` 折点 → `gridToSvg` → polyline（虚线 + 末端箭头，`atan2` 取末段角度）；有 `from`/`to` 时 `resolvePortPosition` 补首尾点。
- 网格（`DiagramGridRenderer`）：背景网格，与机器共用 `gridToSvg` 保证对齐。
- zones/notes：可并入 DiagramView，不单独成文件（YAGNI）。
- **叠层 BP14**：单个 diagram 块只画一层；BP14 的 1F/2F 用**两个 diagram 块**分别画（最简够用）。多层叠一张图留作后续。
- 交互：组件内 hover 高亮（可选）+ 滚轮缩放（可选），不接全局 store。首批可先静态，缩放为加分项。

## 6. 文档站：ManualView

`src/manual/ManualView.tsx`：
- 左侧 BP 目录树：对 `import.meta.glob('/docs/superpowers/specs/2026-05-24-tier7-blueprints/*.md', { query:'?raw', import:'default', eager:false })` 的 key 解析文件名排序成可点击列表。
- 右侧文档区：点目录项 → 懒加载该 md raw → react-markdown(+remark-gfm) 渲染，`components.code` 把 `language-diagram` 块替换为 `<DiagramView>`。
- 当前 BP 用 ManualView 局部 `useState`，不进全局 store。
- 锚点/TOC：解析 `##` 标题生成 id（react-markdown rehype-slug 可选，首批可不做）。
- 样式：`src/manual/manual.css`（目录树 / 正文 typography / 表格 / 图块容器 / 错误卡片）。

## 7. 健壮性（保证单个坏块不拖崩文档站）

- `parseDiagramBlock` 全程 try/catch：JSON 解析失败 → 返回错误对象 → DiagramView 渲染**红色错误卡片**（含原始文本 + 错误信息），文档其余正文照常显示。
- 未知 `type` → 灰占位框 + `console.warn`，不抛错。
- `coordinate`/`registry` 返回 NaN/缺失 → 跳过该实例并 warn，不崩整图。
- ManualView 外层用现有 `react-error-boundary` 兜底。

## 8. 测试（vitest）

- `src/__tests__/parseDiagramBlock.test.ts`：合法 JSON → 结构正确；坏 JSON → 错误对象不抛；未知 type → 占位不崩；缺省字段 → 默认值。
- `src/__tests__/diagramGeometry.test.ts`：`computeBounds`/`fitViewBox` 纯函数算例；machine 经 registry 尺寸映射到正确 SVG 矩形（含 facing 旋转一例）。
- 不测 React 渲染像素（靠 chrome-devtools 截图人工验收）。

## 9. 打样验收标准

1. `npm run dev` → 顶栏点「手册」→ 进入文档站，左侧 BP 列表。
2. 打开 BP01 → 正文 md 正常渲染（标题/表格/列表），```diagram 块替换为 SVG：9 个 smelter 按真实 6×9m 画、对齐网格，**右侧不再有 ASCII 对不齐问题**。
3. 打开 BP14 → 1F/2F 两个 diagram 块各画 1 台 manufacturer（20×22m），叠层用两块分别呈现。
4. 故意写错一个 type / 坏 JSON → 红卡片或灰框，文档不崩。
5. 切回「蓝图」视图 → 主查看器行为与改动前完全一致（chrome-devtools 截图比对）。

## 10. 文件清单

**新增** `src/diagram/`：
- `diagramTypes.ts` —— `DiagramScheme`/`DiagramMachine`/`DiagramBelt`/`DiagramZone`/`DiagramNote`，用 `{col,row}` 子 cell 坐标，独立于 core/types.ts
- `diagramGeometry.ts` —— 薄封装/re-export coordinate.ts 的 `gridToSvg`/`machineGridSize`/`resolvePortPosition`/`calcViewBox`/`GRID_PX`/`PAD`；新增 `computeBounds()`/`fitViewBox()`/`safeGetBuildingMeta()`
- `parseDiagramBlock.ts` —— 围栏文本 → `DiagramScheme`，try/catch 永不抛错，软校验
- `DiagramView.tsx` —— 容器：auto-fit viewBox、本地状态、组合子层、错误卡片
- `DiagramMachineRenderer.tsx` / `DiagramBeltRenderer.tsx` / `DiagramGridRenderer.tsx`

**新增** `src/manual/`：`ManualView.tsx` / `manual.css`

**新增测试**：`parseDiagramBlock.test.ts` / `diagramGeometry.test.ts`

**改动现有**：
- `src/core/types.ts` —— `ViewMode` 增 `'manual'`
- `src/ui/TopBar.tsx` —— 视图模式数组加 `{ id:'manual', label:'手册' }`
- `src/App.tsx` —— `<main>` 加 manual 分支；调整「加载方案中」分支不挡 manual（手册不依赖 currentScheme）
- `package.json` —— 新增 `react-markdown` + `remark-gfm`

**改文档**：`BP01-iron-ingot.md` / `BP14-hmf-computer.md` 各内嵌 ```diagram 块（与原 ASCII 并存，ASCII 作人读注释）

**不碰**（只读不改 → 主查看器零回归）：renderer/ 全部、schema.ts、useAppStore.ts、FloorPlanView.tsx、coordinate.ts、registry.ts

## 11. 后续（不在首批范围，YAGNI）

- 其余 16 个 BP 的 diagram 块编写（纯数据成本，非架构成本；可写一次性 ascii2diagram 草稿脚本辅助）。
- diagram 块图与主查看器联动（点击跳转对应 scheme）。
- 多层叠一张图（半透明/偏移）。
- TOC/锚点导航、文档间链接跳转。

## 12. 被否决的备选（决策留痕）

- **方向 B（改 5 个 renderer 解耦 store + 校验降级）**：与「不被严格引擎限制」诉求冲突，需触碰主查看器核心文件、回归面大。否决。
- **自研 miniMarkdown**：用户选定 react-markdown，更稳。否决自研。
- **react-router**：用 ViewMode 视图模式即可，零新路由依赖。否决。
- **仅修 ASCII 对齐（等宽 HTML/CSS 强制对齐）**：治标，平面图仍是字符画、不可交互、CJK 宽度在不同环境仍可能偏。否决。
