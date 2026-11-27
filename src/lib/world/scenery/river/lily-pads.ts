import { stopX } from '../../route';
import type { SceneryContext } from '../../scene-context';

/** Lily pads float beside the clear central channel. */
export function addLilyPads(ctx: SceneryContext): void {
  const center = stopX(4);
  for (const [dx, z, size] of [
    [-2.0, 0.48, 0.42],
    [2.3, 0.56, 0.5],
    [3.7, 0.18, 0.3],
    [-4.6, 0.2, 0.33],
  ]) {
    const pad = ctx.detail('river-lily-pad', center + dx, z, 1, 0.345);
    pad.oval(size, size * 0.65, '#7b996e', 0, 0, 0, [-Math.PI / 2, 0, 0], 0.015);
    pad.stroke(
      [
        [0, 0],
        [size * 0.22, 0.015],
      ],
      '#b6c28a',
      0.018,
      0.03,
    );
  }
  const lily = ctx.detail('river-water-lily', center + 2.3, 0.58, 1, 0.37);
  for (let i = -1; i <= 1; i++) lily.oval(0.09, 0.16, '#f1e5c6', i * 0.045, 0.06, 0.035 + i * 0.003, [0, 0, -i * 0.5]);
  lily.oval(0.07, 0.06, '#ddbc6f', 0, 0.04, 0.065);
}
