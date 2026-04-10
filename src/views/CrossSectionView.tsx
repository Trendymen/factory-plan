import type { Scheme } from '../core/types';
import { GRID_PX, PAD } from '../core/coordinate';
import { getBuildingMeta, getMaterialColor } from '../core/registry';

interface CrossSectionViewProps { scheme: Scheme; }

export function CrossSectionView({ scheme }: CrossSectionViewProps) {
  const floors = [...scheme.floors].sort((a, b) => b.id - a.id);
  const totalHeight = floors.reduce((sum, f) => sum + f.heightM, 0);
  const maxCols = Math.max(...floors.map(f => f.gridSize.cols));
  const SECTION_SCALE = 10;
  const svgW = maxCols * GRID_PX + PAD * 2;
  const svgH = totalHeight * SECTION_SCALE + PAD * 2 + floors.length * 20;

  let yOffset = PAD;

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', height: '100%' }}>
      {floors.map(floor => {
        const floorH = floor.heightM * SECTION_SCALE;
        const floorY = yOffset;
        yOffset += floorH + 20;

        const machines = scheme.machines.filter(m => m.floor === floor.id);
        // 找到 pair 中属于本楼层的 machine + material
        const floorLifts = scheme.liftPairs
          .map(pair => {
            const bot = scheme.machines.find(m => m.id === pair.bottomMachine);
            const top = scheme.machines.find(m => m.id === pair.topMachine);
            if (!bot || !top) return null;
            if (bot.floor === floor.id) return { id: pair.id, pos: bot.pos, material: pair.material };
            if (top.floor === floor.id) return { id: pair.id, pos: top.pos, material: pair.material };
            return null;
          })
          .filter((x): x is { id: string; pos: { col: number; row: number }; material: string } => x !== null);

        return (
          <g key={floor.id}>
            <text x={12} y={floorY + floorH / 2} fill="var(--text-muted)" fontSize={12} fontFamily="var(--font-mono)">{floor.label}</text>
            <rect x={PAD} y={floorY} width={maxCols * GRID_PX} height={floorH} fill="var(--bg-canvas)" stroke="var(--border)" strokeWidth={1} rx={4} />
            <line x1={PAD} y1={floorY + floorH} x2={PAD + maxCols * GRID_PX} y2={floorY + floorH} stroke="var(--border)" strokeWidth={2} />
            {machines.map(m => {
              const meta = getBuildingMeta(m.type);
              const mW = (meta.dimensions.width / 8) * GRID_PX;
              const mH = meta.dimensions.height * SECTION_SCALE;
              const mX = PAD + m.pos.col * GRID_PX;
              const mY = floorY + floorH - mH;
              const color = `var(${meta.color})`;
              return (
                <g key={m.id}>
                  <rect x={mX} y={mY} width={mW} height={mH} rx={2} fill={color} fillOpacity={0.15} stroke={color} strokeWidth={0.8} />
                  <text x={mX + mW / 2} y={mY + mH / 2 + 3} textAnchor="middle" fill={color} fontSize={8} fontFamily="var(--font-mono)">{m.label ?? m.id}</text>
                </g>
              );
            })}
            {floorLifts.map(l => {
              const lX = PAD + l.pos.col * GRID_PX + 4;
              const color = getMaterialColor(l.material);
              return (
                <g key={l.id}>
                  <line x1={lX} y1={floorY} x2={lX} y2={floorY + floorH} stroke={color} strokeWidth={2} strokeDasharray="4 3" />
                  <text x={lX + 6} y={floorY + floorH / 2} fill={color} fontSize={7} fontFamily="var(--font-mono)">{l.material}</text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
