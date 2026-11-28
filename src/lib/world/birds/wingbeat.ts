import * as THREE from 'three';
import type { DistantBirdMember, WingState } from './types';

/**
 * The wingbeat of every sky bird. One instance keeps the burst scratch, so a
 * full flock update writes no temporary objects.
 */
export class Wingbeat {
  private readonly burst: WingState = { flap: 0, lift: 0 };

  /** Returns a fresh wing state. Allocates, so the frame loop uses `sampleInto`. */
  sample(member: DistantBirdMember, clock: number, reduced: boolean, surge = 0): WingState {
    return this.sampleInto(member, clock, reduced, surge, { flap: 0, lift: 0 });
  }

  /** Writes the flap angle and body lift into `out`. */
  sampleInto(member: DistantBirdMember, clock: number, reduced: boolean, surge: number, out: WingState): WingState {
    if (reduced) {
      out.flap = member.glideAngle;
      out.lift = 0;
      return out;
    }

    const local = this.wrap(clock + member.wingPhase, member.wingCycle);
    const autonomous = this.burstStroke(local, member, this.burst);
    const glideDrift = autonomous.flap === 0 && surge < 0.08 ? Math.sin(clock * 0.7 + member.wingPhase) * 0.028 : 0;

    let flap = member.glideAngle + glideDrift + autonomous.flap;
    let lift = autonomous.lift;

    if (surge > 0.04) {
      const activePhase = ((clock + member.wingPhase) / (member.beatDuration * 0.92)) * Math.PI * 2;
      const activeFlap =
        (Math.sin(activePhase) - 0.16 * Math.sin(activePhase * 2)) * member.beatAmplitude * 0.88 * surge;
      const activeLift = -Math.cos(activePhase) * 0.032 * surge;
      if (Math.abs(activeFlap) > Math.abs(autonomous.flap)) {
        flap = member.glideAngle + activeFlap;
        lift = activeLift;
      }
    }

    out.flap = flap;
    out.lift = lift;
    return out;
  }

  /**
   * Long gliding with rare beats. The stroke fades in and out, so the bird does
   * not snap back to the glide angle between bursts.
   */
  private burstStroke(local: number, member: DistantBirdMember, out: WingState): WingState {
    const duration = member.beats * member.beatDuration;
    if (local <= 0 || local >= duration) {
      out.flap = 0;
      out.lift = 0;
      return out;
    }
    const u = local / duration;
    const envelope = THREE.MathUtils.smoothstep(u, 0, 0.22) * (1 - THREE.MathUtils.smoothstep(u, 0.78, 1));
    const strokePhase = (local / member.beatDuration) * Math.PI * 2;
    const stroke = Math.sin(strokePhase) - 0.18 * Math.sin(strokePhase * 2);
    out.flap = envelope * stroke * member.beatAmplitude;
    out.lift = envelope * -Math.cos(strokePhase) * 0.035;
    return out;
  }

  /** Keeps the beat clock positive inside one cycle. */
  private wrap(value: number, period: number): number {
    return ((value % period) + period) % period;
  }
}
