import { afterEach, expect, test, vi } from 'vitest';
import * as THREE from 'three';
import { PaperDetail } from '../paper-detail.ts';
import { resetTemplates } from '../paper-geometry.ts';
import { paperSheet, resetPaperMaterials } from '../paper-materials.ts';
import { addBroadTree } from './broad-tree.ts';

const geometries = [];
const shapes = ['rounded', 'slender', 'spreading'];
const variants = [
  'spring-green',
  'spring-blossom',
  'summer-alder',
  'summer-birch',
  'autumn-maple',
  'autumn-birch',
  'autumn-oak',
];

afterEach(() => {
  for (const geometry of geometries.splice(0)) geometry.dispose();
  resetTemplates();
  resetPaperMaterials();
});

function buildTree(variant = 'spring-green', shape, x = 0) {
  const root = new THREE.Group();
  const animate = vi.fn();
  const tree = addBroadTree(
    {
      detail: (name, x, z, scale) => new PaperDetail(root, name, x, 0, z, scale),
      animate,
    },
    x,
    variant,
    1,
    0,
    shape,
  );
  const geometry = tree.buildGeometry();
  geometries.push(geometry);
  const mesh = new THREE.Mesh(geometry, paperSheet());
  tree.group.add(mesh);
  root.updateMatrixWorld(true);
  return { tree: tree.group, mesh, geometry, animate, box: new THREE.Box3().setFromObject(tree.group) };
}

test('the default rounded form keeps the original tree dimensions', () => {
  const original = buildTree();
  const rounded = buildTree('spring-green', 'rounded');
  expect(rounded.geometry.getAttribute('position').array).toEqual(original.geometry.getAttribute('position').array);
  expect(original.box.min.x).toBeCloseTo(-1.305, 5);
  expect(original.box.max.x).toBeCloseTo(1.28, 5);
  expect(original.box.min.y).toBeCloseTo(0, 5);
  expect(original.box.max.y).toBeCloseTo(3.49, 5);
});

test.each(variants)('%s supports distinct related forms without adding geometry or colors', variant => {
  const trees = shapes.map(shape => buildTree(variant, shape));
  const original = trees[0];
  const originalColors = original.geometry.getAttribute('color').array;
  const originalPositions = original.geometry.getAttribute('position');
  const height = original.box.getSize(new THREE.Vector3()).y;

  for (const tree of trees) {
    expect(tree.tree.children).toEqual([tree.mesh]);
    expect(tree.mesh.material).toBe(paperSheet());
    expect(tree.animate).not.toHaveBeenCalled();
    expect(tree.geometry.getAttribute('color').array).toEqual(originalColors);
    expect(tree.geometry.getAttribute('position').count).toBe(originalPositions.count);
    expect(tree.box.max.y).toBeCloseTo(original.box.max.y, 5);
    expect(tree.box.getSize(new THREE.Vector3()).y / height).toBeLessThanOrEqual(1.01);
  }

  const [, slender, spreading] = trees;
  expect(slender.geometry.getAttribute('position').array).not.toEqual(originalPositions.array);
  expect(spreading.geometry.getAttribute('position').array).not.toEqual(originalPositions.array);
  expect(slender.geometry.getAttribute('position').array).not.toEqual(
    spreading.geometry.getAttribute('position').array,
  );
  expect(slender.box.getSize(new THREE.Vector3()).x).toBeLessThan(spreading.box.getSize(new THREE.Vector3()).x * 0.92);
  for (const tree of [slender, spreading]) {
    expect(tree.box.min.x).toBeGreaterThanOrEqual(-1.3);
    expect(tree.box.max.x).toBeLessThanOrEqual(1.3);
  }
});

test.each(shapes)('%s has the same geometry at every placement and on a fresh build', shape => {
  const first = buildTree('spring-blossom', shape, 2);
  const second = buildTree('spring-blossom', shape, 25);
  expect(first.geometry.getAttribute('position').array).toEqual(second.geometry.getAttribute('position').array);
  expect(first.geometry.getAttribute('color').array).toEqual(second.geometry.getAttribute('color').array);
  expect(first.tree.position.x).toBe(2);
  expect(second.tree.position.x).toBe(25);
});
