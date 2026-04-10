import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { getBuildingMeta } from '../core/registry';
import { computeMachineFlow, formatRecipeLabel, getRecipe } from '../core/recipes';

/** 格式化每分钟速率：整数不带小数，否则保留 1 位 */
function fmtRate(rate: number): string {
  return Number.isInteger(rate) ? rate.toString() : rate.toFixed(1);
}

export function MachineTooltip() {
  const hoveredId = useAppStore(s => s.hoveredId);
  const scheme = useAppStore(s => s.currentScheme);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const machine = scheme?.machines.find(m => m.id === hoveredId);
  const meta = machine ? getBuildingMeta(machine.type) : null;
  const recipe = machine ? getRecipe(machine.recipe) : undefined;
  const flow = machine ? computeMachineFlow(machine.recipe, machine.clockSpeed) : undefined;

  useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX + 14, y: e.clientY + 14 });
    if (hoveredId) {
      window.addEventListener('mousemove', handler);
      return () => window.removeEventListener('mousemove', handler);
    }
  }, [hoveredId]);

  return (
    <AnimatePresence>
      {machine && meta && (
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
            <div className="tooltip-row">
              <span className="tooltip-key">功耗</span>
              <span className="tooltip-val">{flow ? flow.powerMW.toFixed(1) : meta.powerUsage} MW</span>
            </div>
            {machine.clockSpeed && machine.clockSpeed !== 100 && (
              <div className="tooltip-row"><span className="tooltip-key">超频</span><span className="tooltip-val">{machine.clockSpeed}%</span></div>
            )}
            <div className="tooltip-row"><span className="tooltip-key">尺寸</span><span className="tooltip-val">{meta.dimensions.width} × {meta.dimensions.length} m</span></div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
