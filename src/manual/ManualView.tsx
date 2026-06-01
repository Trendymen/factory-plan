// src/manual/ManualView.tsx
import { useMemo, useState, useEffect, type ComponentProps, type ReactElement } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AsciiBlock } from './AsciiBlock';
import { FloorStackBlock } from './FloorStackBlock';
import { parseFloorStack } from './floorStack';
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

// 递归把 React children 拍平为纯文本（处理字符串/数组/嵌套元素）。
// 不能用 String(children)：children 为数组时会被逗号 join，破坏 ASCII 网格。
function extractText(node: unknown): string {
  if (node == null || node === false) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (typeof node === 'object' && 'props' in node) {
    return extractText((node as ReactElement<{ children?: unknown }>).props?.children);
  }
  return '';
}

// 从 react-markdown 传入 <pre> 的 children 里递归找出内层 <code> 的 language-xxx。
// react-markdown 把围栏语言标签放在内层 <code className="language-floorstack"> 上。
function getCodeLang(node: unknown): string | null {
  if (node == null || typeof node !== 'object') return null;
  if (Array.isArray(node)) {
    for (const child of node) {
      const lang = getCodeLang(child);
      if (lang) return lang;
    }
    return null;
  }
  if ('props' in node) {
    const el = node as ReactElement<{ className?: string; children?: unknown }>;
    const cls = el.props?.className;
    if (typeof cls === 'string') {
      const m = cls.match(/language-([\w-]+)/);
      if (m) return m[1];
    }
    return getCodeLang(el.props?.children);
  }
  return null;
}

// fenced code block：react-markdown 渲染为 <pre><code>…</code></pre>。
// 自定义 pre 取出 code 文本；language-floorstack 交给 FloorStackBlock，其余交给 AsciiBlock。
function PreBlock(props: ComponentProps<'pre'>) {
  const raw = extractText(props.children);
  const lang = getCodeLang(props.children);
  if (lang === 'floorstack') return <FloorStackBlock data={parseFloorStack(raw)} />;
  return <AsciiBlock text={raw} />;
}

const MD_COMPONENTS = { pre: PreBlock };

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
