import * as THREE from 'three';
import { PaperBatch, ovalGeometry, starGeometry } from '../paper-brush';
import { paperSheet } from '../paper-materials';
import { stopX } from '../route';
import { seasonCenter } from '../seasons';
import type { SceneryContext } from '../scene-context';
import { addSkyClouds } from './clouds';
import { addDistantBirds } from './distant-birds';
import { shapeFrom } from './palette';

function addObject(parent: THREE.Object3D, name: string, batch: PaperBatch, x: number, y: number, z: number): void {
  const geometry = batch.build();
  if (!geometry) return;
  const object = new THREE.Group();
  object.name = name;
  object.position.set(x, y, z);
  const mesh = new THREE.Mesh(geometry, paperSheet());
  mesh.name = `${name}-mesh`;
  object.add(mesh);
  parent.add(object);
}

function addMoon(parent: THREE.Object3D, x: number, y: number): void {
  const batch = new PaperBatch();
  // Winter crescent moons built cleanly from two matching Bezier arcs (no horn pinch).
  const crescent = shapeFrom(s => {
    s.moveTo(0.26, 0.62);
    s.bezierCurveTo(-0.46, 0.66, -0.78, 0.08, -0.5, -0.44);
    s.bezierCurveTo(-0.26, -0.82, 0.28, -0.72, 0.44, -0.42);
    s.bezierCurveTo(0.06, -0.5, -0.24, -0.26, -0.24, 0.08);
    s.bezierCurveTo(-0.24, 0.4, -0.02, 0.56, 0.26, 0.62);
    s.closePath();
  });
  batch.add(new THREE.ExtrudeGeometry(crescent, { depth: 0.025, bevelEnabled: false, curveSegments: 18 }), '#efe6cb');
  addObject(parent, 'paper-moon', batch, x, y, -8.1);
}

function addStar(parent: THREE.Object3D, x: number, y: number, radius: number): void {
  const batch = new PaperBatch();
  batch.add(starGeometry(radius, 0.02), '#f2e5be');
  addObject(parent, 'paper-star', batch, x, y, -8.15);
}

function addSun(parent: THREE.Object3D): void {
  const batch = new PaperBatch();
  // Warm soft paper sun framed cleanly inside the summer stop (clear of Spring, Autumn, and title).
  batch.add(ovalGeometry(1.48, 1.48, 0.02), '#b8cab8');
  batch.add(ovalGeometry(1.02, 1.02, 0.02), '#f5e2b2', { z: 0.07 });
  addObject(parent, 'paper-sun', batch, seasonCenter('summer') - 0.1, 8.65, -6.85);
}

/** Soft sky clouds, winter moons & stars, the summer sun, and distant birds. */
export async function addSkyDetails(ctx: SceneryContext, pause: () => Promise<void>): Promise<void> {
  addSkyClouds(ctx.group);
  await pause();

  addMoon(ctx.group, -6.8, 8.9);
  addMoon(ctx.group, stopX(7) + 10.8, 8.8);

  const starSpots: Array<[number, number, number]> = [
    [-9.2, 9.2, 0.14],
    [-1.8, 9.5, 0.12],
    [7.8, 9.2, 0.15],
    [12.5, 9.4, 0.11],
    [stopX(7) - 5.5, 9.1, 0.15],
    [stopX(7) + 1.8, 9.5, 0.13],
    [stopX(7) + 9.2, 8.9, 0.14],
  ];
  for (const [sx, sy, sr] of starSpots) addStar(ctx.group, sx, sy, sr);
  await pause();

  addSun(ctx.group);
  addDistantBirds(ctx);

  await pause();
}
