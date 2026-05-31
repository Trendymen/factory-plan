// src/manual/AsciiBlock.tsx
import { memo, type ReactNode } from 'react';
import { isWideChar } from './eastAsianWidth';

interface Props {
  text: string;
}

/**
 * 方案 D：框线/拉丁/数字/空格保持在 <pre white-space:pre> 文本流里（连续无缝，
 * 终端式渲染），仅把 CJK 宽字符单独包成 width:2ch 的 inline-block 盒子锁死宽度。
 * 这样：框线连续不裂缝 + 中文恒占 2 格 + 右边框逐列对齐，且不依赖具体字体。
 */
function renderLine(line: string, lineIdx: number): ReactNode[] {
  const nodes: ReactNode[] = [];
  let buf = '';
  let k = 0;
  for (const ch of Array.from(line)) {
    const cp = ch.codePointAt(0) ?? 0;
    if (isWideChar(cp)) {
      if (buf) {
        nodes.push(buf);
        buf = '';
      }
      nodes.push(
        <span key={'w' + lineIdx + '-' + k} className="cjk2">
          {ch}
        </span>,
      );
      k++;
    } else {
      buf += ch;
    }
  }
  if (buf) nodes.push(buf);
  return nodes;
}

function AsciiBlockImpl({ text }: Props) {
  const lines = text.replace(/\n$/, '').split('\n');
  return (
    <pre className="ascii-pre">
      {lines.map((line, i) => (
        <span key={i}>
          {renderLine(line, i)}
          {i < lines.length - 1 ? '\n' : ''}
        </span>
      ))}
    </pre>
  );
}

export const AsciiBlock = memo(AsciiBlockImpl);
