import { expect, test } from 'vitest';
import * as THREE from 'three';
import { PaperDetail } from '../paper-detail.ts';
import { Beehive, Bird, Bunny, Cat, Cow, Deer, Fox, Hedgehog, Owl, PondWithFrog, Snowman, Squirrel } from './index.ts';

const ANIMALS = [Deer, Snowman, Fox, PondWithFrog, Hedgehog, Bird, Squirrel, Owl, Cow, Beehive, Cat, Bunny];

function context() {
  const root = new THREE.Group();
  const details = [];
  const parts = [];
  return {
    root,
    details,
    parts,
    ctx: {
      detail: (name, x, z = -1.1, scale = 1, y = 0.34) => {
        const detail = new PaperDetail(root, name, x, y, z, scale);
        details.push(detail);
        return detail;
      },
      animate: (mesh, kind, key) => parts.push({ mesh, kind, key }),
    },
  };
}

test('every animal paints one named detail and registers its motions', () => {
  const { details, parts, ctx } = context();

  for (const Animal of ANIMALS) new Animal(ctx, 0).build();

  expect(details).toHaveLength(ANIMALS.length);
  expect(new Set(details.map(detail => detail.group.name)).size).toBe(ANIMALS.length);
  expect(parts.length).toBeGreaterThan(ANIMALS.length);
  for (const part of parts) expect(part.mesh).toBeInstanceOf(THREE.Object3D);
});

test('a built animal does not paint twice', () => {
  const { parts, ctx } = context();
  const cat = new Cat(ctx, 0);

  cat.build();
  const painted = parts.length;
  cat.build();

  expect(painted).toBeGreaterThan(0);
  expect(parts.length).toBe(painted);
});

test('the deer has an uncovered tan neck', () => {
  const { ctx } = context();
  const detail = new Deer(ctx, 0).build();
  const geometry = detail.buildGeometry();
  const material = new THREE.MeshBasicMaterial();
  detail.group.add(new THREE.Mesh(geometry, material));
  detail.group.updateWorldMatrix(true, true);
  const ray = new THREE.Raycaster();

  try {
    for (const [x, y] of [
      [0.3, 0.9],
      [0.3, 0.87],
      [0.18, 0.7],
    ]) {
      ray.set(detail.group.localToWorld(new THREE.Vector3(x, y, 1)), new THREE.Vector3(0, 0, -1));
      const hit = ray.intersectObject(detail.group, true)[0];
      expect(hit, `visible neck at ${x}, ${y}`).toBeDefined();
      const color = new THREE.Color().fromBufferAttribute(hit.object.geometry.getAttribute('color'), hit.face.a);
      expect(color.getHexString()).toBe('c29978');
    }
  } finally {
    geometry.dispose();
    material.dispose();
  }
});

test('the deer layers its legs behind a rounded torso like the cow', () => {
  const { ctx } = context();
  const detail = new Deer(ctx, 0).build();
  const geometry = detail.buildGeometry();
  const material = new THREE.MeshBasicMaterial();
  detail.group.add(new THREE.Mesh(geometry, material));
  detail.group.updateWorldMatrix(true, true);
  const ray = new THREE.Raycaster();

  function hitAt(x, y) {
    ray.set(detail.group.localToWorld(new THREE.Vector3(x, y, 1)), new THREE.Vector3(0, 0, -1));
    const hit = ray.intersectObject(detail.group, true)[0];
    expect(hit, `visible paper at ${x}, ${y}`).toBeDefined();
    return {
      hex: new THREE.Color().fromBufferAttribute(hit.object.geometry.getAttribute('color'), hit.face.a).getHexString(),
      z: detail.group.worldToLocal(hit.point.clone()).z,
    };
  }

  try {
    // Lower torso and belly cover the leg tops without raised attachment edges.
    for (const [x, y, expected] of [
      [-0.3, 0.52, 'c29978'],
      [-0.19, 0.48, 'c29978'],
      [0, 0.46, 'eadbc2'],
      [0.25, 0.5, 'c29978'],
    ]) {
      const hit = hitAt(x, y);
      expect(hit.hex, `torso/belly color at ${x}, ${y}`).toBe(expected);
      expect(hit.z, `torso/belly front plane at ${x}, ${y}`).toBeGreaterThanOrEqual(0.043);
    }

    // Near legs sit strictly behind the torso front face and in front of far legs.
    for (const x of [-0.19, 0.25]) {
      const leg = hitAt(x, 0.25);
      expect(leg.hex, `near leg at ${x}`).toBe('b58d6f');
      expect(leg.z, `near leg behind torso at ${x}`).toBeLessThan(0.044);
      expect(leg.z, `near leg in front of far leg at ${x}`).toBeGreaterThan(0.01);
      expect(hitAt(x, 0.04).hex, `near hoof at ${x}`).toBe('4b403a');
    }
    for (const x of [-0.3, 0.14]) {
      const leg = hitAt(x, 0.25);
      expect(leg.hex, `far leg at ${x}`).toBe('9e7c64');
      expect(leg.z, `far leg behind torso at ${x}`).toBeLessThanOrEqual(0.001);
      expect(hitAt(x, 0.04).hex, `far hoof at ${x}`).toBe('564a43');
    }
  } finally {
    geometry.dispose();
    material.dispose();
  }
});

test('the cow collar follows the neck into a ring above the bell', () => {
  const { ctx } = context();
  const detail = new Cow(ctx, 0).build();
  const geometry = detail.buildGeometry();
  const material = new THREE.MeshBasicMaterial();
  detail.group.add(new THREE.Mesh(geometry, material));
  detail.group.updateWorldMatrix(true, true);
  const ray = new THREE.Raycaster();

  function visibleColor(x, y) {
    const origin = detail.group.localToWorld(new THREE.Vector3(x, y, 1));
    ray.set(origin, new THREE.Vector3(0, 0, -1));
    const hit = ray.intersectObject(detail.group, true)[0];
    expect(hit, `visible paper at ${x}, ${y}`).toBeDefined();
    return new THREE.Color().fromBufferAttribute(hit.object.geometry.getAttribute('color'), hit.face.a);
  }

  try {
    for (const [x, y] of [
      [0.28, 0.9],
      [0.33, 0.77],
      [0.45, 0.69],
    ]) {
      expect(visibleColor(x, y).getHexString()).toBe('956346');
    }
    expect(visibleColor(0.51, 0.645).getHexString()).toBe('b88c34');
    expect(visibleColor(0.51, 0.59).getHexString()).toBe('e4b956');
    expect(visibleColor(0.51, 0.485).getHexString()).toBe('b88c34');
  } finally {
    geometry.dispose();
    material.dispose();
  }
});
