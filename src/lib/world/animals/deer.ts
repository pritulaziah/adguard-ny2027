import * as THREE from 'three';
import type { AnimalBuilderContext } from './shared';
import { PaperAnimal } from './paper-animal';
import { cut, oval, stroke } from '../paper-shapes';
import { BLUSH, CREAM } from './shared';

/** Graceful winter fawn in 3/4 side profile with branched antlers. */
export class Deer extends PaperAnimal {
  constructor(ctx: AnimalBuilderContext, x: number, z = -1.08) {
    super(ctx, 'paper-deer', x, z, 0.96);
  }

  protected paint(): void {
    const deer = this.detail;
    this.shadow(1.06, 0.24, '#849099');

    // Far and near legs tucked behind the rounded torso, with dark hooves.
    for (const [lx, shade, hoof, lz] of [
      [-0.3, '#9e7c64', '#564a43', -0.026],
      [0.14, '#9e7c64', '#564a43', -0.026],
      [-0.19, '#b58d6f', '#4b403a', 0.012],
      [0.25, '#b58d6f', '#4b403a', 0.012],
    ] as const) {
      deer.rect(0.084, 0.43, shade, lx, 0.05, lz, undefined, 0.026);
      deer.rect(0.092, 0.072, hoof, lx, 0.01, lz + 0.008, undefined, 0.028);
    }

    // Rounded fawn body and curved neck rising cleanly above the four legs.
    const body = this.shape(s => {
      s.moveTo(-0.46, 0.64);
      s.bezierCurveTo(-0.48, 0.42, -0.22, 0.38, 0.14, 0.41);
      s.bezierCurveTo(0.42, 0.44, 0.44, 0.62, 0.42, 0.96);
      s.bezierCurveTo(0.41, 1.07, 0.26, 1.08, 0.22, 0.98);
      s.bezierCurveTo(0.18, 0.84, 0.08, 0.8, -0.14, 0.81);
      s.bezierCurveTo(-0.34, 0.82, -0.45, 0.76, -0.46, 0.64);
      s.closePath();
    });
    deer.shape(body, '#c29978', 0, 0, 0, undefined, 0.044);

    // Soft cream underbelly and upturned white tail tuft.
    const belly = this.shape(s => {
      s.moveTo(-0.24, 0.44);
      s.quadraticCurveTo(-0.01, 0.405, 0.22, 0.45);
      s.quadraticCurveTo(0, 0.535, -0.24, 0.44);
      s.closePath();
    });
    deer.shape(belly, '#eadbc2', 0, 0, 0.04, undefined, 0.012);

    const tail = this.shape(s => {
      s.moveTo(-0.42, 0.68);
      s.quadraticCurveTo(-0.62, 0.78, -0.55, 0.92);
      s.quadraticCurveTo(-0.44, 0.88, -0.4, 0.73);
      s.closePath();
    });
    deer.shape(tail, CREAM, 0, 0, -0.02, undefined, 0.03);

    // Delicate fawn spots on the back.
    const spots: Array<[number, number, number]> = [
      [-0.24, 0.72, 0.065],
      [-0.11, 0.74, 0.075],
      [0.02, 0.69, 0.06],
      [-0.17, 0.62, 0.055],
      [-0.03, 0.6, 0.062],
    ];
    for (const [sx, sy, sr] of spots) deer.oval(sr * 1.15, sr, '#f3e7ce', sx, sy, 0.052, undefined, 0.012);

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
