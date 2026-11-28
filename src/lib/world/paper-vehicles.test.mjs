import { expect, test } from 'vitest';
import * as THREE from 'three';
import { createSeasonalFleet } from './vehicles/index.ts';
import { SnowTrail } from './vehicles/snow-trail.ts';
import { createVanExhaust } from './vehicles/exhaust.ts';
import { VAN_REAR_X } from './vehicles/retro-van.ts';
import { JOURNEY_END, stopX } from './route.ts';
import { SEASON_BORDERS } from './seasons.ts';
import { FINALE_CAR_X } from './finale.ts';
import { bridgeLift, ROAD_SURFACE_Y, SUMMER_BRIDGE_X } from './summer-bridge.ts';

function inventory(scene) {
  let meshes = 0;
  const geometries = new Set();
  scene.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    meshes++;
    geometries.add(object.geometry);
  });
  return { meshes, geometries: geometries.size };
}

test('one retro van drives continuously from start through every season and finale', () => {
  const scene = new THREE.Scene();
  const fleet = createSeasonalFleet(scene);
  const van = scene.getObjectByName('paper-retro-van');
  expect(van).toBeTruthy();

  for (const distance of [0, stopX(1), stopX(2), stopX(4), stopX(5), stopX(7), JOURNEY_END]) {
    fleet.update(distance, 1 / 60, 0, true);
    expect(van.position.x).toBeCloseTo(distance, 5);
  }

  fleet.update(JOURNEY_END, 1 / 60, 1, false);
  const parkedX = van.position.x;
  expect(parkedX).toBeCloseTo(FINALE_CAR_X, 5);
  fleet.update(JOURNEY_END, 1 / 60, 1, false, 9);
  expect(van.position.x - parkedX).toBeCloseTo(9);
});

test('the single-car fleet merges still parts and removes legacy seasonal vehicles', () => {
  const scene = new THREE.Scene();
  createSeasonalFleet(scene);
  const { meshes, geometries } = inventory(scene);

  expect(meshes).toBeLessThan(20);
  expect(scene.getObjectByName('paper-retro-van')).toBeTruthy();
  for (const legacy of [
    'paper-sleigh-winter',
    'paper-sleigh-festive',
    'paper-bicycle',
    'paper-autumn-minivan',
    'paper-hero-punt',
  ]) {
    expect(scene.getObjectByName(legacy), legacy).toBeUndefined();
  }
  expect(geometries).toBeLessThan(meshes);
});

test('the retro van stays a thin, clearly visible paper silhouette', () => {
  const scene = new THREE.Scene();
  const fleet = createSeasonalFleet(scene);
  fleet.update(stopX(4), 1 / 60, 1, false);
  scene.updateMatrixWorld(true);

  const van = scene.getObjectByName('paper-retro-van');
  const box = new THREE.Box3().setFromObject(van);
  expect(box.max.y - box.min.y).toBeGreaterThan(1.1);
  expect(box.max.z - box.min.z).toBeLessThan(0.3);
});

test('every fleet mesh has baked vertex colors', () => {
  const scene = new THREE.Scene();
  createSeasonalFleet(scene);
  scene.traverse(object => {
    if (!(object instanceof THREE.Mesh)) return;
    const color = object.geometry.getAttribute('color');
    expect(color, object.name || object.geometry.type).toBeTruthy();
    expect(color.count).toBe(object.geometry.getAttribute('position').count);
  });
});

test('van wheels follow the bridge on ascent, descent, reverse travel and reduced motion', () => {
  const scene = new THREE.Scene();
  const fleet = createSeasonalFleet(scene);
  const van = scene.getObjectByName('paper-retro-van');
  const wheels = van.children.filter(child => child instanceof THREE.Mesh);
  expect(wheels).toHaveLength(2);
  for (const direction of [-1, 1]) {
    for (const reduced of [false, true]) {
      for (let i = 0; i <= 120; i++) {
        const x = SUMMER_BRIDGE_X + direction * (-4 + i / 15);
        fleet.update(x, 1 / 60, i / 60, reduced);
        scene.updateMatrixWorld(true);
        for (const wheel of wheels) {
          const center = wheel.getWorldPosition(new THREE.Vector3());
          const clearance = center.y - 0.22 - ROAD_SURFACE_Y - bridgeLift(center.x);
          expect(clearance, `wheel clearance at ${x}`).toBeCloseTo(0.0175, 3);
        }
      }
    }
  }
  fleet.update(SUMMER_BRIDGE_X - 1, 1 / 60, 0, true);
  expect(van.rotation.z).toBeGreaterThan(0.1);
  fleet.update(SUMMER_BRIDGE_X + 1, 1 / 60, 0, true);
  expect(van.rotation.z).toBeLessThan(-0.1);
  fleet.update(SUMMER_BRIDGE_X + 5, 1 / 60, 0, true);
  expect(van.position.y).toBe(0.34);
  expect(van.rotation.z).toBe(0);
});

test('exhaust retains its emission height after the van descends from the bridge', () => {
  const scene = new THREE.Scene();
  const update = createVanExhaust(scene);
  update(0, 2, 1 / 60, false, 0.5, 0.1);
  update(0.1, 0, 0.1, false, 0, 0);
  const puffs = scene.getObjectsByProperty('name', 'paper-van-exhaust');
  const visible = puffs.filter(puff => puff.visible);
  expect(visible).toHaveLength(1);
  expect(visible[0].position.y).toBeGreaterThan(0.95);
  update(0.1, 0, 0.1, true);
  expect(puffs.every(puff => !puff.visible)).toBe(true);
});

test('winter snow trail follows behind the van only on snowy road sections', () => {
  const scene = new THREE.Scene();
  const trail = new SnowTrail(scene, 'test-van-snow');
  const snow = scene.getObjectByName('test-van-snow');
  trail.update(0, 0, 1 / 60, false);
  expect(snow.count).toBe(0);
  for (let frame = 0; frame < 20; frame++) trail.update(frame / 30, 2, 1 / 60, false);
  expect(snow.count).toBeGreaterThan(8);
  const positions = Array.from({ length: snow.count }, (_, i) => {
    const matrix = new THREE.Matrix4();
    snow.getMatrixAt(i, matrix);
    return new THREE.Vector3().setFromMatrixPosition(matrix);
  });
  expect(positions.every(p => p.y >= 0.3)).toBe(true);
  expect(positions.every(p => p.x < 19 / 30 + VAN_REAR_X)).toBe(true);
  trail.update(1, -5, 1 / 60, true);
  expect(snow.count).toBe(0);
  trail.destroy();
  expect(scene.getObjectByName('test-van-snow')).toBeUndefined();

  // Verify the fleet emits snow in winter and suppresses it in summer.
  const fleetScene = new THREE.Scene();
  const fleet = createSeasonalFleet(fleetScene);
  const fleetSnow = fleetScene.getObjectByName('paper-van-snow');
  for (let frame = 0; frame < 15; frame++) fleet.update(frame * 0.25, 1 / 60, frame / 60, false);
  expect(fleetSnow.count).toBeGreaterThan(0);
  const summerX = (SEASON_BORDERS.summer + SEASON_BORDERS.autumn) / 2;
  for (let frame = 0; frame < 60; frame++) fleet.update(summerX + frame * 0.1, 1 / 60, frame / 60, false);
  expect(fleetSnow.count).toBe(0);
  fleet.destroy();
  expect(fleetScene.getObjectByName('paper-van-snow')).toBeUndefined();
});
