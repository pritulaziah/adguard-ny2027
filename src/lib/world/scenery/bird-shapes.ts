import * as THREE from 'three';
import { PaperBatch } from '../paper-brush';
import { shapeFrom } from './palette';
import { BIRD_SPECIES, type BirdSpecies, type BirdSpeciesSpec } from './bird-species';
import { buildWingGeometry } from './bird-wings';

export interface BirdMeshes {
  body: THREE.BufferGeometry;
  leftWing: THREE.BufferGeometry;
  rightWing: THREE.BufferGeometry;
}

function extrude(shape: THREE.Shape, depth: number, curveSegments = 10): THREE.BufferGeometry {
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments });
}

function addBeak(batch: PaperBatch, spec: BirdSpeciesSpec, headX: number): void {
  const beak = shapeFrom(s => {
    if (spec.beakStyle === 'spear') {
      s.moveTo(headX + 0.01, 0.108);
      s.lineTo(headX + 0.36, 0.08);
      s.lineTo(headX + 0.01, 0.056);
    } else if (spec.beakStyle === 'bill') {
      s.moveTo(headX + 0.01, 0.105);
      s.lineTo(headX + 0.17, 0.09);
      s.quadraticCurveTo(headX + 0.19, 0.072, headX + 0.16, 0.054);
      s.lineTo(headX + 0.01, 0.05);
    } else if (spec.beakStyle === 'stout') {
      // Short conical finch beak.
      s.moveTo(headX, 0.104);
      s.quadraticCurveTo(headX + 0.07, 0.102, headX + 0.11, 0.07);
      s.quadraticCurveTo(headX + 0.06, 0.044, headX, 0.048);
    } else {
      s.moveTo(headX + 0.01, 0.1);
      s.lineTo(headX + 0.13, 0.074);
      s.lineTo(headX + 0.01, 0.048);
    }
    s.closePath();
  });
  batch.add(extrude(beak, 0.034), spec.palette.beak, { z: -0.017 });
}

function addTail(batch: PaperBatch, spec: BirdSpeciesSpec): void {
  const { palette, tailStyle } = spec;
  const rot: [number, number, number] = [Math.PI / 2, 0, -0.05];

  const main = shapeFrom(s => {
    if (tailStyle === 'forked-long') {
      s.moveTo(-0.26, -0.045);
      s.lineTo(-0.84, -0.24);
      s.lineTo(-0.78, -0.15);
      s.lineTo(-0.44, 0);
      s.lineTo(-0.78, 0.15);
      s.lineTo(-0.84, 0.24);
      s.lineTo(-0.26, 0.045);
    } else if (tailStyle === 'short') {
      s.moveTo(-0.28, -0.055);
      s.lineTo(-0.5, -0.13);
      s.quadraticCurveTo(-0.55, 0, -0.5, 0.13);
      s.lineTo(-0.28, 0.055);
    } else if (tailStyle === 'wedge-banded') {
      s.moveTo(-0.28, -0.055);
      s.lineTo(-0.56, -0.16);
      s.quadraticCurveTo(-0.6, 0, -0.56, 0.16);
      s.lineTo(-0.28, 0.055);
    } else {
      // Compact notched bullfinch tail.
      s.moveTo(-0.28, -0.05);
      s.lineTo(-0.64, -0.15);
      s.lineTo(-0.58, 0);
      s.lineTo(-0.64, 0.15);
      s.lineTo(-0.28, 0.05);
    }
    s.closePath();
  });
  batch.add(extrude(main, 0.022), palette.tail, { y: 0.028, rotate: rot });

  // Crisp white rump patch on bullfinches and wild geese.
  if (palette.tailAccent && (tailStyle === 'wedge-banded' || tailStyle === 'notched')) {
    const rump = shapeFrom(s => {
      s.moveTo(-0.29, -0.056);
      s.lineTo(-0.41, -0.1);
      s.quadraticCurveTo(-0.43, 0, -0.41, 0.1);
      s.lineTo(-0.29, 0.056);
      s.closePath();
    });
    batch.add(extrude(rump, 0.007), palette.tailAccent, { y: 0.033, rotate: rot });
    batch.add(extrude(rump, 0.006), palette.tailAccent, { y: 0.007, rotate: rot });
  }
}

function buildBodyGeometry(spec: BirdSpeciesSpec): THREE.BufferGeometry {
  const batch = new PaperBatch();
  const { palette, neckLength, bodyDepth } = spec;
  const halfZ = bodyDepth / 2;
  const headX = 0.34 + neckLength;
  const longNeck = neckLength > 0.15;
  const plump = spec.wingStyle === 'finch';

  // Main streamlined side-profile body centered on z = 0 for full 3D turning.
  const core = shapeFrom(s => {
    s.moveTo(-0.34, 0.01);
    s.quadraticCurveTo(-0.14, plump ? -0.145 : -0.115, 0.12, plump ? -0.135 : -0.11);
    if (longNeck) {
      s.quadraticCurveTo(0.24, -0.09, 0.29, 0.015);
      s.lineTo(headX - 0.05, 0.032);
      s.quadraticCurveTo(headX + 0.05, 0.042, headX + 0.05, 0.105);
      s.quadraticCurveTo(headX - 0.02, 0.16, headX - 0.1, 0.12);
      s.lineTo(0.22, 0.095);
    } else {
      s.quadraticCurveTo(0.26, plump ? -0.11 : -0.095, headX - 0.04, 0.02);
      s.quadraticCurveTo(headX + 0.05, 0.05, headX + 0.04, 0.11);
      s.quadraticCurveTo(headX - 0.04, plump ? 0.17 : 0.155, headX - 0.12, 0.12);
    }
    s.quadraticCurveTo(0.08, 0.125, -0.12, 0.09);
    s.quadraticCurveTo(-0.25, 0.065, -0.34, 0.04);
    s.closePath();
  });
  batch.add(extrude(core, bodyDepth), palette.body, { z: -halfZ });

  // Slightly proud dorsal cap gives clear top-down paper volume.
  const back = shapeFrom(s => {
    s.moveTo(-0.26, 0.04);
    s.quadraticCurveTo(-0.04, 0.12, 0.18, 0.114);
    s.quadraticCurveTo(longNeck ? 0.26 : headX - 0.06, 0.122, longNeck ? 0.24 : headX + 0.02, 0.095);
    s.quadraticCurveTo(0.06, 0.045, -0.26, 0.04);
    s.closePath();
  });
  batch.add(extrude(back, bodyDepth + 0.012), palette.back, { z: -(halfZ + 0.006) });

  // Black crown cap on the bullfinch head.
  if (palette.cap) {
    const cap = shapeFrom(s => {
      s.moveTo(headX - 0.14, 0.115);
      s.quadraticCurveTo(headX - 0.04, 0.175, headX + 0.048, 0.112);
      s.lineTo(headX + 0.045, 0.058);
      s.quadraticCurveTo(headX - 0.05, 0.066, headX - 0.14, 0.115);
      s.closePath();
    });
    batch.add(extrude(cap, bodyDepth + 0.016), palette.cap, { z: -(halfZ + 0.008) });
  }

  // Dark outstretched neck and head sleeve for migrating geese.
  if (palette.neck && longNeck) {
    const neck = shapeFrom(s => {
      s.moveTo(0.23, 0.012);
      s.lineTo(headX - 0.05, 0.028);
      s.quadraticCurveTo(headX + 0.055, 0.04, headX + 0.055, 0.106);
      s.quadraticCurveTo(headX - 0.02, 0.164, headX - 0.105, 0.122);
      s.lineTo(0.21, 0.098);
      s.closePath();
    });
    batch.add(extrude(neck, bodyDepth + 0.014), palette.neck, { z: -(halfZ + 0.007) });
  }

  // Crisp cheek band on both sides of the head (wild goose).
  if (palette.cheek) {
    const cheek = shapeFrom(s => {
      s.moveTo(headX - 0.055, 0.048);
      s.lineTo(headX + 0.005, 0.052);
      s.lineTo(headX - 0.005, 0.118);
      s.lineTo(headX - 0.05, 0.112);
      s.closePath();
    });
    batch.add(extrude(cheek, 0.01), palette.cheek, { z: halfZ + 0.008 });
    batch.add(extrude(cheek, 0.01), palette.cheek, { z: -(halfZ + 0.018) });
  }

  // Contrasting throat patch on both faces (barn swallow).
  if (palette.throat) {
    const throat = shapeFrom(s => {
      s.moveTo(0.08, -0.09);
      s.quadraticCurveTo(0.24, -0.075, headX - 0.01, 0.032);
      s.lineTo(headX - 0.08, 0.045);
      s.quadraticCurveTo(0.16, -0.015, 0.08, -0.09);
      s.closePath();
    });
    batch.add(extrude(throat, 0.014), palette.throat, { z: halfZ - 0.002 });
    batch.add(extrude(throat, 0.014), palette.throat, { z: -(halfZ + 0.012) });
  }

  // Breast and belly layers on both faces of the body.
  const bellyFront = palette.throat ? 0.11 : plump ? 0.3 : 0.24;
  const bellyBottom = plump ? -0.142 : -0.115;
  const bellyTop = plump ? 0.048 : -0.006;
  const belly = shapeFrom(s => {
    s.moveTo(-0.2, -0.042);
    s.quadraticCurveTo(0.02, bellyBottom, bellyFront, -0.062);
    s.quadraticCurveTo(bellyFront + 0.05, bellyTop, bellyFront - 0.03, bellyTop);
    s.quadraticCurveTo(0.0, -0.032, -0.2, -0.042);
    s.closePath();
  });
  batch.add(extrude(belly, 0.015), palette.belly, { z: halfZ - 0.002 });
  batch.add(extrude(belly, 0.015), palette.belly, { z: -(halfZ + 0.013) });

  // Outstretched trailing legs behind the tail (white stork).
  if (palette.legs) {
    const leg = shapeFrom(s => {
      s.moveTo(-0.3, -0.032);
      s.lineTo(-0.96, -0.022);
      s.lineTo(-1.03, -0.042);
      s.lineTo(-1.02, -0.004);
      s.lineTo(-0.3, -0.006);
      s.closePath();
    });
    batch.add(extrude(leg, 0.016), palette.legs, { z: -0.036 });
    batch.add(extrude(leg, 0.016), palette.legs, { z: 0.02 });
  }

  addBeak(batch, spec, headX);
  addTail(batch, spec);

  const geometry = batch.build();
  if (!geometry) throw new Error('empty bird body geometry');
  return geometry;
}

/** Builds layered 3D folded-paper body and wing geometries for one bird species. */
export function buildBirdMeshes(species: BirdSpecies): BirdMeshes {
  const spec = BIRD_SPECIES[species];
  return {
    body: buildBodyGeometry(spec),
    leftWing: buildWingGeometry(-1, spec),
    rightWing: buildWingGeometry(1, spec),
  };
}
