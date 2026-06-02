import { describe, it, expect } from 'vitest';
import { parseCross, parseFloorStack, parseName, parseReverse } from './floorStack';

describe('parseCross', () => {
  it('解析向上跨层 + lift 注记', () => {
    expect(parseCross('↑2F:铁矿石(lift Mk5)')).toEqual({
      dir: 'up',
      target: '2F',
      material: '铁矿石(lift Mk5)',
    });
  });

  it('解析向下跨层', () => {
    expect(parseCross('↓1F:石油焦')).toEqual({ dir: 'down', target: '1F', material: '石油焦' });
  });

  it('容忍箭头后与冒号周围空格', () => {
    expect(parseCross('↑ 3F : 螺丝')).toEqual({ dir: 'up', target: '3F', material: '螺丝' });
  });

  it('空字段或无箭头返回 undefined', () => {
    expect(parseCross('')).toBeUndefined();
    expect(parseCross('铁矿石')).toBeUndefined();
  });
});

describe('parseName 高度', () => {
  it('拆出层名与高度范围', () => {
    expect(parseName('1F (0-8m)')).toEqual({ name: '1F', height: { low: 0, high: 8 } });
    expect(parseName('屋顶 (35-40m)')).toEqual({ name: '屋顶', height: { low: 35, high: 40 } });
  });
  it('无高度时只返回 name', () => {
    expect(parseName('2F')).toEqual({ name: '2F' });
  });
});

describe('parseReverse 回流', () => {
  it('解析右进/左出，分号分隔', () => {
    expect(parseReverse('右:螺丝 ← BP3 ; 左:螺丝 → BP2')).toEqual([
      { side: 'right', label: '螺丝 ← BP3' },
      { side: 'left', label: '螺丝 → BP2' },
    ]);
  });
  it('空字段 → undefined', () => {
    expect(parseReverse('')).toBeUndefined();
  });
});

describe('parseFloorStack', () => {
  it('单实例单层 → 一个 instance、一个 floor', () => {
    const text = `# BP04 钢锭 (C2) · Mk2
1F | 5× foundry | 铁矿石+煤（左墙） | 钢锭 → BP5（右墙） |`;
    const r = parseFloorStack(text);
    expect(r.instances).toHaveLength(1);
    expect(r.instances[0].title).toBe('BP04 钢锭 (C2) · Mk2');
    expect(r.instances[0].floors).toHaveLength(1);
    expect(r.instances[0].floors[0]).toMatchObject({
      name: '1F',
      machines: '5× foundry',
      input: '铁矿石+煤（左墙）',
      output: '钢锭 → BP5（右墙）',
    });
  });

  it('多层 → 保留作者书写序（1F→2F），解析 cross', () => {
    const text = `# BP01 铁锭
1F | 9× smelter | 铁矿石 | 铁锭 → BP2 | ↑2F:铁矿石(lift Mk5)
2F | 9× smelter | 铁矿石（1F 上送） | 铁锭 → BP2 |`;
    const floors = parseFloorStack(text).instances[0].floors;
    expect(floors).toHaveLength(2);
    expect(floors[0].name).toBe('1F');
    expect(floors[0].cross).toEqual({ dir: 'up', target: '2F', material: '铁矿石(lift Mk5)' });
    expect(floors[1].cross).toBeUndefined();
  });

  it('多实例（多个 # 标题）→ 多个 instance 横排', () => {
    const text = `# BP06a\n1F (0-10m) | 冶炼炉×6 |  |  | \n# BP06b\n1F (0-10m) | 冶炼炉×6 |  |  | \n# BP06c\n1F (0-10m) | 冶炼炉×6 |  |  | `;
    const r = parseFloorStack(text);
    expect(r.instances).toHaveLength(3);
    expect(r.instances.map((i) => i.title)).toEqual(['BP06a', 'BP06b', 'BP06c']);
    expect(r.instances[0].floors).toHaveLength(1);
  });

  it('跳过 name 为空的残缺行', () => {
    const text = `# t\n1F | 9× smelter |  |  | \n |  |  |  | \n2F | 4× constructor |  |  | `;
    const floors = parseFloorStack(text).instances[0].floors;
    expect(floors.map((f) => f.name)).toEqual(['1F', '2F']);
  });

  it('解析 6 列含高度、跨层、回流', () => {
    const text = `屋顶 (35-40m) | 汇料台 |  | 铁棒 → 外运 | ↓3F:螺丝 | 右:螺丝 ← 螺丝线(BP3)`;
    const f = parseFloorStack(text).instances[0].floors[0];
    expect(f.name).toBe('屋顶');
    expect(f.height).toEqual({ low: 35, high: 40 });
    expect(f.cross).toEqual({ dir: 'down', target: '3F', material: '螺丝' });
    expect(f.reverse).toEqual([{ side: 'right', label: '螺丝 ← 螺丝线(BP3)' }]);
  });
});
