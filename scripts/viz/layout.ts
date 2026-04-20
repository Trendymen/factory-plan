// scripts/viz/layout.ts
import { Panel } from './types';

export interface Position { x: number; y: number; }
export interface PanelLayout {
  positions: Map<string, Position>;
  width: number;
  height: number;
}

// 坐标常量
const COL_PRODUCER = 60;
const COL_MERGER_L0 = 220;
const COL_MERGER_L1 = 340;
const COL_TRUNK_START = 460;
const COL_CONSUMER = 1200;
const COL_TERMINAL = 1360;
const COL_RIGHT_EDGE = 1440;

const ROW_HEIGHT = 70;
const TRUNK_GAP = 80;
const PANEL_TOP_PAD = 40;

export function layoutPanel(panel: Panel): PanelLayout {
  const positions = new Map<string, Position>();

  // 按 belt id 前缀识别 trunk（buildPanel 给每个 trunk 赋 `${panelId}-tN-...`）
  const trunks = new Map<string, Set<string>>(); // trunkKey → nodeIds (both producer/consumer/merger/splitter/terminal ids touched by any belt of this trunk)
  for (const belt of panel.belts) {
    const m = belt.id.match(/-t(\d+)-/);
    const trunkKey = m ? `t${m[1]}` : 't0';
    if (!trunks.has(trunkKey)) trunks.set(trunkKey, new Set());
    trunks.get(trunkKey)!.add(belt.from);
    trunks.get(trunkKey)!.add(belt.to);
  }

  let trunkYOffset = PANEL_TOP_PAD;

  // Sort trunks by key to ensure deterministic order
  const sortedTrunks = Array.from(trunks.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  for (const [, nodeIds] of sortedTrunks) {
    // 此 trunk 覆盖的 producer machine ids (e.g., "smelter-iron-A#0", "smelter-iron-A#1", ...)
    const trunkProducers = Array.from(nodeIds)
      .filter((id) => panel.producers.some((p) => id.startsWith(p.id + '#')))
      .sort();
    const trunkConsumers = Array.from(nodeIds)
      .filter((id) => panel.consumers.some((c) => id.startsWith(c.id + '#')))
      .sort();
    const trunkMergers = panel.mergers.filter((mg) => nodeIds.has(mg.id));
    const trunkSplitters = panel.splitters.filter((s) => nodeIds.has(s.id));
    const trunkTerminals = panel.terminals.filter((t) => nodeIds.has(t.id));

    const trunkHeight = Math.max(trunkProducers.length, trunkConsumers.length, 1) * ROW_HEIGHT;

    // Producers (left column)
    trunkProducers.forEach((id, i) => {
      positions.set(id, { x: COL_PRODUCER, y: trunkYOffset + i * ROW_HEIGHT });
    });

    // Mergers: leaf mergers spread across L0 column, root merger at L1 (if exists)
    const rootMerger = trunkMergers.length > 0 ? trunkMergers[trunkMergers.length - 1] : undefined;
    const leafMergers = trunkMergers.slice(0, -1);
    leafMergers.forEach((mg, i) => {
      positions.set(mg.id, {
        x: COL_MERGER_L0,
        y: trunkYOffset + i * ROW_HEIGHT * 3 + ROW_HEIGHT,
      });
    });
    if (rootMerger) {
      if (leafMergers.length > 0) {
        positions.set(rootMerger.id, { x: COL_MERGER_L1, y: trunkYOffset + trunkHeight / 2 });
      } else {
        positions.set(rootMerger.id, { x: COL_MERGER_L0, y: trunkYOffset + trunkHeight / 2 });
      }
    }

    // Consumers (right column)
    trunkConsumers.forEach((id, i) => {
      positions.set(id, { x: COL_CONSUMER, y: trunkYOffset + i * ROW_HEIGHT });
    });

    // Splitters along trunk
    const splitterColStep = trunkSplitters.length > 0
      ? (COL_CONSUMER - COL_TRUNK_START) / trunkSplitters.length
      : 0;
    trunkSplitters.forEach((s, i) => {
      const downBeltId = s.outputs[0];
      const downBelt = panel.belts.find((b) => b.id === downBeltId);
      const servedConsumerPos = downBelt ? positions.get(downBelt.to) : undefined;
      positions.set(s.id, {
        x: COL_TRUNK_START + i * splitterColStep,
        y: servedConsumerPos?.y ?? (trunkYOffset + trunkHeight / 2),
      });
    });

    // Terminals
    trunkTerminals.forEach((t, i) => {
      positions.set(t.id, {
        x: COL_TERMINAL,
        y: trunkYOffset + trunkHeight - ROW_HEIGHT * (i + 1),
      });
    });

    trunkYOffset += trunkHeight + TRUNK_GAP;
  }

  return {
    positions,
    width: COL_RIGHT_EDGE,
    height: trunkYOffset + PANEL_TOP_PAD,
  };
}
