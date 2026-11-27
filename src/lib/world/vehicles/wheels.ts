import * as THREE from 'three';
import { PaperBatch } from '../paper-brush';
import { paperSheet } from '../paper-materials';

// Wheel geometry never changes, so one merged buffer serves all wheels of a
// type. This keeps the tire, sidewall, steel rim, slots, and hubcap in one draw call.
const wheelTemplates = new Map<string, THREE.BufferGeometry>();

function retroCarWheelGeometry(
  radius: number,
  tireColor: string,
  sidewallColor: string,
  rimColor: string,
  dishColor: string,
): THREE.BufferGeometry {
  const key = `car:${radius}:${tireColor}:${sidewallColor}:${rimColor}:${dishColor}`;
  const cached = wheelTemplates.get(key);
  if (cached) return cached;

  const batch = new PaperBatch();
  const faceRotate: [number, number, number] = [Math.PI / 2, 0, 0];

  // Chunky high-profile rubber tire body and subtle outer tread blocks.
  batch.add(new THREE.CylinderGeometry(radius, radius, 0.052, 28), tireColor, { rotate: faceRotate });
  const treadCount = 16;
  for (let i = 0; i < treadCount; i++) {
    const angle = (i / treadCount) * Math.PI * 2;
    batch.add(new THREE.BoxGeometry(0.026, 0.013, 0.054), '#495155', {
      x: Math.cos(angle) * (radius - 0.001),
      y: Math.sin(angle) * (radius - 0.001),
      rotate: [0, 0, angle + Math.PI / 2],
    });
  }

  // Lighter charcoal rubber sidewall ring so the tire separates cleanly from the dark wheel arch.
  batch.add(new THREE.CylinderGeometry(radius * 0.9, radius * 0.9, 0.008, 28), sidewallColor, {
    rotate: faceRotate,
    z: 0.025,
  });
  // Darker inner tire bead ring to give the rubber sidewall crisp depth.
  batch.add(new THREE.CylinderGeometry(radius * 0.71, radius * 0.71, 0.008, 26), '#32383b', {
    rotate: faceRotate,
    z: 0.028,
  });

  // Solid vintage stamped steel wheel rim and slightly recessed steel dish.
  batch.add(new THREE.CylinderGeometry(radius * 0.61, radius * 0.61, 0.01, 24), rimColor, {
    rotate: faceRotate,
    z: 0.031,
  });
  batch.add(new THREE.CylinderGeometry(radius * 0.52, radius * 0.52, 0.008, 22), dishColor, {
    rotate: faceRotate,
    z: 0.034,
  });

  // Five dark stamped cooling slots so wheel spin is unmistakable.
  const slotCount = 5;
  for (let i = 0; i < slotCount; i++) {
    const angle = (i / slotCount) * Math.PI * 2;
    batch.add(new THREE.BoxGeometry(radius * 0.17, radius * 0.08, 0.008), '#434a4c', {
      x: Math.cos(angle) * radius * 0.37,
      y: Math.sin(angle) * radius * 0.37,
      z: 0.037,
      rotate: [0, 0, angle + Math.PI / 2],
    });
  }

  // Raised center hubcap with dark center emblem.
  batch.add(new THREE.CylinderGeometry(radius * 0.24, radius * 0.26, 0.014, 16), '#eee6d4', {
    rotate: faceRotate,
    z: 0.04,
  });
  batch.add(new THREE.CylinderGeometry(radius * 0.11, radius * 0.11, 0.01, 12), '#52646a', {
    rotate: faceRotate,
    z: 0.046,
  });

  const geometry = batch.build()!;
  wheelTemplates.set(key, geometry);
  return geometry;
}

export function retroCarWheel(
  radius: number,
  tireColor = '#343a3d',
  sidewallColor = '#586166',
  rimColor = '#ebe3cf',
  dishColor = '#c5beaa',
): THREE.Mesh {
  return new THREE.Mesh(retroCarWheelGeometry(radius, tireColor, sidewallColor, rimColor, dishColor), paperSheet());
}
