# BP11 重生 SAM + SAM 波动器 (C5 末)

## 概要

- **集群**: C5 末端（紧贴 BP10b 之后；C5 最后一个蓝图）
- **规格**: Mk2 单实例
- **机器**: **3 台一次物理建造到位**（2 reanimated-sam constructor + 1 sam-fluctuator manufacturer）
- **激活时间线**: T6 = T7 = T8 = T9 = **3 台全通电**（uplift 1.0x — 整厂唯一 T6 就满载的蓝图）
- **产能 T6**: 重生 SAM 90/min · SAM 波动器 10/min

> **核心设计原则**：3 台 T6 已全部物理建造且全部通电；T7-T9 不增加机器、不变 shard、不需要 Power Switch 分网（属于 BP01 统一模式的退化情形：所有机器一次到位 + 全部通电）。

## 极简示意图

```floorstack
# BP11 重生 SAM + SAM 波动器 (C5 末) · Mk2 · 自下而上
1F | 制造器×1（SAM 波动器） | 重生 SAM 60·电线 50·钢管 30 | SAM 波动器 10/min → 屋顶 | ↑屋顶:SAM 波动器
2F | 建造机×2（重生 SAM） | SAM 矿石 360 | 重生 SAM 90/min（60 下送·30 上屋顶） | ↓1F:重生 SAM 60
屋顶 | 总线取料注产物 | 电线 50·钢管 30 | 重生 SAM 30·SAM 波动器 10 → 总线 |
```

> 全厂唯一 T6 即满载蓝图（无 Power Switch 分网）；2F 建造机产 90/min 重生 SAM，60 下送 1F、30 上屋顶注 B5；电线+钢管从屋顶下行喂 1F 制造器；SAM 波动器上行注 B5。
