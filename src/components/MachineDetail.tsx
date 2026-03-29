import { useEffect, useRef } from 'react';
import type { Machine } from '../data/factory';

interface Props {
  machine: Machine | null;
  onClose: () => void;
}

export default function MachineDetail({ machine, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (machine) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [machine]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handler = () => onClose();
    dialog.addEventListener('close', handler);
    return () => dialog.removeEventListener('close', handler);
  }, [onClose]);

  if (!machine) return <dialog ref={dialogRef} className="detail-popup" />;

  const m = machine;
  const footprint = `${m.footprint.w.toFixed(2).replace(/\.00$/, '')} × ${m.footprint.h.toFixed(2).replace(/\.00$/, '')} 格`;
  return (
    <dialog ref={dialogRef} className="detail-popup">
      <div className="popup-card">
        <button className="popup-close" onClick={onClose}>&times;</button>
        <h2>{m.name}</h2>
        <div className="popup-type">
          {m.type === 'storage' ? '储存容器' : '生产机器'} · {m.floor}F · 电线杆 {m.pole}
        </div>

        <div className="popup-section">
          <h3>配方</h3>
          <div className="popup-row">
            <span className="label">工艺</span>
            <span className="value">{m.recipe}</span>
          </div>
        </div>

        {m.inputs.length > 0 && (
          <div className="popup-section">
            <h3>输入</h3>
            {m.inputs.map((inp, i) => (
              <div key={i} className="popup-row">
                <span className="label">{inp.name}</span>
                <span className="value">{inp.rate}/min</span>
              </div>
            ))}
          </div>
        )}

        {m.outputs.length > 0 && (
          <div className="popup-section">
            <h3>输出</h3>
            {m.outputs.map((out, i) => (
              <div key={i} className="popup-row">
                <span className="label">{out.name}</span>
                <span className="value">{out.rate}/min</span>
              </div>
            ))}
          </div>
        )}

        <div className="popup-section">
          <h3>状态</h3>
          <div className="popup-row">
            <span className="label">预留占地</span>
            <span className="value">{footprint}</span>
          </div>
          <div className="popup-row">
            <span className="label">功耗</span>
            <span className="value">{m.power} MW</span>
          </div>
          <div className="popup-row">
            <span className="label">效率</span>
            <span className="value" style={{ color: m.eff === 100 ? 'var(--accent)' : 'var(--mk2)' }}>
              {m.eff}%
            </span>
          </div>
          <div className="popup-row">
            <span className="label">电线杆</span>
            <span className="value" style={{ color: 'var(--power)' }}>{m.pole}</span>
          </div>
        </div>

        {m.mk2Note && (
          <div className="popup-upgrade-note">
            <strong>Mk.2 升级说明:</strong><br />
            {m.mk2Note.split('\n').map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}
          </div>
        )}
      </div>
    </dialog>
  );
}
