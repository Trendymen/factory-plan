import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react';
import { AnimatePresence, motion } from 'motion/react';
import MachineTooltip from './MachineTooltip';
import type { LayerState } from '../App';
import {
  type Machine, type Belt, type Splitter, type Lift, type Pole,
  C, PAD, cx, cy, cmx, cmy, VIEW_W, VIEW_H,
  MACHINES, POLES, BELTS, SPLITTERS, LIFTS, POWER_PAIRS,
} from '../data/factory';

// ============================
// SVG HELPER COMPONENTS
// ============================

function Grid() {
  return (
    <g>
      {Array.from({ length: 9 }, (_, c) => (
        <line key={`v${c}`} x1={cx(c)} y1={cy(0) - 10} x2={cx(c)} y2={cy(7) + 5} className="grid-line" />
      ))}
      {Array.from({ length: 8 }, (_, r) => (
        <line key={`h${r}`} x1={cx(0) - 10} y1={cy(r)} x2={cx(8) + 5} y2={cy(r)} className="grid-line" />
      ))}
      {Array.from({ length: 8 }, (_, c) => (
        <text key={`cl${c}`} x={cmx(c)} y={cy(0) - 15} fill="#333" style={{ font: '9px JetBrains Mono', textAnchor: 'middle' }}>{c + 1}</text>
      ))}
      {Array.from({ length: 7 }, (_, r) => (
        <text key={`rl${r}`} x={cx(0) - 18} y={cmy(r) + 3} fill="#333" style={{ font: '9px JetBrains Mono', textAnchor: 'middle' }}>{r + 1}</text>
      ))}
    </g>
  );
}

function CorridorLabels({ floor }: { floor: string }) {
  if (floor === '1') return (
    <g>
      <text x={cmx(3)} y={cmy(0.5) + 4} fill="var(--dim)" style={{ font: '10px Noto Sans SC', textAnchor: 'middle', letterSpacing: '4px' }}>矿石输入</text>
      <text x={cmx(3)} y={cmy(3) + 4} fill="var(--dim)" style={{ font: '9px Noto Sans SC', textAnchor: 'middle', letterSpacing: '2px' }}>铁锭分流走廊</text>
      <rect x={cx(3) + 2} y={cy(1) + 2} width={C.w - 4} height={C.h * 2 - 4} rx={4} fill="none" stroke="var(--border)" strokeDasharray="4,3" />
      <text x={cmx(3)} y={cmy(1.5) + 4} fill="#2a2a3a" style={{ font: '10px Noto Sans SC', textAnchor: 'middle' }}>走道</text>
      <text x={cmx(3.5)} y={cmy(6.5) + 4} fill="var(--dim)" style={{ font: '9px Noto Sans SC', textAnchor: 'middle', letterSpacing: '2px' }}>升降机 · 输出</text>
    </g>
  );
  if (floor === '2') return (
    <g>
      <text x={cmx(3)} y={cmy(0.2)} fill="var(--dim)" style={{ font: '9px Noto Sans SC', textAnchor: 'middle', letterSpacing: '2px' }}>升降机到达 · 铁棒分流</text>
      <text x={cmx(3)} y={cmy(3.3) + 4} fill="var(--dim)" style={{ font: '9px Noto Sans SC', textAnchor: 'middle', letterSpacing: '2px' }}>螺丝分流走廊</text>
      <rect x={cx(3) + 2} y={cy(1) + 2} width={C.w - 4} height={C.h * 2 - 4} rx={4} fill="none" stroke="var(--border)" strokeDasharray="4,3" />
      <text x={cmx(3)} y={cmy(1.5) + 4} fill="#2a2a3a" style={{ font: '10px Noto Sans SC', textAnchor: 'middle' }}>走道</text>
      <text x={cmx(3.5)} y={cmy(6.3) + 4} fill="var(--dim)" style={{ font: '9px Noto Sans SC', textAnchor: 'middle', letterSpacing: '2px' }}>储存 · 产出</text>
    </g>
  );
  return null;
}

function BeltLine({ belt }: { belt: Belt }) {
  const pts = belt.points.map(p => p.join(',')).join(' ');
  const col = belt.mk2 ? 'var(--mk2)' : belt.color;

  // Arrow at midpoint of last segment
  const p1 = belt.points[belt.points.length - 2];
  const p2 = belt.points[belt.points.length - 1];
  const dx = p2[0] - p1[0], dy = p2[1] - p1[1];
  const segLen = Math.sqrt(dx * dx + dy * dy);

  let arrow: React.ReactNode = null;
  if (segLen > 18) {
    const ax = p1[0] + dx * 0.5, ay = p1[1] + dy * 0.5;
    const ang = Math.atan2(dy, dx), cs = Math.cos(ang), sn = Math.sin(ang), sz = 5;
    arrow = (
      <polygon
        points={`${ax + cs * sz},${ay + sn * sz} ${ax - cs * sz * 0.5 - sn * sz * 0.6},${ay - sn * sz * 0.5 + cs * sz * 0.6} ${ax - cs * sz * 0.5 + sn * sz * 0.6},${ay - sn * sz * 0.5 - cs * sz * 0.6}`}
        fill={col} opacity={0.9}
      />
    );
  }

  const mid = belt.points[Math.floor(belt.points.length / 2)];

  return (
    <g>
      <polyline points={pts} className={`belt-line${belt.mk2 ? ' mk2-upgrade' : ''}`} stroke={col} fill="none" />
      {arrow}
      {belt.label && <text x={mid[0] + (belt.labelDx ?? 5)} y={mid[1] + (belt.labelDy ?? -5)} className="belt-rate-label">{belt.label}</text>}
      {belt.mk2 && belt.mk2id && (() => {
        const last = belt.points[belt.points.length - 1];
        const bx = last[0] + (belt.mk2Dx ?? 15), by = last[1] + (belt.mk2Dy ?? -10);
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
  const x = cmx(lift.col) - 25, y = cmy(lift.row) - 12;
  return (
    <g>
      <rect className="lift-box" x={x} y={y} width={50} height={24} />
      <text className="lift-label" x={x + 25} y={y + 15} textAnchor="middle">
        ↑{lift.material === 'plate' ? '板' : '棒'}{lift.targetFloor ? `→${lift.targetFloor}F` : ''}
      </text>
    </g>
  );
}

function PoleCircle({ p }: { p: Pole }) {
  const x = cmx(p.col), y = cmy(p.row);
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
  const x = cx(m.col) + 3, y = cy(m.row) + 3;
  const w = m.w * C.w - 6, h = m.h * C.h - 6;
  const isStorage = m.type === 'storage';
  return (
    <g className="machine-group" onMouseEnter={e => onHover(m, e.currentTarget)} onMouseLeave={onLeave} onClick={() => onClick(m)}>
      <rect className="machine-glow" x={x - 3} y={y - 3} width={w + 6} height={h + 6} rx={8} fill={m.color} opacity={0} />
      <rect className={`machine-body${isStorage ? ' storage-body' : ''}`} x={x} y={y} width={w} height={h} rx={5}
        fill={m.color} opacity={isStorage ? 0.5 : 0.7} stroke={m.color} strokeWidth={1} strokeOpacity={0.8} />
      <text className="machine-label" x={x + w / 2} y={y + h / 2 - (m.h > 1 ? 6 : 0)} textAnchor="middle" dominantBaseline="middle">
        {m.name.split(' ')[0]}
      </text>
      {m.h > 1 && (
        <text className="machine-sub" x={x + w / 2} y={y + h / 2 + 10} textAnchor="middle">
          {m.name.split(' ').slice(1).join(' ')}
        </text>
      )}
      <text className="machine-rate" x={x + w / 2} y={y + h - 8} textAnchor="middle">
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
        const pa = POLES[a], pb = POLES[b];
        if (!pa || !pb) return null;
        return <line key={`${a}-${b}`} x1={cmx(pa.col)} y1={cmy(pa.row)} x2={cmx(pb.col)} y2={cmy(pb.row)} className="power-trunk" />;
      })}
      {machines.filter(m => m.power > 0).map(m => {
        const p = POLES[m.pole];
        if (!p) return null;
        return <line key={`pw-${m.id}`} x1={cmx(p.col)} y1={cmy(p.row)} x2={cx(m.col) + m.w * C.w / 2} y2={cy(m.row) + m.h * C.h / 2} className="power-line" />;
      })}
    </g>
  );
}

// ============================
// FLOOR CONTENT (single floor)
// ============================

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
      {showGrid && <Grid />}
      {showGrid && <CorridorLabels floor={f} />}
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

// ============================
// SECTION VIEW (both floors)
// ============================

const SectionContent = memo(function SectionContent({ layers, onMachineHover, onMachineLeave, onMachineClick }: Omit<FloorContentProps, 'floor' | 'showGrid'>) {
  const floorOffset = C.h * 7 + PAD.y + 40;
  return (
    <>
      {/* Floor 2 on top */}
      <g transform="translate(0, 10)">
        <rect x={PAD.x - 5} y={PAD.y - 15} width={C.w * 8 + 10} height={C.h * 7 + 20} rx={6} fill="none" stroke="var(--screw)" strokeOpacity={0.3} strokeWidth={1} />
        <text x={PAD.x} y={PAD.y - 20} fill="var(--screw)" style={{ font: 'bold 12px Orbitron' }}>2F 组件+组装层</text>
        <FloorContent floor={2} layers={layers} onMachineHover={onMachineHover} onMachineLeave={onMachineLeave} onMachineClick={onMachineClick} showGrid={false} />
      </g>

      {/* Floor 1 below */}
      <g transform={`translate(0, ${floorOffset})`}>
        <rect x={PAD.x - 5} y={PAD.y - 15} width={C.w * 8 + 10} height={C.h * 7 + 20} rx={6} fill="none" stroke="var(--smelter)" strokeOpacity={0.3} strokeWidth={1} />
        <text x={PAD.x} y={PAD.y - 20} fill="var(--smelter)" style={{ font: 'bold 12px Orbitron' }}>1F 冶炼+基础加工层</text>
        <FloorContent floor={1} layers={layers} onMachineHover={onMachineHover} onMachineLeave={onMachineLeave} onMachineClick={onMachineClick} showGrid={false} />
      </g>

      {/* Lift connections */}
      {[
        { x: cmx(1.2), color: 'var(--plate)', label: '板' },
        { x: cmx(4.7), color: 'var(--rod)', label: '棒' },
      ].map(({ x, color, label }) => {
        const y1 = 10 + cy(7) + 5;
        const y2 = floorOffset + PAD.y - 5;
        return (
          <g key={label}>
            <line x1={x} y1={y1} x2={x} y2={y2} stroke={color} strokeWidth={3} strokeDasharray="6,4" opacity={0.6} />
            <text x={x + 8} y={(y1 + y2) / 2 + 4} fill={color} style={{ font: 'bold 9px Orbitron' }}>{label}↑</text>
          </g>
        );
      })}

      {/* Power connection */}
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

// ============================
// MAIN FLOOR VIEW
// ============================

interface FloorViewProps {
  floor: string;
  layers: LayerState;
  onMachineClick: (m: Machine) => void;
}

export default function FloorView({ floor, layers, onMachineClick }: FloorViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredMachine, setHoveredMachine] = useState<Machine | null>(null);

  // Floating UI tooltip
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

  // ViewBox zoom/pan — use ref to avoid re-renders
  const isSection = floor === 'section';
  const viewBoxRef = useRef({ x: 0, y: 0, w: VIEW_W, h: isSection ? C.h * 7 * 2 + PAD.y * 3 + 60 : VIEW_H });

  const updateSvgViewBox = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const vb = viewBoxRef.current;
    svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
  }, []);

  // Reset viewBox on floor change
  useEffect(() => {
    const h = floor === 'section' ? C.h * 7 * 2 + PAD.y * 3 + 60 : VIEW_H;
    viewBoxRef.current = { x: 0, y: 0, w: VIEW_W, h };
    updateSvgViewBox();
  }, [floor, updateSvgViewBox]);

  // Wheel zoom (non-passive)
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
      viewBoxRef.current = { x: mx - (mx - prev.x) * scale, y: my - (my - prev.y) * scale, w: nw, h: nh };
      updateSvgViewBox();
    };
    svg.addEventListener('wheel', handleWheel, { passive: false });
    return () => svg.removeEventListener('wheel', handleWheel);
  }, [updateSvgViewBox]);

  // Mouse drag to pan
  const panRef = useRef<{ active: boolean; sx: number; sy: number; vx: number; vy: number }>({ active: false, sx: 0, sy: 0, vx: 0, vy: 0 });

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

  const onMouseUp = useCallback(() => { panRef.current.active = false; }, []);

  // Initial viewBox
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

      {/* Floating tooltip */}
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
