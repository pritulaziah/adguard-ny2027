import { expect, test } from 'vitest';
import * as THREE from 'three';
import { FINALE_MASCOTS, FINALE_TREE_X, FINALE_STORY_X, finaleCameraOffset } from './finale.ts';
import { JOURNEY_END, STORY_END } from './route.ts';
import { FinaleFireworks } from './year/fireworks.ts';

test('the final framing keeps three rewards together while the train continues', () => {
  expect(finaleCameraOffset(STORY_END - 6)).toBe(0);
  expect(finaleCameraOffset(STORY_END)).toBe(1.9);
  expect(JOURNEY_END + finaleCameraOffset(JOURNEY_END)).toBeCloseTo(FINALE_TREE_X);
  const positions = Object.values(FINALE_MASCOTS);
  expect(Math.max(...positions) - Math.min(...positions)).toBeLessThan(4);
  expect(FINALE_STORY_X).toBe(JOURNEY_END);
  expect(FINALE_STORY_X - STORY_END).toBeGreaterThan(4);
});

function setup(reduced) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(54, 1.44, 0.1, 100);
  camera.position.set(STORY_END + 1.9, 2.55, 6.12);
  camera.lookAt(STORY_END + 1.9, 3.06, -2.05);
  camera.updateMatrixWorld(true);
  const fireworks = new FinaleFireworks(scene, camera, reduced);
  return { fireworks, camera };
}

test('fireworks begin after arrival, pause between volleys, and restart on return', () => {
  const { fireworks } = setup(false);
  const opacity = () => fireworks.group.children.map(mesh => mesh.material.opacity);
  fireworks.update(1, STORY_END - 1, true, false);
  expect(opacity()).toEqual([0, 0, 0]);
  fireworks.update(0.1, STORY_END, false, false);
  expect(opacity()).toEqual([0, 0, 0]);
  fireworks.update(0.1, STORY_END, true, false);
  fireworks.update(0.4, STORY_END, true, false);
  expect(opacity()[0]).toBeGreaterThan(0);
  fireworks.update(4, STORY_END, true, false);
  expect(opacity()).toEqual([0, 0, 0]);
  fireworks.update(5.5, STORY_END, true, false);
  expect(opacity()[0]).toBeGreaterThan(0);
  fireworks.update(0.1, STORY_END - 2, false, false);
  expect(opacity()).toEqual([0, 0, 0]);
  fireworks.update(0.1, STORY_END, true, false);
  fireworks.update(0.4, STORY_END, true, false);
  expect(opacity()[0]).toBeGreaterThan(0);
});

test('reduced motion keeps small still stars away from the greeting', () => {
  const { fireworks, camera } = setup(true);
  fireworks.update(0.1, STORY_END, true, true);
  const before = fireworks.group.children.map(mesh => ({ position: mesh.position.toArray(), scale: mesh.scale.toArray() }));
  fireworks.update(8, STORY_END, true, true);
  expect(fireworks.group.children.map(mesh => ({ position: mesh.position.toArray(), scale: mesh.scale.toArray() }))).toEqual(before);
  for (const mesh of fireworks.group.children) {
    expect(mesh.material.opacity).toBe(0.65);
    const projected = mesh.position.clone().project(camera);
    expect(Math.abs(projected.x)).toBeLessThan(0.9);
    expect(Math.abs(projected.y)).toBeLessThan(0.95);
  }
});
