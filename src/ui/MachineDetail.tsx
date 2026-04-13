import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { getBuildingMeta, MATERIAL_RAW_COLORS } from '../core/registry';
import { computeMachineFlow, formatRecipeLabel, getRecipe } from '../core/recipes';
import type { BeltFlowEntry } from '../core/computeStats';
import type { MaterialMap } from '../core/deriveMaterials';
import type { MachineInstance, Scheme } from '../core/types';

/** 格式化每分钟速率：整数不带小数，否则保留 1 位 */
function fmtRate(rate: number): string {
  return Number.isInteger(rate) ? rate.toString() : rate.toFixed(1);
}

const CURSOR_OFFSET = 16;
const EDGE_PADDING = 12;
const FALLBACK_SIZE = { width: 360, height: 280 };

const LOGISTICS_TYPES = new Set(['splitter', 'merger']);

interface PopupPos {
  left: number;
  top: number;
}

function computePopupPos(
  anchor: { x: number; y: number },
  size: { width: number; height: number },
): PopupPos {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const spaceRight = vw - anchor.x;
  const spaceBottom = vh - anchor.y;

  let left: number;
  if (spaceRight >= size.width + CURSOR_OFFSET + EDGE_PADDING) {
    left = anchor.x + CURSOR_OFFSET;
  } else if (anchor.x >= size.width + CURSOR_OFFSET + EDGE_PADDING) {
    left = anchor.x - CURSOR_OFFSET - size.width;
  } else {
    left = Math.max(EDGE_PADDING, Math.min(vw - size.width - EDGE_PADDING, anchor.x - size.width / 2));
  }

  let top: number;
  if (spaceBottom >= size.height + CURSOR_OFFSET + EDGE_PADDING) {
    top = anchor.y + CURSOR_OFFSET;
  } else if (anchor.y >= size.height + CURSOR_OFFSET + EDGE_PADDING) {
    top = anchor.y - CURSOR_OFFSET - size.height;
  } else {
    top = Math.max(EDGE_PADDING, Math.min(vh - size.height - EDGE_PADDING, anchor.y - size.height / 2));
  }

  left = Math.max(EDGE_PADDING, Math.min(vw - size.width - EDGE_PADDING, left));
  top = Math.max(EDGE_PADDING, Math.min(vh - size.height - EDGE_PADDING, top));

  return { left, top };
}

/** 收集分流器/合流器的实际吞吐 */
function computeLogisticsFlow(
  machine: MachineInstance,
  scheme: Scheme,
  beltFlows: Map<string, BeltFlowEntry>,
  materialMap: MaterialMap,
): { inputs: { item: string; rate: number }[]; outputs: { item: string; rate: number }[] } {
  const inputs: { item: string; rate: number }[] = [];
  const outputs: { item: string; rate: number }[] = [];

  for (const belt of scheme.belts) {
    const entry = beltFlows.get(belt.id);
    if (!entry || entry.flow <= 0) continue;
    if (belt.toPort?.startsWith(machine.id + ':')) {
      const matLabel = (materialMap.get(belt.id) ?? []).join('+') || '?';
      inputs.push({ item: matLabel, rate: entry.flow });
    }
    if (belt.fromPort?.startsWith(machine.id + ':')) {
      const matLabel = (materialMap.get(belt.id) ?? []).join('+') || '?';
      outputs.push({ item: matLabel, rate: entry.flow });
    }
  }

  return { inputs, outputs };
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="detail-close" onClick={onClick} aria-label="关闭">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </button>
  );
}

export function MachineDetail() {
  const selectedId = useAppStore(s => s.selectedId);
  const selectAnchor = useAppStore(s => s.selectAnchor);
  const scheme = useAppStore(s => s.currentScheme);
  const beltFlows = useAppStore(s => s.beltFlows);
  const materialMap = useAppStore(s => s.materialMap);
  const select = useAppStore(s => s.select);

  const popupRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<PopupPos | null>(null);

  // ── 查找目标：machine 或 liftPair ──
  const machine = scheme?.machines.find(m => m.id === selectedId);
  const liftPair = !machine ? scheme?.liftPairs.find(p => p.id === selectedId) : null;
  const meta = machine ? getBuildingMeta(machine.type) : null;
  const visible = !!(machine && meta) || !!liftPair;

  useLayoutEffect(() => {
    if (!visible) {
      setPos(null);
      return;
    }
    const anchor = selectAnchor ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const size = popupRef.current
      ? { width: popupRef.current.offsetWidth, height: popupRef.current.offsetHeight }
      : FALLBACK_SIZE;
    setPos(computePopupPos(anchor, size));
  }, [visible, selectAnchor, selectedId]);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') select(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [visible, select]);

  useEffect(() => {
    if (!visible) return;
    const onResize = () => {
      const anchor = selectAnchor ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      if (!popupRef.current) return;
      const size = { width: popupRef.current.offsetWidth, height: popupRef.current.offsetHeight };
      setPos(computePopupPos(anchor, size));
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [visible, selectAnchor]);

  if (!scheme) return null;

  // ── 升降机 pair 详情弹窗 ──
  if (liftPair) {
    const bot = scheme.machines.find(m => m.id === liftPair.bottomMachine);
    const top = scheme.machines.find(m => m.id === liftPair.topMachine);
    const direction = bot?.type.includes('-in-') ? '↑ 向上' : '↓ 向下';
    const liftFlowEntry = beltFlows.get(liftPair.id);

    // 连接的传送带
    const connectedBelts = scheme.belts.filter(b =>
      b.fromPort?.startsWith(liftPair.bottomMachine + ':') ||
      b.toPort?.startsWith(liftPair.bottomMachine + ':') ||
      b.fromPort?.startsWith(liftPair.topMachine + ':') ||
      b.toPort?.startsWith(liftPair.topMachine + ':'),
    );

    return (
      <AnimatePresence>
        {visible && (
          <motion.div
            ref={popupRef}
            className="machine-detail machine-detail-floating"
            style={{ position: 'fixed', left: pos?.left ?? -9999, top: pos?.top ?? -9999, visibility: pos ? 'visible' : 'hidden' }}
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
            onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}
          >
            <div className="detail-header" style={{ '--accent': 'var(--lift)' } as React.CSSProperties}>
              <div className="detail-title-row">
                <h3 className="detail-title">{liftPair.id}</h3>
                <span className="detail-type">升降机</span>
              </div>
              <CloseButton onClick={() => select(null)} />
            </div>
            <div className="detail-body">
              <div className="detail-grid">
                <span className="detail-key">方向</span><span className="detail-val">{direction}</span>
                <span className="detail-key">楼层</span><span className="detail-val">{bot?.floor}F → {top?.floor}F</span>
                <span className="detail-key">等级</span><span className="detail-val">Mk.{liftPair.mark}</span>
                <span className="detail-key">物料</span><span className="detail-val">{(materialMap.get(liftPair.id) ?? []).join('+') || '—'}</span>
              </div>
              {liftFlowEntry && liftFlowEntry.flow > 0 && (
                <div className="detail-section">
                  <div className="detail-section-title">每分钟吞吐</div>
                  <div className="detail-belt-row">
                    <span className="stat-dot" style={{ background: MATERIAL_RAW_COLORS[(materialMap.get(liftPair.id) ?? [])[0] ?? ''] ?? '#888' }} />
                    <span className="detail-val">↕ {(materialMap.get(liftPair.id) ?? []).join('+') || '—'}</span>
                    <span className="detail-key">{fmtRate(liftFlowEntry.flow)}/min</span>
                  </div>
                </div>
              )}
              {connectedBelts.length > 0 && (
                <div className="detail-section">
                  <div className="detail-section-title">连接传送带</div>
                  {connectedBelts.map(b => (
                    <div key={b.id} className="detail-belt-row">
                      <span className="stat-dot" style={{ background: MATERIAL_RAW_COLORS[(materialMap.get(b.id) ?? [])[0] ?? ''] ?? '#888' }} />
                      <span className="detail-val">{(materialMap.get(b.id) ?? []).join('+') || '—'}</span>
                      <span className="detail-key">Mk.{b.mark}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // ── 普通机器 / 分流器 / 合流器 详情弹窗 ──
  if (!machine || !meta) return null;

  const connectedBelts = scheme.belts.filter(b =>
    b.fromPort?.startsWith(machine.id + ':') || b.toPort?.startsWith(machine.id + ':'),
  );

  const recipe = getRecipe(machine.recipe);
  const flow = computeMachineFlow(machine.recipe, machine.clockSpeed);
  const isLogistics = LOGISTICS_TYPES.has(machine.type);
  const logisticsFlow = isLogistics ? computeLogisticsFlow(machine, scheme, beltFlows, materialMap) : null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={popupRef}
          className="machine-detail machine-detail-floating"
          style={{ position: 'fixed', left: pos?.left ?? -9999, top: pos?.top ?? -9999, visibility: pos ? 'visible' : 'hidden' }}
          initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.14, ease: 'easeOut' }}
          onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}
        >
          <div className="detail-header" style={{ '--accent': `var(${meta.color})` } as React.CSSProperties}>
            <div className="detail-title-row">
              <h3 className="detail-title">{machine.label ?? machine.id}</h3>
              <span className="detail-type">{meta.displayName}</span>
            </div>
            <CloseButton onClick={() => select(null)} />
          </div>
          <div className="detail-body">
            <div className="detail-grid">
              {recipe && (
                <><span className="detail-key">配方</span><span className="detail-val">{formatRecipeLabel(machine.recipe)}</span></>
              )}
              <span className="detail-key">楼层</span><span className="detail-val">{machine.floor}F</span>
              <span className="detail-key">位置</span><span className="detail-val">({machine.pos.col.toFixed(1)}, {machine.pos.row.toFixed(1)})</span>
              <span className="detail-key">朝向</span><span className="detail-val">{machine.facing}</span>
              {!isLogistics && (
                <><span className="detail-key">功耗</span><span className="detail-val" style={{ color: 'var(--power)' }}>{flow ? flow.powerMW.toFixed(1) : meta.powerUsage} MW</span></>
              )}
              <span className="detail-key">尺寸</span><span className="detail-val">{meta.dimensions.width} × {meta.dimensions.length} × {meta.dimensions.height} m</span>
            </div>
            {/* 生产机器吞吐 */}
            {flow && (flow.inputs.length > 0 || flow.outputs.length > 0) && (
              <div className="detail-section">
                <div className="detail-section-title">每分钟吞吐</div>
                {flow.inputs.map(i => (
                  <div key={`in-${i.item}`} className="detail-belt-row">
                    <span className="stat-dot" style={{ background: MATERIAL_RAW_COLORS[i.item] ?? '#888' }} />
                    <span className="detail-val">← {i.item}</span>
                    <span className="detail-key">{fmtRate(i.rate)}/min</span>
                  </div>
                ))}
                {flow.outputs.map(o => (
                  <div key={`out-${o.item}`} className="detail-belt-row">
                    <span className="stat-dot" style={{ background: MATERIAL_RAW_COLORS[o.item] ?? '#888' }} />
                    <span className="detail-val">→ {o.item}</span>
                    <span className="detail-key">{fmtRate(o.rate)}/min</span>
                  </div>
                ))}
              </div>
            )}
            {/* 分流器/合流器吞吐 */}
            {logisticsFlow && (logisticsFlow.inputs.length > 0 || logisticsFlow.outputs.length > 0) && (
              <div className="detail-section">
                <div className="detail-section-title">每分钟吞吐</div>
                {logisticsFlow.inputs.map((i, idx) => (
                  <div key={`in-${idx}`} className="detail-belt-row">
                    <span className="stat-dot" style={{ background: MATERIAL_RAW_COLORS[i.item] ?? '#888' }} />
                    <span className="detail-val">← {i.item}</span>
                    <span className="detail-key">{fmtRate(i.rate)}/min</span>
                  </div>
                ))}
                {logisticsFlow.outputs.map((o, idx) => (
                  <div key={`out-${idx}`} className="detail-belt-row">
                    <span className="stat-dot" style={{ background: MATERIAL_RAW_COLORS[o.item] ?? '#888' }} />
                    <span className="detail-val">→ {o.item}</span>
                    <span className="detail-key">{fmtRate(o.rate)}/min</span>
                  </div>
                ))}
              </div>
            )}
            {connectedBelts.length > 0 && (
              <div className="detail-section">
                <div className="detail-section-title">连接传送带</div>
                {connectedBelts.map(b => (
                  <div key={b.id} className="detail-belt-row">
                    <span className="stat-dot" style={{ background: MATERIAL_RAW_COLORS[(materialMap.get(b.id) ?? [])[0] ?? ''] ?? '#888' }} />
                    <span className="detail-val">{(materialMap.get(b.id) ?? []).join('+') || '—'}</span>
                    <span className="detail-key">Mk.{b.mark}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
