import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react';
import { AnimatePresence, motion } from 'motion/react';
import MachineTooltip from './MachineTooltip';
import type { LayerState } from '../App';
import {
  type Machine,
  type Belt,
  type Splitter,
  type Lift,
  type Pole,
  type LayoutZone,
  C,
  PAD,
  cx,
  cy,
  cmx,
  cmy,
  VIEW_W,
  floorRows,
  floorViewHeight,
  sectionViewHeight,
  machineBodyRect,
  machineFootprintRect,
  machinePortPoint,
  MACHINES,
  POLES,
  BELTS,
  SPLITTERS,
  LIFTS,
  LAYOUT_ZONES,
  POWER_PAIRS,
} from '../data/factory';

function Grid({ floor }: { floor: number }) {
  const rows = floorRows(floor);
  return (
    <g>
      {Array.from({ length: 9 }, (_, c) => (
        <line key={`v${c}`} x1={cx(c)} y1={cy(0) - 10} x2={cx(c)} y2={cy(rows) + 5} className="grid-line" />
      ))}
      {Array.from({ length: rows + 1 }, (_, r) => (
        <line key={`h${r}`} x1={cx(0) - 10} y1={cy(r)} x2={cx(8) + 5} y2={cy(r)} className="grid-line" />
      ))}
      {Array.from({ length: 8 }, (_, c) => (
        <text key={`cl${c}`} x={cmx(c)} y={cy(0) - 15} fill="#333" style={{ font: '9px JetBrains Mono', textAnchor: 'middle' }}>{c + 1}</text>
      ))}
      {Array.from({ length: rows }, (_, r) => (
        <text key={`rl${r}`} x={cx(0) - 18} y={cmy(r) + 3} fill="#333" style={{ font: '9px JetBrains Mono', textAnchor: 'middle' }}>{r + 1}</text>
      ))}
    </g>
  );
}

function estimateLabelWidth(text: string, fontSize: number) {
  let units = 0;
  for (const ch of text) {
    units += /[ -~]/.test(ch) ? 0.62 : 1;
  }
  return units * fontSize + 10;
}

interface LabelChipProps {
  x: number;
  y: number;
  text: string;
  variant: 'belt' | 'zone';
  anchor?: 'start' | 'middle';
}

function LabelChip({ x, y, text, variant, anchor = 'start' }: LabelChipProps) {
  const fontSize = variant === 'zone' ? 8 : 8;
  const width = estimateLabelWidth(text, fontSize);
  const height = variant === 'zone' ? 16 : 14;
  const left = anchor === 'middle' ? x - width / 2 : x;
  const textX = anchor === 'middle' ? x : x + 5;
  const textAnchor = anchor === 'middle' ? 'middle' : 'start';
  const textY = y + (variant === 'zone' ? 11 : 10);

  return (
    <g className={`label-chip label-chip-${variant}`}>
      <rect x={left} y={y} width={width} height={height} rx={4} className="label-chip-bg" />
      <text x={textX} y={textY} className="label-chip-text" textAnchor={textAnchor}>{text}</text>
    </g>
  );
}

function zoneLabelPosition(zone: LayoutZone) {
  return {
    x: cx(zone.col) + 10,
    y: cy(zone.row) + 8,
  };
}

function ZoneLayer({ floor }: { floor: number }) {
  const zones = LAYOUT_ZONES.filter(z => z.floor === floor);
  return (
    <g className="layout-zone-layer">
      {zones.map(zone => {
        const rect = { x: cx(zone.col), y: cy(zone.row), w: zone.w * C.w, h: zone.h * C.h };
        const label = zoneLabelPosition(zone);
        return (
          <g key={zone.id} className={`layout-zone layout-zone-${zone.kind}`}>
            <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} rx={8} className="layout-zone-fill" />
            <rect x={rect.x + 2} y={rect.y + 2} width={rect.w - 4} height={rect.h - 4} rx={6} className="layout-zone-border" />
            <LabelChip x={label.x} y={label.y} text={zone.label} variant="zone" />
          </g>
        );
      })}
    </g>
  );
}

function CorridorLabels({ floor }: { floor: number }) {
  void floor;
  return null;
}

function BeltLine({ belt }: { belt: Belt }) {
  const pts = belt.points.map(p => p.join(',')).join(' ');
  const col = belt.mk2 ? 'var(--mk2)' : belt.color;

  const p1 = belt.points[belt.points.length - 2];
  const p2 = belt.points[belt.points.length - 1];
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  const segLen = Math.sqrt(dx * dx + dy * dy);

  let arrow: React.ReactNode = null;
  if (segLen > 18) {
    const ax = p1[0] + dx * 0.5;
    const ay = p1[1] + dy * 0.5;
    const ang = Math.atan2(dy, dx);
    const cs = Math.cos(ang);
    const sn = Math.sin(ang);
    const sz = 5;
    arrow = (
      <polygon
        points={`${ax + cs * sz},${ay + sn * sz} ${ax - cs * sz * 0.5 - sn * sz * 0.6},${ay - sn * sz * 0.5 + cs * sz * 0.6} ${ax - cs * sz * 0.5 + sn * sz * 0.6},${ay - sn * sz * 0.5 - cs * sz * 0.6}`}
        fill={col}
        opacity={0.9}
      />
    );
  }

  const mid = belt.points[Math.floor(belt.points.length / 2)];

  return (
    <g>
      <polyline points={pts} className={`belt-line${belt.mk2 ? ' mk2-upgrade' : ''}`} stroke={col} fill="none" />
      {arrow}
      {belt.label && (
        <LabelChip
          x={mid[0] + (belt.labelDx ?? 5)}
          y={mid[1] + (belt.labelDy ?? -5) - 10}
          text={belt.label}
          variant="belt"
        />
      )}
      {belt.mk2 && belt.mk2id && (() => {
        const last = belt.points[belt.points.length - 1];
        const bx = last[0] + (belt.mk2Dx ?? 15);
        const by = last[1] + (belt.mk2Dy ?? -10);
        return (
          <g>
            <circle cx={bx} cy={by} r={9} fill="var(--mk2)" opacity={0.9} />
            <text x={bx} y={by + 4} fill="#000" style={{ font: 'bold 9px Orbitron', textAnchor: 'middle' }}>{belt.mk2id}</text>
          </g>
        );
      })()}
    </g>
  );
}

function SplitterIcon({ sp }: { sp: Splitter }) {
  if (sp.type === 'split') {
    const sz = 5;
    return <polygon points={`${sp.x},${sp.y - sz} ${sp.x + sz},${sp.y} ${sp.x},${sp.y + sz} ${sp.x - sz},${sp.y}`} fill="var(--splitter-split)" opacity={0.9} />;
  }
  return <circle cx={sp.x} cy={sp.y} r={5} fill="var(--splitter-merge)" opacity={0.9} />;
}

function LiftBox({ lift }: { lift: Lift }) {
  const x = cmx(lift.col) - 25;
  const y = cmy(lift.row) - 12;
  const isSpare = lift.id === 'lift_spare2';
  return (
    <g>
      <rect className={`lift-box${isSpare ? ' lift-box-spare' : ''}`} x={x} y={y} width={50} height={24} />
      <text className="lift-label" x={x + 25} y={y + 15} textAnchor="middle">
        {isSpare ? '预留口' : `↑${lift.material === 'plate' ? '板' : '棒'}${lift.targetFloor ? `→${lift.targetFloor}F` : ''}`}
      </text>
    </g>
  );
}

function PoleCircle({ p }: { p: Pole }) {
  const x = cmx(p.col);
  const y = cmy(p.row);
  return (
    <g>
      <circle className="power-pole-circle" cx={x} cy={y} r={11} />
      <text className="power-pole-label" x={x} y={y + 4} textAnchor="middle">{p.id}</text>
      <text x={x} y={y + 20} fill="var(--dim)" style={{ font: '8px Noto Sans SC', textAnchor: 'middle' }}>{p.used}/4</text>
    </g>
  );
}

interface MachineGroupProps {
  m: Machine;
  onHover: (m: Machine, el: Element) => void;
  onLeave: () => void;
  onClick: (m: Machine) => void;
}

function MachineGroup({ m, onHover, onLeave, onClick }: MachineGroupProps) {
  const footprint = machineFootprintRect(m);
  const body = machineBodyRect(m);
  const labelX = body.x + body.w / 2;
  const labelY = body.y + body.h / 2;
  const isStorage = m.type === 'storage';
  const showSubLabel = m.body.h > 0.95;
  const rateY = body.y + body.h - 8;

  return (
    <g className="machine-group" onMouseEnter={e => onHover(m, e.currentTarget)} onMouseLeave={onLeave} onClick={() => onClick(m)}>
      <rect className="machine-hitbox" x={footprint.x} y={footprint.y} width={footprint.w} height={footprint.h} rx={8} />
      <rect className="machine-glow" x={body.x - 4} y={body.y - 4} width={body.w + 8} height={body.h + 8} rx={10} fill={m.color} opacity={0} />
      <rect className={`machine-footprint${isStorage ? ' storage-footprint' : ''}`} x={footprint.x} y={footprint.y} width={footprint.w} height={footprint.h} rx={7} />
      <rect
        className={`machine-body${isStorage ? ' storage-body' : ''}`}
        x={body.x}
        y={body.y}
        width={body.w}
        height={body.h}
        rx={6}
        fill={m.color}
        opacity={isStorage ? 0.55 : 0.76}
        stroke={m.color}
        strokeWidth={1}
        strokeOpacity={0.85}
      />
      <text className="machine-label" x={labelX} y={labelY - (showSubLabel ? 6 : 0)} textAnchor="middle" dominantBaseline="middle">
        {m.name.split(' ')[0]}
      </text>
      {showSubLabel && (
        <text className="machine-sub" x={labelX} y={labelY + 10} textAnchor="middle">
          {m.name.split(' ').slice(1).join(' ')}
        </text>
      )}
      <text className="machine-rate" x={labelX} y={rateY} textAnchor="middle">
        {m.power ? `${m.power}MW` : ''}{m.eff !== 100 && <tspan fill="var(--mk2)"> {m.eff}%</tspan>}
      </text>
    </g>
  );
}

function PowerLinesGroup({ floor, machines }: { floor: string; machines: Machine[] }) {
  const pairs = POWER_PAIRS[floor] || [];
  return (
    <g className="layer-power">
      {pairs.map(([a, b]) => {
        const pa = POLES[a];
        const pb = POLES[b];
        if (!pa || !pb) return null;
        return <line key={`${a}-${b}`} x1={cmx(pa.col)} y1={cmy(pa.row)} x2={cmx(pb.col)} y2={cmy(pb.row)} className="power-trunk" />;
      })}
      {machines.filter(m => m.power > 0).map(m => {
        const p = POLES[m.pole];
        if (!p) return null;
        const [mx, my] = machinePortPoint(m, 'power');
        return <line key={`pw-${m.id}`} x1={cmx(p.col)} y1={cmy(p.row)} x2={mx} y2={my} className="power-line" />;
      })}
    </g>
  );
}

interface FloorContentProps {
  floor: number;
  layers: LayerState;
  onMachineHover: (m: Machine, el: Element) => void;
  onMachineLeave: () => void;
  onMachineClick: (m: Machine) => void;
  showGrid?: boolean;
}

const FloorContent = memo(function FloorContent({ floor, layers, onMachineHover, onMachineLeave, onMachineClick, showGrid = true }: FloorContentProps) {
  const f = String(floor);
  const machines = Object.values(MACHINES).filter(m => String(m.floor) === f);
  const belts = BELTS.filter(b => String(b.floor) === f);
  const splitters = SPLITTERS.filter(sp => String(sp.floor) === f);
  const lifts = LIFTS.filter(l => String(l.floor) === f);
  const poles = Object.values(POLES).filter(p => String(p.floor) === f);

  return (
    <>
      {showGrid && <Grid floor={floor} />}
      <ZoneLayer floor={floor} />
      {showGrid && <CorridorLabels floor={floor} />}
      {layers.power && <PowerLinesGroup floor={f} machines={machines} />}
      {layers.belt && belts.filter(b => !b.mk2 || layers.mk2).map((b, i) => <BeltLine key={i} belt={b} />)}
      {layers.belt && splitters.map((sp, i) => <SplitterIcon key={i} sp={sp} />)}
      {lifts.map(l => <LiftBox key={l.id} lift={l} />)}
      {machines.filter(m => m.type !== 'storage' || layers.storage).map(m => (
        <MachineGroup key={m.id} m={m} onHover={onMachineHover} onLeave={onMachineLeave} onClick={onMachineClick} />
      ))}
      {layers.power && poles.map(p => <PoleCircle key={p.id} p={p} />)}
      {f === '1' && layers.power && (
        <g className="layer-power">
          <line x1={cx(0) - 30} y1={cmy(6.2)} x2={cmx(0) - 11} y2={cmy(6.2)} stroke="#ff5252" strokeWidth={3} strokeDasharray="6,6" className="belt-line" />
          <text x={cx(0) - 35} y={cmy(6.2) + 4} fill="#ff5252" style={{ font: 'bold 9px Noto Sans SC', textAnchor: 'end' }}>外部供电</text>
        </g>
      )}
    </>
  );
}, (prev, next) =>
  prev.floor === next.floor &&
  prev.layers === next.layers &&
  prev.showGrid === next.showGrid
);

const SectionContent = memo(function SectionContent({ layers, onMachineHover, onMachineLeave, onMachineClick }: Omit<FloorContentProps, 'floor' | 'showGrid'>) {
  const topRows = floorRows(2);
  const bottomRows = floorRows(1);
  const floorOffset = C.h * topRows + PAD.y + 50;

  return (
    <>
      <g transform="translate(0, 10)">
        <rect x={PAD.x - 5} y={PAD.y - 15} width={C.w * 8 + 10} height={C.h * topRows + 20} rx={8} fill="none" stroke="var(--screw)" strokeOpacity={0.3} strokeWidth={1} />
        <text x={PAD.x} y={PAD.y - 20} fill="var(--screw)" style={{ font: 'bold 12px Orbitron' }}>2F 组件+组装层 · 南扩前场</text>
        <FloorContent floor={2} layers={layers} onMachineHover={onMachineHover} onMachineLeave={onMachineLeave} onMachineClick={onMachineClick} showGrid={false} />
      </g>

      <g transform={`translate(0, ${floorOffset})`}>
        <rect x={PAD.x - 5} y={PAD.y - 15} width={C.w * 8 + 10} height={C.h * bottomRows + 20} rx={8} fill="none" stroke="var(--smelter)" strokeOpacity={0.3} strokeWidth={1} />
        <text x={PAD.x} y={PAD.y - 20} fill="var(--smelter)" style={{ font: 'bold 12px Orbitron' }}>1F 冶炼+基础加工层</text>
        <FloorContent floor={1} layers={layers} onMachineHover={onMachineHover} onMachineLeave={onMachineLeave} onMachineClick={onMachineClick} showGrid={false} />
      </g>

      {[
        { x: cmx(1.2), color: 'var(--plate)', label: '板' },
        { x: cmx(4.7), color: 'var(--rod)', label: '棒' },
      ].map(({ x, color, label }) => {
        const y1 = 10 + cy(topRows) + 5;
        const y2 = floorOffset + PAD.y - 5;
        return (
          <g key={label}>
            <line x1={x} y1={y1} x2={x} y2={y2} stroke={color} strokeWidth={3} strokeDasharray="6,4" opacity={0.6} />
            <text x={x + 8} y={(y1 + y2) / 2 + 4} fill={color} style={{ font: 'bold 9px Orbitron' }}>{label}↑</text>
          </g>
        );
      })}

      {layers.power && (() => {
        const px = cmx(7);
        const y1f = floorOffset + cmy(3.5);
        const y2f = 10 + cmy(0.3);
        return (
          <g className="layer-power">
            <line x1={px} y1={y1f} x2={cmx(3)} y2={y2f} stroke="var(--power)" strokeWidth={2} strokeDasharray="4,6" opacity={0.5} />
            <text x={px - 20} y={(y1f + y2f) / 2} fill="var(--power)" style={{ font: '8px Orbitron' }}>F→G ⚡</text>
          </g>
        );
      })()}
    </>
  );
}, (prev, next) => prev.layers === next.layers);

interface FloorViewProps {
  floor: string;
  layers: LayerState;
  onMachineClick: (m: Machine) => void;
}

export default function FloorView({ floor, layers, onMachineClick }: FloorViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredMachine, setHoveredMachine] = useState<Machine | null>(null);

  const { floatingStyles, refs } = useFloating({
    placement: 'right-start',
    middleware: [offset(15), flip(), shift({ padding: 10 })],
    whileElementsMounted: autoUpdate,
  });

  const handleMachineHover = useCallback((m: Machine, el: Element) => {
    refs.setReference(el);
    setHoveredMachine(m);
  }, [refs]);

  const handleMachineLeave = useCallback(() => {
    setHoveredMachine(null);
  }, []);

  const isSection = floor === 'section';
  const initialHeight = isSection ? sectionViewHeight() : floorViewHeight(Number(floor));
  const viewBoxRef = useRef({ x: 0, y: 0, w: VIEW_W, h: initialHeight });

  const updateSvgViewBox = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const vb = viewBoxRef.current;
    svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
  }, []);

  useEffect(() => {
    const h = floor === 'section' ? sectionViewHeight() : floorViewHeight(Number(floor));
    viewBoxRef.current = { x: 0, y: 0, w: VIEW_W, h };
    updateSvgViewBox();
  }, [floor, updateSvgViewBox]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const maxW = VIEW_W * 3;
    const minW = VIEW_W * 0.3;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const prev = viewBoxRef.current;
      const mx = prev.x + (e.clientX - rect.left) / rect.width * prev.w;
      const my = prev.y + (e.clientY - rect.top) / rect.height * prev.h;
      const scale = e.deltaY > 0 ? 1.1 : 1 / 1.1;
      const nw = prev.w * scale;
      const nh = prev.h * scale;
      if (nw < minW || nw > maxW) return;
      viewBoxRef.current = {
        x: mx - (mx - prev.x) * scale,
        y: my - (my - prev.y) * scale,
        w: nw,
        h: nh,
      };
      updateSvgViewBox();
    };
    svg.addEventListener('wheel', handleWheel, { passive: false });
    return () => svg.removeEventListener('wheel', handleWheel);
  }, [updateSvgViewBox]);

  const panRef = useRef({ active: false, sx: 0, sy: 0, vx: 0, vy: 0 });

  const onMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    const vb = viewBoxRef.current;
    panRef.current = { active: true, sx: e.clientX, sy: e.clientY, vx: vb.x, vy: vb.y };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!panRef.current.active) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const vb = viewBoxRef.current;
    const dx = (e.clientX - panRef.current.sx) / rect.width * vb.w;
    const dy = (e.clientY - panRef.current.sy) / rect.height * vb.h;
    viewBoxRef.current = { ...vb, x: panRef.current.vx - dx, y: panRef.current.vy - dy };
    updateSvgViewBox();
  }, [updateSvgViewBox]);

  const onMouseUp = useCallback(() => {
    panRef.current.active = false;
  }, []);

  const initVb = viewBoxRef.current;

  return (
    <div className="canvas-area">
      <svg
        ref={svgRef}
        viewBox={`${initVb.x} ${initVb.y} ${initVb.w} ${initVb.h}`}
        xmlns="http://www.w3.org/2000/svg"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {isSection ? (
          <SectionContent layers={layers} onMachineHover={handleMachineHover} onMachineLeave={handleMachineLeave} onMachineClick={onMachineClick} />
        ) : (
          <FloorContent floor={Number(floor)} layers={layers} onMachineHover={handleMachineHover} onMachineLeave={handleMachineLeave} onMachineClick={onMachineClick} />
        )}
      </svg>

      <AnimatePresence>
        {hoveredMachine && (
          <motion.div
            ref={refs.setFloating}
            style={floatingStyles}
            className="tooltip"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            <MachineTooltip machine={hoveredMachine} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="zoom-hint">滚轮缩放 · 拖拽平移</div>
    </div>
  );
}
