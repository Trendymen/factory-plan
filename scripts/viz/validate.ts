// scripts/viz/validate.ts
import { Panel } from './types';

const MK3_CAP = 270;

export function validatePanel(panel: Panel): string[] {
  const errors: string[] = [];

  // 1) 每条带 ≤ Mk.3
  for (const belt of panel.belts) {
    const cap = belt.cap ?? MK3_CAP;
    if (belt.rate > cap + 1e-6) {
      errors.push(
        `Panel "${panel.id}" belt ${belt.id} rate ${belt.rate}/min > Mk.3 ${cap}/min`
      );
    }
  }

  // 2) 合流器：sum(belts to merger) = sum(belts from merger)
  for (const m of panel.mergers) {
    const inSum = panel.belts
      .filter((b) => b.to === m.id)
      .reduce((s, b) => s + b.rate, 0);
    const outSum = panel.belts
      .filter((b) => b.from === m.id)
      .reduce((s, b) => s + b.rate, 0);
    if (Math.abs(inSum - outSum) > 1e-6) {
      errors.push(
        `Panel "${panel.id}" merger ${m.id} unbalanced: in=${inSum} out=${outSum}`
      );
    }
  }

  // 3) 分流器：sum(belts to splitter) = sum(belts from splitter)
  for (const s of panel.splitters) {
    const inSum = panel.belts
      .filter((b) => b.to === s.id)
      .reduce((sum, b) => sum + b.rate, 0);
    const outSum = panel.belts
      .filter((b) => b.from === s.id)
      .reduce((sum, b) => sum + b.rate, 0);
    if (Math.abs(inSum - outSum) > 1e-6) {
      errors.push(
        `Panel "${panel.id}" splitter ${s.id} unbalanced: in=${inSum} out=${outSum}`
      );
    }
  }

  // 4) 生产 = 消费 + 外输
  const produced = panel.producers.reduce((s, p) => s + p.count * p.ratePerMachine, 0);
  const consumed = panel.consumers.reduce((s, c) => s + c.count * c.ratePerMachine, 0);
  const terminaled = panel.terminals.reduce((s, t) => s + t.rate, 0);
  if (Math.abs(produced - consumed - terminaled) > 1e-6) {
    errors.push(
      `Panel "${panel.id}" mass imbalance: produced=${produced} consumed=${consumed} terminal=${terminaled}`
    );
  }

  return errors;
}
