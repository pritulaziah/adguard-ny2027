import * as THREE from 'three';
import { PaperBatch, ovalGeometry } from './paper-brush';
import { cut, oval } from './paper-shapes';
import { paperSheet } from './paper-materials';
import { stopX } from './route';
import { SEASON_BORDERS } from './seasons';
import type { AnimalBuilderContext } from './animals';

/** Layered river banks leave the central story and the boat route clear. */
export function addSummerRiver(ctx: AnimalBuilderContext): void {
  const center = stopX(4);
  const span = SEASON_BORDERS.autumn - SEASON_BORDERS.summer;
  const bank = ctx.detail('river-far-bank', center, -1.3);
  const edge = new THREE.Shape();
  edge.moveTo(-span / 2, -0.08);
  for (let x = -span / 2; x <= span / 2; x += 0.22) {
    edge.lineTo(x, 0.14 + Math.sin(x * 1.35) * 0.08 + Math.cos(x * 2.4) * 0.035);
  }
  edge.lineTo(span / 2, -0.08);
  edge.closePath();
  bank.shape(edge, '#718f68', 0, 0, 0, undefined, 0.09);
  bank.stroke([[-span / 2, 0.01], [-2.6, 0.06], [0, 0.01], [2.5, 0.08], [span / 2, 0.02]], '#b3c399', 0.045, 0.12);

  // One willow: a branching trunk, small crown clusters, and separate twigs.
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

  // A compact alder stays well inside summer, clear of the first autumn birch.
  const alder = ctx.detail('river-alder', center + 3.55, -2.4, 0.88);
  alder.cut([[-0.13, 0], [0.13, 0], [0.06, 1.35], [0.23, 2.1], [0.12, 2.12], [-0.04, 1.4]], '#7f7056');
  alder.stroke([[0, 1.1], [-0.4, 1.8], [-0.58, 1.95]], '#7f7056', 0.065, 0.01);
  for (const [x, y, w, h] of [[-0.43, 1.85, 0.85, 0.9], [0.35, 1.88, 0.88, 0.96], [-0.1, 2.35, 1.1, 0.95], [0.14, 2.05, 0.8, 0.9]]) {
    alder.oval(w, h, '#64866a', x, y, -0.06);
    alder.oval(w * 0.72, h * 0.75, '#8da574', x - 0.07, y + 0.08, 0.04);
  }

  // Small wooden landing with individual boards and short mooring posts.
  const pier = ctx.detail('river-wooden-landing', center + 2.1, -1.08);
  for (let i = 0; i < 6; i++) {
    pier.box(0.14, 0.07, 0.72, i % 2 ? '#b18f65' : '#c5a77b', i * 0.16, 0.18, 0.05);
  }
  for (const dx of [0.04, 0.76]) {
    pier.box(0.07, 0.55, 0.07, '#8a7052', dx, 0.09, 0.32);
    pier.oval(0.11, 0.055, '#dfcca0', dx, 0.38, 0.35);
  }

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

  // Lily pads float beside the clear central channel.
  for (const [dx, z, size] of [[-2.0, 0.48, 0.42], [2.3, 0.56, 0.5], [3.7, 0.18, 0.3], [-4.6, 0.2, 0.33]]) {
    const pad = ctx.detail('river-lily-pad', center + dx, z, 1, 0.345);
    pad.oval(size, size * 0.65, '#7b996e', 0, 0, 0, [-Math.PI / 2, 0, 0], 0.015);
    pad.stroke([[0, 0], [size * 0.22, 0.015]], '#b6c28a', 0.018, 0.03);
  }
  const lily = ctx.detail('river-water-lily', center + 2.3, 0.58, 1, 0.37);
  for (let i = -1; i <= 1; i++) lily.oval(0.09, 0.16, '#f1e5c6', i * 0.045, 0.06, 0.035 + i * 0.003, [0, 0, -i * 0.5]);
  lily.oval(0.07, 0.06, '#ddbc6f', 0, 0.04, 0.065);
}

/** A river duck replaces the beach animal and keeps the Windows fact. */
export function addRiverDuck(ctx: AnimalBuilderContext, x: number): void {
  const host = ctx.place('paper-river-duck', x, -0.18, 0.88, 0.4);
  const body = oval(host, 0.66, 0.3, '#c7b58d', 0, 0.18, 0, 0.07);
  ctx.animate(body, 'float', 'duck', 0.4);
  oval(body, 0.38, 0.18, '#9e9472', -0.04, 0.035, 0.08);
  cut(body, [[-0.25, 0], [-0.45, 0.2], [-0.3, 0.19], [-0.14, 0.06]], '#93866b', 0, 0, -0.02);
  oval(body, 0.25, 0.3, '#4f7967', 0.24, 0.22, 0.03);
  cut(body, [[0.3, 0.2], [0.51, 0.16], [0.49, 0.12], [0.31, 0.12]], '#d5ab5f', 0, 0, 0.07);
  oval(body, 0.045, 0.05, '#394c42', 0.28, 0.25, 0.1);
  oval(body, 0.015, 0.018, '#faf3dd', 0.274, 0.26, 0.12);
  const ripple = ctx.detail('duck-ripple', x, -0.12, 1, 0.35);
  ripple.oval(0.92, 0.2, '#bdd1b1', 0, 0, 0, [-Math.PI / 2, 0, 0], 0.012);
}
