// src/diagram/DiagramView.tsx
import { memo } from 'react';
import { gridToSvg, fitViewBox } from './diagramGeometry';
import { DiagramGridRenderer } from './DiagramGridRenderer';
import { DiagramMachineRenderer } from './DiagramMachineRenderer';
import { DiagramBeltRenderer } from './DiagramBeltRenderer';
import type { DiagramScheme, ParseResult } from './diagramTypes';

interface Props {
  result: ParseResult;
}

function ErrorCard({ error, raw }: { error: string; raw: string }) {
  return (
    <div className="diagram-error-card">
      <div className="diagram-error-title">⚠ diagram 解析失败：{error}</div>
      <pre className="diagram-error-raw">{raw}</pre>
    </div>
  );
}

function DiagramSvg({ scheme }: { scheme: DiagramScheme }) {
  const machines = scheme.machines ?? [];
  const belts = scheme.belts ?? [];
  const zones = scheme.zones ?? [];
  const notes = scheme.notes ?? [];

  const viewBox = fitViewBox(scheme.grid, machines);
  const gridCols = scheme.grid?.cols ?? Math.ceil(Number(viewBox.split(' ')[2]) / 80);
  const gridRows = scheme.grid?.rows ?? Math.ceil(Number(viewBox.split(' ')[3]) / 80);

  return (
    <figure className="diagram-figure">
      {scheme.title && <figcaption className="diagram-caption">{scheme.title}</figcaption>}
      <svg className="diagram-svg" viewBox={viewBox} preserveAspectRatio="xMidYMid meet">
        <DiagramGridRenderer cols={gridCols} rows={gridRows} />

        {zones.map((z, i) => {
          const tl = gridToSvg(z.col, z.row);
          const br = gridToSvg(z.col + z.w, z.row + z.h);
          return (
            <g key={`zone-${i}`} className="diagram-zone">
              <rect
                x={tl.x}
                y={tl.y}
                width={br.x - tl.x}
                height={br.y - tl.y}
                rx={4}
                fill={z.color ?? '#3a8'}
                fillOpacity={0.12}
                stroke={z.color ?? '#3a8'}
                strokeOpacity={0.4}
              />
              {z.label && (
                <text className="diagram-zone-label" x={tl.x + 6} y={tl.y + 14} style={{ fontSize: 8 }}>
                  {z.label}
                </text>
              )}
            </g>
          );
        })}

        {machines.map((m) => (
          <DiagramMachineRenderer key={m.id} machine={m} />
        ))}

        {belts.map((b) => (
          <DiagramBeltRenderer key={b.id} belt={b} machines={machines} />
        ))}

        {notes.map((n, i) => {
          const p = gridToSvg(n.col, n.row);
          return (
            <text
              key={`note-${i}`}
              className="diagram-note"
              x={p.x}
              y={p.y}
              style={{ fontSize: 8 }}
            >
              {n.text}
            </text>
          );
        })}
      </svg>
    </figure>
  );
}

function DiagramViewImpl({ result }: Props) {
  if (!result.ok) return <ErrorCard error={result.error} raw={result.raw} />;
  return <DiagramSvg scheme={result.data} />;
}

export const DiagramView = memo(DiagramViewImpl);
