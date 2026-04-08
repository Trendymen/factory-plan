import { memo } from 'react';
import type { PowerPole, PowerConnection, MachineInstance } from '../core/types';
import { gridToSvg } from '../core/coordinate';

interface PowerRendererProps {
  poles: PowerPole[];
  connections: PowerConnection[];
  machines: MachineInstance[];
  dimmed?: boolean;
}

export const PowerRenderer = memo(function PowerRenderer({ poles, connections, machines, dimmed }: PowerRendererProps) {
  const posMap = new Map<string, { x: number; y: number }>();
  for (const p of poles) { posMap.set(p.id, gridToSvg(p.pos.col, p.pos.row)); }
  for (const m of machines) { posMap.set(m.id, gridToSvg(m.pos.col + 0.5, m.pos.row + 0.5)); }

  return (
    <g className={dimmed ? 'power-layer element-dimmed' : 'power-layer'}>
      {connections.map((c, i) => {
        const from = posMap.get(c.from);
        const to = posMap.get(c.to);
        if (!from || !to) return null;
        return <line key={i} className="power-line" x1={from.x} y1={from.y} x2={to.x} y2={to.y} />;
      })}
      {poles.map(p => {
        const pos = posMap.get(p.id)!;
        return (
          <g key={p.id}>
            <circle className="power-pole-marker" cx={pos.x} cy={pos.y} r={5} />
            <text className="power-label" x={pos.x} y={pos.y + 3} textAnchor="middle">{p.id.slice(-1).toUpperCase()}</text>
          </g>
        );
      })}
    </g>
  );
});
