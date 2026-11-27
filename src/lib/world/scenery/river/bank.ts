import * as THREE from 'three';
import { stopX } from '../../route';
import { SEASON_BORDERS } from '../../seasons';
import type { SceneryContext } from '../../scene-context';

/** Layered river banks leave the central story and the boat route clear. */
export function addRiverBank(ctx: SceneryContext): void {
  const center = stopX(4);
  const span = SEASON_BORDERS.autumn - SEASON_BORDERS.summer;
  const bank = ctx.detail('river-far-bank', center, -1.3);
  const edge = new THREE.Shape();
  edge.moveTo(-span / 2, -0.08);
  for (let x = -span / 2; x <= span / 2; x += 0.22) {
    edge.lineTo(x, 0.14 + Math.sin(x * 1.35) * 0.08 + Math.cos(x * 2.4) * 0.035);
  }
  edge.lineTo(span / 2, -0.08);
  edge.closePath();
  bank.shape(edge, '#718f68', 0, 0, 0, undefined, 0.09);
  bank.stroke(
    [
      [-span / 2, 0.01],
      [-2.6, 0.06],
      [0, 0.01],
      [2.5, 0.08],
      [span / 2, 0.02],
    ],
    '#b3c399',
    0.045,
    0.12,
  );
}
