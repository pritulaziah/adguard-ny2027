/** One knob that stretches every scene along the route. */
export const STRETCH = 1.15;
export const STOP_COUNT = 7;
export const STOP_SPACING = 11 * STRETCH;
/** Additional river distance, inserted only inside the summer section. */
export const SUMMER_EXTENSION = 3;
const SUMMER_START = 3.5 * STOP_SPACING;
const SUMMER_END = 4.5 * STOP_SPACING;

/** Convert the original route distance to the longer summer route. */
export function routeDistance(distance: number): number {
  const fraction = Math.max(0, Math.min(1, (distance - SUMMER_START) / STOP_SPACING));
  return distance + SUMMER_EXTENSION * fraction;
}

/** Fractional stop index, including the unequal summer intervals. */
export function routeProgress(distance: number): number {
  let original = distance;
  if (distance >= SUMMER_END + SUMMER_EXTENSION) original -= SUMMER_EXTENSION;
  else if (distance > SUMMER_START) {
    original = SUMMER_START + (distance - SUMMER_START) / (1 + SUMMER_EXTENSION / STOP_SPACING);
  }
  return original / STOP_SPACING;
}

/** The last story stands here; the road continues past it. */
export const STORY_END = routeDistance(STOP_COUNT * STOP_SPACING);
export const TRACK_LENGTH = STORY_END + 14;
export const WALL_Z = -2.92;
export const STORY_Z = -2.23;

const FOLLOW_RATE = 2.6;
const REST = 0.002;

export function pointOnTrack(distance: number): { x: number; z: number; rotation: number } {
  return { x: distance, z: 0, rotation: 0 };
}

export function clampDistance(distance: number): number {
  return Math.max(0, Math.min(TRACK_LENGTH, distance));
}

export function stopIndexAt(distance: number): number {
  for (let index = 0; index < STOP_COUNT; index++) {
    if (distance < (stopX(index) + stopX(index + 1)) / 2) return index;
  }
  return STOP_COUNT;
}

export function stopX(index: number): number {
  return routeDistance(index * STOP_SPACING);
}

/**
 * Free scrolling. Input moves a target, the train eases toward it and stops
 * where the reader left it: no magnetic snapping, no automatic legs.
 */
export class JourneyMotion {
  distance = 0;
  target = 0;
  speed = 0;
  moving = false;

  scroll(deltaUnits: number): boolean {
    if (!Number.isFinite(deltaUnits) || Math.abs(deltaUnits) < 1e-5) return false;
    const next = clampDistance(this.target + deltaUnits);
    if (Math.abs(next - this.target) < 1e-6) return false;
    this.target = next;
    this.moving = true;
    return true;
  }

  /** Advances the train toward the target. Returns true on the frame it comes to rest. */
  step(delta: number): boolean {
    const dt = Math.max(delta, 0);
    if (dt === 0 || !this.moving) {
      this.speed = 0;
      return false;
    }

    const previous = this.distance;
    this.distance += (this.target - this.distance) * (1 - Math.exp(-dt * FOLLOW_RATE));

    if (Math.abs(this.target - this.distance) < REST) {
      this.distance = this.target;
      this.speed = 0;
      this.moving = false;
      return true;
    }

    this.speed = (this.distance - previous) / dt;
    return false;
  }

  reset(): void {
    this.distance = 0;
    this.target = 0;
    this.speed = 0;
    this.moving = false;
  }
}
