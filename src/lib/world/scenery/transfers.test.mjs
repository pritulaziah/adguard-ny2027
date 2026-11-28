import { expect, test } from 'vitest';
import * as THREE from 'three';
import { PaperDetail } from '../paper-detail.ts';
import { SEASON_BORDERS } from '../seasons.ts';
import { TRACK_LENGTH } from '../route.ts';
import { SUMMER_BRIDGE_X } from '../summer-bridge.ts';
import { addTravelSurfaces } from './surfaces.ts';
import { addTransferStations } from './transfers.ts';

const VARIANTS = ['winter-spring', 'spring-summer', 'summer-autumn', 'autumn-winter'];

function buildTransfers() {
  const group = new THREE.Group();
  const details = [];
  const ctx = {
    group,
    detail(name, x, z = -1.1, scale = 1, y = 0.34) {
      const detail = new PaperDetail(group, name, x, y, z, scale);
      details.push(detail);
      return detail;
    },
    animate() {},
  };
  return { group, details, ctx };
}

test('road spans the route with a bridge opening and four lanterns clear of the lane', () => {
  const { group, details, ctx } = buildTransfers();
  addTravelSurfaces(ctx);
  addTransferStations(ctx);
  for (const detail of details) {
    detail.group.add(new THREE.Mesh(detail.buildGeometry()));
  }
  group.updateMatrixWorld(true);

  const road = group.getObjectByName('paper-continuous-road');
  expect(road).toBeTruthy();
  const roadBox = new THREE.Box3().setFromObject(road);
  expect(roadBox.min.x).toBeLessThanOrEqual(-9);
  expect(roadBox.max.x).toBeGreaterThanOrEqual(TRACK_LENGTH + 9);
  const down = new THREE.Vector3(0, -1, 0);
  const ray = new THREE.Raycaster(new THREE.Vector3(SUMMER_BRIDGE_X, 2, 0), down);
  expect(ray.intersectObject(road)).toHaveLength(0);
  ray.set(new THREE.Vector3(SUMMER_BRIDGE_X - 3, 2, 0), down);
  expect(ray.intersectObject(road).length).toBeGreaterThan(0);
  expect(group.getObjectByName('paper-river')).toBeUndefined();
  expect(group.getObjectsByProperty('name', 'paper-river-wave')).toHaveLength(0);

  const expectedBorders = [
    ['transfer-winter-spring', SEASON_BORDERS.spring],
    ['transfer-spring-summer', SEASON_BORDERS.summer],
    ['transfer-summer-autumn', SEASON_BORDERS.autumn],
    ['transfer-autumn-winter', SEASON_BORDERS.winterEnd],
  ];
  for (const [name, borderX] of expectedBorders) {
    const lantern = group.getObjectByName(name);
    expect(lantern, name).toBeTruthy();
    expect(lantern.position.x).toBeCloseTo(borderX, 5);
    const box = new THREE.Box3().setFromObject(lantern);
    expect(box.max.z, `${name} stays behind the road lane`).toBeLessThan(roadBox.min.z);
  }
});

test('border lanterns stay small, differ by season, and share one glow mesh', () => {
  const { group, details, ctx } = buildTransfers();
  addTransferStations(ctx);
  for (const detail of details) {
    detail.group.add(new THREE.Mesh(detail.buildGeometry()));
  }
  group.updateMatrixWorld(true);

  const vertexCounts = new Set();
  for (const variant of VARIANTS) {
    const name = `transfer-${variant}`;
    const lantern = group.getObjectByName(name);
    expect(lantern, name).toBeTruthy();
    const mesh = lantern.children.find(child => child instanceof THREE.Mesh);
    expect(mesh, name).toBeInstanceOf(THREE.Mesh);
    const size = new THREE.Box3().setFromObject(mesh).getSize(new THREE.Vector3());
    expect(size.y, `${name} height`).toBeLessThanOrEqual(1.8);
    expect(size.x, `${name} width`).toBeLessThanOrEqual(1.0);
    vertexCounts.add(mesh.geometry.getAttribute('position').count);
  }
  // Every season adds its own dressing, so the four silhouettes are not copies.
  expect(vertexCounts.size).toBeGreaterThanOrEqual(3);

  const glow = group.getObjectByName('transfer-lantern-glow');
  expect(glow, 'one shared glow mesh').toBeInstanceOf(THREE.Mesh);
  expect(glow.material.transparent).toBe(true);
  expect(glow.material.blending).toBe(THREE.AdditiveBlending);
  // Four stations, each with a halo above the glass and a pool on the grass.
  expect(glow.geometry.getIndex().count).toBe(4 * 2 * 6);
});
