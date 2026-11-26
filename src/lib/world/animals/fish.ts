import * as THREE from 'three';
import type { AnimalBuilderContext } from './shared';
import { cut, oval } from '../paper-shapes';
import { CREAM, addSparkleEye, shapeFrom } from './shared';

/** Playful coral-apricot fish leaping cleanly above the summer sea waves. */
export function addFish(ctx: AnimalBuilderContext, x: number, z = -0.34): void {
  const host = ctx.place('paper-fish', x, z, 0.94);

  // Small frothy water-splash arc right below the leaping fish.
  const splash = new THREE.Group();
  splash.position.set(-0.22, 0.1, 0.08);
  splash.visible = false;
  host.add(splash);
  cut(splash, [[-0.3, 0.02], [-0.14, 0.13], [0, 0.06], [0.16, 0.14], [0.3, 0.02]], '#eef4ee', 0, 0, 0, 0.016);
  oval(splash, 0.065, 0.065, '#f2f7f1', -0.22, 0.14, 0, 0.014);
  oval(splash, 0.055, 0.055, '#f2f7f1', 0.24, 0.16, 0, 0.014);

  // Graceful teardrop leaping fish body facing left-upward.
  const fishShape = shapeFrom(s => {
    s.moveTo(-0.34, 0.02);
    s.bezierCurveTo(-0.24, 0.24, 0.12, 0.26, 0.34, 0.02);
    s.bezierCurveTo(0.14, -0.22, -0.22, -0.2, -0.34, 0.02);
    s.closePath();
  });
  const body = cut(host, fishShape, '#df825d', 0, 0.42, 0.03, 0.044);
  body.rotation.z = -0.18;

  // Warm cream koi/clownfish stripes and soft belly.
  const stripe1 = shapeFrom(s => {
    s.moveTo(-0.1, 0.18);
    s.quadraticCurveTo(-0.04, 0, -0.1, -0.16);
    s.lineTo(-0.01, -0.17);
    s.quadraticCurveTo(0.05, 0, -0.01, 0.19);
    s.closePath();
  });
  cut(body, stripe1, CREAM, 0, 0, 0.044, 0.016);

  const stripe2 = shapeFrom(s => {
    s.moveTo(0.11, 0.15);
    s.quadraticCurveTo(0.16, 0, 0.11, -0.13);
    s.lineTo(0.19, -0.1);
    s.quadraticCurveTo(0.23, 0, 0.19, 0.12);
    s.closePath();
  });
  cut(body, stripe2, CREAM, 0, 0, 0.044, 0.016);

  // Flowing forked tail fin, scalloped dorsal crest, and side pectoral fin.
  const tail = shapeFrom(s => {
    s.moveTo(0.28, 0.02);
    s.quadraticCurveTo(0.46, 0.22, 0.56, 0.26);
    s.quadraticCurveTo(0.46, 0.06, 0.43, 0.02);
    s.quadraticCurveTo(0.46, -0.04, 0.56, -0.22);
    s.quadraticCurveTo(0.44, -0.18, 0.28, 0.02);
    s.closePath();
  });
  cut(body, tail, '#e9ad76', 0, 0, -0.016, 0.028);

  const dorsal = shapeFrom(s => {
    s.moveTo(-0.1, 0.17);
    s.quadraticCurveTo(0.04, 0.34, 0.2, 0.18);
    s.lineTo(0.15, 0.13);
    s.closePath();
  });
  cut(body, dorsal, '#e9ad76', 0, 0, -0.014, 0.024);

  const pec = shapeFrom(s => {
    s.moveTo(-0.08, -0.04);
    s.quadraticCurveTo(0.08, -0.1, 0.12, -0.22);
    s.quadraticCurveTo(-0.02, -0.2, -0.08, -0.04);
    s.closePath();
  });
  cut(body, pec, '#e8a872', 0, 0, 0.052, 0.018);

  // One bright eye keeps the face readable without extra lines.
  oval(body, 0.11, 0.11, '#fffaf0', -0.19, 0.05, 0.044, 0.016);
  addSparkleEye(body, -0.19, 0.05, 0.06, 0.032);

  ctx.animate(body, 'fish-dive', 'fish', 0.34);
  ctx.animate(splash, 'fish-splash', 'fish');
}

