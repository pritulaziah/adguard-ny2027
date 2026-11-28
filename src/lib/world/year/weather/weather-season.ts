import { TRACK_LENGTH } from '../../route';
import { SEASON_BORDERS } from '../../seasons';

export type Season = 'winter' | 'spring' | 'summer' | 'autumn';

export const SEASONS: Season[] = ['winter', 'spring', 'summer', 'autumn'];

/** Returns one build-time x for a weather particle in the given season. */
export function sampleSeasonX(season: Season, index: number, rng: () => number): number {
  switch (season) {
    case 'winter':
      return index % 2 === 0
        ? -14 + rng() * (SEASON_BORDERS.spring + 14)
        : SEASON_BORDERS.winterEnd - 1.5 + rng() * (TRACK_LENGTH - SEASON_BORDERS.winterEnd + 16);
    case 'spring':
      return SEASON_BORDERS.spring - 0.5 + rng() * (SEASON_BORDERS.summer - SEASON_BORDERS.spring + 1);
    case 'summer':
      return SEASON_BORDERS.summer - 0.5 + rng() * (SEASON_BORDERS.autumn - SEASON_BORDERS.summer + 1);
    case 'autumn':
      return SEASON_BORDERS.autumn - 0.5 + rng() * (SEASON_BORDERS.winterEnd - SEASON_BORDERS.autumn + 1);
  }
}
