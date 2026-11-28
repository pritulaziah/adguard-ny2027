import { afterEach, expect, test, vi } from 'vitest';
import * as THREE from 'three';
import { resetTemplates } from '../paper-geometry.ts';
import { paperSheet, resetPaperMaterials } from '../paper-materials.ts';
import { addFir } from './fir.ts';

const geometries = [];

afterEach(() => {
  for (const geometry of geometries.splice(0)) geometry.dispose();
  resetTemplates();
  resetPaperMaterials();
});

function buildFir({ height = 3.3, snowy = false, festive = false, x = 0, z = -2.05, silhouette = 'full' } = {}) {
  const group = new THREE.Group();
  const animate = vi.fn();
  addFir({ group, animate }, x, height, snowy, festive, z, silhouette);
  group.updateMatrixWorld(true);
  const fir = group.getObjectByName('paper-fir');
  const mesh = fir.getObjectByName('paper-fir-mesh');
  geometries.push(mesh.geometry);
  return { fir, mesh, animate, box: new THREE.Box3().setFromObject(fir) };
}

function colorBounds(geometry, hex) {
  const color = new THREE.Color(hex);
  const colors = geometry.getAttribute('color');
  const positions = geometry.getAttribute('position');
  const box = new THREE.Box3();
  const vertex = new THREE.Vector3();
  for (let i = 0; i < colors.count; i++) {
    if (
      Math.abs(colors.getX(i) - color.r) < 1e-6 &&
      Math.abs(colors.getY(i) - color.g) < 1e-6 &&
      Math.abs(colors.getZ(i) - color.b) < 1e-6
    ) {
      box.expandByPoint(vertex.fromBufferAttribute(positions, i));
    }
  }
  return box;
}

test.each([2.6, 3.3, 3.7])('fir height %s keeps its roots on the ground and a broad crown', height => {
  const { fir, box } = buildFir({ height, x: 5.2, z: -2.35 });
  expect(fir.position.x).toBe(5.2);
  expect(fir.position.z).toBe(-2.35);
  expect(box.min.y).toBeCloseTo(0.26, 5);
  expect(box.max.y - box.min.y).toBeCloseTo(height, 5);
  const widthRatio = (box.max.x - box.min.x) / height;
  expect(widthRatio).toBeGreaterThan(0.61);
  expect(widthRatio).toBeLessThan(0.64);
});

test.each([
  ['full', 0.61, 0.64],
  ['slender', 0.56, 0.59],
  ['leaning', 0.59, 0.62],
])('%s fir keeps its height and uses the same mesh budget', (silhouette, minimumWidth, maximumWidth) => {
  const full = buildFir({ snowy: true, silhouette: 'full' });
  const variant = buildFir({ snowy: true, silhouette });
  expect(variant.box.min.y).toBeCloseTo(0.26, 5);
  expect(variant.box.max.y - variant.box.min.y).toBeCloseTo(3.3, 5);
  const widthRatio = (variant.box.max.x - variant.box.min.x) / 3.3;
  expect(widthRatio).toBeGreaterThan(minimumWidth);
  expect(widthRatio).toBeLessThan(maximumWidth);
  expect(variant.mesh.geometry.getAttribute('position').count).toBe(full.mesh.geometry.getAttribute('position').count);
  expect(variant.mesh.geometry.getAttribute('color').array).toEqual(full.mesh.geometry.getAttribute('color').array);
  expect(variant.fir.children).toHaveLength(1);
  expect(variant.mesh.material).toBe(full.mesh.material);
  expect(variant.animate).not.toHaveBeenCalled();
});

test('slender and leaning firs change the silhouette while keeping the trunk rooted', () => {
  const full = buildFir();
  const slender = buildFir({ silhouette: 'slender' });
  const leaning = buildFir({ silhouette: 'leaning' });
  expect(slender.box.getSize(new THREE.Vector3()).x).toBeLessThan(full.box.getSize(new THREE.Vector3()).x);
  const trunk = colorBounds(leaning.mesh.geometry, '#907660');
  expect(trunk.min.x).toBeLessThan(0);
  expect(trunk.max.x).toBeGreaterThan(0);
  const positions = leaning.mesh.geometry.getAttribute('position');
  const topVertices = [];
  for (let i = 0; i < positions.count; i++) {
    if (Math.abs(positions.getY(i) - leaning.box.max.y) < 1e-5) topVertices.push(positions.getX(i));
  }
  expect(topVertices.length).toBeGreaterThan(0);
  expect(Math.min(...topVertices)).toBeGreaterThan(0.07);
  expect(Math.max(...topVertices)).toBeLessThan(0.12);
});

test('four paper tiers narrow toward the top and stay in one static mesh', () => {
  const { fir, mesh, animate } = buildFir();
  expect(fir.children).toEqual([mesh]);
  expect(mesh.material).toBe(paperSheet());
  expect(animate).not.toHaveBeenCalled();
  const tiers = ['#668574', '#739380', '#80a08a', '#8aaa94'].map(hex => colorBounds(mesh.geometry, hex));
  for (const tier of tiers) expect(tier.isEmpty()).toBe(false);
  for (let i = 1; i < tiers.length; i++) {
    expect(tiers[i].max.y).toBeGreaterThan(tiers[i - 1].max.y);
    expect(tiers[i].getSize(new THREE.Vector3()).x).toBeLessThan(tiers[i - 1].getSize(new THREE.Vector3()).x);
    expect(tiers[i].min.y).toBeLessThan(tiers[i - 1].max.y);
  }
  const positions = mesh.geometry.getAttribute('position');
  const colors = mesh.geometry.getAttribute('color');
  expect(colors.count).toBe(positions.count);
  expect([...positions.array, ...colors.array].every(Number.isFinite)).toBe(true);
});

test('snow adds pale paper overlays without changing the tree silhouette', () => {
  const bare = buildFir();
  const snowy = buildFir({ snowy: true });
  expect(colorBounds(bare.mesh.geometry, '#edf2ef').isEmpty()).toBe(true);
  const snow = colorBounds(snowy.mesh.geometry, '#edf2ef');
  expect(snow.isEmpty()).toBe(false);
  expect(snow.max.y).toBeGreaterThan(3.4);
  expect(snow.min.y).toBeLessThan(1.1);
  expect(snowy.box.min.x).toBeCloseTo(bare.box.min.x, 5);
  expect(snowy.box.max.x).toBeCloseTo(bare.box.max.x, 5);
  expect(snowy.box.min.y).toBeCloseTo(bare.box.min.y, 5);
  expect(snowy.box.max.y).toBeCloseTo(bare.box.max.y, 5);
});

test.each([false, true])('festive decorations remain optional with snowy=%s', snowy => {
  const plain = buildFir({ snowy });
  const festive = buildFir({ snowy, festive: true });
  for (const hex of ['#e4c07c', '#cf8572']) {
    expect(colorBounds(plain.mesh.geometry, hex).isEmpty()).toBe(true);
    expect(colorBounds(festive.mesh.geometry, hex).isEmpty()).toBe(false);
  }
  expect(festive.fir.children).toHaveLength(1);
  expect(festive.animate).not.toHaveBeenCalled();
  expect(festive.box.max.y).toBeGreaterThan(plain.box.max.y);
  expect(festive.box.max.y - plain.box.max.y).toBeLessThan(0.4);
  expect(festive.box.min.y).toBeCloseTo(plain.box.min.y, 5);
});
