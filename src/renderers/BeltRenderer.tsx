import { memo } from 'react';
import type { BeltSegment, MachineInstance } from '../core/types';
import { gridToSvg, resolvePortPosition, SIDE_MAP } from '../core/coordinate';
import { getMaterialColor, getBuildingMeta } from '../core/registry';
import type { Facing } from '../core/types';

interface BeltRendererProps {
  belt: BeltSegment;
  machines?: MachineInstance[];
  highlight?: boolean;
  dimmed?: boolean;
  onHover?: (id: string | null) => void;
  onClick?: (id: string) => void;
}

interface PortResult {
  x: number;
  y: number;
  screenSide: 'top' | 'bottom' | 'left' | 'right';
}

/** 解析端口引用 "machine-id:port-id" 并返回精确的 SVG 坐标和端口朝向 */
function resolvePortRef(portRef: string | undefined, machines: MachineInstance[]): PortResult | null {
  if (!portRef) return null;
  const [machineId, portId] = portRef.split(':');
  const machine = machines.find(m => m.id === machineId);
  if (!machine) return null;
  try {
    const meta = getBuildingMeta(machine.type);
    const portDef = meta.ports.find(p => p.id === portId);
    if (!portDef) return null;
    const pos = resolvePortPosition(machine.pos, machine.facing, meta.dimensions, portDef);
    const screenSide = SIDE_MAP[machine.facing as Facing][portDef.side];
    return { ...pos, screenSide };
  } catch {
    return null;
  }
}

/** 端口吸附时，若产生斜线则插入正交桥接点 */
function snapWithBridge(
  svgPoints: { x: number; y: number }[],
  port: PortResult,
  isFrom: boolean,
) {
  if (isFrom) {
    svgPoints[0] = port;
    const next = svgPoints[1];
    if (next && port.x !== next.x && port.y !== next.y) {
      // top/bottom 端口 → 第一段保持垂直; left/right 端口 → 第一段保持水平
      const bridge = (port.screenSide === 'top' || port.screenSide === 'bottom')
        ? { x: port.x, y: next.y }
        : { x: next.x, y: port.y };
      svgPoints.splice(1, 0, bridge);
    }
  } else {
    const lastIdx = svgPoints.length - 1;
    svgPoints[lastIdx] = port;
    const prev = svgPoints[lastIdx - 1];
    if (prev && port.x !== prev.x && port.y !== prev.y) {
      // top/bottom 端口 → 最后一段保持垂直; left/right 端口 → 最后一段保持水平
      const bridge = (port.screenSide === 'top' || port.screenSide === 'bottom')
        ? { x: port.x, y: prev.y }
        : { x: prev.x, y: port.y };
      svgPoints.splice(lastIdx, 0, bridge);
    }
  }
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
  belt, machines = [], highlight, dimmed, onHover, onClick,
}: BeltRendererProps) {
  if (belt.path.length < 2) return null;

  const color = getMaterialColor(belt.material);

  // 将路径转为 SVG 坐标，起点/终点吸附到端口精确位置（保持正交）
  const svgPoints = belt.path.map(p => gridToSvg(p.col, p.row));

  // 起点吸附到 fromPort（插入正交桥接点避免斜线）
  const fromPort = resolvePortRef(belt.fromPort, machines);
  if (fromPort) snapWithBridge(svgPoints, fromPort, true);

  // 终点吸附到 toPort（插入正交桥接点避免斜线）
  const toPort = resolvePortRef(belt.toPort, machines);
  if (toPort) snapWithBridge(svgPoints, toPort, false);

  const points = svgPoints.map(p => `${p.x},${p.y}`).join(' ');

  // 终点箭头（始终绘制）
  const s1 = svgPoints[svgPoints.length - 2];
  const s2 = svgPoints[svgPoints.length - 1];
  const endAngle = Math.atan2(s2.y - s1.y, s2.x - s1.x) * (180 / Math.PI);

  // 分流器/合流器端口连接色
  const fromArrowColor = getLogisticsArrowColor(belt.fromPort, machines, true);
  const toArrowColor = getLogisticsArrowColor(belt.toPort, machines, false);
  const endArrowColor = toArrowColor ?? color;

  // 起点箭头（仅在连接分流器/合流器输出端口时绘制）
  let startArrowEl: React.ReactNode = null;
  if (fromArrowColor && svgPoints.length >= 2) {
    const f1 = svgPoints[0];
    const f2 = svgPoints[1];
    const startAngle = Math.atan2(f2.y - f1.y, f2.x - f1.x) * (180 / Math.PI);
    startArrowEl = (
      <polygon className="belt-port-arrow" points="-5,-3.5 0,0 -5,3.5" fill={fromArrowColor}
        transform={`translate(${f1.x},${f1.y}) rotate(${startAngle})`} />
    );
  }

  const className = [
    'belt-group',
    highlight && 'element-highlight',
    dimmed && 'element-dimmed',
  ].filter(Boolean).join(' ');

  return (
    <g className={className} onMouseEnter={() => onHover?.(belt.id)} onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.(belt.id)} style={{ cursor: 'pointer' }}>
      <polyline className={`belt-line belt-mk${belt.mark}`} points={points} stroke={color} strokeDasharray="8 8" />
      {startArrowEl}
      <polygon
        className={toArrowColor ? 'belt-port-arrow' : 'belt-arrow'}
        points={toArrowColor ? '-5,-3.5 0,0 -5,3.5' : '-4,-2.5 0,0 -4,2.5'}
        fill={endArrowColor}
        transform={`translate(${s2.x},${s2.y}) rotate(${endAngle})`}
      />
    </g>
  );
});
