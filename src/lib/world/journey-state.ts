import { writable } from 'svelte/store';

export interface JourneyState {
  ready: boolean;
  moving: boolean;
  stop: number;
  cameraSettled: boolean;
  discoveries: number;
}

export function createJourneyState() {
  return writable<JourneyState>({
    ready: false,
    moving: false,
    stop: 0,
    cameraSettled: false,
    discoveries: 0,
  });
}

export type JourneyStore = ReturnType<typeof createJourneyState>;

/** True when a scroll must switch the journey to moving and unsettle the camera. */
export function needsMotionStart(state: JourneyState): boolean {
  return !state.moving || state.cameraSettled;
}
