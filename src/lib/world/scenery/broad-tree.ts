import type { SceneryContext } from '../scene-context';
import type { PaperDetail } from '../paper-brush';
import { shapeFrom } from './palette';

export type TreeVariant =
  'spring-green' | 'spring-blossom' | 'summer-alder' | 'summer-birch' | 'autumn-maple' | 'autumn-birch' | 'autumn-oak';

interface TreePalette {
  bark: string;
  barkMark?: string;
  back: string;
  mid: string;
  front: string;
  accent?: string;
}

const palettes: Record<TreeVariant, TreePalette> = {
  'spring-green': { bark: '#896c59', back: '#729273', mid: '#8aa881', front: '#a3bc91' },
  'summer-alder': { bark: '#7f7056', back: '#567c55', mid: '#789d60', front: '#a8c273' },
  'summer-birch': { bark: '#e6dfd0', barkMark: '#746c61', back: '#698e57', mid: '#8cb062', front: '#bdd077' },
  'spring-blossom': { bark: '#856758', back: '#c98e8b', mid: '#e2ada6', front: '#f2cec6', accent: '#9bb388' },
  'autumn-maple': { bark: '#7d6050', back: '#9e5144', mid: '#c66849', front: '#df9451', accent: '#ebbc67' },
  'autumn-birch': { bark: '#dfd5c3', barkMark: '#7d7367', back: '#c5954d', mid: '#dbb15c', front: '#ebd07b' },
  'autumn-oak': { bark: '#785d4d', back: '#985c43', mid: '#bc754b', front: '#d79b59', accent: '#c96249' },
};

/** Organic multi-layered broadleaf tree with a tapered bark trunk between foliage planes. */
export function addBroadTree(ctx: SceneryContext, x: number, variant: TreeVariant, scale = 1.0, z = -2.1): PaperDetail {
  const tree = ctx.detail(`layered-paper-tree-${variant}`, x, z, scale);
  const p = palettes[variant];

  // Back canopy silhouette (deepest layer, gives fullness behind the trunk and branches).
  const backClusters: Array<[number, number, number, number]> = [
    [-0.78, 2.15, 1.05, 0.96],
    [0.74, 2.18, 1.08, 0.98],
    [-0.35, 2.75, 1.15, 1.02],
    [0.42, 2.72, 1.1, 0.96],
    [0.02, 3.05, 1.02, 0.88],
  ];
  for (let i = 0; i < backClusters.length; i++) {
    const [cx, cy, cw, ch] = backClusters[i];
    tree.oval(cw, ch, p.back, cx, cy, -0.16 + i * 0.008, undefined, 0.036);
  }

  // Tapered organic trunk with gentle root flare and forked upper branches.
  const trunk = shapeFrom(s => {
    s.moveTo(-0.24, 0);
    s.quadraticCurveTo(-0.14, 0.35, -0.11, 1.38);
    s.lineTo(-0.56, 2.15);
    s.lineTo(-0.43, 2.22);
    s.lineTo(-0.04, 1.66);
    s.lineTo(0.05, 2.36);
    s.lineTo(0.16, 2.34);
    s.lineTo(0.11, 1.72);
    s.lineTo(0.54, 2.14);
    s.lineTo(0.62, 2.03);
    s.lineTo(0.12, 1.44);
    s.quadraticCurveTo(0.14, 0.38, 0.25, 0);
    s.closePath();
  });
  tree.shape(trunk, p.bark, 0, 0, -0.04, undefined, 0.044);

  if (p.barkMark) {
    // Horizontal paper dashes on birch trunks.
    for (const [bx, by, bw] of [
      [-0.06, 0.32, 0.14],
      [0.05, 0.62, 0.12],
      [-0.04, 0.94, 0.13],
      [0.04, 1.26, 0.11],
    ]) {
      tree.rect(bw, 0.028, p.barkMark, bx, by, 0.012, undefined, 0.012);
    }
  }

  // Mid canopy layer wrapping gently over the branch tips.
  const midClusters: Array<[number, number, number, number]> = [
    [-0.64, 2.38, 1.02, 0.9],
    [0.64, 2.34, 0.98, 0.88],
    [-0.08, 2.66, 1.18, 1.04],
    [0.24, 2.2, 0.96, 0.84],
    [-0.36, 2.04, 0.88, 0.78],
  ];
  for (let i = 0; i < midClusters.length; i++) {
    const [cx, cy, cw, ch] = midClusters[i];
    tree.oval(cw, ch, p.mid, cx, cy, 0.02 + i * 0.008, undefined, 0.036);
  }

  // Front sunlit foliage puffs for crisp folded-paper depth.
  const frontClusters: Array<[number, number, number, number]> = [
    [-0.42, 2.58, 0.78, 0.68],
    [0.38, 2.64, 0.82, 0.7],
    [0.02, 2.32, 0.76, 0.66],
  ];
  for (let i = 0; i < frontClusters.length; i++) {
    const [cx, cy, cw, ch] = frontClusters[i];
    tree.oval(cw, ch, p.front, cx, cy, 0.085 + i * 0.008, undefined, 0.03);
  }

  // Spring blossom accents perched along the canopy edge.
  if (variant === 'spring-blossom') {
    const blooms: Array<[number, number]> = [
      [-0.68, 2.24],
      [0.06, 2.9],
      [0.62, 2.32],
      [-0.2, 2.08],
    ];
    for (let b = 0; b < blooms.length; b++) {
      const [bx, by] = blooms[b];
      for (let pt = 0; pt < 5; pt++) {
        const a = (pt / 5) * Math.PI * 2 + b * 0.3;
        tree.oval(0.065, 0.085, '#fceee8', bx + Math.cos(a) * 0.055, by + Math.sin(a) * 0.055, 0.13, [0, 0, a], 0.014);
      }
      tree.oval(0.048, 0.048, '#e8c477', bx, by, 0.146, undefined, 0.012);
    }
  }
  return tree;
}
