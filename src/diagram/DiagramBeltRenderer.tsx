// src/diagram/DiagramBeltRenderer.tsx
import { memo } from 'react';
import { gridToSvg, resolveDiagramPort } from './diagramGeometry';
import type { DiagramBelt, DiagramMachine } from './diagramTypes';

interface Props {
  belt: DiagramBelt;
  machines: DiagramMachine[];
}

const DEFAULT_BELT_COLOR = '#90c8e8';

function DiagramBeltRendererImpl({ belt, machines }: Props) {
  if (!Array.isArray(belt.path) || belt.path.length < 1) return null;

  const pts = belt.path
    .filter((p) => Array.isArray(p) && p.length >= 2 && isFinite(p[0]) && isFinite(p[1]))
    .map(([col, row]) => gridToSvg(col, row));

  if (pts.length < 1) return null;

  const fromPort = resolveDiagramPort(belt.from, machines);
  const toPort = resolveDiagramPort(belt.to, machines);
  if (fromPort) pts[0] = fromPort;
  if (toPort) pts[pts.length - 1] = toPort;

  if (pts.length < 2) {
    if (fromPort && toPort) pts.splice(0, pts.length, fromPort, toPort);
    else return null;
  }

  const color = DEFAULT_BELT_COLOR;
  const mark = belt.mark ?? 1;
  const points = pts.map((p) => `${p.x},${p.y}`).join(' ');

  const last = pts[pts.length - 1];
  const prev = pts[pts.length - 2];
  const angle = Math.atan2(last.y - prev.y, last.x - prev.x) * (180 / Math.PI);

  const mid = pts[Math.floor(pts.length / 2)];

  return (
    <g className="diagram-belt-group">
      <polyline
        className={`belt-line belt-mk${mark}`}
        points={points}
        fill="none"
        stroke={color}
        strokeDasharray="8 8"
      />
      <polygon
        className="belt-arrow"
        points="-4,-2.5 0,0 -4,2.5"
        fill={color}
        transform={`translate(${last.x},${last.y}) rotate(${angle})`}
      />
      {belt.label && (
        <text
          className="belt-label"
          x={mid.x}
          y={mid.y - 4}
          textAnchor="middle"
          style={{ fontSize: 7, fill: color }}
        >
          {belt.label}
        </text>
      )}
    </g>
  );
}

export const DiagramBeltRenderer = memo(DiagramBeltRendererImpl);
