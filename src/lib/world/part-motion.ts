import * as THREE from 'three';
import type { Interaction } from '../content/i18n';
import { distantBirds } from './birds';
import { dragonfly, dragonflyWing } from './dragonfly-motion';

/**
 * Every moving part names one motion. The registry below binds the motion to
 * the part at build time, so the frame loop calls a function and does not
 * compare kind strings for every part on every frame.
 */
export const PART_KINDS = [
  'still',
  'sway',
  'wing',
  'flutter',
  'fire',
  'float',
  'jump',
  'cat-blink',
  'cat-tail',
  'bunny-ear',
  'deer-ear',
  'crab-step',
  'crab-claw',
  'distant-birds',
  'dragonfly',
  'dragonfly-wing',
  'spin',
  'wave',
] as const;

export type PartKind = (typeof PART_KINDS)[number];

export interface PaperPart {
  mesh: THREE.Object3D;
  /** Rest transform, captured when the part is built. */
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  kind: PartKind;
  phase: number;
  /** World x at build time, used to skip parts far from the camera. */
  worldX: number;
  /** Optional override for the camera distance cull span. */
  span?: number;
  /** Scene time of the last click, if the part reacts to one. */
  startedAt?: number;
  key?: Interaction;
  sparkLift?: number;
  sparkOffsetX?: number;
  /** Bound motion. The loop calls it without a lookup or a branch. */
  apply: PartMotion;
}

/** Values that all parts share on one frame. The scene fills this object once. */
export interface MotionFrame {
  time: number;
  delta: number;
  reduced: boolean;
  distance: number;
  speed?: number;
}

export type PartMotion = (part: PaperPart, frame: MotionFrame) => void;

const WAKE_DURATION = 1.35;

function motionPulse(time: number, start: number, duration: number): number {
  const progress = THREE.MathUtils.clamp((time - start) / duration, 0, 1);
  return Math.sin(progress * Math.PI);
}

/** 1 right after a click, fading to 0 over a short wake-up window. */
function wakeBoost(part: PaperPart, frame: MotionFrame): number {
  if (part.startedAt === undefined) return 0;
  const elapsed = frame.time - part.startedAt;
  if (elapsed < 0 || elapsed > WAKE_DURATION) return 0;
  const fade = 1 - elapsed / WAKE_DURATION;
  return fade * fade;
}

/** Scene time since the last click, or the scene clock while the part sleeps. */
function activityTime(part: PaperPart, frame: MotionFrame): number {
  return part.startedAt === undefined ? frame.time : frame.time - part.startedAt;
}

const still: PartMotion = () => {};

const sway: PartMotion = (part, frame) => {
  const mesh = part.mesh;
  const boost = wakeBoost(part, frame);
  const t = frame.time + part.phase;
  mesh.rotation.z = part.rotation.z + Math.sin(t * 1.25) * 0.055 + Math.sin(t * 9.5) * 0.14 * boost;
  mesh.position.y = part.position.y + Math.abs(Math.sin(t * 7)) * 0.08 * boost;
};

const wing: PartMotion = (part, frame) => {
  const boost = wakeBoost(part, frame);
  const t = frame.time + part.phase;
  part.mesh.rotation.z = part.rotation.z + Math.sin(t * 3.1) * 0.11 + Math.sin(t * 10) * 0.24 * boost;
};

const flutter: PartMotion = (part, frame) => {
  const t = frame.time + part.phase;
  part.mesh.rotation.z = part.rotation.z + Math.sin(t * 4.2) * 0.18;
};

const fire: PartMotion = (part, frame) => {
  const boost = wakeBoost(part, frame);
  const t = frame.time + part.phase;
  const flicker = Math.sin(t * 7.5) * 0.05 + Math.sin(t * 13) * 0.03;
  part.mesh.scale.set(
    part.scale.x * (1 + flicker * 0.5 + boost * 0.12),
    part.scale.y * (1 + flicker + boost * 0.28),
    part.scale.z,
  );
};

const float: PartMotion = (part, frame) => {
  const boost = wakeBoost(part, frame);
  const t = frame.time + part.phase;
  part.mesh.position.y = part.position.y + Math.sin(t * 1.5) * 0.055 + Math.sin(t * 6) * 0.14 * boost;
  part.mesh.rotation.z = part.rotation.z + Math.sin(t * 1.1) * 0.035;
};

const jump: PartMotion = (part, frame) => {
  const boost = wakeBoost(part, frame);
  const t = frame.time + part.phase;
  part.mesh.position.y =
    part.position.y + Math.abs(Math.sin(t * 2.2)) * 0.04 + Math.abs(Math.sin(t * 8.5)) * 0.22 * boost;
};

const catBlink: PartMotion = (part, frame) => {
  const time = (activityTime(part, frame) + (part.startedAt === undefined ? 2 : 0)) % 7.2;
  part.mesh.scale.y = part.scale.y * (1 - 0.9 * motionPulse(time, 0.08, 0.52));
};

const catTail: PartMotion = (part, frame) => {
  const time = (activityTime(part, frame) + (part.startedAt === undefined ? 2 : 0)) % 7.2;
  part.mesh.rotation.z = part.rotation.z + 0.13 * motionPulse(time, 0.52, 0.35);
};

const bunnyEar: PartMotion = (part, frame) => {
  const time = (activityTime(part, frame) + (part.startedAt === undefined ? 3.2 : 0)) % 6.5;
  part.mesh.rotation.z = part.rotation.z + 0.32 * motionPulse(time, 0.08, 0.62);
};

const deerEar: PartMotion = (part, frame) => {
  const time = (activityTime(part, frame) + (part.startedAt === undefined ? 2.5 : 0)) % 6.2;
  part.mesh.rotation.z = part.rotation.z + 0.36 * motionPulse(time, 0.1, 0.2) + 0.24 * motionPulse(time, 0.43, 0.24);
};

const crabStep: PartMotion = (part, frame) => {
  const time = (activityTime(part, frame) + (part.startedAt === undefined ? 1.2 : 0)) % 6.8;
  const first = THREE.MathUtils.smoothstep(time, 0, 0.24);
  const second = THREE.MathUtils.smoothstep(time, 0.3, 0.54);
  const back = THREE.MathUtils.smoothstep(time, 1.05, 1.55);
  part.mesh.position.x = part.position.x + (first + second - 2 * back) * 0.18;
  part.mesh.rotation.z = part.rotation.z + 0.07 * (motionPulse(time, 0, 0.24) - motionPulse(time, 0.3, 0.24));
};

const crabClaw: PartMotion = (part, frame) => {
  const time = (activityTime(part, frame) + (part.startedAt === undefined ? 1.2 : 0)) % 6.8;
  part.mesh.rotation.z = part.rotation.z + 0.35 * motionPulse(time, 0.55, 0.52);
};

const spin: PartMotion = (part, frame) => {
  const boost = wakeBoost(part, frame);
  part.mesh.rotation.z = part.rotation.z + frame.time * 0.35;
  const pulse = 1 + boost * 0.5;
  part.mesh.scale.set(part.scale.x * pulse, part.scale.y * pulse, part.scale.z);
};

const wave: PartMotion = (part, frame) => {
  const t = frame.time + part.phase;
  part.mesh.position.x = part.position.x + Math.sin(t * 1.1) * 0.14;
  part.mesh.position.y = part.position.y + Math.sin(t * 1.9) * 0.025;
};

const motions: Record<PartKind, PartMotion> = {
  still,
  sway,
  wing,
  flutter,
  fire,
  float,
  jump,
  'cat-blink': catBlink,
  'cat-tail': catTail,
  'bunny-ear': bunnyEar,
  'deer-ear': deerEar,
  'crab-step': crabStep,
  'crab-claw': crabClaw,
  'distant-birds': distantBirds,
  dragonfly,
  'dragonfly-wing': dragonflyWing,
  spin,
  wave,
};

export function motionFor(kind: PartKind): PartMotion {
  return motions[kind];
}

/** Parts with this kind have nothing to animate each frame. */
export function isAnimated(part: PaperPart): boolean {
  return part.kind !== 'still';
}
