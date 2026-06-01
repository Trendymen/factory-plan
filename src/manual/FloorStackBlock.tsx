import { memo } from 'react';
import type { Cross, FloorStack } from './floorStack';

interface Props {
  data: FloorStack;
}

function Arrow({ cross }: { cross: Cross }) {
  return (
    <div className={`floor-arrow floor-arrow-${cross.dir}`}>
      <span className="floor-arrow-glyph">{cross.dir === 'up' ? '↑' : '↓'}</span>
      <span className="floor-arrow-label">
        {cross.material} → {cross.target}
      </span>
    </div>
  );
}

function FloorStackBlockImpl({ data }: Props) {
  // 倒序：屋顶在上、1F 在底（DSL 作者按 1F→屋顶 自下而上书写）
  const floorsTopDown = [...data.floors].reverse();
  return (
    <div className="floor-stack">
      {data.title && <div className="floor-stack-title">{data.title}</div>}
      {floorsTopDown.map((floor) => (
        <div className="floor-row" key={floor.name}>
          {floor.cross?.dir === 'up' && <Arrow cross={floor.cross} />}
          <div className="floor-box-grid">
            <div className="floor-io floor-io-in">
              {floor.input && <span>▶ {floor.input}</span>}
            </div>
            <div className="floor-box">
              <div className="floor-name">{floor.name}</div>
              <div className="floor-machines">{floor.machines}</div>
            </div>
            <div className="floor-io floor-io-out">
              {floor.output && <span>{floor.output} ▶</span>}
            </div>
          </div>
          {floor.cross?.dir === 'down' && <Arrow cross={floor.cross} />}
        </div>
      ))}
    </div>
  );
}

export const FloorStackBlock = memo(FloorStackBlockImpl);
