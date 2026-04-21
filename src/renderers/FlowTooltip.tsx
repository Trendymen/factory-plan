import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store/useAppStore';

/** 跟随鼠标的传送带流量 tooltip（固定定位，不受 SVG viewBox 裁剪）。
 *  用于网格内 / 网格外的 belt 与 belt-label hover。 */
const CURSOR_OFFSET = 14;
const EDGE_PADDING = 8;

function clampToViewport(
  cursor: { x: number; y: number },
  size: { width: number; height: number },
): { left: number; top: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let left = cursor.x + CURSOR_OFFSET;
  let top = cursor.y + CURSOR_OFFSET;
  if (left + size.width + EDGE_PADDING > vw) left = cursor.x - CURSOR_OFFSET - size.width;
  if (top + size.height + EDGE_PADDING > vh) top = cursor.y - CURSOR_OFFSET - size.height;
  left = Math.max(EDGE_PADDING, Math.min(vw - size.width - EDGE_PADDING, left));
  top = Math.max(EDGE_PADDING, Math.min(vh - size.height - EDGE_PADDING, top));
  return { left, top };
}

export function FlowTooltip() {
  const hoveredId = useAppStore(s => s.hoveredId);
  const scheme = useAppStore(s => s.currentScheme);
  const beltFlows = useAppStore(s => s.beltFlows);
  const materialMap = useAppStore(s => s.materialMap);
  const showBeltMark = useAppStore(s => s.layers.showBeltMark);

  const ref = useRef<HTMLDivElement>(null);
  const lastMouse = useRef({ x: 0, y: 0 });
  const [pos, setPos] = useState({ left: -9999, top: -9999 });

  // 始终跟踪鼠标位置，避免 hover 瞬间 tooltip 位置还停留在 (0,0) 或上一位置。
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      lastMouse.current = { x: e.clientX, y: e.clientY };
      const el = ref.current;
      const size = el ? { width: el.offsetWidth, height: el.offsetHeight } : { width: 140, height: 24 };
      setPos(clampToViewport({ x: e.clientX, y: e.clientY }, size));
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // 刚 hover 到一个新的 id 时，立即按最近鼠标位置重算（避免首帧 pos 还没被 onMove 更新）。
  useEffect(() => {
    if (!hoveredId) return;
    const el = ref.current;
    const size = el ? { width: el.offsetWidth, height: el.offsetHeight } : { width: 140, height: 24 };
    setPos(clampToViewport(lastMouse.current, size));
  }, [hoveredId]);

  if (!scheme || !hoveredId) return null;
  const belt = scheme.belts.find(b => b.id === hoveredId);
  if (!belt) return null;

  const entry = beltFlows.get(hoveredId);
  const mark = entry?.mark ?? belt.mark;
  const flow = entry?.flow ?? 0;
  const markLabel = showBeltMark && mark ? ` · Mk.${mark}` : '';
  const materials = materialMap.get(hoveredId) ?? [];
  const matLabel = materials.length > 0 ? materials.join('+') : belt.id;
  const text = `${matLabel} ${flow}/min${markLabel}`;

  return (
    <div ref={ref}
      style={{
        position: 'fixed',
        left: pos.left,
        top: pos.top,
        padding: '4px 10px',
        borderRadius: 4,
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        lineHeight: 1.2,
        color: '#22d3ee',
        whiteSpace: 'nowrap',
        background: 'rgba(8, 20, 36, 0.85)',
        backdropFilter: 'blur(8px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(8px) saturate(1.5)',
        border: '1px solid rgba(34, 211, 238, 0.45)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
        pointerEvents: 'none',
        zIndex: 10000,
      }}>
      {text}
    </div>
  );
}
