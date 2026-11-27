import * as THREE from 'three';
import { foldShading } from './paper-geometry';
import { matrixOf, type Placement } from './paper-placement';

const scratchVertex = new THREE.Vector3();

/**
 * Collects painted shapes and writes their transformed vertices straight into
 * growable position and color arrays. One buffer per batch means one draw call,
 * and no per-shape geometry clone, paint pass, or merge pass at build time.
 */
export class PaperBatch {
  private positions: number[] = [];
  private colors: number[] = [];
  private parts = 0;

  get size(): number {
    return this.parts;
  }

  add(
    geometry: THREE.BufferGeometry,
    color: THREE.ColorRepresentation,
    at: Placement | THREE.Matrix4 = {},
    side?: THREE.ColorRepresentation,
  ): this {
    const matrix = at instanceof THREE.Matrix4 ? at : matrixOf(at);
    const position = geometry.getAttribute('position') as THREE.BufferAttribute;
    const index = geometry.getIndex();
    const vertexCount = position.count;
    const total = index ? index.count : vertexCount;

    // An extrusion has exactly two groups: lid and folded side walls.
    // Box and cylinder groups stay flat, as `paint` did before.
    const { base, edge, folded } = foldShading(geometry, color, geometry.groups.length === 2 ? 1 : undefined, side);
    const positions = this.positions;
    const colors = this.colors;
    for (let i = 0; i < total; i++) {
      const vertex = index ? index.getX(i) : i;
      scratchVertex.fromBufferAttribute(position, vertex);
      if (matrix) scratchVertex.applyMatrix4(matrix);
      positions.push(scratchVertex.x, scratchVertex.y, scratchVertex.z);
      const shade = folded && folded[vertex] ? edge : base;
      colors.push(shade.r, shade.g, shade.b);
    }

    this.parts++;
    return this;
  }

  build(): THREE.BufferGeometry | null {
    if (this.parts === 0) return null;
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(this.positions), 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(this.colors), 3));
    geometry.computeBoundingSphere();
    this.positions = [];
    this.colors = [];
    this.parts = 0;
    return geometry;
  }
}
