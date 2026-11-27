import * as THREE from 'three';
import { PaperBatch, leafGeometry, shapeGeometry, strokeGeometry } from '../../paper-brush';
import { paperSheet } from '../../paper-materials';
import { stopX } from '../../route';
import type { SceneryContext } from '../../scene-context';
import { shapeFrom } from '../palette';

/** A curved trunk supports a broad crown with long curtains of willow leaves. */
export function addRiverWillow(ctx: SceneryContext): void {
  const x = stopX(4) - 4.0;
  const scale = 1.08;
  const willow = ctx.detail('river-weeping-willow', x, -2.15, scale);
  const crown = shapeFrom(s => {
    s.moveTo(-1.32, 2.5);
    s.bezierCurveTo(-1.38, 2.98, -0.96, 3.28, -0.58, 3.2);
    s.bezierCurveTo(-0.3, 3.64, 0.42, 3.55, 0.63, 3.23);
    s.bezierCurveTo(1.12, 3.28, 1.4, 2.86, 1.3, 2.49);
    s.quadraticCurveTo(0.68, 2.77, 0.12, 2.64);
    s.quadraticCurveTo(-0.62, 2.8, -1.32, 2.5);
    s.closePath();
  });
  willow.shape(crown, '#658665', 0, 0, -0.36);
  const trunk = shapeFrom(s => {
    s.moveTo(-0.27, 0);
    s.quadraticCurveTo(0.04, 0.65, -0.08, 1.65);
    s.quadraticCurveTo(-0.18, 2.23, -0.58, 2.83);
    s.lineTo(-0.43, 2.9);
    s.quadraticCurveTo(-0.03, 2.53, 0.1, 2.05);
    s.quadraticCurveTo(0.35, 2.55, 0.76, 2.91);
    s.lineTo(0.86, 2.8);
    s.quadraticCurveTo(0.29, 2.14, 0.2, 1.53);
    s.quadraticCurveTo(0.13, 0.57, 0.3, 0);
    s.closePath();
  });
  willow.shape(trunk, '#89745a', 0, 0, -0.025);
  willow.stroke([[-0.07, 1.71], [-0.45, 2.38], [-1.05, 2.72]], '#89745a', 0.065, -0.02);
  willow.stroke([[0.13, 1.97], [0.33, 2.77], [0.13, 3.14]], '#89745a', 0.055, -0.02);

  for (let i = 0; i < 19; i++) {
    const offset = -1.21 + i * 0.134;
    const top = 3.32 - Math.pow(Math.abs(offset) / 1.4, 2) * 0.64;
    const length = 1.38 + (Math.sin(i * 2.7) + 1) * 0.31;
    const bend = Math.sin(i * 1.4) * 0.07;
    const width = 0.085 + (i % 3) * 0.022;
    const curtain = shapeFrom(s => {
      s.moveTo(-width, 0);
      s.bezierCurveTo(-width * 1.5, -length * 0.3, bend - width, -length * 0.82, bend, -length);
      s.bezierCurveTo(bend + width, -length * 0.76, width * 1.4, -length * 0.25, width, 0);
      s.quadraticCurveTo(0, 0.1, -width, 0);
      s.closePath();
    });
    const front = i % 3 !== 0;
    // Separate the full paper volumes, including the leaves, while the strands sway.
    const layer = front ? i - Math.floor(i / 3) - 1 : Math.floor(i / 3);
    const depth = front ? 0.065 + layer * 0.028 : -0.27 + layer * 0.028;
    const twig = ctx.place('willow-hanging-twig', x + offset * scale,
      -2.15 + depth * scale, scale, 0.34 + top * scale);
    const batch = new PaperBatch();
    batch.add(shapeGeometry(curtain, 0.006), front ? '#87a571' : '#6c8e65');
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-0.04, -length * 0.55, 0),
      new THREE.Vector3(bend, -length, 0),
    );
    const points = curve.getPoints(12);
    batch.add(strokeGeometry(points.map(p => [p.x, p.y]), 0.012, 0.004), '#73835a', { z: 0.01 });
    for (let j = 1; j < points.length; j++) {
      const p = points[j]!;
      const side = j % 2 ? -1 : 1;
      batch.add(leafGeometry(0.065, 0.21, 0.004), (i + j) % 3 ? '#abc386' : '#789965', {
        x: p.x, y: p.y, z: 0.018, rotate: [0, 0, Math.PI + side * 0.48],
      });
    }
    const geometry = batch.build();
    if (geometry) twig.add(new THREE.Mesh(geometry, paperSheet()));
    ctx.animate(twig, 'sway');
  }
  willow.stroke([[-0.2, 0.05], [-0.4, 0], [-0.52, 0.02]], '#89745a', 0.04, 0.04);
}
