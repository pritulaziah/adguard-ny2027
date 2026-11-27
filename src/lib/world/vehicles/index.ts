import type * as THREE from 'three';
import { SEASON_BORDERS } from '../seasons';
import { stopX } from '../route';
import { FINALE_SLEIGH_X } from '../finale';
import { createPaperBicycle } from './bicycle';
import { createVanExhaust } from './exhaust';
import { createPaperMinivan } from './minivan';
import { createPaperPunt } from './punt';
import { softClamp } from './shared';
import { createPaperSleigh } from './sleigh';
import { createSleighSnow } from './sleigh-snow';

export interface SeasonalFleet {
  update: (distance: number, delta: number, time: number, reduced: boolean, finaleOffset?: number) => void;
}

export function createSeasonalFleet(scene: THREE.Scene): SeasonalFleet {
  const winterSleigh = createPaperSleigh(scene, 'winter');
  const winterSnow = createSleighSnow(scene, 'paper-winter-snow');
  const springBike = createPaperBicycle(scene);
  const summerBoat = createPaperPunt(scene);
  const autumnVan = createPaperMinivan(scene);
  const updateVanExhaust = createVanExhaust(scene);
  const finaleSleigh = createPaperSleigh(scene, 'festive');
  const finaleSnow = createSleighSnow(scene, 'paper-festive-snow');

  const prev = {
    winterSleigh: 0,
    springBike: 20.8,
    summerBoat: SEASON_BORDERS.summer + 2.025,
    autumnVan: stopX(5) - 4.3,
    finaleSleigh: stopX(7) - 2.35,
  };

  return {
    update: (distance, delta, time, reduced, finaleOffset = 0) => {
      const dt = Math.max(delta, 1 / 120);

      const wtX = softClamp(distance, -10, stopX(1) + 4.2, 0.7);
      const sbX = softClamp(distance, stopX(2) - 4.5, stopX(3) + 4.0, 0.7);
      const boatX = softClamp(distance, SEASON_BORDERS.summer + 2.025, SEASON_BORDERS.autumn - 2.025, 0.7);
      const vanX = softClamp(distance, stopX(5) - 4.3, stopX(6) + 3.6, 0.7);
      const ftX = softClamp(distance, stopX(7) - 2.35, FINALE_SLEIGH_X, 0.45) + finaleOffset;

      const winterSpeed = (wtX - prev.winterSleigh) / dt;
      const sbMoving = Math.abs(sbX - prev.springBike) / dt > 0.08;
      const boatMoving = Math.abs(boatX - prev.summerBoat) / dt > 0.08;
      const vanMovement = vanX - prev.autumnVan;
      const vanSpeed = vanMovement / dt;
      const vanMoving = Math.abs(vanSpeed) > 0.08;
      const finaleSpeed = (ftX - prev.finaleSleigh) / dt;

      winterSleigh.update(wtX, time, Math.abs(winterSpeed) > 0.08, reduced);
      winterSnow(wtX, winterSpeed, delta, reduced);
      springBike.update(sbX, time, sbMoving, reduced);
      summerBoat.update(boatX, time, boatMoving, reduced);
      autumnVan.update(vanX, time, vanMoving, reduced);
      updateVanExhaust(vanX, vanSpeed, delta, reduced);
      finaleSleigh.update(ftX, time, Math.abs(finaleSpeed) > 0.08, reduced);
      finaleSnow(ftX, finaleSpeed, delta, reduced);

      prev.winterSleigh = wtX;
      prev.springBike = sbX;
      prev.summerBoat = boatX;
      prev.autumnVan = vanX;
      prev.finaleSleigh = ftX;
    },
  };
}
