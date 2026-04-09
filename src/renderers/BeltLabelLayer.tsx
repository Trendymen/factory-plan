import { memo, useMemo } from 'react';
import type { BeltSegment, MachineInstance } from '../core/types';
import { computeBeltLabelPositions } from '../core/labelLayout';

interface BeltLabelLayerProps {
  belts: BeltSegment[];
  machines: MachineInstance[];
  highlightChain: string[];
  onHover?: (id: string | null) => void;
  onClick?: (id: string) => void;
}

/**
 * 统一渲染所有传送带标签，内置碰撞避让。
 * 标签位置由贪心算法计算，确保不重叠。
 */
export const BeltLabelLayer = memo(function BeltLabelLayer({
  belts, machines, highlightChain, onHover, onClick,
}: BeltLabelLayerProps) {
  const placements = useMemo(
    () => computeBeltLabelPositions(belts, machines),
    [belts, machines],
  );

  const hasHighlight = highlightChain.length > 0;

  return (
    <g className="belt-label-layer">
      {placements.map(p => {
        const halfW = p.width / 2;
        const isHighlighted = highlightChain.includes(p.id);
        const isDimmed = hasHighlight && !isHighlighted;

        const className = [
          'belt-group',
          isHighlighted && 'element-highlight',
          isDimmed && 'element-dimmed',
        ].filter(Boolean).join(' ');

        return (
          <g key={p.id} className={className}
            onMouseEnter={() => onHover?.(p.id)}
            onMouseLeave={() => onHover?.(null)}
            onClick={() => onClick?.(p.id)}
            style={{ cursor: 'pointer' }}
            transform={`translate(${p.x},${p.y})`}
          >
            <rect x={-halfW} y={-6} width={p.width} height={12} rx={2}
              fill="#080c12" fillOpacity={0.9} stroke={p.color} strokeWidth={0.4} />
            <text className="belt-label" textAnchor="middle" dominantBaseline="central"
              y={0} fill={p.color} style={{ fontSize: 7 }}>
              {p.text}
            </text>
          </g>
        );
      })}
    </g>
  );
});
