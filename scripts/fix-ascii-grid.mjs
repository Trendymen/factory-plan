// scripts/fix-ascii-grid.mjs
// 对齐 BP 施工手册里 ASCII 俯视图每行的「最右竖线」到统一显示列，使图的右边框成一条直线。
// 关键：按竖线的【右边界显示列(endCol)】对齐，不依赖「行尾是否边框」——因为这些图的右外框
// 后面常跟盒外中文注释（如 │…│  进料巷 0-4m）。纯机械补 ─/空格，不改语义文字。
// 用法：node scripts/fix-ascii-grid.mjs            → dry-run
//       node scripts/fix-ascii-grid.mjs --write    → 写盘
//       node scripts/fix-ascii-grid.mjs --only BP02 → 仅文件名含 BP02 的
//       node scripts/fix-ascii-grid.mjs --diag BP02 → 打印每块对齐前后右框列分布

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'docs/superpowers/specs/2026-05-24-tier7-blueprints';
const WRITE = process.argv.includes('--write');
const arg = (flag) => { const i = process.argv.indexOf(flag); return i >= 0 ? process.argv[i + 1] : null; };
const ONLY = arg('--only');
const DIAG = arg('--diag');

// 东亚显示列宽：CJK/全角/假名/谚文 = 2；ASCII、box-drawing(U+2500-257F)、箭头 = 1
function dw(ch) {
  const cp = ch.codePointAt(0);
  if (
    (cp >= 0x1100 && cp <= 0x115f) || (cp >= 0x2e80 && cp <= 0x303e) ||
    (cp >= 0x3041 && cp <= 0x33ff) || (cp >= 0x3400 && cp <= 0x4dbf) ||
    (cp >= 0x4e00 && cp <= 0x9fff) || (cp >= 0xac00 && cp <= 0xd7a3) ||
    (cp >= 0xf900 && cp <= 0xfaff) || (cp >= 0xfe30 && cp <= 0xfe4f) ||
    (cp >= 0xff00 && cp <= 0xff60) || (cp >= 0xffe0 && cp <= 0xffe6)
  ) return 2;
  return 1;
}

const VBAR = new Set(['│', '┃']);
const HLINE = new Set(['─', '━', '┄', '┅', '┈', '┉', '╌', '═', '╤', '╧', '╪']);

// 该行最右竖线：返回 { idx(字符数组下标), endCol(其右边界显示列) }；无竖线返回 null
function rightBar(chars) {
  let w = 0, best = null;
  for (let i = 0; i < chars.length; i++) {
    const cw = dw(chars[i]);
    if (VBAR.has(chars[i])) best = { idx: i, endCol: w + cw };
    w += cw;
  }
  return best;
}

// 修一个 ASCII 代码块。返回 {lines, changed, R, before}
function fixBlock(rawLines) {
  const rows = rawLines.map((l) => Array.from(l));
  const bars = rows.map(rightBar);
  const ends = bars.filter(Boolean).map((b) => b.endCol);
  const before = bars.map((b) => (b ? b.endCol : null));
  if (ends.length < 2) return { lines: rawLines, changed: 0, R: null, before };
  const R = Math.max(...ends);
  // 区间保护：只对齐那些「最右竖线已接近 R」的行（认定为右外框），避免误推纯内部竖线/残行
  const GUARD = 8;
  let changed = 0;
  const out = rows.map((chars, ri) => {
    const b = bars[ri];
    if (!b) return chars.join('');
    if (b.endCol === R) return chars.join('');
    if (b.endCol < R - GUARD) return chars.join(''); // 该行没有右外框（最右竖线离 R 太远），不动
    const deficit = R - b.endCol;
    if (deficit <= 0) return chars.join('');
    const prev = chars[b.idx - 1];
    const fillCh = prev && HLINE.has(prev) ? '─' : ' ';
    chars.splice(b.idx, 0, ...Array(deficit).fill(fillCh));
    changed++;
    return chars.join('');
  });
  return { lines: out, changed, R, before };
}

function processFile(path) {
  const lines = readFileSync(path, 'utf8').split('\n');
  const result = [];
  let i = 0, totalChanged = 0;
  const reports = [];
  while (i < lines.length) {
    if (lines[i].trimStart().startsWith('```')) {
      const fenceStart = i;
      const body = [];
      let j = i + 1;
      while (j < lines.length && !lines[j].trimStart().startsWith('```')) { body.push(lines[j]); j++; }
      const hasFence = j < lines.length;
      const isBox = body.some((b) => /[┌┐└┘├┤┬┴┼│]/.test(b));
      if (isBox) {
        const { lines: fixed, changed, R, before } = fixBlock(body);
        if (DIAG) {
          const after = fixed.map((l) => { const b = rightBar(Array.from(l)); return b ? b.endCol : null; });
          const uniqB = [...new Set(before.filter((x) => x != null))].sort((a, b2) => a - b2);
          const uniqA = [...new Set(after.filter((x) => x != null))].sort((a, b2) => a - b2);
          reports.push(`  块@L${fenceStart + 1}: R=${R} 右框列 before=[${uniqB}] after=[${uniqA}] (${changed}行改)`);
        }
        if (changed > 0 && !DIAG) reports.push(`  块@L${fenceStart + 1}: ${changed} 行 → 右框对齐到第 ${R} 列`);
        totalChanged += changed;
        result.push(lines[i], ...fixed);
        if (hasFence) result.push(lines[j]);
      } else {
        result.push(lines[i], ...body);
        if (hasFence) result.push(lines[j]);
      }
      i = hasFence ? j + 1 : j;
    } else { result.push(lines[i]); i++; }
  }
  return { content: result.join('\n'), totalChanged, reports };
}

const files = readdirSync(DIR).filter((f) => f.endsWith('.md') && (!ONLY || f.includes(ONLY)) && (!DIAG || f.includes(DIAG)));
let grand = 0;
for (const f of files) {
  const path = join(DIR, f);
  const { content, totalChanged, reports } = processFile(path);
  if (totalChanged > 0 || DIAG) {
    grand += totalChanged;
    console.log(`\n${f}:${DIAG ? '' : ' 补齐 ' + totalChanged + ' 行'}`);
    reports.forEach((r) => console.log(r));
    if (WRITE && !DIAG && totalChanged > 0) { writeFileSync(path, content, 'utf8'); console.log('  ✓ 已写盘'); }
  }
}
console.log(`\n${DIAG ? 'DIAG' : WRITE ? '已写盘' : 'DRY-RUN'}：共 ${grand} 行${WRITE ? '已补齐' : '需补齐'}`);
