import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { getBuildingMeta } from '../core/registry';

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
      <h3 style={{ color: `var(${meta.color})`, marginBottom: 12 }}>{machine.label ?? machine.id} — {meta.displayName}</h3>
      <div className="stat-row"><span>配方</span><span>{machine.recipe ?? '—'}</span></div>
      <div className="stat-row"><span>楼层</span><span>{machine.floor}F</span></div>
      <div className="stat-row"><span>位置</span><span>({machine.pos.col}, {machine.pos.row})</span></div>
      <div className="stat-row"><span>朝向</span><span>{machine.facing}</span></div>
      <div className="stat-row"><span>功耗</span><span>{meta.powerUsage} MW</span></div>
      <div className="stat-row"><span>尺寸</span><span>{meta.dimensions.width} x {meta.dimensions.length} x {meta.dimensions.height} m</span></div>
      {connectedBelts.length > 0 && (
        <>
          <div className="panel-section-title" style={{ marginTop: 12 }}>连接的传送带</div>
          {connectedBelts.map(b => (
            <div key={b.id} className="stat-row"><span>{b.material}</span><span className="stat-value">Mk.{b.mark}</span></div>
          ))}
        </>
      )}
      <button style={{ marginTop: 16, padding: '6px 16px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-secondary)', cursor: 'pointer' }}
        onClick={() => select(null)}>关闭</button>
    </dialog>
  );
}
