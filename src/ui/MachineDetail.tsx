import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { getBuildingMeta, MATERIAL_RAW_COLORS } from '../core/registry';
import { computeMachineFlow, formatRecipeLabel, getRecipe } from '../core/recipes';

/** 格式化每分钟速率：整数不带小数，否则保留 1 位 */
function fmtRate(rate: number): string {
  return Number.isInteger(rate) ? rate.toString() : rate.toFixed(1);
}

const CURSOR_OFFSET = 16;
const EDGE_PADDING = 12;
const FALLBACK_SIZE = { width: 360, height: 280 };

interface PopupPos {
  left: number;
  top: number;
}

/**
 * 基于鼠标锚点与弹窗尺寸计算最终位置：
 * 1. 先尝试在光标右下角放置
 * 2. 若右边溢出 → 改放光标左侧
 * 3. 若下方溢出 → 改放光标上方
 * 4. 最后做边缘 clamp，保证永远在可视区
 */
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
    // 两边都塞不下，居中贴近光标
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

  // 兜底 clamp 到可视范围内
  left = Math.max(EDGE_PADDING, Math.min(vw - size.width - EDGE_PADDING, left));
  top = Math.max(EDGE_PADDING, Math.min(vh - size.height - EDGE_PADDING, top));

  return { left, top };
}

export function MachineDetail() {
  const selectedId = useAppStore(s => s.selectedId);
  const selectAnchor = useAppStore(s => s.selectAnchor);
  const scheme = useAppStore(s => s.currentScheme);
  const select = useAppStore(s => s.select);

  const popupRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<PopupPos | null>(null);

  const machine = scheme?.machines.find(m => m.id === selectedId);
  const meta = machine ? getBuildingMeta(machine.type) : null;
  const visible = !!(machine && meta);

  // 测量并定位：每当选中机器或锚点变化时重新计算
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

  // Escape 关闭
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') select(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [visible, select]);

  // 视口大小变化 → 重新定位
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

  const connectedBelts = machine
    ? scheme?.belts.filter(b =>
        b.fromPort?.startsWith(machine.id + ':') || b.toPort?.startsWith(machine.id + ':'),
      ) ?? []
    : [];

  const recipe = machine ? getRecipe(machine.recipe) : undefined;
  const flow = machine ? computeMachineFlow(machine.recipe, machine.clockSpeed) : undefined;

  return (
    <AnimatePresence>
      {visible && machine && meta && (
        <motion.div
          ref={popupRef}
          className="machine-detail machine-detail-floating"
          style={{
            position: 'fixed',
            left: pos?.left ?? -9999,
            top: pos?.top ?? -9999,
            // 初次未测量时先隐形渲染以便获取真实尺寸
            visibility: pos ? 'visible' : 'hidden',
          }}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.14, ease: 'easeOut' }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="detail-header" style={{ '--accent': `var(${meta.color})` } as React.CSSProperties}>
            <div className="detail-title-row">
              <h3 className="detail-title">{machine.label ?? machine.id}</h3>
              <span className="detail-type">{meta.displayName}</span>
            </div>
            <button className="detail-close" onClick={() => select(null)} aria-label="关闭">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="detail-body">
            <div className="detail-grid">
              <span className="detail-key">配方</span><span className="detail-val">{recipe ? formatRecipeLabel(machine.recipe) : '—'}</span>
              <span className="detail-key">楼层</span><span className="detail-val">{machine.floor}F</span>
              <span className="detail-key">位置</span><span className="detail-val">({machine.pos.col.toFixed(1)}, {machine.pos.row.toFixed(1)})</span>
              <span className="detail-key">朝向</span><span className="detail-val">{machine.facing}</span>
              <span className="detail-key">功耗</span><span className="detail-val" style={{ color: 'var(--power)' }}>{flow ? flow.powerMW.toFixed(1) : meta.powerUsage} MW</span>
              <span className="detail-key">尺寸</span><span className="detail-val">{meta.dimensions.width} × {meta.dimensions.length} × {meta.dimensions.height} m</span>
            </div>
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
