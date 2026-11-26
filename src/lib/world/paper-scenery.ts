import * as THREE from 'three';
import type { Interaction } from '../content/i18n';
import { TRACK_LENGTH, stopX, STORY_END } from './route';
import { oval } from './paper-shapes';
import { paperSheet, seasonalPaperMaterial, type ScalarUniform } from './paper-materials';
import { PaperBatch, PaperDetail, cutGeometry, ovalGeometry, rectGeometry, starGeometry, paint, type Placement } from './paper-brush';
import { carded } from './paper-mesh';
import { GROUND_RAMP, SEASON_BORDERS } from './seasons';
import { addBird, addBunny, addCat, addDeer, addBeaver, addFox, addHedgehog, addOwl, addPondWithFrog, addSnowman, addSquirrel, type AnimalBuilderContext } from './animals';
import { addForegroundFraming, addPanoramaRidges, addSkyDetails } from './paper-backdrop';
import { addSummerRiver, addRiverDuck } from './paper-river';
import { createYieldPacer } from './schedule';
import { isAnimated, motionFor, type PaperPart } from './part-motion';

export type { PaperPart } from './part-motion';

export interface PaperSet {
  group: THREE.Group;
  /** Every registered part, including anchors that do not move. */
  parts: PaperPart[];
  /** Parts that need a motion call on each frame. */
  animated: PaperPart[];
  objects: Map<Interaction, THREE.Object3D>;
}

const colors = { cream: '#f4ead5', snow: '#eeeae0', wood: '#967665', ink: '#4d5551', green: '#759486', gold: '#e4c07c' };

function shapeFrom(draw: (shape: THREE.Shape) => void): THREE.Shape {
  const shape = new THREE.Shape();
  draw(shape);
  return shape;
}

/** Deterministic PRNG so leaf drifts and flower beds stay stable across reloads. */
function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** Original paper scenery. Every shape is made here, directly along the route. */
export async function createPaperScenery(cameraX: ScalarUniform): Promise<PaperSet> {
  // Long stretches of shape building are split into frames, so the loading
  // screen keeps animating on slow devices.
  const pause = createYieldPacer();
  const group = new THREE.Group();
  group.name = 'adguard-paper-scenery';
  const parts: PaperPart[] = [];
  const animated: PaperPart[] = [];
  const objects = new Map<Interaction, THREE.Object3D>();
  const firs = new PaperBatch();
  const sheets = new PaperBatch();

  function detail(name: string, x: number, z = -1.1, scale = 1, y = 0.34): PaperDetail {
    return new PaperDetail(sheets, group, name, x, y, z, scale);
  }

  function place(name: string, x: number, z = -1.1, scale = 1, y = 0.34): THREE.Group {
    const object = new THREE.Group();
    object.name = name;
    object.position.set(x, y, z);
    object.scale.setScalar(scale);
    group.add(object);
    return object;
  }

  function animate(
    mesh: THREE.Object3D,
    kind: PaperPart['kind'],
    key?: Interaction,
    sparkLift?: number,
    sparkOffsetX?: number,
  ): void {
    mesh.updateWorldMatrix(true, false);
    const part: PaperPart = {
      mesh,
      kind,
      position: mesh.position.clone(),
      rotation: mesh.rotation.clone(),
      scale: mesh.scale.clone(),
      phase: parts.length * 0.73,
      worldX: mesh.matrixWorld.elements[12],
      key,
      sparkLift,
      sparkOffsetX,
      // The motion binds here, once. The frame loop never selects a case.
      apply: motionFor(kind),
    };
    parts.push(part);
    if (isAnimated(part)) animated.push(part);
    if (key && !objects.has(key)) {
      mesh.name = key;
      objects.set(key, mesh);
    }
  }

  function shieldOn(parent: PaperDetail, x: number, y: number, scale = 1): void {
    const badge = parent.child('shield', x, y, 0.15, scale);
    badge.cut([[0, 0.35], [0.29, 0.24], [0.25, -0.08], [0, -0.31], [-0.25, -0.08], [-0.29, 0.24]], colors.green);
    badge.stroke([[-0.13, 0.03], [-0.025, -0.07], [0.15, 0.13]], colors.cream, 0.04);
  }

  function fir(x: number, height: number, snowy = false, festive = false, z = -2.05): void {
    const scale = height / 3;
    const at = (lx: number, ly: number, lz = 0): Placement => ({
      x: x + lx * scale,
      y: 0.34 + ly * scale,
      z: z + lz * scale,
      scale: [scale, scale, scale],
    });

    firs.add(rectGeometry(0.16, 0.88), colors.wood, at(0, -0.05, -0.06));
    for (let tier = 0; tier < 4; tier++) {
      const bottom = 0.38 + tier * 0.5;
      const width = 1.7 - tier * 0.33;
      firs.add(
        cutGeometry([[-width / 2, bottom], [0, bottom + 1.18], [width / 2, bottom], [0.02, bottom + 0.14]]),
        tier % 2 ? '#7b9888' : '#658376',
        at(0, 0, tier * 0.035),
      );
      firs.add(
        cutGeometry([[0, bottom + 1.18], [width / 2, bottom], [0.02, bottom + 0.14]]),
        '#567469',
        at(0, 0, tier * 0.035 + 0.048),
      );
      if (snowy) {
        firs.add(
          cutGeometry([
            [-width * 0.35, bottom + 0.26],
            [0, bottom + 1.18],
            [width * 0.26, bottom + 0.36],
            [0.08, bottom + 0.5],
            [-0.04, bottom + 0.34],
          ]),
          colors.snow,
          at(0, 0, tier * 0.035 + 0.07),
        );
      }
      if (festive && tier < 3) {
        firs.add(ovalGeometry(0.14, 0.16), tier % 2 ? '#cf8572' : colors.gold, at(-0.18 + tier * 0.14, bottom + 0.28, 0.22));
        firs.add(ovalGeometry(0.12, 0.14), tier % 2 ? colors.gold : '#cf8572', at(0.24 - tier * 0.09, bottom + 0.44, 0.22));
      }
    }
    if (festive) firs.add(starGeometry(0.24), colors.gold, at(0, 3.12, 0.2));
  }

  function cabin(x: number, final = false): void {
    const house = detail('paper-cabin', x, -1.85);
    house.cut([[-0.98, 0], [0.98, 0], [0.98, 1.44], [0, 2.2], [-0.98, 1.44]], '#b18d79');
    house.cut([[0.98, 0], [1.46, 0.2], [1.46, 1.59], [0.98, 1.44]], '#8e7060', 0, 0, -0.01);
    house.cut([[-0.02, 2.38], [0.46, 2.55], [1.66, 1.61], [1.18, 1.42]], '#d7d4c8', 0, 0, 0.02);
    // Cozy stone base grounding the cabin on snow.
    house.rect(1.98, 0.16, '#87837c', 0, 0, 0.055, undefined, 0.03);
    for (let i = 0; i < 6; i++) house.stroke([[-0.96, 0.22 + i * 0.21], [0.96, 0.22 + i * 0.21]], '#987361', 0.024, 0.06);
    house.cut([[-1.18, 1.4], [-0.02, 2.38], [1.19, 1.42], [0.87, 1.44], [-0.02, 2.1], [-0.86, 1.4]], '#8a7165', 0, 0, 0.1);
    house.cut([[-1.17, 1.52], [-0.02, 2.42], [1.16, 1.52], [0.84, 1.59], [0.46, 1.82], [0.14, 2.06], [-0.1, 2.1], [-0.7, 1.65]], colors.snow, 0, 0, 0.16);
    house.rect(0.46, 0.94, '#6f8377', 0.26, 0.06, 0.08);
    house.oval(0.055, 0.055, colors.gold, 0.39, 0.48, 0.15);
    house.rect(0.58, 0.58, '#705f53', -0.47, 0.6, 0.08);
    house.rect(0.46, 0.46, '#f4d69d', -0.47, 0.66, 0.14);
    house.stroke([[-0.47, 0.66], [-0.47, 1.12]], '#a08463', 0.034, 0.2);
    house.stroke([[-0.7, 0.89], [-0.24, 0.89]], '#a08463', 0.034, 0.2);
    house.rect(0.25, 0.65, '#9d8170', 0.52, 1.94, -0.12);
    for (let i = 0; i < 3; i++) {
      const puff = oval(house.group, 0.24 + i * 0.07, 0.14 + i * 0.02, '#e2e2da', 0.51 - i * 0.11, 2.7 + i * 0.18, -0.2);
      animate(puff, 'float');
    }
    shieldOn(house, 0, 1.6, 0.65);
    if (final) {
      for (let i = 0; i < 5; i++) house.star(0.09, colors.gold, -0.84 + i * 0.42, 1.33, 0.24);
    }
  }

  type TreeVariant = 'spring-green' | 'spring-blossom' | 'autumn-maple' | 'autumn-birch' | 'autumn-oak';

  /** Organic multi-layered broadleaf tree with tapered bark trunk nested between foliage planes. */
  function broadTree(x: number, variant: TreeVariant, scale = 1.0, z = -2.1): void {
    const tree = detail(`layered-paper-tree-${variant}`, x, z, scale);

    const palettes: Record<TreeVariant, { bark: string; barkMark?: string; back: string; mid: string; front: string; accent?: string }> = {
      'spring-green': { bark: '#896c59', back: '#729273', mid: '#8aa881', front: '#a3bc91' },
      'spring-blossom': { bark: '#856758', back: '#c98e8b', mid: '#e2ada6', front: '#f2cec6', accent: '#9bb388' },
      'autumn-maple': { bark: '#7d6050', back: '#9e5144', mid: '#c66849', front: '#df9451', accent: '#ebbc67' },
      'autumn-birch': { bark: '#dfd5c3', barkMark: '#7d7367', back: '#c5954d', mid: '#dbb15c', front: '#ebd07b' },
      'autumn-oak': { bark: '#785d4d', back: '#985c43', mid: '#bc754b', front: '#d79b59', accent: '#c96249' },
    };
    const p = palettes[variant];

    // Back canopy silhouette (deepest layer, gives fullness behind the trunk and branches).
    const backClusters: Array<[number, number, number, number]> = [
      [-0.78, 2.15, 1.05, 0.96],
      [0.74, 2.18, 1.08, 0.98],
      [-0.35, 2.75, 1.15, 1.02],
      [0.42, 2.72, 1.1, 0.96],
      [0.02, 3.05, 1.02, 0.88],
    ];
    for (let i = 0; i < backClusters.length; i++) {
      const [cx, cy, cw, ch] = backClusters[i];
      tree.oval(cw, ch, p.back, cx, cy, -0.16 + i * 0.008, undefined, 0.036);
    }

    // Tapered organic trunk with gentle root flare and forked upper branches.
    const trunk = shapeFrom(s => {
      s.moveTo(-0.24, 0);
      s.quadraticCurveTo(-0.14, 0.35, -0.11, 1.38);
      s.lineTo(-0.56, 2.15);
      s.lineTo(-0.43, 2.22);
      s.lineTo(-0.04, 1.66);
      s.lineTo(0.05, 2.36);
      s.lineTo(0.16, 2.34);
      s.lineTo(0.11, 1.72);
      s.lineTo(0.54, 2.14);
      s.lineTo(0.62, 2.03);
      s.lineTo(0.12, 1.44);
      s.quadraticCurveTo(0.14, 0.38, 0.25, 0);
      s.closePath();
    });
    tree.shape(trunk, p.bark, 0, 0, -0.04, undefined, 0.044);

    if (p.barkMark) {
      // Horizontal paper dashes on birch trunks.
      for (const [bx, by, bw] of [[-0.06, 0.32, 0.14], [0.05, 0.62, 0.12], [-0.04, 0.94, 0.13], [0.04, 1.26, 0.11]]) {
        tree.rect(bw, 0.028, p.barkMark, bx, by, 0.012, undefined, 0.012);
      }
    }

    // Mid canopy layer wrapping gently over the branch tips.
    const midClusters: Array<[number, number, number, number]> = [
      [-0.64, 2.38, 1.02, 0.9],
      [0.64, 2.34, 0.98, 0.88],
      [-0.08, 2.66, 1.18, 1.04],
      [0.24, 2.2, 0.96, 0.84],
      [-0.36, 2.04, 0.88, 0.78],
    ];
    for (let i = 0; i < midClusters.length; i++) {
      const [cx, cy, cw, ch] = midClusters[i];
      tree.oval(cw, ch, p.mid, cx, cy, 0.02 + i * 0.008, undefined, 0.036);
    }

    // Front sunlit foliage puffs for crisp folded-paper depth.
    const frontClusters: Array<[number, number, number, number]> = [
      [-0.42, 2.58, 0.78, 0.68],
      [0.38, 2.64, 0.82, 0.7],
      [0.02, 2.32, 0.76, 0.66],
    ];
    for (let i = 0; i < frontClusters.length; i++) {
      const [cx, cy, cw, ch] = frontClusters[i];
      tree.oval(cw, ch, p.front, cx, cy, 0.085 + i * 0.008, undefined, 0.03);
    }

    // Spring blossom accents perched along the canopy edge.
    if (variant === 'spring-blossom') {
      const blooms: Array<[number, number]> = [[-0.68, 2.24], [0.06, 2.9], [0.62, 2.32], [-0.2, 2.08]];
      for (let b = 0; b < blooms.length; b++) {
        const [bx, by] = blooms[b];
        for (let pt = 0; pt < 5; pt++) {
          const a = (pt / 5) * Math.PI * 2 + b * 0.3;
          tree.oval(0.065, 0.085, '#fceee8', bx + Math.cos(a) * 0.055, by + Math.sin(a) * 0.055, 0.13, [0, 0, a], 0.014);
        }
        tree.oval(0.048, 0.048, '#e8c477', bx, by, 0.146, undefined, 0.012);
      }
    }
  }

  /** Natural clustered spring wildflowers (daisies, tulips, and grass blades). */
  function springMeadowCluster(x: number, z: number, seedVal: number): void {
    const rng = seeded(seedVal);
    const cluster = detail('spring-meadow-cluster', x, z);
    const palette = ['#f3ded2', '#e7b9b2', '#efd69d', '#d3c2dc', '#f6efe0'];

    // Soft grass tufts grounding the cluster.
    for (let g = 0; g < 4; g++) {
      const gx = (rng() - 0.5) * 0.55;
      const gh = 0.2 + rng() * 0.16;
      const lean = (rng() - 0.5) * 0.12;
      cluster.cut([[gx - 0.02, 0], [gx + lean, gh], [gx + 0.02, 0]], g % 2 ? '#84a374' : '#739468', 0, 0, -0.02 + g * 0.006, undefined, 0.016);
    }

    const stems = 2 + Math.floor(rng() * 2);
    for (let i = 0; i < stems; i++) {
      const fx = (rng() - 0.5) * 0.48;
      const fh = 0.24 + rng() * 0.24;
      const col = palette[Math.floor(rng() * palette.length)];
      const fz = 0.01 + i * 0.032;
      cluster.rect(0.022, fh, '#6f9066', fx, 0, fz, undefined, 0.016);
      cluster.oval(0.09, 0.045, '#89a778', fx - 0.045, fh * 0.38, fz + 0.01, [0, 0, 0.55], 0.014);
      if (i % 2 === 0) {
        // Layered 5-petal daisy blossom.
        for (let p = 0; p < 5; p++) {
          const a = (p / 5) * Math.PI * 2;
          cluster.oval(0.075, 0.11, col, fx + Math.cos(a) * 0.06, fh + Math.sin(a) * 0.06, fz + 0.016, [0, 0, a - Math.PI / 2], 0.014);
        }
        cluster.oval(0.065, 0.065, colors.gold, fx, fh, fz + 0.032, undefined, 0.014);
      } else {
        // Cupped paper tulip bud.
        const tulip = shapeFrom(s => {
          s.moveTo(0, -0.02);
          s.bezierCurveTo(-0.1, 0.02, -0.09, 0.14, -0.05, 0.18);
          s.lineTo(0, 0.13);
          s.lineTo(0.05, 0.18);
          s.bezierCurveTo(0.09, 0.14, 0.1, 0.02, 0, -0.02);
          s.closePath();
        });
        cluster.shape(tulip, col, fx, fh - 0.03, fz + 0.018, undefined, 0.018);
      }
    }
  }

  function createTransferStations(): void {
    // 1. Winter Rails -> Spring Garden Path
    const winterSpring = detail('transfer-winter-spring', SEASON_BORDERS.spring, -0.62);
    winterSpring.rect(0.11, 1.35, colors.wood);
    winterSpring.cut([[-0.65, 0.92], [0.05, 0.92], [0.22, 1.07], [0.05, 1.22], [-0.65, 1.22]], colors.snow, 0, 0, 0.06);
    winterSpring.cut([[-0.08, 0.64], [0.64, 0.64], [0.8, 0.79], [0.64, 0.94], [-0.08, 0.94]], '#9ab288', 0, 0, 0.09);
    const buffer = detail('rail-buffer-spring', SEASON_BORDERS.spring - 0.18, 0);
    buffer.rect(0.12, 0.42, '#8b7361', 0, -0.02, 0.06);
    buffer.rect(0.28, 0.12, '#c88c79', 0, 0.28, 0.1);

    // 2. Spring Garden Path -> River Landing
    const pierLeft = detail('transfer-spring-summer', SEASON_BORDERS.summer, -0.04);
    pierLeft.box(0.95, 0.09, 0.92, '#b69374', -0.18, 0.05, 0);
    for (const px of [-0.52, 0.18]) {
      pierLeft.rect(0.12, 0.48, '#8d7059', px, -0.04, -0.44);
      pierLeft.oval(0.14, 0.07, '#dfd1b4', px, 0.46, -0.4);
    }

    // 3. Summer River -> Autumn Road Landing Pier
    const pierRight = detail('transfer-summer-autumn', SEASON_BORDERS.autumn, -0.04);
    pierRight.box(0.95, 0.09, 0.92, '#b69374', 0.18, 0.05, 0);
    for (const px of [-0.18, 0.52]) {
      pierRight.rect(0.12, 0.48, '#8d7059', px, -0.04, -0.44);
      pierRight.oval(0.14, 0.07, '#dfd1b4', px, 0.46, -0.4);
    }
    const milestone = detail('autumn-milestone', SEASON_BORDERS.autumn + 0.55, -0.62);
    milestone.cut([[-0.22, 0], [0.22, 0], [0.2, 0.56], [0, 0.72], [-0.2, 0.56]], '#d5c6ab', 0, 0, 0);
    milestone.oval(0.16, 0.16, '#c28567', 0, 0.42, 0.06);

    // 4. Autumn Road -> Winter Finale Halt
    const halt = detail('transfer-autumn-winter', SEASON_BORDERS.winterEnd + 0.1, -0.62);
    halt.rect(0.1, 1.55, '#7f7265', 0, 0);
    halt.rect(0.52, 0.08, '#7f7265', 0.22, 1.45, 0.02);
    halt.oval(0.22, 0.26, '#f6dfa4', 0.42, 1.28, 0.06);
    halt.cut([[0.28, 1.42], [0.42, 1.54], [0.56, 1.42]], '#6d8279', 0, 0, 0.09);
  }

  function createTravelSurfaces(): void {
    // Winter paper railways: start and finale.
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

    // Spring garden path.
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

    // Calm river current.
    const summerLen = SEASON_BORDERS.autumn - SEASON_BORDERS.summer;
    const summerCenter = (SEASON_BORDERS.summer + SEASON_BORDERS.autumn) / 2;
    const sea = detail('paper-river', summerCenter, 0, 1, 0);
    sea.box(summerLen + 0.1, 0.06, 1.44, '#7eaaa0', 0, 0.29, -0.08);

    const waveSpecs: Array<{ z: number; y: number; color: string; amp: number; freq: number }> = [
      { z: -0.5, y: 0.31, color: '#70988d', amp: 0.13, freq: 1.45 },
      { z: -0.08, y: 0.31, color: '#8bb4a6', amp: 0.14, freq: 1.75 },
      { z: 0.35, y: 0.3, color: '#abc9b4', amp: 0.12, freq: 2.0 },
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

    // Autumn country road.
    const autumnLen = SEASON_BORDERS.winterEnd - SEASON_BORDERS.autumn;
    const autumnCenter = (SEASON_BORDERS.autumn + SEASON_BORDERS.winterEnd) / 2;
    const road = detail('paper-road', autumnCenter, 0, 1, 0);
    road.box(autumnLen, 0.055, 0.78, '#968b7e', 0, 0.295, 0);

    for (const zCurb of [-0.41, 0.41]) road.box(autumnLen, 0.065, 0.07, '#b99770', 0, 0.3, zCurb);

    for (let x = SEASON_BORDERS.autumn + 0.75; x < SEASON_BORDERS.winterEnd - 0.6; x += 1.35) {
      road.box(0.58, 0.012, 0.055, '#eee2c8', x - autumnCenter, 0.326, 0);
    }
  }

  // Seamless panoramic ground extending back behind the near ridge (-3.35 .. +12.65).
  const ground = new THREE.Mesh(
    new THREE.BoxGeometry(TRACK_LENGTH + 90, 0.18, 16),
    seasonalPaperMaterial(GROUND_RAMP),
  );
  ground.name = 'seasonal-paper-ground';
  ground.position.set(TRACK_LENGTH / 2, 0.17, 4.65);
  group.add(ground);
  await pause();

  // Multi-plane parallax backdrop: distant peaks, far rolling hills, near ridge, sky details.
  await addPanoramaRidges({ group, cameraX }, pause);
  await pause();
  await addSkyDetails(group, pause, gull => animate(gull, 'gull'));
  await pause();

  createTravelSurfaces();
  await pause();
  createTransferStations();
  await pause();

  const animalCtx: AnimalBuilderContext = { detail, place, animate };

  // Stop 0 (Winter start, x = 0.00): train clamp -10 .. 16.85; deer at +2.05.
  fir(-5.2, 3.7, true, false, -2.1);
  fir(-3.6, 2.7, true, false, -2.35);
  await pause();
  addDeer(animalCtx, 2.05, -1.08);
  await pause();
  fir(7.3, 3.0, true, false, -2.15);
  fir(9.1, 3.5, true, false, -1.98);
  await pause();

  // Stop 1 (iOS v4.5.15, winter, x = 12.65): train clamp -10 .. 16.85; snowman at +2.35.
  fir(stopX(1) - 4.4, 3.1, true, false, -2.2);
  addSnowman(animalCtx, stopX(1) + 2.35, true, -1.04);
  fir(stopX(1) + 4.45, 3.5, true, false, -2.0);
  fir(stopX(1) + 5.7, 2.6, true, false, -2.32);
  await pause();

  // Stop 2 (AdGuard on Meta Quest, spring, x = 25.30): bicycle clamp 20.8 .. 41.95.
  broadTree(stopX(2) - 5.9, 'spring-green', 0.88, -2.35);
  broadTree(stopX(2) - 4.55, 'spring-blossom', 1.08, -2.08);
  addFox(animalCtx, stopX(2) - 2.75, -1.02);
  addHedgehog(animalCtx, stopX(2) + 2.85, -1.02);
  broadTree(stopX(2) + 3.5, 'spring-green', 0.96, -2.68);
  await pause();

  // Stop 3 (Browser Extension v5.4, spring, x = 37.95): bicycle clamp 20.8 .. 41.95.
  broadTree(stopX(3) - 6.35, 'spring-blossom', 0.94, -2.16);
  broadTree(stopX(3) - 4.15, 'spring-green', 0.9, -3.03);
  broadTree(stopX(3) - 1.95, 'spring-blossom', 0.78, -2.65);
  addBird(animalCtx, stopX(3) - 2.9, -1.45);
  addPondWithFrog(animalCtx, stopX(3) + 3.05, -1.04);
  await pause();
  const meadowSpots: Array<[number, number]> = [
    [-5.3, -0.78], [-3.8, -1.3], [-1.4, -0.75], [-0.4, -1.45],
    [0.75, -0.82], [5.15, -0.85], [5.95, -1.35],
  ];
  meadowSpots.forEach(([dx, dz], idx) =>
    springMeadowCluster((dx < 0 ? stopX(2) : stopX(3)) + dx, dz, 202604 + idx * 17),
  );
  await pause();

  // Stop 4 (AdGuard for Windows v8.0, summer, x = 50.60): punt clamp 46.3 .. 54.9; forest river banks.
  addSummerRiver(animalCtx);
  addRiverDuck(animalCtx, stopX(4) - 2.85);
  addBeaver(animalCtx, stopX(4) + 3.05);
  await pause();

  // Stop 5 (AdGuard Mini for Android v3.0, autumn, x = 63.25): car clamp 58.95 .. 79.5; lantern at +1.95.
  broadTree(stopX(5) - 6.55, 'autumn-birch', 0.92, -2.95);
  broadTree(stopX(5) - 5.55, 'autumn-maple', 1.12, -2.15);
  broadTree(stopX(5) - 4.4, 'autumn-oak', 0.82, -3.0);
  addBunny(animalCtx, stopX(5) - 2.85, -0.98);
  addSquirrel(animalCtx, stopX(5) + 2.85, -1.02);
  await pause();

  // Stop 6 (AdGuard Home 1.0, autumn, x = 75.90): car clamp 58.95 .. 79.5; cat and owl flank the story.
  addCat(animalCtx, stopX(6) - 2.85, -1.02);
  addOwl(animalCtx, stopX(6) + 2.85, -1.4);
  broadTree(stopX(6) + 3.9, 'autumn-birch', 0.88, -3.05);
  broadTree(stopX(6) + 4.6, 'autumn-maple', 1.06, -2.12);
  broadTree(stopX(6) + 5.8, 'autumn-oak', 0.88, -2.84);
  await pause();

  // Stop 7 (Finale, x = 88.55): finale train clamp 86.2 .. 102.55; the road runs on past the story.
  fir(STORY_END - 5.9, 3.7, true, true, -2.05);
  fir(STORY_END - 4.4, 2.5, true, false, -2.35);
  addSnowman(animalCtx, STORY_END + 2.15, false, -1.04);
  cabin(STORY_END + 4.45, true);
  fir(STORY_END + 7.4, 3.2, true, true, -2.1);
  fir(STORY_END + 10.1, 3.6, true, true, -2.0);
  await pause();

  // Close foreground framing elements (bottom-edge foliage and snowbanks).
  await addForegroundFraming(group, sheets, pause);
  await pause();

  // All firs share one buffer and one material, so every fir costs one draw call.
  const firSheet = firs.build();
  if (firSheet) {
    const mesh = new THREE.Mesh(firSheet, paperSheet());
    mesh.name = 'folded-paper-firs';
    group.add(mesh);
  }

  // Every static detail shape merges into one buffer as well.
  const sheet = sheets.build();
  if (sheet) {
    const mesh = new THREE.Mesh(sheet, paperSheet());
    mesh.name = 'folded-paper-details';
    group.add(mesh);
  }

  return { group, parts, animated, objects };
}


