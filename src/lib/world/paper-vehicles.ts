import * as THREE from 'three';
import { carded } from './paper-mesh';
import { PaperBatch, ovalGeometry } from './paper-brush';
import { paperSheet } from './paper-materials';
import { TRACK_LENGTH, stopX } from './route';
import { createPaperTrain } from './paper-train';

function cutout(points: number[][], color: string, depth = 0.045): THREE.Mesh {
  const shape = new THREE.Shape();
  points.forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y)));
  shape.closePath();
  const mesh = carded(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false }), color, '#e5d6ba');
  mesh.position.z = -depth / 2;
  return mesh;
}

function shapedCutout(shape: THREE.Shape, color: string, depth = 0.045): THREE.Mesh {
  const mesh = carded(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 14 }), color, '#e5d6ba');
  mesh.position.z = -depth / 2;
  return mesh;
}

function bar(parent: THREE.Object3D, x1: number, y1: number, x2: number, y2: number, thickness: number, color: string, z = 0, depth = 0.045): THREE.Mesh {
  const length = Math.hypot(x2 - x1, y2 - y1);
  const mesh = carded(new THREE.BoxGeometry(length, thickness, depth), color);
  mesh.position.set((x1 + x2) / 2, (y1 + y2) / 2, z);
  mesh.rotation.z = Math.atan2(y2 - y1, x2 - x1);
  parent.add(mesh);
  return mesh;
}

function fenderArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number, color: string, z: number): THREE.Mesh {
  const outer = radius + 0.042;
  const inner = radius + 0.008;
  const shape = new THREE.Shape();
  const steps = 12;
  for (let i = 0; i <= steps; i++) {
    const a = THREE.MathUtils.lerp(startAngle, endAngle, i / steps);
    const x = cx + Math.cos(a) * outer;
    const y = cy + Math.sin(a) * outer;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  for (let i = steps; i >= 0; i--) {
    const a = THREE.MathUtils.lerp(startAngle, endAngle, i / steps);
    shape.lineTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
  }
  shape.closePath();
  const mesh = shapedCutout(shape, color, 0.042);
  mesh.position.z = z;
  return mesh;
}

function spokedWheel(radius: number, tireColor: string, rimColor: string, spokeColor: string): THREE.Group {
  const wheel = new THREE.Group();
  const tire = carded(new THREE.TorusGeometry(radius, 0.036, 8, 24), tireColor);
  wheel.add(tire);
  const innerRim = carded(new THREE.TorusGeometry(radius - 0.04, 0.015, 6, 22), rimColor);
  innerRim.position.z = 0.004;
  wheel.add(innerRim);
  for (let i = 0; i < 4; i++) {
    const spoke = carded(new THREE.BoxGeometry((radius - 0.02) * 1.88, 0.017, 0.015), spokeColor);
    spoke.rotation.z = (i * Math.PI) / 4;
    spoke.position.z = -0.003 + i * 0.002;
    wheel.add(spoke);
  }
  const hub = carded(new THREE.CylinderGeometry(0.056, 0.056, 0.058, 14), '#dfd3b8');
  hub.rotation.x = Math.PI / 2;
  hub.position.z = 0.006;
  wheel.add(hub);
  const cap = carded(new THREE.CylinderGeometry(0.026, 0.026, 0.064, 10), '#64766e');
  cap.rotation.x = Math.PI / 2;
  cap.position.z = 0.008;
  wheel.add(cap);
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
  const rearWheel = spokedWheel(wheelRadius, '#506058', '#ece2ca', '#d5ccb5');
  rearWheel.position.set(-0.48, wheelRadius, 0);
  group.add(rearWheel);

  const frontWheel = spokedWheel(wheelRadius, '#506058', '#ece2ca', '#d5ccb5');
  frontWheel.position.set(0.48, wheelRadius, 0);
  group.add(frontWheel);

  // Curved mudguards hugging both wheels.
  group.add(fenderArc(-0.48, wheelRadius, wheelRadius + 0.02, Math.PI * 0.22, Math.PI * 0.92, '#567867', -0.01));
  group.add(fenderArc(0.48, wheelRadius, wheelRadius + 0.02, Math.PI * 0.14, Math.PI * 0.84, '#567867', -0.01));

  // Mint-sage cruiser frame with staggered Z offsets to prevent joint flicker.
  const frameColor = '#669079';
  bar(group, -0.48, 0.34, -0.04, 0.34, 0.042, frameColor, 0.016);
  bar(group, -0.48, 0.34, -0.18, 0.78, 0.042, frameColor, 0.02);
  bar(group, -0.04, 0.34, -0.18, 0.78, 0.046, frameColor, 0.024);
  bar(group, -0.04, 0.34, 0.34, 0.76, 0.048, frameColor, 0.028);
  bar(group, -0.18, 0.76, 0.34, 0.76, 0.042, frameColor, 0.032);
  bar(group, 0.48, 0.34, 0.31, 0.94, 0.044, frameColor, 0.036);

  // Rear luggage rack.
  bar(group, -0.64, 0.76, -0.25, 0.76, 0.034, '#a88463', 0.012);
  bar(group, -0.6, 0.75, -0.48, 0.36, 0.024, '#a88463', 0.012);

  // Saddle and seat post.
  bar(group, -0.18, 0.78, -0.22, 0.92, 0.034, '#dfd4bb', 0.022);
  const saddleShape = new THREE.Shape();
  saddleShape.moveTo(-0.39, 0.92);
  saddleShape.quadraticCurveTo(-0.22, 0.9, -0.06, 0.93);
  saddleShape.quadraticCurveTo(-0.08, 1.0, -0.22, 0.99);
  saddleShape.quadraticCurveTo(-0.37, 1.0, -0.39, 0.92);
  group.add(shapedCutout(saddleShape, '#a6745b', 0.062));

  // Curved cream handlebars, leather grip, and brass bell.
  bar(group, 0.31, 0.94, 0.21, 1.03, 0.036, '#efe5ce', 0.032);
  const grip = carded(new THREE.BoxGeometry(0.11, 0.04, 0.06), '#9b6d56');
  grip.position.set(0.17, 1.03, 0.034);
  group.add(grip);
  const bell = carded(new THREE.CylinderGeometry(0.036, 0.04, 0.04, 10), '#e8c47a');
  bell.position.set(0.28, 1.02, 0.042);
  group.add(bell);

  // Small vintage front headlamp on the fork.
  const headlamp = carded(new THREE.CylinderGeometry(0.042, 0.036, 0.07, 10), '#f6e2a8');
  headlamp.rotation.z = Math.PI / 2;
  headlamp.position.set(0.47, 0.63, 0.038);
  group.add(headlamp);

  // Woven front flower basket overflowing with layered spring blooms and leaves.
  const basket = cutout([[0.36, 0.66], [0.76, 0.66], [0.82, 0.94], [0.34, 0.94]], '#cfa571', 0.08);
  basket.position.z = 0.02;
  group.add(basket);
  const weave = cutout([[0.37, 0.76], [0.78, 0.76], [0.79, 0.81], [0.36, 0.81]], '#b68c5b', 0.086);
  weave.position.z = 0.025;
  group.add(weave);
  const rim = cutout([[0.33, 0.91], [0.83, 0.91], [0.83, 0.96], [0.33, 0.96]], '#be9360', 0.09);
  rim.position.z = 0.028;
  group.add(rim);

  const blooms = new PaperBatch();
  // Greenery sprigs behind the flowers.
  const leafSpots: Array<[number, number, number, number]> = [
    [0.41, 0.98, 0.038, 0.45], [0.58, 1.05, 0.042, -0.2], [0.74, 0.98, 0.04, -0.55],
  ];
  for (const [lx, ly, lz, rot] of leafSpots) {
    blooms.add(ovalGeometry(0.11, 0.2, 0.02), '#7e9b79', { x: lx, y: ly, z: lz, rotate: [0, 0, rot] });
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
      blooms.add(ovalGeometry(0.08, 0.095, 0.018), col, {
        x: bx + Math.cos(a) * 0.048,
        y: by + Math.sin(a) * 0.048,
        z: bz,
        rotate: [0, 0, a],
      });
    }
    blooms.add(ovalGeometry(0.065, 0.065, 0.022), '#e8c477', { x: bx, y: by, z: bz + 0.012 });
  }
  const bloomSheet = blooms.build();
  if (bloomSheet) group.add(new THREE.Mesh(bloomSheet, paperSheet()));

  // Small AdGuard shield on the front basket.
  const shield = cutout([[0, 0.085], [0.07, 0.055], [0.06, -0.02], [0, -0.075], [-0.06, -0.02], [-0.07, 0.055]], '#6b9482', 0.04);
  shield.position.set(0.57, 0.79, 0.076);
  group.add(shield);

  // Rotating pedal crank.
  const crank = new THREE.Group();
  crank.position.set(-0.04, 0.34, 0.056);
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

  // Layered folded-paper hull with gentle sheer curve.
  const hullShape = new THREE.Shape();
  hullShape.moveTo(-0.96, 0.45);
  hullShape.quadraticCurveTo(0.02, 0.39, 1.02, 0.47);
  hullShape.quadraticCurveTo(0.86, 0.16, 0.66, 0.06);
  hullShape.lineTo(-0.68, 0.06);
  hullShape.quadraticCurveTo(-0.84, 0.18, -0.96, 0.45);
  body.add(shapedCutout(hullShape, '#f2e8d2', 0.07));

  const hullFold = cutout([[-0.94, 0.44], [-0.08, 0.25], [1.0, 0.45], [0.66, 0.06], [-0.68, 0.06]], '#d7c6a5', 0.076);
  hullFold.position.z = 0.018;
  body.add(hullFold);

  const stripe = cutout([[-0.78, 0.22], [0.82, 0.22], [0.76, 0.14], [-0.74, 0.14]], '#6a9696', 0.084);
  stripe.position.z = 0.028;
  body.add(stripe);

  // Cozy wooden deck cabin with round brass porthole.
  const cabin = cutout([[-0.52, 0.42], [0.16, 0.42], [0.08, 0.56], [-0.46, 0.56]], '#c89b79', 0.06);
  cabin.position.z = -0.01;
  body.add(cabin);
  const portholeFrame = carded(new THREE.CylinderGeometry(0.048, 0.048, 0.02, 12), '#e5c47c');
  portholeFrame.rotation.x = Math.PI / 2;
  portholeFrame.position.set(-0.22, 0.49, 0.026);
  body.add(portholeFrame);
  const portholeGlass = carded(new THREE.CylinderGeometry(0.032, 0.032, 0.024, 12), '#f8eed3');
  portholeGlass.rotation.x = Math.PI / 2;
  portholeGlass.position.set(-0.22, 0.49, 0.03);
  body.add(portholeGlass);

  // Wooden mast, boom, and rigging lines.
  const mast = carded(new THREE.BoxGeometry(0.052, 1.44, 0.05), '#9d8166');
  mast.position.set(0.02, 0.96, -0.005);
  body.add(mast);
  const boom = carded(new THREE.BoxGeometry(1.16, 0.036, 0.04), '#b19679');
  boom.position.set(-0.1, 0.6, 0.032);
  body.add(boom);
  bar(body, 0.02, 1.62, 0.96, 0.46, 0.012, '#cbbba0', 0.02, 0.012);
  bar(body, 0.02, 1.62, -0.88, 0.45, 0.012, '#cbbba0', 0.02, 0.012);

  // Wind-filled curved cream mainsail and sage-mint jib.
  const mainShape = new THREE.Shape();
  mainShape.moveTo(-0.03, 1.6);
  mainShape.quadraticCurveTo(-0.12, 1.12, -0.03, 0.62);
  mainShape.lineTo(-0.82, 0.62);
  mainShape.quadraticCurveTo(-0.52, 1.18, -0.03, 1.6);
  const mainSail = shapedCutout(mainShape, '#fbf4e3', 0.04);
  mainSail.position.z = 0.04;
  body.add(mainSail);

  const jibShape = new THREE.Shape();
  jibShape.moveTo(0.07, 1.48);
  jibShape.quadraticCurveTo(0.16, 1.04, 0.07, 0.62);
  jibShape.lineTo(0.86, 0.62);
  jibShape.quadraticCurveTo(0.56, 1.12, 0.07, 1.48);
  const jibSail = shapedCutout(jibShape, '#8bb0a2', 0.04);
  jibSail.position.z = 0.046;
  body.add(jibSail);

  // AdGuard emblem on the mainsail.
  const shield = cutout([[0, 0.125], [0.095, 0.088], [0.084, -0.028], [0, -0.105], [-0.084, -0.028], [-0.095, 0.088]], '#6c9484', 0.045);
  shield.position.set(-0.31, 0.9, 0.062);
  body.add(shield);

  // Fluttering pennant at mast top.
  const pennant = cutout([[0, 0.075], [0.34, 0.01], [0.05, -0.02], [0, -0.07]], '#cf846e', 0.034);
  pennant.position.set(0.05, 1.64, 0.03);
  body.add(pennant);

  // Soft trailing foam ripples.
  const wake = cutout([[-1.18, 0.12], [-0.96, 0.18], [-0.78, 0.1], [-0.62, 0.16], [-0.46, 0.08], [-1.18, 0.04]], '#eff3eb', 0.025);
  wake.position.z = 0.082;
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

interface PaperMinivan {
  group: THREE.Group;
  update: (x: number, time: number, moving: boolean, reduced: boolean) => void;
}

function createPaperMinivan(scene: THREE.Scene): PaperMinivan {
  const group = new THREE.Group();
  group.name = 'paper-autumn-minivan';

  const body = new THREE.Group();
  group.add(body);

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
  body.add(shapedCutout(vanShape, '#bb6f56', 0.064));

  // Cream camper-van roof trim cap.
  const roofShape = new THREE.Shape();
  roofShape.moveTo(-0.86, 0.95);
  roofShape.quadraticCurveTo(-0.85, 1.03, -0.74, 1.03);
  roofShape.lineTo(0.24, 1.03);
  roofShape.quadraticCurveTo(0.34, 1.03, 0.37, 0.95);
  roofShape.closePath();
  const roof = shapedCutout(roofShape, '#f4ebd4', 0.072);
  roof.position.z = 0.002;
  body.add(roof);

  // Cream lower accent stripe wrapping the minivan body.
  const stripe = cutout([[-0.88, 0.34], [0.89, 0.34], [0.89, 0.46], [-0.88, 0.46]], '#f3e7cc', 0.074);
  stripe.position.z = 0.006;
  body.add(stripe);

  // Dark wheel-well backing arches.
  for (const wx of [-0.52, 0.54]) {
    const well = new THREE.Shape();
    well.absarc(wx, 0.24, 0.265, 0, Math.PI, false);
    well.lineTo(wx + 0.265, 0.24);
    well.closePath();
    const arch = shapedCutout(well, '#46504d', 0.078);
    arch.position.z = 0.01;
    body.add(arch);
  }

  // Three passenger minivan windows (rear, middle, and sloped cab windshield side).
  const rearWin = cutout([[-0.78, 0.6], [-0.78, 0.9], [-0.43, 0.9], [-0.43, 0.6]], '#f5edd6', 0.074);
  rearWin.position.z = 0.012;
  body.add(rearWin);

  const midWin = cutout([[-0.35, 0.6], [-0.35, 0.9], [-0.01, 0.9], [-0.01, 0.6]], '#f5edd6', 0.074);
  midWin.position.z = 0.012;
  body.add(midWin);

  const cabWin = cutout([[0.08, 0.6], [0.08, 0.9], [0.32, 0.9], [0.47, 0.65], [0.47, 0.6]], '#f5edd6', 0.074);
  cabWin.position.z = 0.012;
  body.add(cabWin);

  // Delicate diagonal paper window glints.
  const glints: Array<number[][]> = [
    [[-0.68, 0.62], [-0.59, 0.88], [-0.53, 0.88], [-0.62, 0.62]],
    [[-0.25, 0.62], [-0.16, 0.88], [-0.1, 0.88], [-0.19, 0.62]],
    [[0.15, 0.62], [0.24, 0.88], [0.3, 0.88], [0.21, 0.62]],
  ];
  for (const pts of glints) {
    const glint = cutout(pts, '#fffbf0', 0.018);
    glint.position.z = 0.052;
    body.add(glint);
  }

  // Sliding door seam, door handles, and small side mirror.
  const seam = carded(new THREE.BoxGeometry(0.016, 0.56, 0.014), '#995540');
  seam.position.set(0.035, 0.6, 0.044);
  body.add(seam);
  const rearSeam = carded(new THREE.BoxGeometry(0.016, 0.52, 0.014), '#995540');
  rearSeam.position.set(-0.39, 0.62, 0.044);
  body.add(rearSeam);
  const handleFront = carded(new THREE.BoxGeometry(0.085, 0.024, 0.022), '#dfd5bc');
  handleFront.position.set(0.11, 0.52, 0.048);
  body.add(handleFront);
  const handleSide = carded(new THREE.BoxGeometry(0.085, 0.024, 0.022), '#dfd5bc');
  handleSide.position.set(-0.08, 0.52, 0.048);
  body.add(handleSide);
  const mirror = carded(new THREE.BoxGeometry(0.075, 0.052, 0.04), '#a35b44');
  mirror.position.set(0.49, 0.64, 0.048);
  body.add(mirror);

  // Front and rear bumpers.
  const bumperFront = carded(new THREE.BoxGeometry(0.16, 0.08, 0.1), '#7e786c');
  bumperFront.position.set(0.9, 0.27, 0.018);
  body.add(bumperFront);
  const bumperRear = carded(new THREE.BoxGeometry(0.14, 0.08, 0.1), '#7e786c');
  bumperRear.position.set(-0.89, 0.27, 0.018);
  body.add(bumperRear);

  // Warm headlight and ruby taillight.
  const lampShape = new THREE.Shape();
  lampShape.absellipse(0, 0, 0.06, 0.068, 0, Math.PI * 2, false, 0);
  const headlight = shapedCutout(lampShape, '#fce8ae', 0.044);
  headlight.position.set(0.87, 0.5, 0.026);
  body.add(headlight);

  const tailLamp = cutout([[-0.9, 0.48], [-0.83, 0.48], [-0.83, 0.59], [-0.9, 0.59]], '#d5685a', 0.052);
  tailLamp.position.z = 0.02;
  body.add(tailLamp);

  // Full-length minivan roof rack carrying cozy road-trip luggage.
  bar(body, -0.76, 1.09, 0.24, 1.09, 0.028, '#5c786c', 0.008, 0.034);
  bar(body, -0.66, 1.02, -0.66, 1.09, 0.024, '#5c786c', 0.008, 0.034);
  bar(body, -0.22, 1.02, -0.22, 1.09, 0.024, '#5c786c', 0.008, 0.034);
  bar(body, 0.14, 1.02, 0.14, 1.09, 0.024, '#5c786c', 0.008, 0.034);

  // Vintage leather suitcase + small sage travel bag on the roof rack.
  const suitcase = cutout([[-0.68, 1.1], [-0.22, 1.1], [-0.22, 1.3], [-0.68, 1.3]], '#cfa06e', 0.064);
  suitcase.position.z = 0.008;
  body.add(suitcase);
  for (const sx of [-0.57, -0.33]) {
    const strap = cutout([[sx - 0.022, 1.1], [sx + 0.022, 1.1], [sx + 0.022, 1.3], [sx - 0.022, 1.3]], '#efe2c6', 0.072);
    strap.position.z = 0.012;
    body.add(strap);
  }
  const caseHandle = cutout([[-0.51, 1.3], [-0.39, 1.3], [-0.39, 1.35], [-0.51, 1.35]], '#8c6548', 0.044);
  caseHandle.position.z = 0.006;
  body.add(caseHandle);

  const travelBag = cutout([[-0.16, 1.1], [0.18, 1.1], [0.16, 1.25], [-0.14, 1.25]], '#789886', 0.058);
  travelBag.position.z = 0.006;
  body.add(travelBag);
  const bagStripe = cutout([[-0.03, 1.1], [0.04, 1.1], [0.04, 1.25], [-0.03, 1.25]], '#eadfc4', 0.066);
  bagStripe.position.z = 0.01;
  body.add(bagStripe);

  // Two spinning spoked vintage wheels sitting cleanly proud of the arches.
  const wheelRadius = 0.22;
  const wheels: THREE.Group[] = [];
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

export interface SeasonalFleet {
  update: (distance: number, delta: number, time: number, reduced: boolean) => void;
}

export function createSeasonalFleet(scene: THREE.Scene): SeasonalFleet {
  const winterTrain = createPaperTrain(scene, { festive: false });
  const springBike = createPaperBicycle(scene);
  const summerBoat = createPaperSailboat(scene);
  const autumnVan = createPaperMinivan(scene);
  const finaleTrain = createPaperTrain(scene, { festive: true });

  const prev = {
    winterTrain: 0,
    springBike: 20.8,
    summerBoat: 46.3,
    autumnVan: 58.95,
    finaleTrain: 86.2,
  };

  return {
    update: (distance, delta, time, reduced) => {
      const dt = Math.max(delta, 1 / 120);

      // Steam only appears once the train has picked up speed, not while it rolls out.
      const STEAM_SPEED = 2.0;

      const wtX = softClamp(distance, -10, stopX(1) + 4.2, 0.7);
      const sbX = softClamp(distance, stopX(2) - 4.5, stopX(3) + 4.0, 0.7);
      const boatX = softClamp(distance, stopX(4) - 4.3, stopX(4) + 4.3, 0.7);
      const vanX = softClamp(distance, stopX(5) - 4.3, stopX(6) + 3.6, 0.7);
      const ftX = softClamp(distance, stopX(7) - 2.35, TRACK_LENGTH, 0.7);

      const wtMoving = Math.abs(wtX - prev.winterTrain) / dt > STEAM_SPEED;
      const sbMoving = Math.abs(sbX - prev.springBike) / dt > 0.08;
      const boatMoving = Math.abs(boatX - prev.summerBoat) / dt > 0.08;
      const vanMoving = Math.abs(vanX - prev.autumnVan) / dt > 0.08;
      const ftMoving = Math.abs(ftX - prev.finaleTrain) / dt > STEAM_SPEED;

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
