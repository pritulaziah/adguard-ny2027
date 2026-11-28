import { expect, test, vi } from 'vitest';
import * as THREE from 'three';
import { PaperDetail } from '../../paper-detail.ts';
import { stopX } from '../../route.ts';
import { SEASON_BORDERS } from '../../seasons.ts';
import { addDistantRiver } from './distant-river.ts';

test('summer stream is one compact flat static paper mesh from the near ridge through the bridge', () => {
  const group = new THREE.Group();
  const details = [];
  const animate = vi.fn();
  addDistantRiver({
    group,
    animate,
    detail(name, x, z, scale, y) {
      const detail = new PaperDetail(group, name, x, y, z, scale);
      details.push(detail);
      return detail;
    },
  });
  expect(details).toHaveLength(1);
  expect(animate).not.toHaveBeenCalled();
  const river = group.getObjectByName('summer-distant-river');
  const geometry = details[0].buildGeometry();
  river.add(new THREE.Mesh(geometry));
  group.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(river);
  expect(bounds.min.x).toBeGreaterThan(SEASON_BORDERS.summer);
  expect(bounds.max.x).toBeLessThan(SEASON_BORDERS.autumn);
  expect(bounds.min.x).toBeLessThan(stopX(4));
  expect(bounds.max.x).toBeGreaterThan(stopX(4));
  expect(bounds.max.x - bounds.min.x).toBeLessThan(5);
  // Tucks behind the near ridge front plane (z = -3.055) and reaches the foreground.
  expect(bounds.min.z).toBeLessThan(-3.06);
  expect(bounds.max.z).toBeGreaterThan(2);
  // Flat stream only: no raised extra hill mound behind the bridge.
  expect(bounds.min.y).toBeGreaterThanOrEqual(0.26);
  expect(bounds.max.y).toBeLessThan(0.3);
  expect(geometry.getAttribute('color').count).toBe(geometry.getAttribute('position').count);
  expect(river.children).toHaveLength(1);
  geometry.dispose();
});

test('stream narrows and curves toward the near ridge with shrinking glints inside the water', () => {
  const shapes = [];
  const reflections = [];
  addDistantRiver({
    detail() {
      return {
        shape(shape, color, x, y, z, rotate) {
          shapes.push({ shape, color, y, rotate });
        },
        oval(width, height, color, x, y, z, rotate) {
          reflections.push({ width, height, x, y, z, rotate });
        },
      };
    },
  });
  expect(shapes).toHaveLength(2);
  const [bank, water] = shapes;
  expect(water.y).toBeGreaterThan(bank.y);
  expect(bank.rotate?.[0]).toBeCloseTo(-Math.PI / 2);
  expect(water.rotate?.[0]).toBeCloseTo(-Math.PI / 2);

  const points = water.shape.getPoints(64);
  function sectionAt(sy) {
    const crossings = [];
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1];
      const b = points[i];
      if ((a.y <= sy && b.y > sy) || (b.y <= sy && a.y > sy)) {
        crossings.push(a.x + ((sy - a.y) / (b.y - a.y)) * (b.x - a.x));
      }
    }
    expect(crossings).toHaveLength(2);
    const low = Math.min(...crossings);
    const high = Math.max(...crossings);
    return { width: high - low, center: (high + low) / 2 };
  }

  const foreground = sectionAt(-1.5);
  const bridge = sectionAt(0);
  const midground = sectionAt(1.6);
  const far = sectionAt(2.85);
  expect(foreground.width).toBeGreaterThan(bridge.width);
  expect(bridge.width).toBeGreaterThan(midground.width * 1.3);
  expect(midground.width).toBeGreaterThan(far.width * 1.4);
  expect(far.center).toBeGreaterThan(midground.center + 0.8);
  expect(midground.center).toBeGreaterThan(bridge.center + 0.5);
  expect(bridge.center).toBeGreaterThan(foreground.center + 0.3);

  const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
  const waterGeometry = new THREE.ShapeGeometry(water.shape);
  const waterSurface = new THREE.Mesh(waterGeometry, material);
  const ray = new THREE.Raycaster();
  function covers(sx, sy) {
    ray.set(new THREE.Vector3(sx, sy, 1), new THREE.Vector3(0, 0, -1));
    return ray.intersectObject(waterSurface).length > 0;
  }

  expect(reflections).toHaveLength(3);
  for (let i = 1; i < reflections.length; i++) {
    expect(reflections[i].width).toBeLessThan(reflections[i - 1].width);
    expect(reflections[i].z).toBeLessThan(reflections[i - 1].z);
  }
  for (const reflection of reflections) {
    // Shape y equals -local z under the -PI/2 X rotation.
    const sy = -reflection.z;
    for (const dx of [-reflection.width / 2, reflection.width / 2]) {
      expect(covers(reflection.x + dx, sy), `glint inside water at (${reflection.x + dx}, ${sy})`).toBe(true);
    }
  }
  waterGeometry.dispose();
  material.dispose();
});
