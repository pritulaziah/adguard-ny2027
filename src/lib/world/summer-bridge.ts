import { stopX } from './route';

export const SUMMER_BRIDGE_X = stopX(4);
export const SUMMER_BRIDGE_HALF_SPAN = 1.7;
export const SUMMER_BRIDGE_RISE = 0.52;
export const ROAD_SURFACE_Y = 0.3225;

/** The deck and both axles share this profile, with flat joins at either end. */
export function bridgeLift(x: number): number {
  const t = (x - SUMMER_BRIDGE_X) / SUMMER_BRIDGE_HALF_SPAN;
  if (Math.abs(t) >= 1) return 0;
  const arch = 1 - t * t;
  return SUMMER_BRIDGE_RISE * arch * arch;
}
