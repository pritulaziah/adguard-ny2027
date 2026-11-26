import { expect, test } from 'vitest';
import * as THREE from 'three';
import { createSeasonalFleet } from './paper-vehicles.ts';

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
