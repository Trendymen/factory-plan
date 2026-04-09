import { useAppStore } from '../store/useAppStore';

export function BottomBar() {
  const viewport = useAppStore(s => s.viewport);
  const currentScheme = useAppStore(s => s.currentScheme);
  const currentFloor = useAppStore(s => s.currentFloor);

  const floor = currentScheme?.floors.find(f => f.id === currentFloor);

  return (
    <footer className="bottombar">
      <span className="bottom-item">
        <span className="bottom-label">缩放</span>
        <span className="bottom-value">{Math.round(viewport.zoom * 100)}%</span>
      </span>
      <span className="bottom-sep" />
      <span className="bottom-item">
        <span className="bottom-label">网格</span>
        <span className="bottom-value">8m</span>
      </span>
      {floor && (
        <>
          <span className="bottom-sep" />
          <span className="bottom-item">
            <span className="bottom-label">画布</span>
            <span className="bottom-value">{floor.gridSize.cols}x{floor.gridSize.rows}</span>
          </span>
        </>
      )}
      <span className="bottom-spacer" />
      <span className="bottom-item">
        <span className="bottom-status" />
        <span className="bottom-label">就绪</span>
      </span>
    </footer>
  );
}
