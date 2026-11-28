import type * as THREE from 'three';
import type { WeatherField } from '../../paper-materials';
import { ForegroundStratum } from './foreground-stratum';
import { MidgroundStratum } from './midground-stratum';
import { SkyStratum } from './sky-stratum';
import { SEASONS, type SeasonBands } from './weather-season';

/** Slack for particle drift and pointer parallax at the edge of the view. */
const EDGE_SLACK = 2;
/** The visibility is recomputed only after the camera moves this far. */
const CULL_STEP = 0.25;

/** True when a particle band can reach the camera view. */
function reaches(bands: SeasonBands, cameraX: number, reach: number): boolean {
  for (const [start, end] of bands) {
    if (cameraX >= start - reach && cameraX <= end + reach) return true;
  }
  return false;
}

/** Three parallax strata of weather particles for every season. */
export class WeatherLayer {
  readonly fields: WeatherField[] = [];
  private readonly bands: SeasonBands[] = [];
  private readonly farZ: number[] = [];
  private readonly strata = [new SkyStratum(), new MidgroundStratum(), new ForegroundStratum()];
  private first = true;
  private lastX = 0;
  private lastZ = 0;
  private lastAspect = 0;
  private lastFov = 0;

  constructor(
    private readonly scene: THREE.Scene,
    private readonly reduced: boolean,
    private readonly rng: () => number = Math.random,
  ) {
    for (const stratum of this.strata) {
      for (const season of SEASONS) {
        const built = stratum.build(this.scene, season, this.reduced, this.rng);
        this.fields.push(built.field);
        this.bands.push(built.bands);
        this.farZ.push(built.farZ);
      }
    }
  }

  /**
   * Draws only the fields whose particles can reach the view. A hidden field
   * keeps its buffers and returns with one visibility flip, so no rebuild
   * runs when the reader goes back to its season.
   */
  update(camera: THREE.PerspectiveCamera): void {
    const moved =
      this.first ||
      Math.abs(camera.position.x - this.lastX) >= CULL_STEP ||
      Math.abs(camera.position.z - this.lastZ) > 0.01 ||
      Math.abs(camera.aspect - this.lastAspect) > 0.001 ||
      Math.abs(camera.fov - this.lastFov) > 0.001;
    if (!moved) return;
    this.first = false;
    this.lastX = camera.position.x;
    this.lastZ = camera.position.z;
    this.lastAspect = camera.aspect;
    this.lastFov = camera.fov;

    const halfTan = Math.tan((camera.fov * Math.PI) / 360);
    for (let i = 0; i < this.fields.length; i++) {
      // A farther plane shows a wider slice of the route, so it sets the reach.
      const reach = (camera.position.z - this.farZ[i]) * halfTan * camera.aspect + EDGE_SLACK;
      const visible = reaches(this.bands[i], camera.position.x, reach);
      if (this.fields[i].points.visible !== visible) this.fields[i].points.visible = visible;
    }
  }

  /** Removes every weather sprite and disposes its material. */
  destroy(): void {
    for (const field of this.fields) {
      field.points.removeFromParent();
      field.points.material.dispose();
    }
    this.fields.length = 0;
    this.bands.length = 0;
    this.farZ.length = 0;
  }
}
