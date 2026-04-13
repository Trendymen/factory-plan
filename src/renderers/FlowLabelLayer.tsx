import { memo, useMemo } from 'react';
import type { BeltSegment, MachineInstance } from '../core/types';
import type { BeltFlowEntry } from '../core/computeStats';
import { computeBeltLabelPositions } from '../core/labelLayout';
import { getBeltDegenerateInfo } from '../core/beltGeometry';
import { gridToSvg } from '../core/coordinate';
import { useAppStore } from '../store/useAppStore';
import type { MaterialMap } from '../core/deriveMaterials';

interface FlowLabelLayerProps {
  belts: BeltSegment[];
  machines: MachineInstance[];
  beltFlows: Map<string, BeltFlowEntry>;
  highlightChain: string[];
  selectedId: string | null;
  onHover?: (id: string | null) => void;
  onClick?: (id: string) => void;
  materialMap: MaterialMap;
}

interface DegeneratePlacement {
  id: string;
  x: number;
  y: number;
}

/**
 * 常驻流量标签层：在传送带上叠加 "物料名 N/min" 标签。
 * 使用 foreignObject + backdrop-filter 实现 iOS/Windows 11 毛玻璃效果。
 */
export const FlowLabelLayer = memo(function FlowLabelLayer({
  belts, machines, beltFlows, highlightChain, selectedId, onHover, onClick, materialMap,
}: FlowLabelLayerProps) {
  const normalBelts = useMemo(
    () => belts.filter(b => !getBeltDegenerateInfo(b, machines)),
    [belts, machines],
  );

  const placements = useMemo(
    () => computeBeltLabelPositions(normalBelts, machines, materialMap, { tPreference: 'offset' }),
    [normalBelts, machines, materialMap],
  );

  const degeneratePlacements = useMemo(() => {
    const result: DegeneratePlacement[] = [];
    for (const belt of belts) {
      const degen = getBeltDegenerateInfo(belt, machines);
      if (!degen) continue;
      const { x, y } = gridToSvg(degen.pos.col, degen.pos.row);
      result.push({ id: belt.id, x: x + 12, y: y + 8 });
    }
    return result;
  }, [belts, machines]);

  const showBeltMark = useAppStore(s => s.layers.showBeltMark);
  const hasHighlight = highlightChain.length > 0;

  function renderLabel(id: string, cx: number, cy: number) {
    const entry = beltFlows.get(id);
    if (!entry || entry.flow <= 0) return null;

    const markLabel = showBeltMark && entry.mark ? ` · Mk.${entry.mark}` : '';
    const materials = materialMap.get(id) ?? [];
    const matLabel = materials.length > 0 ? materials.join('+') : '?';
    const text = `${matLabel} ${entry.flow}/min${markLabel}`;
    const charW = text.length * 5.5 + 10;
    const halfW = charW / 2;
    const h = 14;
    const isSelected = id === selectedId;
    const isHighlighted = highlightChain.includes(id);
    const isDimmed = hasHighlight && !isHighlighted;

    const className = [
      'belt-group',
      isSelected && 'element-selected',
      isHighlighted && !isSelected && 'element-highlight',
      isDimmed && 'element-dimmed',
    ].filter(Boolean).join(' ');

    return (
      <g key={id} className={className}
        onMouseEnter={() => onHover?.(id)}
        onMouseLeave={() => onHover?.(null)}
        onClick={() => onClick?.(id)}
        style={{ cursor: 'pointer' }}
      >
        <foreignObject x={cx - halfW} y={cy - h / 2} width={charW} height={h}>
          <div className={`flow-label-glass${isSelected ? ' flow-label-selected' : ''}`}>
            {text}
          </div>
        </foreignObject>
      </g>
    );
  }

  return (
    <g className="flow-label-layer">
      {placements.map(p => renderLabel(p.id, p.x, p.y))}
      {degeneratePlacements.map(p => renderLabel(p.id, p.x, p.y))}
    </g>
  );
});
