import { GRID_PX, PAD } from '../core/coordinate';

interface GridRendererProps {
  cols: number;
  rows: number;
}

export function GridRenderer({ cols, rows }: GridRendererProps) {
  const lines: React.ReactNode[] = [];

  for (let c = 0; c <= cols; c++) {
    const x = PAD + c * GRID_PX;
    lines.push(<line key={`v${c}`} className="grid-line" x1={x} y1={PAD} x2={x} y2={PAD + rows * GRID_PX} />);
  }
  for (let r = 0; r <= rows; r++) {
    const y = PAD + r * GRID_PX;
    lines.push(<line key={`h${r}`} className="grid-line" x1={PAD} y1={y} x2={PAD + cols * GRID_PX} y2={y} />);
  }
  for (let c = 0; c < cols; c++) {
    lines.push(<text key={`cl${c}`} className="grid-label" x={PAD + c * GRID_PX + GRID_PX / 2} y={PAD - 8} textAnchor="middle">{c + 1}</text>);
  }
  for (let r = 0; r < rows; r++) {
    lines.push(<text key={`rl${r}`} className="grid-label" x={PAD - 12} y={PAD + r * GRID_PX + GRID_PX / 2 + 4} textAnchor="middle">{String.fromCharCode(65 + r)}</text>);
  }

  return <g className="grid-layer">{lines}</g>;
}
