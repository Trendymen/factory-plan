# Tier 6 + MAM 全产物蓝图设计（26 mainNode / 方案 C / Mk2 / 集群 + 屋顶集成总线）

## 背景与上下文

### 来源

- **配方数据**：`data/recipes.json`（Satisfactory 1.0 / 1.1 标准配方表）
- **方案 C**：基于"每条主输出 = 该产物 1 台 100% 满载产能"外部需求 + Tier 6 解锁过滤 + 允许超频到 250%
- **机器总数**：95 台，分布在 6 个建筑类型，全部位于 Tier 6 milestone + MAM（Caterium / Quartz / Alien Technology）解锁的配方。**矿机不计入蓝图，单独按矿场喂入**
- **电力碎片**：231 个（来自全图蛞蝓 ~2,659 上限 + 合成碎片配方，无瓶颈）
- **SAM 矿石需求**：360/min（~2 个 Mk3 矿机覆盖）

### MAM 解锁的非里程碑 Tier 6 生产配方

以下 5 个生产配方虽然里程碑解锁在 Tier 7-9，但**通过 MAM 研究链可以提前在 Tier 5+ 解锁**，所以包含在本 Tier 6 计划里：

| 配方 | MAM 路径 | 里程碑路径（绕过）|
|---|---|---|
| AI 限制器 | Caterium 树 | Tier 7 Control System Development |
| 晶体振荡器 | Quartz 树 | Tier 7 Bauxite Refinement |
| 高速连接器 | Caterium 树 | Tier 7 Control System Development |
| **重生 SAM** | Alien Technology 树 | Tier 9 Matter Conversion |
| **SAM 波动器** | Alien Technology 树 | Tier 9 Matter Conversion |

### 排除的 Tier 7+ 产物（11 个 mainNode 暂不生产）

铝壳·铝包铝板·超级计算机·无线电控制单元·冷却系统·涡轮电机·融合模块框架·叠加振荡器·时间晶体·神经量子处理器·虚构三角·虚构锭

### 保留的 Tier 6 + MAM mainNode（26 个）

铁板·铁棒·电线·线缆·混凝土·铜板·钢梁·钢管·强化铁板·转子·模块化框架·包裹工业梁·定子·电机·重型模块框架·电脑·塑料·橡胶·快速线·石英晶体·硅土·**AI限制器**·**晶体振荡器**·**高速连接器**·**重生SAM**·**SAM波动器**

### 1.2 实验版兼容性

- **重生 SAM 是 SPWN 建筑的施工材料**（1.2 实验版新增建筑：20×Steel Pipe + 5×Modular Frame + 100×Biomass + 20×Reanimated SAM；MAM Alien Technology Research - SPWN 解锁）
- 因此 重生 SAM 必须作为 mainNode 终端输出（不仅是 SAM 波动器的中间输入），方便 SPWN 等后续建筑施工
- 设计同时兼容 1.1 正式版（重生 SAM 仅为内部 + mainNode 输出）和 1.2 实验版（额外用于 SPWN 等新建筑）

## 设计目标

### 硬约束

1. **蓝图规格统一为 Mk2**：40m × 40m × 40m（项目坐标系 5×5×5 cells）
2. **每层楼地基 4m**（蓝图内多层堆叠时的隔层；每个蓝图自身的 1F 不需要地基）
3. **总线 belt 等级 ≤ Mk4**（480/min，Tier 6 milestone 上限）
4. **零过量生产**：每个 mainNode 的外部输出 = 该配方单台 100% 产能
5. **超频上限 250%**：每台机器 1-3 个电力碎片
6. **副产品 重油残渣**：默认通过 B6 总线集中送 BP-TERM-B sink 回收（~78/min）。Tier 5 解锁的 `residual-fuel` / `petroleum-coke` 升级路径见"重油残渣处理"小节

### 可验证成功标准

- 76 台机器全部分配到 Mk2 蓝图，每台时钟符合方案 C 计算结果
- 总线 belt 流量 ≤ Mk4 容量（480/min）
- 所有 21 个 mainNode 在终端汇流 belt 上可达
- 高流量物料（铁矿石 1020/min、螺丝 866/min、铁锭 610/min）通过本地化绕开总线
- 跨蓝图手接节数 ≤ 15（启用 1.1 Auto Connect）

## 布局模式：全栈歧管（Manifold）

本设计在**两个层级**统一使用歧管布局，**不使用负载均衡（load balancer）的对称分配树**：

### 1. 跨蓝图歧管（总线层）

总线 belt 沿水平方向贯穿所有集群。每个生产蓝图通过**智能分流器/可编程分流器** tap-off 自己需要的物料，剩余 overflow 继续沿 belt 流向下一个蓝图。这是经典的"长 belt + 各取所需"歧管模式：

```
[源]──belt──┬──[蓝图A]──┬──[蓝图B]──┬──[蓝图C]──→[终端]
            ▼           ▼            ▼
         智能分流器   智能分流器    智能分流器
        （取 A 需要）  （取 B 需要）  （取 C 需要）
```

启动期前几个蓝图先饱和，逐步往下游推进。**饱和后所有蓝图按设计流量稳态运行**。

### 2. 蓝图内歧管（机器并联层）

蓝图内部同一配方的多台机器（如 BP1 的 9 台 smelter）也用歧管：

```
[输入 belt]──splitter──splitter──splitter──→ overflow（封堵或回流）
                ↓         ↓         ↓
             机器1     机器2     机器3 ...
```

每台机器从主 belt 上 tap 1 路输入；如果机器吃饱了，多余沿主 belt 继续走。**用 splitter（不是 smart splitter）就够了**，因为蓝图内部 belt 上是单一物料。

### 3. 不用负载均衡的理由

- 方案 C 整体超频，每台机器吃满后流量恒定，**饱和后歧管和负载均衡输出完全一致**
- 歧管的 belt 路由更短、空间更紧凑，符合 Mk2 蓝图 5×5 的紧凑约束
- 修改/扩容时只需在 belt 末端加机器，不用拆重平衡
- 缺点（启动期前几台先饱和、后几台慢启动）对游戏体验影响小

## 架构总览

### 集群式 + 屋顶集成总线（方案 B）

**关键设计决定**：放弃独立的"总线楼"。每个生产蓝图自带屋顶总线层（35-40m），蓝图间通过侧墙的 Wall Outlet/Inlet + Auto Connect 自动续接 6 条总线 belt。**没有独立的 BP-BUS 蓝图**——总线分布在每个生产蓝图的屋顶里。

```
   每个生产蓝图（Mk2 40×40×40m）
   ┌───────────────────────────────┐ 40m
   │  35-40m  屋顶总线层           │
   │  · 6 条 Mk4 belt 东西向贯穿   │
   │  · 自带 smart splitter 取货   │
   │  · 自带 merger 注入产物       │
   │  · 自带 lift 下到机器层       │
   ├───────────────────────────────┤ 35m
   │  0-35m   机器层（多层堆叠）   │
   │  按各蓝图的产线分层布置       │
   └───────────────────────────────┘ 0m
       ↑                          ↑
   左 Wall Inlet            右 Wall Outlet
   接前一个蓝图的右 Outlet  接下一个蓝图的左 Inlet
        (Auto Connect 自动续接)
```

工厂分为 **6 个生产集群**，集群内部用短 belt/lift 直连（高流量物料不上总线），集群之间靠 6 条 Mk4 混合总线 belt + 各蓝图屋顶的智能/可编程分流器调度。

```
[BP1][BP2][BP3]──[BP4][BP5]──[BP6][BP7][BP8]──[BP9]──[BP10][BP11]──[BP12][BP13][BP14][BP15]──[BP-TERM-A][BP-TERM-B]
 └──C1 铁系──┘   └C2 钢┘     └──C3 铜电──┘   C4    C5     └──C6 装配 + 终端──┘
   每个蓝图屋顶 35-40m 跑 6 条 Mk4 belt 全程贯穿（Auto Connect 续接）
```

### 6 个生产集群

| 集群 | 蓝图 | 内部高流量物料（不上总线，集群内本地直连） |
|---|---|---|
| **C1 铁系** | 铁锭(BP1) → 铁板/铁棒/RIP(BP2) → 螺丝(BP3) | 铁矿石 1,140 / 铁锭 640 / 铁棒 380 / 螺丝 306（C1 内部消费 RIP）|
| **C2 钢系** | 钢锭(BP4) → 钢梁/钢管(BP5) | 铁矿石 410（独立矿场喂） / 钢锭 410 / 煤 410 |
| **C3 铜+电链** | 铜锭+铜金锭(BP6) → 铜板/电线/线缆(BP7) → 电路板+AI限制器(BP8) | 铜矿石 302 / 铜金锭 74 / 铜锭 302 / 电线 200（C3 内部部分消费）|
| **C4 油+橡塑** | 塑料/橡胶(BP9) | 原油 / 水（重油残渣走 B6 总线到 BP-TERM-B sink）|
| **C5 MAM+混凝土+SAM** | 石英晶体/硅土/快速线/混凝土+AI限制器(BP10) → **重生SAM/SAM波动器(BP11)** | 原始石英 / 石灰石 / SAM 矿（360/min） |
| **C6 装配+终端** | 转子/定子/电机(BP12) → 模块化框架/包裹工业梁(BP13) → 重型模块框架/电脑(BP14) → 晶体振荡器/高速连接器(BP15) | C6 内部装配链 |

### 总线 belt 设计（6 条 Mk4 active = 6 条总线 belt）

| Belt | 内容（混合） | 流量(/min) | 利用率 | 路由器类型 |
|---|---|---:|---:|---|
| **B1** | 螺丝（C1 → C6 BP12 转子）| 350 | 73% | 智能分流器（filter=螺丝） |
| **B2** | 螺丝（C1 → C6 BP14 HMF）240 + 铁棒（C1 → C6 BP12/BP13）140 + 强化铁板（C1 → C6 BP13）18 + 强化铁板（C1 → C6 BP15 晶振）2.5 | 400.5 | 83% | 可编程分流器（3 路 filter） |
| **B3** | 电线（C3 → C6 BP12 定子）120 + 电线（C3 → BP11 SAM波动器）50 + 钢管（C2 → BP12/BP14/BP11）115 + 钢梁（C2 → C6 BP13）48 | 333（最大段）| 69% | 可编程分流器（4 路 filter） |
| **B4** | 塑料（C4 → C3 BP8 + C6 BP14）80 + 混凝土（C5 → C6 BP13）96 + 电路板（C3 → C6 BP14/BP15）13.75 + 线缆（C3 → C6 BP14/BP15）71.5 | 261 | 54% | 可编程分流器（4 路 filter） |
| **B5** | 终端 mainNode 总线（26 种产物混合，去仓储/sink）| 396.25 | 83% ⚠ | 可编程分流器树（3 级 → 26 路输出） |
| **B6** | 铜金锭（BP6 → BP10）74 + 铜板（BP7 → BP10）25 + 快速线（BP10 → BP15）210 + 石英晶体（BP10 → BP15）18 + 重油残渣（BP9 → BP-TERM-B）78 | 306（最大段 BP10→BP15）| 64% | 可编程分流器（按位置多 filter）|

**注**：
- B2 83% 和 B5 83% 是当前最紧的两条 belt。启动顺序：先开 C1 铁系（BP1-BP3 螺丝），再开 C2-C5（钢/铜/油/MAM），最后开 C6 装配。这样 B2 上的螺丝/铁棒在饱和后才被 C6 拉走。
- B5 26 mainNode 满载时 83%——后期想加 mainNode（如铝链）必须新增 B7 分担
- B6 承担 MAM Caterium/Quartz 跨集群运输 + SAM 矿物链中转 + 重油残渣集中回收。流量按段累加：BP9→BP10 段 177、BP10→BP11→BP15 段 306（最大），64% Mk4 利用
- B3 因 SAM波动器 加入 +80/min（电线 50 + 钢管 30），从 53% 升到 69%
- Tier 7+ 升级路径：加 B6 belt（用于铝链/超级计算机/RCU）或拆 B5 / B6

### 跨集群连接拓扑

```
C1 铁系 ──B1(螺丝→BP12)──────────┐
         ──B2(螺丝+铁棒+RIP→C6)──┐
                                  │
C2 钢系 ──B3(钢管+钢梁→C6)──────┤
                                  │
C3 铜电 ──B3(电线→BP12)─────────┤
         ──B4(电路板+线缆→BP14/BP15)─┤
         ──B6(铜金锭→BP10)────────┤
                                  │
C4 油品 ──B4(塑料→BP8+BP14)─────┤
                                  │
C5 MAM ──B4(混凝土→BP13)────────┤
         ──B6(快速线+石英晶体→BP15)─┤
                                  │
                                  ▼
                                C6 装配 (BP12/BP13) + 终端 (BP14/BP15)
                                  │
                                  ▼
                              B5 终端总线 → 仓储/sink (BP-TERM-A/B)
```

### 屋顶总线层在蓝图内的物理形态

每个生产蓝图的 35-40m 区域是**自带的总线层**：

- 6 条 Mk4 belt（B1, B2, B3, B4, B5, B6 备用）东西向横穿，从左 Wall Inlet 进、右 Wall Outlet 出
- 智能分流器 / 可编程分流器：从总线 belt 上 tap 出本蓝图需要的物料
- 合流器：把本蓝图的产物注入对应总线 belt
- conveyor-lift-bot：从总线层 35m 下到机器层（机器在 0-35m 内不同高度）
- conveyor-lift-top：从机器层向上把成品送到 35m 总线层

蓝图之间的总线连续性：**Wall Outlet ↔ Wall Inlet 对齐 + Auto Connect → 自动续接**。**没有独立的 BP-BUS 蓝图**。

### 集群间填充段（按需）

如果集群之间需要留走道或空间（不连续紧贴），用一个**空填充蓝图 BP-BUS-FILLER**：

- 5×5 cells，35-40m 屋顶层只跑 6 条 belt 直通（无机器、无分流器）
- 0-35m 完全空着
- 仅在集群有空隙时填充使用

如果 13 个生产蓝图首尾紧贴，**完全不需要 filler**。

## 蓝图边界 / 连接锚点策略

### 工程约束

Satisfactory 蓝图设计器规定：**belt 必须两端连到建筑**。蓝图内部不能保存"悬空"belt 段。所以跨蓝图连接必须通过**边界锚点建筑**做端到端中转。

### Satisfactory 1.1 Auto Connect 模式（关键利好）

**1.1 引入**：放置蓝图时按 **R** 切换 Auto Connect 模式。系统自动检测 16m（2 地基）范围内对端的可连接接口（belt / pipe / rail / vehicle path），自动续接，无需手动画 belt。

**1.1.0.3 改进**：高度差也被纳入对齐计算（之前只考虑水平对齐）。

**意义**：
- 锚点（Wall Outlet / Wall Inlet / Ceiling Mount）在边界面对齐放置
- 放置时按 R 选 Auto Connect → 系统自动续接
- **跨蓝图手接节数从 ~50 降到 ~0**（仅在自动失败时手补）
- 工厂搭建工作量减半

### 推荐锚点：墙面传送带口（Conveyor Wall Mount）

每个 Mk2 蓝图在 5×5 cell 的**边界面墙体**上嵌入墙面传送带口作为锚点：

| 锚点种类 | 用途 | 占地 | 安装位置 |
|---|---|---|---|
| **Conveyor Wall Outlet**（墙面传送带出口）| 蓝图内 → 蓝图外 | 1×1 m，墙体内 | 边界面墙体 |
| **Conveyor Wall Inlet**（墙面传送带入口）| 蓝图外 → 蓝图内 | 1×1 m，墙体内 | 边界面墙体 |
| **Pipeline Wall Hole**（管道墙洞）| 流体跨蓝图（油田 → BP9）| 1×1 m，墙体内 | 边界面墙体 |
| ~~Conveyor Ceiling Mount~~（已不需要）| ~~蓝图屋顶 → 独立总线楼~~ | — | — |
| ~~Conveyor Wall Mount~~（已不需要）| ~~总线楼 → 蓝图~~ | — | — |

> 注：方案 B（屋顶集成总线）下，**Ceiling Mount 已不再需要**——总线直接在每个蓝图自带的屋顶层（35-40m）水平贯穿，蓝图之间通过侧墙 Wall Outlet/Inlet 续接，没有独立总线楼。

### 为什么不用 splitter / merger 当锚点

- splitter 占 0.5×0.5 cell（4×4 m），比墙面口大 16 倍
- splitter 必须放在地坪上，会占机器排布空间
- splitter 是单向→3 输出，2 个端口冗余，浪费
- 墙面口 1×1 m 嵌入墙体，**不占地坪面积**，且天然指明"边界"

### 锚点墙体面布局示例

```
   蓝图A 右边界面（col=5）          蓝图B 左边界面（col=0）
   墙体（5m 高 × 40m 宽）            墙体
   ┌────────────────────┐            ┌────────────────────┐
   │ ◯ Wall Outlet 1    │  ←─1m─→   │ ◯ Wall Inlet 1     │   ← 物料 1
   │ ◯ Wall Outlet 2    │  ←─1m─→   │ ◯ Wall Inlet 2     │   ← 物料 2
   │ ◯ Wall Outlet 3    │  ←─1m─→   │ ◯ Wall Inlet 3     │   ← 物料 3
   │ ...                │            │ ...                 │
   └────────────────────┘            └────────────────────┘
        ↑                                  ↑
    内部 belt 连到这里                内部 belt 从这里开始
```

每对相邻墙面口距离 ~2m（双方各 1m 出墙），用 1 节 belt 焊接。

### 跨蓝图连接 = Auto Connect 自动续接（≤ 16m）

放置时按 **R** 切到 Auto Connect 模式：

```
[Wall Outlet (A)]   ←── auto connect (≤16m) ──→   [Wall Inlet (B)]
```

蓝图悬停时即可看到自动连接的预览（virtual belt 高亮显示）。如果对齐成功 → 直接放下，连接完成；如果自动失败（罕见，比如方向不匹配）→ 退出 Auto Connect，手动画 1 节 belt 兜底。

### 屋顶总线层的接入方式

每个蓝图屋顶（35-40m）的总线 belt 是 6 条 Mk4 平行 belt：
- **左边界面 (col=0, h=35-40m)**: 6 个 **Conveyor Wall Inlet**（每条 belt 1 个），固定坐标位置（如 row=0,1,2,3,4 各 1 个）
- **右边界面 (col=5, h=35-40m)**: 6 个 **Conveyor Wall Outlet**，与左边界面镜像位置

蓝图设计时，6 条 belt 从左 Wall Inlet 横穿到右 Wall Outlet。中间在需要的位置放 splitter / merger / lift 做 tap-off / 注入。

### 蓝图间总线 belt 的自动续接

两个生产蓝图紧贴放置时，A 的右 Wall Outlet（h=35-40m）和 B 的左 Wall Inlet（h=35-40m）在 6 个高度位置上一一对应。**Auto Connect 模式** 会逐一检测这 6 对，自动续接全部 6 条总线 belt。**手接节数：0**。

如果蓝图间留间隙（中间塞 BP-BUS-FILLER），FILLER 同样有左右两面 6 个 Wall Outlet/Inlet，连续 Auto Connect 即可。

### 集群内"紧贴"的具体含义

集群内相邻蓝图在游戏世界中**直接挨着放**：center-to-center 间距 = 40m（一个 Mk2 宽度），两个蓝图边界面对齐贴合。每对相邻蓝图的对应 Wall Outlet ↔ Wall Inlet 距离 ~2m，**用 Auto Connect 模式一键续接**。集群内不需要手画 belt。

### 蓝图设计器工作流（Wall Mount + Auto Connect）

设计 BP1（铁锭）时：
1. 在右边界面（col=5）墙体上嵌入 1 个 **Conveyor Wall Outlet**（铁锭出口锚点）
2. 内部最后 1 段 belt：最后一台 smelter → 这个 Wall Outlet 的内侧端口
3. Wall Outlet 的外侧端口悬空（保存时被截断到边界面，建筑本身保留）
4. 保存

设计 BP2（铁基础）时：
1. 在左边界面（col=0）墙体上嵌入 1 个 **Conveyor Wall Inlet**（铁锭入口锚点）
2. 内部第一段 belt：这个 Wall Inlet 的内侧端口 → 第一台 plate constructor
3. 保存

放置：
1. 放置 BP1
2. 拿起 BP2 hologram，按 **R** 切到 Auto Connect 模式
3. 移动到 BP1 右侧紧贴位置，hologram 显示自动连接预览（绿色 virtual belt 标识）
4. 确认放下 → BP2 自动续接到 BP1 的 Wall Outlet → 完成

**预期手接节数：0**

## 蓝图详细规格（13 个生产蓝图 + 1 终端 + 0-1 filler = 14-15 个唯一蓝图）

### 通用约定（所有生产蓝图共享）

- **总线层（35-40m，5m 厚）**：6 条 Mk4 belt（B1, B2, B3, B4, B5, B6 备用）东西向贯穿
  - 左 Wall Inlet（col=0 边界面，6 个高度位置）：接前一个蓝图的 6 条 belt
  - 右 Wall Outlet（col=5 边界面，6 个高度位置）：接下一个蓝图
  - 内置 smart splitter / programmable splitter：从总线 belt 上 tap 出本蓝图需要的物料
  - 内置 merger：把本蓝图的产物注入对应总线 belt
  - 内置 conveyor-lift-bot：从总线层下到机器层
- **机器层（0-35m）**：按各蓝图的产线分层布置（多层堆叠时含 4m 地基）
- **集群内部直连**：高流量物料（如铁锭、铁棒、铜锭）走集群内 lift / 短 belt 直连，不上总线（不在屋顶总线层）

#### 机器净高（按 src/core/registry.ts 实际数据）

| 机器 | 净高(m) | 1F 占高 | 2F+ 占高（含 4m 地基）| 0-35m 内最多层数 |
|---|---:|---:|---:|---:|
| smelter | 10 | 10 | 14 | **2 层**（10+14=24m） |
| foundry | 9 | 9 | 13 | **3 层**（9+13+13=35m，刚好满）|
| constructor | 8 | 8 | 12 | **3 层**（8+12+12=32m）|
| assembler | 8 | 8 | 12 | **3 层**（8+12+12=32m）|
| manufacturer | 12 | 12 | 16 | **2 层**（12+16=28m）|
| refinery | 31 | 31 | — | **1 层**（31m，剩 4m 给屋顶下走线）|
| blender | 16 | 16 | 20 | **1 层**（2 层 = 36m，超 35m 1m，Tier 6 plan 无 blender 不影响）|

> 公式：1F 占高 = 机器净高（assume 顶面 0 余量）；2F+ 占高 = 4m 地基 + 机器净高。



### BP1: 铁锭

- **集群**: C1
- **机器**: 9 smelter（铁锭配方）
- **超频**: 226.11% × 9 台
- **产能**: 610.5/min 铁锭
- **机器层 (0-35m)**:
  - 1F (0-10m): 5 smelter（6m 宽 × 9m 长，5 台一字排 30m 宽，行距 30m）
  - 2F (14-24m, 4m 地基 10-14): 4 smelter
- **屋顶总线层 (35-40m)**: 6 条 belt 直通；本蓝图不取/不注总线
- **输入**: 铁矿石 610.5/min（**矿场直接喂，不上总线**）
- **集群内部输出**: 铁锭 610/min → 通过侧墙 Wall Outlet（机器层 24m 高度）直连 BP2 的 Wall Inlet（**集群内部短 belt，不上总线**）
- **总线接入**: 无

### BP2: 铁板 + 铁棒 + 强化铁板

- **集群**: C1
- **机器**: 4 plate constructor + 11 rod constructor + 3 RIP assembler = **18 台**
- **超频**:
  - 铁板 4 × 216.25%
  - 铁棒 11 × 230.91%
  - RIP 3 × 170.0%
- **产能**: 铁板 173/min · 铁棒 381/min · RIP 25.5/min
- **机器层 (0-35m)**:
  - 1F (0-8m): 4 plate + 5 rod = 9 constructor
  - 2F (12-20m, 4m 地基 8-12): 6 rod constructor
  - 3F (24-32m, 4m 地基 20-24): 3 RIP assembler（assembler 8m × 10m × 15m，3 台 30m × 15m）
- **屋顶总线层 (35-40m)**:
  - 自带 merger 把 RIP 和 铁棒 注入 B2
  - 自带 lift-top 把 铁棒/RIP 从机器层送上来
- **输入**: 铁锭 640/min（**集群内部短 belt** ← BP1 的 Wall Outlet）
- **输出**:
  - 铁板 → 内部消费给 RIP（153/min）+ 屋顶总线 B5 终端（20/min mainNode）
  - 铁棒 → 集群内部 BP3 螺丝（224/min）+ 屋顶总线 B2（140/min 给 C6 转子+模框）+ 屋顶总线 B5 终端（15/min mainNode）
  - 强化铁板 → 屋顶总线 B2（18/min 给 C6 BP13 模框 + 2.5/min 给 BP15 晶振）+ 屋顶总线 B5 终端（5/min mainNode）
- **屋顶总线接入**: 输出 B2（铁棒 140 + RIP 20.5）+ 输出 B5（铁板 20 + 铁棒 15 + RIP 5）

### BP3: 螺丝双线

- **集群**: C1
- **机器**: 9 screw constructor
- **超频**: 240.56% × 9 台
- **产能**: 866/min 螺丝
- **机器层 (0-35m)**:
  - 1F (0-8m): 5 constructor
  - 2F (12-20m, 4m 地基 8-12): 4 constructor
- **屋顶总线层 (35-40m)**:
  - 自带 merger 把 螺丝 注入 B1（350/min）和 B2（240/min）
  - 自带 lift-top 从机器层向上送料
- **输入**: 铁棒 216.5/min（**集群内部短 belt** ← BP2 的 Wall Outlet，等于 866 螺丝产能 ÷ 4 = 216.5）
- **输出**:
  - 螺丝 → 集群内部回流给 BP2 RIP（276/min，C1 内部）
  - 螺丝 → 屋顶总线 B1（350/min 给 C6 BP12 转子）
  - 螺丝 → 屋顶总线 B2（240/min 给 C6 BP14 HMF）
  - 总产 866 = 276（回流 BP2）+ 350（→B1）+ 240（→B2）✓
- **屋顶总线接入**: 输出 B1（螺丝 350）+ 输出 B2（螺丝 240）

### BP4: 钢锭

- **集群**: C2
- **机器**: 5 foundry（钢锭配方）
- **超频**: 202% × 5 台
- **产能**: 455/min 钢锭
- **机器层 (0-35m)**:
  - 1F (0-9m): 3 foundry（foundry 8m × 9m，3 台一行 24m × 9m）
  - 2F (13-22m, 4m 地基 9-13): 2 foundry
- **屋顶总线层 (35-40m)**: 6 条 belt 直通；本蓝图不取/不注总线
- **输入**:
  - 铁矿石 410/min（**矿场直接喂，不上总线**）
  - 煤 410/min（**矿场直接喂，不上总线**）
- **集群内部输出**: 钢锭 455/min → 通过侧墙 Wall Outlet 直连 BP5（**集群内部短 belt**）
- **总线接入**: 无

### BP5: 钢梁 + 钢管

- **集群**: C2
- **机器**: 2 钢梁 + 3 钢管 constructor = **5 台**
- **超频**: 钢梁 2 × 210% / 钢管 3 × 225%
- **产能**: 钢梁 63/min · 钢管 135/min
- **机器层 (0-35m)**: 1F (0-8m) 5 constructor 一字排开
- **屋顶总线层 (35-40m)**: 自带 merger 把 钢梁 + 钢管 注入 B3 和 B5
- **输入**: 钢锭 455/min（**集群内部短 belt** ← BP4 的 Wall Outlet）
- **输出**:
  - 钢梁 → 屋顶总线 B3（48/min 给 C6 BP13 包裹工业梁）+ B5 终端（15/min mainNode）
  - 钢管 → 屋顶总线 B3（45 给 BP12 定子 + 40 给 BP14 HMF + 30 给 BP11 SAM波动器 = 115/min 总）+ B5 终端（20/min mainNode）
- **屋顶总线接入**: 输出 B3（钢梁 48 + 钢管 115 = 163）+ 输出 B5（钢梁 15 + 钢管 20 = 35）

### BP6: 铜锭 + 铜金锭

- **集群**: C3
- **机器**: 5 铜锭 smelter + 2 铜金锭 smelter = **7 台**
- **超频**: 铜锭 5 × 217.67% / 铜金锭 2 × 246.67%
- **产能**: 铜锭 326.5/min · 铜金锭 74/min
- **机器层 (0-35m)**:
  - smelter 6m 宽 × 9m 长 × 10m 高
  - 1F (0-10m): 4 smelter（3 铜锭 + 1 铜金锭）一字排
  - 2F (14-24m, 4m 地基 10-14): 3 smelter（2 铜锭 + 1 铜金锭）
- **屋顶总线层 (35-40m)**:
  - 自带 merger 把 铜金锭 注入 B6（74/min 给 BP10 快速线）
- **输入**:
  - 铜矿石 326.5/min（**矿场直接喂**）
  - 铜金矿石 222/min（**矿场直接喂**，74 × 3 = 222 因为铜金锭配方是 3 ore → 1 ingot）
- **输出**:
  - 铜锭 326.5/min → 集群内部 BP7（**集群内部短 belt**）
  - 铜金锭 74/min → 屋顶总线 B6（→ BP10 给快速线产线，74/min 全部）
  - 注：铜金锭不再是 mainNode 输出（之前是，但现在快速线 100% 消耗，无外部余量）
- **屋顶总线接入**: 输出 B6（铜金锭 74）

### BP7: 铜板 + 电线 + 线缆

- **集群**: C3
- **机器**: 3 铜板 + 6 电线 + 2 线缆 constructor = **11 台**
- **超频**: 铜板 3 × 208.33% / 电线 6 × 223.89% / 线缆 2 × 169.17%
- **产能**: 铜板 62.5/min · 电线 403/min · 线缆 101.5/min
- **机器层 (0-35m)**:
  - constructor 8m × 10m × 8m
  - 1F (0-8m): 6 constructor（6 × 8m wide arr in 2 行 24m × 20m，or 1 行 48m... 紧凑布局推荐 2×3 grid）
  - 2F (12-20m, 4m 地基 8-12): 5 constructor（5 × 8m = 40m，1 行）
- **屋顶总线层 (35-40m)**:
  - 自带 merger 把 电线 注入 B3，线缆 注入 B4
  - 自带 merger 把 铜板/电线/线缆 mainNode 量注入 B5
- **输入**:
  - 铜锭 326.5/min（**集群内部短 belt** ← BP6）
  - 电线 203/min（BP7 内部回流给线缆，2 × 169.17% × 60 = 203 wire/min 输入）
- **输出**:
  - 铜板 → 集群内部 BP8 电路板（27.5/min）+ 屋顶总线 B6（25/min 给 BP10 AI 限制器）+ B5 终端（10/min mainNode）
  - 电线 → BP7 内部线缆（203/min）+ 屋顶总线 B3（120 给 BP12 定子 + 50 给 BP11 SAM波动器 = 170/min）+ B5 终端（30/min mainNode）
  - 线缆 → 屋顶总线 B4（14 给 BP15 晶振 + 20 给 BP14 电脑 + 37.5 给 BP15 HSC = 71.5/min）+ B5 终端（30/min mainNode）
- **屋顶总线接入**: 输出 B3（电线 170）+ 输出 B4（线缆 71.5）+ 输出 B6（铜板 25）+ 输出 B5（铜板 10 + 电线 30 + 线缆 30 = 70）

### BP8: 电路板

- **集群**: C3
- **机器**: 1 电路板 assembler
- **超频**: 1 × 183.33%
- **产能**: 电路板 13.75/min
- **机器层 (0-35m)**: 1F (0-8m) 1 assembler（10m × 15m，留 25m × 25m 空间。蓝图较稀疏，但 BP8 单独一栋有助 C3 集群边界清晰，留下后期扩展空间）
- **屋顶总线层 (35-40m)**:
  - 自带 smart splitter 从 B4 取 塑料（55/min）
  - 自带 lift-bot 把 塑料 送下到 assembler
  - 自带 lift-top 把 电路板 送上来
  - 自带 merger 注入 B4（电路板 13.75/min：10 给 BP14 + 3.75 给 BP15）
- **输入**: 铜板 27.5/min（**集群内部短 belt** ← BP7）+ 塑料 55/min（**屋顶总线 B4** ← C4 BP9）
- **输出**: 电路板 13.75/min → 屋顶总线 B4（10/min 给 BP14 电脑 + 3.75/min 给 BP15 高速连接器）
- **屋顶总线接入**: 输入 B4（塑料 55）+ 输出 B4（电路板 13.75）

> **AI 限制器去哪了？** 移到了 BP10（C5）。原因：AI 限制器吃 100/min 快速线，快速线在 BP10 产，把 AI 限制器放 BP10 内部直连可省一条总线 belt（如果放 BP8 反向跨集群运 100 快速线很费事，bus 是单向的）。

### BP9: 塑料 + 橡胶

- **集群**: C4
- **机器**: 3 塑料 refinery + 1 橡胶 refinery = **4 refinery**
- **超频**: 塑料 3 × 191.67% / 橡胶 1 × 100%
- **产能**: 塑料 115/min · 橡胶 20/min · 重油残渣 ~78/min（副产品）
- **机器层 (0-35m)**:
  - 1F (0-31m): 4 refinery（refinery **31m 高** × 10m 宽 × 20m 长；4 台并排 40m 宽 × 20m 长，刚好满 1 行）
  - **关键约束**：refinery 占高 31m，机器层顶 31m，离屋顶总线（35m）只有 4m 空间。lift-top（成品上送）和 lift-bot（原油 + 重油残渣 上送）都要挤在这 4m 内
- **屋顶总线层 (35-40m)**:
  - 自带 merger 把 塑料 注入 B4（95/min：55 给 BP8 + 40 给 BP14）和 B5 mainNode（20/min）
  - 自带 merger 把 橡胶 注入 B5 mainNode（20/min）
  - 自带 merger 把 **重油残渣 注入 B6（78/min 给 BP-TERM-B 集中 sink 回收）**
- **输入**: 原油 172.5/min（**油田直接喂**）+ 水（refinery 内部循环不需要外部输入）
- **输出**:
  - 塑料 115/min → 屋顶总线 B4（55 给 BP8 + 40 给 BP14 = 95/min）+ B5 终端（20/min mainNode）
  - 橡胶 20/min → 屋顶总线 B5 终端（20/min mainNode；Tier 6 plan 中橡胶无内部消费）
  - 重油残渣 78/min → 屋顶总线 B6（→ BP-TERM-B 统一 sink 回收）
- **屋顶总线接入**: 输出 B4（塑料 95）+ 输出 B5（塑料 20 + 橡胶 20 = 40）+ 输出 B6（重油残渣 78）

> **重油残渣处理改为统一回收**：方案默认走 B6 集中到 BP-TERM-B sink，**BP9 内部不再含 awesome-sink**（释放 BP9 1F 4×4m 空间，集中废料管理）。
>
> **后期升级 residual-fuel 路径**：想消化 78/min 残渣转为燃料发电时，在 C4 旁加 1 个 "BP9b 残渣→燃料" 蓝图（约 1.3 台 residual-fuel refinery），从 B6 上的 BP9→BP10 段拦截残渣 78/min，发电 ~1,300 MW（几乎覆盖整厂 1,907 MW），无需拆 BP9 主蓝图。

### BP10: 石英晶体 + 硅土 + 快速线 + 混凝土 + AI 限制器

- **集群**: C5
- **机器**: 1 石英晶体 + 1 硅土 + 3 快速线 + 3 混凝土 constructor + 1 AI 限制器 assembler = **9 台**
- **超频**:
  - 石英晶体 1 × 180% / 硅土 1 × 100% / 快速线 3 × 205.56% / 混凝土 3 × 246.67%
  - AI 限制器 1 × 100%
- **产能**: 石英晶体 40.5/min · 硅土 37.5/min · 快速线 370/min · 混凝土 111/min · AI 限制器 5/min
- **机器层 (0-35m)**:
  - 1F (0-8m): 8 constructor 排布（2 行：1 石英 + 1 硅土 + 3 快速线 = 5 一行；3 混凝土 一行）+ 1 assembler（AI 限制器 10×15m，与 constructor 错开布置）
  - 注：8 constructor 共 64m² 占地（每台 80m²，共 640m²） + 1 assembler 150m² ≈ 790m²，1F 1600m² 装下
- **屋顶总线层 (35-40m)**:
  - 自带 smart splitter 从 B6 取 铜金锭 74/min（→ 3 快速线 constructor）
  - 自带 merger 注入 B6：快速线 210/min（给 BP15 HSC）+ 石英晶体 18/min（给 BP15 晶振）
  - 自带 merger 注入 B4：混凝土 96/min（给 BP13 包裹）
  - 自带 merger 注入 B5：mainNode 量 = 石英晶体 22.5 + 硅土 37.5 + 快速线 60 + 混凝土 15 + AI 限制器 5 = 140/min
- **输入**:
  - 原始石英 78/min（**矿场喂**，40.5/min 给石英晶体 + 37.5/min 给硅土）
  - 铜金锭 74/min（**屋顶总线 B6** ← BP6）
  - 石灰石 333/min（**矿场喂**）
  - 铜板 25/min（**屋顶总线 B6 反向 不可行 → 改用 B4 反向也不可行 → 用集群内**...）
  - **修正：铜板 25/min 给 AI 限制器，需要从 BP7（C3）到 BP10（C5）。从 C3 → C4 → C5 顺路，加到 B4 或 B6**
- **输出**:
  - 石英晶体 40.5/min → BP10 内部 + B6（18 给 BP15）+ B5（22.5 mainNode）
  - 硅土 37.5/min → 屋顶总线 B5（mainNode）
  - 快速线 370/min → 集群内部 AI 限制器（100/min）+ B6（210/min 给 BP15 HSC）+ B5（60/min mainNode）
  - 混凝土 111/min → B4（96 给 BP13）+ B5（15 mainNode）
  - AI 限制器 5/min → B5（mainNode）
- **屋顶总线接入**: 输入 B6（铜金锭 74）+ 输入 B4（铜板 25 反向... 修正：见下）+ 输出 B6（快速线 210 + 石英晶体 18 = 228）+ 输出 B4（混凝土 96）+ 输出 B5（140 mainNode）

> **铜板路由**：BP7（C3）→ BP10（C5），跨 C3→C4→C5。可加入 B4 或 B6（与 铜金锭 同向）。**最简方案**：在 B6 上 BP6 注入铜金锭、BP7 注入铜板（25/min），都流向 BP10。BP10 在屋顶用智能分流器分别取 74 铜金锭和 25 铜板。B6 之后段（BP10→BP15）只剩 快速线 210 + 石英晶体 18 = 228/min。

### BP11: 重生 SAM + SAM 波动器（**新增，C5 末端**）

- **集群**: C5（紧贴 BP10 之后，C5 末端）
- **机器**: 2 重生SAM constructor + 1 SAM波动器 manufacturer = **3 台**
- **超频**: 重生SAM 2 × 150% / SAM波动器 1 × 100%
- **产能**: 重生SAM 90/min · SAM波动器 10/min
- **机器层 (0-35m)**:
  - 1F (0-12m): 1 SAM波动器 manufacturer（20m × 22m，单层放下）
  - 2F (16-24m, 4m 地基 12-16): 2 重生SAM constructor（2 × 8m = 16m × 10m）
- **屋顶总线层 (35-40m)**:
  - 自带 smart splitter 从 B3 取 电线 50/min（→ SAM波动器）+ 钢管 30/min（→ SAM波动器）
  - 自带 lift-bot 把 重生SAM 90/min 从 2F 送到 1F SAM波动器（其中 60 内部消耗 + 30 上 lift-top → B5）
  - 自带 merger 把 重生SAM 30/min + SAM波动器 10/min 注入 B5（mainNode）
- **输入**:
  - SAM 矿石 360/min（**SAM 矿场直接喂**，recipe SAM×120 → 重生SAM×30，1 台 100% 用 120 SAM 出 30 重生SAM。Plan C 2 台 × 150% = 3 effective machines × 120 = 360 SAM/min ✓）
  - 电线 50/min（**屋顶总线 B3** ← BP7）
  - 钢管 30/min（**屋顶总线 B3** ← BP5）
- **输出**:
  - 重生SAM → 集群内部消费给 SAM波动器（60/min）+ 屋顶总线 B5 mainNode（30/min）
  - SAM波动器 → 屋顶总线 B5 mainNode（10/min）
- **屋顶总线接入**: 输入 B3（电线 50 + 钢管 30 = 80）+ 输出 B5（重生SAM 30 + SAM波动器 10 = 40）

> **物理位置**：BP11 紧贴 BP10 之后（C5 末端），再之后才接 C6 的 BP12。SAM 矿场直接喂入 BP11，不影响其他蓝图。

### BP12: 转子 + 定子 + 电机

- **集群**: C6
- **机器**: 2 转子 + 2 定子 + 1 电机 assembler = **5 台**
- **超频**: 转子 2 × 175.0% / 定子 2 × 150.0% / 电机 1 × 100%
- **产能**: 转子 14/min · 定子 15/min · 电机 5/min
- **机器层 (0-35m)**:
  - assembler 10m × 15m × 8m
  - 1F (0-8m): 4 assembler（2 转子 + 2 定子；2 行 × 2 台，20m 宽 × 30m 长）
  - 2F (12-20m, 4m 地基 8-12): 1 电机 assembler
- **屋顶总线层 (35-40m)**:
  - 自带 smart splitter 从 B1 取 螺丝（350/min）→ 转子
  - 自带 smart splitter 从 B2 取 铁棒（70/min）→ 转子
  - 自带 programmable splitter 从 B3 取 钢管（45）+ 电线（120）→ 定子
  - 自带 lift-bot 送上述物料下到机器层
  - 自带 merger 把 转子/定子/电机 mainNode 量注入 B5（24/min）
- **输入**:
  - 螺丝 350/min（**屋顶总线 B1** ← BP3）
  - 铁棒 70/min（**屋顶总线 B2** ← BP2）
  - 钢管 45/min（**屋顶总线 B3** ← BP5）
  - 电线 120/min（**屋顶总线 B3** ← BP7）
  - 转子 10/min + 定子 10/min（C6 BP12 内部回流给电机 assembler）
- **输出**:
  - 转子 14/min → 内部 10 给电机 + 屋顶总线 B5（4 mainNode）
  - 定子 15/min → 内部 10 给电机 + 屋顶总线 B5（5 mainNode）
  - 电机 5/min → 屋顶总线 B5（5 mainNode）
- **屋顶总线接入**: 输入 B1（螺丝 350）+ 输入 B2（铁棒 70）+ 输入 B3（钢管 45 + 电线 120）+ 输出 B5（24 mainNode）

### BP13: 模块化框架 + 包裹工业梁

- **集群**: C6
- **机器**: 3 模块化框架 + 2 包裹工业梁 assembler = **5 台**
- **超频**: 模块化框架 3 × 200.0% / 包裹工业梁 2 × 133.33%
- **产能**: 模块化框架 12/min · 包裹工业梁 16/min
- **机器层 (0-35m)**:
  - assembler 10m × 15m × 8m
  - 1F (0-8m): 3 模框 assembler（3 台一行 30m 宽 × 15m 长）
  - 2F (12-20m, 4m 地基 8-12): 2 包裹 assembler（2 台一行 20m 宽 × 15m 长）
- **屋顶总线层 (35-40m)**:
  - 自带 programmable splitter 从 B2 取 强化铁板 + 铁棒（共 90/min）
  - 自带 smart splitter 从 B3 取 钢梁（48/min）
  - 自带 smart splitter 从 B4 取 混凝土（96/min）
  - 自带 lift-bot 送下到机器层
  - 自带 merger 把 模框/包裹 mainNode 量注入 B5（8/min）
- **输入**:
  - 强化铁板 18/min（**屋顶总线 B2** ← BP2）
  - 铁棒 72/min（**屋顶总线 B2** ← BP2）
  - 钢梁 48/min（**屋顶总线 B3** ← BP5）
  - 混凝土 96/min（**屋顶总线 B4** ← BP10）
- **输出**:
  - 模块化框架 → 集群内部 BP14 HMF（10/min）+ 屋顶总线 B5（2 mainNode）
  - 包裹工业梁 → 集群内部 BP14 HMF（10/min）+ 屋顶总线 B5（6 mainNode）
- **屋顶总线接入**: 输入 B2（强化铁板 18 + 铁棒 72 = 90）+ 输入 B3（钢梁 48）+ 输入 B4（混凝土 96）+ 输出 B5（8 mainNode）

### BP14: 重型模块框架 + 电脑

- **集群**: C6
- **机器**: 1 HMF + 1 电脑 manufacturer = **2 台**
- **超频**: HMF 1 × 100% / 电脑 1 × 100%
- **产能**: HMF 2/min · 电脑 2.5/min
- **机器层 (0-35m)**:
  - manufacturer 20m × 22m × 12m
  - 1F (0-12m): 1 HMF + 1 电脑 manufacturer 并排（2 台共 40m 宽 × 22m 长，刚好满 1 层）
- **屋顶总线层 (35-40m)**:
  - 自带 smart splitter 从 B2 取 螺丝（240/min）→ HMF
  - 自带 smart splitter 从 B3 取 钢管（40/min）→ HMF
  - 自带 programmable splitter 从 B4 取 电路板（10）+ 线缆（20）+ 塑料（50）→ 电脑
  - 自带 merger 把 HMF + 电脑 mainNode 量注入 B5（4.5/min）
- **输入**（HMF）:
  - 模块化框架 10/min（**集群内部短 belt** ← BP13）
  - 包裹工业梁 10/min（**集群内部短 belt** ← BP13）
  - 钢管 40/min（**屋顶总线 B3** ← BP5）
  - 螺丝 240/min（**屋顶总线 B2** ← BP3）
- **输入**（电脑）:
  - 电路板 10/min（**屋顶总线 B4** ← BP8）
  - 线缆 20/min（**屋顶总线 B4** ← BP7）
  - 塑料 50/min（**屋顶总线 B4** ← BP9）
- **输出**:
  - HMF 2/min → 屋顶总线 B5（mainNode）
  - 电脑 2.5/min → 屋顶总线 B5（mainNode）
- **屋顶总线接入**: 输入 B2（螺丝 240）+ 输入 B3（钢管 40）+ 输入 B4（电路板 10 + 线缆 20 + 塑料 50 = 80）+ 输出 B5（4.5 mainNode）

### BP15: 晶体振荡器 + 高速连接器（**新增**）

- **集群**: C6
- **机器**: 1 晶体振荡器 manufacturer + 1 高速连接器 manufacturer = **2 台**
- **超频**: 各 1 × 100%
- **产能**: 晶体振荡器 1/min · 高速连接器 3.75/min
- **机器层 (0-35m)**:
  - manufacturer 20m × 22m × 12m
  - 1F (0-12m): 1 晶振 + 1 HSC manufacturer 并排（2 台共 40m × 22m，1 行装下）
- **屋顶总线层 (35-40m)**:
  - 自带 smart splitter 从 B6 取 快速线 210/min（→ HSC）+ 石英晶体 18/min（→ 晶振）
  - 自带 programmable splitter 从 B4 取 线缆 51.5/min（14 给晶振 + 37.5 给 HSC）+ 电路板 3.75/min（→ HSC）
  - 自带 smart splitter 从 B2 取 强化铁板 2.5/min（→ 晶振）
  - 自带 merger 注入 B5：晶振 1/min + HSC 3.75/min = 4.75 mainNode
- **输入**:
  - 强化铁板 2.5/min（**屋顶总线 B2** ← BP2）
  - 线缆 51.5/min（**屋顶总线 B4** ← BP7）
  - 电路板 3.75/min（**屋顶总线 B4** ← BP8）
  - 快速线 210/min（**屋顶总线 B6** ← BP10）
  - 石英晶体 18/min（**屋顶总线 B6** ← BP10）
- **输出**:
  - 晶体振荡器 1/min → B5（mainNode）
  - 高速连接器 3.75/min → B5（mainNode）
- **屋顶总线接入**: 输入 B2（RIP 2.5）+ 输入 B4（线缆 51.5 + 电路板 3.75 = 55.25）+ 输入 B6（快速线 210 + 石英晶体 18 = 228）+ 输出 B5（4.75 mainNode）

### BP-BUS-FILLER（按需，集群间留空隙才用）

- **机器**: 0
- **内部**:
  - 屋顶总线层（35-40m）：6 条 Mk4 belt 直通，左 Wall Inlet ↔ 右 Wall Outlet
  - 机器层（0-35m）：完全空着（仅地坪）
- **用途**: 当集群之间有空隙（如做走道、扩容预留）时填充，保持总线连续
- **预期使用**: 0-2 个（如果 14 个生产蓝图首尾紧贴，**完全不需要**）

### BP-TERM-A / BP-TERM-B: 终端汇流（mainNode 26 + 重油残渣 1 = 27 个汇流点）

- **机器**: 0 生产建筑 + 26 industrial-storage + 27 awesome-sink + 若干 splitter
- **位置**: 工厂街最末端（紧贴 BP15 之后）
- **占地评估**: 26 mainNode × (storage 5×11m + sink 4×4m + 路由间隔 ~6m) ≈ 26 × 100m² = 2,600m² + 1 残渣 sink ~50m²。单 Mk2 蓝图 1,600m² 不够，**BP-TERM 需要 2 个 Mk2 蓝图**：BP-TERM-A（前 13 mainNode）+ BP-TERM-B（后 13 mainNode + 残渣 sink）
- **每个 mainNode 的本地结构**:
  ```
   屋顶总线 B5 ──split── lift-bot ──┐
                                     ▼
                                  splitter（双输出）
                                     ├── industrial-storage（默认装满）
                                     └── awesome-sink（溢出后兜底，长期吃货赚 ticket）
  ```
- **重油残渣的本地结构（仅 BP-TERM-B）**:
  ```
   屋顶总线 B6 ──smart splitter (filter=重油残渣)── lift-bot ──→ awesome-sink（直接吃，无 storage）
  ```
- **屋顶总线层 (35-40m)**:
  - 6 条 belt 在 BP-TERM-B 末端依次终止：
    - B5（mainNode）：3 级可编程分流器树 1→3→9→27（27 输出，26 mainNode + 1 备用），跨越 BP-TERM-A 和 BP-TERM-B
    - B6：BP-TERM-B 末端拦截 重油残渣 78/min → sink
    - B1, B2, B3, B4：直通到 BP-TERM-B 右边界面悬空，作为 Tier 7+ 扩容预留
- **机器层 (0-35m)**:
  - BP-TERM-A: 13 个 storage + sink 对（前 13 mainNode）
  - BP-TERM-B: 13 个 storage + sink 对（后 13 mainNode）+ 1 个独立 sink 处理 重油残渣 78/min

## 重油残渣处理

24 mainNode 方案下 BP9 副产 重油残渣 ~78/min（4 refinery 组合产物）。**默认设计已固化为通过 B6 总线送到 BP-TERM-B sink 集中回收**。

### 默认方案：B6 总线 → BP-TERM-B sink

- BP9 屋顶把 78/min 残渣注入 B6
- B6 流量段 BP9→BP10 = 99 + 78 = 177（37% Mk4），最大段 BP10→BP15 = 306（64% Mk4）
- BP-TERM-B 屋顶 smart splitter 拦截 残渣 → 1 个独立 sink

### 备选升级：BP9b residual-fuel 自给电力

如果想消化 78/min 残渣转为电力（Tier 5 已解锁 `residual-fuel` 配方）：

| 配方 | 输入/输出 | 处理 78/min 需要 |
|---|---|---:|
| `residual-fuel`（refinery）| 60 残渣 → 40 燃料 | **2 台 refinery × ~65%**（生成 ~52/min 燃料 → ~1300 MW 发电）|
| `petroleum-coke`（refinery）| 40 残渣 → 120 石油焦 | 2 台 refinery × ~98%（生成 ~234/min 石油焦）|

**升级路径**：在 C4 旁加 1 个 **BP9b** 蓝图（2 refinery），从 B6 上的 BP9→BP10 段拦截 78/min 残渣 → 输出燃料/石油焦。BP-TERM-B 不再回收残渣（B6 段 78 流量去除）。

不必在 BP9 主蓝图内做改动，**主蓝图保持稳定**。

## 蓝图实例与坐标

| # | 蓝图 ID | 唯一/复制 | 实例数 | 集群 |
|---|---|---|---:|---|
| 1 | BP1（铁锭）| 唯一 | 1 | C1 |
| 2 | BP2（铁基础）| 唯一 | 1 | C1 |
| 3 | BP3（螺丝）| 唯一 | 1 | C1 |
| 4 | BP4（钢锭）| 唯一 | 1 | C2 |
| 5 | BP5（钢加工）| 唯一 | 1 | C2 |
| 6 | BP6（铜冶炼）| 唯一 | 1 | C3 |
| 7 | BP7（铜电线）| 唯一 | 1 | C3 |
| 8 | BP8（电路板）| 唯一 | 1 | C3 |
| 9 | BP9（油精炼）| 唯一 | 1 | C4 |
| 10 | BP10（MAM+混凝土+AI限制器）| 唯一 | 1 | C5 |
| 11 | BP11（重生SAM+SAM波动器）| 唯一 | 1 | C5 末 |
| 12 | BP12（动力装配：转子+定子+电机）| 唯一 | 1 | C6 |
| 13 | BP13（框架装配：模框+包裹工业梁）| 唯一 | 1 | C6 |
| 14 | BP14（终端制造：HMF+电脑）| 唯一 | 1 | C6 |
| 15 | BP15（晶振+高速连接器）| 唯一 | 1 | C6 |
| 16 | BP-BUS-FILLER（按需）| 复制 | 0-2 | 集群间空隙 |
| 17 | BP-TERM-A（前 13 mainNode 仓储+sink）| 唯一 | 1 | 总线尾端 |
| 18 | BP-TERM-B（后 13 mainNode 仓储+sink + 残渣 sink）| 唯一 | 1 | 总线最末 |

**唯一蓝图设计数**: **17-18 个**（15 生产 + 2 终端，可选 1 filler）
**实际放置数**: **17-19 个**（15 生产 + 2 终端 + 0-2 filler）

## 跨蓝图连接清单（Auto Connect 后）

| 连接类型 | 手接节数（无 Auto Connect） | 手接节数（Auto Connect 1.1） | 备注 |
|---|---:|---:|---|
| 蓝图屋顶总线 belt 间续接（6 belt × 15 生产蓝图 + 2 终端 = 102 对）| 102 | **0** | Auto Connect 自动 |
| 集群内蓝图侧墙短 belt（C1: BP1↔BP2 铁锭 + BP2↔BP3 铁棒 + BP3↔BP2 螺丝回流；C2: BP4↔BP5 钢锭；C3: BP6↔BP7 铜锭 + BP7↔BP8 铜板；C5: BP10↔BP11（无 集群内 belt，BP11 自有 SAM 矿场喂入）；C6: BP13↔BP14 模框 + 包裹）| ~10 | **0** | Auto Connect 自动 |
| 矿场 → 集群（铁矿×3 / 铜矿 / 铜金矿 / 煤 / 原始石英 / 石灰石 / 原油 / **SAM**）| 10 | **10** | 矿场不是蓝图，仍需手接 |
| BP-TERM 内部 26 路分流到仓储 | 26 | **0** | 在 BP-TERM 蓝图内部，已包含在蓝图设计 |
| **合计** | **~148 节** | **10 节** | Auto Connect 把工作量降低 ~93% |

## 实施分阶段

### 阶段 1：核心铁链（C1）

1. BP1 铁锭 → BP2 铁基础 → BP3 螺丝
2. 验证 C1 内部物料流通（铁矿→铁锭→铁板/铁棒/螺丝/RIP）
3. 接入矿场（铁矿石 2 belt）

### 阶段 2：钢链（C2）+ 铜电（C3）

4. BP4 钢锭 → BP5 钢加工
5. BP6 铜锭 → BP7 铜电线 → BP8 电路板
6. 矿场接入（钢需要的铁矿石 + 煤；铜需要的铜矿+铜金矿）

### 阶段 3：油+MAM（C4 + C5）

7. BP9 油精炼（接油田）
8. BP10 MAM + 混凝土（接原始石英、石灰石；从 C3 取铜金锭）

### 阶段 4：装配 + 终端（C5 末 + C6）

9. BP11 SAM 链（C5 末，2 重生SAM + 1 SAM波动器）+ 接 SAM 矿场（360/min）
10. BP12 动力装配 → BP13 框架装配 → BP14 终端制造 → BP15 晶振+HSC
11. 15 个生产蓝图 + BP-TERM-A/B 全部首尾紧贴（**Auto Connect 自动续接屋顶 6 条总线 belt + 集群内侧墙短 belt**）
12. 验证总线 B1/B2/B3/B4/B5/B6 流量符合预期

### 阶段 5：验证与电力

13. 计算总耗电（26 mainNode 方案 C 数据 **~1,907 MW**，方案 A 约 1,565 MW；Tier 6 没有 particle-accelerator/quantum-encoder/converter 等高耗电建筑，整体功耗远低于 Tier 9 的 20+ GW 量级）
14. 部署 231 个电力碎片到对应超频机器
14. 副产品 重油残渣已自动通过 B6 集中到 BP-TERM-B sink（已固化在蓝图设计内）
15. （可选）如果验证发现集群间空隙，放置 BP-BUS-FILLER 填充总线连续性

## 验收标准

- 95 台机器全部部署且时钟值匹配方案 C 计算结果
- 所有 26 个 mainNode 在 BP-TERM-A/B 仓储有可见的稳定输入流
- SAM 矿场 360/min 持续供应 BP11
- 总线 B1/B2/B3/B4/B5/B6 在长期运行下不出现满载/卡顿（B2 83% 利用是当前最紧 belt）
- 副产品 重油残渣 通过 B6 总线集中到 BP-TERM-B 单独 sink 回收（默认废弃；可选升级为 BP9b residual-fuel 自给电力）
- 工厂启动 30 分钟后达到稳态产能

## 已知风险与应对

| 风险 | 应对 |
|---|---|
| **B2 belt 83% 满载启动卡顿** | 启动期按 BP3 螺丝→C6 装配的顺序逐步通气；如仍卡，新增 B7 belt 单独承载螺丝 240（B2 留铁棒 142 + RIP 18）|
| **铁矿石 1140/min 矿场不足** | 需 5-6 个 Mk3 采矿机覆盖（or 等价配置）；矿点紧张时部分用打包模式 |
| **混凝土 96/min 跨集群运输**（C5 → C6 BP13）| 距离较远，B4 总线承担；如 B4 拥堵可改为 BP13 旁直接放第 4 台混凝土 constructor |
| **电力 ~1,907 MW 供应** | 燃煤 75 MW × ~26 台 = ~2 GW，或 燃料发电 250 MW × ~8 台 = 2 GW。也可用核电站（2,500 MW × 1）单台覆盖。如启用 BP9b 升级方案（2 台 residual-fuel + 燃料发电）可自给 ~1300 MW，几乎覆盖整厂 |
| **Tier 7+ 升级路径** | B6 现已用于 MAM 链；后期可加 B6 belt 容纳铝链/超级计算机/RCU；铝链可作为新集群 C7 接入总线 |

## 与现有 megabase-v3 的差异

| 项 | megabase-v3 | 本设计 |
|---|---|---|
| 蓝图规格 | 4×4=Mk1（32m）| **5×5=Mk2（40m）** |
| 楼层 | 15 层（每层 1 个 mainNode 或物流）| **集群 + 总线，无强制楼层** |
| 物流 | 11F-15F 5 层汇流树 | **5 条 Mk4 总线 + 智能分流器** |
| 主输出 | 1/min 全部 | **该产物 1 台 100% 满载产能** |
| 时钟 | 100% | **超频 ≤250%（Plan C）** |
| 机器数 | 27（仅 15 mainNode 子集）| **95（26 mainNode 子集，含 MAM Caterium/Quartz/Alien Tech 解锁）** |
| Tier 6 限制 | 未明确 | **明确 ≤Mk4 belt** |

## 文件交付物

实施完成后需要的工件：

- `data/schemes/tier6-cluster-c1-iron.json`（C1 铁系，BP1-BP3 = 3 个蓝图）
- `data/schemes/tier6-cluster-c2-steel.json`（C2 钢系，BP4-BP5 = 2 个）
- `data/schemes/tier6-cluster-c3-copper.json`（C3 铜电，BP6-BP8 = 3 个）
- `data/schemes/tier6-cluster-c4-oil.json`（C4 油精炼，BP9 = 1 个）
- `data/schemes/tier6-cluster-c5-mam.json`（C5 MAM+混凝土+SAM，BP10 + BP11 = 2 个）
- `data/schemes/tier6-cluster-c6-assembly.json`（C6 装配+终端，BP12-BP15 = 4 个）
- `data/schemes/tier6-bus-filler.json`（BP-BUS-FILLER 空填充段，按需）
- `data/schemes/tier6-terminal-a.json`（BP-TERM-A 前 13 mainNode 仓储+sink）
- `data/schemes/tier6-terminal-b.json`（BP-TERM-B 后 13 mainNode 仓储+sink + 残渣 sink）
- `data/schemes/tier6-megabase.json`（汇总，引用以上）
- `scripts/validate-tier6-megabase.ts`（验证脚本，0 error）
