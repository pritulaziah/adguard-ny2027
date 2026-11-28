import { stopX } from '../route';
import { SEASON_BORDERS } from '../seasons';
import { SUMMER_BRIDGE_HALF_SPAN, SUMMER_BRIDGE_X } from '../summer-bridge';
import type { SceneryContext } from '../scene-context';
import { addAutumnFloor } from './autumn-plants';
import { shapeFrom } from './palette';

/** Sparse plants and snowbanks at the bottom edge (z = +1.15). */
export async function addForegroundFraming(ctx: SceneryContext, pause: () => Promise<void>): Promise<void> {
  const fg = (name: string, x: number, y: number, z: number, scale = 1) => ctx.detail(name, x, z, scale, y);

  // --- 1. Grounded bottom-edge foreground details (rooted at y = 0.26, below vehicle wheels) ---
  // Winter start and finale: isolated paper snowdrifts.
  const snowBanks = [-3.2, 4.5, 12.8, stopX(7) - 2.8, stopX(7) + 6.8];
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
  }
  await pause();

  // Spring foreground meadow grass tufts with pink blossom accents.
  for (let x = SEASON_BORDERS.spring + 0.8; x < SEASON_BORDERS.summer - 0.6; x += 7.6) {
    const tuft = fg('fg-spring-grass', x, 0.25, 1.15 + (Math.round(x) % 2) * 0.12);
    for (let b = -2; b <= 2; b++) {
      const h = 0.32 + (2 - Math.abs(b)) * 0.05;
      tuft.cut(
        [
          [b * 0.08 - 0.03, 0],
          [b * 0.15, h],
          [b * 0.08 + 0.03, 0],
        ],
        b % 2 === 0 ? '#749664' : '#85a673',
        0,
        0,
        b * 0.005,
        undefined,
        0.018,
      );
    }
    tuft.oval(0.09, 0.09, '#f1c7c1', 0.12, 0.34, 0.03, undefined, 0.014);
    tuft.oval(0.04, 0.04, '#e6be6c', 0.12, 0.34, 0.045, undefined, 0.012);
  }
  await pause();

  // Golden-green summer meadow grass tufts with tiny sunflowers along the bottom edge.
  for (let x = SEASON_BORDERS.summer + 0.9; x < SEASON_BORDERS.autumn - 0.6; x += 6.6) {
    if (Math.abs(x - SUMMER_BRIDGE_X) < SUMMER_BRIDGE_HALF_SPAN + 0.4) continue;
    const tuft = fg('fg-summer-meadow', x, 0.25, 1.18 + (Math.round(x) % 2) * 0.1);
    for (let b = -2; b <= 2; b++) {
      const h = 0.34 + (2 - Math.abs(b)) * 0.055;
      tuft.cut(
        [
          [b * 0.09 - 0.03, 0],
          [b * 0.16, h],
          [b * 0.09 + 0.03, 0],
        ],
        b % 2 === 0 ? '#9ab05d' : '#c0ba68',
        0,
        0,
        b * 0.005,
        undefined,
        0.018,
      );
    }
    tuft.oval(0.12, 0.12, '#f2c549', -0.06, 0.38, 0.032, undefined, 0.014);
    tuft.oval(0.058, 0.058, '#5f4331', -0.06, 0.38, 0.046, undefined, 0.012);
    tuft.oval(0.085, 0.085, '#dc6551', 0.18, 0.3, 0.032, undefined, 0.014);
    tuft.oval(0.035, 0.035, '#48382f', 0.18, 0.3, 0.046, undefined, 0.012);
  }
  await pause();

  // Small plants frame the autumn road without covering the wheels.
  const autumnSpots = [[8.1, 202688]];
  autumnSpots.forEach(([dx, seed], index) => {
    const x = stopX(5) + dx;
    addAutumnFloor(ctx, x, 1.16 + (index % 2) * 0.1, seed, 0.78);
  });
  await pause();
}
