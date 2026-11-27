import * as THREE from 'three';
import { carded } from '../../paper-mesh';
import { SEASON_BORDERS } from '../../seasons';
import type { SceneryContext } from '../../scene-context';
import { shapeFrom } from '../palette';

/** A calm blue river tucked behind the summer meadow along the far bank. */
export function addDistantRiver(ctx: SceneryContext): void {
  const start = SEASON_BORDERS.summer - 0.6;
  const end = SEASON_BORDERS.autumn + 0.6;
  const span = end - start;
  const center = (start + end) / 2;

  const backdrop = ctx.detail('summer-distant-river', center, -2.68, 1, 0.28);

  // Far grassy river shore rising gently behind the water strip.
  const farBank = shapeFrom(s => {
    s.moveTo(-span / 2, 0);
    for (let dx = -span / 2; dx <= span / 2; dx += 0.9) {
      const edgeFade =
        THREE.MathUtils.smoothstep(dx + span / 2, 0, 1.8) * THREE.MathUtils.smoothstep(span / 2 - dx, 0, 1.8);
      const ridge = (0.38 + Math.sin(dx * 0.45 + 0.6) * 0.09 + Math.cos(dx * 0.9) * 0.04) * edgeFade;
      s.lineTo(dx, ridge);
    }
    s.lineTo(span / 2, 0);
    s.closePath();
  });
  backdrop.shape(farBank, '#8aa574', 0, 0.04, -0.18, undefined, 0.028);

  // Distant blue water ribbon tapering cleanly at both summer borders.
  const water = shapeFrom(s => {
    s.moveTo(-span / 2, 0);
    for (let dx = -span / 2; dx <= span / 2; dx += 0.7) {
      const edgeFade =
        THREE.MathUtils.smoothstep(dx + span / 2, 0, 1.5) * THREE.MathUtils.smoothstep(span / 2 - dx, 0, 1.5);
      const height = (0.24 + Math.sin(dx * 0.65) * 0.03) * edgeFade;
      s.lineTo(dx, height);
    }
    s.lineTo(span / 2, 0);
    s.closePath();
  });
  backdrop.shape(water, '#73a6b2', 0, 0.02, -0.06, undefined, 0.024);

  // Low golden-green meadow rim hiding the near edge of the distant stream.
  const nearRim = shapeFrom(s => {
    s.moveTo(-span / 2, 0);
    for (let dx = -span / 2; dx <= span / 2; dx += 0.75) {
      const edgeFade =
        THREE.MathUtils.smoothstep(dx + span / 2, 0, 1.2) * THREE.MathUtils.smoothstep(span / 2 - dx, 0, 1.2);
      const h = (0.1 + Math.abs(Math.sin(dx * 1.15)) * 0.05) * edgeFade;
      s.lineTo(dx, h);
    }
    s.lineTo(span / 2, 0);
    s.closePath();
  });
  backdrop.shape(nearRim, '#b7be78', 0, 0, 0.08, undefined, 0.022);

  // Tiny distant reed tufts on the far edge of the stream.
  for (const offset of [-4.4, -2.5, 1.9, 4.1]) {
    for (let b = -1; b <= 1; b++) {
      backdrop.cut(
        [
          [offset + b * 0.07 - 0.018, 0.08],
          [offset + b * 0.11, 0.34 - Math.abs(b) * 0.05],
          [offset + b * 0.07 + 0.018, 0.08],
        ],
        '#6c8c68',
        0,
        0,
        -0.02,
        undefined,
        0.014,
      );
    }
  }

  // Two gentle shimmering water glint strips animated slowly along the distant river.
  const waveSpecs: Array<{ z: number; y: number; color: string; freq: number }> = [
    { z: -2.66, y: 0.39, color: '#9ac4c8', freq: 1.5 },
    { z: -2.62, y: 0.34, color: '#b6d5d2', freq: 1.9 },
  ];
  waveSpecs.forEach((spec, idx) => {
    const ribbonShape = new THREE.Shape();
    ribbonShape.moveTo(0, -0.02);
    for (let dx = 0; dx <= span - 1.2; dx += 0.45) {
      const fade = THREE.MathUtils.smoothstep(dx, 0.4, 1.4) * THREE.MathUtils.smoothstep(span - 1.2 - dx, 0.4, 1.4);
      const crest = (0.04 + Math.abs(Math.sin(dx * spec.freq + idx * 1.4)) * 0.045) * fade;
      ribbonShape.lineTo(dx, crest);
    }
    ribbonShape.lineTo(span - 1.2, -0.02);
    ribbonShape.closePath();
    const ribbon = carded(new THREE.ExtrudeGeometry(ribbonShape, { depth: 0.018, bevelEnabled: false }), spec.color);
    ribbon.name = 'paper-distant-river-wave';
    ribbon.position.set(start + 0.6, spec.y, spec.z);
    ctx.group.add(ribbon);
    ctx.animate(ribbon, 'wave');
  });
}
