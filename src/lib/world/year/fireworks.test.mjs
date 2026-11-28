import { expect, test, vi } from 'vitest';
import * as THREE from 'three';
import { FinaleFireworks } from './fireworks.ts';

function setup(reduced = false) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1.6, 0.1, 100);
  return { scene, fireworks: new FinaleFireworks(scene, camera, reduced) };
}

test('the finale fireworks build three bursts in one group', () => {
  const { scene } = setup();
  const group = scene.getObjectByName('paper-finale-fireworks');

  expect(group).toBeTruthy();
  expect(group.children).toHaveLength(3);
  expect(group.children.map(mesh => mesh.name)).toEqual(['paper-firework-0', 'paper-firework-1', 'paper-firework-2']);
  for (const mesh of group.children) expect(mesh.material.opacity).toBe(0);
});

test('destroy removes the bursts and releases their geometry and materials', () => {
  const { scene, fireworks } = setup();
  const group = scene.getObjectByName('paper-finale-fireworks');
  const burst = group.children[0];

  const materialDispose = vi.spyOn(burst.material, 'dispose');
  const geometryDispose = vi.spyOn(burst.geometry, 'dispose');
  fireworks.destroy();

  expect(scene.getObjectByName('paper-finale-fireworks')).toBeUndefined();
  expect(materialDispose).toHaveBeenCalled();
  expect(geometryDispose).toHaveBeenCalled();
});

test('reduced motion still builds bursts that destroy cleanly', () => {
  const { scene, fireworks } = setup(true);
  const group = scene.getObjectByName('paper-finale-fireworks');
  expect(group.children).toHaveLength(3);

  fireworks.destroy();
  expect(scene.getObjectByName('paper-finale-fireworks')).toBeUndefined();
});
