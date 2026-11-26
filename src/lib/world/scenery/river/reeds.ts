import * as THREE from 'three';
import { PaperBatch, ovalGeometry } from '../../paper-brush';
import { paperSheet } from '../../paper-materials';
import { stopX } from '../../route';
import type { SceneryContext } from '../../scene-context';

/** Small clusters of cattails swaying along the river bank. */
export function addRiverReeds(ctx: SceneryContext): void {
  const center = stopX(4);
  for (const [dx, z, scale] of [[-5, -0.85, 0.9], [-2.1, -1.15, 0.75], [1.5, -1.25, 0.65], [4.5, -0.95, 1.0]]) {
    const reeds = ctx.place('river-cattails', center + dx, z, scale);
    const batch = new PaperBatch();
    for (let i = 0; i < 5; i++) {
      const rx = (i - 2) * 0.13;
      const h = 0.55 + (i % 3) * 0.16;
      batch.add(new THREE.BoxGeometry(0.022, h, 0.02), '#678765', { x: rx, y: h / 2 });
      batch.add(ovalGeometry(0.075, 0.21, 0.025), '#92714c', { x: rx, y: h });
      const leaf = new THREE.Shape();
      leaf.moveTo(rx - 0.02, 0);
      leaf.quadraticCurveTo(rx - 0.29, h * 0.6, rx - 0.25, h * 0.8);
      leaf.quadraticCurveTo(rx - 0.05, h * 0.5, rx + 0.025, 0);
      leaf.closePath();
      batch.add(new THREE.ExtrudeGeometry(leaf, { depth: 0.018, bevelEnabled: false }), '#88a06c');
    }
    const geometry = batch.build();
    if (geometry) reeds.add(new THREE.Mesh(geometry, paperSheet()));
    ctx.animate(reeds, 'sway');
  }
}
