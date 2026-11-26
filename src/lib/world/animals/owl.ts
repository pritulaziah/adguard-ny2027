import type { AnimalBuilderContext } from './shared';
import { cut, oval, stroke } from '../paper-shapes';
import { CREAM, addSparkleEye } from './shared';

/** A broad-faced owl on an autumn branch with a gentle head tilt. */
export function addOwl(ctx: AnimalBuilderContext, x: number, z = -1.4): void {
  const branch = ctx.detail('paper-owl-branch', x, z, 1.08);
  branch.stroke([[0.66, 0], [0.6, 0.92], [0.36, 1.47], [-0.5, 1.51], [-0.9, 1.7]], '#8b6b54', 0.12);
  branch.stroke([[0.45, 1.26], [0.87, 1.58]], '#8b6b54', 0.055);
  branch.leaf(0.21, 0.37, '#cba25e', 0.82, 1.51, 0.04, [0, 0, -0.8]);
  branch.leaf(0.18, 0.31, '#b9754d', -0.85, 1.67, 0.04, [0, 0, 0.7]);
  const body = oval(branch.group, 0.74, 0.89, '#967b60', -0.08, 1.78, 0.04, 0.04);
  body.scale.setScalar(0.55);
  oval(body, 0.47, 0.62, '#d6bf96', 0, -0.04, 0.05, 0.025);
  oval(body, 0.23, 0.65, '#7a6553', -0.29, -0.03, 0.08, 0.026);
  oval(body, 0.23, 0.65, '#7a6553', 0.29, -0.03, 0.08, 0.026);
  for (const py of [-0.08, -0.23]) {
    for (const px of [-0.11, 0.11]) stroke(body, [[px - 0.04, py + 0.025], [px, py - 0.02], [px + 0.04, py + 0.025]], '#aa8e69', 0.018, 0.085);
  }
  const head = oval(body, 0.8, 0.59, '#967b60', 0, 0.43, 0.02, 0.038);
  cut(head, [[-0.37, 0.11], [-0.35, 0.42], [-0.15, 0.24]], '#7a6553', 0, 0, -0.02, 0.028);
  cut(head, [[0.37, 0.11], [0.35, 0.42], [0.15, 0.24]], '#7a6553', 0, 0, -0.02, 0.028);
  for (const px of [-0.19, 0.19]) {
    oval(head, 0.38, 0.43, CREAM, px, 0.015, 0.045, 0.022);
    addSparkleEye(head, px, 0.04, 0.08, 0.068, '#d6b464');
  }
  for (const [side, px] of [['left', -0.18], ['right', 0.18]] as const) {
    const foot = cut(body, [[px - 0.02, -0.36], [px + 0.02, -0.36], [px + 0.02, -0.53], [px - 0.11, -0.56], [px - 0.12, -0.52], [px - 0.02, -0.49]], '#b3925e', 0, 0, 0.14, 0.018);
    foot.name = `owl-foot-${side}`;
  }
  cut(head, [[-0.065, 0.01], [0, -0.12], [0.065, 0.01]], '#c69e58', 0, 0, 0.105, 0.024);
  ctx.animate(head, 'sway', 'owl', 0.5);
}
