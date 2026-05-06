# BP15 晶体振荡器 + 高速连接器 (C6)

## 概要

- **集群**: C6 装配（紧贴 BP14 之后，C6 末端，整厂最后生产蓝图）
- **规格**: Mk2 **2 实例**（BP15a + BP15b，每实例 1 manufacturer）
- **机器**: 1 晶振 + 1 HSC manufacturer（T6）→ T9 满载 4+2=6
- **激活时间线**: T6 1+1=2 → T7 2+1=3 → T8 3+2=5 → T9 **4+2=6**
- **产能 T6**: 晶体振荡器 1/min · 高速连接器 3.75/min

## 物料 I/O

| 方向 | 物料 | 流量 (T6) | 路径 |
|---|---|---|---|
| **晶振 输入** | | | |
| 输入 | 强化铁板 | 2.5 | **屋顶 B2** ← BP2 → splitter |
| 输入 | 线缆 | 14 | **屋顶 B4** ← BP7 → splitter |
| 输入 | 石英晶体 | 18 | **屋顶 B6** ← BP10 → splitter |
| **HSC 输入** | | | |
| 输入 | 快速线 | 210 | **屋顶 B6** ← BP10 → splitter |
| 输入 | 线缆 | 37.5 | **屋顶 B4** ← BP7 → splitter |
| 输入 | 电路板 | 3.75 | **屋顶 B4** ← BP8 → splitter |
| **输出** | | | |
| 输出 | 晶体振荡器 → B5 终端 | 1 | 屋顶 merger → B5 |
| 输出 | 高速连接器 → B5 终端 | 3.75 | 屋顶 merger → B5 |

**屋顶总线接入**:
- 取自 B2 (强化铁板 2.5)、B4 (线缆 14+37.5=51.5 + 电路板 3.75)、B6 (石英 18 + 快速线 210 = 228)
- 注入 B5 (1+3.75=4.75 mainNode)

> ⚠ B6 上 BP15 取 228/min，是 B6 最大段流量。

## 楼层占用

| 实例 | 1F | 2F (T7+) | 屋顶 |
|---|---|---|---|
| **BP15a** | 1 晶振 manufacturer | T7+ +1 晶振 | 多 splitter/merger |
| **BP15b** | 1 HSC manufacturer | T7+ +1 HSC | 同 BP15a |

## 俯视图（1F BP15a, 0-12m）

```
       col=0   col=1   col=2   col=3   col=4   col=5
      ┌──────┬──────┬──────┬──────┬──────┐
r=0   │ ┌──────────────────────────────┐ │  1 晶振 manufacturer
      │ │ Crystal-Oscillator manufact. │ │  20m × 22m × 12m
r=1   │ │  4-input front (south)       │ │  facing=north
      │ │  1-output back (north)       │ │
r=2   │ │  ↑ ↑ ↑ . (in 0-2, in-3 空)   │ │
      │ │                              │ │  晶振配方 3 输入：RIP+线缆+石英
r=2.75│ │  out-0 ↓                     │ │
      │ └──────────────────────────────┘ │
      ├──────┼──────┼──────┼──────┼──────┤
r=3   │ ===collect mainNode lift─────── │
      └──────┴──────┴──────┴──────┴──────┘
```

## 屋顶总线层（35-40m）

```
B1 ═════════════════════════════════════════> B1 余
B2 ═══[smart split (filter=RIP 2.5)──2.5┐]═> B2 余
B3 ═════════════════════════════════════════> B3 余
B4 ═══[programmable split (Cab51.5+CB3.75)─55.25┐]═> B4 余
B5 ═══[merger ←──晶振 1 + HSC 3.75 lift]═══> B5 (+4.75)
B6 ═══[smart split (filter=石英18+快速线210)─228┐]═> B6 余 (-228)
```

- 屋顶 3 个 splitter（B2/B4/B6）
- 屋顶 1 个 merger（注 B5）
- 7 路 lift-bot（7 物料分别下 BP15a 晶振 / BP15b HSC）
- 2 路 lift-top（晶振 + HSC mainNode 上行）

## 建造步骤（BP15a 晶振，BP15b HSC 类似）

1. **1F (0-12m)**: 1 台晶振 manufacturer，facing=north
2. **晶振 3 路输入**（4 槽中 3 用）:
   - 强化铁板 2.5：屋顶 B2 splitter → lift-bot → in-0
   - 线缆 14：屋顶 B4 splitter → lift-bot → in-1
   - 石英晶体 18：屋顶 B6 splitter → lift-bot → in-2
   - in-3 空（配方只有 3 输入）
3. **晶振输出**: 1/min → lift-out-top → 屋顶 merger 注 B5
4. **1F→2F (T7+)**: 4m 地基；2F 第 2 台晶振
5. **屋顶 (35-40m)**: 6 belt 直通 + 3 splitter + 1 merger
6. **Power Switch**: 单实例 T6 全开（1 台）；T7+ 启 2F

## 建造步骤（BP15b HSC）

1. **1F (0-12m)**: 1 台 HSC manufacturer，facing=north
2. **HSC 3 路输入**（4 槽中 3 用）:
   - 快速线 210：屋顶 B6 splitter → lift-bot → in-0
   - 线缆 37.5：屋顶 B4 splitter → lift-bot → in-1
   - 电路板 3.75：屋顶 B4 splitter → lift-bot → in-2
   - in-3 空
3. **HSC 输出**: 3.75/min → lift-out-top → 屋顶 merger 注 B5

## 关键约束：B6 流量分配

B6 流入 BP15 共 228（石英 18 + 快速线 210），是 B6 最大段。
- BP10 注入 B6: 铜金锭 74 + 铜板 25 → 99，被 BP10 自身取走（fix：BP10 取 99 后 = 0）
- BP10 注入 B6: 石英 18 + 快速线 210 = 228（**新源**）+ 重油残渣 78（来自 BP9）= 306
- BP15 取走 228，剩 78（残渣）→ BP-TERM-B sink

> 所以 B6 BP10 → BP15 段 = 306（最大段，64% Mk4）；BP15 → BP-TERM 段 = 78。

## Tier 7+ 扩容点

| Tier | 晶振/HSC | BP15a/b 实例 |
|---|---|---|
| T6 | 1/1 | a 1晶振, b 1HSC |
| T7 | 2/1 | a 2 晶振 (1F+2F), b 1 HSC |
| T8 | 3/2 | a 2 晶振 + 1 (BP15c?) , b 2 HSC |
| T9 | 4/2 | 4 晶振 + 2 HSC = 6 → 需要 3-4 实例（BP15a/b/c/d）|

> ⚠ T9 4 晶振 + 2 HSC = 6 manufacturer，单实例 1F+2F = 2 台 manufacturer 上限 → **T9 时需 3 实例**（BP15a + b + c），其中 a/c 跑晶振各 2 台、b 跑 HSC 2 台。

## 验证

- [ ] B6 流量分段：BP10→BP15 段 ≤ 480 (Mk4)，306 ≤ 480 ✓
- [ ] B5 总流量 ~396（晶振+HSC 4.75 算入），≤ 480 ✓
- [ ] manufacturer 4 输入只用 3 个（in-3 空），lift 不能误连
- [ ] 晶振 / HSC 在不同实例（a vs b），跨实例集群内无 belt（屋顶 B5 共用）
