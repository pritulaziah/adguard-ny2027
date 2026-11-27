import { expect, test } from 'vitest';
import * as THREE from 'three';
import { createPaperScenery } from './scenery/index.ts';
import { createScalarUniform } from './paper-materials.ts';

test('willow moving strands have separate depth ranges', async () => {
  globalThis.requestAnimationFrame ??= callback => setTimeout(() => callback(performance.now()), 0);
  const set = await createPaperScenery(createScalarUniform(0));
  const strands = set.group.getObjectsByProperty('name', 'willow-hanging-twig');
  expect(strands.length).toBeGreaterThan(0);
  for (const time of [0, 0.7, 1.8, 3.5]) {
    for (const part of set.animated.filter(part => strands.includes(part.mesh))) {
      part.apply(part, { time, delta: 1 / 60, reduced: false, distance: part.worldX });
    }
    set.group.updateMatrixWorld(true);
    const boxes = strands.map(strand => new THREE.Box3().setFromObject(strand));
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i],
          b = boxes[j];
        expect(a.max.z < b.min.z || b.max.z < a.min.z, `strands ${i} and ${j} need a depth gap at time ${time}`).toBe(
          true,
        );
      }
    }
  }
});
