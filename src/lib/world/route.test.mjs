import test from 'node:test';
import assert from 'node:assert/strict';
import { JourneyMotion, STOP_SPACING, TRACK_LENGTH, pointOnTrack } from './route.ts';

const close = (a, b, tolerance = 1e-6) => assert.ok(Math.abs(a - b) < tolerance, `${a} differs from ${b}`);

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
  assert.equal(motion.scroll(-5), false, 'cannot scroll before the start');
  close(motion.target, 0);

  assert.equal(motion.scroll(4), true);
  close(motion.target, 4);

  motion.scroll(TRACK_LENGTH * 2);
  close(motion.target, TRACK_LENGTH);
  assert.equal(motion.scroll(5), false, 'cannot scroll past the terminus');

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
    assert.ok(motion.distance >= previous - 1e-9, 'the train never jumps back');
    previous = motion.distance;
  }

  assert.equal(rested, 1);
  assert.equal(motion.moving, false);
  close(motion.distance, 7.3);
  assert.notEqual(motion.distance, STOP_SPACING, 'the train does not snap to a station');
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
  assert.equal(motion.moving, false);
});
