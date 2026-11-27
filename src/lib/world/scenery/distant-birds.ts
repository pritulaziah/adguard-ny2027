import * as THREE from 'three';
import { paperSheet } from '../paper-materials';
import { TRACK_LENGTH, stopX } from '../route';
import { SEASON_BORDERS, seasonCenter } from '../seasons';
import type { SceneryContext } from '../scene-context';
import {
  createFlightRuntime,
  updateBirdSeason,
  type BirdSeason,
  type DistantBirdMember,
  type DistantBirdSeasonData,
  type FlightGroupSpec,
  type SoarFlightSpec,
} from '../distant-birds-motion';
import { buildBirdMeshes, type BirdMeshes } from './bird-shapes';
import { BIRD_SPECIES, type BirdSpecies } from './bird-species';

interface MemberInput {
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

interface SeasonSetup {
  season: BirdSeason;
  species: BirdSpecies;
  fadeInStart: number;
  fadeInEnd: number;
  fadeOutStart: number;
  fadeOutEnd: number;
  motionSpan: number;
  flights: FlightGroupSpec[];
}

function buildMembers(items: MemberInput[], seedBase: number): DistantBirdMember[] {
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

function soar(
  spec: Omit<SoarFlightSpec, 'mode' | 'runtime' | 'members'>,
  items: MemberInput[],
  seedBase: number,
): SoarFlightSpec {
  return { mode: 'soar', ...spec, runtime: createFlightRuntime(), members: buildMembers(items, seedBase) };
}

function winterStartFlights(): FlightGroupSpec[] {
  return [
    soar(
      {
        homeX: (stopX(0) + stopX(1)) / 2, trackMinX: stopX(0), trackMaxX: stopX(1) + 1.4, follow: 0.78,
        baseY: 5.95, baseZ: -6.85, radiusX: 2.6, radiusY: 0.24, radiusZ: 0.62,
        orbitPeriod: 34, orbitPhase: 0.25, scrollOrbitGain: 0.2, direction: 1,
      },
      [
        { dx: 0, dy: 0, dz: 0.05, size: 0.4, wingCycle: 7.4, beats: 2, beatDuration: 0.52, beatAmplitude: 0.6, wingPhase: 0.4 },
        { dx: -0.85, dy: 0.28, dz: -0.16, size: 0.36, wingCycle: 8.1, beats: 2, beatDuration: 0.54, beatAmplitude: 0.58, wingPhase: 3.1 },
        { dx: 0.72, dy: -0.22, dz: 0.14, size: 0.37, wingCycle: 7.0, beats: 2, beatDuration: 0.5, beatAmplitude: 0.6, wingPhase: 5.5 },
      ],
      1.7,
    ),
  ];
}

function springFlights(): FlightGroupSpec[] {
  return [
    soar(
      {
        homeX: (stopX(2) + stopX(3)) / 2, trackMinX: stopX(2) - 1.5, trackMaxX: stopX(3) + 1.5, follow: 0.82,
        baseY: 6.15, baseZ: -6.85, radiusX: 3.1, radiusY: 0.3, radiusZ: 0.72,
        orbitPeriod: 30, orbitPhase: 0.35, scrollOrbitGain: 0.24, direction: 1,
      },
      [
        { dx: 0, dy: 0, dz: 0.06, size: 0.39, wingCycle: 7.4, beats: 2, beatDuration: 0.46, beatAmplitude: 0.64, wingPhase: 0.5 },
        { dx: -0.95, dy: 0.32, dz: -0.18, size: 0.35, wingCycle: 8.0, beats: 2, beatDuration: 0.48, beatAmplitude: 0.62, wingPhase: 3.1 },
        { dx: 0.85, dy: -0.26, dz: 0.14, size: 0.36, wingCycle: 6.9, beats: 2, beatDuration: 0.45, beatAmplitude: 0.64, wingPhase: 5.4 },
      ],
      9.3,
    ),
  ];
}

function summerFlights(): FlightGroupSpec[] {
  return [
    soar(
      {
        homeX: stopX(4), trackMinX: stopX(4) - 3.8, trackMaxX: stopX(4) + 3.8, follow: 0.65,
        baseY: 5.95, baseZ: -6.9, radiusX: 3.0, radiusY: 0.24, radiusZ: 0.68,
        orbitPeriod: 38, orbitPhase: 0.45, scrollOrbitGain: 0.18, direction: 1,
      },
      [
        { dx: 0, dy: 0, dz: 0.06, size: 0.44, wingCycle: 10.2, beats: 1, beatDuration: 0.84, beatAmplitude: 0.5, wingPhase: 1.4, glideAngle: 0.14 },
        { dx: -1.25, dy: 0.32, dz: -0.22, size: 0.4, wingCycle: 10.8, beats: 1, beatDuration: 0.86, beatAmplitude: 0.48, wingPhase: 6.2, glideAngle: 0.15 },
      ],
      18.5,
    ),
  ];
}

function autumnFlights(): FlightGroupSpec[] {
  return [
    {
      mode: 'flock',
      minX: SEASON_BORDERS.autumn + 3.2, maxX: SEASON_BORDERS.winterEnd - 1.3,
      passBefore: 4.6, passAfter: 5.4, baseY: 6.55, climb: 0.36, arcY: 0.22, baseZ: -6.95,
      flightDuration: 15, period: 16.8, scrollSpeedGain: 0.55, runtime: createFlightRuntime(),
      members: buildMembers([
        { dx: 0, dy: 0, dz: 0, size: 0.38, wingCycle: 6.6, beats: 3, beatDuration: 0.56, beatAmplitude: 0.56, wingPhase: 0.3 },
        { dx: -0.76, dy: 0.28, dz: -0.14, size: 0.35, wingCycle: 7.0, beats: 2, beatDuration: 0.58, beatAmplitude: 0.56, wingPhase: 2.1 },
        { dx: -1.54, dy: 0.52, dz: -0.26, size: 0.33, wingCycle: 7.4, beats: 2, beatDuration: 0.56, beatAmplitude: 0.55, wingPhase: 4.4 },
        { dx: -2.32, dy: 0.74, dz: -0.38, size: 0.31, wingCycle: 6.8, beats: 3, beatDuration: 0.57, beatAmplitude: 0.55, wingPhase: 1.5 },
        { dx: -0.7, dy: -0.24, dz: 0.12, size: 0.36, wingCycle: 7.2, beats: 2, beatDuration: 0.58, beatAmplitude: 0.56, wingPhase: 3.6 },
        { dx: -1.44, dy: -0.46, dz: 0.22, size: 0.34, wingCycle: 6.7, beats: 2, beatDuration: 0.56, beatAmplitude: 0.55, wingPhase: 5.2 },
        { dx: -2.22, dy: -0.64, dz: 0.32, size: 0.32, wingCycle: 7.6, beats: 2, beatDuration: 0.58, beatAmplitude: 0.55, wingPhase: 0.8 },
      ], 31.2),
    },
  ];
}

function winterEndFlights(): FlightGroupSpec[] {
  return [
    soar(
      {
        homeX: stopX(7) + 2.8, trackMinX: SEASON_BORDERS.winterEnd + 4.0, trackMaxX: TRACK_LENGTH - 6.0, follow: 0.72,
        baseY: 5.88, baseZ: -6.9, radiusX: 2.6, radiusY: 0.22, radiusZ: 0.62,
        orbitPeriod: 36, orbitPhase: 0.6, scrollOrbitGain: 0.18, direction: 1,
      },
      [
        { dx: 0, dy: 0, dz: 0.04, size: 0.39, wingCycle: 7.8, beats: 2, beatDuration: 0.54, beatAmplitude: 0.58, wingPhase: 0.9 },
        { dx: -0.92, dy: 0.26, dz: -0.16, size: 0.36, wingCycle: 8.4, beats: 2, beatDuration: 0.56, beatAmplitude: 0.56, wingPhase: 4.1 },
      ],
      47.4,
    ),
  ];
}

function makeInstanced(geometry: THREE.BufferGeometry, count: number, name: string): THREE.InstancedMesh {
  const mesh = new THREE.InstancedMesh(geometry, paperSheet(), count);
  mesh.name = name;
  mesh.frustumCulled = false;
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  return mesh;
}

function addSeasonGroup(
  ctx: SceneryContext,
  setup: SeasonSetup,
  cache: Map<BirdSpecies, BirdMeshes>,
): void {
  const centerX = seasonCenter(setup.season);
  const count = setup.flights.reduce((total, flight) => total + flight.members.length, 0);
  const group = ctx.place(`distant-birds-${setup.season}`, centerX, 0, 1, 0);

  let meshes = cache.get(setup.species);
  if (!meshes) {
    meshes = buildBirdMeshes(setup.species);
    cache.set(setup.species, meshes);
  }

  const prefix = `distant-birds-${setup.season}-${setup.species}`;
  const bodies = makeInstanced(meshes.body, count, `${prefix}-bodies`);
  const leftWings = makeInstanced(meshes.leftWing, count, `${prefix}-wings-left`);
  const rightWings = makeInstanced(meshes.rightWing, count, `${prefix}-wings-right`);
  group.add(bodies, leftWings, rightWings);

  const data: DistantBirdSeasonData = {
    season: setup.season,
    species: setup.species,
    wingOffset: BIRD_SPECIES[setup.species].wingOffset,
    centerX,
    fadeInStart: setup.fadeInStart,
    fadeInEnd: setup.fadeInEnd,
    fadeOutStart: setup.fadeOutStart,
    fadeOutEnd: setup.fadeOutEnd,
    flights: setup.flights,
    bodies,
    leftWings,
    rightWings,
  };
  group.userData.distantBirds = data;
  group.userData.motionSpan = setup.motionSpan;

  // Populate initial matrices at route start so winter-start appears on frame 1.
  group.visible = updateBirdSeason(data, 0, 1 / 60, 0, true);
  ctx.animate(group, 'distant-birds');
}

/** One distinct 3D folded-paper bird species per season, moving along with reader scroll. */
export function addDistantBirds(ctx: SceneryContext): void {
  const seasons: SeasonSetup[] = [
    {
      season: 'winter-start', species: 'bullfinch', motionSpan: 26,
      fadeInStart: -10, fadeInEnd: -9,
      fadeOutStart: SEASON_BORDERS.spring - 2.6, fadeOutEnd: SEASON_BORDERS.spring - 0.3,
      flights: winterStartFlights(),
    },
    {
      season: 'spring', species: 'swallow', motionSpan: 30,
      fadeInStart: SEASON_BORDERS.spring - 0.2, fadeInEnd: SEASON_BORDERS.spring + 2.2,
      fadeOutStart: SEASON_BORDERS.summer - 2.4, fadeOutEnd: SEASON_BORDERS.summer - 0.2,
      flights: springFlights(),
    },
    {
      season: 'summer', species: 'stork', motionSpan: 26,
      fadeInStart: SEASON_BORDERS.summer - 0.1, fadeInEnd: SEASON_BORDERS.summer + 2.2,
      fadeOutStart: SEASON_BORDERS.autumn - 2.4, fadeOutEnd: SEASON_BORDERS.autumn - 0.2,
      flights: summerFlights(),
    },
    {
      season: 'autumn', species: 'goose', motionSpan: 30,
      fadeInStart: SEASON_BORDERS.autumn - 0.1, fadeInEnd: SEASON_BORDERS.autumn + 2.2,
      fadeOutStart: SEASON_BORDERS.winterEnd - 2.4, fadeOutEnd: SEASON_BORDERS.winterEnd - 0.2,
      flights: autumnFlights(),
    },
    {
      season: 'winter-end', species: 'bullfinch', motionSpan: 28,
      fadeInStart: SEASON_BORDERS.winterEnd - 0.1, fadeInEnd: SEASON_BORDERS.winterEnd + 2.2,
      fadeOutStart: TRACK_LENGTH + 10, fadeOutEnd: TRACK_LENGTH + 11,
      flights: winterEndFlights(),
    },
  ];
  const cache = new Map<BirdSpecies, BirdMeshes>();
  for (const setup of seasons) addSeasonGroup(ctx, setup, cache);
}
