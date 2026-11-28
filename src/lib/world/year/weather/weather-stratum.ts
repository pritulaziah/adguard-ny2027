import type * as THREE from 'three';
import { createWeatherField, type WeatherField } from '../../paper-materials';
import type { WeatherPreset } from './weather-presets';
import { sampleSeasonX, seasonBands, type Season, type SeasonBands } from './weather-season';

/** A built field with the data that the culling needs. */
export interface BuiltStratum {
  field: WeatherField;
  /** The x bands of the field's particles. */
  bands: SeasonBands;
  /** The farthest z of the stratum. The view is widest at that plane. */
  farZ: number;
}

/** One parallax stratum: its depth per season and its four season presets. */
export class WeatherStratum {
  constructor(
    private readonly depths: Record<Season, readonly [number, number]>,
    private readonly presets: Record<Season, WeatherPreset>,
  ) {}

  build(scene: THREE.Scene, season: Season, reduced: boolean, rng: () => number): BuiltStratum {
    const preset = this.presets[season];
    const [zMin, zMax] = this.depths[season];
    const { count, ...options } = preset;
    const minY = preset.minY ?? 0.35;
    const spanY = preset.spanY ?? 7.4;
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = sampleSeasonX(season, i, rng);
      positions[i * 3 + 1] = minY + rng() * spanY;
      positions[i * 3 + 2] = zMin + rng() * (zMax - zMin);
      seeds[i] = rng();
    }

    const field = createWeatherField(positions, seeds, options);
    field.speed.value = reduced ? 0 : 1;
    scene.add(field.points);
    return { field, bands: seasonBands(season), farZ: zMin };
  }
}
