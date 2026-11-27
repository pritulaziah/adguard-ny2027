import * as THREE from 'three';
import type { PartMotion } from './part-motion';
import { SEASON_BORDERS } from './seasons';

const LEG_DURATION = 3.6;

function noise(index: number, seed: number): number {
  const value = Math.sin(index * 127.1 + seed * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function perch(index: number, seed: number, target: THREE.Vector3): void {
  target.set(
    (noise(index, seed + 1) - 0.5) * 1.6,
    (noise(index, seed + 2) - 0.35) * 0.42,
    (noise(index, seed + 3) - 0.5) * 0.24,
  );
}

const previous = new THREE.Vector3();
const start = new THREE.Vector3();
const end = new THREE.Vector3();

/** Independent hovering positions joined by calm glides with a turn before takeoff. */
export const dragonfly: PartMotion = (part, frame) => {
  const mesh = part.mesh;
  const visible = frame.distance >= SEASON_BORDERS.summer && frame.distance < SEASON_BORDERS.autumn;
  mesh.visible = visible;
  const fade = Math.min(
    THREE.MathUtils.smoothstep(frame.distance, SEASON_BORDERS.summer, SEASON_BORDERS.summer + 1.2),
    1 - THREE.MathUtils.smoothstep(frame.distance, SEASON_BORDERS.autumn - 1.2, SEASON_BORDERS.autumn),
  );
  mesh.scale.copy(part.scale).multiplyScalar(fade);
  if (!visible || frame.reduced) {
    mesh.position.copy(part.position);
    mesh.rotation.copy(part.rotation);
    return;
  }

  const t = frame.time + part.phase;
  const leg = Math.floor(t / LEG_DURATION);
  const local = t - leg * LEG_DURATION;
  const departure = 1.6 + noise(leg, part.phase + 4) * 1.1;
  const duration = 0.45 + noise(leg, part.phase + 5) * 0.25;
  perch(leg - 1, part.phase, previous);
  perch(leg, part.phase, start);
  perch(leg + 1, part.phase, end);
  const progress = THREE.MathUtils.smootherstep(local, departure, departure + duration);
  mesh.position.copy(start).lerp(end, progress).add(part.position);
  const hovering = 1 - Math.sin(progress * Math.PI);
  mesh.position.y += Math.sin(t * 6.2) * 0.01 * hovering;

  const turn = THREE.MathUtils.smootherstep(local, departure - 0.28, departure);
  const oldYaw = start.x >= previous.x ? 0 : Math.PI;
  const newYaw = end.x >= start.x ? 0 : Math.PI;
  const oldPitch = Math.atan2(start.y - previous.y, Math.abs(start.x - previous.x));
  const newPitch = Math.atan2(end.y - start.y, Math.abs(end.x - start.x));
  mesh.rotation.y = THREE.MathUtils.lerp(oldYaw, newYaw, turn);
  mesh.rotation.z = THREE.MathUtils.lerp(oldPitch, newPitch, turn);
};

export const dragonflyWing: PartMotion = (part, frame) => {
  const side = (part.mesh.userData.wingSide as number) ?? 1;
  const pair = (part.mesh.userData.wingPair as number) ?? 1;
  if (frame.reduced) {
    part.mesh.rotation.copy(part.rotation);
    return;
  }
  const fore = pair > 0;
  const beat = Math.sin(frame.time * Math.PI * 18 + part.phase + pair * 0.85);
  part.mesh.rotation.z = part.rotation.z + beat * (fore ? 0.24 : 0.2);
  part.mesh.rotation.y = part.rotation.y + side * (fore ? 0.21 + beat * 0.07 : 0.07 + beat * 0.05);
};
