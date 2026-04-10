import { memo } from 'react';
import type { LiftPair, MachineInstance } from '../core/types';
import { gridToSvg, machineGridSize, GRID_PX } from '../core/coordinate';
import { getBuildingMeta, getMaterialColor } from '../core/registry';

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
  symbol: '↑' | '↓';
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
  let symbol: '↑' | '↓';
  let targetFloor: number;

  if (bot.floor === floorId) {
    machine = bot;
    targetFloor = top.floor;
    symbol = bot.type === 'conveyor-lift-in-bottom' ? '↑' : '↓';
  } else if (top.floor === floorId) {
    machine = top;
    targetFloor = bot.floor;
    symbol = top.type === 'conveyor-lift-out-top' ? '↑' : '↓';
  } else {
    return null;
  }

  return { pairId: pair.id, material: pair.material, machine, symbol, targetFloor };
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
        const { cols } = machineGridSize(meta.dimensions, badge.machine.facing);
        const { x, y } = gridToSvg(badge.machine.pos.col, badge.machine.pos.row);
        const w = cols * GRID_PX;
        const color = getMaterialColor(badge.material);

        // 徽标定位在机器 bbox 的右上角内侧
        const badgeW = Math.max(16, w * 0.75);
        const badgeH = 9;
        const bx = x + w - badgeW - 1;
        const by = y + 1;

        const isHighlighted = highlightChain.includes(badge.pairId);
        const className = ['lift-overlay-badge', isHighlighted && 'element-highlight']
          .filter(Boolean)
          .join(' ');

        return (
          <g
            key={badge.pairId}
            className={className}
            onMouseEnter={() => onHover?.(badge.pairId)}
            onMouseLeave={() => onHover?.(null)}
            onClick={() => onClick?.(badge.pairId)}
            style={{ cursor: 'pointer' }}
          >
            <rect
              x={bx}
              y={by}
              width={badgeW}
              height={badgeH}
              rx={2}
              fill="rgba(0,0,0,0.72)"
              stroke={color}
              strokeWidth={0.5}
            />
            <text
              x={bx + badgeW / 2}
              y={by + badgeH / 2 + 2.5}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={color}
              style={{ fontSize: 7, fontWeight: 'bold' }}
            >
              {badge.symbol}{badge.targetFloor}F
            </text>
          </g>
        );
      })}
    </g>
  );
});
