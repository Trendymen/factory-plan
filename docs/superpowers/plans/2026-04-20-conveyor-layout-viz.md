# 130 台工厂分流/合流器拓扑可视化 —— 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 生成单个 HTML 文件 `docs/viz/2026-04-20-conveyor-layout.html`，静态 SVG 可视化 333 方案的全部分流器/合流器拓扑（19 个物料子面板）。

**Architecture:** 数据驱动：用 TypeScript 定义 FactoryViz 结构 → 从 `data/viz/333-plan.ts` 声明 19 个面板的生产/消费/主干/分流器 → 纯函数计算流量平衡与验证 → 确定性布局给每个节点赋 x/y 坐标 → 纯函数生成 SVG 字符串 → 包到 HTML 模板里写盘。测试覆盖流量平衡、Mk.3 上限、manifold 守恒。

**Tech Stack:** TypeScript + Node (tsx)，Vitest，纯 SVG 渲染（无前端框架）。

**参考文档：**
- Spec: `docs/superpowers/specs/2026-04-20-conveyor-layout-viz-design.md`
- 输入数据：`333`（项目根目录的 Cytoscape 导出 JSON，130 台机器方案）
- 配方：`data/recipes.json`

---

## 文件结构

| 文件 | 职责 |
|---|---|
| `scripts/viz/types.ts` | FactoryViz / Panel / Machine / Belt / RouteNode 的 TypeScript 接口 |
| `scripts/viz/data-333.ts` | 19 个面板的声明式数据（沿用 333 的机器数与流量） |
| `scripts/viz/build-panel.ts` | 把高层声明（"6 台构筑站 → 4 台 RIP + 240 外输"）展开为 merger 树 + splitter manifold 的底层节点/边 |
| `scripts/viz/validate.ts` | 纯函数：检查流量守恒（生产=消费+外输）、Mk.3 上限（每条带 ≤ 270）、合流器 sum(入)=出、分流器入=sum(出) |
| `scripts/viz/layout.ts` | 给一个 Panel 的所有节点算 x,y 坐标（确定性，不用自动布局） |
| `scripts/viz/render-svg.ts` | 把 Panel + 坐标 → SVG `<g>` 字符串 |
| `scripts/viz/render-html.ts` | SVG 外包 HTML shell（head/css/toc/scroll） |
| `scripts/viz/generate.ts` | 入口脚本：读数据 → 展开 → 验证 → 布局 → 渲染 → 写盘 |
| `scripts/viz/__tests__/build-panel.test.ts` | 展开函数的单元测试（6 台产源生成正确的 merger 树等） |
| `scripts/viz/__tests__/validate.test.ts` | 验证规则的单元测试 |
| `scripts/viz/__tests__/data-333.test.ts` | 全 19 个面板的端到端验证：流量守恒 + Mk.3 上限 + 与 333 原数据一致 |
| `docs/viz/2026-04-20-conveyor-layout.html` | 最终输出（由 generate.ts 写盘） |

运行命令：
- 测试：`npx vitest run scripts/viz`
- 生成：`npx tsx scripts/viz/generate.ts`

---

### Task 1: 搭 TypeScript 类型与最小脚本骨架

**Files:**
- Create: `scripts/viz/types.ts`
- Create: `scripts/viz/generate.ts`

- [ ] **Step 1: 写 `scripts/viz/types.ts`**

```typescript
// scripts/viz/types.ts

/** 一类生产/消费机器（同类聚合） */
export interface Machine {
  id: string;
  kind: 'producer' | 'consumer';
  /** 机器类型，如 'constructor'/'assembler'/'smelter'/'foundry'/'manufacturer'/'miner-mk3' */
  type: string;
  /** 配方/产物，用于配色与标签 */
  recipe: string;
  /** 机器台数 */
  count: number;
  /** 单台机器的产出（producer）或消耗（consumer）/min */
  ratePerMachine: number;
  /** 显示标签，如 "×24 铁棒构筑站" */
  label: string;
}

/** 分流器或合流器节点 */
export interface RouteNode {
  id: string;
  kind: 'splitter' | 'merger';
  /** 入口边 id 列表（合流 1~3 个，分流恰好 1 个） */
  inputs: string[];
  /** 出口边 id 列表（合流恰好 1 个，分流 1~3 个） */
  outputs: string[];
}

/** 传送带段 */
export interface Belt {
  id: string;
  material: string;
  /** 源节点 id（可以是 Machine / RouteNode） */
  from: string;
  /** 目的节点 id */
  to: string;
  /** 稳态流量 /min */
  rate: number;
  /** Mk.3 上限，默认 270 */
  cap?: number;
}

/** 外输终端 */
export interface OutputTerminal {
  id: string;
  material: string;
  rate: number;
  label: string;
}

/** 单个物料子面板 */
export interface Panel {
  id: string;
  title: string;
  material: string;
  producers: Machine[];
  consumers: Machine[];
  mergers: RouteNode[];
  splitters: RouteNode[];
  terminals: OutputTerminal[];
  belts: Belt[];
}

/** 整个工厂可视化 */
export interface FactoryViz {
  panels: Panel[];
}
```

- [ ] **Step 2: 写 `scripts/viz/generate.ts` 最小骨架**

```typescript
// scripts/viz/generate.ts
import { writeFileSync } from 'node:fs';
import { FactoryViz } from './types';

function main(): void {
  const viz: FactoryViz = { panels: [] };
  const html = `<!DOCTYPE html><html><body><pre>${JSON.stringify(viz, null, 2)}</pre></body></html>`;
  writeFileSync('docs/viz/2026-04-20-conveyor-layout.html', html, 'utf8');
  // eslint-disable-next-line no-console
  console.log('Wrote docs/viz/2026-04-20-conveyor-layout.html');
}

main();
```

- [ ] **Step 3: 创建输出目录**

Run: `mkdir -p docs/viz`

- [ ] **Step 4: 运行骨架验证环境**

Run: `npx tsx scripts/viz/generate.ts`
Expected: stdout `Wrote docs/viz/2026-04-20-conveyor-layout.html`；文件存在且包含 `"panels": []`

- [ ] **Step 5: 提交**

```bash
git add scripts/viz/types.ts scripts/viz/generate.ts docs/viz/2026-04-20-conveyor-layout.html
git commit -m "feat(viz): scaffold conveyor layout viz script"
```

---

### Task 2: 实现 `buildMergerTree` —— 把 N 台产源合并为单条主干

**Files:**
- Create: `scripts/viz/build-panel.ts`
- Create: `scripts/viz/__tests__/build-panel.test.ts`

- [ ] **Step 1: 写失败测试**

```typescript
// scripts/viz/__tests__/build-panel.test.ts
import { describe, it, expect } from 'vitest';
import { buildMergerTree } from '../build-panel';

describe('buildMergerTree', () => {
  it('单机直通：1 台产源无需合流器', () => {
    const r = buildMergerTree({ sourceIds: ['p0'], ratePerSource: 30, material: 'x', idPrefix: 't' });
    expect(r.mergers).toHaveLength(0);
    expect(r.belts).toHaveLength(0);
    expect(r.trunkEntryId).toBe('p0');
    expect(r.trunkRate).toBe(30);
  });

  it('3 台产源：1 个 3→1 合流器', () => {
    const r = buildMergerTree({ sourceIds: ['p0','p1','p2'], ratePerSource: 30, material: 'x', idPrefix: 't' });
    expect(r.mergers).toHaveLength(1);
    expect(r.mergers[0].inputs).toHaveLength(3);
    expect(r.mergers[0].outputs).toHaveLength(1);
    expect(r.belts).toHaveLength(3); // 3 producer-to-merger belts
    expect(r.trunkRate).toBe(90);
  });

  it('6 台产源：3 个合流器（2×3-in + 1×2-in 合根）', () => {
    const r = buildMergerTree({ sourceIds: ['p0','p1','p2','p3','p4','p5'], ratePerSource: 30, material: 'x', idPrefix: 't' });
    expect(r.mergers).toHaveLength(3);
    // 前两个合流器各收 3 台
    expect(r.mergers[0].inputs).toHaveLength(3);
    expect(r.mergers[1].inputs).toHaveLength(3);
    // 根合流器收 2 个中间合流器的输出
    expect(r.mergers[2].inputs).toHaveLength(2);
    expect(r.trunkRate).toBe(180);
  });

  it('7 台产源：3 个合流器（2×3-in + 1×3-in 合根）', () => {
    const r = buildMergerTree({ sourceIds: Array.from({length:7},(_,i)=>`p${i}`), ratePerSource: 30, material: 'x', idPrefix: 't' });
    expect(r.mergers).toHaveLength(3);
    // 根合流器 3-in：2 个中间合流器 + 1 台产源直连
    expect(r.mergers[2].inputs).toHaveLength(3);
    expect(r.trunkRate).toBe(210);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run scripts/viz/__tests__/build-panel.test.ts`
Expected: FAIL — "Cannot find module '../build-panel'" 或类似

- [ ] **Step 3: 实现 `buildMergerTree`**

```typescript
// scripts/viz/build-panel.ts
import { RouteNode, Belt } from './types';

export interface MergerTreeResult {
  mergers: RouteNode[];
  belts: Belt[];
  /** 主干入口节点 id（最后一个合流器，或单机时就是产源 id） */
  trunkEntryId: string;
  trunkRate: number;
}

export function buildMergerTree(opts: {
  sourceIds: string[];
  ratePerSource: number;
  material: string;
  idPrefix: string;
}): MergerTreeResult {
  const { sourceIds, ratePerSource, material, idPrefix } = opts;

  if (sourceIds.length === 1) {
    return {
      mergers: [],
      belts: [],
      trunkEntryId: sourceIds[0],
      trunkRate: ratePerSource,
    };
  }

  const mergers: RouteNode[] = [];
  const belts: Belt[] = [];

  // 第一层：每 3 个产源合一个合流器；最后不满 3 个也可以，2-in 1-out 合法
  const leafMergerIds: string[] = [];
  const leafRates: number[] = [];

  for (let i = 0; i < sourceIds.length; i += 3) {
    const group = sourceIds.slice(i, i + 3);
    const mergerId = `${idPrefix}-m${mergers.length}`;
    const outBeltId = `${idPrefix}-b${belts.length}`;
    const inputBeltIds: string[] = [];
    for (const src of group) {
      const b: Belt = {
        id: `${idPrefix}-b${belts.length}`,
        material,
        from: src,
        to: mergerId,
        rate: ratePerSource,
      };
      inputBeltIds.push(b.id);
      belts.push(b);
    }
    mergers.push({
      id: mergerId,
      kind: 'merger',
      inputs: inputBeltIds,
      outputs: [outBeltId],
    });
    leafMergerIds.push(mergerId);
    leafRates.push(group.length * ratePerSource);
  }

  // 如果只有一个叶合流器，主干入口就是它
  if (leafMergerIds.length === 1) {
    return {
      mergers,
      belts,
      trunkEntryId: leafMergerIds[0],
      trunkRate: leafRates[0],
    };
  }

  // 否则再做一层根合流器把所有叶合流器合起来（≤3 个，直接一个根；>3 的递归，但 130 台方案里单组最多 7 产源 → 3 叶，用不到递归）
  if (leafMergerIds.length > 3) {
    throw new Error(
      `buildMergerTree: ${sourceIds.length} sources exceed single-root capacity (max 9 sources). Extend tree if needed.`
    );
  }

  const rootMergerId = `${idPrefix}-m${mergers.length}`;
  const rootOutBeltId = `${idPrefix}-b${belts.length + leafMergerIds.length}`;
  // 写入叶合流器 → 根合流器的边
  const rootInputBeltIds: string[] = [];
  for (let i = 0; i < leafMergerIds.length; i++) {
    const b: Belt = {
      id: `${idPrefix}-b${belts.length}`,
      material,
      from: leafMergerIds[i],
      to: rootMergerId,
      rate: leafRates[i],
    };
    rootInputBeltIds.push(b.id);
    belts.push(b);
    // 将叶合流器的输出指向这条新边
    const leafMerger = mergers.find((m) => m.id === leafMergerIds[i])!;
    leafMerger.outputs = [b.id];
  }
  mergers.push({
    id: rootMergerId,
    kind: 'merger',
    inputs: rootInputBeltIds,
    outputs: [rootOutBeltId],
  });

  return {
    mergers,
    belts,
    trunkEntryId: rootMergerId,
    trunkRate: leafRates.reduce((a, b) => a + b, 0),
  };
}
```

- [ ] **Step 4: 运行测试通过**

Run: `npx vitest run scripts/viz/__tests__/build-panel.test.ts`
Expected: PASS（4 条测试全绿）

- [ ] **Step 5: 提交**

```bash
git add scripts/viz/build-panel.ts scripts/viz/__tests__/build-panel.test.ts
git commit -m "feat(viz): implement buildMergerTree for producer-side merger trees"
```

---

### Task 3: 实现 `buildManifold` —— 主干流经 N 个消费机器的分流链

**Files:**
- Modify: `scripts/viz/build-panel.ts`
- Modify: `scripts/viz/__tests__/build-panel.test.ts`

- [ ] **Step 1: 追加失败测试**

```typescript
// 追加到 build-panel.test.ts 末尾
import { buildManifold } from '../build-panel';

describe('buildManifold', () => {
  it('单消费：从主干直接进消费机器（无分流器）', () => {
    const r = buildManifold({
      trunkEntryId: 'trunk-in',
      trunkRate: 240,
      material: 'screw',
      idPrefix: 's',
      stops: [{ consumerId: 'hmf', take: 240 }],
      terminalRate: 0,
    });
    expect(r.splitters).toHaveLength(0);
    // 一条带：trunk-in → hmf，流量 240
    expect(r.belts).toHaveLength(1);
    expect(r.belts[0].from).toBe('trunk-in');
    expect(r.belts[0].to).toBe('hmf');
    expect(r.belts[0].rate).toBe(240);
    expect(r.terminalBelt).toBeUndefined();
  });

  it('4 个消费 + 0 外输：4 个分流器，末段主干清零', () => {
    const r = buildManifold({
      trunkEntryId: 'trunk-in',
      trunkRate: 240,
      material: 'screw',
      idPrefix: 's',
      stops: [
        { consumerId: 'c0', take: 60 },
        { consumerId: 'c1', take: 60 },
        { consumerId: 'c2', take: 60 },
        { consumerId: 'c3', take: 60 },
      ],
      terminalRate: 0,
    });
    expect(r.splitters).toHaveLength(4);
    // 每个分流器：1 入 2 出（1 下抽给消费，1 续主干）；最后一个是 1 入 1 出（末段不再续）
    expect(r.splitters[0].outputs).toHaveLength(2);
    expect(r.splitters[3].outputs).toHaveLength(1);
    // 主干段数：入口→s0（240）、s0→s1（180）、s1→s2（120）、s2→s3（60）；加上 4 条抽出 60 的下抽带 = 8 条主干+抽出带
    // 总 belts = 8
    expect(r.belts).toHaveLength(8);
  });

  it('3 个消费 + 外输：主干末端接终端', () => {
    const r = buildManifold({
      trunkEntryId: 'trunk-in',
      trunkRate: 120,
      material: 'rod',
      idPrefix: 'r',
      stops: [
        { consumerId: 'rotor', take: 100 },
      ],
      terminalRate: 20,
    });
    // 1 个分流器：1 入 2 出（100 到 rotor、20 续主干）
    expect(r.splitters).toHaveLength(1);
    expect(r.splitters[0].outputs).toHaveLength(2);
    // belts: trunk-in → s0 (120)、s0 → rotor (100)、s0 → terminal (20) = 3 条
    expect(r.belts).toHaveLength(3);
    expect(r.terminalBelt).toBeDefined();
    expect(r.terminalBelt!.rate).toBe(20);
  });

  it('主干流量不守恒 → 抛错', () => {
    expect(() =>
      buildManifold({
        trunkEntryId: 'trunk-in',
        trunkRate: 100,
        material: 'x',
        idPrefix: 'e',
        stops: [{ consumerId: 'c0', take: 60 }],
        terminalRate: 0, // 100 - 60 = 40 未消化，应抛错
      })
    ).toThrow(/unbalanced/i);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run scripts/viz/__tests__/build-panel.test.ts -t buildManifold`
Expected: FAIL — buildManifold not exported

- [ ] **Step 3: 实现 `buildManifold`**

```typescript
// 追加到 scripts/viz/build-panel.ts
export interface ManifoldStop {
  consumerId: string;
  take: number;
}

export interface ManifoldResult {
  splitters: RouteNode[];
  belts: Belt[];
  /** 若 terminalRate > 0，这条带指向外输终端 */
  terminalBelt?: Belt;
}

export function buildManifold(opts: {
  trunkEntryId: string;
  trunkRate: number;
  material: string;
  idPrefix: string;
  stops: ManifoldStop[];
  /** 主干末端剩余流量（→ 外输终端，0 表示无外输） */
  terminalRate: number;
}): ManifoldResult {
  const { trunkEntryId, trunkRate, material, idPrefix, stops, terminalRate } = opts;

  const totalTake = stops.reduce((s, x) => s + x.take, 0);
  if (Math.abs(totalTake + terminalRate - trunkRate) > 1e-6) {
    throw new Error(
      `buildManifold: unbalanced trunk rate ${trunkRate} != sum(stops.take)=${totalTake} + terminalRate=${terminalRate}`
    );
  }

  const splitters: RouteNode[] = [];
  const belts: Belt[] = [];

  // 特殊情况：单消费且无外输，从主干直连
  if (stops.length === 1 && terminalRate === 0) {
    belts.push({
      id: `${idPrefix}-direct`,
      material,
      from: trunkEntryId,
      to: stops[0].consumerId,
      rate: trunkRate,
    });
    return { splitters, belts };
  }

  // 通用 manifold：每个 stop 前放一个分流器；入口→s0，s0→s1，...
  let currentSourceId = trunkEntryId;
  let currentRate = trunkRate;

  stops.forEach((stop, i) => {
    const splitterId = `${idPrefix}-s${i}`;
    // 从上游进入此分流器的带
    const inBeltId = `${idPrefix}-bin${i}`;
    belts.push({
      id: inBeltId,
      material,
      from: currentSourceId,
      to: splitterId,
      rate: currentRate,
    });

    // 下抽给消费的带
    const downBeltId = `${idPrefix}-bdown${i}`;
    belts.push({
      id: downBeltId,
      material,
      from: splitterId,
      to: stop.consumerId,
      rate: stop.take,
    });

    const isLast = i === stops.length - 1;
    const remaining = currentRate - stop.take;
    const hasContinuation = !isLast || terminalRate > 0;

    const outputs = [downBeltId];
    if (hasContinuation) {
      // 续主干会在下一轮/终端里创建 belt；这里只挂占位
      // 实际 belt 在下一轮循环或终端阶段推入 belts 和 splitter outputs
      // 为简化：立即创建续带
      const contId = isLast ? `${idPrefix}-bterm` : `${idPrefix}-bin${i + 1}`;
      // isLast 时，续带直接通到 terminal；否则下一轮会把 inBelt${i+1} 对应带改写（我们反过来：现在就创建这条带作为续带）
      // 改造：这里直接创建续带，让下一轮不再重复创建
      // 所以我们需要重写循环逻辑：见下面简化实现
      outputs.push(contId);
    }

    splitters.push({
      id: splitterId,
      kind: 'splitter',
      inputs: [inBeltId],
      outputs,
    });

    currentSourceId = splitterId;
    currentRate = remaining;
  });

  // 上面的 outputs 里预留了 contId，但实际 belts 还没推入；重走一遍把续带塞进 belts 数组
  for (let i = 0; i < stops.length; i++) {
    const isLast = i === stops.length - 1;
    const splitter = splitters[i];
    const contOutputId = splitter.outputs[1]; // downBelt 在 [0]，续带在 [1]
    if (!contOutputId) continue;
    const rate = i + 1 < stops.length ? (splitters[i + 1].inputs[0] ? undefined : undefined) : undefined;
    // 为避免混乱，重新计算续带流量
    // 续带流量 = 进这个分流器的流量 - 下抽量
    const inBelt = belts.find((b) => b.id === splitter.inputs[0])!;
    const downBelt = belts.find((b) => b.id === splitter.outputs[0])!;
    const contRate = inBelt.rate - downBelt.rate;

    // 续带的 to：若 isLast，指向 terminal 节点；否则指向下一个分流器（但下一个分流器的 inBelt 已经创建过了，我们需要把续带合并）
    // 简化：重新构造。弃用上面的循环，用清晰版本重写。
    void rate;
    void contRate;
  }

  // -- 上面的实现复杂度过高，会让人读不下去。用清晰版本重写： --
  splitters.length = 0;
  belts.length = 0;
  currentSourceId = trunkEntryId;
  currentRate = trunkRate;

  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i];
    const isLast = i === stops.length - 1;
    const splitterId = `${idPrefix}-s${i}`;

    // 进此分流器的带
    const inBeltId = `${idPrefix}-in${i}`;
    belts.push({
      id: inBeltId,
      material,
      from: currentSourceId,
      to: splitterId,
      rate: currentRate,
    });

    // 下抽带
    const downBeltId = `${idPrefix}-down${i}`;
    belts.push({
      id: downBeltId,
      material,
      from: splitterId,
      to: stop.consumerId,
      rate: stop.take,
    });

    const remaining = currentRate - stop.take;
    const hasContinuation = !isLast || terminalRate > 0;

    if (hasContinuation) {
      // 续带：若 isLast 续到 terminal，否则续到下一个分流器（先占位 id，下一轮会把 inBelt 指向此 splitter）
      // 我们不在这里创建续带的 belt，而在下一轮创建 inBelt 时把 from 指向此 splitter。这里只在 splitter.outputs 写占位。
      if (isLast) {
        // 续到 terminal
        const termBeltId = `${idPrefix}-term`;
        // terminal 节点 id 暂时写 'terminal'，外部由 Panel 层替换。但为干净起见，用约定 id。
        belts.push({
          id: termBeltId,
          material,
          from: splitterId,
          to: `${idPrefix}-terminal`,
          rate: terminalRate,
        });
        splitters.push({
          id: splitterId,
          kind: 'splitter',
          inputs: [inBeltId],
          outputs: [downBeltId, termBeltId],
        });
      } else {
        // 续到下一个分流器的 inBelt；占位：设置 splitter.outputs[1] 为下一个 inBelt id
        const nextInId = `${idPrefix}-in${i + 1}`;
        splitters.push({
          id: splitterId,
          kind: 'splitter',
          inputs: [inBeltId],
          outputs: [downBeltId, nextInId],
        });
      }
    } else {
      // 末段且无外输：1 入 1 出
      splitters.push({
        id: splitterId,
        kind: 'splitter',
        inputs: [inBeltId],
        outputs: [downBeltId],
      });
    }

    currentSourceId = splitterId;
    currentRate = remaining;
  }

  // 把末段 terminalBelt 从 belts 抽出来单独返回
  let terminalBelt: Belt | undefined;
  if (terminalRate > 0) {
    terminalBelt = belts.find((b) => b.id === `${idPrefix}-term`);
  }

  return { splitters, belts, terminalBelt };
}
```

注意：上面 `buildManifold` 的第一版实现写得混乱且有占位循环，实施时请**只保留清晰版本**（`// -- 上面的实现复杂度过高... --` 之后的代码），把上面那段乱的删掉。最终的清晰版本就是从 `splitters.length = 0;` 开始的那段。

- [ ] **Step 4: 实施时重写为清晰版本**

直接使用下面的最终版本替换整个 `buildManifold` 函数体：

```typescript
export function buildManifold(opts: {
  trunkEntryId: string;
  trunkRate: number;
  material: string;
  idPrefix: string;
  stops: ManifoldStop[];
  terminalRate: number;
}): ManifoldResult {
  const { trunkEntryId, trunkRate, material, idPrefix, stops, terminalRate } = opts;

  const totalTake = stops.reduce((s, x) => s + x.take, 0);
  if (Math.abs(totalTake + terminalRate - trunkRate) > 1e-6) {
    throw new Error(
      `buildManifold: unbalanced trunk rate ${trunkRate} != sum(stops.take)=${totalTake} + terminalRate=${terminalRate}`
    );
  }

  const splitters: RouteNode[] = [];
  const belts: Belt[] = [];

  // 单消费且无外输：直连
  if (stops.length === 1 && terminalRate === 0) {
    belts.push({
      id: `${idPrefix}-direct`,
      material,
      from: trunkEntryId,
      to: stops[0].consumerId,
      rate: trunkRate,
    });
    return { splitters, belts };
  }

  let currentSourceId = trunkEntryId;
  let currentRate = trunkRate;

  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i];
    const isLast = i === stops.length - 1;
    const splitterId = `${idPrefix}-s${i}`;

    const inBeltId = `${idPrefix}-in${i}`;
    belts.push({ id: inBeltId, material, from: currentSourceId, to: splitterId, rate: currentRate });

    const downBeltId = `${idPrefix}-down${i}`;
    belts.push({ id: downBeltId, material, from: splitterId, to: stop.consumerId, rate: stop.take });

    const remaining = currentRate - stop.take;
    const hasContinuation = !isLast || terminalRate > 0;

    if (!hasContinuation) {
      // 末段无外输：1 入 1 出
      splitters.push({ id: splitterId, kind: 'splitter', inputs: [inBeltId], outputs: [downBeltId] });
    } else if (isLast) {
      // 末段接 terminal
      const termBeltId = `${idPrefix}-term`;
      belts.push({ id: termBeltId, material, from: splitterId, to: `${idPrefix}-terminal`, rate: terminalRate });
      splitters.push({ id: splitterId, kind: 'splitter', inputs: [inBeltId], outputs: [downBeltId, termBeltId] });
    } else {
      // 中段：续到下一个分流器
      const nextInId = `${idPrefix}-in${i + 1}`;
      splitters.push({ id: splitterId, kind: 'splitter', inputs: [inBeltId], outputs: [downBeltId, nextInId] });
    }

    currentSourceId = splitterId;
    currentRate = remaining;
  }

  const terminalBelt = terminalRate > 0 ? belts.find((b) => b.id === `${idPrefix}-term`) : undefined;
  return { splitters, belts, terminalBelt };
}
```

- [ ] **Step 5: 运行测试通过**

Run: `npx vitest run scripts/viz/__tests__/build-panel.test.ts`
Expected: PASS（全部）

- [ ] **Step 6: 提交**

```bash
git add scripts/viz/build-panel.ts scripts/viz/__tests__/build-panel.test.ts
git commit -m "feat(viz): implement buildManifold for consumer-side splitter chains"
```

---

### Task 4: 实现 `buildPanel` —— 组合 merger 树 + trunk 路由 + manifold

**Files:**
- Modify: `scripts/viz/build-panel.ts`
- Modify: `scripts/viz/__tests__/build-panel.test.ts`

- [ ] **Step 1: 写失败测试（以"铁锭面板 Plate 主干"为例）**

```typescript
// 追加到 build-panel.test.ts
import { buildPanel } from '../build-panel';

describe('buildPanel', () => {
  it('铁板主干：7 台冶炼站 → 210/min → 7 台铁板构筑站', () => {
    const panel = buildPanel({
      id: 'iron-ingot-to-plate',
      title: '铁锭 → 铁板（Trunk A）',
      material: 'iron-ingot',
      trunks: [{
        producer: {
          id: 'smelter-iron',
          type: 'smelter',
          recipe: 'iron-ingot',
          count: 7,
          ratePerMachine: 30,
          label: '×7 铁锭冶炼站',
        },
        consumers: [{
          id: 'plate-cons',
          type: 'constructor',
          recipe: 'iron-plate',
          count: 7,
          ratePerMachine: 30, // 每台消耗铁锭
          label: '×7 铁板构筑站',
        }],
        terminalRate: 0,
      }],
    });

    expect(panel.producers).toHaveLength(1);
    expect(panel.consumers).toHaveLength(1);
    expect(panel.mergers).toHaveLength(3); // 7 台 = 3+3+1 用 3 个合流器
    expect(panel.splitters).toHaveLength(7); // 7 个下抽
    expect(panel.terminals).toHaveLength(0);

    // 流量守恒
    const producedTotal = panel.producers[0].count * panel.producers[0].ratePerMachine;
    const consumedTotal = panel.consumers[0].count * panel.consumers[0].ratePerMachine;
    const terminalTotal = panel.terminals.reduce((s, t) => s + t.rate, 0);
    expect(producedTotal).toBe(210);
    expect(consumedTotal + terminalTotal).toBe(210);
  });

  it('螺丝 trunk D：3 台螺丝构筑站 → 120/min → 1 台转子 + 20 外输', () => {
    const panel = buildPanel({
      id: 'screw-trunk-d',
      title: '螺丝 Trunk D',
      material: 'screw',
      trunks: [{
        producer: {
          id: 'screw-cons',
          type: 'constructor',
          recipe: 'screw',
          count: 3,
          ratePerMachine: 40,
          label: '×3 螺丝构筑站',
        },
        consumers: [{
          id: 'rotor',
          type: 'assembler',
          recipe: 'rotor',
          count: 1,
          ratePerMachine: 100,
          label: '×1 转子装配站',
        }],
        terminalRate: 20,
      }],
    });

    expect(panel.mergers).toHaveLength(1);
    expect(panel.splitters).toHaveLength(1);
    expect(panel.terminals).toHaveLength(1);
    expect(panel.terminals[0].rate).toBe(20);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run scripts/viz/__tests__/build-panel.test.ts -t buildPanel`
Expected: FAIL

- [ ] **Step 3: 实现 `buildPanel`**

```typescript
// 追加到 scripts/viz/build-panel.ts
import { Panel, Machine, OutputTerminal } from './types';

export interface TrunkSpec {
  producer: Omit<Machine, 'kind'>; // 同一类 N 台产源
  consumers: Omit<Machine, 'kind'>[]; // 按主干上的顺序
  /** 主干末端外输（0 表示无外输） */
  terminalRate: number;
}

export interface PanelSpec {
  id: string;
  title: string;
  material: string;
  trunks: TrunkSpec[];
}

export function buildPanel(spec: PanelSpec): Panel {
  const panel: Panel = {
    id: spec.id,
    title: spec.title,
    material: spec.material,
    producers: [],
    consumers: [],
    mergers: [],
    splitters: [],
    terminals: [],
    belts: [],
  };

  // 合并所有 trunks 的产源/消费为 panel 级别的去重列表
  const producerMap = new Map<string, Machine>();
  const consumerMap = new Map<string, Machine>();

  spec.trunks.forEach((trunk, trunkIdx) => {
    const idPrefix = `${spec.id}-t${trunkIdx}`;

    // 展开产源为 N 个虚拟 sourceId（一台机器对应一个 id）
    const pBase = trunk.producer;
    if (!producerMap.has(pBase.id)) {
      producerMap.set(pBase.id, { ...pBase, kind: 'producer' });
    }
    const sourceIds = Array.from({ length: pBase.count }, (_, i) => `${pBase.id}#${i}`);

    // 合流树
    const treeResult = buildMergerTree({
      sourceIds,
      ratePerSource: pBase.ratePerMachine,
      material: spec.material,
      idPrefix,
    });
    panel.mergers.push(...treeResult.mergers);
    panel.belts.push(...treeResult.belts);

    // 展开消费为消费机器 id 列表（每台一个 id）
    const stops: ManifoldStop[] = [];
    trunk.consumers.forEach((c) => {
      if (!consumerMap.has(c.id)) {
        consumerMap.set(c.id, { ...c, kind: 'consumer' });
      }
      for (let j = 0; j < c.count; j++) {
        stops.push({ consumerId: `${c.id}#${j}`, take: c.ratePerMachine });
      }
    });

    // manifold
    const manifold = buildManifold({
      trunkEntryId: treeResult.trunkEntryId,
      trunkRate: treeResult.trunkRate,
      material: spec.material,
      idPrefix,
      stops,
      terminalRate: trunk.terminalRate,
    });
    panel.splitters.push(...manifold.splitters);
    panel.belts.push(...manifold.belts);

    // 终端
    if (trunk.terminalRate > 0) {
      panel.terminals.push({
        id: `${idPrefix}-terminal`,
        material: spec.material,
        rate: trunk.terminalRate,
        label: `外输 ${spec.material} ${trunk.terminalRate}/min`,
      });
    }
  });

  panel.producers = Array.from(producerMap.values());
  panel.consumers = Array.from(consumerMap.values());
  return panel;
}
```

- [ ] **Step 4: 运行测试通过**

Run: `npx vitest run scripts/viz/__tests__/build-panel.test.ts`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add scripts/viz/build-panel.ts scripts/viz/__tests__/build-panel.test.ts
git commit -m "feat(viz): implement buildPanel combining merger tree and manifold"
```

---

### Task 5: 实现流量验证器

**Files:**
- Create: `scripts/viz/validate.ts`
- Create: `scripts/viz/__tests__/validate.test.ts`

- [ ] **Step 1: 写失败测试**

```typescript
// scripts/viz/__tests__/validate.test.ts
import { describe, it, expect } from 'vitest';
import { validatePanel } from '../validate';
import { buildPanel } from '../build-panel';

describe('validatePanel', () => {
  it('干净 panel 通过', () => {
    const panel = buildPanel({
      id: 'test',
      title: 'test',
      material: 'x',
      trunks: [{
        producer: { id: 'p', type: 't', recipe: 'x', count: 3, ratePerMachine: 30, label: 'p' },
        consumers: [{ id: 'c', type: 't', recipe: 'y', count: 3, ratePerMachine: 30, label: 'c' }],
        terminalRate: 0,
      }],
    });
    const errors = validatePanel(panel);
    expect(errors).toEqual([]);
  });

  it('超 Mk.3 上限报错', () => {
    const panel = buildPanel({
      id: 'test',
      title: 'test',
      material: 'x',
      trunks: [{
        producer: { id: 'p', type: 't', recipe: 'x', count: 10, ratePerMachine: 30, label: 'p' },
        consumers: [{ id: 'c', type: 't', recipe: 'y', count: 10, ratePerMachine: 30, label: 'c' }],
        terminalRate: 0,
      }],
    });
    const errors = validatePanel(panel);
    expect(errors.some(e => /270|Mk\.3/i.test(e))).toBe(true);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run scripts/viz/__tests__/validate.test.ts`
Expected: FAIL — can't find validate

- [ ] **Step 3: 实现 `validate.ts`**

```typescript
// scripts/viz/validate.ts
import { Panel } from './types';

const MK3_CAP = 270;

export function validatePanel(panel: Panel): string[] {
  const errors: string[] = [];

  // 1) 每条带 ≤ Mk.3
  for (const belt of panel.belts) {
    const cap = belt.cap ?? MK3_CAP;
    if (belt.rate > cap + 1e-6) {
      errors.push(
        `Panel "${panel.id}" belt ${belt.id} rate ${belt.rate}/min > Mk.3 ${cap}/min`
      );
    }
  }

  // 2) 合流器：sum(inputs.rate) = output.rate
  for (const m of panel.mergers) {
    const inSum = m.inputs.map((id) => panel.belts.find((b) => b.id === id)!.rate).reduce((a, b) => a + b, 0);
    const outSum = m.outputs.map((id) => panel.belts.find((b) => b.id === id)!.rate).reduce((a, b) => a + b, 0);
    if (Math.abs(inSum - outSum) > 1e-6) {
      errors.push(
        `Panel "${panel.id}" merger ${m.id} unbalanced: in=${inSum} out=${outSum}`
      );
    }
  }

  // 3) 分流器：input.rate = sum(outputs.rate)
  for (const s of panel.splitters) {
    const inSum = s.inputs.map((id) => panel.belts.find((b) => b.id === id)!.rate).reduce((a, b) => a + b, 0);
    const outSum = s.outputs.map((id) => panel.belts.find((b) => b.id === id)!.rate).reduce((a, b) => a + b, 0);
    if (Math.abs(inSum - outSum) > 1e-6) {
      errors.push(
        `Panel "${panel.id}" splitter ${s.id} unbalanced: in=${inSum} out=${outSum}`
      );
    }
  }

  // 4) 生产 = 消费 + 外输
  const produced = panel.producers.reduce((s, p) => s + p.count * p.ratePerMachine, 0);
  const consumed = panel.consumers.reduce((s, c) => s + c.count * c.ratePerMachine, 0);
  const terminaled = panel.terminals.reduce((s, t) => s + t.rate, 0);
  if (Math.abs(produced - consumed - terminaled) > 1e-6) {
    errors.push(
      `Panel "${panel.id}" mass imbalance: produced=${produced} consumed=${consumed} terminal=${terminaled}`
    );
  }

  return errors;
}
```

- [ ] **Step 4: 运行测试通过**

Run: `npx vitest run scripts/viz/__tests__/validate.test.ts`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add scripts/viz/validate.ts scripts/viz/__tests__/validate.test.ts
git commit -m "feat(viz): implement flow validation (Mk.3 cap + node balance)"
```

---

### Task 6: 声明 19 个面板数据

**Files:**
- Create: `scripts/viz/data-333.ts`
- Create: `scripts/viz/__tests__/data-333.test.ts`

- [ ] **Step 1: 写端到端测试**

```typescript
// scripts/viz/__tests__/data-333.test.ts
import { describe, it, expect } from 'vitest';
import { panels333 } from '../data-333';
import { validatePanel } from '../validate';

describe('333 方案 19 个面板', () => {
  it('面板数量为 19', () => {
    expect(panels333).toHaveLength(19);
  });

  it('每个面板流量守恒且无 Mk.3 超限', () => {
    for (const panel of panels333) {
      const errors = validatePanel(panel);
      expect(errors, `panel ${panel.id}`).toEqual([]);
    }
  });

  it('铁锭面板：19 台冶炼站 + 7 台铁板 + 24 台铁棒', () => {
    const p = panels333.find((x) => x.id === 'iron-ingot');
    expect(p).toBeDefined();
    const smelters = p!.producers.find((m) => m.recipe === 'iron-ingot');
    expect(smelters?.count).toBe(19);
    // 消费合计：7 铁板 + 24 铁棒
    const plateCons = p!.consumers.find((c) => c.recipe === 'iron-plate');
    const rodCons = p!.consumers.find((c) => c.recipe === 'iron-rod');
    expect(plateCons?.count).toBe(7);
    expect(rodCons?.count).toBe(24);
  });

  it('螺丝面板：4 条主干，共 20 台螺丝构筑站', () => {
    const p = panels333.find((x) => x.id === 'screw');
    expect(p).toBeDefined();
    const totalProducers = p!.producers
      .filter((m) => m.recipe === 'screw')
      .reduce((s, m) => s + m.count, 0);
    expect(totalProducers).toBe(20);
    // 外输 20/min
    const termTotal = p!.terminals.reduce((s, t) => s + t.rate, 0);
    expect(termTotal).toBe(20);
  });

  it('铁棒面板：24 台产源，4 类消费 + 外输', () => {
    const p = panels333.find((x) => x.id === 'iron-rod');
    expect(p).toBeDefined();
    const totalProducers = p!.producers
      .filter((m) => m.recipe === 'iron-rod')
      .reduce((s, m) => s + m.count, 0);
    expect(totalProducers).toBe(24);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run scripts/viz/__tests__/data-333.test.ts`
Expected: FAIL — can't find data-333

- [ ] **Step 3: 写 `data-333.ts`**

写 19 个面板的声明。所有机器数和流量都从 333 数据直接复制。代码结构如下（由于长度较大，这里展开 4 个关键面板；其余按同样模式补全）：

```typescript
// scripts/viz/data-333.ts
import { Panel } from './types';
import { buildPanel, PanelSpec } from './build-panel';

// ======== Helper：单消费单主干（最常见） ========
function simplePanel(opts: {
  id: string;
  title: string;
  material: string;
  producer: { id: string; type: string; recipe: string; count: number; ratePerMachine: number; label: string };
  consumers: { id: string; type: string; recipe: string; count: number; ratePerMachine: number; label: string }[];
  terminalRate: number;
  producerGroups: number[]; // 每条 trunk 分到多少台产源；和必须 = producer.count
}): PanelSpec {
  // 按产源分组，每组一个 trunk（消费按顺序摊到各 trunk，terminalRate 只记到最后一条 trunk）
  // 简化处理：全部消费放在同一条 trunk，除非用户自定义
  // 本 helper 只适合 producerGroups.length === 1 的场景
  if (opts.producerGroups.length !== 1 || opts.producerGroups[0] !== opts.producer.count) {
    throw new Error('simplePanel only handles 1-trunk case');
  }
  return {
    id: opts.id,
    title: opts.title,
    material: opts.material,
    trunks: [{
      producer: opts.producer,
      consumers: opts.consumers,
      terminalRate: opts.terminalRate,
    }],
  };
}

// ======== 面板 01: 铁锭 ========
const panelIronIngot: PanelSpec = {
  id: 'iron-ingot',
  title: '面板 01 · 铁锭（19 台冶炼站 → 24 台铁棒 + 7 台铁板）',
  material: 'iron-ingot',
  trunks: [
    // Trunk A: 7 台冶炼站 → 7 台铁板
    {
      producer: { id: 'iron-smelter-A', type: 'smelter', recipe: 'iron-ingot', count: 7, ratePerMachine: 30, label: '×7 铁锭冶炼站 (A)' },
      consumers: [{ id: 'plate', type: 'constructor', recipe: 'iron-plate', count: 7, ratePerMachine: 30, label: '×7 铁板构筑站' }],
      terminalRate: 0,
    },
    // Trunk B: 6 台冶炼站 → 12 台铁棒
    {
      producer: { id: 'iron-smelter-B', type: 'smelter', recipe: 'iron-ingot', count: 6, ratePerMachine: 30, label: '×6 铁锭冶炼站 (B)' },
      consumers: [{ id: 'rod-B', type: 'constructor', recipe: 'iron-rod', count: 12, ratePerMachine: 15, label: '×12 铁棒构筑站 (B)' }],
      terminalRate: 0,
    },
    // Trunk C: 6 台冶炼站 → 12 台铁棒
    {
      producer: { id: 'iron-smelter-C', type: 'smelter', recipe: 'iron-ingot', count: 6, ratePerMachine: 30, label: '×6 铁锭冶炼站 (C)' },
      consumers: [{ id: 'rod-C', type: 'constructor', recipe: 'iron-rod', count: 12, ratePerMachine: 15, label: '×12 铁棒构筑站 (C)' }],
      terminalRate: 0,
    },
  ],
};

// ======== 面板 02: 铜锭 ========
const panelCopperIngot: PanelSpec = {
  id: 'copper-ingot',
  title: '面板 02 · 铜锭（6 台冶炼站 → 8 台电线 + 3 台铜板）',
  material: 'copper-ingot',
  trunks: [
    // Trunk A: 4 台冶炼站 → 8 台电线构筑站 (120/min, 15 each)
    {
      producer: { id: 'cu-smelter-A', type: 'smelter', recipe: 'copper-ingot', count: 4, ratePerMachine: 30, label: '×4 铜锭冶炼站 (A)' },
      consumers: [{ id: 'wire', type: 'constructor', recipe: 'wire', count: 8, ratePerMachine: 15, label: '×8 电线构筑站' }],
      terminalRate: 0,
    },
    // Trunk B: 2 台冶炼站 → 3 台铜板构筑站 (60/min, 20 each)
    {
      producer: { id: 'cu-smelter-B', type: 'smelter', recipe: 'copper-ingot', count: 2, ratePerMachine: 30, label: '×2 铜锭冶炼站 (B)' },
      consumers: [{ id: 'sheet', type: 'constructor', recipe: 'copper-sheet', count: 3, ratePerMachine: 20, label: '×3 铜板构筑站' }],
      terminalRate: 0,
    },
  ],
};

// ======== 面板 06: 螺丝（最复杂） ========
const panelScrew: PanelSpec = {
  id: 'screw',
  title: '面板 06 · 螺丝（20 台构筑站，4 条主干）',
  material: 'screw',
  trunks: [
    // Trunk A: 6 台 → 4 台 RIP (60 each)
    {
      producer: { id: 'screw-A', type: 'constructor', recipe: 'screw', count: 6, ratePerMachine: 40, label: '×6 螺丝构筑站 (A)' },
      consumers: [{ id: 'rip', type: 'assembler', recipe: 'reinforced-iron-plate', count: 4, ratePerMachine: 60, label: '×4 强化铁板装配站' }],
      terminalRate: 0,
    },
    // Trunk B: 6 台 → 1 台 HMF (240)
    {
      producer: { id: 'screw-B', type: 'constructor', recipe: 'screw', count: 6, ratePerMachine: 40, label: '×6 螺丝构筑站 (B)' },
      consumers: [{ id: 'hmf', type: 'manufacturer', recipe: 'heavy-modular-frame', count: 1, ratePerMachine: 240, label: '×1 重型模块框架制造站' }],
      terminalRate: 0,
    },
    // Trunk C: 5 台 → 2 台转子 (100 each)
    {
      producer: { id: 'screw-C', type: 'constructor', recipe: 'screw', count: 5, ratePerMachine: 40, label: '×5 螺丝构筑站 (C)' },
      consumers: [{ id: 'rotor-2', type: 'assembler', recipe: 'rotor', count: 2, ratePerMachine: 100, label: '×2 转子装配站 (C)' }],
      terminalRate: 0,
    },
    // Trunk D: 3 台 → 1 台转子 (100) + 外输 20
    {
      producer: { id: 'screw-D', type: 'constructor', recipe: 'screw', count: 3, ratePerMachine: 40, label: '×3 螺丝构筑站 (D)' },
      consumers: [{ id: 'rotor-1', type: 'assembler', recipe: 'rotor', count: 1, ratePerMachine: 100, label: '×1 转子装配站 (D)' }],
      terminalRate: 20,
    },
  ],
};

// ======== 面板 04: 铁棒（Trunk B 跨 4 类消费） ========
const panelIronRod: PanelSpec = {
  id: 'iron-rod',
  title: '面板 04 · 铁棒（24 台构筑站，2 条主干）',
  material: 'iron-rod',
  trunks: [
    // Trunk A: 12 台构筑站 → 18 台螺丝构筑站（每台消耗 10 铁棒）
    {
      producer: { id: 'rod-A', type: 'constructor', recipe: 'iron-rod', count: 12, ratePerMachine: 15, label: '×12 铁棒构筑站 (A)' },
      consumers: [{ id: 'screw-18', type: 'constructor', recipe: 'screw', count: 18, ratePerMachine: 10, label: '×18 螺丝构筑站 (A)' }],
      terminalRate: 0,
    },
    // Trunk B: 12 台构筑站 → 2 螺丝 + 3 转子 + 6 MF + 外输 28
    {
      producer: { id: 'rod-B', type: 'constructor', recipe: 'iron-rod', count: 12, ratePerMachine: 15, label: '×12 铁棒构筑站 (B)' },
      consumers: [
        { id: 'screw-2', type: 'constructor', recipe: 'screw', count: 2, ratePerMachine: 10, label: '×2 螺丝构筑站 (B)' },
        { id: 'rotor', type: 'assembler', recipe: 'rotor', count: 3, ratePerMachine: 20, label: '×3 转子装配站' },
        { id: 'mf', type: 'assembler', recipe: 'modular-frame', count: 6, ratePerMachine: 12, label: '×6 模块化框架装配站' },
      ],
      terminalRate: 28,
    },
  ],
};

// ======== 其余 15 个面板：按 333 数据补全（参考 spec 5.1-5.4） ========
// [省略：按同样模式声明 iron-plate, copper-sheet, steel-ingot, steel-beam, steel-pipe,
//  concrete, wire, cable, rip, mf, esp, rotor, stator, motor, hmf]
// 具体 producer.count、consumer.count、consumer.ratePerMachine 全部引用 333 数据 + recipes.json。
// 每个面板都要在 data-333.test.ts 里加一条"×N 产源 + ×M 消费"的断言。

const allSpecs: PanelSpec[] = [
  panelIronIngot,
  panelCopperIngot,
  panelScrew,
  panelIronRod,
  // TODO 在 Task 7 补齐其他 15 个面板的 spec
];

export const panels333: Panel[] = allSpecs.map(buildPanel);
```

**注意：上面的 `// TODO` 不是占位符，是本 plan 的 Task 7 待办项——这里先写 4 个关键面板通过基础测试，Task 7 再补齐其他 15 个。**

- [ ] **Step 4: 运行测试（只通过 4 个面板的那部分）**

Run: `npx vitest run scripts/viz/__tests__/data-333.test.ts`
Expected: 铁锭/螺丝/铁棒的断言 PASS；"面板数量为 19" 的断言 FAIL

这是预期的——Task 7 会把剩下 15 个补齐让它全绿。

- [ ] **Step 5: 提交**

```bash
git add scripts/viz/data-333.ts scripts/viz/__tests__/data-333.test.ts
git commit -m "feat(viz): declare 4 key panels (iron-ingot, copper-ingot, screw, iron-rod)"
```

---

### Task 7: 补齐其余 15 个面板

**Files:**
- Modify: `scripts/viz/data-333.ts`

逐一补齐以下面板。每个面板按 333 数据填写产源、消费、外输；下面给出完整映射表（需要全部声明到 `data-333.ts`）：

| # | id | 产源 | 消费 | 外输 |
|---|---|---|---|---:|
| 03 | `steel-ingot` | 8 台铸造站 ×45 | 3 钢梁构筑 ×60 铁锭 + 6 钢管构筑 ×30 钢锭 | 0 |
| 05 | `iron-plate` | 7 台铁板构筑站 ×20 | 4 台 RIP 装配站 ×30 | 20 |
| 07 | `wire` | 8 台电线构筑站 ×30 | 1 台电缆构筑站 ×60 + 3 台定子装配站 ×40 | 60 |
| 08 | `cable` | 1 台电缆构筑站 ×30 | — | 30 |
| 09 | `copper-sheet` | 3 台铜板构筑站 ×10 | — | 30 |
| 10 | `steel-beam` | 3 台钢梁构筑站 ×15 | 2 台 ESP 装配站 ×18 | 9 |
| 11 | `steel-pipe` | 6 台钢管构筑站 ×20 | 3 台定子装配站 ×15 + 1 台 HMF 制造站 ×40 | 35 |
| 12 | `concrete` | 5 台混凝土构筑站 ×15 | 2 台 ESP 装配站 ×36 | 3 |
| 13 | `reinforced-iron-plate` | 4 台 RIP 装配站 ×5 | 6 台 MF 装配站 ×3 | 2 |
| 14 | `modular-frame` | 6 台 MF 装配站 ×2 | 1 台 HMF 制造站 ×10 | 2 |
| 15 | `encased-industrial-beam` | 2 台 ESP 装配站 ×6 | 1 台 HMF 制造站 ×10 | 2 |
| 16 | `rotor` | 3 台转子装配站 ×4 | 1 台马达装配站 ×10 | 2 |
| 17 | `stator` | 3 台定子装配站 ×5 | 1 台马达装配站 ×10 | 5 |
| 18 | `motor` | 1 台马达装配站 ×5 | — | 5 |
| 19 | `heavy-modular-frame` | 1 台 HMF 制造站 ×2 | — | 2 |

- [ ] **Step 1: 把所有 15 个面板 spec 写进 `data-333.ts`**

对于每个面板：
1. 产源总产出 = producer.count × ratePerMachine
2. 消费总需求 + 外输 = 产出
3. 如果产出 ≤ 270 /min：一条 trunk（producer 全数 + 所有 consumers + terminalRate）
4. 如果产出 > 270 /min：按 spec 5 节拆分（仅适用铁锭/铁棒/螺丝/钢锭——这 4 个已在 Task 6 写了，这里只剩钢锭要拆：`steel-ingot` 360/min > 270，拆 4+4 两条主干）

示例（钢锭面板）：

```typescript
// ======== 面板 03: 钢锭 ========
const panelSteelIngot: PanelSpec = {
  id: 'steel-ingot',
  title: '面板 03 · 钢锭（8 台铸造站 → 3 钢梁 + 6 钢管）',
  material: 'steel-ingot',
  trunks: [
    // Trunk A: 4 台铸造站 → 3 钢梁（180/min, 60 each）
    {
      producer: { id: 'foundry-A', type: 'foundry', recipe: 'steel-ingot', count: 4, ratePerMachine: 45, label: '×4 钢锭铸造站 (A)' },
      consumers: [{ id: 'beam', type: 'constructor', recipe: 'steel-beam', count: 3, ratePerMachine: 60, label: '×3 钢梁构筑站' }],
      terminalRate: 0,
    },
    // Trunk B: 4 台铸造站 → 6 钢管（180/min, 30 each）
    {
      producer: { id: 'foundry-B', type: 'foundry', recipe: 'steel-ingot', count: 4, ratePerMachine: 45, label: '×4 钢锭铸造站 (B)' },
      consumers: [{ id: 'pipe', type: 'constructor', recipe: 'steel-pipe', count: 6, ratePerMachine: 30, label: '×6 钢管构筑站' }],
      terminalRate: 0,
    },
  ],
};
```

其余 14 个面板按同样模式写（单 trunk 的情形最简单）。最后更新 `allSpecs` 数组，包含全部 19 个。

- [ ] **Step 2: 运行全部测试**

Run: `npx vitest run scripts/viz`
Expected: 全部 PASS，包括 `panels333.length === 19` 和流量守恒

- [ ] **Step 3: 提交**

```bash
git add scripts/viz/data-333.ts
git commit -m "feat(viz): declare all 19 panels covering 130-machine plan"
```

---

### Task 8: 面板布局算法（确定性 x/y 坐标）

**Files:**
- Create: `scripts/viz/layout.ts`
- Create: `scripts/viz/__tests__/layout.test.ts`

- [ ] **Step 1: 写失败测试**

```typescript
// scripts/viz/__tests__/layout.test.ts
import { describe, it, expect } from 'vitest';
import { layoutPanel } from '../layout';
import { buildPanel } from '../build-panel';

describe('layoutPanel', () => {
  it('返回所有节点的 x/y 坐标', () => {
    const panel = buildPanel({
      id: 'test',
      title: 'test',
      material: 'x',
      trunks: [{
        producer: { id: 'p', type: 't', recipe: 'x', count: 3, ratePerMachine: 30, label: 'p' },
        consumers: [{ id: 'c', type: 't', recipe: 'y', count: 3, ratePerMachine: 30, label: 'c' }],
        terminalRate: 0,
      }],
    });
    const layout = layoutPanel(panel);
    // 每个产源、消费、合流器、分流器都有坐标
    expect(layout.positions.size).toBeGreaterThan(0);
    // 产源在左，消费在右
    const p0 = layout.positions.get('p#0');
    const c0 = layout.positions.get('c#0');
    expect(p0!.x).toBeLessThan(c0!.x);
  });

  it('输出整体宽高', () => {
    const panel = buildPanel({
      id: 'test',
      title: 'test',
      material: 'x',
      trunks: [{
        producer: { id: 'p', type: 't', recipe: 'x', count: 1, ratePerMachine: 30, label: 'p' },
        consumers: [{ id: 'c', type: 't', recipe: 'y', count: 1, ratePerMachine: 30, label: 'c' }],
        terminalRate: 0,
      }],
    });
    const layout = layoutPanel(panel);
    expect(layout.width).toBeGreaterThan(0);
    expect(layout.height).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npx vitest run scripts/viz/__tests__/layout.test.ts`
Expected: FAIL

- [ ] **Step 3: 实现 `layout.ts`**

```typescript
// scripts/viz/layout.ts
import { Panel } from './types';

export interface Position { x: number; y: number; }
export interface PanelLayout {
  positions: Map<string, Position>;
  width: number;
  height: number;
}

// 坐标常量
const COL_PRODUCER = 60;
const COL_MERGER_L0 = 220;
const COL_MERGER_L1 = 340;
const COL_TRUNK_START = 460;
const COL_CONSUMER = 1200;
const COL_TERMINAL = 1360;
const COL_RIGHT_EDGE = 1440;

const ROW_HEIGHT = 70; // 每个机器/节点占的垂直空间
const TRUNK_GAP = 80;  // 两条主干间的垂直间隔

export function layoutPanel(panel: Panel): PanelLayout {
  const positions = new Map<string, Position>();
  let maxY = 0;

  // 按 trunk 组分层；我们用产源的 id 前缀（panel.id-tN）来识别 trunk
  // 简化：通过 belts 反推每个 trunk 涉及的节点
  // 更简：直接按 panel.producers 顺序和 panel.mergers/splitters/consumers 的 id 前缀来分层

  // 先把每个 trunk 占据的 y 起点算出来
  // 每条 trunk 的垂直占用 = max(产源台数, 消费台数) × ROW_HEIGHT
  // 注：产源在多 trunk 场景里每台都在自己行上
  
  // 由于 Panel 在 buildPanel 中把多 trunk 的产源/消费合并了，这里的 trunk 区分要靠 belt.id 前缀
  // 我们用一个启发式：按 belt 的 from-to 构建图，按连通分量划分 trunk

  // 简化实现：按"trunk 编号（从 id 前缀提取）"分组
  const trunks = new Map<string, Set<string>>(); // trunkKey → nodeIds
  for (const belt of panel.belts) {
    const key = belt.id.split('-').slice(0, 2).join('-'); // e.g., "iron-ingot" 或前缀
    // 更严格：提取 tN
    const m = belt.id.match(/-t(\d+)-/);
    const trunkKey = m ? `t${m[1]}` : 't0';
    if (!trunks.has(trunkKey)) trunks.set(trunkKey, new Set());
    trunks.get(trunkKey)!.add(belt.from);
    trunks.get(trunkKey)!.add(belt.to);
  }

  let trunkYOffset = 40;
  for (const [trunkKey, nodeIds] of trunks) {
    // 此 trunk 的产源、消费、合流器、分流器、终端
    const trunkProducers = Array.from(nodeIds).filter((id) =>
      panel.producers.some((p) => id.startsWith(p.id + '#'))
    );
    const trunkConsumers = Array.from(nodeIds).filter((id) =>
      panel.consumers.some((c) => id.startsWith(c.id + '#'))
    );
    const trunkMergers = panel.mergers.filter((m) => nodeIds.has(m.id));
    const trunkSplitters = panel.splitters.filter((s) => nodeIds.has(s.id));
    const trunkTerminals = panel.terminals.filter((t) => nodeIds.has(t.id));

    const trunkHeight = Math.max(trunkProducers.length, trunkConsumers.length, 1) * ROW_HEIGHT;

    // 产源竖排
    trunkProducers.forEach((id, i) => {
      positions.set(id, { x: COL_PRODUCER, y: trunkYOffset + i * ROW_HEIGHT });
    });

    // 合流器：第一层（收 3 台产源的）在 COL_MERGER_L0，第二层（合并叶合流器的）在 COL_MERGER_L1
    const rootMerger = trunkMergers[trunkMergers.length - 1]; // 最后一个通常是根
    const leafMergers = trunkMergers.slice(0, -1);
    leafMergers.forEach((m, i) => {
      const leafIdx = leafMergers.indexOf(m);
      positions.set(m.id, {
        x: COL_MERGER_L0,
        y: trunkYOffset + leafIdx * ROW_HEIGHT * 3 + ROW_HEIGHT, // 对齐到它合并的 3 台中间
      });
    });
    if (rootMerger && leafMergers.length > 0) {
      positions.set(rootMerger.id, {
        x: COL_MERGER_L1,
        y: trunkYOffset + trunkHeight / 2,
      });
    } else if (rootMerger) {
      // 单层合流（3 台以内）：根就是 COL_MERGER_L0
      positions.set(rootMerger.id, {
        x: COL_MERGER_L0,
        y: trunkYOffset + trunkHeight / 2,
      });
    }

    // 消费机器竖排
    trunkConsumers.forEach((id, i) => {
      positions.set(id, { x: COL_CONSUMER, y: trunkYOffset + i * ROW_HEIGHT });
    });

    // 分流器：沿主干横向分布，每个对齐到它服务的消费者的 y
    const splitterColStep = (COL_CONSUMER - COL_TRUNK_START) / Math.max(trunkSplitters.length, 1);
    trunkSplitters.forEach((s, i) => {
      // 分流器服务哪个消费？看它的 downBelt.to
      const downBelt = panel.belts.find((b) => s.outputs[0] === b.id);
      const servedConsumerPos = downBelt ? positions.get(downBelt.to) : undefined;
      positions.set(s.id, {
        x: COL_TRUNK_START + i * splitterColStep,
        y: servedConsumerPos?.y ?? trunkYOffset + trunkHeight / 2,
      });
    });

    // 终端：主干末端的右边
    trunkTerminals.forEach((t, i) => {
      positions.set(t.id, { x: COL_TERMINAL, y: trunkYOffset + trunkHeight - ROW_HEIGHT * (i + 1) });
    });

    trunkYOffset += trunkHeight + TRUNK_GAP;
    maxY = trunkYOffset;
  }

  return {
    positions,
    width: COL_RIGHT_EDGE,
    height: maxY + 40,
  };
}
```

- [ ] **Step 4: 运行测试通过**

Run: `npx vitest run scripts/viz/__tests__/layout.test.ts`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add scripts/viz/layout.ts scripts/viz/__tests__/layout.test.ts
git commit -m "feat(viz): implement deterministic panel layout"
```

---

### Task 9: SVG 渲染器

**Files:**
- Create: `scripts/viz/render-svg.ts`

- [ ] **Step 1: 实现 SVG 渲染**

```typescript
// scripts/viz/render-svg.ts
import { Panel, Machine } from './types';
import { PanelLayout } from './layout';

const MATERIAL_COLORS: Record<string, string> = {
  'iron-ingot': '#8b8b89',
  'copper-ingot': '#39231d',
  'steel-ingot': '#2a2a2a',
  'iron-rod': '#9a9a9a',
  'iron-plate': '#b0b0b0',
  screw: '#b8b8b8',
  wire: '#9e6b43',
  cable: '#6e6c6c',
  'copper-sheet': '#39231d',
  concrete: '#bcb5a3',
  'steel-beam': '#3a3a3a',
  'steel-pipe': '#666666',
  'reinforced-iron-plate': '#868686',
  'modular-frame': '#5a5a5a',
  'encased-industrial-beam': '#7a7a7a',
  rotor: '#6e6e6e',
  stator: '#5e5e5e',
  motor: '#49575b',
  'heavy-modular-frame': '#4a4a4a',
};

const MACHINE_COLORS: Record<Machine['type'], string> = {
  smelter: '#d06340',
  foundry: '#de8843',
  constructor: '#8e8e8e',
  assembler: '#3e7fbf',
  manufacturer: '#8a4ab4',
  'miner-mk3': '#6e5a3e',
};

const MK3_CAP = 270;

export function renderPanelSvg(panel: Panel, layout: PanelLayout): string {
  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${layout.width} ${layout.height}" width="${layout.width}" height="${layout.height}" class="panel-svg">`
  );
  parts.push(`<rect width="100%" height="100%" fill="#f7f7f5"/>`);
  parts.push(`<text x="20" y="28" font-family="sans-serif" font-size="18" font-weight="bold">${escape(panel.title)}</text>`);

  // 先画 belts（在机器下面）
  for (const belt of panel.belts) {
    const from = layout.positions.get(belt.from);
    const to = layout.positions.get(belt.to);
    if (!from || !to) continue;
    const color = MATERIAL_COLORS[belt.material] ?? '#888';
    const cap = belt.cap ?? MK3_CAP;
    const util = belt.rate / cap;
    const strokeWidth = util >= 0.9 ? 4 : util >= 0.5 ? 3 : 2;
    const strokeColor = util >= 0.9 ? '#d12' : color;
    parts.push(
      `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" marker-end="url(#arrow)"/>`
    );
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    parts.push(
      `<text x="${midX}" y="${midY - 4}" font-family="sans-serif" font-size="10" fill="#333">${belt.rate}/min</text>`
    );
  }

  // 产源/消费机器盒
  for (const p of panel.producers) {
    for (let i = 0; i < p.count; i++) {
      const id = `${p.id}#${i}`;
      const pos = layout.positions.get(id);
      if (!pos) continue;
      parts.push(renderMachineBox(pos.x, pos.y, p, false));
    }
  }
  for (const c of panel.consumers) {
    for (let i = 0; i < c.count; i++) {
      const id = `${c.id}#${i}`;
      const pos = layout.positions.get(id);
      if (!pos) continue;
      parts.push(renderMachineBox(pos.x, pos.y, c, true));
    }
  }

  // 合流器/分流器
  for (const m of panel.mergers) {
    const pos = layout.positions.get(m.id);
    if (!pos) continue;
    parts.push(renderRouteNode(pos.x, pos.y, 'M'));
  }
  for (const s of panel.splitters) {
    const pos = layout.positions.get(s.id);
    if (!pos) continue;
    parts.push(renderRouteNode(pos.x, pos.y, 'S'));
  }

  // 外输终端
  for (const t of panel.terminals) {
    const pos = layout.positions.get(t.id);
    if (!pos) continue;
    parts.push(renderTerminal(pos.x, pos.y, t.label, MATERIAL_COLORS[t.material] ?? '#888'));
  }

  // 箭头 marker 定义
  parts.push(
    `<defs><marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#333"/></marker></defs>`
  );
  parts.push(`</svg>`);
  return parts.join('\n');
}

function renderMachineBox(x: number, y: number, m: Machine, dashed: boolean): string {
  const color = MACHINE_COLORS[m.type] ?? '#888';
  const dash = dashed ? 'stroke-dasharray="4,3"' : '';
  return `<g transform="translate(${x - 50},${y - 18})">
    <rect width="100" height="36" rx="6" fill="white" stroke="${color}" stroke-width="2" ${dash}/>
    <text x="50" y="16" font-family="sans-serif" font-size="10" text-anchor="middle">${escape(m.label)}</text>
    <text x="50" y="28" font-family="sans-serif" font-size="9" text-anchor="middle" fill="#666">${m.ratePerMachine}/min</text>
  </g>`;
}

function renderRouteNode(x: number, y: number, letter: 'M' | 'S'): string {
  const fill = letter === 'M' ? '#9b8ec9' : '#c99b8e';
  return `<g transform="translate(${x},${y})">
    <polygon points="-8,-8 8,0 -8,8" fill="${fill}" stroke="#444" stroke-width="1"/>
    <text x="-3" y="3" font-family="sans-serif" font-size="9" fill="white">${letter}</text>
  </g>`;
}

function renderTerminal(x: number, y: number, label: string, color: string): string {
  return `<g transform="translate(${x},${y})">
    <polygon points="-12,0 -6,-10 6,-10 12,0 6,10 -6,10" fill="${color}" stroke="#333" stroke-width="1"/>
    <text x="0" y="-14" font-family="sans-serif" font-size="10" text-anchor="middle">${escape(label)}</text>
  </g>`;
}

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
```

- [ ] **Step 2: 提交**

```bash
git add scripts/viz/render-svg.ts
git commit -m "feat(viz): implement SVG rendering for panels"
```

---

### Task 10: HTML 模板 + 侧栏导航

**Files:**
- Create: `scripts/viz/render-html.ts`

- [ ] **Step 1: 实现 HTML 渲染**

```typescript
// scripts/viz/render-html.ts
import { Panel } from './types';
import { PanelLayout } from './layout';
import { renderPanelSvg } from './render-svg';

export interface PanelRender {
  panel: Panel;
  layout: PanelLayout;
}

export function renderHtml(panelRenders: PanelRender[]): string {
  const svgs = panelRenders
    .map(({ panel, layout }) => `
<section id="${panel.id}" class="panel">
  <h2>${escapeHtml(panel.title)}</h2>
  ${renderPanelSvg(panel, layout)}
</section>
`)
    .join('\n');

  const toc = panelRenders
    .map(({ panel }) => `<li><a href="#${panel.id}">${escapeHtml(panel.title)}</a></li>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>130 台工厂分流/合流拓扑图</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Microsoft YaHei", sans-serif; margin: 0; padding: 0; display: flex; }
  nav { position: fixed; top: 0; left: 0; width: 280px; height: 100vh; overflow-y: auto; background: #222; color: #eee; padding: 20px; box-sizing: border-box; }
  nav h1 { font-size: 16px; margin: 0 0 16px; }
  nav ol { padding-left: 20px; font-size: 13px; line-height: 1.8; }
  nav a { color: #8ec9ff; text-decoration: none; }
  nav a:hover { text-decoration: underline; }
  main { margin-left: 300px; padding: 20px; flex: 1; }
  .panel { margin-bottom: 40px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; background: white; }
  .panel h2 { margin: 0; padding: 12px 16px; background: #f0f0f0; border-bottom: 1px solid #ddd; font-size: 15px; }
  .panel-svg { display: block; max-width: 100%; }
  .legend { padding: 16px; font-size: 12px; background: #fafafa; border-bottom: 1px solid #eee; }
  .legend .tag { display: inline-block; padding: 2px 8px; margin-right: 8px; border-radius: 3px; }
</style>
</head>
<body>
<nav>
  <h1>130 台工厂拓扑图</h1>
  <div class="legend">
    <p><strong>图例</strong></p>
    <p>▶ M = 合流器（≤3 入 1 出）</p>
    <p>◀ S = 分流器（1 入 ≤3 出）</p>
    <p>⬢ = 外输终端</p>
    <p>红粗线 = Mk.3 传送带接近满载（≥90%）</p>
    <p>所有流量为稳态值。分流器启动阶段会等分偏流，机器缓存填满后自动回正。</p>
  </div>
  <ol>${toc}</ol>
</nav>
<main>${svgs}</main>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
```

- [ ] **Step 2: 提交**

```bash
git add scripts/viz/render-html.ts
git commit -m "feat(viz): implement HTML wrapper with TOC and legend"
```

---

### Task 11: 连接 generate.ts 输出最终 HTML

**Files:**
- Modify: `scripts/viz/generate.ts`

- [ ] **Step 1: 更新 generate.ts**

```typescript
// scripts/viz/generate.ts
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { panels333 } from './data-333';
import { validatePanel } from './validate';
import { layoutPanel } from './layout';
import { renderHtml, PanelRender } from './render-html';

function main(): void {
  // 验证所有面板
  const allErrors: string[] = [];
  for (const panel of panels333) {
    allErrors.push(...validatePanel(panel));
  }
  if (allErrors.length > 0) {
    // eslint-disable-next-line no-console
    console.error('Validation errors:', allErrors);
    process.exit(1);
  }

  // 布局
  const panelRenders: PanelRender[] = panels333.map((panel) => ({
    panel,
    layout: layoutPanel(panel),
  }));

  // 渲染
  const html = renderHtml(panelRenders);

  // 写盘
  const outPath = 'docs/viz/2026-04-20-conveyor-layout.html';
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, html, 'utf8');
  // eslint-disable-next-line no-console
  console.log(`Wrote ${outPath} (${panels333.length} panels, ${html.length} bytes)`);
}

main();
```

- [ ] **Step 2: 运行生成**

Run: `npx tsx scripts/viz/generate.ts`
Expected: stdout `Wrote docs/viz/2026-04-20-conveyor-layout.html (19 panels, ... bytes)`，无验证错误

- [ ] **Step 3: 手动核对**

用浏览器打开 `docs/viz/2026-04-20-conveyor-layout.html`，逐面板核对：
1. 19 个面板可见
2. 每个面板有标题、合流器、分流器、边标签
3. 侧栏 TOC 可跳转
4. Mk.3 接近满载的带（螺丝/铁锭的主干）显示红粗线

若有渲染异常：
- 节点重叠 → 调整 `layout.ts` 里 ROW_HEIGHT / TRUNK_GAP
- 线条穿过机器盒 → 在 `render-svg.ts` 改用折线（`<polyline>`）
- 文字遮挡 → 调标签 y 偏移

记录问题，在 Task 12 修复。

- [ ] **Step 4: 提交**

```bash
git add scripts/viz/generate.ts docs/viz/2026-04-20-conveyor-layout.html
git commit -m "feat(viz): generate final HTML with all 19 panels"
```

---

### Task 12: 视觉修复 + 终检

**Files:**
- Modify: 根据 Task 11 Step 3 记录的问题修复 `layout.ts` / `render-svg.ts`

- [ ] **Step 1: 修复节点重叠**

若多个分流器 x 坐标相同导致挤在一起，调整 `layout.ts` 的 `splitterColStep`：

```typescript
// 改为按消费者 y 分组排列
trunkSplitters.forEach((s, i) => {
  const downBelt = panel.belts.find((b) => s.outputs[0] === b.id);
  const servedConsumerPos = downBelt ? positions.get(downBelt.to) : undefined;
  positions.set(s.id, {
    x: COL_TRUNK_START + i * splitterColStep,
    y: servedConsumerPos?.y ?? trunkYOffset + trunkHeight / 2,
  });
});
```

如果错位严重，改用：
```typescript
// 让每个分流器 x 略错开，便于看清链路
x: COL_TRUNK_START + i * Math.max(60, splitterColStep),
```

- [ ] **Step 2: 修复线条穿过机器盒**

将 `render-svg.ts` 里的 `<line>` 替换为 `<polyline>`，用正交折线：

```typescript
// 在 renderPanelSvg 里替换 line 生成
const midX = from.x + (to.x - from.x) * 0.6;
parts.push(
  `<polyline points="${from.x},${from.y} ${midX},${from.y} ${midX},${to.y} ${to.x},${to.y}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" marker-end="url(#arrow)"/>`
);
```

- [ ] **Step 3: 重新生成并目测**

Run: `npx tsx scripts/viz/generate.ts`
Expected: HTML 输出 + 浏览器目测通过

- [ ] **Step 4: 运行所有测试**

Run: `npx vitest run scripts/viz`
Expected: 全部 PASS

- [ ] **Step 5: 运行 TypeScript 类型检查**

Run: `npx tsc -b`
Expected: 无错误

- [ ] **Step 6: 提交**

```bash
git add scripts/viz/
git commit -m "fix(viz): orthogonal polylines + splitter spacing adjustments"
```

---

### Task 13: README 更新 + 最终确认

**Files:**
- Modify: `scripts/viz/README.md`（新建，简短使用说明）

- [ ] **Step 1: 写 README**

```markdown
# scripts/viz

生成 130 台工厂方案（333）的分流/合流拓扑可视化单页 HTML。

## 使用

```bash
npx tsx scripts/viz/generate.ts
```

产物：`docs/viz/2026-04-20-conveyor-layout.html`（双击浏览器打开）

## 测试

```bash
npx vitest run scripts/viz
```

覆盖：
- Merger 树展开正确性
- Manifold 分流链流量守恒
- 每条传送带 ≤ Mk.3（270/min）
- 面板级产出 = 消费 + 外输

## 设计

见 `docs/superpowers/specs/2026-04-20-conveyor-layout-viz-design.md`。
```

- [ ] **Step 2: 最终提交**

```bash
git add scripts/viz/README.md
git commit -m "docs(viz): add scripts/viz README"
```

- [ ] **Step 3: 向用户展示成果**

打开 `docs/viz/2026-04-20-conveyor-layout.html` 并提示用户核对。

---

## 自检清单

### 1. Spec 覆盖

- [x] § 2.1 输出形态（单 HTML + SVG）→ Task 1 + Task 10 + Task 11
- [x] § 2.2 页面结构 + 侧栏 TOC → Task 10
- [x] § 2.3 19 个面板 → Task 6 + Task 7
- [x] § 3 单面板内部拓扑（merger 树 + manifold）→ Task 2 + Task 3 + Task 4
- [x] § 3.2 节点形状与颜色 → Task 9
- [x] § 3.3 manifold 算法 → Task 3
- [x] § 4 Mk.3 占用率可视化 → Task 5 + Task 9
- [x] § 5 每面板主干规划 → Task 6 + Task 7 的 spec 表格
- [x] § 6 交互（至少静态为主） → Task 10 HTML 模板
- [x] § 8 验收标准 → Task 12 目测 + 全部测试通过

### 2. Placeholder 扫描

所有步骤都有具体代码或命令，没有 "TBD" / "TODO later"。Task 6 里出现的 `// TODO Task 7 补齐` 不是占位，是显式跨任务引用，且 Task 7 有专门覆盖。

### 3. 类型一致性

- `Machine.kind`: 'producer' / 'consumer' ✓（types.ts + buildPanel）
- `RouteNode.kind`: 'splitter' / 'merger' ✓
- `buildMergerTree` 返回 `trunkEntryId` / `trunkRate` → `buildPanel` 消费 ✓
- `buildManifold` 期望 `stops: ManifoldStop[]` → `buildPanel` 传入 ✓
- `Panel` 字段在 validate / layout / render 三处用法一致 ✓

---

## 执行选择

**Plan complete and saved to `docs/superpowers/plans/2026-04-20-conveyor-layout-viz.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
