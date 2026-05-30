// src/diagram/DiagramGridRenderer.tsx
import { memo, type ReactNode } from 'react';
import { gridToSvg } from './diagramGeometry';

interface Props {
  cols: number;
  rows: number;
}

/** 背景网格：每 1 cell 一条线，每 5 cell 加粗（major）。复用 theme.css 的 .grid-line。 */
function DiagramGridRendererImpl({ cols, rows }: Props) {
  const lines: ReactNode[] = [];
  const c = Math.max(1, Math.ceil(cols));
  const r = Math.max(1, Math.ceil(rows));

  for (let col = 0; col <= c; col++) {
    const top = gridToSvg(col, 0);
    const bottom = gridToSvg(col, r);
    lines.push(
      <line
        key={`v${col}`}
        className={col % 5 === 0 ? 'grid-line grid-line-major' : 'grid-line'}
        x1={top.x}
        y1={top.y}
        x2={bottom.x}
        y2={bottom.y}
      />,
    );
  }
  for (let row = 0; row <= r; row++) {
    const left = gridToSvg(0, row);
    const right = gridToSvg(c, row);
    lines.push(
      <line
        key={`h${row}`}
        className={row % 5 === 0 ? 'grid-line grid-line-major' : 'grid-line'}
        x1={left.x}
        y1={left.y}
        x2={right.x}
        y2={right.y}
      />,
    );
  }
  return <g className="diagram-grid">{lines}</g>;
}

export const DiagramGridRenderer = memo(DiagramGridRendererImpl);
