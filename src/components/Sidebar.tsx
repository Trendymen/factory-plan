import { POLES, PRODUCTION_STATS, BUILD_LIST } from '../data/factory';

import type { LayerState } from '../App';

interface SidebarProps {
  floor: string;
  layers: LayerState;
}

function CrossSectionMini() {
  return (
    <svg viewBox="0 0 230 140" style={{ width: '100%' }}>
      <rect x={10} y={80} width={210} height={45} rx={4} fill="var(--bg3)" stroke="var(--smelter)" strokeOpacity={0.4} strokeWidth={1} />
      <text x={115} y={98} fill="var(--smelter)" style={{ font: 'bold 11px Noto Sans SC', textAnchor: 'middle' }}>1F 冶炼 + 基础加工</text>
      <text x={115} y={114} fill="var(--dim)" style={{ font: '10px JetBrains Mono', textAnchor: 'middle' }}>10台 · 40MW</text>
      <rect x={10} y={20} width={210} height={45} rx={4} fill="var(--bg3)" stroke="var(--screw)" strokeOpacity={0.4} strokeWidth={1} />
      <rect x={22} y={64} width={186} height={10} rx={3} fill="rgba(255,183,77,0.12)" stroke="rgba(255,183,77,0.35)" strokeWidth={1} strokeDasharray="3,2" />
      <text x={115} y={38} fill="var(--screw)" style={{ font: 'bold 11px Noto Sans SC', textAnchor: 'middle' }}>2F 组件 + 组装</text>
      <text x={115} y={54} fill="var(--dim)" style={{ font: '10px JetBrains Mono', textAnchor: 'middle' }}>6台+4箱 · 46MW · 南扩前场</text>
      <line x1={60} y1={65} x2={60} y2={80} stroke="var(--plate)" strokeWidth={2} strokeDasharray="3,3" />
      <text x={60} y={75} fill="var(--plate)" style={{ font: '7px Orbitron', textAnchor: 'middle' }}>板↑</text>
      <line x1={160} y1={65} x2={160} y2={80} stroke="var(--rod)" strokeWidth={2} strokeDasharray="3,3" />
      <text x={160} y={75} fill="var(--rod)" style={{ font: '7px Orbitron', textAnchor: 'middle' }}>棒↑</text>
      <line x1={200} y1={65} x2={200} y2={80} stroke="var(--power)" strokeWidth={1.5} strokeDasharray="2,3" />
      <text x={200} y={75} fill="var(--power)" style={{ font: '7px Orbitron', textAnchor: 'middle' }}>⚡F→G</text>
    </svg>
  );
}

function ProductionPanel() {
  return (
    <>
      {PRODUCTION_STATS.map(s => (
        <div key={s.name}>
          <div className="stat-row">
            <span className="stat-label"><span className="stat-dot" style={{ background: s.color }} />{s.name}</span>
            <span className="stat-value">{s.rate}/m</span>
          </div>
          <div className="stat-bar"><div className="stat-fill" style={{ width: `${s.pct}%`, background: s.color }} /></div>
        </div>
      ))}
      <div style={{ marginTop: 8, padding: '6px 8px', background: 'rgba(0,229,200,0.06)', borderRadius: 4, fontSize: 11 }}>
        <span style={{ color: 'var(--accent)' }}>总功耗</span>
        <span style={{ float: 'right', fontFamily: 'JetBrains Mono', color: 'var(--power)' }}>86 MW</span>
      </div>
      <div style={{ marginTop: 4, padding: '6px 8px', background: 'rgba(255,145,0,0.06)', borderRadius: 4, fontSize: 10, color: 'var(--mk2)' }}>
        升级 3 段 Mk.2 带 → 转子满速 4/min · 全线零浪费
      </div>
    </>
  );
}

function PowerStats() {
  return (
    <>
      {Object.values(POLES).map(p => (
        <div key={p.id} className="build-row">
          <span className="name" style={{ color: 'var(--power)' }}>{p.id}</span>
          <span className="name">{p.name}</span>
          <span className="count">{p.used}/4</span>
        </div>
      ))}
    </>
  );
}

function BuildListPanel() {
  return (
    <>
      {BUILD_LIST.map(([name, count]) => (
        <div key={name} className="build-row">
          <span className="name">{name}</span>
          <span className="count">{count}</span>
        </div>
      ))}
    </>
  );
}

const ZONE_RULES = [
  ['主物流带', '只放主干带、升降机到达和一级分流'],
  ['维护走道', '保持贯通，不塞生产机'],
  ['扩产预留', '未来终端件优先吃这里'],
  ['前场缓冲', '只放储存、出货和备用接口'],
];

const LEGEND_ITEMS = [
  { label: '冶炼炉', color: 'var(--smelter)' },
  { label: '铁板机', color: 'var(--plate)' },
  { label: '铁棒机', color: 'var(--rod)' },
  { label: '螺丝机', color: 'var(--screw)' },
  { label: '组装机', color: 'var(--assembly)' },
  { label: '储存箱', color: 'var(--storage)' },
  { label: '分流器 ◇', color: 'var(--splitter-split)' },
  { label: '合流器 ●', color: 'var(--splitter-merge)' },
];

export default function Sidebar({ floor: _floor, layers: _layers }: SidebarProps) {
  void _floor; void _layers; // reserved for future floor-specific panels
  return (
    <aside className="sidebar">
      <div className="panel">
        <div className="panel-title">剖面视图</div>
        <CrossSectionMini />
      </div>

      <div className="panel">
        <div className="panel-title">产量统计</div>
        <ProductionPanel />
      </div>

      <div className="panel">
        <div className="panel-title">电力拓扑</div>
        <PowerStats />
      </div>

      <div className="panel">
        <div className="panel-title">建造清单</div>
        <BuildListPanel />
      </div>

      <div className="panel">
        <div className="panel-title">空地规划</div>
        {ZONE_RULES.map(([name, note]) => (
          <div key={name} className="build-row">
            <span className="name">{name}</span>
            <span className="count">{note}</span>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-title">图例</div>
        <div className="legend-grid">
          {LEGEND_ITEMS.map(({ label, color }) => (
            <div key={label} className="legend-item">
              <span className="legend-swatch" style={{ background: color }} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
