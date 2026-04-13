import type { Scheme, BeltSegment, MachineInstance } from './types';
import { getRecipe } from './recipes';

export type MaterialMap = Map<string, string[]>;

const PRODUCTION_TYPES = new Set<string>([
  'smelter', 'foundry', 'constructor', 'assembler', 'manufacturer',
  'refinery', 'packager', 'blender', 'particle-accelerator', 'quantum-encoder', 'converter',
]);

export function deriveMaterials(scheme: Scheme): MaterialMap {
  const machineById = new Map(scheme.machines.map(m => [m.id, m]));
  const beltByToPort = new Map<string, BeltSegment>();
  for (const belt of scheme.belts) {
    if (belt.toPort) beltByToPort.set(belt.toPort, belt);
  }

  const cache = new Map<string, string[]>();
  const visiting = new Set<string>();

  function deriveBelt(belt: BeltSegment): string[] {
    if (cache.has(belt.id)) return cache.get(belt.id)!;
    if (visiting.has(belt.id)) return [];
    visiting.add(belt.id);

    let materials: string[] = [];

    if (!belt.fromPort) {
      // 外部输入带：反向推导 — 沿 toPort 向下游追踪到生产机器，取其 recipe input
      materials = belt.toPort ? deriveFromDownstream(belt.toPort) : [];
    } else {
      const [machineId, portId] = belt.fromPort.split(':');
      const machine = machineById.get(machineId);

      if (!machine) {
        materials = [];
      } else if (PRODUCTION_TYPES.has(machine.type)) {
        const recipe = getRecipe(machine.recipe);
        if (recipe) {
          const idx = parseInt(portId.split('-')[1] ?? '0', 10);
          const output = recipe.outputs[idx];
          materials = output ? [output.item] : [];
        }
      } else if (machine.type === 'splitter') {
        const inBelt = beltByToPort.get(`${machineId}:in-0`);
        materials = inBelt ? deriveBelt(inBelt) : [];
      } else if (machine.type === 'merger') {
        const seen = new Set<string>();
        const result: string[] = [];
        for (const inPort of ['in-0', 'in-1', 'in-2']) {
          const inBelt = beltByToPort.get(`${machineId}:${inPort}`);
          if (!inBelt) continue;
          for (const mat of deriveBelt(inBelt)) {
            if (!seen.has(mat)) {
              seen.add(mat);
              result.push(mat);
            }
          }
        }
        materials = result;
      } else if (machine.type === 'storage' || machine.type === 'industrial-storage') {
        const inBelt = beltByToPort.get(`${machineId}:in-0`);
        materials = inBelt ? deriveBelt(inBelt) : [];
      } else if (machine.type.startsWith('conveyor-lift-out-')) {
        materials = deriveLiftOut(machine);
      }
    }

    visiting.delete(belt.id);
    cache.set(belt.id, materials);
    return materials;
  }

  /** 反向推导：从 toPort 向下游找生产机器，取 recipe input 确定物料 */
  function deriveFromDownstream(portRef: string): string[] {
    const [machineId, portId] = portRef.split(':');
    const machine = machineById.get(machineId);
    if (!machine) return [];

    if (PRODUCTION_TYPES.has(machine.type)) {
      const recipe = getRecipe(machine.recipe);
      if (!recipe) return [];
      const idx = parseInt(portId.split('-')[1] ?? '0', 10);
      const input = recipe.inputs[idx];
      return input ? [input.item] : [];
    }

    // 分流器/合流器/储存箱：继续向下游追踪
    if (machine.type === 'splitter' || machine.type === 'merger' ||
        machine.type === 'storage' || machine.type === 'industrial-storage') {
      // 找从该机器输出的 belt，追踪其 toPort
      for (const b of scheme.belts) {
        if (b.fromPort?.startsWith(machineId + ':') && b.toPort) {
          const result = deriveFromDownstream(b.toPort);
          if (result.length > 0) return result;
        }
      }
    }

    return [];
  }

  function deriveLiftOut(outMachine: MachineInstance): string[] {
    const isTop = outMachine.type.includes('-top');
    for (const pair of scheme.liftPairs) {
      const matchId = isTop ? pair.topMachine : pair.bottomMachine;
      if (matchId !== outMachine.id) continue;
      const inMachineId = isTop ? pair.bottomMachine : pair.topMachine;
      const inBelt = beltByToPort.get(`${inMachineId}:bottom`) ?? beltByToPort.get(`${inMachineId}:top`);
      return inBelt ? deriveBelt(inBelt) : [];
    }
    return [];
  }

  const result: MaterialMap = new Map();
  for (const belt of scheme.belts) {
    result.set(belt.id, deriveBelt(belt));
  }

  for (const pair of scheme.liftPairs) {
    const botInBelt = beltByToPort.get(`${pair.bottomMachine}:bottom`);
    const topInBelt = beltByToPort.get(`${pair.topMachine}:top`);
    const inBelt = botInBelt ?? topInBelt;
    result.set(pair.id, inBelt ? deriveBelt(inBelt) : []);
  }

  return result;
}
