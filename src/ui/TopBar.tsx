import { useAppStore } from '../store/useAppStore';
import type { ViewMode } from '../core/types';

const VIEW_MODES: { id: ViewMode; label: string }[] = [
  { id: 'manual', label: '手册' },
  { id: 'single', label: '单层' },
  { id: 'linked', label: '联动' },
];

export function TopBar() {
  const schemes = useAppStore(s => s.schemes);
  const currentSchemeId = useAppStore(s => s.currentSchemeId);
  const viewMode = useAppStore(s => s.viewMode);
  const setViewMode = useAppStore(s => s.setViewMode);

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <svg className="topbar-logo" width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="1" y="1" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" opacity="0.7"/>
          <rect x="10" y="1" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
          <rect x="1" y="10" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5"/>
          <rect x="10" y="10" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
        </svg>
        <span className="topbar-title">FACTORY PLAN</span>
      </div>

      <div className="topbar-divider" />

      <div className="topbar-control">
        <label className="topbar-label">方案</label>
        <select className="scheme-select" value={currentSchemeId ?? ''}
          onChange={(e) => { window.dispatchEvent(new CustomEvent('scheme-change', { detail: e.target.value })); }}>
          {schemes.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
        </select>
      </div>

      <div className="topbar-divider" />

      <div className="topbar-control">
        <label className="topbar-label">视图</label>
        <div className="view-mode-group">
          {VIEW_MODES.map(m => (
            <button key={m.id} className={`view-mode-btn ${viewMode === m.id ? 'active' : ''}`}
              onClick={() => setViewMode(m.id)}>{m.label}</button>
          ))}
        </div>
      </div>
    </header>
  );
}
