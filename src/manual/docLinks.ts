// src/manual/docLinks.ts
// 手册内文档间链接的客户端导航辅助。
// 把 markdown 里的相对链接（相对当前文档目录）解析为 docModules 的 key，
// 以及把锚点链接的标题文本 slug 化，方便 react-markdown 的自定义 h1..h6 加 id。

/** 取路径的目录部分（含尾部斜杠），如 `/a/b/c.md` → `/a/b/`。 */
function dirOf(path: string): string {
  const idx = path.lastIndexOf('/');
  return idx >= 0 ? path.slice(0, idx + 1) : '';
}

/**
 * 把相对 href（相对 baseDir）规范化为绝对路径。
 * 处理 `./`、`../`、多余斜杠。若 href 以 `/` 开头则视为绝对路径。
 */
function resolvePath(baseDir: string, href: string): string {
  const start = href.startsWith('/') ? '' : baseDir;
  const combined = start + href;
  const isDir = combined.endsWith('/');
  const segments = combined.split('/');
  const out: string[] = [];
  for (const seg of segments) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') {
      out.pop();
      continue;
    }
    out.push(seg);
  }
  return '/' + out.join('/') + (isDir && out.length ? '/' : '');
}

export interface ParsedHref {
  /** 标题锚点 id（不含 `#`），仅当 href 以 `#` 开头时有值。 */
  anchor?: string;
  /** 解析后的 docModules key（文档链接命中时有值）。 */
  docKey?: string;
  /** 文档链接 href 尾部携带的锚点（先切文档、渲染后再滚动到此 id）。 */
  docAnchor?: string;
  /** 外链（http/https/mailto 等），保留默认行为、新标签打开。 */
  external?: boolean;
}

/**
 * 解析一个 markdown 链接 href。
 * @param currentDocPath 当前选中文档的 docModules key（绝对路径）。
 * @param href           markdown 里的原始 href。
 * @param docKeys        所有已知 doc key 的集合。
 */
export function parseHref(
  currentDocPath: string,
  href: string,
  docKeys: Set<string>,
): ParsedHref {
  if (!href) return {};

  // 1) 纯页内锚点
  if (href.startsWith('#')) {
    return { anchor: href.slice(1) };
  }

  // 2) 协议链接（外链）—— http(s)、mailto、tel、//host 等
  if (/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(href)) {
    return { external: true };
  }

  // 3) 相对/绝对路径文档链接 —— 拆出尾部 #锚点
  const hashIdx = href.indexOf('#');
  const pathPart = hashIdx >= 0 ? href.slice(0, hashIdx) : href;
  const docAnchor = hashIdx >= 0 ? href.slice(hashIdx + 1) : undefined;

  // 仅有锚点、路径部分为空 → 当作页内锚点
  if (!pathPart) {
    return docAnchor ? { anchor: docAnchor } : {};
  }

  const baseDir = dirOf(currentDocPath);
  const resolved = resolvePath(baseDir, pathPart);

  const docKey = matchDocKey(resolved, docKeys);
  if (docKey) {
    return { docKey, docAnchor };
  }

  // 没匹配到任何已知文档 —— 交回默认行为
  return {};
}

/**
 * 把解析后的绝对路径匹配到一个真实存在的 doc key。
 * 兜底策略：精确命中 → 追加 `.md` → 目录则取该目录下第一个文档（按字典序）。
 */
function matchDocKey(resolved: string, docKeys: Set<string>): string | undefined {
  // 精确命中
  if (docKeys.has(resolved)) return resolved;

  if (resolved.endsWith('/')) {
    // 目录链接 —— 取该目录下第一个文档（字典序最小）
    const prefix = resolved;
    let best: string | undefined;
    for (const key of docKeys) {
      if (key.startsWith(prefix) && (best === undefined || key < best)) {
        best = key;
      }
    }
    return best;
  }

  // 缺 .md 后缀的兜底
  if (!resolved.endsWith('.md') && docKeys.has(resolved + '.md')) {
    return resolved + '.md';
  }

  // 把无扩展名路径当作目录索引兜底：取该目录下第一个文档
  const asDir = resolved + '/';
  let best: string | undefined;
  for (const key of docKeys) {
    if (key.startsWith(asDir) && (best === undefined || key < best)) {
      best = key;
    }
  }
  return best;
}

/**
 * 把标题文本 slug 化为锚点 id（GitHub 风格的简化版）。
 * 小写、去掉非字母数字/中文/空格/连字符的字符、空白转连字符。
 */
export function slugify(text: string): string {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\w一-龥\- ]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}
