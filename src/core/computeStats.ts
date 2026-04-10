// src/core/computeStats.ts
//
// 方案级实际吞吐计算（Tier 2）：
//
// 输入：Scheme（machines + belts + liftPairs + recipes）
// 输出：totalPowerMW / inputs / outputs，均为"考虑供给瓶颈后的实际稳态值"
//
// 核心思想 —— 基于流量图的 DFS + 记忆化：
//   1. 每条 belt 有一个 flow 值，表示该 belt 稳态下每分钟通过量（上限 = 传送带等级容量）。
//   2. 每个生产机器有一个 rate 值 ∈ [0, clockSpeed/100]，表示实际运行比例。
//      rate = min(1, 各输入的 supplied/required 之最小值)
//   3. 流量源头：生产机器的 out 口 = recipe.output × rate
//   4. 流量拓扑变换：
//      - merger: out = sum(in_0, in_1, in_2)
//      - splitter: out_i = in / connectedOutputCount （平均分流）
//      - lift pair: 源 lift 出口流量 = 汇 lift 入口带流量（透传）
//      - storage: 透传（v2 里均为 sink，实际不会触发）
//   5. 每条边界输入带（fromPort 为空，如矿石入口）视为外部无限供给 → 等同于 belt 容量。
//
// 递归 DAG + Map 记忆化，单 pass 即可算出所有值。
//
// 已知局限（Tier 2 未处理）：
//   - 不做反向 backpressure。如果下游瓶颈使某机器实际只消耗 16 rod/min 而上游产 20，
//     "过剩的 4/min" 会以内部物料正净值的形式出现在 outputs 里。当前 v2 设计是平衡的，
//     不会触发该现象；若后续出现，再加 Tier 3 反向传播。
//
import type { BeltSegment, MachineInstance, Scheme } from './types';
import { BELT_RATES, getRecipe, type BeltMarkKey } from './recipes';

const PRODUCTION_TYPES = new Set<string>([
  'smelter', 'foundry', 'constructor', 'assembler', 'manufacturer',
]);

export interface SchemeStats {
  totalPowerMW: number;
  inputs: { material: string; rate: number }[];
  outputs: { material: string; rate: number }[];
}

const EPSILON = 1e-6;

function beltCapacity(mark: number): number {
  const key = `mk${mark}` as BeltMarkKey;
  return BELT_RATES[key] ?? Infinity;
}

function roundRate(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * 核心计算入口。
 * 实例化一个 "分析器"（闭包捕获 scheme + 记忆化 Map），然后对每个生产机器触发计算，
 * 最后聚合物料平衡和总功耗。
 */
export function computeSchemeStats(scheme: Scheme): SchemeStats {
  const analyzer = createFlowAnalyzer(scheme);

  // 触发所有生产机器的 rate 计算，同时顺带计算整条上游流图
  for (const m of scheme.machines) {
    if (PRODUCTION_TYPES.has(m.type)) {
      analyzer.machineRate(m);
    }
  }

  // 聚合物料平衡
  const balance = new Map<string, number>();
  let totalPowerMW = 0;

  for (const m of scheme.machines) {
    if (!PRODUCTION_TYPES.has(m.type)) continue;
    const recipe = getRecipe(m.recipe);
    if (!recipe) continue;

    const rate = analyzer.machineRate(m);
    if (rate <= 0) continue;

    // Satisfactory 功耗公式：P = P_base × (clock)^1.321928
    totalPowerMW += recipe.powerMW * Math.pow(rate, 1.321928);

    for (const out of recipe.outputs) {
      balance.set(out.item, (balance.get(out.item) ?? 0) + out.rate * rate);
    }
    for (const inp of recipe.inputs) {
      balance.set(inp.item, (balance.get(inp.item) ?? 0) - inp.rate * rate);
    }
  }

  const outputs: SchemeStats['outputs'] = [];
  const inputs: SchemeStats['inputs'] = [];

  for (const [material, net] of balance) {
    if (net > EPSILON) outputs.push({ material, rate: roundRate(net) });
    else if (net < -EPSILON) inputs.push({ material, rate: roundRate(-net) });
  }
  outputs.sort((a, b) => b.rate - a.rate);
  inputs.sort((a, b) => b.rate - a.rate);

  return {
    totalPowerMW: Math.round(totalPowerMW * 10) / 10,
    inputs,
    outputs,
  };
}

// ============================================================
// 流量分析器：对单个 scheme 构建索引 + 递归求解
// ============================================================

interface FlowAnalyzer {
  machineRate(machine: MachineInstance): number;
  beltFlow(belt: BeltSegment): number;
}

function createFlowAnalyzer(scheme: Scheme): FlowAnalyzer {
  const machineById = new Map(scheme.machines.map(m => [m.id, m]));
  const beltByToPort = new Map<string, BeltSegment>();
  const beltsByFromPort = new Map<string, BeltSegment[]>();

  for (const belt of scheme.belts) {
    if (belt.toPort) beltByToPort.set(belt.toPort, belt);
    if (belt.fromPort) {
      const list = beltsByFromPort.get(belt.fromPort) ?? [];
      list.push(belt);
      beltsByFromPort.set(belt.fromPort, list);
    }
  }

  // 升降机 pair 索引：给定 machine.id 快速定位它所在 pair 的另一端
  const pairByBottom = new Map(scheme.liftPairs.map(p => [p.bottomMachine, p]));
  const pairByTop = new Map(scheme.liftPairs.map(p => [p.topMachine, p]));

  const flowCache = new Map<string, number>();
  const rateCache = new Map<string, number>();
  const demandCache = new Map<string, number>();
  const computing = new Set<string>();

  /**
   * 给定一条 belt，返回它下游最终需要的流量（按设计速率）。
   * 用于分流器的"按需分配"：让 rip 拿到它需要的 30 而非均分的 20。
   *
   * 递归规则：
   * - 终点是生产消费机：返回 recipe.inputs[idx].rate × clockSpeed
   * - 终点是 merger 输入：返回 (merger 出口 demand) − (其他 merger 输入端的 beltFlow)
   *   —— 即"此路径还剩多少需求需要这个输入补上"
   * - 终点是 splitter 输入：返回该 splitter 所有输出的 demand 之和（透传）
   * - 终点是 lift 入口：透传到配对 lift 出口的下游
   * - 终点是 storage（sink）：返回 0，让 sink 只吸收 excess
   */
  function branchDemand(belt: BeltSegment): number {
    if (demandCache.has(belt.id)) return demandCache.get(belt.id)!;
    const guard = `demand:${belt.id}`;
    if (computing.has(guard)) return 0;
    computing.add(guard);

    let d = 0;
    if (belt.toPort) {
      const [mId, portId] = belt.toPort.split(':');
      const machine = machineById.get(mId);
      if (machine) d = demandAtPort(machine, portId);
    }

    computing.delete(guard);
    demandCache.set(belt.id, d);
    return d;
  }

  function demandAtPort(machine: MachineInstance, portId: string): number {
    const t = machine.type;

    if (PRODUCTION_TYPES.has(t)) {
      const recipe = getRecipe(machine.recipe);
      if (!recipe) return 0;
      const designRate = (machine.clockSpeed ?? 100) / 100;
      const idx = parseInt(portId.split('-')[1] ?? '0', 10);
      const input = recipe.inputs[idx];
      return input ? input.rate * designRate : 0;
    }

    if (t === 'merger') {
      // 合流器某一输入口的 demand = 出口 demand − 其他输入端的供给
      const outBelts = beltsByFromPort.get(`${machine.id}:out-0`) ?? [];
      const outDemand = outBelts.reduce((s, b) => s + branchDemand(b), 0);
      let otherSupply = 0;
      for (const p of ['in-0', 'in-1', 'in-2']) {
        if (p === portId) continue;
        const ob = beltByToPort.get(`${machine.id}:${p}`);
        if (ob) otherSupply += beltFlow(ob);
      }
      return Math.max(0, outDemand - otherSupply);
    }

    if (t === 'splitter') {
      // 分流器的输入 demand = 所有输出的 demand 之和
      if (portId !== 'in-0') return 0;
      let sum = 0;
      for (const p of ['out-0', 'out-1', 'out-2']) {
        const outBelts = beltsByFromPort.get(`${machine.id}:${p}`) ?? [];
        for (const b of outBelts) sum += branchDemand(b);
      }
      return sum;
    }

    if (t === 'conveyor-lift-in-bottom') {
      const pair = pairByBottom.get(machine.id);
      if (!pair) return 0;
      const topOutBelts = beltsByFromPort.get(`${pair.topMachine}:top`) ?? [];
      return topOutBelts.reduce((s, b) => s + branchDemand(b), 0);
    }
    if (t === 'conveyor-lift-in-top') {
      const pair = pairByTop.get(machine.id);
      if (!pair) return 0;
      const bottomOutBelts = beltsByFromPort.get(`${pair.bottomMachine}:bottom`) ?? [];
      return bottomOutBelts.reduce((s, b) => s + branchDemand(b), 0);
    }

    if (t === 'storage' || t === 'industrial-storage') {
      // 纯 sink：返回 0，让上游分流器只给它 excess
      return 0;
    }

    return 0;
  }

  function beltFlow(belt: BeltSegment): number {
    if (flowCache.has(belt.id)) return flowCache.get(belt.id)!;
    const guard = `belt:${belt.id}`;
    if (computing.has(guard)) return 0; // 环路保护
    computing.add(guard);

    const cap = beltCapacity(belt.mark);
    let flow = 0;

    if (!belt.fromPort) {
      // 边界输入（如矿石外部供给）：视作 belt 被外部无限源饱和
      flow = cap;
    } else {
      const [mId, portId] = belt.fromPort.split(':');
      const machine = machineById.get(mId);
      if (machine) {
        flow = producerOutputRate(machine, portId);
      }
    }

    flow = Math.min(flow, cap);
    computing.delete(guard);
    flowCache.set(belt.id, flow);
    return flow;
  }

  /** 给定一个机器的某个 output port，返回该端口每分钟流出的物料速率 */
  function producerOutputRate(machine: MachineInstance, portId: string): number {
    const t = machine.type;

    if (PRODUCTION_TYPES.has(t)) {
      const recipe = getRecipe(machine.recipe);
      if (!recipe) return 0;
      const rate = machineRate(machine);
      // 约定：recipe.outputs[i] 映射到 port "out-i"
      const idx = parseInt(portId.split('-')[1] ?? '0', 10);
      const output = recipe.outputs[idx];
      if (!output) return 0;
      return output.rate * rate;
    }

    if (t === 'merger') {
      // 合流器只有一个输出 out-0，其流量 = 三个 input 的流量之和
      if (portId !== 'out-0') return 0;
      let sum = 0;
      for (const inPort of ['in-0', 'in-1', 'in-2']) {
        const inBelt = beltByToPort.get(`${machine.id}:${inPort}`);
        if (inBelt) sum += beltFlow(inBelt);
      }
      return sum;
    }

    if (t === 'splitter') {
      // 分流器：按下游需求驱动的分配
      //  - 每条 "活跃" 输出（下游有消费者）获得其真实 demand
      //  - 储存箱等 sink 输出只获得活跃输出吃剩的 excess
      //  - 当输入不足以满足所有活跃需求时，按 demand 比例 throttle
      //
      // 注意 sp_plate_2f 场景：input=40，rip 需 30，store sink：
      //   out-0 (rip) → 30, out-1 (store) → excess 10
      // 如果用朴素 "均分" 会算出 20/20，rip 只拿 20 被迫 throttle 到 66.7%。
      const inBelt = beltByToPort.get(`${machine.id}:in-0`);
      if (!inBelt) return 0;
      const input = beltFlow(inBelt);

      // 枚举所有已连接输出及其下游需求
      type OutEntry = { portId: string; demand: number };
      const entries: OutEntry[] = [];
      for (const p of ['out-0', 'out-1', 'out-2'] as const) {
        const outBelts = beltsByFromPort.get(`${machine.id}:${p}`) ?? [];
        if (outBelts.length === 0) continue;
        // 一个端口理论上只接一条带子；累加保险
        let d = 0;
        for (const b of outBelts) d += branchDemand(b);
        entries.push({ portId: p, demand: d });
      }
      if (entries.length === 0) return 0;

      const active = entries.filter(e => e.demand > EPSILON);
      const sinks = entries.filter(e => e.demand <= EPSILON);
      const activeDemand = active.reduce((s, e) => s + e.demand, 0);

      const self = entries.find(e => e.portId === portId);
      if (!self) return 0;

      if (self.demand > EPSILON) {
        // 活跃输出
        if (input >= activeDemand - EPSILON) {
          return self.demand; // 充足：按需满配
        }
        // 不足：按需求比例摊薄
        return activeDemand > 0 ? (input * self.demand) / activeDemand : 0;
      }
      // sink 输出：只分到 excess
      if (sinks.length === 0) return 0;
      const excess = Math.max(0, input - activeDemand);
      return excess / sinks.length;
    }

    if (t === 'conveyor-lift-out-top') {
      // 向上运输 pair 的顶部出口：流量 = 底部入口 belt 的流量
      const pair = pairByTop.get(machine.id);
      if (!pair) return 0;
      const bottomInBelt = beltByToPort.get(`${pair.bottomMachine}:bottom`);
      return bottomInBelt ? beltFlow(bottomInBelt) : 0;
    }

    if (t === 'conveyor-lift-out-bottom') {
      // 向下运输 pair 的底部出口：流量 = 顶部入口 belt 的流量
      const pair = pairByBottom.get(machine.id);
      if (!pair) return 0;
      const topInBelt = beltByToPort.get(`${pair.topMachine}:top`);
      return topInBelt ? beltFlow(topInBelt) : 0;
    }

    if (t === 'storage' || t === 'industrial-storage') {
      // 储存箱透传：out-0 = in-0 的流量
      if (portId !== 'out-0' && portId !== 'out-1') return 0;
      const inPortId = portId === 'out-1' ? 'in-1' : 'in-0';
      const inBelt = beltByToPort.get(`${machine.id}:${inPortId}`);
      return inBelt ? beltFlow(inBelt) : 0;
    }

    return 0;
  }

  /**
   * 计算机器的实际运行比例。
   * 非生产机器返回 1（不适用）；生产机器根据每个输入的供给/需求比取最小。
   */
  function machineRate(machine: MachineInstance): number {
    if (rateCache.has(machine.id)) return rateCache.get(machine.id)!;
    if (!PRODUCTION_TYPES.has(machine.type)) {
      rateCache.set(machine.id, 1);
      return 1;
    }
    const guard = `rate:${machine.id}`;
    if (computing.has(guard)) return 0;
    computing.add(guard);

    const recipe = getRecipe(machine.recipe);
    if (!recipe) {
      rateCache.set(machine.id, 0);
      computing.delete(guard);
      return 0;
    }

    const designRate = (machine.clockSpeed ?? 100) / 100;
    let ratio = designRate;

    recipe.inputs.forEach((input, i) => {
      // 约定：recipe.inputs[i] 映射到 port "in-i"
      const portId = `in-${i}`;
      const belt = beltByToPort.get(`${machine.id}:${portId}`);
      let supplied: number;
      if (belt) {
        supplied = beltFlow(belt);
      } else {
        // 无连接：视作外部无限供给（矿石入口等场景）
        supplied = Infinity;
      }
      const required = input.rate * designRate;
      if (required > EPSILON && supplied < required - EPSILON) {
        // 按此输入的比例 throttle
        const inputRatio = supplied / input.rate;
        if (inputRatio < ratio) ratio = inputRatio;
      }
    });

    const finalRate = Math.max(0, ratio);
    rateCache.set(machine.id, finalRate);
    computing.delete(guard);
    return finalRate;
  }

  return { machineRate, beltFlow };
}
