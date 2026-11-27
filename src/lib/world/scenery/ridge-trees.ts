import * as THREE from 'three';
import { PaperBatch, cutGeometry, ovalGeometry } from '../paper-brush';
import { paperSheet } from '../paper-materials';
import { stopX } from '../route';
import type { SceneryContext } from '../scene-context';
import { farRidgeHeight } from './ridges';

interface DistantTree {
  x: number;
  kind: 'fir' | 'round';
  color: string;
  scale: number;
}

function addTree(ctx: SceneryContext, item: DistantTree, baseY: number): void {
  const batch = new PaperBatch();
  if (item.kind === 'fir') {
    batch.add(cutGeometry([[-0.34, 0], [0, 0.92], [0.34, 0]], 0.025), item.color);
    batch.add(cutGeometry([[-0.26, 0.42], [0, 1.18], [0.26, 0.42]], 0.025), item.color, { z: 0.03 });
  } else {
    batch.add(cutGeometry([[-0.07, -0.05], [0.07, -0.05], [0.05, 0.45], [-0.05, 0.45]], 0.02), '#7d695b');
    batch.add(ovalGeometry(0.68, 0.66, 0.025), item.color, { y: 0.52, z: 0.03 });
    batch.add(ovalGeometry(0.46, 0.46, 0.025), item.color, { x: 0.25, y: 0.36, z: 0.05 });
    batch.add(ovalGeometry(0.42, 0.42, 0.025), item.color, { x: -0.23, y: 0.34, z: 0.05 });
  }

  const geometry = batch.build();
  if (!geometry) return;
  const object = new THREE.Group();
  object.name = 'distant-ridge-tree';
  object.position.set(item.x, baseY, item.kind === 'fir' ? -5.06 : -5.08);
  object.scale.set(item.scale, item.scale, 1);
  const mesh = new THREE.Mesh(geometry, paperSheet());
  mesh.name = 'distant-ridge-tree-mesh';
  object.add(mesh);
  ctx.group.add(object);
}

/** Miniature distant tree silhouettes perched along the far hill crest. */
export async function addDistantRidgeTrees(ctx: SceneryContext, pause: () => Promise<void>): Promise<void> {
  const distantTreeStops: DistantTree[] = [
    // Winter start
    { x: -7.5, kind: 'fir', color: '#6b7e8d', scale: 0.9 },
    { x: -5.8, kind: 'fir', color: '#788b9a', scale: 0.72 },
    { x: 4.5, kind: 'fir', color: '#6c808e', scale: 0.85 },
    { x: 6.2, kind: 'fir', color: '#7c909d', scale: 0.68 },
    { x: 14.8, kind: 'fir', color: '#6e838e', scale: 0.78 },
    // Spring
    { x: stopX(2) - 4.8, kind: 'round', color: '#7a9671', scale: 0.82 },
    { x: stopX(2) - 3.2, kind: 'round', color: '#8aa47d', scale: 0.66 },
    { x: stopX(2) + 3.7, kind: 'round', color: '#7e9975', scale: 0.76 },
    { x: stopX(3) - 4.8, kind: 'round', color: '#7e9975', scale: 0.76 },
    { x: stopX(3) - 3.2, kind: 'round', color: '#8aa47d', scale: 0.66 },
    { x: stopX(3) + 3.7, kind: 'round', color: '#7a9671', scale: 0.72 },
    // Summer broadleaf silhouettes along the far river bank.
    { x: stopX(4) - 2.45, kind: 'round', color: '#73988c', scale: 0.82 },
    { x: stopX(4) + 4.45, kind: 'round', color: '#7e9f91', scale: 0.9 },
    // Autumn
    { x: stopX(5) - 2.6, kind: 'round', color: '#ad7d58', scale: 0.84 },
    { x: stopX(5) - 0.9, kind: 'round', color: '#bf9160', scale: 0.68 },
    { x: stopX(5) + 5.9, kind: 'round', color: '#a86f5f', scale: 0.78 },
    { x: stopX(6) + 0.95, kind: 'round', color: '#b77d69', scale: 0.82 },
    { x: stopX(6) + 2.55, kind: 'round', color: '#c48f68', scale: 0.66 },
    // Winter finale
    { x: stopX(7) - 3.4, kind: 'fir', color: '#6a7f90', scale: 0.88 },
    { x: stopX(7) - 1.7, kind: 'fir', color: '#798e9e', scale: 0.72 },
    { x: stopX(7) + 6.1, kind: 'fir', color: '#697f90', scale: 0.82 },
  ];

  let placed = 0;
  for (const item of distantTreeStops) {
    addTree(ctx, item, -0.08 + farRidgeHeight(item.x) - 0.2);
    placed++;
    if (placed % 6 === 0) await pause();
  }
}
