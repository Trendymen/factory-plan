# 移除电力层可视化

## 目标

彻底移除电力层可视化系统（电线杆、电力连接线、电力图层开关），从数据定义、类型、验证、渲染、UI、样式全链路删除。保留机器功耗统计显示不变。

## 删除清单

### 整文件删除

| 文件 | 说明 |
|------|------|
| `src/renderers/PowerRenderer.tsx` | 电力渲染组件 |

### 类型层 (`src/core/types.ts`)

- 删除 `PowerType` 类型（wall-outlet、power-pole 枚举）
- 删除 `PowerPole` 接口
- 删除 `PowerConnection` 接口
- 删除 `Scheme` 接口中的 `power` 字段
- 删除 `Layers` 接口中的 `power` 字段
- 删除 `PortKind` 中的 `'power'` 值

### 注册层 (`src/core/registry.ts`)

- 删除 `wall-outlet-mk1`、`wall-outlet-mk2`、`wall-outlet-mk3` 注册项
- 删除 `power-pole-mk1` 注册项

### 验证层 (`src/core/schema.ts`)

- 删除 R11 电力连接验证逻辑
- 从唯一性 ID 集合中移除 poles ID

### 视图层 (`src/views/FloorPlanView.tsx`)

- 删除 `PowerRenderer` 导入
- 删除 `poles`、`connections` 变量声明
- 删除 `<PowerRenderer>` JSX 渲染

### 状态管理 (`src/store/useAppStore.ts`)

- 删除 `layers` 默认值中的 `power: true`

### UI 层 (`src/ui/LeftPanel.tsx`)

- 删除 LAYER_CONFIG 中的电力图层开关项 `{ key: 'power', label: '电力', color: '#ffd740' }`

### 样式层 (`src/styles/theme.css`)

- 删除 `.power-line` 样式
- 删除 `.power-pole-marker` 样式
- 删除 `.power-label` 样式
- 删除 `@keyframes powerPulse` 动画

### 数据层 (`data/schemes/iron-full-line-v1.json`)

- 删除整个 `power` 字段（`poles` 数组 + `connections` 数组）

### 测试 (`src/__tests__/schema.test.ts`)

- 删除测试最小方案中的 `power: { poles: [], connections: [] }`

### 文档 (`CLAUDE.md`)

- R9-R11 规则描述中移除电力连接相关内容
- R11 整条移除（仅涉及电力连接）

## 保留清单（不动）

- `--power` CSS 变量 — 功耗数值显示仍在用
- `RightPanel.tsx` 总功耗统计
- `MachineDetail.tsx` 单机功耗显示
- `MachineTooltip.tsx` 悬停功耗显示
- 注册表中各机器的 `powerUsage` 字段
- `.power-stat`、`.power-value`、`.power-unit` CSS 样式

## 验证方式

- `npm run build` 编译通过
- `npm test` 测试通过
- 开发服务器运行，界面无报错，电力层不再出现
