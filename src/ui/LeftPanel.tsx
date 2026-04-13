import { useAppStore } from '../store/useAppStore';
import type { Layers } from '../core/types';

const LAYER_CONFIG: { key: keyof Layers; label: string; color: string }[] = [
  { key: 'belts', label: '传送带', color: '#00bcd4' },
  { key: 'zones', label: '分区', color: '#556677' },
  { key: 'storage', label: '储存', color: '#8d6e63' },
  { key: 'beltFlow', label: '流量', color: '#22d3ee' },
];

export function LeftPanel() {
  const currentScheme = useAppStore(s => s.currentScheme);
  const currentFloor = useAppStore(s => s.currentFloor);
  const viewMode = useAppStore(s => s.viewMode);
  const layers = useAppStore(s => s.layers);
  const setFloor = useAppStore(s => s.setFloor);
  const toggleLayer = useAppStore(s => s.toggleLayer);

  return (
    <>
      {viewMode === 'single' && currentScheme && (
        <div className="panel-section">
          <div className="panel-section-title">楼层</div>
          <div className="floor-nav">
            {currentScheme.floors.map(f => (
              <button key={f.id} className={`floor-btn ${currentFloor === f.id ? 'active' : ''}`}
                onClick={() => setFloor(f.id)}>
                <span className="floor-indicator" />
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="panel-section">
        <div className="panel-section-title">图层</div>
        <div className="layer-toggles">
          {LAYER_CONFIG.map(lc => (
            <label key={lc.key} className="layer-toggle" data-active={layers[lc.key] || undefined}>
              <input type="checkbox" checked={layers[lc.key]} onChange={() => toggleLayer(lc.key)} />
              <span className="layer-dot" style={{ '--layer-color': lc.color } as React.CSSProperties} />
              <span className="layer-label">{lc.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="panel-section panel-section-bottom">
        <label className="switch-toggle">
          <span className="switch-label">传送带等级</span>
          <span className={`switch-track${layers.showBeltMark ? ' switch-on' : ''}`}
            onClick={() => toggleLayer('showBeltMark')}>
            <span className="switch-thumb" />
          </span>
        </label>
      </div>
    </>
  );
}
