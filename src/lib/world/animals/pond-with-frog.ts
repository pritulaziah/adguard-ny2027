import type { AnimalBuilderContext } from './shared';
import { cut, oval } from '../paper-shapes';
import { BLUSH, INK, addSparkleEye, shapeFrom } from './shared';

/** Spring lily-pad pond with cattails, water lily, and cheerful perched frog. */
export function addPondWithFrog(ctx: AnimalBuilderContext, x: number, z = -1.04): void {
  const pond = ctx.detail('paper-pond', x, z);

  // Layered pond water rim + deeper center.
  pond.oval(2.1, 0.86, '#a5c2b9', 0, 0.02, 0, [-Math.PI / 2, 0, 0], 0.014);
  pond.oval(1.86, 0.72, '#7fa6a2', 0, 0.035, 0.02, [-Math.PI / 2, 0, 0], 0.016);
  pond.oval(0.55, 0.12, '#bcd6ce', 0.42, 0.055, -0.08, [-Math.PI / 2, 0, 0], 0.01);

  // Tapered reed blades framing both sides and the rear edge of the pond.
  const reedBlade = (height: number, lean: number, width = 0.056) =>
    shapeFrom(s => {
      s.moveTo(-width * 0.5, 0);
      s.quadraticCurveTo(lean * 0.35 - width * 0.32, height * 0.55, lean, height);
      s.quadraticCurveTo(lean * 0.45 + width * 0.28, height * 0.48, width * 0.5, 0);
      s.closePath();
    });
  const blades: Array<[number, number, number, number, string, number]> = [
    [-1.12, 0.52, -0.22, -0.25, '#6d8c68', 0.055],
    [-1.0, 0.78, -0.14, -0.33, '#5f7e5c', 0.06],
    [-0.88, 0.66, 0.12, -0.24, '#7d9e76', 0.056],
    [-0.79, 0.88, -0.06, -0.35, '#668562', 0.062],
    [-0.69, 0.56, 0.08, -0.23, '#83a47b', 0.052],
    [-0.62, 0.38, -0.06, -0.25, '#72926d', 0.048],
    [0.08, 0.32, -0.08, -0.36, '#6d8c68', 0.046],
    [0.14, 0.28, 0.1, -0.35, '#7d9e76', 0.044],
    [0.58, 0.4, -0.12, -0.25, '#72926d', 0.048],
    [0.68, 0.62, -0.16, -0.24, '#83a47b', 0.054],
    [0.78, 0.86, 0.08, -0.35, '#668562', 0.062],
    [0.88, 0.68, -0.1, -0.23, '#7d9e76', 0.056],
    [0.98, 0.76, 0.16, -0.33, '#5f7e5c', 0.06],
    [1.07, 0.5, 0.22, -0.25, '#6d8c68', 0.055],
  ];
  for (const [bx, bh, lean, bz, color, width] of blades) {
    pond.shape(reedBlade(bh, lean, width), color, bx, 0.02, bz, undefined, 0.014);
  }

  // Cattail reeds rising in two clusters behind the pond, leaving the center open.
  const reeds: Array<[number, number, number, number, string, string]> = [
    [-1.08, 0.78, 0.14, -0.34, '#668363', '#7f5c48'],
    [-0.93, 1.04, 0.06, -0.32, '#728f6e', '#8a6650'],
    [-0.78, 1.22, -0.02, -0.3, '#6d8b69', '#8a6650'],
    [-0.67, 0.74, 0.06, -0.27, '#799773', '#84604b'],
    [0.66, 0.86, 0.08, -0.28, '#799773', '#84604b'],
    [0.85, 1.18, -0.04, -0.32, '#728f6e', '#8a6650'],
    [1.03, 0.9, -0.13, -0.34, '#668363', '#7f5c48'],
  ];
  for (const [rx, rh, rot, rz, stemColor, headColor] of reeds) {
    // The stem ends inside its seed head, and a slender tip extends past the top.
    const sin = Math.sin(rot);
    const cos = Math.cos(rot);
    pond.stroke(
      [
        [rx, 0.02],
        [rx - sin * (rh - 0.12), 0.02 + cos * (rh - 0.12)],
      ],
      stemColor,
      0.024,
      rz,
    );
    pond.stroke(
      [
        [rx - sin * (rh + 0.04), 0.02 + cos * (rh + 0.04)],
        [rx - sin * (rh + 0.15), 0.02 + cos * (rh + 0.15)],
      ],
      stemColor,
      0.011,
      rz + 0.014,
    );
    pond.oval(0.074, 0.22, headColor, rx - sin * (rh - 0.04), 0.02 + cos * (rh - 0.04), rz + 0.036, [0, 0, rot], 0.022);
  }

  // Two notched lily pads resting on the water surface.
  const padShape = (r: number) =>
    shapeFrom(s => {
      s.absarc(0, 0, r, 0.25, Math.PI * 2 - 0.25, false);
      s.lineTo(0, 0);
      s.closePath();
    });
  pond.shape(padShape(0.36), '#84a472', -0.28, 0.065, 0.14, [-Math.PI / 2, 0, 0.35], 0.018);
  pond.shape(padShape(0.28), '#94b17f', 0.42, 0.065, 0.08, [-Math.PI / 2, 0, -2.3], 0.018);

  // Delicate pink water-lily blossom on the right pad.
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    pond.oval(
      0.08,
      0.15,
      i % 2 ? '#eac2bc' : '#f4d9d1',
      0.42 + Math.cos(a) * 0.075,
      0.12,
      0.08 + Math.sin(a) * 0.04,
      [-0.55, 0, a],
      0.014,
    );
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

  // Tucked haunches, rounded webbed feet, and soft cream belly.
  const footShape = (sign: number) =>
    shapeFrom(s => {
      s.moveTo(sign * 0.13, -0.135);
      s.quadraticCurveTo(sign * 0.24, -0.135, sign * 0.32, -0.15);
      s.quadraticCurveTo(sign * 0.355, -0.166, sign * 0.315, -0.184);
      s.lineTo(sign * 0.285, -0.178);
      s.quadraticCurveTo(sign * 0.265, -0.202, sign * 0.225, -0.194);
      s.lineTo(sign * 0.205, -0.18);
      s.quadraticCurveTo(sign * 0.178, -0.2, sign * 0.14, -0.184);
      s.closePath();
    });
  for (const sign of [-1, 1]) {
    oval(frog, 0.19, 0.21, '#6f9660', sign * 0.23, -0.07, -0.014, 0.036);
    cut(frog, footShape(sign), '#658b57', 0, 0, 0.01, 0.02);
  }
  oval(frog, 0.29, 0.155, '#e2e5c2', 0, -0.062, 0.044, 0.016);

  // Raised eyes, soft cheeks, tiny nostrils, and a wide cheerful smile.
  for (const sign of [-1, 1]) {
    oval(frog, 0.17, 0.17, '#8db37c', sign * 0.14, 0.17, 0.018, 0.036);
    oval(frog, 0.11, 0.11, '#fbf7ea', sign * 0.14, 0.17, 0.048, 0.016);
    addSparkleEye(frog, sign * 0.14, 0.17, 0.064, 0.034);
    oval(frog, 0.08, 0.05, BLUSH, sign * 0.175, 0.032, 0.048, 0.012);
    oval(frog, 0.017, 0.013, '#53734a', sign * 0.032, 0.098, 0.048, 0.01);
  }
  const smileShape = shapeFrom(s => {
    s.moveTo(-0.125, 0.066);
    s.quadraticCurveTo(0, 0.026, 0.125, 0.066);
    s.quadraticCurveTo(0.132, 0.061, 0.126, 0.054);
    s.quadraticCurveTo(0, 0.012, -0.126, 0.054);
    s.quadraticCurveTo(-0.132, 0.061, -0.125, 0.066);
    s.closePath();
  });
  cut(frog, smileShape, INK, 0, 0, 0.048, 0.012);

  ctx.animate(frog, 'jump', 'frog', 0.34);
}
