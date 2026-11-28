import * as THREE from 'three';
import { PaperBatch } from '../paper-batch';
import { shapeGeometry, unitOvalGeometry, unitStarGeometry } from '../paper-geometry';
import type { Placement } from '../paper-placement';
import { paperSheet } from '../paper-materials';
import type { SceneryContext } from '../scene-context';
import { colors, shapeFrom } from './palette';

export type FirSilhouette = 'full' | 'slender' | 'leaning';

const FIR_SILHOUETTES: Record<FirSilhouette, { width: number; lean: number }> = {
  full: { width: 0.9, lean: 0 },
  slender: { width: 0.83, lean: 0 },
  leaning: { width: 0.87, lean: 0.03 },
};

const FIR_HEIGHT = 3.39;
const FIR_TIERS = [
  { bottom: 0.36, width: 2.35, height: 1.43, lean: 0, color: '#668574' },
  { bottom: 1.04, width: 1.9, height: 1.3, lean: 0.02, color: '#739380' },
  { bottom: 1.69, width: 1.47, height: 1.2, lean: -0.01, color: '#80a08a' },
  { bottom: 2.29, width: 1.02, height: 1.1, lean: 0, color: '#8aaa94' },
];

/** Four curved paper tiers. Height measures from the ground to the crown, without the optional star. */
export function addFir(
  ctx: SceneryContext,
  x: number,
  height: number,
  snowy = false,
  festive = false,
  z = -2.05,
  silhouette: FirSilhouette = 'full',
): void {
  const scale = height / FIR_HEIGHT;
  const batch = new PaperBatch();
  const at = (lx: number, ly: number, lz = 0, sx = 1, sy = 1): Placement => ({
    x: lx * scale,
    y: 0.26 + ly * scale,
    z: lz * scale,
    scale: [sx * scale, sy * scale, scale],
  });

  function addShape(shape: THREE.Shape, color: string, z: number, depth = 0.035): void {
    const geometry = shapeGeometry(shape, depth);
    batch.add(geometry, color, at(0, 0, z));
    geometry.dispose();
  }

  addShape(
    shapeFrom(s => {
      s.moveTo(-0.15, 0);
      s.quadraticCurveTo(-0.1, 0.45, -0.075, 1.3);
      s.lineTo(0.07, 1.3);
      s.quadraticCurveTo(0.09, 0.45, 0.15, 0);
      s.closePath();
    }),
    '#907660',
    -0.04,
  );

  for (const [tier, { bottom, width, height: tierHeight, lean, color }] of FIR_TIERS.entries()) {
    const top = bottom + tierHeight;
    const z = tier * 0.05;
    addShape(
      shapeFrom(s => {
        s.moveTo(lean, top);
        s.bezierCurveTo(
          lean - width * 0.15,
          bottom + tierHeight * 0.6,
          -width * 0.32,
          bottom + tierHeight * 0.19,
          -width * 0.5,
          bottom + 0.1,
        );
        s.quadraticCurveTo(-width * 0.36, bottom - 0.05, -width * 0.2, bottom + 0.04);
        s.quadraticCurveTo(-width * 0.06, bottom - 0.05, width * 0.1, bottom + 0.03);
        s.quadraticCurveTo(width * 0.3, bottom - 0.05, width * 0.5, bottom + 0.11);
        s.bezierCurveTo(
          width * 0.3,
          bottom + tierHeight * 0.23,
          lean + width * 0.13,
          bottom + tierHeight * 0.62,
          lean,
          top,
        );
        s.closePath();
      }),
      color,
      z,
    );
    addShape(
      shapeFrom(s => {
        s.moveTo(lean, top);
        s.bezierCurveTo(
          lean + width * 0.13,
          bottom + tierHeight * 0.62,
          width * 0.3,
          bottom + tierHeight * 0.23,
          width * 0.5,
          bottom + 0.11,
        );
        s.quadraticCurveTo(width * 0.25, bottom - 0.04, width * 0.05, bottom + 0.04);
        s.quadraticCurveTo(0.01, bottom + tierHeight * 0.4, lean, top);
        s.closePath();
      }),
      '#557969',
      z + 0.04,
      0.018,
    );
    if (snowy) {
      addShape(
        shapeFrom(s => {
          s.moveTo(lean, top - 0.025);
          s.bezierCurveTo(
            lean - width * 0.12,
            bottom + tierHeight * 0.65,
            -width * 0.24,
            bottom + tierHeight * 0.4,
            -width * 0.34,
            bottom + tierHeight * 0.28,
          );
          s.quadraticCurveTo(-width * 0.18, bottom + tierHeight * 0.2, -width * 0.1, bottom + tierHeight * 0.32);
          s.quadraticCurveTo(0, bottom + tierHeight * 0.22, width * 0.08, bottom + tierHeight * 0.32);
          s.quadraticCurveTo(width * 0.18, bottom + tierHeight * 0.26, width * 0.25, bottom + tierHeight * 0.36);
          s.bezierCurveTo(
            width * 0.16,
            bottom + tierHeight * 0.53,
            lean + width * 0.07,
            bottom + tierHeight * 0.75,
            lean,
            top - 0.025,
          );
          s.closePath();
        }),
        '#edf2ef',
        z + 0.065,
        0.018,
      );
    }
    if (festive && tier < 3) {
      batch.add(
        unitOvalGeometry(),
        tier % 2 ? '#cf8572' : colors.gold,
        at(-0.18 + tier * 0.14, bottom + 0.28, 0.22, 0.14, 0.16),
      );
      batch.add(
        unitOvalGeometry(),
        tier % 2 ? colors.gold : '#cf8572',
        at(0.24 - tier * 0.09, bottom + 0.44, 0.22, 0.12, 0.14),
      );
    }
  }
  if (festive) batch.add(unitStarGeometry(), colors.gold, at(0, FIR_HEIGHT + 0.13, 0.26, 0.24, 0.24));

  const geometry = batch.build();
  if (!geometry) return;
  // Change the built vertices once, so neighboring firs share the same static mesh budget.
  const { width, lean } = FIR_SILHOUETTES[silhouette];
  geometry.applyMatrix4(new THREE.Matrix4().set(width, lean, 0, -0.26 * lean, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1));
  geometry.computeBoundingSphere();
  const object = new THREE.Group();
  object.name = 'paper-fir';
  object.position.set(x, 0, z);
  const mesh = new THREE.Mesh(geometry, paperSheet());
  mesh.name = 'paper-fir-mesh';
  object.add(mesh);
  ctx.group.add(object);
}
