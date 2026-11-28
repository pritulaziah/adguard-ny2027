import * as THREE from 'three';
import type { AnimalBuilderContext } from './shared';
import { PaperAnimal } from './paper-animal';
import { cut, oval, stroke } from '../paper-shapes';
import { BLUSH, CREAM } from './shared';

/** Graceful winter fawn in 3/4 side profile with scarf and branched antlers. */
export class Deer extends PaperAnimal {
  constructor(ctx: AnimalBuilderContext, x: number, z = -1.08) {
    super(ctx, 'paper-deer', x, z, 0.96);
  }

  protected paint(): void {
    const deer = this.detail;
    this.shadow(0.92, 0.26, '#849099');

    // Back legs (darker warm tan, gracefully tapered and tucked behind body).
    deer.cut(
      [
        [-0.34, 0.02],
        [-0.26, 0.02],
        [-0.21, 0.56],
        [-0.35, 0.56],
      ],
      '#9e7c64',
      0,
      0,
      -0.06,
      undefined,
      0.032,
    );
    deer.cut(
      [
        [0.17, 0.02],
        [0.25, 0.02],
        [0.26, 0.56],
        [0.13, 0.56],
      ],
      '#9e7c64',
      0,
      0,
      -0.06,
      undefined,
      0.032,
    );
    deer.rect(0.09, 0.065, '#584c45', -0.3, 0.0, -0.055, undefined, 0.036);
    deer.rect(0.09, 0.065, '#584c45', 0.21, 0.0, -0.055, undefined, 0.036);

    // Sculpted fawn body and curved neck rising toward the right.
    const body = this.shape(s => {
      s.moveTo(-0.46, 0.64);
      s.bezierCurveTo(-0.48, 0.42, -0.22, 0.38, 0.14, 0.41);
      s.bezierCurveTo(0.38, 0.44, 0.44, 0.62, 0.42, 0.96);
      s.bezierCurveTo(0.41, 1.07, 0.26, 1.08, 0.22, 0.98);
      s.bezierCurveTo(0.18, 0.84, 0.08, 0.8, -0.14, 0.81);
      s.bezierCurveTo(-0.34, 0.82, -0.45, 0.76, -0.46, 0.64);
      s.closePath();
    });
    deer.shape(body, '#c29978', 0, 0, 0, undefined, 0.044);

    // Soft cream underbelly and upturned white tail tuft.
    const belly = this.shape(s => {
      s.moveTo(-0.28, 0.45);
      s.quadraticCurveTo(-0.02, 0.39, 0.24, 0.46);
      s.quadraticCurveTo(0.02, 0.56, -0.28, 0.45);
      s.closePath();
    });
    deer.shape(belly, '#eadbc2', 0, 0, 0.044, undefined, 0.018);

    const tail = this.shape(s => {
      s.moveTo(-0.42, 0.68);
      s.quadraticCurveTo(-0.62, 0.78, -0.55, 0.92);
      s.quadraticCurveTo(-0.44, 0.88, -0.4, 0.73);
      s.closePath();
    });
    deer.shape(tail, CREAM, 0, 0, -0.02, undefined, 0.03);

    // Front legs (brighter tan, gracefully tapered and standing cleanly in front).
    deer.cut(
      [
        [-0.22, 0.02],
        [-0.14, 0.02],
        [-0.09, 0.52],
        [-0.23, 0.52],
      ],
      '#b58d6f',
      0,
      0,
      0.035,
      undefined,
      0.034,
    );
    deer.cut(
      [
        [0.27, 0.02],
        [0.35, 0.02],
        [0.35, 0.56],
        [0.22, 0.56],
      ],
      '#b58d6f',
      0,
      0,
      0.035,
      undefined,
      0.034,
    );
    deer.rect(0.09, 0.07, '#4e433d', -0.18, 0.0, 0.04, undefined, 0.038);
    deer.rect(0.09, 0.07, '#4e433d', 0.31, 0.0, 0.04, undefined, 0.038);

    // Delicate fawn spots on the back.
    const spots: Array<[number, number, number]> = [
      [-0.24, 0.72, 0.065],
      [-0.11, 0.74, 0.075],
      [0.02, 0.69, 0.06],
      [-0.17, 0.62, 0.055],
      [-0.03, 0.6, 0.062],
    ];
    for (const [sx, sy, sr] of spots) deer.oval(sr * 1.15, sr, '#f3e7ce', sx, sy, 0.052, undefined, 0.012);

    // Warm knitted winter scarf around the neck.
    deer.cut(
      [
        [0.16, 0.82],
        [0.46, 0.83],
        [0.47, 0.95],
        [0.15, 0.94],
      ],
      '#be6e62',
      0,
      0,
      0.062,
      undefined,
      0.028,
    );
    deer.cut(
      [
        [0.15, 0.85],
        [0.25, 0.85],
        [0.2, 0.58],
        [0.09, 0.6],
      ],
      '#b06156',
      0,
      0,
      0.076,
      undefined,
      0.024,
    );
    deer.rect(0.29, 0.024, '#efd9b3', 0.31, 0.87, 0.092, undefined, 0.01);

    // Deer head facing right with leaf-shaped ears and antlers.
    const headShape = this.shape(s => {
      s.moveTo(-0.22, -0.05);
      s.bezierCurveTo(-0.24, 0.17, -0.05, 0.25, 0.14, 0.18);
      s.bezierCurveTo(0.28, 0.12, 0.37, 0.01, 0.35, -0.08);
      s.bezierCurveTo(0.32, -0.17, 0.12, -0.18, -0.06, -0.16);
      s.bezierCurveTo(-0.18, -0.15, -0.22, -0.11, -0.22, -0.05);
      s.closePath();
    });
    const head = cut(deer.group, headShape, '#cda482', 0.35, 1.12, 0.055, 0.044);

    // Soft cream muzzle patch and rosy button nose.
    const muzzle = this.shape(s => {
      s.moveTo(0.11, -0.13);
      s.quadraticCurveTo(0.34, -0.15, 0.34, -0.04);
      s.quadraticCurveTo(0.24, 0.02, 0.11, -0.04);
      s.closePath();
    });
    cut(head, muzzle, CREAM, 0, 0, 0.044, 0.016);
    oval(head, 0.09, 0.075, '#4b3f39', 0.33, -0.03, 0.062, 0.022);
    oval(head, 0.07, 0.045, BLUSH, 0.1, -0.05, 0.052, 0.012);
    this.eye(head, 0.04, 0.045, 0.056, 0.042);

    // Expressive leaf-shaped ears.
    const leftEar = this.shape(s => {
      s.moveTo(-0.14, 0.14);
      s.quadraticCurveTo(-0.38, 0.32, -0.34, 0.42);
      s.quadraticCurveTo(-0.16, 0.4, -0.06, 0.2);
      s.closePath();
    });
    const ear = new THREE.Group();
    ear.position.set(-0.14, 0.14, 0);
    head.add(ear);
    cut(ear, leftEar, '#b88f70', 0.14, -0.14, -0.015, 0.028);
    const leftEarIn = this.shape(s => {
      s.moveTo(-0.14, 0.18);
      s.quadraticCurveTo(-0.29, 0.3, -0.28, 0.36);
      s.quadraticCurveTo(-0.17, 0.34, -0.1, 0.22);
      s.closePath();
    });
    cut(ear, leftEarIn, '#e3bfb0', 0.14, -0.14, 0.014, 0.012);

    const rightEar = this.shape(s => {
      s.moveTo(0.02, 0.18);
      s.quadraticCurveTo(0.14, 0.38, 0.25, 0.38);
      s.quadraticCurveTo(0.24, 0.23, 0.1, 0.15);
      s.closePath();
    });
    cut(head, rightEar, '#b88f70', 0, 0, -0.022, 0.026);

    // Delicate branched antlers.
    stroke(
      head,
      [
        [-0.08, 0.19],
        [-0.16, 0.46],
        [-0.26, 0.62],
      ],
      '#7d6756',
      0.032,
      -0.01,
    );
    stroke(
      head,
      [
        [-0.14, 0.41],
        [-0.04, 0.56],
      ],
      '#7d6756',
      0.026,
      -0.01,
    );
    stroke(
      head,
      [
        [0.03, 0.19],
        [0.1, 0.47],
        [0.22, 0.63],
      ],
      '#7d6756',
      0.032,
      0.01,
    );
    stroke(
      head,
      [
        [0.09, 0.41],
        [0.01, 0.57],
      ],
      '#7d6756',
      0.026,
      0.01,
    );

    this.animate(head, 'still', 'deer', 0.62);
    this.animate(ear, 'deer-ear', 'deer');
  }
}
