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
