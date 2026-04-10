import { useRef, useCallback, type WheelEvent, type MouseEvent } from 'react';
import type { Scheme } from '../core/types';
import { calcViewBox } from '../core/coordinate';
import { useAppStore } from '../store/useAppStore';
import { GridRenderer } from '../renderers/GridRenderer';
import { ZoneRenderer } from '../renderers/ZoneRenderer';
import { MachineRenderer } from '../renderers/MachineRenderer';
import { BeltRenderer } from '../renderers/BeltRenderer';
import { BeltLabelLayer } from '../renderers/BeltLabelLayer';
import { LiftRenderer } from '../renderers/LiftRenderer';
import { StructureRenderer } from '../renderers/StructureRenderer';

interface FloorPlanViewProps {
  scheme: Scheme;
  floorId: number;
}

export function FloorPlanView({ scheme, floorId }: FloorPlanViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });

  const viewport = useAppStore(s => s.viewport);
  const layers = useAppStore(s => s.layers);
  const highlightChain = useAppStore(s => s.highlightChain);
  const selectedId = useAppStore(s => s.selectedId);
  const setViewport = useAppStore(s => s.setViewport);
  const hover = useAppStore(s => s.hover);
  const select = useAppStore(s => s.select);

  const floor = scheme.floors.find(f => f.id === floorId);
  if (!floor) return null;

  const { cols, rows } = floor.gridSize;
  const baseViewBox = calcViewBox(cols, rows);

  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.3, Math.min(3, viewport.zoom * delta));
    setViewport({ zoom: newZoom });
  }, [viewport.zoom, setViewport]);

  const onMouseDown = useCallback((e: MouseEvent) => {
    if (e.button !== 0) return;
    isPanning.current = true;
    panStart.current = { x: e.clientX - viewport.panX, y: e.clientY - viewport.panY };
  }, [viewport.panX, viewport.panY]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanning.current) return;
    setViewport({
      panX: e.clientX - panStart.current.x,
      panY: e.clientY - panStart.current.y,
    });
  }, [setViewport]);

  const onMouseUp = useCallback(() => { isPanning.current = false; }, []);

  const machines = scheme.machines.filter(m => m.floor === floorId);
  const belts = scheme.belts.filter(b => b.floor === floorId);
  const lifts = scheme.lifts.filter(l => l.fromFloor === floorId || l.toFloor === floorId);
  const zones = scheme.zones.filter(z => z.floor === floorId);
  const structures = scheme.structures.filter(s => s.floor === floorId);

  const hasHighlight = highlightChain.length > 0;
  const isHighlighted = (id: string) => highlightChain.includes(id);
  const isDimmed = (id: string) => hasHighlight && !isHighlighted(id);

  return (
    <svg
      ref={svgRef}
      viewBox={baseViewBox}
      style={{
        transform: `scale(${viewport.zoom}) translate(${viewport.panX / viewport.zoom}px, ${viewport.panY / viewport.zoom}px)`,
        transformOrigin: 'center center',
        cursor: isPanning.current ? 'grabbing' : 'grab',
      }}
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <GridRenderer cols={cols} rows={rows} />
      {layers.zones && zones.map(z => <ZoneRenderer key={z.id} zone={z} />)}
      {layers.structures && structures.map(s => (
        <StructureRenderer key={s.id} structure={s} dimmed={isDimmed(s.id)} />
      ))}
      {machines.filter(m => layers.storage || (m.type !== 'storage' && m.type !== 'industrial-storage')).map(m => (
        <MachineRenderer key={m.id} machine={m} highlight={isHighlighted(m.id)} dimmed={isDimmed(m.id)} onHover={hover} onClick={select} />
      ))}
      {layers.belts && belts.map(b => (
        <BeltRenderer key={b.id} belt={b} machines={scheme.machines} highlight={isHighlighted(b.id)} selected={b.id === selectedId} dimmed={isDimmed(b.id)} onHover={hover} onClick={select} />
      ))}
      {layers.belts && (
        <BeltLabelLayer belts={belts} machines={scheme.machines} highlightChain={highlightChain} selectedId={selectedId} onHover={hover} onClick={select} />
      )}
      {lifts.map(l => (
        <LiftRenderer key={l.id} lift={l} highlight={isHighlighted(l.id)} dimmed={isDimmed(l.id)} onHover={hover} />
      ))}
    </svg>
  );
}
