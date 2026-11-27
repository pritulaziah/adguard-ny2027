import { FINALE_MASCOTS } from '../../finale';
import type { SceneryContext } from '../../scene-context';
import { addAgnar } from './agnar';
import { addTengu } from './tengu';
import { addDiana } from './diana';

/** The three gift-givers stand together in front of the final tree. */
export async function addFinaleMascots(ctx: SceneryContext): Promise<void> {
  await Promise.all([
    addAgnar(ctx, FINALE_MASCOTS.agnar, -0.95, 1.0),
    addTengu(ctx, FINALE_MASCOTS.tengu, -1.0, 1.0),
    addDiana(ctx, FINALE_MASCOTS.diana, -0.95, 1.0),
  ]);
}
