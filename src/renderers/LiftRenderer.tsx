import { memo } from 'react';
import type { LiftPair, MachineInstance } from '../core/types';
import { gridToSvg, machineGridSize, GRID_PX } from '../core/coordinate';
import { getBuildingMeta } from '../core/registry';

interface LiftOverlayProps {
  pairs: LiftPair[];
  machines: MachineInstance[];
  floorId: number;
  highlightChain?: string[];
  onHover?: (id: string | null) => void;
  onClick?: (id: string) => void;
}

interface BadgeInfo {
  pairId: string;
  material: string;
  machine: MachineInstance;
  direction: 'up' | 'down';
  /** send = 物料从本层送出; receive = 物料到达本层 */
  role: 'send' | 'receive';
  targetFloor: number;
}

function computeBadge(
  pair: LiftPair,
  machines: MachineInstance[],
  floorId: number,
): BadgeInfo | null {
  const bot = machines.find(m => m.id === pair.bottomMachine);
  const top = machines.find(m => m.id === pair.topMachine);
  if (!bot || !top) return null;

  let machine: MachineInstance;
  let targetFloor: number;

  if (bot.floor === floorId) {
    machine = bot;
    targetFloor = top.floor;
  } else if (top.floor === floorId) {
    machine = top;
    targetFloor = bot.floor;
  } else {
    return null;
  }

  // -in- 类型：belt 进入 lift → 物料离开本层 (send)
  // -out- 类型：lift 输出到 belt → 物料到达本层 (receive)
  const role = machine.type.includes('-in-') ? 'send' : 'receive';
  const direction = machine.type.includes('bottom')
    ? (role === 'send' ? 'up' : 'down')
    : (role === 'send' ? 'down' : 'up');

  return { pairId: pair.id, material: pair.material, machine, direction, role, targetFloor };
}

export const LiftOverlay = memo(function LiftOverlay({
  pairs, machines, floorId, highlightChain = [], onHover, onClick,
}: LiftOverlayProps) {
  const badges = pairs
    .map(pair => computeBadge(pair, machines, floorId))
    .filter((b): b is BadgeInfo => b !== null);

  return (
    <g className="lift-overlay-layer">
      {badges.map(badge => {
        const meta = getBuildingMeta(badge.machine.type);
        const { cols, rows } = machineGridSize(meta.dimensions, badge.machine.facing);
        const { x, y } = gridToSvg(badge.machine.pos.col, badge.machine.pos.row);
        const w = cols * GRID_PX;
        const h = rows * GRID_PX;

        const isHighlighted = highlightChain.includes(badge.pairId);
        const className = ['lift-overlay-badge', isHighlighted && 'element-highlight']
          .filter(Boolean)
          .join(' ');

        const cx = x + w / 2;
        const cy = y + h / 2;
        const isSend = badge.role === 'send';

        // 送出：楼层号在上、箭头在下；到达：箭头在上、楼层号在下
        const arrowY = isSend ? cy + 2 : cy - 2;
        const textY = isSend ? cy - 4 : cy + 5.5;
        const arrowPoints = badge.direction === 'up'
          ? `${cx - 3.5},${arrowY + 2.5} ${cx},${arrowY - 2.5} ${cx + 3.5},${arrowY + 2.5}`
          : `${cx - 3.5},${arrowY - 2.5} ${cx},${arrowY + 2.5} ${cx + 3.5},${arrowY - 2.5}`;

        return (
          <g
            key={badge.pairId}
            className={className}
            onMouseEnter={() => onHover?.(badge.pairId)}
            onMouseLeave={() => onHover?.(null)}
            onClick={() => onClick?.(badge.pairId)}
            style={{ cursor: 'pointer' }}
          >
            {/* 方向箭头：实心=送出, 空心=到达 */}
            <polygon
              points={arrowPoints}
              fill={isSend ? '#fff' : 'none'}
              stroke="#fff"
              strokeWidth={1}
              strokeLinejoin="round"
            />
            {/* 目标/来源楼层 */}
            <text
              x={cx}
              y={textY}
              textAnchor="middle"
              dominantBaseline="central"
              style={{ fontSize: 5.5, fill: '#fff', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}
            >
              {badge.targetFloor}F
            </text>
          </g>
        );
      })}
    </g>
  );
});
