import scheme from '../data/schemes/multi-terminal-megabase-v3.json';
import { validateSchemeDetailed } from '../src/core/schema';
import { deriveMaterials } from '../src/core/deriveMaterials';
import type { Scheme } from '../src/core/types';

const s = scheme as unknown as Scheme;
const issues = validateSchemeDetailed(s);
const errors = issues.filter(i => i.severity === 'error');
const warns = issues.filter(i => i.severity === 'warn');

console.log(`\n=== multi-terminal-megabase-v3 Validation ===`);
console.log(`Errors: ${errors.length}`);
errors.forEach(e => console.log(`  [${e.rule}] ${e.message}`));

console.log(`\nWarnings: ${warns.length}`);
const byRule = new Map<string, number>();
warns.forEach(w => byRule.set(w.rule, (byRule.get(w.rule) ?? 0) + 1));
for (const [rule, count] of [...byRule].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${rule}: ${count}`);
}

console.log(`\nAll warnings:`);
warns.forEach(w => console.log(`  [${w.rule}] ${w.message}`));

const mat = deriveMaterials(s);
console.log(`\n=== Belt labels (${s.belts.length} belts) ===`);
for (const belt of s.belts) {
  const mats = mat.get(belt.id) ?? [];
  const label = mats.length > 0 ? mats.join('+') : belt.id;
  console.log(`  ${belt.id.padEnd(40)} → "${label}"`);
}

if (errors.length > 0) process.exit(1);
