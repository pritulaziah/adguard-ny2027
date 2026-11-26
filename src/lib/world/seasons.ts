import * as THREE from 'three';
import { STRETCH } from './route';

export type SeasonId = 'winter-start' | 'spring' | 'summer' | 'autumn' | 'winter-end';

export interface SeasonalStop {
  from: number;
  to: number;
  color: string;
}

export interface SeasonalRamp {
  base: string;
  stops: SeasonalStop[];
}

/** Scenes are stretched, so every border and gradient stop scales with them. */
const at = (x: number): number => Math.round(x * STRETCH * 100) / 100;

const scale = (ramp: SeasonalRamp): SeasonalRamp => ({
  base: ramp.base,
  stops: ramp.stops.map(stop => ({ ...stop, from: at(stop.from), to: at(stop.to) })),
});

export const SEASON_BORDERS = {
  spring: at(16.5),
  summer: at(27.5),
  autumn: at(38.5),
  winterEnd: at(59.8),
} as const;

export const WALL_RAMP: SeasonalRamp = scale({
  base: '#7e8fa9',
  stops: [
    { from: 13.0, to: 20.0, color: '#748b63' },
    { from: 24.0, to: 31.0, color: '#5f8a9b' },
    { from: 35.0, to: 42.0, color: '#a87d47' },
    { from: 46.5, to: 52.5, color: '#a46d6b' },
    { from: 56.6, to: 63.0, color: '#7588a7' },
  ],
});

export const GROUND_RAMP: SeasonalRamp = scale({
  base: '#e4e5db',
  stops: [
    { from: 13.2, to: 19.8, color: '#b5c199' },
    { from: 24.2, to: 30.8, color: '#dfd0a6' },
    { from: 35.2, to: 41.8, color: '#d1ac7f' },
    { from: 46.5, to: 52.5, color: '#c79c89' },
    { from: 56.8, to: 62.8, color: '#e4e5db' },
  ],
});

export const DISTANT_PEAKS_RAMP: SeasonalRamp = scale({
  base: '#9ba8be',
  stops: [
    { from: 13.0, to: 20.0, color: '#849c77' },
    { from: 24.0, to: 31.0, color: '#729aa6' },
    { from: 35.0, to: 42.0, color: '#b38c5b' },
    { from: 46.5, to: 52.5, color: '#ae7c77' },
    { from: 56.6, to: 63.0, color: '#94a4bd' },
  ],
});

export const FAR_RIDGE_RAMP: SeasonalRamp = scale({
  base: '#c5cdd6',
  stops: [
    { from: 13.0, to: 20.0, color: '#99ab87' },
    { from: 24.0, to: 31.0, color: '#86a9ab' },
    { from: 35.0, to: 42.0, color: '#ba9468' },
    { from: 46.5, to: 52.5, color: '#b48780' },
    { from: 56.6, to: 63.0, color: '#c1cad5' },
  ],
});

export const NEAR_RIDGE_RAMP: SeasonalRamp = scale({
  base: '#dde1da',
  stops: [
    { from: 13.0, to: 20.0, color: '#aebc94' },
    { from: 24.0, to: 31.0, color: '#c8be9b' },
    { from: 35.0, to: 42.0, color: '#ca9f77' },
    { from: 46.5, to: 52.5, color: '#c39787' },
    { from: 56.6, to: 63.0, color: '#dce0da' },
  ],
});

export const FLOOR_RAMP: SeasonalRamp = scale({
  base: '#dcd9c8',
  stops: [
    { from: 13.2, to: 19.8, color: '#d5d8bc' },
    { from: 24.2, to: 30.8, color: '#e2d6b6' },
    { from: 35.2, to: 41.8, color: '#ded0b4' },
    { from: 46.5, to: 52.5, color: '#dbc8b7' },
    { from: 56.8, to: 62.8, color: '#dcd9c8' },
  ],
});

const scratchColor = new THREE.Color();

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function sampleRampColor(ramp: SeasonalRamp, x: number, target: THREE.Color): THREE.Color {
  target.set(ramp.base);
  for (const stop of ramp.stops) {
    const t = smoothstep(stop.from, stop.to, x);
    if (t > 0) {
      scratchColor.set(stop.color);
      target.lerp(scratchColor, t);
    }
  }
  return target;
}

export function seasonAt(distance: number): SeasonId {
  if (distance < SEASON_BORDERS.spring) return 'winter-start';
  if (distance < SEASON_BORDERS.summer) return 'spring';
  if (distance < SEASON_BORDERS.autumn) return 'summer';
  if (distance < SEASON_BORDERS.winterEnd) return 'autumn';
  return 'winter-end';
}
