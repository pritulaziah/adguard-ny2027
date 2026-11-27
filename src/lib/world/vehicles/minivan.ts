import * as THREE from 'three';
import { PaperBatch } from '../paper-brush';
import { paperSheet } from '../paper-materials';
import { bar, cutout, shapedCutout, type MovingVehicle } from './shared';
import { spokedWheel } from './wheels';

export function createPaperMinivan(scene: THREE.Scene): MovingVehicle {
  const group = new THREE.Group();
  group.name = 'paper-autumn-minivan';

  const body = new THREE.Group();
  group.add(body);
  const shell = new PaperBatch();

  // Cozy retro minivan silhouette with gently rounded corners, flat roof, and stubby hood.
  const vanShape = new THREE.Shape();
  vanShape.moveTo(-0.84, 0.24);
  vanShape.lineTo(0.84, 0.24);
  vanShape.quadraticCurveTo(0.92, 0.24, 0.91, 0.44);
  vanShape.quadraticCurveTo(0.9, 0.61, 0.78, 0.63);
  vanShape.lineTo(0.55, 0.67);
  vanShape.lineTo(0.38, 0.94);
  vanShape.quadraticCurveTo(0.34, 1.0, 0.24, 1.0);
  vanShape.lineTo(-0.78, 1.0);
  vanShape.quadraticCurveTo(-0.89, 1.0, -0.89, 0.88);
  vanShape.lineTo(-0.89, 0.32);
  vanShape.quadraticCurveTo(-0.89, 0.24, -0.84, 0.24);
  shapedCutout(shell, vanShape, '#bb6f56', 0.064);

  // Cream camper-van roof trim cap.
  const roofShape = new THREE.Shape();
  roofShape.moveTo(-0.86, 0.95);
  roofShape.quadraticCurveTo(-0.85, 1.03, -0.74, 1.03);
  roofShape.lineTo(0.24, 1.03);
  roofShape.quadraticCurveTo(0.34, 1.03, 0.37, 0.95);
  roofShape.closePath();
  shapedCutout(shell, roofShape, '#f4ebd4', 0.072, 0.002);

  // Cream lower accent stripe wrapping the minivan body.
  cutout(
    shell,
    [
      [-0.88, 0.34],
      [0.89, 0.34],
      [0.89, 0.46],
      [-0.88, 0.46],
    ],
    '#f3e7cc',
    0.074,
    0.006,
  );

  // Dark wheel-well backing arches.
  for (const wx of [-0.52, 0.54]) {
    const well = new THREE.Shape();
    well.absarc(wx, 0.24, 0.265, 0, Math.PI, false);
    well.lineTo(wx + 0.265, 0.24);
    well.closePath();
    shapedCutout(shell, well, '#46504d', 0.078, 0.01);
  }

  // Three passenger minivan windows (rear, middle, and sloped cab windshield side).
  cutout(
    shell,
    [
      [-0.78, 0.6],
      [-0.78, 0.9],
      [-0.43, 0.9],
      [-0.43, 0.6],
    ],
    '#f5edd6',
    0.074,
    0.012,
  );
  cutout(
    shell,
    [
      [-0.35, 0.6],
      [-0.35, 0.9],
      [-0.01, 0.9],
      [-0.01, 0.6],
    ],
    '#f5edd6',
    0.074,
    0.012,
  );
  cutout(
    shell,
    [
      [0.08, 0.6],
      [0.08, 0.9],
      [0.32, 0.9],
      [0.47, 0.65],
      [0.47, 0.6],
    ],
    '#f5edd6',
    0.074,
    0.012,
  );

  // Delicate diagonal paper window glints.
  const glints: Array<number[][]> = [
    [
      [-0.68, 0.62],
      [-0.59, 0.88],
      [-0.53, 0.88],
      [-0.62, 0.62],
    ],
    [
      [-0.25, 0.62],
      [-0.16, 0.88],
      [-0.1, 0.88],
      [-0.19, 0.62],
    ],
    [
      [0.15, 0.62],
      [0.24, 0.88],
      [0.3, 0.88],
      [0.21, 0.62],
    ],
  ];
  for (const pts of glints) cutout(shell, pts, '#fffbf0', 0.018, 0.052);

  // Sliding door seam, door handles, and small side mirror.
  shell.add(new THREE.BoxGeometry(0.016, 0.56, 0.014), '#995540', { x: 0.035, y: 0.6, z: 0.044 });
  shell.add(new THREE.BoxGeometry(0.016, 0.52, 0.014), '#995540', { x: -0.39, y: 0.62, z: 0.044 });
  shell.add(new THREE.BoxGeometry(0.085, 0.024, 0.022), '#dfd5bc', { x: 0.11, y: 0.52, z: 0.048 });
  shell.add(new THREE.BoxGeometry(0.085, 0.024, 0.022), '#dfd5bc', { x: -0.08, y: 0.52, z: 0.048 });
  shell.add(new THREE.BoxGeometry(0.075, 0.052, 0.04), '#a35b44', { x: 0.49, y: 0.64, z: 0.048 });

  // Front and rear bumpers.
  shell.add(new THREE.BoxGeometry(0.16, 0.08, 0.1), '#7e786c', { x: 0.9, y: 0.27, z: 0.018 });
  shell.add(new THREE.BoxGeometry(0.14, 0.08, 0.1), '#7e786c', { x: -0.89, y: 0.27, z: 0.018 });

  // Warm headlight and ruby taillight.
  const lampShape = new THREE.Shape();
  lampShape.absellipse(0, 0, 0.06, 0.068, 0, Math.PI * 2, false, 0);
  shapedCutout(shell, lampShape, '#fce8ae', 0.044, 0.026, 0.87, 0.5);
  cutout(
    shell,
    [
      [-0.9, 0.48],
      [-0.83, 0.48],
      [-0.83, 0.59],
      [-0.9, 0.59],
    ],
    '#d5685a',
    0.052,
    0.02,
  );

  // Full-length minivan roof rack carrying cozy road-trip luggage.
  bar(shell, -0.76, 1.09, 0.24, 1.09, 0.028, '#5c786c', 0.008, 0.034);
  bar(shell, -0.66, 1.02, -0.66, 1.09, 0.024, '#5c786c', 0.008, 0.034);
  bar(shell, -0.22, 1.02, -0.22, 1.09, 0.024, '#5c786c', 0.008, 0.034);
  bar(shell, 0.14, 1.02, 0.14, 1.09, 0.024, '#5c786c', 0.008, 0.034);

  // Vintage leather suitcase + small sage travel bag on the roof rack.
  cutout(
    shell,
    [
      [-0.68, 1.1],
      [-0.22, 1.1],
      [-0.22, 1.3],
      [-0.68, 1.3],
    ],
    '#cfa06e',
    0.064,
    0.008,
  );
  for (const sx of [-0.57, -0.33]) {
    cutout(
      shell,
      [
        [sx - 0.022, 1.1],
        [sx + 0.022, 1.1],
        [sx + 0.022, 1.3],
        [sx - 0.022, 1.3],
      ],
      '#efe2c6',
      0.072,
      0.012,
    );
  }
  cutout(
    shell,
    [
      [-0.51, 1.3],
      [-0.39, 1.3],
      [-0.39, 1.35],
      [-0.51, 1.35],
    ],
    '#8c6548',
    0.044,
    0.006,
  );
  cutout(
    shell,
    [
      [-0.16, 1.1],
      [0.18, 1.1],
      [0.16, 1.25],
      [-0.14, 1.25],
    ],
    '#789886',
    0.058,
    0.006,
  );
  cutout(
    shell,
    [
      [-0.03, 1.1],
      [0.04, 1.1],
      [0.04, 1.25],
      [-0.03, 1.25],
    ],
    '#eadfc4',
    0.066,
    0.01,
  );

  const shellGeometry = shell.build();
  if (shellGeometry) {
    const mesh = new THREE.Mesh(shellGeometry, paperSheet());
    mesh.name = 'paper-minivan-body';
    body.add(mesh);
  }

  // Two spinning spoked vintage wheels sitting cleanly proud of the arches.
  const wheelRadius = 0.22;
  const wheels: THREE.Mesh[] = [];
  for (const wx of [-0.52, 0.54]) {
    const wheel = spokedWheel(wheelRadius, '#465450', '#eee3ca', '#c2baa4');
    wheel.position.set(wx, wheelRadius, 0.072);
    group.add(wheel);
    wheels.push(wheel);
  }

  scene.add(group);

  return {
    group,
    update: (x, time, moving, reduced) => {
      const bob = moving && !reduced ? Math.sin(time * 9) * 0.009 : 0;
      group.position.set(x, 0.34, 0);
      body.position.y = bob;
      const angle = -x / wheelRadius;
      for (const wheel of wheels) wheel.rotation.z = angle;
    },
  };
}
