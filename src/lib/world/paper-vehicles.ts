import * as THREE from 'three';
import { PaperBatch, ovalGeometry, paint } from './paper-brush';
import { paperSheet } from './paper-materials';
import { carded } from './paper-mesh';
import { TRACK_LENGTH, stopX } from './route';
import { SEASON_BORDERS } from './seasons';
import { createPaperTrain } from './paper-train';

const CUT_SIDE = '#e5d6ba';

/** A single animated cutout keeps the same cream side edge as the batched ones. */
function cutoutMesh(points: number[][], color: string, depth = 0.045): THREE.Mesh {
  const shape = new THREE.Shape();
  points.forEach(([px, py], i) => (i ? shape.lineTo(px, py) : shape.moveTo(px, py)));
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  paint(geometry, color, geometry.groups.length === 2 ? 1 : undefined, CUT_SIDE);
  const mesh = new THREE.Mesh(geometry, paperSheet());
  mesh.position.z = -depth / 2;
  return mesh;
}

/**
 * All still parts of one vehicle go into a shared batch. A cutout keeps the
 * same depth offset and cream side edge as the old per-part mesh.
 */
function cutout(
  batch: PaperBatch,
  points: number[][],
  color: string,
  depth = 0.045,
  z = -depth / 2,
  x = 0,
  y = 0,
): void {
  const shape = new THREE.Shape();
  points.forEach(([px, py], i) => (i ? shape.lineTo(px, py) : shape.moveTo(px, py)));
  shape.closePath();
  batch.add(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false }), color, { x, y, z }, CUT_SIDE);
}

function shapedCutout(
  batch: PaperBatch,
  shape: THREE.Shape,
  color: string,
  depth = 0.045,
  z = -depth / 2,
  x = 0,
  y = 0,
): void {
  batch.add(
    new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 14 }),
    color,
    { x, y, z },
    CUT_SIDE,
  );
}

function bar(
  batch: PaperBatch,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  thickness: number,
  color: string,
  z = 0,
  depth = 0.045,
): void {
  const length = Math.hypot(x2 - x1, y2 - y1);
  batch.add(new THREE.BoxGeometry(length, thickness, depth), color, {
    x: (x1 + x2) / 2,
    y: (y1 + y2) / 2,
    z,
    rotate: [0, 0, Math.atan2(y2 - y1, x2 - x1)],
  });
}

function fenderArc(
  batch: PaperBatch,
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  color: string,
  z: number,
): void {
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
  shapedCutout(batch, shape, color, 0.042, z);
}

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

function spokedWheel(radius: number, tireColor: string, rimColor: string, spokeColor: string): THREE.Mesh {
  return new THREE.Mesh(spokedWheelGeometry(radius, tireColor, rimColor, spokeColor), paperSheet());
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
  cutout(frame, [[0.36, 0.66], [0.76, 0.66], [0.82, 0.94], [0.34, 0.94]], '#cfa571', 0.08, 0.02);
  cutout(frame, [[0.37, 0.76], [0.78, 0.76], [0.79, 0.81], [0.36, 0.81]], '#b68c5b', 0.086, 0.025);
  cutout(frame, [[0.33, 0.91], [0.83, 0.91], [0.83, 0.96], [0.33, 0.96]], '#be9360', 0.09, 0.028);

  // Greenery sprigs behind the flowers.
  const leafSpots: Array<[number, number, number, number]> = [
    [0.41, 0.98, 0.038, 0.45], [0.58, 1.05, 0.042, -0.2], [0.74, 0.98, 0.04, -0.55],
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
  cutout(frame, [[0, 0.085], [0.07, 0.055], [0.06, -0.02], [0, -0.075], [-0.06, -0.02], [-0.07, 0.055]], '#6b9482', 0.04, 0.076, 0.57, 0.79);

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

interface PaperPunt {
  group: THREE.Group;
  update: (x: number, time: number, moving: boolean, reduced: boolean) => void;
}

/**
 * A paper punt for the quiet summer backwater. The reader drifts with the
 * current, so the craft needs no rower: the wake and the banks carry the motion.
 * A curved canvas awning frames two benches above the rounded wooden hull.
 */
function createPaperPunt(scene: THREE.Scene): PaperPunt {
  const group = new THREE.Group();
  group.name = 'paper-hero-punt';
  const body = new THREE.Group();
  group.add(body);
  const wood = new PaperBatch();

  // A single strip follows a sampled curve with constant width. Adjacent
  // pieces overlap within one shape, so the rim has no mitre seams.
  function curvedStrip(path: THREE.Curve<THREE.Vector2>, width: number, color: string, z: number): void {
    const points = path.getPoints(64);
    const left: THREE.Vector2[] = [];
    const right: THREE.Vector2[] = [];
    for (let i = 0; i < points.length; i++) {
      const tangent = points[Math.min(i + 1, points.length - 1)]!.clone().sub(points[Math.max(0, i - 1)]!).normalize();
      const normal = new THREE.Vector2(-tangent.y, tangent.x).multiplyScalar(width / 2);
      left.push(points[i]!.clone().add(normal));
      right.push(points[i]!.clone().sub(normal));
    }
    const shape = new THREE.Shape([...left, ...right.reverse()]);
    shape.closePath();
    wood.add(new THREE.ExtrudeGeometry(shape, { depth: 0.008, bevelEnabled: false }), color, { z }, color);
  }

  // Warm interior backing extends behind the front wall to seal the hull.
  const opening = new THREE.Shape();
  opening.moveTo(-1.1, 0.5);
  opening.quadraticCurveTo(0, 0.68, 1.15, 0.62);
  opening.lineTo(1.02, 0.02);
  opening.quadraticCurveTo(0, -0.08, -0.98, 0.02);
  opening.closePath();
  shapedCutout(wood, opening, '#887253', 0.018, -0.025);
  curvedStrip(new THREE.QuadraticBezierCurve(new THREE.Vector2(-1.1, 0.5), new THREE.Vector2(0, 0.68), new THREE.Vector2(1.15, 0.62)), 0.035, '#ceb28b', 0);

  // Two simple bench tops make the opening readable without loose props.
  for (const x of [-0.5, 0.35]) {
    cutout(wood, [[x - 0.15, 0.39], [x + 0.15, 0.4], [x + 0.11, 0.55], [x - 0.13, 0.54]], '#d7bc94', 0.018, 0.012);
  }

  const sheer = new THREE.CurvePath<THREE.Vector2>();
  sheer.add(new THREE.QuadraticBezierCurve(new THREE.Vector2(-1.14, 0.46), new THREE.Vector2(-0.6, 0.36), new THREE.Vector2(0, 0.38)));
  sheer.add(new THREE.QuadraticBezierCurve(new THREE.Vector2(0, 0.38), new THREE.Vector2(0.75, 0.38), new THREE.Vector2(1.16, 0.62)));
  const hull = new THREE.Shape(sheer.getPoints(64));
  hull.quadraticCurveTo(1.07, 0.08, 0.7, -0.015);
  hull.quadraticCurveTo(0, -0.09, -0.92, 0.015);
  hull.quadraticCurveTo(-1.08, 0.14, -1.14, 0.46);
  hull.closePath();
  shapedCutout(wood, hull, '#b78d63', 0.022, 0.04);

  // Fine curved plank joints stay inside the rounded hull.
  for (const [y, width] of [[0.26, 1.94], [0.13, 1.67]]) {
    curvedStrip(new THREE.QuadraticBezierCurve(new THREE.Vector2(-width / 2, y + 0.035), new THREE.Vector2(0, y - 0.04), new THREE.Vector2(width / 2, y + 0.06)), 0.009, '#956e4e', 0.066);
  }
  curvedStrip(sheer, 0.045, '#e3cba5', 0.082);

  // Close the stern between the rear and front rims in depth as well as height.
  const sternRear = new THREE.Vector3(-1.1, 0.5, 0.004);
  const sternFront = new THREE.Vector3(-1.14, 0.46, 0.086);
  const sternSpan = sternFront.clone().sub(sternRear);
  const sternMatrix = new THREE.Matrix4().compose(
    sternRear.clone().add(sternFront).multiplyScalar(0.5),
    new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), sternSpan.clone().normalize()),
    new THREE.Vector3(1, 1, 1),
  );
  wood.add(new THREE.BoxGeometry(0.045, sternSpan.length() + 0.025, 0.026), '#e3cba5', sternMatrix, '#e3cba5');

  // The rim alone does not seal the opening below it. This solid end wall
  // overlaps both hull layers throughout their depth, including oblique views.
  const sternWall = new THREE.Shape();
  sternWall.moveTo(-1.1, 0.51);
  sternWall.lineTo(-1.15, 0.475);
  sternWall.quadraticCurveTo(-1.08, 0.14, -0.92, 0.015);
  sternWall.lineTo(-0.84, 0.02);
  sternWall.lineTo(-0.99, 0.5);
  sternWall.closePath();
  wood.add(new THREE.ExtrudeGeometry(sternWall, { depth: 0.11, bevelEnabled: false }), '#a07c56', { z: -0.035 }, '#a07c56');

  // Two supports and a continuous curved canvas roof keep a quiet silhouette.
  for (const x of [-0.67, 0.66]) {
    bar(wood, x, 0.4, x, 0.99, 0.026, '#907553', 0.025, 0.014);
  }
  curvedStrip(new THREE.QuadraticBezierCurve(new THREE.Vector2(-0.89, 0.98), new THREE.Vector2(0, 1.24), new THREE.Vector2(0.89, 0.98)), 0.078, '#f4ead4', 0.058);

  const geometry = wood.build();
  if (geometry) body.add(new THREE.Mesh(geometry, paperSheet()));

  // Foam trails behind the stern and stays behind the near wall.
  const wake = cutoutMesh([[-1.5, 0.05], [-1.16, 0.065], [-0.92, 0.03], [-1.1, 0], [-1.52, 0.012]], '#e8f2dc', 0.012);
  wake.name = 'paper-punt-wake';
  wake.position.z = -0.02;
  group.add(wake);
  scene.add(group);

  return {
    group,
    update: (x, time, moving, reduced) => {
      const heave = reduced ? 0 : Math.sin(time * 1.35) * 0.018;
      group.position.set(x, 0.34 + heave, 0.06);
      body.rotation.z = reduced ? 0 : Math.sin(time * 1.05) * 0.012;
      wake.visible = moving && !reduced;
      if (!wake.visible) return;
      wake.position.x = -0.06 + Math.sin(time * 1.7) * 0.03;
      wake.scale.set(1 + Math.sin(time * 2.1) * 0.05, 1, 1);
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
  cutout(shell, [[-0.88, 0.34], [0.89, 0.34], [0.89, 0.46], [-0.88, 0.46]], '#f3e7cc', 0.074, 0.006);

  // Dark wheel-well backing arches.
  for (const wx of [-0.52, 0.54]) {
    const well = new THREE.Shape();
    well.absarc(wx, 0.24, 0.265, 0, Math.PI, false);
    well.lineTo(wx + 0.265, 0.24);
    well.closePath();
    shapedCutout(shell, well, '#46504d', 0.078, 0.01);
  }

  // Three passenger minivan windows (rear, middle, and sloped cab windshield side).
  cutout(shell, [[-0.78, 0.6], [-0.78, 0.9], [-0.43, 0.9], [-0.43, 0.6]], '#f5edd6', 0.074, 0.012);
  cutout(shell, [[-0.35, 0.6], [-0.35, 0.9], [-0.01, 0.9], [-0.01, 0.6]], '#f5edd6', 0.074, 0.012);
  cutout(shell, [[0.08, 0.6], [0.08, 0.9], [0.32, 0.9], [0.47, 0.65], [0.47, 0.6]], '#f5edd6', 0.074, 0.012);

  // Delicate diagonal paper window glints.
  const glints: Array<number[][]> = [
    [[-0.68, 0.62], [-0.59, 0.88], [-0.53, 0.88], [-0.62, 0.62]],
    [[-0.25, 0.62], [-0.16, 0.88], [-0.1, 0.88], [-0.19, 0.62]],
    [[0.15, 0.62], [0.24, 0.88], [0.3, 0.88], [0.21, 0.62]],
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
  cutout(shell, [[-0.9, 0.48], [-0.83, 0.48], [-0.83, 0.59], [-0.9, 0.59]], '#d5685a', 0.052, 0.02);

  // Full-length minivan roof rack carrying cozy road-trip luggage.
  bar(shell, -0.76, 1.09, 0.24, 1.09, 0.028, '#5c786c', 0.008, 0.034);
  bar(shell, -0.66, 1.02, -0.66, 1.09, 0.024, '#5c786c', 0.008, 0.034);
  bar(shell, -0.22, 1.02, -0.22, 1.09, 0.024, '#5c786c', 0.008, 0.034);
  bar(shell, 0.14, 1.02, 0.14, 1.09, 0.024, '#5c786c', 0.008, 0.034);

  // Vintage leather suitcase + small sage travel bag on the roof rack.
  cutout(shell, [[-0.68, 1.1], [-0.22, 1.1], [-0.22, 1.3], [-0.68, 1.3]], '#cfa06e', 0.064, 0.008);
  for (const sx of [-0.57, -0.33]) {
    cutout(shell, [[sx - 0.022, 1.1], [sx + 0.022, 1.1], [sx + 0.022, 1.3], [sx - 0.022, 1.3]], '#efe2c6', 0.072, 0.012);
  }
  cutout(shell, [[-0.51, 1.3], [-0.39, 1.3], [-0.39, 1.35], [-0.51, 1.35]], '#8c6548', 0.044, 0.006);
  cutout(shell, [[-0.16, 1.1], [0.18, 1.1], [0.16, 1.25], [-0.14, 1.25]], '#789886', 0.058, 0.006);
  cutout(shell, [[-0.03, 1.1], [0.04, 1.1], [0.04, 1.25], [-0.03, 1.25]], '#eadfc4', 0.066, 0.01);

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

function createVanExhaust(scene: THREE.Scene) {
  const lifetime = 0.85;
  const puffs = Array.from({ length: 5 }, (_, index) => {
    const puff = carded(ovalGeometry(0.18, 0.105, 0.018).clone(), index % 2 === 0 ? '#d5cfc4' : '#e5dbcb');
    puff.name = 'paper-van-exhaust';
    puff.visible = false;
    scene.add(puff);
    return { puff, age: lifetime, x: 0, drift: 0 };
  });
  let untilNextPuff = 0;

  return (vanX: number, speed: number, delta: number, reduced: boolean): void => {
    for (const entry of puffs) {
      entry.age = Math.min(entry.age + delta, lifetime);
      const progress = entry.age / lifetime;
      entry.puff.visible = !reduced && progress < 1;
      if (!entry.puff.visible) continue;
      entry.puff.position.set(entry.x + entry.drift * progress, 0.63 + 0.29 * progress, 0.1);
      const scale = 1.25 * Math.sin(Math.PI * progress) + 0.38 * (1 - progress);
      entry.puff.scale.setScalar(scale);
    }

    if (reduced || Math.abs(speed) < 0.6) {
      untilNextPuff = 0;
      return;
    }
    untilNextPuff -= delta;
    if (untilNextPuff > 0) return;
    const entry = puffs.find(({ age }) => age >= lifetime);
    if (!entry) return;
    entry.age = 0;
    entry.x = vanX - 0.92;
    entry.drift = -Math.sign(speed) * 0.45;
    untilNextPuff = 0.2;
  };
}

export interface SeasonalFleet {
  update: (distance: number, delta: number, time: number, reduced: boolean) => void;
}

export function createSeasonalFleet(scene: THREE.Scene): SeasonalFleet {
  const winterTrain = createPaperTrain(scene, { festive: false });
  const springBike = createPaperBicycle(scene);
  const summerBoat = createPaperPunt(scene);
  const autumnVan = createPaperMinivan(scene);
  const updateVanExhaust = createVanExhaust(scene);
  const finaleTrain = createPaperTrain(scene, { festive: true });

  const prev = {
    winterTrain: 0,
    springBike: 20.8,
    summerBoat: SEASON_BORDERS.summer + 2.025,
    autumnVan: stopX(5) - 4.3,
    finaleTrain: stopX(7) - 2.35,
  };

  return {
    update: (distance, delta, time, reduced) => {
      const dt = Math.max(delta, 1 / 120);

      // Steam only appears once the train has picked up speed, not while it rolls out.
      const STEAM_SPEED = 2.0;

      const wtX = softClamp(distance, -10, stopX(1) + 4.2, 0.7);
      const sbX = softClamp(distance, stopX(2) - 4.5, stopX(3) + 4.0, 0.7);
      const boatX = softClamp(distance, SEASON_BORDERS.summer + 2.025, SEASON_BORDERS.autumn - 2.025, 0.7);
      const vanX = softClamp(distance, stopX(5) - 4.3, stopX(6) + 3.6, 0.7);
      const ftX = softClamp(distance, stopX(7) - 2.35, TRACK_LENGTH, 0.7);

      const wtMoving = Math.abs(wtX - prev.winterTrain) / dt > STEAM_SPEED;
      const sbMoving = Math.abs(sbX - prev.springBike) / dt > 0.08;
      const boatMoving = Math.abs(boatX - prev.summerBoat) / dt > 0.08;
      const vanMovement = vanX - prev.autumnVan;
      const vanSpeed = vanMovement / dt;
      const vanMoving = Math.abs(vanSpeed) > 0.08;
      const ftMoving = Math.abs(ftX - prev.finaleTrain) / dt > STEAM_SPEED;

      winterTrain.update(wtX, time, wtMoving, reduced);
      springBike.update(sbX, time, sbMoving, reduced);
      summerBoat.update(boatX, time, boatMoving, reduced);
      autumnVan.update(vanX, time, vanMoving, reduced);
      updateVanExhaust(vanX, vanSpeed, delta, reduced);
      finaleTrain.update(ftX, time, ftMoving, reduced);

      prev.winterTrain = wtX;
      prev.springBike = sbX;
      prev.summerBoat = boatX;
      prev.autumnVan = vanX;
      prev.finaleTrain = ftX;
    },
  };
}
