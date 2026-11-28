import * as THREE from 'three';
import type { PaperBatch } from '../paper-batch';
import { bar, cutout, shapedCutout } from './shared';

/** The roof rack and its cargo join the van body batch. */
export function addVanLuggage(shell: PaperBatch): void {
  // Full-length steel roof rack with countryside road-trip cargo (jerrycan, wooden crate, rolled tarp).
  bar(shell, -0.8, 1.15, 0.46, 1.15, 0.026, '#505652', 0.008, 0.034);
  for (const px of [-0.7, -0.18, 0.36]) {
    bar(shell, px, 1.07, px, 1.15, 0.022, '#505652', 0.008, 0.034);
  }
  // Classic red metal fuel jerrycan.
  cutout(
    shell,
    [
      [-0.72, 1.16],
      [-0.47, 1.16],
      [-0.47, 1.4],
      [-0.53, 1.44],
      [-0.72, 1.44],
    ],
    '#bc4e41',
    0.064,
    0.006,
  );
  cutout(
    shell,
    [
      [-0.68, 1.38],
      [-0.55, 1.38],
      [-0.55, 1.42],
      [-0.68, 1.42],
    ],
    '#8c372d',
    0.068,
    0.01,
  );
  // Slatted wooden supply crate.
  cutout(
    shell,
    [
      [-0.4, 1.16],
      [0.06, 1.16],
      [0.06, 1.37],
      [-0.4, 1.37],
    ],
    '#caa06a',
    0.068,
    0.005,
  );
  for (const cy of [1.22, 1.31]) {
    shell.add(new THREE.BoxGeometry(0.46, 0.016, 0.072), '#a17a4a', { x: -0.17, y: cy, z: 0.039 });
  }
  // Rolled sage camping mat with leather straps.
  const rollShape = new THREE.Shape();
  rollShape.absellipse(0, 0, 0.16, 0.085, 0, Math.PI * 2, false, 0);
  shapedCutout(shell, rollShape, '#739179', 0.062, 0.006, 0.25, 1.24);
  for (const sx of [0.18, 0.32]) {
    shell.add(new THREE.BoxGeometry(0.024, 0.17, 0.068), '#8a6042', { x: sx, y: 1.24, z: 0.038 });
  }
}
