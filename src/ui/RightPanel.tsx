import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { getBuildingMeta, MATERIAL_RAW_COLORS } from '../core/registry';
import { computeSchemeStats } from '../core/computeStats';

export function RightPanel() {
  const scheme = useAppStore(s => s.currentScheme);
  const materialMap = useAppStore(s => s.materialMap);

  // scheme 变化时才重算 stats；stats 由 machines + recipes 推导，不再读 scheme.stats
  const stats = useMemo(() => scheme ? computeSchemeStats(scheme) : null, [scheme]);

  if (!scheme || !stats) return null;

  const machineCounts = new Map<string, number>();
  for (const m of scheme.machines) {
    const meta = getBuildingMeta(m.type);
    machineCounts.set(meta.displayName, (machineCounts.get(meta.displayName) ?? 0) + 1);
  }

  // Only show materials that actually appear in belts
  const usedMaterials = new Set(
    [...materialMap.values()].flatMap(mats => mats),
  );

  return (
    <>
      {/* Outputs */}
      <div className="panel-section">
        <div className="panel-section-title">
          <span>产出</span>
          <span className="section-badge">{stats.outputs.length}</span>
        </div>
        <div className="stat-list">
          {stats.outputs.map(o => (
            <div key={o.material} className="stat-row">
              <span className="stat-dot" style={{ background: MATERIAL_RAW_COLORS[o.material] ?? '#888' }} />
              <span className="stat-label">{o.material}</span>
              <span className="stat-value">{o.rate}<span className="stat-unit">/min</span></span>
            </div>
          ))}
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-section-title">
          <span>输入</span>
          <span className="section-badge">{stats.inputs.length}</span>
        </div>
        <div className="stat-list">
          {stats.inputs.map(i => (
            <div key={i.material} className="stat-row">
              <span className="stat-dot" style={{ background: MATERIAL_RAW_COLORS[i.material] ?? '#888' }} />
              <span className="stat-label">{i.material}</span>
              <span className="stat-value">{i.rate}<span className="stat-unit">/min</span></span>
            </div>
          ))}
        </div>
      </div>

      {/* Power */}
      <div className="panel-section">
        <div className="panel-section-title">电力</div>
        <div className="power-stat">
          <span className="power-value">{stats.totalPowerMW.toFixed(0)}</span>
          <span className="power-unit">MW</span>
        </div>
      </div>

      {/* Build list */}
      <div className="panel-section">
        <div className="panel-section-title">
          <span>建造清单</span>
          <span className="section-badge">{machineCounts.size}</span>
        </div>
        <div className="stat-list">
          {[...machineCounts.entries()].map(([name, count]) => (
            <div key={name} className="stat-row">
              <span className="stat-label">{name}</span>
              <span className="stat-value">x{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="panel-section">
        <div className="panel-section-title">图例</div>
        <div className="legend-grid">
          {[...usedMaterials].map(name => (
            <div key={name} className="legend-chip">
              <span className="legend-swatch" style={{ background: MATERIAL_RAW_COLORS[name] ?? '#888' }} />
              <span className="legend-text">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
