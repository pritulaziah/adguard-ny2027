import type { SceneryContext } from '../scene-context';
import { FINALE_TREE_X } from '../finale';
import { drawGift } from './gift';
import { shapeFrom } from './palette';

/** One decorated paper tree anchors the destination and its gift boxes. */
export function addFinaleTree(ctx: SceneryContext): void {
  const tree = ctx.detail('paper-finale-tree', FINALE_TREE_X, -2.45);
  tree.rect(0.2, 0.68, '#94735c', 0, 0, -0.04);
  const tiers = [
    [0.3, 2.6, 1.4],
    [0.95, 2.08, 1.3],
    [1.6, 1.57, 1.18],
    [2.23, 1.02, 1.1],
  ];
  tiers.forEach(([bottom, width, height], index) => {
    const crown = shapeFrom(s => {
      s.moveTo(0, bottom + height);
      s.quadraticCurveTo(-width * 0.16, bottom + height * 0.52, -width * 0.5, bottom + 0.06);
      s.quadraticCurveTo(-width * 0.3, bottom - 0.035, -width * 0.12, bottom + 0.055);
      s.quadraticCurveTo(width * 0.13, bottom - 0.035, width * 0.24, bottom + 0.055);
      s.quadraticCurveTo(width * 0.4, bottom - 0.015, width * 0.5, bottom + 0.06);
      s.quadraticCurveTo(width * 0.17, bottom + height * 0.53, 0, bottom + height);
      s.closePath();
    });
    const z = index * 0.045;
    tree.shape(crown, ['#658772', '#71937a', '#7b9e7e', '#88a887'][index], 0, 0, z);
    tree.shape(
      shapeFrom(s => {
        s.moveTo(0, bottom + height);
        s.quadraticCurveTo(width * 0.17, bottom + height * 0.53, width * 0.5, bottom + 0.06);
        s.quadraticCurveTo(width * 0.2, bottom - 0.02, 0.03, bottom + 0.055);
        s.closePath();
      }),
      '#567a64',
      0,
      0,
      z + 0.047,
      undefined,
      0.02,
    );
  });

  // Three loose paper garlands follow the branches.
  for (const [y, width] of [
    [0.69, 1.85],
    [1.39, 1.32],
    [2.07, 0.9],
  ]) {
    const points: Array<[number, number]> = [];
    for (let i = 0; i <= 8; i++) {
      const x = (i / 8 - 0.5) * width;
      points.push([x, y - 0.15 * Math.sin((i / 8) * Math.PI)]);
    }
    tree.stroke(points, '#e0c68c', 0.025, 0.24);
  }
  const ornaments: Array<[number, number, number]> = [
    [-0.9, 0.57, 0.095],
    [0.76, 0.63, 0.1],
    [-0.36, 0.42, 0.085],
    [0.35, 0.85, 0.09],
    [-0.63, 1.23, 0.09],
    [0.54, 1.3, 0.085],
    [-0.05, 1.54, 0.1],
    [-0.35, 1.98, 0.08],
    [0.32, 2.05, 0.08],
    [-0.03, 2.5, 0.075],
  ];
  ornaments.forEach(([x, y, radius], index) => {
    tree.rect(0.018, 0.065, '#d0ba86', x, y + radius * 0.7, 0.26, undefined, 0.012);
    tree.oval(radius * 2, radius * 2.2, ['#dba887', '#e4c17f', '#b2c6b7'][index % 3], x, y, 0.29, undefined, 0.025);
    tree.oval(radius * 0.45, radius * 0.5, '#f3e5bd', x - radius * 0.3, y + radius * 0.3, 0.32, undefined, 0.01);
  });
  tree.star(0.28, '#b99958', 0, 3.5, 0.2);
  tree.star(0.23, '#f0d598', 0, 3.52, 0.25);

  for (const { dx, width, height, ...colors } of [
    {
      dx: -2.42,
      width: 0.62,
      height: 0.4,
      paper: '#bd796d',
      lid: '#d08d7b',
      fold: '#a66660',
      ribbon: '#f1dfb5',
      ribbonFold: '#c6b087',
    },
    {
      dx: -0.73,
      width: 0.48,
      height: 0.32,
      paper: '#d7bd85',
      lid: '#e7cf98',
      fold: '#bb9c68',
      ribbon: '#6f967e',
      ribbonFold: '#51765f',
    },
    {
      dx: 0.78,
      width: 0.56,
      height: 0.36,
      paper: '#8ca9ad',
      lid: '#a9c0c3',
      fold: '#708f99',
      ribbon: '#c98678',
      ribbonFold: '#a46961',
    },
    {
      dx: 2.38,
      width: 0.48,
      height: 0.46,
      paper: '#7e9e87',
      lid: '#95b399',
      fold: '#64836f',
      ribbon: '#edd59d',
      ribbonFold: '#c1a579',
    },
  ]) {
    const gift = ctx.detail('paper-finale-gift', FINALE_TREE_X + dx, -0.62);
    drawGift(gift, width, height, colors);
  }
}
