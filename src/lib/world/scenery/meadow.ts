import type { SceneryContext } from '../scene-context';
import { colors, seeded, shapeFrom } from './palette';

/** Natural clustered spring wildflowers (daisies, tulips, and grass blades). */
export function addSpringMeadowCluster(ctx: SceneryContext, x: number, z: number, seedVal: number): void {
  const rng = seeded(seedVal);
  const cluster = ctx.detail('spring-meadow-cluster', x, z);
  const palette = ['#f3ded2', '#e7b9b2', '#efd69d', '#d3c2dc', '#f6efe0'];

  // Soft grass tufts grounding the cluster.
  for (let g = 0; g < 4; g++) {
    const gx = (rng() - 0.5) * 0.55;
    const gh = 0.2 + rng() * 0.16;
    const lean = (rng() - 0.5) * 0.12;
    cluster.cut([[gx - 0.02, 0], [gx + lean, gh], [gx + 0.02, 0]], g % 2 ? '#84a374' : '#739468', 0, 0, -0.02 + g * 0.006, undefined, 0.016);
  }

  const stems = 2 + Math.floor(rng() * 2);
  for (let i = 0; i < stems; i++) {
    const fx = (rng() - 0.5) * 0.48;
    const fh = 0.24 + rng() * 0.24;
    const col = palette[Math.floor(rng() * palette.length)];
    const fz = 0.01 + i * 0.032;
    cluster.rect(0.022, fh, '#6f9066', fx, 0, fz, undefined, 0.016);
    cluster.oval(0.09, 0.045, '#89a778', fx - 0.045, fh * 0.38, fz + 0.01, [0, 0, 0.55], 0.014);
    if (i % 2 === 0) {
      // Layered 5-petal daisy blossom.
      for (let p = 0; p < 5; p++) {
        const a = (p / 5) * Math.PI * 2;
        cluster.oval(0.075, 0.11, col, fx + Math.cos(a) * 0.06, fh + Math.sin(a) * 0.06, fz + 0.016, [0, 0, a - Math.PI / 2], 0.014);
      }
      cluster.oval(0.065, 0.065, colors.gold, fx, fh, fz + 0.032, undefined, 0.014);
    } else {
      // Cupped paper tulip bud.
      const tulip = shapeFrom(s => {
        s.moveTo(0, -0.02);
        s.bezierCurveTo(-0.1, 0.02, -0.09, 0.14, -0.05, 0.18);
        s.lineTo(0, 0.13);
        s.lineTo(0.05, 0.18);
        s.bezierCurveTo(0.09, 0.14, 0.1, 0.02, 0, -0.02);
        s.closePath();
      });
      cluster.shape(tulip, col, fx, fh - 0.03, fz + 0.018, undefined, 0.018);
    }
  }
}
