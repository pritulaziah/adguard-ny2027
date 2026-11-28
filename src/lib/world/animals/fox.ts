import type { AnimalBuilderContext } from './shared';
import { PaperAnimal } from './paper-animal';
import { cut, oval, stroke } from '../paper-shapes';
import { CREAM, INK } from './shared';

/** Graceful seated spring fox with curled bushy tail and pointed cheek tufts. */
export class Fox extends PaperAnimal {
  constructor(ctx: AnimalBuilderContext, x: number, z = -1.02) {
    super(ctx, 'paper-fox', x, z, 0.96);
  }

  protected paint(): void {
    const fox = this.detail;
    this.shadow(0.96, 0.26, '#7a8f6f');

    // Sweeping bushy tail curling gracefully behind and around the fox.
    const tail = this.shape(s => {
      s.moveTo(-0.18, 0.16);
      s.bezierCurveTo(-0.62, 0.1, -0.82, 0.45, -0.64, 0.8);
      s.bezierCurveTo(-0.54, 0.94, -0.34, 0.88, -0.34, 0.68);
      s.bezierCurveTo(-0.34, 0.52, -0.26, 0.36, -0.12, 0.32);
      s.closePath();
    });
    fox.shape(tail, '#c9764e', 0, 0, -0.055, undefined, 0.038);

    const tailTip = this.shape(s => {
      s.moveTo(-0.64, 0.8);
      s.bezierCurveTo(-0.54, 0.94, -0.34, 0.88, -0.34, 0.68);
      s.lineTo(-0.46, 0.72);
      s.lineTo(-0.53, 0.64);
      s.lineTo(-0.62, 0.7);
      s.closePath();
    });
    fox.shape(tailTip, CREAM, 0, 0, -0.015, undefined, 0.022);

    // Seated teardrop torso.
    const body = this.shape(s => {
      s.moveTo(-0.33, 0.14);
      s.bezierCurveTo(-0.35, 0.44, -0.22, 0.76, 0.0, 0.82);
      s.bezierCurveTo(0.24, 0.78, 0.34, 0.44, 0.32, 0.14);
      s.quadraticCurveTo(0.0, 0.06, -0.33, 0.14);
      s.closePath();
    });
    fox.shape(body, '#cf7d53', 0, 0, 0, undefined, 0.044);

    // Fluffy cream chest bib.
    const bib = this.shape(s => {
      s.moveTo(-0.15, 0.68);
      s.quadraticCurveTo(0, 0.75, 0.15, 0.68);
      s.quadraticCurveTo(0.16, 0.36, 0.0, 0.24);
      s.quadraticCurveTo(-0.16, 0.36, -0.15, 0.68);
      s.closePath();
    });
    fox.shape(bib, CREAM, 0, 0, 0.046, undefined, 0.022);

    // Neat dark charcoal front paws resting on the meadow.
    fox.oval(0.14, 0.11, '#4f4844', -0.11, 0.09, 0.07, undefined, 0.026);
    fox.oval(0.14, 0.11, '#4f4844', 0.11, 0.09, 0.07, undefined, 0.026);

    // Sculpted animated fox head with diamond cheek tufts.
    const headShape = this.shape(s => {
      s.moveTo(0, 0.27);
      s.bezierCurveTo(0.2, 0.26, 0.36, 0.1, 0.38, -0.04);
      s.bezierCurveTo(0.24, -0.15, 0.1, -0.24, 0, -0.25);
      s.bezierCurveTo(-0.1, -0.24, -0.24, -0.15, -0.38, -0.04);
      s.bezierCurveTo(-0.36, 0.1, -0.2, 0.26, 0, 0.27);
      s.closePath();
    });
    const head = cut(fox.group, headShape, '#d48257', 0.02, 0.96, 0.06, 0.044);

    // Cream cheek masks framing the pointed snout.
    for (const sign of [-1, 1]) {
      const cheek = this.shape(s => {
        s.moveTo(0, -0.24);
        s.quadraticCurveTo(sign * 0.22, -0.2, sign * 0.36, -0.04);
        s.quadraticCurveTo(sign * 0.2, 0.02, sign * 0.06, -0.08);
        s.closePath();
      });
      cut(head, cheek, CREAM, 0, 0, 0.044, 0.016);

      // Tall pointed fox ears with a blush inner ear.
      const ear = this.shape(s => {
        s.moveTo(sign * 0.08, 0.18);
        s.lineTo(sign * 0.32, 0.52);
        s.lineTo(sign * 0.32, 0.08);
        s.closePath();
      });
      cut(head, ear, '#c57249', 0, 0, -0.016, 0.032);
      cut(
        head,
        [
          [sign * 0.14, 0.19],
          [sign * 0.26, 0.38],
          [sign * 0.27, 0.15],
        ],
        '#e7c3b2',
        0,
        0,
        0.018,
        0.014,
      );
    }

    this.eye(head, -0.12, 0.035, 0.056, 0.042);
    this.eye(head, 0.12, 0.035, 0.056, 0.042);
    oval(head, 0.09, 0.065, INK, 0, -0.19, 0.068, 0.022);
    stroke(
      head,
      [
        [-0.22, -0.1],
        [-0.42, -0.07],
      ],
      INK,
      0.01,
      0.065,
    );
    stroke(
      head,
      [
        [-0.22, -0.14],
        [-0.41, -0.16],
      ],
      INK,
      0.01,
      0.065,
    );
    stroke(
      head,
      [
        [0.22, -0.1],
        [0.42, -0.07],
      ],
      INK,
      0.01,
      0.065,
    );
    stroke(
      head,
      [
        [0.22, -0.14],
        [0.41, -0.16],
      ],
      INK,
      0.01,
      0.065,
    );

    this.animate(head, 'sway', 'fox', 0.46);
  }
}
