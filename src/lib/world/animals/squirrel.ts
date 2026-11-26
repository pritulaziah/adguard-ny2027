import type { AnimalBuilderContext } from './shared';
import { cut, oval } from '../paper-shapes';
import { CREAM, addGroundShadow, addSparkleEye, shapeFrom } from './shared';

/** A rust-coloured squirrel holding an acorn, with a tall curled tail. */
export function addSquirrel(ctx: AnimalBuilderContext, x: number, z = -1.02): void {
  const squirrel = ctx.detail('paper-squirrel', x, z, 0.62);
  addGroundShadow(squirrel, 1.12, 0.27, '#876d5d');
  const tail = cut(squirrel.group, shapeFrom(s => {
    s.moveTo(0.13, 0.14);
    s.bezierCurveTo(0.94, 0.05, 1.04, 1.37, 0.54, 1.55);
    s.bezierCurveTo(0.09, 1.69, -0.04, 1.13, 0.3, 1.04);
    s.bezierCurveTo(0.64, 0.99, 0.57, 0.43, 0.14, 0.36);
    s.closePath();
  }), '#b96f44', 0, 0, -0.04, 0.04);
  const body = oval(squirrel.group, 0.48, 0.7, '#c18050', -0.1, 0.41, 0.02, 0.038);
  // Both motions share the body transform, so the tail stays attached.
  body.add(tail);
  tail.position.set(0.1, -0.41, -0.06);
  oval(body, 0.25, 0.48, CREAM, -0.08, 0.03, 0.045, 0.02);
  oval(body, 0.31, 0.12, '#b96f44', 0, -0.3, 0.06, 0.026);
  // Ears belong to the head outline, with no overlapping paper edges.
  const head = cut(body, shapeFrom(s => {
    s.moveTo(-0.22, -0.03);
    s.quadraticCurveTo(-0.24, 0.08, -0.18, 0.14);
    s.lineTo(-0.22, 0.35);
    s.lineTo(-0.07, 0.19);
    s.quadraticCurveTo(0, 0.22, 0.06, 0.18);
    s.lineTo(0.1, 0.33);
    s.lineTo(0.17, 0.14);
    s.quadraticCurveTo(0.27, 0.02, 0.18, -0.13);
    s.quadraticCurveTo(0.03, -0.24, -0.15, -0.14);
    s.closePath();
  }), '#c18050', -0.07, 0.52, 0.045, 0.03);
  oval(head, 0.26, 0.14, '#e6c49a', -0.18, -0.09, 0.05, 0.022);
  oval(head, 0.08, 0.06, '#4e4940', -0.3, -0.06, 0.075, 0.014);
  addSparkleEye(head, -0.13, 0.04, 0.065, 0.035);
  oval(body, 0.18, 0.23, '#ab7d4d', -0.26, 0.07, 0.11, 0.026);
  oval(body, 0.22, 0.09, '#795e41', -0.26, 0.16, 0.14, 0.02);
  oval(body, 0.19, 0.1, '#c98c5e', -0.14, -0.01, 0.15, 0.022);
  ctx.animate(body, 'sway', 'squirrel', 0.64);
  ctx.animate(tail, 'cat-tail', 'squirrel');
}
