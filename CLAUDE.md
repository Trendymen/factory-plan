# Factory Plan — 项目规则

## 项目简介

Satisfactory（幸福工厂）工厂蓝图查看系统。蓝图由 AI 生成 JSON 数据，用户只查看和切换方案。

## 技术栈

React 19 + TypeScript + Vite 6 + Zustand + Motion

## 方案数据生成规则

生成或修改 `data/schemes/*.json` 时，**必须**遵循以下规则。`src/core/schema.ts` 中的 `validateSchemeDetailed()` 会在加载时自动校验，违反规则的数据会产生 error 或 warning。

### R1: 建筑类型合法

`machine.type` 必须是 `src/core/registry.ts` 中 `BUILDING_REGISTRY` 已注册的类型。`machine.floor` 必须引用 `floors` 数组中存在的楼层 ID。

### R2: 网格对齐

所有坐标值必须对齐到 **0.25 步进**（即 2m 精度）。允许的值：`0, 0.25, 0.5, 0.75, 1, 1.25...`

不允许：`0.13, 0.77, 3.19, 6.65` 这类无法被 0.25 整除的值。

### R3: 画布边界

所有机器的 `pos` 不能超出所在楼层的 `gridSize` 范围。`pos.col` 必须在 `[0, cols)` 内，`pos.row` 必须在 `[0, rows)` 内。

### R4: 传送带端口绑定

每条传送带**必须**有 `fromPort` 和 `toPort` 字段，格式为 `"machineId:portId"`。

- `portId` 必须是目标机器类型在 `registry.ts` 中定义的端口 ID（如 `in-0`, `out-0`, `out-1`, `out-2`）
- 分流器端口：`in-0`(back入), `out-0`(front出), `out-1`(left出), `out-2`(right出)
- 合流器端口：`in-0`(back入), `in-1`(left入), `in-2`(right入), `out-0`(front出)

### R5: 端口引用有效

`fromPort` / `toPort` 中引用的 `machineId` 必须在 `machines` 数组中存在。

### R6: 路径至少 2 点

传送带 `path` 数组至少包含 2 个坐标点。

### R7: 传送带路径正交

传送带路径中相邻两点**必须**共享 `col` 或 `row`（即只允许水平或垂直线段）。**禁止斜线**。

正确：`(1, 2) → (1, 5) → (3, 5)` （先垂直再水平）
错误：`(1, 2) → (3, 5)` （斜线）

### R8: 路径点对齐

传送带路径的每个点也必须对齐到 0.25 步进。

### R9-R11: 引用完整性

升降机、电力连接中引用的楼层 ID、传送带 ID、机器/电线杆 ID 必须存在。

### R12: ID 唯一

所有元素（machines, belts, lifts, poles, structures）的 `id` 全局唯一，不允许重复。

---

## 分流器/合流器布局规则

### 端口方向（facing=south 时）

| 逻辑方向 | 屏幕方向 | 分流器用途 | 合流器用途 |
|---------|---------|-----------|-----------|
| back    | 上 (top) | 入口 in-0 | 入口 in-0 |
| front   | 下 (bottom) | 出口 out-0 | 出口 out-0 |
| left    | 右 (right) | 出口 out-1 | 入口 in-1 |
| right   | 左 (left) | 出口 out-2 | 入口 in-2 |

### 传送带连接原则

传送带连接到分流/合流器时，**最后一段线段必须垂直于目标端口所在的边**：
- 连接 back/front 端口 → 最后一段是垂直线（共享 col）
- 连接 left/right 端口 → 最后一段是水平线（共享 row）

### 居中放置

分流/合流器应放在传送带分叉/汇合的逻辑节点上，`pos` 对齐到 0.25 步进。

---

## 机器尺寸参考（网格单位，1格=8m）

| 类型 | 宽×长(格) | 入口 | 出口 |
|------|----------|------|------|
| smelter | 0.75×1.125 | 1×back | 1×front |
| constructor | 1.0×1.25 | 1×back | 1×front |
| assembler | 1.25×1.875 | 2×back | 1×front |
| manufacturer | 2.25×2.5 | 4×**front** | 1×back |
| splitter | 0.5×0.5 | 1×back | 3×(front,left,right) |
| merger | 0.5×0.5 | 3×(back,left,right) | 1×front |
| storage | 0.625×1.25 | 1×back | 1×front |

注意：**manufacturer 是唯一输入在前方(front)的机器**，其他所有机器输入都在后方(back)。

---

## 开发规则

### 代码结构

- `src/core/` — 纯数据层，零 React 依赖
- `src/renderers/` — SVG 纯函数组件，不持有状态
- `src/views/` — 视图容器，组合 renderers + 视口管理
- `src/ui/` — UI 面板组件，从 store 读状态
- `src/store/` — Zustand 集中状态管理
- `data/schemes/` — JSON 方案文件

### 命令

- `npm run dev` — 启动开发服务器
- `npm run build` — 构建
- `npm test` — 运行测试（vitest）
- `npm run test:watch` — 测试监视模式
