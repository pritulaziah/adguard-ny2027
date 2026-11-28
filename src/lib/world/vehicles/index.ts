import type * as THREE from 'three';
import { FINALE_CAR_X } from '../finale';
import { SEASON_BORDERS } from '../seasons';
import { createVanExhaust } from './exhaust';
import { createPaperRetroVan } from './retro-van';
import { createSnowTrail } from './snow-trail';

export interface SeasonalFleet {
  update: (distance: number, delta: number, time: number, reduced: boolean, finaleOffset?: number) => void;
}

export function createSeasonalFleet(scene: THREE.Scene): SeasonalFleet {
  const retroVan = createPaperRetroVan(scene);
  const updateExhaust = createVanExhaust(scene);
  const updateSnowTrail = createSnowTrail(scene, 'paper-van-snow');

  let prevX = 0;

  return {
    update: (distance, delta, time, reduced, finaleOffset = 0) => {
      const dt = Math.max(delta, 1 / 120);
      const vanX = Math.max(-10, Math.min(distance, FINALE_CAR_X)) + finaleOffset;
      const speed = (vanX - prevX) / dt;
      const moving = Math.abs(speed) > 0.08;

      retroVan.update(vanX, time, moving, reduced);
      updateExhaust(vanX, speed, delta, reduced, retroVan.group.position.y - 0.34, retroVan.group.rotation.z);
      const onSnow = vanX < SEASON_BORDERS.spring || vanX > SEASON_BORDERS.winterEnd;
      updateSnowTrail(vanX, onSnow ? speed : 0, delta, reduced);

      prevX = vanX;
    },
  };
}
