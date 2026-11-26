import { SEASON_BORDERS } from '../seasons';
import type { SceneryContext } from '../scene-context';
import { colors } from './palette';

/** The four small stations at the borders between seasons. */
export function addTransferStations(ctx: SceneryContext): void {
  // 1. Winter Rails -> Spring Garden Path
  const winterSpring = ctx.detail('transfer-winter-spring', SEASON_BORDERS.spring, -0.62);
  winterSpring.rect(0.11, 1.35, colors.wood);
  winterSpring.cut([[-0.65, 0.92], [0.05, 0.92], [0.22, 1.07], [0.05, 1.22], [-0.65, 1.22]], colors.snow, 0, 0, 0.06);
  winterSpring.cut([[-0.08, 0.64], [0.64, 0.64], [0.8, 0.79], [0.64, 0.94], [-0.08, 0.94]], '#9ab288', 0, 0, 0.09);
  const buffer = ctx.detail('rail-buffer-spring', SEASON_BORDERS.spring - 0.18, 0);
  buffer.rect(0.12, 0.42, '#8b7361', 0, -0.02, 0.06);
  buffer.rect(0.28, 0.12, '#c88c79', 0, 0.28, 0.1);

  // 2. Spring Garden Path -> River Landing
  const pierLeft = ctx.detail('transfer-spring-summer', SEASON_BORDERS.summer, -0.04);
  pierLeft.box(0.95, 0.09, 0.92, '#b69374', -0.18, 0.05, 0);
  for (const px of [-0.52, 0.18]) {
    pierLeft.rect(0.12, 0.48, '#8d7059', px, -0.04, -0.44);
    pierLeft.oval(0.14, 0.07, '#dfd1b4', px, 0.46, -0.4);
  }

  // 3. Summer River -> Autumn Road Landing Pier
  const pierRight = ctx.detail('transfer-summer-autumn', SEASON_BORDERS.autumn, -0.04);
  pierRight.box(0.95, 0.09, 0.92, '#b69374', 0.18, 0.05, 0);
  for (const px of [-0.18, 0.52]) {
    pierRight.rect(0.12, 0.48, '#8d7059', px, -0.04, -0.44);
    pierRight.oval(0.14, 0.07, '#dfd1b4', px, 0.46, -0.4);
  }
  const milestone = ctx.detail('autumn-milestone', SEASON_BORDERS.autumn + 0.55, -0.62);
  milestone.cut([[-0.22, 0], [0.22, 0], [0.2, 0.56], [0, 0.72], [-0.2, 0.56]], '#d5c6ab', 0, 0, 0);
  milestone.oval(0.16, 0.16, '#c28567', 0, 0.42, 0.06);

  // 4. Autumn Road -> Winter Finale Halt
  const halt = ctx.detail('transfer-autumn-winter', SEASON_BORDERS.winterEnd + 0.1, -0.62);
  halt.rect(0.1, 1.55, '#7f7265', 0, 0);
  halt.rect(0.52, 0.08, '#7f7265', 0.22, 1.45, 0.02);
  halt.oval(0.22, 0.26, '#f6dfa4', 0.42, 1.28, 0.06);
  halt.cut([[0.28, 1.42], [0.42, 1.54], [0.56, 1.42]], '#6d8279', 0, 0, 0.09);
}
