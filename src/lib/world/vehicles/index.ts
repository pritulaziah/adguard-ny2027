import type * as THREE from 'three';
import { SEASON_BORDERS } from '../seasons';
import { TRACK_LENGTH, stopX } from '../route';
import { createPaperBicycle } from './bicycle';
import { createVanExhaust } from './exhaust';
import { createPaperMinivan } from './minivan';
import { createPaperPunt } from './punt';
import { softClamp } from './shared';
import { createPaperTrain } from './train';

export interface SeasonalFleet {
  update: (distance: number, delta: number, time: number, reduced: boolean) => void;
}

export function createSeasonalFleet(scene: THREE.Scene): SeasonalFleet {
  const winterTrain = createPaperTrain(scene, { festive: false });
  const springBike = createPaperBicycle(scene);
  const summerBoat = createPaperPunt(scene);
  const autumnVan = createPaperMinivan(scene);
  const updateVanExhaust = createVanExhaust(scene);
  const finaleTrain = createPaperTrain(scene, { festive: true });

  const prev = {
    winterTrain: 0,
    springBike: 20.8,
    summerBoat: SEASON_BORDERS.summer + 2.025,
    autumnVan: stopX(5) - 4.3,
    finaleTrain: stopX(7) - 2.35,
  };

  return {
    update: (distance, delta, time, reduced) => {
      const dt = Math.max(delta, 1 / 120);

      // Steam only appears once the train has picked up speed, not while it rolls out.
      const STEAM_SPEED = 2.0;

      const wtX = softClamp(distance, -10, stopX(1) + 4.2, 0.7);
      const sbX = softClamp(distance, stopX(2) - 4.5, stopX(3) + 4.0, 0.7);
      const boatX = softClamp(distance, SEASON_BORDERS.summer + 2.025, SEASON_BORDERS.autumn - 2.025, 0.7);
      const vanX = softClamp(distance, stopX(5) - 4.3, stopX(6) + 3.6, 0.7);
      const ftX = softClamp(distance, stopX(7) - 2.35, TRACK_LENGTH, 0.7);

      const wtMoving = Math.abs(wtX - prev.winterTrain) / dt > STEAM_SPEED;
      const sbMoving = Math.abs(sbX - prev.springBike) / dt > 0.08;
      const boatMoving = Math.abs(boatX - prev.summerBoat) / dt > 0.08;
      const vanMovement = vanX - prev.autumnVan;
      const vanSpeed = vanMovement / dt;
      const vanMoving = Math.abs(vanSpeed) > 0.08;
      const ftMoving = Math.abs(ftX - prev.finaleTrain) / dt > STEAM_SPEED;

      winterTrain.update(wtX, time, wtMoving, reduced);
      springBike.update(sbX, time, sbMoving, reduced);
      summerBoat.update(boatX, time, boatMoving, reduced);
      autumnVan.update(vanX, time, vanMoving, reduced);
      updateVanExhaust(vanX, vanSpeed, delta, reduced);
      finaleTrain.update(ftX, time, ftMoving, reduced);

      prev.winterTrain = wtX;
      prev.springBike = sbX;
      prev.summerBoat = boatX;
      prev.autumnVan = vanX;
      prev.finaleTrain = ftX;
    },
  };
}
