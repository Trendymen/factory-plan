// src/core/validateFlow.ts
//
// 流量相关校验规则（R22, R28）
//
// 关键设计决策：
// computeBeltFlows() 返回的 flow 已经被 belt capacity 限制（capped），
// 因此不能直接用来检测溢出。本模块自行计算"上游想要给出的 uncapped flow"，
// 然后与 belt/lift capacity 比较。
//
import type { Scheme, MachineInstance, BeltSegment } from './types';
import { BELT_RATES, getRecipe, type BeltMarkKey } from './recipes';

export type Severity = 'error' | 'warn';

export interface FlowValidationIssue {
  severity: Severity;
  rule: string;
  message: string;
  elementId?: string;
}

const PRODUCTION_TYPES = new Set<string>([
  'smelter', 'foundry', 'constructor', 'assembler', 'manufacturer',
]);

function beltCapacity(mark: number): number {
  const key = `mk${mark}` as BeltMarkKey;
  return BELT_RATES[key] ?? Infinity;
}

function roundRate(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * 计算每条 belt 的 "uncapped supply"（上游端口想给出的流量，不受 belt 自身容量限制）。
 * 这样可以检测 belt 容量是否不足。
 */
function computeUncappedFlows(scheme: Scheme): Map<string, number> {
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

  const pairByBottom = new Map(scheme.liftPairs.map(p => [p.bottomMachine, p]));
  const pairByTop = new Map(scheme.liftPairs.map(p => [p.topMachine, p]));

  const flowCache = new Map<string, number>();
  const computing = new Set<string>();

  /**
   * 计算某条 belt 上游端口想给出的 uncapped 流量。
   * 与 computeStats.ts 的 beltFlow 类似，但不做 Math.min(flow, cap)。
   * 输入 belt（无 fromPort）仍然受自身 capacity 限制（模拟外部供给）。
   */
  function uncappedFlow(belt: BeltSegment): number {
    if (flowCache.has(belt.id)) return flowCache.get(belt.id)!;
    const guard = `belt:${belt.id}`;
    if (computing.has(guard)) return 0;
    computing.add(guard);

    let flow = 0;

    if (!belt.fromPort) {
      // 边界输入：受 belt 本身容量限制
      flow = beltCapacity(belt.mark);
    } else {
      const [mId, portId] = belt.fromPort.split(':');
      const machine = machineById.get(mId);
      if (machine) {
        flow = producerOutputRate(machine, portId);
      }
    }

    // 不做 Math.min(flow, cap) —— 这是 uncapped
    computing.delete(guard);
    flowCache.set(belt.id, flow);
    return flow;
  }

  function producerOutputRate(machine: MachineInstance, portId: string): number {
    const t = machine.type;

    if (PRODUCTION_TYPES.has(t)) {
      const recipe = getRecipe(machine.recipe);
      if (!recipe) return 0;
      const designRate = (machine.clockSpeed ?? 100) / 100;
      const idx = parseInt(portId.split('-')[1] ?? '0', 10);
      const output = recipe.outputs[idx];
      if (!output) return 0;
      return output.rate * designRate;
    }

    if (t === 'merger') {
      if (portId !== 'out-0') return 0;
      let sum = 0;
      for (const inPort of ['in-0', 'in-1', 'in-2']) {
        const inBelt = beltByToPort.get(`${machine.id}:${inPort}`);
        if (inBelt) sum += uncappedFlow(inBelt);
      }
      return sum;
    }

    if (t === 'splitter') {
      const inBelt = beltByToPort.get(`${machine.id}:in-0`);
      if (!inBelt) return 0;
      const input = uncappedFlow(inBelt);
      // 简化：均分到已连接的输出端口
      const connectedOutputs: string[] = [];
      for (const p of ['out-0', 'out-1', 'out-2']) {
        const outBelts = beltsByFromPort.get(`${machine.id}:${p}`) ?? [];
        if (outBelts.length > 0) connectedOutputs.push(p);
      }
      if (connectedOutputs.length === 0) return 0;
      if (connectedOutputs.includes(portId)) {
        return input / connectedOutputs.length;
      }
      return 0;
    }

    if (t === 'conveyor-lift-out-top') {
      const pair = pairByTop.get(machine.id);
      if (!pair) return 0;
      const bottomInBelt = beltByToPort.get(`${pair.bottomMachine}:bottom`);
      return bottomInBelt ? uncappedFlow(bottomInBelt) : 0;
    }

    if (t === 'conveyor-lift-out-bottom') {
      const pair = pairByBottom.get(machine.id);
      if (!pair) return 0;
      const topInBelt = beltByToPort.get(`${pair.topMachine}:top`);
      return topInBelt ? uncappedFlow(topInBelt) : 0;
    }

    if (t === 'storage' || t === 'industrial-storage') {
      if (portId !== 'out-0' && portId !== 'out-1') return 0;
      const inPortId = portId === 'out-1' ? 'in-1' : 'in-0';
      const inBelt = beltByToPort.get(`${machine.id}:${inPortId}`);
      return inBelt ? uncappedFlow(inBelt) : 0;
    }

    return 0;
  }

  // 计算所有 belt 的 uncapped flow
  const result = new Map<string, number>();
  for (const belt of scheme.belts) {
    result.set(belt.id, roundRate(uncappedFlow(belt)));
  }
  return result;
}

/**
 * 执行流量相关的校验规则。
 * 计算 uncapped flow 后与 belt/lift capacity 比较。
 */
export function validateFlowRules(scheme: Scheme): FlowValidationIssue[] {
  const issues: FlowValidationIssue[] = [];
  const uncapped = computeUncappedFlows(scheme);

  // ----------------------------------------------------------
  // R22: 传送带容量溢出检测
  // ----------------------------------------------------------
  for (const belt of scheme.belts) {
    const flow = uncapped.get(belt.id) ?? 0;
    const capacity = beltCapacity(belt.mark);
    if (flow > capacity + 0.1) {
      issues.push({
        severity: 'error',
        rule: 'R22-belt-overcapacity',
        message: `Belt "${belt.id}": flow ${flow}/min exceeds Mk.${belt.mark} capacity ${capacity}/min`,
        elementId: belt.id,
      });
    }
  }

  // ----------------------------------------------------------
  // R28: 升降机容量溢出检测
  // ----------------------------------------------------------
  for (const pair of scheme.liftPairs) {
    const capacity = beltCapacity(pair.mark);
    // 找到连接到 lift 入口机器的 belt，取其 uncapped flow
    let maxFlow = 0;
    for (const belt of scheme.belts) {
      if (belt.toPort?.startsWith(pair.bottomMachine + ':') ||
          belt.toPort?.startsWith(pair.topMachine + ':')) {
        const flow = uncapped.get(belt.id) ?? 0;
        maxFlow = Math.max(maxFlow, flow);
      }
    }
    if (maxFlow > capacity + 0.1) {
      issues.push({
        severity: 'error',
        rule: 'R28-lift-overcapacity',
        message: `LiftPair "${pair.id}": flow ${maxFlow}/min exceeds Mk.${pair.mark} capacity ${capacity}/min`,
        elementId: pair.id,
      });
    }
  }

  return issues;
}
