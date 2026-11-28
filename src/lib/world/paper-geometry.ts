import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/** A closed or open polyline in the local plane, from which paper is cut. */
export type Outline = Array<[number, number]>;

export const FACE_DEPTH = 0.045;
export const STROKE_DEPTH = 0.012;

/** Shade of the folded side walls, relative to the lid colour. */
const FOLD = 0.72;

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

export interface FoldShading {
  base: THREE.Color;
  edge: THREE.Color;
  folded: Uint8Array | null;
}

/** Marks the vertices that belong to the material group `foldIndex`. */
function foldMask(geometry: THREE.BufferGeometry, foldIndex: number | undefined): Uint8Array | null {
  if (foldIndex === undefined) return null;
  const position = geometry.getAttribute('position') as THREE.BufferAttribute;
  const index = geometry.getIndex();
  const total = index ? index.count : position.count;
  let folded: Uint8Array | null = null;
  for (const group of geometry.groups) {
    if (group.materialIndex !== foldIndex) continue;
    folded ??= new Uint8Array(position.count);
    const end = Math.min(group.start + group.count, total);
    for (let i = group.start; i < end; i++) folded[index ? index.getX(i) : i] = 1;
  }
  return folded;
}

/**
 * Resolves the lid colour and the fold colour of a shape, and marks the
 * vertices of the folded side walls. `paint` and `PaperBatch` share this rule,
 * so a folded edge gets the same shade in both paths.
 */
export function foldShading(
  geometry: THREE.BufferGeometry,
  value: THREE.ColorRepresentation,
  foldIndex?: number,
  side?: THREE.ColorRepresentation,
): FoldShading {
  const base = new THREE.Color(value);
  const folded = foldMask(geometry, foldIndex);
  if (!folded) return { base, edge: base, folded };
  const edge = side === undefined ? base.clone().multiplyScalar(FOLD) : new THREE.Color(side);
  return { base, edge, folded };
}

/** Bakes the base colour into the color attribute. */
export function paint(
  geometry: THREE.BufferGeometry,
  value: THREE.ColorRepresentation,
  foldIndex?: number,
  side?: THREE.ColorRepresentation,
): THREE.BufferGeometry {
  const { base, edge, folded } = foldShading(geometry, value, foldIndex, side);
  const count = geometry.attributes.position.count;
  const data = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const shade = folded && folded[i] ? edge : base;
    data[i * 3] = shade.r;
    data[i * 3 + 1] = shade.g;
    data[i * 3 + 2] = shade.b;
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(data, 3));
  return geometry;
}

export function cutGeometry(outline: Outline, depth = FACE_DEPTH): THREE.BufferGeometry {
  return extrude(shapeFrom(outline), depth);
}

/** One cached unit oval: one unit wide and one unit high, centred at the origin. */
export function unitOvalGeometry(depth = FACE_DEPTH): THREE.BufferGeometry {
  return template(`oval:${depth}`, () => {
    const shape = new THREE.Shape();
    shape.absellipse(0, 0, 0.5, 0.5, 0, Math.PI * 2, false, 0);
    return extrude(shape, depth);
  });
}

/** A sized oval for one mesh. The caller owns the returned geometry. */
export function ovalGeometry(width: number, height: number, depth = FACE_DEPTH): THREE.BufferGeometry {
  return unitOvalGeometry(depth).clone().scale(width, height, 1);
}

/** One cached unit rectangle: one unit wide and one unit high, from y = 0 to 1. */
export function unitRectGeometry(depth = FACE_DEPTH): THREE.BufferGeometry {
  return template(`rect:${depth}`, () =>
    extrude(
      shapeFrom([
        [-0.5, 0],
        [0.5, 0],
        [0.5, 1],
        [-0.5, 1],
      ]),
      depth,
    ),
  );
}

export function rectGeometry(width: number, height: number, depth = FACE_DEPTH): THREE.BufferGeometry {
  return unitRectGeometry(depth).clone().scale(width, height, 1);
}

/** One cached unit leaf: one unit wide and one unit high, from y = 0 to 1. */
export function unitLeafGeometry(depth = FACE_DEPTH): THREE.BufferGeometry {
  return template(`leaf:${depth}`, () => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(-0.8, 0.35, -0.45, 0.8, 0, 1);
    shape.bezierCurveTo(0.45, 0.8, 0.8, 0.35, 0, 0);
    return extrude(shape, depth);
  });
}

/** One cached unit maple leaf, centred at the origin. */
export function unitMapleLeafGeometry(depth = 0.022): THREE.BufferGeometry {
  return template(`maple:${depth}`, () => {
    const s = 1;
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

export function mapleLeafGeometry(size: number, depth = 0.022): THREE.BufferGeometry {
  return unitMapleLeafGeometry(depth).clone().scale(size, size, 1);
}

/** One cached unit oak leaf, centred at the origin. */
export function unitOakLeafGeometry(depth = 0.022): THREE.BufferGeometry {
  return template(`oak:${depth}`, () => {
    const s = 1;
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

export function oakLeafGeometry(size: number, depth = 0.022): THREE.BufferGeometry {
  return unitOakLeafGeometry(depth).clone().scale(size, size, 1);
}

/** One cached unit birch leaf, centred at the origin. */
export function unitBirchLeafGeometry(depth = 0.022): THREE.BufferGeometry {
  return template(`birch:${depth}`, () => {
    const s = 1;
    const shape = new THREE.Shape();
    shape.moveTo(0, -s * 0.46);
    shape.bezierCurveTo(-s * 0.36, -s * 0.26, -s * 0.32, s * 0.16, 0, s * 0.52);
    shape.bezierCurveTo(s * 0.32, s * 0.16, s * 0.36, -s * 0.26, 0, -s * 0.46);
    shape.closePath();
    return extrude(shape, depth);
  });
}

export function birchLeafGeometry(size: number, depth = 0.022): THREE.BufferGeometry {
  return unitBirchLeafGeometry(depth).clone().scale(size, size, 1);
}

export function shapeGeometry(shape: THREE.Shape, depth = FACE_DEPTH): THREE.BufferGeometry {
  return extrude(shape, depth);
}

/** One cached unit star. The points reach one unit from the centre. */
export function unitStarGeometry(depth = FACE_DEPTH): THREE.BufferGeometry {
  return template(`star:${depth}`, () => {
    const outline: Outline = Array.from({ length: 10 }, (_, i) => {
      const angle = Math.PI / 2 + (i * Math.PI) / 5;
      const r = i % 2 ? 0.45 : 1;
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
    const nx = ((-(yy - y) / length) * width) / 2;
    const ny = (((xx - x) / length) * width) / 2;
    segments.push(
      extrude(
        shapeFrom([
          [x + nx, y + ny],
          [x - nx, y - ny],
          [xx - nx, yy - ny],
          [xx + nx, yy + ny],
        ]),
        depth,
      ),
    );
  }
  if (segments.length === 1) return segments[0];
  const merged = mergeGeometries(segments, false);
  for (const segment of segments) segment.dispose();
  return merged ?? segments[0];
}

/** Number of cached shape templates. A development and test helper. */
export function templateCacheSize(): number {
  return templates.size;
}

export function resetTemplates(): void {
  for (const geometry of templates.values()) geometry.dispose();
  templates.clear();
}
