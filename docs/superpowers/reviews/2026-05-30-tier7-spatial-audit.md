# T7 蓝图施工手册 — 空间/物流/可建性审查报告（2026-05-30）

> 审查对象：`docs/superpowers/specs/2026-05-24-tier7-blueprint-design.md`（主设计）、`2026-05-24-tier7-blueprints/`（README + 18 个 BP）、`2026-05-24-tier7-belt-upgrade-design.md`（Mk5 重写 spec，仅参考）。
> 方法：deep-research 钉死真实游戏物理（107 agent，已对抗验证）+ CDP 抓取 satisfactory-calculator 实测建筑尺寸 + 136-agent 审查工作流逐蓝图发现并 3 票对抗验证。
> 验证结果：confirmed ~32 / adjusted ~16 / refuted ~10。本报告只列经验证成立的，并作为修订执行 checklist。

---

## §0 验证概况与数据基线

- **registry.ts 建筑尺寸全部正确**（已用 satisfactory-calculator 1.1/1.2 实验版逐项实测确认）。BP 文档沿用 registry 的尺寸是对的。
- **CLAUDE.md「机器尺寸参考」表多项错误**（与 registry/实测不符），需修正（见 §4-F）。
- belt/lift/sink 物理（registry 不含）已由 deep-research 钉死（见 §1）。

---

## §1 可信参考数据卡（修订时一律以此为准）

### 生产建筑 占地 宽W×长L×高H（米）/ 端口（registry 实测确认）
| 建筑 | W×L×H | 输入 | 输出 |
|---|---|---|---|
| Smelter 冶炼炉 | 6×9×10 | 1 back | 1 front |
| Foundry 铸造厂 | 8×9×9 | 2 back | 1 front |
| Constructor 建造机 | 8×10×8 | 1 back | 1 front |
| Assembler 组装机 | 10×15×8 | 2 back(@2.5,6.5) | 1 front(@4.5) |
| Manufacturer 制造机 | 20×22×12 | **4 在 front** | **1 在 back** |
| Refinery 炼油厂 | 10×20×31 | 1 belt+1 fluid back | 1 belt+1 fluid front |
| Blender | 19×16×16 | 2 | 2 |
| Packager | 8×8×12 | 2 | 2 |
| Particle-Accelerator | 38×24×**38** | 2 | 2 |
| Converter | 16×16×16 | 2 | 2 |
| Quantum-Encoder | 22×48×8 | 3 back | 1 front |

### 物流 / 储存
- Splitter / Merger / Smart / Programmable splitter：均 **4×4×3m**。splitter=1in3out；**merger=3in1out**（不是 4 进！）。
- **Conveyor Lift**：核心 footprint 2×2m，**实测包围盒 3.5×2m**（多出 1.5m 是进出口 bend/lip 水平外翻）；垂直高度可变 **最小 4m、最大 48m**；可独立站立；1.1 起 splitter/merger 可吸附在 lift 进口/出口/中间任意点。
- **AWESOME Sink 16×13×24m**（高 24m≈3 cell）；**1 固体输入口、0 输出**；**只吃固体不吃流体**；**无超频/无内在吞吐上限**——按入料 belt 速率吃料，单条 Mk5=780/min。
- Storage 5×10×4m（24格）；Industrial-Storage 5×10×8m（48格）。
- Pipeline Mk1/Mk2 截面 2×2m，300/600 m³/min；Pipeline Junction Cross 2×2m 四向。
- **Dim Depot Uploader：游戏内无独立建筑确证，假设 5×10×8m（参照 storage），标注「待实测」**。

### Belt 物理（关键）
- 吞吐 Mk1-6 = 60/120/270/480/**780**/1200 items/min。
- 最大坡度 35°；单段最长 56m；最小可建 ~0.5m；最小转弯半径 2m；最陡升 31m垂直/45m水平。
- **belt 不能同时转弯+爬升**：必须先转后爬（1.1 Curve 模式只做水平曲线）。两端口水平且垂直都错位时，走线必须把「转弯相」与「爬升相」分成两段、各留独立平面净空，不能斜向螺旋省空间。

---

## §2 统一布局公约（本次修订的核心设计决定，所有平面图重画一律套用）

1. **机器内缩留进料巷**：每排机器**从北墙(y=0)内缩 ≥4m（0.5 cell）**，在机器 back（输入侧）与北墙之间留出东西向「进料 manifold 巷」。manufacturer 例外（输入在 front=南，进料巷留在南侧；输出在 back=北，北侧留 ≥4m 给 output lift）。
2. **每排台数宁少一台、多一层**：每排机器数 = floor((40 − 侧向余量) / (机宽 + ~1m 间隙))，**保证机器之间与侧墙有 belt 折线净空**，不得一字排满 40m 零间隙。台数不够就加一层（4m 地基隔层）。
3. **ASCII 严格按真实长度重画**：纵向 1 行=2m，机器框高 = 真实长度÷2 行（assembler 15m→7.5 行、refinery 20m→10 行、manufacturer 22m→11 行、constructor 10m→5 行、smelter 9m→4.5 行、foundry 9m→4.5 行）。不得把长机器画短。
4. **collect belt 走机器外侧**：输出收集 belt 画在机器 front 边之外（南侧空带），不得画在机身投影内（避免 R14 穿模 / 误标 z）。
5. **lift 集中专用列、跨层分相**：垂直 lift 集中在专用 col（避开任何楼层机身投影，尤其叠层蓝图 1F 输出 lift 不得穿 2F 机身）；每条 lift 标 (col,row) 落点 + 3.5×2m 包围盒不重叠；跨层走线「先水平转弯相→再垂直爬升相」分两段，各留净空；任何 lift 垂直跨度 ≥4m。
6. **manufacturer 一律 facing=south**（输入 front 朝南、输出 back 朝北），删除「facing=north / port reversed」绕圈措辞。
7. **坐标单位统一**：平面 row/col 一律用 cell 单位（1cell=8m）且 ≤5；安装高度单独用 `z=…m` 标注；二者不混写。belt 的 row 必须与 ASCII 纵轴实际位置一致。
8. **屋顶 belt 用子 cell 间距**：6（乃至 8）条 belt 在 35-40m 同层按 row=0.25/0.75/1.25…（~4m 一条）排开，不是「6 个高度堆叠」、也不是 8m 间距。
9. **非等分分流用 programmable/smart splitter**：任何非 1:1 固定比例分配明确标注 programmable splitter + 配置规则；普通 splitter 只做均分/分叉。
10. **多路汇流用 merger 级联**：merger 3in1out，N 路汇流需 ⌈(N−1)/2⌉ 个 merger 级联，并在图上预留每个 4×4m 脚印。

---

## §3 权威决定（跨文档统一口径，消除三方打架）

| 项 | 权威值（以 BP 详情文件为准） | 需同步修正处 |
|---|---|---|
| BP6 实例 | **3 Mk2 (a/b/c)**，物理 33 smelter，T9 激活 31 | README L20、主设计 L426 |
| BP7 实例 | 3 Mk2 (a/b/c)，物理 46（一致，无需改） | — |
| BP9 实例 | **7 Mk2 (a-g)**，物理 35 refinery（T6 即全部建好；非 T9 才扩） | README L23/L168、主设计 L429 |
| BP14 实例 | **3 Mk2 (a/b/c)**，物理 6 manufacturer，T6 激活 2 | README L28、主设计 L434/L756 |
| BP15 实例 | **3 Mk2 (a/b/c)**，物理 6 manufacturer（a/c 晶振 + b HSC），T6 激活 2 | README L29、主设计 L435/L784 |
| BP2 物理 | 物理槽位 **44**（22×2），T9 激活上限 33——两个量分列，勿混 | 主设计 L422 注明 |
| 当前激活总数 | **96**（逐项求和：BP1 9+BP2 18+BP3 9+BP4 5+BP5 5+BP6 7+BP7 11+BP8 1+BP9 5+BP10 9+BP11 3+BP12 5+BP13 5+BP14 2+BP15 2=96） | 主设计 L436/L998/L1410 的 95→96 |
| Mk2 实例总数 | 按新实例数重算（生产实例约 31 个） | README L11、主设计 L436/L1268 |
| 文档标题 | 改「Tier 7 升级版（基于 T6 96 台激活规模）」 | README L1、主设计 L1 |
| AWESOME Sink 机制 | **无超频**；按入料 belt 速率，单 Mk5=780/min；BP9 234、TERM 396 均 << 780，1 sink+1 Mk5 足够 | 主设计 L824/L838/L949、BP09、BP-TERM-B |
| BP10 快速线原料 | 标准 quickwire 需 **caterium 锭**；方案须补 caterium 锭来源(74/min)；若用 Fused Quickwire 替代配方则改机型为 assembler 并重算。**决定：补 caterium 锭来源（与 BP6 铜金锭产线一致）** | BP10、主设计 §BP10、I/O 表 |

---

## §4 逐文件修订清单

> 图例：【占】=机器占位/重画平面图（套 §2 公约）；【流】=流量/容量；【数】=数字/一致性；【物】=物料/配方；【建】=可建性（lift/拐角/层高）。

### F. CLAUDE.md「机器尺寸参考」表（C:\Users\lz199\.claude\CLAUDE.md 与项目 CLAUDE.md 内同表）
- smelter 5×10→**6×9**（0.625×1.25→0.75×1.125）
- foundry 10×9→**8×9**（1.25×1.125→1.0×1.125）
- assembler 9×16→**10×15**（1.125×2.0→1.25×1.875）
- manufacturer 18×20→**20×22**（2.25×2.5→2.5×2.75）
- refinery 10×22→**10×20**（1.25×2.75→1.25×2.5）
- blender 18×16→**19×16**（2.25×2.0→2.375×2.0）
- storage 5×11→**5×10**；industrial-storage 5×11→**5×10**
- particle-accelerator 24×38→**38×24**（宽长写反；3.0×4.75→4.75×3.0）
- quantum-encoder 长 50→**48**（6.25→6.0）
- 保留 manufacturer「唯一输入在 front」「lift 行」等正确注释。

### README.md
- 【数】标题 T6→T7 口径（§3）。
- 【数】索引表实例数：BP6→3、BP9→7、BP14→3、BP15→3（§3）；满载列同步（BP6 物理 33、BP9 物理 35）。
- 【数】建造顺序 ASCII 改 BP6a/b/c、BP9a-g、BP14a/b/c、BP15a/b/c。
- 【数】Mk2 实例总数区间按新值重算。

### 主设计文档 2026-05-24-tier7-blueprint-design.md
- 【数】标题 T6→T7；95→96（L436/L998/L1410）。
- 【数】BP6/BP9/BP14/BP15 实例数与物理数（§3）；L1268 拆分清单改新命名；BP2 物理 44 vs 激活 33 分列（L422）。
- 【建/流】删除 sink 超频措辞，改「按入料 belt 速率，单 Mk5 780/min」（L824/L838/L949）。
- 【数】§BP9 机器行 L622「4 refinery」→「3 塑料+1 橡胶+1 coke=5 refinery」；删 L653「共64m²」笔误。
- 【占】§通用约定/各 BP 布局：标注「零余量满宽」需按 §2 公约（每排减 1 台/留进料巷）；§BP9 L626-627 给出 5 refinery+sink 真实排布 + 改「lift 挤 4m」误述为「lift 从地面升至 35m，31-35m 仅横向走线」。
- 【建】§通用约定 屋顶 belt row 枚举只有 5 个→改子 cell 间距覆盖 6-8 条（L382）；§Tier9 粒子加速器 38m 穿屋顶→改 Mk3（L1437）；BP21 Mk3 装 1 台 encoder（L1133）。
- 【数】§registry 待添加表 dim-depot-uploader 标「尺寸待实测」（L1421）；assembler 尺寸写法笔误统一 10×15×8（L497/L428）。
- 【物】§BP10 快速线 caterium 锭来源（§3）；「铜板」→「铜片 Copper Sheet」。

### BP01-iron-ingot
- 【数/流】T9 产能 237%↔1140 矛盾：锁 1140，超频改 **211.11%**，删 L25「@237%=1140」等式，统一 L12/25/177。
- 【流】进/出料单 Mk5 墙口 T7 即溢出（14 台=949.6>780）：左 Wall Inlet、右 Wall Outlet 各改 **2 个 Mk5 槽**（row=1.5/3.5）；溢出触发 Tier 由 T8 改 **T7**（L177/187）。
- 【数】belt row 单位混乱（h=2m vs row=2.5 vs ASCII y=12m）：按 §2-7 统一。
- 【占】1F/2F 占位本身合规（5/4 台×6m smelter），保留；补 28-35m 7m 空隙用途说明。

### BP02-iron-base
- 【占】每排 5 台 constructor 满宽零间隙 → 按 §2 每排 4 台 + 进料巷；按真实长度重画 1F/2F/3F。
- 【建】所谓「4F」螺丝贯穿 belt h=28m 落在 3F assembler(24-32m)内 → 移到 32-35m 真空档或并入屋顶层。
- 【建】螺丝 28m→3F RIP(~26m) 下行 lift 仅 ~2m<4m 建不出 → 抬到屋顶 35m 再 ≥9m 下行，或降 belt 标高使净差 ≥4m。
- 【建】铁锭左墙 h=24m 入口下沉 lift 沿 col=0 撞 2F/3F 机器 → 入口降到 h≈6m，或 col=0 全楼层留竖井。
- 【数】T9「8+10+5=23」隐含 5 台 RIP 但物理只 3 台 → 改 8+10+3=21 / BP2b 0+10+2，合计 33。
- 【流】螺丝 276 vs 138 vs 配方 306 三处不一致 → 核配方统一。铁棒自产 281 vs 381（L316）矛盾 → 统一。
- 【数】Power Switch 放 col=4.5 撞 P5/R5 占地 → 移到进料巷/lift 列。
- 【建】3F RIP 输出 belt 在 y=16 仅 1m 间隙做 R16 → belt 下移 y≥17。

### BP03-screw
- 【流】28m 前汇总单 belt：T6 全产 866>780 Mk5 已溢出 → 一开始(T6)即多槽并联，不要先合再分；把「T9 拆 3 条 Mk5」前移到建造步骤（违反「不重拉 belt」原则）。
- 【占】两排 5 台满宽 → §2 每排 4 台 + 进料巷；按真实长度重画。
- 【数】超频 240.56% vs 241%、产能两套数并存 → 统一口径。
- 【建】col=4.5 lift 井未留「先转后爬」净空 → 按 §2-5 标 (col,row)+分相。
- 【数】row 单位混乱(5.5cell=44m 越界) → §2-7。
- 【建/流】350/240 非等分用普通 splitter → 改 programmable（§2-9）。B2 流量 276/400.5 口径核对。

### BP04-steel-ingot
- 【占/建】foundry 双输入在 back(北)却贴北墙零净空、进料与出料都堆南侧 → 南移留北侧进料巷；进料 manifold 布北侧、收集 belt 布南侧（§2-1/4）。
- 【流】steel-ingot 1:1:1：输入 410/410 与输出 455 不符 → 改输入≈455(T6)/≈645(T9)；验证项 580→正确输入值（仍<780 保留 Mk5）。
- 【建】1F 收集 belt h=2m 升右墙 h=22m 跨 20m lift：标 (col,row)+包围盒+分相（§2-5）。
- 【建/占】进料 manifold（铁矿/煤 各 ≥3 splitter）未画 → 补 splitter 位置坐标。

### BP05-steel-beam-pipe
- 【占/建】行 0 5 台贴北墙零进料净空 → 南移 ≥4m + 台间留隙（§2）。
- 【数】row 单位错乱、row=5.5cell=44m **越界** → §2-7 重标。
- 【流】钢锭/beam/pipe 非等分分流用普通 splitter → programmable（§2-9）。
- 【建】col=4.5(4m 宽)塞 2 splitter+4 lift → 沿 row 错开/内移到 col=3.5（§2-5）。
- 【数】constructor 命名「B3」与总线「B3」冲突 → 机器改前缀（如 BEAM3）。
- 【建】「满载」术语澄清（210%/225%，非 250%）。
- 注：B3/B5「beam+pipe 混料总线」是设计本意，验证已否决「不能混料」误报——保留混料，下游 smart splitter 分拣即可（删 L157「不能混料」或注明下游分拣）。

### BP06-copper-smelt
- 【数】实例 2→**3 (a/b/c)**，物理 31→33（§3）。
- 【流】T9 铜矿 1500>1200 单 belt 上限 → 左 Wall Inlet 拆 2 条；铜锭 1380 同理右墙拆 2 条。
- 【数/流】T9 铜矿(1500)≠铜锭(1380) 1:1 配方矛盾 → 令 ore_in=ingot_out；铜金矿 600 vs 铜金锭 296（3:1 应 888 矿）→ 改 888 或重算台数。
- 【数】铜锭右墙高度 h=24m vs 侧墙表 h=4m 矛盾 → 统一。
- 【流】铜金锭去向冲突（B6 merger vs 右墙 Outlet）→ 单一路径。

### BP07-wire-cable
- 【建】**整栋 48m/6cell 撑破 Mk2 40m**、屋顶 40-45m 与邻居 35-40m 错位断总线 → 改 **8m/层**（1F 0-8/2F 12-20/3F 24-32 + 屋顶 35-40），所有 h= 标高重算。
- 【占】row0 5 台满宽零净空 → §2 每排 4 台 + 进料巷。
- 【建/占】constructor 输入 back(北)贴北墙、进料 splitter 在南侧 → 机器南移留北侧进料巷（§2-1）。
- 【建/流】B3 电线 T9~1400 即使 Mk6 也不够：屋顶预留 **7 条槽（B1-B6+B3b）**，给出 B3a/B3b 位置；统一「6 条」表述。
- 【建】9 路 collect belt 挤 col=4.5 → 先同层 merger 合流再上送，挪到 row2 空区（§2-5）。
- 【建】铜锭左墙 h=24m 先降后升往返 → 入口降到 h≈4-6m。
- 【数】通电矩阵（3实例×4Network×Tier）补齐口径。

### BP08-circuit-board
- 【占】4 assembler×10m=40m 满宽与「col=4 留 manifold」互斥 → §2：每层 3 台留 manifold 列，或 manifold 走南北深度方向（40m 深仅用 15m）。
- 【建】进料口在 back(北)贴 y=0 边界零净空 → 南移留北侧进料巷。
- 【建】collect belt 画在 row=8（机身 0-15m 内）穿机器 R14 → 移到 row≥16（机身南侧）。
- 【数/流】T9 219%↔流量(实为146%)矛盾 → 统一（满载 8 台@219% → board 131.4/铜片 262.8/塑料 525.6，仍<780）。
- 【数】L7 配方「4 电路板/min」与 7.5/min 基准矛盾 → 改正。
- 【数】Network 台数拼配（T7=4 vs 1+4=5）核对。

### BP09-plastic-rubber
- 【占/数】refinery 标 16m 实 20m → 按真实 20m 重画；R5 coke 按真实 20m **越界 2m** → 旋转/重排，给每台真实 10×20 + sink 16×13 的四角坐标做 AABB 校验（不能用「总面积<1600」）。
- 【物】L216 rubber 副产标「水」实为**重油残渣** → 改正，并入 R1-R4 残渣经 pipe junction 汇 R5。
- 【流/数】coke refinery 78%→**195%**(2 shard)，shard 合计 7→8；T9「690@250%」矛盾 → 统一（250% 应 1150，或目标 690 则 150%）。
- 【流/建】塑料 lift T9~150>Mk2 lift 120 → 指定 ≥Mk3；删 sink 超频措辞（§3）。
- 【建】refinery 31m→屋顶 35m 仅 4m=lift 最小值临界 → 建议屋顶抬到 36m（5m 余量）或标「实测确认 lift 贴顶」；改「lift 挤 4m」误述。
- 【物】R5 端口朝向 ASCII 标反（in-0 应北/junction 侧）。

### BP10-quartz-quickwire-concrete
- 【数】机器台数三处矛盾 → 选权威分布（qz4/si7/qw10/cn5/ai2），重写 L7+1F/2F ASCII（silica 补到 7、concrete 5、ai-limiter 2）。
- 【物】**快速线原料 caterium 锭**（§3）：补 caterium 锭来源，I/O 表加一行；「铜板」→「铜片」。
- 【占/建】row0 贴北墙无进料巷 → 南移（§2-1）。
- 【数/建】「单 splitter 喂全部 10 quickwire/2 ai」与「2 实例独立屋顶」矛盾 → 改每实例 5 quickwire+1 ai；4 merger vs ASCII 3 merger 核对；row1 收集巷 4m 太窄塞 5 belt → z 分层或加宽（§2）。

### BP11-sam
- 【建】屋顶 B3 lift-bot 落点画在 manufacturer 机身正上方撞机 → 移到 col2.5-4 空通道落地再水平绕到南侧 front。
- 【建】3 路进料从屋顶/2F 竖直 lift 下来，违反「先转后爬」→ 南侧(row22-40)补水平进料 manifold 平面、分相（§2-5）。
- 【数】manufacturer 输入行坐标三处矛盾 → 统一 front 在 row≈10-11(20-22m)；facing=south（§2-6）。
- 【数】L47 manufacturer「1600m²」错 → 440m²；2F constructor col 坐标矛盾；ASCII 22m 画成 24m。
- 【数】SAM 进料：删 600/min(T9 上限)矛盾说法，改 360/min(Mk4 belt)。

### BP12-rotor-stator-motor
- 【占】双排 assembler 按真实 15m 进深超 40m（stator 底到 y42）→ 拆两层 或重排（rotor 0-15/collect 16-19/stator 20-35），按真实长度重画（§2-3）。
- 【建】rotor/motor 输入 back(北)贴边界、进料在南侧穿 stator 行 → 南移留进料巷同侧（§2-1）。
- 【流】钢管+电线两料标走同一条 B3 一个 splitter → 拆两条总线（钢管 B3/电线 另线），屋顶 splitter/lift 改 4 个（screw/rod/pipe/wire）。
- 【数】屋顶 splitter 数 3 vs 4 矛盾 → 统一 4。
- 注：定子流量误报已否决（配方版本不确定，不强改）。

### BP13-frame-encased-beam
- 【占/建】4 assembler 贴北墙无进料净空 → 南移 ≥4-6m（机器占 row6-21），按真实 15m 重画（§2）。
- 【建】屋顶 6 lift 落点落在被满宽机器占满的北侧无处放 → 机器南移后排进料巷，标每条 lift (col,row)+包围盒。
- 【流】进料 manifold 接全 4 台但 I/O 仅够 3 台 powered；T8 开 M4 缺料 → 补 T8 输入升级(RIP24+rod96，B2 90→120)。

### BP14-hmf-computer
- 【数】实例 2→**3 (a/b/c)**（§3，本文件已是 3，确认 README/主设计同步）。
- 【建】manufacturer out-0 在 row=0(北边界)零净空 → 机器南移 0.5cell（row 起 y=4m，底 26m 仍<40）。
- 【建】**1F 输出 lift 竖直穿 2F 机身**（同 footprint 叠层）→ 1F 输出 lift 在 col/row 错开 2F 投影，或先水平引出到空 col 再竖直，画出竖井位置。
- 【数】facing=north 自相矛盾 → 统一 **facing=south**，删「port reversed」（§2-6）。
- 【数】B4 楼层归属矛盾（屋顶 vs 1F splitter）→ 统一屋顶程序分流器一处，各层一律 lift-DOWN 取料。
- 【建】左墙模框/包裹梁 Inlet row=2.5(20m) 落在机身投影内 → 下移到机身南侧 row≥2.75，南侧空地做转弯相+垂直相进 front。

### BP15-crystal-osc-hsc
- 【数】实例 2→**3 (a/b/c)**（§3，本文件已是 3，确认 README/主设计同步）。
- 【数】facing=north 自相矛盾 → 统一 **facing=south**（§2-6）。
- 【建】每实例南侧塞 3 进料 lift + 北侧 1 出料 lift，转弯/爬升相净空未证明 → 补「南侧进料区走线图」，3 路 lift 对齐 in-0/1/2 的 col、落点 row30-34、水平转弯相 row34-38、垂直爬升相直上屋顶（§2-5）。
- 【建】2F 进料从 1F manifold「lift-up 回抬」是无谓下-上往返 → 改屋顶 splitter 直接分一路 lift-bot 落 2F（35m→22m）。
- 【建】屋顶 6 belt+3 splitter+1 merger+穿层 lift 口未给坐标 → 补屋顶走线图，穿层口落 belt 轴线空隙。
- 【物/流】§关键约束**残留旧设计**「B6 携带残渣 78→TERM-B sink」→ 删除（残渣本地 sink 不上 B6，§3）。

### BP-BUS-FILLER
- 【建】「row=0.5→4.5 间距 8m」数学矛盾且越界 → 删「间距 8m」，统一「6 条均分，实际行距 6.4m」（或子 cell，§2-8）；Wall Mount row 必须严格等于邻图 row 否则 Auto Connect 失败。
- 【数】「6 个高度」措辞误导 → 改「6 个 row 位（同屋顶层）」；ASCII belt row 与建造步骤一致。

### BP-TERM-A
- 【建】「13 路 overflow 汇 1 merger」物理不可能（merger 3in1out）→ 改 **6 台 merger 级联**，给 col 位置（§2-10）。
- 【占】smart splitter 画在 Uploader 机身脚印内 R13 碰撞 → 米制重排：每排 Uploader 占 10m，其后留 ≥4m 给 splitter，节距 ≥14m。
- 【数】B5 cascade 级数 3 vs 4 矛盾 → 统一 3 级(1→3→9→27=13 splitter)；27 路比 26 mainNode 多 1 → 封堵 1 路或重新细分到 26。
- 【数】2F 槽位数 6 vs 扩容表 3 vs L170「13+3=16」矛盾 → 统一槽位数。
- 【流】T7+ overflow 汇总流量未核 → 补估算 + 指定 Mk 等级。
- 【数】Uploader 5×10×8 标「待实测」。

### BP-TERM-B
- 【占/数】共享 sink `col=3.5-5`(12m) 与实宽 16m 矛盾 → 改 **col=3-5**(16m)；sink 与 U18/U22/U26 AABB 碰撞 → sink 独占 col3-5 整列，U18/22/26 移出 col≥3。
- 【建】sink 高 24m 跨 1F+2F → 2F 全部 9 Uploader 平面限制在 col0-3(sink 外)，补 2F 俯视图核对放得下。
- 【建/数】「26 路汇 1 merger / 4 进 1 出」错 → merger 3in1out，~13 个 3 级级联，预留脚印；删 sink 超频措辞（§3）。
- 【数】B5 cascade 楼层归属（1F vs 屋顶）矛盾、路数 23/14/22 不一致 → 统一（一级屋顶 1→3→9，二级 1F →22-23 路覆盖 T6+T7 Uploader）。
- 【占】1F smart splitter 画在 Uploader 脚印内 R13 → 同 TERM-A 重排。
- 【建/流】T8/T9 硅土690/快速线1384 超单 Uploader/单 Mk5 → 并联 Uploader + 拆 belt 必须 T6 预建（否则违反「不动结构」），或走 BP-TERM-C；在核心原则加例外说明。
- 【数】Uploader 5×10×8 标「待实测」。

---

## §5 误报（已被对抗验证否决，不改）
BP01 belt z 碰撞（项目只做 2D 碰撞，无 z 检测）；BP02 lift-top 3m（实际从机器输出高度起算 ≥4m）；BP03 1F manifold 无空间（南侧深度足够）；BP05 beam/pipe 混料总线（B3/B5 设计本意混料，下游分拣）；BP06 belt row（绘图问题非碰撞）；BP10 8 belt 槽（子 cell 间距放得下）；BP11 reSAM lift（可走长 lift）；BP12 定子流量（配方版本不确定）；BP13 collect belt 尺寸；BP-TERM-A 40m 越界。

## §6 待游戏内实测（修订时标注，不臆断）
1. Conveyor Lift 进出口 bend/lip 的精确朝向与水平占位（实测包围盒 3.5×2m，方向待确认）。
2. 4m 净空内同时建 lift+吸附 splitter 是否真可建（BP09 临界）。
3. Pipeline Junction Cross 是否能 4 进 1 出 + 合流分配规则。
4. Dim Depot Uploader 实际占地（假设 5×10×8m）。

---

## §7 修订执行记录（2026-05-30）

全量修订经 3 轮 workflow（fix → 对抗验证 verify，每文件独立重算几何），**21/21 文件最终通过**：

- **R1 全量修订**（21 文件）：11 通过 — CLAUDE.md 尺寸表、README、主设计、BP01/05/06/08/09/10/12、BUS-FILLER、BP-TERM-B。
- **R2 修复轮**（10 文件）：+5 通过 — 主设计、BP02/03/14/15。
- **R3 修复轮**（5 文件）：+5 通过 — BP04/07/11/13、BP-TERM-A。
- **R4 残留清理轮**（12 文件）：清掉非阻塞项 — 数值不一致（BP04 243%→239%）、z 高度标签复制（BP07 三层改各自基面 1F≈10/2F≈22/3F≈34m）、单位混写、轴标跳格（BP-TERM-A 2F）、缺坐标（BP04/BP-TERM-A merger 坐标、BP04 splitter row）、计数说明（BP06 T8 备用 2 台）、图注示意说明等。纯 ASCII 横向字符比例不逐字符重画，统一加图注「横向为示意，真实 x 以正文坐标为准」。

核心成果：①CLAUDE.md 尺寸表 10 项纠正（与 registry 一致）；②跨文档实例数/激活总数（96）/标题/sink 机制/facing=south/caterium 配方等权威决定全文统一；③~13 张平面图按 §2 公约重画（机器内缩留进料巷、按真实长度、collect belt 走机身外、lift 各占唯一 col 不穿层、无 AABB 重叠/越界），多处附逐角 AABB 校验。

**残留非阻塞项**（不影响真实几何/可建性，待后续顺手或实测）：
- ASCII 横向字符比例（部分图 ~0.8 字符/m）与「1 字符=1m」图注不完全一致——纯绘图精度，真实 (x,y) 坐标以正文/AABB 表为准。
- BP07 三层俯视图 z 错层高度标签复制粘贴相同（应随楼层升高）——平面 R14/AABB 判定不受影响。
- lift riser 标注口径（3.5×2m 含 lip vs 纯 riser 2×2m）——两种解读下 col 均互异、无 3D 重叠。
- 个别产能/超频数值小不一致（如 BP04 T9 645/min vs 243%）——belt 容量结论不变（<780 Mk5）。
- §6 四项游戏内实测项（lift lip 朝向、4m 临界、Pipeline Junction 4进1出、Uploader 占地）。
