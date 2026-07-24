# 蓝图极简「楼层栈图」设计 (floorstack)

> 2026-06-01 · 设计文档（brainstorming 产物）
> 依据：[../research/2026-06-01-bp-doc-simplification-research.md](../research/2026-06-01-bp-doc-simplification-research.md)（两轨 deep-research）

## 1. 背景与问题

现有 18 个 tier7 BP 文档（`docs/superpowers/specs/2026-05-24-tier7-blueprints/*.md`）每篇都含复杂的逐层俯视 ASCII 图（机器占位、传送带走线、manifold、splitter 路径）。用户反馈**已完全看不懂这些示意图**。

更根本的是：这些 ASCII 图用 box-drawing 字符（`┌─┐│└┘`）+ 中文混排，在浏览器等宽网格里**无法逐列对齐**——CJK 字符是东亚宽度 Ambiguous（UAX#11），与框线字符宽度不一致，53/70 张图的内部竖线本就没画在一致网格上。此前尝试过「纯 pre / 逐字符 inline-block / 自托管双宽字体」三轮均未根治，属**结构性死路**。

> 本设计文档草稿阶段，作者在对话里用 ASCII 手绘的盒子草图当场又崩了右边框——这正是要消灭的目标。

## 2. 目标

为每个 BP 出一版**极简示意图**，只表达三要素：

1. 每层楼放哪些机器；
2. 进什么料 / 出什么料；
3. 本 BP 的料往上 / 往下传到哪一层。

去掉繁琐传送带细节，文字尽量放图示下方，且**仍能在现有 React `ManualView` 文档站浏览**。

## 3. 已定决策（brainstorming）

| 决策 | 选择 |
|---|---|
| 图示表示法 | **楼层栈盒图**（自下而上堆叠 + 层间 ↑/↓ 流向箭头） |
| 渲染方式 | **自定义 React 组件 + ` ```floorstack ` 围栏标签**（不引入 Mermaid，无新依赖） |
| 数据口径 | **忠于真实 BP 文档**（取自各 BP「楼层占用」表 +「物料 I/O」段） |
| 旧 ASCII 图 | **保留并存，灰度迁移**（新旧同文档，可逐 BP 替换、随时回退） |
| 覆盖范围 | **仅 tier7（18 文件）**；tier6 留作后续 |

**明确排除**：Mermaid（自动布局控不住「楼层上下传」空间语义，仅过渡备选）、Sankey（强调流量体量、与空间目标错位）、继续修 ASCII 网格（结构性死路）。

## 4. §1 图示规范 + DSL 格式

### 4.1 视觉形态

- 每层 = 一个横向**盒子**，**自下而上堆叠**（1F 最底、屋顶最顶）。
- 盒内只列机器；**进料** = 盒子左侧伸入的箭头，**出料** = 右侧伸出的箭头，**本 BP 内跨层传递** = 盒子之间的竖直 ↑/↓ 箭头。
- 三类箭头靠**朝向天然区分**：横向 = 对外（跨 BP / 矿场），竖向 = 本 BP 内跨层。不需要虚实线。
- 每层盒子下方可留一行简短说明。

> **强制约束（根治对齐）**：盒框用带 `border` 的 HTML 块元素或 SVG `<rect>`，箭头用 SVG `<line>`/`<path>`，文字是独立文本节点。**严禁用 box-drawing 字符（`┌─┐│└┘▓` 等）画盒子或对齐布局**——一旦回到字符网格就会重蹈 CJK 对齐覆辙。

### 4.2 DSL（作者在 md 里手写 ` ```floorstack ` 块）

每行一层，` | ` 分隔 5 列，空字段留空：

```
# BP01 铁锭 (C1) · Mk2 40×40m
1F | 9× smelter (S1-S9) | 铁矿石 610.5/min（左墙） | 铁锭 → BP2（右墙） | ↑2F:铁矿石(lift Mk5)
2F | 9× smelter (S10-S18，T7+启用) | 铁矿石（1F 上送） | 铁锭 → BP2（右墙） |
```

| 列 | 含义 | 示例 |
|---|---|---|
| 1 层名 | 楼层标签 | `1F` / `2F` / `屋顶` |
| 2 机器 | 本层机器（多种用、分隔） | `9× smelter` / `4× assembler、1× merger` |
| 3 进料 | 物料+流量+来源 | `铁矿石 610.5/min（左墙）` |
| 4 出料 | 物料+去向 BP | `铁锭 → BP2（右墙）` |
| 5 跨层 | `↑/↓目标层:物料(可选lift)` | `↑2F:铁矿石(lift Mk5)` |

**规则：**

- 作者按 **1F→屋顶（自下而上）顺序**写行（与现有「楼层占用」表同序）；组件渲染时倒序，使屋顶显示在最上。
- 首行 `#` = 标题/注释，解析时跳过（可作图题）。
- **单层 BP** = 一行 DSL → 一个盒子，无竖向箭头，只有横向进/出料。
- **多层 BP**（BP01 双层、BP14 三层等）才出现 ↑/↓ 跨层箭头。
- **一个 BP 含多个 Mk2 实例**（BP02 a/b、BP06 a/b/c、BP09 a-g）：允许同一文档写多个 ` ```floorstack ` 块，各自独立渲染。

## 5. §2 组件与渲染架构

围绕现有 `src/manual/` 管线，**不引入任何新依赖**。

### 5.1 `src/manual/floorStack.ts` — 纯解析器（零依赖）

```ts
export interface Cross { dir: 'up' | 'down'; target: string; material: string }
export interface Floor {
  name: string;
  machines: string;
  input?: string;
  output?: string;
  cross?: Cross;
}
export interface FloorStack { title?: string; floors: Floor[] }

export function parseFloorStack(text: string): FloorStack
```

实现：按行 `split('\n')` + `trim`；`#` 开头取首条作 `title`；空行跳过；其余行按 ` | ` 切 5 列 → `[name, machines, input, output, cross]`，空字段为 `undefined`；`cross` 列用 `/^([↑↓])(.+?):(.+)$/` 解析方向（↑=up/↓=down）、目标层、物料。纯函数，无副作用。

### 5.2 `src/manual/FloorStackBlock.tsx` — 纯展示组件

`props: { data: FloorStack }`。CSS Grid 三栏（左槽进料 / 中盒子 / 右槽出料）；`data.floors` **倒序渲染**（屋顶在上、1F 在底）。

**跨层箭头归属**：某层的 `cross` 字段表示「**该层**把某物料向上/向下送到目标层」（如 1F `↑2F:铁矿石` = 1F 上送铁矿石给 2F）。组件在该源层盒子与目标层盒子之间渲染一个带物料标签的 ↑/↓ `.floor-arrow`。若目标层不存在则降级为盒子边缘的方向标记。

无状态、纯函数，符合 `src/renderers` 约定。盒框/箭头矢量、文字独立节点 → 无等宽对齐问题。

### 5.3 `src/manual/ManualView.tsx` — `PreBlock` 按语言分流（仅改此处）

```tsx
function PreBlock(props: ComponentProps<'pre'>) {
  const raw = extractText(props.children);
  const lang = getCodeLang(props.children);   // 读内层 <code> 的 className
  if (lang === 'floorstack') return <FloorStackBlock data={parseFloorStack(raw)} />;
  return <AsciiBlock text={raw} />;            // 旧 ASCII 块原样保留
}
```

新增 `getCodeLang(children)`：react-markdown 把语言标签放在内层 `<code className="language-floorstack">`，从 `props.children` 取出。复用现有 `extractText()` 取原始文本。**旧无标签块 → `AsciiBlock` 完全不动。**

### 5.4 `src/manual/manual.css`

新增 `.floor-stack / .floor-box / .floor-name / .floor-machines / .floor-io-in / .floor-io-out / .floor-arrow / .floor-note`。盒子自下而上（数组倒序或 `flex-direction: column`），移动端纵向滚动，每层说明放盒下方。

## 6. 数据映射（真实 BP → DSL）

每个 BP 的 floorstack 数据**忠于真实文档**，逐列来源：

- 第 1-2 列（层名 / 机器）← 该 BP「楼层占用」表的「层 / 内容」。
- 第 3-4 列（进料 / 出料）← 该 BP「物料 I/O」表的输入 / 输出行（物料名 + 流量 + 左墙/右墙/目标 BP）。
- 第 5 列（跨层）← 楼层占用表里的 lift 描述（如「1F manifold lift-up 喂 2F」「lift-out-top → z=24m」）转成 `↑/↓目标层:物料`。

### 数据校正点（来自 deep-research）

- **BP09（塑料/橡胶）**：Rubber 副产 Heavy Oil Residue = **20/min**（是 Plastic 副产 10/min 的 2 倍，不对称）。标注跨层副产时分别处理，不可照搬同一规则。
- 传送带/升降机吞吐表（60/120/270/480/780/1200）与 R22/R28 已交叉验证一致，**不改**。
- splitter/merger 内部 2000/min 远超最快 belt，永不是瓶颈，极简图忽略分流/合流细节。

## 7. 测试与落地（TDD）

1. **先写 `parseFloorStack` 单测**（`src/manual/floorStack.test.ts`，vitest）：单层 / 多层 / 跨层解析 / 空字段 / 标题 / 多块 → 再实现解析器。
2. 实现 `FloorStackBlock` + 接 `PreBlock` + `manual.css`。
3. 校验：`npx tsc -b`（项目是 project references，不能用 `tsc --noEmit`）+ `npx vitest run` + `vscode-mcp-server` diagnostics。
4. **BP01 试点**：给 `BP01-iron-ingot.md` 加一个 ` ```floorstack ` 块，`npm run dev` 人工确认中文渲染正常、无错位。
5. 确认后**批量为 18 个 tier7 BP 补 floorstack 块**（各取真实「楼层占用」+「物料 I/O」），旧 ASCII 块全程保留。

## 8. 范围外（Out of Scope）

- tier6（18 文件）的 floorstack 化 —— 后续单独处理。
- 删除旧 ASCII 俯视图 —— 本次保留并存。
- Mermaid / Sankey 渲染管线。
- 修改 `registry.ts` 或 R22/R28 数据（已验证正确）。

## 9. 验收标准

- [ ] `parseFloorStack` 单测全绿，覆盖单层/多层/跨层/空字段/多块。
- [ ] `tsc -b` + `vitest run` 通过，diagnostics 无本次引入问题。
- [ ] BP01 在 `ManualView` 渲染：盒子自下而上、中文标签不错位、↑ 跨层箭头与进出料正确。
- [ ] 18 个 tier7 BP 各有忠于真实数据的 floorstack 块；旧 ASCII 块仍在。
- [ ] 无 box-drawing 字符用于新组件布局。
