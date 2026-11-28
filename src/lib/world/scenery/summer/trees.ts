import { stopX } from '../../route';
import type { SceneryContext } from '../../scene-context';
import { addBroadTree } from '../broad-tree';

/** Sunlit countryside summer trees flanking the meadow clear of the story and autumn. */
export function addSummerTrees(ctx: SceneryContext): void {
  const cx = stopX(4);
  const left = addBroadTree(ctx, cx - 4.65, 'summer-alder', 0.98, -2.25, 'spreading');
  left.group.name = 'summer-meadow-linden';
  const right = addBroadTree(ctx, cx + 3.55, 'summer-birch', 0.96, -2.32, 'slender');
  right.group.name = 'summer-meadow-birch';
}
