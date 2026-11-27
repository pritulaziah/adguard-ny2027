import { JOURNEY_END, STORY_END } from './route';

export const FINALE_STORY_X = JOURNEY_END;
export const FINALE_TREE_X = FINALE_STORY_X - 1;
export const FINALE_TRAIN_X = JOURNEY_END;
export const FINALE_MASCOTS = {
  agnar: FINALE_TREE_X - 1.5,
  tengu: FINALE_TREE_X,
  diana: FINALE_TREE_X + 1.5,
} as const;

/** Gently frame the destination as the reader enters the final winter section. */
export function finaleCameraOffset(distance: number): number {
  const t = Math.max(0, Math.min(1, (distance - (STORY_END - 5.5)) / 5.5));
  const throughScene = Math.max(0, Math.min(1, (distance - STORY_END) / (JOURNEY_END - STORY_END)));
  return t * t * (3 - 2 * t) * 1.9 - throughScene * (JOURNEY_END + 1.9 - FINALE_TREE_X);
}
