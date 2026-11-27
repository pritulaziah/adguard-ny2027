import * as THREE from 'three';
import { PaperBatch } from './paper-batch';
import {
  FACE_DEPTH,
  birchLeafGeometry,
  cutGeometry,
  leafGeometry,
  mapleLeafGeometry,
  oakLeafGeometry,
  ovalGeometry,
  rectGeometry,
  shapeGeometry,
  starGeometry,
  strokeGeometry,
  type Outline,
} from './paper-geometry';
import { matrixOf, type Placement } from './paper-placement';

// Build-time scratch matrix. `world` returns it immediately to `put`, which
// passes it to the batch, so the next placement can reuse it.
const scratchWorld = new THREE.Matrix4();

/**
 * One object of the scenery. Static shapes build into the detail's own batch,
 * so every object gets its own mesh and can be culled, moved, or inspected
 * alone. Moving shapes stay separate meshes inside the group, so the animation
 * code keeps working in detail space.
 */
export class PaperDetail {
  readonly group: THREE.Group;
  /** Placement of this frame inside the owning object's local frame. */
  readonly matrix: THREE.Matrix4;
  private readonly batch: PaperBatch;
  private readonly ownsBatch: boolean;

  constructor(
    parent: THREE.Object3D,
    name: string,
    x: number,
    y: number,
    z: number,
    scale = 1,
    frame?: THREE.Matrix4,
    batch?: PaperBatch,
  ) {
    this.group = new THREE.Group();
    this.group.name = name;
    this.group.position.set(x, y, z);
    this.group.scale.setScalar(scale);
    parent.add(this.group);

    this.matrix = frame ?? new THREE.Matrix4();
    this.batch = batch ?? new PaperBatch();
    this.ownsBatch = batch === undefined;
    // A detail never moves. Keep its local matrix fixed so the scene graph does
    // not recompute it on every frame.
    this.group.matrixAutoUpdate = false;
    this.group.updateMatrix();
  }

  /** Builds the static shapes of this object into one geometry. */
  buildGeometry(): THREE.BufferGeometry | null {
    return this.ownsBatch ? this.batch.build() : null;
  }

  /** Writes a local placement in this object's frame into `target`. */
  private compose(local: Placement, target: THREE.Matrix4): THREE.Matrix4 {
    const matrix = matrixOf(local);
    if (!matrix) return target.copy(this.matrix);
    return target.copy(this.matrix).multiply(matrix);
  }

  private world(local: Placement): THREE.Matrix4 {
    return this.compose(local, scratchWorld);
  }

  /** Adds one painted shape at a local placement. */
  private put(
    geometry: THREE.BufferGeometry,
    color: THREE.ColorRepresentation,
    x = 0,
    y = 0,
    z = 0,
    rotate?: [number, number, number],
  ): this {
    this.batch.add(geometry, color, this.world({ x, y, z, rotate }));
    return this;
  }

  child(name: string, x: number, y: number, z: number, scale = 1): PaperDetail {
    const frame = this.compose({ x, y, z, scale: [scale, scale, scale] }, new THREE.Matrix4());
    return new PaperDetail(this.group, name, x, y, z, scale, frame, this.batch);
  }

  raw(
    geometry: THREE.BufferGeometry,
    color: THREE.ColorRepresentation,
    x = 0,
    y = 0,
    z = 0,
    rotate?: [number, number, number],
  ): this {
    return this.put(geometry, color, x, y, z, rotate);
  }

  box(
    width: number,
    height: number,
    depth: number,
    color: THREE.ColorRepresentation,
    x = 0,
    y = 0,
    z = 0,
    rotate?: [number, number, number],
  ): this {
    return this.put(new THREE.BoxGeometry(width, height, depth), color, x, y, z, rotate);
  }

  cut(
    outline: Outline,
    color: THREE.ColorRepresentation,
    x = 0,
    y = 0,
    z = 0,
    rotate?: [number, number, number],
    depth = FACE_DEPTH,
  ): this {
    return this.put(cutGeometry(outline, depth), color, x, y, z, rotate);
  }

  shape(
    shape: THREE.Shape,
    color: THREE.ColorRepresentation,
    x = 0,
    y = 0,
    z = 0,
    rotate?: [number, number, number],
    depth = FACE_DEPTH,
  ): this {
    return this.put(shapeGeometry(shape, depth), color, x, y, z, rotate);
  }

  oval(
    width: number,
    height: number,
    color: THREE.ColorRepresentation,
    x = 0,
    y = 0,
    z = 0,
    rotate?: [number, number, number],
    depth = FACE_DEPTH,
  ): this {
    return this.put(ovalGeometry(width, height, depth), color, x, y, z, rotate);
  }

  rect(
    width: number,
    height: number,
    color: THREE.ColorRepresentation,
    x = 0,
    y = 0,
    z = 0,
    rotate?: [number, number, number],
    depth = FACE_DEPTH,
  ): this {
    return this.put(rectGeometry(width, height, depth), color, x, y, z, rotate);
  }

  mapleLeaf(
    size: number,
    color: THREE.ColorRepresentation,
    x = 0,
    y = 0,
    z = 0,
    rotate?: [number, number, number],
  ): this {
    return this.put(mapleLeafGeometry(size), color, x, y, z, rotate);
  }

  oakLeaf(
    size: number,
    color: THREE.ColorRepresentation,
    x = 0,
    y = 0,
    z = 0,
    rotate?: [number, number, number],
  ): this {
    return this.put(oakLeafGeometry(size), color, x, y, z, rotate);
  }

  birchLeaf(
    size: number,
    color: THREE.ColorRepresentation,
    x = 0,
    y = 0,
    z = 0,
    rotate?: [number, number, number],
  ): this {
    return this.put(birchLeafGeometry(size), color, x, y, z, rotate);
  }

  leaf(
    width: number,
    height: number,
    color: THREE.ColorRepresentation,
    x = 0,
    y = 0,
    z = 0,
    rotate?: [number, number, number],
  ): this {
    this.put(leafGeometry(width, height), color, x, y, z, rotate);
    return this.put(
      strokeGeometry(
        [
          [0, 0.07],
          [0, height * 0.86],
        ],
        0.012,
      ),
      '#b9b491',
      x,
      y,
      z + 0.05,
      rotate,
    );
  }

  star(radius: number, color: THREE.ColorRepresentation, x = 0, y = 0, z = 0): this {
    return this.put(starGeometry(radius), color, x, y, z);
  }

  stroke(points: Outline, color: THREE.ColorRepresentation, width = 0.025, z = 0.1): this {
    return this.put(strokeGeometry(points, width), color, 0, 0, z);
  }
}
