import { expect, test } from 'vitest';
import { FinaleDeparture } from './year/finale-departure.ts';

test('the vehicle moves as soon as the final handoff begins and leaves only once', () => {
  const departure = new FinaleDeparture();
  expect(departure.update(20, false, false, 12)).toBe(0);
  expect(departure.complete).toBe(false);
  const moving = departure.update(0.2, true, false, 12);
  expect(moving).toBeGreaterThan(0);
  expect(moving).toBeLessThan(1);
  expect(departure.complete).toBe(false);
  expect(departure.update(5, true, false, 12)).toBe(12);
  expect(departure.complete).toBe(true);
  expect(departure.update(20, true, false, 12)).toBe(12);
  expect(departure.complete).toBe(true);
});

test('departure and return distances do not depend on the frame rate', () => {
  const a = new FinaleDeparture();
  const b = new FinaleDeparture();
  let x;
  let y;
  for (let i = 0; i < 60; i++) x = a.update(1 / 30, true, false, 12);
  for (let i = 0; i < 240; i++) y = b.update(1 / 120, true, false, 12);
  expect(x).toBeCloseTo(y, 9);
  for (let i = 0; i < 9; i++) x = a.update(1 / 30, false, false, 12);
  for (let i = 0; i < 36; i++) y = b.update(1 / 120, false, false, 12);
  expect(x).toBeCloseTo(y, 9);
});

test('reverse travel returns the vehicle smoothly and permits a fresh departure', () => {
  const departure = new FinaleDeparture();
  departure.update(5, true, false, 12);
  const returning = departure.update(0.1, false, false, 12);
  expect(returning).toBeGreaterThan(0);
  expect(returning).toBeLessThan(12);
  expect(departure.complete).toBe(false);
  expect(departure.update(0, true, false, 12)).toBe(returning);
  expect(departure.update(0.2, true, false, 12)).toBeGreaterThan(returning);
  expect(departure.update(5, true, false, 12)).toBe(12);
  expect(departure.update(2, false, false, 12)).toBe(0);
  expect(departure.update(0.2, true, false, 12)).toBeGreaterThan(0);
});

test('a wider screen extends the departure without a jump or backward movement', () => {
  const departure = new FinaleDeparture();
  const beforeResize = departure.update(1.25, true, false, 12);
  expect(departure.update(0, true, false, 20)).toBe(beforeResize);
  let previous = beforeResize;
  for (let i = 0; i < 600; i++) {
    const next = departure.update(1 / 60, true, false, i < 120 ? 20 : 5);
    expect(next).toBeGreaterThanOrEqual(previous);
    previous = next;
  }
  expect(previous).toBe(20);
  expect(departure.complete).toBe(true);
  const extended = departure.update(0.1, true, false, 32);
  expect(extended).toBeGreaterThan(20);
  expect(extended).toBeLessThan(32);
  expect(departure.complete).toBe(false);
  expect(departure.update(5, true, false, 32)).toBe(32);
});

test('reduced motion leaves the vehicle beyond the screen without animated travel', () => {
  const departure = new FinaleDeparture();
  expect(departure.update(0, true, true, 12)).toBe(12);
  expect(departure.complete).toBe(true);
  expect(departure.update(0, true, true, 20)).toBe(20);
  expect(departure.update(0, false, true, 20)).toBe(0);
  expect(departure.complete).toBe(false);
});
