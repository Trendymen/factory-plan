import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { getBuildingMeta } from '../core/registry';

export function MachineTooltip() {
  const hoveredId = useAppStore(s => s.hoveredId);
  const scheme = useAppStore(s => s.currentScheme);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const machine = scheme?.machines.find(m => m.id === hoveredId);
  const meta = machine ? getBuildingMeta(machine.type) : null;

  useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX + 12, y: e.clientY + 12 });
    if (hoveredId) {
      window.addEventListener('mousemove', handler);
      return () => window.removeEventListener('mousemove', handler);
    }
  }, [hoveredId]);

  return (
    <AnimatePresence>
      {machine && meta && (
        <motion.div className="tooltip" style={{ position: 'fixed', left: pos.x, top: pos.y }}
          initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <div className="tooltip-title" style={{ color: `var(${meta.color})` }}>
            {machine.label ?? machine.id} — {meta.displayName}
          </div>
          {machine.recipe && <div className="tooltip-row"><span>配方</span><span>{machine.recipe}</span></div>}
          <div className="tooltip-row"><span>功耗</span><span>{meta.powerUsage} MW</span></div>
          {machine.clockSpeed && machine.clockSpeed !== 100 && (
            <div className="tooltip-row"><span>超频</span><span>{machine.clockSpeed}%</span></div>
          )}
          <div className="tooltip-row"><span>尺寸</span><span>{meta.dimensions.width}m x {meta.dimensions.length}m</span></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
