import { memo } from 'react';
import type { BeltSegment, MachineInstance } from '../core/types';
import { gridToSvg, resolvePortPosition } from '../core/coordinate';
import { getMaterialColor, getBuildingMeta } from '../core/registry';

interface BeltRendererProps {
  belt: BeltSegment;
  machines?: MachineInstance[];
  highlight?: boolean;
  dimmed?: boolean;
  onHover?: (id: string | null) => void;
  onClick?: (id: string) => void;
}

/** 解析端口引用 "machine-id:port-id" 并返回精确的 SVG 坐标 */
function resolvePortRef(portRef: string | undefined, machines: MachineInstance[]): { x: number; y: number } | null {
  if (!portRef) return null;
  const [machineId, portId] = portRef.split(':');
  const machine = machines.find(m => m.id === machineId);
  if (!machine) return null;
  try {
    const meta = getBuildingMeta(machine.type);
    const portDef = meta.ports.find(p => p.id === portId);
    if (!portDef) return null;
    return resolvePortPosition(machine.pos, machine.facing, meta.dimensions, portDef);
  } catch {
    return null;
  }
}

export const BeltRenderer = memo(function BeltRenderer({
  belt, machines = [], highlight, dimmed, onHover, onClick,
}: BeltRendererProps) {
  if (belt.path.length < 2) return null;

  const color = getMaterialColor(belt.material);

  // 将路径转为 SVG 坐标，但起点/终点吸附到端口精确位置
  const svgPoints = belt.path.map(p => gridToSvg(p.col, p.row));

  // 起点吸附到 fromPort
  const fromPos = resolvePortRef(belt.fromPort, machines);
  if (fromPos) svgPoints[0] = fromPos;

  // 终点吸附到 toPort
  const toPos = resolvePortRef(belt.toPort, machines);
  if (toPos) svgPoints[svgPoints.length - 1] = toPos;

  const points = svgPoints.map(p => `${p.x},${p.y}`).join(' ');

  const s1 = svgPoints[svgPoints.length - 2];
  const s2 = svgPoints[svgPoints.length - 1];
  const angle = Math.atan2(s2.y - s1.y, s2.x - s1.x) * (180 / Math.PI);

  // 找最长线段放标签（避免在短线段上标签拥挤）
  let bestIdx = 0;
  let bestLen = 0;
  for (let i = 0; i < svgPoints.length - 1; i++) {
    const dx = svgPoints[i + 1].x - svgPoints[i].x;
    const dy = svgPoints[i + 1].y - svgPoints[i].y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > bestLen) { bestLen = len; bestIdx = i; }
  }
  const labelA = svgPoints[bestIdx];
  const labelB = svgPoints[bestIdx + 1];
  const labelX = (labelA.x + labelB.x) / 2;
  const labelY = (labelA.y + labelB.y) / 2;
  // 标签偏移到线段侧边，避免叠在线上
  const isHorizontal = Math.abs(labelA.y - labelB.y) < 1;
  const offsetX = isHorizontal ? 0 : 10;
  const offsetY = isHorizontal ? -10 : 0;

  // 标签尺寸计算
  const charW = belt.material.length * 7 + 8;
  const halfW = charW / 2;

  const className = [
    'belt-group',
    highlight && 'element-highlight',
    dimmed && 'element-dimmed',
  ].filter(Boolean).join(' ');

  return (
    <g className={className} onMouseEnter={() => onHover?.(belt.id)} onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.(belt.id)} style={{ cursor: 'pointer' }}>
      <polyline className={`belt-line belt-mk${belt.mark}`} points={points} stroke={color} strokeDasharray="8 8" />
      <polygon className="belt-arrow" points="-4,-2.5 0,0 -4,2.5" fill={color}
        transform={`translate(${s2.x},${s2.y}) rotate(${angle})`} />
      {/* 标签放在最长线段中点旁侧 */}
      <g transform={`translate(${labelX + offsetX},${labelY + offsetY})`}>
        <rect x={-halfW} y={-6} width={charW} height={12} rx={2}
          fill="#080c12" fillOpacity={0.9} stroke={color} strokeWidth={0.4} />
        <text className="belt-label" textAnchor="middle" y={3} fill={color}
          style={{ fontSize: 7 }}>{belt.material}</text>
      </g>
    </g>
  );
});
