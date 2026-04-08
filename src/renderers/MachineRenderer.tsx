import { memo } from 'react';
import type { MachineInstance } from '../core/types';
import { gridToSvg, machineGridSize, GRID_PX, resolvePortPosition } from '../core/coordinate';
import { getBuildingMeta } from '../core/registry';

interface MachineRendererProps {
  machine: MachineInstance;
  highlight?: boolean;
  dimmed?: boolean;
  onHover?: (id: string | null) => void;
  onClick?: (id: string) => void;
}

export const MachineRenderer = memo(function MachineRenderer({
  machine, highlight, dimmed, onHover, onClick,
}: MachineRendererProps) {
  const meta = getBuildingMeta(machine.type);
  const { cols, rows } = machineGridSize(meta.dimensions, machine.facing);
  const { x, y } = gridToSvg(machine.pos.col, machine.pos.row);
  const w = cols * GRID_PX;
  const h = rows * GRID_PX;
  const color = `var(${meta.color})`;

  const inset = Math.min(w, h) * 0.08;
  const bx = x + inset;
  const by = y + inset;
  const bw = w - inset * 2;
  const bh = h - inset * 2;

  const className = [
    'machine-group',
    highlight && 'element-highlight',
    dimmed && 'element-dimmed',
  ].filter(Boolean).join(' ');

  return (
    <g className={className}
      onMouseEnter={() => onHover?.(machine.id)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.(machine.id)}
    >
      <rect className="machine-footprint" x={x} y={y} width={w} height={h} rx={3} stroke={color} />
      <rect className="machine-body" x={bx} y={by} width={bw} height={bh} rx={2} fill={color} stroke={color} />
      <text className="machine-label" x={bx + bw / 2} y={by + 14} textAnchor="middle">
        {machine.label ?? machine.id}
      </text>
      <text className="machine-sublabel" x={bx + bw / 2} y={by + bh - 6} textAnchor="middle" fill={color}>
        {meta.powerUsage > 0 ? `${meta.powerUsage}MW` : ''}{machine.clockSpeed && machine.clockSpeed !== 100 ? ` ${machine.clockSpeed}%` : ''}
      </text>
      {meta.ports.filter(p => p.kind !== 'power').map(portDef => {
        const pos = resolvePortPosition(machine.pos, machine.facing, meta.dimensions, portDef);
        return (
          <circle key={portDef.id} className="port-dot" cx={pos.x} cy={pos.y}
            stroke={portDef.kind.includes('in') ? '#ff9800' : '#4caf50'} />
        );
      })}
    </g>
  );
});
