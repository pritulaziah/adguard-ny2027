import { TRACK_LENGTH } from '../../route';
import { SEASON_BORDERS } from '../../seasons';

export type Season = 'winter' | 'spring' | 'summer' | 'autumn';

export const SEASONS: Season[] = ['winter', 'spring', 'summer', 'autumn'];

/** One x band that holds the particles of a season. */
export type SeasonBand = readonly [start: number, end: number];
export type SeasonBands = readonly SeasonBand[];

/**
 * The x bands of one season. Winter has two bands: the opening scene and the
 * finale. The weather culling and the particle placement share these bands.
 */
export function seasonBands(season: Season): SeasonBands {
  switch (season) {
    case 'winter':
      return [
        [-14, SEASON_BORDERS.spring],
        [SEASON_BORDERS.winterEnd - 1.5, TRACK_LENGTH + 14.5],
      ];
    case 'spring':
      return [[SEASON_BORDERS.spring - 0.5, SEASON_BORDERS.summer + 0.5]];
    case 'summer':
      return [[SEASON_BORDERS.summer - 0.5, SEASON_BORDERS.autumn + 0.5]];
    case 'autumn':
      return [[SEASON_BORDERS.autumn - 0.5, SEASON_BORDERS.winterEnd + 0.5]];
  }
}

/** Returns one build-time x for a weather particle in the given season. */
export function sampleSeasonX(season: Season, index: number, rng: () => number): number {
  const [start, end] = seasonBands(season)[season === 'winter' ? index % 2 : 0];
  return start + rng() * (end - start);
}
