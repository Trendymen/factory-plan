import { useAppStore } from '../store/useAppStore';
import { getBuildingMeta, MATERIAL_RAW_COLORS } from '../core/registry';

export function RightPanel() {
  const scheme = useAppStore(s => s.currentScheme);
  if (!scheme) return null;

  const machineCounts = new Map<string, number>();
  for (const m of scheme.machines) {
    const meta = getBuildingMeta(m.type);
    machineCounts.set(meta.displayName, (machineCounts.get(meta.displayName) ?? 0) + 1);
  }

  const totalPower = scheme.machines.reduce((sum, m) => {
    const meta = getBuildingMeta(m.type);
    return sum + meta.powerUsage * ((m.clockSpeed ?? 100) / 100);
  }, 0);

  return (
    <>
      <div className="panel-section">
        <div className="panel-section-title">产出</div>
        {scheme.stats.outputs.map(o => (
          <div key={o.material} className="stat-row">
            <span style={{ color: MATERIAL_RAW_COLORS[o.material] ?? '#888' }}>{o.material}</span>
            <span className="stat-value">{o.rate}/min</span>
          </div>
        ))}
      </div>
      <div className="panel-section">
        <div className="panel-section-title">输入</div>
        {scheme.stats.inputs.map(i => (
          <div key={i.material} className="stat-row">
            <span style={{ color: MATERIAL_RAW_COLORS[i.material] ?? '#888' }}>{i.material}</span>
            <span className="stat-value">{i.rate}/min</span>
          </div>
        ))}
      </div>
      <div className="panel-section">
        <div className="panel-section-title">电力</div>
        <div className="stat-row">
          <span>总功耗</span>
          <span className="stat-value" style={{ color: 'var(--power)' }}>{totalPower.toFixed(0)} MW</span>
        </div>
      </div>
      <div className="panel-section">
        <div className="panel-section-title">建造清单</div>
        {[...machineCounts.entries()].map(([name, count]) => (
          <div key={name} className="stat-row"><span>{name}</span><span className="stat-value">x{count}</span></div>
        ))}
      </div>
      <div className="panel-section">
        <div className="panel-section-title">图例</div>
        {Object.entries(MATERIAL_RAW_COLORS).map(([name, color]) => (
          <div key={name} className="legend-item">
            <span className="legend-swatch" style={{ background: color }} /><span>{name}</span>
          </div>
        ))}
      </div>
    </>
  );
}
