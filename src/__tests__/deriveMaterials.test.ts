import { describe, it, expect } from 'vitest';
import { deriveMaterials } from '../core/deriveMaterials';
import type { Scheme } from '../core/types';

const BASE_SCHEME: Scheme = {
  id: 'test', name: 'Test', version: '1.0.0', category: '测试',
  description: '', designPrinciples: { preferWallOutlets: true, preferWallHoles: true, preferCeilingMounts: false, keepFloorClear: true },
  floors: [{ id: 1, label: '1F', gridSize: { cols: 8, rows: 8 } }],
  machines: [], belts: [], liftPairs: [], zones: [],
};

describe('deriveMaterials', () => {
  it('生产机器直连 belt → 单物料', () => {
    const scheme: Scheme = {
      ...BASE_SCHEME,
      machines: [
        { id: 's1', type: 'smelter', pos: { col: 1, row: 1 }, facing: 'south', floor: 1, recipe: 'iron-ingot' },
        { id: 'c1', type: 'constructor', pos: { col: 1, row: 3 }, facing: 'south', floor: 1, recipe: 'iron-plate' },
      ],
      belts: [
        { id: 'b1', floor: 1, mark: 1, material: '铁锭', path: [{ col: 1.375, row: 2.125 }, { col: 1.375, row: 3 }], fromPort: 's1:out-0', toPort: 'c1:in-0' },
      ],
    };
    const map = deriveMaterials(scheme);
    expect(map.get('b1')).toEqual(['铁锭']);
  });

  it('经过 splitter → 物料透传', () => {
    const scheme: Scheme = {
      ...BASE_SCHEME,
      machines: [
        { id: 's1', type: 'smelter', pos: { col: 1, row: 1 }, facing: 'south', floor: 1, recipe: 'iron-ingot' },
        { id: 'sp1', type: 'splitter', pos: { col: 1, row: 2.5 }, facing: 'south', floor: 1 },
      ],
      belts: [
        { id: 'b1', floor: 1, mark: 1, material: '铁锭', path: [{ col: 1.375, row: 2.125 }, { col: 1.375, row: 2.5 }], fromPort: 's1:out-0', toPort: 'sp1:in-0' },
        { id: 'b2', floor: 1, mark: 1, material: '铁锭', path: [{ col: 1.25, row: 2.75 }, { col: 1.25, row: 3.5 }], fromPort: 'sp1:out-0' },
      ],
    };
    const map = deriveMaterials(scheme);
    expect(map.get('b1')).toEqual(['铁锭']);
    expect(map.get('b2')).toEqual(['铁锭']);
  });

  it('经过 merger 混合 → 多物料 union', () => {
    const scheme: Scheme = {
      ...BASE_SCHEME,
      machines: [
        { id: 'c1', type: 'constructor', pos: { col: 0, row: 0 }, facing: 'south', floor: 1, recipe: 'iron-plate' },
        { id: 'c2', type: 'constructor', pos: { col: 2, row: 0 }, facing: 'south', floor: 1, recipe: 'iron-rod' },
        { id: 'mg1', type: 'merger', pos: { col: 1, row: 2.5 }, facing: 'south', floor: 1 },
      ],
      belts: [
        { id: 'b1', floor: 1, mark: 1, material: '铁板', path: [{ col: 0.5, row: 1.25 }, { col: 0.5, row: 2.5 }], fromPort: 'c1:out-0', toPort: 'mg1:in-0' },
        { id: 'b2', floor: 1, mark: 1, material: '铁棒', path: [{ col: 2, row: 1.25 }, { col: 2, row: 2.5 }], fromPort: 'c2:out-0', toPort: 'mg1:in-1' },
        { id: 'b3', floor: 1, mark: 1, material: '铁板', path: [{ col: 1.25, row: 2.75 }, { col: 1.25, row: 3.5 }], fromPort: 'mg1:out-0' },
      ],
    };
    const map = deriveMaterials(scheme);
    expect(map.get('b1')).toEqual(['铁板']);
    expect(map.get('b2')).toEqual(['铁棒']);
    expect(map.get('b3')).toEqual(expect.arrayContaining(['铁板', '铁棒']));
    expect(map.get('b3')!.length).toBe(2);
  });

  it('无 fromPort 的外部输入 belt → 空数组', () => {
    const scheme: Scheme = {
      ...BASE_SCHEME,
      machines: [
        { id: 's1', type: 'smelter', pos: { col: 1, row: 1 }, facing: 'south', floor: 1, recipe: 'iron-ingot' },
      ],
      belts: [
        { id: 'b_ext', floor: 1, mark: 1, material: '铁矿石', path: [{ col: 1.375, row: 0 }, { col: 1.375, row: 1 }], toPort: 's1:in-0' },
      ],
    };
    const map = deriveMaterials(scheme);
    expect(map.get('b_ext')).toEqual([]);
  });

  it('同物料 merger → 不重复', () => {
    const scheme: Scheme = {
      ...BASE_SCHEME,
      machines: [
        { id: 's1', type: 'smelter', pos: { col: 0, row: 0 }, facing: 'south', floor: 1, recipe: 'iron-ingot' },
        { id: 's2', type: 'smelter', pos: { col: 2, row: 0 }, facing: 'south', floor: 1, recipe: 'iron-ingot' },
        { id: 'mg1', type: 'merger', pos: { col: 1, row: 2.5 }, facing: 'south', floor: 1 },
      ],
      belts: [
        { id: 'b1', floor: 1, mark: 1, material: '铁锭', path: [{ col: 0.375, row: 1.25 }, { col: 0.375, row: 2.5 }], fromPort: 's1:out-0', toPort: 'mg1:in-0' },
        { id: 'b2', floor: 1, mark: 1, material: '铁锭', path: [{ col: 2, row: 1.25 }, { col: 2, row: 2.5 }], fromPort: 's2:out-0', toPort: 'mg1:in-1' },
        { id: 'b3', floor: 1, mark: 1, material: '铁锭', path: [{ col: 1.25, row: 2.75 }, { col: 1.25, row: 3.5 }], fromPort: 'mg1:out-0' },
      ],
    };
    const map = deriveMaterials(scheme);
    expect(map.get('b3')).toEqual(['铁锭']);
  });
});
