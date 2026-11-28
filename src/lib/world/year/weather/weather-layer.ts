import type * as THREE from 'three';
import type { WeatherField } from '../../paper-materials';
import { ForegroundStratum } from './foreground-stratum';
import { MidgroundStratum } from './midground-stratum';
import { SkyStratum } from './sky-stratum';
import { SEASONS } from './weather-season';

/** Three parallax strata of weather particles for every season. */
export class WeatherLayer {
  readonly fields: WeatherField[] = [];
  private readonly strata = [new SkyStratum(), new MidgroundStratum(), new ForegroundStratum()];

  constructor(
    private readonly scene: THREE.Scene,
    private readonly reduced: boolean,
    private readonly rng: () => number = Math.random,
  ) {
    for (const stratum of this.strata) {
      for (const season of SEASONS) this.fields.push(stratum.build(this.scene, season, this.reduced, this.rng));
    }
  }

  /** Removes every weather sprite and disposes its material. */
  destroy(): void {
    for (const field of this.fields) {
      field.points.removeFromParent();
      field.points.material.dispose();
    }
    this.fields.length = 0;
  }
}
