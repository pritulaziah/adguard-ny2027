import { MIDGROUND_DEPTHS, MIDGROUND_PRESETS } from './weather-presets';
import { WeatherStratum } from './weather-stratum';

export class MidgroundStratum extends WeatherStratum {
  constructor() {
    super(MIDGROUND_DEPTHS, MIDGROUND_PRESETS);
  }
}
