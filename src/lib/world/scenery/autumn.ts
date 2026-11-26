import { stopX } from '../route';
import type { SceneryContext } from '../scene-context';
import { addAutumnFloor, addAutumnShrub } from './autumn-plants';

/** Low woodland plants between the trees and along the road. */
export function addAutumnUndergrowth(ctx: SceneryContext): void {
  // Rare shrubs stay beside the tree trunks, away from the open story areas.
  const shrubs: Array<[number, number, number, number]> = [
    [5, -5.3, -2.05, 0.78],
    [6, 4.15, -1.86, 0.75],
  ];
  shrubs.forEach(([stop, dx, z, scale], index) => {
    addAutumnShrub(ctx, stopX(stop) + dx, z, 202610 + index * 31, scale);
  });

  // Keep the mushroom groups and their grass. Seeds preserve their shapes.
  const floor: Array<[number, number, number, number, number]> = [
    [5, -3.95, -0.8, 0.75, 202654],
    [5, 1.45, -0.83, 1.0, 202740],
    [5, 6.65, -1.15, 0.86, 202826],
    [6, -4.2, -0.84, 0.92, 202869],
    [6, 1.55, -0.84, 0.85, 202955],
  ];
  floor.forEach(([stop, dx, z, scale, seed]) => {
    addAutumnFloor(ctx, stopX(stop) + dx, z, seed, scale);
  });
}
