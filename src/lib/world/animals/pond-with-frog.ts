import type { AnimalBuilderContext } from './shared';
import { cut, oval } from '../paper-shapes';
import { BLUSH, addSparkleEye, shapeFrom } from './shared';

/** Spring lily-pad pond with cattails, water lily, and cheerful perched frog. */
export function addPondWithFrog(ctx: AnimalBuilderContext, x: number, z = -1.04): void {
  const pond = ctx.detail('paper-pond', x, z);

  // Layered pond water rim + deeper center.
  pond.oval(2.1, 0.86, '#a5c2b9', 0, 0.02, 0, [-Math.PI / 2, 0, 0], 0.014);
  pond.oval(1.86, 0.72, '#7fa6a2', 0, 0.035, 0.02, [-Math.PI / 2, 0, 0], 0.016);
  pond.oval(0.55, 0.12, '#bcd6ce', 0.42, 0.055, -0.08, [-Math.PI / 2, 0, 0], 0.01);

  // Cattail reeds rising gracefully behind the pond.
  const reeds: Array<[number, number, number]> = [
    [-0.88, 0.92, 0.08], [-0.68, 1.12, -0.06], [0.89, 1.0, -0.07],
  ];
  for (const [rx, rh, rot] of reeds) {
    // The stem ends inside its seed head. The same rotation locates both.
    pond.stroke([[rx, 0.02], [rx - Math.sin(rot) * (rh - 0.14), 0.02 + Math.cos(rot) * (rh - 0.14)]], '#728f6e', 0.025, -0.32);
    pond.oval(0.075, 0.22, '#8a6650', rx - Math.sin(rot) * (rh - 0.05), 0.02 + Math.cos(rot) * (rh - 0.05), -0.28, [0, 0, rot], 0.02);
  }

  // Two notched lily pads resting on the water surface.
  const padShape = (r: number) => shapeFrom(s => {
    s.absarc(0, 0, r, 0.25, Math.PI * 2 - 0.25, false);
    s.lineTo(0, 0);
    s.closePath();
  });
  pond.shape(padShape(0.36), '#84a472', -0.28, 0.065, 0.14, [-Math.PI / 2, 0, 0.35], 0.018);
  pond.shape(padShape(0.28), '#94b17f', 0.42, 0.065, 0.08, [-Math.PI / 2, 0, -2.3], 0.018);

  // Delicate pink water-lily blossom on the right pad.
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    pond.oval(0.08, 0.15, i % 2 ? '#eac2bc' : '#f4d9d1', 0.42 + Math.cos(a) * 0.075, 0.12, 0.08 + Math.sin(a) * 0.04, [-0.55, 0, a], 0.014);
  }
  pond.oval(0.08, 0.08, '#e8c477', 0.42, 0.15, 0.1, [-0.35, 0, 0], 0.014);

  // Plump perched frog sitting on the left lily pad.
  const frogShape = shapeFrom(s => {
    s.moveTo(-0.27, -0.1);
    s.bezierCurveTo(-0.31, 0.06, -0.18, 0.18, 0, 0.18);
    s.bezierCurveTo(0.18, 0.18, 0.31, 0.06, 0.27, -0.1);
    s.quadraticCurveTo(0, -0.16, -0.27, -0.1);
    s.closePath();
  });
  const frog = cut(pond.group, frogShape, '#7fa56f', -0.27, 0.25, 0.18, 0.044);

  // Tucked haunches on either side and soft cream belly.
  for (const sign of [-1, 1]) {
    oval(frog, 0.19, 0.21, '#6f9660', sign * 0.23, -0.07, -0.014, 0.036);
    cut(frog, [[sign * 0.14, -0.15], [sign * 0.34, -0.15], [sign * 0.31, -0.19], [sign * 0.14, -0.19]], '#658b57', 0, 0, 0.01, 0.02);
  }
  oval(frog, 0.3, 0.17, '#e2e5c2', 0, -0.05, 0.044, 0.016);

  // Raised eyes and soft cheeks keep the face simple.
  for (const sign of [-1, 1]) {
    oval(frog, 0.17, 0.17, '#8db37c', sign * 0.14, 0.17, 0.018, 0.036);
    oval(frog, 0.11, 0.11, '#fbf7ea', sign * 0.14, 0.17, 0.048, 0.016);
    addSparkleEye(frog, sign * 0.14, 0.17, 0.064, 0.034);
    oval(frog, 0.08, 0.05, BLUSH, sign * 0.17, 0.03, 0.048, 0.012);
  }

  ctx.animate(frog, 'jump', 'frog', 0.34);
}
