import { memo } from 'react';
import type { BeltSegment } from '../core/types';
import { gridToSvg } from '../core/coordinate';
import { getMaterialColor } from '../core/registry';

interface BeltRendererProps {
  belt: BeltSegment;
  highlight?: boolean;
  dimmed?: boolean;
  onHover?: (id: string | null) => void;
  onClick?: (id: string) => void;
}

export const BeltRenderer = memo(function BeltRenderer({
  belt, highlight, dimmed, onHover, onClick,
}: BeltRendererProps) {
  if (belt.path.length < 2) return null;

  const color = getMaterialColor(belt.material);
  const points = belt.path.map(p => {
    const { x, y } = gridToSvg(p.col, p.row);
    return `${x},${y}`;
  }).join(' ');

  const p1 = belt.path[belt.path.length - 2];
  const p2 = belt.path[belt.path.length - 1];
  const s1 = gridToSvg(p1.col, p1.row);
  const s2 = gridToSvg(p2.col, p2.row);
  const angle = Math.atan2(s2.y - s1.y, s2.x - s1.x) * (180 / Math.PI);

  const midIdx = Math.floor(belt.path.length / 2);
  const midPt = gridToSvg(belt.path[midIdx].col, belt.path[midIdx].row);

  const className = [
    'belt-group',
    highlight && 'element-highlight',
    dimmed && 'element-dimmed',
  ].filter(Boolean).join(' ');

  return (
    <g className={className} onMouseEnter={() => onHover?.(belt.id)} onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.(belt.id)} style={{ cursor: 'pointer' }}>
      <polyline className={`belt-line belt-mk${belt.mark}`} points={points} stroke={color} strokeDasharray="8 8" />
      <polygon className="belt-arrow" points="-5,-3 0,0 -5,3" fill={color}
        transform={`translate(${s2.x},${s2.y}) rotate(${angle})`} />
      <g transform={`translate(${midPt.x},${midPt.y - 6})`}>
        {/* 用字符数估算宽度：中文字符约8px，英文约5px */}
        {(() => {
          const charW = belt.material.length * 8 + 10;
          const halfW = charW / 2;
          return <rect x={-halfW} y={-7} width={charW} height={14} rx={3} fill="#0a0e14" fillOpacity={0.85} stroke={color} strokeWidth={0.5} />;
        })()}
        <text className="belt-label" textAnchor="middle" y={4} fill={color}>{belt.material}</text>
      </g>
    </g>
  );
});
