import { useAppStore } from '../store/useAppStore';
import type { ViewMode } from '../core/types';

const VIEW_MODES: { id: ViewMode; label: string }[] = [
  { id: 'single', label: '单层' },
  { id: 'linked', label: '联动' },
  { id: 'section', label: '剖面' },
];

export function TopBar() {
  const schemes = useAppStore(s => s.schemes);
  const currentSchemeId = useAppStore(s => s.currentSchemeId);
  const viewMode = useAppStore(s => s.viewMode);
  const setViewMode = useAppStore(s => s.setViewMode);

  return (
    <header className="topbar">
      <span className="topbar-title">Factory Plan</span>
      <select className="scheme-select" value={currentSchemeId ?? ''}
        onChange={(e) => { window.dispatchEvent(new CustomEvent('scheme-change', { detail: e.target.value })); }}>
        {schemes.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
      </select>
      <div className="view-mode-group">
        {VIEW_MODES.map(m => (
          <button key={m.id} className={`view-mode-btn ${viewMode === m.id ? 'active' : ''}`}
            onClick={() => setViewMode(m.id)}>{m.label}</button>
        ))}
      </div>
    </header>
  );
}
