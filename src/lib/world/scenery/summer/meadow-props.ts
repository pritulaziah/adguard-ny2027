import { stopX } from '../../route';
import type { SceneryContext } from '../../scene-context';
import { seeded, shapeFrom } from '../palette';

function addWoodenFence(ctx: SceneryContext, startX: number, endX: number, z: number): void {
  const span = endX - startX;
  const center = (startX + endX) / 2;
  const fence = ctx.detail('summer-wooden-fence', center, z);
  const postCount = Math.max(3, Math.round(span / 0.92) + 1);
  const step = span / (postCount - 1);

  // Two rustic split rails spanning between posts.
  for (const [ry, col] of [
    [0.26, '#a5845c'],
    [0.54, '#b59469'],
  ] as const) {
    fence.rect(span + 0.14, 0.068, col, 0, ry, -0.015, undefined, 0.022);
  }

  for (let i = 0; i < postCount; i++) {
    const px = -span / 2 + i * step;
    const tilt = ((i % 3) - 1) * 0.03;
    const height = 0.72 + (i % 2) * 0.06;
    fence.rect(0.088, height, i % 2 ? '#8f6f4b' : '#9c7b55', px, 0, 0.015, [0, 0, tilt], 0.032);
  }
}

function addHayBale(ctx: SceneryContext, x: number, z: number, scale = 1): void {
  const bale = ctx.detail('summer-hay-bale', x, z, scale);
  // Warm ground shadow beneath the bale.
  bale.oval(1.16, 0.22, '#9e8f5e', 0, 0.04, -0.08, undefined, 0.016);
  // Rolled hay drum back edge for cozy paper depth.
  bale.oval(0.96, 0.92, '#c49d4d', -0.08, 0.48, -0.04, undefined, 0.055);
  // Main sunlit hay drum face.
  bale.oval(0.94, 0.9, '#dfc06e', 0.03, 0.48, 0.02, undefined, 0.044);
  // Concentric rolled straw rings.
  bale.oval(0.68, 0.65, '#cfa957', 0.04, 0.48, 0.058, undefined, 0.018);
  bale.oval(0.45, 0.43, '#e7cb7b', 0.04, 0.48, 0.072, undefined, 0.016);
  bale.oval(0.22, 0.21, '#b89045', 0.04, 0.48, 0.086, undefined, 0.014);
  // Two dark straw twine straps across the drum.
  bale.rect(0.032, 0.84, '#926b39', -0.22, 0.07, 0.095, [0, 0, 0.14], 0.014);
  bale.rect(0.032, 0.84, '#926b39', 0.26, 0.07, 0.095, [0, 0, -0.14], 0.014);
  // Loose golden hay wisps tucked around the base.
  for (const [wx, wy, rot] of [
    [-0.44, 0.09, -0.45],
    [0.42, 0.08, 0.5],
    [-0.15, 0.06, 0.2],
  ]) {
    bale.rect(0.22, 0.028, '#e8ce81', wx, wy, 0.105, [0, 0, rot], 0.012);
  }
}

function addSunflowerCluster(ctx: SceneryContext, x: number, z: number, seedVal: number): void {
  const rng = seeded(seedVal);
  const cluster = ctx.detail('summer-meadow-cluster', x, z);

  // Tall warm sunlit summer grass blades.
  for (let g = 0; g < 5; g++) {
    const gx = (rng() - 0.5) * 0.62;
    const gh = 0.26 + rng() * 0.22;
    const lean = (rng() - 0.5) * 0.16;
    cluster.cut(
      [
        [gx - 0.024, 0],
        [gx + lean, gh],
        [gx + 0.024, 0],
      ],
      g % 2 ? '#a5b563' : '#8da35b',
      0,
      0,
      -0.02 + g * 0.006,
      undefined,
      0.016,
    );
  }

  // One tall paper sunflower plus one or two poppies / chamomile blooms.
  const sunH = 0.66 + rng() * 0.28;
  const sunX = (rng() - 0.5) * 0.18;
  cluster.rect(0.03, sunH, '#6f8e54', sunX, 0, 0.018, undefined, 0.018);
  const leaf = shapeFrom(s => {
    s.moveTo(0, 0);
    s.quadraticCurveTo(0.11, 0.07, 0.18, 0.02);
    s.quadraticCurveTo(0.1, -0.05, 0, 0);
    s.closePath();
  });
  cluster.shape(leaf, '#7c9c5c', sunX, sunH * 0.42, 0.026, [0, 0, 0.35], 0.014);
  cluster.shape(leaf, '#88a864', sunX, sunH * 0.6, 0.026, [0, Math.PI, 0.3], 0.014);
  for (let p = 0; p < 10; p++) {
    const a = (p / 10) * Math.PI * 2;
    cluster.oval(
      0.07,
      0.13,
      p % 2 ? '#f3c74d' : '#e6b23e',
      sunX + Math.cos(a) * 0.095,
      sunH + Math.sin(a) * 0.095,
      0.032,
      [0, 0, a - Math.PI / 2],
      0.014,
    );
  }
  cluster.oval(0.125, 0.125, '#5d4230', sunX, sunH, 0.048, undefined, 0.016);
  cluster.oval(0.072, 0.072, '#79573f', sunX, sunH, 0.06, undefined, 0.012);

  // Companion field poppy or chamomile.
  const fx = sunX + (sunX > 0 ? -0.24 : 0.24);
  const fh = 0.3 + rng() * 0.16;
  cluster.rect(0.02, fh, '#708f56', fx, 0, 0.044, undefined, 0.014);
  const isPoppy = Math.floor(rng() * 2) === 0;
  for (let p = 0; p < 5; p++) {
    const a = (p / 5) * Math.PI * 2;
    cluster.oval(
      0.068,
      0.095,
      isPoppy ? '#dc6551' : '#f7f0de',
      fx + Math.cos(a) * 0.052,
      fh + Math.sin(a) * 0.052,
      0.055,
      [0, 0, a - Math.PI / 2],
      0.012,
    );
  }
  cluster.oval(0.05, 0.05, isPoppy ? '#48382f' : '#e8bd4c', fx, fh, 0.068, undefined, 0.012);
}

/** Wooden pasture fences, rolled hay bales, sunflowers, and summer meadow flowers. */
export function addSummerMeadowProps(ctx: SceneryContext): void {
  const cx = stopX(4);
  addWoodenFence(ctx, cx - 5.95, cx - 2.15, -1.78);
  addWoodenFence(ctx, cx + 2.15, cx + 5.75, -1.78);

  addHayBale(ctx, cx - 4.75, -1.48, 0.92);
  addHayBale(ctx, cx + 4.45, -1.52, 0.86);

  const spots: Array<[number, number]> = [
    [-5.45, -0.82],
    [-4.1, -0.92],
    [-1.55, -0.78],
    [1.55, -0.8],
    [4.15, -0.86],
    [5.35, -1.18],
  ];
  spots.forEach(([dx, dz], idx) => addSunflowerCluster(ctx, cx + dx, dz, 202607 + idx * 23));
}
