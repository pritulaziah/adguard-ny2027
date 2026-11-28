import type { SceneryContext } from '../../scene-context';
import { addSummerButterflies } from './butterflies';
import { addSummerBridge } from './bridge';
import { addDistantRiver } from './distant-river';
import { addSummerMeadowProps } from './meadow-props';
import { addSummerTrees } from './trees';

/** Summer meadow with a stream, wooden bridge, trees, fences, hay bales, sunflowers, and butterflies. */
export function addSummerMeadow(ctx: SceneryContext): void {
  addDistantRiver(ctx);
  addSummerBridge(ctx);
  addSummerTrees(ctx);
  addSummerMeadowProps(ctx);
  addSummerButterflies(ctx);
}
