import * as THREE from 'three';
import { PaperBatch } from './paper-brush';
import { carded } from './paper-mesh';
import { paperSheet } from './paper-materials';
import { pointOnTrack } from './route';

const CUT_SIDE = '#e5d6ba';

/** Adds an extruded paper cutout to the shared batch, in the same place `cutout` put a mesh. */
function cutout(
  batch: PaperBatch,
  points: number[][],
  color: string,
  depth = 0.045,
  x = 0,
  y = 0,
): void {
  const shape = new THREE.Shape();
  points.forEach(([px, py], i) => (i ? shape.lineTo(px, py) : shape.moveTo(px, py)));
  shape.closePath();
  batch.add(
    new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false }),
    color,
    { x, y, z: -depth / 2 },
    CUT_SIDE,
  );
}

function starBadge(batch: PaperBatch, radius: number, color: string, x: number, y: number): void {
  const points: number[][] = Array.from({ length: 10 }, (_, i) => {
    const a = Math.PI / 2 + i * Math.PI / 5;
    const r = radius * (i % 2 ? 0.45 : 1);
    return [Math.cos(a) * r, Math.sin(a) * r];
  });
  cutout(batch, points, color, 0.048, x, y);
}

// A wheel never changes shape, so one merged geometry serves every wheel of a
// type. Six spoked wheels cost one geometry and one draw call each.
const wheelTemplates = new Map<string, THREE.BufferGeometry>();

function trainWheelGeometry(radius: number, festive: boolean): THREE.BufferGeometry {
  const key = `${radius}:${festive}`;
  const cached = wheelTemplates.get(key);
  if (cached) return cached;

  const batch = new PaperBatch();
  batch.add(new THREE.TorusGeometry(radius - 0.026, 0.028, 8, 24), '#445652');
  batch.add(new THREE.TorusGeometry(radius - 0.052, 0.011, 6, 22), festive ? '#e8d7ad' : '#d8ceb7', { z: 0.004 });
  for (let i = 0; i < 4; i++) {
    batch.add(
      new THREE.BoxGeometry((radius - 0.05) * 1.9, 0.017, 0.014),
      '#c3bca5',
      { rotate: [0, 0, (i * Math.PI) / 4], z: -0.002 + i * 0.0015 },
    );
  }
  batch.add(
    new THREE.CylinderGeometry(0.048, 0.048, 0.046, 14),
    '#dfd3b8',
    { rotate: [Math.PI / 2, 0, 0], z: 0.006 },
  );
  batch.add(
    new THREE.CylinderGeometry(0.02, 0.02, 0.052, 10),
    '#5c6f68',
    { rotate: [Math.PI / 2, 0, 0], z: 0.008 },
  );

  const geometry = batch.build()!;
  wheelTemplates.set(key, geometry);
  return geometry;
}

function trainWheel(radius: number, festive: boolean): THREE.Mesh {
  return new THREE.Mesh(trainWheelGeometry(radius, festive), paperSheet());
}

export interface PaperTrainOptions {
  festive?: boolean;
}

export interface PaperTrain {
  vehicles: THREE.Group[];
  wheels: THREE.Object3D[];
  update: (distance: number, time: number, moving: boolean, reduced?: boolean) => void;
}

export function createPaperTrain(scene: THREE.Scene, options: PaperTrainOptions = {}): PaperTrain {
  const { festive = false } = options;
  const vehicles: THREE.Group[] = [];
  const wheels: THREE.Object3D[] = [];
  const puffs: THREE.Mesh[] = [];
  let driveRod: THREE.Mesh | null = null;
  const wheelRadius = 0.19;

  for (let i = 0; i < 3; i++) {
    const group = new THREE.Group();
    // All still parts of one carriage go into one buffer and one draw call.
    const body = new PaperBatch();

    if (i === 0) {
      // Main locomotive body (z: -0.025 .. +0.025).
      cutout(body, [[-0.7, 0.22], [-0.7, 0.94], [-0.18, 0.94], [-0.18, 0.62], [0.55, 0.62], [0.55, 0.23]], '#527c69', 0.05);
      // Overhanging roof is thicker (z: -0.04 .. +0.04) so its faces never coplanar-overlap the body.
      cutout(body, [[-0.78, 0.92], [-0.76, 1.04], [-0.12, 1.04], [-0.1, 0.92]], festive ? '#5e6d68' : '#384c4c', 0.08);
      // Cab window sits cleanly proud of the body (z: -0.032 .. +0.032).
      cutout(body, [[-0.62, 0.63], [-0.62, 0.86], [-0.29, 0.86], [-0.29, 0.63]], '#f2e8cc', 0.064);
      // Chimney (z: -0.034 .. +0.034).
      cutout(body, [[0.25, 0.6], [0.25, 0.91], [0.16, 0.91], [0.16, 0.98], [0.52, 0.98], [0.52, 0.9], [0.43, 0.9], [0.43, 0.6]], '#ac7866', 0.068);
      // Cowcatcher recessed cleanly behind body faces (z: -0.021 .. +0.021).
      cutout(body, [[0.55, 0.2], [0.76, 0.2], [0.55, 0.47]], '#bd8970', 0.042);
      // Flattened folded-paper boiler (z: -0.058 .. +0.058) keeps the paper plane clean.
      body.add(new THREE.CylinderGeometry(0.185, 0.185, 0.68, 16), '#6c9480', {
        x: 0.17,
        y: 0.44,
        rotate: [0, 0, Math.PI / 2],
        scale: [1, 1, 0.31],
      });
      // Small brass steam dome and warm headlamp on the front of the boiler.
      body.add(new THREE.CylinderGeometry(0.068, 0.075, 0.11, 12), '#d9be7f', {
        x: 0.03,
        y: 0.65,
        scale: [1, 1, 0.42],
      });
      for (const bx of [-0.04, 0.24]) {
        body.add(new THREE.BoxGeometry(0.024, 0.36, 0.124), '#d8c28a', { x: bx, y: 0.44 });
      }
      body.add(new THREE.CylinderGeometry(0.055, 0.05, 0.06, 12), '#fae6aa', {
        x: 0.55,
        y: 0.47,
        z: 0.02,
        rotate: [0, 0, Math.PI / 2],
      });

      if (festive) {
        starBadge(body, 0.13, '#edd086', -0.44, 1.15);
        cutout(body, [[-0.71, 0.885], [-0.17, 0.885], [-0.17, 0.92], [-0.71, 0.92]], '#e6c37a', 0.066);
      }

      // Soft paper steam puffs above the chimney while moving.
      for (let p = 0; p < 3; p++) {
        const puffShape = new THREE.Shape();
        puffShape.absellipse(0, 0, 0.09 + p * 0.025, 0.065 + p * 0.015, 0, Math.PI * 2, false, 0);
        const puff = carded(
          new THREE.ExtrudeGeometry(puffShape, { depth: 0.02, bevelEnabled: false, curveSegments: 10 }),
          '#f1ece1',
        );
        puff.visible = false;
        group.add(puff);
        puffs.push(puff);
      }

      // Connecting rod linking the locomotive's two driving wheels.
      driveRod = carded(new THREE.BoxGeometry(0.92, 0.028, 0.018), '#dfd3b8');
      driveRod.position.set(0, wheelRadius, 0.122);
      group.add(driveRod);
    } else {
      // Carriage body (z: -0.025 .. +0.025).
      cutout(body, [[-0.62, 0.24], [-0.62, 0.8], [0.6, 0.8], [0.6, 0.24]], i === 1 ? '#ad786c' : '#bba16d', 0.05);
      // Overhanging roof is thicker (z: -0.04 .. +0.04) to prevent Z-fighting at y = 0.78..0.80.
      cutout(body, [[-0.7, 0.78], [-0.65, 0.9], [0.65, 0.9], [0.69, 0.78]], festive ? '#566d68' : '#4b6260', 0.08);
      if (festive) {
        cutout(body, [[-0.63, 0.745], [0.61, 0.745], [0.61, 0.78], [-0.63, 0.78]], '#ebd08a', 0.066);
      }
      for (let j = 0; j < 3; j++) {
        const x = -0.45 + j * 0.38;
        cutout(body, [[x, 0.47], [x, 0.7], [x + 0.23, 0.7], [x + 0.23, 0.47]], '#f0e6c5', 0.064);
      }
    }

    // Chassis beam & inter-car couplers stay flush with the front/rear ends of the train.
    const leftEnd = i === 2 ? -0.66 : -0.77;
    const rightEnd = i === 0 ? 0.60 : 0.77;
    body.add(new THREE.BoxGeometry(rightEnd - leftEnd, 0.062, 0.054), '#ad9d81', {
      x: (leftEnd + rightEnd) / 2,
      y: 0.215,
    });

    const bodyGeometry = body.build();
    if (bodyGeometry) {
      const mesh = new THREE.Mesh(bodyGeometry, paperSheet());
      mesh.name = `paper-train-body-${i}`;
      group.add(mesh);
    }

    // Spoked cutout wheels sit cleanly on the viewer side without rear-wheel double vision.
    for (const x of [-0.43, 0.43]) {
      const wheel = trainWheel(wheelRadius, festive);
      wheel.position.set(x, wheelRadius, 0.092);
      group.add(wheel);
      wheels.push(wheel);
    }

    scene.add(group);
    vehicles.push(group);
  }

  return {
    vehicles,
    wheels,
    update: (distance, time, moving, reduced = false) => {
      for (let index = 0; index < vehicles.length; index++) {
        const vehicle = vehicles[index];
        const point = pointOnTrack(distance - index * 1.52);
        const bob = moving && !reduced ? Math.sin(time * 6 + index) * 0.008 : 0;
        vehicle.position.set(point.x, 0.34 + bob, point.z);
        vehicle.rotation.y = point.rotation;
      }
      const angle = -distance / wheelRadius;
      for (const wheel of wheels) wheel.rotation.z = angle;
      if (driveRod) {
        driveRod.position.x = Math.cos(angle) * 0.055;
        driveRod.position.y = wheelRadius + Math.sin(angle) * 0.055;
      }
      for (let i = 0; i < puffs.length; i++) {
        const puff = puffs[i];
        puff.visible = moving && !reduced;
        if (!puff.visible) continue;
        const phase = (time * 0.7 + i / puffs.length) % 1;
        puff.position.set(0.34 - phase * 0.65, 1.06 + phase * 0.48, -0.02);
        const s = 0.65 + Math.sin(phase * Math.PI) * 0.55;
        puff.scale.setScalar(s);
      }
    },
  };
}
