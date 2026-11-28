import * as THREE from 'three';
import type { AnimalBuilderContext } from './shared';
import { PaperAnimal } from './paper-animal';
import { cut, oval, rect, stroke } from '../paper-shapes';
import { CREAM, INK } from './shared';

/** Cozy seated slate-tuxedo cat with curled S-tail, crisp whiskers, and golden eyes. */
export class Cat extends PaperAnimal {
  constructor(ctx: AnimalBuilderContext, x: number, z = -1.02) {
    super(ctx, 'paper-cat', x, z, 0.96);
  }

  protected paint(): void {
    const cat = this.detail;
    this.shadow(0.88, 0.26, '#876d5d');

    // Graceful upright S-tail with a small cream tip, tucked behind the body.
    const tail = this.shape(s => {
      s.moveTo(-0.16, 0.15);
      s.bezierCurveTo(-0.49, 0.09, -0.7, 0.32, -0.63, 0.61);
      s.bezierCurveTo(-0.59, 0.77, -0.62, 0.85, -0.7, 0.86);
      s.bezierCurveTo(-0.8, 0.88, -0.78, 1.0, -0.68, 0.99);
      s.bezierCurveTo(-0.46, 0.97, -0.43, 0.75, -0.47, 0.57);
      s.bezierCurveTo(-0.52, 0.39, -0.36, 0.28, -0.15, 0.3);
      s.closePath();
    });
    const tailTip = this.shape(s => {
      s.moveTo(-0.63, 0.78);
      s.bezierCurveTo(-0.64, 0.83, -0.67, 0.855, -0.7, 0.86);
      s.bezierCurveTo(-0.8, 0.88, -0.78, 1.0, -0.68, 0.99);
      s.bezierCurveTo(-0.57, 0.98, -0.51, 0.92, -0.48, 0.83);
      s.lineTo(-0.55, 0.85);
      s.lineTo(-0.58, 0.79);
      s.closePath();
    });
    const movingTail = new THREE.Group();
    movingTail.position.set(-0.16, 0.2, -0.08);
    cat.group.add(movingTail);
    cut(movingTail, tail, '#566470', 0.16, -0.2, 0, 0.038);
    cut(movingTail, tailTip, CREAM, 0.16, -0.2, 0.04, 0.022);

    // Seated pear-shaped body with tucked haunch.
    const body = this.shape(s => {
      s.moveTo(-0.33, 0.12);
      s.bezierCurveTo(-0.37, 0.42, -0.22, 0.72, 0, 0.76);
      s.bezierCurveTo(0.24, 0.72, 0.34, 0.42, 0.3, 0.12);
      s.quadraticCurveTo(0, 0.04, -0.33, 0.12);
      s.closePath();
    });
    cat.shape(body, '#60707c', 0, 0, 0, undefined, 0.044);

    // Tucked hind haunch shading and crisp cream tuxedo chest bib.
    cat.oval(0.3, 0.34, '#51606b', -0.17, 0.24, 0.05, undefined, 0.006);
    const bib = this.shape(s => {
      s.moveTo(-0.13, 0.66);
      s.quadraticCurveTo(0, 0.72, 0.13, 0.66);
      s.quadraticCurveTo(0.16, 0.36, 0, 0.24);
      s.quadraticCurveTo(-0.16, 0.36, -0.13, 0.66);
      s.closePath();
    });
    cat.shape(bib, CREAM, 0, 0, 0.044, undefined, 0.02);

    // Neat white mittens tucked together at the base.
    cat.oval(0.14, 0.1, CREAM, -0.09, 0.085, 0.068, undefined, 0.028);
    cat.oval(0.14, 0.1, CREAM, 0.09, 0.085, 0.068, undefined, 0.028);

    // Warm terracotta collar with tiny gold bell.
    cat.rect(0.32, 0.068, '#c87361', 0, 0.69, 0.068, undefined, 0.022);
    cat.oval(0.085, 0.085, '#e8c477', 0, 0.67, 0.09, undefined, 0.024);

    // Animated expressive round cat head.
    const headShape = this.shape(s => {
      s.moveTo(0, 0.26);
      s.bezierCurveTo(0.24, 0.26, 0.34, 0.1, 0.32, -0.08);
      s.bezierCurveTo(0.28, -0.22, 0.12, -0.25, 0, -0.25);
      s.bezierCurveTo(-0.12, -0.25, -0.28, -0.22, -0.32, -0.08);
      s.bezierCurveTo(-0.34, 0.1, -0.24, 0.26, 0, 0.26);
      s.closePath();
    });
    const head = cut(cat.group, headShape, '#667683', 0, 0.94, 0.06, 0.044);

    // Pointed cat ears with soft blush inner triangles.
    for (const sign of [-1, 1]) {
      cut(
        head,
        [
          [sign * 0.08, 0.18],
          [sign * 0.29, 0.45],
          [sign * 0.31, 0.08],
        ],
        '#5b6b77',
        0,
        0,
        -0.015,
        0.032,
      );
      cut(
        head,
        [
          [sign * 0.13, 0.19],
          [sign * 0.25, 0.36],
          [sign * 0.26, 0.14],
        ],
        '#e5b9ae',
        0,
        0,
        0.018,
        0.014,
      );
    }

    // Subtle tabby forehead stripes.
    for (const fx of [-0.07, 0, 0.07]) {
      rect(head, 0.024, 0.095, '#4c5964', fx, 0.15, 0.046, 0.012);
    }

    // Soft cream muzzle cheeks, tiny pink triangle nose, and 'w' smile.
    oval(head, 0.17, 0.13, CREAM, -0.08, -0.12, 0.046, 0.016);
    oval(head, 0.17, 0.13, CREAM, 0.08, -0.12, 0.046, 0.016);
    cut(
      head,
      [
        [-0.042, -0.05],
        [0.042, -0.05],
        [0, -0.1],
      ],
      '#de9187',
      0,
      0,
      0.064,
      0.014,
    );
    stroke(
      head,
      [
        [-0.075, -0.13],
        [-0.035, -0.16],
        [0, -0.11],
        [0.035, -0.16],
        [0.075, -0.13],
      ],
      INK,
      0.012,
      0.066,
    );

    // Warm golden-amber eyes with dark vertical pupils and sparkle.
    const eyes = new THREE.Group();
    eyes.position.set(0, 0.02, 0.052);
    head.add(eyes);
    for (const x of [-0.13, 0.13]) this.eye(eyes, x, 0, 0, 0.046, '#e8c474');

    // Three crisp splayed whiskers per side.
    for (const sign of [-1, 1]) {
      stroke(
        head,
        [
          [sign * 0.18, -0.07],
          [sign * 0.42, -0.03],
        ],
        '#eee6d4',
        0.01,
        0.068,
      );
      stroke(
        head,
        [
          [sign * 0.19, -0.11],
          [sign * 0.44, -0.11],
        ],
        '#eee6d4',
        0.01,
        0.068,
      );
      stroke(
        head,
        [
          [sign * 0.18, -0.15],
          [sign * 0.41, -0.19],
        ],
        '#eee6d4',
        0.01,
        0.068,
      );
    }

    this.animate(head, 'still', 'cat', 0.42);
    this.animate(eyes, 'cat-blink', 'cat');
    this.animate(movingTail, 'cat-tail', 'cat');
  }
}
