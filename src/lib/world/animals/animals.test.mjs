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
