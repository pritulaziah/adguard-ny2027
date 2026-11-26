import * as THREE from 'three';
import type { Interaction } from '../content/i18n';
import type { PaperDetail } from './paper-brush';
import { cut, oval, rect, stroke } from './paper-shapes';

export interface AnimalBuilderContext {
  detail: (name: string, x: number, z?: number, scale?: number, y?: number) => PaperDetail;
  place: (name: string, x: number, z?: number, scale?: number, y?: number) => THREE.Group;
  animate: (
    mesh: THREE.Object3D,
    kind: 'still' | 'sway' | 'wing' | 'float' | 'jump' | 'flutter'
      | 'cat-blink' | 'cat-tail' | 'bunny-ear' | 'deer-ear' | 'crab-step' | 'crab-claw' | 'fish-dive' | 'fish-splash',
    key?: Interaction,
    sparkLift?: number,
  ) => void;
}

const INK = '#3f4744';
const CREAM = '#f5ecd7';
const SNOW = '#f2eee4';
const BLUSH = '#dfa093';

function shapeFrom(draw: (shape: THREE.Shape) => void): THREE.Shape {
  const shape = new THREE.Shape();
  draw(shape);
  return shape;
}

function addGroundShadow(target: PaperDetail, width: number, depth = 0.28, color = '#767a75'): void {
  target.oval(width, depth, color, 0, 0.015, -0.02, [-Math.PI / 2, 0, 0], 0.012);
}

function addSparkleEye(parent: THREE.Object3D, x: number, y: number, z: number, radius = 0.048, iris?: string): void {
  if (iris) {
    oval(parent, radius * 2.25, radius * 2.25, iris, x, y, z, 0.014);
    oval(parent, radius * 1.35, radius * 1.5, INK, x, y, z + 0.014, 0.014);
    oval(parent, radius * 0.56, radius * 0.56, '#fffdf6', x - radius * 0.25, y + radius * 0.28, z + 0.028, 0.01);
  } else {
    oval(parent, radius * 1.9, radius * 2.1, INK, x, y, z, 0.016);
    oval(parent, radius * 0.62, radius * 0.62, '#fffdf6', x - radius * 0.25, y + radius * 0.3, z + 0.016, 0.01);
  }
}

function addStaticSparkleEye(parent: PaperDetail, x: number, y: number, z: number, radius = 0.048): void {
  parent.oval(radius * 1.9, radius * 2.1, INK, x, y, z, undefined, 0.016);
  parent.oval(radius * 0.62, radius * 0.62, '#fffdf6', x - radius * 0.24, y + radius * 0.3, z + 0.018, undefined, 0.01);
}

/** Graceful winter fawn in 3/4 side profile with scarf and branched antlers. */
export function addDeer(ctx: AnimalBuilderContext, x: number, z = -1.08): void {
  const deer = ctx.detail('paper-deer', x, z, 0.96);
  addGroundShadow(deer, 0.92, 0.26, '#849099');

  // Back legs (darker warm tan, gracefully tapered and tucked behind body).
  deer.cut([[-0.34, 0.02], [-0.26, 0.02], [-0.21, 0.56], [-0.35, 0.56]], '#9e7c64', 0, 0, -0.06, undefined, 0.032);
  deer.cut([[0.17, 0.02], [0.25, 0.02], [0.26, 0.56], [0.13, 0.56]], '#9e7c64', 0, 0, -0.06, undefined, 0.032);
  deer.rect(0.09, 0.065, '#584c45', -0.3, 0.0, -0.055, undefined, 0.036);
  deer.rect(0.09, 0.065, '#584c45', 0.21, 0.0, -0.055, undefined, 0.036);

  // Sculpted fawn body and curved neck rising toward the right.
  const body = shapeFrom(s => {
    s.moveTo(-0.46, 0.64);
    s.bezierCurveTo(-0.48, 0.42, -0.22, 0.38, 0.14, 0.41);
    s.bezierCurveTo(0.38, 0.44, 0.44, 0.62, 0.42, 0.96);
    s.bezierCurveTo(0.41, 1.07, 0.26, 1.08, 0.22, 0.98);
    s.bezierCurveTo(0.18, 0.84, 0.08, 0.8, -0.14, 0.81);
    s.bezierCurveTo(-0.34, 0.82, -0.45, 0.76, -0.46, 0.64);
    s.closePath();
  });
  deer.shape(body, '#c29978', 0, 0, 0, undefined, 0.044);

  // Soft cream underbelly and upturned white tail tuft.
  const belly = shapeFrom(s => {
    s.moveTo(-0.28, 0.45);
    s.quadraticCurveTo(-0.02, 0.39, 0.24, 0.46);
    s.quadraticCurveTo(0.02, 0.56, -0.28, 0.45);
    s.closePath();
  });
  deer.shape(belly, '#eadbc2', 0, 0, 0.044, undefined, 0.018);

  const tail = shapeFrom(s => {
    s.moveTo(-0.42, 0.68);
    s.quadraticCurveTo(-0.62, 0.78, -0.55, 0.92);
    s.quadraticCurveTo(-0.44, 0.88, -0.4, 0.73);
    s.closePath();
  });
  deer.shape(tail, CREAM, 0, 0, -0.02, undefined, 0.03);

  // Front legs (brighter tan, gracefully tapered and standing cleanly in front).
  deer.cut([[-0.22, 0.02], [-0.14, 0.02], [-0.09, 0.52], [-0.23, 0.52]], '#b58d6f', 0, 0, 0.035, undefined, 0.034);
  deer.cut([[0.27, 0.02], [0.35, 0.02], [0.35, 0.56], [0.22, 0.56]], '#b58d6f', 0, 0, 0.035, undefined, 0.034);
  deer.rect(0.09, 0.07, '#4e433d', -0.18, 0.0, 0.04, undefined, 0.038);
  deer.rect(0.09, 0.07, '#4e433d', 0.31, 0.0, 0.04, undefined, 0.038);

  // Delicate fawn spots on the back.
  const spots: Array<[number, number, number]> = [
    [-0.24, 0.72, 0.065], [-0.11, 0.74, 0.075], [0.02, 0.69, 0.06],
    [-0.17, 0.62, 0.055], [-0.03, 0.6, 0.062],
  ];
  for (const [sx, sy, sr] of spots) deer.oval(sr * 1.15, sr, '#f3e7ce', sx, sy, 0.052, undefined, 0.012);

  // Warm knitted winter scarf around the neck.
  deer.cut([[0.16, 0.82], [0.46, 0.83], [0.47, 0.95], [0.15, 0.94]], '#be6e62', 0, 0, 0.062, undefined, 0.028);
  deer.cut([[0.15, 0.85], [0.25, 0.85], [0.2, 0.58], [0.09, 0.6]], '#b06156', 0, 0, 0.076, undefined, 0.024);
  deer.rect(0.29, 0.024, '#efd9b3', 0.31, 0.87, 0.092, undefined, 0.01);

  // Deer head facing right with leaf-shaped ears and antlers.
  const headShape = shapeFrom(s => {
    s.moveTo(-0.22, -0.05);
    s.bezierCurveTo(-0.24, 0.17, -0.05, 0.25, 0.14, 0.18);
    s.bezierCurveTo(0.28, 0.12, 0.37, 0.01, 0.35, -0.08);
    s.bezierCurveTo(0.32, -0.17, 0.12, -0.18, -0.06, -0.16);
    s.bezierCurveTo(-0.18, -0.15, -0.22, -0.11, -0.22, -0.05);
    s.closePath();
  });
  const head = cut(deer.group, headShape, '#cda482', 0.35, 1.12, 0.055, 0.044);

  // Soft cream muzzle patch and rosy button nose.
  const muzzle = shapeFrom(s => {
    s.moveTo(0.11, -0.13);
    s.quadraticCurveTo(0.34, -0.15, 0.34, -0.04);
    s.quadraticCurveTo(0.24, 0.02, 0.11, -0.04);
    s.closePath();
  });
  cut(head, muzzle, CREAM, 0, 0, 0.044, 0.016);
  oval(head, 0.09, 0.075, '#4b3f39', 0.33, -0.03, 0.062, 0.022);
  oval(head, 0.07, 0.045, BLUSH, 0.1, -0.05, 0.052, 0.012);
  addSparkleEye(head, 0.04, 0.045, 0.056, 0.042);

  // Expressive leaf-shaped ears.
  const leftEar = shapeFrom(s => {
    s.moveTo(-0.14, 0.14);
    s.quadraticCurveTo(-0.38, 0.32, -0.34, 0.42);
    s.quadraticCurveTo(-0.16, 0.4, -0.06, 0.2);
    s.closePath();
  });
  const ear = new THREE.Group();
  ear.position.set(-0.14, 0.14, 0);
  head.add(ear);
  cut(ear, leftEar, '#b88f70', 0.14, -0.14, -0.015, 0.028);
  const leftEarIn = shapeFrom(s => {
    s.moveTo(-0.14, 0.18);
    s.quadraticCurveTo(-0.29, 0.3, -0.28, 0.36);
    s.quadraticCurveTo(-0.17, 0.34, -0.1, 0.22);
    s.closePath();
  });
  cut(ear, leftEarIn, '#e3bfb0', 0.14, -0.14, 0.014, 0.012);

  const rightEar = shapeFrom(s => {
    s.moveTo(0.02, 0.18);
    s.quadraticCurveTo(0.14, 0.38, 0.25, 0.38);
    s.quadraticCurveTo(0.24, 0.23, 0.1, 0.15);
    s.closePath();
  });
  cut(head, rightEar, '#b88f70', 0, 0, -0.022, 0.026);

  // Delicate branched antlers.
  stroke(head, [[-0.08, 0.19], [-0.16, 0.46], [-0.26, 0.62]], '#7d6756', 0.032, -0.01);
  stroke(head, [[-0.14, 0.41], [-0.04, 0.56]], '#7d6756', 0.026, -0.01);
  stroke(head, [[0.03, 0.19], [0.1, 0.47], [0.22, 0.63]], '#7d6756', 0.032, 0.01);
  stroke(head, [[0.09, 0.41], [0.01, 0.57]], '#7d6756', 0.026, 0.01);

  ctx.animate(head, 'still', 'deer', 0.62);
  ctx.animate(ear, 'deer-ear', 'deer');
}

/** Plump grounded winter snowman with felt hat, holly sprig, scarf, and waving arm. */
export function addSnowman(ctx: AnimalBuilderContext, x: number, interactive = true, z = -1.04): void {
  const man = ctx.detail('paper-snowman', x, z, 0.98);
  addGroundShadow(man, 1.02, 0.28, '#83909b');

  // Plump lower snowball resting firmly on the ground with subtle rim shadow.
  man.oval(0.96, 0.88, '#dfe5e8', 0.02, 0.44, -0.015, undefined, 0.04);
  man.oval(0.92, 0.85, SNOW, 0, 0.44, 0.01, undefined, 0.042);

  // Middle torso snowball for a classic charming snowman silhouette.
  man.oval(0.74, 0.66, '#e2e8ea', 0.015, 0.96, 0.03, undefined, 0.04);
  man.oval(0.7, 0.64, '#f6f2e8', 0, 0.96, 0.055, undefined, 0.042);

  // Cozy knitted crimson-terracotta scarf with striped fringe tail.
  const scarfWrap = shapeFrom(s => {
    s.moveTo(-0.34, 1.19);
    s.quadraticCurveTo(0, 1.11, 0.34, 1.19);
    s.lineTo(0.32, 1.32);
    s.quadraticCurveTo(0, 1.25, -0.32, 1.32);
    s.closePath();
  });
  man.shape(scarfWrap, '#bc6d60', 0, 0, 0.125, undefined, 0.032);
  man.cut([[0.09, 1.21], [0.24, 1.21], [0.29, 0.78], [0.13, 0.8]], '#ae6054', 0, 0, 0.145, undefined, 0.028);
  man.rect(0.14, 0.026, '#f0dbb5', 0.2, 0.88, 0.176, undefined, 0.01);
  man.rect(0.14, 0.026, '#f0dbb5', 0.19, 0.97, 0.176, undefined, 0.01);

  // Three coal buttons down the tummy.
  for (const by of [0.46, 0.69, 0.92]) {
    man.oval(0.068, 0.068, INK, -0.01, by, 0.112, undefined, 0.02);
  }

  // Cheerful head with rosy cheeks, carrot nose, and coal smile.
  const head = man.child('paper-snowman-head', 0, 1.48, 0.095);
  head.oval(0.58, 0.54, '#f9f5ec', 0, 0, 0, undefined, 0.044);
  addStaticSparkleEye(head, -0.1, 0.07, 0.048, 0.038);
  addStaticSparkleEye(head, 0.1, 0.07, 0.048, 0.038);
  head.oval(0.095, 0.06, BLUSH, -0.17, -0.02, 0.046, undefined, 0.012);
  head.oval(0.095, 0.06, BLUSH, 0.17, -0.02, 0.046, undefined, 0.012);

  // Tapered carrot nose pointing warmly to the right.
  const carrot = shapeFrom(s => {
    s.moveTo(0.0, 0.03);
    s.quadraticCurveTo(0.24, -0.01, 0.34, -0.04);
    s.quadraticCurveTo(0.22, -0.09, 0.0, -0.08);
    s.closePath();
  });
  head.shape(carrot, '#dc8652', 0, 0, 0.056, undefined, 0.024);

  // Pebbled smile dots.
  for (let i = 0; i < 5; i++) {
    const t = (i / 4) * 2 - 1;
    head.oval(0.034, 0.034, INK, t * 0.11, -0.13 + t * t * 0.035, 0.05, undefined, 0.012);
  }

  // Jaunty tilted felt top hat with ribbon and holly sprig.
  const hat = head.child('paper-snowman-hat', -0.02, 0.24, 0.03);
  hat.cut([[-0.38, -0.03], [0.38, 0.03], [0.36, 0.11], [-0.36, 0.05]], '#586e66', 0, 0, 0.01, undefined, 0.034);
  hat.cut([[-0.22, 0.05], [0.22, 0.09], [0.19, 0.44], [-0.2, 0.4]], '#637a71', 0, 0, 0, undefined, 0.032);
  hat.cut([[-0.22, 0.08], [0.22, 0.12], [0.21, 0.19], [-0.21, 0.15]], '#c47264', 0, 0, 0.034, undefined, 0.018);
  // Holly leaves + crimson berries on the hat band.
  hat.oval(0.11, 0.055, '#688c6c', 0.14, 0.16, 0.056, [0, 0, 0.45], 0.012);
  hat.oval(0.11, 0.055, '#769a77', 0.21, 0.13, 0.056, [0, 0, -0.35], 0.012);
  hat.oval(0.044, 0.044, '#c7594f', 0.16, 0.14, 0.07, undefined, 0.014);
  hat.oval(0.038, 0.038, '#d46b5f', 0.2, 0.16, 0.072, undefined, 0.014);

  // Left resting twig arm.
  man.stroke([[-0.31, 0.96], [-0.62, 1.15], [-0.73, 1.32]], '#7d6250', 0.042, 0.02);
  man.stroke([[-0.56, 1.11], [-0.69, 1.07]], '#7d6250', 0.028, 0.02);

  // Animated waving right twig arm.
  const arm = cut(
    man.group,
    [[0, 0], [0.36, 0.22], [0.42, 0.48], [0.47, 0.47], [0.42, 0.23], [0.62, 0.34], [0.65, 0.29], [0.03, -0.06]],
    '#7d6250',
    0.31,
    0.96,
    0.04,
    0.032,
  );
  ctx.animate(arm, 'wing', interactive ? 'snowman' : undefined, 0.62);
}

/** Graceful seated spring fox with curled bushy tail and pointed cheek tufts. */
export function addFox(ctx: AnimalBuilderContext, x: number, z = -1.02): void {
  const fox = ctx.detail('paper-fox', x, z, 0.96);
  addGroundShadow(fox, 0.96, 0.26, '#7a8f6f');

  // Sweeping bushy tail curling gracefully behind and around the fox.
  const tail = shapeFrom(s => {
    s.moveTo(-0.18, 0.16);
    s.bezierCurveTo(-0.62, 0.1, -0.82, 0.45, -0.64, 0.8);
    s.bezierCurveTo(-0.54, 0.94, -0.34, 0.88, -0.34, 0.68);
    s.bezierCurveTo(-0.34, 0.52, -0.26, 0.36, -0.12, 0.32);
    s.closePath();
  });
  fox.shape(tail, '#c9764e', 0, 0, -0.055, undefined, 0.038);

  const tailTip = shapeFrom(s => {
    s.moveTo(-0.64, 0.8);
    s.bezierCurveTo(-0.54, 0.94, -0.34, 0.88, -0.34, 0.68);
    s.lineTo(-0.46, 0.72);
    s.lineTo(-0.53, 0.64);
    s.lineTo(-0.62, 0.7);
    s.closePath();
  });
  fox.shape(tailTip, CREAM, 0, 0, -0.015, undefined, 0.022);

  // Seated teardrop torso.
  const body = shapeFrom(s => {
    s.moveTo(-0.33, 0.14);
    s.bezierCurveTo(-0.35, 0.44, -0.22, 0.76, 0.0, 0.82);
    s.bezierCurveTo(0.24, 0.78, 0.34, 0.44, 0.32, 0.14);
    s.quadraticCurveTo(0.0, 0.06, -0.33, 0.14);
    s.closePath();
  });
  fox.shape(body, '#cf7d53', 0, 0, 0, undefined, 0.044);

  // Fluffy cream chest bib.
  const bib = shapeFrom(s => {
    s.moveTo(-0.15, 0.68);
    s.quadraticCurveTo(0, 0.75, 0.15, 0.68);
    s.quadraticCurveTo(0.16, 0.36, 0.0, 0.24);
    s.quadraticCurveTo(-0.16, 0.36, -0.15, 0.68);
    s.closePath();
  });
  fox.shape(bib, CREAM, 0, 0, 0.046, undefined, 0.022);

  // Neat dark charcoal front paws resting on the meadow.
  fox.oval(0.14, 0.11, '#4f4844', -0.11, 0.09, 0.07, undefined, 0.026);
  fox.oval(0.14, 0.11, '#4f4844', 0.11, 0.09, 0.07, undefined, 0.026);

  // Sculpted animated fox head with diamond cheek tufts.
  const headShape = shapeFrom(s => {
    s.moveTo(0, 0.27);
    s.bezierCurveTo(0.2, 0.26, 0.36, 0.1, 0.38, -0.04);
    s.bezierCurveTo(0.24, -0.15, 0.1, -0.24, 0, -0.25);
    s.bezierCurveTo(-0.1, -0.24, -0.24, -0.15, -0.38, -0.04);
    s.bezierCurveTo(-0.36, 0.1, -0.2, 0.26, 0, 0.27);
    s.closePath();
  });
  const head = cut(fox.group, headShape, '#d48257', 0.02, 0.96, 0.06, 0.044);

  // Cream cheek masks framing the pointed snout.
  for (const sign of [-1, 1]) {
    const cheek = shapeFrom(s => {
      s.moveTo(0, -0.24);
      s.quadraticCurveTo(sign * 0.22, -0.2, sign * 0.36, -0.04);
      s.quadraticCurveTo(sign * 0.2, 0.02, sign * 0.06, -0.08);
      s.closePath();
    });
    cut(head, cheek, CREAM, 0, 0, 0.044, 0.016);

    // Tall pointed fox ears with dark outer tips and blush inner ear.
    const ear = shapeFrom(s => {
      s.moveTo(sign * 0.08, 0.18);
      s.lineTo(sign * 0.32, 0.52);
      s.lineTo(sign * 0.32, 0.08);
      s.closePath();
    });
    cut(head, ear, '#c57249', 0, 0, -0.016, 0.032);
    cut(head, [[sign * 0.22, 0.37], [sign * 0.32, 0.52], [sign * 0.32, 0.31]], '#4e4743', 0, 0, 0.018, 0.014);
    cut(head, [[sign * 0.14, 0.19], [sign * 0.26, 0.38], [sign * 0.27, 0.15]], '#e7c3b2', 0, 0, 0.018, 0.014);
  }

  addSparkleEye(head, -0.12, 0.035, 0.056, 0.042);
  addSparkleEye(head, 0.12, 0.035, 0.056, 0.042);
  oval(head, 0.09, 0.065, INK, 0, -0.19, 0.068, 0.022);
  stroke(head, [[-0.22, -0.1], [-0.42, -0.07]], INK, 0.01, 0.065);
  stroke(head, [[-0.22, -0.14], [-0.41, -0.16]], INK, 0.01, 0.065);
  stroke(head, [[0.22, -0.1], [0.42, -0.07]], INK, 0.01, 0.065);
  stroke(head, [[0.22, -0.14], [0.41, -0.16]], INK, 0.01, 0.065);

  ctx.animate(head, 'sway', 'fox', 0.46);
}

/** Spring lily-pad pond with cattails, water lily, and cheerful perched frog. */
export function addPondWithFrog(ctx: AnimalBuilderContext, x: number, z = -1.04): void {
  const pond = ctx.detail('paper-pond', x, z);

  // Layered pond water rim + deeper center.
  pond.oval(2.1, 0.86, '#a5c2b9', 0, 0.02, 0, [-Math.PI / 2, 0, 0], 0.014);
  pond.oval(1.86, 0.72, '#7fa6a2', 0, 0.035, 0.02, [-Math.PI / 2, 0, 0], 0.016);
  pond.oval(0.55, 0.12, '#bcd6ce', 0.42, 0.055, -0.08, [-Math.PI / 2, 0, 0], 0.01);

  // Cattail reeds rising gracefully behind the pond.
  const reeds: Array<[number, number, number]> = [
    [-0.82, 0.92, -0.08], [-0.68, 1.12, 0.05], [0.76, 1.0, -0.06], [0.89, 0.82, 0.1],
  ];
  for (const [rx, rh, rot] of reeds) {
    pond.rect(0.035, rh, '#728f6e', rx, 0.02, -0.32, [0, 0, rot], 0.02);
    pond.oval(0.095, 0.24, '#8a6650', rx - Math.sin(rot) * rh * 0.78, rh * 0.78, -0.29, [0, 0, rot], 0.024);
  }

  // Two notched lily pads resting on the water surface.
  const padShape = (r: number) => shapeFrom(s => {
    s.absarc(0, 0, r, 0.25, Math.PI * 2 - 0.25, false);
    s.lineTo(0, 0);
    s.closePath();
  });
  pond.shape(padShape(0.36), '#84a472', -0.28, 0.065, 0.14, [-Math.PI / 2, 0, 0.35], 0.018);
  pond.shape(padShape(0.28), '#94b17f', 0.42, 0.065, 0.08, [-Math.PI / 2, 0, -2.3], 0.018);

  // Delicate pink water-lily blossom on the right pad.
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    pond.oval(0.08, 0.15, i % 2 ? '#eac2bc' : '#f4d9d1', 0.42 + Math.cos(a) * 0.075, 0.12, 0.08 + Math.sin(a) * 0.04, [-0.55, 0, a], 0.014);
  }
  pond.oval(0.08, 0.08, '#e8c477', 0.42, 0.15, 0.1, [-0.35, 0, 0], 0.014);

  // Plump perched frog sitting on the left lily pad.
  const frogShape = shapeFrom(s => {
    s.moveTo(-0.27, -0.1);
    s.bezierCurveTo(-0.31, 0.06, -0.18, 0.18, 0, 0.18);
    s.bezierCurveTo(0.18, 0.18, 0.31, 0.06, 0.27, -0.1);
    s.quadraticCurveTo(0, -0.16, -0.27, -0.1);
    s.closePath();
  });
  const frog = cut(pond.group, frogShape, '#7fa56f', -0.27, 0.25, 0.18, 0.044);

  // Tucked haunches on either side and soft cream belly.
  for (const sign of [-1, 1]) {
    oval(frog, 0.19, 0.21, '#6f9660', sign * 0.23, -0.07, -0.014, 0.036);
    cut(frog, [[sign * 0.14, -0.15], [sign * 0.34, -0.15], [sign * 0.31, -0.19], [sign * 0.14, -0.19]], '#658b57', 0, 0, 0.01, 0.02);
  }
  oval(frog, 0.3, 0.17, '#e2e5c2', 0, -0.05, 0.044, 0.016);

  // Raised dome eyes, rosy cheeks, and friendly curved smile.
  for (const sign of [-1, 1]) {
    oval(frog, 0.17, 0.17, '#8db37c', sign * 0.14, 0.17, 0.018, 0.036);
    oval(frog, 0.11, 0.11, '#fbf7ea', sign * 0.14, 0.17, 0.048, 0.016);
    addSparkleEye(frog, sign * 0.14, 0.17, 0.064, 0.034);
    oval(frog, 0.08, 0.05, BLUSH, sign * 0.17, 0.03, 0.048, 0.012);
  }
  stroke(frog, [[-0.12, 0.02], [-0.04, -0.03], [0.04, -0.03], [0.12, 0.02]], INK, 0.015, 0.064);

  ctx.animate(frog, 'jump', 'frog', 0.34);
}

/** Friendly storybook sea-dragon gliding gently over the summer coastal bay. */
export function addSeaDragon(ctx: AnimalBuilderContext, x: number, z = -1.12): void {
  const host = ctx.place('paper-dragon', x, z, 0.94);

  // Gracefully curved emerald-jade body + S-neck + curling tail.
  const bodyShape = shapeFrom(s => {
    s.moveTo(-0.56, 0.16);
    s.bezierCurveTo(-0.74, 0.36, -0.58, 0.56, -0.45, 0.44);
    s.bezierCurveTo(-0.52, 0.36, -0.46, 0.24, -0.32, 0.2);
    s.bezierCurveTo(-0.1, 0.12, 0.2, 0.16, 0.32, 0.36);
    s.bezierCurveTo(0.42, 0.54, 0.34, 0.78, 0.28, 0.96);
    s.bezierCurveTo(0.24, 1.08, 0.38, 1.18, 0.58, 1.1);
    s.bezierCurveTo(0.68, 1.06, 0.69, 0.94, 0.57, 0.9);
    s.bezierCurveTo(0.46, 0.87, 0.4, 0.87, 0.36, 0.8);
    s.bezierCurveTo(0.44, 0.62, 0.52, 0.44, 0.44, 0.24);
    s.bezierCurveTo(0.32, -0.02, -0.26, -0.06, -0.56, 0.16);
    s.closePath();
  });
  const body = cut(host, bodyShape, '#699c8e', 0, 0.34, 0, 0.046);

  // Soft cream striped belly plates.
  const bellyShape = shapeFrom(s => {
    s.moveTo(-0.24, 0.11);
    s.quadraticCurveTo(0.14, 0.04, 0.38, 0.24);
    s.quadraticCurveTo(0.42, 0.52, 0.33, 0.78);
    s.quadraticCurveTo(0.26, 0.5, 0.21, 0.28);
    s.quadraticCurveTo(0.02, 0.14, -0.24, 0.11);
    s.closePath();
  });
  cut(body, bellyShape, '#efe4c7', 0, 0, 0.044, 0.018);

  // Golden scalloped dorsal crests along neck and back.
  const crests: Array<[number, number, number]> = [
    [0.24, 1.06, 0.25], [0.22, 0.9, 0.55], [0.23, 0.72, 0.65],
    [0.16, 0.52, 0.85], [-0.04, 0.33, 1.35], [-0.26, 0.27, 1.7],
  ];
  for (const [cx, cy, rot] of crests) {
    const fin = cut(body, [[-0.075, 0], [0, 0.15], [0.075, 0]], '#e4bf76', cx, cy, -0.016, 0.024);
    fin.rotation.z = rot;
  }

  // Little golden head horn + friendly snout expression.
  cut(body, [[0.29, 1.1], [0.19, 1.32], [0.39, 1.15]], '#e4bf76', 0, 0, -0.012, 0.024);
  cut(body, [[0.38, 1.12], [0.34, 1.28], [0.46, 1.13]], '#d8b065', 0, 0, 0.016, 0.02);
  addSparkleEye(body, 0.42, 1.05, 0.056, 0.046, '#f6eccf');
  oval(body, 0.07, 0.045, BLUSH, 0.46, 0.96, 0.054, 0.012);
  oval(body, 0.032, 0.032, '#47685f', 0.59, 1.02, 0.054, 0.012);
  stroke(body, [[0.47, 0.93], [0.56, 0.92], [0.62, 0.95]], INK, 0.014, 0.062);

  // Back wing (darker sage-teal behind the body).
  const wingShape = shapeFrom(s => {
    s.moveTo(0, 0);
    s.bezierCurveTo(-0.18, 0.36, -0.44, 0.52, -0.62, 0.44);
    s.quadraticCurveTo(-0.48, 0.28, -0.5, 0.16);
    s.quadraticCurveTo(-0.34, 0.14, -0.3, 0.02);
    s.quadraticCurveTo(-0.16, 0.05, 0, 0);
    s.closePath();
  });
  const backWing = cut(body, wingShape, '#548278', 0.12, 0.48, -0.042, 0.026);
  backWing.rotation.z = -0.18;

  // Front wing with delicate cream paper ribs and gentle flutter animation.
  const frontWing = cut(body, wingShape, '#8cb8aa', 0.12, 0.46, 0.054, 0.026);
  stroke(frontWing, [[0, 0.02], [-0.46, 0.36]], '#e6dfc5', 0.014, 0.032);
  stroke(frontWing, [[-0.06, 0.03], [-0.36, 0.16]], '#e6dfc5', 0.012, 0.032);
  ctx.animate(frontWing, 'flutter');

  ctx.animate(body, 'float', 'dragon', 0.25);
}

/** Cheerful coral-terracotta red crab on the summer beach sand. */
export function addCrab(ctx: AnimalBuilderContext, x: number, z = -0.88): void {
  const host = ctx.place('paper-crab', x, z, 0.94);

  // Soft sand shadow under the crab.
  const shadow = oval(host, 0.86, 0.22, '#9a8e74', 0, 0.02, -0.02, 0.012);
  shadow.rotation.x = -Math.PI / 2;

  // Wide curved coral-red shell carapace.
  const shellShape = shapeFrom(s => {
    s.moveTo(-0.34, -0.04);
    s.bezierCurveTo(-0.36, 0.18, -0.16, 0.28, 0, 0.28);
    s.bezierCurveTo(0.16, 0.28, 0.36, 0.18, 0.34, -0.04);
    s.quadraticCurveTo(0, -0.18, -0.34, -0.04);
    s.closePath();
  });
  const body = cut(host, shellShape, '#d26850', 0, 0.24, 0.04, 0.046);
  ctx.animate(body, 'crab-step', 'crab', 0.36);

  // Warm coral-peach belly crescent and shell highlight.
  const highlight = shapeFrom(s => {
    s.moveTo(-0.2, 0.14);
    s.quadraticCurveTo(0, 0.24, 0.2, 0.14);
    s.quadraticCurveTo(0, 0.18, -0.2, 0.14);
    s.closePath();
  });
  cut(body, highlight, '#e68c72', 0, 0, 0.046, 0.014);
  oval(body, 0.42, 0.14, '#f0c9b0', 0, -0.07, 0.044, 0.014);

  // Three jointed coral-red walking legs per side + two raised pincer claws.
  for (const sign of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const y0 = -0.02 - i * 0.045;
      stroke(
        body,
        [[sign * 0.27, y0], [sign * (0.43 + i * 0.03), y0 - 0.02], [sign * (0.5 + i * 0.02), y0 - 0.13]],
        '#b8543f',
        0.032,
        -0.018,
      );
    }

    // Articulated pincer arm reaching upward.
    const arm = new THREE.Group();
    arm.position.set(sign * 0.24, 0.08, 0.01);
    body.add(arm);
    stroke(arm, [[0, 0], [sign * 0.2, 0.14], [sign * 0.22, 0.28]], '#c55e48', 0.046, 0);

    // Classic open paper crab claw.
    const claw = shapeFrom(s => {
      s.moveTo(sign * 0.46, 0.3);
      s.bezierCurveTo(sign * 0.66, 0.34, sign * 0.69, 0.56, sign * 0.52, 0.62);
      s.lineTo(sign * 0.48, 0.47);
      s.lineTo(sign * 0.4, 0.61);
      s.bezierCurveTo(sign * 0.3, 0.52, sign * 0.34, 0.34, sign * 0.46, 0.3);
      s.closePath();
    });
    cut(arm, claw, '#dc7459', -arm.position.x, -arm.position.y, 0.012, 0.034);
    if (sign > 0) ctx.animate(arm, 'crab-claw', 'crab');

    // Raised eye stalks with bright cream eyeballs.
    stroke(body, [[sign * 0.12, 0.22], [sign * 0.15, 0.37]], '#bf5c46', 0.034, 0.01);
    oval(body, 0.13, 0.13, '#fff9ec', sign * 0.15, 0.39, 0.028, 0.028);
    addSparkleEye(body, sign * 0.15, 0.39, 0.056, 0.034);
    oval(body, 0.08, 0.05, '#ef9c88', sign * 0.18, 0.02, 0.048, 0.012);
  }

  stroke(body, [[-0.1, 0.02], [0, -0.035], [0.1, 0.02]], INK, 0.016, 0.062);
}

/** Playful coral-apricot fish leaping cleanly above the summer sea waves. */
export function addFish(ctx: AnimalBuilderContext, x: number, z = -0.34): void {
  const host = ctx.place('paper-fish', x, z, 0.94);

  // Small frothy water-splash arc right below the leaping fish.
  const splash = new THREE.Group();
  splash.position.set(-0.22, 0.1, 0.08);
  splash.visible = false;
  host.add(splash);
  cut(splash, [[-0.3, 0.02], [-0.14, 0.13], [0, 0.06], [0.16, 0.14], [0.3, 0.02]], '#eef4ee', 0, 0, 0, 0.016);
  oval(splash, 0.065, 0.065, '#f2f7f1', -0.22, 0.14, 0, 0.014);
  oval(splash, 0.055, 0.055, '#f2f7f1', 0.24, 0.16, 0, 0.014);

  // Graceful teardrop leaping fish body facing left-upward.
  const fishShape = shapeFrom(s => {
    s.moveTo(-0.34, 0.02);
    s.bezierCurveTo(-0.24, 0.24, 0.12, 0.26, 0.34, 0.02);
    s.bezierCurveTo(0.14, -0.22, -0.22, -0.2, -0.34, 0.02);
    s.closePath();
  });
  const body = cut(host, fishShape, '#df825d', 0, 0.42, 0.03, 0.044);
  body.rotation.z = -0.18;

  // Warm cream koi/clownfish stripes and soft belly.
  const stripe1 = shapeFrom(s => {
    s.moveTo(-0.1, 0.18);
    s.quadraticCurveTo(-0.04, 0, -0.1, -0.16);
    s.lineTo(-0.01, -0.17);
    s.quadraticCurveTo(0.05, 0, -0.01, 0.19);
    s.closePath();
  });
  cut(body, stripe1, CREAM, 0, 0, 0.044, 0.016);

  const stripe2 = shapeFrom(s => {
    s.moveTo(0.11, 0.15);
    s.quadraticCurveTo(0.16, 0, 0.11, -0.13);
    s.lineTo(0.19, -0.1);
    s.quadraticCurveTo(0.23, 0, 0.19, 0.12);
    s.closePath();
  });
  cut(body, stripe2, CREAM, 0, 0, 0.044, 0.016);

  // Flowing forked tail fin, scalloped dorsal crest, and side pectoral fin.
  const tail = shapeFrom(s => {
    s.moveTo(0.28, 0.02);
    s.quadraticCurveTo(0.46, 0.22, 0.56, 0.26);
    s.quadraticCurveTo(0.46, 0.06, 0.43, 0.02);
    s.quadraticCurveTo(0.46, -0.04, 0.56, -0.22);
    s.quadraticCurveTo(0.44, -0.18, 0.28, 0.02);
    s.closePath();
  });
  cut(body, tail, '#e9ad76', 0, 0, -0.016, 0.028);

  const dorsal = shapeFrom(s => {
    s.moveTo(-0.1, 0.17);
    s.quadraticCurveTo(0.04, 0.34, 0.2, 0.18);
    s.lineTo(0.15, 0.13);
    s.closePath();
  });
  cut(body, dorsal, '#e9ad76', 0, 0, -0.014, 0.024);

  const pec = shapeFrom(s => {
    s.moveTo(-0.08, -0.04);
    s.quadraticCurveTo(0.08, -0.1, 0.12, -0.22);
    s.quadraticCurveTo(-0.02, -0.2, -0.08, -0.04);
    s.closePath();
  });
  cut(body, pec, '#e8a872', 0, 0, 0.052, 0.018);

  // Friendly eye and curved gill line.
  oval(body, 0.11, 0.11, '#fffaf0', -0.19, 0.05, 0.044, 0.016);
  addSparkleEye(body, -0.19, 0.05, 0.06, 0.032);
  stroke(body, [[-0.29, -0.02], [-0.24, -0.05], [-0.19, -0.03]], INK, 0.012, 0.058);

  ctx.animate(body, 'fish-dive', 'fish', 0.34);
  ctx.animate(splash, 'fish-splash', 'fish');
}

/** Cozy seated slate-tuxedo cat with curled S-tail, crisp whiskers, and golden eyes. */
export function addCat(ctx: AnimalBuilderContext, x: number, z = -1.02): void {
  const cat = ctx.detail('paper-cat', x, z, 0.96);
  addGroundShadow(cat, 0.88, 0.26, '#876d5d');

  // Graceful upright S-tail with a small cream tip, tucked behind the body.
  const tail = shapeFrom(s => {
    s.moveTo(-0.16, 0.2);
    s.bezierCurveTo(-0.46, 0.1, -0.62, 0.34, -0.54, 0.62);
    s.bezierCurveTo(-0.515, 0.72, -0.54, 0.8, -0.58, 0.85);
    s.lineTo(-0.51, 0.79);
    s.bezierCurveTo(-0.46, 0.71, -0.435, 0.64, -0.42, 0.5);
    s.bezierCurveTo(-0.4, 0.32, -0.3, 0.2, -0.16, 0.2);
    s.closePath();
  });
  const tailTip = shapeFrom(s => {
    s.moveTo(-0.51, 0.79);
    s.lineTo(-0.58, 0.85);
    s.bezierCurveTo(-0.62, 0.9, -0.68, 0.91, -0.67, 0.95);
    s.bezierCurveTo(-0.65, 1.02, -0.55, 0.89, -0.51, 0.79);
    s.closePath();
  });
  const movingTail = new THREE.Group();
  movingTail.position.set(-0.16, 0.2, -0.08);
  cat.group.add(movingTail);
  cut(movingTail, tail, '#566470', 0.16, -0.2, 0, 0.03);
  cut(movingTail, tailTip, CREAM, 0.16, -0.2, 0, 0.03);

  // Seated pear-shaped body with tucked haunch.
  const body = shapeFrom(s => {
    s.moveTo(-0.33, 0.12);
    s.bezierCurveTo(-0.37, 0.42, -0.22, 0.72, 0, 0.76);
    s.bezierCurveTo(0.24, 0.72, 0.34, 0.42, 0.3, 0.12);
    s.quadraticCurveTo(0, 0.04, -0.33, 0.12);
    s.closePath();
  });
  cat.shape(body, '#60707c', 0, 0, 0, undefined, 0.044);

  // Tucked hind haunch shading and crisp cream tuxedo chest bib.
  cat.oval(0.3, 0.34, '#51606b', -0.17, 0.24, 0.05, undefined, 0.006);
  const bib = shapeFrom(s => {
    s.moveTo(-0.13, 0.66);
    s.quadraticCurveTo(0, 0.72, 0.13, 0.66);
    s.quadraticCurveTo(0.16, 0.36, 0, 0.24);
    s.quadraticCurveTo(-0.16, 0.36, -0.13, 0.66);
    s.closePath();
  });
  cat.shape(bib, CREAM, 0, 0, 0.044, undefined, 0.02);

  // Neat white mittens tucked together at the base.
  cat.oval(0.14, 0.1, CREAM, -0.09, 0.085, 0.068, undefined, 0.028);
  cat.oval(0.14, 0.1, CREAM, 0.09, 0.085, 0.068, undefined, 0.028);

  // Warm terracotta collar with tiny gold bell.
  cat.rect(0.32, 0.068, '#c87361', 0, 0.69, 0.068, undefined, 0.022);
  cat.oval(0.085, 0.085, '#e8c477', 0, 0.67, 0.09, undefined, 0.024);

  // Animated expressive round cat head.
  const headShape = shapeFrom(s => {
    s.moveTo(0, 0.26);
    s.bezierCurveTo(0.24, 0.26, 0.34, 0.1, 0.32, -0.08);
    s.bezierCurveTo(0.28, -0.22, 0.12, -0.25, 0, -0.25);
    s.bezierCurveTo(-0.12, -0.25, -0.28, -0.22, -0.32, -0.08);
    s.bezierCurveTo(-0.34, 0.1, -0.24, 0.26, 0, 0.26);
    s.closePath();
  });
  const head = cut(cat.group, headShape, '#667683', 0, 0.94, 0.06, 0.044);

  // Pointed cat ears with soft blush inner triangles.
  for (const sign of [-1, 1]) {
    cut(head, [[sign * 0.08, 0.18], [sign * 0.29, 0.45], [sign * 0.31, 0.08]], '#5b6b77', 0, 0, -0.015, 0.032);
    cut(head, [[sign * 0.13, 0.19], [sign * 0.25, 0.36], [sign * 0.26, 0.14]], '#e5b9ae', 0, 0, 0.018, 0.014);
  }

  // Subtle tabby forehead stripes.
  for (const fx of [-0.07, 0, 0.07]) {
    rect(head, 0.024, 0.095, '#4c5964', fx, 0.15, 0.046, 0.012);
  }

  // Soft cream muzzle cheeks, tiny pink triangle nose, and 'w' smile.
  oval(head, 0.17, 0.13, CREAM, -0.08, -0.12, 0.046, 0.016);
  oval(head, 0.17, 0.13, CREAM, 0.08, -0.12, 0.046, 0.016);
  cut(head, [[-0.042, -0.05], [0.042, -0.05], [0, -0.1]], '#de9187', 0, 0, 0.064, 0.014);
  stroke(head, [[-0.075, -0.13], [-0.035, -0.16], [0, -0.11], [0.035, -0.16], [0.075, -0.13]], INK, 0.012, 0.066);

  // Warm golden-amber eyes with dark vertical pupils and sparkle.
  const eyes = new THREE.Group();
  eyes.position.set(0, 0.02, 0.052);
  head.add(eyes);
  for (const x of [-0.13, 0.13]) addSparkleEye(eyes, x, 0, 0, 0.046, '#e8c474');

  // Three crisp splayed whiskers per side.
  for (const sign of [-1, 1]) {
    stroke(head, [[sign * 0.18, -0.07], [sign * 0.42, -0.03]], '#eee6d4', 0.01, 0.068);
    stroke(head, [[sign * 0.19, -0.11], [sign * 0.44, -0.11]], '#eee6d4', 0.01, 0.068);
    stroke(head, [[sign * 0.18, -0.15], [sign * 0.41, -0.19]], '#eee6d4', 0.01, 0.068);
  }

  ctx.animate(head, 'still', 'cat', 0.42);
  ctx.animate(eyes, 'cat-blink', 'cat');
  ctx.animate(movingTail, 'cat-tail', 'cat');
}

/** Plump seated storybook bunny with one upright ear, one tilted ear, and cotton tail. */
export function addBunny(ctx: AnimalBuilderContext, x: number, z = -0.98): void {
  const bunny = ctx.detail('paper-bunny', x, z, 0.96);
  addGroundShadow(bunny, 0.86, 0.26, '#876d5d');

  // Fluffy cotton-puff tail behind the seated haunch.
  bunny.oval(0.24, 0.24, '#faf4e6', 0.34, 0.24, -0.045, undefined, 0.038);
  bunny.oval(0.14, 0.14, '#ffffff', 0.39, 0.29, -0.018, undefined, 0.02);

  // Plump seated rabbit body facing slightly left toward the scene center.
  const body = shapeFrom(s => {
    s.moveTo(-0.28, 0.1);
    s.bezierCurveTo(-0.34, 0.36, -0.22, 0.68, -0.02, 0.72);
    s.bezierCurveTo(0.22, 0.72, 0.36, 0.44, 0.34, 0.14);
    s.quadraticCurveTo(0.04, 0.03, -0.28, 0.1);
    s.closePath();
  });
  bunny.shape(body, '#ddd0bc', 0, 0, 0, undefined, 0.044);

  // Rounded curled hind leg haunch and creamy belly patch.
  bunny.oval(0.32, 0.34, '#cfc1ac', 0.13, 0.24, 0.038, undefined, 0.026);
  bunny.oval(0.28, 0.36, '#efe7d6', -0.12, 0.38, 0.038, undefined, 0.02);

  // Neat tucked front paws and hind foot.
  bunny.oval(0.18, 0.1, '#ebe2cf', -0.18, 0.09, 0.068, undefined, 0.026);
  bunny.oval(0.22, 0.11, '#dfd2be', 0.07, 0.085, 0.066, undefined, 0.026);

  // Round rabbit head with plump cheeks.
  const headShape = shapeFrom(s => {
    s.moveTo(0, 0.24);
    s.bezierCurveTo(0.22, 0.24, 0.3, 0.08, 0.29, -0.08);
    s.bezierCurveTo(0.26, -0.21, 0.12, -0.23, 0, -0.23);
    s.bezierCurveTo(-0.14, -0.23, -0.28, -0.2, -0.3, -0.07);
    s.bezierCurveTo(-0.31, 0.08, -0.21, 0.24, 0, 0.24);
    s.closePath();
  });
  const head = cut(bunny.group, headShape, '#e3d7c5', -0.05, 0.88, 0.06, 0.044);

  // Long expressive rabbit ears: one tall upright, one gently tilted sideways.
  const earShape = (w: number, h: number) => shapeFrom(s => {
    s.moveTo(0, 0);
    s.bezierCurveTo(-w, h * 0.25, -w * 0.9, h * 0.9, 0, h);
    s.bezierCurveTo(w * 0.9, h * 0.9, w, h * 0.25, 0, 0);
    s.closePath();
  });

  const leftEar = cut(head, earShape(0.1, 0.62), '#ddd0bc', -0.1, 0.17, -0.018, 0.03);
  leftEar.rotation.z = 0.12;
  cut(leftEar, earShape(0.055, 0.44), '#e8beb3', 0, 0.07, 0.028, 0.014);

  const rightEar = cut(head, earShape(0.1, 0.58), '#d6c8b3', 0.1, 0.17, -0.024, 0.03);
  rightEar.rotation.z = -0.44;
  cut(rightEar, earShape(0.052, 0.4), '#e8beb3', 0, 0.07, 0.028, 0.014);

  // Soft cheek highlights, rosy blush, twitchy pink nose, and gentle eyes.
  oval(head, 0.15, 0.11, '#f4ede0', -0.08, -0.1, 0.044, 0.014);
  oval(head, 0.15, 0.11, '#f4ede0', 0.08, -0.1, 0.044, 0.014);
  oval(head, 0.09, 0.055, BLUSH, -0.19, -0.06, 0.046, 0.012);
  oval(head, 0.09, 0.055, BLUSH, 0.19, -0.06, 0.046, 0.012);
  addSparkleEye(head, -0.12, 0.03, 0.056, 0.04);
  addSparkleEye(head, 0.11, 0.03, 0.056, 0.04);
  oval(head, 0.078, 0.056, '#e2968b', -0.01, -0.06, 0.062, 0.016);
  stroke(head, [[-0.07, -0.12], [-0.035, -0.15], [-0.01, -0.1], [0.025, -0.15], [0.06, -0.12]], INK, 0.012, 0.064);

  ctx.animate(head, 'still', 'bunny', 0.64);
  ctx.animate(rightEar, 'bunny-ear', 'bunny');
}
