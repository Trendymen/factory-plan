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

  const midIdx = Math.floor(svgPoints.length / 2);
  const midPt = svgPoints[midIdx];

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
