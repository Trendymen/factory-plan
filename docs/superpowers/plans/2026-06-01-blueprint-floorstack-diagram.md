# 蓝图极简「楼层栈图」(floorstack) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有 React `ManualView` 文档站新增一种 ` ```floorstack ` 围栏块渲染，把每个 tier7 BP 的「每层放哪些机器 / 进出料 / 料上下传到哪层」用矢量楼层栈盒图展示，根治 CJK ASCII 对齐问题。

**Architecture:** 新增零依赖解析器 `parseFloorStack` 把紧凑 DSL 解析成 `FloorStack` 结构；纯函数组件 `FloorStackBlock` 用 CSS Grid + 矢量盒/箭头渲染（无 box-drawing 字符）；`ManualView` 的 `PreBlock` 按内层 `<code>` 的 `language-floorstack` 分流，新块走新组件、旧 ASCII 块原样走 `AsciiBlock`，新旧并存灰度。BP md 里作者手写 floorstack 块，数据忠于各 BP 真实「楼层占用」+「物料 I/O」。

**Tech Stack:** React 19 + TypeScript + Vite + react-markdown ^10 + remark-gfm ^4 + vitest（项目为 TS project references，类型检查用 `npx tsc -b`）。

**设计依据:** [../specs/2026-06-01-blueprint-floorstack-diagram-design.md](../specs/2026-06-01-blueprint-floorstack-diagram-design.md)、[../research/2026-06-01-bp-doc-simplification-research.md](../research/2026-06-01-bp-doc-simplification-research.md)

---

## File Structure

| 文件 | 操作 | 职责 |
|---|---|---|
| `src/manual/floorStack.ts` | 新建 | 类型 `Cross/Floor/FloorStack` + `parseCross` + `parseFloorStack`（零依赖解析器） |
| `src/manual/floorStack.test.ts` | 新建 | 解析器单测（vitest） |
| `src/manual/FloorStackBlock.tsx` | 新建 | 纯函数组件，渲染楼层栈盒图（矢量，无框线字符） |
| `src/manual/ManualView.tsx` | 修改 | 新增 `getCodeLang` + `PreBlock` 按语言分流 + import |
| `src/manual/manual.css` | 修改 | 新增 `.floor-stack` 等样式 |
| `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP01-iron-ingot.md` | 修改 | 试点 floorstack 块 |
| 其余 17 个 tier7 BP md | 修改 | 批量补 floorstack 块（数据取自各文件真实表） |

> **强制约束**：`FloorStackBlock` 与 CSS 中**严禁使用 box-drawing 字符（`┌─┐│└┘▓` 等）**做布局。盒子=带 `border` 的元素，箭头=文字/SVG 矢量符号，文字=独立节点。

---

## Task 1: floorstack 解析器 — 类型 + parseCross

**Files:**
- Create: `src/manual/floorStack.ts`
- Test: `src/manual/floorStack.test.ts`

- [ ] **Step 1: 写失败测试（parseCross）**

创建 `src/manual/floorStack.test.ts`：

```ts
import { describe, it, expect } from 'vitest';
import { parseCross } from './floorStack';

describe('parseCross', () => {
  it('解析向上跨层 + lift 注记', () => {
    expect(parseCross('↑2F:铁矿石(lift Mk5)')).toEqual({
      dir: 'up',
      target: '2F',
      material: '铁矿石(lift Mk5)',
    });
  });

  it('解析向下跨层', () => {
    expect(parseCross('↓1F:石油焦')).toEqual({
      dir: 'down',
      target: '1F',
      material: '石油焦',
    });
  });

  it('容忍箭头后与冒号周围空格', () => {
    expect(parseCross('↑ 3F : 螺丝')).toEqual({
      dir: 'up',
      target: '3F',
      material: '螺丝',
    });
  });

  it('空字段或无箭头返回 undefined', () => {
    expect(parseCross('')).toBeUndefined();
    expect(parseCross('铁矿石')).toBeUndefined();
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/manual/floorStack.test.ts`
Expected: FAIL —「Failed to resolve import './floorStack'」或「parseCross is not a function」。

- [ ] **Step 3: 写最小实现**

创建 `src/manual/floorStack.ts`：

```ts
export interface Cross {
  dir: 'up' | 'down';
  target: string;
  material: string;
}

export interface Floor {
  name: string;
  machines: string;
  input?: string;
  output?: string;
  cross?: Cross;
}

export interface FloorStack {
  title?: string;
  floors: Floor[];
}

const CROSS_RE = /^([↑↓])\s*([^:：]+?)\s*[:：]\s*(.+)$/;

export function parseCross(field: string): Cross | undefined {
  const m = field.trim().match(CROSS_RE);
  if (!m) return undefined;
  return {
    dir: m[1] === '↑' ? 'up' : 'down',
    target: m[2].trim(),
    material: m[3].trim(),
  };
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/manual/floorStack.test.ts`
Expected: PASS（4 个 parseCross 用例全绿）。

- [ ] **Step 5: 提交**

```bash
git add src/manual/floorStack.ts src/manual/floorStack.test.ts
git commit -m "feat(manual): floorstack 解析器 parseCross + 类型"
```

---

## Task 2: floorstack 解析器 — parseFloorStack

**Files:**
- Modify: `src/manual/floorStack.ts`
- Test: `src/manual/floorStack.test.ts`

- [ ] **Step 1: 追加失败测试（parseFloorStack）**

在 `src/manual/floorStack.test.ts` 末尾追加：

```ts
import { parseFloorStack } from './floorStack';

describe('parseFloorStack', () => {
  it('单层 BP → 一个盒子、无 cross', () => {
    const text = `# BP04 钢锭 (C2) · Mk2
1F | 5× foundry | 铁矿石+煤（左墙） | 钢锭 → BP5（右墙） |`;
    expect(parseFloorStack(text)).toEqual({
      title: 'BP04 钢锭 (C2) · Mk2',
      floors: [
        {
          name: '1F',
          machines: '5× foundry',
          input: '铁矿石+煤（左墙）',
          output: '钢锭 → BP5（右墙）',
          cross: undefined,
        },
      ],
    });
  });

  it('多层 BP → 保留作者书写序（1F→2F），解析 cross', () => {
    const text = `# BP01 铁锭
1F | 9× smelter (S1-S9) | 铁矿石 610.5/min（左墙） | 铁锭 → BP2（右墙） | ↑2F:铁矿石(lift Mk5)
2F | 9× smelter (S10-S18) | 铁矿石（1F 上送） | 铁锭 → BP2（右墙） |`;
    const result = parseFloorStack(text);
    expect(result.floors).toHaveLength(2);
    expect(result.floors[0].name).toBe('1F');
    expect(result.floors[0].cross).toEqual({ dir: 'up', target: '2F', material: '铁矿石(lift Mk5)' });
    expect(result.floors[1].name).toBe('2F');
    expect(result.floors[1].cross).toBeUndefined();
  });

  it('空字段 → undefined；跳过空行；无 # 时 title 为 undefined', () => {
    const text = `\n1F | 4× constructor |  |  | \n`;
    expect(parseFloorStack(text)).toEqual({
      title: undefined,
      floors: [{ name: '1F', machines: '4× constructor', input: undefined, output: undefined, cross: undefined }],
    });
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run src/manual/floorStack.test.ts`
Expected: FAIL —「parseFloorStack is not a function」。

- [ ] **Step 3: 追加实现**

在 `src/manual/floorStack.ts` 末尾追加：

```ts
export function parseFloorStack(text: string): FloorStack {
  const lines = text.split('\n');
  let title: string | undefined;
  const floors: Floor[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith('#')) {
      if (title === undefined) title = line.replace(/^#+\s*/, '').trim();
      continue;
    }
    const cols = line.split('|').map((c) => c.trim());
    const [name = '', machines = '', input = '', output = '', cross = ''] = cols;
    floors.push({
      name,
      machines,
      input: input || undefined,
      output: output || undefined,
      cross: parseCross(cross),
    });
  }

  return { title, floors };
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run src/manual/floorStack.test.ts`
Expected: PASS（parseCross + parseFloorStack 全部用例绿）。

- [ ] **Step 5: 类型检查**

Run: `npx tsc -b`
Expected: 退出码 0，无新增类型错误。

- [ ] **Step 6: 提交**

```bash
git add src/manual/floorStack.ts src/manual/floorStack.test.ts
git commit -m "feat(manual): parseFloorStack 解析 DSL 为 FloorStack 结构"
```

---

## Task 3: FloorStackBlock 组件

**Files:**
- Create: `src/manual/FloorStackBlock.tsx`

- [ ] **Step 1: 写组件**

创建 `src/manual/FloorStackBlock.tsx`。**说明**：`data.floors` 由作者按 1F→屋顶（自下而上）书写；渲染时倒序，使屋顶在最上、1F 在最底。某层 `cross` 表示「该层把物料送往 target 层」：`up` 的箭头渲染在该层盒子**之上**（指向上层），`down` 渲染在盒子**之下**。

```tsx
import { memo } from 'react';
import type { Cross, FloorStack } from './floorStack';

interface Props {
  data: FloorStack;
}

function Arrow({ cross }: { cross: Cross }) {
  return (
    <div className={`floor-arrow floor-arrow-${cross.dir}`}>
      <span className="floor-arrow-glyph">{cross.dir === 'up' ? '↑' : '↓'}</span>
      <span className="floor-arrow-label">
        {cross.material} → {cross.target}
      </span>
    </div>
  );
}

function FloorStackBlockImpl({ data }: Props) {
  // 倒序：屋顶在上、1F 在底（DSL 作者按 1F→屋顶 自下而上书写）
  const floorsTopDown = [...data.floors].reverse();
  return (
    <div className="floor-stack">
      {data.title && <div className="floor-stack-title">{data.title}</div>}
      {floorsTopDown.map((floor, i) => (
        <div className="floor-row" key={`${floor.name}-${i}`}>
          {floor.cross?.dir === 'up' && <Arrow cross={floor.cross} />}
          <div className="floor-box-grid">
            <div className="floor-io floor-io-in">
              {floor.input && <span>▶ {floor.input}</span>}
            </div>
            <div className="floor-box">
              <div className="floor-name">{floor.name}</div>
              <div className="floor-machines">{floor.machines}</div>
            </div>
            <div className="floor-io floor-io-out">
              {floor.output && <span>{floor.output} ▶</span>}
            </div>
          </div>
          {floor.cross?.dir === 'down' && <Arrow cross={floor.cross} />}
        </div>
      ))}
    </div>
  );
}

export const FloorStackBlock = memo(FloorStackBlockImpl);
```

- [ ] **Step 2: 类型检查**

Run: `npx tsc -b`
Expected: 退出码 0，无类型错误（`Cross`/`FloorStack` 从 `./floorStack` 正确导入）。

- [ ] **Step 3: 提交**

```bash
git add src/manual/FloorStackBlock.tsx
git commit -m "feat(manual): FloorStackBlock 纯组件渲染楼层栈盒图"
```

---

## Task 4: ManualView PreBlock 按语言分流

**Files:**
- Modify: `src/manual/ManualView.tsx`

- [ ] **Step 1: 加 import**

在 `src/manual/ManualView.tsx` 顶部 import 区（`import { AsciiBlock } from './AsciiBlock';` 下一行）追加：

```tsx
import { FloorStackBlock } from './FloorStackBlock';
import { parseFloorStack } from './floorStack';
```

- [ ] **Step 2: 新增 getCodeLang 工具**

在 `extractText` 函数定义之后、`PreBlock` 之前插入：

```tsx
// 从 react-markdown 传入 <pre> 的 children 里递归找出内层 <code> 的 language-xxx。
// react-markdown 把围栏语言标签放在内层 <code className="language-floorstack"> 上。
function getCodeLang(node: unknown): string | null {
  if (node == null || typeof node !== 'object') return null;
  if (Array.isArray(node)) {
    for (const child of node) {
      const lang = getCodeLang(child);
      if (lang) return lang;
    }
    return null;
  }
  if ('props' in node) {
    const el = node as ReactElement<{ className?: string; children?: unknown }>;
    const cls = el.props?.className;
    if (typeof cls === 'string') {
      const m = cls.match(/language-([\w-]+)/);
      if (m) return m[1];
    }
    return getCodeLang(el.props?.children);
  }
  return null;
}
```

- [ ] **Step 3: 改 PreBlock 分流**

把现有：

```tsx
function PreBlock(props: ComponentProps<'pre'>) {
  const raw = extractText(props.children);
  return <AsciiBlock text={raw} />;
}
```

替换为：

```tsx
function PreBlock(props: ComponentProps<'pre'>) {
  const raw = extractText(props.children);
  const lang = getCodeLang(props.children);
  if (lang === 'floorstack') return <FloorStackBlock data={parseFloorStack(raw)} />;
  return <AsciiBlock text={raw} />;
}
```

- [ ] **Step 4: 类型检查**

Run: `npx tsc -b`
Expected: 退出码 0。`ReactElement` 已在现有 import（`type ReactElement`）中，无需新增。

- [ ] **Step 5: 提交**

```bash
git add src/manual/ManualView.tsx
git commit -m "feat(manual): PreBlock 按 language-floorstack 分流到 FloorStackBlock"
```

---

## Task 5: manual.css 楼层栈样式

**Files:**
- Modify: `src/manual/manual.css`

- [ ] **Step 1: 追加样式**

在 `src/manual/manual.css` 末尾（`.ascii-pre { ... }` 之后）追加：

```css
/* ===== floorstack 楼层栈图（矢量盒+文本节点，禁用 box-drawing 字符） ===== */
.floor-stack {
  margin: 16px 0;
  display: flex;
  flex-direction: column;
}
.floor-stack-title {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 8px;
}
.floor-row { display: flex; flex-direction: column; }
.floor-box-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 10px;
}
.floor-box {
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-secondary);
  padding: 10px 14px;
  min-width: 220px;
}
.floor-name {
  font-size: 12px;
  color: var(--accent);
  letter-spacing: 0.05em;
}
.floor-machines {
  font-size: 14px;
  color: var(--text-primary);
  margin-top: 2px;
}
.floor-io {
  font-size: 12px;
  color: var(--text-secondary);
}
.floor-io-in { text-align: right; }
.floor-io-out { text-align: left; }
.floor-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 4px 0;
  color: var(--text-muted);
  font-size: 12px;
}
.floor-arrow-glyph { font-size: 16px; color: var(--accent); }
@media (max-width: 640px) {
  .floor-box-grid { grid-template-columns: 1fr; }
  .floor-io-in, .floor-io-out { text-align: left; }
}
```

- [ ] **Step 2: 提交**

```bash
git add src/manual/manual.css
git commit -m "style(manual): floorstack 楼层栈盒图样式"
```

---

## Task 6: BP01 试点 + 人工验证

**Files:**
- Modify: `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP01-iron-ingot.md`

- [ ] **Step 1: 在 BP01 加 floorstack 块**

在 `## 概要` 段落与 `## 机器超频清单` 之间插入新章节（旧 `## 俯视图` ASCII 块保持不动）：

````markdown
## 极简示意图

```floorstack
# BP01 铁锭 (C1) · Mk2 40×40m · 自下而上
1F | 9× smelter (S1-S9) | 铁矿石 610.5/min（左墙 ×2 Mk5） | 铁锭 → BP2（右墙 ×2 Mk5） | ↑2F:铁矿石(lift Mk5)
2F | 9× smelter (S10-S18，T7+启用) | 铁矿石（1F lift 上送） | 铁锭 → BP2（右墙 ×2 Mk5） |
```

> 本 BP 只摆 smelter；1F 铁矿石经升降机上送 2F；两层铁锭均走右墙 Wall Outlet 交给 BP2。
````

- [ ] **Step 2: 启动 dev server 人工验证**

Run: `npm run dev`（后台）→ 浏览器开 `http://localhost:5173/`，切「手册」视图 → 选 BP01-iron-ingot。
Expected（逐项确认，对照设计验收标准）：
- 出现两个盒子，**2F 在上、1F 在底**；
- 中文机器名/进出料标签**不错位、无破框**；
- 1F 与 2F 之间有 `↑ 铁矿石(lift Mk5) → 2F` 箭头；
- 左侧显示进料、右侧显示出料；
- 下方旧 ASCII 俯视图仍在、不受影响。

> 若发现错位/样式问题，回到 Task 3/5 调整组件或 CSS 后重验（**不要回到字符网格方案**）。

- [ ] **Step 3: diagnostics 检查**

用 `vscode-mcp-server` 检查 `src/manual/ManualView.tsx`、`FloorStackBlock.tsx`、`floorStack.ts` 的 diagnostics；若不可用则在汇报中说明跳过原因。

- [ ] **Step 4: 提交**

```bash
git add docs/superpowers/specs/2026-05-24-tier7-blueprints/BP01-iron-ingot.md
git commit -m "docs(BP01): 试点 floorstack 极简示意图"
```

---

## Task 7: 批量为其余 17 个 tier7 BP 补 floorstack 块

**Files（逐一 Modify）:**
`docs/superpowers/specs/2026-05-24-tier7-blueprints/` 下：BP02-iron-base, BP03-screw, BP04-steel-ingot, BP05-steel-beam-pipe, BP06-copper-smelt, BP07-wire-cable, BP08-circuit-board, BP09-plastic-rubber, BP10-quartz-quickwire-concrete, BP11-sam, BP12-rotor-stator-motor, BP13-frame-encased-beam, BP14-hmf-computer, BP15-crystal-osc-hsc, BP-TERM-A, BP-TERM-B, BP-BUS-FILLER。

**Recipe（每个文件同一套，data 忠于真实文档）：**
1. 读该 BP md 的 `## 楼层占用` 表（层 / 内容 → 第 1-2 列）与 `## 物料 I/O` 段（输入/输出 → 第 3-4 列：物料名+流量+左墙/右墙/目标 BP）。
2. 跨层第 5 列来自楼层占用里的 lift 描述（如「1F lift-up 喂 2F」「lift-out-top → z=…」）转成 `↑/↓目标层:物料(可选lift Mk)`。
3. 在 `## 概要` 之后插入 `## 极简示意图` + ` ```floorstack ` 块（DSL 按 1F→屋顶 自下而上书写），块后一行 `>` 说明放图下方。
4. 数据校正（来自 deep-research）：**BP09** 中 Rubber 副产 Heavy Oil Residue=20/min（是 Plastic 副产 10/min 的 2 倍），跨层副产标注分别处理。
5. 旧 ASCII 块全部保留不动。
6. 多 Mk2 实例的 BP（BP02 a/b、BP06 a/b/c、BP07 a/b/c、BP09 a-g、BP10 a/b、BP14 a/b/c、BP15 a/b/c）：每个实例写一个独立 ` ```floorstack ` 块。

**两个完整范例（执行时照此模式套各文件真实数据）：**

单层范例（BP04 钢锭，1F 5× foundry）：

````markdown
## 极简示意图

```floorstack
# BP04 钢锭 (C2) · Mk2
1F | 5× foundry | 铁矿石+煤（左墙） | 钢锭 → BP5（右墙） |
```

> 单层 BP：只摆 foundry，进铁矿石+煤、出钢锭给 BP5，无跨层。
````

三层范例（BP14 HMF/电脑，manufacturer 堆叠示意，**执行时以 BP14 文件真实楼层占用为准**）：

````markdown
## 极简示意图

```floorstack
# BP14a HMF (C6) · Mk2
1F | 2× manufacturer (HMF) | 模块化框架/钢管/螺丝/橡胶（左墙+总线 tap） | HMF → BP15/总线 | ↑屋顶:HMF
屋顶 | 总线 tap/merger | — | HMF 上总线 B-x |
```

> 多层 BP：底层制造、料经 lift 上送屋顶总线层。
````

- [ ] **Step 1: 逐文件补块**

按 Recipe 为 17 个文件各加 `## 极简示意图` + floorstack 块（多实例文件多块）。建议每改完一个文件即 `git add <该文件>`。

- [ ] **Step 2: 全量类型检查 + 测试**

Run: `npx tsc -b && npx vitest run`
Expected: 退出码 0；解析器单测全绿；现有方案校验测试不回归。

- [ ] **Step 3: dev server 抽查渲染**

Run: `npm run dev` → `http://localhost:5173/` 手册视图，逐一点开 18 个 BP，确认每个 floorstack 块渲染正常、中文不错位、单层/多层/多实例都对。重点抽查 BP02（多实例）、BP09（Rubber 副产 20/min）、BP14（多层）。

- [ ] **Step 4: diagnostics 检查**

`vscode-mcp-server` 复查改动文件 diagnostics。

- [ ] **Step 5: 提交**

```bash
git add docs/superpowers/specs/2026-05-24-tier7-blueprints/
git commit -m "docs(tier7): 18 个 BP 补 floorstack 极简示意图"
```

---

## 验收（对照 spec §9）

- [ ] `parseFloorStack` 单测全绿，覆盖单层/多层/跨层/空字段/标题。
- [ ] `npx tsc -b` + `npx vitest run` 通过，diagnostics 无本次引入问题。
- [ ] BP01 在 `ManualView` 渲染：盒子自下而上、中文标签不错位、↑ 跨层箭头与进出料正确。
- [ ] 18 个 tier7 BP 各有忠于真实数据的 floorstack 块；旧 ASCII 块仍在。
- [ ] 新组件/CSS 无 box-drawing 字符用于布局。
