# 传送带流量显示功能设计

## 概述

为传送带添加实际物料流量显示能力，支持两种查看方式：
1. **Hover tooltip** — 鼠标悬停在传送带上时显示流量信息
2. **常驻标签图层** — 通过图层面板开关，在所有传送带上叠加流量标签

显示格式：`物料名 N/min`（如 `铁矿石 30/min`）。

## 设计决策

| 决策点 | 选择 | 理由 |
|--------|------|------|
| 显示数据 | 实际物料流量（非额定容量） | 用户需求 |
| 数据来源 | 前端运行时拓扑计算 | 灵活，不污染 JSON 数据 |
| 分流器处理 | 按需分配（已有逻辑） | `computeStats.ts` 已实现 demand-driven 分配 |
| 标签碰撞避让 | 复用现有 `labelLayout.ts` 算法 | 成熟可靠，减少重复代码 |

---

## 第 1 节：数据管线

### 新增导出函数

**文件**：`src/core/computeStats.ts`

新增 `computeBeltFlows(scheme): Map<string, { material: string; flow: number }>`：
- 内部复用 `createFlowAnalyzer`，遍历 `scheme.belts`，对每条 belt 调用 `beltFlow()` 取流量
- `material` 直接从 `belt.material` 读取
- 返回 `Map<beltId, { material, flow }>`

### Store 缓存

**文件**：`src/store/useAppStore.ts`

新增派生状态 `beltFlows: Map<string, { material: string; flow: number }>`：
- 在 scheme 加载/切换时自动重算（跟随现有 `computeSchemeStats` 调用时机）
- 组件通过 `useAppStore(s => s.beltFlows)` 消费

不在 JSON 中存储流量数据，纯运行时计算。

---

## 第 2 节：图层开关

### 类型扩展

**文件**：`src/core/types.ts`

```ts
export interface Layers {
  belts: boolean;
  zones: boolean;
  storage: boolean;
  beltFlow: boolean;  // 新增
}
```

### Store 默认值

**文件**：`src/store/useAppStore.ts`

`DEFAULT_LAYERS` 新增 `beltFlow: false`（默认关闭）。

### 面板配置

**文件**：`src/ui/LeftPanel.tsx`

`LAYER_CONFIG` 数组新增一项：

```ts
{ key: 'beltFlow', label: '流量', color: '#22d3ee' }
```

### 交互行为

- 切换"流量"图层 → 控制常驻流量标签的显示/隐藏
- Hover tooltip 不受此开关影响，悬停即显示

---

## 第 3 节：常驻流量标签（FlowLabelLayer）

### 新组件

**文件**：`src/renderers/FlowLabelLayer.tsx`

### 渲染逻辑

- 复用 `labelLayout.ts` 中的 `computeBeltLabelPositions()` 碰撞避让算法
- 每条 belt 在路径中段渲染 SVG 标签：矩形背景 + 文本（如 `铁矿石 30/min`）
- 仅当 `layers.beltFlow === true` 时渲染

### 与 BeltLabelLayer 的关系

- `BeltLabelLayer` 显示物料名（belt 身份标识）
- `FlowLabelLayer` 显示物料名 + 流量（数据叠加层）
- 两者同时开启时，流量标签候选位置偏移（优先取 t=0.35 而非 0.5），避免重叠

### 样式

- 背景色：半透明 cyan（`rgba(34, 211, 238, 0.15)`），区别于现有物料标签的蓝灰色调
- 字号与现有标签一致
- 支持 `dimmed` 状态（其他 belt 被选中/高亮时变淡）

---

## 第 4 节：Hover Tooltip

### 实现方式

在传送带 SVG 渲染层上，hover 时显示 SVG `<g>` 浮动提示框。

### 触发机制

- 复用 `BeltRenderer` 现有的 `onMouseEnter` / `onMouseLeave` 事件
- Store 中已有 `hoveredId` 状态，tooltip 据此决定是否显示

### 内容与位置

- 内容：单行 `铁矿石 30/min`
- 位置：hover belt 路径中点坐标，tooltip 定位于该点上方偏移
- 使用 SVG 坐标系，与现有渲染层一致

### 与常驻标签的关系

- 常驻标签开启时：hover tooltip 仍然显示（就近确认）
- 常驻标签关闭时：tooltip 是查看流量的唯一入口

---

## 涉及文件清单

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/core/computeStats.ts` | 修改 | 新增 `computeBeltFlows()` 导出函数 |
| `src/core/types.ts` | 修改 | `Layers` 接口新增 `beltFlow` 字段 |
| `src/store/useAppStore.ts` | 修改 | 新增 `beltFlows` 状态 + `DEFAULT_LAYERS.beltFlow` |
| `src/ui/LeftPanel.tsx` | 修改 | `LAYER_CONFIG` 新增流量图层项 |
| `src/renderers/FlowLabelLayer.tsx` | 新建 | 常驻流量标签组件 |
| `src/renderers/FlowTooltip.tsx` | 新建 | Hover tooltip SVG 组件（纯展示，接收 belt 中点坐标 + 流量数据） |
| `src/styles/theme.css` | 修改 | 流量标签样式 |
| `src/views/*` | 修改 | 集成 FlowLabelLayer + FlowTooltip 到视图容器 |

## 不做的事

- 不在 JSON 方案文件中存储流量数据
- 不显示额定容量或利用率
- 不做多行信息面板
- 分流器暂用均分（已有的 demand-driven 逻辑已比均分更好，直接复用）
