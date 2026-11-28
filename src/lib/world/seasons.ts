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
    { from: 13.0, to: 20.0, color: '#78967c' },
    { from: 35.0, to: 42.0, color: '#5f94b0' },
    { from: 46.0, to: 53.0, color: '#a87d47' },
    { from: 57.5, to: 63.5, color: '#a46d6b' },
    { from: 68.3, to: 74.7, color: '#7588a7' },
  ],
});

export const GROUND_RAMP: SeasonalRamp = scale({
  base: '#e4e5db',
  stops: [
    { from: 13.2, to: 19.8, color: '#b2c69e' },
    { from: 35.2, to: 41.8, color: '#dfd096' },
    { from: 46.2, to: 52.8, color: '#d1ac7f' },
    { from: 57.5, to: 63.5, color: '#c79c89' },
    { from: 68.5, to: 74.5, color: '#e4e5db' },
  ],
});

export const ROAD_RAMP: SeasonalRamp = scale({
  base: '#e5e7e1',
  stops: [
    { from: 13.4, to: 19.6, color: '#d4c8ae' },
    { from: 35.4, to: 41.6, color: '#dbc799' },
    { from: 46.4, to: 52.6, color: '#91877c' },
    { from: 57.5, to: 63.5, color: '#8a8076' },
    { from: 68.4, to: 74.6, color: '#e5e7e1' },
  ],
});

export const DISTANT_PEAKS_RAMP: SeasonalRamp = scale({
  base: '#9ba8be',
  stops: [
    { from: 13.0, to: 20.0, color: '#83a085' },
    { from: 35.0, to: 42.0, color: '#74a2b2' },
    { from: 46.0, to: 53.0, color: '#b38c5b' },
    { from: 57.5, to: 63.5, color: '#ae7c77' },
    { from: 68.3, to: 74.7, color: '#94a4bd' },
  ],
});

export const FAR_RIDGE_RAMP: SeasonalRamp = scale({
  base: '#c5cdd6',
  stops: [
    { from: 13.0, to: 20.0, color: '#96b192' },
    { from: 35.0, to: 42.0, color: '#8bb091' },
    { from: 46.0, to: 53.0, color: '#ba9468' },
    { from: 57.5, to: 63.5, color: '#b48780' },
    { from: 68.3, to: 74.7, color: '#c1cad5' },
  ],
});

export const NEAR_RIDGE_RAMP: SeasonalRamp = scale({
  base: '#dde1da',
  stops: [
    { from: 13.0, to: 20.0, color: '#a8c098' },
    { from: 35.0, to: 42.0, color: '#c4c788' },
    { from: 46.0, to: 53.0, color: '#ca9f77' },
    { from: 57.5, to: 63.5, color: '#c39787' },
    { from: 68.3, to: 74.7, color: '#dce0da' },
  ],
});

export const FLOOR_RAMP: SeasonalRamp = scale({
  base: '#dcd9c8',
  stops: [
    { from: 13.2, to: 19.8, color: '#d2dac0' },
    { from: 35.2, to: 41.8, color: '#e6d8aa' },
    { from: 46.2, to: 52.8, color: '#ded0b4' },
    { from: 57.5, to: 63.5, color: '#dbc8b7' },
    { from: 68.5, to: 74.5, color: '#dcd9c8' },
  ],
});

interface RampColors {
  base: THREE.Color;
  stops: THREE.Color[];
}

// The ramps never change, so each colour string is parsed once on first use.
const rampColors = new WeakMap<SeasonalRamp, RampColors>();

function colorsFor(ramp: SeasonalRamp): RampColors {
  let colors = rampColors.get(ramp);
  if (!colors) {
    colors = { base: new THREE.Color(ramp.base), stops: ramp.stops.map(stop => new THREE.Color(stop.color)) };
    rampColors.set(ramp, colors);
  }
  return colors;
}

export function sampleRampColor(ramp: SeasonalRamp, x: number, target: THREE.Color): THREE.Color {
  const colors = colorsFor(ramp);
  target.copy(colors.base);
  for (let index = 0; index < ramp.stops.length; index++) {
    const stop = ramp.stops[index];
    const t = THREE.MathUtils.smoothstep(x, stop.from, stop.to);
    if (t > 0) target.lerp(colors.stops[index], t);
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
