import { expect, test } from 'vitest';
import * as THREE from 'three';
import { TRACK_LENGTH } from '../route.ts';
import { SEASON_BORDERS } from '../seasons.ts';
import { WeatherLayer, sampleSeasonX, seasonBands } from './weather/index.ts';

function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** The camera poses in the tests match the route framing: z = STORY_Z + 8.35. */
function cameraAt(x) {
  const camera = new THREE.PerspectiveCamera(55, 1.6, 0.1, 200);
  camera.position.set(x, 2.55, 6.12);
  return camera;
}

function visibility(layer) {
  return layer.fields.map(field => field.points.visible);
}

test('the weather layer builds three strata for four seasons', () => {
  const scene = new THREE.Scene();
  const layer = new WeatherLayer(scene, false, seeded(1));

  expect(layer.fields).toHaveLength(12);
  expect(scene.children).toHaveLength(12);
  expect(layer.fields.map(field => field.points.count)).toEqual([
    140, 110, 100, 160, 150, 130, 110, 190, 90, 80, 68, 116,
  ]);
  for (const field of layer.fields) expect(field.points.visible).toBe(true);
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

test('the season bands match the particle placement', () => {
  expect(seasonBands('winter')).toEqual([
    [-14, SEASON_BORDERS.spring],
    [SEASON_BORDERS.winterEnd - 1.5, TRACK_LENGTH + 14.5],
  ]);
  expect(seasonBands('spring')).toEqual([[SEASON_BORDERS.spring - 0.5, SEASON_BORDERS.summer + 0.5]]);
  expect(seasonBands('summer')).toEqual([[SEASON_BORDERS.summer - 0.5, SEASON_BORDERS.autumn + 0.5]]);
  expect(seasonBands('autumn')).toEqual([[SEASON_BORDERS.autumn - 0.5, SEASON_BORDERS.winterEnd + 0.5]]);

  const high = () => 1 - 1e-9;
  for (const season of ['winter', 'spring', 'summer', 'autumn']) {
    const bands = seasonBands(season);
    for (let index = 0; index < 4; index++) {
      const x = sampleSeasonX(season, index, high);
      expect(
        bands.some(([start, end]) => x >= start && x <= end),
        `${season} particle ${index}`,
      ).toBe(true);
    }
  }
});

test('only the weather fields that reach the view stay in the draw list', () => {
  const layer = new WeatherLayer(new THREE.Scene(), false, seeded(4));

  layer.update(cameraAt(0));
  expect(visibility(layer)).toEqual([true, false, false, false, true, false, false, false, true, false, false, false]);

  // Spring fills the near planes. Only the deep sky plane reaches summer.
  layer.update(cameraAt(30));
  expect(visibility(layer)).toEqual([true, true, false, false, false, true, false, false, false, true, false, false]);
});

test('a hidden field keeps its buffers and returns to the draw list', () => {
  const scene = new THREE.Scene();
  const layer = new WeatherLayer(scene, false, seeded(5));
  const counts = layer.fields.map(field => field.points.count);

  layer.update(cameraAt(35));
  expect(layer.fields[0].points.visible).toBe(false);
  expect(layer.fields[0].points.count).toBe(counts[0]);
  expect(scene.children).toHaveLength(12);

  layer.update(cameraAt(0));
  expect(layer.fields[0].points.visible).toBe(true);
  expect(layer.fields.map(field => field.points.count)).toEqual(counts);
});
