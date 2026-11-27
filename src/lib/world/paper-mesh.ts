import * as THREE from 'three';
import { paint } from './paper-geometry';
import { paperSheet } from './paper-materials';

/**
 * A paper mesh that shares the single sheet material. The colour, and the edge
 * of the folded paper, ride in the vertex colors, so no per-colour material is
 * created and the renderer compiles one shader for all of them.
 */
export function carded(
  geometry: THREE.BufferGeometry,
  color: THREE.ColorRepresentation,
  side?: THREE.ColorRepresentation,
): THREE.Mesh {
  paint(geometry, color, geometry.groups.length === 2 ? 1 : undefined, side);
  return new THREE.Mesh(geometry, paperSheet());
}
