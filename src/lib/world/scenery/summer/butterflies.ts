import * as THREE from 'three';
import { cut, oval } from '../../paper-shapes';
import { stopX } from '../../route';
import type { SceneryContext } from '../../scene-context';
import { shapeFrom } from '../palette';

const FOREWING = shapeFrom(s => {
  s.moveTo(0, 0);
  s.bezierCurveTo(0.05, 0.14, -0.02, 0.29, -0.17, 0.31);
  s.quadraticCurveTo(-0.27, 0.3, -0.25, 0.19);
  s.bezierCurveTo(-0.21, 0.08, -0.1, 0.02, 0, -0.01);
  s.closePath();
});

const HINDWING = shapeFrom(s => {
  s.moveTo(0, 0);
  s.bezierCurveTo(-0.07, 0.09, -0.2, 0.15, -0.28, 0.11);
  s.quadraticCurveTo(-0.32, 0.05, -0.24, -0.04);
  s.bezierCurveTo(-0.15, -0.09, -0.06, -0.05, 0, -0.015);
  s.closePath();
});

const BODY = shapeFrom(s => {
  s.moveTo(0.08, 0.02);
  s.quadraticCurveTo(-0.05, 0.015, -0.2, -0.02);
  s.quadraticCurveTo(-0.21, -0.038, -0.18, -0.042);
  s.quadraticCurveTo(-0.04, -0.02, 0.08, -0.014);
  s.closePath();
});

interface ButterflySpec {
  dx: number;
  y: number;
  z: number;
  size: number;
  fore: string;
  hind: string;
  spot: string;
}

const SPECS: ButterflySpec[] = [
  { dx: -3.7, y: 1.15, z: -0.64, size: 0.54, fore: '#f4cf5c', hind: '#e8b343', spot: '#fff5d1' },
  { dx: 3.35, y: 1.24, z: -0.7, size: 0.56, fore: '#e89060', hind: '#d9764a', spot: '#f9e3be' },
  { dx: 3.1, y: 0.84, z: 0.58, size: 0.48, fore: '#f6d86e', hind: '#e6bc4a', spot: '#fff7d8' },
];

/** Warm paper butterflies fluttering above the summer sunflowers, clear of the road and story. */
export function addSummerButterflies(ctx: SceneryContext): void {
  for (const spec of SPECS) {
    const insect = ctx.place('summer-butterfly', stopX(4) + spec.dx, spec.z, spec.size, spec.y);

    // Every body layer is centred on z = 0 so both flight directions show the same details.
    cut(insect, BODY, '#534337', 0, 0, -0.012, 0.024);
    oval(insect, 0.072, 0.062, '#624e3f', 0.085, 0.008, -0.016, 0.032);
    oval(insect, 0.025, 0.025, '#2f2924', 0.105, 0.014, -0.02, 0.04);

    for (const side of [-1, 1]) {
      for (const pair of [-1, 1]) {
        const wing = new THREE.Group();
        wing.name = 'summer-butterfly-wing';
        const fore = pair > 0;
        wing.position.set(fore ? 0.045 : 0.015, fore ? 0.032 : 0.02, side * (fore ? 0.032 : 0.022));
        wing.rotation.z = side * 0.08;
        wing.userData.wingSide = side;
        wing.userData.wingPair = pair;
        insect.add(wing);

        cut(wing, fore ? FOREWING : HINDWING, fore ? spec.fore : spec.hind, 0, 0, -0.004, 0.008);
        oval(
          wing,
          fore ? 0.07 : 0.055,
          fore ? 0.055 : 0.045,
          spec.spot,
          fore ? -0.14 : -0.18,
          fore ? 0.19 : 0.05,
          -0.005,
          0.01,
        );
        ctx.animate(wing, 'dragonfly-wing');
      }
    }

    ctx.animate(insect, 'dragonfly');
  }
}
