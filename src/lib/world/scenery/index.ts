import * as THREE from 'three';
import type { Interaction } from '../../content/i18n';
import { STORY_END, TRACK_LENGTH, stopX } from '../route';
import { paperSheet, seasonalPaperMaterial } from '../paper-materials';
import { PaperDetail } from '../paper-detail';
import { GROUND_RAMP } from '../seasons';
import {
  addBeehive,
  addBird,
  addBunny,
  addCat,
  addCow,
  addDeer,
  addFox,
  addHedgehog,
  addOwl,
  addPondWithFrog,
  addSnowman,
  addSquirrel,
} from '../animals';
import { createYieldPacer } from '../schedule';
import { isAnimated, motionFor, type PaperPart } from '../part-motion';
import type { SceneryContext } from '../scene-context';
import { addAutumnUndergrowth } from './autumn';
import { addBroadTree } from './broad-tree';
import { addFinaleTree } from './finale-tree';
import { addFir } from './fir';
import { addForegroundFraming } from './foreground';
import { addSpringMeadowCluster } from './meadow';
import { addFinaleMascots } from './mascots';
import { mergeStaticChildren, pruneEmptyGroups } from './merge-static';
import { addDistantRidgeTrees } from './ridge-trees';
import { addPanoramaRidges } from './ridges';
import { addSkyDetails } from './sky';
import { addSummerMeadow } from './summer';
import { addTransferStations } from './transfers';
import { addTravelSurfaces } from './surfaces';

export type { PaperPart } from '../part-motion';

export interface PaperSet {
  group: THREE.Group;
  /** Every registered part, including anchors that do not move. */
  parts: PaperPart[];
  /** Parts that need a motion call on each frame. */
  animated: PaperPart[];
  objects: Map<Interaction, THREE.Object3D>;
}

/** Original paper scenery. Each object module adds its own shapes along the route. */
export async function createPaperScenery(cameraX: SceneryContext['cameraX']): Promise<PaperSet> {
  // Long stretches of shape building are split into frames, so the loading
  // screen keeps animating on slow devices.
  const pause = createYieldPacer();
  const group = new THREE.Group();
  group.name = 'adguard-paper-scenery';
  const parts: PaperPart[] = [];
  const animated: PaperPart[] = [];
  const objects = new Map<Interaction, THREE.Object3D>();
  const details: PaperDetail[] = [];

  function detail(name: string, x: number, z = -1.1, scale = 1, y = 0.34): PaperDetail {
    const object = new PaperDetail(group, name, x, y, z, scale);
    details.push(object);
    return object;
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
      span: typeof mesh.userData.motionSpan === 'number' ? mesh.userData.motionSpan : undefined,
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

  const ctx: SceneryContext = { group, cameraX, detail, place, animate };

  // Seamless panoramic ground extending back behind the near ridge (-3.35 .. +12.65).
  const ground = new THREE.Mesh(new THREE.BoxGeometry(TRACK_LENGTH + 90, 0.18, 16), seasonalPaperMaterial(GROUND_RAMP));
  ground.name = 'seasonal-paper-ground';
  ground.position.set(TRACK_LENGTH / 2, 0.17, 4.65);
  group.add(ground);
  await pause();

  // Multi-plane parallax backdrop: distant peaks, far rolling hills, near ridge, sky details.
  await addPanoramaRidges(ctx, pause);
  await addDistantRidgeTrees(ctx, pause);
  await pause();
  await addSkyDetails(ctx, pause);
  await pause();

  addTravelSurfaces(ctx);
  await pause();
  addTransferStations(ctx);
  await pause();

  // Stop 0 (Winter start, x = 0.00): deer at +2.05.
  addFir(ctx, -5.2, 3.7, true, false, -2.1);
  addFir(ctx, -3.6, 2.7, true, false, -2.35);
  await pause();
  addDeer(ctx, 2.05, -1.08);
  await pause();
  addFir(ctx, 7.3, 3.0, true, false, -2.15);
  addFir(ctx, 9.1, 3.5, true, false, -1.98);
  await pause();

  // Stop 1 (iOS v4.5.15, winter, x = 12.65): snowman at +2.35.
  addFir(ctx, stopX(1) - 4.4, 3.1, true, false, -2.2);
  addSnowman(ctx, stopX(1) + 2.35, true, -1.04);
  addFir(ctx, stopX(1) + 4.45, 3.5, true, false, -2.0);
  addFir(ctx, stopX(1) + 5.7, 2.6, true, false, -2.32);
  await pause();

  // Stop 2 (AdGuard on Meta Quest, spring, x = 25.30): cool blooming spring orchard.
  addBroadTree(ctx, stopX(2) - 5.9, 'spring-blossom', 0.9, -2.35);
  addBroadTree(ctx, stopX(2) - 4.55, 'spring-blossom', 1.08, -2.08);
  addFox(ctx, stopX(2) - 2.75, -1.02);
  addHedgehog(ctx, stopX(2) + 2.85, -1.02);
  addBroadTree(ctx, stopX(2) + 3.5, 'spring-green', 0.96, -2.68);
  addBroadTree(ctx, stopX(2) + 4.85, 'spring-blossom', 0.88, -2.2);
  await pause();

  // Stop 3 (Browser Extension v5.4, spring, x = 37.95): blossoms and pond with frog.
  addBroadTree(ctx, stopX(3) - 6.35, 'spring-blossom', 0.96, -2.16);
  addBroadTree(ctx, stopX(3) - 4.15, 'spring-green', 0.9, -3.03);
  addBroadTree(ctx, stopX(3) - 1.95, 'spring-blossom', 0.82, -2.65);
  addBird(ctx, stopX(3) - 2.9, -1.45);
  addPondWithFrog(ctx, stopX(3) + 3.05, -1.04);
  await pause();
  const meadowSpots: Array<[number, number]> = [
    [-5.3, -0.78],
    [-3.8, -1.3],
    [-1.4, -0.75],
    [-0.4, -1.45],
    [0.75, -0.82],
    [5.15, -0.85],
    [5.95, -1.35],
  ];
  meadowSpots.forEach(([dx, dz], idx) =>
    addSpringMeadowCluster(ctx, (dx < 0 ? stopX(2) : stopX(3)) + dx, dz, 202604 + idx * 17),
  );
  await pause();

  // Stop 4 (AdGuard for Windows v8.0, summer, x = 52.10): sunlit countryside meadow with distant river.
  addSummerMeadow(ctx);
  addCow(ctx, stopX(4) - 2.9, -1.04);
  addBeehive(ctx, stopX(4) + 2.95, -1.04);
  await pause();

  // Stop 5 (AdGuard Mini for Android v3.0, autumn): bunny and squirrel flank the story.
  addBroadTree(ctx, stopX(5) - 6.55, 'autumn-birch', 0.92, -2.95);
  addBroadTree(ctx, stopX(5) - 5.55, 'autumn-maple', 1.12, -2.15);
  addBroadTree(ctx, stopX(5) - 4.4, 'autumn-oak', 0.82, -3.0);
  addBunny(ctx, stopX(5) - 2.85, -0.98);
  addSquirrel(ctx, stopX(5) + 2.85, -1.02);
  await pause();

  // Stop 6 (AdGuard Home 1.0, autumn): cat and owl flank the story.
  addCat(ctx, stopX(6) - 2.85, -1.02);
  addOwl(ctx, stopX(6) + 2.85, -1.4);
  addBroadTree(ctx, stopX(6) + 3.9, 'autumn-birch', 0.88, -3.05);
  addBroadTree(ctx, stopX(6) + 4.6, 'autumn-maple', 1.06, -2.12);
  addBroadTree(ctx, stopX(6) + 5.8, 'autumn-oak', 0.88, -2.84);
  await pause();
  addAutumnUndergrowth(ctx);
  await pause();

  // The retro van passes one decorated tree and the three gift-givers.
  addFir(ctx, STORY_END - 5.9, 3.3, true, false, -2.05);
  addFir(ctx, STORY_END - 4.4, 2.5, true, false, -2.35);
  addFinaleTree(ctx);
  await addFinaleMascots(ctx);
  addFir(ctx, STORY_END + 10.4, 3.2, true, false, -2.1);
  addFir(ctx, STORY_END + 13.1, 2.6, true, false, -2.0);
  await pause();

  // Close foreground framing elements (bottom-edge foliage and snowbanks).
  await addForegroundFraming(ctx, pause);
  await pause();

  // Give every detail its own mesh, then merge its static children into it.
  for (const object of details) {
    const geometry = object.buildGeometry();
    if (!geometry) continue;
    const mesh = new THREE.Mesh(geometry, paperSheet());
    mesh.name = `${object.group.name}-mesh`;
    object.group.add(mesh);
  }

  const keep = new Set(parts.map(part => part.mesh));
  for (const object of details) mergeStaticChildren(object.group, keep);
  for (const part of parts) {
    if (part.mesh.children.length > 0) mergeStaticChildren(part.mesh, keep, false);
  }
  pruneEmptyGroups(group, keep);

  return { group, parts, animated, objects };
}
