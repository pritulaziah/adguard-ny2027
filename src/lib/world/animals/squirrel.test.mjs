import { expect, test } from 'vitest';
import * as THREE from 'three';
import { addSquirrel } from './squirrel.ts';
import { motionFor } from '../part-motion.ts';

test('the squirrel tail overlaps the body at rest and throughout its motion', () => {
  const group = new THREE.Group();
  const parts = [];
  addSquirrel(
    {
      detail: () => ({ group, oval: () => {} }),
      animate: (mesh, kind) =>
        parts.push({
          mesh,
          kind,
          position: mesh.position.clone(),
          rotation: mesh.rotation.clone(),
          scale: mesh.scale.clone(),
          phase: 0,
          startedAt: 0,
        }),
    },
    0,
  );
  const body = parts.find(part => part.kind === 'sway').mesh;
  const tail = parts.find(part => part.kind === 'cat-tail').mesh;
  const vertices = tail.geometry.attributes.position;
  const ray = new THREE.Raycaster();
  const point = new THREE.Vector3();
  for (let step = 0; step <= 100; step++) {
    const frame = { time: step / 100, delta: 0.01, reduced: false, distance: 0 };
    for (const part of parts) motionFor(part.kind)(part, frame);
    group.updateMatrixWorld(true);
    let overlaps = false;
    for (let i = 0; i < vertices.count; i++) {
      point.fromBufferAttribute(vertices, i).applyMatrix4(tail.matrixWorld);
      ray.set(new THREE.Vector3(point.x, point.y, 10), new THREE.Vector3(0, 0, -1));
      if (ray.intersectObject(body, false).length > 0) {
        overlaps = true;
        break;
      }
    }
    expect(overlaps, `tail attachment at ${frame.time}s`).toBe(true);
  }
});
