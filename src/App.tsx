import { useCallback, useEffect, useRef, type MouseEvent as ReactMouseEvent } from 'react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import type { Scheme } from './core/types';
import { validateScheme, buildSchemeIndex } from './core/schema';
import { useAppStore } from './store/useAppStore';
import { TopBar } from './ui/TopBar';
import { LeftPanel } from './ui/LeftPanel';
import { RightPanel } from './ui/RightPanel';
import { MachineTooltip } from './ui/MachineTooltip';
import { FlowTooltip } from './renderers/FlowTooltip';
import { MachineDetail } from './ui/MachineDetail';
import { BottomBar } from './ui/BottomBar';
import { AppErrorFallback } from './ui/AppErrorFallback';
import { ViewErrorFallback } from './ui/ViewErrorFallback';
import { FloorPlanView } from './views/FloorPlanView';
import { LinkedFloorView } from './views/LinkedFloorView';
import { ManualView } from './manual/ManualView';

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

const PAN_THRESHOLD = 4;

function AppContent() {
  const schemes = useAppStore(s => s.schemes);
  const currentScheme = useAppStore(s => s.currentScheme);
  const currentFloor = useAppStore(s => s.currentFloor);
  const viewMode = useAppStore(s => s.viewMode);
  const setSchemes = useAppStore(s => s.setSchemes);
  const loadScheme = useAppStore(s => s.loadScheme);
  const setViewport = useAppStore(s => s.setViewport);
  const { showBoundary } = useErrorBoundary();

  // 画布拖动：作用于整个 <main>
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOrigin = useRef({ x: 0, y: 0 });
  const didPan = useRef(false);
  const suppressClick = useRef(false);

  const onCanvasMouseDown = useCallback((e: ReactMouseEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    const { panX, panY } = useAppStore.getState().viewport;
    isPanning.current = true;
    didPan.current = false;
    panStart.current = { x: e.clientX, y: e.clientY };
    panOrigin.current = { x: panX, y: panY };
  }, []);

  const onCanvasMouseMove = useCallback((e: ReactMouseEvent<HTMLElement>) => {
    if (!isPanning.current) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    if (!didPan.current && Math.hypot(dx, dy) > PAN_THRESHOLD) {
      didPan.current = true;
    }
    if (didPan.current) {
      setViewport({
        panX: panOrigin.current.x + dx,
        panY: panOrigin.current.y + dy,
      });
    }
  }, [setViewport]);

  const endPan = useCallback(() => {
    if (isPanning.current && didPan.current) {
      // 拖动确实发生过：吞掉接下来即将冒泡到 main 的那个点击事件
      suppressClick.current = true;
    }
    isPanning.current = false;
  }, []);

  // 捕获阶段拦截 click，如果上一次拖动真正发生过就阻止它
  const onCanvasClickCapture = useCallback((e: ReactMouseEvent<HTMLElement>) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      e.stopPropagation();
      e.preventDefault();
    }
  }, []);

  useEffect(() => {
    loadAllSchemeIndexes()
      .then(async (indexes) => {
        if (indexes.length === 0) {
          showBoundary(new Error('没有找到可用的方案文件'));
          return;
        }
        setSchemes(indexes);
        // HMR 友好：优先恢复用户当前选中的方案，仅在无选中（或选中已删除）时 fallback 到首个
        const currentId = useAppStore.getState().currentSchemeId;
        const target = (currentId && indexes.find(idx => idx.id === currentId)) || indexes[0];
        const data = await loadSchemeByPath(target.filePath);
        loadScheme(data);
      })
      .catch((err) => {
        showBoundary(err instanceof Error ? err : new Error(String(err)));
      });
  }, [setSchemes, loadScheme, showBoundary]);

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
        try {
          const data = await loadSchemeByPath(idx.filePath);
          loadScheme(data);
        } catch (err) {
          showBoundary(err instanceof Error ? err : new Error(String(err)));
        }
      }
    };
    window.addEventListener('scheme-change', handler);
    return () => window.removeEventListener('scheme-change', handler);
  }, [schemes, loadScheme, showBoundary]);

  return (
    <div className={`app-layout${viewMode === 'manual' ? ' manual-mode' : ''}`}>
      <TopBar />
      <aside className="left-panel"><LeftPanel /></aside>
      <main
        className="canvas-area"
        onMouseDown={onCanvasMouseDown}
        onMouseMove={onCanvasMouseMove}
        onMouseUp={endPan}
        onMouseLeave={endPan}
        onClickCapture={onCanvasClickCapture}
      >
        <ErrorBoundary
          FallbackComponent={ViewErrorFallback}
          resetKeys={[viewMode, currentScheme?.id, currentFloor]}
        >
          {currentScheme && viewMode === 'single' && (
            <FloorPlanView scheme={currentScheme} floorId={currentFloor} />
          )}
          {currentScheme && viewMode === 'linked' && (
            <LinkedFloorView scheme={currentScheme} />
          )}
          {viewMode === 'manual' && <ManualView />}
          {!currentScheme && viewMode !== 'manual' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
              加载方案中...
            </div>
          )}
        </ErrorBoundary>
      </main>
      <aside className="right-panel"><RightPanel /></aside>
      <BottomBar />
      <MachineTooltip />
      <FlowTooltip />
      <MachineDetail />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary FallbackComponent={AppErrorFallback}>
      <AppContent />
    </ErrorBoundary>
  );
}
