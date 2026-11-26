import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export type Outline = Array<[number, number]>;

export const FACE_DEPTH = 0.045;
export const STROKE_DEPTH = 0.012;

export interface Placement {
  x?: number;
  y?: number;
  z?: number;
  rotate?: [number, number, number];
  scale?: [number, number, number];
}

const templates = new Map<string, THREE.BufferGeometry>();

function template(key: string, make: () => THREE.BufferGeometry): THREE.BufferGeometry {
  const cached = templates.get(key);
  if (cached) return cached;
  const geometry = make();
  templates.set(key, geometry);
  return geometry;
}

function extrude(shape: THREE.Shape, depth: number): THREE.BufferGeometry {
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 12 });
}

function shapeFrom(outline: Outline): THREE.Shape {
  const shape = new THREE.Shape();
  outline.forEach(([x, y], index) => (index ? shape.lineTo(x, y) : shape.moveTo(x, y)));
  shape.closePath();
  return shape;
}

const FOLD = 0.72;

/**
 * Bakes the base colour into the color attribute. `foldIndex` names the material
 * group of the folded edge, so the side walls keep the darker shade.
 */
export function paint(
  geometry: THREE.BufferGeometry,
  value: THREE.ColorRepresentation,
  foldIndex?: number,
  side?: THREE.ColorRepresentation,
): THREE.BufferGeometry {
  const color = new THREE.Color(value);
  const count = geometry.attributes.position.count;
  const data = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    data[i * 3] = color.r;
    data[i * 3 + 1] = color.g;
    data[i * 3 + 2] = color.b;
  }

  if (foldIndex !== undefined) {
    const edge = side === undefined ? null : new THREE.Color(side);
    for (const group of geometry.groups) {
      if (group.materialIndex !== foldIndex) continue;
      const end = Math.min(group.start + group.count, count);
      for (let i = group.start; i < end; i++) {
        if (edge) {
          data[i * 3] = edge.r;
          data[i * 3 + 1] = edge.g;
          data[i * 3 + 2] = edge.b;
        } else {
          data[i * 3] *= FOLD;
          data[i * 3 + 1] *= FOLD;
          data[i * 3 + 2] *= FOLD;
        }
      }
    }
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(data, 3));
  return geometry;
}

export function cutGeometry(outline: Outline, depth = FACE_DEPTH): THREE.BufferGeometry {
  return extrude(shapeFrom(outline), depth);
}

export function ovalGeometry(width: number, height: number, depth = FACE_DEPTH): THREE.BufferGeometry {
  return template(`oval:${width}:${height}:${depth}`, () => {
    const shape = new THREE.Shape();
    shape.absellipse(0, 0, width / 2, height / 2, 0, Math.PI * 2, false, 0);
    return extrude(shape, depth);
  });
}

export function rectGeometry(width: number, height: number, depth = FACE_DEPTH): THREE.BufferGeometry {
  return template(`rect:${width}:${height}:${depth}`, () =>
    extrude(shapeFrom([[-width / 2, 0], [width / 2, 0], [width / 2, height], [-width / 2, height]]), depth),
  );
}

export function leafGeometry(width: number, height: number, depth = FACE_DEPTH): THREE.BufferGeometry {
  return template(`leaf:${width}:${height}:${depth}`, () => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(-width * 0.8, height * 0.35, -width * 0.45, height * 0.8, 0, height);
    shape.bezierCurveTo(width * 0.45, height * 0.8, width * 0.8, height * 0.35, 0, 0);
    return extrude(shape, depth);
  });
}

export function mapleLeafGeometry(size: number, depth = 0.022): THREE.BufferGeometry {
  return template(`maple:${size}:${depth}`, () => {
    const s = size;
    const shape = new THREE.Shape();
    shape.moveTo(0, -s * 0.56);
    shape.lineTo(-s * 0.05, -s * 0.32);
    shape.lineTo(-s * 0.42, -s * 0.38);
    shape.lineTo(-s * 0.3, -s * 0.14);
    shape.lineTo(-s * 0.54, s * 0.04);
    shape.lineTo(-s * 0.24, s * 0.12);
    shape.lineTo(-s * 0.32, s * 0.42);
    shape.lineTo(-s * 0.1, s * 0.31);
    shape.lineTo(0, s * 0.56);
    shape.lineTo(s * 0.1, s * 0.31);
    shape.lineTo(s * 0.32, s * 0.42);
    shape.lineTo(s * 0.24, s * 0.12);
    shape.lineTo(s * 0.54, s * 0.04);
    shape.lineTo(s * 0.3, -s * 0.14);
    shape.lineTo(s * 0.42, -s * 0.38);
    shape.lineTo(s * 0.05, -s * 0.32);
    shape.closePath();
    return extrude(shape, depth);
  });
}

export function oakLeafGeometry(size: number, depth = 0.022): THREE.BufferGeometry {
  return template(`oak:${size}:${depth}`, () => {
    const s = size;
    const shape = new THREE.Shape();
    shape.moveTo(0, -s * 0.55);
    shape.quadraticCurveTo(-s * 0.26, -s * 0.42, -s * 0.18, -s * 0.22);
    shape.quadraticCurveTo(-s * 0.38, -s * 0.1, -s * 0.22, s * 0.06);
    shape.quadraticCurveTo(-s * 0.36, s * 0.22, -s * 0.16, s * 0.34);
    shape.quadraticCurveTo(-s * 0.14, s * 0.54, 0, s * 0.56);
    shape.quadraticCurveTo(s * 0.14, s * 0.54, s * 0.16, s * 0.34);
    shape.quadraticCurveTo(s * 0.36, s * 0.22, s * 0.22, s * 0.06);
    shape.quadraticCurveTo(s * 0.38, -s * 0.1, s * 0.18, -s * 0.22);
    shape.quadraticCurveTo(s * 0.26, -s * 0.42, 0, -s * 0.55);
    shape.closePath();
    return extrude(shape, depth);
  });
}

export function birchLeafGeometry(size: number, depth = 0.022): THREE.BufferGeometry {
  return template(`birch:${size}:${depth}`, () => {
    const s = size;
    const shape = new THREE.Shape();
    shape.moveTo(0, -s * 0.46);
    shape.bezierCurveTo(-s * 0.36, -s * 0.26, -s * 0.32, s * 0.16, 0, s * 0.52);
    shape.bezierCurveTo(s * 0.32, s * 0.16, s * 0.36, -s * 0.26, 0, -s * 0.46);
    shape.closePath();
    return extrude(shape, depth);
  });
}

export function shapeGeometry(shape: THREE.Shape, depth = FACE_DEPTH): THREE.BufferGeometry {
  return extrude(shape, depth);
}

export function starGeometry(radius: number, depth = FACE_DEPTH): THREE.BufferGeometry {
  return template(`star:${radius}:${depth}`, () => {
    const outline: Outline = Array.from({ length: 10 }, (_, i) => {
      const angle = Math.PI / 2 + i * Math.PI / 5;
      const r = radius * (i % 2 ? 0.45 : 1);
      return [Math.cos(angle) * r, Math.sin(angle) * r] as [number, number];
    });
    return extrude(shapeFrom(outline), depth);
  });
}

/** One ribbon per segment, merged, so a polyline stays a single part. */
export function strokeGeometry(points: Outline, width: number, depth = STROKE_DEPTH): THREE.BufferGeometry {
  const segments: THREE.BufferGeometry[] = [];
  for (let i = 1; i < points.length; i++) {
    const [x, y] = points[i - 1];
    const [xx, yy] = points[i];
    const length = Math.hypot(xx - x, yy - y) || 1;
    const nx = -(yy - y) / length * width / 2;
    const ny = (xx - x) / length * width / 2;
    segments.push(extrude(shapeFrom([[x + nx, y + ny], [x - nx, y - ny], [xx - nx, yy - ny], [xx + nx, yy + ny]]), depth));
  }
  if (segments.length === 1) return segments[0];
  const merged = mergeGeometries(segments, false);
  for (const segment of segments) segment.dispose();
  return merged ?? segments[0];
}

function matrixOf(at: Placement): THREE.Matrix4 | null {
  const { x = 0, y = 0, z = 0, rotate, scale } = at;
  if (!rotate && !scale && !x && !y && !z) return null;
  const position = new THREE.Vector3(x, y, z);
  const quaternion = new THREE.Quaternion();
  if (rotate) quaternion.setFromEuler(new THREE.Euler(rotate[0], rotate[1], rotate[2]));
  const size = scale ? new THREE.Vector3(scale[0], scale[1], scale[2]) : new THREE.Vector3(1, 1, 1);
  return new THREE.Matrix4().compose(position, quaternion, size);
}

/** Collects painted shapes and merges them into one buffer, so a detail costs one draw call. */
export class PaperBatch {
  private parts: THREE.BufferGeometry[] = [];

  get size(): number {
    return this.parts.length;
  }

  add(
    geometry: THREE.BufferGeometry,
    color: THREE.ColorRepresentation,
    at: Placement | THREE.Matrix4 = {},
  ): this {
    let part = geometry.clone();
    const matrix = at instanceof THREE.Matrix4 ? at : matrixOf(at);
    if (matrix) part.applyMatrix4(matrix);
    // Merging needs one attribute layout and no mixed indexing: extrusions are
    // non-indexed, boxes are indexed.
    if (part.index) part = part.toNonIndexed();
    // An extrusion has exactly two groups: lid and folded side walls.
    this.parts.push(paint(part, color, part.groups.length === 2 ? 1 : undefined));
    return this;
  }

  build(): THREE.BufferGeometry | null {
    if (this.parts.length === 0) return null;
    if (this.parts.length === 1) return this.parts[0];
    const merged = mergeGeometries(this.parts, false);
    for (const part of this.parts) part.dispose();
    this.parts = merged ? [merged] : [];
    return merged;
  }
}

export function resetTemplates(): void {
  for (const geometry of templates.values()) geometry.dispose();
  templates.clear();
}

/**
 * One detail of the scenery. Static shapes go into the shared batch and cost no
 * draw call of their own. Moving shapes stay separate meshes inside the group,
 * so the animation code keeps working in detail space.
 */
export class PaperDetail {
  readonly group: THREE.Group;
  readonly matrix: THREE.Matrix4;

  constructor(
    private readonly batch: PaperBatch,
    parent: THREE.Object3D,
    name: string,
    x: number,
    y: number,
    z: number,
    scale = 1,
    parentMatrix?: THREE.Matrix4,
  ) {
    this.group = new THREE.Group();
    this.group.name = name;
    this.group.position.set(x, y, z);
    this.group.scale.setScalar(scale);
    parent.add(this.group);

    const local = new THREE.Matrix4().compose(
      this.group.position,
      this.group.quaternion,
      this.group.scale,
    );
    this.matrix = parentMatrix ? parentMatrix.clone().multiply(local) : local;
  }

  private world(local: Placement): THREE.Matrix4 {
    const matrix = matrixOf(local) ?? new THREE.Matrix4();
    return this.matrix.clone().multiply(matrix);
  }

  child(name: string, x: number, y: number, z: number, scale = 1): PaperDetail {
    return new PaperDetail(this.batch, this.group, name, x, y, z, scale, this.matrix);
  }

  raw(geometry: THREE.BufferGeometry, color: THREE.ColorRepresentation, x = 0, y = 0, z = 0, rotate?: [number, number, number]): this {
    this.batch.add(geometry, color, this.world({ x, y, z, rotate }));
    return this;
  }

  box(width: number, height: number, depth: number, color: THREE.ColorRepresentation, x = 0, y = 0, z = 0, rotate?: [number, number, number]): this {
    return this.raw(new THREE.BoxGeometry(width, height, depth), color, x, y, z, rotate);
  }

  cut(outline: Outline, color: THREE.ColorRepresentation, x = 0, y = 0, z = 0, rotate?: [number, number, number], depth = FACE_DEPTH): this {
    this.batch.add(cutGeometry(outline, depth), color, this.world({ x, y, z, rotate }));
    return this;
  }

  shape(shape: THREE.Shape, color: THREE.ColorRepresentation, x = 0, y = 0, z = 0, rotate?: [number, number, number], depth = FACE_DEPTH): this {
    this.batch.add(shapeGeometry(shape, depth), color, this.world({ x, y, z, rotate }));
    return this;
  }

  oval(width: number, height: number, color: THREE.ColorRepresentation, x = 0, y = 0, z = 0, rotate?: [number, number, number], depth = FACE_DEPTH): this {
    this.batch.add(ovalGeometry(width, height, depth), color, this.world({ x, y, z, rotate }));
    return this;
  }

  rect(width: number, height: number, color: THREE.ColorRepresentation, x = 0, y = 0, z = 0, rotate?: [number, number, number], depth = FACE_DEPTH): this {
    this.batch.add(rectGeometry(width, height, depth), color, this.world({ x, y, z, rotate }));
    return this;
  }

  mapleLeaf(size: number, color: THREE.ColorRepresentation, x = 0, y = 0, z = 0, rotate?: [number, number, number]): this {
    this.batch.add(mapleLeafGeometry(size), color, this.world({ x, y, z, rotate }));
    return this;
  }

  oakLeaf(size: number, color: THREE.ColorRepresentation, x = 0, y = 0, z = 0, rotate?: [number, number, number]): this {
    this.batch.add(oakLeafGeometry(size), color, this.world({ x, y, z, rotate }));
    return this;
  }

  birchLeaf(size: number, color: THREE.ColorRepresentation, x = 0, y = 0, z = 0, rotate?: [number, number, number]): this {
    this.batch.add(birchLeafGeometry(size), color, this.world({ x, y, z, rotate }));
    return this;
  }

  leaf(width: number, height: number, color: THREE.ColorRepresentation, x = 0, y = 0, z = 0, rotate?: [number, number, number]): this {
    this.batch.add(leafGeometry(width, height), color, this.world({ x, y, z, rotate }));
    this.batch.add(strokeGeometry([[0, 0.07], [0, height * 0.86]], 0.012), '#b9b491', this.world({ x, y, z: z + 0.05, rotate }));
    return this;
  }

  star(radius: number, color: THREE.ColorRepresentation, x = 0, y = 0, z = 0): this {
    this.batch.add(starGeometry(radius), color, this.world({ x, y, z }));
    return this;
  }

  stroke(points: Outline, color: THREE.ColorRepresentation, width = 0.025, z = 0.1): this {
    this.batch.add(strokeGeometry(points, width), color, this.world({ z }));
    return this;
  }
}
