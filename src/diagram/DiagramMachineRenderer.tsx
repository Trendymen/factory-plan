// src/diagram/DiagramMachineRenderer.tsx
import { memo } from 'react';
import { resolvePortPosition, machineSvgRect, safeGetBuildingMeta } from './diagramGeometry';
import type { DiagramMachine } from './diagramTypes';

interface Props {
  machine: DiagramMachine;
}

const LIGHT_BG_TYPES = new Set([
  'splitter', 'merger', 'constructor', 'assembler', 'industrial-storage',
  'conveyor-lift-in-bottom', 'conveyor-lift-out-bottom',
  'conveyor-lift-in-top', 'conveyor-lift-out-top',
]);

function DiagramMachineRendererImpl({ machine }: Props) {
  const meta = safeGetBuildingMeta(machine.type);
  const { x, y, w, h } = machineSvgRect(machine);

  if (!isFinite(x) || !isFinite(y) || !isFinite(w) || !isFinite(h) || w <= 0 || h <= 0) {
    if (import.meta.env?.DEV) {
      console.warn(`[diagram] skipping machine "${machine.id}" with invalid geometry`);
    }
    return null;
  }

  const color = `var(${meta.color}, var(--diagram-default))`;

  const inset = Math.min(w, h) * 0.08;
  const bx = x + inset;
  const by = y + inset;
  const bw = w - inset * 2;
  const bh = h - inset * 2;

  const isSmall = bw < 50 || bh < 50;
  const label = machine.label ?? machine.id;
  const displayLabel = isSmall ? label.slice(0, 2) : label;
  const labelFontSize = isSmall ? 8 : 9;
  const labelColor = LIGHT_BG_TYPES.has(machine.type) ? '#12151c' : '#e4ecf4';
  const subLabel = machine.recipe;

  return (
    <g className="diagram-machine-group">
      <rect className="machine-footprint" x={x} y={y} width={w} height={h} rx={3} stroke={color} />
      <rect
        className="machine-body"
        x={bx}
        y={by}
        width={bw}
        height={bh}
        rx={2}
        style={{ fill: color, stroke: color }}
      />
      <text
        className="machine-label"
        x={bx + bw / 2}
        y={by + bh / 2 + (subLabel && !isSmall ? -3 : 0)}
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: labelFontSize, fill: labelColor }}
      >
        {displayLabel}
      </text>
      {subLabel && !isSmall && (
        <text
          className="machine-sublabel"
          x={bx + bw / 2}
          y={by + bh / 2 + 9}
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontSize: 7, fill: labelColor, opacity: 0.85 }}
        >
          {subLabel}
        </text>
      )}
      {meta.ports.map((portDef) => {
        const p = resolvePortPosition(
          { col: machine.col, row: machine.row },
          machine.facing ?? 'south',
          meta.dimensions,
          portDef,
        );
        if (!isFinite(p.x) || !isFinite(p.y)) return null;
        const isIn = portDef.kind.includes('in');
        return (
          <circle
            key={portDef.id}
            className="diagram-port"
            cx={p.x}
            cy={p.y}
            r={3}
            fill={isIn ? '#ff9800' : '#4caf50'}
          />
        );
      })}
    </g>
  );
}

export const DiagramMachineRenderer = memo(DiagramMachineRendererImpl);
