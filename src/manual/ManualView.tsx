// src/manual/ManualView.tsx
import { useMemo, useState, useEffect, type ComponentProps } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { parseDiagramBlock } from '../diagram/parseDiagramBlock';
import { DiagramView } from '../diagram/DiagramView';
import './manual.css';

// 18 个 BP md 的 raw loader（lazy），key = '/docs/.../BPxx.md'
const docModules = import.meta.glob(
  '/docs/superpowers/specs/2026-05-24-tier7-blueprints/*.md',
  { query: '?raw', import: 'default', eager: false },
) as Record<string, () => Promise<string>>;

function fileName(path: string): string {
  return path.split('/').pop() ?? path;
}

const docPaths = Object.keys(docModules).sort();

// react-markdown 的 code 组件：拦截 ```diagram
function CodeBlock(props: ComponentProps<'code'> & { className?: string }) {
  const { className, children } = props;
  if (className && className.includes('language-diagram')) {
    const raw = String(children ?? '').replace(/\n$/, '');
    const result = parseDiagramBlock(raw); // 永不抛
    return <DiagramView result={result} />;
  }
  return <code className={className}>{children}</code>;
}

const MD_COMPONENTS = { code: CodeBlock };

export function ManualView() {
  const [activePath, setActivePath] = useState<string>(docPaths[0] ?? '');
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activePath || !docModules[activePath]) return;
    let cancelled = false;
    setLoading(true);
    docModules[activePath]()
      .then((raw) => {
        if (!cancelled) setContent(raw);
      })
      .catch((e) => {
        if (!cancelled) setContent(`加载失败: ${String(e)}`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activePath]);

  const items = useMemo(
    () =>
      docPaths.map((p) => ({
        path: p,
        name: fileName(p).replace(/\.md$/, ''),
      })),
    [],
  );

  return (
    <div
      className="manual-view"
      onMouseDown={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <aside className="manual-sidebar">
        <div className="manual-sidebar-title">蓝图手册 (T7)</div>
        {items.map((it) => (
          <button
            key={it.path}
            className={`manual-doc-item ${activePath === it.path ? 'active' : ''}`}
            onClick={() => setActivePath(it.path)}
          >
            {it.name}
          </button>
        ))}
      </aside>
      <div className="manual-content">
        {loading && <div className="manual-empty">加载中…</div>}
        {!loading && !content && <div className="manual-empty">选择左侧文档查看</div>}
        {!loading && content && (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
            {content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}
