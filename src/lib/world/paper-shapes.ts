import * as THREE from 'three';
import { carded } from './paper-mesh';
import { cutGeometry, ovalGeometry, rectGeometry, leafGeometry, starGeometry, strokeGeometry } from './paper-brush';

export type Outline = Array<[number, number]>;

function place(
  parent: THREE.Object3D,
  geometry: THREE.BufferGeometry,
  color: string,
  x: number,
  y: number,
  z: number,
  side?: string,
): THREE.Mesh {
  const mesh = carded(geometry, color, side);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

export function cut(
  parent: THREE.Object3D,
  outline: Outline | THREE.Shape,
  color: string,
  x = 0,
  y = 0,
  z = 0,
  depth = 0.045,
  side?: string,
): THREE.Mesh {
  const geometry = outline instanceof THREE.Shape
    ? new THREE.ExtrudeGeometry(outline, { depth, bevelEnabled: false, curveSegments: 12 })
    : cutGeometry(outline, depth);
  return place(parent, geometry, color, x, y, z, side);
}

export function oval(parent: THREE.Object3D, width: number, height: number, color: string, x = 0, y = 0, z = 0): THREE.Mesh {
  return place(parent, ovalGeometry(width, height), color, x, y, z);
}

export function rect(parent: THREE.Object3D, width: number, height: number, color: string, x = 0, y = 0, z = 0): THREE.Mesh {
  return place(parent, rectGeometry(width, height), color, x, y, z);
}

export function stroke(parent: THREE.Object3D, points: Outline, color: string, width = 0.025, z = 0.1): void {
  place(parent, strokeGeometry(points, width), color, 0, 0, z);
}

export function leaf(parent: THREE.Object3D, width: number, height: number, color: string, x: number, y: number, z = 0): THREE.Mesh {
  const mesh = place(parent, leafGeometry(width, height), color, x, y, z);
  stroke(mesh, [[0, 0.07], [0, height * 0.86]], '#b9b491', 0.012, 0.05);
  return mesh;
}

export function star(parent: THREE.Object3D, radius: number, color: string, x: number, y: number, z = 0): THREE.Mesh {
  return place(parent, starGeometry(radius), color, x, y, z);
}
