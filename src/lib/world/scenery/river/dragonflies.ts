import * as THREE from 'three';
import { cut, oval } from '../../paper-shapes';
import { stopX } from '../../route';
import type { SceneryContext } from '../../scene-context';
import { shapeFrom } from '../palette';

const ABDOMEN = shapeFrom(s => {
  s.moveTo(0.03, 0.022);
  s.quadraticCurveTo(-0.14, 0.006, -0.34, -0.048);
  s.quadraticCurveTo(-0.355, -0.056, -0.33, -0.064);
  s.quadraticCurveTo(-0.14, -0.024, 0.03, -0.02);
  s.closePath();
});

const FOREWING = shapeFrom(s => {
  s.moveTo(0, 0);
  s.bezierCurveTo(-0.04, 0.14, -0.14, 0.28, -0.26, 0.3);
  s.quadraticCurveTo(-0.31, 0.29, -0.29, 0.24);
  s.bezierCurveTo(-0.22, 0.14, -0.1, 0.05, 0, -0.01);
  s.closePath();
});

const HINDWING = shapeFrom(s => {
  s.moveTo(0, 0);
  s.bezierCurveTo(-0.08, 0.11, -0.2, 0.2, -0.32, 0.19);
  s.quadraticCurveTo(-0.36, 0.17, -0.33, 0.12);
  s.bezierCurveTo(-0.24, 0.05, -0.11, 0.01, 0, -0.015);
  s.closePath();
});

const STRIPES: Array<[number, number, number]> = [
  [-0.08, -0.006, 0.03],
  [-0.17, -0.022, 0.025],
  [-0.255, -0.039, 0.02],
];

/** Side-profile copper paper dragonflies hovering near the river reeds and lily pads. */
export function addRiverDragonflies(ctx: SceneryContext): void {
  for (const [dx, y, z, size] of [
    [-3.7, 1.05, -0.6, 0.54],
    [3.3, 1.18, -0.68, 0.58],
    [3.0, 0.78, 0.52, 0.48],
  ]) {
    const insect = ctx.place('river-dragonfly', stopX(4) + dx, z, size, y);

    // Every body layer is centred on z = 0 so both flight directions show the same details.
    cut(insect, ABDOMEN, '#b9744d', 0, 0, -0.012, 0.024);
    for (const [sx, sy, height] of STRIPES) {
      cut(
        insect,
        [
          [sx - 0.008, sy + height / 2],
          [sx + 0.008, sy + height / 2],
          [sx + 0.012, sy - height / 2],
          [sx - 0.004, sy - height / 2],
        ],
        '#f1e5c6',
        0,
        0,
        -0.015,
        0.03,
      );
    }
    oval(insect, 0.13, 0.092, '#cc8c5a', 0.06, 0.005, -0.018, 0.036);
    oval(insect, 0.074, 0.072, '#a86544', 0.145, 0.02, -0.02, 0.04);
    oval(insect, 0.038, 0.04, '#394c42', 0.158, 0.026, -0.024, 0.048);
    oval(insect, 0.014, 0.015, '#faf3dd', 0.165, 0.033, -0.027, 0.054);

    for (const side of [-1, 1]) {
      for (const pair of [-1, 1]) {
        const wing = new THREE.Group();
        wing.name = 'dragonfly-wing';
        const fore = pair > 0;
        wing.position.set(fore ? 0.06 : 0.025, fore ? 0.035 : 0.028, side * (fore ? 0.036 : 0.024));
        wing.rotation.z = side * 0.08;
        wing.userData.wingSide = side;
        wing.userData.wingPair = pair;
        insect.add(wing);

        cut(wing, fore ? FOREWING : HINDWING, fore ? '#f4ead4' : '#dfe7ce', 0, 0, -0.004, 0.008);
        const veinTip = fore ? [-0.23, 0.25] : [-0.28, 0.15];
        cut(
          wing,
          [
            [-0.015, 0.02],
            [-0.005, 0.012],
            [veinTip[0] + 0.006, veinTip[1] - 0.006],
            [veinTip[0], veinTip[1]],
          ],
          fore ? '#c4c5ab' : '#b2bea8',
          0,
          0,
          -0.005,
          0.01,
        );
        ctx.animate(wing, 'dragonfly-wing');
      }
    }

    ctx.animate(insect, 'dragonfly');
  }
}
