// scripts/viz/render-html.ts
import { Panel } from './types';
import { PanelLayout } from './layout';
import { renderPanelSvg } from './render-svg';

export interface PanelRender {
  panel: Panel;
  layout: PanelLayout;
}

export function renderHtml(panelRenders: PanelRender[]): string {
  const svgs = panelRenders
    .map(({ panel, layout }) => `
<section id="${escape(panel.id)}" class="panel">
  <h2>${escape(panel.title)}</h2>
  ${renderPanelSvg(panel, layout)}
</section>
`)
    .join('\n');

  const toc = panelRenders
    .map(({ panel }) => `<li><a href="#${escape(panel.id)}">${escape(panel.title)}</a></li>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>130 台工厂分流/合流拓扑图</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Microsoft YaHei", sans-serif; margin: 0; padding: 0; display: flex; }
  nav { position: fixed; top: 0; left: 0; width: 280px; height: 100vh; overflow-y: auto; background: #222; color: #eee; padding: 20px; box-sizing: border-box; }
  nav h1 { font-size: 16px; margin: 0 0 16px; }
  nav ol { padding-left: 20px; font-size: 13px; line-height: 1.8; }
  nav a { color: #8ec9ff; text-decoration: none; }
  nav a:hover { text-decoration: underline; }
  main { margin-left: 300px; padding: 20px; flex: 1; }
  .panel { margin-bottom: 40px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; background: white; }
  .panel h2 { margin: 0; padding: 12px 16px; background: #f0f0f0; border-bottom: 1px solid #ddd; font-size: 15px; }
  .panel-svg { display: block; max-width: 100%; }
  .legend { padding: 16px; font-size: 12px; background: #333; border-radius: 6px; margin-bottom: 16px; }
  .legend p { margin: 4px 0; }
</style>
</head>
<body>
<nav>
  <h1>130 台工厂拓扑图</h1>
  <div class="legend">
    <p><strong>图例</strong></p>
    <p>▶ M = 合流器（≤3 入 1 出）</p>
    <p>◀ S = 分流器（1 入 ≤3 出）</p>
    <p>⬢ = 外输终端</p>
    <p>红粗线 = Mk.3 接近满载（≥90%）</p>
    <p style="color:#aaa; margin-top:8px;">所有流量为稳态值。</p>
  </div>
  <ol>${toc}</ol>
</nav>
<main>${svgs}</main>
</body>
</html>`;
}

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
