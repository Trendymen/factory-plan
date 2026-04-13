import { memo } from 'react';
import type { BeltFlowEntry } from '../core/computeStats';
import { useAppStore } from '../store/useAppStore';
import type { MaterialMap } from '../core/deriveMaterials';

interface FlowTooltipProps {
  beltId: string;
  beltFlows: Map<string, BeltFlowEntry>;
  svgX: number;
  svgY: number;
  materialMap: MaterialMap;
}

/**
 * Hover tooltip：跟随鼠标，毛玻璃背景。
 * 显示：物料名 流量/min [· Mk.N]
 */
export const FlowTooltip = memo(function FlowTooltip({
  beltId, beltFlows, svgX, svgY, materialMap,
}: FlowTooltipProps) {
  const showBeltMark = useAppStore(s => s.layers.showBeltMark);
  const entry = beltFlows.get(beltId);
  if (!entry || entry.flow <= 0) return null;

  const markLabel = showBeltMark && entry.mark ? ` · Mk.${entry.mark}` : '';
  const materials = materialMap.get(beltId) ?? [];
  const matLabel = materials.length > 0 ? materials.join('+') : '?';
  const text = `${matLabel} ${entry.flow}/min${markLabel}`;
  const charW = text.length * 5.5 + 14;
  const halfW = charW / 2;
  const h = 16;
  const tipX = svgX - halfW;
  const tipY = svgY - 20 - h / 2;

  return (
    <foreignObject x={tipX} y={tipY} width={charW} height={h}
      style={{ pointerEvents: 'none' }}>
      <div className="flow-tooltip-glass">
        {text}
      </div>
    </foreignObject>
  );
});
