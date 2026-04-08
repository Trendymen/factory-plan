import { memo } from 'react';
import type { StructureInstance } from '../core/types';
import { gridToSvg, GRID_PX, machineGridSize } from '../core/coordinate';
import { getBuildingMeta } from '../core/registry';

interface StructureRendererProps { structure: StructureInstance; dimmed?: boolean; }

export const StructureRenderer = memo(function StructureRenderer({ structure, dimmed }: StructureRendererProps) {
  const meta = getBuildingMeta(structure.type);
  const { cols, rows } = machineGridSize(meta.dimensions, structure.wallSide ?? 'south');
  const { x, y } = gridToSvg(structure.pos.col, structure.pos.row);
  const w = cols * GRID_PX;
  const h = rows * GRID_PX;

  return (
    <g className={dimmed ? 'element-dimmed' : ''}>
      <rect className="structure-marker" x={x} y={y} width={w} height={h} rx={2} />
      <text className="machine-sublabel" x={x + w / 2} y={y + h / 2 + 3} textAnchor="middle" fill="var(--structure)">
        {meta.displayName.slice(0, 4)}
      </text>
    </g>
  );
});
