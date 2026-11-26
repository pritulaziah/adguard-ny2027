import { stopX } from '../route';
import { SEASON_BORDERS } from '../seasons';
import type { SceneryContext } from '../scene-context';
import { addAutumnFloor } from './autumn-plants';
import { shapeFrom } from './palette';

/** Grounded foreground bottom-edge foliage/snowbanks (z = +1.15, 1.24x speed). */
export async function addForegroundFraming(ctx: SceneryContext, pause: () => Promise<void>): Promise<void> {
  const fg = (name: string, x: number, y: number, z: number, scale = 1) =>
    ctx.detail(name, x, z, scale, y);

  // --- 1. Grounded bottom-edge foreground details (rooted at y = 0.26, below vehicle wheels) ---
  // Winter start & finale: crisp folded-paper snowdrifts + tiny foreground pine tips.
  const snowBanks = [
    -4.2, -0.8, 3.6, 7.9, 12.2, 15.8,
    stopX(7) - 4.2, stopX(7) - 0.8, stopX(7) + 3.6, stopX(7) + 7.9,
  ];
  for (let i = 0; i < snowBanks.length; i++) {
    const x = snowBanks[i];
    const bank = fg('fg-snowbank', x, 0.25, 1.18 + (i % 2) * 0.14);
    const drift = shapeFrom(s => {
      s.moveTo(-1.35, 0);
      s.quadraticCurveTo(-0.55, 0.42 + (i % 3) * 0.04, 0.15, 0.28);
      s.quadraticCurveTo(0.75, 0.45, 1.4, 0);
      s.closePath();
    });
    bank.shape(drift, i % 2 ? '#edf1f3' : '#e4eaee', 0, 0, 0, undefined, 0.024);
    if (i % 2 === 0) {
      bank.cut([[-0.22, 0.08], [0, 0.46], [0.22, 0.08]], '#5e7e71', -0.45, 0, 0.03, undefined, 0.02);
      bank.cut([[-0.16, 0.08], [0, 0.36], [0.16, 0.08]], '#6e8d7f', -0.18, 0, 0.035, undefined, 0.02);
    }
  }
  await pause();

  // Spring foreground meadow grass tufts & tiny daisies.
  for (let x = SEASON_BORDERS.spring + 0.8; x < SEASON_BORDERS.summer - 0.6; x += 2.35) {
    const tuft = fg('fg-spring-grass', x, 0.25, 1.15 + ((Math.round(x) % 2) * 0.12));
    for (let b = -2; b <= 2; b++) {
      const h = 0.32 + (2 - Math.abs(b)) * 0.05;
      tuft.cut(
        [[b * 0.08 - 0.03, 0], [b * 0.15, h], [b * 0.08 + 0.03, 0]],
        b % 2 === 0 ? '#749664' : '#85a673',
        0,
        0,
        b * 0.005,
        undefined,
        0.018,
      );
    }
    tuft.oval(0.09, 0.09, '#f6e7d4', 0.12, 0.34, 0.03, undefined, 0.014);
    tuft.oval(0.04, 0.04, '#e6be6c', 0.12, 0.34, 0.045, undefined, 0.012);
  }
  await pause();

  // Grassy foreground river bank with reeds.
  for (let x = SEASON_BORDERS.summer + 0.9; x < SEASON_BORDERS.autumn - 0.6; x += 2.6) {
    const dune = fg('fg-summer-river-bank', x, 0.25, 1.18);
    const wave = shapeFrom(s => {
      s.moveTo(-1.1, 0);
      s.quadraticCurveTo(-0.5, 0.34, 0, 0.24);
      s.quadraticCurveTo(0.55, 0.38, 1.15, 0);
      s.closePath();
    });
    dune.shape(wave, '#91a879', 0, 0, 0, undefined, 0.022);
    for (let b = -1; b <= 1; b++) {
      dune.cut(
        [[b * 0.11 - 0.025, 0.04], [b * 0.19, 0.44 - Math.abs(b) * 0.06], [b * 0.11 + 0.025, 0.04]],
        '#7b9e84',
        0.25,
        0,
        0.025,
        undefined,
        0.018,
      );
    }
  }
  await pause();

  // Small plants frame the autumn road without covering the wheels.
  const autumnSpots = [
    [-1.7, 202631],
    [8.1, 202688],
    [17.7, 202745],
  ];
  autumnSpots.forEach(([dx, seed], index) => {
    const x = stopX(5) + dx;
    addAutumnFloor(ctx, x, 1.16 + (index % 2) * 0.1, seed, 0.78);
  });
  await pause();
}
