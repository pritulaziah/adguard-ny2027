import type { PaperDetail } from '../paper-detail';
import type { SceneryContext } from '../scene-context';
import { seeded, shapeFrom } from './palette';

const shrubGreens = ['#7d9063', '#788c5e', '#81966b'];

/** One green paper crown with red berries among the foliage. */
export function addAutumnShrub(ctx: SceneryContext, x: number, z: number, seed: number, scale = 1): void {
  const rng = seeded(seed);
  const shrub = ctx.detail('autumn-berry-shrub', x, z, scale);
  shrub.group.scale.x *= 0.8 + rng() * 0.2;
  shrub.group.scale.y *= 0.76 + rng() * 0.24;
  shrub.group.updateMatrix();
  const green = shrubGreens[Math.floor(rng() * shrubGreens.length)];
  const tilt = (rng() - 0.5) * 0.14;
  const crown = shapeFrom(s => {
    s.moveTo(-0.8, 0.02);
    s.quadraticCurveTo(-0.87, 0.24, -0.63, 0.35);
    s.quadraticCurveTo(-0.7, 0.62 + tilt, -0.4, 0.59 + tilt);
    s.quadraticCurveTo(-0.26, 0.9, -0.02, 0.67);
    s.quadraticCurveTo(0.19, 0.86 - tilt, 0.36, 0.63 - tilt);
    s.quadraticCurveTo(0.66, 0.72 - tilt, 0.65, 0.44);
    s.quadraticCurveTo(0.94, 0.3, 0.77, 0.04);
    s.quadraticCurveTo(0.02, -0.02, -0.8, 0.02);
    s.closePath();
  });
  shrub.shape(crown, green, 0, 0, 0, undefined, 0.035);

  const berries: Array<[number, number]> = [
    [-0.54, 0.32],
    [-0.28, 0.58],
    [0.16, 0.54],
    [0.48, 0.32],
    [-0.04, 0.23],
  ];
  berries.forEach(([x, y], index) => {
    const berryX = x + (rng() - 0.5) * 0.06;
    const berryY = y + (rng() - 0.5) * 0.05;
    for (const [dx, dy] of [
      [-0.04, 0.016],
      [0.027, 0.035],
      [0.002, -0.037],
    ]) {
      shrub.oval(0.07, 0.073, index % 2 ? '#af493f' : '#c05a47', berryX + dx, berryY + dy, 0.04, undefined, 0.022);
      shrub.oval(0.018, 0.015, '#e8a084', berryX + dx - 0.009, berryY + dy + 0.013, 0.066, undefined, 0.009);
    }
  });
}

function addFern(detail: PaperDetail, x: number, height: number, spread: number): void {
  const fronds: Array<[number, number]> = [
    [-0.32 * spread, height * 0.7],
    [-0.14 * spread, height],
    [0.16 * spread, height * 0.88],
  ];
  fronds.forEach(([reach, top], index) => {
    detail.stroke(
      [
        [x, 0.015],
        [x + reach * 0.35, top * 0.58],
        [x + reach, top],
      ],
      '#7b8354',
      0.014,
      0.045,
    );
    for (let pair = 0; pair < 5; pair++) {
      const t = 0.3 + pair * 0.13;
      const px = x + reach * t * t;
      const py = top * t;
      const width = (1 - t) * 0.18 + 0.025;
      for (const side of [-1, 1]) {
        detail.cut(
          [
            [px, py - 0.025],
            [px + side * width, py + 0.045],
            [px + side * width * 0.6, py + 0.07],
            [px, py + 0.018],
          ],
          (pair + index) % 2 ? '#a1a36c' : '#8c9866',
          0,
          0,
          0.065 + index * 0.008,
          undefined,
          0.014,
        );
      }
    }
  });
}

/** Small groups of grass, fern fronds, and mushrooms share one static mesh. */
export function addAutumnFloor(ctx: SceneryContext, x: number, z: number, seed: number, scale = 1): void {
  const rng = seeded(seed);
  const floor = ctx.detail('autumn-forest-floor', x, z, scale);
  floor.group.scale.x *= 0.86 + rng() * 0.14;
  floor.group.scale.y *= 0.84 + rng() * 0.16;
  floor.group.updateMatrix();
  const variant = rng();
  const hasMushrooms = variant > 0.45;
  const hasFern = variant < 0.78;
  if (hasFern) addFern(floor, -0.2, 0.4 + rng() * 0.16, 0.82 + rng() * 0.34);

  const blades = 4 + Math.floor(rng() * 3);
  const grassX = hasFern ? 0.3 : -0.3;
  for (let blade = 0; blade < blades; blade++) {
    const gx = grassX + (blade - 2.5) * 0.036;
    const height = 0.2 + rng() * 0.3;
    const lean = (blade - 2.5) * 0.055;
    const grass = shapeFrom(s => {
      s.moveTo(gx - 0.014, 0);
      s.quadraticCurveTo(gx - 0.015, height * 0.6, gx + lean, height);
      s.quadraticCurveTo(gx + 0.03, height * 0.56, gx + 0.016, 0);
      s.closePath();
    });
    floor.shape(grass, blade % 2 ? '#bca168' : '#8f9866', 0, 0, 0.01 + blade * 0.008, undefined, 0.015);
    if (blade % 2 === 0) {
      floor.oval(0.038, 0.095, '#d3b87b', gx + lean, height - 0.015, 0.07, [0, 0, -lean * 2], 0.014);
    }
  }

  if (!hasMushrooms) return;
  const mushroomShift = hasFern ? 0 : 0.16;
  const mushrooms: Array<[number, number, number, string]> = [
    [-0.08 + mushroomShift, 0.015, 0.8 + rng() * 0.28, '#b27d53'],
    [0.14 + mushroomShift, 0, 0.55 + rng() * 0.28, '#cfaa68'],
  ];
  if (rng() > 0.55) mushrooms.push([-0.28 + mushroomShift, 0, 0.45 + rng() * 0.2, '#a36d50']);
  mushrooms.forEach(([mx, my, size, color], index) => {
    const stemHeight = 0.21 * size;
    const width = 0.29 * size;
    const lean = (rng() - 0.5) * 0.035;
    const stem = shapeFrom(s => {
      s.moveTo(-0.032 * size, 0);
      s.quadraticCurveTo(lean - 0.024 * size, stemHeight * 0.6, lean - 0.025 * size, stemHeight);
      s.lineTo(lean + 0.024 * size, stemHeight);
      s.quadraticCurveTo(lean + 0.024 * size, stemHeight * 0.45, 0.042 * size, 0);
      s.closePath();
    });
    const layer = 0.12 + index * 0.035;
    floor.shape(stem, '#ead8b7', mx, my, layer, undefined, 0.02);
    const cap = shapeFrom(s => {
      s.moveTo(-width * 0.5, 0);
      s.bezierCurveTo(-width * 0.42, width * 0.6, width * 0.32, width * 0.67, width * 0.5, 0);
      s.quadraticCurveTo(0, -width * 0.09, -width * 0.5, 0);
      s.closePath();
    });
    floor.oval(width, 0.04 * size, '#ead3a7', mx + lean, my + stemHeight, layer + 0.022, undefined, 0.018);
    floor.shape(cap, color, mx + lean, my + stemHeight + 0.009 * size, layer + 0.037, undefined, 0.025);
    floor.oval(
      0.058 * size,
      0.027 * size,
      '#dec08b',
      mx + lean - width * 0.15,
      my + stemHeight + width * 0.3,
      layer + 0.065,
      [0, 0, 0.35],
      0.008,
    );
  });
}
