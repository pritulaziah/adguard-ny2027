import { expect, test } from 'vitest';
import { rectGeometry, resetTemplates, templateCacheSize } from './paper-geometry.ts';
import { resetWheelTemplates, retroCarWheel, wheelTemplateCacheSize } from './vehicles/wheels.ts';

test('paper shape templates are disposed and cleared', () => {
  rectGeometry(1, 1, 0.02);
  expect(templateCacheSize()).toBeGreaterThan(0);

  resetTemplates();

  expect(templateCacheSize()).toBe(0);
});

test('wheel templates are disposed and cleared', () => {
  retroCarWheel(0.2);
  expect(wheelTemplateCacheSize()).toBeGreaterThan(0);

  resetWheelTemplates();

  expect(wheelTemplateCacheSize()).toBe(0);
});
