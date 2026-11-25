export const TRACK_LENGTH = 84;
export const STOP_COUNT = 6;
export const STOP_SPACING = 11;
/** The last story stands here; the road continues past it. */
export const STORY_END = STOP_COUNT * STOP_SPACING;
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
  return Math.max(0, Math.min(STOP_COUNT, Math.round(distance / STOP_SPACING)));
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
