import * as THREE from 'three';
import type { AnimalBuilderContext } from './shared';
import { cut, oval } from '../paper-shapes';
import { addGroundShadow, shapeFrom } from './shared';

function addPaperBee(parent: THREE.Object3D, x: number, y: number, z: number, facing: 1 | -1): THREE.Group {
  const bee = new THREE.Group();
  bee.name = 'paper-bee';
  bee.position.set(x, y, z);
  bee.scale.x = facing;
  parent.add(bee);

  oval(bee, 0.15, 0.1, '#f3ca4d', 0, 0, 0, 0.024);
  for (const sx of [-0.028, 0.022]) {
    cut(
      bee,
      [
        [sx - 0.012, -0.048],
        [sx + 0.012, -0.048],
        [sx + 0.012, 0.048],
        [sx - 0.012, 0.048],
      ],
      '#3f3730',
      0,
      0,
      0.022,
      0.01,
    );
  }
  oval(bee, 0.026, 0.026, '#2f2822', 0.048, 0.012, 0.026, 0.01);
  oval(bee, 0.08, 0.11, '#f7f4e9', -0.01, 0.068, -0.018, 0.01);
  oval(bee, 0.065, 0.095, '#ece8d8', 0.025, 0.062, 0.022, 0.01);
  return bee;
}

/** Cozy countryside wooden beehive on a timber stand with two hovering paper bees. */
export function addBeehive(ctx: AnimalBuilderContext, x: number, z = -1.04): void {
  const stand = ctx.detail('paper-beehive', x, z, 0.96);
  addGroundShadow(stand, 0.92, 0.22, '#9a8e5f');

  // Timber legs and shelf supporting the wooden hive box.
  for (const lx of [-0.28, 0.28]) {
    stand.rect(0.08, 0.28, '#876646', lx, 0.02, -0.01, undefined, 0.032);
  }
  stand.rect(0.74, 0.065, '#9d7955', 0, 0.26, 0.01, undefined, 0.046);

  // Stacked pale-honey wooden hive tiers with subtle shadow seams.
  const tiers: Array<[number, string]> = [
    [0.32, '#e3be63'],
    [0.54, '#ecd077'],
    [0.76, '#e5c368'],
  ];
  for (const [ty, color] of tiers) {
    stand.rect(0.62, 0.2, color, 0, ty, 0.015, undefined, 0.048);
    stand.rect(0.64, 0.022, '#c59c48', 0, ty + 0.19, 0.044, undefined, 0.016);
  }

  // Landing board and dark arched entrance slot.
  stand.rect(0.28, 0.038, '#b58d52', 0, 0.34, 0.058, undefined, 0.028);
  stand.oval(0.16, 0.1, '#4c3a2b', 0, 0.42, 0.056, undefined, 0.018);

  // Decorative side handles and a golden honey-drop emblem on the upper box.
  for (const side of [-1, 1]) {
    stand.rect(0.09, 0.032, '#a78048', side * 0.27, 0.64, 0.055, undefined, 0.018);
  }
  stand.oval(0.09, 0.11, '#d99a3a', 0, 0.84, 0.056, undefined, 0.014);
  stand.oval(0.04, 0.05, '#f6dfa0', -0.015, 0.86, 0.068, undefined, 0.01);

  // Painted sage-green gable roof cap with warm cream trim.
  const roof = cut(
    stand.group,
    shapeFrom(s => {
      s.moveTo(-0.43, 0);
      s.lineTo(0, 0.26);
      s.lineTo(0.43, 0);
      s.lineTo(0.39, -0.055);
      s.lineTo(0, 0.18);
      s.lineTo(-0.39, -0.055);
      s.closePath();
    }),
    '#6a8f6a',
    0,
    0.96,
    0.045,
    0.056,
  );
  cut(
    roof,
    [
      [-0.36, -0.03],
      [0, 0.19],
      [0.36, -0.03],
    ],
    '#7fa37a',
    0,
    0,
    -0.012,
    0.04,
  );

  // Small meadow blooms tucked next to the timber stand.
  for (const [fx, col] of [
    [-0.44, '#f5ecda'],
    [0.45, '#f2c74e'],
  ] as const) {
    stand.rect(0.02, 0.2, '#739459', fx, 0.02, 0.04, undefined, 0.014);
    stand.oval(0.11, 0.11, col, fx, 0.23, 0.052, undefined, 0.014);
    stand.oval(0.05, 0.05, '#d6973e', fx, 0.23, 0.064, undefined, 0.012);
  }

  // Two paper bees hovering lazily near the hive.
  const leftBee = addPaperBee(stand.group, -0.5, 0.92, 0.09, 1);
  const rightBee = addPaperBee(stand.group, 0.48, 0.72, 0.09, -1);

  ctx.animate(roof, 'still', 'beehive', 0.42);
  ctx.animate(leftBee, 'float', 'beehive');
  ctx.animate(rightBee, 'float', 'beehive');
}
