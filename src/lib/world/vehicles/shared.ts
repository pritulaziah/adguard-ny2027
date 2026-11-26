import * as THREE from 'three';
import { PaperBatch, paint } from '../paper-brush';
import { paperSheet } from '../paper-materials';

export const CUT_SIDE = '#e5d6ba';

export interface MovingVehicle {
  group: THREE.Group;
  update: (x: number, time: number, moving: boolean, reduced: boolean) => void;
}

/** A single animated cutout keeps the same cream side edge as the batched ones. */
export function cutoutMesh(points: number[][], color: string, depth = 0.045): THREE.Mesh {
  const shape = new THREE.Shape();
  points.forEach(([px, py], i) => (i ? shape.lineTo(px, py) : shape.moveTo(px, py)));
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  paint(geometry, color, geometry.groups.length === 2 ? 1 : undefined, CUT_SIDE);
  const mesh = new THREE.Mesh(geometry, paperSheet());
  mesh.position.z = -depth / 2;
  return mesh;
}

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

export function fenderArc(
  batch: PaperBatch,
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  color: string,
  z: number,
): void {
  const outer = radius + 0.042;
  const inner = radius + 0.008;
  const shape = new THREE.Shape();
  const steps = 12;
  for (let i = 0; i <= steps; i++) {
    const a = THREE.MathUtils.lerp(startAngle, endAngle, i / steps);
    const x = cx + Math.cos(a) * outer;
    const y = cy + Math.sin(a) * outer;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  for (let i = steps; i >= 0; i--) {
    const a = THREE.MathUtils.lerp(startAngle, endAngle, i / steps);
    shape.lineTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
  }
  shape.closePath();
  shapedCutout(batch, shape, color, 0.042, z);
}

export function softMin(a: number, b: number, k = 0.7): number {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}

export function softMax(a: number, b: number, k = 0.7): number {
  return -softMin(-a, -b, k);
}

export function softClamp(value: number, min: number, max: number, k = 0.7): number {
  return softMin(softMax(value, min, k), max, k);
}
