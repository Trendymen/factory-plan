import { describe, it, expect } from 'vitest';
import { isWideChar } from '../manual/eastAsianWidth';

describe('isWideChar', () => {
  it('CJK 汉字为宽', () => {
    expect(isWideChar('铁'.codePointAt(0)!)).toBe(true);
    expect(isWideChar('台'.codePointAt(0)!)).toBe(true);
  });
  it('全角中文标点为宽', () => {
    expect(isWideChar('，'.codePointAt(0)!)).toBe(true);
    expect(isWideChar('。'.codePointAt(0)!)).toBe(true);
  });
  it('ASCII 字母数字为窄', () => {
    expect(isWideChar('A'.codePointAt(0)!)).toBe(false);
    expect(isWideChar('5'.codePointAt(0)!)).toBe(false);
    expect(isWideChar(' '.codePointAt(0)!)).toBe(false);
  });
  it('box-drawing 框线为窄（对齐关键）', () => {
    for (const ch of ['─', '│', '┌', '┐', '└', '┘', '├', '┤', '┬', '┴', '┼']) {
      expect(isWideChar(ch.codePointAt(0)!)).toBe(false);
    }
  });
});
