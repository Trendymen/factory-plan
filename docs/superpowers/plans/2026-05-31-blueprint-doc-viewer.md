# Implementation Plan — 蓝图施工手册文档查看器（SVG 平面图 + md 实时解析）

> **For agentic workers:** REQUIRED SUB-SKILL — 用 `superpowers:subagent-driven-development`（推荐）或 `superpowers:executing-plans` 逐任务实现本计划。步骤用复选框（`- [ ]`）跟踪。设计来源：`docs/superpowers/specs/2026-05-30-blueprint-doc-viewer-design.md`。

## Goal

把 `docs/superpowers/specs/2026-05-24-tier7-blueprints/` 下 18 个 BP 施工手册（.md）的 ASCII 俯视平面图，换成由结构化数据驱动的 SVG 渲染，从根上消除等宽字体 CJK 全角错位问题。在现有 React app 内新增一个独立的「手册」视图模式：左侧 BP 目录树，右侧用 react-markdown 实时渲染 md，其中 ` ```diagram ` 围栏块被拦截并替换为按 registry 真实尺寸绘制的 SVG 平面图。**首批只打样 BP01（9 个 smelter）+ BP14（manufacturer 叠两层）**，验证架构。

**核心约束**：新管线 `src/diagram/` **绝不 import** `src/core/schema.ts`（绕过所有 R13/R14/R16/R17 可建性校验）、**绝不 import** `src/store/useAppStore.ts`（零全局状态耦合）。只读 `src/core/coordinate.ts`（纯函数）和 `src/core/registry.ts`（真实尺寸/端口/颜色）。主查看器零回归（不改任何 renderer / schema / store / FloorPlanView）。

## Architecture

```
docs/.../*.md ──import.meta.glob({query:'?raw'})──▶ react-markdown(+remark-gfm)
   ├─ 普通 md ──▶ React 元素（标题/表格/列表）
   └─ ```diagram JSON ──(components.code 拦截 language-diagram)──▶
        parseDiagramBlock (try/catch 永不抛) ──▶ DiagramView
              ├─ DiagramGridRenderer  (网格)
              ├─ zones / notes        (DiagramView 内联)
              ├─ DiagramMachineRenderer (registry 真实尺寸 footprint+body+端口点+label)
              └─ DiagramBeltRenderer  (polyline 虚线 + atan2 箭头 + 端口贴合)
```

新增独立模块 `src/diagram/`（管线）+ `src/manual/`（文档站）。视图共存靠扩 `ViewMode` 联合类型，TopBar 加按钮，App.tsx 加分支。不引 react-router。

**关键坐标事实（已侦察，务必基于这些真实签名写代码，不要臆造）**：
- `GRID_PX = 80`，`PAD = 40`，`METERS_PER_GRID = 8`（1 cell = 8m）。
- `gridToSvg(col, row) → { x: PAD + col*GRID_PX, y: PAD + row*GRID_PX }`。
- `machineGridSize(dim, facing) → {cols, rows}`，**已处理 facing 旋转**（east/west 交换 width/length），不要再旋转一次。
- `resolvePortPosition(machinePos: GridPos, facing, dimensions, port: PortDef) → {x,y}`（绝对 SVG px，已 PAD 偏移）。注意它收一个**完整 PortDef 对象**，不是 `"id:port"` 字符串 — 必须先从 `meta.ports.find(p=>p.id===portId)` 查出 PortDef。
- `calcViewBox(cols, rows) → string`（返回 `"0 0 W H"` 字符串，含 `PAD*2`）。
- `BUILDING_REGISTRY[type]`：`color` 字段是 **CSS 变量名**（如 `'--smelter'`），消费方式 `var(${meta.color})`。只有 smelter/foundry/constructor/assembler/manufacturer/storage/splitter/merger/lift 等 base 类型在 theme.css 有定义；refinery/packager/blender/particle-accelerator/quantum-encoder/converter 的 var **未定义** → 需兜底色。
- `getBuildingMeta(type)` 会 **throw**，管线禁用 → 自实现 `safeGetBuildingMeta(type) = BUILDING_REGISTRY[type] ?? grayFallback`。

## Tech Stack

React 19 + TypeScript（strict, `noUnusedLocals`/`noUnusedParameters` 全开 → 不留未用 import/参数）+ Vite 8（`import.meta.glob`，无 path alias，相对路径 import，无扩展名）+ vitest 4（`globals:true` + jsdom，但现存测试仍显式 `import { describe, it, expect } from 'vitest'` — 跟随此风格）+ zustand（仅 ViewMode 扩展，不在 diagram 管线里用）。**新增依赖**：`react-markdown` + `remark-gfm`。ESM throughout（`"type":"module"`）。

## REQUIRED SUB-SKILLS

- **每个带测试的任务（Task 2 / Task 3）**：worker **MUST** 调用 `superpowers:test-driven-development` skill，严格走 RED → GREEN → REFACTOR：先写失败测试、跑出确切 FAIL、再实现、跑出 PASS、再 commit。禁止先写实现。
- **执行整份 plan**：worker **MUST** 用 `superpowers:executing-plans`（带 review checkpoint），逐 Task 勾选复选框。
- **任务声明完成前**：worker **MUST** 用 `superpowers:verification-before-completion` — 跑命令、贴输出，先证据后断言。
- **改动代码文件后、commit 前**：用 `vscode-mcp-server`（`mcp__vscode-server-mcp__get_diagnostics_code`）检查本次改动文件的 diagnostics，修掉本次引入的问题。VS Code MCP 不可用时可跳过，但须在 commit 说明里注明已跳过。
- **UI 验收**：用 `chrome-devtools`（`mcp__chrome-devtools__navigate_page` + `take_screenshot`）对默认浏览器里 `npm run dev` 的页面截图。

**通用规则（每个 Task 都适用）**：
- ❗ 禁止用 Bash/`sed`/`node -e`/`fs.writeFileSync` 修改代码或 md 文件，必须用 Edit/Write 工具。Bash/PowerShell 仅用于跑测试、装依赖、git。
- 相对 import、无扩展名（`from '../core/coordinate'`），不要 `@/`。
- 每个 Task 末尾给确切 `git` 命令与 message；commit message 结尾必须带 `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`。
- 当前分支 `feat/engineering-rewrite`，所有提交留在此分支。

---

## Task 0 — 安装依赖 `react-markdown` + `remark-gfm`

无测试。约 2 分钟。

### Files
- **Modify**: `package.json`（由 npm 自动写入 dependencies）
- **Modify**: `package-lock.json`（自动）

### Steps
- [ ] 0.1 安装两个运行时依赖（PowerShell）：
  ```powershell
  npm install react-markdown remark-gfm
  ```
- [ ] 0.2 确认装入（预期能打印出版本号，非空）：
  ```powershell
  npm ls react-markdown remark-gfm
  ```
  预期输出包含 `react-markdown@` 和 `remark-gfm@` 两行，无 `(empty)` / `UNMET DEPENDENCY`。
- [ ] 0.3 Commit：
  ```powershell
  git add package.json package-lock.json
  git commit -m @'
chore(deps): add react-markdown + remark-gfm for manual viewer

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
'@
  ```

---

## Task 1 — `diagramTypes.ts`（图数据类型，独立于 core/types.ts）

无测试（纯类型）。约 3 分钟。

### Files
- **Create**: `src/diagram/diagramTypes.ts`

### Steps
- [ ] 1.1 创建 `src/diagram/diagramTypes.ts`，复用 core 的 `Facing`/`BeltMark` 类型别名，但坐标用**扁平 `col`/`row`**（无 `pos` 包裹、无 `floor`），`type` 用 `string`（允许未知 type 走灰框兜底，不限制为 PlaceableType）：

```ts
// src/diagram/diagramTypes.ts
// 示意图数据类型 —— 独立于 core/types.ts 的严格 MachineInstance。
// 坐标用扁平 col/row（子 cell，1 cell = 8m），允许小数、重叠，不做任何可建性校验。
import type { Facing, BeltMark } from '../core/types';

export type { Facing, BeltMark };

/** 一台机器（示意）。type 故意宽松为 string：未知 type 渲染为灰占位框。 */
export interface DiagramMachine {
  id: string;
  type: string;
  col: number;
  row: number;
  facing?: Facing;        // 默认 'south'
  label?: string;
  recipe?: string;
}

/** 一条传送带（示意）。path 原样画 polyline，from/to 可选用于把首尾贴到端口。 */
export interface DiagramBelt {
  id: string;
  mark?: BeltMark;        // 仅样式，不做容量校验
  from?: string;          // "machineId:portId"
  to?: string;            // "machineId:portId"
  path: [number, number][]; // [col,row][]，至少 1 点（软校验）
  label?: string;
  material?: string;      // 可选，影响 belt 颜色（缺省走默认色）
}

/** 区域底色块（示意）。color 是字面颜色字符串（如 "#3a8"），不是 CSS var 名。 */
export interface DiagramZone {
  label?: string;
  col: number;
  row: number;
  w: number;
  h: number;
  color?: string;         // 字面色，缺省走默认半透明
}

/** 文字注记。 */
export interface DiagramNote {
  col: number;
  row: number;
  text: string;
}

/** 一张示意图 = 一层（首批单层结构；叠层 BP14 用两个独立块）。 */
export interface DiagramScheme {
  id: string;
  title?: string;
  grid?: { cols: number; rows: number }; // 可选；缺省时由 computeBounds 推断
  machines: DiagramMachine[];
  belts?: DiagramBelt[];
  zones?: DiagramZone[];
  notes?: DiagramNote[];
}

/** parseDiagramBlock 的返回：成功 data，或失败 error（永不抛）。 */
export type ParseResult =
  | { ok: true; data: DiagramScheme }
  | { ok: false; error: string; raw: string };
```

- [ ] 1.2 类型自检：编译一遍确认无 TS 报错（PowerShell）：
  ```powershell
  npx tsc --noEmit -p tsconfig.app.json
  ```
  预期：无 error（若仅因后续文件未创建报「Cannot find module」与本文件无关，但本步只引用 `../core/types`，应当干净）。
- [ ] 1.3 用 `mcp__vscode-server-mcp__get_diagnostics_code` 检查 `src/diagram/diagramTypes.ts`，确认 0 error。
- [ ] 1.4 Commit：
  ```powershell
  git add src/diagram/diagramTypes.ts
  git commit -m @'
feat(diagram): add DiagramScheme types (flat col/row, decoupled from core)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
'@
  ```

---

## Task 2 — `diagramGeometry.ts`（薄封装 coordinate + computeBounds/fitViewBox/safeGetBuildingMeta）【TDD】

> **REQUIRED SUB-SKILL**: `superpowers:test-driven-development` — 严格 RED → GREEN。

### Files
- **Create**: `src/__tests__/diagramGeometry.test.ts`
- **Create**: `src/diagram/diagramGeometry.ts`

### Steps

- [ ] 2.1 **(RED)** 先写失败测试 `src/__tests__/diagramGeometry.test.ts`：

```ts
// src/__tests__/diagramGeometry.test.ts
import { describe, it, expect } from 'vitest';
import {
  computeBounds,
  fitViewBox,
  safeGetBuildingMeta,
  machineSvgRect,
} from '../diagram/diagramGeometry';
import type { DiagramMachine } from '../diagram/diagramTypes';

describe('diagramGeometry', () => {
  describe('safeGetBuildingMeta', () => {
    it('returns live registry meta for known type', () => {
      const meta = safeGetBuildingMeta('smelter');
      expect(meta.dimensions).toEqual({ width: 6, length: 9, height: 10 });
      expect(meta.color).toBe('--smelter');
    });
    it('returns gray fallback for unknown type (does not throw)', () => {
      const meta = safeGetBuildingMeta('does-not-exist');
      expect(meta).toBeTruthy();
      expect(meta.dimensions.width).toBeGreaterThan(0);
      expect(meta.dimensions.length).toBeGreaterThan(0);
      // fallback color must NOT be one of the real var names
      expect(meta.color).not.toBe('--smelter');
    });
  });

  describe('machineSvgRect', () => {
    it('maps smelter south at col0,row0 to padded SVG rect by live registry dims', () => {
      const m: DiagramMachine = { id: 'S1', type: 'smelter', col: 0, row: 0, facing: 'south' };
      const r = machineSvgRect(m);
      // gridToSvg(0,0) = {x:40,y:40}; smelter 6x9m → cols=6/8=0.75, rows=9/8=1.125
      expect(r.x).toBe(40);
      expect(r.y).toBe(40);
      expect(r.w).toBeCloseTo(0.75 * 80); // 60
      expect(r.h).toBeCloseTo(1.125 * 80); // 90
    });
    it('rotates dims for east facing (cols/rows swapped)', () => {
      const m: DiagramMachine = { id: 'S1', type: 'smelter', col: 0, row: 0, facing: 'east' };
      const r = machineSvgRect(m);
      // east swaps: cols=length/8=1.125, rows=width/8=0.75
      expect(r.w).toBeCloseTo(1.125 * 80); // 90
      expect(r.h).toBeCloseTo(0.75 * 80);  // 60
    });
    it('defaults facing to south when omitted', () => {
      const m: DiagramMachine = { id: 'S1', type: 'smelter', col: 0, row: 0 };
      const r = machineSvgRect(m);
      expect(r.w).toBeCloseTo(60);
      expect(r.h).toBeCloseTo(90);
    });
  });

  describe('computeBounds', () => {
    it('computes grid-cell bounds covering all machines footprints', () => {
      const machines: DiagramMachine[] = [
        { id: 'A', type: 'smelter', col: 0, row: 0, facing: 'south' },   // covers col 0..0.75, row 0..1.125
        { id: 'B', type: 'smelter', col: 2, row: 1, facing: 'south' },   // covers col 2..2.75, row 1..2.125
      ];
      const b = computeBounds(machines);
      expect(b.minCol).toBe(0);
      expect(b.minRow).toBe(0);
      expect(b.maxCol).toBeCloseTo(2.75);
      expect(b.maxRow).toBeCloseTo(2.125);
    });
    it('returns a 1x1 unit box when no machines', () => {
      const b = computeBounds([]);
      expect(b.maxCol - b.minCol).toBeGreaterThan(0);
      expect(b.maxRow - b.minRow).toBeGreaterThan(0);
    });
  });

  describe('fitViewBox', () => {
    it('returns a calcViewBox string sized from explicit grid', () => {
      const vb = fitViewBox({ cols: 5, rows: 5 }, []);
      // calcViewBox(5,5) = "0 0 (5*80+80) (5*80+80)" = "0 0 480 480"
      expect(vb).toBe('0 0 480 480');
    });
    it('falls back to bounds-derived size when grid omitted', () => {
      const machines: DiagramMachine[] = [
        { id: 'A', type: 'smelter', col: 0, row: 0, facing: 'south' },
      ];
      const vb = fitViewBox(undefined, machines);
      expect(vb.startsWith('0 0 ')).toBe(true);
      const parts = vb.split(' ').map(Number);
      expect(parts.length).toBe(4);
      expect(parts[2]).toBeGreaterThan(0);
      expect(parts[3]).toBeGreaterThan(0);
    });
  });
});
```

- [ ] 2.2 **(RED 跑)** 跑测试，预期 **FAIL**（模块不存在）：
  ```powershell
  npx vitest run src/__tests__/diagramGeometry.test.ts
  ```
  预期：`Cannot find module '../diagram/diagramGeometry'` 或全部用例 fail。

- [ ] 2.3 **(GREEN 实现)** 创建 `src/diagram/diagramGeometry.ts`：

```ts
// src/diagram/diagramGeometry.ts
// 薄封装 coordinate.ts 纯函数 + 新增 bounds/viewBox/safe meta。绝不 import schema/store。
import {
  GRID_PX,
  PAD,
  METERS_PER_GRID,
  gridToSvg,
  machineGridSize,
  resolvePortPosition,
  calcViewBox,
} from '../core/coordinate';
import { BUILDING_REGISTRY } from '../core/registry';
import type { BuildingMetadata, PortDef } from '../core/types';
import type { DiagramMachine } from './diagramTypes';

// re-export 给子渲染器统一从此处取，避免直接耦合 core 路径散落各处
export { GRID_PX, PAD, METERS_PER_GRID, gridToSvg, machineGridSize, resolvePortPosition, calcViewBox };

/** 未知 type 的灰占位元数据：1x1 cell（8x8m）灰框，无端口。 */
const GRAY_FALLBACK: BuildingMetadata = {
  type: 'smelter', // 占位，仅类型字段需要；不影响渲染
  category: 'production',
  displayName: '未知',
  dimensions: { width: 8, length: 8, height: 8 },
  clearanceHeight: 8,
  ports: [],
  color: '--diagram-unknown', // 在 manual.css 定义为灰
  powerUsage: 0,
  stackable: false,
  wallMounted: false,
};

const warned = new Set<string>();

/** 取 registry 元数据；未知 type → 灰兜底 + 一次性 dev warn，绝不 throw（不调 getBuildingMeta）。 */
export function safeGetBuildingMeta(type: string): BuildingMetadata {
  const meta = BUILDING_REGISTRY[type];
  if (meta) return meta;
  if (import.meta.env?.DEV && !warned.has(type)) {
    warned.add(type);
    // eslint-disable-next-line no-console
    console.warn(`[diagram] unknown building type "${type}", rendering gray placeholder`);
  }
  return GRAY_FALLBACK;
}

/** 根据 from/to 的 "machineId:portId" 找到 PortDef + 该机器，算端口绝对 SVG 坐标；找不到返回 null。 */
export function resolveDiagramPort(
  ref: string | undefined,
  machines: DiagramMachine[],
): { x: number; y: number } | null {
  if (!ref) return null;
  const idx = ref.indexOf(':');
  if (idx < 0) return null;
  const machineId = ref.slice(0, idx);
  const portId = ref.slice(idx + 1);
  const machine = machines.find((m) => m.id === machineId);
  if (!machine) return null;
  const meta = safeGetBuildingMeta(machine.type);
  const portDef: PortDef | undefined = meta.ports.find((p) => p.id === portId);
  if (!portDef) return null;
  return resolvePortPosition(
    { col: machine.col, row: machine.row },
    machine.facing ?? 'south',
    meta.dimensions,
    portDef,
  );
}

export interface MachineRect {
  x: number;
  y: number;
  w: number;
  h: number;
  cols: number;
  rows: number;
}

/** 一台机器的 SVG 矩形（已含 PAD、已含 facing 旋转）。 */
export function machineSvgRect(m: DiagramMachine): MachineRect {
  const meta = safeGetBuildingMeta(m.type);
  const { cols, rows } = machineGridSize(meta.dimensions, m.facing ?? 'south');
  const { x, y } = gridToSvg(m.col, m.row);
  return { x, y, w: cols * GRID_PX, h: rows * GRID_PX, cols, rows };
}

export interface Bounds {
  minCol: number;
  minRow: number;
  maxCol: number;
  maxRow: number;
}

/** 覆盖所有机器占地的 cell 边界；空数组返回 1x1 单位框。 */
export function computeBounds(machines: DiagramMachine[]): Bounds {
  if (machines.length === 0) {
    return { minCol: 0, minRow: 0, maxCol: 1, maxRow: 1 };
  }
  let minCol = Infinity;
  let minRow = Infinity;
  let maxCol = -Infinity;
  let maxRow = -Infinity;
  for (const m of machines) {
    const meta = safeGetBuildingMeta(m.type);
    const { cols, rows } = machineGridSize(meta.dimensions, m.facing ?? 'south');
    minCol = Math.min(minCol, m.col);
    minRow = Math.min(minRow, m.row);
    maxCol = Math.max(maxCol, m.col + cols);
    maxRow = Math.max(maxRow, m.row + rows);
  }
  return { minCol, minRow, maxCol, maxRow };
}

/** 计算 viewBox 字符串：优先用显式 grid，否则用机器 bounds 推断。 */
export function fitViewBox(
  grid: { cols: number; rows: number } | undefined,
  machines: DiagramMachine[],
): string {
  if (grid) return calcViewBox(grid.cols, grid.rows);
  const b = computeBounds(machines);
  const cols = Math.max(1, Math.ceil(b.maxCol));
  const rows = Math.max(1, Math.ceil(b.maxRow));
  return calcViewBox(cols, rows);
}
```

- [ ] 2.4 **(GREEN 跑)** 跑测试，预期全 **PASS**：
  ```powershell
  npx vitest run src/__tests__/diagramGeometry.test.ts
  ```
  预期：`Test Files 1 passed`，所有 `it` 绿。
- [ ] 2.5 用 `mcp__vscode-server-mcp__get_diagnostics_code` 检查两个新文件，0 error。
- [ ] 2.6 Commit：
  ```powershell
  git add src/diagram/diagramGeometry.ts src/__tests__/diagramGeometry.test.ts
  git commit -m @'
feat(diagram): add diagramGeometry (bounds/fitViewBox/safe meta/port resolve)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
'@
  ```

---

## Task 3 — `parseDiagramBlock.ts`（围栏文本 → DiagramScheme，永不抛）【TDD】

> **REQUIRED SUB-SKILL**: `superpowers:test-driven-development` — 严格 RED → GREEN。

### Files
- **Create**: `src/__tests__/parseDiagramBlock.test.ts`
- **Create**: `src/diagram/parseDiagramBlock.ts`

### Steps

- [ ] 3.1 **(RED)** 写失败测试 `src/__tests__/parseDiagramBlock.test.ts`：

```ts
// src/__tests__/parseDiagramBlock.test.ts
import { describe, it, expect } from 'vitest';
import { parseDiagramBlock } from '../diagram/parseDiagramBlock';

describe('parseDiagramBlock', () => {
  it('parses valid JSON into a DiagramScheme', () => {
    const raw = JSON.stringify({
      id: 'BP01-1F',
      title: 't',
      grid: { cols: 5, rows: 5 },
      machines: [{ id: 'S1', type: 'smelter', col: 0.25, row: 0.5, facing: 'south' }],
      belts: [{ id: 'b1', mark: 2, from: 'S1:out-0', to: 'S2:in-0', path: [[0.5, 1.5], [4.5, 1.5]] }],
    });
    const res = parseDiagramBlock(raw);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.id).toBe('BP01-1F');
      expect(res.data.machines).toHaveLength(1);
      expect(res.data.machines[0].type).toBe('smelter');
      expect(res.data.belts?.[0].path).toEqual([[0.5, 1.5], [4.5, 1.5]]);
    }
  });

  it('returns ok=false (does NOT throw) on malformed JSON', () => {
    const res = parseDiagramBlock('{ not json ]');
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toMatch(/.+/);          // some error message
      expect(res.raw).toBe('{ not json ]');     // raw preserved for error card
    }
  });

  it('defaults missing optional collections to safe empties', () => {
    const res = parseDiagramBlock(JSON.stringify({ id: 'x', machines: [] }));
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.machines).toEqual([]);
      expect(res.data.belts).toEqual([]);
      expect(res.data.zones).toEqual([]);
      expect(res.data.notes).toEqual([]);
    }
  });

  it('rejects JSON that is valid but not a diagram object (e.g. array/number)', () => {
    expect(parseDiagramBlock('42').ok).toBe(false);
    expect(parseDiagramBlock('[1,2,3]').ok).toBe(false);
  });

  it('does not throw and keeps unknown machine type as-is (renderer handles gray fallback)', () => {
    const res = parseDiagramBlock(
      JSON.stringify({ id: 'x', machines: [{ id: 'U1', type: 'no-such-type', col: 0, row: 0 }] }),
    );
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data.machines[0].type).toBe('no-such-type');
  });

  it('coerces an absent machines array to []', () => {
    const res = parseDiagramBlock(JSON.stringify({ id: 'x' }));
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data.machines).toEqual([]);
  });
});
```

- [ ] 3.2 **(RED 跑)** 预期 **FAIL**：
  ```powershell
  npx vitest run src/__tests__/parseDiagramBlock.test.ts
  ```
  预期：`Cannot find module '../diagram/parseDiagramBlock'`。

- [ ] 3.3 **(GREEN 实现)** 创建 `src/diagram/parseDiagramBlock.ts`：

```ts
// src/diagram/parseDiagramBlock.ts
// 围栏 ```diagram 文本 → DiagramScheme。全程 try/catch，永不抛错，软校验填默认值。
import type {
  DiagramScheme,
  DiagramMachine,
  DiagramBelt,
  DiagramZone,
  DiagramNote,
  ParseResult,
} from './diagramTypes';

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

export function parseDiagramBlock(raw: string): ParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e), raw };
  }

  if (!isObject(parsed)) {
    return { ok: false, error: 'diagram block must be a JSON object', raw };
  }

  try {
    const data: DiagramScheme = {
      id: typeof parsed.id === 'string' ? parsed.id : 'diagram',
      title: typeof parsed.title === 'string' ? parsed.title : undefined,
      grid: isObject(parsed.grid)
        && typeof parsed.grid.cols === 'number'
        && typeof parsed.grid.rows === 'number'
        ? { cols: parsed.grid.cols, rows: parsed.grid.rows }
        : undefined,
      machines: asArray<DiagramMachine>(parsed.machines),
      belts: asArray<DiagramBelt>(parsed.belts),
      zones: asArray<DiagramZone>(parsed.zones),
      notes: asArray<DiagramNote>(parsed.notes),
    };
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e), raw };
  }
}
```

- [ ] 3.4 **(GREEN 跑)** 预期全 **PASS**：
  ```powershell
  npx vitest run src/__tests__/parseDiagramBlock.test.ts
  ```
- [ ] 3.5 `mcp__vscode-server-mcp__get_diagnostics_code` 检查新文件，0 error。
- [ ] 3.6 Commit：
  ```powershell
  git add src/diagram/parseDiagramBlock.ts src/__tests__/parseDiagramBlock.test.ts
  git commit -m @'
feat(diagram): add parseDiagramBlock (try/catch never throws, soft defaults)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
'@
  ```

---

## Task 4 — `DiagramGridRenderer.tsx`（背景网格，纯 SVG）

无单测（纯 SVG，靠后续截图验收）。约 4 分钟。

### Files
- **Create**: `src/diagram/DiagramGridRenderer.tsx`

### Steps
- [ ] 4.1 创建 `src/diagram/DiagramGridRenderer.tsx`，复用现有 `.grid-line`/`.grid-line-major`/`.grid-label` CSS class（已在 theme.css 定义，全局可用），用 `gridToSvg` 画整数 cell 线：

```tsx
// src/diagram/DiagramGridRenderer.tsx
import { memo } from 'react';
import { gridToSvg } from './diagramGeometry';

interface Props {
  cols: number;
  rows: number;
}

/** 背景网格：每 1 cell 一条线，每 5 cell 加粗（major）。复用 theme.css 的 .grid-line。 */
function DiagramGridRendererImpl({ cols, rows }: Props) {
  const lines: React.ReactNode[] = [];
  const c = Math.max(1, Math.ceil(cols));
  const r = Math.max(1, Math.ceil(rows));

  for (let col = 0; col <= c; col++) {
    const top = gridToSvg(col, 0);
    const bottom = gridToSvg(col, r);
    lines.push(
      <line
        key={`v${col}`}
        className={col % 5 === 0 ? 'grid-line grid-line-major' : 'grid-line'}
        x1={top.x}
        y1={top.y}
        x2={bottom.x}
        y2={bottom.y}
      />,
    );
  }
  for (let row = 0; row <= r; row++) {
    const left = gridToSvg(0, row);
    const right = gridToSvg(c, row);
    lines.push(
      <line
        key={`h${row}`}
        className={row % 5 === 0 ? 'grid-line grid-line-major' : 'grid-line'}
        x1={left.x}
        y1={left.y}
        x2={right.x}
        y2={right.y}
      />,
    );
  }
  return <g className="diagram-grid">{lines}</g>;
}

export const DiagramGridRenderer = memo(DiagramGridRendererImpl);
```

- [ ] 4.2 `mcp__vscode-server-mcp__get_diagnostics_code` 检查，0 error（注意 `React.ReactNode` 需 `import type` 或用全局 JSX — 这里用了 `React.ReactNode`，若 `noUnusedLocals` 抱怨需显式 `import type React from 'react'`；若 jsx runtime 已提供全局 React，改用 `import { type ReactNode }` 并把数组类型写成 `ReactNode[]`）。**实现时按 diagnostics 实际报错选其一**：
  - 方案 A：`import { memo, type ReactNode } from 'react';` 并把数组类型改成 `const lines: ReactNode[] = [];`。
  - 采用方案 A 更干净（避免引入未用的默认 React import）。
- [ ] 4.3 Commit：
  ```powershell
  git add src/diagram/DiagramGridRenderer.tsx
  git commit -m @'
feat(diagram): add DiagramGridRenderer (reuses theme.css grid styles)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
'@
  ```

---

## Task 5 — `DiagramMachineRenderer.tsx`（机器 footprint+body+端口点+label）

无单测（纯 SVG）。约 5 分钟。

### Files
- **Create**: `src/diagram/DiagramMachineRenderer.tsx`

### Steps
- [ ] 5.1 创建 `src/diagram/DiagramMachineRenderer.tsx`，复刻 `MachineRenderer.tsx` 的 footprint + inset body 双 rect 风格，端口点用**新 className** `diagram-port`（不复用 `.port-dot`，因后者 `opacity:0` 仅 hover 可见），显式给 `r`，in 橙 `#ff9800` / out 绿 `#4caf50`：

```tsx
// src/diagram/DiagramMachineRenderer.tsx
import { memo } from 'react';
import { resolvePortPosition, machineSvgRect, safeGetBuildingMeta } from './diagramGeometry';
import type { DiagramMachine } from './diagramTypes';

interface Props {
  machine: DiagramMachine;
}

// 复刻 MachineRenderer：浅底类型用深色文字
const LIGHT_BG_TYPES = new Set([
  'splitter', 'merger', 'constructor', 'assembler', 'industrial-storage',
  'conveyor-lift-in-bottom', 'conveyor-lift-out-bottom',
  'conveyor-lift-in-top', 'conveyor-lift-out-top',
]);

function DiagramMachineRendererImpl({ machine }: Props) {
  const meta = safeGetBuildingMeta(machine.type);
  const { x, y, w, h } = machineSvgRect(machine);

  if (!isFinite(x) || !isFinite(y) || !isFinite(w) || !isFinite(h) || w <= 0 || h <= 0) {
    if (import.meta.env?.DEV) {
      // eslint-disable-next-line no-console
      console.warn(`[diagram] skipping machine "${machine.id}" with invalid geometry`);
    }
    return null;
  }

  // registry.color 是 CSS var 名；缺失的 var 自动回退到默认（manual.css 定义 --diagram-default）
  const color = `var(${meta.color}, var(--diagram-default))`;

  const inset = Math.min(w, h) * 0.08;
  const bx = x + inset;
  const by = y + inset;
  const bw = w - inset * 2;
  const bh = h - inset * 2;

  const isSmall = bw < 50 || bh < 50;
  const label = machine.label ?? machine.id;
  const displayLabel = isSmall ? label.slice(0, 2) : label;
  const labelFontSize = isSmall ? 8 : 9;
  const labelColor = LIGHT_BG_TYPES.has(machine.type) ? '#12151c' : '#e4ecf4';
  const subLabel = machine.recipe;

  return (
    <g className="diagram-machine-group">
      <rect className="machine-footprint" x={x} y={y} width={w} height={h} rx={3} stroke={color} />
      <rect
        className="machine-body"
        x={bx}
        y={by}
        width={bw}
        height={bh}
        rx={2}
        style={{ fill: color, stroke: color }}
      />
      <text
        className="machine-label"
        x={bx + bw / 2}
        y={by + bh / 2 + (subLabel && !isSmall ? -3 : 0)}
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: labelFontSize, fill: labelColor }}
      >
        {displayLabel}
      </text>
      {subLabel && !isSmall && (
        <text
          className="machine-sublabel"
          x={bx + bw / 2}
          y={by + bh / 2 + 9}
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontSize: 7, fill: labelColor, opacity: 0.85 }}
        >
          {subLabel}
        </text>
      )}
      {meta.ports.map((portDef) => {
        const p = resolvePortPosition(
          { col: machine.col, row: machine.row },
          machine.facing ?? 'south',
          meta.dimensions,
          portDef,
        );
        if (!isFinite(p.x) || !isFinite(p.y)) return null;
        const isIn = portDef.kind.includes('in');
        return (
          <circle
            key={portDef.id}
            className="diagram-port"
            cx={p.x}
            cy={p.y}
            r={3}
            fill={isIn ? '#ff9800' : '#4caf50'}
          />
        );
      })}
    </g>
  );
}

export const DiagramMachineRenderer = memo(DiagramMachineRendererImpl);
```

- [ ] 5.2 `mcp__vscode-server-mcp__get_diagnostics_code` 检查，0 error。
- [ ] 5.3 Commit：
  ```powershell
  git add src/diagram/DiagramMachineRenderer.tsx
  git commit -m @'
feat(diagram): add DiagramMachineRenderer (registry dims, ports always visible)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
'@
  ```

---

## Task 6 — `DiagramBeltRenderer.tsx`（polyline 虚线 + atan2 箭头 + 端口贴合）

无单测（纯 SVG）。约 5 分钟。

### Files
- **Create**: `src/diagram/DiagramBeltRenderer.tsx`

### Steps
- [ ] 6.1 创建 `src/diagram/DiagramBeltRenderer.tsx`。**不复用 beltGeometry**（其 `buildBeltRenderPath` 会改中间桥接点，且签名要 `MachineInstance`）。改为：把 `path` 的每点经 `gridToSvg` 转 SVG 点，若 `from`/`to` 可解析则替换首/尾点为端口绝对坐标（中间折点不动，严格符合 spec），polyline 复用 `belt-line belt-mk{n}` class，末端用 `atan2` 自算箭头角度：

```tsx
// src/diagram/DiagramBeltRenderer.tsx
import { memo } from 'react';
import { gridToSvg, resolveDiagramPort } from './diagramGeometry';
import type { DiagramBelt, DiagramMachine } from './diagramTypes';

interface Props {
  belt: DiagramBelt;
  machines: DiagramMachine[];
}

const DEFAULT_BELT_COLOR = '#90c8e8';

function DiagramBeltRendererImpl({ belt, machines }: Props) {
  if (!Array.isArray(belt.path) || belt.path.length < 1) return null;

  // path cell 坐标 → SVG 点
  const pts = belt.path
    .filter((p) => Array.isArray(p) && p.length >= 2 && isFinite(p[0]) && isFinite(p[1]))
    .map(([col, row]) => gridToSvg(col, row));

  if (pts.length < 1) return null;

  // 端口贴合：首尾点替换为端口绝对坐标，中间不动
  const fromPort = resolveDiagramPort(belt.from, machines);
  const toPort = resolveDiagramPort(belt.to, machines);
  if (fromPort) pts[0] = fromPort;
  if (toPort) pts[pts.length - 1] = toPort;

  // 端口贴合后可能首尾与原 path 重合，至少需要 2 个不同点才画线
  if (pts.length < 2) {
    // 退化：仅端口存在时画端到端直线
    if (fromPort && toPort) pts.splice(0, pts.length, fromPort, toPort);
    else return null;
  }

  const color = DEFAULT_BELT_COLOR;
  const mark = belt.mark ?? 1;
  const points = pts.map((p) => `${p.x},${p.y}`).join(' ');

  // 箭头：末段方向
  const last = pts[pts.length - 1];
  const prev = pts[pts.length - 2];
  const angle = Math.atan2(last.y - prev.y, last.x - prev.x) * (180 / Math.PI);

  // 标签：放中点
  const mid = pts[Math.floor(pts.length / 2)];

  return (
    <g className="diagram-belt-group">
      <polyline
        className={`belt-line belt-mk${mark}`}
        points={points}
        fill="none"
        stroke={color}
        strokeDasharray="8 8"
      />
      <polygon
        className="belt-arrow"
        points="-4,-2.5 0,0 -4,2.5"
        fill={color}
        transform={`translate(${last.x},${last.y}) rotate(${angle})`}
      />
      {belt.label && (
        <text
          className="belt-label"
          x={mid.x}
          y={mid.y - 4}
          textAnchor="middle"
          style={{ fontSize: 7, fill: color }}
        >
          {belt.label}
        </text>
      )}
    </g>
  );
}

export const DiagramBeltRenderer = memo(DiagramBeltRendererImpl);
```

- [ ] 6.2 `mcp__vscode-server-mcp__get_diagnostics_code` 检查，0 error。
- [ ] 6.3 Commit：
  ```powershell
  git add src/diagram/DiagramBeltRenderer.tsx
  git commit -m @'
feat(diagram): add DiagramBeltRenderer (raw polyline, port snap, atan2 arrow)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
'@
  ```

---

## Task 7 — `DiagramView.tsx`（容器：auto-fit viewBox + 组合子层 + zones/notes + 错误卡片）

UI 任务，无单测；实现后随 ManualView 一起截图验收。约 5 分钟。

### Files
- **Create**: `src/diagram/DiagramView.tsx`

### Steps
- [ ] 7.1 创建 `src/diagram/DiagramView.tsx`。接受 `ParseResult`（成功画 SVG，失败画红卡片），SVG 顺序：grid → zones → machines → belts → notes。zones 的 `color` 当**字面色**（不 `var()` 包裹），notes 画文字：

```tsx
// src/diagram/DiagramView.tsx
import { memo } from 'react';
import { gridToSvg, fitViewBox } from './diagramGeometry';
import { DiagramGridRenderer } from './DiagramGridRenderer';
import { DiagramMachineRenderer } from './DiagramMachineRenderer';
import { DiagramBeltRenderer } from './DiagramBeltRenderer';
import type { DiagramScheme, ParseResult } from './diagramTypes';

interface Props {
  result: ParseResult;
}

function ErrorCard({ error, raw }: { error: string; raw: string }) {
  return (
    <div className="diagram-error-card">
      <div className="diagram-error-title">⚠ diagram 解析失败：{error}</div>
      <pre className="diagram-error-raw">{raw}</pre>
    </div>
  );
}

function DiagramSvg({ scheme }: { scheme: DiagramScheme }) {
  const machines = scheme.machines ?? [];
  const belts = scheme.belts ?? [];
  const zones = scheme.zones ?? [];
  const notes = scheme.notes ?? [];

  const viewBox = fitViewBox(scheme.grid, machines);
  const gridCols = scheme.grid?.cols ?? Math.ceil(Number(viewBox.split(' ')[2]) / 80);
  const gridRows = scheme.grid?.rows ?? Math.ceil(Number(viewBox.split(' ')[3]) / 80);

  return (
    <figure className="diagram-figure">
      {scheme.title && <figcaption className="diagram-caption">{scheme.title}</figcaption>}
      <svg className="diagram-svg" viewBox={viewBox} preserveAspectRatio="xMidYMid meet">
        <DiagramGridRenderer cols={gridCols} rows={gridRows} />

        {/* zones：字面色，半透明底块 */}
        {zones.map((z, i) => {
          const tl = gridToSvg(z.col, z.row);
          const br = gridToSvg(z.col + z.w, z.row + z.h);
          return (
            <g key={`zone-${i}`} className="diagram-zone">
              <rect
                x={tl.x}
                y={tl.y}
                width={br.x - tl.x}
                height={br.y - tl.y}
                rx={4}
                fill={z.color ?? '#3a8'}
                fillOpacity={0.12}
                stroke={z.color ?? '#3a8'}
                strokeOpacity={0.4}
              />
              {z.label && (
                <text className="diagram-zone-label" x={tl.x + 6} y={tl.y + 14} style={{ fontSize: 8 }}>
                  {z.label}
                </text>
              )}
            </g>
          );
        })}

        {machines.map((m) => (
          <DiagramMachineRenderer key={m.id} machine={m} />
        ))}

        {belts.map((b) => (
          <DiagramBeltRenderer key={b.id} belt={b} machines={machines} />
        ))}

        {notes.map((n, i) => {
          const p = gridToSvg(n.col, n.row);
          return (
            <text
              key={`note-${i}`}
              className="diagram-note"
              x={p.x}
              y={p.y}
              style={{ fontSize: 8 }}
            >
              {n.text}
            </text>
          );
        })}
      </svg>
    </figure>
  );
}

function DiagramViewImpl({ result }: Props) {
  if (!result.ok) return <ErrorCard error={result.error} raw={result.raw} />;
  return <DiagramSvg scheme={result.data} />;
}

export const DiagramView = memo(DiagramViewImpl);
```

- [ ] 7.2 `mcp__vscode-server-mcp__get_diagnostics_code` 检查，0 error。
- [ ] 7.3 Commit：
  ```powershell
  git add src/diagram/DiagramView.tsx
  git commit -m @'
feat(diagram): add DiagramView (auto-fit viewBox, zones/notes, error card)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
'@
  ```

---

## Task 8 — `manual.css`（文档站样式 + diagram CSS 变量兜底）

无测试。约 4 分钟。

### Files
- **Create**: `src/manual/manual.css`

### Steps
- [ ] 8.1 创建 `src/manual/manual.css`，复用 theme.css 的 `:root` 变量，定义：目录树、正文 typography、表格、diagram 图容器、错误卡片、以及 **diagram 兜底色变量** `--diagram-default` / `--diagram-unknown`（供 `DiagramMachineRenderer` 的 `var(${meta.color}, var(--diagram-default))` 与灰框使用）：

```css
/* src/manual/manual.css —— 复用 theme.css 的 :root 变量，纯全局 CSS */

:root {
  --diagram-default: #5a7a92;   /* registry 未定义 var 的机器兜底色 */
  --diagram-unknown: #4a5560;   /* 未知 type 灰占位 */
}

/* ===== 布局：左目录 + 右正文 ===== */
.manual-view {
  display: grid;
  grid-template-columns: 220px 1fr;
  height: 100%;
  overflow: hidden;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.manual-sidebar {
  border-right: 1px solid var(--border);
  background: var(--bg-secondary);
  overflow-y: auto;
  padding: 12px 0;
}
.manual-sidebar-title {
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  padding: 4px 16px 8px;
  text-transform: uppercase;
}
.manual-doc-item {
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 12px;
  padding: 6px 16px;
  cursor: pointer;
}
.manual-doc-item:hover { background: var(--bg-hover); }
.manual-doc-item.active {
  background: var(--bg-active);
  color: var(--accent);
  border-left: 2px solid var(--accent);
}

/* ===== 正文区（独立滚动容器，不被 <main> pan 干扰） ===== */
.manual-content {
  overflow-y: auto;
  padding: 24px 40px 80px;
  max-width: 980px;
  line-height: 1.7;
}
.manual-content h1 { font-size: 22px; margin: 0.6em 0 0.4em; }
.manual-content h2 { font-size: 18px; margin: 1.2em 0 0.4em; border-bottom: 1px solid var(--border-subtle); padding-bottom: 4px; }
.manual-content h3 { font-size: 15px; margin: 1em 0 0.3em; color: var(--text-secondary); }
.manual-content p { margin: 0.5em 0; }
.manual-content ul, .manual-content ol { padding-left: 1.4em; margin: 0.5em 0; }
.manual-content code {
  font-family: var(--font-mono);
  font-size: 0.88em;
  background: var(--bg-secondary);
  padding: 1px 4px;
  border-radius: 3px;
}
.manual-content pre {
  background: var(--bg-canvas);
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  padding: 12px;
  overflow-x: auto;
}
.manual-content pre code { background: none; padding: 0; }
.manual-content table {
  border-collapse: collapse;
  margin: 0.8em 0;
  font-size: 13px;
}
.manual-content th, .manual-content td {
  border: 1px solid var(--border);
  padding: 5px 10px;
  text-align: left;
}
.manual-content th { background: var(--bg-secondary); color: var(--text-secondary); }
.manual-content a { color: var(--accent); text-decoration: none; }
.manual-content a:hover { text-decoration: underline; }

.manual-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
}

/* ===== diagram 图容器 ===== */
.diagram-figure {
  margin: 16px 0;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg-canvas);
  padding: 8px;
}
.diagram-caption {
  font-size: 12px;
  color: var(--text-secondary);
  padding: 4px 6px 8px;
  font-family: var(--font-mono);
}
.diagram-svg {
  display: block;
  width: 100%;
  height: auto;
  max-height: 70vh;
}
.diagram-port { pointer-events: none; }
.diagram-zone-label { fill: var(--text-secondary); font-family: var(--font-mono); }
.diagram-note { fill: var(--text-muted); font-family: var(--font-mono); }

/* ===== 错误卡片 ===== */
.diagram-error-card {
  margin: 16px 0;
  border: 1px solid #ef5350;
  border-radius: 8px;
  background: rgba(239, 83, 80, 0.08);
  padding: 12px 14px;
}
.diagram-error-title { color: #ef5350; font-size: 13px; margin-bottom: 8px; }
.diagram-error-raw {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}
```

- [ ] 8.2 Commit：
  ```powershell
  git add src/manual/manual.css
  git commit -m @'
feat(manual): add manual.css (sidebar/typography/diagram container/error card)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
'@
  ```

---

## Task 9 — `ManualView.tsx`（目录树 + react-markdown 渲染 + language-diagram 拦截）

UI 任务，无单测；与 App 接入后一起截图验收。约 5 分钟。

### Files
- **Create**: `src/manual/ManualView.tsx`

### Steps
- [ ] 9.1 创建 `src/manual/ManualView.tsx`。用 `import.meta.glob` 取 18 个 md 的 raw loader（lazy），左侧目录树排序点击，右侧懒加载 + react-markdown(+remark-gfm)，`components.code` 拦截 `language-diagram`。**注意 react-markdown v9 的 `code` 组件签名**：props 含 `className` 与 `children`；通过 `className?.includes('language-diagram')` 判定。正文容器自带滚动并 `stopPropagation` 防 `<main>` pan 干扰：

```tsx
// src/manual/ManualView.tsx
import { useMemo, useState, useEffect, type ComponentProps } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { parseDiagramBlock } from '../diagram/parseDiagramBlock';
import { DiagramView } from '../diagram/DiagramView';
import './manual.css';

// 18 个 BP md 的 raw loader（lazy），key = '/docs/.../BPxx.md'
const docModules = import.meta.glob(
  '/docs/superpowers/specs/2026-05-24-tier7-blueprints/*.md',
  { query: '?raw', import: 'default', eager: false },
) as Record<string, () => Promise<string>>;

function fileName(path: string): string {
  return path.split('/').pop() ?? path;
}

const docPaths = Object.keys(docModules).sort();

// react-markdown 的 code 组件：拦截 ```diagram
function CodeBlock(props: ComponentProps<'code'> & { className?: string }) {
  const { className, children } = props;
  if (className && className.includes('language-diagram')) {
    const raw = String(children ?? '').replace(/\n$/, '');
    const result = parseDiagramBlock(raw); // 永不抛
    return <DiagramView result={result} />;
  }
  return <code className={className}>{children}</code>;
}

const MD_COMPONENTS = { code: CodeBlock };

export function ManualView() {
  const [activePath, setActivePath] = useState<string>(docPaths[0] ?? '');
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activePath || !docModules[activePath]) return;
    let cancelled = false;
    setLoading(true);
    docModules[activePath]()
      .then((raw) => {
        if (!cancelled) setContent(raw);
      })
      .catch((e) => {
        if (!cancelled) setContent(`加载失败: ${String(e)}`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activePath]);

  const items = useMemo(
    () =>
      docPaths.map((p) => ({
        path: p,
        name: fileName(p).replace(/\.md$/, ''),
      })),
    [],
  );

  return (
    <div
      className="manual-view"
      // 阻断 <main> 的 pan/wheel，保证文本可选中、正文可独立滚动
      onMouseDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <aside className="manual-sidebar">
        <div className="manual-sidebar-title">蓝图手册 (T7)</div>
        {items.map((it) => (
          <button
            key={it.path}
            className={`manual-doc-item ${activePath === it.path ? 'active' : ''}`}
            onClick={() => setActivePath(it.path)}
          >
            {it.name}
          </button>
        ))}
      </aside>
      <div className="manual-content">
        {loading && <div className="manual-empty">加载中…</div>}
        {!loading && !content && <div className="manual-empty">选择左侧文档查看</div>}
        {!loading && content && (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
            {content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}
```

- [ ] 9.2 `mcp__vscode-server-mcp__get_diagnostics_code` 检查，0 error。若 react-markdown 类型对 `components.code` 抱怨 children 类型，把 `CodeBlock` 的 props 类型放宽为 `any`（react-markdown v9 的 code component 类型在不同版本有差异）并在该行加注释说明。
- [ ] 9.3 Commit：
  ```powershell
  git add src/manual/ManualView.tsx
  git commit -m @'
feat(manual): add ManualView (doc tree + react-markdown + diagram interception)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
'@
  ```

---

## Task 10 — `types.ts` ViewMode 扩 `'manual'`

无测试（类型联合扩展，自动流向 store/TopBar）。约 2 分钟。

### Files
- **Modify**: `src/core/types.ts` — L151

### Steps
- [ ] 10.1 编辑 `src/core/types.ts` L151，把 ViewMode 联合扩一个 `'manual'`：
  - 原：`export type ViewMode = 'single' | 'linked';`
  - 改为：`export type ViewMode = 'single' | 'linked' | 'manual';`
  （用 Edit 工具，old_string 为整行 `export type ViewMode = 'single' | 'linked';`）
- [ ] 10.2 类型自检（PowerShell），确认无回归：
  ```powershell
  npx tsc --noEmit -p tsconfig.app.json
  ```
  预期：0 error（widening 自动流向 `useAppStore.setViewMode` 与 TopBar）。
- [ ] 10.3 `mcp__vscode-server-mcp__get_diagnostics_code` 检查 `src/core/types.ts`，0 error。
- [ ] 10.4 Commit：
  ```powershell
  git add src/core/types.ts
  git commit -m @'
feat(core): widen ViewMode union with 'manual'

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
'@
  ```

---

## Task 11 — `TopBar.tsx` 加「手册」按钮

无测试。约 2 分钟。

### Files
- **Modify**: `src/ui/TopBar.tsx` — L4-7（VIEW_MODES 数组）

### Steps
- [ ] 11.1 先 Read `src/ui/TopBar.tsx` 的 L1-10 确认 VIEW_MODES 实际写法，然后用 Edit 把 `manual` 加进数组。预期目标形态：
  ```ts
  const VIEW_MODES: { id: ViewMode; label: string }[] = [
    { id: 'single', label: '单层' },
    { id: 'linked', label: '联动' },
    { id: 'manual', label: '手册' },
  ];
  ```
  （old_string 取现有两项数组字面量，new_string 加第三项；按钮渲染由现有 `.map` 自动产出，CSS class 已存在，无需改其它）
- [ ] 11.2 `mcp__vscode-server-mcp__get_diagnostics_code` 检查 `src/ui/TopBar.tsx`，0 error。
- [ ] 11.3 Commit：
  ```powershell
  git add src/ui/TopBar.tsx
  git commit -m @'
feat(ui): add 手册 view-mode button to TopBar

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
'@
  ```

---

## Task 12 — `App.tsx` 加 manual 分支 + 修「加载方案中」遮挡

UI 接入，无单测；与下游一起截图验收。约 4 分钟。

### Files
- **Modify**: `src/App.tsx` — import 区（~L15-16）+ `<main>` 渲染块（~L165-180）

### Steps
- [ ] 12.1 Read `src/App.tsx` L1-50 与 L155-185，确认 import 区与 `<main>` 分支实际行号/写法（侦察给的行号是参考，以实际为准）。
- [ ] 12.2 加 import（在现有 view import 附近）：
  ```ts
  import { ManualView } from './manual/ManualView';
  ```
- [ ] 12.3 在 `<main>` 渲染块加 manual 分支（**无 currentScheme 守卫**，手册不依赖方案）：
  ```tsx
  {viewMode === 'manual' && <ManualView />}
  ```
- [ ] 12.4 **关键修复**：把「加载方案中」分支加 `&& viewMode !== 'manual'`，否则初始 `currentScheme` 为 null 时会盖住手册视图。改：
  - 原：`{!currentScheme && (<div ...>加载方案中...</div>)}`
  - 改为：`{!currentScheme && viewMode !== 'manual' && (<div ...>加载方案中...</div>)}`
  （用 Edit 工具精确匹配该 JSX 行；保留原 div 内容/className 不变，仅在条件中插入 `&& viewMode !== 'manual'`）
- [ ] 12.5 类型自检：
  ```powershell
  npx tsc --noEmit -p tsconfig.app.json
  ```
  预期 0 error。
- [ ] 12.6 `mcp__vscode-server-mcp__get_diagnostics_code` 检查 `src/App.tsx`，0 error。
- [ ] 12.7 跑全量测试确认无回归（PowerShell，后台不需要，秒级）：
  ```powershell
  npx vitest run
  ```
  预期：原有测试 + 两个新测试文件全 PASS（`registry.test.ts` 的 stale 5×10 断言**与本次无关**，若它本就 fail 属历史问题 — 在 commit 说明里注明「不属本次改动」，不修它）。
- [ ] 12.8 Commit：
  ```powershell
  git add src/App.tsx
  git commit -m @'
feat(app): mount ManualView for viewMode=manual; gate loading branch

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
'@
  ```

---

## Task 13 — BP01 内嵌 `diagram` 块（9 个 smelter，真实子 cell 坐标）

无测试；下游 dev server 截图验收。约 4 分钟。

### Files
- **Modify**: `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP01-iron-ingot.md`

### Steps
- [ ] 13.1 Read `BP01-iron-ingot.md`，定位现有 ASCII 俯视图块（约在「平面布局」/「俯视图」小节），**保留 ASCII 作人读注释**，在其**下方**插入一个 ` ```diagram ` 围栏块。9 个 smelter 横向排开（smelter south 占 0.75 cols × 1.125 rows），间隔 1 cell（留出 belt 通道）。坐标为子 cell，尺寸由 registry 决定不写进 data：

````markdown
```diagram
{
  "id": "BP01-1F",
  "title": "BP01 1F (0-10m)：9× 冶炼炉 → 铁锭",
  "grid": { "cols": 10, "rows": 4 },
  "zones": [
    { "label": "冶炼区", "col": 0, "row": 0, "w": 10, "h": 2, "color": "#3a8" }
  ],
  "machines": [
    { "id": "S1", "type": "smelter", "col": 0,    "row": 0.5, "facing": "south", "label": "S1", "recipe": "铁锭" },
    { "id": "S2", "type": "smelter", "col": 1,    "row": 0.5, "facing": "south", "label": "S2", "recipe": "铁锭" },
    { "id": "S3", "type": "smelter", "col": 2,    "row": 0.5, "facing": "south", "label": "S3", "recipe": "铁锭" },
    { "id": "S4", "type": "smelter", "col": 3,    "row": 0.5, "facing": "south", "label": "S4", "recipe": "铁锭" },
    { "id": "S5", "type": "smelter", "col": 4,    "row": 0.5, "facing": "south", "label": "S5", "recipe": "铁锭" },
    { "id": "S6", "type": "smelter", "col": 5,    "row": 0.5, "facing": "south", "label": "S6", "recipe": "铁锭" },
    { "id": "S7", "type": "smelter", "col": 6,    "row": 0.5, "facing": "south", "label": "S7", "recipe": "铁锭" },
    { "id": "S8", "type": "smelter", "col": 7,    "row": 0.5, "facing": "south", "label": "S8", "recipe": "铁锭" },
    { "id": "S9", "type": "smelter", "col": 8,    "row": 0.5, "facing": "south", "label": "S9", "recipe": "铁锭" }
  ],
  "belts": [
    { "id": "b1", "mark": 2, "from": "S1:out-0", "path": [[0.375, 1.625], [0.375, 3], [9, 3]], "label": "collect" },
    { "id": "b2", "mark": 2, "from": "S5:out-0", "path": [[4.375, 1.625], [4.375, 3]] },
    { "id": "b3", "mark": 2, "from": "S9:out-0", "path": [[8.375, 1.625], [8.375, 3], [9, 3]] }
  ],
  "notes": [
    { "col": 9, "row": 3.2, "text": "→ 送往主母线" }
  ]
}
```
````
> 注：smelter south `out-0` 端口在 front(bottom)、offsetAlongEdge=3m → 端口 col 偏移 3/8=0.375 cell。belt 首点写 `[col+0.375, row+1.125]`≈端口附近，from 会自动贴合，写大致值即可。9 台从 col 0 起每隔 1 cell（机器宽 0.75，留 0.25 空隙）。

- [ ] 13.2 Commit：
  ```powershell
  git add docs/superpowers/specs/2026-05-24-tier7-blueprints/BP01-iron-ingot.md
  git commit -m @'
docs(BP01): embed diagram block (9 smelters) alongside ASCII

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
'@
  ```

---

## Task 14 — BP14 内嵌叠层两个 `diagram` 块（1F/2F 各 1 台 manufacturer）

无测试；下游截图验收。约 4 分钟。

### Files
- **Modify**: `docs/superpowers/specs/2026-05-24-tier7-blueprints/BP14-hmf-computer.md`

### Steps
- [ ] 14.1 Read `BP14-hmf-computer.md`，定位 1F / 2F 的 ASCII 俯视图小节。在 **1F 小节**下插一个 diagram 块、**2F 小节**下插另一个（两个独立块＝叠层用两块呈现）。manufacturer 20×22m → south 占 2.5 cols × 2.75 rows，5 端口（in-0..in-3 在 front/bottom、out-0 在 back/top）：

1F 块：
````markdown
```diagram
{
  "id": "BP14-1F",
  "title": "BP14 1F：制造机（HMF/计算机产线·下层）",
  "grid": { "cols": 5, "rows": 5 },
  "zones": [
    { "label": "制造区 1F", "col": 0, "row": 0, "w": 4, "h": 4, "color": "#ef5350" }
  ],
  "machines": [
    { "id": "M1", "type": "manufacturer", "col": 0.5, "row": 0.5, "facing": "south", "label": "M1", "recipe": "计算机" }
  ],
  "notes": [
    { "col": 0.5, "row": 4.2, "text": "in-0..in-3 在前侧（manufacturer 入口在 front）" }
  ]
}
```
````

2F 块：
````markdown
```diagram
{
  "id": "BP14-2F",
  "title": "BP14 2F：制造机（上层）",
  "grid": { "cols": 5, "rows": 5 },
  "zones": [
    { "label": "制造区 2F", "col": 0, "row": 0, "w": 4, "h": 4, "color": "#ff9800" }
  ],
  "machines": [
    { "id": "M2", "type": "manufacturer", "col": 0.5, "row": 0.5, "facing": "south", "label": "M2", "recipe": "HMF" }
  ],
  "notes": [
    { "col": 0.5, "row": 4.2, "text": "out-0 在后侧 → 升降机下送 1F" }
  ]
}
```
````
> 注：叠层首批用两块分别画（spec §5/§9）；多层叠一张图属后续。

- [ ] 14.2 Commit：
  ```powershell
  git add docs/superpowers/specs/2026-05-24-tier7-blueprints/BP14-hmf-computer.md
  git commit -m @'
docs(BP14): embed two diagram blocks (1F/2F manufacturer stack)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
'@
  ```

---

## Task 15 — 最终验收：`npm run dev` + chrome-devtools 截图

无 commit（仅验收；如需修 bug 回到对应 Task）。约 5-8 分钟。

> **REQUIRED SUB-SKILL**: `superpowers:verification-before-completion` — 必须实际跑、实际截图、贴证据，先证据后断言。

### Steps
- [ ] 15.1 后台启动 dev server（长跑 → 后台化）：
  ```powershell
  npm run dev
  ```
  （用 `run_in_background: true`）。等输出打印 `Local: http://localhost:5173/`（或实际端口）。
- [ ] 15.2 用 `mcp__chrome-devtools__navigate_page` 打开 `http://localhost:5173/`（按 dev server 实际端口）。
- [ ] 15.3 用 `mcp__chrome-devtools__click` 点顶栏「手册」按钮（先 `take_snapshot` 找到按钮 uid）。
- [ ] 15.4 **验收点 1**：进入文档站，左侧应有 18 个 BP 列表（BP01..BP15 + README + BP-BUS-FILLER + BP-TERM-A/B）。`take_screenshot` 存证。
- [ ] 15.5 点左侧 `BP01-iron-ingot`。**验收点 2**：右侧正文 md 正常渲染（标题/表格/列表），ASCII 下方的 diagram 块被替换为 SVG：9 个橙色 smelter 框按真实 6×9m 等距排开、对齐网格、右侧不再有字符画错位。`take_screenshot` 存证。
- [ ] 15.6 点 `BP14-hmf-computer`。**验收点 3**：1F/2F 两个 diagram 块各画 1 台红色 manufacturer（20×22m 大框，5 个端口点：4 入口橙在前侧、1 出口绿在后侧）。`take_screenshot` 存证。
- [ ] 15.7 用 `mcp__chrome-devtools__list_console_messages` 确认无未捕获异常（unknown type 的 `console.warn` 属预期、可接受）。
- [ ] 15.8 **验收点 4（健壮性）**：临时在 BP01 的 diagram 块里把一个 `"type":"smelter"` 改成 `"type":"xyz-bad"`、并另存一个故意坏 JSON 的块（少个括号），刷新页面确认渲染为灰框 / 红卡片且文档其余正文照常显示；验证完**还原**这些临时改动（git checkout 该 md 或 Edit 改回）。
- [ ] 15.9 **验收点 5（零回归）**：点顶栏切回「单层」，确认主查看器（FloorPlanView）渲染与改动前一致、可正常 pan/zoom；`take_screenshot` 比对。
- [ ] 15.10 关闭后台 dev server（结束 background 任务）。
- [ ] 15.11 最终全量测试 + 类型检查复核（PowerShell）：
  ```powershell
  npx vitest run; npx tsc --noEmit -p tsconfig.app.json
  ```
  预期：新增 2 个测试文件全绿、类型 0 error（`registry.test.ts` 历史 stale 断言若 fail 单独说明、不在本次范围）。

---

## 验收总清单（对照 spec §9）

- [ ] 顶栏「手册」按钮可进入文档站，左侧 18 BP 列表
- [ ] BP01：正文 md 正常 + 9 smelter SVG 按真实尺寸对齐、无 ASCII 错位
- [ ] BP14：1F/2F 两块各 1 manufacturer（20×22m）
- [ ] 坏 type → 灰框、坏 JSON → 红卡片，文档不崩
- [ ] 切回「单层/联动」主查看器零回归
- [ ] `npx vitest run` 全绿（parseDiagramBlock + diagramGeometry）
- [ ] `npx tsc --noEmit` 0 error
- [ ] 每个改动文件 `vscode-mcp-server` diagnostics 0 error（不可用时已注明跳过）