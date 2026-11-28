import * as THREE from 'three';
import { FlightGroup } from './flight-group';
import type { BirdPose, DistantBirdMember } from './types';

export interface FlockFlightOptions {
  /** Start and end world X spanning the entire season without mid-season breaks. */
  startX: number;
  endX: number;
  baseY: number;
  climb: number;
  arcY: number;
  baseZ: number;
  /** Calm forward migration speed (world units per second) while the reader rests. */
  idleSpeed: number;
  /** Share of forward scroll speed added to the migrating flock. */
  scrollFollow: number;
}

/** A migrating flock that crosses a whole season without a mid-season reset. */
export class FlockFlight extends FlightGroup {
  private readonly startX: number;
  private readonly endX: number;
  private readonly baseY: number;
  private readonly climb: number;
  private readonly arcY: number;
  private readonly baseZ: number;
  private readonly idleSpeed: number;
  private readonly scrollFollow: number;

  constructor(options: FlockFlightOptions, members: DistantBirdMember[]) {
    super(members);
    this.startX = options.startX;
    this.endX = options.endX;
    this.baseY = options.baseY;
    this.climb = options.climb;
    this.arcY = options.arcY;
    this.baseZ = options.baseZ;
    this.idleSpeed = options.idleSpeed;
    this.scrollFollow = options.scrollFollow;
  }

  protected settle(distance: number): void {
    this.runtime.flockX = THREE.MathUtils.clamp(distance, this.startX + 1.5, this.endX - 1.5);
  }

  protected advance(distance: number, dt: number): void {
    const runtime = this.runtime;
    if (runtime.flockX === undefined) runtime.flockX = this.initialX(distance);

    // Fly continuously forward across the full season without mid-season resets.
    // Follow forward scroll closely when near or behind the camera, and taper off
    // when already ahead so scrolling to Stop 6 catches up instead of pushing past endX.
    const ahead = runtime.flockX - distance;
    const catchupScale = 1 - THREE.MathUtils.smoothstep(ahead, -1.0, 5.5);
    const baseCruise = runtime.scrollVel < -0.2 ? this.idleSpeed * 0.45 : this.idleSpeed;
    const forwardSpeed = baseCruise + Math.max(0, runtime.scrollVel) * this.scrollFollow * catchupScale;
    runtime.flockVx = forwardSpeed;
    runtime.flockX += forwardSpeed * dt;

    // Wrap only at the end of the autumn season, never between screens.
    if (runtime.flockX > this.endX) runtime.flockX = this.startX;
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
    const span = Math.max(0.01, this.endX - this.startX);
    const leadX = reduced
      ? THREE.MathUtils.clamp(distance, this.startX + 1.5, this.endX - 1.5)
      : (runtime.flockX ?? this.initialX(distance));
    const progress = THREE.MathUtils.clamp((leadX - this.startX) / span, 0, 1);

    // Soft fade only at the very ends of the autumn season, never between stops.
    const edgeFade = Math.min(
      THREE.MathUtils.smoothstep(progress, 0, 0.03),
      1 - THREE.MathUtils.smoothstep(progress, 0.97, 1),
    );

    const clock = reduced ? 0 : runtime.beatClock || time;
    const wing = this.wings(member, clock, reduced, reduced ? 0 : runtime.surge);

    const driftX = Math.sin(clock * 0.33 + member.driftSeed) * member.driftX;
    const driftY = Math.sin(clock * 0.45 + member.driftSeed * 1.7) * member.driftY;
    const surgeLift = reduced ? 0 : runtime.surge * 0.16;

    const x = leadX + member.dx + driftX;
    const y =
      this.baseY +
      member.dy +
      this.climb * (progress - 0.5) +
      this.arcY * Math.sin(progress * Math.PI) +
      driftY +
      surgeLift +
      wing.lift;
    const z = this.baseZ + member.dz + Math.sin(progress * Math.PI) * 0.4;

    const vx = Math.max(this.idleSpeed, runtime.flockVx);
    const dProgress = vx / span;
    const vy = (this.climb + this.arcY * Math.PI * Math.cos(progress * Math.PI)) * dProgress;
    const vz = 0.4 * Math.PI * Math.cos(progress * Math.PI) * dProgress;
    const yaw = Math.atan2(-vz, vx);
    const pitch = THREE.MathUtils.clamp(Math.atan2(vy, Math.hypot(vx, vz) + 0.05), -0.22, 0.22);
    const roll = dorsalTilt + Math.sin(clock * 0.4 + member.driftSeed) * 0.07;

    out.x = x;
    out.y = y;
    out.z = z;
    out.scale = member.size * edgeFade * seasonFade;
    out.yaw = yaw;
    out.pitch = pitch;
    out.roll = roll;
    out.flap = wing.flap;
    return out;
  }

  /** The world X where the flock starts for a reader distance. */
  private initialX(distance: number): number {
    return THREE.MathUtils.clamp(distance - 1.5, this.startX + 0.9, this.endX - 3.5);
  }
}
