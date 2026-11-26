import * as THREE from 'three';
import { carded } from './paper-mesh';
import { pointOnTrack } from './route';

function cutout(points: number[][], color: string, depth = 0.045): THREE.Mesh {
  const shape = new THREE.Shape();
  points.forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y)));
  shape.closePath();
  const mesh = carded(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false }), color, '#e5d6ba');
  mesh.position.z = -depth / 2;
  return mesh;
}

function starBadge(radius: number, color: string): THREE.Mesh {
  const points: number[][] = Array.from({ length: 10 }, (_, i) => {
    const a = Math.PI / 2 + i * Math.PI / 5;
    const r = radius * (i % 2 ? 0.45 : 1);
    return [Math.cos(a) * r, Math.sin(a) * r];
  });
  return cutout(points, color, 0.048);
}

function trainWheel(radius: number, festive: boolean): THREE.Group {
  const wheel = new THREE.Group();
  const tire = carded(new THREE.TorusGeometry(radius - 0.026, 0.028, 8, 24), '#445652');
  wheel.add(tire);
  const rim = carded(new THREE.TorusGeometry(radius - 0.052, 0.011, 6, 22), festive ? '#e8d7ad' : '#d8ceb7');
  rim.position.z = 0.004;
  wheel.add(rim);
  for (let i = 0; i < 4; i++) {
    const spoke = carded(new THREE.BoxGeometry((radius - 0.05) * 1.9, 0.017, 0.014), '#c3bca5');
    spoke.rotation.z = (i * Math.PI) / 4;
    spoke.position.z = -0.002 + i * 0.0015;
    wheel.add(spoke);
  }
  const hub = carded(new THREE.CylinderGeometry(0.048, 0.048, 0.046, 14), '#dfd3b8');
  hub.rotation.x = Math.PI / 2;
  hub.position.z = 0.006;
  wheel.add(hub);
  const bolt = carded(new THREE.CylinderGeometry(0.02, 0.02, 0.052, 10), '#5c6f68');
  bolt.rotation.x = Math.PI / 2;
  bolt.position.z = 0.008;
  wheel.add(bolt);
  return wheel;
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
    if (i === 0) {
      // Main locomotive body (z: -0.025 .. +0.025).
      group.add(cutout([[-0.7, 0.22], [-0.7, 0.94], [-0.18, 0.94], [-0.18, 0.62], [0.55, 0.62], [0.55, 0.23]], '#527c69', 0.05));
      // Overhanging roof is thicker (z: -0.04 .. +0.04) so its faces never coplanar-overlap the body.
      const roof = cutout([[-0.78, 0.92], [-0.76, 1.04], [-0.12, 1.04], [-0.1, 0.92]], festive ? '#5e6d68' : '#384c4c', 0.08);
      group.add(roof);
      // Cab window sits cleanly proud of the body (z: -0.032 .. +0.032).
      group.add(cutout([[-0.62, 0.63], [-0.62, 0.86], [-0.29, 0.86], [-0.29, 0.63]], '#f2e8cc', 0.064));
      // Chimney (z: -0.034 .. +0.034).
      group.add(cutout([[0.25, 0.6], [0.25, 0.91], [0.16, 0.91], [0.16, 0.98], [0.52, 0.98], [0.52, 0.9], [0.43, 0.9], [0.43, 0.6]], '#ac7866', 0.068));
      // Cowcatcher recessed cleanly behind body faces (z: -0.021 .. +0.021).
      group.add(cutout([[0.55, 0.2], [0.76, 0.2], [0.55, 0.47]], '#bd8970', 0.042));
      // Flattened folded-paper boiler (z: -0.058 .. +0.058) keeps the paper plane clean.
      const boiler = carded(new THREE.CylinderGeometry(0.185, 0.185, 0.68, 16), '#6c9480');
      boiler.rotation.z = Math.PI / 2;
      boiler.scale.set(1, 1, 0.31);
      boiler.position.set(0.17, 0.44, 0);
      group.add(boiler);
      // Small brass steam dome and warm headlamp on the front of the boiler.
      const dome = carded(new THREE.CylinderGeometry(0.068, 0.075, 0.11, 12), '#d9be7f');
      dome.scale.set(1, 1, 0.42);
      dome.position.set(0.03, 0.65, 0);
      group.add(dome);
      for (const bx of [-0.04, 0.24]) {
        const band = carded(new THREE.BoxGeometry(0.024, 0.36, 0.124), '#d8c28a');
        band.position.set(bx, 0.44, 0);
        group.add(band);
      }
      const headlamp = carded(new THREE.CylinderGeometry(0.055, 0.05, 0.06, 12), '#fae6aa');
      headlamp.rotation.z = Math.PI / 2;
      headlamp.position.set(0.55, 0.47, 0.02);
      group.add(headlamp);

      if (festive) {
        const star = starBadge(0.13, '#edd086');
        star.position.set(-0.44, 1.15, 0);
        group.add(star);
        const garland = cutout([[-0.71, 0.885], [-0.17, 0.885], [-0.17, 0.92], [-0.71, 0.92]], '#e6c37a', 0.066);
        group.add(garland);
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
      group.add(cutout([[-0.62, 0.24], [-0.62, 0.8], [0.6, 0.8], [0.6, 0.24]], i === 1 ? '#ad786c' : '#bba16d', 0.05));
      // Overhanging roof is thicker (z: -0.04 .. +0.04) to prevent Z-fighting at y = 0.78..0.80.
      group.add(cutout([[-0.7, 0.78], [-0.65, 0.9], [0.65, 0.9], [0.69, 0.78]], festive ? '#566d68' : '#4b6260', 0.08));
      if (festive) {
        const trim = cutout([[-0.63, 0.745], [0.61, 0.745], [0.61, 0.78], [-0.63, 0.78]], '#ebd08a', 0.066);
        group.add(trim);
      }
      for (let j = 0; j < 3; j++) {
        const x = -0.45 + j * 0.38;
        const win = cutout([[x, 0.47], [x, 0.7], [x + 0.23, 0.7], [x + 0.23, 0.47]], '#f0e6c5', 0.064);
        group.add(win);
      }
    }

    // Spoked cutout wheels sit cleanly on the viewer side without rear-wheel double vision.
    for (const x of [-0.43, 0.43]) {
      const wheel = trainWheel(wheelRadius, festive);
      wheel.position.set(x, wheelRadius, 0.092);
      group.add(wheel);
      wheels.push(wheel);
    }

    // Chassis beam & inter-car couplers stay flush with the front/rear ends of the train.
    const leftEnd = i === 2 ? -0.66 : -0.77;
    const rightEnd = i === 0 ? 0.60 : 0.77;
    const chassis = carded(new THREE.BoxGeometry(rightEnd - leftEnd, 0.062, 0.054), '#ad9d81');
    chassis.position.set((leftEnd + rightEnd) / 2, 0.215, 0);
    group.add(chassis);

    scene.add(group);
    vehicles.push(group);
  }

  return {
    vehicles,
    wheels,
    update: (distance, time, moving, reduced = false) => {
      vehicles.forEach((vehicle, index) => {
        const point = pointOnTrack(distance - index * 1.52);
        const bob = moving && !reduced ? Math.sin(time * 6 + index) * 0.008 : 0;
        vehicle.position.set(point.x, 0.34 + bob, point.z);
        vehicle.rotation.y = point.rotation;
      });
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
