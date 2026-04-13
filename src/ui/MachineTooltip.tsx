import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { getBuildingMeta } from '../core/registry';
import { computeMachineFlow, formatRecipeLabel, getRecipe } from '../core/recipes';
import type { BeltFlowEntry } from '../core/computeStats';
import type { LiftPair, MachineInstance, Scheme } from '../core/types';

/** 格式化每分钟速率：整数不带小数，否则保留 1 位 */
function fmtRate(rate: number): string {
  return Number.isInteger(rate) ? rate.toString() : rate.toFixed(1);
}

const LOGISTICS_TYPES = new Set(['splitter', 'merger']);
const LIFT_TYPES = new Set([
  'conveyor-lift-in-bottom', 'conveyor-lift-out-bottom',
  'conveyor-lift-in-top', 'conveyor-lift-out-top',
]);

/** 收集分流器/合流器的实际吞吐 */
function computeLogisticsFlow(
  machine: MachineInstance,
  scheme: Scheme,
  beltFlows: Map<string, BeltFlowEntry>,
): { inputs: { item: string; rate: number }[]; outputs: { item: string; rate: number }[] } {
  const inputs: { item: string; rate: number }[] = [];
  const outputs: { item: string; rate: number }[] = [];

  for (const belt of scheme.belts) {
    const entry = beltFlows.get(belt.id);
    if (!entry || entry.flow <= 0) continue;

    if (belt.toPort?.startsWith(machine.id + ':')) {
      inputs.push({ item: entry.material, rate: entry.flow });
    }
    if (belt.fromPort?.startsWith(machine.id + ':')) {
      outputs.push({ item: entry.material, rate: entry.flow });
    }
  }

  return { inputs, outputs };
}

/** 收集升降机 pair 的吞吐 */
function computeLiftFlow(
  pair: LiftPair,
  beltFlows: Map<string, BeltFlowEntry>,
): { material: string; rate: number } | null {
  const entry = beltFlows.get(pair.id);
  if (!entry || entry.flow <= 0) return null;
  return { material: entry.material, rate: entry.flow };
}

export function MachineTooltip() {
  const hoveredId = useAppStore(s => s.hoveredId);
  const scheme = useAppStore(s => s.currentScheme);
  const beltFlows = useAppStore(s => s.beltFlows);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX + 14, y: e.clientY + 14 });
    if (hoveredId) {
      window.addEventListener('mousemove', handler);
      return () => window.removeEventListener('mousemove', handler);
    }
  }, [hoveredId]);

  if (!scheme || !hoveredId) return null;

  // ── 升降机 pair ──
  const liftPair = scheme.liftPairs.find(p => p.id === hoveredId);
  if (liftPair) {
    const bot = scheme.machines.find(m => m.id === liftPair.bottomMachine);
    const top = scheme.machines.find(m => m.id === liftPair.topMachine);
    const direction = bot?.type.includes('-in-') ? '↑' : '↓';
    const liftFlow = computeLiftFlow(liftPair, beltFlows);

    return (
      <AnimatePresence>
        <motion.div className="tooltip" style={{ position: 'fixed', left: pos.x, top: pos.y }}
          initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.12 }}>
          <div className="tooltip-header">
            <span className="tooltip-color-bar" style={{ background: 'var(--lift)' }} />
            <span className="tooltip-title">{liftPair.id}</span>
            <span className="tooltip-type">升降机 {direction}</span>
          </div>
          <div className="tooltip-body">
            <div className="tooltip-row">
              <span className="tooltip-key">楼层</span>
              <span className="tooltip-val">{bot?.floor}F → {top?.floor}F</span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-key">等级</span>
              <span className="tooltip-val">Mk.{liftPair.mark}</span>
            </div>
            {liftFlow && (
              <div className="tooltip-row">
                <span className="tooltip-key">吞吐</span>
                <span className="tooltip-val">{liftFlow.material} {fmtRate(liftFlow.rate)}/min</span>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ── 普通机器 / 分流器 / 合流器 / 升降机机器 ──
  const machine = scheme.machines.find(m => m.id === hoveredId);
  const meta = machine ? getBuildingMeta(machine.type) : null;
  if (!machine || !meta) return null;

  // 升降机机器单体不显示独立 tooltip（由 pair 处理）
  if (LIFT_TYPES.has(machine.type)) return null;

  const recipe = getRecipe(machine.recipe);
  const flow = computeMachineFlow(machine.recipe, machine.clockSpeed);
  const isLogistics = LOGISTICS_TYPES.has(machine.type);
  const logisticsFlow = isLogistics ? computeLogisticsFlow(machine, scheme, beltFlows) : null;

  return (
    <AnimatePresence>
      <motion.div className="tooltip" style={{ position: 'fixed', left: pos.x, top: pos.y }}
        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.12 }}>
        <div className="tooltip-header">
          <span className="tooltip-color-bar" style={{ background: `var(${meta.color})` }} />
          <span className="tooltip-title">{machine.label ?? machine.id}</span>
          <span className="tooltip-type">{meta.displayName}</span>
        </div>
        <div className="tooltip-body">
          {recipe && (
            <div className="tooltip-row"><span className="tooltip-key">配方</span><span className="tooltip-val">{formatRecipeLabel(machine.recipe)}</span></div>
          )}
          {/* 生产机器吞吐 */}
          {flow && flow.inputs.length > 0 && (
            <div className="tooltip-row">
              <span className="tooltip-key">输入</span>
              <span className="tooltip-val">
                {flow.inputs.map(i => `${i.item} ${fmtRate(i.rate)}/min`).join(' · ')}
              </span>
            </div>
          )}
          {flow && flow.outputs.length > 0 && (
            <div className="tooltip-row">
              <span className="tooltip-key">输出</span>
              <span className="tooltip-val">
                {flow.outputs.map(o => `${o.item} ${fmtRate(o.rate)}/min`).join(' · ')}
              </span>
            </div>
          )}
          {/* 分流器/合流器吞吐 */}
          {logisticsFlow && logisticsFlow.inputs.length > 0 && (
            <div className="tooltip-row">
              <span className="tooltip-key">输入</span>
              <span className="tooltip-val">
                {logisticsFlow.inputs.map(i => `${i.item} ${fmtRate(i.rate)}/min`).join(' · ')}
              </span>
            </div>
          )}
          {logisticsFlow && logisticsFlow.outputs.length > 0 && (
            <div className="tooltip-row">
              <span className="tooltip-key">输出</span>
              <span className="tooltip-val">
                {logisticsFlow.outputs.map(o => `${o.item} ${fmtRate(o.rate)}/min`).join(' · ')}
              </span>
            </div>
          )}
          {!isLogistics && (
            <div className="tooltip-row">
              <span className="tooltip-key">功耗</span>
              <span className="tooltip-val">{flow ? flow.powerMW.toFixed(1) : meta.powerUsage} MW</span>
            </div>
          )}
          {machine.clockSpeed && machine.clockSpeed !== 100 && (
            <div className="tooltip-row"><span className="tooltip-key">超频</span><span className="tooltip-val">{machine.clockSpeed}%</span></div>
          )}
          <div className="tooltip-row"><span className="tooltip-key">尺寸</span><span className="tooltip-val">{meta.dimensions.width} × {meta.dimensions.length} m</span></div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
