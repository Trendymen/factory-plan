// scripts/audit-ascii.mjs — 全量审计每张 ASCII 图的对齐健康度
// 对每个代码块：检测「框架行」(主要由 box-drawing 构成的行，如 ┌┐ ├┤ └┘ 顶底分隔)
// 的右边框是否在同一列；以及块内竖线列的离散程度。输出每张图的健康标签。
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'docs/superpowers/specs/2026-05-24-tier7-blueprints';

function dw(ch) {
  const cp = ch.codePointAt(0);
  if ((cp>=0x1100&&cp<=0x115f)||(cp>=0x2e80&&cp<=0x303e)||(cp>=0x3041&&cp<=0x33ff)||
      (cp>=0x3400&&cp<=0x4dbf)||(cp>=0x4e00&&cp<=0x9fff)||(cp>=0xac00&&cp<=0xd7a3)||
      (cp>=0xf900&&cp<=0xfaff)||(cp>=0xfe30&&cp<=0xfe4f)||(cp>=0xff00&&cp<=0xff60)||
      (cp>=0xffe0&&cp<=0xffe6)) return 2;
  return 1;
}
const VBAR = new Set(['│','┃']);
// 行内所有竖线的显示列(右边界)
function barCols(line) { const out=[]; let w=0; for (const c of line){ const cw=dw(c); if(VBAR.has(c)) out.push(w+cw); w+=cw; } return out; }
// 该行是否"框架行"：主要由 box-drawing 组成（去空格后 box 占比高）
function isFrameRow(line) {
  const t = line.replace(/\s/g,''); if (!t) return false;
  let box=0; for (const c of t){ const cp=c.codePointAt(0); if (cp>=0x2500&&cp<=0x257f) box++; }
  return box/[...t].length > 0.6;
}

const files = readdirSync(DIR).filter(f=>f.endsWith('.md')).sort();
const summary = { perfect:0, rightOnly:0, broken:0, total:0 };
const details = [];
for (const f of files) {
  const lines = readFileSync(join(DIR,f),'utf8').split('\n');
  let i=0, blk=0;
  while (i<lines.length) {
    if (lines[i].trimStart().startsWith('```')) {
      const body=[]; let j=i+1;
      while (j<lines.length && !lines[j].trimStart().startsWith('```')){ body.push([j+1,lines[j]]); j++; }
      if (body.some(([,l])=>/[┌┐└┘├┤┼]/.test(l))) {
        blk++; summary.total++;
        // 右边框收敛性：每行最右竖线列
        const rights = body.map(([,l])=>{const c=barCols(l); return c.length?c[c.length-1]:null;}).filter(x=>x!=null);
        const rightDistinct = new Set(rights).size;
        // 内部竖线网格健康度：统计所有竖线列，看是否聚成清晰的少数几列，还是散乱
        const allCols=[]; for (const [,l] of body) allCols.push(...barCols(l));
        const colFreq={}; allCols.forEach(c=>colFreq[c]=(colFreq[c]||0)+1);
        const cols=Object.keys(colFreq).map(Number).sort((a,b)=>a-b);
        // 相邻列差 1~2 的"漂移对"数量（同一道竖线散开的迹象）
        let driftPairs=0; for (let k=1;k<cols.length;k++) if (cols[k]-cols[k-1]<=2) driftPairs++;
        const nrow = body.filter(([,l])=>/│/.test(l)).length;
        let tag;
        if (rightDistinct<=1 && driftPairs===0) tag='✓完好';
        else if (driftPairs===0) tag='△仅右框需补('+rightDistinct+'列)';
        else tag='✗内部竖线散乱(漂移'+driftPairs+'/列'+cols.length+')';
        if (tag.startsWith('✓')) summary.perfect++; else if (tag.startsWith('△')) summary.rightOnly++; else summary.broken++;
        details.push(`${f} 块#${blk}(L${i+1},${nrow}行): ${tag}`);
      }
      i = j<lines.length ? j+1 : j;
    } else i++;
  }
}
console.log(details.join('\n'));
console.log(`\n=== 汇总：共 ${summary.total} 张图 | 完好 ${summary.perfect} | 仅右框需补 ${summary.rightOnly} | 内部散乱 ${summary.broken} ===`);
