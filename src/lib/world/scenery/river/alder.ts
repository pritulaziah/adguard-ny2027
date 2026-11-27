import { stopX } from '../../route';
import type { SceneryContext } from '../../scene-context';
import { addBroadTree } from '../broad-tree';

/** A full summer crown uses the same trunk and foliage layers as the other seasons. */
export function addRiverAlder(ctx: SceneryContext): void {
  const alder = addBroadTree(ctx, stopX(4) + 3.4, 'summer-alder', 1.04, -2.4);
  alder.group.name = 'river-alder';
}
