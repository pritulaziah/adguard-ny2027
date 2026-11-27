import { cut, oval } from '../../paper-shapes';
import type { SceneryContext } from '../../scene-context';

/** A river duck replaces the beach animal and keeps the Windows fact. */
export function addRiverDuck(ctx: SceneryContext, x: number): void {
  const host = ctx.place('paper-river-duck', x, -0.18, 0.88, 0.4);
  const body = oval(host, 0.66, 0.3, '#c7b58d', 0, 0.18, 0, 0.07);
  ctx.animate(body, 'float', 'duck', 0.4);
  oval(body, 0.38, 0.18, '#9e9472', -0.04, 0.035, 0.08);
  cut(
    body,
    [
      [-0.25, 0],
      [-0.45, 0.2],
      [-0.3, 0.19],
      [-0.14, 0.06],
    ],
    '#93866b',
    0,
    0,
    -0.02,
  );
  oval(body, 0.25, 0.3, '#4f7967', 0.24, 0.22, 0.03);
  cut(
    body,
    [
      [0.3, 0.2],
      [0.51, 0.16],
      [0.49, 0.12],
      [0.31, 0.12],
    ],
    '#d5ab5f',
    0,
    0,
    0.07,
  );
  oval(body, 0.045, 0.05, '#394c42', 0.28, 0.25, 0.1);
  oval(body, 0.015, 0.018, '#faf3dd', 0.274, 0.26, 0.12);
  const ripple = ctx.detail('duck-ripple', x, -0.12, 1, 0.35);
  ripple.oval(0.92, 0.2, '#bdd1b1', 0, 0, 0, [-Math.PI / 2, 0, 0], 0.012);
}
