import * as THREE from 'three';
import type { AnimalBuilderContext } from './shared';
import { cut, oval, stroke } from '../paper-shapes';
import { addSparkleEye, shapeFrom } from './shared';

/** Cheerful coral-terracotta red crab on the summer beach sand. */
export function addCrab(ctx: AnimalBuilderContext, x: number, z = -0.88): void {
  const host = ctx.place('paper-crab', x, z, 0.94);

  // Soft sand shadow under the crab.
  const shadow = oval(host, 0.86, 0.22, '#9a8e74', 0, 0.02, -0.02, 0.012);
  shadow.rotation.x = -Math.PI / 2;

  // Wide curved coral-red shell carapace.
  const shellShape = shapeFrom(s => {
    s.moveTo(-0.34, -0.04);
    s.bezierCurveTo(-0.36, 0.18, -0.16, 0.28, 0, 0.28);
    s.bezierCurveTo(0.16, 0.28, 0.36, 0.18, 0.34, -0.04);
    s.quadraticCurveTo(0, -0.18, -0.34, -0.04);
    s.closePath();
  });
  const body = cut(host, shellShape, '#d26850', 0, 0.24, 0.04, 0.046);
  ctx.animate(body, 'crab-step', 'crab', 0.36);

  // Warm coral-peach belly crescent and shell highlight.
  const highlight = shapeFrom(s => {
    s.moveTo(-0.2, 0.14);
    s.quadraticCurveTo(0, 0.24, 0.2, 0.14);
    s.quadraticCurveTo(0, 0.18, -0.2, 0.14);
    s.closePath();
  });
  cut(body, highlight, '#e68c72', 0, 0, 0.046, 0.014);
  oval(body, 0.42, 0.14, '#f0c9b0', 0, -0.07, 0.044, 0.014);

  // Three jointed coral-red walking legs per side + two raised pincer claws.
  for (const sign of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const y0 = -0.02 - i * 0.045;
      stroke(
        body,
        [[sign * 0.27, y0], [sign * (0.43 + i * 0.03), y0 - 0.02], [sign * (0.5 + i * 0.02), y0 - 0.13]],
        '#b8543f',
        0.032,
        -0.018,
      );
    }

    // Articulated pincer arm reaching upward.
    const arm = new THREE.Group();
    arm.position.set(sign * 0.24, 0.08, 0.01);
    body.add(arm);
    stroke(arm, [[0, 0], [sign * 0.2, 0.14], [sign * 0.22, 0.28]], '#c55e48', 0.046, 0);

    // Classic open paper crab claw.
    const claw = shapeFrom(s => {
      s.moveTo(sign * 0.46, 0.3);
      s.bezierCurveTo(sign * 0.66, 0.34, sign * 0.69, 0.56, sign * 0.52, 0.62);
      s.lineTo(sign * 0.48, 0.47);
      s.lineTo(sign * 0.4, 0.61);
      s.bezierCurveTo(sign * 0.3, 0.52, sign * 0.34, 0.34, sign * 0.46, 0.3);
      s.closePath();
    });
    cut(arm, claw, '#dc7459', -arm.position.x, -arm.position.y, 0.012, 0.034);
    if (sign > 0) ctx.animate(arm, 'crab-claw', 'crab');

    // Raised eye stalks with bright cream eyeballs.
    stroke(body, [[sign * 0.12, 0.22], [sign * 0.15, 0.37]], '#bf5c46', 0.034, 0.01);
    oval(body, 0.13, 0.13, '#fff9ec', sign * 0.15, 0.39, 0.028, 0.028);
    addSparkleEye(body, sign * 0.15, 0.39, 0.056, 0.034);
    oval(body, 0.08, 0.05, '#ef9c88', sign * 0.18, 0.02, 0.048, 0.012);
  }

  // A small curved smile stays close to the shell colour.
  const smile = shapeFrom(s => {
    s.moveTo(-0.07, 0.015);
    s.quadraticCurveTo(0, -0.045, 0.07, 0.015);
    s.quadraticCurveTo(0, -0.016, -0.07, 0.015);
    s.closePath();
  });
  cut(body, smile, '#aa604c', 0, 0, 0.072, 0.008);
}
