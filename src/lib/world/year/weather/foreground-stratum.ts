import { FOREGROUND_DEPTHS, FOREGROUND_PRESETS } from './weather-presets';
import { WeatherStratum } from './weather-stratum';

export class ForegroundStratum extends WeatherStratum {
  constructor() {
    super(FOREGROUND_DEPTHS, FOREGROUND_PRESETS);
  }
}
