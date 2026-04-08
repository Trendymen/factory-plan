import { useEffect } from 'react';
import type { Scheme } from './core/types';
import { validateScheme, buildSchemeIndex } from './core/schema';
import { useAppStore } from './store/useAppStore';
import { TopBar } from './ui/TopBar';
import { LeftPanel } from './ui/LeftPanel';
import { RightPanel } from './ui/RightPanel';
import { MachineTooltip } from './ui/MachineTooltip';
import { MachineDetail } from './ui/MachineDetail';
import { BottomBar } from './ui/BottomBar';
import { FloorPlanView } from './views/FloorPlanView';
import { LinkedFloorView } from './views/LinkedFloorView';
import { CrossSectionView } from './views/CrossSectionView';

const schemeModules = import.meta.glob<Scheme>('/data/schemes/*.json', { eager: false });

async function loadAllSchemeIndexes() {
  const indexes = [];
  for (const [path, loader] of Object.entries(schemeModules)) {
    const mod = await loader() as unknown as { default: Scheme } | Scheme;
    const data = 'default' in mod ? mod.default : mod;
    indexes.push(buildSchemeIndex(data, path));
  }
  return indexes;
}

async function loadSchemeByPath(path: string): Promise<Scheme> {
  const loader = schemeModules[path];
  if (!loader) throw new Error(`Scheme not found: ${path}`);
  const mod = await loader() as unknown as { default: Scheme } | Scheme;
  const data = 'default' in mod ? mod.default : mod;
  const warnings = validateScheme(data);
  if (warnings.length > 0) console.warn(`Scheme "${data.id}" warnings:`, warnings);
  return data;
}

export default function App() {
  const schemes = useAppStore(s => s.schemes);
  const currentScheme = useAppStore(s => s.currentScheme);
  const currentFloor = useAppStore(s => s.currentFloor);
  const viewMode = useAppStore(s => s.viewMode);
  const setSchemes = useAppStore(s => s.setSchemes);
  const loadScheme = useAppStore(s => s.loadScheme);

  useEffect(() => {
    loadAllSchemeIndexes().then(async (indexes) => {
      setSchemes(indexes);
      if (indexes.length > 0) {
        const first = await loadSchemeByPath(indexes[0].filePath);
        loadScheme(first);
      }
    });
  }, [setSchemes, loadScheme]);

  useEffect(() => {
    (window as any).__factoryPlan = {
      importScheme: (json: string | object) => {
        const data: Scheme = typeof json === 'string' ? JSON.parse(json) : json;
        const warnings = validateScheme(data);
        if (warnings.length > 0) console.warn('Import warnings:', warnings);
        const idx = buildSchemeIndex(data, `runtime://${data.id}`);
        useAppStore.getState().setSchemes([...useAppStore.getState().schemes, idx]);
        useAppStore.getState().loadScheme(data);
      },
      getSchemes: () => useAppStore.getState().schemes,
      switchScheme: (id: string) => {
        window.dispatchEvent(new CustomEvent('scheme-change', { detail: id }));
      },
    };
  }, []);

  useEffect(() => {
    const handler = async (e: Event) => {
      const id = (e as CustomEvent).detail;
      const idx = schemes.find(s => s.id === id);
      if (idx) {
        const data = await loadSchemeByPath(idx.filePath);
        loadScheme(data);
      }
    };
    window.addEventListener('scheme-change', handler);
    return () => window.removeEventListener('scheme-change', handler);
  }, [schemes, loadScheme]);

  return (
    <div className="app-layout">
      <TopBar />
      <aside className="left-panel"><LeftPanel /></aside>
      <main className="canvas-area">
        {currentScheme && viewMode === 'single' && (
          <FloorPlanView scheme={currentScheme} floorId={currentFloor} />
        )}
        {currentScheme && viewMode === 'linked' && (
          <LinkedFloorView scheme={currentScheme} />
        )}
        {currentScheme && viewMode === 'section' && (
          <CrossSectionView scheme={currentScheme} />
        )}
        {!currentScheme && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            加载方案中...
          </div>
        )}
      </main>
      <aside className="right-panel"><RightPanel /></aside>
      <BottomBar />
      <MachineTooltip />
      <MachineDetail />
    </div>
  );
}
