import * as THREE from 'three';
import { PaperBatch } from '../paper-batch';

export const CUT_SIDE = '#e5d6ba';

/**
 * All still parts of one vehicle go into a shared batch. A cutout keeps the
 * same depth offset and cream side edge as the old per-part mesh.
 */
export function cutout(
  batch: PaperBatch,
  points: number[][],
  color: string,
  depth = 0.045,
  z = -depth / 2,
  x = 0,
  y = 0,
): void {
  const shape = new THREE.Shape();
  points.forEach(([px, py], i) => (i ? shape.lineTo(px, py) : shape.moveTo(px, py)));
  shape.closePath();
  batch.add(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false }), color, { x, y, z }, CUT_SIDE);
}

export function shapedCutout(
  batch: PaperBatch,
  shape: THREE.Shape,
  color: string,
  depth = 0.045,
  z = -depth / 2,
  x = 0,
  y = 0,
): void {
  batch.add(
    new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 14 }),
    color,
    { x, y, z },
    CUT_SIDE,
  );
}

export function bar(
  batch: PaperBatch,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  thickness: number,
  color: string,
  z = 0,
  depth = 0.045,
): void {
  const length = Math.hypot(x2 - x1, y2 - y1);
  batch.add(new THREE.BoxGeometry(length, thickness, depth), color, {
    x: (x1 + x2) / 2,
    y: (y1 + y2) / 2,
    z,
    rotate: [0, 0, Math.atan2(y2 - y1, x2 - x1)],
  });
}
