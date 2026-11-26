import { expect, test } from 'vitest';
import * as THREE from 'three';
import { createPaperScenery } from './scenery/index.ts';
import { createScalarUniform } from './paper-materials.ts';
import { stopX } from './route.ts';

test('every scenery object has its own mesh and keeps colors', async () => {
  globalThis.requestAnimationFrame ??= callback => setTimeout(() => callback(performance.now()), 0);

  const set = await createPaperScenery(createScalarUniform(0));

  expect(set.parts.length).toBeGreaterThan(30);
  for (const part of set.parts) expect(typeof part.apply, part.kind).toBe('function');

  // Anchors that never move stay out of the frame loop.
  expect(set.animated.length).toBeGreaterThan(20);
  expect(set.animated.length).toBeLessThan(set.parts.length);
  expect(set.animated.some(part => part.kind === 'still')).toBe(false);

  for (const part of set.animated) {
    expect(Number.isFinite(part.worldX), part.kind).toBe(true);
    expect(part.worldX).toBeGreaterThan(-20);
    expect(part.worldX).toBeLessThan(120);
  }

  // Static details no longer collapse into two route-wide batches.
  expect(set.group.getObjectByName('folded-paper-details')).toBeUndefined();
  expect(set.group.getObjectByName('folded-paper-firs')).toBeUndefined();

  const objects = [
    ...set.group.getObjectsByProperty('name', 'paper-fir'),
    ...set.group.getObjectsByProperty('name', 'paper-cloud'),
    ...set.group.getObjectsByProperty('name', 'layered-paper-tree-spring-green'),
    ...set.group.getObjectsByProperty('name', 'paper-cabin'),
    ...set.group.getObjectsByProperty('name', 'spring-meadow-cluster'),
  ];
  expect(objects.length).toBeGreaterThan(30);
  for (const object of objects) {
    const mesh = object.children.find(child => child instanceof THREE.Mesh);
    expect(mesh, object.name).toBeInstanceOf(THREE.Mesh);
    const color = mesh.geometry.getAttribute('color');
    expect(color, object.name).toBeTruthy();
    expect(color.count).toBe(mesh.geometry.getAttribute('position').count);
  }

  // Static child shapes merge into the object mesh. Animated parts stay separate.
  let meshes = 0;
  let unnamed = 0;
  set.group.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    meshes++;
    if (!object.name) unnamed++;
  });
  expect(meshes).toBeLessThan(260);
  expect(unnamed).toBeLessThan(60);

  // Each story after winter has one fact on either side of its centre.
  const pairs = [['fox', 'hedgehog'], ['bird', 'frog'], ['duck', 'beaver'], ['bunny', 'squirrel'], ['cat', 'owl']];
  expect([...set.objects.keys()].sort()).toEqual(['deer', 'snowman', ...pairs.flat()].sort());
  set.group.updateMatrixWorld(true);
  for (const [index, pair] of pairs.entries()) {
    const centre = stopX(index + 2);
    const left = set.objects.get(pair[0]).getWorldPosition(new THREE.Vector3());
    const right = set.objects.get(pair[1]).getWorldPosition(new THREE.Vector3());
    expect(left.x, `${pair[0]} is left of its story`).toBeLessThan(centre - 2);
    expect(right.x, `${pair[1]} is right of its story`).toBeGreaterThan(centre + 2);
    expect(centre - left.x).toBeLessThan(4.5);
    expect(right.x - centre).toBeLessThan(4.5);
  }
  expect(set.group.getObjectByName('paper-willow')).toBeUndefined();
  expect(set.group.getObjectsByProperty('name', 'paper-cabin')).toHaveLength(1);
}, 60000);

test('every animated part can run its motion', async () => {
  globalThis.requestAnimationFrame ??= callback => setTimeout(() => callback(performance.now()), 0);
  const set = await createPaperScenery(createScalarUniform(0));
  for (const part of set.animated) {
    expect(
      () => part.apply(part, {
        time: 1,
        delta: 1 / 60,
        reduced: false,
        distance: part.worldX,
        gullArrivalAt: 0,
      }),
      part.kind,
    ).not.toThrow();
  }
}, 60000);

test('perched birds keep two small feet attached while reacting', async () => {
  globalThis.requestAnimationFrame ??= callback => setTimeout(() => callback(performance.now()), 0);
  const set = await createPaperScenery(createScalarUniform(0));
  set.group.updateMatrixWorld(true);
  for (const key of ['bird', 'owl']) {
    const anchor = set.objects.get(key);
    const body = key === 'owl' ? anchor.parent : anchor;
    const feet = ['left', 'right'].map(side => body.getObjectByName(`${key}-foot-${side}`));
    for (const foot of feet) {
      expect(Boolean(foot), `${key} has two feet inside its body group`).toBe(true);
      const size = new THREE.Box3().setFromObject(foot).getSize(new THREE.Vector3());
      expect(size.y, `${key} feet stay small`).toBeLessThan(0.13);
      const branchFace = body.parent.localToWorld(new THREE.Vector3(0, 0, 0.112));
      expect(new THREE.Box3().setFromObject(foot).max.z, `${key} toes remain visible over the branch`).toBeGreaterThan(branchFace.z);
    }
    const before = feet.map(foot => foot.getWorldPosition(new THREE.Vector3()));
    for (const time of [0.05, 0.2, 0.7]) {
      for (const part of set.parts.filter(part => part.key === key)) {
        part.startedAt = 0;
        part.apply(part, { time, delta: 1 / 60, reduced: false, distance: part.worldX });
      }
      set.group.updateMatrixWorld(true);
      feet.forEach((foot, index) => {
        expect(foot.getWorldPosition(new THREE.Vector3()).distanceTo(before[index]), `${key} keeps its grip during a reaction`).toBeLessThan(1e-6);
      });
    }
  }
}, 60000);

test('small animals keep their relative size and pond foliage stays clear', async () => {
  globalThis.requestAnimationFrame ??= callback => setTimeout(() => callback(performance.now()), 0);
  const set = await createPaperScenery(createScalarUniform(0));
  set.group.updateMatrixWorld(true);
  for (const [key, width, height] of [
    ['hedgehog', 0.95, 0.6],
    ['bird', 0.6, 0.5],
    ['squirrel', 0.95, 1.1],
    ['owl', 0.65, 1.0],
  ]) {
    const anchor = set.objects.get(key);
    const figure = key === 'owl' ? anchor.parent : anchor;
    const size = new THREE.Box3().setFromObject(figure).getSize(new THREE.Vector3());
    expect(size.x, `${key} width`).toBeLessThanOrEqual(width);
    expect(size.y, `${key} height`).toBeLessThanOrEqual(height);
  }
  const squirrel = set.objects.get('squirrel');
  const tail = set.parts.find(part => part.key === 'squirrel' && part.mesh !== squirrel).mesh;
  expect(squirrel.getObjectById(tail.id), 'tail follows the body').toBe(tail);
  const frogX = stopX(3) + 3.05;
  for (const flowers of set.group.getObjectsByProperty('name', 'spring-meadow-cluster')) {
    expect(Math.abs(flowers.position.x - frogX), 'flowers stay outside the pond').toBeGreaterThan(1.5);
  }
}, 60000);


test('river tree canopies stay clear of the autumn trees and the central story', async () => {
  const { PaperDetail } = await import('./paper-brush.ts');
  const { addSummerRiver } = await import('./scenery/river/index.ts');
  const root = new THREE.Group();
  const details = [];
  addSummerRiver({
    detail: (name, x, z = 0, scale = 1, y = 0.34) => {
      const detail = new PaperDetail(root, name, x, y, z, scale);
      details.push(detail);
      return detail;
    },
    place: (name, x, z = 0, scale = 1, y = 0.34) => {
      const group = new THREE.Group();
      group.name = name;
      group.position.set(x, y, z);
      group.scale.setScalar(scale);
      root.add(group);
      return group;
    },
    animate: () => {},
  });
  const trees = details.filter(detail => ['river-weeping-willow', 'river-alder'].includes(detail.group.name));
  expect(trees).toHaveLength(2);
  for (const detail of trees) {
    const geometry = detail.buildGeometry();
    expect(geometry, detail.group.name).not.toBeNull();
    const mesh = new THREE.Mesh(geometry);
    detail.group.add(mesh);
    root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(mesh);
    // The first autumn canopy begins near stopX(4) + 4.9.
    expect(box.max.x).toBeLessThan(stopX(4) + 4.8);
    expect(box.min.x).toBeGreaterThan(stopX(4) - 6.0);
    const inCentre = box.min.x < stopX(4) + 2 && box.max.x > stopX(4) - 2;
    expect(inCentre, `${detail.group.name} stays outside the story column`).toBe(false);
    geometry.dispose();
  }
});
