import { useAppStore } from '../store/useAppStore';

export function BottomBar() {
  const viewport = useAppStore(s => s.viewport);
  return (
    <footer className="bottombar">
      <span>缩放: {Math.round(viewport.zoom * 100)}%</span>
      <span>网格: 8m/格</span>
    </footer>
  );
}
