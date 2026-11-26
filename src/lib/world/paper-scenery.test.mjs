import { expect, test } from 'vitest';
import * as THREE from 'three';
import { createPaperScenery } from './paper-scenery.ts';
import { createScalarUniform } from './paper-materials.ts';

test('every scenery part has a bound motion and merged details keep colors', async () => {
  globalThis.requestAnimationFrame ??= callback => setTimeout(() => callback(performance.now()), 0);

  const set = await createPaperScenery(createScalarUniform(0));

  expect(set.parts.length).toBeGreaterThan(30);
  for (const part of set.parts) expect(typeof part.apply, part.kind).toBe('function');

  // Anchors that never move stay out of the frame loop.
  expect(set.animated.length).toBeGreaterThan(20);
  expect(set.animated.length).toBeLessThan(set.parts.length);
  expect(set.animated.some(part => part.kind === 'still')).toBe(false);

  for (const part of set.animated) {
    expect(Number.isFinite(part.worldX), part.kind).toBe(true);
    expect(part.worldX).toBeGreaterThan(-20);
    expect(part.worldX).toBeLessThan(120);
  }

  const details = set.group.getObjectByName('folded-paper-details');
  expect(details).toBeInstanceOf(THREE.Mesh);
  expect(details.geometry.getAttribute('color').count).toBe(details.geometry.getAttribute('position').count);
}, 60000);
