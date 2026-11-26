import type { SceneryContext } from '../../scene-context';
import { addPaperSprite, paperPortraits } from './paper-sprite';

/** Diana's hair and dress share the scene's simple layered paper style. */
export async function addDiana(ctx: SceneryContext, x: number, z = -1.05, scale = 1): Promise<void> {
  await addPaperSprite(ctx, 'diana', paperPortraits.diana, x, z, scale);
}
