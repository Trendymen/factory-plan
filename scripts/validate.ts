#!/usr/bin/env npx tsx
/**
 * 方案校验 CLI
 *
 * 用法：
 *   npx tsx scripts/validate.ts                     # 校验 data/schemes/ 下所有方案
 *   npx tsx scripts/validate.ts iron-full-line-v2    # 按名称模糊匹配
 *   npx tsx scripts/validate.ts *.json               # 按 glob 匹配
 *   npm run validate                                 # 同上（全部）
 *   npm run validate -- iron-full-line-v2            # 同上（单个）
 */
import fs from 'fs';
import path from 'path';
import { validateSchemeDetailed } from '../src/core/schema.ts';
import type { Scheme } from '../src/core/types.ts';

const SCHEMES_DIR = path.resolve(import.meta.dirname, '..', 'data', 'schemes');

// ── 收集目标文件 ──────────────────────────────────────────
const args = process.argv.slice(2);
let files: string[];

if (args.length === 0) {
  files = fs.readdirSync(SCHEMES_DIR).filter(f => f.endsWith('.json'));
} else {
  const all = fs.readdirSync(SCHEMES_DIR).filter(f => f.endsWith('.json'));
  files = [];
  for (const arg of args) {
    const needle = arg.replace(/\.json$/, '');
    const matched = all.filter(f => f.includes(needle));
    if (matched.length === 0) {
      console.error(`\x1b[31m✗ 未找到匹配 "${arg}" 的方案文件\x1b[0m`);
      process.exit(1);
    }
    files.push(...matched);
  }
  files = [...new Set(files)];
}

// ── 逐个校验 ─────────────────────────────────────────────
let totalErrors = 0;
let totalWarns = 0;

for (const file of files) {
  const filePath = path.join(SCHEMES_DIR, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Scheme;
  const issues = validateSchemeDetailed(data);
  const errors = issues.filter(i => i.severity === 'error');
  const warns = issues.filter(i => i.severity === 'warn');

  totalErrors += errors.length;
  totalWarns += warns.length;

  if (errors.length === 0 && warns.length === 0) {
    console.log(`\x1b[32m✓ ${file}\x1b[0m`);
  } else {
    const tag = errors.length > 0 ? '\x1b[31m✗' : '\x1b[33m⚠';
    console.log(`${tag} ${file}\x1b[0m  (${errors.length} errors, ${warns.length} warns)`);
    for (const e of errors) {
      console.log(`  \x1b[31m  ERROR [${e.rule}] ${e.message}\x1b[0m`);
    }
    for (const w of warns) {
      console.log(`  \x1b[33m  WARN  [${w.rule}] ${w.message}\x1b[0m`);
    }
  }
}

// ── 汇总 ─────────────────────────────────────────────────
console.log();
console.log(`共检查 ${files.length} 个方案，${totalErrors} errors，${totalWarns} warns`);

if (totalErrors > 0) {
  process.exit(1);
}
