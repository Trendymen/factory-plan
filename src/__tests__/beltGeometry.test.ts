import { describe, expect, it } from 'vitest';
import type { BeltSegment, MachineInstance } from '../core/types';
import { buildBeltRenderPath, getTerminalSegment } from '../core/beltGeometry';

const MACHINES: MachineInstance[] = [
  {
    id: 'sp',
    type: 'splitter',
    pos: { col: 1.75, row: 4 },
    facing: 'south',
    floor: 2,
    label: '螺丝分流',
  },
  {
    id: 'rip',
    type: 'assembler',
    pos: { col: 0.875, row: 4.75 },
    facing: 'south',
    floor: 2,
    label: '强化铁板',
  },
  {
    id: 'store',
    type: 'storage',
    pos: { col: 1, row: 7.75 },
    facing: 'south',
    floor: 2,
    label: '储存箱',
  },
];

describe('beltGeometry', () => {
  it('rebuilds a vertical final approach for top-side machine inputs', () => {
    const belt: BeltSegment = {
      id: 'b-screw-to-rip',
      floor: 2,
      mark: 1,
      path: [
        { col: 2, row: 4.5 },
        { col: 2, row: 4.75 },
        { col: 1.75, row: 4.75 },
      ],
      fromPort: 'sp:out-0',
      toPort: 'rip:in-1',
    };

    const points = buildBeltRenderPath(belt, MACHINES);

    expect(points).toEqual([
      { col: 2, row: 4.5 },
      { col: 1.6875, row: 4.5 },
      { col: 1.6875, row: 4.75 },
    ]);
  });

  it('bridges off-grid storage ports without leaving a horizontal terminal segment', () => {
    const belt: BeltSegment = {
      id: 'b-plate-store',
      floor: 2,
      mark: 1,
      path: [
        { col: 0.75, row: 0.75 },
        { col: 0.5, row: 0.75 },
        { col: 0.5, row: 8 },
        { col: 1.25, row: 8 },
        { col: 1.25, row: 7.75 },
      ],
      fromPort: 'sp:out-2',
      toPort: 'store:in-0',
    };

    const points = buildBeltRenderPath(belt, MACHINES);

    expect(points[points.length - 2]).toEqual({ col: 1.3125, row: 8 });
    expect(points[points.length - 1]).toEqual({ col: 1.3125, row: 7.75 });
  });

  it('finds the last non-zero segment so duplicate points do not force a 0 degree arrow', () => {
    const segment = getTerminalSegment([
      { col: 5.25, row: 6 },
      { col: 5.25, row: 6.25 },
      { col: 5.25, row: 6.25 },
      { col: 5.25, row: 6.25 },
    ], 'end');

    expect(segment).toEqual([
      { col: 5.25, row: 6 },
      { col: 5.25, row: 6.25 },
    ]);
  });
});
