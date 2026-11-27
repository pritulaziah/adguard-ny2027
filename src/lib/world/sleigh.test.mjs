import { expect, test } from 'vitest';
import * as THREE from 'three';
import { createSeasonalFleet } from './vehicles/index.ts';
import { createSleighSnow } from './vehicles/sleigh-snow.ts';
import { SLEIGH_REAR_X } from './vehicles/sleigh.ts';
import { JOURNEY_END } from './route.ts';

test('both sleighs are smaller than the minivan at the same route depth', () => {
  const scene = new THREE.Scene();
  const fleet = createSeasonalFleet(scene);
  fleet.update(0, 1 / 60, 0, true);
  const van = new THREE.Box3()
    .setFromObject(scene.getObjectByName('paper-autumn-minivan'))
    .getSize(new THREE.Vector3());
  for (const style of ['winter', 'festive']) {
    const size = new THREE.Box3()
      .setFromObject(scene.getObjectByName(`paper-sleigh-${style}`))
      .getSize(new THREE.Vector3());
    expect(size.x).toBeLessThan(van.x * 0.85);
    expect(size.y).toBeLessThan(van.y * 0.75);
  }
});

test('both winter scenes use standalone sleighs without teams or traces', () => {
  const scene = new THREE.Scene();
  const fleet = createSeasonalFleet(scene);
  fleet.update(0, 1 / 60, 0, false);
  expect(scene.getObjectByName('paper-sleigh-winter')).toBeTruthy();
  expect(scene.getObjectByName('paper-sleigh-festive')).toBeTruthy();
  expect(scene.getObjectsByProperty('name', 'paper-husky')).toHaveLength(0);
  expect(scene.getObjectsByProperty('name', 'paper-reindeer')).toHaveLength(0);
  expect(scene.getObjectByName('paper-sleigh-traces')).toBeUndefined();
  expect(scene.getObjectByName('paper-train-body-0')).toBeUndefined();
  const sled = scene.getObjectByName('paper-sleigh-festive');
  fleet.update(JOURNEY_END, 1 / 60, 1, false);
  const parkedX = sled.position.x;
  fleet.update(JOURNEY_END, 1 / 60, 1, false, 9);
  expect(sled.position.x - parkedX).toBeCloseTo(9);
});

test('snow trails behind the sleigh, stops emitting at rest, and clears with reduced motion', () => {
  const scene = new THREE.Scene();
  const update = createSleighSnow(scene, 'test-sleigh-snow');
  const snow = scene.getObjectByName('test-sleigh-snow');
  update(0, 0, 1 / 60, false);
  expect(snow.count).toBe(0);
  for (let frame = 0; frame < 20; frame++) update(frame / 30, 2, 1 / 60, false);
  expect(snow.count).toBeGreaterThan(8);
  const positions = Array.from({ length: snow.count }, (_, i) => {
    const matrix = new THREE.Matrix4();
    snow.getMatrixAt(i, matrix);
    return new THREE.Vector3().setFromMatrixPosition(matrix);
  });
  expect(positions.some(p => p.z < -0.2)).toBe(true);
  expect(positions.some(p => p.z > 0.2)).toBe(true);
  expect(positions.every(p => p.y >= 0.3)).toBe(true);
  expect(
    positions.every(p => p.x < 19 / 30 + SLEIGH_REAR_X),
    'all snow stays behind the rear of the sleigh',
  ).toBe(true);
  for (let frame = 0; frame < 60; frame++) update(1, 0, 1 / 60, false);
  expect(snow.count).toBe(0);
  update(1, -5, 1 / 60, false);
  expect(snow.count).toBeGreaterThan(0);
  update(1, -5, 1 / 60, true);
  expect(snow.count).toBe(0);
  update(1, 0, 1 / 60, false);
  expect(snow.count).toBe(0);
});
