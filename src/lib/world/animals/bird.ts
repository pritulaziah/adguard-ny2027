import type { AnimalBuilderContext } from './shared';
import { cut, oval, stroke } from '../paper-shapes';
import { CREAM, addSparkleEye, shapeFrom } from './shared';

/** A robin on a flowering branch, clear of the story text. */
export function addBird(ctx: AnimalBuilderContext, x: number, z = -1.45): void {
  const branch = ctx.detail('paper-bird-branch', x, z, 1.05);
  branch.stroke([[-0.65, 0], [-0.58, 0.78], [-0.35, 1.48], [0.28, 1.75], [0.7, 1.94]], '#98755e', 0.1);
  branch.stroke([[-0.4, 1.33], [-0.9, 1.61], [-1.03, 1.91]], '#98755e', 0.05);
  for (const [px, py] of [[-0.96, 1.81], [-0.73, 1.61], [0.54, 1.88], [0.7, 2.02]]) {
    branch.leaf(0.16, 0.32, '#92aa78', px, py, 0.02, [0, 0, -0.6]);
    branch.oval(0.2, 0.19, '#edc3b7', px - 0.07, py, 0.07);
    branch.oval(0.07, 0.07, '#e4c07c', px - 0.07, py, 0.1);
  }
  const bird = oval(branch.group, 0.58, 0.62, '#a78465', 0, 1.84, 0.08, 0.035);
  bird.scale.setScalar(0.5);
  cut(bird, [[0.16, -0.12], [0.55, -0.36], [0.4, 0.04]], '#776d57', 0, 0, -0.025, 0.03);
  oval(bird, 0.36, 0.42, '#d38b6c', -0.12, -0.06, 0.04, 0.02);
  const head = oval(bird, 0.4, 0.37, '#a78465', -0.14, 0.25, 0, 0.03);
  cut(head, [[-0.16, 0.01], [-0.35, -0.07], [-0.16, -0.11]], '#d1aa62', 0, 0, 0.04, 0.02);
  addSparkleEye(head, -0.08, 0.02, 0.055, 0.037);
  const wing = cut(bird, shapeFrom(s => {
    s.moveTo(0.04, 0.13);
    s.bezierCurveTo(0.35, 0.1, 0.39, -0.09, 0.25, -0.23);
    s.quadraticCurveTo(0.02, -0.15, 0.04, 0.13);
    s.closePath();
  }), '#82765c', 0, 0, 0.065, 0.024);
  stroke(wing, [[0.13, -0.04], [0.26, -0.13]], CREAM, 0.018, 0.03);
  const leftFoot = cut(bird, [[-0.085, -0.27], [-0.055, -0.27], [-0.055, -0.44], [-0.17, -0.5], [-0.19, -0.47], [-0.085, -0.42]], '#765e49', 0, 0, 0.08, 0.016);
  leftFoot.name = 'bird-foot-left';
  const rightFoot = cut(bird, [[0.075, -0.27], [0.105, -0.27], [0.105, -0.39], [0, -0.445], [-0.02, -0.415], [0.075, -0.37]], '#765e49', 0, 0, 0.08, 0.016);
  rightFoot.name = 'bird-foot-right';
  ctx.animate(bird, 'still', 'bird', 0.35);
  ctx.animate(head, 'sway', 'bird');
  ctx.animate(wing, 'wing', 'bird');
}
