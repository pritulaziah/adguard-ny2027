import * as THREE from 'three';
import { PaperBatch } from '../paper-brush';
import { paperSheet } from '../paper-materials';

// Wheel geometry never changes, so one merged buffer serves all wheels of a
// type. This keeps the tire, rim, spokes, hub, and cap in one draw call.
const wheelTemplates = new Map<string, THREE.BufferGeometry>();

function spokedWheelGeometry(radius: number, tireColor: string, rimColor: string, spokeColor: string): THREE.BufferGeometry {
  const key = `${radius}:${tireColor}:${rimColor}:${spokeColor}`;
  const cached = wheelTemplates.get(key);
  if (cached) return cached;

  const batch = new PaperBatch();
  batch.add(new THREE.TorusGeometry(radius, 0.036, 8, 24), tireColor);
  batch.add(new THREE.TorusGeometry(radius - 0.04, 0.015, 6, 22), rimColor, { z: 0.004 });
  for (let i = 0; i < 4; i++) {
    batch.add(new THREE.BoxGeometry((radius - 0.02) * 1.88, 0.017, 0.015), spokeColor, {
      rotate: [0, 0, (i * Math.PI) / 4],
      z: -0.003 + i * 0.002,
    });
  }
  batch.add(new THREE.CylinderGeometry(0.056, 0.056, 0.058, 14), '#dfd3b8', {
    rotate: [Math.PI / 2, 0, 0],
    z: 0.006,
  });
  batch.add(new THREE.CylinderGeometry(0.026, 0.026, 0.064, 10), '#64766e', {
    rotate: [Math.PI / 2, 0, 0],
    z: 0.008,
  });

  const geometry = batch.build()!;
  wheelTemplates.set(key, geometry);
  return geometry;
}

export function spokedWheel(radius: number, tireColor: string, rimColor: string, spokeColor: string): THREE.Mesh {
  return new THREE.Mesh(spokedWheelGeometry(radius, tireColor, rimColor, spokeColor), paperSheet());
}
