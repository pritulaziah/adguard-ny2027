import { expect, test } from 'vitest';
import * as THREE from 'three';
import { SEASON_BORDERS } from '../seasons.ts';
import { WeatherLayer, sampleSeasonX } from './weather/index.ts';

function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

test('the weather layer builds three strata for four seasons', () => {
  const scene = new THREE.Scene();
  const layer = new WeatherLayer(scene, false, seeded(1));

  expect(layer.fields).toHaveLength(12);
  expect(scene.children).toHaveLength(12);
  expect(layer.fields.map(field => field.points.count)).toEqual([
    140, 110, 100, 160, 150, 130, 110, 190, 90, 80, 68, 116,
  ]);
  for (const field of layer.fields) expect(field.speed.value).toBe(1);
});

test('reduced motion stops every weather field', () => {
  const layer = new WeatherLayer(new THREE.Scene(), true, seeded(2));

  for (const field of layer.fields) expect(field.speed.value).toBe(0);
});

test('destroy removes the fields and their sprites', () => {
  const scene = new THREE.Scene();
  const layer = new WeatherLayer(scene, false, seeded(3));

  layer.destroy();

  expect(layer.fields).toHaveLength(0);
  expect(scene.children).toHaveLength(0);
});

test('each season stays inside its route window', () => {
  const low = () => 0;

  expect(sampleSeasonX('winter', 0, low)).toBe(-14);
  expect(sampleSeasonX('winter', 1, low)).toBe(SEASON_BORDERS.winterEnd - 1.5);
  expect(sampleSeasonX('spring', 0, low)).toBe(SEASON_BORDERS.spring - 0.5);
  expect(sampleSeasonX('summer', 0, low)).toBe(SEASON_BORDERS.summer - 0.5);
  expect(sampleSeasonX('autumn', 0, low)).toBe(SEASON_BORDERS.autumn - 0.5);
});
