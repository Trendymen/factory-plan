// src/store/useAppStore.ts
import { create } from 'zustand';
import type {
  Scheme, SchemeIndex, ViewMode, Viewport, SectionCut, Layers,
} from '../core/types';

function traceChain(scheme: Scheme, beltId: string): string[] {
  const ids = new Set<string>();
  const belt = scheme.belts.find(b => b.id === beltId);
  if (!belt) return [];

  ids.add(beltId);

  // lift pair 互指索引：machine id → 配对 machine id + pair id
  const pairedMachine = new Map<string, string>();
  const pairIdByMachine = new Map<string, string>();
  for (const p of scheme.liftPairs) {
    pairedMachine.set(p.bottomMachine, p.topMachine);
    pairedMachine.set(p.topMachine, p.bottomMachine);
    pairIdByMachine.set(p.bottomMachine, p.id);
    pairIdByMachine.set(p.topMachine, p.id);
  }

  function visitMachine(machineId: string) {
    if (ids.has(machineId)) return false;
    ids.add(machineId);
    const pairId = pairIdByMachine.get(machineId);
    if (pairId) ids.add(pairId);
    return true;
  }

  function traceUp(machineId: string) {
    if (!visitMachine(machineId)) return;
    for (const b of scheme.belts) {
      if (b.toPort?.startsWith(machineId + ':') && !ids.has(b.id)) {
        ids.add(b.id);
        if (b.fromPort) traceUp(b.fromPort.split(':')[0]);
      }
    }
    // 跨越 lift pair 继续向上游追踪
    const pairedId = pairedMachine.get(machineId);
    if (pairedId) traceUp(pairedId);
  }

  function traceDown(machineId: string) {
    if (!visitMachine(machineId)) return;
    for (const b of scheme.belts) {
      if (b.fromPort?.startsWith(machineId + ':') && !ids.has(b.id)) {
        ids.add(b.id);
        if (b.toPort) traceDown(b.toPort.split(':')[0]);
      }
    }
    const pairedId = pairedMachine.get(machineId);
    if (pairedId) traceDown(pairedId);
  }

  if (belt.fromPort) traceUp(belt.fromPort.split(':')[0]);
  if (belt.toPort) traceDown(belt.toPort.split(':')[0]);
  return [...ids];
}

export interface SelectAnchor {
  x: number;
  y: number;
}

interface AppState {
  schemes: SchemeIndex[];
  currentSchemeId: string | null;
  currentScheme: Scheme | null;
  viewMode: ViewMode;
  currentFloor: number;
  sectionCut: SectionCut | null;
  viewport: Viewport;
  layers: Layers;
  hoveredId: string | null;
  selectedId: string | null;
  selectAnchor: SelectAnchor | null;
  highlightChain: string[];

  setSchemes: (schemes: SchemeIndex[]) => void;
  loadScheme: (scheme: Scheme) => void;
  setViewMode: (mode: ViewMode) => void;
  setFloor: (floor: number) => void;
  setSectionCut: (cut: SectionCut | null) => void;
  setViewport: (vp: Partial<Viewport>) => void;
  resetViewport: () => void;
  toggleLayer: (key: keyof Layers) => void;
  hover: (id: string | null) => void;
  select: (id: string | null, anchor?: SelectAnchor | null) => void;
  setHighlightChain: (ids: string[]) => void;
  clearHighlight: () => void;
}

const DEFAULT_VIEWPORT: Viewport = { zoom: 1, panX: 0, panY: 0 };

const DEFAULT_LAYERS: Layers = {
  belts: true,
  zones: true,
  structures: true,
  storage: true,
};

export const useAppStore = create<AppState>((set) => ({
  schemes: [],
  currentSchemeId: null,
  currentScheme: null,
  viewMode: 'single',
  currentFloor: 1,
  sectionCut: null,
  viewport: { ...DEFAULT_VIEWPORT },
  layers: { ...DEFAULT_LAYERS },
  hoveredId: null,
  selectedId: null,
  selectAnchor: null,
  highlightChain: [],

  setSchemes: (schemes) => set({ schemes }),

  loadScheme: (scheme) => set({
    currentSchemeId: scheme.id,
    currentScheme: scheme,
    currentFloor: scheme.floors[0]?.id ?? 1,
    viewport: { ...DEFAULT_VIEWPORT },
    hoveredId: null,
    selectedId: null,
    selectAnchor: null,
    highlightChain: [],
  }),

  setViewMode: (viewMode) => set({ viewMode }),
  setFloor: (currentFloor) => set({ currentFloor }),
  setSectionCut: (sectionCut) => set({ sectionCut }),
  setViewport: (vp) => set((s) => ({ viewport: { ...s.viewport, ...vp } })),
  resetViewport: () => set({ viewport: { ...DEFAULT_VIEWPORT } }),
  toggleLayer: (key) => set((s) => ({ layers: { ...s.layers, [key]: !s.layers[key] } })),
  hover: (hoveredId) => set({ hoveredId }),
  select: (selectedId, anchor = null) => set((s) => {
    if (!selectedId || !s.currentScheme) {
      return { selectedId, selectAnchor: null, highlightChain: [] };
    }
    const isBelt = s.currentScheme.belts.some(b => b.id === selectedId);
    if (isBelt) {
      const chain = traceChain(s.currentScheme, selectedId);
      return { selectedId, selectAnchor: anchor, highlightChain: chain };
    }
    return { selectedId, selectAnchor: anchor, highlightChain: [] };
  }),
  setHighlightChain: (highlightChain) => set({ highlightChain }),
  clearHighlight: () => set({ highlightChain: [], selectedId: null, selectAnchor: null }),
}));
