import { stopX } from '../../route';
import type { SceneryContext } from '../../scene-context';

/** A compact alder stays well inside summer, clear of the first autumn birch. */
export function addRiverAlder(ctx: SceneryContext): void {
  const alder = ctx.detail('river-alder', stopX(4) + 3.55, -2.4, 0.88);
  alder.cut([[-0.13, 0], [0.13, 0], [0.06, 1.35], [0.23, 2.1], [0.12, 2.12], [-0.04, 1.4]], '#7f7056');
  alder.stroke([[0, 1.1], [-0.4, 1.8], [-0.58, 1.95]], '#7f7056', 0.065, 0.01);
  for (const [x, y, w, h] of [[-0.43, 1.85, 0.85, 0.9], [0.35, 1.88, 0.88, 0.96], [-0.1, 2.35, 1.1, 0.95], [0.14, 2.05, 0.8, 0.9]]) {
    alder.oval(w, h, '#64866a', x, y, -0.06);
    alder.oval(w * 0.72, h * 0.75, '#8da574', x - 0.07, y + 0.08, 0.04);
  }
}
