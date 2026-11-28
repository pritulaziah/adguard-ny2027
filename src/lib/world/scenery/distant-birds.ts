import * as THREE from 'three';
import { paperSheet } from '../paper-materials';
import { TRACK_LENGTH } from '../route';
import { SEASON_BORDERS, seasonCenter } from '../seasons';
import type { SceneryContext } from '../scene-context';
import { DistantBirdSeason, type BirdSeason, type FlightGroup } from '../birds';
import { buildBirdMeshes, type BirdMeshes } from './bird-shapes';
import { BIRD_SPECIES, type BirdSpecies } from './bird-species';
import { autumnFlights, winterEndFlights } from './distant-birds-autumn';
import { springFlights, summerFlights, winterStartFlights } from './distant-birds-flights';

interface SeasonSetup {
  season: BirdSeason;
  species: BirdSpecies;
  fadeInStart: number;
  fadeInEnd: number;
  fadeOutStart: number;
  fadeOutEnd: number;
  motionSpan: number;
  flights: FlightGroup[];
}

function makeInstanced(geometry: THREE.BufferGeometry, count: number, name: string): THREE.InstancedMesh {
  const mesh = new THREE.InstancedMesh(geometry, paperSheet(), count);
  mesh.name = name;
  mesh.frustumCulled = false;
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  return mesh;
}

function addSeasonGroup(ctx: SceneryContext, setup: SeasonSetup, cache: Map<BirdSpecies, BirdMeshes>): void {
  const centerX = seasonCenter(setup.season);
  const count = setup.flights.reduce((total, flight) => total + flight.members.length, 0);
  const group = ctx.place(`distant-birds-${setup.season}`, centerX, 0, 1, 0);

  let meshes = cache.get(setup.species);
  if (!meshes) {
    meshes = buildBirdMeshes(setup.species);
    cache.set(setup.species, meshes);
  }

  const spec = BIRD_SPECIES[setup.species];
  const prefix = `distant-birds-${setup.season}-${setup.species}`;
  const bodies = makeInstanced(meshes.body, count, `${prefix}-bodies`);
  const leftWings = makeInstanced(meshes.leftWing, count, `${prefix}-wings-left`);
  const rightWings = makeInstanced(meshes.rightWing, count, `${prefix}-wings-right`);
  group.add(bodies, leftWings, rightWings);

  const season = new DistantBirdSeason({
    season: setup.season,
    species: setup.species,
    wingOffset: spec.wingOffset,
    dorsalTilt: spec.dorsalTilt,
    centerX,
    fadeInStart: setup.fadeInStart,
    fadeInEnd: setup.fadeInEnd,
    fadeOutStart: setup.fadeOutStart,
    fadeOutEnd: setup.fadeOutEnd,
    flights: setup.flights,
    bodies,
    leftWings,
    rightWings,
  });
  group.userData.distantBirds = season;
  group.userData.motionSpan = setup.motionSpan;

  // Populate initial matrices at route start so winter-start appears on frame 1.
  group.visible = season.update(0, 1 / 60, 0, true);
  ctx.animate(group, 'distant-birds');
}

/** One distinct 3D folded-paper bird species per season, moving along with reader scroll. */
export function addDistantBirds(ctx: SceneryContext): void {
  const seasons: SeasonSetup[] = [
    {
      season: 'winter-start',
      species: 'bullfinch',
      motionSpan: 26,
      fadeInStart: -10,
      fadeInEnd: -9,
      fadeOutStart: SEASON_BORDERS.spring - 2.6,
      fadeOutEnd: SEASON_BORDERS.spring - 0.3,
      flights: winterStartFlights(),
    },
    {
      season: 'spring',
      species: 'swallow',
      motionSpan: 30,
      fadeInStart: SEASON_BORDERS.spring - 0.2,
      fadeInEnd: SEASON_BORDERS.spring + 2.2,
      fadeOutStart: SEASON_BORDERS.summer - 2.4,
      fadeOutEnd: SEASON_BORDERS.summer - 0.2,
      flights: springFlights(),
    },
    {
      season: 'summer',
      species: 'stork',
      motionSpan: 26,
      fadeInStart: SEASON_BORDERS.summer - 0.1,
      fadeInEnd: SEASON_BORDERS.summer + 2.2,
      fadeOutStart: SEASON_BORDERS.autumn - 2.4,
      fadeOutEnd: SEASON_BORDERS.autumn - 0.2,
      flights: summerFlights(),
    },
    {
      season: 'autumn',
      species: 'goose',
      motionSpan: 30,
      fadeInStart: SEASON_BORDERS.autumn - 0.1,
      fadeInEnd: SEASON_BORDERS.autumn + 2.2,
      fadeOutStart: SEASON_BORDERS.winterEnd - 2.4,
      fadeOutEnd: SEASON_BORDERS.winterEnd - 0.2,
      flights: autumnFlights(),
    },
    {
      season: 'winter-end',
      species: 'bullfinch',
      motionSpan: 28,
      fadeInStart: SEASON_BORDERS.winterEnd - 0.1,
      fadeInEnd: SEASON_BORDERS.winterEnd + 2.2,
      fadeOutStart: TRACK_LENGTH + 10,
      fadeOutEnd: TRACK_LENGTH + 11,
      flights: winterEndFlights(),
    },
  ];
  const cache = new Map<BirdSpecies, BirdMeshes>();
  for (const setup of seasons) addSeasonGroup(ctx, setup, cache);
}
