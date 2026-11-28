import { expect, test } from 'vitest';
import { bridgeLift, SUMMER_BRIDGE_X, SUMMER_BRIDGE_HALF_SPAN, SUMMER_BRIDGE_RISE } from './summer-bridge.ts';

test('bridge is centered at summer with level, smooth joins and one shallow crest', () => {
  const half = SUMMER_BRIDGE_HALF_SPAN;
  expect(bridgeLift(SUMMER_BRIDGE_X)).toBe(SUMMER_BRIDGE_RISE);
  for (const sign of [-1, 1]) {
    expect(bridgeLift(SUMMER_BRIDGE_X + sign * half)).toBe(0);
    expect(bridgeLift(SUMMER_BRIDGE_X + sign * (half + 1))).toBe(0);
    expect(bridgeLift(SUMMER_BRIDGE_X + sign * (half - 0.001)) / 0.001).toBeLessThan(0.001);
  }
  let previous = SUMMER_BRIDGE_RISE;
  for (let offset = 0; offset <= half; offset += 0.025) {
    const lift = bridgeLift(SUMMER_BRIDGE_X + offset);
    expect(lift).toBeLessThanOrEqual(previous + 1e-10);
    expect(lift).toBeCloseTo(bridgeLift(SUMMER_BRIDGE_X - offset), 10);
    previous = lift;
  }
});
