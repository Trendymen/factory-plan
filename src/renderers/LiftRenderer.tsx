import { memo } from 'react';
import type { Lift } from '../core/types';
import { gridToSvg, GRID_PX } from '../core/coordinate';
import { getMaterialColor } from '../core/registry';

interface LiftRendererProps {
  lift: Lift;
  highlight?: boolean;
  dimmed?: boolean;
  onHover?: (id: string | null) => void;
}

export const LiftRenderer = memo(function LiftRenderer({ lift, highlight, dimmed, onHover }: LiftRendererProps) {
  const { x, y } = gridToSvg(lift.pos.col, lift.pos.row);
  const size = (2 / 8) * GRID_PX;
  const color = getMaterialColor(lift.material);
  const className = [highlight && 'element-highlight', dimmed && 'element-dimmed'].filter(Boolean).join(' ');

  return (
    <g className={className} onMouseEnter={() => onHover?.(lift.id)} onMouseLeave={() => onHover?.(null)}>
      <rect className="lift-box" x={x} y={y} width={size} height={size} rx={2} stroke={color} fill={color} />
      <text className="lift-label" x={x + size / 2} y={y + size / 2 + 3} textAnchor="middle" fill={color}>↕{lift.toFloor}F</text>
    </g>
  );
});
