import type * as THREE from 'three';
import { createWeatherField, type WeatherField } from '../paper-materials';
import { SEASON_BORDERS } from '../seasons';
import { TRACK_LENGTH } from '../route';

/** Three parallax strata of weather particles for every season. */
export function createWeather(scene: THREE.Scene, reduced: boolean): WeatherField[] {
  const fields: WeatherField[] = [];

  const addWeatherZone = (
    count: number,
    sampleX: (index: number) => number,
    zMin: number,
    zMax: number,
    options: Parameters<typeof createWeatherField>[2],
  ): void => {
    const minY = options.minY ?? 0.35;
    const spanY = options.spanY ?? 7.4;
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = sampleX(i);
      positions[i * 3 + 1] = minY + Math.random() * spanY;
      positions[i * 3 + 2] = zMin + Math.random() * (zMax - zMin);
      seeds[i] = Math.random();
    }
    const field = createWeatherField(positions, seeds, options);
    field.speed.value = reduced ? 0 : 1;
    fields.push(field);
    scene.add(field.points);
  };

  const sampleWinterX = (i: number): number =>
    i % 2 === 0
      ? -14 + Math.random() * (SEASON_BORDERS.spring + 14)
      : SEASON_BORDERS.winterEnd - 1.5 + Math.random() * (TRACK_LENGTH - SEASON_BORDERS.winterEnd + 16);
  const sampleSpringX = (): number =>
    SEASON_BORDERS.spring - 0.5 + Math.random() * (SEASON_BORDERS.summer - SEASON_BORDERS.spring + 1.0);
  const sampleSummerX = (): number =>
    SEASON_BORDERS.summer - 0.5 + Math.random() * (SEASON_BORDERS.autumn - SEASON_BORDERS.summer + 1.0);
  const sampleAutumnX = (): number =>
    SEASON_BORDERS.autumn - 0.5 + Math.random() * (SEASON_BORDERS.winterEnd - SEASON_BORDERS.autumn + 1.0);

  // 1. Far sky stratum (slow parallax behind hills and trees).
  addWeatherZone(140, sampleWinterX, -6.2, -2.8, {
    color: '#f5f2e8',
    size: 2.2,
    fallMin: 0.06,
    fallRange: 0.14,
    driftAmp: 0.14,
    driftFreq: 0.5,
    opacity: 0.5,
    spanY: 9.0,
  });
  addWeatherZone(110, sampleSpringX, -5.8, -2.6, {
    color: '#f5dbd4',
    size: 2.4,
    fallMin: 0.04,
    fallRange: 0.1,
    driftAmp: 0.22,
    driftFreq: 0.45,
    opacity: 0.48,
    spanY: 8.6,
  });
  addWeatherZone(100, sampleSummerX, -5.8, -2.6, {
    color: '#fff3c9',
    size: 2.0,
    fallMin: -0.03,
    fallRange: 0.06,
    driftAmp: 0.2,
    driftFreq: 0.4,
    opacity: 0.42,
    spanY: 8.6,
  });
  addWeatherZone(160, sampleAutumnX, -5.8, -2.6, {
    color: '#e5b374',
    size: 2.5,
    fallMin: 0.06,
    fallRange: 0.12,
    driftAmp: 0.24,
    driftFreq: 0.5,
    opacity: 0.5,
    spanY: 8.6,
  });

  // 2. Midground action stratum around the vehicles and animals.
  addWeatherZone(150, sampleWinterX, -1.9, 0.8, {
    color: '#fff9e9',
    size: 4.0,
    fallMin: 0.11,
    fallRange: 0.24,
    driftAmp: 0.24,
    driftFreq: 0.72,
    opacity: 0.76,
  });
  addWeatherZone(130, sampleSpringX, -1.9, 0.8, {
    color: '#f8dcd4',
    size: 4.5,
    fallMin: 0.06,
    fallRange: 0.15,
    driftAmp: 0.34,
    driftFreq: 0.55,
    opacity: 0.74,
  });
  addWeatherZone(110, sampleSummerX, -1.9, 0.8, {
    color: '#fff2c4',
    size: 3.6,
    fallMin: -0.05,
    fallRange: 0.09,
    driftAmp: 0.28,
    driftFreq: 0.45,
    opacity: 0.58,
  });
  addWeatherZone(190, sampleAutumnX, -1.9, 0.8, {
    color: '#eab570',
    size: 4.8,
    fallMin: 0.09,
    fallRange: 0.2,
    driftAmp: 0.36,
    driftFreq: 0.65,
    opacity: 0.76,
  });

  // 3. Close foreground bokeh stratum (moves 1.7x-2.3x faster than track on scroll and mouse move).
  addWeatherZone(90, sampleWinterX, 2.05, 3.35, {
    color: '#fffdf4',
    size: 17.5,
    fallMin: 0.18,
    fallRange: 0.32,
    driftAmp: 0.32,
    driftFreq: 0.82,
    opacity: 0.36,
    minY: 0.55,
    spanY: 4.8,
    soft: true,
  });
  addWeatherZone(80, sampleSpringX, 2.05, 3.35, {
    color: '#fbdcd4',
    size: 18.0,
    fallMin: 0.1,
    fallRange: 0.2,
    driftAmp: 0.4,
    driftFreq: 0.68,
    opacity: 0.34,
    minY: 0.55,
    spanY: 4.8,
    soft: true,
  });
  addWeatherZone(68, sampleSummerX, 2.05, 3.35, {
    color: '#fff4cb',
    size: 15.5,
    fallMin: -0.07,
    fallRange: 0.12,
    driftAmp: 0.34,
    driftFreq: 0.55,
    opacity: 0.3,
    minY: 0.55,
    spanY: 4.8,
    soft: true,
  });
  addWeatherZone(116, sampleAutumnX, 2.05, 3.35, {
    color: '#e8a25d',
    size: 18.5,
    fallMin: 0.14,
    fallRange: 0.26,
    driftAmp: 0.42,
    driftFreq: 0.76,
    opacity: 0.36,
    minY: 0.55,
    spanY: 4.8,
    soft: true,
  });

  return fields;
}
