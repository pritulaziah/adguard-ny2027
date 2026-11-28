import type { SeasonId } from '../seasons';

/** One of the four folded-paper sky birds. */
export type BirdSpecies = 'bullfinch' | 'swallow' | 'stork' | 'goose';

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
  /** Continuous world X of the autumn migrating flock along startX..endX. */
  flockX?: number;
  /** Forward speed of the autumn flock on the current frame. */
  flockVx: number;
  /** Previous distance for speed fallback when frame.speed is omitted. */
  lastDistance?: number;
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
