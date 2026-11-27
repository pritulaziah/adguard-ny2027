import * as THREE from 'three';

export interface Placement {
  x?: number;
  y?: number;
  z?: number;
  rotate?: [number, number, number];
  scale?: [number, number, number];
}

// Build-time scratch objects. The caller consumes the result immediately, so
// one set serves every placement and the build stops allocating vectors.
const scratchPosition = new THREE.Vector3();
const scratchQuaternion = new THREE.Quaternion();
const scratchEuler = new THREE.Euler();
const scratchScale = new THREE.Vector3();
const scratchMatrix = new THREE.Matrix4();

/**
 * Writes a placement into `target`. Returns null for an identity placement, so
 * the caller can skip the matrix multiply.
 */
export function matrixOf(at: Placement, target: THREE.Matrix4 = scratchMatrix): THREE.Matrix4 | null {
  const { x = 0, y = 0, z = 0, rotate, scale } = at;
  if (!rotate && !scale && !x && !y && !z) return null;
  scratchPosition.set(x, y, z);
  if (rotate) scratchQuaternion.setFromEuler(scratchEuler.set(rotate[0], rotate[1], rotate[2]));
  else scratchQuaternion.identity();
  if (scale) scratchScale.set(scale[0], scale[1], scale[2]);
  else scratchScale.set(1, 1, 1);
  return target.compose(scratchPosition, scratchQuaternion, scratchScale);
}
