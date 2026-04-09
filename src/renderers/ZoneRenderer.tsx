import { memo } from 'react';
import type { Zone } from '../core/types';
import { gridToSvg, GRID_PX } from '../core/coordinate';

interface ZoneRendererProps { zone: Zone; }

export const ZoneRenderer = memo(function ZoneRenderer({ zone }: ZoneRendererProps) {
  const { x, y } = gridToSvg(zone.pos.col, zone.pos.row);
  const w = zone.size.w * GRID_PX;
  const h = zone.size.h * GRID_PX;
  const color = zone.color ? `var(${zone.color})` : 'var(--text-muted)';

  return (
    <g>
      <rect className="zone-rect" x={x} y={y} width={w} height={h} rx={4} stroke={color} fill={color} />
      <clipPath id={`zone-clip-${zone.id}`}>
        <rect x={x} y={y} width={w} height={h} />
      </clipPath>
      <text className="zone-label" x={x + w / 2} y={y + 16} fill={color}
        clipPath={`url(#zone-clip-${zone.id})`}>{zone.label}</text>
    </g>
  );
});
