import * as THREE from 'three';
import { PaperBatch } from '../paper-batch';
import { cutGeometry, unitOvalGeometry, unitRectGeometry, unitStarGeometry } from '../paper-geometry';
import type { Placement } from '../paper-placement';
import { paperSheet } from '../paper-materials';
import type { SceneryContext } from '../scene-context';
import { colors } from './palette';

/** A tall paper fir with four tiers, optional snow, and optional festive decorations. */
export function addFir(
  ctx: SceneryContext,
  x: number,
  height: number,
  snowy = false,
  festive = false,
  z = -2.05,
): void {
  const scale = height / 3;
  const batch = new PaperBatch();
  const at = (lx: number, ly: number, lz = 0, sx = 1, sy = 1): Placement => ({
    x: lx * scale,
    y: 0.34 + ly * scale,
    z: lz * scale,
    scale: [sx * scale, sy * scale, scale],
  });

  batch.add(unitRectGeometry(), colors.wood, at(0, -0.05, -0.06, 0.16, 0.88));
  for (let tier = 0; tier < 4; tier++) {
    const bottom = 0.38 + tier * 0.5;
    const width = 1.7 - tier * 0.33;
    batch.add(
      cutGeometry([
        [-width / 2, bottom],
        [0, bottom + 1.18],
        [width / 2, bottom],
        [0.02, bottom + 0.14],
      ]),
      tier % 2 ? '#7b9888' : '#658376',
      at(0, 0, tier * 0.035),
    );
    batch.add(
      cutGeometry([
        [0, bottom + 1.18],
        [width / 2, bottom],
        [0.02, bottom + 0.14],
      ]),
      '#567469',
      at(0, 0, tier * 0.035 + 0.048),
    );
    if (snowy) {
      batch.add(
        cutGeometry([
          [-width * 0.35, bottom + 0.26],
          [0, bottom + 1.18],
          [width * 0.26, bottom + 0.36],
          [0.08, bottom + 0.5],
          [-0.04, bottom + 0.34],
        ]),
        colors.snow,
        at(0, 0, tier * 0.035 + 0.07),
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
  if (festive) batch.add(unitStarGeometry(), colors.gold, at(0, 3.12, 0.2, 0.24, 0.24));

  const geometry = batch.build();
  if (!geometry) return;
  const object = new THREE.Group();
  object.name = 'paper-fir';
  object.position.set(x, 0, z);
  const mesh = new THREE.Mesh(geometry, paperSheet());
  mesh.name = 'paper-fir-mesh';
  object.add(mesh);
  ctx.group.add(object);
}
