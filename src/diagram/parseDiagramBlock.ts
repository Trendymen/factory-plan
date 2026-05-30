// src/diagram/parseDiagramBlock.ts
// 围栏 ```diagram 文本 → DiagramScheme。全程 try/catch，永不抛错，软校验填默认值。
import type {
  DiagramScheme,
  DiagramMachine,
  DiagramBelt,
  DiagramZone,
  DiagramNote,
  ParseResult,
} from './diagramTypes';

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

export function parseDiagramBlock(raw: string): ParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e), raw };
  }

  if (!isObject(parsed)) {
    return { ok: false, error: 'diagram block must be a JSON object', raw };
  }

  try {
    const data: DiagramScheme = {
      id: typeof parsed.id === 'string' ? parsed.id : 'diagram',
      title: typeof parsed.title === 'string' ? parsed.title : undefined,
      grid: isObject(parsed.grid)
        && typeof parsed.grid.cols === 'number'
        && typeof parsed.grid.rows === 'number'
        ? { cols: parsed.grid.cols, rows: parsed.grid.rows }
        : undefined,
      machines: asArray<DiagramMachine>(parsed.machines),
      belts: asArray<DiagramBelt>(parsed.belts),
      zones: asArray<DiagramZone>(parsed.zones),
      notes: asArray<DiagramNote>(parsed.notes),
    };
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e), raw };
  }
}
