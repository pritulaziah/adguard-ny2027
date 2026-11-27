import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { lanternMaterials } from '../paper-materials';
import { SEASON_BORDERS } from '../seasons';
import type { SceneryContext } from '../scene-context';
import { addTransferLantern, type TransferVariant } from './transfer-lantern';

/** Every lantern hangs at the same height inside its own detail frame. */
const LANTERN_Y = 1.31;
const LANTERN_Z = -1.12;
const LANTERN_SCALE = 0.88;
const LANTERN_BASE_Y = 0.34;
/** Distance from the post to the middle of the lantern. */
const HOOK_REACH = 0.335;

interface Station {
  variant: TransferVariant;
  x: number;
  /** Mirror of the hook: neighbours point away from each other. */
  dir: 1 | -1;
}

const stations: Station[] = [
  { variant: 'winter-spring', x: SEASON_BORDERS.spring, dir: 1 },
  { variant: 'spring-summer', x: SEASON_BORDERS.summer, dir: -1 },
  { variant: 'summer-autumn', x: SEASON_BORDERS.autumn, dir: 1 },
  { variant: 'autumn-winter', x: SEASON_BORDERS.winterEnd, dir: -1 },
];

/** One quad in world space, ready to merge into the shared glow mesh. */
function glowQuad(width: number, height: number, x: number, y: number, z: number, tilt = 0): THREE.BufferGeometry {
  const geometry = new THREE.PlaneGeometry(width, height);
  geometry.applyMatrix4(new THREE.Matrix4().makeRotationX(tilt).setPosition(x, y, z));
  return geometry;
}

/**
 * One additive mesh holds the halo and the ground pool of all four lanterns,
 * so the light costs a single draw call and never joins the paper batches.
 */
function addLanternGlow(ctx: SceneryContext): void {
  const quads: THREE.BufferGeometry[] = [];
  for (const { x, dir } of stations) {
    const lampX = x + dir * HOOK_REACH * LANTERN_SCALE;
    quads.push(glowQuad(0.58, 0.66, lampX, LANTERN_BASE_Y + LANTERN_Y * LANTERN_SCALE, LANTERN_Z + 0.14));
    quads.push(glowQuad(0.72, 0.32, lampX, 0.285, LANTERN_Z - 0.02, -Math.PI / 2));
  }
  const geometry = mergeGeometries(quads);
  for (const quad of quads) quad.dispose();
  if (!geometry) return;

  const light = lanternMaterials();
  light.lit.value = 0.1;
  light.body.dispose();
  const mesh = new THREE.Mesh(geometry, light.glow);
  mesh.name = 'transfer-lantern-glow';
  mesh.renderOrder = 3;
  ctx.group.add(mesh);
}

/** Four matching lanterns, each dressed for the seasons it separates. */
export function addTransferStations(ctx: SceneryContext): void {
  for (const { variant, x, dir } of stations) {
    addTransferLantern(ctx.detail(`transfer-${variant}`, x, LANTERN_Z, LANTERN_SCALE, LANTERN_BASE_Y), variant, dir);
  }
  addLanternGlow(ctx);
}
