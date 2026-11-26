import type { SceneryContext } from '../../scene-context';
import { addPaperSprite, paperPortraits } from './paper-sprite';

/** Agnar uses the same rounded paper shapes as the scene's other characters. */
export async function addAgnar(ctx: SceneryContext, x: number, z = -1.05, scale = 1): Promise<void> {
  await addPaperSprite(ctx, 'agnar', paperPortraits.agnar, x, z, scale);
}
