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
  // 亮色背景机器使用深色文字
  const lightBg = machine.type === 'splitter' || machine.type === 'merger';
  const labelColor = lightBg ? '#1a1a2e' : undefined;

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

  // 根据机器尺寸调整标签策略
  const isSmall = bw < 50 || bh < 50;
  const label = machine.label ?? machine.id;
  // 小型机器（分流/合流器）：截断标签，字号缩小
  const displayLabel = isSmall ? label.slice(0, 2) : label;
  const labelFontSize = isSmall ? 8 : 9;
  const subLabel = meta.powerUsage > 0
    ? `${meta.powerUsage}MW${machine.clockSpeed && machine.clockSpeed !== 100 ? ` ${machine.clockSpeed}%` : ''}`
    : '';

  return (
    <g className={className}
      onMouseEnter={() => onHover?.(machine.id)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.(machine.id)}
    >
      <rect className="machine-footprint" x={x} y={y} width={w} height={h} rx={3} stroke={color} />
      <rect className="machine-body" x={bx} y={by} width={bw} height={bh} rx={2} style={{ fill: color, stroke: color }} />

      {/* 标签：clipPath 确保不溢出 */}
      <clipPath id={`clip-${machine.id}`}>
        <rect x={bx} y={by} width={bw} height={bh} />
      </clipPath>
      <g clipPath={`url(#clip-${machine.id})`}>
        <text className="machine-label" x={bx + bw / 2} y={by + bh / 2 + (subLabel && !isSmall ? -3 : 0)}
          textAnchor="middle" dominantBaseline="central" style={{ fontSize: labelFontSize, fill: labelColor }}>
          {displayLabel}
        </text>
        {subLabel && !isSmall && (
          <text className="machine-sublabel" x={bx + bw / 2} y={by + bh / 2 + 10}
            textAnchor="middle" fill={color} style={{ fontSize: 7 }}>
            {subLabel}
          </text>
        )}
      </g>

      {meta.ports.map(portDef => {
        const pos = resolvePortPosition(machine.pos, machine.facing, meta.dimensions, portDef);
        return (
          <circle key={portDef.id} className="port-dot" cx={pos.x} cy={pos.y}
            stroke={portDef.kind.includes('in') ? '#ff9800' : '#4caf50'} />
        );
      })}
    </g>
  );
});
