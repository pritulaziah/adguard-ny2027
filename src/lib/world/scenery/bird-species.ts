export type BirdSpecies = 'bullfinch' | 'swallow' | 'stork' | 'goose';

export type WingStyle = 'finch' | 'scythe' | 'broad' | 'angled';
export type TailStyle = 'notched' | 'forked-long' | 'short' | 'wedge-banded';
export type BeakStyle = 'stout' | 'short' | 'spear' | 'bill';

export interface BirdPalette {
  body: string;
  back: string;
  belly: string;
  beak: string;
  tail: string;
  tailAccent?: string;
  cap?: string;
  throat?: string;
  neck?: string;
  cheek?: string;
  legs?: string;
  wingTop: string;
  wingTip: string;
  wingUnder: string;
  wingPatch?: string;
}

export interface BirdSpeciesSpec {
  wingStyle: WingStyle;
  tailStyle: TailStyle;
  beakStyle: BeakStyle;
  wingSpan: number;
  neckLength: number;
  bodyDepth: number;
  wingOffset: [number, number, number];
  palette: BirdPalette;
}

/** Four distinct 3D folded-paper bird species, one per season. */
export const BIRD_SPECIES: Record<BirdSpecies, BirdSpeciesSpec> = {
  // Winter: plump bullfinch with crimson breast, black cap, and snow-white wingbar.
  bullfinch: {
    wingStyle: 'finch',
    tailStyle: 'notched',
    beakStyle: 'stout',
    wingSpan: 0.96,
    neckLength: 0,
    bodyDepth: 0.116,
    wingOffset: [0.03, 0.03, 0.054],
    palette: {
      body: '#7a8a99',
      back: '#647585',
      belly: '#d6594c',
      cap: '#272f38',
      beak: '#2e363f',
      tail: '#262e37',
      tailAccent: '#f5f0e3',
      wingTop: '#2a333d',
      wingTip: '#1f262e',
      wingUnder: '#4c5763',
      wingPatch: '#f5f0e3',
    },
  },
  // Spring: sleek barn swallow with rust throat, scythe wings, and long forked tail.
  swallow: {
    wingStyle: 'scythe',
    tailStyle: 'forked-long',
    beakStyle: 'short',
    wingSpan: 1.16,
    neckLength: 0,
    bodyDepth: 0.092,
    wingOffset: [0.04, 0.03, 0.042],
    palette: {
      body: '#2f475e',
      back: '#223548',
      belly: '#f2e9d6',
      throat: '#cf7154',
      beak: '#d9ac60',
      tail: '#233649',
      wingTop: '#334d65',
      wingTip: '#203142',
      wingUnder: '#6f8799',
    },
  },
  // Summer: stately white stork with red spear beak, trailing red legs, and black primaries.
  stork: {
    wingStyle: 'broad',
    tailStyle: 'short',
    beakStyle: 'spear',
    wingSpan: 1.24,
    neckLength: 0.28,
    bodyDepth: 0.112,
    wingOffset: [0.03, 0.035, 0.052],
    palette: {
      body: '#f1ead8',
      back: '#e2dac6',
      belly: '#faf5e8',
      beak: '#cf5d47',
      legs: '#c95843',
      tail: '#dcd4c0',
      wingTop: '#f3ede0',
      wingTip: '#2e3840',
      wingUnder: '#e2dac8',
    },
  },
  // Autumn: migrating wild goose with dark neck, white cheek strap, and angled wings.
  goose: {
    wingStyle: 'angled',
    tailStyle: 'wedge-banded',
    beakStyle: 'bill',
    wingSpan: 1.18,
    neckLength: 0.24,
    bodyDepth: 0.11,
    wingOffset: [0.02, 0.032, 0.05],
    palette: {
      body: '#6f5649',
      back: '#533f36',
      belly: '#e2cfb4',
      neck: '#2c2627',
      cheek: '#f3ebd8',
      beak: '#c79b58',
      tail: '#2e2829',
      tailAccent: '#f1e8d6',
      wingTop: '#7c6051',
      wingTip: '#362b29',
      wingUnder: '#b89b84',
    },
  },
};
