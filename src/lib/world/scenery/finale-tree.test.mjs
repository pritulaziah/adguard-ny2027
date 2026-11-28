import { afterEach, expect, test, vi } from 'vitest';
import * as THREE from 'three';
import { FINALE_TREE_X } from '../finale.ts';
import { PaperDetail } from '../paper-detail.ts';
import { resetTemplates } from '../paper-geometry.ts';
import { paperSheet, resetPaperMaterials } from '../paper-materials.ts';
import { addFinaleTree } from './finale-tree.ts';

const geometries = [];

afterEach(() => {
  for (const geometry of geometries.splice(0)) geometry.dispose();
  resetTemplates();
  resetPaperMaterials();
});

function buildFinale(originalTreeSize = false) {
  const group = new THREE.Group();
  const details = [];
  const animate = vi.fn();
  addFinaleTree({
    detail(name, x, z, scale = 1) {
      const effectiveScale = originalTreeSize && name === 'paper-finale-tree' ? 1 : scale;
      const detail = new PaperDetail(group, name, x, 0.34, z, effectiveScale);
      details.push(detail);
      return detail;
    },
    animate,
  });
  for (const detail of details) {
    const geometry = detail.buildGeometry();
    geometries.push(geometry);
    detail.group.add(new THREE.Mesh(geometry, paperSheet()));
  }
  group.updateMatrixWorld(true);
  const tree = group.getObjectByName('paper-finale-tree');
  return { tree, gifts: group.getObjectsByProperty('name', 'paper-finale-gift'), animate };
}

function colorBounds(mesh, hex) {
  const color = new THREE.Color(hex);
  const colors = mesh.geometry.getAttribute('color');
  const positions = mesh.geometry.getAttribute('position');
  const box = new THREE.Box3();
  for (let i = 0; i < colors.count; i++) {
    if (
      Math.abs(colors.getX(i) - color.r) < 1e-6 &&
      Math.abs(colors.getY(i) - color.g) < 1e-6 &&
      Math.abs(colors.getZ(i) - color.b) < 1e-6
    ) {
      box.expandByPoint(new THREE.Vector3().fromBufferAttribute(positions, i).applyMatrix4(mesh.matrixWorld));
    }
  }
  return box;
}

test('the finale tree grows uniformly by ten percent with its root fixed', () => {
  const original = buildFinale(true);
  const enlarged = buildFinale();
  const originalBox = new THREE.Box3().setFromObject(original.tree);
  const enlargedBox = new THREE.Box3().setFromObject(enlarged.tree);
  const oldSize = originalBox.getSize(new THREE.Vector3());
  const newSize = enlargedBox.getSize(new THREE.Vector3());

  for (const axis of ['x', 'y', 'z']) expect(newSize[axis]).toBeCloseTo(oldSize[axis] * 1.1, 5);
  expect(enlarged.tree.position.toArray()).toEqual([FINALE_TREE_X, 0.34, -2.45]);
  expect(enlargedBox.min.y).toBeCloseTo(originalBox.min.y, 5);
  expect(enlargedBox.min.y).toBeCloseTo(0.34, 5);
  expect(enlargedBox.max.y).toBeCloseTo(0.34 + 3.78 * 1.1, 5);
  expect(enlarged.tree.children).toHaveLength(1);
  const mesh = enlarged.tree.children[0];
  expect(mesh.material).toBe(paperSheet());
  expect(mesh.geometry.getAttribute('position').array).toEqual(
    original.tree.children[0].geometry.getAttribute('position').array,
  );
  expect(enlarged.animate).not.toHaveBeenCalled();
});

test('both paper star layers grow with the crown', () => {
  const original = buildFinale(true);
  const enlarged = buildFinale();
  for (const hex of ['#b99958', '#f0d598']) {
    const before = colorBounds(original.tree.children[0], hex);
    const after = colorBounds(enlarged.tree.children[0], hex);
    expect(before.isEmpty()).toBe(false);
    expect(after.isEmpty()).toBe(false);
    const oldSize = before.getSize(new THREE.Vector3());
    const newSize = after.getSize(new THREE.Vector3());
    for (const axis of ['x', 'y', 'z']) expect(newSize[axis]).toBeCloseTo(oldSize[axis] * 1.1, 5);
    expect(after.max.y - enlarged.tree.position.y).toBeCloseTo((before.max.y - original.tree.position.y) * 1.1, 5);
  }
});

test('the four gifts keep their size and position beside the enlarged tree', () => {
  const original = buildFinale(true);
  const enlarged = buildFinale();
  const offsets = [-2.42, -0.73, 0.78, 2.38];
  const widths = [0.62, 0.48, 0.56, 0.48];
  expect(enlarged.gifts).toHaveLength(4);
  for (const [index, gift] of enlarged.gifts.entries()) {
    const before = original.gifts[index];
    expect(gift.position.toArray()).toEqual([FINALE_TREE_X + offsets[index], 0.34, -0.62]);
    expect(gift.scale.toArray()).toEqual([1, 1, 1]);
    expect(gift.matrixWorld.elements).toEqual(before.matrixWorld.elements);
    expect(gift.children[0].geometry.getAttribute('position').array).toEqual(
      before.children[0].geometry.getAttribute('position').array,
    );
    const size = new THREE.Box3().setFromObject(gift).getSize(new THREE.Vector3());
    expect(size.x).toBeCloseTo(widths[index] * 1.12, 5);
  }
});
