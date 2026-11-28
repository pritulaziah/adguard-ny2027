import type { SceneryContext } from '../../scene-context';
import { SUMMER_BRIDGE_X } from '../../summer-bridge';
import { shapeFrom } from '../palette';

function streamOutline(margin = 0) {
  const farMargin = margin * 0.5;
  return shapeFrom(s => {
    // Shape y maps to -world z after rotating flat onto the meadow floor.
    // The far tail bends nearly parallel to the near ridge (z = -3.1) and slips behind it.
    s.moveTo(2.65 - farMargin, 3.18);
    s.bezierCurveTo(1.85 - farMargin, 2.98, 1.05 - margin, 2.55, 0.48 - margin, 1.9);
    s.bezierCurveTo(-0.08 - margin, 1.25, -0.42 - margin, 0.72, -0.52 - margin, 0);
    s.bezierCurveTo(-0.74 - margin, -0.82, -1.2 - margin, -1.52, -1.18 - margin, -2.2);
    s.lineTo(0.1 + margin, -2.2);
    s.bezierCurveTo(0.14 + margin, -1.46, 0.36 + margin, -0.8, 0.48 + margin, 0);
    s.bezierCurveTo(0.62 + margin, 0.78, 0.74 + margin, 1.25, 1.12 + margin, 1.85);
    s.bezierCurveTo(1.52 + margin, 2.48, 2.12 + farMargin, 2.9, 2.82 + farMargin, 3.12);
    s.closePath();
  });
}

/** A winding summer stream flows from behind the near ridge under the open bridge arch. */
export function addDistantRiver(ctx: SceneryContext): void {
  const river = ctx.detail('summer-distant-river', SUMMER_BRIDGE_X, 0, 1, 0.28);
  river.shape(streamOutline(0.09), '#b7ba7d', 0, -0.01, 0, [-Math.PI / 2, 0, 0], 0.005);
  river.shape(streamOutline(), '#87adb3', 0, -0.003, 0, [-Math.PI / 2, 0, 0], 0.006);

  // Flat pale glints shrink with distance along the stream.
  river.oval(0.32, 0.062, '#cde0da', -0.18, 0.004, 0.65, [-Math.PI / 2, 0, 0], 0.003);
  river.oval(0.22, 0.048, '#c5dbd4', 0.78, 0.004, -1.8, [-Math.PI / 2, 0, 0], 0.003);
  river.oval(0.15, 0.034, '#c5dbd4', 1.48, 0.004, -2.45, [-Math.PI / 2, 0, 0], 0.003);
}
