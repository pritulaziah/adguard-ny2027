import { expect, test } from 'vitest';
import * as THREE from 'three';
import { PaperDetail } from '../paper-detail.ts';
import { Owl } from './owl.ts';

function buildOwl() {
  const root = new THREE.Group();
  const detail = new Owl(
    {
      detail: (name, x, z, scale) => new PaperDetail(root, name, x, 0, z, scale),
      animate: () => {},
    },
    0,
    0,
  ).build();
  const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
  const branch = new THREE.Mesh(detail.buildGeometry(), material);
  detail.group.add(branch);
  root.updateMatrixWorld(true);

  return {
    detail,
    branch,
    dispose() {
      root.traverse(object => {
        if (object instanceof THREE.Mesh) object.geometry.dispose();
      });
      material.dispose();
    },
  };
}

test('the owl trunk narrows above its flared ground contact', () => {
  const owl = buildOwl();
  const ray = new THREE.Raycaster();

  function widthAt(y) {
    ray.set(owl.detail.group.localToWorld(new THREE.Vector3(-2, y, 0.01)), new THREE.Vector3(1, 0, 0));
    const hits = ray.intersectObject(owl.branch);
    expect(hits.length, `closed trunk at height ${y}`).toBeGreaterThanOrEqual(2);
    const xs = hits.map(hit => owl.detail.group.worldToLocal(hit.point.clone()).x);
    return Math.max(...xs) - Math.min(...xs);
  }

  try {
    const base = widthAt(0.05);
    const middle = widthAt(0.45);
    const upper = widthAt(0.9);
    expect(base).toBeGreaterThan(middle);
    expect(middle).toBeGreaterThan(upper);
    expect(base).toBeGreaterThan(upper * 1.5);
  } finally {
    owl.dispose();
  }
});

test('the owl toes grip the branch with their front faces visible', () => {
  const owl = buildOwl();
  const ray = new THREE.Raycaster();

  try {
    for (const side of ['left', 'right']) {
      const foot = owl.detail.group.getObjectByName(`owl-foot-${side}`);
      expect(foot, `${side} foot stays on the owl`).toBeTruthy();
      const box = new THREE.Box3().setFromObject(foot);
      const origin = box.getCenter(new THREE.Vector3());
      origin.y = box.min.y + (box.max.y - box.min.y) * 0.15;
      origin.z += 1;
      ray.set(origin, new THREE.Vector3(0, 0, -1));
      const hit = ray.intersectObject(owl.branch)[0];
      expect(hit, `${side} toes overlap the branch`).toBeDefined();
      expect(hit.point.z, `${side} toes remain in front of the branch`).toBeLessThan(box.min.z);
    }
  } finally {
    owl.dispose();
  }
});
