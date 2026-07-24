import type { Scheme } from '../core/types';
import { useAppStore } from '../store/useAppStore';
import { FloorPlanView } from './FloorPlanView';

interface LinkedFloorViewProps { scheme: Scheme; }

export function LinkedFloorView({ scheme }: LinkedFloorViewProps) {
  const viewport = useAppStore(s => s.viewport);

  return (
    // 外层容器统一缩放：flex 行 + 其内所有 svg 作为一个整体一起 scale/translate，
    // 避免每个 svg 各自缩放撑出固定列宽导致溢出/裁剪。
    <div
      style={{
        transform: `scale(${viewport.zoom}) translate(${viewport.panX / viewport.zoom}px, ${viewport.panY / viewport.zoom}px)`,
        transformOrigin: 'center center',
        width: '100%',
        height: '100%',
      }}
    >
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        {scheme.floors.map((f, i) => (
          <div key={f.id} style={{ flex: 1, borderRight: i < scheme.floors.length - 1 ? '1px solid var(--border)' : 'none', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 8, left: 12, fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', zIndex: 1 }}>
              {f.label}
            </div>
            <FloorPlanView scheme={scheme} floorId={f.id} applyTransform={false} />
          </div>
        ))}
      </div>
    </div>
  );
}
