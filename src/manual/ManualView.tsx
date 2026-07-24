// src/manual/ManualView.tsx
import {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ComponentProps,
  type ReactElement,
} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AsciiBlock } from './AsciiBlock';
import { FloorStackBlock } from './FloorStackBlock';
import { parseFloorStack } from './floorStack';
import { parseHref, slugify } from './docLinks';
import './manual.css';

// 18 个 BP md 的 raw loader（lazy），key = '/docs/.../BPxx.md'
const bpModules = import.meta.glob(
  '/docs/superpowers/specs/2026-05-24-tier7-blueprints/*.md',
  { query: '?raw', import: 'default', eager: false },
) as Record<string, () => Promise<string>>;

// 顶层设计文档（纯 markdown，无 floorstack），单独 glob 选取需要展示的文件。
const specModules = import.meta.glob(
  '/docs/superpowers/specs/2026-06-02-1x-factory-*.md',
  { query: '?raw', import: 'default', eager: false },
) as Record<string, () => Promise<string>>;

const docModules: Record<string, () => Promise<string>> = {
  ...bpModules,
  ...specModules,
};

// 文件名 → 中文标题覆盖（命中则显示中文标题，否则回退到去掉 .md 的文件名）。
const TITLE_OVERRIDES: Record<string, string> = {
  '2026-06-02-1x-factory-readable.md': '1× 参考工厂（精简带数值版）',
  '2026-06-02-1x-factory-AI-build.md': '1× 参考工厂（AI 详细施工版）',
};

function fileName(path: string): string {
  return path.split('/').pop() ?? path;
}

function docTitle(path: string): string {
  const name = fileName(path);
  return TITLE_OVERRIDES[name] ?? name.replace(/\.md$/, '');
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

// 自定义标题组件：按文本 slug 化加 id，让页内锚点 (#标题) 可解析。
// react-markdown / remark-gfm 默认不给标题加 id。
function makeHeading(Tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6') {
  return function Heading(props: ComponentProps<typeof Tag>) {
    const id = slugify(extractText(props.children));
    return <Tag {...props} id={id || undefined} />;
  };
}

const HEADINGS = {
  h1: makeHeading('h1'),
  h2: makeHeading('h2'),
  h3: makeHeading('h3'),
  h4: makeHeading('h4'),
  h5: makeHeading('h5'),
  h6: makeHeading('h6'),
};

interface LinkNavContext {
  /** 当前选中文档 key（用于相对路径解析的 base）。 */
  currentDocPath: string;
  /** 所有已知 doc key 集合。 */
  docKeys: Set<string>;
  /** 切换到目标文档；可选携带切换后需滚动到的锚点 id。 */
  navigateDoc: (docKey: string, anchor?: string) => void;
  /** 在当前渲染容器内平滑滚动到指定 id 的元素。 */
  scrollToAnchor: (id: string) => void;
}

// 自定义链接组件工厂：根据 href 类型决定客户端导航 / 锚点滚动 / 外链新开。
function makeAnchor(ctx: LinkNavContext) {
  return function Anchor(props: ComponentProps<'a'>) {
    const { href = '', children, ...rest } = props;
    const parsed = parseHref(ctx.currentDocPath, href, ctx.docKeys);

    // 页内锚点
    if (parsed.anchor) {
      const anchorId = parsed.anchor;
      return (
        <a
          {...rest}
          href={href}
          onClick={(e) => {
            e.preventDefault();
            ctx.scrollToAnchor(anchorId);
          }}
        >
          {children}
        </a>
      );
    }

    // 文档间链接
    if (parsed.docKey) {
      const { docKey, docAnchor } = parsed;
      return (
        <a
          {...rest}
          href={href}
          onClick={(e) => {
            e.preventDefault();
            ctx.navigateDoc(docKey, docAnchor);
          }}
        >
          {children}
        </a>
      );
    }

    // 外链 —— 新标签打开
    if (parsed.external) {
      return (
        <a {...rest} href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    }

    // 未识别（解析不到任何已知文档）—— 回退默认渲染（不拦截）
    return (
      <a {...rest} href={href}>
        {children}
      </a>
    );
  };
}

const DOC_KEYS = new Set(docPaths);

export function ManualView() {
  const [activePath, setActivePath] = useState<string>(docPaths[0] ?? '');
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // 内容容器引用 —— 锚点滚动在此容器内 querySelector。
  const contentRef = useRef<HTMLDivElement>(null);
  // 切换文档后待滚动的锚点 id（等新内容渲染完再滚）。
  const pendingAnchorRef = useRef<string | null>(null);

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

  // 在当前内容容器内平滑滚动到指定 id 的元素。
  const scrollToAnchor = useCallback((id: string) => {
    const root = contentRef.current;
    if (!root || !id) return;
    // 优先按 id 命中；兜底按 slug 化文本匹配标题。
    const target =
      root.querySelector(`#${CSS.escape(id)}`) ??
      root.querySelector(`[id="${CSS.escape(id)}"]`);
    if (target) {
      (target as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // 切换文档；若携带锚点，记下待新内容渲染完再滚。
  const navigateDoc = useCallback(
    (docKey: string, anchor?: string) => {
      pendingAnchorRef.current = anchor ?? null;
      if (docKey === activePath) {
        // 同文档内的锚点跳转 —— 内容不变，直接滚。
        if (anchor) {
          pendingAnchorRef.current = null;
          scrollToAnchor(anchor);
        }
        return;
      }
      setActivePath(docKey);
    },
    [activePath, scrollToAnchor],
  );

  // 新内容渲染完（content 变化、loading 结束）后，消费待滚动锚点。
  useEffect(() => {
    if (loading || !content) return;
    const anchor = pendingAnchorRef.current;
    if (!anchor) return;
    pendingAnchorRef.current = null;
    // 下一帧确保 DOM 已 commit。
    const raf = requestAnimationFrame(() => scrollToAnchor(anchor));
    return () => cancelAnimationFrame(raf);
  }, [content, loading, scrollToAnchor]);

  // markdown 自定义组件：pre（已有）+ 标题加 id + 链接客户端导航。
  const mdComponents = useMemo(
    () => ({
      pre: PreBlock,
      ...HEADINGS,
      a: makeAnchor({
        currentDocPath: activePath,
        docKeys: DOC_KEYS,
        navigateDoc,
        scrollToAnchor,
      }),
    }),
    [activePath, navigateDoc, scrollToAnchor],
  );

  const items = useMemo(
    () =>
      docPaths.map((p) => ({
        path: p,
        name: docTitle(p),
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
      <div className="manual-content" ref={contentRef}>
        {loading && <div className="manual-empty">加载中…</div>}
        {!loading && !content && <div className="manual-empty">选择左侧文档查看</div>}
        {!loading && content && (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
            {content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}
