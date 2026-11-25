import { writable } from 'svelte/store';
import type { Interaction } from '../content/i18n';

export interface JourneyState {
  ready: boolean;
  moving: boolean;
  stop: number;
  cameraSettled: boolean;
  discoveries: number;
  message: Interaction | '';
}

export function createJourneyState() {
  return writable<JourneyState>({
    ready: false, moving: false, stop: 0,
    cameraSettled: false,
    discoveries: 0, message: '',
  });
}

export type JourneyStore = ReturnType<typeof createJourneyState>;
