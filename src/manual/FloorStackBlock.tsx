import { memo } from 'react';
import type { Cross, Floor, FloorStack } from './floorStack';

interface Props {
  data: FloorStack;
}

function CrossArrow({ cross }: { cross: Cross }) {
  return (
    <div className={`floor-arrow floor-arrow-${cross.dir}`}>
      <span className="floor-arrow-glyph">{cross.dir === 'up' ? '↑' : '↓'}</span>
      <span className="floor-arrow-label">
        {cross.material} → {cross.target}
      </span>
    </div>
  );
}

// 地基/隔层带：相邻两层高度不衔接时的空档（4m 地基、真空走线层等）。
function GapBand({ low, high }: { low: number; high: number }) {
  return <div className="floor-gap">隔层 {low}–{high}m</div>;
}

function FloorRow({ floor }: { floor: Floor }) {
  const leftRev = floor.reverse?.filter((r) => r.side === 'left') ?? [];
  const rightRev = floor.reverse?.filter((r) => r.side === 'right') ?? [];
  return (
    <div className="floor-row">
      {floor.cross?.dir === 'up' && <CrossArrow cross={floor.cross} />}
      <div className="floor-box-grid">
        <div className="floor-io floor-io-in">
          {floor.input && <span>▶ {floor.input}</span>}
          {leftRev.map((r, i) => (
            <span key={`l${i}`} className="floor-io-rev">◀ {r.label}</span>
          ))}
        </div>
        <div className="floor-box">
          <div className="floor-name">
            {floor.name}
            {floor.height && (
              <span className="floor-height"> · {floor.height.low}–{floor.height.high}m</span>
            )}
          </div>
          <div className="floor-machines">{floor.machines}</div>
        </div>
        <div className="floor-io floor-io-out">
          {floor.output && <span>{floor.output} ▶</span>}
          {rightRev.map((r, i) => (
            <span key={`r${i}`} className="floor-io-rev">◀ {r.label}</span>
          ))}
        </div>
      </div>
      {floor.cross?.dir === 'down' && <CrossArrow cross={floor.cross} />}
    </div>
  );
}

function FloorStackBlockImpl({ data }: Props) {
  // 倒序：屋顶在上、1F 在底（DSL 作者按 1F→屋顶 自下而上书写）
  const topDown = [...data.floors].reverse();
  return (
    <div className="floor-stack">
      {data.title && <div className="floor-stack-title">{data.title}</div>}
      {topDown.map((floor, i) => {
        const below = topDown[i + 1];
        // 上层底高于下层顶 → 中间有地基/隔层空档
        const gap =
          floor.height && below?.height && floor.height.low > below.height.high
            ? { low: below.height.high, high: floor.height.low }
            : null;
        return (
          <div key={floor.name}>
            <FloorRow floor={floor} />
            {gap && <GapBand low={gap.low} high={gap.high} />}
          </div>
        );
      })}
    </div>
  );
}

export const FloorStackBlock = memo(FloorStackBlockImpl);
