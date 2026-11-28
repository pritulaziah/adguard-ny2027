import type { AnimalBuilderContext } from './shared';
import { PaperAnimal } from './paper-animal';
import { cut, oval, rect, stroke } from '../paper-shapes';
import { BLUSH, INK } from './shared';

/** Spotted paper dairy cow standing in the summer meadow with a brass bell and twitching ear. */
export class Cow extends PaperAnimal {
  constructor(ctx: AnimalBuilderContext, x: number, z = -1.04) {
    super(ctx, 'paper-cow', x, z, 0.92);
  }

  protected paint(): void {
    const cow = this.detail;
    this.shadow(1.32, 0.24, '#9a8e5f');

    // Swishing rope tail with a dark brown tuft behind the rear haunch.
    const tail = cut(
      cow.group,
      this.shape(s => {
        s.moveTo(0, 0);
        s.quadraticCurveTo(-0.14, -0.08, -0.18, -0.34);
        s.lineTo(-0.12, -0.35);
        s.quadraticCurveTo(-0.08, -0.13, 0.04, -0.04);
        s.closePath();
      }),
      '#e8dfd0',
      -0.5,
      0.72,
      -0.03,
      0.024,
    );
    oval(tail, 0.12, 0.16, '#654d3c', -0.16, -0.38, 0.015, 0.022);

    // Back legs and front legs with dark hooves.
    for (const [lx, shade, lz] of [
      [-0.36, '#ddd3c0', -0.028],
      [0.24, '#ddd3c0', -0.028],
      [-0.24, '#f2ead9', 0.024],
      [0.36, '#f2ead9', 0.024],
    ] as const) {
      cow.rect(0.11, 0.42, shade, lx, 0.05, lz, undefined, 0.028);
      cow.rect(0.12, 0.085, '#4c423a', lx, 0.01, lz + 0.01, undefined, 0.03);
    }

    // Soft pink udder tucked beneath the belly.
    cow.oval(0.24, 0.16, '#e5b1a8', -0.1, 0.36, 0.012, undefined, 0.022);

    // Plump rounded cow torso facing gently right toward the story center.
    const bodyShape = this.shape(s => {
      s.moveTo(-0.48, 0.44);
      s.bezierCurveTo(-0.56, 0.72, -0.44, 0.98, -0.12, 0.98);
      s.lineTo(0.32, 0.96);
      s.bezierCurveTo(0.54, 0.94, 0.58, 0.68, 0.48, 0.44);
      s.quadraticCurveTo(0.02, 0.36, -0.48, 0.44);
      s.closePath();
    });
    cow.shape(bodyShape, '#f5eee0', 0, 0, 0, undefined, 0.052);

    // Warm brown dairy spots across the back and flank.
    cow.oval(0.34, 0.28, '#6b513e', -0.22, 0.8, 0.044, [0, 0, 0.25], 0.016);
    cow.oval(0.26, 0.22, '#6b513e', 0.16, 0.62, 0.044, [0, 0, -0.3], 0.016);
    cow.oval(0.18, 0.15, '#7c604a', -0.34, 0.56, 0.042, [0, 0, -0.2], 0.014);

    // Leather neck strap and hanging brass bell.
    cow.rect(0.1, 0.34, '#a66544', 0.41, 0.6, 0.048, [0, 0, -0.28], 0.02);
    const bell = cow.child('cow-bell', 0.46, 0.58, 0.068);
    bell.shape(
      this.shape(s => {
        s.moveTo(-0.045, 0.02);
        s.lineTo(0.045, 0.02);
        s.lineTo(0.08, -0.13);
        s.lineTo(-0.08, -0.13);
        s.closePath();
      }),
      '#e4b956',
      0,
      0,
      0,
      undefined,
      0.022,
    );
    bell.oval(0.05, 0.05, '#b88c34', 0, -0.145, 0.01, undefined, 0.016);

    // Friendly cow head with warm cream horns, floppy ear, and pink muzzle.
    const head = cut(
      cow.group,
      this.shape(s => {
        s.moveTo(0, 0.24);
        s.bezierCurveTo(0.2, 0.24, 0.27, 0.08, 0.25, -0.1);
        s.bezierCurveTo(0.22, -0.24, 0.1, -0.28, 0, -0.28);
        s.bezierCurveTo(-0.12, -0.28, -0.24, -0.22, -0.26, -0.08);
        s.bezierCurveTo(-0.28, 0.1, -0.18, 0.24, 0, 0.24);
        s.closePath();
      }),
      '#f6efe2',
      0.58,
      0.96,
      0.075,
      0.048,
    );

    // Forehead spot and two small curved cream horns.
    oval(head, 0.24, 0.18, '#6b513e', -0.09, 0.12, 0.044, 0.014);
    for (const side of [-1, 1]) {
      cut(
        head,
        this.shape(s => {
          s.moveTo(0, 0);
          s.quadraticCurveTo(side * 0.07, 0.1, side * 0.03, 0.17);
          s.quadraticCurveTo(side * -0.02, 0.12, side * -0.05, 0.02);
          s.closePath();
        }),
        '#ded1b4',
        side * 0.13,
        0.2,
        -0.015,
        0.024,
      );
    }

    // Left and right floppy ears (right ear twitches).
    const earShape = this.shape(s => {
      s.moveTo(0, 0.04);
      s.bezierCurveTo(0.12, 0.09, 0.26, 0.04, 0.28, -0.04);
      s.bezierCurveTo(0.22, -0.12, 0.08, -0.09, 0, -0.02);
      s.closePath();
    });
    const leftEar = cut(head, earShape, '#6b513e', -0.19, 0.11, -0.02, 0.024);
    leftEar.scale.x = -1;
    leftEar.rotation.z = 0.22;
    const rightEar = cut(head, earShape, '#ede4d3', 0.19, 0.11, -0.015, 0.024);
    rightEar.rotation.z = -0.18;
    oval(rightEar, 0.15, 0.065, '#e8b5aa', 0.13, -0.01, 0.022, 0.012);

    // Soft pink snout, nostrils, blush, gentle smile, and sparkle eyes.
    oval(head, 0.36, 0.22, '#ebb9ad', 0.02, -0.15, 0.052, 0.022);
    oval(head, 0.052, 0.036, '#875c55', -0.07, -0.14, 0.072, 0.012);
    oval(head, 0.052, 0.036, '#875c55', 0.11, -0.14, 0.072, 0.012);
    oval(head, 0.085, 0.05, BLUSH, -0.15, -0.04, 0.052, 0.012);
    oval(head, 0.085, 0.05, BLUSH, 0.17, -0.04, 0.052, 0.012);
    this.eye(head, -0.09, 0.05, 0.056, 0.046);
    this.eye(head, 0.11, 0.05, 0.056, 0.046);
    stroke(
      head,
      [
        [-0.04, -0.2],
        [0.02, -0.22],
        [0.08, -0.2],
      ],
      INK,
      0.011,
      0.074,
    );
    rect(head, 0.04, 0.02, '#6b513e', -0.02, 0.24, 0.04, 0.014);

    this.animate(head, 'still', 'cow', 0.5);
    this.animate(rightEar, 'deer-ear', 'cow');
    this.animate(tail, 'cat-tail', 'cow');
  }
}
