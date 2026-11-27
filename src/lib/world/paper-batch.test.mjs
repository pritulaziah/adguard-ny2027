import { expect, test } from 'vitest';
import * as THREE from 'three';
import { PaperBatch } from './paper-batch.ts';

function numberOf(geometry, name) {
  return geometry.getAttribute(name).count;
}

test('one batch writes one non-indexed buffer with positions and baked colors', () => {
  const batch = new PaperBatch();
  batch.add(new THREE.BoxGeometry(1, 1, 1), '#ff0000', { x: 2 });
  batch.add(new THREE.BoxGeometry(2, 1, 1), '#00ff00', { x: -3 });

  const geometry = batch.build();
  expect(geometry).not.toBeNull();
  expect(geometry.index).toBeNull();
  expect(numberOf(geometry, 'position')).toBe(72);
  expect(numberOf(geometry, 'color')).toBe(72);
  expect(numberOf(geometry, 'position')).toBe(numberOf(geometry, 'color'));

  geometry.computeBoundingBox();
  expect(geometry.boundingBox.min.x).toBeCloseTo(-4);
  expect(geometry.boundingBox.max.x).toBeCloseTo(2.5);

  // The first box stays red, the second stays green.
  const color = geometry.getAttribute('color');
  expect(color.getX(0)).toBeCloseTo(1);
  expect(color.getY(0)).toBeCloseTo(0);
  expect(color.getX(36)).toBeCloseTo(0);
  expect(color.getY(36)).toBeCloseTo(1);
});

test('an extrusion keeps its folded side darker than its lid', () => {
  const shape = new THREE.Shape();
  shape.moveTo(-0.5, -0.5);
  shape.lineTo(0.5, -0.5);
  shape.lineTo(0.5, 0.5);
  shape.lineTo(-0.5, 0.5);
  shape.closePath();

  const batch = new PaperBatch();
  batch.add(new THREE.ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: false }), '#ffffff');

  const color = batch.build().getAttribute('color');
  let light = 0;
  let dark = 0;
  for (let i = 0; i < color.count; i++) {
    if (color.getX(i) === 1) light++;
    else if (Math.abs(color.getX(i) - 0.72) < 1e-6) dark++;
  }
  expect(light).toBeGreaterThan(0);
  expect(dark).toBeGreaterThan(0);
});

test('a side color replaces the darkened fold', () => {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(1, 0);
  shape.lineTo(1, 1);
  shape.closePath();

  const batch = new PaperBatch();
  batch.add(new THREE.ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: false }), '#ffffff', {}, '#000000');

  const color = batch.build().getAttribute('color');
  let black = 0;
  for (let i = 0; i < color.count; i++) if (color.getX(i) === 0) black++;
  expect(black).toBeGreaterThan(0);
});

test('a placement composes position, rotation, and scale like an Object3D', () => {
  const batch = new PaperBatch();
  batch.add(new THREE.BoxGeometry(1, 2, 1), '#ffffff', {
    x: 1,
    y: 2,
    z: 3,
    rotate: [0, 0, Math.PI / 2],
    scale: [2, 1, 1],
  });
  const geometry = batch.build();
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  // Scale x2 on local x, then turn a quarter, so the local x span becomes y.
  expect(box.min.x).toBeCloseTo(0);
  expect(box.max.x).toBeCloseTo(2);
  expect(box.min.y).toBeCloseTo(1);
  expect(box.max.y).toBeCloseTo(3);
  expect(box.min.z).toBeCloseTo(2.5);
  expect(box.max.z).toBeCloseTo(3.5);
});
