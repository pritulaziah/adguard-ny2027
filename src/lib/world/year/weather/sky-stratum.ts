import { SKY_DEPTHS, SKY_PRESETS } from './weather-presets';
import { WeatherStratum } from './weather-stratum';

export class SkyStratum extends WeatherStratum {
  constructor() {
    super(SKY_DEPTHS, SKY_PRESETS);
  }
}
