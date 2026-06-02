export interface Cross {
  dir: 'up' | 'down';
  target: string;
  material: string;
}

// 横向回流：与「左进右出」相反方向的料流。
// side='right'：从下游(右侧)BP 回流进本层 → 右侧 ◀ 入。
// side='left' ：回送给上游(左侧)BP → 左侧 ◀ 出。
export interface ReverseFlow {
  side: 'left' | 'right';
  label: string;
}

export interface Height {
  low: number;
  high: number;
}

export interface Floor {
  name: string;
  height?: Height;
  machines: string;
  input?: string;
  output?: string;
  cross?: Cross;
  reverse?: ReverseFlow[];
}

export interface FloorStack {
  title?: string;
  floors: Floor[];
}

const CROSS_RE = /^([↑↓])\s*([^:：]+)\s*[:：]\s*(.+)$/;

export function parseCross(field: string): Cross | undefined {
  const m = field.trim().match(CROSS_RE);
  if (!m) return undefined;
  return {
    dir: m[1] === '↑' ? 'up' : 'down',
    target: m[2].trim(),
    material: m[3].trim(),
  };
}

// 层名里可带高度范围：「1F (0-8m)」「屋顶 (35-40m)」→ 拆出 name + height。
const HEIGHT_RE = /^(.+?)\s*[（(]\s*([\d.]+)\s*-\s*([\d.]+)\s*m\s*[)）]\s*$/;

export function parseName(raw: string): { name: string; height?: Height } {
  const m = raw.trim().match(HEIGHT_RE);
  if (!m) return { name: raw.trim() };
  return { name: m[1].trim(), height: { low: parseFloat(m[2]), high: parseFloat(m[3]) } };
}

// 第 6 列「回流」：分号分隔，每项以 左/右 开头（可带冒号），如「右:螺丝 ← BP3 ; 左:螺丝 → BP2」。
const REV_RE = /^(左|右)\s*[:：]?\s*(.+)$/;

export function parseReverse(field: string): ReverseFlow[] | undefined {
  const t = field.trim();
  if (!t) return undefined;
  const out: ReverseFlow[] = [];
  for (const part of t.split(/[;；]/)) {
    const m = part.trim().match(REV_RE);
    if (m) out.push({ side: m[1] === '左' ? 'left' : 'right', label: m[2].trim() });
  }
  return out.length ? out : undefined;
}

export function parseFloorStack(text: string): FloorStack {
  const lines = text.split('\n');
  let title: string | undefined;
  const floors: Floor[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line.startsWith('#')) {
      if (title === undefined) title = line.replace(/^#+\s*/, '').trim();
      continue;
    }
    const cols = line.split('|').map((c) => c.trim());
    const [nameRaw = '', machines = '', input = '', output = '', cross = '', reverse = ''] = cols;
    if (!nameRaw) continue;
    const { name, height } = parseName(nameRaw);
    floors.push({
      name,
      height,
      machines,
      input: input || undefined,
      output: output || undefined,
      cross: parseCross(cross),
      reverse: parseReverse(reverse),
    });
  }

  return { title, floors };
}
