import { expect, test } from 'vitest';
import * as THREE from 'three';
import { PART_KINDS, isAnimated, motionFor } from './part-motion.ts';

test('every part kind resolves to a motion', () => {
  for (const kind of PART_KINDS) {
    expect(typeof motionFor(kind), kind).toBe('function');
  }
});

test('a part keeps its rest transform while a motion runs', () => {
  const mesh = new THREE.Group();
  mesh.position.set(1, 2, 3);
  mesh.rotation.set(0.1, 0.2, 0.3);
  const frame = { time: 0, delta: 1 / 60, reduced: false, distance: 0, gateSwing: 1 };
  const part = {
    mesh,
    position: mesh.position.clone(),
    rotation: mesh.rotation.clone(),
    scale: mesh.scale.clone(),
    kind: 'gate',
    phase: 0,
    worldX: 1,
    gateSide: -1,
    apply: motionFor('gate'),
  };
  part.apply(part, frame);
  expect(mesh.position.x).toBe(1);
  expect(mesh.rotation.y).toBeCloseTo(-1.15);
});

test('a still part stays out of the frame loop', () => {
  expect(isAnimated({ kind: 'still' })).toBe(false);
  expect(isAnimated({ kind: 'sway' })).toBe(true);
});
