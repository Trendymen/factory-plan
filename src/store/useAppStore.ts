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
  const material = belt.material;

  function traceUp(fromPort: string | undefined) {
    if (!fromPort) return;
    const machineId = fromPort.split(':')[0];
    ids.add(machineId);
    for (const b of scheme.belts) {
      if (b.toPort?.startsWith(machineId + ':') && !ids.has(b.id)) {
        ids.add(b.id);
        traceUp(b.fromPort);
      }
    }
    for (const l of scheme.lifts) {
      if (l.material === material && !ids.has(l.id)) {
        if (l.connectedBelts?.some(bid => ids.has(bid))) ids.add(l.id);
      }
    }
  }

  function traceDown(toPort: string | undefined) {
    if (!toPort) return;
    const machineId = toPort.split(':')[0];
    ids.add(machineId);
    for (const b of scheme.belts) {
      if (b.fromPort?.startsWith(machineId + ':') && !ids.has(b.id)) {
        ids.add(b.id);
        traceDown(b.toPort);
      }
    }
    for (const l of scheme.lifts) {
      if (l.material === material && !ids.has(l.id)) {
        if (l.connectedBelts?.some(bid => ids.has(bid))) ids.add(l.id);
      }
    }
  }

  traceUp(belt.fromPort);
  traceDown(belt.toPort);
  return [...ids];
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
  select: (id: string | null) => void;
  setHighlightChain: (ids: string[]) => void;
  clearHighlight: () => void;
}

const DEFAULT_VIEWPORT: Viewport = { zoom: 1, panX: 0, panY: 0 };

const DEFAULT_LAYERS: Layers = {
  belts: true,
  power: true,
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
  highlightChain: [],

  setSchemes: (schemes) => set({ schemes }),

  loadScheme: (scheme) => set({
    currentSchemeId: scheme.id,
    currentScheme: scheme,
    currentFloor: scheme.floors[0]?.id ?? 1,
    viewport: { ...DEFAULT_VIEWPORT },
    hoveredId: null,
    selectedId: null,
    highlightChain: [],
  }),

  setViewMode: (viewMode) => set({ viewMode }),
  setFloor: (currentFloor) => set({ currentFloor }),
  setSectionCut: (sectionCut) => set({ sectionCut }),
  setViewport: (vp) => set((s) => ({ viewport: { ...s.viewport, ...vp } })),
  resetViewport: () => set({ viewport: { ...DEFAULT_VIEWPORT } }),
  toggleLayer: (key) => set((s) => ({ layers: { ...s.layers, [key]: !s.layers[key] } })),
  hover: (hoveredId) => set({ hoveredId }),
  select: (selectedId) => set((s) => {
    if (!selectedId || !s.currentScheme) return { selectedId, highlightChain: [] };
    const isBelt = s.currentScheme.belts.some(b => b.id === selectedId);
    if (isBelt) {
      const chain = traceChain(s.currentScheme, selectedId);
      return { selectedId, highlightChain: chain };
    }
    return { selectedId, highlightChain: [] };
  }),
  setHighlightChain: (highlightChain) => set({ highlightChain }),
  clearHighlight: () => set({ highlightChain: [], selectedId: null }),
}));
