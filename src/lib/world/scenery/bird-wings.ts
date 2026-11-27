import * as THREE from 'three';
import { PaperBatch } from '../paper-brush';
import { shapeFrom } from './palette';
import type { BirdSpeciesSpec } from './bird-species';

function extrude(shape: THREE.Shape, depth: number, curveSegments = 10): THREE.BufferGeometry {
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments });
}

function buildWingMain(side: -1 | 1, spec: BirdSpeciesSpec): THREE.Shape {
  const sp = spec.wingSpan;
  const s = side;
  return shapeFrom(shape => {
    if (spec.wingStyle === 'scythe') {
      shape.moveTo(0.14, 0);
      shape.quadraticCurveTo(0.24, s * sp * 0.34, 0.02, s * sp * 0.66);
      shape.quadraticCurveTo(-0.14, s * sp * 0.86, -0.34, s * sp);
      shape.quadraticCurveTo(-0.28, s * sp * 0.68, -0.2, s * sp * 0.38);
      shape.quadraticCurveTo(-0.18, s * sp * 0.16, -0.15, 0);
    } else if (spec.wingStyle === 'broad') {
      shape.moveTo(0.24, 0);
      shape.quadraticCurveTo(0.28, s * sp * 0.4, 0.18, s * sp * 0.78);
      shape.quadraticCurveTo(0.1, s * sp * 0.96, -0.06, s * sp);
      shape.quadraticCurveTo(-0.26, s * sp * 0.96, -0.34, s * sp * 0.74);
      shape.quadraticCurveTo(-0.36, s * sp * 0.36, -0.28, 0);
    } else if (spec.wingStyle === 'angled') {
      shape.moveTo(0.17, 0);
      shape.quadraticCurveTo(0.28, s * sp * 0.42, 0.1, s * sp * 0.68);
      shape.quadraticCurveTo(-0.04, s * sp * 0.88, -0.24, s * sp);
      shape.quadraticCurveTo(-0.28, s * sp * 0.68, -0.22, s * sp * 0.34);
      shape.quadraticCurveTo(-0.21, s * sp * 0.14, -0.18, 0);
    } else {
      // Compact rounded bullfinch wing.
      shape.moveTo(0.19, 0);
      shape.quadraticCurveTo(0.26, s * sp * 0.38, 0.14, s * sp * 0.76);
      shape.quadraticCurveTo(0.03, s * sp * 0.98, -0.11, s * sp);
      shape.quadraticCurveTo(-0.25, s * sp * 0.88, -0.28, s * sp * 0.5);
      shape.quadraticCurveTo(-0.26, s * sp * 0.2, -0.21, 0);
    }
    shape.closePath();
  });
}

function buildWingOverlay(side: -1 | 1, spec: BirdSpeciesSpec): THREE.Shape {
  const sp = spec.wingSpan;
  const s = side;
  return shapeFrom(shape => {
    if (spec.wingStyle === 'broad') {
      // White stork black outer primaries and trailing flight feathers.
      shape.moveTo(0.06, s * sp * 0.54);
      shape.quadraticCurveTo(0.09, s * sp * 0.88, -0.06, s * sp);
      shape.quadraticCurveTo(-0.26, s * sp * 0.96, -0.34, s * sp * 0.74);
      shape.quadraticCurveTo(-0.35, s * sp * 0.36, -0.28, s * sp * 0.05);
      shape.quadraticCurveTo(-0.18, s * sp * 0.32, -0.12, s * sp * 0.5);
    } else if (spec.wingStyle === 'scythe') {
      shape.moveTo(0.06, s * sp * 0.6);
      shape.quadraticCurveTo(-0.12, s * sp * 0.84, -0.34, s * sp);
      shape.quadraticCurveTo(-0.28, s * sp * 0.74, -0.23, s * sp * 0.58);
    } else if (spec.wingStyle === 'angled') {
      shape.moveTo(0.12, s * sp * 0.62);
      shape.quadraticCurveTo(-0.04, s * sp * 0.86, -0.24, s * sp);
      shape.quadraticCurveTo(-0.27, s * sp * 0.74, -0.24, s * sp * 0.6);
    } else {
      shape.moveTo(0.1, s * sp * 0.64);
      shape.quadraticCurveTo(0.02, s * sp * 0.9, -0.11, s * sp);
      shape.quadraticCurveTo(-0.24, s * sp * 0.86, -0.26, s * sp * 0.62);
    }
    shape.closePath();
  });
}

/** Builds a layered 3D folded-paper wing for one bird species and side. */
export function buildWingGeometry(side: -1 | 1, spec: BirdSpeciesSpec): THREE.BufferGeometry {
  const batch = new PaperBatch();
  const { palette, wingSpan: sp } = spec;
  const s = side;
  const rot: [number, number, number] = [Math.PI / 2, 0, 0];

  const main = buildWingMain(side, spec);
  batch.add(extrude(main, 0.018), palette.wingTop, { y: 0.018, rotate: rot });
  batch.add(extrude(main, 0.014), palette.wingUnder, { y: 0, rotate: rot });

  const overlay = buildWingOverlay(side, spec);
  batch.add(extrude(overlay, 0.007), palette.wingTip, { y: 0.024, rotate: rot });
  batch.add(extrude(overlay, 0.006), palette.wingTip, { y: -0.013, rotate: rot });

  // Crisp snow-white wingbar across the bullfinch wing.
  if (palette.wingPatch) {
    const bar = shapeFrom(shape => {
      shape.moveTo(0.05, s * sp * 0.14);
      shape.lineTo(-0.03, s * sp * 0.72);
      shape.lineTo(-0.14, s * sp * 0.68);
      shape.lineTo(-0.07, s * sp * 0.12);
      shape.closePath();
    });
    batch.add(extrude(bar, 0.007), palette.wingPatch, { y: 0.024, rotate: rot });
    batch.add(extrude(bar, 0.006), palette.wingPatch, { y: -0.013, rotate: rot });
  }

  const geometry = batch.build();
  if (!geometry) throw new Error('empty bird wing geometry');
  return geometry;
}
