import {
  createFlightRuntime,
  type DistantBirdMember,
  type FlightGroupSpec,
  type SoarFlightSpec,
} from '../distant-birds-motion';
import { stopX } from '../route';

export interface MemberInput {
  dx: number;
  dy: number;
  dz: number;
  size: number;
  wingCycle: number;
  beats: number;
  beatDuration: number;
  wingPhase: number;
  beatAmplitude?: number;
  glideAngle?: number;
}

export function buildMembers(items: MemberInput[], seedBase: number): DistantBirdMember[] {
  return items.map((item, index) => ({
    dx: item.dx,
    dy: item.dy,
    dz: item.dz,
    size: item.size,
    wingCycle: item.wingCycle,
    beats: item.beats,
    beatDuration: item.beatDuration,
    beatAmplitude: item.beatAmplitude ?? 0.58,
    wingPhase: item.wingPhase,
    glideAngle: item.glideAngle ?? 0.16,
    driftX: 0.12,
    driftY: 0.08,
    driftSeed: seedBase + index * 2.17,
  }));
}

export function soar(
  spec: Omit<SoarFlightSpec, 'mode' | 'runtime' | 'members'>,
  items: MemberInput[],
  seedBase: number,
): SoarFlightSpec {
  return { mode: 'soar', ...spec, runtime: createFlightRuntime(), members: buildMembers(items, seedBase) };
}

export function winterStartFlights(): FlightGroupSpec[] {
  return [
    soar(
      {
        homeX: (stopX(0) + stopX(1)) / 2,
        trackMinX: stopX(0),
        trackMaxX: stopX(1) + 1.4,
        follow: 0.78,
        baseY: 5.95,
        baseZ: -6.85,
        radiusX: 2.6,
        radiusY: 0.24,
        radiusZ: 0.62,
        orbitPeriod: 34,
        orbitPhase: 0.25,
        scrollOrbitGain: 0.2,
        direction: 1,
      },
      [
        {
          dx: 0,
          dy: 0,
          dz: 0.05,
          size: 0.44,
          wingCycle: 7.2,
          beats: 2,
          beatDuration: 0.44,
          beatAmplitude: 0.48,
          wingPhase: 0.4,
          glideAngle: 0.08,
        },
        {
          dx: -0.95,
          dy: 0.28,
          dz: -0.16,
          size: 0.4,
          wingCycle: 7.8,
          beats: 2,
          beatDuration: 0.46,
          beatAmplitude: 0.46,
          wingPhase: 3.1,
          glideAngle: 0.08,
        },
        {
          dx: 0.82,
          dy: -0.22,
          dz: 0.14,
          size: 0.41,
          wingCycle: 6.8,
          beats: 2,
          beatDuration: 0.43,
          beatAmplitude: 0.48,
          wingPhase: 5.5,
          glideAngle: 0.08,
        },
      ],
      1.7,
    ),
  ];
}

export function springFlights(): FlightGroupSpec[] {
  return [
    soar(
      {
        homeX: (stopX(2) + stopX(3)) / 2,
        trackMinX: stopX(2) - 1.5,
        trackMaxX: stopX(3) + 1.5,
        follow: 0.82,
        baseY: 6.15,
        baseZ: -6.85,
        radiusX: 3.1,
        radiusY: 0.3,
        radiusZ: 0.72,
        orbitPeriod: 30,
        orbitPhase: 0.35,
        scrollOrbitGain: 0.24,
        direction: 1,
      },
      [
        {
          dx: 0,
          dy: 0,
          dz: 0.06,
          size: 0.39,
          wingCycle: 7.4,
          beats: 2,
          beatDuration: 0.46,
          beatAmplitude: 0.64,
          wingPhase: 0.5,
        },
        {
          dx: -0.95,
          dy: 0.32,
          dz: -0.18,
          size: 0.35,
          wingCycle: 8.0,
          beats: 2,
          beatDuration: 0.48,
          beatAmplitude: 0.62,
          wingPhase: 3.1,
        },
        {
          dx: 0.85,
          dy: -0.26,
          dz: 0.14,
          size: 0.36,
          wingCycle: 6.9,
          beats: 2,
          beatDuration: 0.45,
          beatAmplitude: 0.64,
          wingPhase: 5.4,
        },
      ],
      9.3,
    ),
  ];
}

export function summerFlights(): FlightGroupSpec[] {
  return [
    soar(
      {
        homeX: stopX(4),
        trackMinX: stopX(4) - 3.8,
        trackMaxX: stopX(4) + 3.8,
        follow: 0.65,
        baseY: 5.95,
        baseZ: -6.9,
        radiusX: 3.0,
        radiusY: 0.24,
        radiusZ: 0.68,
        orbitPeriod: 38,
        orbitPhase: 0.45,
        scrollOrbitGain: 0.18,
        direction: 1,
      },
      [
        {
          dx: 0,
          dy: 0,
          dz: 0.06,
          size: 0.44,
          wingCycle: 10.2,
          beats: 1,
          beatDuration: 0.84,
          beatAmplitude: 0.5,
          wingPhase: 1.4,
          glideAngle: 0.14,
        },
        {
          dx: -1.25,
          dy: 0.32,
          dz: -0.22,
          size: 0.4,
          wingCycle: 10.8,
          beats: 1,
          beatDuration: 0.86,
          beatAmplitude: 0.48,
          wingPhase: 6.2,
          glideAngle: 0.15,
        },
      ],
      18.5,
    ),
  ];
}
