// src/__tests__/parseDiagramBlock.test.ts
import { describe, it, expect } from 'vitest';
import { parseDiagramBlock } from '../diagram/parseDiagramBlock';

describe('parseDiagramBlock', () => {
  it('parses valid JSON into a DiagramScheme', () => {
    const raw = JSON.stringify({
      id: 'BP01-1F',
      title: 't',
      grid: { cols: 5, rows: 5 },
      machines: [{ id: 'S1', type: 'smelter', col: 0.25, row: 0.5, facing: 'south' }],
      belts: [{ id: 'b1', mark: 2, from: 'S1:out-0', to: 'S2:in-0', path: [[0.5, 1.5], [4.5, 1.5]] }],
    });
    const res = parseDiagramBlock(raw);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.id).toBe('BP01-1F');
      expect(res.data.machines).toHaveLength(1);
      expect(res.data.machines[0].type).toBe('smelter');
      expect(res.data.belts?.[0].path).toEqual([[0.5, 1.5], [4.5, 1.5]]);
    }
  });

  it('returns ok=false (does NOT throw) on malformed JSON', () => {
    const res = parseDiagramBlock('{ not json ]');
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toMatch(/.+/);
      expect(res.raw).toBe('{ not json ]');
    }
  });

  it('defaults missing optional collections to safe empties', () => {
    const res = parseDiagramBlock(JSON.stringify({ id: 'x', machines: [] }));
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.machines).toEqual([]);
      expect(res.data.belts).toEqual([]);
      expect(res.data.zones).toEqual([]);
      expect(res.data.notes).toEqual([]);
    }
  });

  it('rejects JSON that is valid but not a diagram object (e.g. array/number)', () => {
    expect(parseDiagramBlock('42').ok).toBe(false);
    expect(parseDiagramBlock('[1,2,3]').ok).toBe(false);
  });

  it('does not throw and keeps unknown machine type as-is (renderer handles gray fallback)', () => {
    const res = parseDiagramBlock(
      JSON.stringify({ id: 'x', machines: [{ id: 'U1', type: 'no-such-type', col: 0, row: 0 }] }),
    );
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data.machines[0].type).toBe('no-such-type');
  });

  it('coerces an absent machines array to []', () => {
    const res = parseDiagramBlock(JSON.stringify({ id: 'x' }));
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.data.machines).toEqual([]);
  });
});
