# Error Boundary 设计文档

## 概述

为 factory-plan 项目添加友好的错误处理界面，使用社区成熟方案 `react-error-boundary`，采用分层策略覆盖渲染错误和异步错误。

## 技术选型

- **`react-error-boundary`** — React 社区最流行的 ErrorBoundary 库，~2KB，零依赖，React 19 兼容
- 不引入额外 UI 库，Fallback 使用库默认样式 + 最少量内联样式

## 错误分级

| 级别 | 触发场景 | 展示方式 |
|------|---------|---------|
| 致命 - 全局 | 方案 JSON 加载/解析全部失败、无可用方案 | 全屏错误页（替换整个应用） |
| 致命 - 视图 | 某个视图（FloorPlan/LinkedFloor/CrossSection）渲染崩溃 | 视图区域就地展示错误 + 重试按钮，TopBar/侧栏保持可用 |

## ErrorBoundary 嵌套结构

```
<AppErrorBoundary>          ← 全局兜底（全屏接管）
  <TopBar />
  <LeftPanel />
  <ViewErrorBoundary>       ← 视图级（就地恢复）
    <FloorPlanView /> | <LinkedFloorView /> | <CrossSectionView />
  </ViewErrorBoundary>
  <RightPanel />
</AppErrorBoundary>
```

## Fallback UI

### 全局 Fallback（全屏接管）

- 错误标题："应用出错了"
- 错误信息（`error.message`）
- "重新加载" 按钮 → 调用 `resetErrorBoundary()` 重新渲染整个组件树

### 视图 Fallback（就地恢复）

- 错误标题："视图渲染失败"
- 错误信息（`error.message`）
- "重试" 按钮 → `resetErrorBoundary()`
- `resetKeys` 绑定当前视图模式和选中方案 —— 用户切换方案或视图时自动重置错误状态

### 样式

Fallback 组件用库默认样式 + 最少量内联样式（居中、间距），不单独建 CSS 文件。

## 异步错误处理

在 `App.tsx` 的方案加载逻辑中：

1. `import.meta.glob` 加载失败 → `useErrorBoundary().showBoundary(error)` 抛到全局 boundary
2. 单个 JSON 解析失败 → 跳过该方案，`console.warn` 记录（不阻断其他方案加载）
3. 所有方案都加载失败 → 抛到全局 boundary

## 涉及文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `package.json` | 修改 | 添加 `react-error-boundary` 依赖 |
| `src/App.tsx` | 修改 | 包裹 ErrorBoundary，异步加载加 try-catch + `showBoundary` |
| `src/ui/AppErrorFallback.tsx` | 新建 | 全局 fallback 组件 |
| `src/ui/ViewErrorFallback.tsx` | 新建 | 视图级 fallback 组件 |

## 不做的事

- 不引入 toast 通知库
- 不处理全局未捕获异常（window.onerror）
- 不添加错误日志/监控服务
- 不为 fallback 创建独立 CSS 文件
