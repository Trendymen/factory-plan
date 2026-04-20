// scripts/viz/render-svg.ts
import { Panel, Machine } from './types';
import { PanelLayout } from './layout';

const MATERIAL_COLORS: Record<string, string> = {
  'iron-ingot': '#8b8b89',
  'copper-ingot': '#39231d',
  'steel-ingot': '#2a2a2a',
  'iron-rod': '#9a9a9a',
  'iron-plate': '#b0b0b0',
  screw: '#b8b8b8',
  wire: '#9e6b43',
  cable: '#6e6c6c',
  'copper-sheet': '#39231d',
  concrete: '#bcb5a3',
  'steel-beam': '#3a3a3a',
  'steel-pipe': '#666666',
  'reinforced-iron-plate': '#868686',
  'modular-frame': '#5a5a5a',
  'encased-industrial-beam': '#7a7a7a',
  rotor: '#6e6e6e',
  stator: '#5e5e5e',
  motor: '#49575b',
  'heavy-modular-frame': '#4a4a4a',
};

const MACHINE_COLORS: Record<string, string> = {
  smelter: '#d06340',
  foundry: '#de8843',
  constructor: '#8e8e8e',
  assembler: '#3e7fbf',
  manufacturer: '#8a4ab4',
  'miner-mk3': '#6e5a3e',
};

const MK3_CAP = 270;

export function renderPanelSvg(panel: Panel, layout: PanelLayout): string {
  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${layout.width} ${layout.height}" width="${layout.width}" height="${layout.height}" class="panel-svg">`
  );
  parts.push(
    `<defs><marker id="arrow-${escapeId(panel.id)}" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#333"/></marker></defs>`
  );
  parts.push(`<rect width="100%" height="100%" fill="#f7f7f5"/>`);
  parts.push(`<text x="20" y="28" font-family="sans-serif" font-size="18" font-weight="bold">${escape(panel.title)}</text>`);

  // Belts (first, so nodes draw on top)
  for (const belt of panel.belts) {
    const from = layout.positions.get(belt.from);
    const to = layout.positions.get(belt.to);
    if (!from || !to) continue;
    const color = MATERIAL_COLORS[belt.material] ?? '#888';
    const cap = belt.cap ?? MK3_CAP;
    const util = belt.rate / cap;
    const strokeWidth = util >= 0.9 ? 4 : util >= 0.5 ? 3 : 2;
    const strokeColor = util >= 0.9 ? '#d12' : color;
    // Orthogonal L-shape: horizontal first (from.x → midX at from.y), then vertical (midX, from.y → midX, to.y), then horizontal (midX, to.y → to.x, to.y)
    const midX = from.x + (to.x - from.x) * 0.6;
    parts.push(
      `<polyline points="${from.x},${from.y} ${midX},${from.y} ${midX},${to.y} ${to.x},${to.y}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" marker-end="url(#arrow-${escapeId(panel.id)})"/>`
    );
    // Label at the vertical segment midpoint
    const labelY = (from.y + to.y) / 2;
    parts.push(
      `<text x="${midX + 4}" y="${labelY}" font-family="sans-serif" font-size="10" fill="#333">${belt.rate}/min</text>`
    );
  }

  // Producer and consumer machine boxes
  for (const p of panel.producers) {
    for (let i = 0; i < p.count; i++) {
      const id = `${p.id}#${i}`;
      const pos = layout.positions.get(id);
      if (!pos) continue;
      parts.push(renderMachineBox(pos.x, pos.y, p, false));
    }
  }
  for (const c of panel.consumers) {
    for (let i = 0; i < c.count; i++) {
      const id = `${c.id}#${i}`;
      const pos = layout.positions.get(id);
      if (!pos) continue;
      parts.push(renderMachineBox(pos.x, pos.y, c, true));
    }
  }

  // Mergers
  for (const mg of panel.mergers) {
    const pos = layout.positions.get(mg.id);
    if (!pos) continue;
    parts.push(renderRouteNode(pos.x, pos.y, 'M'));
  }
  // Splitters
  for (const s of panel.splitters) {
    const pos = layout.positions.get(s.id);
    if (!pos) continue;
    parts.push(renderRouteNode(pos.x, pos.y, 'S'));
  }

  // Terminals
  for (const t of panel.terminals) {
    const pos = layout.positions.get(t.id);
    if (!pos) continue;
    parts.push(renderTerminal(pos.x, pos.y, t.label, MATERIAL_COLORS[t.material] ?? '#888'));
  }

  parts.push(`</svg>`);
  return parts.join('\n');
}

function renderMachineBox(x: number, y: number, m: Machine, dashed: boolean): string {
  const color = MACHINE_COLORS[m.type] ?? '#888';
  const dashAttr = dashed ? ` stroke-dasharray="4,3"` : '';
  return `<g transform="translate(${x - 50},${y - 18})">
    <rect width="100" height="36" rx="6" fill="white" stroke="${color}" stroke-width="2"${dashAttr}/>
    <text x="50" y="16" font-family="sans-serif" font-size="10" text-anchor="middle">${escape(m.label)}</text>
    <text x="50" y="28" font-family="sans-serif" font-size="9" text-anchor="middle" fill="#666">${m.ratePerMachine}/min</text>
  </g>`;
}

function renderRouteNode(x: number, y: number, letter: 'M' | 'S'): string {
  const fill = letter === 'M' ? '#9b8ec9' : '#c99b8e';
  return `<g transform="translate(${x},${y})">
    <polygon points="-8,-8 8,0 -8,8" fill="${fill}" stroke="#444" stroke-width="1"/>
    <text x="-3" y="3" font-family="sans-serif" font-size="9" fill="white">${letter}</text>
  </g>`;
}

function renderTerminal(x: number, y: number, label: string, color: string): string {
  return `<g transform="translate(${x},${y})">
    <polygon points="-12,0 -6,-10 6,-10 12,0 6,10 -6,10" fill="${color}" stroke="#333" stroke-width="1"/>
    <text x="0" y="-14" font-family="sans-serif" font-size="10" text-anchor="middle">${escape(label)}</text>
  </g>`;
}

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeId(s: string): string {
  return s.replace(/[^a-zA-Z0-9_-]/g, '_');
}
