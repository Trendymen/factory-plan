import { describe, it, expect } from 'vitest';
import { parseCross, parseFloorStack } from './floorStack';

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

describe('parseFloorStack', () => {
  it('单层 BP → 一个盒子、无 cross', () => {
    const text = `# BP04 钢锭 (C2) · Mk2
1F | 5× foundry | 铁矿石+煤（左墙） | 钢锭 → BP5（右墙） |`;
    expect(parseFloorStack(text)).toEqual({
      title: 'BP04 钢锭 (C2) · Mk2',
      floors: [
        {
          name: '1F',
          machines: '5× foundry',
          input: '铁矿石+煤（左墙）',
          output: '钢锭 → BP5（右墙）',
          cross: undefined,
        },
      ],
    });
  });

  it('多层 BP → 保留作者书写序（1F→2F），解析 cross', () => {
    const text = `# BP01 铁锭
1F | 9× smelter (S1-S9) | 铁矿石 610.5/min（左墙） | 铁锭 → BP2（右墙） | ↑2F:铁矿石(lift Mk5)
2F | 9× smelter (S10-S18) | 铁矿石（1F 上送） | 铁锭 → BP2（右墙） |`;
    const result = parseFloorStack(text);
    expect(result.floors).toHaveLength(2);
    expect(result.floors[0].name).toBe('1F');
    expect(result.floors[0].cross).toEqual({ dir: 'up', target: '2F', material: '铁矿石(lift Mk5)' });
    expect(result.floors[1].name).toBe('2F');
    expect(result.floors[1].cross).toBeUndefined();
  });

  it('空字段 → undefined；跳过空行；无 # 时 title 为 undefined', () => {
    const text = `\n1F | 4× constructor |  |  | \n`;
    expect(parseFloorStack(text)).toEqual({
      title: undefined,
      floors: [{ name: '1F', machines: '4× constructor', input: undefined, output: undefined, cross: undefined }],
    });
  });
});
