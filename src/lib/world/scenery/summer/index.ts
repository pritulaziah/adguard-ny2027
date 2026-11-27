import type { SceneryContext } from '../../scene-context';
import { addSummerButterflies } from './butterflies';
import { addDistantRiver } from './distant-river';
import { addSummerMeadowProps } from './meadow-props';
import { addSummerTrees } from './trees';

/** Sunny countryside summer meadow: distant river, sunlit trees, fences, hay bales, sunflowers, and butterflies. */
export function addSummerMeadow(ctx: SceneryContext): void {
  addDistantRiver(ctx);
  addSummerTrees(ctx);
  addSummerMeadowProps(ctx);
  addSummerButterflies(ctx);
}
