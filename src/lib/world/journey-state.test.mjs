import { expect, test } from 'vitest';
import { needsMotionStart } from './journey-state.ts';

function state(overrides = {}) {
  return { ready: true, moving: false, stop: 0, cameraSettled: false, discoveries: 0, ...overrides };
}

test('a scroll starts motion from rest or from a settled camera', () => {
  expect(needsMotionStart(state())).toBe(true);
  expect(needsMotionStart(state({ cameraSettled: true }))).toBe(true);
  expect(needsMotionStart(state({ moving: true, cameraSettled: true }))).toBe(true);
});

test('a scroll does not restart motion that is already running', () => {
  expect(needsMotionStart(state({ moving: true }))).toBe(false);
});
