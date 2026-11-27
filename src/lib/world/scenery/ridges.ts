import * as THREE from 'three';
import { seasonalPaperMaterial } from '../paper-materials';
import { TRACK_LENGTH } from '../route';
import { DISTANT_PEAKS_RAMP, FAR_RIDGE_RAMP, NEAR_RIDGE_RAMP, seasonCenter } from '../seasons';
import type { SceneryContext } from '../scene-context';

/** Height of the far rolling hills. The ridge and its trees share this profile. */
export function farRidgeHeight(x: number): number {
  return 1.18 + Math.sin(x * 0.21 + 0.7) * 0.34 + Math.sin(x * 0.51) * 0.18;
}

function buildRidge(
  parent: THREE.Group,
  name: string,
  z: number,
  yBase: number,
  material: THREE.Material,
  heights: (x: number) => number,
): void {
  const startX = -38;
  const endX = TRACK_LENGTH + 38;
  const step = 1.4;
  const shape = new THREE.Shape();
  shape.moveTo(startX, -1.2);
  for (let x = startX; x <= endX; x += step) {
    shape.lineTo(x, heights(x));
  }
  shape.lineTo(endX, heights(endX));
  shape.lineTo(endX, -1.2);
  shape.closePath();
  const mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.045, bevelEnabled: false }), material);
  mesh.name = name;
  mesh.position.set(0, yBase, z);
  parent.add(mesh);
}

/** Builds three staggered torn-paper mountain and hill planes. */
export async function addPanoramaRidges(ctx: SceneryContext, pause: () => Promise<void>): Promise<void> {
  // Plane 2: distant alpine & coastal mountain range (slow 0.45x parallax).
  buildRidge(
    ctx.group,
    'torn-paper-distant-peaks',
    -7.6,
    -0.25,
    seasonalPaperMaterial(DISTANT_PEAKS_RAMP, {
      grainStrength: 0.055,
      grainScale: 0.4,
      cameraX: ctx.cameraX,
      colorSpread: 0.55,
    }),
    x => {
      const wave = 2.05 + Math.sin(x * 0.14 + 0.3) * 0.72 + Math.sin(x * 0.31 + 1.4) * 0.44 + Math.cos(x * 0.53) * 0.18;
      // Gently dip along the summer coast so the open sea feels wide and airy.
      const coastDip = Math.exp(-Math.pow((x - seasonCenter('summer')) / 9.5, 2)) * 0.88;
      return Math.max(1.05, wave - coastDip);
    },
  );
  await pause();

  // Plane 3: far rolling hills (0.54x parallax).
  buildRidge(
    ctx.group,
    'torn-paper-far-ridge',
    -5.2,
    -0.08,
    seasonalPaperMaterial(FAR_RIDGE_RAMP, {
      grainStrength: 0.065,
      grainScale: 0.48,
      cameraX: ctx.cameraX,
      colorSpread: 0.7,
    }),
    farRidgeHeight,
  );
  await pause();

  // Plane 4: near rolling hills framing the back of the stage (0.66x parallax).
  buildRidge(
    ctx.group,
    'torn-paper-near-ridge',
    -3.1,
    0.1,
    seasonalPaperMaterial(NEAR_RIDGE_RAMP, {
      grainStrength: 0.075,
      grainScale: 0.54,
      cameraX: ctx.cameraX,
      colorSpread: 0.85,
    }),
    x => 0.62 + Math.sin(x * 0.32 + 1.8) * 0.2 + Math.cos(x * 0.73) * 0.1,
  );
  await pause();
}
