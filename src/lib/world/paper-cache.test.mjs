import { expect, test } from 'vitest';
import { ovalGeometry, rectGeometry, resetTemplates, templateCacheSize } from './paper-geometry.ts';
import { resetWheelTemplates, retroCarWheel, wheelTemplateCacheSize } from './vehicles/wheels.ts';

test('paper shape templates are disposed and cleared', () => {
  const geometry = rectGeometry(1, 1, 0.02);
  expect(templateCacheSize()).toBeGreaterThan(0);

  resetTemplates();

  expect(templateCacheSize()).toBe(0);
  geometry.dispose();
});

test('paper shape templates do not depend on the size', () => {
  resetTemplates();
  const first = ovalGeometry(1, 2, 0.02);
  const second = ovalGeometry(5, 7, 0.02);

  expect(templateCacheSize()).toBe(1);

  first.dispose();
  second.dispose();
  resetTemplates();
});

test('wheel templates are disposed and cleared', () => {
  retroCarWheel(0.2);
  expect(wheelTemplateCacheSize()).toBeGreaterThan(0);

  resetWheelTemplates();

  expect(wheelTemplateCacheSize()).toBe(0);
});
