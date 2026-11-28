import * as THREE from 'three';
import type { PaperDetail } from '../paper-detail';

export type TransferVariant = 'winter-spring' | 'spring-summer' | 'summer-autumn' | 'autumn-winter';

const POST = '#665f53';
const FRAME = '#53665b';
const SNOW = '#f7f6ee';
const STEM = '#8fa97f';
const VINE = '#7f9a6d';
const BARE = '#8a7a63';

/** Mirrors a local x value when the hook points the other way. */
type Mirror = (value: number) => number;

interface LanternStyle {
  glass: string;
  dress: (detail: PaperDetail, x: Mirror) => void;
}

/** Snow on the roof and a drift that hides the base plinth. */
function dressSnow(detail: PaperDetail, x: Mirror): void {
  detail.cut(
    [
      [x(0.235), 1.5],
      [x(0.435), 1.5],
      [x(0.405), 1.526],
      [x(0.335), 1.54],
      [x(0.265), 1.526],
    ],
    SNOW,
    0,
    0,
    0.03,
    undefined,
    0.055,
  );
  detail.oval(0.62, 0.08, SNOW, x(-0.06), 0.03, -0.02);
}

const styles: Record<TransferVariant, LanternStyle> = {
  'winter-spring': {
    glass: '#f7e6c4',
    dress(detail, x) {
      dressSnow(detail, x);
      // One snowdrop pushes through the drift.
      detail.stroke(
        [
          [x(0.2), 0.05],
          [x(0.205), 0.15],
          [x(0.2), 0.21],
        ],
        STEM,
        0.012,
        0.02,
      );
      detail.oval(0.045, 0.06, SNOW, x(0.187), 0.205, 0.03);
      detail.oval(0.04, 0.05, '#eef1e4', x(0.219), 0.222, 0.03);
      detail.stroke(
        [
          [x(0.165), 0.05],
          [x(0.115), 0.13],
        ],
        STEM,
        0.012,
        0.02,
      );
    },
  },
  'spring-summer': {
    glass: '#f8ecc9',
    dress(detail, x) {
      const blooms: Array<[number, number]> = [
        [0, 0.56],
        [0.09, 0.73],
        [0.01, 0.93],
      ];
      detail.stroke(
        [
          [x(0.06), 0.35],
          [x(0.02), 0.55],
          [x(0.07), 0.72],
          [x(0.02), 0.9],
          [x(0.04), 1.02],
        ],
        VINE,
        0.022,
        0.055,
      );
      for (const [bx, by] of blooms) {
        detail.oval(0.075, 0.075, '#e9aab2', x(bx), by, 0.06);
        detail.oval(0.028, 0.028, '#c9868f', x(bx), by, 0.076);
      }
      const tufts: Array<[number, number]> = [
        [0.14, 0.2],
        [0.21, 0.16],
        [-0.13, 0.18],
        [-0.2, 0.15],
      ];
      for (const [bx, by] of tufts)
        detail.stroke(
          [
            [x(0.06), 0.02],
            [x(bx), by],
          ],
          VINE,
          0.014,
          0.02,
        );
    },
  },
  'summer-autumn': {
    glass: '#f3c87e',
    dress(detail, x) {
      // A short garland hangs beside the roof.
      detail.stroke(
        [
          [x(0.33), 1.6],
          [x(0.4), 1.64],
          [x(0.45), 1.6],
          [x(0.47), 1.53],
        ],
        '#b98a55',
        0.012,
        0.09,
      );
      detail.mapleLeaf(0.075, '#c9784f', x(0.43), 1.64, 0.1);
      detail.mapleLeaf(0.06, '#b8693f', x(0.472), 1.575, 0.1);
      detail.mapleLeaf(0.055, '#d08a56', x(0.455), 1.5, 0.1);
      // Mushrooms and one fallen leaf ground the post. A cap rests on its stem,
      // and a small z step keeps the two paper layers apart.
      detail.rect(0.03, 0.09, '#efe6cf', x(0.2), 0, 0.06);
      detail.oval(0.11, 0.055, '#c4755f', x(0.2), 0.07, 0.072);
      detail.rect(0.022, 0.06, '#efe6cf', x(0.1), 0, 0.065);
      detail.oval(0.08, 0.04, '#d08a68', x(0.1), 0.048, 0.077);
      // The flat leaf spans its size in z, so keep it clear of the plinth face.
      detail.mapleLeaf(0.06, '#c9784f', x(-0.14), 0.04, 0.09, [Math.PI / 2, 0, 0.4]);
    },
  },
  'autumn-winter': {
    glass: '#cfe4e8',
    dress(detail, x) {
      dressSnow(detail, x);
      // Bare twigs wait for the next spring.
      detail.stroke(
        [
          [x(0.2), 0.04],
          [x(0.23), 0.16],
          [x(0.29), 0.23],
        ],
        BARE,
        0.012,
        0.02,
      );
      detail.stroke(
        [
          [x(0.23), 0.12],
          [x(0.18), 0.19],
        ],
        BARE,
        0.01,
        0.02,
      );
      detail.stroke(
        [
          [x(0.26), 0.19],
          [x(0.31), 0.14],
        ],
        BARE,
        0.01,
        0.02,
      );
    },
  },
};

/**
 * One paper lantern: plinths, tapered post, shepherd's crook, hanger and a
 * paned lantern. `dir` mirrors the hook, so adjacent borders differ.
 */
export function addTransferLantern(detail: PaperDetail, variant: TransferVariant, dir: 1 | -1): void {
  const x: Mirror = value => value * dir;

  detail.rect(0.28, 0.06, '#6b6456', 0, 0, 0);
  detail.rect(0.19, 0.045, '#736c5e', 0, 0.06, 0);
  detail.cut(
    [
      [x(-0.047), 0.105],
      [x(0.047), 0.105],
      [x(0.032), 1.5],
      [x(-0.032), 1.5],
    ],
    POST,
    0,
    0,
    0,
    undefined,
    0.05,
  );
  detail.rect(0.095, 0.03, FRAME, 0, 1.5, 0.005);

  // One curved cutout avoids the overlapping ends of separate stroke segments.
  const crook = new THREE.Shape();
  crook.moveTo(x(-0.016), 1.5);
  crook.lineTo(x(-0.016), 1.57);
  crook.bezierCurveTo(x(-0.016), 1.735, x(0.35), 1.735, x(0.35), 1.605);
  crook.lineTo(x(0.32), 1.605);
  crook.bezierCurveTo(x(0.32), 1.695, x(0.016), 1.695, x(0.016), 1.57);
  crook.lineTo(x(0.016), 1.5);
  crook.closePath();
  detail.shape(crook, FRAME, 0, 0, 0.012, undefined, 0.026);

  detail.rect(0.016, 0.11, FRAME, x(0.335), 1.495, 0.035, undefined, 0.024);

  // Roof, frame, glass, a cross mullion and the bottom finial.
  detail.cut(
    [
      [x(0.2), 1.445],
      [x(0.47), 1.445],
      [x(0.425), 1.5],
      [x(0.245), 1.5],
    ],
    FRAME,
    0,
    0,
    0.02,
    undefined,
    0.06,
  );
  detail.rect(0.22, 0.265, FRAME, x(0.335), 1.18, 0.03, undefined, 0.035);
  detail.rect(0.175, 0.225, styles[variant].glass, x(0.335), 1.2, 0.067, undefined, 0.012);
  detail.rect(0.014, 0.225, FRAME, x(0.335), 1.2, 0.081, undefined, 0.009);
  detail.rect(0.175, 0.012, FRAME, x(0.335), 1.306, 0.081, undefined, 0.009);
  detail.rect(0.21, 0.028, FRAME, x(0.335), 1.152, 0.035, undefined, 0.06);
  detail.oval(0.032, 0.045, FRAME, x(0.335), 1.13, 0.05);

  styles[variant].dress(detail, x);
}
