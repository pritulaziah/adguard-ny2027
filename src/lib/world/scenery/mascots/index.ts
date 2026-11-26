import { STORY_END } from '../../route';
import type { SceneryContext } from '../../scene-context';
import { addAgnar } from './agnar';
import { addTengu } from './tengu';
import { addDiana } from './diana';

/** Each character has space along the final stretch of the winter route. */
export async function addFinaleMascots(ctx: SceneryContext): Promise<void> {
  await Promise.all([
    addAgnar(ctx, STORY_END + 1.8, -1.0, 1.0),
    addTengu(ctx, STORY_END + 5.2, -1.06, 1.0),
    addDiana(ctx, STORY_END + 8.8, -1.0, 1.0),
  ]);
}
