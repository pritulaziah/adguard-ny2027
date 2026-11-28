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
