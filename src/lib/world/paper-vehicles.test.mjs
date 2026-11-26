import { expect, test } from 'vitest';
import * as THREE from 'three';
import { createSeasonalFleet } from './paper-vehicles.ts';
import { stopX } from './route.ts';

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

test('the fleet merges still parts instead of drawing every detail', () => {
  const scene = new THREE.Scene();
  createSeasonalFleet(scene);
  const { meshes, geometries } = inventory(scene);

  // Before the merge every vehicle detail was its own draw call: 261 meshes.
  // A regression guard with room for a new vehicle detail or two.
  expect(meshes).toBeLessThan(64);
  expect(meshes).toBeGreaterThan(20);
  expect(geometries).toBeLessThan(meshes);
});

test('the summer craft stays a visible hero above the water line', () => {
  const scene = new THREE.Scene();
  const fleet = createSeasonalFleet(scene);
  fleet.update(stopX(4), 1 / 60, 1, false);
  scene.updateMatrixWorld(true);

  let boat = null;
  scene.traverse(object => {
    if (!boat && object.name.startsWith('paper-hero-')) boat = object;
  });
  expect(boat, 'the summer vehicle is part of the fleet').toBeTruthy();

  const box = new THREE.Box3().setFromObject(boat);
  // The craft carries the reader through the stop. A low hull alone reads as a
  // plank at the bottom edge, so the silhouette keeps a tall element.
  expect(box.max.y - box.min.y).toBeGreaterThan(1);
  // The rest of the fleet is thin paper. A deep stack of planes smears the boat
  // when the camera has perspective.
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


test('the punt interior covers the hull seam at a wide-screen viewing angle', () => {
  const scene = new THREE.Scene();
  const fleet = createSeasonalFleet(scene);
  fleet.update(stopX(4), 1 / 60, 0, true);
  scene.updateMatrixWorld(true);
  const boat = scene.getObjectByName('paper-hero-punt');
  const direction = new THREE.Vector3(0, 0.32, 1).normalize();
  for (let i = 1; i <= 39; i++) {
    const t = i / 40;
    for (const offset of [-0.02, -0.01, 0, 0.01, 0.02, 0.03]) {
    const point = new THREE.Vector3(1.4 * t - 0.32 * t * t, 0.25 + 0.31 * t * t + offset, 0.04);
    boat.localToWorld(point);
    const ray = new THREE.Raycaster(point.clone().addScaledVector(direction, 5), direction.clone().negate());
    expect(ray.intersectObject(boat, true).length, `bow seam at ${t}, ${offset} is opaque`).toBeGreaterThan(0);
    }
  }
});


test('the rear and front rims meet across the stern', () => {
  const scene = new THREE.Scene();
  const fleet = createSeasonalFleet(scene);
  fleet.update(stopX(4), 1 / 60, 0, true);
  scene.updateMatrixWorld(true);
  const boat = scene.getObjectByName('paper-hero-punt');
  for (const slope of [0.15, 0.32, 0.5]) {
    const direction = new THREE.Vector3(0, slope, 1).normalize();
    for (const t of [0.2, 0.4, 0.6, 0.8]) {
      const point = new THREE.Vector3(-1.1 - 0.04 * t, 0.5 - 0.04 * t, 0.004 + 0.082 * t);
      boat.localToWorld(point);
      const ray = new THREE.Raycaster(point.clone().addScaledVector(direction, 5), direction.clone().negate());
      expect(ray.intersectObject(boat, true).length, `stern rim at ${t}, view ${slope}`).toBeGreaterThan(0);
    }
  }
});


test('the stern wall blocks the scenery below the connecting rim', () => {
  const scene = new THREE.Scene();
  const fleet = createSeasonalFleet(scene);
  fleet.update(stopX(4), 1 / 60, 0, true);
  scene.updateMatrixWorld(true);
  const boat = scene.getObjectByName('paper-hero-punt');
  for (const horizontal of [-0.6, -0.2, 0, 0.2, 0.6]) {
    const direction = new THREE.Vector3(horizontal, 0.32, 1).normalize();
    for (const t of [0.2, 0.4, 0.6, 0.8]) {
      for (const drop of [0.025, 0.05, 0.08]) {
        const point = new THREE.Vector3(-1.1 - 0.04 * t + drop * 0.12, 0.5 - 0.04 * t - drop, 0.004 + 0.06 * t);
        boat.localToWorld(point);
        const ray = new THREE.Raycaster(point.clone().addScaledVector(direction, 5), direction.clone().negate());
        expect(ray.intersectObject(boat, true).length, `stern wall: view ${horizontal}, depth ${t}, drop ${drop}`).toBeGreaterThan(0);
      }
    }
  }
});
