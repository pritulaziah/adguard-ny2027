import type * as THREE from 'three';
import { FINALE_CAR_X } from '../finale';
import { SEASON_BORDERS } from '../seasons';
import { VanExhaust } from './exhaust';
import { PaperRetroVan } from './retro-van';
import { SnowTrail } from './snow-trail';

/** The one retro van, its exhaust, and its winter trail. */
export class SeasonalFleet {
  private readonly van: PaperRetroVan;
  private readonly exhaust: VanExhaust;
  private readonly snowTrail: SnowTrail;
  private prevX = 0;
  private disposed = false;

  constructor(scene: THREE.Scene) {
    this.van = new PaperRetroVan(scene);
    this.exhaust = new VanExhaust(scene);
    this.snowTrail = new SnowTrail(scene, 'paper-van-snow');
  }

  update(distance: number, delta: number, time: number, reduced: boolean, finaleOffset = 0): void {
    if (this.disposed) return;
    const dt = Math.max(delta, 1 / 120);
    const vanX = Math.max(-10, Math.min(distance, FINALE_CAR_X)) + finaleOffset;
    const speed = (vanX - this.prevX) / dt;
    const moving = Math.abs(speed) > 0.08;

    this.van.update(vanX, time, moving, reduced);
    this.exhaust.update(vanX, speed, delta, reduced, this.van.group.position.y - 0.34, this.van.group.rotation.z);
    const onSnow = vanX < SEASON_BORDERS.spring || vanX > SEASON_BORDERS.winterEnd;
    this.snowTrail.update(vanX, onSnow ? speed : 0, delta, reduced);

    this.prevX = vanX;
  }

  /** Removes the van, its puffs, and its trail, and releases their geometry. */
  destroy(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.van.destroy();
    this.exhaust.destroy();
    this.snowTrail.destroy();
  }
}
