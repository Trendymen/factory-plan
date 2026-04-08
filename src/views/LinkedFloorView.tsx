import type { Scheme } from '../core/types';
import { FloorPlanView } from './FloorPlanView';

interface LinkedFloorViewProps { scheme: Scheme; }

export function LinkedFloorView({ scheme }: LinkedFloorViewProps) {
  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      {scheme.floors.map((f, i) => (
        <div key={f.id} style={{ flex: 1, borderRight: i < scheme.floors.length - 1 ? '1px solid var(--border)' : 'none', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 8, left: 12, fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', zIndex: 1 }}>
            {f.label}
          </div>
          <FloorPlanView scheme={scheme} floorId={f.id} />
        </div>
      ))}
    </div>
  );
}
