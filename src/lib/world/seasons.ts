import * as THREE from 'three';
import { STRETCH, STOP_SPACING, TRACK_LENGTH, routeDistance } from './route.ts';

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
const at = (x: number): number => routeDistance(Math.round(x * STRETCH * 100) / 100);

const scale = (ramp: SeasonalRamp): SeasonalRamp => ({
  base: ramp.base,
  stops: ramp.stops.map(stop => ({ ...stop, from: at(stop.from), to: at(stop.to) })),
});

export const SEASON_BORDERS = {
  spring: routeDistance(1.5 * STOP_SPACING),
  summer: routeDistance(3.5 * STOP_SPACING),
  autumn: routeDistance(4.5 * STOP_SPACING),
  winterEnd: routeDistance(6.5 * STOP_SPACING),
} as const;

export const WALL_RAMP: SeasonalRamp = scale({
  base: '#7e8fa9',
  stops: [
    { from: 13.0, to: 20.0, color: '#748b63' },
    { from: 35.0, to: 42.0, color: '#5f8a9b' },
    { from: 46.0, to: 53.0, color: '#a87d47' },
    { from: 57.5, to: 63.5, color: '#a46d6b' },
    { from: 68.3, to: 74.7, color: '#7588a7' },
  ],
});

export const GROUND_RAMP: SeasonalRamp = scale({
  base: '#e4e5db',
  stops: [
    { from: 13.2, to: 19.8, color: '#b5c199' },
    { from: 35.2, to: 41.8, color: '#dfd0a6' },
    { from: 46.2, to: 52.8, color: '#d1ac7f' },
    { from: 57.5, to: 63.5, color: '#c79c89' },
    { from: 68.5, to: 74.5, color: '#e4e5db' },
  ],
});

export const DISTANT_PEAKS_RAMP: SeasonalRamp = scale({
  base: '#9ba8be',
  stops: [
    { from: 13.0, to: 20.0, color: '#849c77' },
    { from: 35.0, to: 42.0, color: '#729aa6' },
    { from: 46.0, to: 53.0, color: '#b38c5b' },
    { from: 57.5, to: 63.5, color: '#ae7c77' },
    { from: 68.3, to: 74.7, color: '#94a4bd' },
  ],
});

export const FAR_RIDGE_RAMP: SeasonalRamp = scale({
  base: '#c5cdd6',
  stops: [
    { from: 13.0, to: 20.0, color: '#99ab87' },
    { from: 35.0, to: 42.0, color: '#86a9ab' },
    { from: 46.0, to: 53.0, color: '#ba9468' },
    { from: 57.5, to: 63.5, color: '#b48780' },
    { from: 68.3, to: 74.7, color: '#c1cad5' },
  ],
});

export const NEAR_RIDGE_RAMP: SeasonalRamp = scale({
  base: '#dde1da',
  stops: [
    { from: 13.0, to: 20.0, color: '#aebc94' },
    { from: 35.0, to: 42.0, color: '#c8be9b' },
    { from: 46.0, to: 53.0, color: '#ca9f77' },
    { from: 57.5, to: 63.5, color: '#c39787' },
    { from: 68.3, to: 74.7, color: '#dce0da' },
  ],
});

export const FLOOR_RAMP: SeasonalRamp = scale({
  base: '#dcd9c8',
  stops: [
    { from: 13.2, to: 19.8, color: '#d5d8bc' },
    { from: 35.2, to: 41.8, color: '#e2d6b6' },
    { from: 46.2, to: 52.8, color: '#ded0b4' },
    { from: 57.5, to: 63.5, color: '#dbc8b7' },
    { from: 68.5, to: 74.5, color: '#dcd9c8' },
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

export function seasonCenter(id: SeasonId): number {
  if (id === 'winter-start') return SEASON_BORDERS.spring / 2;
  if (id === 'spring') return (SEASON_BORDERS.spring + SEASON_BORDERS.summer) / 2;
  if (id === 'summer') return (SEASON_BORDERS.summer + SEASON_BORDERS.autumn) / 2;
  if (id === 'autumn') return (SEASON_BORDERS.autumn + SEASON_BORDERS.winterEnd) / 2;
  return (SEASON_BORDERS.winterEnd + TRACK_LENGTH) / 2;
}
