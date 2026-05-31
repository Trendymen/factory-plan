// scripts/fix-ascii-grid.mjs
// 批量补齐 BP 施工手册里 ASCII 俯视图的右边框列宽，使每张图的右边界 │/┐/┘ 落在同一显示列。
// 纯机械对齐（在右边框字符前补 ─ 或空格），不改图的语义内容。
// 用法：node scripts/fix-ascii-grid.mjs            → dry-run，仅打印将改动
//       node scripts/fix-ascii-grid.mjs --write    → 实际写盘
//       node scripts/fix-ascii-grid.mjs --only BP01 → 只处理文件名含 BP01 的

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'docs/superpowers/specs/2026-05-24-tier7-blueprints';
const WRITE = process.argv.includes('--write');
const onlyIdx = process.argv.indexOf('--only');
const ONLY = onlyIdx >= 0 ? process.argv[onlyIdx + 1] : null;

// 显示列宽：CJK/全角/假名/谚文 = 2，其余（ASCII、box-drawing U+2500-257F、箭头）= 1
function dw(ch) {
  const cp = ch.codePointAt(0);
  if (
    (cp >= 0x1100 && cp <= 0x115f) ||
    (cp >= 0x2e80 && cp <= 0x303e) ||
    (cp >= 0x3041 && cp <= 0x33ff) ||
    (cp >= 0x3400 && cp <= 0x4dbf) ||
    (cp >= 0x4e00 && cp <= 0x9fff) ||
    (cp >= 0xac00 && cp <= 0xd7a3) ||
    (cp >= 0xf900 && cp <= 0xfaff) ||
    (cp >= 0xfe30 && cp <= 0xfe4f) ||
    (cp >= 0xff00 && cp <= 0xff60) ||
    (cp >= 0xffe0 && cp <= 0xffe6)
  ) return 2;
  return 1;
}
function width(s) { let w = 0; for (const c of s) w += dw(c); return w; }

const RIGHT_BORDER = new Set(['│', '┐', '┘', '┤', '╮', '╯', '┃', '║', '╗', '╝']);
const HLINE = new Set(['─', '━', '┄', '┅', '┈', '┉', '╌', '═', '�century']); // 横线类（补 ─）

// 修一个 ASCII 代码块（行数组），返回 {lines, changed, targetCol}
function fixBlock(lines) {
  // 每行：去掉行尾空格后，最后一个字符是否右边框？记录其显示列
  const info = lines.map((ln) => {
    const trimmed = ln.replace(/\s+$/, '');
    const lastCh = [...trimmed].at(-1);
    const isBorder = lastCh && RIGHT_BORDER.has(lastCh);
    return { ln, trimmed, lastCh, isBorder, col: isBorder ? width(trimmed) : null };
  });
  const borderCols = info.filter((i) => i.isBorder).map((i) => i.col);
  if (borderCols.length < 2) return { lines, changed: 0, targetCol: null };
  const target = Math.max(...borderCols);

  let changed = 0;
  const out = info.map((i) => {
    if (!i.isBorder || i.col === target) return i.ln;
    const deficit = target - i.col;
    if (deficit <= 0) return i.ln;
    // 在末尾右边框字符之前插入 deficit 个填充
    const chars = [...i.trimmed];
    const borderChar = chars.pop(); // 右边框字符
    const prev = chars.at(-1);
    const fillCh = prev && HLINE.has(prev) ? '─' : ' ';
    const fill = fillCh.repeat(deficit);
    changed++;
    return chars.join('') + fill + borderChar;
  });
  return { lines: out, changed, targetCol: target };
}

function processFile(path) {
  const raw = readFileSync(path, 'utf8');
  const lines = raw.split('\n');
  const result = [];
  let i = 0;
  let totalChanged = 0;
  const blockReports = [];
  while (i < lines.length) {
    const line = lines[i];
    if (line.trimStart().startsWith('```')) {
      // 收集到闭合 ```
      const fenceStart = i;
      const body = [];
      let j = i + 1;
      while (j < lines.length && !lines[j].trimStart().startsWith('```')) {
        body.push(lines[j]); j++;
      }
      const hasFence = j < lines.length;
      const isBoxBlock = body.some((b) => /[┌┐└┘├┤┬┴┼│─]/.test(b));
      if (isBoxBlock) {
        const { lines: fixed, changed, targetCol } = fixBlock(body);
        if (changed > 0) {
          blockReports.push({ atLine: fenceStart + 1, changed, targetCol });
          totalChanged += changed;
        }
        result.push(line, ...fixed);
        if (hasFence) result.push(lines[j]);
      } else {
        result.push(line, ...body);
        if (hasFence) result.push(lines[j]);
      }
      i = hasFence ? j + 1 : j;
    } else {
      result.push(line); i++;
    }
  }
  return { content: result.join('\n'), totalChanged, blockReports };
}

const files = readdirSync(DIR).filter((f) => f.endsWith('.md') && (!ONLY || f.includes(ONLY)));
let grand = 0;
for (const f of files) {
  const path = join(DIR, f);
  const { content, totalChanged, blockReports } = processFile(path);
  if (totalChanged > 0) {
    grand += totalChanged;
    console.log(`\n${f}: 补齐 ${totalChanged} 行`);
    for (const r of blockReports) console.log(`  块@L${r.atLine}: ${r.changed} 行 → 对齐到第 ${r.targetCol} 列`);
    if (WRITE) { writeFileSync(path, content, 'utf8'); console.log(`  ✓ 已写盘`); }
  }
}
console.log(`\n${WRITE ? '已写盘' : 'DRY-RUN'}：共 ${grand} 行需补齐，涉及 ${files.length} 个文件中的若干`);
