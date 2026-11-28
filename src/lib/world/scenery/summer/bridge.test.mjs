import { expect, test, vi } from 'vitest';
import * as THREE from 'three';
import { PaperDetail } from '../../paper-detail.ts';
import { bridgeLift, ROAD_SURFACE_Y, SUMMER_BRIDGE_HALF_SPAN, SUMMER_BRIDGE_X } from '../../summer-bridge.ts';
import { addForegroundFraming } from '../foreground.ts';
import { addTravelSurfaces } from '../surfaces.ts';
import { addSummerBridge } from './bridge.ts';
import { addDistantRiver } from './distant-river.ts';

test('bridge leaves its arch open and joins the road above a continuous stream', () => {
  const group = new THREE.Group();
  const details = [];
  const animate = vi.fn();
  const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
  const ctx = {
    group,
    animate,
    detail(name, x, z, scale, y) {
      const detail = new PaperDetail(group, name, x, y, z, scale);
      details.push(detail);
      return detail;
    },
  };
  addTravelSurfaces(ctx);
  addDistantRiver(ctx);
  addSummerBridge(ctx);
  for (const detail of details) detail.group.add(new THREE.Mesh(detail.buildGeometry(), material));
  group.updateMatrixWorld(true);
  const bridge = group.getObjectByName('summer-wooden-bridge');
  const stream = group.getObjectByName('summer-distant-river');
  expect(animate).not.toHaveBeenCalled();
  expect(bridge.children).toHaveLength(1);
  const box = new THREE.Box3().setFromObject(bridge);
  expect(box.min.x).toBeCloseTo(SUMMER_BRIDGE_X - SUMMER_BRIDGE_HALF_SPAN, 4);
  expect(box.max.x).toBeCloseTo(SUMMER_BRIDGE_X + SUMMER_BRIDGE_HALF_SPAN, 4);
  expect(box.max.x - box.min.x).toBeLessThan(3.5);

  const ray = new THREE.Raycaster();
  const down = new THREE.Vector3(0, -1, 0);
  for (let offset = -SUMMER_BRIDGE_HALF_SPAN + 0.01; offset < SUMMER_BRIDGE_HALF_SPAN; offset += 0.1) {
    const x = SUMMER_BRIDGE_X + offset;
    ray.set(new THREE.Vector3(x, 2, 0), down);
    const hit = ray.intersectObject(bridge)[0];
    expect(hit).toBeTruthy();
    expect(Math.abs(hit.point.y - ROAD_SURFACE_Y - bridgeLift(x))).toBeLessThan(0.007);
  }
  ray.set(new THREE.Vector3(SUMMER_BRIDGE_X, 0.5, 2), new THREE.Vector3(0, 0, -1));
  expect(ray.intersectObject(bridge)).toHaveLength(0);
  // Timber posts and rails frame open gaps instead of an opaque stone parapet.
  const railX = SUMMER_BRIDGE_X + 0.35;
  const railBase = ROAD_SURFACE_Y + bridgeLift(railX);
  ray.set(new THREE.Vector3(railX, railBase + 0.25, 2), new THREE.Vector3(0, 0, -1));
  expect(ray.intersectObject(bridge)).toHaveLength(0);
  ray.set(new THREE.Vector3(railX, railBase + 0.37, 2), new THREE.Vector3(0, 0, -1));
  expect(ray.intersectObject(bridge).length).toBeGreaterThan(0);
  ray.set(
    new THREE.Vector3(SUMMER_BRIDGE_X, ROAD_SURFACE_Y + bridgeLift(SUMMER_BRIDGE_X) + 0.25, 2),
    new THREE.Vector3(0, 0, -1),
  );
  expect(ray.intersectObject(bridge).length).toBeGreaterThan(0);
  for (const z of [-0.8, 0, 0.8]) {
    ray.set(new THREE.Vector3(SUMMER_BRIDGE_X, 0.6, z), down);
    const water = ray.intersectObject(stream)[0];
    expect(water).toBeTruthy();
    expect(water.point.y).toBeGreaterThan(0.27);
    expect(water.point.y).toBeLessThan(0.3);
  }
  for (const detail of details) for (const child of detail.group.children) child.geometry?.dispose();
  group.getObjectByName('paper-continuous-road').geometry.dispose();
  material.dispose();
});

test('summer foreground tufts stay clear of the stream beneath the bridge', async () => {
  const group = new THREE.Group();
  const tufts = [];
  await addForegroundFraming(
    {
      group,
      animate: vi.fn(),
      detail(name, x, z, scale, y) {
        const detail = new PaperDetail(group, name, x, y, z, scale);
        if (name === 'fg-summer-meadow') tufts.push(x);
        return detail;
      },
    },
    async () => {},
  );
  expect(tufts.length).toBeGreaterThan(0);
  for (const x of tufts) {
    expect(Math.abs(x - SUMMER_BRIDGE_X), `summer tuft at ${x}`).toBeGreaterThanOrEqual(SUMMER_BRIDGE_HALF_SPAN + 0.4);
  }
});
