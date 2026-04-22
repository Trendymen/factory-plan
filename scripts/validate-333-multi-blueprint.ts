import scheme from '../data/schemes/333-multi-blueprint-v1.json';
import { validateSchemeDetailed } from '../src/core/schema';
import { deriveMaterials } from '../src/core/deriveMaterials';
import type { Scheme } from '../src/core/types';

const s = scheme as unknown as Scheme;
const issues = validateSchemeDetailed(s);
const errors = issues.filter(issue => issue.severity === 'error');
const warns = issues.filter(issue => issue.severity === 'warn');

console.log('\n=== 333-multi-blueprint-v1 Validation ===');
console.log(`Errors: ${errors.length}`);
errors.forEach(error => console.log(`  [${error.rule}] ${error.message}`));

console.log(`\nWarnings: ${warns.length}`);
const byRule = new Map<string, number>();
warns.forEach(warn => byRule.set(warn.rule, (byRule.get(warn.rule) ?? 0) + 1));
for (const [rule, count] of [...byRule].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${rule}: ${count}`);
}

console.log('\nAll warnings:');
warns.forEach(warn => console.log(`  [${warn.rule}] ${warn.message}`));

console.log('\n=== Belt labels ===');
const materialMap = deriveMaterials(s);
for (const belt of s.belts) {
  const materials = materialMap.get(belt.id) ?? [];
  const label = materials.length > 0 ? materials.join('+') : belt.id;
  const fallback = materials.length === 0 ? '  <- FALLBACK (id)' : '';
  console.log(`  ${belt.id.padEnd(36)} -> "${label}"${fallback}`);
}

if (errors.length > 0) process.exit(1);
