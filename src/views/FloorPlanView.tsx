import { useCallback, useRef, type WheelEvent } from 'react';
import type { Scheme } from '../core/types';
import { calcViewBox } from '../core/coordinate';
import { useAppStore } from '../store/useAppStore';
import { GridRenderer } from '../renderers/GridRenderer';
import { ZoneRenderer } from '../renderers/ZoneRenderer';
import { MachineRenderer } from '../renderers/MachineRenderer';
import { BeltRenderer } from '../renderers/BeltRenderer';
import { BeltLabelLayer } from '../renderers/BeltLabelLayer';
import { FlowLabelLayer } from '../renderers/FlowLabelLayer';
import { LiftOverlay } from '../renderers/LiftRenderer';

interface FloorPlanViewProps {
  scheme: Scheme;
  floorId: number;
}

export function FloorPlanView({ scheme, floorId }: FloorPlanViewProps) {
  const viewport = useAppStore(s => s.viewport);
  const layers = useAppStore(s => s.layers);
  const highlightChain = useAppStore(s => s.highlightChain);
  const selectedId = useAppStore(s => s.selectedId);
  const beltFlows = useAppStore(s => s.beltFlows);
  const materialMap = useAppStore(s => s.materialMap);
  const setViewport = useAppStore(s => s.setViewport);
  const hover = useAppStore(s => s.hover);
  const select = useAppStore(s => s.select);
  const clearHighlight = useAppStore(s => s.clearHighlight);

  const svgRef = useRef<SVGSVGElement>(null);

  const toggleBeltSelect = useCallback((id: string) => {
    if (id === selectedId) clearHighlight();
    else select(id);
  }, [selectedId, select, clearHighlight]);

  const floor = scheme.floors.find(f => f.id === floorId);
  if (!floor) return null;

  const { cols, rows } = floor.gridSize;
  const baseViewBox = calcViewBox(cols, rows);

  const onWheel = useCallback((e: WheelEvent) => {
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.3, Math.min(3, viewport.zoom * delta));
    setViewport({ zoom: newZoom });
  }, [viewport.zoom, setViewport]);

  const machines = scheme.machines.filter(m => m.floor === floorId);
  const belts = scheme.belts.filter(b => b.floor === floorId);
  const zones = scheme.zones.filter(z => z.floor === floorId);
  const hasHighlight = highlightChain.length > 0;
  const isHighlighted = (id: string) => highlightChain.includes(id);
  const isDimmed = (id: string) => hasHighlight && !isHighlighted(id);

  return (
    <svg
      ref={svgRef}
      viewBox={baseViewBox}
      overflow="visible"
      style={{
        transform: `scale(${viewport.zoom}) translate(${viewport.panX / viewport.zoom}px, ${viewport.panY / viewport.zoom}px)`,
        transformOrigin: 'center center',
        overflow: 'visible',
      }}
      onWheel={onWheel}
    >
      <GridRenderer cols={cols} rows={rows} />
      {layers.zones && zones.map(z => <ZoneRenderer key={z.id} zone={z} />)}
      {machines.filter(m => layers.storage || (m.type !== 'storage' && m.type !== 'industrial-storage')).map(m => (
        <MachineRenderer key={m.id} machine={m} highlight={isHighlighted(m.id)} dimmed={isDimmed(m.id)} onHover={hover} onClick={select} />
      ))}
      {layers.belts && belts.map(b => (
        <BeltRenderer key={b.id} belt={b} machines={scheme.machines} materialMap={materialMap} highlight={isHighlighted(b.id)} selected={b.id === selectedId} dimmed={isDimmed(b.id)} onHover={hover} onClick={select} />
      ))}
      {layers.belts && layers.showBeltLabel && (
        <BeltLabelLayer belts={belts} machines={scheme.machines} materialMap={materialMap} highlightChain={highlightChain} selectedId={selectedId} onHover={hover} onClick={toggleBeltSelect} />
      )}
      {layers.beltFlow && layers.belts && (
        <FlowLabelLayer belts={belts} machines={scheme.machines} materialMap={materialMap} beltFlows={beltFlows} highlightChain={highlightChain} selectedId={selectedId} onHover={hover} onClick={toggleBeltSelect} />
      )}
      <LiftOverlay
        pairs={scheme.liftPairs}
        machines={scheme.machines}
        materialMap={materialMap}
        floorId={floorId}
        highlightChain={highlightChain}
        onHover={hover}
        onClick={select}
      />
    </svg>
  );
}
