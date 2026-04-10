import { memo } from 'react';
import type { BeltSegment, MachineInstance } from '../core/types';
import { gridToSvg } from '../core/coordinate';
import { getMaterialColor } from '../core/registry';
import {
  buildBeltRenderPath,
  getTerminalSegment,
  getBeltDegenerateInfo,
} from '../core/beltGeometry';

interface BeltRendererProps {
  belt: BeltSegment;
  machines?: MachineInstance[];
  highlight?: boolean;
  selected?: boolean;
  dimmed?: boolean;
  onHover?: (id: string | null) => void;
  onClick?: (id: string) => void;
}

// 分流器/合流器端口连接箭头颜色（进线/出线统一配色）
const PORT_ARROW_IN  = '#ff9800'; // 进线: 橙色
const PORT_ARROW_OUT = '#4caf50'; // 出线: 绿色
const LOGISTICS_TYPES = new Set(['splitter', 'merger']);

/** 若端口连接到分流器/合流器，返回对应的箭头颜色 */
function getLogisticsArrowColor(
  portRef: string | undefined,
  machines: MachineInstance[],
  isOutput: boolean, // true=从机器输出(fromPort), false=输入到机器(toPort)
): string | null {
  if (!portRef) return null;
  const [machineId] = portRef.split(':');
  const machine = machines.find(m => m.id === machineId);
  if (!machine || !LOGISTICS_TYPES.has(machine.type)) return null;
  return isOutput ? PORT_ARROW_OUT : PORT_ARROW_IN;
}

export const BeltRenderer = memo(function BeltRenderer({
  belt, machines = [], highlight, selected, dimmed, onHover, onClick,
}: BeltRendererProps) {
  const color = getMaterialColor(belt.material);

  // 分流器/合流器端口连接色（degenerate/正常两个分支都要用）
  const fromArrowColor = getLogisticsArrowColor(belt.fromPort, machines, true);
  const toArrowColor = getLogisticsArrowColor(belt.toPort, machines, false);

  const className = [
    'belt-group',
    selected && 'element-selected',
    highlight && !selected && 'element-highlight',
    dimmed && 'element-dimmed',
  ].filter(Boolean).join(' ');

  // ── 零空隙连接：fromPort 与 toPort 物理位置重合时只画一个箭头 ──
  // 箭头颜色优先级：toPort 到分流/合流器(进线橙色) > fromPort 出分流/合流器(出线绿色) > 物料色
  const degenerate = getBeltDegenerateInfo(belt, machines);
  if (degenerate) {
    const { x, y } = gridToSvg(degenerate.pos.col, degenerate.pos.row);
    const portArrowColor = toArrowColor ?? fromArrowColor;
    const arrowColor = portArrowColor ?? color;
    const isPortArrow = portArrowColor !== null;
    return (
      <g className={className} onMouseEnter={() => onHover?.(belt.id)} onMouseLeave={() => onHover?.(null)}
        onClick={() => onClick?.(belt.id)} style={{ cursor: 'pointer' }}>
        {/* 透明命中区扩大点击面积 */}
        <circle cx={x} cy={y} r={8} fill="transparent" />
        <polygon
          className={isPortArrow ? 'belt-port-arrow' : 'belt-arrow'}
          points={isPortArrow ? '-5,-3.5 0,0 -5,3.5' : '-4,-2.5 0,0 -4,2.5'}
          fill={arrowColor}
          transform={`translate(${x},${y}) rotate(${degenerate.angleDeg})`}
        />
      </g>
    );
  }

  const renderPath = buildBeltRenderPath(belt, machines);
  if (renderPath.length < 2) return null;

  const svgPoints = renderPath.map(point => gridToSvg(point.col, point.row));
  const points = svgPoints.map(p => `${p.x},${p.y}`).join(' ');

  const startSegment = getTerminalSegment(renderPath, 'start');
  const endSegment = getTerminalSegment(renderPath, 'end');

  const endArrowColor = toArrowColor ?? color;

  // 起点箭头（仅在连接分流器/合流器输出端口时绘制）
  let startArrowEl: React.ReactNode = null;
  if (fromArrowColor && startSegment) {
    const f1 = gridToSvg(startSegment[0].col, startSegment[0].row);
    const f2 = gridToSvg(startSegment[1].col, startSegment[1].row);
    const startAngle = Math.atan2(f2.y - f1.y, f2.x - f1.x) * (180 / Math.PI);
    startArrowEl = (
      <polygon className="belt-port-arrow" points="-5,-3.5 0,0 -5,3.5" fill={fromArrowColor}
        transform={`translate(${f1.x},${f1.y}) rotate(${startAngle})`} />
    );
  }

  return (
    <g className={className} onMouseEnter={() => onHover?.(belt.id)} onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.(belt.id)} style={{ cursor: 'pointer' }}>
      <polyline className={`belt-line belt-mk${belt.mark}`} points={points} stroke={color} strokeDasharray="8 8" />
      {startArrowEl}
      {endSegment && (() => {
        const s1 = gridToSvg(endSegment[0].col, endSegment[0].row);
        const s2 = gridToSvg(endSegment[1].col, endSegment[1].row);
        const endAngle = Math.atan2(s2.y - s1.y, s2.x - s1.x) * (180 / Math.PI);
        return (
          <polygon
            className={toArrowColor ? 'belt-port-arrow' : 'belt-arrow'}
            points={toArrowColor ? '-5,-3.5 0,0 -5,3.5' : '-4,-2.5 0,0 -4,2.5'}
            fill={endArrowColor}
            transform={`translate(${s2.x},${s2.y}) rotate(${endAngle})`}
          />
        );
      })()}
    </g>
  );
});
