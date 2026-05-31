import { memo } from 'react';

interface Props {
  text: string;
}

/**
 * 根治方案（见 deep-research 结论）：用自托管的「真双宽等宽字体」maple-grid
 * （ASCII=600 / box-drawing=600 / CJK=1200，严格 1:1:2 advance）+ 朴素整段 <pre>
 * 渲染。绝不拆字符 span、绝不用 ch 单位、绝不套 inline-block —— 让浏览器对一整段
 * 连续等宽文本 run 自然排版（内部分数 advance 累积、末端只取整一次，不累积误差）。
 * font-family 只放 maple-grid 一个字体、不留系统回退，杜绝中文 fallback 破坏 2:1。
 */
function AsciiBlockImpl({ text }: Props) {
  return <pre className="ascii-pre">{text.replace(/\n$/, '')}</pre>;
}

export const AsciiBlock = memo(AsciiBlockImpl);
