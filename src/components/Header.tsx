import type { LayerState } from '../App';

interface HeaderProps {
  currentFloor: string;
  layers: LayerState;
  onFloorChange: (floor: string) => void;
  onLayerToggle: (key: keyof LayerState) => void;
}

const TABS = [
  { id: '1', label: '1F 冶炼层' },
  { id: '2', label: '2F 组件层' },
  { id: 'section', label: '剖面' },
];

const TOGGLES: { key: keyof LayerState; icon: string; label: string }[] = [
  { key: 'belt', icon: '🔧', label: '传送带' },
  { key: 'power', icon: '⚡', label: '电力线' },
  { key: 'storage', icon: '📦', label: '储存箱' },
  { key: 'mk2', icon: '🔶', label: 'Mk.2标记' },
];

export default function Header({ currentFloor, layers, onFloorChange, onLayerToggle }: HeaderProps) {
  return (
    <header>
      <div className="logo">
        FICSIT<span>铁矿垂直工厂 v1.0</span>
      </div>
      <div className="tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab${currentFloor === tab.id ? ' active' : ''}`}
            onClick={() => onFloorChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="toggles">
        {TOGGLES.map(({ key, icon, label }) => (
          <button
            key={key}
            className={`toggle${layers[key] ? ' on' : ''}`}
            data-layer={key}
            onClick={() => onLayerToggle(key)}
          >
            {icon} {label}
          </button>
        ))}
      </div>
    </header>
  );
}
