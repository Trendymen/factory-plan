import { describe, it, expect } from 'vitest';
import { parseCross } from './floorStack';

describe('parseCross', () => {
  it('解析向上跨层 + lift 注记', () => {
    expect(parseCross('↑2F:铁矿石(lift Mk5)')).toEqual({
      dir: 'up',
      target: '2F',
      material: '铁矿石(lift Mk5)',
    });
  });

  it('解析向下跨层', () => {
    expect(parseCross('↓1F:石油焦')).toEqual({
      dir: 'down',
      target: '1F',
      material: '石油焦',
    });
  });

  it('容忍箭头后与冒号周围空格', () => {
    expect(parseCross('↑ 3F : 螺丝')).toEqual({
      dir: 'up',
      target: '3F',
      material: '螺丝',
    });
  });

  it('空字段或无箭头返回 undefined', () => {
    expect(parseCross('')).toBeUndefined();
    expect(parseCross('铁矿石')).toBeUndefined();
  });
});
