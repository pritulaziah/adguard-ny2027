import type { SceneryContext } from '../../scene-context';
import { addRiverAlder } from './alder';
import { addRiverBank } from './bank';
import { addRiverPier } from './pier';
import { addLilyPads } from './lily-pads';
import { addRiverWillow } from './willow';
import { addRiverReeds } from './reeds';

export { addRiverDuck } from './duck';

/** The summer river: far bank, willow, alder, landing, reeds, and lily pads. */
export function addSummerRiver(ctx: SceneryContext): void {
  addRiverBank(ctx);
  addRiverWillow(ctx);
  addRiverAlder(ctx);
  addRiverPier(ctx);
  addRiverReeds(ctx);
  addLilyPads(ctx);
}
