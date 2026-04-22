import { describe, it, expect } from 'vitest';
import scheme from '../../data/schemes/multi-terminal-megabase-v3.json';
import { validateSchemeDetailed } from '../core/schema';
import type { Scheme } from '../core/types';

describe('multi-terminal-megabase-v3', () => {
  it('loads and has 15 floors', () => {
    const s = scheme as unknown as Scheme;
    expect(s.id).toBe('multi-terminal-megabase-v3');
    expect(s.floors).toHaveLength(15);
    expect(s.floors.every(f => f.gridSize.cols === 4 && f.gridSize.rows === 4)).toBe(true);
  });

  it('has zero error when loaded', () => {
    const s = scheme as unknown as Scheme;
    const issues = validateSchemeDetailed(s);
    const errors = issues.filter(i => i.severity === 'error');
    expect(errors).toHaveLength(0);
  });
});
