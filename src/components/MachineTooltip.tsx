import type { Machine } from '../data/factory';

export default function MachineTooltip({ machine: m }: { machine: Machine }) {
  const footprint = `${m.footprint.w.toFixed(2).replace(/\.00$/, '')}×${m.footprint.h.toFixed(2).replace(/\.00$/, '')}`;
  return (
    <>
      <div className="tt-name">{m.name}</div>
      <div className="tt-recipe">{m.recipe}</div>
      <div className="tt-row">
        <span className="tt-label">预留占地</span>
        <span className="tt-val">{footprint} 格</span>
      </div>
      {m.inputs.map((inp, i) => (
        <div key={i} className="tt-row">
          <span className="tt-label">输入 {inp.name}</span>
          <span className="tt-val">{inp.rate}/m</span>
        </div>
      ))}
      {m.outputs.map((out, i) => (
        <div key={i} className="tt-row">
          <span className="tt-label">输出 {out.name}</span>
          <span className="tt-val">{out.rate}/m</span>
        </div>
      ))}
      {m.power > 0 && (
        <div className="tt-row">
          <span className="tt-label">功耗</span>
          <span className="tt-val">{m.power} MW</span>
        </div>
      )}
      <div className="tt-row">
        <span className="tt-label">效率</span>
        <span className="tt-val" style={m.eff !== 100 ? { color: 'var(--mk2)' } : undefined}>
          {m.eff}%
        </span>
      </div>
      {m.mk2Note && (
        <div className="tt-upgrade">{m.mk2Note.split('\n')[0]}</div>
      )}
    </>
  );
}
