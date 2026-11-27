import type { PaperDetail } from '../paper-brush';
import { SEASON_BORDERS } from '../seasons';
import type { SceneryContext } from '../scene-context';

/** The same paper lantern marks every season border along the continuous road. */
function addLantern(detail: PaperDetail): void {
  const post = '#665f53';
  const frame = '#53665b';
  detail.rect(0.1, 1.55, post);
  detail.rect(0.52, 0.08, post, 0.22, 1.45, 0.02);
  detail.oval(0.28, 0.32, frame, 0.42, 1.28, 0.06, undefined, 0.026);
  detail.oval(0.21, 0.25, '#f6dfa4', 0.42, 1.28, 0.089, undefined, 0.014);
  detail.cut(
    [
      [0.28, 1.42],
      [0.42, 1.54],
      [0.56, 1.42],
    ],
    frame,
    0,
    0,
    0.11,
    undefined,
    0.025,
  );
}

/** Four matching lanterns mark the seasonal transitions along the road. */
export function addTransferStations(ctx: SceneryContext): void {
  addLantern(ctx.detail('transfer-winter-spring', SEASON_BORDERS.spring, -0.62));
  addLantern(ctx.detail('transfer-spring-summer', SEASON_BORDERS.summer, -0.62));
  addLantern(ctx.detail('transfer-summer-autumn', SEASON_BORDERS.autumn, -0.62));
  addLantern(ctx.detail('transfer-autumn-winter', SEASON_BORDERS.winterEnd, -0.62));
}
