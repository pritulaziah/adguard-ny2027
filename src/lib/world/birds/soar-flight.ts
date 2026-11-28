import * as THREE from 'three';
import { FlightGroup } from './flight-group';
import type { BirdPose, DistantBirdMember } from './types';

export interface SoarFlightOptions {
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
}

/** Birds that circle a sky point and follow the reader inside a track. */
export class SoarFlight extends FlightGroup {
  private readonly homeX: number;
  private readonly trackMinX: number;
  private readonly trackMaxX: number;
  private readonly follow: number;
  private readonly baseY: number;
  private readonly baseZ: number;
  private readonly radiusX: number;
  private readonly radiusY: number;
  private readonly radiusZ: number;
  private readonly orbitPeriod: number;
  private readonly orbitPhase: number;
  private readonly scrollOrbitGain: number;
  private readonly direction: 1 | -1;

  constructor(options: SoarFlightOptions, members: DistantBirdMember[]) {
    super(members);
    this.homeX = options.homeX;
    this.trackMinX = options.trackMinX;
    this.trackMaxX = options.trackMaxX;
    this.follow = options.follow;
    this.baseY = options.baseY;
    this.baseZ = options.baseZ;
    this.radiusX = options.radiusX;
    this.radiusY = options.radiusY;
    this.radiusZ = options.radiusZ;
    this.orbitPeriod = options.orbitPeriod;
    this.orbitPhase = options.orbitPhase;
    this.scrollOrbitGain = options.scrollOrbitGain;
    this.direction = options.direction;
  }

  protected settle(distance: number): void {
    this.runtime.focusX = this.focusAt(distance);
  }

  protected advance(distance: number, dt: number): void {
    const runtime = this.runtime;
    const goalX = this.focusAt(distance);
    if (runtime.focusX === undefined) {
      runtime.focusX = goalX;
      runtime.focusVx = 0;
    } else {
      const prev = runtime.focusX;
      runtime.focusX += (goalX - runtime.focusX) * (1 - Math.exp(-dt * 2.8));
      runtime.focusVx = (runtime.focusX - prev) / dt;
    }

    const omega = (Math.PI * 2) / this.orbitPeriod + Math.abs(runtime.scrollVel) * this.scrollOrbitGain;
    runtime.orbitAngle += omega * dt * this.direction;

    const theta = this.orbitPhase + runtime.orbitAngle;
    const vx = runtime.focusVx + this.radiusX * omega * this.direction * Math.cos(theta);
    const vz = -this.radiusZ * omega * this.direction * Math.sin(theta);
    const targetYaw = Math.atan2(-vz, vx);
    if (runtime.yaw === undefined) {
      runtime.yaw = targetYaw;
      runtime.yawRate = 0;
    } else {
      const step = this.angleDelta(runtime.yaw, targetYaw) * (1 - Math.exp(-dt * 5.5));
      runtime.yaw += step;
      runtime.yawRate = step / dt;
    }
  }

  samplePoseInto(
    member: DistantBirdMember,
    time: number,
    distance: number,
    seasonFade: number,
    reduced: boolean,
    dorsalTilt: number,
    out: BirdPose,
  ): BirdPose {
    const runtime = this.runtime;
    const clock = reduced ? 0 : runtime.beatClock || time;
    const wing = this.wings(member, clock, reduced, reduced ? 0 : runtime.surge);

    const omega = (Math.PI * 2) / this.orbitPeriod + (reduced ? 0 : Math.abs(runtime.scrollVel) * this.scrollOrbitGain);
    const theta = this.orbitPhase + (reduced ? 0 : runtime.orbitAngle);
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);

    const focusX = runtime.focusX ?? this.focusAt(distance);
    const driftX = Math.sin(clock * 0.31 + member.driftSeed) * member.driftX;
    const driftY = Math.sin(clock * 0.43 + member.driftSeed * 1.7) * member.driftY;
    const surgeLift = reduced ? 0 : runtime.surge * 0.18;

    const x = focusX + member.dx + this.radiusX * sinT + driftX;
    const y =
      this.baseY +
      member.dy +
      this.radiusY * (0.55 * Math.sin(theta * 2) + 0.45 * cosT) +
      driftY +
      surgeLift +
      wing.lift;
    const z = this.baseZ + member.dz + this.radiusZ * cosT;

    const vx = (reduced ? 0 : runtime.focusVx) + this.radiusX * omega * this.direction * cosT;
    const vz = -this.radiusZ * omega * this.direction * sinT;
    const vy = this.radiusY * omega * this.direction * (1.1 * Math.cos(theta * 2) - 0.45 * sinT);

    const yaw = reduced || runtime.yaw === undefined ? Math.atan2(-vz, vx) : runtime.yaw;
    const pitch = THREE.MathUtils.clamp(Math.atan2(vy, Math.hypot(vx, vz) + 0.08), -0.24, 0.24);
    const turnBank = reduced ? 0 : THREE.MathUtils.clamp(-runtime.yawRate * 0.3, -0.42, 0.42);
    const roll = Math.cos(yaw) * dorsalTilt + turnBank - sinT * this.direction * (dorsalTilt * 0.45);

    out.x = x;
    out.y = y;
    out.z = z;
    out.scale = member.size * seasonFade;
    out.yaw = yaw;
    out.pitch = pitch;
    out.roll = roll;
    out.flap = wing.flap;
    return out;
  }

  /** The horizontal sky center this group follows for a reader distance. */
  private focusAt(distance: number): number {
    const clamped = THREE.MathUtils.clamp(distance, this.trackMinX, this.trackMaxX);
    return THREE.MathUtils.lerp(this.homeX, clamped, this.follow);
  }

  /** The shortest signed angle between two headings, in radians. */
  private angleDelta(from: number, to: number): number {
    return Math.atan2(Math.sin(to - from), Math.cos(to - from));
  }
}
