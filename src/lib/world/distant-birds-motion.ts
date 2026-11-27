import * as THREE from 'three';
import type { PartMotion } from './part-motion';
import type { SeasonId } from './seasons';
import type { BirdSpecies } from './scenery/bird-species';

export type BirdSeason = SeasonId;

export interface DistantBirdMember {
  /** Formation offset relative to the flight group center. */
  dx: number;
  dy: number;
  dz: number;
  /** Overall 3D scale of the bird figure. */
  size: number;
  /** Seconds between autonomous wingbeat bursts while gliding. */
  wingCycle: number;
  /** Wingbeats in each autonomous burst. */
  beats: number;
  /** Duration of one wingbeat in seconds. */
  beatDuration: number;
  /** Peak stroke angle of one wingbeat in radians. */
  beatAmplitude: number;
  /** Wingbeat clock offset in seconds. */
  wingPhase: number;
  /** Gentle upward dihedral angle during a glide, in radians. */
  glideAngle: number;
  /** Individual horizontal and vertical sway for organic spacing. */
  driftX: number;
  driftY: number;
  driftSeed: number;
}

export interface FlightRuntime {
  /** Smoothed signed scroll velocity (world units per second). */
  scrollVel: number;
  /** Smoothed scrolling intensity (0..1) that drives active wingbeats and lift. */
  surge: number;
  /** Wingbeat clock that accelerates gently while scrolling. */
  beatClock: number;
  /** Accumulated orbit angle driven by both gentle glide and scroll motion. */
  orbitAngle: number;
  /** Smoothed horizontal sky center following the reader inside the season. */
  focusX?: number;
  /** Horizontal velocity of focusX on the current frame. */
  focusVx: number;
  /** Smoothed 3D heading angle so direction changes bank without snapping. */
  yaw?: number;
  /** Angular turn rate (rad/s) used to bank wings into turns. */
  yawRate: number;
  /** Clamped reader anchor X for the autumn migrating flock. */
  anchorX?: number;
  /** Progress clock for the autumn flock, accelerated by forward scrolling. */
  flockElapsed: number;
  /** Previous distance for speed fallback when frame.speed is omitted. */
  lastDistance?: number;
}

export interface SoarFlightSpec {
  mode: 'soar';
  homeX: number;
  trackMinX: number;
  trackMaxX: number;
  /** Share of reader scroll distance followed inside trackMinX..trackMaxX (0..1). */
  follow: number;
  baseY: number;
  baseZ: number;
  radiusX: number;
  radiusY: number;
  radiusZ: number;
  orbitPeriod: number;
  orbitPhase: number;
  /** Orbit radians added per unit of reader scroll travel. */
  scrollOrbitGain: number;
  /** Orbit direction (+1 starts rightward on the front leg, -1 leftward). */
  direction: 1 | -1;
  members: DistantBirdMember[];
  runtime: FlightRuntime;
}

export interface FlockFlightSpec {
  mode: 'flock';
  minX: number;
  maxX: number;
  passBefore: number;
  passAfter: number;
  baseY: number;
  climb: number;
  arcY: number;
  baseZ: number;
  flightDuration: number;
  period: number;
  /** Multiplier applied to positive scroll speed to accelerate flock flight. */
  scrollSpeedGain: number;
  members: DistantBirdMember[];
  runtime: FlightRuntime;
}

export type FlightGroupSpec = SoarFlightSpec | FlockFlightSpec;

export interface DistantBirdSeasonData {
  season: BirdSeason;
  species: BirdSpecies;
  wingOffset: [number, number, number];
  centerX: number;
  fadeInStart: number;
  fadeInEnd: number;
  fadeOutStart: number;
  fadeOutEnd: number;
  flights: FlightGroupSpec[];
  bodies: THREE.InstancedMesh;
  leftWings: THREE.InstancedMesh;
  rightWings: THREE.InstancedMesh;
}

export interface WingState {
  flap: number;
  lift: number;
}

export interface BirdPose {
  x: number;
  y: number;
  z: number;
  scale: number;
  yaw: number;
  pitch: number;
  roll: number;
  flap: number;
}

const posVec = new THREE.Vector3();
const scaleVec = new THREE.Vector3();
const unitScale = new THREE.Vector3(1, 1, 1);
const bodyEuler = new THREE.Euler(0, 0, 0, 'YZX');
const bodyQuat = new THREE.Quaternion();
const bodyMatrix = new THREE.Matrix4();
const wingOffset = new THREE.Vector3();
const wingEuler = new THREE.Euler();
const wingQuat = new THREE.Quaternion();
const wingMatrix = new THREE.Matrix4();
const instanceMatrix = new THREE.Matrix4();

function positiveMod(value: number, period: number): number {
  return ((value % period) + period) % period;
}

function angleDelta(from: number, to: number): number {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

function burstStroke(local: number, beats: number, beatDuration: number, amplitude: number): WingState {
  const duration = beats * beatDuration;
  if (local <= 0 || local >= duration) return { flap: 0, lift: 0 };
  const u = local / duration;
  const envelope = THREE.MathUtils.smoothstep(u, 0, 0.22) * (1 - THREE.MathUtils.smoothstep(u, 0.78, 1));
  const strokePhase = (local / beatDuration) * Math.PI * 2;
  const stroke = Math.sin(strokePhase) - 0.18 * Math.sin(strokePhase * 2);
  return {
    flap: envelope * stroke * amplitude,
    lift: envelope * -Math.cos(strokePhase) * 0.035,
  };
}

/**
 * Computes wing flap angle and body lift for long gliding with rare beats,
 * blending smoothly into active wingbeats while the reader scrolls.
 */
export function sampleWingBeat(
  member: DistantBirdMember,
  clock: number,
  reduced: boolean,
  surge = 0,
): WingState {
  if (reduced) return { flap: member.glideAngle, lift: 0 };

  const local = positiveMod(clock + member.wingPhase, member.wingCycle);
  const autonomous = burstStroke(local, member.beats, member.beatDuration, member.beatAmplitude);
  const glideDrift = autonomous.flap === 0 && surge < 0.08
    ? Math.sin(clock * 0.7 + member.wingPhase) * 0.028
    : 0;

  let flap = member.glideAngle + glideDrift + autonomous.flap;
  let lift = autonomous.lift;

  if (surge > 0.04) {
    const activePhase = ((clock + member.wingPhase) / (member.beatDuration * 0.92)) * Math.PI * 2;
    const activeFlap = (Math.sin(activePhase) - 0.16 * Math.sin(activePhase * 2)) * member.beatAmplitude * 0.88 * surge;
    const activeLift = -Math.cos(activePhase) * 0.032 * surge;
    if (Math.abs(activeFlap) > Math.abs(autonomous.flap)) {
      flap = member.glideAngle + activeFlap;
      lift = activeLift;
    }
  }

  return { flap, lift };
}

/** Creates an empty runtime state for one flight group. */
export function createFlightRuntime(): FlightRuntime {
  return {
    scrollVel: 0,
    surge: 0,
    beatClock: 0,
    orbitAngle: 0,
    focusVx: 0,
    yawRate: 0,
    flockElapsed: 0.4,
  };
}

function resetRuntime(runtime: FlightRuntime, distance: number): void {
  runtime.scrollVel = 0;
  runtime.surge = 0;
  runtime.focusX = undefined;
  runtime.focusVx = 0;
  runtime.yaw = undefined;
  runtime.yawRate = 0;
  runtime.anchorX = undefined;
  runtime.flockElapsed = 0.4;
  runtime.lastDistance = distance;
}

function targetSoarFocus(flight: SoarFlightSpec, distance: number): number {
  const clamped = THREE.MathUtils.clamp(distance, flight.trackMinX, flight.trackMaxX);
  return THREE.MathUtils.lerp(flight.homeX, clamped, flight.follow);
}

function updateRuntime(
  flight: FlightGroupSpec,
  delta: number,
  distance: number,
  speed: number | undefined,
  reduced: boolean,
): void {
  const runtime = flight.runtime;
  const dt = THREE.MathUtils.clamp(delta, 1 / 120, 0.1);
  const rawSpeed = speed !== undefined
    ? speed
    : runtime.lastDistance === undefined ? 0 : (distance - runtime.lastDistance) / dt;
  const clampedSpeed = THREE.MathUtils.clamp(rawSpeed, -14, 14);
  runtime.lastDistance = distance;

  if (reduced) {
    runtime.scrollVel = 0;
    runtime.surge = 0;
    runtime.focusVx = 0;
    runtime.yawRate = 0;
    if (flight.mode === 'soar') {
      runtime.focusX = targetSoarFocus(flight, distance);
    } else {
      const minAnchor = flight.minX + flight.passBefore;
      const maxAnchor = flight.maxX - flight.passAfter;
      runtime.anchorX = THREE.MathUtils.clamp(distance + 0.8, minAnchor, maxAnchor);
    }
    return;
  }

  const velRate = Math.abs(clampedSpeed) > Math.abs(runtime.scrollVel) ? 6.5 : 3.2;
  runtime.scrollVel += (clampedSpeed - runtime.scrollVel) * (1 - Math.exp(-dt * velRate));

  const targetSurge = THREE.MathUtils.clamp((Math.abs(clampedSpeed) - 0.12) / 3.0, 0, 1);
  const surgeRate = targetSurge > runtime.surge ? 6.0 : 2.2;
  runtime.surge += (targetSurge - runtime.surge) * (1 - Math.exp(-dt * surgeRate));

  runtime.beatClock += dt * (1 + runtime.surge * 1.45);

  if (flight.mode === 'soar') {
    const goalX = targetSoarFocus(flight, distance);
    if (runtime.focusX === undefined) {
      runtime.focusX = goalX;
      runtime.focusVx = 0;
    } else {
      const prev = runtime.focusX;
      runtime.focusX += (goalX - runtime.focusX) * (1 - Math.exp(-dt * 2.8));
      runtime.focusVx = (runtime.focusX - prev) / dt;
    }

    const omega = (Math.PI * 2) / flight.orbitPeriod + Math.abs(runtime.scrollVel) * flight.scrollOrbitGain;
    runtime.orbitAngle += omega * dt * flight.direction;

    const theta = flight.orbitPhase + runtime.orbitAngle;
    const vx = runtime.focusVx + flight.radiusX * omega * flight.direction * Math.cos(theta);
    const vz = -flight.radiusZ * omega * flight.direction * Math.sin(theta);
    const targetYaw = Math.atan2(-vz, vx);
    if (runtime.yaw === undefined) {
      runtime.yaw = targetYaw;
      runtime.yawRate = 0;
    } else {
      const step = angleDelta(runtime.yaw, targetYaw) * (1 - Math.exp(-dt * 5.5));
      runtime.yaw += step;
      runtime.yawRate = step / dt;
    }
  } else {
    const minAnchor = flight.minX + flight.passBefore;
    const maxAnchor = flight.maxX - flight.passAfter;
    const goalAnchor = THREE.MathUtils.clamp(distance + 0.8, minAnchor, maxAnchor);
    if (runtime.anchorX === undefined) runtime.anchorX = goalAnchor;
    else runtime.anchorX += (goalAnchor - runtime.anchorX) * (1 - Math.exp(-dt * 2.2));

    // Forward scrolling accelerates the V-flock cleanly; stopping settles into steady gliding.
    const pace = 1 + Math.max(0, runtime.scrollVel) * flight.scrollSpeedGain;
    runtime.flockElapsed += dt * pace;
  }
}

function sampleSoarPose(
  flight: SoarFlightSpec,
  member: DistantBirdMember,
  time: number,
  distance: number,
  seasonFade: number,
  reduced: boolean,
): BirdPose {
  const runtime = flight.runtime;
  const clock = reduced ? 0 : (runtime.beatClock || time);
  const wing = sampleWingBeat(member, clock, reduced, reduced ? 0 : runtime.surge);

  const omega = (Math.PI * 2) / flight.orbitPeriod
    + (reduced ? 0 : Math.abs(runtime.scrollVel) * flight.scrollOrbitGain);
  const theta = flight.orbitPhase + (reduced ? 0 : runtime.orbitAngle);
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);

  const focusX = runtime.focusX ?? targetSoarFocus(flight, distance);
  const driftX = Math.sin(clock * 0.31 + member.driftSeed) * member.driftX;
  const driftY = Math.sin(clock * 0.43 + member.driftSeed * 1.7) * member.driftY;
  const surgeLift = reduced ? 0 : runtime.surge * 0.18;

  const x = focusX + member.dx + flight.radiusX * sinT + driftX;
  const y = flight.baseY + member.dy + flight.radiusY * (0.55 * Math.sin(theta * 2) + 0.45 * cosT) + driftY + surgeLift + wing.lift;
  const z = flight.baseZ + member.dz + flight.radiusZ * cosT;

  const vx = (reduced ? 0 : runtime.focusVx) + flight.radiusX * omega * flight.direction * cosT;
  const vz = -flight.radiusZ * omega * flight.direction * sinT;
  const vy = flight.radiusY * omega * flight.direction * (1.1 * Math.cos(theta * 2) - 0.45 * sinT);

  const yaw = reduced || runtime.yaw === undefined ? Math.atan2(-vz, vx) : runtime.yaw;
  const pitch = THREE.MathUtils.clamp(Math.atan2(vy, Math.hypot(vx, vz) + 0.08), -0.24, 0.24);
  const turnBank = reduced ? 0 : THREE.MathUtils.clamp(-runtime.yawRate * 0.3, -0.42, 0.42);
  const roll = Math.cos(yaw) * 0.36 + turnBank - sinT * flight.direction * 0.18;

  return {
    x,
    y,
    z,
    scale: member.size * seasonFade,
    yaw,
    pitch,
    roll,
    flap: wing.flap,
  };
}

function sampleFlockPose(
  flight: FlockFlightSpec,
  member: DistantBirdMember,
  time: number,
  distance: number,
  seasonFade: number,
  reduced: boolean,
): BirdPose {
  const runtime = flight.runtime;
  const minAnchor = flight.minX + flight.passBefore;
  const maxAnchor = flight.maxX - flight.passAfter;
  const anchor = reduced
    ? THREE.MathUtils.clamp(distance + 0.8, minAnchor, maxAnchor)
    : (runtime.anchorX ?? THREE.MathUtils.clamp(distance + 0.8, minAnchor, maxAnchor));

  const elapsed = reduced ? flight.flightDuration * 0.46 : runtime.flockElapsed;
  const local = positiveMod(elapsed, flight.period);

  if (local >= flight.flightDuration || seasonFade <= 0.001) {
    return { x: anchor, y: flight.baseY, z: flight.baseZ, scale: 0, yaw: 0, pitch: 0, roll: 0, flap: member.glideAngle };
  }

  const startX = Math.max(flight.minX, anchor - flight.passBefore);
  const endX = Math.min(flight.maxX, anchor + flight.passAfter);
  const progress = local / flight.flightDuration;
  const passFade = Math.min(
    THREE.MathUtils.smoothstep(progress, 0, 0.1),
    1 - THREE.MathUtils.smoothstep(progress, 0.9, 1),
  );

  const clock = reduced ? 0 : (runtime.beatClock || time);
  const wing = sampleWingBeat(member, clock, reduced, reduced ? 0 : runtime.surge);

  const driftX = Math.sin(clock * 0.33 + member.driftSeed) * member.driftX;
  const driftY = Math.sin(clock * 0.45 + member.driftSeed * 1.7) * member.driftY;
  const surgeLift = reduced ? 0 : runtime.surge * 0.16;

  const x = THREE.MathUtils.lerp(startX, endX, progress) + member.dx + driftX;
  const y = flight.baseY
    + member.dy
    + flight.climb * (progress - 0.5)
    + flight.arcY * Math.sin(progress * Math.PI)
    + driftY
    + surgeLift
    + wing.lift;
  const z = flight.baseZ + member.dz + Math.sin(progress * Math.PI) * 0.35;

  const vx = (endX - startX) / flight.flightDuration;
  const vy = (flight.climb + flight.arcY * Math.PI * Math.cos(progress * Math.PI)) / flight.flightDuration;
  const vz = (0.35 * Math.PI * Math.cos(progress * Math.PI)) / flight.flightDuration;
  const yaw = Math.atan2(-vz, vx);
  const pitch = THREE.MathUtils.clamp(Math.atan2(vy, Math.hypot(vx, vz) + 0.05), -0.22, 0.22);
  const roll = 0.4 + Math.sin(clock * 0.4 + member.driftSeed) * 0.08;

  return {
    x,
    y,
    z,
    scale: member.size * passFade * seasonFade,
    yaw,
    pitch,
    roll,
    flap: wing.flap,
  };
}

/** Computes world 3D pose for one bird inside a flight group. */
export function sampleFlightBirdPose(
  flight: FlightGroupSpec,
  member: DistantBirdMember,
  time: number,
  distance: number,
  seasonFade: number,
  reduced: boolean,
): BirdPose {
  return flight.mode === 'soar'
    ? sampleSoarPose(flight, member, time, distance, seasonFade, reduced)
    : sampleFlockPose(flight, member, time, distance, seasonFade, reduced);
}

/** Writes all 3D body and wing matrices for one season group. */
export function updateBirdSeason(
  data: DistantBirdSeasonData,
  time: number,
  delta: number,
  distance: number,
  reduced: boolean,
  speed?: number,
): boolean {
  const fadeIn = THREE.MathUtils.smoothstep(distance, data.fadeInStart, data.fadeInEnd);
  const fadeOut = 1 - THREE.MathUtils.smoothstep(distance, data.fadeOutStart, data.fadeOutEnd);
  const seasonFade = Math.min(fadeIn, fadeOut);
  if (seasonFade <= 0.001) {
    for (const flight of data.flights) resetRuntime(flight.runtime, distance);
    return false;
  }

  const [wx, wy, wz] = data.wingOffset;
  let index = 0;
  for (const flight of data.flights) {
    updateRuntime(flight, delta, distance, speed, reduced);
    for (const member of flight.members) {
      const pose = sampleFlightBirdPose(flight, member, time, distance, seasonFade, reduced);
      posVec.set(pose.x - data.centerX, pose.y, pose.z);
      bodyEuler.set(pose.roll, pose.yaw, pose.pitch, 'YZX');
      bodyQuat.setFromEuler(bodyEuler);
      scaleVec.setScalar(pose.scale);
      bodyMatrix.compose(posVec, bodyQuat, scaleVec);
      data.bodies.setMatrixAt(index, bodyMatrix);

      // Left wing (-Z) hinges at the left shoulder and lifts with positive flap.
      wingOffset.set(wx, wy, -wz);
      wingEuler.set(pose.flap, 0, pose.flap * 0.14);
      wingQuat.setFromEuler(wingEuler);
      wingMatrix.compose(wingOffset, wingQuat, unitScale);
      instanceMatrix.multiplyMatrices(bodyMatrix, wingMatrix);
      data.leftWings.setMatrixAt(index, instanceMatrix);

      // Right wing (+Z) hinges at the right shoulder and lifts with positive flap.
      wingOffset.set(wx, wy, wz);
      wingEuler.set(-pose.flap, 0, pose.flap * 0.14);
      wingQuat.setFromEuler(wingEuler);
      wingMatrix.compose(wingOffset, wingQuat, unitScale);
      instanceMatrix.multiplyMatrices(bodyMatrix, wingMatrix);
      data.rightWings.setMatrixAt(index, instanceMatrix);
      index++;
    }
  }

  data.bodies.instanceMatrix.needsUpdate = true;
  data.leftWings.instanceMatrix.needsUpdate = true;
  data.rightWings.instanceMatrix.needsUpdate = true;
  return true;
}

/** Updates one seasonal group of 3D folded-paper sky birds. */
export const distantBirds: PartMotion = (part, frame) => {
  const data = part.mesh.userData.distantBirds as DistantBirdSeasonData | undefined;
  if (!data) return;
  part.mesh.visible = updateBirdSeason(
    data,
    frame.time,
    frame.delta,
    frame.distance,
    frame.reduced,
    frame.speed,
  );
};
