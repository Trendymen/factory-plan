// 东亚字符宽度：CJK/假名/谚文/全角 → 宽(2格)；ASCII/box-drawing(U+2500-257F)/其它 → 窄(1格)。
// box-drawing 不在任何宽范围内，故为 1 格——这是 ASCII 框线对齐的关键。
export function isWideChar(cp: number): boolean {
  return (
    (cp >= 0x1100 && cp <= 0x115f) || // Hangul Jamo
    (cp >= 0x2e80 && cp <= 0x303e) || // CJK 部首/康熙/CJK 符号标点(含 。、）
    (cp >= 0x3041 && cp <= 0x33ff) || // 平假名/片假名/CJK 符号
    (cp >= 0x3400 && cp <= 0x4dbf) || // CJK 扩展 A
    (cp >= 0x4e00 && cp <= 0x9fff) || // CJK 统一表意
    (cp >= 0xa000 && cp <= 0xa4cf) || // 彝文
    (cp >= 0xac00 && cp <= 0xd7a3) || // 谚文音节
    (cp >= 0xf900 && cp <= 0xfaff) || // CJK 兼容表意
    (cp >= 0xfe30 && cp <= 0xfe4f) || // CJK 兼容形式
    (cp >= 0xff00 && cp <= 0xff60) || // 全角 ASCII
    (cp >= 0xffe0 && cp <= 0xffe6) || // 全角符号
    (cp >= 0x20000 && cp <= 0x3fffd) // CJK 扩展 B+
  );
}
