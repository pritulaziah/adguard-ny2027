import type { SceneryContext } from '../../scene-context';
import { addPaperSprite, paperPortraits } from './paper-sprite';

/** Tengu's hood and scarf are broad, softly curved paper pieces. */
export async function addTengu(ctx: SceneryContext, x: number, z = -1.05, scale = 1): Promise<void> {
  await addPaperSprite(ctx, 'tengu', paperPortraits.tengu, x, z, scale);
}
