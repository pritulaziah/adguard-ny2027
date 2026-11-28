import * as THREE from 'three';
import { PaperBatch } from '../paper-batch';
import { unitOvalGeometry } from '../paper-geometry';
import { paperSheet } from '../paper-materials';

/** One folded-paper cloud: a soft shadow layer and five lighter puffs. */
export function addCloud(
  parent: THREE.Object3D,
  x: number,
  y: number,
  z: number,
  scale: number,
  tint: string,
  shadow: string,
): void {
  const batch = new PaperBatch();
  const puffs: Array<[number, number, number, number]> = [
    [-0.95, 0.0, 0.92, 0.56],
    [-0.28, 0.24, 1.15, 0.74],
    [0.45, 0.16, 1.0, 0.64],
    [1.02, -0.02, 0.78, 0.48],
    [0.05, -0.08, 2.25, 0.4],
  ];
  for (const [px, py, pw, ph] of puffs) {
    batch.add(unitOvalGeometry(0.03), shadow, {
      x: (px + 0.06) * scale,
      y: (py - 0.05) * scale,
      z: -0.04,
      scale: [pw * scale, ph * scale, 1],
    });
    batch.add(unitOvalGeometry(0.03), tint, {
      x: px * scale,
      y: py * scale,
      z: 0,
      scale: [pw * scale, ph * scale, 1],
    });
  }

  const geometry = batch.build();
  if (!geometry) return;
  const object = new THREE.Group();
  object.name = 'paper-cloud';
  object.position.set(x, y, z);
  const mesh = new THREE.Mesh(geometry, paperSheet());
  mesh.name = 'paper-cloud-mesh';
  object.add(mesh);
  parent.add(object);
}

/** Low-contrast folded-paper clouds floating in the far sky plane (z = -8.4, 0.42x speed). */
export function addSkyClouds(parent: THREE.Object3D): void {
  const clouds: Array<[number, number, number, string, string]> = [
    [-7.2, 7.6, 1.15, '#9eaec4', '#8d9eb6'],
    [5.8, 8.3, 1.0, '#a0b0c6', '#8f9fb7'],
    [14.2, 7.9, 1.15, '#99abc1', '#889ab1'],
    [23.8, 8.5, 1.12, '#a2b793', '#8ea680'],
    [29.4, 7.7, 1.05, '#a7bc98', '#92aa84'],
    [36.45, 8.5, 1.12, '#a2b793', '#8ea680'],
    [42.05, 7.7, 1.05, '#a7bc98', '#92aa84'],
    [47.85, 8.6, 1.22, '#98bdc6', '#83aab5'],
    [53.0, 8.6, 1.22, '#98bdc6', '#83aab5'],
    [59.0, 7.9, 1.08, '#c5a57a', '#b19167'],
    [64.5, 8.5, 1.18, '#cfa775', '#bc9362'],
    [71.5, 7.8, 1.15, '#cc9b89', '#b88777'],
    [78.5, 8.5, 1.1, '#c8978b', '#b58479'],
    [86.5, 8.2, 1.18, '#99abc4', '#879ab4'],
    [96.0, 7.6, 1.1, '#98aac2', '#8698b2'],
  ];
  for (const [cx, cy, scale, tint, shadow] of clouds) {
    addCloud(parent, cx, cy, -8.4, scale, tint, shadow);
  }
}
