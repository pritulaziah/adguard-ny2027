import { expect, test } from 'vitest';
import {
  JourneyMotion,
  STOP_COUNT,
  SUMMER_EXTENSION,
  routeDistance,
  routeProgress,
  stopIndexAt,
  STOP_SPACING,
  STORY_END,
  TRACK_LENGTH,
  pointOnTrack,
  stopX,
} from './route.ts';
import { SEASON_BORDERS, seasonAt, seasonCenter } from './seasons.ts';

const close = (a, b, tolerance = 1e-6) => expect(Math.abs(a - b), `${a} differs from ${b}`).toBeLessThan(tolerance);

test('the train and carriages follow a straight route without wrapping', () => {
  for (let distance = 0; distance < TRACK_LENGTH * 3; distance += 0.17) {
    for (const offset of [0, 1.55, 3.1]) {
      const p = pointOnTrack(distance - offset);
      close(p.x, distance - offset);
      close(p.z, 0);
      close(p.rotation, 0);
    }
  }
});

test('scrolling moves the target and clamps at both ends of the route', () => {
  const motion = new JourneyMotion();
  expect(motion.scroll(-5), 'cannot scroll before the start').toBe(false);
  close(motion.target, 0);

  expect(motion.scroll(4)).toBe(true);
  close(motion.target, 4);

  motion.scroll(TRACK_LENGTH * 2);
  close(motion.target, TRACK_LENGTH);
  expect(motion.scroll(5), 'cannot scroll past the terminus').toBe(false);

  motion.scroll(-TRACK_LENGTH * 3);
  close(motion.target, 0);
});

test('the train eases toward the scroll target and rests where the reader stopped', () => {
  const motion = new JourneyMotion();
  motion.scroll(7.3);

  let rested = 0;
  let previous = -1;
  for (let frame = 0; frame < 600; frame++) {
    if (motion.step(1 / 60)) rested++;
    expect(motion.distance, 'the train never jumps back').toBeGreaterThanOrEqual(previous - 1e-9);
    previous = motion.distance;
  }

  expect(rested).toBe(1);
  expect(motion.moving).toBe(false);
  close(motion.distance, 7.3);
  expect(motion.distance, 'the train does not snap to a station').not.toBe(STOP_SPACING);
});

test('scrolling is frame-rate independent', () => {
  const a = new JourneyMotion();
  const b = new JourneyMotion();
  a.scroll(20);
  b.scroll(20);

  for (let i = 0; i < 10; i++) a.step(0.05);
  for (let i = 0; i < 30; i++) b.step(1 / 60);

  close(a.distance, b.distance, 1e-6);
});

test('reset returns the train to the start', () => {
  const motion = new JourneyMotion();
  motion.scroll(30);
  for (let i = 0; i < 100; i++) motion.step(1 / 60);

  motion.reset();
  close(motion.distance, 0);
  close(motion.target, 0);
  expect(motion.moving).toBe(false);
});

test('the route ends at the finale stop after the stories', () => {
  expect(STOP_COUNT).toBe(7);
  close(stopX(0), 0);
  close(stopX(7), STORY_END);
  close(STORY_END, 7 * STOP_SPACING + SUMMER_EXTENSION);
  close(TRACK_LENGTH, STORY_END + 14);
});

test('each stop sits inside its named season', () => {
  const expected = [
    'winter-start',
    'winter-start',
    'spring',
    'spring',
    'summer',
    'autumn',
    'autumn',
    'winter-end',
  ];
  expected.forEach((season, index) => {
    expect(seasonAt(stopX(index)), `stop ${index}`).toBe(season);
  });
});

test('season borders follow the extended summer route', () => {
  close(SEASON_BORDERS.spring, routeDistance(1.5 * STOP_SPACING));
  close(SEASON_BORDERS.summer, routeDistance(3.5 * STOP_SPACING));
  close(SEASON_BORDERS.autumn, routeDistance(4.5 * STOP_SPACING));
  close(SEASON_BORDERS.winterEnd, routeDistance(6.5 * STOP_SPACING));
});

test('the midpoint between two stops shows no story', () => {
  for (let index = 0; index < STOP_COUNT; index++) {
    const midpoint = (stopX(index) + stopX(index + 1)) / 2;
    expect(Math.abs(midpoint - stopX(index)), `midpoint ${index} reaches the stop before it`).toBeGreaterThan(4.7);
    expect(Math.abs(midpoint - stopX(index + 1)), `midpoint ${index} reaches the stop after it`).toBeGreaterThan(4.7);
  }
});

test('season centers land inside their own season', () => {
  for (const id of ['winter-start', 'spring', 'summer', 'autumn', 'winter-end']) {
    expect(seasonAt(seasonCenter(id)), id).toBe(id);
  }
});


test('summer gains distance while the other seasons retain their length', () => {
  close(SEASON_BORDERS.autumn - SEASON_BORDERS.summer, STOP_SPACING + SUMMER_EXTENSION);
  close(SEASON_BORDERS.winterEnd - SEASON_BORDERS.autumn, 2 * STOP_SPACING);
  close(stopX(3), 3 * STOP_SPACING);
  close(stopX(4), 4 * STOP_SPACING + SUMMER_EXTENSION / 2);
  for (let i = 5; i <= STOP_COUNT; i++) close(stopX(i), i * STOP_SPACING + SUMMER_EXTENSION);
});

test('navigation and nearest stops follow the longer river section', () => {
  for (let index = 0; index <= STOP_COUNT; index += 0.25) {
    close(routeProgress(stopX(index)), index);
  }
  for (let index = 0; index < STOP_COUNT; index++) {
    const middle = (stopX(index) + stopX(index + 1)) / 2;
    expect(stopIndexAt(middle - 0.001)).toBe(index);
    expect(stopIndexAt(middle + 0.001)).toBe(index + 1);
  }
});
