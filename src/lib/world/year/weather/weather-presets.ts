import type { WeatherFieldOptions } from '../../paper-materials';
import type { Season } from './weather-season';

export interface WeatherPreset extends WeatherFieldOptions {
  count: number;
}

export const SKY_DEPTHS: Record<Season, readonly [number, number]> = {
  winter: [-6.2, -2.8],
  spring: [-5.8, -2.6],
  summer: [-5.8, -2.6],
  autumn: [-5.8, -2.6],
};

export const MIDGROUND_DEPTHS: Record<Season, readonly [number, number]> = {
  winter: [-1.9, 0.8],
  spring: [-1.9, 0.8],
  summer: [-1.9, 0.8],
  autumn: [-1.9, 0.8],
};

export const FOREGROUND_DEPTHS: Record<Season, readonly [number, number]> = {
  winter: [2.05, 3.35],
  spring: [2.05, 3.35],
  summer: [2.05, 3.35],
  autumn: [2.05, 3.35],
};

export const SKY_PRESETS: Record<Season, WeatherPreset> = {
  winter: {
    count: 140,
    color: '#f5f2e8',
    size: 2.2,
    fallMin: 0.06,
    fallRange: 0.14,
    driftAmp: 0.14,
    driftFreq: 0.5,
    opacity: 0.5,
    spanY: 9.0,
  },
  spring: {
    count: 110,
    color: '#f5dbd4',
    size: 2.4,
    fallMin: 0.04,
    fallRange: 0.1,
    driftAmp: 0.22,
    driftFreq: 0.45,
    opacity: 0.48,
    spanY: 8.6,
  },
  summer: {
    count: 100,
    color: '#fff3c9',
    size: 2.0,
    fallMin: -0.03,
    fallRange: 0.06,
    driftAmp: 0.2,
    driftFreq: 0.4,
    opacity: 0.42,
    spanY: 8.6,
  },
  autumn: {
    count: 160,
    color: '#e5b374',
    size: 2.5,
    fallMin: 0.06,
    fallRange: 0.12,
    driftAmp: 0.24,
    driftFreq: 0.5,
    opacity: 0.5,
    spanY: 8.6,
  },
};

export const MIDGROUND_PRESETS: Record<Season, WeatherPreset> = {
  winter: {
    count: 150,
    color: '#fff9e9',
    size: 4.0,
    fallMin: 0.11,
    fallRange: 0.24,
    driftAmp: 0.24,
    driftFreq: 0.72,
    opacity: 0.76,
  },
  spring: {
    count: 130,
    color: '#f8dcd4',
    size: 4.5,
    fallMin: 0.06,
    fallRange: 0.15,
    driftAmp: 0.34,
    driftFreq: 0.55,
    opacity: 0.74,
  },
  summer: {
    count: 110,
    color: '#fff2c4',
    size: 3.6,
    fallMin: -0.05,
    fallRange: 0.09,
    driftAmp: 0.28,
    driftFreq: 0.45,
    opacity: 0.58,
  },
  autumn: {
    count: 190,
    color: '#eab570',
    size: 4.8,
    fallMin: 0.09,
    fallRange: 0.2,
    driftAmp: 0.36,
    driftFreq: 0.65,
    opacity: 0.76,
  },
};

export const FOREGROUND_PRESETS: Record<Season, WeatherPreset> = {
  winter: {
    count: 90,
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
  },
  spring: {
    count: 80,
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
  },
  summer: {
    count: 68,
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
  },
  autumn: {
    count: 116,
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
  },
};
