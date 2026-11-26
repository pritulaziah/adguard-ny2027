import * as THREE from 'three';
import type { Interaction } from '../../content/i18n';
import type { PaperDetail } from '../paper-brush';
import type { PartKind } from '../part-motion';
import { oval } from '../paper-shapes';

export interface AnimalBuilderContext {
  detail: (name: string, x: number, z?: number, scale?: number, y?: number) => PaperDetail;
  place: (name: string, x: number, z?: number, scale?: number, y?: number) => THREE.Group;
  animate: (
    mesh: THREE.Object3D,
    kind: PartKind,
    key?: Interaction,
    sparkLift?: number,
  ) => void;
}

export const INK = '#3f4744';
export const CREAM = '#f5ecd7';
export const SNOW = '#f2eee4';
export const BLUSH = '#dfa093';

export function shapeFrom(draw: (shape: THREE.Shape) => void): THREE.Shape {
  const shape = new THREE.Shape();
  draw(shape);
  return shape;
}

export function addGroundShadow(target: PaperDetail, width: number, depth = 0.28, color = '#767a75'): void {
  target.oval(width, depth, color, 0, 0.015, -0.02, [-Math.PI / 2, 0, 0], 0.012);
}

export function addSparkleEye(parent: THREE.Object3D, x: number, y: number, z: number, radius = 0.048, iris?: string): void {
  if (iris) {
    oval(parent, radius * 2.25, radius * 2.25, iris, x, y, z, 0.014);
    oval(parent, radius * 1.35, radius * 1.5, INK, x, y, z + 0.014, 0.014);
    oval(parent, radius * 0.56, radius * 0.56, '#fffdf6', x - radius * 0.25, y + radius * 0.28, z + 0.028, 0.01);
  } else {
    oval(parent, radius * 1.9, radius * 2.1, INK, x, y, z, 0.016);
    oval(parent, radius * 0.62, radius * 0.62, '#fffdf6', x - radius * 0.25, y + radius * 0.3, z + 0.016, 0.01);
  }
}

export function addStaticSparkleEye(parent: PaperDetail, x: number, y: number, z: number, radius = 0.048): void {
  parent.oval(radius * 1.9, radius * 2.1, INK, x, y, z, undefined, 0.016);
  parent.oval(radius * 0.62, radius * 0.62, '#fffdf6', x - radius * 0.24, y + radius * 0.3, z + 0.018, undefined, 0.01);
}
