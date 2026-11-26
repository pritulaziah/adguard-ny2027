import type { AnimalBuilderContext } from './shared';
import { cut, oval, stroke } from '../paper-shapes';
import { BLUSH, INK, addGroundShadow, addSparkleEye, shapeFrom } from './shared';

/** Plump seated storybook bunny with one upright ear, one tilted ear, and cotton tail. */
export function addBunny(ctx: AnimalBuilderContext, x: number, z = -0.98): void {
  const bunny = ctx.detail('paper-bunny', x, z, 0.96);
  addGroundShadow(bunny, 0.86, 0.26, '#876d5d');

  // Fluffy cotton-puff tail behind the seated haunch.
  bunny.oval(0.24, 0.24, '#faf4e6', 0.34, 0.24, -0.045, undefined, 0.038);
  bunny.oval(0.14, 0.14, '#ffffff', 0.39, 0.29, -0.018, undefined, 0.02);

  // Plump seated rabbit body facing slightly left toward the scene center.
  const body = shapeFrom(s => {
    s.moveTo(-0.28, 0.1);
    s.bezierCurveTo(-0.34, 0.36, -0.22, 0.68, -0.02, 0.72);
    s.bezierCurveTo(0.22, 0.72, 0.36, 0.44, 0.34, 0.14);
    s.quadraticCurveTo(0.04, 0.03, -0.28, 0.1);
    s.closePath();
  });
  bunny.shape(body, '#ddd0bc', 0, 0, 0, undefined, 0.044);

  // Rounded curled hind leg haunch and creamy belly patch.
  bunny.oval(0.32, 0.34, '#cfc1ac', 0.13, 0.24, 0.038, undefined, 0.026);
  bunny.oval(0.28, 0.36, '#efe7d6', -0.12, 0.38, 0.038, undefined, 0.02);

  // Neat tucked front paws and hind foot.
  bunny.oval(0.18, 0.1, '#ebe2cf', -0.18, 0.09, 0.068, undefined, 0.026);
  bunny.oval(0.22, 0.11, '#dfd2be', 0.07, 0.085, 0.066, undefined, 0.026);

  // Round rabbit head with plump cheeks.
  const headShape = shapeFrom(s => {
    s.moveTo(0, 0.24);
    s.bezierCurveTo(0.22, 0.24, 0.3, 0.08, 0.29, -0.08);
    s.bezierCurveTo(0.26, -0.21, 0.12, -0.23, 0, -0.23);
    s.bezierCurveTo(-0.14, -0.23, -0.28, -0.2, -0.3, -0.07);
    s.bezierCurveTo(-0.31, 0.08, -0.21, 0.24, 0, 0.24);
    s.closePath();
  });
  const head = cut(bunny.group, headShape, '#e3d7c5', -0.05, 0.88, 0.06, 0.044);

  // Long expressive rabbit ears: one tall upright, one gently tilted sideways.
  const earShape = (w: number, h: number) => shapeFrom(s => {
    s.moveTo(0, 0);
    s.bezierCurveTo(-w, h * 0.25, -w * 0.9, h * 0.9, 0, h);
    s.bezierCurveTo(w * 0.9, h * 0.9, w, h * 0.25, 0, 0);
    s.closePath();
  });

  const leftEar = cut(head, earShape(0.1, 0.62), '#ddd0bc', -0.1, 0.17, -0.018, 0.03);
  leftEar.rotation.z = 0.12;
  cut(leftEar, earShape(0.055, 0.44), '#e8beb3', 0, 0.07, 0.028, 0.014);

  const rightEar = cut(head, earShape(0.1, 0.58), '#d6c8b3', 0.1, 0.17, -0.024, 0.03);
  rightEar.rotation.z = -0.44;
  cut(rightEar, earShape(0.052, 0.4), '#e8beb3', 0, 0.07, 0.028, 0.014);

  // Soft cheek highlights, rosy blush, twitchy pink nose, and gentle eyes.
  oval(head, 0.15, 0.11, '#f4ede0', -0.08, -0.1, 0.044, 0.014);
  oval(head, 0.15, 0.11, '#f4ede0', 0.08, -0.1, 0.044, 0.014);
  oval(head, 0.09, 0.055, BLUSH, -0.19, -0.06, 0.046, 0.012);
  oval(head, 0.09, 0.055, BLUSH, 0.19, -0.06, 0.046, 0.012);
  addSparkleEye(head, -0.12, 0.03, 0.056, 0.04);
  addSparkleEye(head, 0.11, 0.03, 0.056, 0.04);
  oval(head, 0.078, 0.056, '#e2968b', -0.01, -0.06, 0.062, 0.016);
  stroke(head, [[-0.07, -0.12], [-0.035, -0.15], [-0.01, -0.1], [0.025, -0.15], [0.06, -0.12]], INK, 0.012, 0.064);

  ctx.animate(head, 'still', 'bunny', 0.64);
  ctx.animate(rightEar, 'bunny-ear', 'bunny');
}

