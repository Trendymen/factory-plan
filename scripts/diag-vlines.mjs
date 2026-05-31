// 诊断一个 md 里每个 ASCII 块中所有竖线 │ 的显示列位置，看哪些竖线列在各行不一致
import { readFileSync } from 'node:fs';
const path = process.argv[2];
if (!path) { console.error('用法: node scripts/diag-vlines.mjs <md路径>'); process.exit(1); }

function dw(ch) {
  const cp = ch.codePointAt(0);
  if ((cp>=0x1100&&cp<=0x115f)||(cp>=0x2e80&&cp<=0x303e)||(cp>=0x3041&&cp<=0x33ff)||
      (cp>=0x3400&&cp<=0x4dbf)||(cp>=0x4e00&&cp<=0x9fff)||(cp>=0xac00&&cp<=0xd7a3)||
      (cp>=0xf900&&cp<=0xfaff)||(cp>=0xfe30&&cp<=0xfe4f)||(cp>=0xff00&&cp<=0xff60)||
      (cp>=0xffe0&&cp<=0xffe6)) return 2;
  return 1;
}
// 返回该行所有 │ 的显示列位置数组
function barCols(line) {
  const cols = []; let c = 0;
  for (const ch of line) { c += dw(ch); if (ch === '│' || ch === '┃') cols.push(c); }
  return cols;
}

const lines = readFileSync(path, 'utf8').split('\n');
let i = 0, blk = 0;
while (i < lines.length) {
  if (lines[i].trimStart().startsWith('```')) {
    const body = []; let j = i+1;
    while (j < lines.length && !lines[j].trimStart().startsWith('```')) { body.push([j+1, lines[j]]); j++; }
    if (body.some(([,l]) => /[┌┐└┘│]/.test(l))) {
      blk++;
      console.log(`\n===== 块 #${blk} (L${i+1}) =====`);
      // 统计每个竖线列出现频次
      const freq = {};
      for (const [,l] of body) for (const c of barCols(l)) freq[c] = (freq[c]||0)+1;
      const colsSorted = Object.keys(freq).map(Number).sort((a,b)=>a-b);
      console.log(`竖线列位置→出现行数: ${colsSorted.map(c=>`${c}:${freq[c]}`).join('  ')}`);
      const nrows = body.filter(([,l])=>/│/.test(l)).length;
      console.log(`含竖线的行数: ${nrows}`);
      // 找"主竖线列"（出现≥半数行的列）= 应该贯穿对齐的列
      const major = colsSorted.filter(c => freq[c] >= nrows*0.4);
      console.log(`主竖线列(出现≥40%行): [${major.join(', ')}]  ← 这些应在每行同列贯穿`);
      // 逐行列出竖线列，标出偏离
      console.log('逐行竖线列:');
      for (const [ln, l] of body) {
        const cols = barCols(l);
        if (cols.length) console.log(`  L${ln}: [${cols.join(',')}]  ${l.replace(/\s+$/,'').slice(0,2)==='  '?'':''}`);
      }
    }
    i = j < lines.length ? j+1 : j;
  } else i++;
}
