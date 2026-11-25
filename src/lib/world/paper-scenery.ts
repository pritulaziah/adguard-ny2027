import * as THREE from 'three';
import type { Interaction } from '../content/i18n';
import { TRACK_LENGTH, STOP_SPACING } from './route';
import { cut, oval, rect, stroke, leaf, star } from './paper-shapes';
import { paperSheet, seasonalPaperMaterial } from './paper-materials';
import { PaperBatch, PaperDetail, cutGeometry, ovalGeometry, rectGeometry, starGeometry, paint, type Placement } from './paper-brush';
import { carded } from './paper-mesh';
import { FAR_RIDGE_RAMP, GROUND_RAMP, NEAR_RIDGE_RAMP, SEASON_BORDERS } from './seasons';

export interface PaperPart {
  mesh: THREE.Mesh;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  kind: 'sway' | 'wing' | 'fire' | 'float' | 'jump' | 'gate' | 'spin' | 'wave';
  phase: number;
}

export interface PaperSet {
  group: THREE.Group;
  parts: PaperPart[];
  objects: Map<Interaction, THREE.Mesh>;
}

const colors = { cream: '#f4ead5', snow: '#eeeae0', wood: '#967665', ink: '#4d5551', green: '#759486', gold: '#e4c07c' };

/** Original paper scenery. Every shape is made here, directly along the route. */
export function createPaperScenery(): PaperSet {
  const group = new THREE.Group();
  group.name = 'adguard-paper-scenery';
  const parts: PaperPart[] = [];
  const objects = new Map<Interaction, THREE.Mesh>();
  const spacing = STOP_SPACING;
  const firs = new PaperBatch();
  const sheets = new PaperBatch();

  function detail(name: string, x: number, z = -1.1, scale = 1, y = 0.34): PaperDetail {
    return new PaperDetail(sheets, group, name, x, y, z, scale);
  }

  function place(name: string, x: number, z = -1.1, scale = 1): THREE.Group {
    const object = new THREE.Group();
    object.name = name;
    object.position.set(x, 0.34, z);
    object.scale.setScalar(scale);
    group.add(object);
    return object;
  }

  function animate(mesh: THREE.Mesh, kind: PaperPart['kind'], key?: Interaction): void {
    parts.push({
      mesh,
      kind,
      position: mesh.position.clone(),
      rotation: mesh.rotation.clone(),
      scale: mesh.scale.clone(),
      phase: parts.length * 0.73,
    });
    if (key && !objects.has(key)) {
      mesh.name = key;
      objects.set(key, mesh);
    }
  }

  function eyes(parent: THREE.Object3D, width: number, y: number, z = 0.11): void {
    for (const x of [-width / 2, width / 2]) oval(parent, 0.045, 0.07, colors.ink, x, y, z);
  }

  function eyesOn(parent: PaperDetail, width: number, y: number, z = 0.11): void {
    for (const x of [-width / 2, width / 2]) parent.oval(0.045, 0.07, colors.ink, x, y, z);
  }

  function shield(parent: THREE.Object3D, x: number, y: number, scale = 1): void {
    const badge = cut(parent, [[0, 0.35], [0.29, 0.24], [0.25, -0.08], [0, -0.31], [-0.25, -0.08], [-0.29, 0.24]], colors.green, x, y, 0.15);
    badge.scale.setScalar(scale);
    stroke(badge, [[-0.13, 0.03], [-0.025, -0.07], [0.15, 0.13]], colors.cream, 0.04);
  }

  function shieldOn(parent: PaperDetail, x: number, y: number, scale = 1): void {
    const badge = parent.child('shield', x, y, 0.15, scale);
    badge.cut([[0, 0.35], [0.29, 0.24], [0.25, -0.08], [0, -0.31], [-0.25, -0.08], [-0.29, 0.24]], colors.green);
    badge.stroke([[-0.13, 0.03], [-0.025, -0.07], [0.15, 0.13]], colors.cream, 0.04);
  }

  function fir(x: number, height: number, snowy = false, festive = false): void {
    const scale = height / 3;
    const at = (lx: number, ly: number, lz = 0): Placement => ({
      x: x + lx * scale,
      y: 0.34 + ly * scale,
      z: -1.95 + lz * scale,
      scale: [scale, scale, scale],
    });

    firs.add(rectGeometry(0.14, 0.85), colors.wood, at(0, -0.05, -0.055));
    for (let tier = 0; tier < 4; tier++) {
      const bottom = 0.4 + tier * 0.5;
      const width = 1.65 - tier * 0.32;
      firs.add(
        cutGeometry([[-width / 2, bottom], [0, bottom + 1.15], [width / 2, bottom], [0.02, bottom + 0.13]]),
        tier % 2 ? '#809b8b' : '#688578',
        at(0, 0, tier * 0.035),
      );
      firs.add(
        cutGeometry([[0, bottom + 1.15], [width / 2, bottom], [0.02, bottom + 0.13]]),
        '#59776c',
        at(0, 0, tier * 0.035 + 0.05),
      );
      if (snowy) {
        firs.add(
          cutGeometry([
            [-width * 0.34, bottom + 0.24],
            [0, bottom + 1.15],
            [width * 0.25, bottom + 0.34],
            [0.07, bottom + 0.48],
            [-0.04, bottom + 0.33],
          ]),
          colors.snow,
          at(0, 0, tier * 0.035 + 0.07),
        );
      }
      if (festive && tier < 3) {
        firs.add(ovalGeometry(0.13, 0.16), tier % 2 ? '#ca8f7b' : colors.gold, at(-0.15 + tier * 0.1, bottom + 0.28, 0.25));
      }
    }
    if (festive) firs.add(starGeometry(0.22), colors.gold, at(0, 3.1, 0.2));
  }

  function cabin(x: number, final = false): void {
    const house = detail('paper-cabin', x, -1.7);
    house.cut([[-0.95, 0], [0.95, 0], [0.95, 1.42], [0, 2.17], [-0.95, 1.42]], '#b18d79');
    house.cut([[0.95, 0], [1.42, 0.2], [1.42, 1.57], [0.95, 1.42]], '#8e7060', 0, 0, -0.01);
    house.cut([[-0.02, 2.35], [0.45, 2.52], [1.62, 1.59], [1.17, 1.4]], '#d7d4c8', 0, 0, 0.02);
    for (let i = 0; i < 6; i++) house.stroke([[-0.94, 0.14 + i * 0.22], [0.94, 0.14 + i * 0.22]], '#987361', 0.025, 0.06);
    house.cut([[-1.16, 1.38], [-0.02, 2.35], [1.17, 1.4], [0.86, 1.42], [-0.02, 2.08], [-0.85, 1.38]], '#8a7165', 0, 0, 0.1);
    house.cut([[-1.15, 1.5], [-0.02, 2.39], [1.14, 1.5], [0.83, 1.57], [0.46, 1.8], [0.14, 2.04], [-0.1, 2.08], [-0.69, 1.63]], colors.snow, 0, 0, 0.16);
    house.rect(0.46, 0.94, '#6f8377', 0.25, 0.03, 0.08);
    house.oval(0.055, 0.055, colors.gold, 0.38, 0.45, 0.15);
    house.rect(0.57, 0.58, '#705f53', -0.48, 0.58, 0.08);
    house.rect(0.45, 0.46, '#efd19b', -0.48, 0.64, 0.14);
    house.stroke([[-0.48, 0.64], [-0.48, 1.1]], '#a08463', 0.035, 0.2);
    house.stroke([[-0.7, 0.87], [-0.25, 0.87]], '#a08463', 0.035, 0.2);
    house.rect(0.25, 0.65, '#9d8170', 0.52, 1.91, -0.12);
    for (let i = 0; i < 3; i++) {
      const puff = oval(house.group, 0.25 + i * 0.06, 0.14, '#d8d7cf', 0.51 - i * 0.1, 2.68 + i * 0.16, -0.2);
      animate(puff, 'float');
    }
    shieldOn(house, 0, 1.58, 0.65);
    if (final) for (let i = 0; i < 5; i++) house.star(0.085, colors.gold, -0.82 + i * 0.4, 1.31, 0.24);
  }

  function deer(x: number): void {
    const animal = detail('paper-deer', x, -1.05);
    animal.oval(0.9, 0.58, '#bf9c81', 0, 0.62);
    for (const px of [-0.26, 0.25]) animal.rect(0.12, 0.48, '#ad8972', px, 0.02, -0.05);
    const head = oval(animal.group, 0.52, 0.68, '#c9a88a', 0.27, 1.16, 0.1);
    cut(head, [[-0.15, 0.19], [-0.38, 0.46], [-0.32, 0.13]], '#b78e75', 0, 0, 0.05);
    cut(head, [[0.15, 0.19], [0.38, 0.46], [0.32, 0.13]], '#b78e75', 0, 0, 0.05);
    for (const side of [-1, 1]) {
      stroke(head, [[side * 0.12, 0.3], [side * 0.19, 0.63], [side * 0.12, 0.78]], '#816d5d', 0.035);
      stroke(head, [[side * 0.17, 0.55], [side * 0.36, 0.67], [side * 0.39, 0.82]], '#816d5d', 0.03);
    }
    eyes(head, 0.2, 0.06);
    oval(head, 0.11, 0.08, '#a4675a', 0, -0.12, 0.13);
    rect(head, 0.52, 0.12, '#bb786e', 0, -0.29, 0.14);
    for (const px of [-0.18, -0.02, 0.12]) animal.oval(0.06, 0.09, colors.cream, px, 0.7, 0.1);
    animate(head, 'sway', 'deer');
  }

  function snowman(x: number, interactive = true): void {
    const man = detail('paper-snowman', x, -1.05);
    man.oval(0.94, 1.06, colors.snow, 0, 0.54);
    const head = man.child('paper-snowman-head', 0, 1.3, 0.08);
    head.oval(0.67, 0.64, '#f6f0e1');
    eyesOn(head, 0.22, 0.08);
    head.cut([[0.04, -0.04], [0.39, -0.1], [0.04, -0.15]], '#cf9a6d', 0, 0, 0.14);
    man.rect(0.75, 0.12, '#7d8f82', 0, 1.62, 0.12);
    man.rect(0.45, 0.37, '#687e74', -0.03, 1.74, 0.1);
    man.rect(0.72, 0.16, '#b87d70', 0, 0.98, 0.17);
    man.rect(0.14, 0.4, '#b87d70', 0.15, 0.69, 0.18);
    for (const y of [0.38, 0.63, 0.84]) man.oval(0.06, 0.07, colors.ink, 0, y, 0.14);
    const arm = cut(man.group, [[0, 0], [0.45, 0.28], [0.47, 0.65], [0.51, 0.65], [0.51, 0.29], [0.73, 0.46], [0.76, 0.42], [0.03, -0.07]], colors.wood, 0.3, 0.8, 0.04);
    animate(arm, 'wing', interactive ? 'snowman' : undefined);
    man.stroke([[-0.35, 0.84], [-0.67, 1.07], [-0.75, 1.32]], colors.wood, 0.045, 0.05);
  }

  function fire(x: number): void {
    const camp = detail('paper-campfire', x, -0.85);
    for (const a of [-0.3, 0.3]) camp.rect(1, 0.13, '#9d7d66', 0, 0.03, a > 0 ? 0.05 : 0, [0, 0, a]);
    const flame = cut(camp.group, [[-0.32, 0], [-0.38, 0.3], [-0.2, 0.57], [-0.16, 0.37], [0.05, 0.95], [0.2, 0.5], [0.3, 0.62], [0.4, 0.25], [0.3, 0]], '#d49b70', 0, 0.12, 0.12);
    cut(flame, [[-0.18, 0], [-0.2, 0.25], [0, 0.6], [0.18, 0.19], [0.14, 0]], '#eed397', 0, 0, 0.06);
    animate(flame, 'fire', 'fire');
  }

  function broadTree(x: number, autumn = false): void {
    const tree = detail('layered-paper-tree', x, -2.05, 1.05);
    tree.cut([[-0.16, 0], [0.17, 0], [0.1, 1.7], [0.35, 2.3], [0.22, 2.38], [0, 1.95], [-0.3, 2.28], [-0.42, 2.18], [-0.09, 1.6]], colors.wood);
    const shades = autumn ? ['#bd8373', '#d1a16f', '#ac7367'] : ['#9fb394', '#b9c4a0', '#8fa78c'];
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * Math.PI * 2;
      tree.oval(1.1, 1.2, shades[i % 3], Math.cos(a) * 0.65, 2.2 + Math.sin(a) * 0.53, -0.18 + i * 0.012);
    }
    tree.oval(1.24, 1.32, shades[0], 0, 2.26, -0.02);
    tree.stroke([[0, 0.5], [0.02, 2.55]], '#af9477', 0.04, 0.08);
    for (let i = 0; i < 5; i++) tree.stroke([[0, 1.5 + i * 0.2], [(i % 2 ? 1 : -1) * 0.42, 1.85 + i * 0.2]], '#af9477', 0.026, 0.08);
  }

  function flower(x: number, z: number, color: string, height = 0.4): void {
    const bloom = detail('paper-flower', x, z);
    bloom.rect(0.025, height, '#7c9475');
    bloom.leaf(0.12, 0.22, '#9aa880', -0.04, height * 0.25, 0.04, [0, 0, 0.65]);
    const center = oval(bloom.group, 0.12, 0.12, colors.gold, 0, height, 0.13);
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 2 / 5;
      bloom.oval(0.16, 0.23, color, Math.cos(a) * 0.12, height + Math.sin(a) * 0.12, 0.06, [0, 0, a - Math.PI / 2]);
    }
    animate(center, 'sway');
  }

  function garden(x: number): void {
    const arch = detail('paper-garden-gate', x, -1.55);
    arch.stroke([[-0.85, 0], [-0.85, 1.8], [-0.55, 2.22], [0.55, 2.22], [0.85, 1.8], [0.85, 0]], colors.cream, 0.09, 0);
    for (const sign of [-1, 1]) {
      const gate = rect(arch.group, 0.7, 0.07, '#d9dcc1', sign * 0.82, 0.33, 0.1);
      gate.name = sign < 0 ? 'garden-gate-left' : 'garden-gate-right';
      // Slats are children of the hinge, so the whole gate opens together.
      for (let i = 0; i < 5; i++) rect(gate, 0.05, 0.93, colors.cream, -sign * (i * 0.15 + 0.04), 0, 0.07);
      rect(gate, 0.66, 0.06, '#d9dcc1', -sign * 0.34, 0.68, 0.06);
      animate(gate, 'gate', sign > 0 ? 'gate' : undefined);
    }
    for (let i = 0; i < 10; i++) {
      const px = i < 5 ? -0.85 : 0.85;
      const py = 0.4 + i % 5 * 0.35;
      arch.leaf(0.2, 0.35, i % 2 ? '#9aaf85' : '#859e7b', px, py, 0.12, [0, 0, i % 2 ? -0.7 : 0.7]);
    }
    for (const px of [-0.7, 0, 0.7]) {
      arch.oval(0.25, 0.25, '#d8ae9d', px, 2.18, 0.15);
      arch.oval(0.08, 0.08, colors.gold, px, 2.18, 0.21);
    }
  }

  function woodlandAnimal(x: number, kind: 'fox' | 'cat' | 'bunny'): void {
    const animal = detail(`paper-${kind}`, x, -0.95);
    const fur = kind === 'fox' ? '#c79770' : kind === 'cat' ? '#8a9292' : '#cabaaa';
    animal.oval(0.58, 0.7, fur, 0, 0.38);
    animal.leaf(0.32, 0.9, fur, -0.27, 0.19, -0.1, [0, 0, 0.9]);
    const head = oval(animal.group, 0.64, 0.58, fur, 0, 0.92, 0.09);
    if (kind === 'bunny') {
      for (const px of [-0.17, 0.17]) {
        oval(head, 0.18, 0.67, fur, px, 0.5);
        oval(head, 0.07, 0.47, '#dab7a7', px, 0.5, 0.06);
      }
    } else {
      for (const sign of [-1, 1]) {
        cut(head, [[sign * 0.08, 0.2], [sign * 0.31, 0.5], [sign * 0.34, 0.1]], fur, 0, 0, 0.05);
        cut(head, [[sign * 0.15, 0.23], [sign * 0.28, 0.39], [sign * 0.29, 0.17]], '#d6b7a6', 0, 0, 0.08);
      }
    }
    oval(head, 0.45, 0.23, '#efe4ce', 0, -0.1, 0.06);
    eyes(head, 0.25, 0.04, 0.14);
    oval(head, 0.07, 0.05, colors.ink, 0, -0.06, 0.16);
    for (const sign of [-1, 1]) stroke(head, [[sign * 0.15, -0.1], [sign * 0.37, -0.05]], colors.ink, 0.012, 0.16);
    animal.rect(0.52, 0.1, '#a8b6a0', 0, 0.65, 0.18);
    animate(head, 'sway', kind);
  }

  function pond(x: number): void {
    const water = detail('paper-pond', x, -1.05);
    water.oval(2, 0.85, '#8aa9a6', 0, 0.03, 0, [-Math.PI / 2, 0, 0]);
    water.oval(0.7, 0.32, '#9faf86', -0.25, 0.08, 0.2, [-Math.PI / 2, 0, 0]);
    const frog = oval(water.group, 0.55, 0.36, '#a7b58a', -0.23, 0.3, 0.3);
    for (const sign of [-1, 1]) {
      oval(frog, 0.2, 0.2, '#b6c198', sign * 0.16, 0.16, 0.03);
      oval(frog, 0.045, 0.065, colors.ink, sign * 0.16, 0.16, 0.1);
    }
    stroke(frog, [[-0.12, 0], [0, -0.045], [0.12, 0]], colors.ink, 0.014, 0.12);
    animate(frog, 'jump', 'frog');
  }

  function lighthouse(x: number): void {
    const tower = detail('paper-lighthouse', x, -1.95);
    tower.cut([[-0.78, 0], [-0.4, 0.42], [0.55, 0.35], [0.85, 0]], '#bda98c', 0, 0, -0.06);
    tower.cut([[-0.38, 0.24], [0.38, 0.24], [0.24, 2.1], [-0.24, 2.1]], colors.cream, 0, 0, 0);
    tower.cut([[-0.33, 0.72], [0.33, 0.72], [0.29, 1.12], [-0.29, 1.12]], '#c88977', 0, 0, 0.05);
    tower.cut([[-0.27, 1.52], [0.27, 1.52], [0.25, 1.84], [-0.25, 1.84]], '#c88977', 0, 0, 0.05);
    tower.rect(0.62, 0.09, '#7a8f88', 0, 2.08, 0.07);
    tower.rect(0.4, 0.36, '#f6dfa4', 0, 2.17, 0.04);
    tower.cut([[-0.28, 2.53], [0, 2.86], [0.28, 2.53]], '#c88977', 0, 0, 0.08);
    tower.rect(0.18, 0.32, '#7d695b', 0, 0.32, 0.06);
  }

  function seaCreature(x: number, kind: 'fish' | 'crab' | 'dragon'): void {
    const z = kind === 'dragon' ? -1.05 : kind === 'crab' ? -0.9 : -0.75;
    const animal = place(`paper-${kind}`, x, z);
    const body = oval(
      animal,
      kind === 'dragon' ? 0.68 : 0.62,
      kind === 'dragon' ? 1.05 : 0.38,
      kind === 'crab' ? '#cc9b80' : '#94b5af',
      0,
      kind === 'dragon' ? 0.85 : 0.28,
      0.1,
    );
    eyes(body, 0.22, 0.07);
    if (kind === 'fish') {
      cut(body, [[0.26, 0], [0.57, 0.25], [0.57, -0.25]], '#c2cba9');
      stroke(body, [[-0.12, -0.12], [-0.12, 0.15]], '#6d9994', 0.025, 0.12);
    }
    if (kind === 'crab') {
      for (const sign of [-1, 1]) {
        stroke(body, [[sign * 0.25, 0], [sign * 0.52, 0.2], [sign * 0.52, 0.39]], '#c58e75', 0.06);
        cut(body, [[sign * 0.52, 0.29], [sign * 0.73, 0.53], [sign * 0.52, 0.43], [sign * 0.38, 0.56]], '#d7ad8a', 0, 0, 0.08);
        for (let i = 0; i < 3; i++) stroke(body, [[sign * 0.2, -0.04 - i * 0.06], [sign * 0.49, -0.12 - i * 0.09]], '#bd8c77', 0.035);
      }
    }
    if (kind === 'dragon') {
      for (const sign of [-1, 1]) cut(body, [[sign * 0.2, 0.1], [sign * 0.7, 0.5], [sign * 0.6, -0.08], [sign * 0.4, 0.02]], '#b5c5b6', 0, 0, -0.07);
      for (let i = 0; i < 3; i++) cut(body, [[-0.1, 0.47 + i * 0.15], [0.02, 0.7 + i * 0.15], [0.14, 0.47 + i * 0.15]], colors.gold, 0, 0, 0.05);
      oval(body, 0.32, 0.55, '#d7d9bc', 0, -0.17, 0.06);
    }
    animate(body, kind === 'fish' ? 'jump' : 'float', kind);
  }

  function buildContinuousRidge(
    name: string,
    z: number,
    yBase: number,
    material: THREE.Material,
    heights: (x: number) => number,
  ): void {
    const startX = -26;
    const endX = TRACK_LENGTH + 26;
    const step = 1.6;
    const shape = new THREE.Shape();
    shape.moveTo(startX, 0);
    for (let x = startX; x <= endX; x += step) {
      shape.lineTo(x, heights(x));
    }
    shape.lineTo(endX, heights(endX));
    shape.lineTo(endX, 0);
    shape.closePath();
    const mesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(shape, { depth: 0.04, bevelEnabled: false }),
      material,
    );
    mesh.name = name;
    mesh.position.set(0, yBase, z);
    group.add(mesh);
  }

  function createTransferStations(): void {
    // 1. Winter Rails -> Spring Garden Path at x = 16.5
    const winterSpring = detail('transfer-winter-spring', SEASON_BORDERS.spring, -0.58);
    winterSpring.rect(0.11, 1.35, colors.wood);
    winterSpring.cut([[-0.65, 0.92], [0.05, 0.92], [0.22, 1.07], [0.05, 1.22], [-0.65, 1.22]], colors.snow, 0, 0, 0.06);
    winterSpring.cut([[-0.08, 0.64], [0.64, 0.64], [0.8, 0.79], [0.64, 0.94], [-0.08, 0.94]], '#9ab288', 0, 0, 0.09);
    // Rail buffer stop at the end of the winter tracks.
    const buffer = detail('rail-buffer-spring', SEASON_BORDERS.spring - 0.18, 0);
    buffer.rect(0.12, 0.42, '#8b7361', 0, -0.02, 0.06);
    buffer.rect(0.28, 0.12, '#c88c79', 0, 0.28, 0.1);

    // 2. Spring Garden Path -> Summer Sea Pier at x = 27.5
    const pierLeft = detail('transfer-spring-summer', SEASON_BORDERS.summer, -0.04);
    pierLeft.box(0.95, 0.09, 0.92, '#b69374', -0.18, 0.05, 0);
    for (const px of [-0.52, 0.18]) {
      pierLeft.rect(0.12, 0.48, '#8d7059', px, -0.04, -0.44);
      pierLeft.oval(0.14, 0.07, '#dfd1b4', px, 0.46, -0.4);
    }

    // 3. Summer Sea -> Autumn Road Landing Pier at x = 38.5
    const pierRight = detail('transfer-summer-autumn', SEASON_BORDERS.autumn, -0.04);
    pierRight.box(0.95, 0.09, 0.92, '#b69374', 0.18, 0.05, 0);
    for (const px of [-0.18, 0.52]) {
      pierRight.rect(0.12, 0.48, '#8d7059', px, -0.04, -0.44);
      pierRight.oval(0.14, 0.07, '#dfd1b4', px, 0.46, -0.4);
    }
    const milestone = detail('autumn-milestone', SEASON_BORDERS.autumn + 0.55, -0.58);
    milestone.cut([[-0.22, 0], [0.22, 0], [0.2, 0.56], [0, 0.72], [-0.2, 0.56]], '#d5c6ab', 0, 0, 0);
    milestone.oval(0.16, 0.16, '#c28567', 0, 0.42, 0.06);

    // 4. Autumn Road -> Winter Finale Halt at x = 59.9
    const halt = detail('transfer-autumn-winter', SEASON_BORDERS.winterEnd + 0.1, -0.58);
    halt.rect(0.1, 1.55, '#7f7265', 0, 0);
    halt.rect(0.52, 0.08, '#7f7265', 0.22, 1.45, 0.02);
    halt.oval(0.22, 0.26, '#f6dfa4', 0.42, 1.28, 0.06);
    halt.cut([[0.28, 1.42], [0.42, 1.54], [0.56, 1.42]], '#6d8279', 0, 0, 0.09);
  }

  function createTravelSurfaces(): void {
    // Winter paper railways: start (-10 .. 16.35) and finale (59.8 .. TRACK_LENGTH + 10)
    const addPaperRailway = (startX: number, endX: number): void => {
      const span = endX - startX;
      const center = (startX + endX) / 2;

      const track = detail('paper-railway', center, 0, 1, 0);
      track.box(span, 0.036, 0.72, '#d0c8b6', 0, 0.278, 0);

      const sleeperStep = 0.44;
      const sleeperCount = Math.floor((span - 0.2) / sleeperStep) + 1;
      const sleepers = new THREE.InstancedMesh(
        paint(new THREE.BoxGeometry(0.16, 0.024, 0.56), '#967a64'),
        paperSheet(),
        sleeperCount,
      );
      const dummy = new THREE.Object3D();
      for (let i = 0; i < sleeperCount; i++) {
        dummy.position.set(startX + 0.16 + i * sleeperStep, 0.309, 0);
        dummy.updateMatrix();
        sleepers.setMatrixAt(i, dummy.matrix);
      }
      sleepers.instanceMatrix.needsUpdate = true;
      group.add(sleepers);

      for (const zRail of [-0.11, 0.11]) {
        track.box(span, 0.022, 0.044, '#6d7378', 0, 0.333, zRail);
        track.box(span, 0.005, 0.026, '#b5babd', 0, 0.347, zRail);
      }
    };

    addPaperRailway(-10, SEASON_BORDERS.spring - 0.15);
    addPaperRailway(SEASON_BORDERS.winterEnd, TRACK_LENGTH + 10);

    // Spring garden path: x = 16.5 .. 27.5
    const springLen = SEASON_BORDERS.summer - SEASON_BORDERS.spring;
    const springCenter = (SEASON_BORDERS.spring + SEASON_BORDERS.summer) / 2;
    const path = detail('paper-garden-path', springCenter, 0, 1, 0);
    path.box(springLen, 0.055, 0.74, '#dfd5bc', 0, 0.295, 0);

    for (let x = SEASON_BORDERS.spring + 0.6; x < SEASON_BORDERS.summer - 0.4; x += 0.95) {
      path.box(0.42, 0.015, 0.28, '#d1c6aa', x - springCenter, 0.326, ((Math.round(x * 3) % 2) ? 0.09 : -0.09));
    }

    // Grass border along garden path.
    for (const zEdge of [-0.42, 0.42]) {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      for (let dx = 0; dx <= springLen; dx += 0.55) {
        shape.lineTo(dx, 0.08 + Math.abs(Math.sin(dx * 2.1 + zEdge)) * 0.12);
      }
      shape.lineTo(springLen, 0);
      shape.closePath();
      path.raw(
        new THREE.ExtrudeGeometry(shape, { depth: 0.025, bevelEnabled: false }),
        zEdge < 0 ? '#93aa7e' : '#a3b88d',
        SEASON_BORDERS.spring - springCenter,
        0.28,
        zEdge,
      );
    }

    // Summer sea waves: x = 27.5 .. 38.5
    const summerLen = SEASON_BORDERS.autumn - SEASON_BORDERS.summer;
    const summerCenter = (SEASON_BORDERS.summer + SEASON_BORDERS.autumn) / 2;
    const sea = detail('paper-sea', summerCenter, 0, 1, 0);
    sea.box(summerLen + 0.1, 0.06, 1.38, '#78a6a9', 0, 0.29, -0.08);

    const waveSpecs: Array<{ z: number; y: number; color: string; amp: number; freq: number }> = [
      { z: -0.48, y: 0.31, color: '#6b9aa0', amp: 0.13, freq: 1.45 },
      { z: -0.08, y: 0.31, color: '#87b4b3', amp: 0.14, freq: 1.75 },
      { z: 0.34, y: 0.3, color: '#a2c9c2', amp: 0.12, freq: 2.0 },
    ];
    waveSpecs.forEach((spec, idx) => {
      const shape = new THREE.Shape();
      shape.moveTo(0, -0.08);
      for (let dx = 0; dx <= summerLen + 0.2; dx += 0.35) {
        const crest = 0.08 + Math.abs(Math.sin(dx * spec.freq + idx * 1.3)) * spec.amp;
        shape.lineTo(dx, crest);
      }
      shape.lineTo(summerLen + 0.2, -0.08);
      shape.closePath();
      const ribbon = carded(new THREE.ExtrudeGeometry(shape, { depth: 0.03, bevelEnabled: false }), spec.color);
      ribbon.position.set(SEASON_BORDERS.summer - 0.1, spec.y, spec.z);
      group.add(ribbon);
      animate(ribbon, 'wave');
    });

    // Autumn country road: x = 38.5 .. 59.8
    const autumnLen = SEASON_BORDERS.winterEnd - SEASON_BORDERS.autumn;
    const autumnCenter = (SEASON_BORDERS.autumn + SEASON_BORDERS.winterEnd) / 2;
    const road = detail('paper-road', autumnCenter, 0, 1, 0);
    road.box(autumnLen, 0.055, 0.78, '#968b7e', 0, 0.295, 0);

    for (const zCurb of [-0.41, 0.41]) road.box(autumnLen, 0.065, 0.07, '#b99770', 0, 0.3, zCurb);

    for (let x = SEASON_BORDERS.autumn + 0.75; x < SEASON_BORDERS.winterEnd - 0.6; x += 1.35) {
      road.box(0.58, 0.012, 0.055, '#eee2c8', x - autumnCenter, 0.326, 0);
    }
  }

  // Seamless panoramic ground and layered torn-paper horizon ridges.
  const ground = new THREE.Mesh(
    new THREE.BoxGeometry(TRACK_LENGTH + 76, 0.18, 16),
    seasonalPaperMaterial(GROUND_RAMP),
  );
  ground.name = 'seasonal-paper-ground';
  ground.position.set(TRACK_LENGTH / 2, 0.17, 4.2);
  group.add(ground);

  buildContinuousRidge(
    'torn-paper-far-ridge',
    -2.76,
    0.26,
    seasonalPaperMaterial(FAR_RIDGE_RAMP, { grainStrength: 0.065 }),
    x => 0.72 + Math.sin(x * 0.23 + 0.6) * 0.26 + Math.sin(x * 0.59) * 0.16,
  );
  buildContinuousRidge(
    'torn-paper-near-ridge',
    -2.55,
    0.26,
    seasonalPaperMaterial(NEAR_RIDGE_RAMP, { grainStrength: 0.075 }),
    x => 0.44 + Math.sin(x * 0.34 + 1.8) * 0.17 + Math.cos(x * 0.77) * 0.09,
  );

  createTravelSurfaces();
  createTransferStations();

  // Stop 0 (Winter start, x = 0): Train covers [-3.66, +0.76], props stay cleanly to the right.
  fir(-4.4, 3.7, true);
  deer(1.75);
  cabin(3.1);
  fire(3.95);
  fir(6.5, 2.9, true);
  fir(8.5, 3.2, true);

  // Stop 1 (Winter AdGuard Home, x = 11): Train covers [7.34, 11.76], props stand ahead on the right.
  snowman(spacing + 1.85, true);
  fir(spacing + 4.85, 3.3, true);

  // Stop 2 (Spring AdGuard Mini Android, x = 22): Bicycle covers [21.3, 22.7].
  broadTree(spacing * 2 - 4.4);
  woodlandAnimal(spacing * 2 - 2.25, 'fox');
  garden(spacing * 2 + 1.95);
  pond(spacing * 2 + 3.85);
  for (let i = 0; i < 24; i++) {
    flower(17.1 + i * 0.41, -0.6 - (i % 3) * 0.45, i % 2 ? '#e3c7b5' : '#d8b7b1', 0.24 + (i % 4) * 0.09);
  }

  // Stop 3 (Summer AdGuard Mini Mac, x = 33): Sailboat covers [32.05, 33.95]; laptop is at 31.15.
  seaCreature(spacing * 3 - 3.6, 'dragon');
  seaCreature(spacing * 3 + 1.85, 'crab');
  seaCreature(spacing * 3 + 3.65, 'fish');
  lighthouse(spacing * 3 + 2.8);

  // Stop 4 (Autumn AdGuard Mail, x = 44): Mail van covers [43.05, 44.95]; mailbox is at 46.15.
  broadTree(spacing * 4 - 3.6, true);
  broadTree(spacing * 4 + 4.0, true);

  // Stop 5 (Autumn eMudhra, x = 55): Mail van covers [54.05, 55.95]; lantern is at 56.85.
  broadTree(spacing * 5 - 4.1, true);
  broadTree(spacing * 5 + 4.2, true);
  woodlandAnimal(spacing * 5 - 2.35, 'cat');
  woodlandAnimal(spacing * 5 + 3.35, 'bunny');
  for (let i = 0; i < 26; i++) {
    const fallen = detail('fallen-paper-leaf', 39.6 + i * 0.76, -0.58 - (i % 3) * 0.42);
    fallen.leaf(0.16, 0.3, i % 2 ? '#c49370' : '#d7bb8a', 0, 0.02, 0, [0, 0, i * 0.7]);
  }

  // Stop 6 (Winter New Year finale, x = 66): Finale train covers [62.34, 66.76].
  fir(TRACK_LENGTH - 5.6, 3.6, true, true);
  snowman(TRACK_LENGTH + 2.0, false);
  cabin(TRACK_LENGTH + 4.0, true);
  fir(TRACK_LENGTH + 6.4, 3.1, true, true);

  // All firs share one buffer and one material, so the eight trees cost one draw call.
  const firSheet = firs.build();
  if (firSheet) {
    const mesh = new THREE.Mesh(firSheet, paperSheet());
    mesh.name = 'folded-paper-firs';
    group.add(mesh);
  }

  // Every static shape of the ported details lands in one buffer as well.
  const sheet = sheets.build();
  if (sheet) {
    const mesh = new THREE.Mesh(sheet, paperSheet());
    mesh.name = 'folded-paper-details';
    group.add(mesh);
  }

  return { group, parts, objects };
}
