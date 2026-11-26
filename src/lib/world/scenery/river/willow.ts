import * as THREE from 'three';
import { PaperBatch, ovalGeometry } from '../../paper-brush';
import { paperSheet } from '../../paper-materials';
import { stopX } from '../../route';
import type { SceneryContext } from '../../scene-context';

/** One willow: a branching trunk, small crown clusters, and separate hanging twigs. */
export function addRiverWillow(ctx: SceneryContext): void {
  const center = stopX(4);
  const willow = ctx.detail('river-weeping-willow', center - 3.65, -2.15, 0.95);
  willow.cut([[-0.22, 0], [0.18, 0], [0.07, 1.22], [0.24, 2.16], [0.12, 2.22], [-0.1, 1.3]], '#89745a');
  willow.stroke([[0, 1.1], [-0.35, 1.95], [-0.91, 2.28]], '#89745a', 0.075, 0.01);
  willow.stroke([[0.04, 1.5], [0.48, 2.1], [0.94, 2.23]], '#89745a', 0.06, 0.01);
  for (const [x, y, w, h] of [[-0.76, 2.27, 0.68, 0.42], [-0.3, 2.52, 0.85, 0.5], [0.29, 2.55, 0.82, 0.5], [0.8, 2.28, 0.66, 0.42]]) {
    willow.oval(w, h, '#7b966c', x, y, -0.07);
    willow.oval(w * 0.72, h * 0.7, '#97ad7b', x - 0.04, y + 0.05, 0.02);
  }
  for (let i = 0; i < 15; i++) {
    const x = -1.08 + i * 0.15;
    const top = 2.52 - Math.pow(Math.abs(x) / 1.3, 2) * 0.55;
    const length = 0.65 + (Math.sin(i * 2.7) + 1) * 0.3;
    const twig = ctx.place('willow-hanging-twig', center - 3.65 + x * 0.95, -2.02 + (i % 3) * 0.025, 0.95, 0.34 + top * 0.95);
    const batch = new PaperBatch();
    const bend = -0.05 + Math.sin(i * 1.4) * 0.045;
    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(bend - 0.08, -length * 0.55, 0), new THREE.Vector3(bend, -length, 0));
    const points = curve.getPoints(9);
    for (let j = 1; j < points.length; j++) {
      const from = points[j - 1]!;
      const to = points[j]!;
      const mid = from.clone().add(to).multiplyScalar(0.5);
      batch.add(new THREE.BoxGeometry(from.distanceTo(to), 0.012, 0.012), '#87936b', { x: mid.x, y: mid.y, rotate: [0, 0, Math.atan2(to.y - from.y, to.x - from.x)] });
      const side = j % 2 ? -1 : 1;
      batch.add(ovalGeometry(0.055, 0.15, 0.014), (i + j) % 3 ? '#a6b981' : '#7e9a6b', { x: to.x + side * 0.035, y: to.y + 0.025, z: 0.018, rotate: [0, 0, side * -0.48] });
    }
    const geometry = batch.build();
    if (geometry) twig.add(new THREE.Mesh(geometry, paperSheet()));
    ctx.animate(twig, 'sway');
  }
  willow.stroke([[-0.2, 0.05], [-0.4, 0], [-0.52, 0.02]], '#89745a', 0.04, 0.04);
}
