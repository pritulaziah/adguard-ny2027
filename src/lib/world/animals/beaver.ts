import type { AnimalBuilderContext } from './shared';
import { oval, rect } from '../paper-shapes';
import { addSparkleEye, shapeFrom } from './shared';

/** Upright paper beaver, built like the cat and the other shore animals. */
export function addBeaver(ctx: AnimalBuilderContext, x: number, z = -1.55): void {
  const shore = ctx.detail('beaver-grassy-bank', x, z + 0.06);
  shore.oval(1.3, 0.24, '#718f68', 0.06, 0.12, 0);
  shore.oval(1.1, 0.09, '#a7b885', 0.02, 0.19, 0.03);
  const beaver = ctx.detail('paper-beaver', x, z, 0.94, 0.5);

  // Broad flat tail behind the upright body.
  const tail = beaver.child('beaver-tail', 0.35, 0.24, -0.04);
  tail.oval(0.34, 0.64, '#78634e', 0.12, 0.12, 0, [0, 0, -0.6], 0.035);
  for (let i = 0; i < 4; i++) {
    const y = -0.04 + i * 0.08;
    tail.stroke([[0.02, y], [0.26, y + 0.1]], '#9a8061', 0.012, 0.045);
  }

  const body = shapeFrom(s => {
    s.moveTo(-0.31, 0.12);
    s.bezierCurveTo(-0.38, 0.42, -0.27, 0.77, -0.03, 0.82);
    s.bezierCurveTo(0.23, 0.81, 0.36, 0.43, 0.31, 0.12);
    s.quadraticCurveTo(0, 0.04, -0.31, 0.12);
    s.closePath();
  });
  beaver.shape(body, '#967351', 0, 0, 0, undefined, 0.044);
  beaver.oval(0.4, 0.49, '#c1a075', 0, 0.43, 0.048, undefined, 0.02);

  // Both hind feet and both forepaws stay visible, without a prop.
  for (const side of [-1, 1]) {
    beaver.oval(0.22, 0.12, '#806046', side * 0.18, 0.085, 0.075, undefined, 0.028);
    beaver.oval(0.14, 0.27, '#a78057', side * 0.25, 0.48, 0.07, [0, 0, side * -0.28], 0.026);
    for (const dx of [-0.035, 0.025]) {
      beaver.stroke([[side * 0.18 + dx, 0.06], [side * 0.18 + dx, 0.105]], '#c2a078', 0.01, 0.11);
    }
  }

  const head = oval(beaver.group, 0.63, 0.53, '#a78057', 0, 1.0, 0.06, 0.044);
  for (const side of [-1, 1]) {
    oval(head, 0.16, 0.18, '#876346', side * 0.23, 0.22, -0.015, 0.028);
    oval(head, 0.09, 0.11, '#c6a37c', side * 0.23, 0.22, 0.015, 0.014);
    oval(head, 0.23, 0.17, '#d2b38a', side * 0.09, -0.105, 0.048, 0.018);
    addSparkleEye(head, side * 0.14, 0.055, 0.065, 0.04);
    rect(head, 0.065, 0.105, '#f1e6cd', side * 0.039, -0.21, 0.085, 0.016);
  }
  oval(head, 0.11, 0.075, '#524739', 0, -0.055, 0.082, 0.02);
  ctx.animate(head, 'still', 'beaver', 0.45);
}
