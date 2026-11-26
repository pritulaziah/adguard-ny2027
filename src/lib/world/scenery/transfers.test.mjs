import { expect, test } from 'vitest';
import * as THREE from 'three';
import { PaperDetail } from '../paper-brush.ts';
import { addTravelSurfaces } from './surfaces.ts';
import { addTransferStations } from './transfers.ts';

test('river waves stay below both landings throughout their motion', () => {
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
  const point = new THREE.Vector3();
  for (const name of ['transfer-spring-summer', 'transfer-summer-autumn']) {
    const landing = group.getObjectByName(name);
    const bounds = new THREE.Box3();
    landing.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      const position = object.geometry.getAttribute('position');
      for (let i = 0; i < position.count; i++) {
        point.fromBufferAttribute(position, i).applyMatrix4(object.matrixWorld);
        if (point.y < 0.6) bounds.expandByPoint(point);
      }
    });
    for (const wave of group.getObjectsByProperty('name', 'paper-river-wave')) {
      const position = wave.geometry.getAttribute('position');
      for (let i = 0; i < position.count; i++) {
        point.fromBufferAttribute(position, i).applyMatrix4(wave.matrixWorld);
        // Wave motion moves the ribbon by up to .14 horizontally and .025 vertically.
        if (point.x < bounds.min.x - 0.14 || point.x > bounds.max.x + 0.14) continue;
        expect(point.y + 0.025, `${name} stays above the moving water`).toBeLessThan(bounds.max.y - 0.005);
      }
    }
  }
});
