export interface Cross {
  dir: 'up' | 'down';
  target: string;
  material: string;
}

export interface Floor {
  name: string;
  machines: string;
  input?: string;
  output?: string;
  cross?: Cross;
}

export interface FloorStack {
  title?: string;
  floors: Floor[];
}

const CROSS_RE = /^([↑↓])\s*([^:：]+?)\s*[:：]\s*(.+)$/;

export function parseCross(field: string): Cross | undefined {
  const m = field.trim().match(CROSS_RE);
  if (!m) return undefined;
  return {
    dir: m[1] === '↑' ? 'up' : 'down',
    target: m[2].trim(),
    material: m[3].trim(),
  };
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
    const [name = '', machines = '', input = '', output = '', cross = ''] = cols;
    floors.push({
      name,
      machines,
      input: input || undefined,
      output: output || undefined,
      cross: parseCross(cross),
    });
  }

  return { title, floors };
}
