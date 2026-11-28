import * as THREE from 'three';
import { JOURNEY_END, STORY_END } from './route';

export const FINALE_STORY_X = JOURNEY_END;
export const FINALE_TREE_X = FINALE_STORY_X - 1;
export const FINALE_CAR_X = JOURNEY_END;
export const FINALE_MASCOTS = {
  agnar: FINALE_TREE_X - 1.5,
  tengu: FINALE_TREE_X,
  diana: FINALE_TREE_X + 1.5,
} as const;

/** Gently frame the destination as the reader enters the final winter section. */
export function finaleCameraOffset(distance: number): number {
  const t = THREE.MathUtils.smoothstep(distance, STORY_END - 5.5, STORY_END);
  const throughScene = THREE.MathUtils.clamp((distance - STORY_END) / (JOURNEY_END - STORY_END), 0, 1);
  return t * 1.9 - throughScene * (JOURNEY_END + 1.9 - FINALE_TREE_X);
}
