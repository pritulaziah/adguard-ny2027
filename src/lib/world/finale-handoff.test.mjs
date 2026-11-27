import { expect, test } from 'vitest';
import * as THREE from 'three';
import { JourneyMotion, JOURNEY_END } from './route.ts';
import { createSeasonalFleet } from './vehicles/index.ts';
import { FinaleDeparture } from './year/finale-departure.ts';

test.each([30, 60, 120])('the final train continues through the handoff at %ifps', hz => {
  const scene = new THREE.Scene();
  const fleet = createSeasonalFleet(scene);
  const motion = new JourneyMotion();
  const departure = new FinaleDeparture();
  const engine = scene.getObjectsByProperty('name', 'paper-train-body-0').at(-1);
  const delta = 1 / hz;
  motion.distance = motion.target = JOURNEY_END - 1.6;
  fleet.update(motion.distance, delta, 0, false);
  let previousX = engine.parent.position.x;
  let nearStop = 0;
  let longestNearStop = 0;
  let committedAt;
  let finishedAt;
  motion.scroll(1.6);

  for (let frame = 0; frame < hz * 10; frame++) {
    const time = (frame + 1) * delta;
    motion.step(delta);
    if (motion.committedToFinale && committedAt === undefined) {
      committedAt = time;
      expect(motion.moving).toBe(true);
      expect(motion.finished).toBe(false);
    }
    if (motion.finished && finishedAt === undefined) finishedAt = time;
    const offset = departure.update(delta, motion.committedToFinale, false, 9);
    fleet.update(motion.distance, delta, time, false, offset);
    const x = engine.parent.position.x;
    const speed = (x - previousX) / delta;
    expect(speed, 'the train does not reverse during the handoff').toBeGreaterThanOrEqual(-1e-8);
    previousX = x;
    nearStop = speed < 0.2 ? nearStop + delta : 0;
    longestNearStop = Math.max(longestNearStop, nearStop);
    if (departure.complete) break;
  }

  expect(committedAt, 'the visitor reaches the automatic departure').toBeDefined();
  expect(finishedAt).toBeDefined();
  expect(committedAt).toBeLessThan(finishedAt);
  expect(longestNearStop, 'the train does not pause before its automatic departure').toBeLessThan(0.3);
  expect(departure.complete).toBe(true);
  expect(engine.parent.position.x).toBeGreaterThan(JOURNEY_END + 7);
});
