import { expect, test } from 'vitest';
import * as THREE from 'three';
import { PART_KINDS, isAnimated, motionFor } from './part-motion.ts';
import { stopX } from './route.ts';
import { SEASON_BORDERS } from './seasons.ts';
import { addRiverDragonflies } from './scenery/river/dragonflies.ts';

test('every part kind resolves to a motion', () => {
  for (const kind of PART_KINDS) {
    expect(typeof motionFor(kind), kind).toBe('function');
  }
});

test('a part keeps its rest transform while a motion runs', () => {
  const mesh = new THREE.Group();
  mesh.position.set(1, 2, 3);
  mesh.rotation.set(0.1, 0.2, 0.3);
  const frame = { time: 0, delta: 1 / 60, reduced: false, distance: 0 };
  const part = {
    mesh,
    position: mesh.position.clone(),
    rotation: mesh.rotation.clone(),
    scale: mesh.scale.clone(),
    kind: 'sway',
    phase: 0,
    worldX: 1,
    apply: motionFor('sway'),
  };
  part.apply(part, frame);
  expect(mesh.position.x).toBe(1);
  expect(mesh.rotation.y).toBeCloseTo(0.2);
  expect(part.position.toArray()).toEqual([1, 2, 3]);
  expect(part.rotation.z).toBeCloseTo(0.3);
});

test('a still part stays out of the frame loop', () => {
  expect(isAnimated({ kind: 'still' })).toBe(false);
  expect(isAnimated({ kind: 'sway' })).toBe(true);
});

test('a dragonfly faces its flight direction instead of sliding sideways', () => {
  const mesh = new THREE.Group();
  const apply = motionFor('dragonfly');
  const part = {
    mesh,
    position: new THREE.Vector3(50, 1.5, 0),
    rotation: new THREE.Euler(),
    scale: new THREE.Vector3(1, 1, 1),
    phase: 0,
    worldX: 50,
    kind: 'dragonfly',
    apply,
  };
  const frame = { time: 0, delta: 1 / 120, reduced: false, distance: 50 };
  const previous = new THREE.Vector3();
  const velocity = new THREE.Vector3();
  const forward = new THREE.Vector3();
  let flights = 0;
  for (let i = 0; i < 3600; i++) {
    previous.copy(mesh.position);
    frame.time = i / 120;
    apply(part, frame);
    if (i === 0) continue;
    velocity.copy(mesh.position).sub(previous).multiplyScalar(120);
    if (velocity.length() < 1) continue;
    forward.set(1, 0, 0).applyQuaternion(mesh.quaternion);
    // Compare the visible heading in the paper scene's XY plane.
    forward.z = velocity.z = 0;
    expect(forward.normalize().dot(velocity.normalize())).toBeGreaterThan(0.9);
    flights++;
  }
  expect(flights).toBeGreaterThan(30);
});

test('river dragonflies stay symmetric, clear of the story and punt, and fade at season borders', () => {
  const root = new THREE.Group();
  const parts = [];
  addRiverDragonflies({
    group: root,
    cameraX: null,
    detail: () => {
      throw new Error('unexpected detail');
    },
    place: (name, x, z = 0, scale = 1, y = 0.34) => {
      const group = new THREE.Group();
      group.name = name;
      group.position.set(x, y, z);
      group.scale.setScalar(scale);
      root.add(group);
      return group;
    },
    animate: (mesh, kind) => {
      parts.push({
        mesh,
        kind,
        position: mesh.position.clone(),
        rotation: mesh.rotation.clone(),
        scale: mesh.scale.clone(),
        phase: parts.length * 0.73,
        worldX: mesh.position.x,
        apply: motionFor(kind),
      });
    },
  });

  const bodies = parts.filter(part => part.kind === 'dragonfly');
  const wings = parts.filter(part => part.kind === 'dragonfly-wing');
  expect(bodies).toHaveLength(3);
  expect(wings).toHaveLength(12);

  for (const part of bodies) {
    // Symmetric body layering around z = 0 keeps both flight directions intact.
    const box = new THREE.Box3().setFromObject(part.mesh);
    const localCentreZ = (box.min.z + box.max.z) / 2 - part.position.z;
    expect(Math.abs(localCentreZ)).toBeLessThan(1e-4);

    // Smooth fade at summer season borders while keeping rest scale inside summer.
    part.apply(part, { time: 1, delta: 1 / 60, reduced: false, distance: SEASON_BORDERS.summer });
    expect(part.mesh.scale.x).toBeCloseTo(0);
    part.apply(part, { time: 1, delta: 1 / 60, reduced: false, distance: stopX(4) });
    expect(part.mesh.scale.x).toBeCloseTo(part.scale.x);

    // Flight path stays outside the central story corridor and clear of the punt lane.
    for (let t = 0; t < 36; t += 0.15) {
      part.apply(part, { time: t, delta: 1 / 60, reduced: false, distance: stopX(4) });
      expect(Math.abs(part.mesh.position.x - stopX(4))).toBeGreaterThan(2);
      expect(part.mesh.position.z < -0.25 || part.mesh.position.z > 0.3).toBe(true);
    }
  }

  // Wing beat animates in-plane and varies by part phase.
  const zAngles = wings.map(part => {
    part.apply(part, { time: 0.42, delta: 1 / 60, reduced: false, distance: stopX(4) });
    return part.mesh.rotation.z;
  });
  expect(new Set(zAngles.map(angle => angle.toFixed(4))).size).toBeGreaterThan(4);
});
