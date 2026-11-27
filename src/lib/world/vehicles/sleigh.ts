import * as THREE from 'three';
import { PaperBatch } from '../paper-brush';
import { paperSheet } from '../paper-materials';
import { bar, type MovingVehicle } from './shared';

export type SleighStyle = 'winter' | 'festive';
const SLEIGH_SCALE = 0.6;
const REAR_X = -1.12;
export const SLEIGH_REAR_X = REAR_X * SLEIGH_SCALE;

function ink(batch: PaperBatch, shape: THREE.Shape, color: string, z: number, x = 0, y = 0): void {
  batch.add(new THREE.ShapeGeometry(shape, 64), color, { x, y, z });
}

function inkPolygon(batch: PaperBatch, points: number[][], color: string, z: number, x = 0, y = 0): void {
  const shape = new THREE.Shape();
  points.forEach(([px, py], i) => i ? shape.lineTo(px, py) : shape.moveTo(px, py));
  shape.closePath();
  ink(batch, shape, color, z, x, y);
}

function runnerShape(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(REAR_X, 0.025);
  s.lineTo(0.84, 0.025);
  s.bezierCurveTo(1.18, 0.025, 1.4, 0.22, 1.36, 0.43);
  s.bezierCurveTo(1.34, 0.52, 1.24, 0.51, 1.25, 0.42);
  s.bezierCurveTo(1.27, 0.25, 1.07, 0.135, 0.83, 0.135);
  s.lineTo(REAR_X, 0.135);
  s.quadraticCurveTo(-1.19, 0.085, REAR_X, 0.025);
  s.closePath();
  return s;
}

function sideShape(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(-0.75, 0.49);
  s.quadraticCurveTo(-0.98, 0.76, -1.0, 1.27);
  s.quadraticCurveTo(-1.0, 1.43, -0.9, 1.4);
  s.bezierCurveTo(-0.89, 1.13, -0.78, 0.89, -0.64, 0.76);
  s.lineTo(0.43, 0.76);
  s.quadraticCurveTo(0.65, 0.78, 0.76, 0.93);
  s.quadraticCurveTo(0.9, 1.05, 0.93, 0.9);
  s.quadraticCurveTo(0.95, 0.63, 0.68, 0.49);
  s.quadraticCurveTo(-0.05, 0.42, -0.75, 0.49);
  s.closePath();
  return s;
}

function gift(batch: PaperBatch, x: number, width: number, height: number, color: string): void {
  const base = 0.79;
  inkPolygon(batch, [[-width / 2, 0], [width / 2, 0], [width / 2, height], [-width / 2, height]], color, -0.02, x, base);
  inkPolygon(batch, [[-width / 2 - 0.015, height - 0.04], [width / 2 + 0.015, height - 0.04], [width / 2 + 0.015, height + 0.015], [-width / 2 - 0.015, height + 0.015]], color, 0, x, base);
  inkPolygon(batch, [[-0.025, 0], [0.025, 0], [0.025, height + 0.015], [-0.025, height + 0.015]], '#f0dfb6', 0.02, x, base);
  inkPolygon(batch, [[-width / 2, -0.02], [width / 2, -0.02], [width / 2, 0.02], [-width / 2, 0.02]], '#f0dfb6', 0.04, x, base + height * 0.48);
  const bow = new THREE.Shape();
  bow.moveTo(0, 0);
  bow.bezierCurveTo(-0.26, 0.02, -0.19, 0.18, -0.07, 0.11);
  bow.lineTo(0, 0.025);
  bow.bezierCurveTo(0.15, 0.21, 0.28, 0.08, 0.07, 0.015);
  bow.lineTo(0, 0);
  bow.closePath();
  ink(batch, bow, '#e8d4a3', 0.06, x, base + height + 0.015);
}

/** A side-profile paper cutout with a seat and a curved wooden back. */
export function createPaperSleigh(scene: THREE.Scene, style: SleighStyle): MovingVehicle {
  const festive = style === 'festive';
  const group = new THREE.Group();
  group.name = `paper-sleigh-${style}`;
  const batch = new PaperBatch();
  const wood = festive ? '#9f5b4e' : '#a97c56';
  const edge = festive ? '#d8b477' : '#d6b68a';
  const darkWood = '#76604b';

  // The far runner is hidden in profile, as with the far wheels of the other vehicles.
  const runnerColor = festive ? '#ba9659' : darkWood;
  batch.add(new THREE.ExtrudeGeometry(runnerShape(), { depth: 0.055, bevelEnabled: false, curveSegments: 64 }), runnerColor, { z: 0.25 }, runnerColor);
  for (const x of [-0.58, 0.52]) {
    bar(batch, x - 0.07, 0.12, x + 0.06, 0.53, 0.085, darkWood, 0.27, 0.045);
  }
  // The seat and body share a single profile. No hidden transverse walls protrude.
  const cushion = new THREE.Shape();
  cushion.moveTo(-0.62, 0.74);
  cushion.lineTo(0.46, 0.74);
  cushion.quadraticCurveTo(0.51, 0.78, 0.46, 0.8);
  cushion.lineTo(-0.62, 0.8);
  cushion.quadraticCurveTo(-0.68, 0.78, -0.62, 0.74);
  cushion.closePath();
  ink(batch, cushion, festive ? '#657a62' : '#687e72', 0.1);
  // More curve samples keep the enlarged inspection view smooth as well.
  batch.add(new THREE.ExtrudeGeometry(sideShape(), { depth: 0.04, bevelEnabled: false, curveSegments: 64 }), wood, { z: 0.3 }, wood);
  const trim = new THREE.Shape();
  trim.moveTo(-0.57, 0.66);
  trim.quadraticCurveTo(0, 0.62, 0.55, 0.68);
  trim.lineTo(0.57, 0.71);
  trim.quadraticCurveTo(0, 0.66, -0.59, 0.69);
  trim.closePath();
  ink(batch, trim, edge, 0.365);

  if (festive) {
    gift(batch, -0.32, 0.49, 0.51, '#648574');
    gift(batch, 0.23, 0.43, 0.34, '#d1a86c');
  } else {
    // The blanket bends over the seat edge and hangs down the near side.
    const blanket = new THREE.Shape();
    blanket.moveTo(-0.38, 0.83);
    blanket.quadraticCurveTo(-0.08, 0.86, 0.23, 0.83);
    blanket.lineTo(0.31, 0.76);
    blanket.lineTo(0.27, 0.43);
    blanket.quadraticCurveTo(0.02, 0.39, -0.26, 0.45);
    blanket.lineTo(-0.29, 0.75);
    blanket.closePath();
    ink(batch, blanket, '#768f86', 0.405);
    for (const x of [-0.2, -0.02, 0.16]) {
      inkPolygon(batch, [[x - 0.012, 0.45], [x + 0.012, 0.45], [x + 0.035, 0.82], [x + 0.011, 0.82]], '#e2d6b9', 0.45);
    }
    for (let i = 0; i < 9; i++) {
      const x = -0.22 + i * 0.055;
      bar(batch, x, 0.44, x - 0.009, 0.39, 0.012, '#ded1b0', 0.447, 0.01);
    }
  }

  const geometry = batch.build();
  if (geometry) {
    // Keep only paper thickness, with the existing gaps between colored layers.
    geometry.scale(SLEIGH_SCALE, SLEIGH_SCALE, 0.16);
    const mesh = new THREE.Mesh(geometry, paperSheet());
    mesh.name = 'paper-sleigh-body';
    group.add(mesh);
  }
  scene.add(group);
  return {
    group,
    update(x, time, moving, reduced) {
      const bob = moving && !reduced ? Math.sin(time * 9) * 0.006 : 0;
      group.position.set(x, 0.34 + bob, 0);
    },
  };
}
