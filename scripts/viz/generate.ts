// scripts/viz/generate.ts
import { writeFileSync } from 'node:fs';
import { FactoryViz } from './types';

function main(): void {
  const viz: FactoryViz = { panels: [] };
  const html = `<!DOCTYPE html><html><body><pre>${JSON.stringify(viz, null, 2)}</pre></body></html>`;
  writeFileSync('docs/viz/2026-04-20-conveyor-layout.html', html, 'utf8');
  // eslint-disable-next-line no-console
  console.log('Wrote docs/viz/2026-04-20-conveyor-layout.html');
}

main();
