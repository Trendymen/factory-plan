import { memo } from 'react';
import { isWideChar } from './eastAsianWidth';

interface Props {
  text: string;
}

/** 把一段文本逐字符渲染成固定宽度盒子：中文 2ch、ASCII/框线 1ch，逐格对齐。 */
function AsciiBlockImpl({ text }: Props) {
  const lines = text.replace(/\n$/, '').split('\n');
  return (
    <pre className="ascii-grid">
      {lines.map((line, i) => (
        <div className="ascii-row" key={i}>
          {Array.from(line).map((ch, j) => {
            const cp = ch.codePointAt(0) ?? 0;
            return (
              <span key={j} className={isWideChar(cp) ? 'cw2' : 'cw1'}>
                {ch}
              </span>
            );
          })}
        </div>
      ))}
    </pre>
  );
}

export const AsciiBlock = memo(AsciiBlockImpl);
