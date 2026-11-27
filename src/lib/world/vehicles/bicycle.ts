import * as THREE from 'three';
import { PaperBatch, ovalGeometry } from '../paper-brush';
import { paperSheet } from '../paper-materials';
import { bar, cutout, fenderArc, shapedCutout, type MovingVehicle } from './shared';
import { spokedWheel } from './wheels';

export function createPaperBicycle(scene: THREE.Scene): MovingVehicle {
  const group = new THREE.Group();
  group.name = 'paper-bicycle';
  const frame = new PaperBatch();

  const wheelRadius = 0.34;
  const rearWheel = spokedWheel(wheelRadius, '#506058', '#ece2ca', '#d5ccb5');
  rearWheel.position.set(-0.48, wheelRadius, 0);
  group.add(rearWheel);

  const frontWheel = spokedWheel(wheelRadius, '#506058', '#ece2ca', '#d5ccb5');
  frontWheel.position.set(0.48, wheelRadius, 0);
  group.add(frontWheel);

  // Curved mudguards hugging both wheels.
  fenderArc(frame, -0.48, wheelRadius, wheelRadius + 0.02, Math.PI * 0.22, Math.PI * 0.92, '#567867', -0.01);
  fenderArc(frame, 0.48, wheelRadius, wheelRadius + 0.02, Math.PI * 0.14, Math.PI * 0.84, '#567867', -0.01);

  // Mint-sage cruiser frame with staggered Z offsets to prevent joint flicker.
  const frameColor = '#669079';
  bar(frame, -0.48, 0.34, -0.04, 0.34, 0.042, frameColor, 0.016);
  bar(frame, -0.48, 0.34, -0.18, 0.78, 0.042, frameColor, 0.02);
  bar(frame, -0.04, 0.34, -0.18, 0.78, 0.046, frameColor, 0.024);
  bar(frame, -0.04, 0.34, 0.34, 0.76, 0.048, frameColor, 0.028);
  bar(frame, -0.18, 0.76, 0.34, 0.76, 0.042, frameColor, 0.032);
  bar(frame, 0.48, 0.34, 0.31, 0.94, 0.044, frameColor, 0.036);

  // Rear luggage rack.
  bar(frame, -0.64, 0.76, -0.25, 0.76, 0.034, '#a88463', 0.012);
  bar(frame, -0.6, 0.75, -0.48, 0.36, 0.024, '#a88463', 0.012);

  // Saddle and seat post.
  bar(frame, -0.18, 0.78, -0.22, 0.92, 0.034, '#dfd4bb', 0.022);
  const saddleShape = new THREE.Shape();
  saddleShape.moveTo(-0.39, 0.92);
  saddleShape.quadraticCurveTo(-0.22, 0.9, -0.06, 0.93);
  saddleShape.quadraticCurveTo(-0.08, 1.0, -0.22, 0.99);
  saddleShape.quadraticCurveTo(-0.37, 1.0, -0.39, 0.92);
  shapedCutout(frame, saddleShape, '#a6745b', 0.062);

  // Curved cream handlebars, leather grip, and brass bell.
  bar(frame, 0.31, 0.94, 0.21, 1.03, 0.036, '#efe5ce', 0.032);
  frame.add(new THREE.BoxGeometry(0.11, 0.04, 0.06), '#9b6d56', { x: 0.17, y: 1.03, z: 0.034 });
  frame.add(new THREE.CylinderGeometry(0.036, 0.04, 0.04, 10), '#e8c47a', { x: 0.28, y: 1.02, z: 0.042 });

  // Small vintage front headlamp on the fork.
  frame.add(new THREE.CylinderGeometry(0.042, 0.036, 0.07, 10), '#f6e2a8', {
    x: 0.47,
    y: 0.63,
    z: 0.038,
    rotate: [0, 0, Math.PI / 2],
  });

  // Woven front flower basket overflowing with layered spring blooms and leaves.
  cutout(
    frame,
    [
      [0.36, 0.66],
      [0.76, 0.66],
      [0.82, 0.94],
      [0.34, 0.94],
    ],
    '#cfa571',
    0.08,
    0.02,
  );
  cutout(
    frame,
    [
      [0.37, 0.76],
      [0.78, 0.76],
      [0.79, 0.81],
      [0.36, 0.81],
    ],
    '#b68c5b',
    0.086,
    0.025,
  );
  cutout(
    frame,
    [
      [0.33, 0.91],
      [0.83, 0.91],
      [0.83, 0.96],
      [0.33, 0.96],
    ],
    '#be9360',
    0.09,
    0.028,
  );

  // Greenery sprigs behind the flowers.
  const leafSpots: Array<[number, number, number, number]> = [
    [0.41, 0.98, 0.038, 0.45],
    [0.58, 1.05, 0.042, -0.2],
    [0.74, 0.98, 0.04, -0.55],
  ];
  for (const [lx, ly, lz, rot] of leafSpots) {
    frame.add(ovalGeometry(0.11, 0.2, 0.02), '#7e9b79', { x: lx, y: ly, z: lz, rotate: [0, 0, rot] });
  }
  // Multi-petal blossoms with warm gold centers.
  const flowers: Array<[number, number, number, string]> = [
    [0.45, 1.0, 0.052, '#e8b3a6'],
    [0.58, 1.06, 0.068, '#f6ecd3'],
    [0.7, 1.01, 0.058, '#e8c47d'],
    [0.53, 0.97, 0.086, '#dca29d'],
    [0.65, 0.97, 0.076, '#f2d9c2'],
  ];
  for (const [bx, by, bz, col] of flowers) {
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2;
      frame.add(ovalGeometry(0.08, 0.095, 0.018), col, {
        x: bx + Math.cos(a) * 0.048,
        y: by + Math.sin(a) * 0.048,
        z: bz,
        rotate: [0, 0, a],
      });
    }
    frame.add(ovalGeometry(0.065, 0.065, 0.022), '#e8c477', { x: bx, y: by, z: bz + 0.012 });
  }

  // Small AdGuard shield on the front basket.
  cutout(
    frame,
    [
      [0, 0.085],
      [0.07, 0.055],
      [0.06, -0.02],
      [0, -0.075],
      [-0.06, -0.02],
      [-0.07, 0.055],
    ],
    '#6b9482',
    0.04,
    0.076,
    0.57,
    0.79,
  );

  const frameGeometry = frame.build();
  if (frameGeometry) {
    const mesh = new THREE.Mesh(frameGeometry, paperSheet());
    mesh.name = 'paper-bicycle-body';
    group.add(mesh);
  }

  // Rotating pedal crank, merged into one mesh inside its pivot.
  const crank = new THREE.Group();
  crank.position.set(-0.04, 0.34, 0.056);
  const crankBatch = new PaperBatch();
  crankBatch.add(new THREE.CylinderGeometry(0.09, 0.09, 0.025, 14), '#dad0b7', { rotate: [Math.PI / 2, 0, 0] });
  crankBatch.add(new THREE.BoxGeometry(0.24, 0.026, 0.025), '#5d6e64', { z: 0.021 });
  crankBatch.add(new THREE.BoxGeometry(0.075, 0.028, 0.05), '#9e745c', { x: 0.12, z: 0.02 });
  crankBatch.add(new THREE.BoxGeometry(0.075, 0.028, 0.05), '#9e745c', { x: -0.12, z: -0.02 });
  const crankGeometry = crankBatch.build();
  if (crankGeometry) crank.add(new THREE.Mesh(crankGeometry, paperSheet()));
  group.add(crank);

  scene.add(group);

  return {
    group,
    update: (x, time, moving, reduced) => {
      const bob = moving && !reduced ? Math.sin(time * 7.5) * 0.012 : 0;
      group.position.set(x, 0.34 + bob, 0);
      const angle = -x / wheelRadius;
      rearWheel.rotation.z = angle;
      frontWheel.rotation.z = angle;
      crank.rotation.z = angle * 0.85;
    },
  };
}
