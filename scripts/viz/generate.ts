// scripts/viz/generate.ts
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { panels333 } from './data-333';
import { validatePanel } from './validate';
import { layoutPanel } from './layout';
import { renderHtml, PanelRender } from './render-html';

function main(): void {
  const allErrors: string[] = [];
  for (const panel of panels333) {
    allErrors.push(...validatePanel(panel));
  }
  if (allErrors.length > 0) {
    // eslint-disable-next-line no-console
    console.error('Validation errors:');
    for (const e of allErrors) console.error(' -', e);
    process.exit(1);
  }

  const panelRenders: PanelRender[] = panels333.map((panel) => ({
    panel,
    layout: layoutPanel(panel),
  }));

  const html = renderHtml(panelRenders);

  const outPath = 'docs/viz/2026-04-20-conveyor-layout.html';
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, html, 'utf8');
  // eslint-disable-next-line no-console
  console.log(`Wrote ${outPath} (${panels333.length} panels, ${html.length} bytes)`);
}

main();
