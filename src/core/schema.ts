// src/core/schema.ts
import type { Scheme, SchemeIndex } from './types';
import { BUILDING_REGISTRY } from './registry';

export function validateScheme(scheme: Scheme): string[] {
  const warnings: string[] = [];
  const floorIds = new Set(scheme.floors.map(f => f.id));

  for (const m of scheme.machines) {
    if (!BUILDING_REGISTRY[m.type]) {
      warnings.push(`Machine "${m.id}": unknown type "${m.type}"`);
    }
    if (!floorIds.has(m.floor)) {
      warnings.push(`Machine "${m.id}": references non-existent floor ${m.floor}`);
    }
  }

  const machineIds = new Set(scheme.machines.map(m => m.id));
  for (const b of scheme.belts) {
    if (!floorIds.has(b.floor)) {
      warnings.push(`Belt "${b.id}": references non-existent floor ${b.floor}`);
    }
    if (b.fromPort) {
      const machineId = b.fromPort.split(':')[0];
      if (!machineIds.has(machineId)) {
        warnings.push(`Belt "${b.id}": fromPort references unknown machine "${machineId}"`);
      }
    }
    if (b.toPort) {
      const machineId = b.toPort.split(':')[0];
      if (!machineIds.has(machineId)) {
        warnings.push(`Belt "${b.id}": toPort references unknown machine "${machineId}"`);
      }
    }
  }

  const beltIds = new Set(scheme.belts.map(b => b.id));
  for (const l of scheme.lifts) {
    if (!floorIds.has(l.fromFloor)) {
      warnings.push(`Lift "${l.id}": references non-existent fromFloor ${l.fromFloor}`);
    }
    if (!floorIds.has(l.toFloor)) {
      warnings.push(`Lift "${l.id}": references non-existent toFloor ${l.toFloor}`);
    }
    if (l.connectedBelts) {
      for (const bid of l.connectedBelts) {
        if (!beltIds.has(bid)) {
          warnings.push(`Lift "${l.id}": references unknown belt "${bid}"`);
        }
      }
    }
  }

  const allIds = new Set([...machineIds, ...scheme.power.poles.map(p => p.id)]);
  for (const c of scheme.power.connections) {
    if (!allIds.has(c.from)) {
      warnings.push(`Power connection: unknown source "${c.from}"`);
    }
    if (!allIds.has(c.to)) {
      warnings.push(`Power connection: unknown target "${c.to}"`);
    }
  }

  return warnings;
}

export function buildSchemeIndex(scheme: Scheme, filePath: string): SchemeIndex {
  return {
    id: scheme.id,
    name: scheme.name,
    category: scheme.category,
    description: scheme.description,
    floorCount: scheme.floors.length,
    filePath,
  };
}
