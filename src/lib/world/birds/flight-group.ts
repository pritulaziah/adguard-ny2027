import * as THREE from 'three';
import { Wingbeat } from './wingbeat';
import type { BirdPose, DistantBirdMember, FlightRuntime, WingState } from './types';

/**
 * One flight group of sky birds. The base class owns the scroll response and
 * the runtime state that every group shares. A subclass decides where its
 * birds fly and how one bird is posed.
 */
export abstract class FlightGroup {
  readonly runtime: FlightRuntime = {
    scrollVel: 0,
    surge: 0,
    beatClock: 0,
    orbitAngle: 0,
    focusVx: 0,
    yawRate: 0,
    flockVx: 0,
  };
  protected readonly wingbeat = new Wingbeat();
  private readonly wing: WingState = { flap: 0, lift: 0 };

  protected constructor(readonly members: DistantBirdMember[]) {}

  /** Smooths the reader scroll into velocity, surge, and the wingbeat clock. */
  update(delta: number, distance: number, speed: number | undefined, reduced: boolean): void {
    const runtime = this.runtime;
    const dt = THREE.MathUtils.clamp(delta, 1 / 120, 0.1);
    const rawSpeed =
      speed !== undefined ? speed : runtime.lastDistance === undefined ? 0 : (distance - runtime.lastDistance) / dt;
    const clampedSpeed = THREE.MathUtils.clamp(rawSpeed, -14, 14);
    runtime.lastDistance = distance;

    if (reduced) {
      runtime.scrollVel = 0;
      runtime.surge = 0;
      runtime.focusVx = 0;
      runtime.yawRate = 0;
      runtime.flockVx = 0;
      this.settle(distance);
      return;
    }

    const velRate = Math.abs(clampedSpeed) > Math.abs(runtime.scrollVel) ? 6.5 : 3.2;
    runtime.scrollVel += (clampedSpeed - runtime.scrollVel) * (1 - Math.exp(-dt * velRate));

    const targetSurge = THREE.MathUtils.clamp((Math.abs(clampedSpeed) - 0.12) / 3.0, 0, 1);
    const surgeRate = targetSurge > runtime.surge ? 6.0 : 2.2;
    runtime.surge += (targetSurge - runtime.surge) * (1 - Math.exp(-dt * surgeRate));

    runtime.beatClock += dt * (1 + runtime.surge * 1.45);

    this.advance(distance, dt);
  }

  /** Clears the smoothed state while the season is out of view. */
  reset(distance: number): void {
    const runtime = this.runtime;
    runtime.scrollVel = 0;
    runtime.surge = 0;
    runtime.focusX = undefined;
    runtime.focusVx = 0;
    runtime.yaw = undefined;
    runtime.yawRate = 0;
    runtime.flockX = undefined;
    runtime.flockVx = 0;
    runtime.lastDistance = distance;
  }

  /** Returns one bird pose. Allocates, so the frame loop uses `samplePoseInto`. */
  samplePose(
    member: DistantBirdMember,
    time: number,
    distance: number,
    seasonFade: number,
    reduced: boolean,
    dorsalTilt = 0.34,
  ): BirdPose {
    return this.samplePoseInto(member, time, distance, seasonFade, reduced, dorsalTilt, {
      x: 0,
      y: 0,
      z: 0,
      scale: 1,
      yaw: 0,
      pitch: 0,
      roll: 0,
      flap: 0,
    });
  }

  /** Writes one bird pose into `out` without an allocation. */
  abstract samplePoseInto(
    member: DistantBirdMember,
    time: number,
    distance: number,
    seasonFade: number,
    reduced: boolean,
    dorsalTilt: number,
    out: BirdPose,
  ): BirdPose;

  /** Places the group when the reader uses reduced motion. */
  protected abstract settle(distance: number): void;

  /** Moves the group with the reader. */
  protected abstract advance(distance: number, dt: number): void;

  /** Samples the wingbeat into the shared scratch state. */
  protected wings(member: DistantBirdMember, clock: number, reduced: boolean, surge: number): WingState {
    return this.wingbeat.sampleInto(member, clock, reduced, surge, this.wing);
  }
}
