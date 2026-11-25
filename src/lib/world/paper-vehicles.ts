import * as THREE from 'three';
import { carded } from './paper-mesh';
import { PaperBatch, ovalGeometry } from './paper-brush';
import { paperSheet } from './paper-materials';
import { TRACK_LENGTH } from './route';
import { createPaperTrain } from './paper-train';

function cutout(points: number[][], color: string, depth = 0.045): THREE.Mesh {
  const shape = new THREE.Shape();
  points.forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y)));
  shape.closePath();
  const mesh = carded(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false }), color, '#e5d6ba');
  mesh.position.z = -depth / 2;
  return mesh;
}

function bar(parent: THREE.Object3D, x1: number, y1: number, x2: number, y2: number, thickness: number, color: string, z = 0): THREE.Mesh {
  const length = Math.hypot(x2 - x1, y2 - y1);
  const mesh = carded(new THREE.BoxGeometry(length, thickness, 0.045), color);
  mesh.position.set((x1 + x2) / 2, (y1 + y2) / 2, z);
  mesh.rotation.z = Math.atan2(y2 - y1, x2 - x1);
  parent.add(mesh);
  return mesh;
}

function spokedWheel(radius: number, tireColor: string, rimColor: string, spokeColor: string): THREE.Group {
  const wheel = new THREE.Group();
  const tire = carded(new THREE.TorusGeometry(radius, 0.036, 8, 22), tireColor);
  wheel.add(tire);
  const innerRim = carded(new THREE.TorusGeometry(radius - 0.038, 0.014, 6, 20), rimColor);
  wheel.add(innerRim);
  for (let i = 0; i < 4; i++) {
    const spoke = carded(new THREE.BoxGeometry(radius * 1.88, 0.018, 0.016), spokeColor);
    spoke.rotation.z = (i * Math.PI) / 4;
    spoke.position.z = -0.003 + i * 0.002;
    wheel.add(spoke);
  }
  const hub = carded(new THREE.CylinderGeometry(0.055, 0.055, 0.06, 12), '#d7c7a8');
  hub.rotation.x = Math.PI / 2;
  wheel.add(hub);
  return wheel;
}

function softMin(a: number, b: number, k = 0.7): number {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}

function softMax(a: number, b: number, k = 0.7): number {
  return -softMin(-a, -b, k);
}

function softClamp(value: number, min: number, max: number, k = 0.7): number {
  return softMin(softMax(value, min, k), max, k);
}

interface PaperBicycle {
  group: THREE.Group;
  update: (x: number, time: number, moving: boolean, reduced: boolean) => void;
}

function createPaperBicycle(scene: THREE.Scene): PaperBicycle {
  const group = new THREE.Group();
  group.name = 'paper-bicycle';

  const wheelRadius = 0.34;
  const rearWheel = spokedWheel(wheelRadius, '#54645a', '#e8dec5', '#d5ccb5');
  rearWheel.position.set(-0.48, wheelRadius, 0);
  group.add(rearWheel);

  const frontWheel = spokedWheel(wheelRadius, '#54645a', '#e8dec5', '#d5ccb5');
  frontWheel.position.set(0.48, wheelRadius, 0);
  group.add(frontWheel);

  // Mint-sage cruiser frame (staggered Z offsets prevent coplanar joint flicker).
  const frameColor = '#669079';
  bar(group, -0.48, 0.34, -0.04, 0.34, 0.042, frameColor, 0.016);
  bar(group, -0.48, 0.34, -0.18, 0.78, 0.042, frameColor, 0.02);
  bar(group, -0.04, 0.34, -0.18, 0.78, 0.046, frameColor, 0.024);
  bar(group, -0.04, 0.34, 0.34, 0.76, 0.048, frameColor, 0.028);
  bar(group, -0.18, 0.76, 0.34, 0.76, 0.042, frameColor, 0.032);
  bar(group, 0.48, 0.34, 0.31, 0.94, 0.044, frameColor, 0.036);

  // Rear mudguard & luggage rack.
  bar(group, -0.62, 0.76, -0.26, 0.76, 0.035, '#a88463', 0.01);
  bar(group, -0.58, 0.74, -0.48, 0.36, 0.026, '#a88463', 0.01);

  // Saddle & post.
  bar(group, -0.18, 0.78, -0.22, 0.92, 0.035, '#dfd4bb', 0.02);
  const saddle = cutout([[-0.37, 0.91], [-0.07, 0.91], [-0.12, 0.99], [-0.34, 0.99]], '#a6745b', 0.06);
  group.add(saddle);

  // Curved cream handlebars.
  bar(group, 0.31, 0.94, 0.21, 1.03, 0.036, '#efe5ce', 0.03);
  const grip = carded(new THREE.BoxGeometry(0.11, 0.04, 0.06), '#9b6d56');
  grip.position.set(0.17, 1.03, 0.03);
  group.add(grip);

  // Woven front flower basket overflowing with spring blooms.
  const basket = cutout([[0.36, 0.66], [0.76, 0.66], [0.81, 0.94], [0.34, 0.94]], '#cfa571', 0.08);
  basket.position.z = 0.02;
  group.add(basket);
  const weave = cutout([[0.38, 0.76], [0.77, 0.76], [0.78, 0.81], [0.37, 0.81]], '#b68c5b', 0.085);
  weave.position.z = 0.025;
  group.add(weave);

  const blossomPalette = ['#e6b4a8', '#f5ebd1', '#e8c47d', '#d9a4a1'];
  const blossomOffsets: Array<[number, number, number]> = [
    [0.44, 0.99, 0.05], [0.56, 1.04, 0.068], [0.68, 1.0, 0.056], [0.51, 0.96, 0.086], [0.64, 0.96, 0.074],
  ];
  // One buffer for every bloom: separate meshes at the same depth flickered.
  const blooms = new PaperBatch();
  blossomOffsets.forEach(([bx, by, bz], idx) => {
    blooms.add(ovalGeometry(0.15, 0.15, 0.025), blossomPalette[idx % blossomPalette.length], { x: bx, y: by, z: bz });
  });
  const bloomSheet = blooms.build();
  if (bloomSheet) group.add(new THREE.Mesh(bloomSheet, paperSheet()));

  // Tiny AdGuard shield on the front basket.
  const shield = cutout([[0, 0.09], [0.075, 0.06], [0.065, -0.02], [0, -0.08], [-0.065, -0.02], [-0.075, 0.06]], '#6b9482', 0.04);
  shield.position.set(0.57, 0.79, 0.075);
  group.add(shield);

  // Rotating pedal crank.
  const crank = new THREE.Group();
  crank.position.set(-0.04, 0.34, 0.055);
  const gear = carded(new THREE.CylinderGeometry(0.09, 0.09, 0.025, 14), '#dad0b7');
  gear.rotation.x = Math.PI / 2;
  crank.add(gear);
  const arm = carded(new THREE.BoxGeometry(0.24, 0.026, 0.025), '#5d6e64');
  arm.position.z = 0.021;
  crank.add(arm);
  const pedalA = carded(new THREE.BoxGeometry(0.075, 0.028, 0.05), '#9e745c');
  pedalA.position.set(0.12, 0, 0.02);
  crank.add(pedalA);
  const pedalB = pedalA.clone();
  pedalB.position.set(-0.12, 0, -0.02);
  crank.add(pedalB);
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

interface PaperSailboat {
  group: THREE.Group;
  update: (x: number, time: number, moving: boolean, reduced: boolean) => void;
}

function createPaperSailboat(scene: THREE.Scene): PaperSailboat {
  const group = new THREE.Group();
  group.name = 'paper-hero-sailboat';

  const body = new THREE.Group();
  group.add(body);

  // Layered folded-paper hull.
  body.add(cutout([[-0.92, 0.44], [0.98, 0.44], [0.68, 0.06], [-0.66, 0.06]], '#efe4cd', 0.07));
  const hullFold = cutout([[-0.92, 0.44], [-0.08, 0.25], [0.98, 0.44], [0.68, 0.06], [-0.66, 0.06]], '#d5c4a3', 0.075);
  hullFold.position.z = 0.02;
  body.add(hullFold);
  const stripe = cutout([[-0.76, 0.22], [0.8, 0.22], [0.75, 0.14], [-0.72, 0.14]], '#6a9696', 0.082);
  stripe.position.z = 0.03;
  body.add(stripe);

  // Wooden paper mast & boom. The mast sits behind the hull's front face so the
  // two never share a plane at the joint.
  const mast = carded(new THREE.BoxGeometry(0.052, 1.38, 0.05), '#9d8166');
  mast.position.set(0.02, 0.94, -0.005);
  body.add(mast);
  const boom = carded(new THREE.BoxGeometry(1.18, 0.036, 0.04), '#b19679');
  boom.position.set(-0.08, 0.56, 0.03);
  body.add(boom);

  // Billowing cream mainsail & sage-mint jib.
  const mainSail = cutout([[-0.03, 1.54], [-0.03, 0.58], [-0.78, 0.58]], '#faf3e1', 0.04);
  mainSail.position.z = 0.04;
  body.add(mainSail);
  const jibSail = cutout([[0.07, 1.42], [0.07, 0.58], [0.84, 0.58]], '#8cb0a2', 0.04);
  jibSail.position.z = 0.045;
  body.add(jibSail);

  // AdGuard emblem on the mainsail.
  const shield = cutout([[0, 0.13], [0.1, 0.09], [0.088, -0.03], [0, -0.11], [-0.088, -0.03], [-0.1, 0.09]], '#6f9686', 0.045);
  shield.position.set(-0.27, 0.85, 0.06);
  body.add(shield);

  // Fluttering pennant at mast top.
  const pennant = cutout([[0, 0.08], [0.34, 0], [0, -0.07]], '#cf8a74', 0.035);
  pennant.position.set(0.05, 1.57, 0.03);
  body.add(pennant);

  // Soft trailing foam ripples.
  const wake = cutout([[-1.15, 0.12], [-0.95, 0.18], [-0.78, 0.1], [-0.62, 0.16], [-0.45, 0.08], [-1.15, 0.04]], '#eef2ea', 0.025);
  wake.position.z = 0.08;
  group.add(wake);

  scene.add(group);

  return {
    group,
    update: (x, time, moving, reduced) => {
      const heave = reduced ? 0 : Math.sin(time * 2.1 + x * 0.4) * 0.035;
      const pitch = reduced ? 0 : Math.sin(time * 1.7 + x * 0.35) * (moving ? 0.045 : 0.024);
      group.position.set(x, 0.33 + heave, 0.02);
      body.rotation.z = pitch;
      pennant.rotation.z = reduced ? 0 : Math.sin(time * 4.5) * (moving ? 0.18 : 0.08);
      wake.visible = moving && !reduced;
      if (wake.visible) {
        wake.position.x = -0.15 + Math.sin(time * 5) * 0.06;
      }
    },
  };
}

interface PaperMailVan {
  group: THREE.Group;
  update: (x: number, time: number, moving: boolean, reduced: boolean) => void;
}

function createPaperMailVan(scene: THREE.Scene): PaperMailVan {
  const group = new THREE.Group();
  group.name = 'paper-mail-van';

  const body = new THREE.Group();
  group.add(body);

  // Warm terracotta postal van silhouette.
  body.add(cutout([
    [-0.86, 0.24], [-0.86, 0.98], [0.34, 0.98], [0.54, 0.68], [0.88, 0.62], [0.88, 0.24],
  ], '#b9745c', 0.065));

  // Cream lower accent stripe & bumper.
  const stripe = cutout([[-0.85, 0.32], [0.87, 0.32], [0.87, 0.44], [-0.85, 0.44]], '#f3e7cc', 0.072);
  stripe.position.z = 0.01;
  body.add(stripe);
  const bumperFront = carded(new THREE.BoxGeometry(0.16, 0.08, 0.1), '#7e786c');
  bumperFront.position.set(0.87, 0.26, 0.02);
  body.add(bumperFront);
  const bumperRear = carded(new THREE.BoxGeometry(0.14, 0.08, 0.1), '#7e786c');
  bumperRear.position.set(-0.86, 0.26, 0.02);
  body.add(bumperRear);

  // Warm cab window & rear side postal window.
  const cabWindow = cutout([[0.05, 0.6], [0.05, 0.9], [0.3, 0.9], [0.46, 0.65], [0.46, 0.6]], '#f4e9c9', 0.075);
  cabWindow.position.z = 0.015;
  body.add(cabWindow);

  // Cute stamped envelope badge on van side + AdGuard shield.
  const envelope = cutout([[-0.65, 0.56], [-0.15, 0.56], [-0.15, 0.85], [-0.65, 0.85]], '#f5ebd2', 0.06);
  envelope.position.z = 0.01;
  body.add(envelope);
  bar(body, -0.64, 0.84, -0.4, 0.68, 0.018, '#b49b76', 0.075);
  bar(body, -0.4, 0.68, -0.16, 0.84, 0.018, '#b49b76', 0.075);
  const seal = cutout([[0, 0.06], [0.05, 0.04], [0.042, -0.015], [0, -0.055], [-0.042, -0.015], [-0.05, 0.04]], '#6b9482', 0.03);
  seal.position.set(-0.4, 0.68, 0.082);
  body.add(seal);

  // Headlight.
  const lampShape = new THREE.Shape();
  lampShape.absellipse(0, 0, 0.065, 0.07, 0, Math.PI * 2, false, 0);
  const lamp = carded(
    new THREE.ExtrudeGeometry(lampShape, { depth: 0.04, bevelEnabled: false, curveSegments: 10 }),
    '#fae5ac',
  );
  lamp.position.set(0.84, 0.48, 0.02);
  body.add(lamp);

  // Roof rack carrying paper mail parcels.
  bar(body, -0.74, 1.04, 0.24, 1.04, 0.032, '#5c786c', 0.01);
  bar(body, -0.64, 0.98, -0.64, 1.04, 0.026, '#5c786c', 0.01);
  bar(body, 0.14, 0.98, 0.14, 1.04, 0.026, '#5c786c', 0.01);
  const parcelA = cutout([[-0.66, 1.05], [-0.26, 1.05], [-0.26, 1.24], [-0.66, 1.24]], '#e5d3b1', 0.065);
  parcelA.position.z = 0.01;
  body.add(parcelA);
  const ribbonA = cutout([[-0.49, 1.05], [-0.43, 1.05], [-0.43, 1.24], [-0.49, 1.24]], '#c88469', 0.072);
  ribbonA.position.z = 0.015;
  body.add(ribbonA);
  const parcelB = cutout([[-0.22, 1.05], [0.16, 1.05], [0.16, 1.2], [-0.22, 1.2]], '#d7a570', 0.06);
  parcelB.position.z = 0.005;
  body.add(parcelB);

  // Two spinning paper wheels.
  const wheelRadius = 0.22;
  const wheels: THREE.Group[] = [];
  for (const wx of [-0.52, 0.52]) {
    const wheel = spokedWheel(wheelRadius, '#4b5a55', '#e4d8bd', '#bcb69f');
    wheel.position.set(wx, wheelRadius, 0.04);
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

export interface SeasonalFleet {
  update: (distance: number, delta: number, time: number, reduced: boolean) => void;
}

export function createSeasonalFleet(scene: THREE.Scene): SeasonalFleet {
  const winterTrain = createPaperTrain(scene, { festive: false });
  const springBike = createPaperBicycle(scene);
  const summerBoat = createPaperSailboat(scene);
  const autumnVan = createPaperMailVan(scene);
  const finaleTrain = createPaperTrain(scene, { festive: true });

  const prev = {
    winterTrain: 0,
    springBike: 17.5,
    summerBoat: 28.7,
    autumnVan: 39.7,
    finaleTrain: 63.65,
  };

  return {
    update: (distance, delta, time, reduced) => {
      const dt = Math.max(delta, 1 / 120);

      const wtX = softClamp(distance, -10, 15.2, 0.7);
      const sbX = softClamp(distance, 17.5, 26.4, 0.7);
      const boatX = softClamp(distance, 28.7, 37.3, 0.7);
      const vanX = softClamp(distance, 39.7, 58.6, 0.7);
      const ftX = softClamp(distance, 63.65, TRACK_LENGTH, 0.7);

      const wtMoving = Math.abs(wtX - prev.winterTrain) / dt > 0.08;
      const sbMoving = Math.abs(sbX - prev.springBike) / dt > 0.08;
      const boatMoving = Math.abs(boatX - prev.summerBoat) / dt > 0.08;
      const vanMoving = Math.abs(vanX - prev.autumnVan) / dt > 0.08;
      const ftMoving = Math.abs(ftX - prev.finaleTrain) / dt > 0.08;

      winterTrain.update(wtX, time, wtMoving, reduced);
      springBike.update(sbX, time, sbMoving, reduced);
      summerBoat.update(boatX, time, boatMoving, reduced);
      autumnVan.update(vanX, time, vanMoving, reduced);
      finaleTrain.update(ftX, time, ftMoving, reduced);

      prev.winterTrain = wtX;
      prev.springBike = sbX;
      prev.summerBoat = boatX;
      prev.autumnVan = vanX;
      prev.finaleTrain = ftX;
    },
  };
}
