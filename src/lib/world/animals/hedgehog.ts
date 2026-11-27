import type { AnimalBuilderContext } from './shared';
import { oval, cut } from '../paper-shapes';
import { CREAM, INK, addGroundShadow, addSparkleEye, shapeFrom } from './shared';

/** A small hedgehog beside a cut stump, with layered paper spines. */
export function addHedgehog(ctx: AnimalBuilderContext, x: number, z = -1.02): void {
  const scene = ctx.detail('paper-hedgehog', x, z, 0.68);
  addGroundShadow(scene, 1.35, 0.3, '#7a8f6f');
  scene.rect(0.46, 0.48, '#a08063', 0.46, 0, -0.13);
  scene.oval(0.53, 0.16, '#e1c9a2', 0.46, 0.48, -0.09);
  scene.oval(0.32, 0.09, '#b29470', 0.46, 0.49, -0.06);
  scene.stroke(
    [
      [0.34, 0.05],
      [0.33, 0.32],
    ],
    '#80654f',
    0.025,
    -0.08,
  );

  // One outline avoids intersecting faces between separate paper spines.
  const coat = shapeFrom(s => {
    s.moveTo(-0.43, -0.2);
    for (let i = 0; i <= 24; i++) {
      const angle = Math.PI - (i * Math.PI) / 24;
      const outer = i % 2 === 0;
      s.lineTo(Math.cos(angle) * (outer ? 0.5 : 0.43), Math.sin(angle) * (outer ? 0.4 : 0.27));
    }
    s.lineTo(0.4, -0.21);
    s.quadraticCurveTo(0, -0.3, -0.43, -0.2);
    s.closePath();
  });
  const body = cut(scene.group, coat, '#8c6e55', -0.1, 0.34, 0, 0.035);
  oval(body, 0.65, 0.42, '#9d805f', 0.06, -0.03, 0.045, 0.02);
  cut(
    body,
    [
      [-0.26, 0.13],
      [-0.6, -0.09],
      [-0.35, -0.23],
      [-0.12, -0.18],
    ],
    CREAM,
    0,
    0,
    0.08,
    0.016,
  );
  oval(body, 0.1, 0.075, INK, -0.56, -0.08, 0.1, 0.018);
  addSparkleEye(body, -0.34, 0.01, 0.1, 0.035);
  oval(body, 0.16, 0.09, '#6f5948', -0.23, -0.25, 0.04, 0.022);
  oval(body, 0.17, 0.09, '#6f5948', 0.2, -0.25, 0.04, 0.022);
  ctx.animate(body, 'sway', 'hedgehog', 0.32);
}
