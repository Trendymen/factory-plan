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
            {machine.recipe && (
              <div className="tooltip-row"><span className="tooltip-key">配方</span><span className="tooltip-val">{machine.recipe}</span></div>
            )}
            <div className="tooltip-row"><span className="tooltip-key">功耗</span><span className="tooltip-val">{meta.powerUsage} MW</span></div>
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
