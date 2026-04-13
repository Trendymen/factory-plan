import { memo } from 'react';
import type { BeltMark, LiftPair, MachineInstance } from '../core/types';
import { gridToSvg, machineGridSize, GRID_PX } from '../core/coordinate';
import { getBuildingMeta } from '../core/registry';

/** 等级徽标颜色，与传送带 belt-mkN 保持一致 */
const MARK_COLORS: Record<BeltMark, string> = {
  1: '#ff6b35',
  2: '#ffd740',
  3: '#69f0ae',
  4: '#00bcd4',
  5: '#ce93d8',
  6: '#ef5350',
};

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
  mark: number;
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

  return { pairId: pair.id, material: pair.material, mark: pair.mark, machine, direction, role, targetFloor };
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
            <title>{badge.material} · Mk.{badge.mark} · {badge.direction === 'up' ? '↑' : '↓'} {badge.targetFloor}F</title>
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
            {/* 右上角丝带三角角标（裁剪到 body 内矩形） */}
            {(() => {
              const inset = Math.min(w, h) * 0.08;
              const bx = x + inset;
              const by = y + inset;
              const bw = w - inset * 2;
              const bh = h - inset * 2;
              const s = Math.min(bw, bh) * 0.38;
              const o = 5;
              // body stroke-width=1.2，stroke 向外延伸 0.6；clipPath 需覆盖描边可见区域
              const halfStroke = 0.6;
              return (
                <>
                  <defs>
                    <clipPath id={`lift-clip-${badge.pairId}`}>
                      <rect
                        x={bx - halfStroke} y={by - halfStroke}
                        width={bw + halfStroke * 2} height={bh + halfStroke * 2}
                        rx={2.6}
                      />
                    </clipPath>
                  </defs>
                  <g clipPath={`url(#lift-clip-${badge.pairId})`}>
                    <polygon
                      points={`${bx + bw - s - o},${by - o} ${bx + bw + o},${by - o} ${bx + bw + o},${by + s + o}`}
                      fill={MARK_COLORS[badge.mark as BeltMark] ?? '#888'}
                    />
                    <text
                      x={bx + bw - s * 0.28}
                      y={by + s * 0.28}
                      textAnchor="middle"
                      dominantBaseline="central"
                      style={{ fontSize: 4.5, fill: '#000', fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}
                    >
                      {badge.mark}
                    </text>
                  </g>
                </>
              );
            })()}
          </g>
        );
      })}
    </g>
  );
});
