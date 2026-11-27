import { expect, test } from 'vitest';
import * as THREE from 'three';
import { PaperDetail } from '../paper-brush.ts';
import { SEASON_BORDERS } from '../seasons.ts';
import { TRACK_LENGTH } from '../route.ts';
import { addTravelSurfaces } from './surfaces.ts';
import { addTransferStations } from './transfers.ts';

test('one continuous road spans the route with four border lanterns clear of the lane', () => {
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
