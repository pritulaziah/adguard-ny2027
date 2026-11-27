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
  JOURNEY_END,
  TRACK_LENGTH,
  pointOnTrack,
  stopX,
} from './route.ts';
import { SEASON_BORDERS, seasonAt, seasonCenter } from './seasons.ts';

const close = (a, b, tolerance = 1e-6) => expect(Math.abs(a - b), `${a} differs from ${b}`).toBeLessThan(tolerance);

test('the vehicles follow a straight route without wrapping', () => {
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
  close(motion.target, JOURNEY_END);
  expect(motion.scroll(5), 'cannot scroll past the terminus').toBe(false);

  motion.scroll(-TRACK_LENGTH * 3);
  close(motion.target, 0);
});

function settle(motion) {
  for (let frame = 0; frame < 900 && motion.moving; frame++) motion.step(1 / 60);
  expect(motion.moving).toBe(false);
}

function reachFinalHandoff(motion) {
  motion.distance = motion.target = JOURNEY_END - 1.6;
  motion.scroll(1.6);
  for (let frame = 0; frame < 900 && !motion.committedToFinale; frame++) motion.step(1 / 60);
  expect(motion.committedToFinale).toBe(true);
}

test('the final target alone does not start the handoff', () => {
  const motion = new JourneyMotion();
  motion.scroll(JOURNEY_END);
  close(motion.target, JOURNEY_END);
  expect(motion.committedToFinale).toBe(false);
  motion.step(0.1);
  expect(motion.committedToFinale).toBe(false);
  expect(motion.scroll(-1)).toBe(true);

  // Visitors can also stop near the destination without choosing the final leg.
  motion.distance = motion.target = JOURNEY_END - 0.1;
  motion.moving = false;
  expect(motion.committedToFinale).toBe(false);
  expect(motion.scroll(-1)).toBe(true);
});

test('the final handoff starts while the vehicle is still approaching the destination', () => {
  const motion = new JourneyMotion();
  reachFinalHandoff(motion);
  expect(motion.moving).toBe(true);
  expect(motion.finished).toBe(false);
  expect(motion.distance).toBeLessThan(JOURNEY_END);
  expect(motion.speed).toBeGreaterThan(0.2);
});

test('the final handoff blocks input in both directions while travel continues', () => {
  const motion = new JourneyMotion();
  reachFinalHandoff(motion);
  const committedState = {
    distance: motion.distance, target: motion.target,
    moving: motion.moving, speed: motion.speed,
  };
  for (const delta of [-0.01, -1.6, -TRACK_LENGTH * 3, 0.01, 1.6, TRACK_LENGTH * 3]) {
    expect(motion.scroll(delta), `scroll ${delta} cannot interrupt the final handoff`).toBe(false);
    expect({
      distance: motion.distance, target: motion.target,
      moving: motion.moving, speed: motion.speed,
    }).toEqual(committedState);
  }
  motion.step(1 / 60);
  expect(motion.distance).toBeGreaterThan(committedState.distance);
  expect(motion.committedToFinale).toBe(true);
  settle(motion);
  expect(motion.finished).toBe(true);
});

test('reset releases input during the final handoff', () => {
  const motion = new JourneyMotion();
  reachFinalHandoff(motion);
  motion.reset();
  expect(motion.committedToFinale).toBe(false);
  expect(motion.finished).toBe(false);
  expect(motion.scroll(4)).toBe(true);
  motion.step(1 / 60);
  expect(motion.distance).toBeGreaterThan(0);
});

test('the reader can reverse before reaching the final destination', () => {
  const motion = new JourneyMotion();
  motion.scroll(JOURNEY_END);
  motion.step(0.5);

  expect(motion.distance).toBeGreaterThan(0);
  expect(motion.distance).toBeLessThan(JOURNEY_END);
  expect(motion.finished).toBe(false);
  expect(motion.committedToFinale).toBe(false);
  expect(motion.scroll(-3)).toBe(true);
  close(motion.target, JOURNEY_END - 3);
  settle(motion);

  expect(motion.finished).toBe(false);
  expect(motion.scroll(-1)).toBe(true);
});

test('reaching the final destination blocks scrolling in both directions', () => {
  const motion = new JourneyMotion();
  motion.scroll(JOURNEY_END);
  settle(motion);

  expect(motion.finished).toBe(true);
  expect(motion.committedToFinale).toBe(true);
  const finalState = {
    distance: motion.distance, target: motion.target,
    moving: motion.moving, speed: motion.speed,
  };
  expect(finalState).toEqual({ distance: JOURNEY_END, target: JOURNEY_END, moving: false, speed: 0 });
  for (const delta of [-0.01, -1.6, -TRACK_LENGTH * 3, 0.01, 1.6, TRACK_LENGTH * 3]) {
    expect(motion.scroll(delta), `scroll ${delta} cannot leave the final screen`).toBe(false);
    expect(motion.step(1 / 60)).toBe(false);
    expect({
      distance: motion.distance, target: motion.target,
      moving: motion.moving, speed: motion.speed,
    }).toEqual(finalState);
    expect(motion.finished).toBe(true);
  }
});

test('an explicit reset starts a new journey after the final destination', () => {
  const motion = new JourneyMotion();
  motion.scroll(JOURNEY_END);
  settle(motion);
  expect(motion.finished).toBe(true);

  motion.reset();
  expect(motion.finished).toBe(false);
  expect(motion.committedToFinale).toBe(false);
  close(motion.distance, 0);
  close(motion.target, 0);
  expect(motion.moving).toBe(false);
  expect(motion.scroll(4)).toBe(true);
  motion.step(1 / 60);
  expect(motion.distance).toBeGreaterThan(0);
});

test('the vehicle eases toward the scroll target and rests where the reader stopped', () => {
  const motion = new JourneyMotion();
  motion.scroll(7.3);

  let rested = 0;
  let previous = -1;
  for (let frame = 0; frame < 600; frame++) {
    if (motion.step(1 / 60)) rested++;
    expect(motion.distance, 'the vehicle never jumps back').toBeGreaterThanOrEqual(previous - 1e-9);
    previous = motion.distance;
  }

  expect(rested).toBe(1);
  expect(motion.moving).toBe(false);
  close(motion.distance, 7.3);
  expect(motion.distance, 'the vehicle does not snap to a station').not.toBe(STOP_SPACING);
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

test('reset returns the vehicle to the start', () => {
  const motion = new JourneyMotion();
  motion.scroll(30);
  for (let i = 0; i < 100; i++) motion.step(1 / 60);

  motion.reset();
  close(motion.distance, 0);
  close(motion.target, 0);
  expect(motion.moving).toBe(false);
});

test('the route continues through the finale after the stories', () => {
  expect(STOP_COUNT).toBe(7);
  close(stopX(0), 0);
  close(stopX(7), STORY_END);
  close(STORY_END, 7 * STOP_SPACING + SUMMER_EXTENSION);
  close(JOURNEY_END, STORY_END + 6);
  expect(JOURNEY_END).toBeLessThan(TRACK_LENGTH);
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
