import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { getBuildingMeta, MATERIAL_RAW_COLORS } from '../core/registry';

export function MachineDetail() {
  const selectedId = useAppStore(s => s.selectedId);
  const scheme = useAppStore(s => s.currentScheme);
  const select = useAppStore(s => s.select);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const machine = scheme?.machines.find(m => m.id === selectedId);
  const meta = machine ? getBuildingMeta(machine.type) : null;

  useEffect(() => {
    if (machine) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [machine]);

  if (!machine || !meta) return <dialog ref={dialogRef} className="machine-detail" />;

  const connectedBelts = scheme?.belts.filter(b =>
    b.fromPort?.startsWith(machine.id + ':') || b.toPort?.startsWith(machine.id + ':')
  ) ?? [];

  return (
    <dialog ref={dialogRef} className="machine-detail" onClose={() => select(null)}>
      <div className="detail-header" style={{ '--accent': `var(${meta.color})` } as React.CSSProperties}>
        <div className="detail-title-row">
          <h3 className="detail-title">{machine.label ?? machine.id}</h3>
          <span className="detail-type">{meta.displayName}</span>
        </div>
        <button className="detail-close" onClick={() => select(null)} aria-label="关闭">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
      <div className="detail-body">
        <div className="detail-grid">
          <span className="detail-key">配方</span><span className="detail-val">{machine.recipe ?? '—'}</span>
          <span className="detail-key">楼层</span><span className="detail-val">{machine.floor}F</span>
          <span className="detail-key">位置</span><span className="detail-val">({machine.pos.col.toFixed(1)}, {machine.pos.row.toFixed(1)})</span>
          <span className="detail-key">朝向</span><span className="detail-val">{machine.facing}</span>
          <span className="detail-key">功耗</span><span className="detail-val" style={{ color: 'var(--power)' }}>{meta.powerUsage} MW</span>
          <span className="detail-key">尺寸</span><span className="detail-val">{meta.dimensions.width} × {meta.dimensions.length} × {meta.dimensions.height} m</span>
        </div>
        {connectedBelts.length > 0 && (
          <div className="detail-section">
            <div className="detail-section-title">连接传送带</div>
            {connectedBelts.map(b => (
              <div key={b.id} className="detail-belt-row">
                <span className="stat-dot" style={{ background: MATERIAL_RAW_COLORS[b.material] ?? '#888' }} />
                <span className="detail-val">{b.material}</span>
                <span className="detail-key">Mk.{b.mark}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </dialog>
  );
}
