# scripts/viz

生成 130 台工厂方案（`333` 数据）的分流/合流拓扑可视化单页 HTML。

## 使用

```bash
npx tsx scripts/viz/generate.ts
```

产物：`docs/viz/2026-04-20-conveyor-layout.html`（双击浏览器打开）。

## 测试

```bash
npx vitest run scripts/viz
```

覆盖：
- Merger 树展开正确性（`buildMergerTree`）
- Manifold 分流链流量守恒（`buildManifold`）
- 面板组装器（`buildPanel`）
- 每条传送带 ≤ Mk.3（270/min）
- 面板级产出 = 消费 + 外输
- 19 个面板的端到端一致性（`data-333.test.ts`）

## 文件结构

| 文件 | 职责 |
|---|---|
| `types.ts` | FactoryViz / Panel / Machine / Belt / RouteNode 的 TypeScript 接口 |
| `build-panel.ts` | `buildMergerTree`、`buildManifold`、`buildPanel` 三个组合函数 |
| `validate.ts` | 流量守恒 + Mk.3 上限校验 |
| `data-333.ts` | 19 个面板的声明式数据 |
| `layout.ts` | 确定性 x/y 坐标计算 |
| `render-svg.ts` | SVG 字符串生成 |
| `render-html.ts` | HTML shell + TOC 导航 |
| `generate.ts` | 入口：读数据 → 校验 → 布局 → 渲染 → 写盘 |

## 设计文档

详见 `docs/superpowers/specs/2026-04-20-conveyor-layout-viz-design.md` 和 `docs/superpowers/plans/2026-04-20-conveyor-layout-viz.md`。
