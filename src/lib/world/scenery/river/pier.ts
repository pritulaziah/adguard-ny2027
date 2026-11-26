import { stopX } from '../../route';
import type { SceneryContext } from '../../scene-context';

/** Small wooden landing with individual boards and short mooring posts. */
export function addRiverPier(ctx: SceneryContext): void {
  const pier = ctx.detail('river-wooden-landing', stopX(4) + 2.1, -1.08);
  for (let i = 0; i < 6; i++) {
    pier.box(0.14, 0.07, 0.72, i % 2 ? '#b18f65' : '#c5a77b', i * 0.16, 0.18, 0.05);
  }
  for (const dx of [0.04, 0.76]) {
    pier.box(0.07, 0.55, 0.07, '#8a7052', dx, 0.09, 0.32);
    pier.oval(0.11, 0.055, '#dfcca0', dx, 0.38, 0.35);
  }
}
