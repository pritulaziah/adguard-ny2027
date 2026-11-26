import type { AnimalBuilderContext } from './shared';
import { cut } from '../paper-shapes';
import { BLUSH, INK, SNOW, addGroundShadow, addStaticSparkleEye, shapeFrom } from './shared';

/** Plump grounded winter snowman with felt hat, holly sprig, scarf, and waving arm. */
export function addSnowman(ctx: AnimalBuilderContext, x: number, interactive = true, z = -1.04): void {
  const man = ctx.detail('paper-snowman', x, z, 0.98);
  addGroundShadow(man, 1.02, 0.28, '#83909b');

  // Plump lower snowball resting firmly on the ground with subtle rim shadow.
  man.oval(0.96, 0.88, '#dfe5e8', 0.02, 0.44, -0.015, undefined, 0.04);
  man.oval(0.92, 0.85, SNOW, 0, 0.44, 0.01, undefined, 0.042);

  // Middle torso snowball for a classic charming snowman silhouette.
  man.oval(0.74, 0.66, '#e2e8ea', 0.015, 0.96, 0.03, undefined, 0.04);
  man.oval(0.7, 0.64, '#f6f2e8', 0, 0.96, 0.055, undefined, 0.042);

  // Cozy knitted crimson-terracotta scarf with striped fringe tail.
  const scarfWrap = shapeFrom(s => {
    s.moveTo(-0.34, 1.19);
    s.quadraticCurveTo(0, 1.11, 0.34, 1.19);
    s.lineTo(0.32, 1.32);
    s.quadraticCurveTo(0, 1.25, -0.32, 1.32);
    s.closePath();
  });
  man.shape(scarfWrap, '#bc6d60', 0, 0, 0.125, undefined, 0.032);
  man.cut([[0.09, 1.21], [0.24, 1.21], [0.29, 0.78], [0.13, 0.8]], '#ae6054', 0, 0, 0.145, undefined, 0.028);
  man.rect(0.14, 0.026, '#f0dbb5', 0.2, 0.88, 0.176, undefined, 0.01);
  man.rect(0.14, 0.026, '#f0dbb5', 0.19, 0.97, 0.176, undefined, 0.01);

  // Three coal buttons down the tummy.
  for (const by of [0.46, 0.69, 0.92]) {
    man.oval(0.068, 0.068, INK, -0.01, by, 0.112, undefined, 0.02);
  }

  // Cheerful head with rosy cheeks, carrot nose, and coal smile.
  const head = man.child('paper-snowman-head', 0, 1.48, 0.095);
  head.oval(0.58, 0.54, '#f9f5ec', 0, 0, 0, undefined, 0.044);
  addStaticSparkleEye(head, -0.1, 0.07, 0.048, 0.038);
  addStaticSparkleEye(head, 0.1, 0.07, 0.048, 0.038);
  head.oval(0.095, 0.06, BLUSH, -0.17, -0.02, 0.046, undefined, 0.012);
  head.oval(0.095, 0.06, BLUSH, 0.17, -0.02, 0.046, undefined, 0.012);

  // Tapered carrot nose pointing warmly to the right.
  const carrot = shapeFrom(s => {
    s.moveTo(0.0, 0.03);
    s.quadraticCurveTo(0.24, -0.01, 0.34, -0.04);
    s.quadraticCurveTo(0.22, -0.09, 0.0, -0.08);
    s.closePath();
  });
  head.shape(carrot, '#dc8652', 0, 0, 0.056, undefined, 0.024);

  // Pebbled smile dots.
  for (let i = 0; i < 5; i++) {
    const t = (i / 4) * 2 - 1;
    head.oval(0.034, 0.034, INK, t * 0.11, -0.13 + t * t * 0.035, 0.05, undefined, 0.012);
  }

  // Jaunty tilted felt top hat with ribbon and holly sprig.
  const hat = head.child('paper-snowman-hat', -0.02, 0.24, 0.03);
  hat.cut([[-0.38, -0.03], [0.38, 0.03], [0.36, 0.11], [-0.36, 0.05]], '#586e66', 0, 0, 0.01, undefined, 0.034);
  hat.cut([[-0.22, 0.05], [0.22, 0.09], [0.19, 0.44], [-0.2, 0.4]], '#637a71', 0, 0, 0, undefined, 0.032);
  hat.cut([[-0.22, 0.08], [0.22, 0.12], [0.21, 0.19], [-0.21, 0.15]], '#c47264', 0, 0, 0.034, undefined, 0.018);
  // Holly leaves + crimson berries on the hat band.
  hat.oval(0.11, 0.055, '#688c6c', 0.14, 0.16, 0.056, [0, 0, 0.45], 0.012);
  hat.oval(0.11, 0.055, '#769a77', 0.21, 0.13, 0.056, [0, 0, -0.35], 0.012);
  hat.oval(0.044, 0.044, '#c7594f', 0.16, 0.14, 0.07, undefined, 0.014);
  hat.oval(0.038, 0.038, '#d46b5f', 0.2, 0.16, 0.072, undefined, 0.014);

  // Left resting twig arm.
  man.stroke([[-0.31, 0.96], [-0.62, 1.15], [-0.73, 1.32]], '#7d6250', 0.042, 0.02);
  man.stroke([[-0.56, 1.11], [-0.69, 1.07]], '#7d6250', 0.028, 0.02);

  // Animated waving right twig arm.
  const arm = cut(
    man.group,
    [[0, 0], [0.36, 0.22], [0.42, 0.48], [0.47, 0.47], [0.42, 0.23], [0.62, 0.34], [0.65, 0.29], [0.03, -0.06]],
    '#7d6250',
    0.31,
    0.96,
    0.04,
    0.032,
  );
  ctx.animate(arm, 'wing', interactive ? 'snowman' : undefined, 0.62);
}
