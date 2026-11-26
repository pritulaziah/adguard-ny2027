import { oval } from '../paper-shapes';
import type { SceneryContext } from '../scene-context';
import { colors } from './palette';
import { addShieldOn } from './shield';

/** A snow-capped paper cabin with chimney smoke and a small AdGuard badge. */
export function addCabin(ctx: SceneryContext, x: number, final = false): void {
  const house = ctx.detail('paper-cabin', x, -1.85);
  house.cut([[-0.98, 0], [0.98, 0], [0.98, 1.44], [0, 2.2], [-0.98, 1.44]], '#b18d79');
  house.cut([[0.98, 0], [1.46, 0.2], [1.46, 1.59], [0.98, 1.44]], '#8e7060', 0, 0, -0.01);
  house.cut([[-0.02, 2.38], [0.46, 2.55], [1.66, 1.61], [1.18, 1.42]], '#d7d4c8', 0, 0, 0.02);
  // Cozy stone base grounding the cabin on snow.
  house.rect(1.98, 0.16, '#87837c', 0, 0, 0.055, undefined, 0.03);
  for (let i = 0; i < 6; i++) house.stroke([[-0.96, 0.22 + i * 0.21], [0.96, 0.22 + i * 0.21]], '#987361', 0.024, 0.06);
  house.cut([[-1.18, 1.4], [-0.02, 2.38], [1.19, 1.42], [0.87, 1.44], [-0.02, 2.1], [-0.86, 1.4]], '#8a7165', 0, 0, 0.1);
  house.cut([[-1.17, 1.52], [-0.02, 2.42], [1.16, 1.52], [0.84, 1.59], [0.46, 1.82], [0.14, 2.06], [-0.1, 2.1], [-0.7, 1.65]], colors.snow, 0, 0, 0.16);
  house.rect(0.46, 0.94, '#6f8377', 0.26, 0.06, 0.08);
  house.oval(0.055, 0.055, colors.gold, 0.39, 0.48, 0.15);
  house.rect(0.58, 0.58, '#705f53', -0.47, 0.6, 0.08);
  house.rect(0.46, 0.46, '#f4d69d', -0.47, 0.66, 0.14);
  house.stroke([[-0.47, 0.66], [-0.47, 1.12]], '#a08463', 0.034, 0.2);
  house.stroke([[-0.7, 0.89], [-0.24, 0.89]], '#a08463', 0.034, 0.2);
  house.rect(0.25, 0.65, '#9d8170', 0.52, 1.94, -0.12);
  for (let i = 0; i < 3; i++) {
    const puff = oval(house.group, 0.24 + i * 0.07, 0.14 + i * 0.02, '#e2e2da', 0.51 - i * 0.11, 2.7 + i * 0.18, -0.2);
    ctx.animate(puff, 'float');
  }
  addShieldOn(house, 0, 1.6, 0.65);
  if (final) {
    for (let i = 0; i < 5; i++) house.star(0.09, colors.gold, -0.84 + i * 0.42, 1.33, 0.24);
  }
}
