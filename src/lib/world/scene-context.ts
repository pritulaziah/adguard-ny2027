import type * as THREE from 'three';
import type { Interaction } from '../content/i18n';
import type { PaperDetail } from './paper-brush';
import type { ScalarUniform } from './paper-materials';
import type { PartKind } from './part-motion';

/** Builders receive these helpers, so an object module owns no scene plumbing. */
export interface BuilderContext {
  detail: (name: string, x: number, z?: number, scale?: number, y?: number) => PaperDetail;
  place: (name: string, x: number, z?: number, scale?: number, y?: number) => THREE.Group;
  animate: (
    mesh: THREE.Object3D,
    kind: PartKind,
    key?: Interaction,
    sparkLift?: number,
    sparkOffsetX?: number,
  ) => void;
}

/** The scenery context adds the root group and the camera uniform. */
export interface SceneryContext extends BuilderContext {
  group: THREE.Group;
  cameraX: ScalarUniform;
}
