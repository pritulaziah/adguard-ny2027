import type { AnimalBuilderContext } from './shared';
import { cut, oval, stroke } from '../paper-shapes';
import { BLUSH, INK, addSparkleEye, shapeFrom } from './shared';

/** Friendly storybook sea-dragon gliding gently over the summer coastal bay. */
export function addSeaDragon(ctx: AnimalBuilderContext, x: number, z = -1.12): void {
  const host = ctx.place('paper-dragon', x, z, 0.94);

  // Gracefully curved emerald-jade body + S-neck + curling tail.
  const bodyShape = shapeFrom(s => {
    s.moveTo(-0.56, 0.16);
    s.bezierCurveTo(-0.74, 0.36, -0.58, 0.56, -0.45, 0.44);
    s.bezierCurveTo(-0.52, 0.36, -0.46, 0.24, -0.32, 0.2);
    s.bezierCurveTo(-0.1, 0.12, 0.2, 0.16, 0.32, 0.36);
    s.bezierCurveTo(0.42, 0.54, 0.34, 0.78, 0.28, 0.96);
    s.bezierCurveTo(0.24, 1.08, 0.38, 1.18, 0.58, 1.1);
    s.bezierCurveTo(0.68, 1.06, 0.69, 0.94, 0.57, 0.9);
    s.bezierCurveTo(0.46, 0.87, 0.4, 0.87, 0.36, 0.8);
    s.bezierCurveTo(0.44, 0.62, 0.52, 0.44, 0.44, 0.24);
    s.bezierCurveTo(0.32, -0.02, -0.26, -0.06, -0.56, 0.16);
    s.closePath();
  });
  const body = cut(host, bodyShape, '#699c8e', 0, 0.34, 0, 0.046);

  // Soft cream striped belly plates.
  const bellyShape = shapeFrom(s => {
    s.moveTo(-0.24, 0.11);
    s.quadraticCurveTo(0.14, 0.04, 0.38, 0.24);
    s.quadraticCurveTo(0.42, 0.52, 0.33, 0.78);
    s.quadraticCurveTo(0.26, 0.5, 0.21, 0.28);
    s.quadraticCurveTo(0.02, 0.14, -0.24, 0.11);
    s.closePath();
  });
  cut(body, bellyShape, '#efe4c7', 0, 0, 0.044, 0.018);

  // Golden scalloped dorsal crests along neck and back.
  const crests: Array<[number, number, number]> = [
    [0.24, 1.06, 0.25], [0.22, 0.9, 0.55], [0.23, 0.72, 0.65],
    [0.16, 0.52, 0.85], [-0.04, 0.33, 1.35], [-0.26, 0.27, 1.7],
  ];
  for (const [cx, cy, rot] of crests) {
    const fin = cut(body, [[-0.075, 0], [0, 0.15], [0.075, 0]], '#e4bf76', cx, cy, -0.016, 0.024);
    fin.rotation.z = rot;
  }

  // Little golden head horn + friendly snout expression.
  cut(body, [[0.29, 1.1], [0.19, 1.32], [0.39, 1.15]], '#e4bf76', 0, 0, -0.012, 0.024);
  cut(body, [[0.38, 1.12], [0.34, 1.28], [0.46, 1.13]], '#d8b065', 0, 0, 0.016, 0.02);
  addSparkleEye(body, 0.42, 1.05, 0.056, 0.046, '#f6eccf');
  oval(body, 0.07, 0.045, BLUSH, 0.46, 0.96, 0.054, 0.012);
  oval(body, 0.032, 0.032, '#47685f', 0.59, 1.02, 0.054, 0.012);
  stroke(body, [[0.47, 0.93], [0.56, 0.92], [0.62, 0.95]], INK, 0.014, 0.062);

  // Back wing (darker sage-teal behind the body).
  const wingShape = shapeFrom(s => {
    s.moveTo(0, 0);
    s.bezierCurveTo(-0.18, 0.36, -0.44, 0.52, -0.62, 0.44);
    s.quadraticCurveTo(-0.48, 0.28, -0.5, 0.16);
    s.quadraticCurveTo(-0.34, 0.14, -0.3, 0.02);
    s.quadraticCurveTo(-0.16, 0.05, 0, 0);
    s.closePath();
  });
  const backWing = cut(body, wingShape, '#548278', 0.12, 0.48, -0.042, 0.026);
  backWing.rotation.z = -0.18;

  // Front wing with delicate cream paper ribs and gentle flutter animation.
  const frontWing = cut(body, wingShape, '#8cb8aa', 0.12, 0.46, 0.054, 0.026);
  stroke(frontWing, [[0, 0.02], [-0.46, 0.36]], '#e6dfc5', 0.014, 0.032);
  stroke(frontWing, [[-0.06, 0.03], [-0.36, 0.16]], '#e6dfc5', 0.012, 0.032);
  ctx.animate(frontWing, 'flutter');

  ctx.animate(body, 'float', 'dragon', 0.25);
}
