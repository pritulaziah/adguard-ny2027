import * as THREE from 'three';
import { seasonalPaperMaterial, type ScalarUniform } from '../paper-materials';
import { TRACK_LENGTH } from '../route';
import { FLOOR_RAMP, WALL_RAMP } from '../seasons';

// Push the sky wall deep behind the three ridge layers for strong travel parallax.
const SKY_WALL_Z = -9.6;

/** Deep panoramic sky wall and floor. */
export function createWalls(scene: THREE.Scene, cameraX: ScalarUniform): void {
  // Deep panoramic sky wall guarantees no exposed gap on any viewport ratio and
  // shifts slowly behind the distant peaks, rolling hills, and foreground planes.
  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(TRACK_LENGTH + 115, 28),
    seasonalPaperMaterial(WALL_RAMP, {
      verticalWash: 0.055,
      grainStrength: 0.075,
      grainScale: 0.35,
      cameraX,
      colorSpread: 0.45,
    }),
  );
  wall.name = 'seasonal-paper-wall';
  wall.position.set(TRACK_LENGTH / 2, 8.5, SKY_WALL_Z);
  scene.add(wall);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(TRACK_LENGTH + 115, 26),
    seasonalPaperMaterial(FLOOR_RAMP, { grainStrength: 0.07 }),
  );
  floor.name = 'seasonal-paper-floor';
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(TRACK_LENGTH / 2, -1.22, 2);
  scene.add(floor);
}
