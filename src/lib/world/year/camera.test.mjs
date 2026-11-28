import { expect, test } from 'vitest';
import * as THREE from 'three';
import { CameraRig } from './camera.ts';

function setup(reduced = false) {
  const camera = new THREE.PerspectiveCamera(55, 1.6, 0.1, 100);
  const rig = new CameraRig(camera, {}, reduced);
  rig.resize(1440, 900);
  return { camera, rig };
}

test('a camera that is already close lands exactly on its target', () => {
  const { camera, rig } = setup();
  rig.update(1, true, 5, 0);

  const target = rig.desiredPosition.clone();
  camera.position.copy(target).add(new THREE.Vector3(0.0005, 0, 0));
  rig.update(1 / 60, false, 5, 0);

  expect(rig.desiredPosition.equals(target)).toBe(true);
  expect(camera.position.equals(target)).toBe(true);
});

test('the camera settles exactly instead of approaching forever', () => {
  const { camera, rig } = setup();
  rig.update(1, true, 0, 0);
  rig.setPointer(0.6, -0.3);

  for (let frame = 0; frame < 200; frame++) rig.update(1 / 60, false, 0, 0);
  expect(camera.position.equals(rig.desiredPosition)).toBe(true);

  const x = camera.position.x;
  rig.update(1 / 60, false, 0, 0);
  expect(camera.position.x).toBe(x);
});
