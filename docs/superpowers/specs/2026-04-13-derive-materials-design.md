# 传送带物料推导：从 JSON 硬编码迁移到运行时推导

**日期**: 2026-04-13
**状态**: approved

## 背景

当前 `belt.material` 和 `liftPair.material` 是 JSON 方案文件中的硬编码中文字符串（如 `"铁棒"`），同时承担物料 ID 和显示文案两个角色。这导致：

1. 数据冗余：物料身份本可从连接的机器配方推导
2. 一致性风险：手工维护 `belt.material` 与 `recipe.outputs[].item` 可能不一致
3. R31 校验本质上是在验证一个不应存在的冗余字段

## 目标

从 `BeltSegment` 和 `LiftPair` 类型中移除 `material` 字段，改为运行时从流量图自动推导物料身份。

## 设计

### 1. 核心模块：`src/core/deriveMaterials.ts`

**输入**: `Scheme` 对象
**输出**: `MaterialMap = Map<string, string[]>` — key 为 belt ID 或 liftPair ID，value 为物料名数组

#### 算法：前向传播

1. **建图**：
   - `beltByToPort: Map<"machineId:portId", Belt>` — 进入某端口的传送带
   - 机器索引 `machineById: Map<string, MachineInstance>`

2. **为每条 belt 做 DFS 推导 `deriveBelt(belt)`**：
   - 解析 `fromPort` → 找到源机器 + portId
   - **生产机器**：`materials = [recipe.outputs[portIdx].item]`
   - **分流器**：`materials = deriveBelt(连接到 splitter in-0 的上游 belt)`
   - **合流器**：`materials = union(deriveBelt(连接到 merger 各 in-* 的上游 belt))`，去重保序
   - **升降机**：`materials = deriveBelt(连接到 lift 入口端的上游 belt)`
   - **储存箱**：`materials = deriveBelt(连接到 storage in-* 的上游 belt)`
   - **无 fromPort**（外部输入）：`materials = []`（未知）
   - **环路保护**：DFS 中用 visiting Set 检测，遇环返回 `[]`

3. **升降机 liftPair**：取连接到入口端 lift 机器的 belt 物料

4. **记忆化**：`Map<beltId, string[]>` 缓存已推导结果，避免重复遍历

### 2. 类型变更

| 位置 | 变更 |
|------|------|
| `types.ts` `BeltSegment` | 删除 `material: string` |
| `types.ts` `LiftPair` | 删除 `material: string` |
| `computeStats.ts` `BeltFlowEntry` | 删除 `material: string` |
| `computeStats.ts` `SchemeStats.inputs/outputs` | **保留** `material: string`（聚合结果） |
| 新增 `deriveMaterials.ts` | 导出 `MaterialMap` 类型 + `deriveMaterials()` 函数 |

### 3. Store 集成

`useAppStore.ts`:
- 新增 state: `materialMap: MaterialMap`（初始 `new Map()`）
- `loadScheme()` 时计算：`materialMap: deriveMaterials(scheme)`
- `beltFlows` 保留，`BeltFlowEntry` 仅含 `{ flow, mark? }`

### 4. UI 消费者迁移

所有 `belt.material` / `pair.material` / `entry.material` 引用改为从 `materialMap` 查询：

| 文件 | 当前用法 | 迁移方式 |
|------|---------|---------|
| `BeltRenderer.tsx` | `getMaterialColor(belt.material)` | `getMaterialColor(materials[0])` |
| `labelLayout.ts` | `belt.material` 做标签文本和颜色 | 从 materialMap 取，多材料时 `materials.join('+')` |
| `FlowLabelLayer.tsx` | `entry.material` 显示流量标签 | 从 materialMap 取物料名 |
| `FlowTooltip.tsx` | `entry.material` 显示 tooltip | 同上 |
| `RightPanel.tsx` | `scheme.belts.map(b => b.material)` 收集物料集合 | 改用 materialMap 遍历 |
| `MachineDetail.tsx` | `entry.material` / `b.material` / `liftPair.material` | 全部从 materialMap 查 |
| `MachineTooltip.tsx` | `entry.material` 显示吞吐信息 | 同上 |
| `LiftRenderer.tsx` | `pair.material` 显示升降机徽标 | 从 materialMap 查 |
| `computeStats.ts` | `belt.material` / `pair.material` 传入 BeltFlowEntry | 不再传 material |

### 5. `computeSchemeStats` 物料来源迁移

`computeSchemeStats()` 统计全厂输入/输出时，需要知道每条边界带的物料。迁移后接收 `MaterialMap` 参数：

- 有 materialMap 数据的 belt → 直接用
- 外部输入带（`fromPort` 为空，`materials = []`）→ 反向推导：查 `toPort` 目标机器配方的 input，确定物料身份

### 6. 多材料显示策略

| 场景 | 策略 |
|------|------|
| 传送带颜色 | 取 `materials[0]` 颜色（主物料） |
| 传送带标签 | `materials.join('+')` |
| Tooltip / Detail 面板 | 逐个列出所有物料 |
| 统计面板 (RightPanel) | 多材料 belt 的流量按比例拆分到各物料（暂不需要，当前无混合场景产生统计歧义） |

### 7. 校验规则变更

| 规则 | 变化 | 原因 |
|------|------|------|
| R31 (material-mismatch) | **删除** | 物料由配方推导，不可能 mismatch |
| 其余规则 | 不变 | 无 material 依赖 |

### 8. JSON 数据迁移

`data/schemes/iron-full-line-v2.json`:
- 每条 belt 删除 `"material": "xxx"` 字段（约 45 处）
- 每条 liftPair 删除 `"material": "xxx"` 字段（2 处）

### 9. 测试变更

- 删除 R31 相关测试用例
- `computeSchemeStats` 断言保持不变（铁矿石 120/min 等），结果相同只是来源变了
- 新增 `deriveMaterials` 单元测试：
  - 生产机器直连 belt → 单物料
  - 经过 splitter 后 → 物料透传
  - 经过 merger 混合 → 多物料 union
  - 升降机 → 物料透传
  - 无 fromPort 的外部输入 belt → 空数组
  - 环路 → 不死循环，返回空
