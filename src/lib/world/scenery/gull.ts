import * as THREE from 'three';
import { cut } from '../paper-shapes';
import { shapeFrom } from './palette';

/** A small two-wing paper gull. The caller binds the flight motion. */
export function addFlyingGull(
  group: THREE.Group,
  x: number,
  y: number,
  size: number,
  add: (bird: THREE.Group) => void,
): void {
  const bird = new THREE.Group();
  bird.position.set(x, y, -7.9);
  group.add(bird);
  for (const side of [-1, 1]) {
    const wing = shapeFrom(s => {
      s.moveTo(0, -0.16 * size);
      s.quadraticCurveTo(side * 0.42 * size, 0.12 * size, side * size, -0.12 * size);
      s.quadraticCurveTo(side * 0.45 * size, 0.36 * size, 0, 0);
      s.closePath();
    });
    const mesh = cut(bird, wing, '#fff4df', 0, 0, 0, 0.016);
    // The gull motion flaps these two meshes by index. Keep them separate.
    mesh.name = side < 0 ? 'gull-wing-left' : 'gull-wing-right';
  }
  add(bird);
}
